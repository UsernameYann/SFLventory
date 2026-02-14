// ============================================================================
// GREENHOUSE - Production tracking with urgency levels based on 30-day stats
// ============================================================================

const GREENHOUSE_ITEMS = [
    "Rice",
    "Olive",
    "Grape"
];

const GREENHOUSE_URGENCY_LEVELS = {
    CRITICAL: { label: 'Critical', colorClass: 'urgent-critical' },
    VERY_HIGH: { label: 'Very Urgent', colorClass: 'urgent-very-high' },
    HIGH: { label: 'Urgent', colorClass: 'urgent-high' },
    MEDIUM: { label: 'Medium', colorClass: 'urgent-medium' },
    LOW: { label: 'Low Priority', colorClass: 'urgent-low' },
    GOOD: { label: 'Good', colorClass: 'urgent-good' }
};

function calculateGreenhouseStats(itemName, days = 30) {
    // Get dates sorted (oldest to newest)
    const sortedDates = Object.keys(data).sort();
    const targetDates = sortedDates.slice(-days);
    
    if (targetDates.length === 0) return null;
    
    let values = [];
    targetDates.forEach(date => {
        const inventory = data[date]?.farm?.inventory;
        if (inventory && inventory[itemName] !== undefined) {
            values.push(parseFloat(inventory[itemName]));
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

function getGreenhouseUrgencyLevel(stats) {
    if (!stats) return GREENHOUSE_URGENCY_LEVELS.GOOD;
    
    const { current, average, max } = stats;
    const gap = max - average;
    
    // Above max (100%+): GOOD
    if (current >= max) {
        return GREENHOUSE_URGENCY_LEVELS.GOOD;
    }
    
    // Below average (0%): CRITICAL
    if (current < average) {
        return GREENHOUSE_URGENCY_LEVELS.CRITICAL;
    }
    
    // If no gap (average = max), current is at max
    if (gap === 0) {
        return GREENHOUSE_URGENCY_LEVELS.GOOD;
    }
    
    // Between average and average + 25% of gap: VERY HIGH (Très urgent)
    if (current < average + (gap * 0.25)) {
        return GREENHOUSE_URGENCY_LEVELS.VERY_HIGH;
    }
    
    // Between average + 25% and average + 50%: HIGH (Urgent)
    if (current < average + (gap * 0.50)) {
        return GREENHOUSE_URGENCY_LEVELS.HIGH;
    }
    
    // Between average + 50% and average + 75%: MEDIUM (Moyen)
    if (current < average + (gap * 0.75)) {
        return GREENHOUSE_URGENCY_LEVELS.MEDIUM;
    }
    
    // Between average + 75% and max (100%): LOW (Peu urgent)
    return GREENHOUSE_URGENCY_LEVELS.LOW;
}

function renderGreenhousePanel() {
    const container = document.getElementById('greenhouse-list');
    if (!container) return;
    
    let greenhouseData = [];
    
    GREENHOUSE_ITEMS.forEach(item => {
        const stats = calculateGreenhouseStats(item, 30);
        if (!stats) return;
        
        const urgency = getGreenhouseUrgencyLevel(stats);
        
        // Calculate quantity to top
        const toTop = Math.max(0, stats.max - stats.current);
        
        greenhouseData.push({
            name: item,
            stats: stats,
            urgency: urgency,
            percentToMax: (stats.current / stats.max) * 100,
            toTop: toTop
        });
    });
    
    // Sort by percentage to max (lowest first = most urgent)
    greenhouseData.sort((a, b) => a.percentToMax - b.percentToMax);
    
    if (greenhouseData.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; font-size: 0.85rem; padding: 1rem 0;">No greenhouse items tracked in inventory</p>';
        return;
    }
    
    // Group by urgency level
    let html = '';
    const groupedByUrgency = {};
    
    greenhouseData.forEach(item => {
        const label = item.urgency.label;
        if (!groupedByUrgency[label]) {
            groupedByUrgency[label] = [];
        }
        groupedByUrgency[label].push(item);
    });
    
    // Render each urgency group
    Object.keys(GREENHOUSE_URGENCY_LEVELS).forEach(key => {
        const level = GREENHOUSE_URGENCY_LEVELS[key];
        const items = groupedByUrgency[level.label];
        
        if (!items || items.length === 0) return;
        
        html += `<div class="greenhouse-group">`;
        html += `<h3>${level.label}</h3>`;
        
        items.forEach(item => {
            const stats = item.stats;
            
            html += `
                <div class="greenhouse-card">
                    <div class="greenhouse-name">
                        <span>${item.name}</span>
                        <div class="greenhouse-right">
                            ${item.toTop > 0 ? `<span class="${item.urgency.colorClass} greenhouse-to-top">↑${Math.floor(item.toTop)}</span>` : ''}
                            <span class="greenhouse-stock ${item.urgency.colorClass}">${Math.floor(stats.current)}</span>
                        </div>
                    </div>
                    <div class="greenhouse-info">
                        <span>Avg: ${Math.floor(stats.average)}</span>
                        <span class="greenhouse-max">Max: ${Math.floor(stats.max)}</span>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
    });
    
    container.innerHTML = html;
}
