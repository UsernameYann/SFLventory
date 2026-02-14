// ============================================================================
// FISH MARKET - Seasonal fish processing recipes
// ============================================================================

const FISH_MARKET_URGENCY_LEVELS = {
    CRITICAL: { label: 'CRITICAL', colorClass: 'urgent-critical', order: 0 },
    VERY_HIGH: { label: 'VERY_HIGH', colorClass: 'urgent-very-high', order: 1 },
    HIGH: { label: 'HIGH', colorClass: 'urgent-high', order: 2 },
    MEDIUM: { label: 'MEDIUM', colorClass: 'urgent-medium', order: 3 },
    LOW: { label: 'LOW', colorClass: 'urgent-low', order: 4 },
    GOOD: { label: 'GOOD', colorClass: 'urgent-good', order: 5 }
};

function getFishMarketUrgency(stock, limit) {
    const percentage = (stock / limit) * 100;
    
    if (stock < limit * 0.25) return FISH_MARKET_URGENCY_LEVELS.CRITICAL;
    if (stock < limit * 0.50) return FISH_MARKET_URGENCY_LEVELS.VERY_HIGH;
    if (stock < limit * 0.75) return FISH_MARKET_URGENCY_LEVELS.HIGH;
    if (stock < limit) return FISH_MARKET_URGENCY_LEVELS.MEDIUM;
    return FISH_MARKET_URGENCY_LEVELS.GOOD;
}

const FISH_MARKET_RECIPES = {
    'Fish Flake': {
        building: 'Fish Market',
        recipes: {
            spring: [
                { ingredients: ['Anchovy x4'], name: 'Anchovy x4' },
                { ingredients: ['Porgy x2'], name: 'Porgy x2' },
                { ingredients: ['Sea Bass x2'], name: 'Sea Bass x2' }
            ],
            summer: [
                { ingredients: ['Anchovy x4'], name: 'Anchovy x4' },
                { ingredients: ['Butterflyfish x2'], name: 'Butterflyfish x2' },
                { ingredients: ['Sea Horse x2'], name: 'Sea Horse x2' }
            ],
            autumn: [
                { ingredients: ['Anchovy x4'], name: 'Anchovy x4' },
                { ingredients: ['Halibut x2'], name: 'Halibut x2' },
                { ingredients: ['Muskellunge x2'], name: 'Muskellunge x2' }
            ],
            winter: [
                { ingredients: ['Anchovy x4'], name: 'Anchovy x4' },
                { ingredients: ['Blowfish x2'], name: 'Blowfish x2' },
                { ingredients: ['Clownfish x2'], name: 'Clownfish x2' }
            ]
        }
    },
    'Fish Stick': {
        building: 'Fish Market',
        recipes: {
            spring: [
                { ingredients: ['Red Snapper x6'], name: 'Red Snapper x6' },
                { ingredients: ['Olive Flounder x2'], name: 'Olive Flounder x2' },
                { ingredients: ['Zebra Turkeyfish x2'], name: 'Zebra Turkeyfish x2' }
            ],
            summer: [
                { ingredients: ['Red Snapper x6'], name: 'Red Snapper x6' },
                { ingredients: ['Surgeonfish x2'], name: 'Surgeonfish x2' },
                { ingredients: ['Tilapia x2'], name: 'Tilapia x2' }
            ],
            autumn: [
                { ingredients: ['Red Snapper x6'], name: 'Red Snapper x6' },
                { ingredients: ['Moray Eel x2'], name: 'Moray Eel x2' },
                { ingredients: ['Napoleanfish x2'], name: 'Napoleanfish x2' }
            ],
            winter: [
                { ingredients: ['Red Snapper x6'], name: 'Red Snapper x6' },
                { ingredients: ['Walleye x2'], name: 'Walleye x2' },
                { ingredients: ['Angelfish x2'], name: 'Angelfish x2' }
            ]
        }
    },
    'Crab Stick': {
        building: 'Fish Market',
        recipes: {
            spring: [
                { ingredients: ['Crab x1'], name: 'Crab x1' },
                { ingredients: ['Blue Crab x1'], name: 'Blue Crab x1' },
                { ingredients: ['Hermit Crab x1'], name: 'Hermit Crab x1' },
                { ingredients: ['Sea Slug x1'], name: 'Sea Slug x1' }
            ],
            summer: [
                { ingredients: ['Crab x1'], name: 'Crab x1' },
                { ingredients: ['Mussel x1'], name: 'Mussel x1' },
                { ingredients: ['Isopod x1'], name: 'Isopod x1' },
                { ingredients: ['Sea Snail x1'], name: 'Sea Snail x1' }
            ],
            autumn: [
                { ingredients: ['Crab x1'], name: 'Crab x1' },
                { ingredients: ['Shrimp x1'], name: 'Shrimp x1' },
                { ingredients: ['Lobster x1'], name: 'Lobster x1' },
                { ingredients: ['Barnacle x1'], name: 'Barnacle x1' }
            ],
            winter: [
                { ingredients: ['Crab x1'], name: 'Crab x1' },
                { ingredients: ['Oyster x1'], name: 'Oyster x1' },
                { ingredients: ['Isopod x1'], name: 'Isopod x1' },
                { ingredients: ['Garden Eel x1'], name: 'Garden Eel x1' }
            ]
        }
    },
    'Fish Oil': {
        building: 'Fish Market',
        recipes: {
            spring: [
                { ingredients: ['Tuna x8'], name: 'Tuna x8' },
                { ingredients: ['Weakfish x2'], name: 'Weakfish x2' },
                { ingredients: ['Oarfish x2'], name: 'Oarfish x2' }
            ],
            summer: [
                { ingredients: ['Tuna x8'], name: 'Tuna x8' },
                { ingredients: ['Cobia x2'], name: 'Cobia x2' },
                { ingredients: ['Sunfish x2'], name: 'Sunfish x2' }
            ],
            autumn: [
                { ingredients: ['Tuna x8'], name: 'Tuna x8' },
                { ingredients: ['Mahi Mahi x4'], name: 'Mahi Mahi x4' },
                { ingredients: ['Crab x2'], name: 'Crab x2' }
            ],
            winter: [
                { ingredients: ['Tuna x8'], name: 'Tuna x8' },
                { ingredients: ['Blue Marlin x2'], name: 'Blue Marlin x2' },
                { ingredients: ['Football fish x2'], name: 'Football fish x2' }
            ]
        }
    }
};

function getFishMarketLimit(productName) {
    return 5;
}

function renderFishMarketPanel() {
    const container = document.getElementById('fish-market-list');
    if (!container) return;

    const season = currentSeason || 'winter';
    let lowStockProducts = [];

    Object.entries(FISH_MARKET_RECIPES).forEach(([productName, productData]) => {
        const limit = getFishMarketLimit(productName);
        const currentStock = parseFloat(currentInventory?.[productName] || 0);
        
        // Only show products where stock is below the limit
        if (currentStock < limit) {
            const seasonalRecipes = productData.recipes[season] || [];
            const productIngredients = [];
            
            seasonalRecipes.forEach(recipe => {
                recipe.ingredients.forEach(ing => {
                    const parts = ing.split(' x');
                    const ingredientName = parts[0];
                    const quantity = parseInt(parts[1]) || 1;
                    const ingStock = parseFloat(currentInventory?.[ingredientName] || 0);
                    productIngredients.push({
                        name: ing,
                        stock: ingStock,
                        available: ingStock > 0
                    });
                });
            });

            lowStockProducts.push({
                name: productName,
                building: productData.building,
                stock: currentStock,
                limit: limit,
                ingredients: productIngredients
            });
        }
    });

    lowStockProducts.sort((a, b) => (a.stock - a.limit) - (b.stock - b.limit));

    if (lowStockProducts.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; font-size: 0.85rem; padding: 1rem 0;">✅ All Fish Market quotas reached</p>';
        return;
    }

    let html = '';

    lowStockProducts.forEach(product => {
        const urgency = getFishMarketUrgency(product.stock, product.limit);
        let productHtml = `
            <div class="fish-market-card">
                <div class="fish-market-name">
                    <span>${product.name}</span>
                    <span class="fish-market-stock ${urgency.colorClass}">${Math.floor(product.stock)}/${product.limit}</span>
                </div>
                <div class="fish-market-recipe">
        `;

        product.ingredients.forEach(ing => {
            const statusClass = ing.available ? 'recipe-status-good' : 'recipe-status-bad';
            const statusText = ing.available ? '✓' : '⚠️';
            productHtml += `<div class="recipe-step"><span class="recipe-base">${ing.name}</span><span class="${statusClass}">${statusText}</span></div>`;
        });

        productHtml += `
                </div>
            </div>
        `;

        html += productHtml;
    });

    container.innerHTML = html;
}
