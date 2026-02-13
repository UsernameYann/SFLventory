// ============================================================================
// UTILS - General purpose utility functions
// ============================================================================

function get(d, item) {
    if (typeof item === 'string' && item.includes('::')) {
        const [src, name] = item.split('::');
        switch (src) {
            case 'farmActivity':
                return parseFloat(d.farm?.farmActivity?.[name]) || 0;
            case 'bank':
                if (name === 'Tax Free SFL') {
                    const v = d.farm?.bank?.taxFreeSFL ?? d.farm?.taxFreeSFL ?? d.taxFreeSFL;
                    return parseFloat(v) || 0;
                }
                return 0;
            case 'bumpkinActivity':
                return parseFloat(d.farm?.bumpkin?.activity?.[name]) || 0;
            case 'bumpkin':
                if (name === 'Experience') {
                    const v = d.farm?.bumpkin?.experience ?? d.farm?.experience ?? d.experience;
                    return parseFloat(v) || 0;
                }
                return 0;
            case 'socialFarming':
                if (name === 'Points') {
                    return parseFloat(d.farm?.socialFarming?.points) || 0;
                }
                return 0;
            default:
                item = name;
        }
    }
    if (item === 'coins') return parseFloat(d.farm?.coins) || 0;
    if (item === 'FLOWER') return parseFloat(d.farm?.balance) || 0;
    if (item === 'Tax Free SFL') {
        const v = d.farm?.bank?.taxFreeSFL ?? d.farm?.taxFreeSFL ?? d.taxFreeSFL;
        return parseFloat(v) || 0;
    }
    if (item === 'Experience') {
        const v = d.farm?.bumpkin?.experience ?? d.farm?.experience ?? d.experience;
        return parseFloat(v) || 0;
    }
    if (d.farm?.farmActivity && Object.prototype.hasOwnProperty.call(d.farm.farmActivity, item)) {
        return parseFloat(d.farm.farmActivity[item]) || 0;
    }
    if (d.farm?.bumpkin?.activity && Object.prototype.hasOwnProperty.call(d.farm.bumpkin.activity, item)) {
        return parseFloat(d.farm.bumpkin.activity[item]) || 0;
    }
    const inv = d.farm?.inventory || {};
    return parseFloat(inv[item]) || 0;
}

function getValueAtDate(itemId, date) {
    if (window.customPathData && window.customPathData[itemId]) {
        const dataPoint = window.customPathData[itemId].find(dp => dp.date === date);
        return dataPoint ? dataPoint.value : 0;
    } else {
        return get(data[date], itemId);
    }
}

function getXPosition(idx, dates, w, p) {
    const numDates = dates.length;
    if (numDates === 1) {
        return p + (w - 2*p) / 2;
    }
    return p + (w - 2*p) / (numDates - 1) * idx;
}
