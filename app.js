// ============================================================================
// MAIN APP - Global state, core functions (init, load, loadRange)
// ============================================================================

// Global state variables
let data = {};
let items = [];
let selected = [];
let searchTerm = '';
let currentPeriodDays = 30;
let currentInventory = {};
let currentSeason = 'winter';
let activeDates = [];
// favorites, legendSort, collapsedCats are declared and initialized in storage.js
window.customPathData = null;
let availableDatesGlobal = [];

// Update season display in header
function updateSeasonDisplay() {
    const seasonDisplay = document.getElementById('season-display');
    if (seasonDisplay) {
        const emoji = SEASON_EMOJIS?.[currentSeason] || '❄️';
        seasonDisplay.textContent = emoji;
        seasonDisplay.title = currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1);
    }
}

// Initialize app - load initial data
async function init() {
    showLoader();
    
    try {
        // Try fetching info.json with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const infoResponse = await fetch(BASE + 'info.json', { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!infoResponse.ok) {
            throw new Error(`HTTP ${infoResponse.status}: ${infoResponse.statusText}`);
        }
        
        const info = await infoResponse.json();
        availableDatesGlobal = info.available_dates || [];
        
        await load(30, availableDatesGlobal);
        
    } catch (err) {
        console.error('CRITICAL ERROR in init:', err);
        const loaderText = document.getElementById('loader-text');
        if (loaderText) {
            loaderText.textContent = 'Error: ' + err.message;
        }
        
        // Fallback: try loading from newapi.json locally
        try {
            const localData = await fetch('newapi.json').then(r => r.json());
            const today = new Date().toISOString().split('T')[0];
            safeSetData(today, localData);
            availableDatesGlobal = [today];
            await load(1, availableDatesGlobal);
        } catch (fallbackErr) {
            console.error('Fallback also failed:', fallbackErr);
            if (loaderText) {
                loaderText.textContent = 'Failed to load data. Check console.';
            }
            return;
        }
    }
    
    hideLoader();
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    }
    
    themeToggle.onclick = () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        themeToggle.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    };
    
    // Update season display
    updateSeasonDisplay();
    
    // Préparer le custom range
    const periodSel = document.getElementById('period');
    const customBox = document.getElementById('custom-range');
    const startInput = document.getElementById('start-date');
    const endInput = document.getElementById('end-date');
    const applyBtn = document.getElementById('apply-range');

    const sorted = [...availableDatesGlobal].sort();
    const minDate = sorted[0];
    const maxDate = sorted[sorted.length - 1];
    if (startInput && endInput) {
        startInput.min = minDate;
        startInput.max = maxDate;
        endInput.min = minDate;
        endInput.max = maxDate;
        // Valeurs par défaut: derniers 30 jours
        const defEnd = maxDate;
        const d = new Date(defEnd);
        d.setDate(d.getDate() - 30);
        const defStart = d.toISOString().slice(0,10);
        startInput.value = defStart;
        endInput.value = defEnd;
    }

    periodSel.onchange = async e => {
        const val = e.target.value;
        if (val === 'custom') {
            customBox.style.display = 'inline-flex';
            return;
        } else {
            customBox.style.display = 'none';
        }
        showLoader();
        await load(+val, availableDatesGlobal);
        hideLoader();
    };

    applyBtn.onclick = async () => {
        const s = startInput.value;
        const e = endInput.value;
        if (!s || !e) return;
        const start = s < minDate ? minDate : s;
        const end = e > maxDate ? maxDate : e;
        if (start > end) {
            showLoader();
            await loadRange(end, start, availableDatesGlobal);
            hideLoader();
        } else {
            showLoader();
            await loadRange(start, end, availableDatesGlobal);
            hideLoader();
        }
    };
    
    document.getElementById('search').oninput = e => {
        searchTerm = e.target.value.toLowerCase();
        render();
    };

    setupRightSidebarTabs();
}

function setupRightSidebarTabs() {
    const tabs = Array.from(document.querySelectorAll('.right-tab'));
    const panels = Array.from(document.querySelectorAll('.right-panel'));
    if (!tabs.length || !panels.length) return;

    const activateTab = (tab) => {
        const targetId = tab.getAttribute('aria-controls');
        const targetPanel = targetId ? document.getElementById(targetId) : null;

        tabs.forEach(t => {
            const isActive = t === tab;
            t.classList.toggle('active', isActive);
            t.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        panels.forEach(panel => {
            panel.classList.toggle('active', panel === targetPanel);
        });
    };

    tabs.forEach(tab => {
        tab.onclick = () => activateTab(tab);
    });
}

// Load data for specific period (days)
async function load(days, dates) {
    currentPeriodDays = days;
    const end = [...dates].sort().reverse()[0];
    const start = new Date(end);
    start.setDate(start.getDate() - days);
    const startStr = start.toISOString().slice(0, 10);
    const targetDates = dates.filter(x => x >= startStr && x <= end);
    activeDates = targetDates;
    
    // Charger uniquement les dates qui ne sont pas déjà en cache
    for (const d of targetDates) {
        if (!data[d]) {
            const cached = getCachedDate(d);
            if (cached) {
                safeSetData(d, cached);
                continue;
            }
            try {
                const json = await fetch(BASE + d + '.json').then(r => {
                    if (!r.ok) throw new Error(`HTTP ${r.status}`);
                    return r.json();
                });
                safeSetData(d, json);
                setCachedDate(d, json);
            } catch (err) {
                console.error('Failed to load ' + d + ':', err.message);
            }
        }
    }
    
    // Récupérer tous les items disponibles dans les données de la période
    const allAvailable = new Set();
    const farmActivitySet = new Set();
    const bumpkinActivitySet = new Set();
    let hasTaxFreeSFL = false, hasExperience = false, hasSocialFarmingPoints = false;
    targetDates.forEach(d => {
        if (!data[d]) return;
        [...Object.keys(data[d].farm?.inventory || {}), 'coins', 'FLOWER'].forEach(item => allAvailable.add(item));
        Object.keys(data[d].farm?.farmActivity || {}).forEach(k => farmActivitySet.add(k));
        Object.keys(data[d].farm?.bumpkin?.activity || {}).forEach(k => bumpkinActivitySet.add(k));
        if (data[d].farm?.bank?.taxFreeSFL != null) hasTaxFreeSFL = true;
        if ((data[d].farm?.bumpkin?.experience != null)) hasExperience = true;
        if (data[d].farm?.socialFarming?.points != null) hasSocialFarmingPoints = true;
    });

    // Organiser les items par catégories
    items = [];
    CATEGORY_ORDER.forEach(catKey => {
        const category = CATEGORIES[catKey];
        const categoryItems = category.items.filter(item => allAvailable.has(item));
        if (categoryItems.length > 0) {
            items.push({ type: 'category', name: category.name, key: catKey, items: categoryItems });
            categoryItems.forEach(item => items.push({ type: 'item', name: item }));
        }
    });

    // Ajouter les items non catégorisés dans "Others"
    const categorized = new Set(CATEGORY_ORDER.flatMap(k => CATEGORIES[k].items));
    const uncategorized = [...allAvailable].filter(item => !categorized.has(item)).sort();
    if (uncategorized.length > 0) {
        items.push({ type: 'category', name: 'Others', key: 'Other', items: uncategorized });
        uncategorized.forEach(item => items.push({ type: 'item', name: item }));
    }

    // Catégories dynamiques
    const makeDynId = (src, n) => `${src}::${n}`;
    const farmActItems = [...farmActivitySet].sort();
    if (farmActItems.length) {
        const ids = farmActItems.map(n => makeDynId('farmActivity', n));
        items.push({ type: 'category', name: 'Farm Activity', key: 'dyn:farmActivity', items: ids });
        farmActItems.forEach(name => items.push({ type: 'item', name, id: makeDynId('farmActivity', name) }));
    }
    if (bumpkinActivitySet.size) {
        const bumpAct = [...bumpkinActivitySet].sort();
        const ids = bumpAct.map(n => makeDynId('bumpkinActivity', n));
        items.push({ type: 'category', name: 'Bumpkin Activity', key: 'dyn:bumpkinActivity', items: ids });
        bumpAct.forEach(name => items.push({ type: 'item', name, id: makeDynId('bumpkinActivity', name) }));
    }
    if (hasTaxFreeSFL) {
        const id = 'bank::Tax Free SFL';
        items.push({ type: 'category', name: 'Bank', key: 'dyn:bank', items: [id] });
        items.push({ type: 'item', name: 'Tax Free SFL', id });
    }
    if (hasExperience) {
        const id = 'bumpkin::Experience';
        items.push({ type: 'category', name: 'Bumpkin', key: 'dyn:bumpkin', items: [id] });
        items.push({ type: 'item', name: 'Experience', id });
    }
    if (hasSocialFarmingPoints) {
        const id = 'socialFarming::Points';
        items.push({ type: 'category', name: 'Social Farming', key: 'dyn:socialFarming', items: [id] });
        items.push({ type: 'item', name: 'Points', id });
    }
    
    // Load custom paths from localStorage and add them to items
    loadCustomPathData();
    // Recalculate custom paths for the current period
    refreshCustomPathsForPeriod(targetDates);
    if (window.customPathData && Object.keys(window.customPathData).length > 0) {
        const customCatKey = 'dyn:customPaths';
        let customCat = items.find(i => i.type === 'category' && i.key === customCatKey);
        if (!customCat) {
            customCat = { type: 'category', name: 'Custom Paths', key: customCatKey, items: [] };
            items.push(customCat);
        }
        for (const pathName of Object.keys(window.customPathData).sort()) {
            if (!customCat.items.includes(pathName)) {
                customCat.items.push(pathName);
                items.push({ type: 'item', id: pathName, name: pathName });
            }
        }
    }
    
    // Remove items from selected if they don't exist anymore
    const existingIds = items.filter(i => i.type === 'item').map(i => i.id || i.name);
    selected = selected.filter(id => existingIds.includes(id));
    saveSelected();
    
    // Update current inventory and season from latest date
    if (targetDates.length > 0) {
        const latestDate = targetDates[targetDates.length - 1];
        if (data[latestDate]?.farm?.inventory) {
            currentInventory = data[latestDate].farm.inventory;
        }
        const farmData = data[latestDate]?.farm;
        currentSeason = farmData?.season?.season || farmData?.season || "winter";        updateSeasonDisplay();        updateSeasonDisplay();
    }
    
    render();
    renderFlowersList();
    renderFishingPanel();
    renderFoodPanel();
}

// Load data for custom date range
async function loadRange(startStr, endStr, dates) {
    currentPeriodDays = null;
    const targetDates = dates.filter(x => x >= startStr && x <= endStr).sort();
    activeDates = targetDates;

    for (const d of targetDates) {
        if (!data[d]) {
            const cached = getCachedDate(d);
            if (cached) {
                safeSetData(d, cached);
                continue;
            }
            try {
                const json = await fetch(BASE + d + '.json').then(r => {
                    if (!r.ok) throw new Error(`HTTP ${r.status}`);
                    return r.json();
                });
                safeSetData(d, json);
                setCachedDate(d, json);
            } catch (err) {
                console.error('Failed to load ' + d + ':', err.message);
            }
        }
    }

    // reconstruire items comme dans load()
    const allAvailable = new Set();
    const farmActivitySet = new Set();
    const bumpkinActivitySet = new Set();
    let hasTaxFreeSFL = false, hasExperience = false, hasSocialFarmingPoints = false;
    targetDates.forEach(d => {
        if (!data[d]) return;
        [...Object.keys(data[d].farm?.inventory || {}), 'coins', 'FLOWER'].forEach(item => allAvailable.add(item));
        Object.keys(data[d].farm?.farmActivity || {}).forEach(k => farmActivitySet.add(k));
        Object.keys(data[d].farm?.bumpkin?.activity || {}).forEach(k => bumpkinActivitySet.add(k));
        if (data[d].farm?.bank?.taxFreeSFL != null) hasTaxFreeSFL = true;
        if (data[d].farm?.bumpkin?.experience != null) hasExperience = true;
        if (data[d].farm?.socialFarming?.points != null) hasSocialFarmingPoints = true;
    });

    items = [];
    CATEGORY_ORDER.forEach(catKey => {
        const category = CATEGORIES[catKey];
        const categoryItems = category.items.filter(item => allAvailable.has(item));
        if (categoryItems.length > 0) {
            items.push({ type: 'category', name: category.name, key: catKey, items: categoryItems });
            categoryItems.forEach(item => items.push({ type: 'item', name: item }));
        }
    });
    const categorized = new Set(CATEGORY_ORDER.flatMap(k => CATEGORIES[k].items));
    const uncategorized = [...allAvailable].filter(item => !categorized.has(item)).sort();
    if (uncategorized.length > 0) {
        items.push({ type: 'category', name: 'Others', key: 'Other', items: uncategorized });
        uncategorized.forEach(item => items.push({ type: 'item', name: item }));
    }
    const makeDynId = (src, n) => `${src}::${n}`;
    const farmActItems = [...farmActivitySet].sort();
    if (farmActItems.length) {
        const ids = farmActItems.map(n => makeDynId('farmActivity', n));
        items.push({ type: 'category', name: 'Farm Activity', key: 'dyn:farmActivity', items: ids });
        farmActItems.forEach(name => items.push({ type: 'item', name, id: makeDynId('farmActivity', name) }));
    }
    if (bumpkinActivitySet.size) {
        const bumpAct = [...bumpkinActivitySet].sort();
        const ids = bumpAct.map(n => makeDynId('bumpkinActivity', n));
        items.push({ type: 'category', name: 'Bumpkin Activity', key: 'dyn:bumpkinActivity', items: ids });
        bumpAct.forEach(name => items.push({ type: 'item', name, id: makeDynId('bumpkinActivity', name) }));
    }
    if (hasTaxFreeSFL) {
        const id = 'bank::Tax Free SFL';
        items.push({ type: 'category', name: 'Bank', key: 'dyn:bank', items: [id] });
        items.push({ type: 'item', name: 'Tax Free SFL', id });
    }
    if (hasExperience) {
        const id = 'bumpkin::Experience';
        items.push({ type: 'category', name: 'Bumpkin', key: 'dyn:bumpkin', items: [id] });
        items.push({ type: 'item', name: 'Experience', id });
    }
    if (hasSocialFarmingPoints) {
        const id = 'socialFarming::Points';
        items.push({ type: 'category', name: 'Social Farming', key: 'dyn:socialFarming', items: [id] });
        items.push({ type: 'item', name: 'Points', id });
    }
    
    // Load custom paths and add them to items
    if (window.customPathData && Object.keys(window.customPathData).length > 0) {
        const customCatKey = 'dyn:customPaths';
        let customCat = items.find(i => i.type === 'category' && i.key === customCatKey);
        if (!customCat) {
            customCat = { type: 'category', name: 'Custom Paths', key: customCatKey, items: [] };
            items.push(customCat);
        }
        for (const pathName of Object.keys(window.customPathData).sort()) {
            if (!customCat.items.includes(pathName)) {
                customCat.items.push(pathName);
                items.push({ type: 'item', id: pathName, name: pathName });
            }
        }
    }
    
    // Remove items from selected if they don't exist anymore
    const existingIds = items.filter(i => i.type === 'item').map(i => i.id || i.name);
    selected = selected.filter(id => existingIds.includes(id));
    saveSelected();

    // Update current inventory and season from latest date
    if (targetDates.length > 0) {
        const latestDate = targetDates[targetDates.length - 1];
        if (data[latestDate]?.farm?.inventory) {
            currentInventory = data[latestDate].farm.inventory;
        }
        const farmData = data[latestDate]?.farm;
        currentSeason = farmData?.season?.season || farmData?.season || "winter";
    }

    render();
    renderFlowersList();
    renderFishingPanel();
    renderFoodPanel();
}

// Custom path event listeners
document.getElementById('custom-path-load')?.addEventListener('click', loadCustomPath);
document.getElementById('custom-path-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loadCustomPath();
});

// Start the app
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
