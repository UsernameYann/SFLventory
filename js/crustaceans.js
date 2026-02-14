// ============================================================================
// CRUSTACEANS - Marine crustacean and mollusks with fishing recipes
// ============================================================================

const CRUSTACEAN_URGENCY_LEVELS = {
    CRITICAL: { label: 'CRITICAL', colorClass: 'urgent-critical', order: 0 },
    VERY_HIGH: { label: 'VERY_HIGH', colorClass: 'urgent-very-high', order: 1 },
    HIGH: { label: 'HIGH', colorClass: 'urgent-high', order: 2 },
    MEDIUM: { label: 'MEDIUM', colorClass: 'urgent-medium', order: 3 },
    LOW: { label: 'LOW', colorClass: 'urgent-low', order: 4 },
    GOOD: { label: 'GOOD', colorClass: 'urgent-good', order: 5 }
};

function getCrustaceanUrgency(stock, minStock) {
    const percentage = (stock / minStock) * 100;
    
    if (stock < minStock * 0.25) return CRUSTACEAN_URGENCY_LEVELS.CRITICAL;
    if (stock < minStock * 0.50) return CRUSTACEAN_URGENCY_LEVELS.VERY_HIGH;
    if (stock < minStock * 0.75) return CRUSTACEAN_URGENCY_LEVELS.HIGH;
    if (stock < minStock) return CRUSTACEAN_URGENCY_LEVELS.MEDIUM;
    return CRUSTACEAN_URGENCY_LEVELS.GOOD;
}

const CRUSTACEAN_DB = [
    { name: 'Blue Crab', pot: 'Crab Pot', ingredients: ['Heart Leaf x3', 'Ribbon x3'] },
    { name: 'Lobster', pot: 'Crab Pot', ingredients: ['Wild Grass x3', 'Frost Pebble x3'] },
    { name: 'Hermit Crab', pot: 'Crab Pot', ingredients: ['Grape x5', 'Rice x5'] },
    { name: 'Shrimp', pot: 'Crab Pot', ingredients: ['Crimstone x2'] },
    { name: 'Mussel', pot: 'Crab Pot', ingredients: ['Moonfur x1'] },
    { name: 'Oyster', pot: 'Crab Pot', ingredients: ['Fish Stick x2'] },
    { name: 'Anemone', pot: 'Crab Pot', ingredients: ['Fish Oil x2', 'Crab Stick x2'] },
    { name: 'Isopod', pot: 'Crab Pot', ingredients: [] }, // No chum
    { name: 'Sea Slug', pot: 'Mariner Pot', ingredients: ['Crimstone x2'] },
    { name: 'Sea Snail', pot: 'Mariner Pot', ingredients: ['Chewed Bone x3', 'Ruffroot x3'] },
    { name: 'Garden Eel', pot: 'Mariner Pot', ingredients: ['Dewberry x3', 'Duskberry x3'] },
    { name: 'Octopus', pot: 'Mariner Pot', ingredients: ['Moonfur x1'] },
    { name: 'Sea Urchin', pot: 'Mariner Pot', ingredients: ['Fish Stick x2'] },
    { name: 'Horseshoe Crab', pot: 'Mariner Pot', ingredients: ['Crab Stick x2'] },
    { name: 'Barnacle', pot: 'Mariner Pot', ingredients: [] } // No chum
];

function getCrustaceanMinStock(name) {
    // All crustaceans have min stock of 5
    return 5;
}

function renderCrustaceansPanel() {
    const container = document.getElementById('crustaceans-list');
    if (!container) return;

    let lowCrustaceans = [];
    CRUSTACEAN_DB.forEach(crustacean => {
        const count = parseFloat(currentInventory?.[crustacean.name] || 0);
        const minStock = getCrustaceanMinStock(crustacean.name);
        if (count < minStock) {
            lowCrustaceans.push({
                name: crustacean.name,
                pot: crustacean.pot,
                count: count,
                minStock: minStock,
                needed: Math.max(0, minStock - Math.floor(count)),
                ingredients: crustacean.ingredients
            });
        }
    });

    lowCrustaceans.sort((a, b) => b.needed - a.needed);

    if (lowCrustaceans.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; font-size: 0.85rem; padding: 1rem 0;">✅ All crustaceans sufficiently stocked</p>';
        return;
    }

    let html = '';
    lowCrustaceans.forEach(crustacean => {
        const urgency = getCrustaceanUrgency(crustacean.count, crustacean.minStock);
        let crustaceanHtml = `
            <div class="crustacean-card">
                <div class="crustacean-name">
                    <span>${crustacean.name}</span>
                    <span class="crustacean-stock ${urgency.colorClass}">${Math.floor(crustacean.count)}/${crustacean.minStock}</span>
                </div>
                <div class="crustacean-info">
                    <span>${crustacean.pot}</span>
                </div>
                <div class="crustacean-recipe">
        `;
        
        if (crustacean.ingredients && crustacean.ingredients.length > 0) {
            for (let ingredient of crustacean.ingredients) {
                // Parse "Item x quantity" format
                const parts = ingredient.split(' x');
                const ingredientName = parts[0];
                const ingredientStock = parseInt(currentInventory?.[ingredientName] || 0);
                const statusClass = ingredientStock > 0 ? 'recipe-status-good' : 'recipe-status-bad';
                const statusText = ingredientStock > 0 ? '✓' : '⚠️';
                crustaceanHtml += `<div class="recipe-step"><span class="recipe-base">${ingredient}</span><span class="${statusClass}">${statusText}</span></div>`;
            }
        } else {
            crustaceanHtml += `<div class="recipe-step"><span class="recipe-base">No chum</span><span class="recipe-status-good">✓</span></div>`;
        }
        
        crustaceanHtml += `
                </div>
            </div>
        `;
        
        html += crustaceanHtml;
    });

    container.innerHTML = html;
}
