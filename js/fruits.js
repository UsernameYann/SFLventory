// ============================================================================
// FRUITS - Production tracking with urgency levels based on 30-day stats
// ============================================================================

const FRUITS_BY_SEASON = {
    spring: [
        "Tomato", "Blueberry", "Orange"
    ],
    summer: [
        "Lemon", "Orange", "Banana"
    ],
    autumn: [
        "Tomato", "Apple", "Banana"
    ],
    winter: [
        "Lemon", "Blueberry", "Apple"
    ]
};

const FRUITS_URGENCY_LEVELS = {
    CRITICAL: { label: 'Critical', colorClass: 'urgent-critical' },
    VERY_HIGH: { label: 'Very Urgent', colorClass: 'urgent-very-high' },
    HIGH: { label: 'Urgent', colorClass: 'urgent-high' },
    MEDIUM: { label: 'Medium', colorClass: 'urgent-medium' },
    LOW: { label: 'Low Priority', colorClass: 'urgent-low' },
    GOOD: { label: 'Good', colorClass: 'urgent-good' }
};

function calculateFruitStats(fruitName, days = 30) {
    // Get dates sorted (oldest to newest)
    const sortedDates = Object.keys(data).sort();
    const targetDates = sortedDates.slice(-days);
    
    if (targetDates.length === 0) return null;
    
    let values = [];
    targetDates.forEach(date => {
        const inventory = data[date]?.farm?.inventory;
        if (inventory && inventory[fruitName] !== undefined) {
            values.push(parseFloat(inventory[fruitName]));
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

function getFruitUrgencyLevel(stats) {
    if (!stats) return FRUITS_URGENCY_LEVELS.GOOD;
    
    const { current, average, max } = stats;
    const gap = max - average;
    
    // Above max (100%+): GOOD
    if (current >= max) {
        return FRUITS_URGENCY_LEVELS.GOOD;
    }
    
    // Below average (0%): CRITICAL
    if (current < average) {
        return FRUITS_URGENCY_LEVELS.CRITICAL;
    }
    
    // If no gap (average = max), current is at max
    if (gap === 0) {
        return FRUITS_URGENCY_LEVELS.GOOD;
    }
    
    // Between average and average + 25% of gap: VERY HIGH (Très urgent)
    if (current < average + (gap * 0.25)) {
        return FRUITS_URGENCY_LEVELS.VERY_HIGH;
    }
    
    // Between average + 25% and average + 50%: HIGH (Urgent)
    if (current < average + (gap * 0.50)) {
        return FRUITS_URGENCY_LEVELS.HIGH;
    }
    
    // Between average + 50% and average + 75%: MEDIUM (Moyen)
    if (current < average + (gap * 0.75)) {
        return FRUITS_URGENCY_LEVELS.MEDIUM;
    }
    
    // Between average + 75% and max (100%): LOW (Peu urgent)
    return FRUITS_URGENCY_LEVELS.LOW;
}

function renderFruitsPanel() {
    const container = document.getElementById('fruits-list');
    if (!container) return;
    
    const season = currentSeason || 'winter';
    const fruits = FRUITS_BY_SEASON[season] || [];
    
    if (fruits.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; font-size: 0.85rem; padding: 1rem 0;">No fruits data for this season</p>';
        return;
    }
    
    let fruitsData = [];
    
    fruits.forEach(fruit => {
        const stats = calculateFruitStats(fruit, 30);
        if (!stats) return;
        
        const urgency = getFruitUrgencyLevel(stats);
        
        // Calculate quantity to top
        const toTop = Math.max(0, stats.max - stats.current);
        
        fruitsData.push({
            name: fruit,
            stats: stats,
            urgency: urgency,
            percentToMax: (stats.current / stats.max) * 100,
            toTop: toTop
        });
    });
    
    // Sort by percentage to max (lowest first = most urgent)
    fruitsData.sort((a, b) => a.percentToMax - b.percentToMax);
    
    if (fruitsData.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; font-size: 0.85rem; padding: 1rem 0;">No fruits tracked in inventory</p>';
        return;
    }
    
    // Group by urgency level
    let html = '';
    const groupedByUrgency = {};
    
    fruitsData.forEach(fruit => {
        const label = fruit.urgency.label;
        if (!groupedByUrgency[label]) {
            groupedByUrgency[label] = [];
        }
        groupedByUrgency[label].push(fruit);
    });
    
    // Render each urgency group
    Object.keys(FRUITS_URGENCY_LEVELS).forEach(key => {
        const level = FRUITS_URGENCY_LEVELS[key];
        const fruity = groupedByUrgency[level.label];
        
        if (!fruity || fruity.length === 0) return;
        
        html += `<div class="fruit-group">`;
        html += `<h3>${level.label}</h3>`;
        
        fruity.forEach(fruit => {
            const stats = fruit.stats;
            
            html += `
                <div class="fruit-card">
                    <div class="fruit-name">
                        <span>${fruit.name}</span>
                        <div class="fruit-right">
                            ${fruit.toTop > 0 ? `<span class="${fruit.urgency.colorClass} fruit-to-top">↑${Math.floor(fruit.toTop)}</span>` : ''}
                            <span class="fruit-stock ${fruit.urgency.colorClass}">${Math.floor(stats.current)}</span>
                        </div>
                    </div>
                    <div class="fruit-info">
                        <span>Avg: ${Math.floor(stats.average)}</span>
                        <span class="fruit-max">Max: ${Math.floor(stats.max)}</span>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
    });
    
    container.innerHTML = html;
}
