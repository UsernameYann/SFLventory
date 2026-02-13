// ============================================================================
// STORAGE - All localStorage and persistence functions
// ============================================================================

// Wrapper to handle SES (Secure EcmaScript) restrictions
function safeSetData(key, value) {
    try {
        data[key] = value;
    } catch (e) {
        try {
            data = Object.assign({}, data, { [key]: value });
        } catch (e2) {
            console.error('Failed to set data even with Object.assign:', e2);
        }
    }
}

// Legend sorting state (persisted)
let legendSort = (() => {
    try {
        return JSON.parse(localStorage.getItem('legendSort')) || { col: 'name', dir: 'asc' };
    } catch {
        return { col: 'name', dir: 'asc' };
    }
})();

// Collapsed state for dynamic categories and Others (persisted)
let collapsedCats = (() => {
    try {
        return JSON.parse(localStorage.getItem('collapsedCats')) || {};
    } catch {
        return {};
    }
})();

// Selected items persistence
const SELECTED_KEY = 'sflv:selected';
function loadSelected() {
    try {
        const arr = JSON.parse(localStorage.getItem(SELECTED_KEY));
        if (Array.isArray(arr)) {
            selected = arr.filter(v => typeof v === 'string');
        }
    } catch {}
}
function saveSelected() {
    try { localStorage.setItem(SELECTED_KEY, JSON.stringify(selected)); } catch {}
}

// Custom Paths persistence
const CUSTOM_PATHS_KEY = 'sflv:customPaths';
window.customPathData = {};
function loadCustomPathData() {
    try {
        const data = JSON.parse(localStorage.getItem(CUSTOM_PATHS_KEY));
        if (data && typeof data === 'object') {
            window.customPathData = data;
            return true;
        }
    } catch {}
    return false;
}
function saveCustomPathData() {
    try {
        localStorage.setItem(CUSTOM_PATHS_KEY, JSON.stringify(window.customPathData || {}));
    } catch {}
}

// Favorites persistence
const FAVORITES_KEY = 'sflv:favorites';
let favorites = [];
function loadFavorites() {
    try {
        const arr = JSON.parse(localStorage.getItem(FAVORITES_KEY));
        if (Array.isArray(arr)) {
            favorites = arr.filter(v => typeof v === 'string');
        }
    } catch {}
}
function saveFavorites() {
    try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)); } catch {}
}
function toggleFavorite(itemValue) {
    const idx = favorites.indexOf(itemValue);
    if (idx > -1) {
        favorites.splice(idx, 1);
    } else {
        favorites.push(itemValue);
    }
    saveFavorites();
    render();
}

// Category collapse state
function isCollapsibleCategory(key) {
    return key === 'Other' || (typeof key === 'string' && key.startsWith('dyn:'));
}

function isCollapsed(key) {
    if (!isCollapsibleCategory(key)) return false;
    if (collapsedCats[key] == null) return true;
    return !!collapsedCats[key];
}

function setCollapsed(key, val) {
    collapsedCats[key] = !!val;
    try { localStorage.setItem('collapsedCats', JSON.stringify(collapsedCats)); } catch {}
}

// Simple localStorage cache for daily JSON
const CACHE_PREFIX = 'sflv:';
const CACHE_INDEX_KEY = 'sflv:keys';
const CACHE_MAX_KEYS = 120;

function getCachedDate(dateKey) {
    try {
        const raw = localStorage.getItem(CACHE_PREFIX + dateKey);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function setCachedDate(dateKey, obj) {
    try {
        localStorage.setItem(CACHE_PREFIX + dateKey, JSON.stringify(obj));
        let idx = [];
        try { idx = JSON.parse(localStorage.getItem(CACHE_INDEX_KEY)) || []; } catch { idx = []; }
        if (!idx.includes(dateKey)) {
            idx.push(dateKey);
        }
        while (idx.length > CACHE_MAX_KEYS) {
            const oldest = idx.shift();
            localStorage.removeItem(CACHE_PREFIX + oldest);
        }
        localStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(idx));
    } catch {}
}

// Load persisted data on module load
loadSelected();
loadCustomPathData();
loadFavorites();
