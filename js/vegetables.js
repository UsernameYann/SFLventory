// ============================================================================
// VEGETABLES - Production tracking with urgency levels based on 30-day stats
// ============================================================================

const VEGETABLES_BY_SEASON = {
    spring: [
        "Sunflower", "Potato", "Pumpkin", "Rhubarb", "Zucchini", "Carrot", "Cabbage", "Soybean",
        "Corn", "Wheat", "Kale", "Barley"
    ],
    summer: [
        "Sunflower", "Potato", "Pumpkin", "Rhubarb", "Zucchini", "Pepper", "Beetroot",
        "Cauliflower", "Eggplant", "Radish", "Wheat"
    ],
    autumn: [
        "Sunflower", "Potato", "Pumpkin", "Rhubarb", "Zucchini", "Carrot", "Yam", "Broccoli",
        "Soybean", "Wheat", "Barley", "Artichoke"
    ],
    winter: [
        "Sunflower", "Potato", "Pumpkin", "Rhubarb", "Zucchini", "Cabbage", "Beetroot", "Cauliflower", "Parsnip",
        "Onion", "Turnip", "Wheat", "Kale"
    ]
};

const URGENCY_LEVELS = {
    CRITICAL: { label: 'Critical', colorClass: 'urgent-critical' },
    VERY_HIGH: { label: 'Very Urgent', colorClass: 'urgent-very-high' },
    HIGH: { label: 'Urgent', colorClass: 'urgent-high' },
    MEDIUM: { label: 'Medium', colorClass: 'urgent-medium' },
    LOW: { label: 'Low Priority', colorClass: 'urgent-low' },
    GOOD: { label: 'Good', colorClass: 'urgent-good' }
};

function calculateVegetableStats(vegetableName, days = 30) {
    // Get dates sorted (oldest to newest)
    const sortedDates = Object.keys(data).sort();
    const targetDates = sortedDates.slice(-days);
    
    if (targetDates.length === 0) return null;
    
    let values = [];
    targetDates.forEach(date => {
        const inventory = data[date]?.farm?.inventory;
        if (inventory && inventory[vegetableName] !== undefined) {
            values.push(parseFloat(inventory[vegetableName]));
        }
    });
    
    if (values.length === 0) return null;
    
    const current = values[values.length - 1];
    const sum = values.reduce((a, b) => a + b, 0);
    const average = sum / values.length;
    const max = Math.max(...values);
    
    return {
        current: current,
        average: average,
        max: max,
        gap: max - average
    };
}

function getUrgencyLevel(stats) {
    if (!stats) return URGENCY_LEVELS.GOOD;
    
    const { current, average, max } = stats;
    const gap = max - average;
    
    // Above max (100%+): GOOD
    if (current >= max) {
        return URGENCY_LEVELS.GOOD;
    }
    
    // Below average (0%): CRITICAL
    if (current < average) {
        return URGENCY_LEVELS.CRITICAL;
    }
    
    // If no gap (average = max), current is at max
    if (gap === 0) {
        return URGENCY_LEVELS.GOOD;
    }
    
    // Between average and average + 25% of gap: VERY HIGH (Très urgent)
    if (current < average + (gap * 0.25)) {
        return URGENCY_LEVELS.VERY_HIGH;
    }
    
    // Between average + 25% and average + 50%: HIGH (Urgent)
    if (current < average + (gap * 0.50)) {
        return URGENCY_LEVELS.HIGH;
    }
    
    // Between average + 50% and average + 75%: MEDIUM (Moyen)
    if (current < average + (gap * 0.75)) {
        return URGENCY_LEVELS.MEDIUM;
    }
    
    // Between average + 75% and max (100%): LOW (Peu urgent)
    return URGENCY_LEVELS.LOW;
}

function getUrgencyPriority(level) {
    const priorities = {
        'Very Urgent': 0,
        'Urgent': 1,
        'Medium': 2,
        'Low': 3,
        'Good': 4
    };
    return priorities[level.label] || 5;
}

function renderVegetablesPanel() {
    const container = document.getElementById('vegetables-list');
    if (!container) return;
    
    const season = currentSeason || 'winter';
    const vegetables = VEGETABLES_BY_SEASON[season] || [];
    
    if (vegetables.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; font-size: 0.85rem; padding: 1rem 0;">No vegetables data for this season</p>';
        return;
    }
    
    let vegetablesData = [];
    
    vegetables.forEach(veg => {
        const stats = calculateVegetableStats(veg, 30);
        if (!stats) return;
        
        const urgency = getUrgencyLevel(stats);
        
        // Calculate percentage to max (lower = more urgent)
        const percentToMax = (stats.current / stats.max) * 100;
        const toTop = Math.max(0, stats.max - stats.current);
        
        vegetablesData.push({
            name: veg,
            stats: stats,
            urgency: urgency,
            percentToMax: percentToMax,
            toTop: toTop
        });
    });
    
    // Sort by percentage to max (lowest first = most urgent)
    vegetablesData.sort((a, b) => a.percentToMax - b.percentToMax);
    
    if (vegetablesData.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; font-size: 0.85rem; padding: 1rem 0;">No vegetables tracked in inventory</p>';
        return;
    }
    
    // Group by urgency level
    let html = '';
    const groupedByUrgency = {};
    
    vegetablesData.forEach(veg => {
        const label = veg.urgency.label;
        if (!groupedByUrgency[label]) {
            groupedByUrgency[label] = [];
        }
        groupedByUrgency[label].push(veg);
    });
    
    // Render each urgency group
    Object.keys(URGENCY_LEVELS).forEach(key => {
        const level = URGENCY_LEVELS[key];
        const veggies = groupedByUrgency[level.label];
        
        if (!veggies || veggies.length === 0) return;
        
        html += `<div class="vegetable-group">`;
        html += `<h3>${level.label}</h3>`;
        
        veggies.forEach(veg => {
            const stats = veg.stats;
            
            html += `
                <div class="vegetable-card">
                    <div class="vegetable-name">
                        <span>${veg.name}</span>
                        <div class="veg-right">
                            ${veg.toTop > 0 ? `<span class="${veg.urgency.colorClass} veg-to-top">↑${Math.floor(veg.toTop)}</span>` : ''}
                            <span class="vegetable-stock ${veg.urgency.colorClass}">${Math.floor(stats.current)}</span>
                        </div>
                    </div>
                    <div class="vegetable-info">
                        <span>Avg: ${Math.floor(stats.average)}</span>
                        <span class="veg-max">Max: ${Math.floor(stats.max)}</span>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
    });
    
    container.innerHTML = html;
}
