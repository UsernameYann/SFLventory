// ============================================================================
// COMPOSTERS - Composter products production tracking with statistical analysis
// ============================================================================

const COMPOSTERS_ITEMS = ['Sprout Mix', 'Fruitful Blend', 'Rapid Root', 'Earthworm', 'Grub', 'Red Wiggler'];

const COMPOSTERS_URGENCY_LEVELS = {
    CRITICAL: { label: 'CRITICAL', colorClass: 'urgent-critical', order: 0 },
    VERY_HIGH: { label: 'VERY_HIGH', colorClass: 'urgent-very-high', order: 1 },
    HIGH: { label: 'HIGH', colorClass: 'urgent-high', order: 2 },
    MEDIUM: { label: 'MEDIUM', colorClass: 'urgent-medium', order: 3 },
    LOW: { label: 'LOW', colorClass: 'urgent-low', order: 4 },
    GOOD: { label: 'GOOD', colorClass: 'urgent-good', order: 5 }
};

function calculateComposterStats(composterName, days = 30) {
    if (!data || typeof data !== 'object') return { current: 0, average: 0, max: 0, gap: 0 };

    const dates = Object.keys(data).sort();
    const recentDates = dates.slice(Math.max(0, dates.length - days));

    let total = 0;
    let maxValue = 0;
    let currentValue = 0;

    recentDates.forEach((date, index) => {
        const inventory = data[date]?.farm?.inventory || {};
        const value = parseFloat(inventory[composterName] || 0);
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

function getComposterUrgencyLevel(stats) {
    const { current, average, max } = stats;

    if (current < average) return COMPOSTERS_URGENCY_LEVELS.CRITICAL;
    
    const gap = max - average;
    const percentToMax = gap > 0 ? ((current - average) / gap) * 100 : 100;

    if (percentToMax < 25) return COMPOSTERS_URGENCY_LEVELS.VERY_HIGH;
    if (percentToMax < 50) return COMPOSTERS_URGENCY_LEVELS.HIGH;
    if (percentToMax < 75) return COMPOSTERS_URGENCY_LEVELS.MEDIUM;
    if (percentToMax < 100) return COMPOSTERS_URGENCY_LEVELS.LOW;
    return COMPOSTERS_URGENCY_LEVELS.GOOD;
}

function renderCompostersPanel() {
    const container = document.getElementById('composters-list');
    if (!container) return;

    let compostersData = [];

    COMPOSTERS_ITEMS.forEach(composterName => {
        const stats = calculateComposterStats(composterName, 30);
        const urgency = getComposterUrgencyLevel(stats);
        const gap = stats.max - stats.average;
        const percentToMax = gap > 0 ? ((stats.current - stats.average) / gap) * 100 : 100;

        compostersData.push({
            name: composterName,
            ...stats,
            urgency: urgency,
            percentToMax: Math.max(0, percentToMax)
        });
    });

    // Group by urgency
    const grouped = {};
    Object.values(COMPOSTERS_URGENCY_LEVELS).forEach(level => {
        if (level) {
            grouped[level.label] = compostersData.filter(c => c.urgency.label === level.label);
        }
    });

    // Sort each group by percentToMax ascending
    Object.keys(grouped).forEach(urgencyLabel => {
        grouped[urgencyLabel].sort((a, b) => a.percentToMax - b.percentToMax);
    });

    let html = '';

    Object.entries(COMPOSTERS_URGENCY_LEVELS).forEach(([key, level]) => {
        const items = grouped[level.label] || [];
        if (items.length === 0) return;

        html += `<div class="composter-group">`;
        html += `<h3>${level.label}</h3>`;

        items.forEach(composter => {
            const toTop = composter.max - composter.current;
            const toTopDisplay = toTop > 0 ? `<span class="composter-to-top ${composter.urgency.colorClass}">↑${toTop}</span>` : '';
            html += `
                <div class="composter-card">
                    <div class="composter-name">
                        <span>${composter.name}</span>
                        <span class="composter-right">
                            ${toTopDisplay}
                            <span class="composter-stock ${composter.urgency.colorClass}">${composter.current}</span>
                        </span>
                    </div>
                    <div class="composter-info">
                        <span class="composter-avg">Avg: ${composter.average}</span>
                        <span class="composter-max">Max: ${composter.max}</span>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
    });

    container.innerHTML = html;
}
