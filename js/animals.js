// ============================================================================
// ANIMALS - Animal products production tracking with statistical analysis
// ============================================================================

const ANIMALS_ITEMS = ['Egg', 'Honey', 'Leather', 'Wool', 'Merino Wool', 'Feather', 'Milk'];

const ANIMALS_URGENCY_LEVELS = {
    CRITICAL: { label: 'CRITICAL', colorClass: 'urgent-critical', order: 0 },
    VERY_HIGH: { label: 'VERY_HIGH', colorClass: 'urgent-very-high', order: 1 },
    HIGH: { label: 'HIGH', colorClass: 'urgent-high', order: 2 },
    MEDIUM: { label: 'MEDIUM', colorClass: 'urgent-medium', order: 3 },
    LOW: { label: 'LOW', colorClass: 'urgent-low', order: 4 },
    GOOD: { label: 'GOOD', colorClass: 'urgent-good', order: 5 }
};

function getAnimalLimit(animalName) {
    if (animalName === 'Wool') return 500;
    if (animalName === 'Merino Wool') return 1000;
    if (animalName === 'Feather') return 1000;
    return 0; // No custom limit for others (use rolling max)
}

function calculateAnimalStats(animalName, days = 30) {
    if (!data || typeof data !== 'object') return { current: 0, average: 0, max: 0, gap: 0 };

    const dates = Object.keys(data).sort();
    const recentDates = dates.slice(Math.max(0, dates.length - days));

    let total = 0;
    let maxValue = 0;
    let currentValue = 0;

    recentDates.forEach((date, index) => {
        const inventory = data[date]?.farm?.inventory || {};
        const value = parseFloat(inventory[animalName] || 0);
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

function getAnimalUrgencyLevel(stats, limit) {
    const { current } = stats;
    const percentage = (current / limit) * 100;
    
    if (current < limit * 0.25) return ANIMALS_URGENCY_LEVELS.CRITICAL;
    if (current < limit * 0.50) return ANIMALS_URGENCY_LEVELS.VERY_HIGH;
    if (current < limit * 0.75) return ANIMALS_URGENCY_LEVELS.HIGH;
    if (current < limit) return ANIMALS_URGENCY_LEVELS.MEDIUM;
    return ANIMALS_URGENCY_LEVELS.GOOD;
}

function renderAnimalsPanel() {
    const container = document.getElementById('animals-list');
    if (!container) return;

    let animalsData = [];

    ANIMALS_ITEMS.forEach(animalName => {
        const stats = calculateAnimalStats(animalName, 30);
        const customLimit = getAnimalLimit(animalName);
        
        // Use custom limit if exists, otherwise use rolling max
        const limit = customLimit > 0 ? customLimit : stats.max;
        const urgency = getAnimalUrgencyLevel(stats, limit);
        const gap = limit - stats.average;
        const percentToMax = gap > 0 ? ((stats.current - stats.average) / gap) * 100 : 100;

        animalsData.push({
            name: animalName,
            current: stats.current,
            average: stats.average,
            max: limit,
            urgency: urgency,
            percentToMax: Math.max(0, percentToMax)
        });
    });

    // Group by urgency
    const grouped = {};
    Object.values(ANIMALS_URGENCY_LEVELS).forEach(level => {
        if (level) {
            grouped[level.label] = animalsData.filter(a => a.urgency.label === level.label);
        }
    });

    // Sort each group by percentToMax ascending
    Object.keys(grouped).forEach(urgencyLabel => {
        grouped[urgencyLabel].sort((a, b) => a.percentToMax - b.percentToMax);
    });

    let html = '';

    Object.entries(ANIMALS_URGENCY_LEVELS).forEach(([key, level]) => {
        const items = grouped[level.label] || [];
        if (items.length === 0) return;

        html += `<div class="animal-group">`;
        html += `<h3>${level.label}</h3>`;

        items.forEach(animal => {
            const toTop = animal.max - animal.current;
            const toTopDisplay = toTop > 0 ? `<span class="animal-to-top ${animal.urgency.colorClass}">↑${toTop}</span>` : '';
            html += `
                <div class="animal-card">
                    <div class="animal-name">
                        <span>${animal.name}</span>
                        <span class="animal-right">
                            ${toTopDisplay}
                            <span class="animal-stock ${animal.urgency.colorClass}">${animal.current}</span>
                        </span>
                    </div>
                    <div class="animal-info">
                        <span class="animal-avg">Avg: ${animal.average}</span>
                        <span class="animal-max">Max: ${animal.max}</span>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
    });

    container.innerHTML = html;
}
