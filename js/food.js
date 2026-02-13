// ============================================================================
// FOOD - Cooking recipes and ingredient tracking
// ============================================================================

const FOOD_BUILDINGS = {
    'Fire Pit': { limit: 50, icon: '🔥' },
    'Kitchen': { limit: 30, icon: '🍳' },
    'Deli': { limit: 20, icon: '🥙' },
    'Smoothie Shack': { limit: 20, icon: '🥤' },
    'Bakery': { limit: 5, icon: '🍰' }
};

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
    { name: 'Gumbo', building: 'Fire Pit', time: '04:00:00', ingredients: ['Potato', 'Pumpkin', 'Carrot', 'Red Snapper'] },
    { name: 'Boiled Eggs', building: 'Fire Pit', time: '01:00:00', ingredients: ['Egg'] },
    { name: 'Furikake Sprinkle', building: 'Fire Pit', time: '00:00:00', ingredients: ['Fish Flake', 'Seaweed'] },
    
    // Kitchen
    { name: 'Beetroot Blaze', building: 'Kitchen', time: '00:00:30', ingredients: ['Magic Mushroom', 'Beetroot'] },
    { name: 'Sushi Roll', building: 'Kitchen', time: '01:00:00', ingredients: ['Angelfish', 'Seaweed', 'Rice'] },
    { name: 'Caprese Salad', building: 'Kitchen', time: '03:00:00', ingredients: ['Cheese', 'Tomato', 'Kale'] },
    { name: 'Mushroom Jacket Potatoes', building: 'Kitchen', time: '00:10:00', ingredients: ['Wild Mushroom', 'Potato'] },
    { name: 'Pancakes', building: 'Kitchen', time: '01:00:00', ingredients: ['Wheat', 'Egg', 'Honey'] },
    { name: "Ocean's Olive", building: 'Kitchen', time: '02:00:00', ingredients: ['Olive Flounder', 'Olive'] },
    { name: 'Spaghetti al Limone', building: 'Kitchen', time: '15:00:00', ingredients: ['Wheat', 'Lemon', 'Cheese'] },
    { name: 'Steamed Red Rice', building: 'Kitchen', time: '04:00:00', ingredients: ['Rice', 'Beetroot'] },
    { name: 'Fish Burger', building: 'Kitchen', time: '02:00:00', ingredients: ['Beetroot', 'Wheat', 'Horse Mackerel'] },
    { name: 'Fish n Chips', building: 'Kitchen', time: '04:00:00', ingredients: ['Fancy Fries', 'Halibut'] },
    { name: 'Fruit Salad', building: 'Kitchen', time: '00:30:00', ingredients: ['Apple', 'Orange', 'Blueberry'] },
    { name: 'Seafood Basket', building: 'Kitchen', time: '05:00:00', ingredients: ['Blowfish', 'Napoleanfish', 'Sunfish'] },
    { name: 'Tofu Scramble', building: 'Kitchen', time: '03:00:00', ingredients: ['Soybean', 'Egg', 'Cauliflower'] },
    { name: 'Sunflower Crunch', building: 'Kitchen', time: '00:10:00', ingredients: ['Sunflower'] },
    { name: 'Fried Calamari', building: 'Kitchen', time: '05:00:00', ingredients: ['Sunflower', 'Wheat', 'Squid'] },
    { name: 'Fish Omelette', building: 'Kitchen', time: '05:00:00', ingredients: ['Egg', 'Surgeonfish', 'Butterflyfish'] },
    { name: 'Bumpkin Roast', building: 'Kitchen', time: '12:00:00', ingredients: ['Mashed Potato', 'Roast Veggies'] },
    { name: 'Goblin Brunch', building: 'Kitchen', time: '12:00:00', ingredients: ['Boiled Eggs', "Goblin's Treat"] },
    { name: 'Bumpkin ganoush', building: 'Kitchen', time: '05:00:00', ingredients: ['Eggplant', 'Potato', 'Parsnip'] },
    { name: 'Chowder', building: 'Kitchen', time: '08:00:00', ingredients: ['Beetroot', 'Wheat', 'Parsnip', 'Anchovy'] },
    { name: 'Roast Veggies', building: 'Kitchen', time: '02:00:00', ingredients: ['Cauliflower', 'Carrot'] },
    { name: 'Cauliflower Burger', building: 'Kitchen', time: '03:00:00', ingredients: ['Cauliflower', 'Wheat'] },
    { name: "Goblin's Treat", building: 'Kitchen', time: '06:00:00', ingredients: ['Pumpkin', 'Radish', 'Cabbage'] },
    { name: 'Bumpkin Salad', building: 'Kitchen', time: '03:30:00', ingredients: ['Beetroot', 'Parsnip'] },
    { name: 'Club Sandwich', building: 'Kitchen', time: '03:00:00', ingredients: ['Sunflower', 'Carrot', 'Wheat'] },
    
    // Deli
    { name: 'Surimi Rice Bowl', building: 'Deli', time: '00:00:00', ingredients: ['Fish Stick', 'Rice', 'Onion'] },
    { name: 'Creamy Crab Bite', building: 'Deli', time: '00:00:00', ingredients: ['Crab Stick', 'Cheese'] },
    { name: 'Crimstone Infused Fish Oil', building: 'Deli', time: '00:00:00', ingredients: ['Fish Oil', 'Crimstone'] },
    { name: 'Shroom Syrup', building: 'Deli', time: '00:00:10', ingredients: ['Magic Mushroom', 'Honey'] },
    { name: 'Blue Cheese', building: 'Deli', time: '03:00:00', ingredients: ['Cheese', 'Blueberry'] },
    { name: 'Honey Cheddar', building: 'Deli', time: '12:00:00', ingredients: ['Cheese', 'Honey'] },
    { name: 'Fermented Fish', building: 'Deli', time: '1d 00:00:00', ingredients: ['Tuna'] },
    { name: 'Blueberry Jam', building: 'Deli', time: '12:00:00', ingredients: ['Blueberry'] },
    { name: 'Fancy Fries', building: 'Deli', time: '1d 00:00:00', ingredients: ['Sunflower', 'Potato'] },
    
    // Smoothie Shack
    { name: 'Sauerkraut', building: 'Smoothie Shack', time: '1d 00:00:00', ingredients: ['Cabbage'] },
    { name: 'Fermented Carrots', building: 'Smoothie Shack', time: '1d 00:00:00', ingredients: ['Carrot'] },
    { name: 'Cheese', building: 'Smoothie Shack', time: '00:20:00', ingredients: ['Milk'] },
    { name: 'Grape Juice', building: 'Smoothie Shack', time: '03:00:00', ingredients: ['Grape', 'Radish'] },
    { name: 'Sour Shake', building: 'Smoothie Shack', time: '01:00:00', ingredients: ['Lemon'] },
    { name: 'Purple Smoothie', building: 'Smoothie Shack', time: '00:30:00', ingredients: ['Blueberry', 'Cabbage'] },
    { name: 'Power Smoothie', building: 'Smoothie Shack', time: '01:30:00', ingredients: ['Blueberry', 'Kale'] },
    { name: 'Orange Juice', building: 'Smoothie Shack', time: '00:45:00', ingredients: ['Orange'] },
    { name: 'Apple Juice', building: 'Smoothie Shack', time: '01:00:00', ingredients: ['Apple'] },
    { name: 'Bumpkin Detox', building: 'Smoothie Shack', time: '02:00:00', ingredients: ['Apple', 'Orange', 'Carrot'] },
    { name: 'The Lot', building: 'Smoothie Shack', time: '03:30:00', ingredients: ['Blueberry', 'Orange', 'Grape', 'Apple', 'Banana'] },
    { name: 'Banana Blast', building: 'Smoothie Shack', time: '03:00:00', ingredients: ['Banana', 'Egg'] },
    
    // Bakery
    { name: 'Slow Juice', building: 'Bakery', time: '1d 00:00:00', ingredients: ['Grape', 'Kale'] },
    { name: 'Carrot Juice', building: 'Bakery', time: '01:00:00', ingredients: ['Carrot'] },
    { name: 'Quick Juice', building: 'Bakery', time: '00:30:00', ingredients: ['Sunflower', 'Pumpkin'] },
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
        const limit = FOOD_BUILDINGS[recipe.building].limit;
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

    let html = '';

    Object.entries(FOOD_BUILDINGS).forEach(([building, config]) => {
        const buildingRecipes = lowStockRecipes.filter(r => r.building === building);
        if (!buildingRecipes.length) return;

        html += `<div class="food-group">`;
        html += `<h3>${config.icon} ${building}</h3>`;

        buildingRecipes.forEach(recipe => {
            let recipeHtml = `
                <div class="food-card">
                    <div class="food-name">
                        <span>${recipe.name}</span>
                        <span class="food-stock">${Math.floor(recipe.stock)}/${recipe.limit}</span>
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
