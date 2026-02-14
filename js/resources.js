// ============================================================================
// RESOURCES - Resource production tracking with statistical analysis
// ============================================================================

const RESOURCES_ITEMS = ['Wood', 'Stone', 'Iron', 'Gold', 'Crimstone', 'Sunstone', 'Oil'];

const RESOURCES_URGENCY_LEVELS = {
    CRITICAL: { label: 'CRITICAL', colorClass: 'urgent-critical', order: 0 },
    VERY_HIGH: { label: 'VERY_HIGH', colorClass: 'urgent-very-high', order: 1 },
    HIGH: { label: 'HIGH', colorClass: 'urgent-high', order: 2 },
    MEDIUM: { label: 'MEDIUM', colorClass: 'urgent-medium', order: 3 },
    LOW: { label: 'LOW', colorClass: 'urgent-low', order: 4 },
    GOOD: { label: 'GOOD', colorClass: 'urgent-good', order: 5 }
};

function calculateResourceStats(resourceName, days = 30) {
    if (!data || typeof data !== 'object') return { current: 0, average: 0, max: 0, gap: 0 };

    const dates = Object.keys(data).sort();
    const recentDates = dates.slice(Math.max(0, dates.length - days));

    let total = 0;
    let maxValue = 0;
    let currentValue = 0;

    recentDates.forEach((date, index) => {
        const inventory = data[date]?.farm?.inventory || {};
        const value = parseFloat(inventory[resourceName] || 0);
        total += value;
        if (value > maxValue) maxValue = value;
        if (index === recentDates.length - 1) currentValue = value;
    });

    const average = recentDates.length > 0 ? total / recentDates.length : 0;
    const gap = maxValue - average;

    return {
        current: Math.floor(currentValue),
        average: Math.floor(average),
        max: Math.floor(maxValue),
        gap: Math.floor(gap)
    };
}

function getResourceUrgencyLevel(stats) {
    const { current, average, max } = stats;

    if (current < average) return RESOURCES_URGENCY_LEVELS.CRITICAL;
    
    const gap = max - average;
    const percentToMax = gap > 0 ? ((current - average) / gap) * 100 : 100;

    if (percentToMax < 25) return RESOURCES_URGENCY_LEVELS.VERY_HIGH;
    if (percentToMax < 50) return RESOURCES_URGENCY_LEVELS.HIGH;
    if (percentToMax < 75) return RESOURCES_URGENCY_LEVELS.MEDIUM;
    if (percentToMax < 100) return RESOURCES_URGENCY_LEVELS.LOW;
    return RESOURCES_URGENCY_LEVELS.GOOD;
}

function renderResourcesPanel() {
    const container = document.getElementById('resources-list');
    if (!container) return;

    let resourcesData = [];

    RESOURCES_ITEMS.forEach(resourceName => {
        const stats = calculateResourceStats(resourceName, 30);
        const urgency = getResourceUrgencyLevel(stats);
        const gap = stats.max - stats.average;
        const percentToMax = gap > 0 ? ((stats.current - stats.average) / gap) * 100 : 100;

        resourcesData.push({
            name: resourceName,
            ...stats,
            urgency: urgency,
            percentToMax: Math.max(0, percentToMax)
        });
    });

    // Group by urgency
    const grouped = {};
    Object.values(RESOURCES_URGENCY_LEVELS).forEach(level => {
        if (level) {
            grouped[level.label] = resourcesData.filter(r => r.urgency.label === level.label);
        }
    });

    // Sort each group by percentToMax ascending
    Object.keys(grouped).forEach(urgencyLabel => {
        grouped[urgencyLabel].sort((a, b) => a.percentToMax - b.percentToMax);
    });

    let html = '';

    Object.entries(RESOURCES_URGENCY_LEVELS).forEach(([key, level]) => {
        const items = grouped[level.label] || [];
        if (items.length === 0) return;

        html += `<div class="resource-group">`;
        html += `<h3>${level.label}</h3>`;

        items.forEach(resource => {
            const toTop = resource.max - resource.current;
            const toTopDisplay = toTop > 0 ? `<span class="resource-to-top ${resource.urgency.colorClass}">↑${toTop}</span>` : '';
            html += `
                <div class="resource-card">
                    <div class="resource-name">
                        <span>${resource.name}</span>
                        <span class="resource-right">
                            ${toTopDisplay}
                            <span class="resource-stock ${resource.urgency.colorClass}">${resource.current}</span>
                        </span>
                    </div>
                    <div class="resource-info">
                        <span class="resource-avg">Avg: ${resource.average}</span>
                        <span class="resource-max">Max: ${resource.max}</span>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
    });

    container.innerHTML = html;
}
