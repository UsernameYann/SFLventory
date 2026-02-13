// ============================================================================
// CUSTOM PATHS - Custom JSON path parsing and loading
// ============================================================================

function getValueFromPath(obj, path) {
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
        if (current && typeof current === 'object') {
            current = current[key];
        } else {
            return undefined;
        }
    }
    return current;
}

function isNumericValue(val) {
    if (typeof val === 'number') return true;
    if (typeof val === 'string' && val.trim() !== '') {
        return !isNaN(parseFloat(val));
    }
    return false;
}

function toNumber(val) {
    return typeof val === 'number' ? val : parseFloat(val);
}

function getAllValuesFromPath(obj, pathStr) {
    const wildcard = pathStr.includes('*');
    if (!wildcard) {
        const val = getValueFromPath(obj, pathStr);
        // Retourner undefined si valeur n'existe pas, pas 0
        if (val === undefined || val === null) return undefined;
        return isNumericValue(val) ? toNumber(val) : undefined;
    }
    const parts = pathStr.split('.');
    const wildcardIdx = parts.findIndex(p => p === '*');
    
    function traverse(current, idx) {
        if (idx === wildcardIdx) {
            if (!current || typeof current !== 'object') return [];
            const results = [];
            const childParts = parts.slice(idx + 1);
            for (const key in current) {
                if (childParts.length === 0) {
                    if (isNumericValue(current[key])) {
                        results.push(toNumber(current[key]));
                    }
                } else {
                    const childVal = getValueFromPath(current[key], childParts.join('.'));
                    if (isNumericValue(childVal)) {
                        results.push(toNumber(childVal));
                    }
                }
            }
            return results;
        } else if (idx < wildcardIdx) {
            const key = parts[idx];
            return traverse(current?.[key], idx + 1);
        }
        return [];
    }
    
    const values = traverse(obj, 0);
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) : undefined;
}

function getHistoricalValuesFromPath(pathStr) {
    if (!data || typeof data !== 'object') return {};
    
    const result = {};
    for (const dateStr in data) {
        const val = getAllValuesFromPath(data[dateStr], pathStr);
        // Ajouter seulement si la valeur existe et est numérique
        if (val !== undefined && val !== null && isNumericValue(val)) {
            result[dateStr] = toNumber(val);
        }
    }
    return result;
}

function loadCustomPath() {
    const input = document.getElementById('custom-path-input');
    if (!input || !input.value.trim()) return;
    
    const pathStr = input.value.trim();
    const customData = getHistoricalValuesFromPath(pathStr);
    
    if (Object.keys(customData).length === 0) return;
    
    const customId = window.customPathData ? Object.keys(window.customPathData).length + 1 : 1;
    const pathKey = `Custom: ${pathStr}`;
    
    if (!window.customPathData) {
        window.customPathData = {};
    }
    
    window.customPathData[pathKey] = Object.entries(customData).map(([date, value]) => ({
        date: date,
        value: value
    }));
    
    saveCustomPathData();
    
    // Add to selected
    if (!selected.includes(pathKey)) {
        selected.push(pathKey);
    }
    saveSelected();
    
    input.value = '';
    activeDates = Object.keys(data).filter(d => data[d]);
    load(activeDates.length, activeDates);
}
