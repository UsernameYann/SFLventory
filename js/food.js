// ============================================================================
// FOOD - Cooking recipes and ingredient tracking
// ============================================================================

const FOOD_URGENCY_LEVELS = {
    CRITICAL: { label: 'Critical', colorClass: 'urgent-critical', order: 0 },
    VERY_HIGH: { label: 'Very Urgent', colorClass: 'urgent-very-high', order: 1 },
    HIGH: { label: 'Urgent', colorClass: 'urgent-high', order: 2 },
    MEDIUM: { label: 'Medium', colorClass: 'urgent-medium', order: 3 },
    LOW: { label: 'Low Priority', colorClass: 'urgent-low', order: 4 },
    GOOD: { label: 'Good', colorClass: 'urgent-good', order: 5 }
};

function getFoodUrgency(stock, limit) {
    const percentage = (stock / limit) * 100;
    
    if (stock < limit * 0.25) return FOOD_URGENCY_LEVELS.CRITICAL;
    if (stock < limit * 0.50) return FOOD_URGENCY_LEVELS.VERY_HIGH;
    if (stock < limit * 0.75) return FOOD_URGENCY_LEVELS.HIGH;
    if (stock < limit) return FOOD_URGENCY_LEVELS.MEDIUM;
    return FOOD_URGENCY_LEVELS.GOOD;
}

const FOOD_BUILDINGS = {
    'Fire Pit': { icon: '🔥' },
    'Kitchen': { icon: '🍳' },
    'Deli': { icon: '🥙' },
    'Smoothie Shack': { icon: '🥤' },
    'Bakery': { icon: '🍰' }
};

function getFoodLimit(recipeName, building, ingredientsCount) {
    // Fire Pit rules
    if (building === 'Fire Pit') {
        const exceptions = ['Antipasto', 'Rice Bun', 'Kale Omelette', 'Furikake Sprinkle', 'Fried Tofu', 'Cabbers n Mash'];
        if (exceptions.includes(recipeName)) return 15;
        
        if (ingredientsCount === 1) return 50;
        if (ingredientsCount === 2) return 40;
        if (ingredientsCount >= 3) return 30;
        return 50;
    }
    
    // Kitchen rules
    if (building === 'Kitchen') {
        const limit5 = ['Crimstone Infused Fish Oil', 'Creamy Crab Bite', 'Steamed Red Rice', 'Surimi Rice Bowl'];
        if (limit5.includes(recipeName)) return 5;
        
        const limit10 = ['Spaghetti al Limone', 'Caprese Salad', 'Goblin Brunch', 'Bumpkin Roast'];
        if (limit10.includes(recipeName)) return 10;
        
        return 30;
    }
    
    // Smoothie Shack rules
    if (building === 'Smoothie Shack') {
        const limit10 = ['Sour Shake', 'The Lot', 'Grape Juice', 'Slow Juice'];
        if (limit10.includes(recipeName)) return 10;
        if (recipeName === 'Banana Blast') return 20;
        return 30;
    }
    
    // Deli rules
    if (building === 'Deli') {
        if (recipeName === 'Cheese') return 50;
        return 20;
    }
    
    // Bakery rules
    if (building === 'Bakery') {
        return 5;
    }
    
    return 20;
}

const FOOD_DB = [
    // Fire Pit
    { name: 'Rapid Roast', building: 'Fire Pit', time: '00:00:10', ingredients: ['Magic Mushroom', 'Pumpkin'] },
    { name: 'Pizza Margherita', building: 'Fire Pit', time: '20:00:00', ingredients: ['Tomato', 'Cheese', 'Wheat'] },
    { name: 'Popcorn', building: 'Fire Pit', time: '00:12:00', ingredients: ['Sunflower', 'Corn'] },
    { name: 'Antipasto', building: 'Fire Pit', time: '03:00:00', ingredients: ['Olive', 'Grape'] },
    { name: 'Rice Bun', building: 'Fire Pit', time: '05:00:00', ingredients: ['Rice', 'Wheat'] },
    { name: 'Pumpkin Soup', building: 'Fire Pit', time: '00:03:00', ingredients: ['Pumpkin'] },
    { name: 'Reindeer Carrot', building: 'Fire Pit', time: '00:05:00', ingredients: ['Carrot'] },
    { name: 'Cabbers n Mash', building: 'Fire Pit', time: '00:40:00', ingredients: ['Mashed Potato', 'Cabbage'] },
    { name: 'Mashed Potato', building: 'Fire Pit', time: '00:00:30', ingredients: ['Potato'] },
    { name: 'Kale Omelette', building: 'Fire Pit', time: '03:30:00', ingredients: ['Egg', 'Kale'] },
    { name: 'Mushroom Soup', building: 'Fire Pit', time: '00:10:00', ingredients: ['Wild Mushroom'] },
    { name: 'Rhubarb Tart', building: 'Fire Pit', time: '00:01:00', ingredients: ['Rhubarb'] },
    { name: 'Bumpkin Broth', building: 'Fire Pit', time: '00:20:00', ingredients: ['Carrot', 'Cabbage'] },
    { name: 'Fried Tofu', building: 'Fire Pit', time: '01:30:00', ingredients: ['Soybean', 'Sunflower'] },
    { name: 'Kale Stew', building: 'Fire Pit', time: '02:00:00', ingredients: ['Kale'] },
    { name: 'Boiled Eggs', building: 'Fire Pit', time: '01:00:00', ingredients: ['Egg'] },
    { name: 'Furikake Sprinkle', building: 'Fire Pit', time: '00:00:00', ingredients: ['Fish Flake', 'Seaweed'] },
    
    // Kitchen
    { name: 'Beetroot Blaze', building: 'Kitchen', time: '00:00:30', ingredients: ['Magic Mushroom', 'Beetroot'] },
    { name: 'Surimi Rice Bowl', building: 'Kitchen', time: '00:00:00', ingredients: ['Fish Stick', 'Rice', 'Onion'] },
    { name: 'Creamy Crab Bite', building: 'Kitchen', time: '00:00:00', ingredients: ['Crab Stick', 'Cheese'] },
    { name: 'Crimstone Infused Fish Oil', building: 'Kitchen', time: '00:00:00', ingredients: ['Fish Oil', 'Crimstone'] },
    { name: 'Caprese Salad', building: 'Kitchen', time: '03:00:00', ingredients: ['Cheese', 'Tomato', 'Kale'] },
    { name: 'Mushroom Jacket Potatoes', building: 'Kitchen', time: '00:10:00', ingredients: ['Wild Mushroom', 'Potato'] },
    { name: 'Pancakes', building: 'Kitchen', time: '01:00:00', ingredients: ['Wheat', 'Egg', 'Honey'] },
    { name: 'Spaghetti al Limone', building: 'Kitchen', time: '15:00:00', ingredients: ['Wheat', 'Lemon', 'Cheese'] },
    { name: 'Steamed Red Rice', building: 'Kitchen', time: '04:00:00', ingredients: ['Rice', 'Beetroot'] },
    { name: 'Fruit Salad', building: 'Kitchen', time: '00:30:00', ingredients: ['Apple', 'Orange', 'Blueberry'] },
    { name: 'Tofu Scramble', building: 'Kitchen', time: '03:00:00', ingredients: ['Soybean', 'Egg', 'Cauliflower'] },
    { name: 'Sunflower Crunch', building: 'Kitchen', time: '00:10:00', ingredients: ['Sunflower'] },
    { name: 'Bumpkin Roast', building: 'Kitchen', time: '12:00:00', ingredients: ['Mashed Potato', 'Roast Veggies'] },
    { name: 'Goblin Brunch', building: 'Kitchen', time: '12:00:00', ingredients: ['Boiled Eggs', "Goblin's Treat"] },
    { name: 'Bumpkin ganoush', building: 'Kitchen', time: '05:00:00', ingredients: ['Eggplant', 'Potato', 'Parsnip'] },
    { name: 'Roast Veggies', building: 'Kitchen', time: '02:00:00', ingredients: ['Cauliflower', 'Carrot'] },
    { name: 'Cauliflower Burger', building: 'Kitchen', time: '03:00:00', ingredients: ['Cauliflower', 'Wheat'] },
    { name: "Goblin's Treat", building: 'Kitchen', time: '06:00:00', ingredients: ['Pumpkin', 'Radish', 'Cabbage'] },
    { name: 'Bumpkin Salad', building: 'Kitchen', time: '03:30:00', ingredients: ['Beetroot', 'Parsnip'] },
    { name: 'Club Sandwich', building: 'Kitchen', time: '03:00:00', ingredients: ['Sunflower', 'Carrot', 'Wheat'] },
    
    // Deli
    { name: 'Cheese', building: 'Deli', time: '00:20:00', ingredients: ['Milk'] },
    { name: 'Sauerkraut', building: 'Deli', time: '1d 00:00:00', ingredients: ['Cabbage'] },
    { name: 'Fermented Carrots', building: 'Deli', time: '1d 00:00:00', ingredients: ['Carrot'] },
    { name: 'Shroom Syrup', building: 'Deli', time: '00:00:10', ingredients: ['Magic Mushroom', 'Honey'] },
    { name: 'Blue Cheese', building: 'Deli', time: '03:00:00', ingredients: ['Cheese', 'Blueberry'] },
    { name: 'Honey Cheddar', building: 'Deli', time: '12:00:00', ingredients: ['Cheese', 'Honey'] },
    { name: 'Blueberry Jam', building: 'Deli', time: '12:00:00', ingredients: ['Blueberry'] },
    { name: 'Fancy Fries', building: 'Deli', time: '1d 00:00:00', ingredients: ['Sunflower', 'Potato'] },
    
    // Smoothie Shack
    { name: 'Carrot Juice', building: 'Smoothie Shack', time: '01:00:00', ingredients: ['Carrot'] },
    { name: 'Quick Juice', building: 'Smoothie Shack', time: '00:30:00', ingredients: ['Sunflower', 'Pumpkin'] },
    { name: 'Grape Juice', building: 'Smoothie Shack', time: '03:00:00', ingredients: ['Grape', 'Radish'] },
    { name: 'Sour Shake', building: 'Smoothie Shack', time: '01:00:00', ingredients: ['Lemon'] },
    { name: 'Purple Smoothie', building: 'Smoothie Shack', time: '00:30:00', ingredients: ['Blueberry', 'Cabbage'] },
    { name: 'Power Smoothie', building: 'Smoothie Shack', time: '01:30:00', ingredients: ['Blueberry', 'Kale'] },
    { name: 'Orange Juice', building: 'Smoothie Shack', time: '00:45:00', ingredients: ['Orange'] },
    { name: 'Apple Juice', building: 'Smoothie Shack', time: '01:00:00', ingredients: ['Apple'] },
    { name: 'Bumpkin Detox', building: 'Smoothie Shack', time: '02:00:00', ingredients: ['Apple', 'Orange', 'Carrot'] },
    { name: 'The Lot', building: 'Smoothie Shack', time: '03:30:00', ingredients: ['Blueberry', 'Orange', 'Grape', 'Apple', 'Banana'] },
    { name: 'Banana Blast', building: 'Smoothie Shack', time: '03:00:00', ingredients: ['Banana', 'Egg'] },
    { name: 'Slow Juice', building: 'Smoothie Shack', time: '1d 00:00:00', ingredients: ['Grape', 'Kale'] },
    
    // Bakery
    { name: 'Lemon Cheesecake', building: 'Bakery', time: '1d 06:00:00', ingredients: ['Lemon', 'Cheese', 'Egg'] },
    { name: 'Honey Cake', building: 'Bakery', time: '08:00:00', ingredients: ['Honey', 'Wheat', 'Egg'] },
    { name: 'Orange Cake', building: 'Bakery', time: '04:00:00', ingredients: ['Orange', 'Egg', 'Wheat'] },
    { name: 'Apple Pie', building: 'Bakery', time: '04:00:00', ingredients: ['Apple', 'Wheat', 'Egg'] },
    { name: 'Kale & Mushroom Pie', building: 'Bakery', time: '04:00:00', ingredients: ['Wild Mushroom', 'Kale', 'Wheat'] },
    { name: 'Sunflower Cake', building: 'Bakery', time: '06:30:00', ingredients: ['Sunflower', 'Wheat', 'Egg'] },
    { name: 'Potato Cake', building: 'Bakery', time: '10:30:00', ingredients: ['Potato', 'Wheat', 'Egg'] },
    { name: 'Pumpkin Cake', building: 'Bakery', time: '10:30:00', ingredients: ['Pumpkin', 'Wheat', 'Egg'] },
    { name: 'Eggplant Cake', building: 'Bakery', time: '1d 00:00:00', ingredients: ['Eggplant', 'Wheat', 'Egg'] },
    { name: 'Carrot Cake', building: 'Bakery', time: '13:00:00', ingredients: ['Carrot', 'Wheat', 'Egg'] },
    { name: 'Cabbage Cake', building: 'Bakery', time: '15:00:00', ingredients: ['Cabbage', 'Wheat', 'Egg'] },
    { name: 'Beetroot Cake', building: 'Bakery', time: '22:00:00', ingredients: ['Beetroot', 'Wheat', 'Egg'] },
    { name: 'Parsnip Cake', building: 'Bakery', time: '1d 00:00:00', ingredients: ['Parsnip', 'Wheat', 'Egg'] },
    { name: 'Cauliflower Cake', building: 'Bakery', time: '22:00:00', ingredients: ['Cauliflower', 'Wheat', 'Egg'] },
    { name: 'Cornbread', building: 'Bakery', time: '12:00:00', ingredients: ['Corn', 'Wheat', 'Egg'] },
    { name: 'Radish Cake', building: 'Bakery', time: '1d 00:00:00', ingredients: ['Radish', 'Wheat', 'Egg'] },
    { name: 'Wheat Cake', building: 'Bakery', time: '1d 00:00:00', ingredients: ['Wheat', 'Egg'] }
];

function renderFoodPanel() {
    const container = document.getElementById('food-list');
    if (!container) return;

    let lowStockRecipes = [];

    FOOD_DB.forEach(recipe => {
        const limit = getFoodLimit(recipe.name, recipe.building, recipe.ingredients.length);
        const currentStock = parseFloat(currentInventory?.[recipe.name] || 0);
        
        // Only show recipes where stock is below the building limit
        if (currentStock < limit) {
            const recipeIngredients = [];
            recipe.ingredients.forEach(ing => {
                const ingStock = parseFloat(currentInventory?.[ing] || 0);
                recipeIngredients.push({
                    name: ing,
                    stock: ingStock,
                    available: ingStock > 0
                });
            });

            lowStockRecipes.push({
                name: recipe.name,
                building: recipe.building,
                time: recipe.time,
                stock: currentStock,
                limit: limit,
                ingredients: recipeIngredients
            });
        }
    });

    lowStockRecipes.sort((a, b) => (a.stock - a.limit) - (b.stock - b.limit));

    if (lowStockRecipes.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; font-size: 0.85rem; padding: 1rem 0;">✅ All cooking quotas reached</p>';
        return;
    }

    // Group by urgency
    const grouped = {};
    Object.values(FOOD_URGENCY_LEVELS).forEach(level => {
        if (level) {
            grouped[level.label] = lowStockRecipes.filter(r => getFoodUrgency(r.stock, r.limit).label === level.label);
        }
    });

    let html = '';
    Object.entries(FOOD_URGENCY_LEVELS).forEach(([key, level]) => {
        const items = grouped[level.label] || [];
        if (items.length === 0) return;

        html += `<div class="food-group">`;
        html += `<h3>${level.label}</h3>`;

        items.forEach(recipe => {
            const building = FOOD_BUILDINGS[recipe.building];
            const urgency = getFoodUrgency(recipe.stock, recipe.limit);
            let recipeHtml = `
                <div class="food-card">
                    <div class="food-name">
                        <span>${recipe.name}</span>
                        <span class="food-stock ${urgency.colorClass}">${Math.floor(recipe.stock)}/${recipe.limit}</span>
                    </div>
                    <div class="food-info">
                        <span>${building.icon} ${recipe.building}</span>
                    </div>
                    <div class="food-recipe">
            `;

            recipe.ingredients.forEach(ing => {
                const statusClass = ing.available ? 'recipe-status-good' : 'recipe-status-bad';
                const statusText = ing.available ? '✓' : '⚠️';
                recipeHtml += `<div class="recipe-step"><span class="recipe-base">${ing.name}</span><span class="${statusClass}">${statusText}</span></div>`;
            });

            recipeHtml += `
                    </div>
                </div>
            `;

            html += recipeHtml;
        });

        html += `</div>`;
    });

    container.innerHTML = html;
}
