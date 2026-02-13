// ============================================================================
// FISHING - Seasonal fishing recommendations and thresholds
// ============================================================================

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
    return ['Red Snapper', 'Tuna', 'Anchovy'].includes(name) ? 30 : 20;
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
            
            let fishHtml = `
                <div class="fish-card">
                    <div class="fish-name">
                        <span>${fish.name}</span>
                        <span class="fish-stock">${Math.floor(fish.count)}/${fish.minStock}</span>
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
