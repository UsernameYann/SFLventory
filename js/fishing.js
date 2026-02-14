// ============================================================================
// FISHING - Seasonal fishing recommendations and thresholds
// ============================================================================

const FISH_URGENCY_LEVELS = {
    CRITICAL: { label: 'CRITICAL', colorClass: 'urgent-critical', order: 0 },
    VERY_HIGH: { label: 'VERY_HIGH', colorClass: 'urgent-very-high', order: 1 },
    HIGH: { label: 'HIGH', colorClass: 'urgent-high', order: 2 },
    MEDIUM: { label: 'MEDIUM', colorClass: 'urgent-medium', order: 3 },
    LOW: { label: 'LOW', colorClass: 'urgent-low', order: 4 },
    GOOD: { label: 'GOOD', colorClass: 'urgent-good', order: 5 }
};

function getFishUrgency(stock, minStock) {
    const percentage = (stock / minStock) * 100;
    
    if (stock < minStock * 0.25) return FISH_URGENCY_LEVELS.CRITICAL;
    if (stock < minStock * 0.50) return FISH_URGENCY_LEVELS.VERY_HIGH;
    if (stock < minStock * 0.75) return FISH_URGENCY_LEVELS.HIGH;
    if (stock < minStock) return FISH_URGENCY_LEVELS.MEDIUM;
    return FISH_URGENCY_LEVELS.GOOD;
}

const FISH_TIERS = ['BASIC', 'ADVANCED', 'EXPERT'];

const FISH_TIER_LABELS = {
    BASIC: 'Basic',
    ADVANCED: 'Advanced',
    EXPERT: 'Expert'
};

const FISH_TIER_BAIT = {
    BASIC: 'Earthworm',
    ADVANCED: 'Grub',
    EXPERT: 'Red Wiggler'
};

const FISH_DB = [
    { name: 'Anchovy', tier: 'BASIC', seasons: ['spring', 'summer', 'autumn', 'winter'], likes: ['Carrot', 'Egg'] },
    { name: 'Sea Bass', tier: 'BASIC', seasons: ['spring', 'autumn'], likes: ['Anchovy'] },
    { name: 'Sea Horse', tier: 'BASIC', seasons: ['spring', 'summer'], likes: ['Seaweed'] },
    { name: 'Halibut', tier: 'BASIC', seasons: ['spring', 'autumn'], likes: ['Anchovy'] },
    { name: 'Squid', tier: 'BASIC', seasons: ['spring', 'winter'], likes: ['Eggplant', 'Onion'] },
    { name: 'Porgy', tier: 'BASIC', seasons: ['spring'], likes: ['Yam'] },
    { name: 'Butterflyfish', tier: 'BASIC', seasons: ['summer', 'autumn'], likes: ['Sunflower'] },
    { name: 'Clownfish', tier: 'BASIC', seasons: ['summer', 'winter'], likes: ['Cabbage'] },
    { name: 'Horse Mackerel', tier: 'BASIC', seasons: ['summer', 'winter'], likes: ['Blueberry'] },
    { name: 'Muskellunge', tier: 'BASIC', seasons: ['autumn'], likes: ['Turnip'] },
    { name: 'Blowfish', tier: 'BASIC', seasons: ['winter'], likes: ['Yam'] },

    { name: 'Red Snapper', tier: 'ADVANCED', seasons: ['spring', 'summer', 'autumn', 'winter'], likes: ['Apple', 'Honey'] },
    { name: 'Olive Flounder', tier: 'ADVANCED', seasons: ['spring', 'autumn'], likes: ['Rhubarb'] },
    { name: 'Zebra Turkeyfish', tier: 'ADVANCED', seasons: ['spring', 'summer'], likes: ['Beetroot', 'Rhubarb'] },
    { name: 'Ray', tier: 'ADVANCED', seasons: ['spring', 'summer'], likes: ['Squid'] },
    { name: 'Barred Knifejaw', tier: 'ADVANCED', seasons: ['spring', 'summer'], likes: ['Anchovy'] },
    { name: 'Moray Eel', tier: 'ADVANCED', seasons: ['summer', 'autumn'], likes: ['Gold'] },
    { name: 'Napoleanfish', tier: 'ADVANCED', seasons: ['summer', 'autumn'], likes: ['Carrot'] },
    { name: 'Surgeonfish', tier: 'ADVANCED', seasons: ['summer', 'autumn'], likes: ['Orange'] },
    { name: 'Angelfish', tier: 'ADVANCED', seasons: ['summer', 'winter'], likes: ['Banana'] },
    { name: 'Hammerhead shark', tier: 'ADVANCED', seasons: ['summer', 'autumn'], likes: ['Iron'] },
    { name: 'Tilapia', tier: 'ADVANCED', seasons: ['summer'], likes: ['Zucchini'] },
    { name: 'Rock Blackfish', tier: 'ADVANCED', seasons: ['autumn'], likes: ['Onion'] },
    { name: 'Walleye', tier: 'ADVANCED', seasons: ['winter'], likes: ['Broccoli'] },

    { name: 'Tuna', tier: 'EXPERT', seasons: ['spring', 'summer', 'autumn', 'winter'], likes: ['Orange', 'Wild Mushroom'] },
    { name: 'Oarfish', tier: 'EXPERT', seasons: ['spring', 'winter'], likes: ['Kale'] },
    { name: 'Coelacanth', tier: 'EXPERT', seasons: ['spring', 'winter'], likes: ['Cabbage'] },
    { name: 'Parrotfish', tier: 'EXPERT', seasons: ['spring', 'summer'], likes: ['Seaweed'] },
    { name: 'Saw Shark', tier: 'EXPERT', seasons: ['spring', 'summer'], likes: ['Red Snapper', 'Speed Chicken'] },
    { name: 'Weakfish', tier: 'EXPERT', seasons: ['spring'], likes: ['Artichoke'] },
    { name: 'Mahi Mahi', tier: 'EXPERT', seasons: ['summer', 'autumn'], likes: ['Corn'] },
    { name: 'Blue Marlin', tier: 'EXPERT', seasons: ['summer', 'winter'], likes: ['Wheat'] },
    { name: 'Sunfish', tier: 'EXPERT', seasons: ['summer', 'autumn'], likes: ['Anchovy'] },
    { name: 'Whale Shark', tier: 'EXPERT', seasons: ['summer', 'winter'], likes: ['Crab', 'Fat Chicken'] },
    { name: 'White Shark', tier: 'EXPERT', seasons: ['summer', 'winter'], likes: ['Tuna', 'Rich Chicken'] },
    { name: 'Cobia', tier: 'EXPERT', seasons: ['summer'], likes: ['Broccoli'] },
    { name: 'Football fish', tier: 'EXPERT', seasons: ['winter'], likes: ['Sunflower'] },
    { name: 'Trout', tier: 'EXPERT', seasons: ['winter'], likes: ['Pepper'] }
];

const GUARANTEED_RESULTS = [
    { bait: 'Earthworm', chum: 'Carrot x10', result: 'Anchovy' },
    { bait: 'Earthworm', chum: 'Egg x5', result: 'Anchovy' },
    { bait: 'Grub', chum: 'Orange x3', result: 'Tuna' },
    { bait: 'Grub', chum: 'Wild Mushroom x1', result: 'Tuna' },
    { bait: 'Red Wiggler', chum: 'Apple x3', result: 'Red Snapper' },
    { bait: 'Red Wiggler', chum: 'Honey x1', result: 'Red Snapper' }
];

function getFishMinStock(name) {
    // Expert fish
    if (name === 'Tuna') return 30;
    if (['Saw Shark', 'Whale Shark', 'White Shark'].includes(name)) return 1;
    
    // Advanced fish
    if (name === 'Red Snapper') return 30;
    if (['Ray', 'Barred Knifejaw'].includes(name)) return 15;
    if (name === 'Hammerhead shark') return 5;
    
    // Check if it's an expert fish (not Tuna and not the sharks mentioned above)
    const fish = FISH_DB.find(f => f.name === name);
    if (fish && fish.tier === 'EXPERT') return 15;
    
    // Advanced fish default
    if (fish && fish.tier === 'ADVANCED') return 20;
    
    // Basic fish
    return name === 'Anchovy' ? 30 : 20;
}

function formatLikes(likes) {
    if (!likes || likes.length === 0) return '-';
    return likes.join(' / ');
}

function getSeasonLabel(season) {
    const name = season ? season[0].toUpperCase() + season.slice(1) : 'Winter';
    const emoji = SEASON_EMOJIS?.[season] || '';
    return `${emoji} ${name}`.trim();
}

function renderFishingPanel() {
    const container = document.getElementById('fishing-list');
    if (!container) return;

    const season = currentSeason || 'winter';
    const fishInSeason = FISH_DB.filter(f => f.seasons.includes(season));
    
    let lowFish = [];
    fishInSeason.forEach(fish => {
        const count = parseFloat(currentInventory?.[fish.name] || 0);
        const minStock = getFishMinStock(fish.name);
        if (count < minStock) {
            lowFish.push({
                name: fish.name,
                tier: fish.tier,
                count: count,
                minStock: minStock,
                needed: Math.max(0, minStock - Math.floor(count)),
                likes: fish.likes
            });
        }
    });

    lowFish.sort((a, b) => b.needed - a.needed);

    if (lowFish.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; font-size: 0.85rem; padding: 1rem 0;">✅ All fish sufficiently stocked</p>';
        return;
    }

    let html = '';
    FISH_TIERS.forEach(tier => {
        const tierFish = lowFish.filter(f => f.tier === tier);
        if (!tierFish.length) return;

        html += `<div class="fish-group">`;
        html += `<h3>${FISH_TIER_LABELS[tier]}</h3>`;

        tierFish.forEach(fish => {
            const bait = FISH_TIER_BAIT[fish.tier];
            const urgency = getFishUrgency(fish.count, fish.minStock);
            
            let fishHtml = `
                <div class="fish-card">
                    <div class="fish-name">
                        <span>${fish.name}</span>
                        <span class="fish-stock ${urgency.colorClass}">${Math.floor(fish.count)}/${fish.minStock}</span>
                    </div>
                    <div class="fish-info">
                        <span>${bait}</span>
                    </div>
                    <div class="fish-recipe">
            `;
            
            if (fish.likes && fish.likes.length > 0) {
                for (let like of fish.likes) {
                    const likeStock = parseInt(currentInventory?.[like] || 0);
                    const statusClass = likeStock > 0 ? 'recipe-status-good' : 'recipe-status-bad';
                    const statusText = likeStock > 0 ? '✓' : '⚠️';
                    fishHtml += `<div class="recipe-step"><span class="recipe-base">${like}</span><span class="${statusClass}">${statusText}</span></div>`;
                }
            }
            
            fishHtml += `
                    </div>
                </div>
            `;
            
            html += fishHtml;
        });

        html += `</div>`;
    });

    container.innerHTML = html;
}
