// ============================================================================
// FLOWERS - Flower calculations, recipes, and rendering
// ============================================================================

const FLOWER_URGENCY_LEVELS = {
    CRITICAL: { label: 'CRITICAL', colorClass: 'urgent-critical', order: 0 },
    VERY_HIGH: { label: 'VERY_HIGH', colorClass: 'urgent-very-high', order: 1 },
    HIGH: { label: 'HIGH', colorClass: 'urgent-high', order: 2 },
    MEDIUM: { label: 'MEDIUM', colorClass: 'urgent-medium', order: 3 },
    LOW: { label: 'LOW', colorClass: 'urgent-low', order: 4 },
    GOOD: { label: 'GOOD', colorClass: 'urgent-good', order: 5 }
};

function getFlowerUrgency(stock) {
    const percentage = (stock / 10) * 100;
    const target = 10;
    
    if (stock < target * 0.25) return FLOWER_URGENCY_LEVELS.CRITICAL;
    if (stock < target * 0.50) return FLOWER_URGENCY_LEVELS.VERY_HIGH;
    if (stock < target * 0.75) return FLOWER_URGENCY_LEVELS.HIGH;
    if (stock < target) return FLOWER_URGENCY_LEVELS.MEDIUM;
    return FLOWER_URGENCY_LEVELS.GOOD;
}

function isSeedAvailableThisSeason(seedName, season) {
    const seedSeason = SEASONAL_SEEDS[seedName];
    if (!seedSeason) return true;
    return seedSeason === season;
}

function isAvailable(item, inventory, baseItems) {
    if (baseItems.includes(item) && !item.includes("Seed")) {
        return inventory[item] && parseFloat(inventory[item]) > 50;
    }
    return inventory[item] && parseInt(inventory[item]) >= 10;
}

function calculateTheoreticalTime(ingredientName, recipes) {
    const recipe = recipes[ingredientName];
    if (!recipe) return 0;
    let myTime = recipe.time || 0;
    let bestSubTime = 999;
    for (let subIng of recipe.additionals) {
        const subRecipe = recipes[subIng];
        if (subRecipe) {
            const subTime = subRecipe.time || 0;
            if (subTime < bestSubTime) {
                bestSubTime = subTime;
            }
        }
    }
    if (bestSubTime !== 999) {
        myTime += bestSubTime;
    }
    return myTime;
}

function calculateTotalProductionTime(ingredientName, inventory, baseItems, recipes, visited = new Set()) {
    if (visited.has(ingredientName)) return 999;
    visited.add(ingredientName);
    const recipe = recipes[ingredientName];
    if (!recipe) return 0;
    let myTime = recipe.time || 0;
    let bestIngredientTime = 999;
    for (let subIngredient of recipe.additionals) {
        const subTime = calculateTotalProductionTime(subIngredient, inventory, baseItems, recipes, new Set(visited));
        if (subTime < bestIngredientTime) {
            bestIngredientTime = subTime;
        }
    }
    if (bestIngredientTime === 999) bestIngredientTime = 0;
    return myTime + bestIngredientTime;
}

function calculateOptimalMix(availableIngredients, quantityNeeded, inventory, baseItems, recipes) {
    let options = [];
    for (let ingredientInfo of availableIngredients) {
        const ingredient = ingredientInfo.name || ingredientInfo;
        const stock = parseInt(inventory[ingredient] || 0);
        const minToKeep = (!baseItems.includes(ingredient) || ingredient.includes("Seed")) ? 10 : 0;
        const canGive = Math.max(0, stock - minToKeep);
        const recipeTime = calculateTheoreticalTime(ingredient, recipes);
        const needsProduction = canGive < quantityNeeded ? 1 : 0;
        if (canGive > 0) {
            options.push({ ingredient, stock, canGive, minToKeep, time: recipeTime, needsProduction });
        }
    }
    if (options.length === 0) return [];
    options.sort((a, b) => {
        if (a.time !== b.time) return a.time - b.time;
        if (a.needsProduction !== b.needsProduction) return a.needsProduction - b.needsProduction;
        return b.canGive - a.canGive;
    });
    let mix = [];
    const fastest = options[0];
    mix.push({ ingredient: fastest.ingredient, quantity: quantityNeeded });
    return mix;
}

function calculateCraftingPath(flowerName, inventory, baseItems, recipes, visited = new Set()) {
    if (visited.has(flowerName)) {
        return { steps: [], totalTime: 999, error: true };
    }
    visited.add(flowerName);
    if (isAvailable(flowerName, inventory, baseItems)) {
        return { steps: [], totalTime: 0, available: true };
    }
    const recipe = recipes[flowerName];
    if (!recipe) {
        return { steps: [], totalTime: 0, available: false };
    }
    let availableIngredients = [];
    let unavailableIngredients = [];
    for (let ingredient of recipe.additionals) {
        if (isAvailable(ingredient, inventory, baseItems)) {
            const ingredientRecipe = recipes[ingredient];
            const directTime = ingredientRecipe ? ingredientRecipe.time : 0;
            const totalTime = calculateTotalProductionTime(ingredient, inventory, baseItems, recipes);
            availableIngredients.push({ name: ingredient, time: directTime, totalTime: totalTime });
        } else {
            unavailableIngredients.push(ingredient);
        }
    }
    if (availableIngredients.length > 0) {
        availableIngredients.sort((a, b) => a.totalTime - b.totalTime);
        return {
            steps: [],
            totalTime: 0,
            availableIngredients: availableIngredients,
            mixMode: true
        };
    }
    let bestPath = null;
    let bestIngredient = null;
    let minTime = Infinity;
    let bestStock = -1;
    for (let ingredient of unavailableIngredients) {
        if (recipes[ingredient]) {
            const subPath = calculateCraftingPath(ingredient, inventory, baseItems, recipes, new Set(visited));
            if (!subPath.error) {
                if (subPath.totalTime < minTime) {
                    minTime = subPath.totalTime;
                }
            }
        }
    }
    for (let ingredient of unavailableIngredients) {
        if (recipes[ingredient]) {
            const subPath = calculateCraftingPath(ingredient, inventory, baseItems, recipes, new Set(visited));
            if (!subPath.error && subPath.totalTime === minTime) {
                const stock = parseInt(inventory[ingredient] || 0);
                if (stock > bestStock) {
                    bestStock = stock;
                    bestPath = subPath;
                    bestIngredient = ingredient;
                }
            }
        }
    }
    if (!bestIngredient) {
        bestIngredient = recipe.additionals[0];
        bestPath = { steps: [], totalTime: 0 };
    }
    const totalTime = recipe.time + (bestPath ? bestPath.totalTime : 0);
    const steps = [
        ...(bestPath ? bestPath.steps : []),
        {
            flower: flowerName,
            seed: recipe.base_seed,
            ingredient: bestIngredient,
            time: recipe.time,
            needsCrafting: !isAvailable(bestIngredient, inventory, baseItems)
        }
    ];
    return { steps, totalTime, ingredient: bestIngredient };
}

function getSeasonEmoji(flowerName) {
    const recipe = FLOWER_DB.recipes[flowerName];
    if (!recipe) return '';
    const seedSeason = SEASONAL_SEEDS[recipe.base_seed];
    if (!seedSeason) return '';
    return SEASON_EMOJIS[seedSeason] + ' ';
}

function renderFlowersList() {
    const container = document.getElementById('flowers-list');
    if (!container) return;
    let lowFlowers = [];
    for (let flowerName in FLOWER_DB.recipes) {
        if (currentInventory[flowerName]) {
            const count = parseInt(currentInventory[flowerName]);
            if (count < 10) {
                const recipe = FLOWER_DB.recipes[flowerName];
                if (!isSeedAvailableThisSeason(recipe.base_seed, currentSeason)) {
                    continue;
                }
                const path = calculateCraftingPath(flowerName, currentInventory, BASE_ITEMS, FLOWER_DB.recipes);
                lowFlowers.push({
                    name: flowerName,
                    count: count,
                    needed: 10 - count,
                    path: path,
                    totalTime: path.totalTime,
                    steps: path.steps
                });
            }
        }
    }
    let missingIngredients = {};
    let optimalChoices = {};
    function findOptimalIngredient(ingredients) {
        let minTime = Infinity;
        for (let ing of ingredients) {
            const time = calculateTotalProductionTime(ing, currentInventory, BASE_ITEMS, FLOWER_DB.recipes);
            if (time < minTime) {
                minTime = time;
            }
        }
        let bestIngredient = null;
        let bestStock = -1;
        for (let ing of ingredients) {
            const time = calculateTotalProductionTime(ing, currentInventory, BASE_ITEMS, FLOWER_DB.recipes);
            if (time === minTime) {
                const stock = parseInt(currentInventory[ing] || 0);
                if (stock > bestStock) {
                    bestStock = stock;
                    bestIngredient = ing;
                }
            }
        }
        return bestIngredient || ingredients[0];
    }
    function computeMissingAndChoices(flowers) {
        const missing = {};
        const choices = {};
        for (let flower of flowers) {
            const recipe = FLOWER_DB.recipes[flower.name];
            if (!recipe) continue;
            const optimalIngredient = findOptimalIngredient(recipe.additionals);
            choices[flower.name] = optimalIngredient;
            const ingredientStock = parseInt(currentInventory[optimalIngredient] || 0);
            if (!missing[optimalIngredient]) {
                missing[optimalIngredient] = {
                    count: 0,
                    usedBy: [],
                    stock: ingredientStock
                };
            }
            missing[optimalIngredient].count += flower.needed;
            if (!missing[optimalIngredient].usedBy.includes(flower.name)) {
                missing[optimalIngredient].usedBy.push(flower.name);
            }
        }
        return { missing, choices };
    }
    let iterations = 0;
    let changed = true;
    while (changed && iterations < 5) {
        iterations += 1;
        changed = false;
        const result = computeMissingAndChoices(lowFlowers);
        missingIngredients = result.missing;
        optimalChoices = result.choices;
        for (let ingredient in missingIngredients) {
            const missing = missingIngredients[ingredient];
            const stock = parseInt(currentInventory[ingredient] || 0);
            const minToKeep = (!BASE_ITEMS.includes(ingredient) || ingredient.includes("Seed")) ? 10 : 0;
            const totalRequired = missing.count + minToKeep;
            const deficit = totalRequired - stock;
            const existingFlower = lowFlowers.find(f => f.name === ingredient);
            if (existingFlower) {
                const reserveNeed = Math.max(0, 10 - stock);
                const finalNeed = reserveNeed + missing.count;
                if (finalNeed > existingFlower.needed) {
                    existingFlower.needed = finalNeed;
                    existingFlower.isBottleneck = true;
                    changed = true;
                }
            } else if (FLOWER_DB.recipes[ingredient] && deficit > 0) {
                const ingredientRecipe = FLOWER_DB.recipes[ingredient];
                if (!isSeedAvailableThisSeason(ingredientRecipe.base_seed, currentSeason)) {
                    continue;
                }
                const needed = Math.max(deficit, missing.count);
                const path = calculateCraftingPath(ingredient, currentInventory, BASE_ITEMS, FLOWER_DB.recipes);
                lowFlowers.push({
                    name: ingredient,
                    count: stock,
                    needed: needed,
                    path: path,
                    totalTime: path.totalTime,
                    steps: path.steps,
                    isBottleneck: true
                });
                changed = true;
            }
        }
    }
    lowFlowers.sort((a, b) => b.needed - a.needed);
    lowFlowers = lowFlowers.filter(flower => flower.needed > 0);
    if (lowFlowers.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; font-size: 0.85rem; padding: 1rem 0;">✅ Toutes les fleurs >= 10</p>';
        return;
    }
    let html = '';
    lowFlowers.forEach(flower => {
        const emoji = getSeasonEmoji(flower.name);
        const recipe = FLOWER_DB.recipes[flower.name];
        if (!recipe) return;
        const seedTime = recipe.time || 0;
        const urgency = getFlowerUrgency(flower.count);
        let flowerHtml = `
            <div class="flower-card">
                <div class="flower-name">
                    <span>${emoji}${flower.name}</span>
                    <span class="flower-stock ${urgency.colorClass}">${flower.count}/10</span>
                </div>
                <div class="flower-info">
                    <span>${recipe.base_seed} : ${seedTime}d</span>
                </div>
                <div class="flower-recipe">
        `;
        if (flower.steps.length > 0) {
            for (let step of flower.steps) {
                const ingredientStock = parseInt(currentInventory[step.ingredient] || 0);
                const ingredientNeeded = flower.needed;
                const minToKeep = (!BASE_ITEMS.includes(step.ingredient) || step.ingredient.includes("Seed")) ? 10 : 0;
                const totalRequired = ingredientNeeded + minToKeep;
                const ingredientToProduce = Math.max(0, totalRequired - ingredientStock);
                const statusClass = ingredientToProduce > 0 ? 'recipe-status-bad' : 'recipe-status-good';
                const statusText = ingredientToProduce > 0 ? '⚠️' : '✓';
                flowerHtml += `<div class="recipe-step"><span class="recipe-base">${step.ingredient}</span><span class="${statusClass}">${statusText}</span></div>`;
            }
        } else {
            const optimalIngredient = optimalChoices[flower.name];
            if (optimalIngredient) {
                const ingredientStock = parseInt(currentInventory[optimalIngredient] || 0);
                const minToKeep = (!BASE_ITEMS.includes(optimalIngredient) || optimalIngredient.includes("Seed")) ? 10 : 0;
                const totalRequired = flower.needed + minToKeep;
                const ingredientToProduce = Math.max(0, totalRequired - ingredientStock);
                const statusClass = ingredientToProduce > 0 ? 'recipe-status-bad' : 'recipe-status-good';
                const statusText = ingredientToProduce > 0 ? '⚠️' : '✓';
                flowerHtml += `<div class="recipe-step"><span class="recipe-base">${optimalIngredient} ×${flower.needed}</span><span class="${statusClass}">${statusText}</span></div>`;
            }
        }
        flowerHtml += `
                </div>
            </div>
        `;
        html += flowerHtml;
    });
    container.innerHTML = html;
}

function showLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.classList.remove('hidden');
    }
}

function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.classList.add('hidden');
    }
}
