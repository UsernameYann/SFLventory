// ============================================================================
// CHART - SVG chart rendering, tooltip, legend, and sidebar UI
// ============================================================================

function render() {
    let html = '';
    
    // 0) Catégorie Favoris (en premier, toujours visible si non vide)
    const favoriteItems = items
        .filter(item => item.type === 'item' && favorites.includes(item.id || item.name))
        .filter(item => !searchTerm || item.name.toLowerCase().includes(searchTerm));
    if (favoriteItems.length) {
        const dataItems = favoriteItems.map(i => i.id || i.name).map(encodeURIComponent).join(',');
        const allSelected = favoriteItems.every(i => selected.includes(i.id || i.name));
        const key = 'Favorites';
        const collapsed = isCollapsed(key);
        const caret = collapsed ? '▸' : '▾';
        html += `<div class="category-title" data-category="Favorites" data-items="${dataItems}" data-collapsible="1">
            <span class="caret" data-toggle="${key}">${caret}</span>
            <input type="checkbox" ${allSelected ? 'checked' : ''}>
            <span class="name">⭐ Favorites</span>
        </div>`;
        html += `<div class="items ${collapsed ? 'collapsed' : ''}" data-items-container="${key}">` + favoriteItems.map(it => {
            const color = ITEM_COLORS[it.name];
            const labelStyle = color ? ` style=\"color:${color}\"` : '';
            const inputStyle = color ? ` style=\"accent-color:${color}\"` : '';
            const value = it.id || it.name;
            const isFav = favorites.includes(value);
            return `<label${labelStyle}>
                <span class="fav-star" data-item="${value}" title="${isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}">${isFav ? '⭐' : '☆'}</span>
                <input type="checkbox" value="${value}"${inputStyle}>${it.name}
            </label>`;
        }).join('') + `</div>`;
    }

    // 1) Catégories de base (non repliables)
    CATEGORY_ORDER.forEach(catKey => {
        const category = CATEGORIES[catKey];
        const catItems = items
            .filter(i => i.type === 'item' && category.items.includes(i.name))
            .filter(i => !searchTerm || i.name.toLowerCase().includes(searchTerm));
        if (!catItems.length) return;
        const dataItems = catItems.map(i => i.name).map(encodeURIComponent).join(',');
        const allSelected = catItems.every(i => selected.includes(i.name));
        html += `<div class="category-title" data-category="${catKey}" data-items="${dataItems}">
            <input type="checkbox" ${allSelected ? 'checked' : ''}>
            <span class="name">${category.name}</span>
        </div>`;
        html += `<div class="items">` + catItems.map(it => {
            const color = ITEM_COLORS[it.name];
            const labelStyle = color ? ` style=\"color:${color}\"` : '';
            const inputStyle = color ? ` style=\"accent-color:${color}\"` : '';
            const isFav = favorites.includes(it.name);
            return `<label${labelStyle}>
                <span class="fav-star" data-item="${it.name}" title="${isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}">${isFav ? '⭐' : '☆'}</span>
                <input type="checkbox" value="${it.name}"${inputStyle}>${it.name}
            </label>`;
        }).join('') + `</div>`;
    });

    // 2) Catégories dynamiques (repliables)
    const dynamicCats = items.filter(i => i.type === 'category' && i.key && i.key.startsWith('dyn:'));
    const dynamicIdSet = new Set(dynamicCats.flatMap(c => c.items));
    dynamicCats.forEach(cat => {
        const dynItems = items
            .filter(it => it.type === 'item' && it.id && cat.items.includes(it.id))
            .filter(it => !searchTerm || it.name.toLowerCase().includes(searchTerm));
        if (!dynItems.length) return;
        const allSelected = dynItems.every(i => selected.includes(i.id));
        const dataItems = dynItems.map(i => i.id).map(encodeURIComponent).join(',');
        const collapsed = isCollapsed(cat.key);
        const caret = collapsed ? '▸' : '▾';
        html += `<div class="category-title" data-category="${cat.key}" data-items="${dataItems}" data-collapsible="1">
            <span class="caret" data-toggle="${cat.key}">${caret}</span>
            <input type="checkbox" ${allSelected ? 'checked' : ''}>
            <span class="name">${cat.name}</span>
        </div>`;
        html += `<div class="items ${collapsed ? 'collapsed' : ''}" data-items-container="${cat.key}">` + dynItems.map(it => {
            const color = ITEM_COLORS[it.name];
            const labelStyle = color ? ` style=\"color:${color}\"` : '';
            const inputStyle = color ? ` style=\"accent-color:${color}\"` : '';
            const value = it.id || it.name;
            const isFav = favorites.includes(value);
            return `<label${labelStyle}>
                <span class="fav-star" data-item="${value}" title="${isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}">${isFav ? '⭐' : '☆'}</span>
                <input type="checkbox" value="${value}"${inputStyle}>${it.name}
            </label>`;
        }).join('') + `</div>`;
    });

    // 3) Others (repliable, après dynamiques)
    const categorized = new Set(CATEGORY_ORDER.flatMap(k => CATEGORIES[k].items));
    const uncategorized = items
        .filter(item => item.type === 'item' && !categorized.has(item.name) && !dynamicIdSet.has(item.id || item.name))
        .filter(item => !searchTerm || item.name.toLowerCase().includes(searchTerm));
    if (uncategorized.length) {
        const dataItems = uncategorized.map(i => i.name).map(encodeURIComponent).join(',');
        const allSelected = uncategorized.every(i => selected.includes(i.name));
        const key = 'Other';
        const collapsed = isCollapsed(key);
        const caret = collapsed ? '▸' : '▾';
        html += `<div class="category-title" data-category="Other" data-items="${dataItems}" data-collapsible="1">
            <span class="caret" data-toggle="${key}">${caret}</span>
            <input type="checkbox" ${allSelected ? 'checked' : ''}>
            <span class="name">Others</span>
        </div>`;
        html += `<div class="items ${collapsed ? 'collapsed' : ''}" data-items-container="${key}">` + uncategorized.map(it => {
            const color = ITEM_COLORS[it.name];
            const labelStyle = color ? ` style=\"color:${color}\"` : '';
            const inputStyle = color ? ` style=\"accent-color:${color}\"` : '';
            const isFav = favorites.includes(it.name);
            return `<label${labelStyle}>
                <span class="fav-star" data-item="${it.name}" title="${isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}">${isFav ? '⭐' : '☆'}</span>
                <input type="checkbox" value="${it.name}"${inputStyle}>${it.name}
            </label>`;
        }).join('') + `</div>`;
    }

    document.getElementById('items').innerHTML = html;
    
    // Event listeners pour les items
    document.querySelectorAll('#items label input').forEach(cb => {
        cb.checked = selected.includes(cb.value);
        cb.onchange = (e) => {
            const val = e.target.value;
            if (e.target.checked) {
                if (!selected.includes(val)) selected.push(val);
            } else {
                selected = selected.filter(v => v !== val);
            }
            saveSelected();
            updateCategoryCheckboxes();
            draw();
        };
    });
    
    // Event listeners pour les catégories
    document.querySelectorAll('.category-title').forEach(cat => {
        const checkbox = cat.querySelector('input');
        const categoryKey = cat.dataset.category;
        const catItems = (cat.dataset.items || '')
            .split(',')
            .filter(x => x)
            .map(decodeURIComponent);
        const caret = cat.querySelector('.caret');
        
        // Toggle collapse if caret clicked
        if (caret) {
            caret.onclick = (e) => {
                e.stopPropagation();
                const key = caret.getAttribute('data-toggle');
                const container = document.querySelector(`[data-items-container="${key}"]`);
                const nowCollapsed = !container.classList.contains('collapsed');
                if (nowCollapsed) {
                    container.classList.add('collapsed');
                    caret.textContent = '▸';
                } else {
                    container.classList.remove('collapsed');
                    caret.textContent = '▾';
                }
                setCollapsed(key, nowCollapsed);
            };
        }

        // Toggle selection when clicking header (excluding caret and checkbox)
        cat.onclick = (e) => {
            if (e.target === checkbox || (caret && e.target === caret)) return;
            checkbox.checked = !checkbox.checked;
            toggleCategory(categoryKey, checkbox.checked, catItems);
        };
        
        checkbox.onclick = (e) => e.stopPropagation();
        
        checkbox.onchange = () => {
            toggleCategory(categoryKey, checkbox.checked, catItems);
        };
    });
    
    // Event listeners pour les étoiles de favoris
    document.querySelectorAll('.fav-star').forEach(star => {
        star.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const itemValue = star.getAttribute('data-item');
            toggleFavorite(itemValue);
        };
    });
    
    draw();
}

function toggleCategory(categoryKey, isChecked, explicitItems = null) {
    let categoryItems = explicitItems;
    if (!categoryItems || categoryItems.length === 0) {
        if (categoryKey === 'Other') {
            const categorized = new Set(CATEGORY_ORDER.filter(k => k !== 'Other').flatMap(k => CATEGORIES[k].items));
            // Exclure les dynamiques (qui ont un id) pour rester cohérent avec l'affichage Others
            categoryItems = items
                .filter(i => i.type === 'item' && !i.id && !categorized.has(i.name))
                .filter(i => !searchTerm || i.name.toLowerCase().includes(searchTerm))
                .map(i => i.name);
        } else if (CATEGORY_ORDER.includes(categoryKey)) {
            const categoryItem = CATEGORIES[categoryKey];
            categoryItems = categoryItem.items.filter(item => 
                items.some(i => i.type === 'item' && i.name === item) &&
                (!searchTerm || item.toLowerCase().includes(searchTerm))
            );
        } else if (categoryKey && categoryKey.startsWith('dyn:')) {
            // Catégorie dynamique
            const cat = items.find(i => i.type === 'category' && i.key === categoryKey);
            // Utilise IDs directement
            categoryItems = (cat?.items || []).filter(item => !searchTerm || item.toLowerCase().includes(searchTerm));
        } else {
            return;
        }
    }
    
    if (isChecked) {
        categoryItems.forEach(item => {
            if (!selected.includes(item)) selected.push(item);
        });
    } else {
        categoryItems.forEach(item => {
            const idx = selected.indexOf(item);
            if (idx > -1) selected.splice(idx, 1);
        });
    }
    saveSelected();
    updateCategoryCheckboxes();
    draw();
}

function updateCategoryCheckboxes() {
    document.querySelectorAll('.category-title').forEach(cat => {
        const checkbox = cat.querySelector('input');
        const categoryKey = cat.dataset.category;
        const catItems = (cat.dataset.items || '')
            .split(',')
            .filter(x => x)
            .map(decodeURIComponent);
        
        let categoryItems = catItems;
        if (!categoryItems || categoryItems.length === 0) {
            if (categoryKey === 'Other') {
                const categorized = new Set(CATEGORY_ORDER.filter(k => k !== 'Other').flatMap(k => CATEGORIES[k].items));
                categoryItems = items
                    .filter(i => i.type === 'item' && !i.id && !categorized.has(i.name))
                    .filter(i => !searchTerm || i.name.toLowerCase().includes(searchTerm))
                    .map(i => i.name);
            } else if (CATEGORY_ORDER.includes(categoryKey)) {
                const categoryItem = CATEGORIES[categoryKey];
                categoryItems = categoryItem.items.filter(item => 
                    items.some(i => i.type === 'item' && i.name === item) &&
                    (!searchTerm || item.toLowerCase().includes(searchTerm))
                );
            } else if (categoryKey && categoryKey.startsWith('dyn:')) {
                const catDef = items.find(i => i.type === 'category' && i.key === categoryKey);
                // IDs
                categoryItems = catDef?.items || [];
            } else {
                return;
            }
        }
        
        const allSelected = categoryItems.length > 0 && categoryItems.every(i => selected.includes(i));
        checkbox.checked = allSelected;
    });
    
    document.querySelectorAll('#items label input').forEach(cb => {
        cb.checked = selected.includes(cb.value);
    });
}

function draw() {
    const svg = document.getElementById('svg-container');
    const legend = document.getElementById('legend');
    
    if (!selected.length) {
        svg.innerHTML = '<svg viewBox="0 0 800 400"><text x="400" y="200" text-anchor="middle" fill="#ccc" font-size="18">Select items to display</text></svg>';
        legend.classList.add('hidden');
        return;
    }
    
    // Utiliser la période active (jours ou plage personnalisée)
    let dates = activeDates && activeDates.length ? activeDates : [];
    if (!dates.length) {
        // fallback: fenêtre courante en jours si dispo
        const allDates = Object.keys(data).sort().reverse();
        const endDate = allDates[0];
        const start = new Date(endDate);
        const days = currentPeriodDays || 30;
        start.setDate(start.getDate() - days);
        const startStr = start.toISOString().slice(0, 10);
        dates = Object.keys(data).filter(d => d >= startStr).sort();
    }
    
    if (dates.length === 0) {
        svg.innerHTML = '<svg viewBox="0 0 800 400"><text x="400" y="200" text-anchor="middle" fill="#ccc" font-size="18">No data available</text></svg>';
        legend.classList.add('hidden');
        return;
    }
    
    // ViewBox agrandi pour textes plus petits mais lisibles
    const w = 800, h = 450, p = 60;
    
    // Récupérer les valeurs, en supportant les custom paths - FILTER by active period
    const all = selected.flatMap(i => {
        if (window.customPathData && window.customPathData[i]) {
            // Custom path data - only from the active period
            const histData = window.customPathData[i];
            const filteredData = histData.filter(dp => dates.includes(dp.date));
            return filteredData.map(dp => dp.value).filter(v => isFinite(v));
        } else {
            // Regular item data
            return dates.map(d => get(data[d], i)).filter(v => isFinite(v));
        }
    });
    
    if (all.length === 0) {
        svg.innerHTML = '<svg viewBox="0 0 800 400"><text x="400" y="200" text-anchor="middle" fill="#ccc" font-size="18">No valid data available</text></svg>';
        legend.classList.add('hidden');
        return;
    }
    
    const max = Math.max(...all);
    const min = Math.min(...all);
    const range = max - min || 1;
    
    // Guard against invalid min/max
    if (!isFinite(max) || !isFinite(min)) {
        svg.innerHTML = '<svg viewBox="0 0 800 400"><text x="400" y="200" text-anchor="middle" fill="#ccc" font-size="18">Invalid data for selected items</text></svg>';
        legend.classList.add('hidden');
        return;
    }
    
    // Ajuster le min pour avoir une meilleure échelle visuelle
    // Si le min est proche de 0 comparé au max, on le met à 0 pour éviter la compression
    const adjustedMin = (min > 0 && min < max * 0.1) ? 0 : min;
    const adjustedRange = max - adjustedMin || 1;
    
    let html = `<svg viewBox="0 0 ${w} ${h}">`;
    
    // Grid (utilise adjustedMin et adjustedRange pour correspondre aux lignes)
    for (let i = 0; i <= 4; i++) {
        const y = p + (h - 2*p) / 4 * i;
        const v = max - adjustedRange / 4 * i;
        html += `<line x1="${p}" y1="${y}" x2="${w-p}" y2="${y}" stroke="#eee"/>`;
        html += `<text x="${p-8}" y="${y+3}" text-anchor="end" fill="#999" font-size="12">${v.toFixed(0)}</text>`;
    }
    
    // Lines + marqueurs top/bottom + ligne Avg pour chaque item
    selected.forEach((val, idx) => {
        const info = items.find(i => i.type === 'item' && (i.id === val || i.name === val)) || { name: String(val) };
        const label = info.name;
        const color = ITEM_COLORS[label] || COLORS[idx % COLORS.length];
        
        // Support custom paths
        let vals, chartDates;
        if (window.customPathData && window.customPathData[val]) {
            // Custom path data - FILTER by active period
            const histData = window.customPathData[val];
            const filteredData = histData.filter(dp => dates.includes(dp.date));
            chartDates = filteredData.map(dp => dp.date);
            vals = filteredData.map(dp => dp.value);
        } else {
            // Regular item data
            chartDates = dates;
            vals = dates.map(d => get(data[d], val));
        }
        
        // Skip if no data for this period
        if (vals.length === 0) return;
        
        // Handle single data point case
        const numPoints = vals.length;
        const pts = vals.map((v, j) => {
            const x = numPoints === 1 
                ? p + (w - 2*p) / 2  // Center single point
                : p + (w - 2*p) / (numPoints - 1) * j;
            const y = p + (h - 2*p) - ((v - adjustedMin) / adjustedRange) * (h - 2*p);
            return `${x},${y}`;
        }).join(' ');
        
        html += `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2"/>`;
        
        // Calculer et afficher la moyenne (Avg) comme ligne horizontale
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        const yAvg = p + (h - 2*p) - ((avg - adjustedMin) / adjustedRange) * (h - 2*p);
        html += `<line x1="${p}" y1="${yAvg}" x2="${w-p}" y2="${yAvg}" stroke="${color}" stroke-width="1" stroke-dasharray="4 4" opacity="0.5"/>`;
        
        // Label AVG à droite
        html += `<text x="${w-p+5}" y="${yAvg+4}" fill="${color}" font-size="9" opacity="0.7">AVG</text>`;
        
        // Trouver le max et min pour cet item dans la période
        const itemMax = Math.max(...vals);
        const itemMin = Math.min(...vals);
        const maxIdx = vals.indexOf(itemMax);
        const minIdx = vals.indexOf(itemMin);
        
        // Marker TOP (triangle vers le haut)
        if (itemMax > 0) {
            const xMax = p + (w - 2*p) / (chartDates.length - 1) * maxIdx;
            const yMax = p + (h - 2*p) - ((itemMax - adjustedMin) / adjustedRange) * (h - 2*p);
            
            // Triangle pointant vers le haut
            const triSize = 6;
            html += `<polygon points="${xMax},${yMax - triSize - 2} ${xMax - triSize},${yMax + 2} ${xMax + triSize},${yMax + 2}" 
                fill="${color}" stroke="white" stroke-width="1.5"/>`;
            
            // Label TOP avec fond
            html += `<rect x="${xMax - 15}" y="${yMax - triSize - 20}" width="30" height="14" fill="white" stroke="${color}" stroke-width="1" rx="2"/>`;
            html += `<text x="${xMax}" y="${yMax - triSize - 9}" text-anchor="middle" fill="${color}" font-size="10" font-weight="600">TOP</text>`;
        }
        
        // Marker BOTTOM (triangle vers le bas)
        const xMin = p + (w - 2*p) / (chartDates.length - 1) * minIdx;
        const yMin = p + (h - 2*p) - ((itemMin - adjustedMin) / adjustedRange) * (h - 2*p);
        
        // Triangle pointant vers le bas
        const triSize = 6;
        html += `<polygon points="${xMin},${yMin + triSize + 2} ${xMin - triSize},${yMin - 2} ${xMin + triSize},${yMin - 2}" 
            fill="${color}" stroke="white" stroke-width="1.5"/>`;
        
        // Label BOTTOM avec fond
        html += `<rect x="${xMin - 18}" y="${yMin + triSize + 6}" width="36" height="14" fill="white" stroke="${color}" stroke-width="1" rx="2"/>`;
        html += `<text x="${xMin}" y="${yMin + triSize + 17}" text-anchor="middle" fill="${color}" font-size="10" font-weight="600">LOW</text>`;
    });
    
    // X-axis
    const step = Math.ceil(dates.length / 8);
    dates.forEach((d, i) => {
        if (i % step === 0) {
            const x = getXPosition(i, dates, w, p);
            const yLabel = h - p + 16; // un peu plus d'espace sous l'axe X
            html += `<text x="${x}" y="${yLabel}" text-anchor="middle" fill="#999" font-size="11">${d.slice(5)}</text>`;
        }
    });
    
    // Overlay pour interactivité
    html += '<g id="overlay"></g>';
    html += '</svg>';
    svg.innerHTML = html;

    const svgEl = svg.querySelector('svg');
    const overlay = svgEl.querySelector('#overlay');

    // Tooltip (créé une fois)
    let tooltip = document.getElementById('chart-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'chart-tooltip';
        tooltip.className = 'chart-tooltip';
        document.getElementById('chart').appendChild(tooltip);
    }

    const viewW = w, viewH = h;
    let pinnedIdx = null; // premier point épinglé ou null
    let secondIdx = null; // second point épinglé ou null

    function showAtIndex(idx, clientX, clientY) {
        overlay.innerHTML = '';
        
        // Si deux points sont épinglés, afficher la comparaison
        if (pinnedIdx !== null && secondIdx !== null) {
            const idx1 = Math.min(pinnedIdx, secondIdx);
            const idx2 = Math.max(pinnedIdx, secondIdx);
            
            // Zone de comparaison (rectangle semi-transparent)
            const x1 = getXPosition(idx1, dates, w, p);
            const x2 = getXPosition(idx2, dates, w, p);
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x1);
            rect.setAttribute('y', p);
            rect.setAttribute('width', x2 - x1);
            rect.setAttribute('height', h - 2*p);
            rect.setAttribute('fill', 'rgba(76, 175, 80, 0.1)');
            overlay.appendChild(rect);
            
            // Lignes verticales pour les deux dates
            [idx1, idx2].forEach((i, n) => {
                const x = getXPosition(i, dates, w, p);
                const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                vLine.setAttribute('x1', x);
                vLine.setAttribute('y1', p);
                vLine.setAttribute('x2', x);
                vLine.setAttribute('y2', h - p);
                vLine.setAttribute('stroke', '#4caf50');
                vLine.setAttribute('stroke-dasharray', '3,3');
                vLine.setAttribute('stroke-width', '2');
                overlay.appendChild(vLine);
                
                // Points sur chaque série
                selected.forEach((val, itemIdx) => {
                    const info = items.find(it => it.type === 'item' && (it.id === val || it.name === val)) || { name: String(val) };
                    const color = ITEM_COLORS[info.name] || COLORS[itemIdx % COLORS.length];
                    const v = getValueAtDate(val, dates[i]);
                    const y = p + (h - 2*p) - ((v - adjustedMin) / adjustedRange) * (h - 2*p);
                    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    dot.setAttribute('cx', x);
                    dot.setAttribute('cy', y);
                    dot.setAttribute('r', '4.5');
                    dot.setAttribute('fill', color);
                    dot.setAttribute('stroke', '#fff');
                    dot.setAttribute('stroke-width', '2');
                    overlay.appendChild(dot);
                });
            });
            
            // Tooltip de comparaison
            let tipHtml = `<div style="margin-bottom:6px;font-weight:600;font-size:12px;border-bottom:1px solid rgba(255,255,255,0.2);padding-bottom:4px;">
                ${dates[idx1]} → ${dates[idx2]} (${idx2 - idx1} jour${idx2 - idx1 > 1 ? 's' : ''})
            </div>`;
            
            selected.forEach((val, i) => {
                const info = items.find(it => it.type === 'item' && (it.id === val || it.name === val)) || { name: String(val) };
                const color = COLORS[i % COLORS.length];
                const v1 = getValueAtDate(val, dates[idx1]);
                const v2 = getValueAtDate(val, dates[idx2]);
                const diff = v2 - v1;
                const pct = v1 !== 0 ? (diff / v1) * 100 : (v2 > 0 ? 100 : 0);
                const sign = diff >= 0 ? '+' : '';
                const varColor = diff >= 0 ? '#4caf50' : '#f44336';
                
                // Calculer la moyenne du delta par jour
                const numDays = idx2 - idx1;
                const avgDeltaPerDay = numDays > 0 ? diff / numDays : diff;
                
                tipHtml += `<div style="display:flex;flex-direction:column;gap:2px;margin:4px 0;padding:4px;background:rgba(255,255,255,0.05);border-radius:3px;">
                    <div style="display:flex;align-items:center;gap:6px;">
                        <span style="display:inline-block;width:14px;height:3px;background:${color};border-radius:2px;"></span>
                        <span style="flex:1;font-weight:600;">${info.name}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:11px;gap:8px;padding-left:20px;">
                        <span>Total: <span style="color:${varColor};font-weight:600;">${sign}${diff.toFixed(2)} (${sign}${pct.toFixed(1)}%)</span></span>
                        <span>Daily: <span style="color:#2196f3;font-weight:600;">${sign}${avgDeltaPerDay.toFixed(2)}</span></span>
                    </div>
                </div>`;
            });
            
            tooltip.innerHTML = tipHtml;
            tooltip.style.opacity = '1';
            
            // Positionner au milieu de la zone
            const chartRect = document.getElementById('chart').getBoundingClientRect();
            const svgRect = svgEl.getBoundingClientRect();
            const midX = (x1 + x2) / 2;
            const screenX = svgRect.left + (midX / viewW) * svgRect.width;
            const left = Math.min(Math.max(screenX - chartRect.left - tooltip.offsetWidth / 2, 8), chartRect.width - tooltip.offsetWidth - 8);
            const top = 20;
            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
            
            return;
        }
        
        // Sinon, comportement normal (un seul point ou survol)
        const x = getXPosition(idx, dates, w, p);

        // Ligne verticale
        const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        vLine.setAttribute('x1', x);
        vLine.setAttribute('y1', p);
        vLine.setAttribute('x2', x);
        vLine.setAttribute('y2', h - p);
        vLine.setAttribute('stroke', pinnedIdx === idx ? '#666' : '#ccc');
        vLine.setAttribute('stroke-dasharray', '3,3');
        vLine.setAttribute('stroke-width', pinnedIdx === idx ? '1.5' : '1');
        overlay.appendChild(vLine);

        // Points + construire tooltip
        let tipHtml = `<div style="margin-bottom:4px;font-weight:600;font-size:12px;">${dates[idx]}</div>`;
        selected.forEach((val, i) => {
            const info = items.find(it => it.type === 'item' && (it.id === val || it.name === val)) || { name: String(val) };
            const color = ITEM_COLORS[info.name] || COLORS[i % COLORS.length];
            const v = getValueAtDate(val, dates[idx]);
            const y = p + (h - 2*p) - ((v - adjustedMin) / adjustedRange) * (h - 2*p);
            const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot.setAttribute('cx', x);
            dot.setAttribute('cy', y);
            dot.setAttribute('r', pinnedIdx === idx ? '4' : '3.5');
            dot.setAttribute('fill', color);
            dot.setAttribute('stroke', '#fff');
            dot.setAttribute('stroke-width', pinnedIdx === idx ? '1.5' : '1');
            overlay.appendChild(dot);

            // Variation depuis la veille
            let variationHtml = '';
            if (idx > 0) {
                const prevV = getValueAtDate(val, dates[idx - 1]);
                const diff = v - prevV;
                const pct = prevV !== 0 ? (diff / prevV) * 100 : (v > 0 ? 100 : 0);
                const sign = diff >= 0 ? '+' : '';
                const varColor = diff >= 0 ? '#4caf50' : '#f44336';
                variationHtml = `<span style="color:${varColor};margin-left:8px;font-size:11px;">${sign}${diff.toFixed(2)} (${sign}${pct.toFixed(1)}%)</span>`;
            }

            tipHtml += `<div style="display:flex;align-items:center;gap:6px;">
                <span style="display:inline-block;width:14px;height:3px;background:${color};border-radius:2px;"></span>
                <span>${info.name}: ${Number(v).toFixed(2)}</span>${variationHtml}
            </div>`;
        });

        tooltip.innerHTML = tipHtml;
        tooltip.style.opacity = '1';

        // Positionner le tooltip près du pointeur
        const chartRect = document.getElementById('chart').getBoundingClientRect();
        const left = Math.min(Math.max(clientX - chartRect.left + 12, 8), chartRect.width - tooltip.offsetWidth - 8);
        const top = Math.min(Math.max(clientY - chartRect.top + 12, 8), chartRect.height - tooltip.offsetHeight - 8);
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    }

    function handleMove(evt) {
        if (secondIdx !== null) return; // ignoré si deux points déjà épinglés
        
        const rect = svgEl.getBoundingClientRect();
        const xPx = evt.clientX - rect.left;
        const xSvg = (xPx / rect.width) * viewW;
        const ratio = (xSvg - p) / (w - 2*p);
        const idx = Math.round(Math.max(0, Math.min(dates.length - 1, ratio * (dates.length - 1))));
        
        // Si un point est déjà épinglé, montrer l'aperçu de la comparaison
        if (pinnedIdx !== null) {
            overlay.innerHTML = '';
            const idx1 = Math.min(pinnedIdx, idx);
            const idx2 = Math.max(pinnedIdx, idx);
            
            // Zone de comparaison semi-transparente
            const x1 = getXPosition(idx1, dates, w, p);
            const x2 = getXPosition(idx2, dates, w, p);
            const rectPreview = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rectPreview.setAttribute('x', x1);
            rectPreview.setAttribute('y', p);
            rectPreview.setAttribute('width', x2 - x1);
            rectPreview.setAttribute('height', h - 2*p);
            rectPreview.setAttribute('fill', 'rgba(76, 175, 80, 0.08)');
            overlay.appendChild(rectPreview);
            
            // Ligne pour le point épinglé
            const vLine1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            vLine1.setAttribute('x1', x1);
            vLine1.setAttribute('y1', p);
            vLine1.setAttribute('x2', x1);
            vLine1.setAttribute('y2', h - p);
            vLine1.setAttribute('stroke', '#4caf50');
            vLine1.setAttribute('stroke-dasharray', '3,3');
            vLine1.setAttribute('stroke-width', '2');
            overlay.appendChild(vLine1);
            
            // Ligne pour la position actuelle du curseur
            const vLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            vLine2.setAttribute('x1', x2);
            vLine2.setAttribute('y1', p);
            vLine2.setAttribute('x2', x2);
            vLine2.setAttribute('y2', h - p);
            vLine2.setAttribute('stroke', '#4caf50');
            vLine2.setAttribute('stroke-dasharray', '5,5');
            vLine2.setAttribute('stroke-width', '1.5');
            vLine2.setAttribute('opacity', '0.7');
            overlay.appendChild(vLine2);
            
            // Points sur les deux dates
            [idx1, idx2].forEach((i, n) => {
                const x = getXPosition(i, dates, w, p);
                selected.forEach((val, itemIdx) => {
                    const info = items.find(it => it.type === 'item' && (it.id === val || it.name === val)) || { name: String(val) };
                    const color = ITEM_COLORS[info.name] || COLORS[itemIdx % COLORS.length];
                    const v = getValueAtDate(val, dates[i]);
                    const y = p + (h - 2*p) - ((v - adjustedMin) / adjustedRange) * (h - 2*p);
                    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    dot.setAttribute('cx', x);
                    dot.setAttribute('cy', y);
                    dot.setAttribute('r', n === 0 ? '4.5' : '3.5'); // point épinglé plus gros
                    dot.setAttribute('fill', color);
                    dot.setAttribute('stroke', '#fff');
                    dot.setAttribute('stroke-width', n === 0 ? '2' : '1.5');
                    dot.setAttribute('opacity', n === 0 ? '1' : '0.8');
                    overlay.appendChild(dot);
                });
            });
            
            // Tooltip d'aperçu
            let tipHtml = `<div style="margin-bottom:4px;font-weight:600;font-size:12px;opacity:0.9;">
                ${dates[idx1]} → ${dates[idx2]} (${idx2 - idx1} jour${idx2 - idx1 > 1 ? 's' : ''})
            </div>`;
            tipHtml += `<div style="font-size:10px;opacity:0.7;margin-bottom:2px;">Cliquez pour verrouiller la comparaison</div>`;
            
            tooltip.innerHTML = tipHtml;
            tooltip.style.opacity = '1';
            
            const chartRect = document.getElementById('chart').getBoundingClientRect();
            const left = Math.min(Math.max(evt.clientX - chartRect.left + 12, 8), chartRect.width - tooltip.offsetWidth - 8);
            const top = Math.min(Math.max(evt.clientY - chartRect.top + 12, 8), chartRect.height - tooltip.offsetHeight - 8);
            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
        } else {
            // Comportement normal (aucun point épinglé)
            showAtIndex(idx, evt.clientX, evt.clientY);
        }
    }

    function handleLeave() {
        if (pinnedIdx !== null) return; // garder si épinglé
        overlay.innerHTML = '';
        tooltip.style.opacity = '0';
    }

    function handleClick(evt) {
        const rect = svgEl.getBoundingClientRect();
        const xPx = evt.clientX - rect.left;
        const xSvg = (xPx / rect.width) * viewW;
        const ratio = (xSvg - p) / (w - 2*p);
        const idx = Math.round(Math.max(0, Math.min(dates.length - 1, ratio * (dates.length - 1))));
        
        if (pinnedIdx === null) {
            // Premier clic : épingler le premier point
            pinnedIdx = idx;
            secondIdx = null;
            showAtIndex(idx, evt.clientX, evt.clientY);
        } else if (secondIdx === null) {
            // Deuxième clic : épingler le second point et comparer
            if (idx === pinnedIdx) {
                // Clic sur le même point : désépingler tout
                pinnedIdx = null;
                secondIdx = null;
                overlay.innerHTML = '';
                tooltip.style.opacity = '0';
            } else {
                secondIdx = idx;
                showAtIndex(idx, evt.clientX, evt.clientY);
            }
        } else {
            // Troisième clic : réinitialiser et recommencer
            pinnedIdx = idx;
            secondIdx = null;
            showAtIndex(idx, evt.clientX, evt.clientY);
        }
    }

    svgEl.addEventListener('mousemove', handleMove);
    svgEl.addEventListener('mouseleave', handleLeave);
    svgEl.addEventListener('click', handleClick);

    // Legend header + rows (sortable)
    const rows = selected.map((val, idx) => {
        const info = items.find(i => i.type === 'item' && (i.id === val || i.name === val)) || { name: String(val) };
        const label = info.name;
        const color = ITEM_COLORS[label] || COLORS[idx % COLORS.length];
        
        // Support custom paths - FILTER by active period
        let vals;
        if (window.customPathData && window.customPathData[val]) {
            const histData = window.customPathData[val];
            const filteredData = histData.filter(dp => dates.includes(dp.date));
            vals = filteredData.map(dp => dp.value).filter(v => isFinite(v));
        } else {
            vals = dates.map(d => get(data[d], val)).filter(v => isFinite(v));
        }
        
        if (vals.length === 0) {
            return { label, key: val, color, current: 0, max: 0, min: 0, avg: 0, variation: 0, variationPct: 0 };
        }
        
        const current = vals[vals.length - 1];
        const maxV = Math.max(...vals);
        const minV = Math.min(...vals);
        const avgV = vals.reduce((a, b) => a + b, 0) / vals.length;
        const variation = current - vals[0];
        const variationPct = vals[0] !== 0 ? (variation / vals[0]) * 100 : 0;
        return { label, key: val, color, current, max: maxV, min: minV, avg: avgV, variation, variationPct };
    });

    const keyMap = { name: 'label', now: 'current', max: 'max', min: 'min', avg: 'avg', var: 'variationPct' };
    const sortKey = keyMap[legendSort.col] || 'item';
    rows.sort((a, b) => {
        const va = a[sortKey];
        const vb = b[sortKey];
        if (typeof va === 'string') {
            return legendSort.dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
        }
        return legendSort.dir === 'asc' ? va - vb : vb - va;
    });

    const arrow = (col) => legendSort.col === col ? (legendSort.dir === 'asc' ? '▲' : '▼') : '';
    const header = `
        <div class="legend-header">
            <div></div>
            <button class="hcell" data-col="name">Nom ${arrow('name')}</button>
            <button class="hcell" data-col="now">Now ${arrow('now')}</button>
            <button class="hcell" data-col="max">Max ${arrow('max')}</button>
            <button class="hcell" data-col="min">Min ${arrow('min')}</button>
            <button class="hcell" data-col="avg">Avg ${arrow('avg')}</button>
            <button class="hcell" data-col="var">Var % ${arrow('var')}</button>
        </div>`;

    legend.classList.remove('hidden');
    legend.innerHTML = header + rows.map(r => `
        <div class="legend-item">
            <div class="legend-color" style="background:${r.color}"></div>
            <div class="legend-name" title="${r.label}">${r.label}</div>
            <div class="legend-stat"><span class="stat-value">${r.current.toFixed(0)}</span></div>
            <div class="legend-stat"><span class="stat-value">${r.max.toFixed(0)}</span></div>
            <div class="legend-stat"><span class="stat-value">${r.min.toFixed(0)}</span></div>
            <div class="legend-stat"><span class="stat-value">${r.avg.toFixed(0)}</span></div>
            <div class="legend-stat"><span class="stat-value" style="color:${r.variation >= 0 ? '#4caf50' : '#f44336'}">${r.variation >= 0 ? '+' : ''}${r.variation.toFixed(0)} (${r.variationPct >= 0 ? '+' : ''}${r.variationPct.toFixed(1)}%)</span></div>
        </div>
    `).join('');

    // Attach sort handlers
    legend.querySelectorAll('.legend-header .hcell').forEach(btn => {
        btn.addEventListener('click', () => {
            const col = btn.dataset.col;
            if (legendSort.col === col) {
                legendSort.dir = legendSort.dir === 'asc' ? 'desc' : 'asc';
            } else {
                legendSort.col = col;
                legendSort.dir = col === 'name' ? 'asc' : 'desc';
            }
            try { localStorage.setItem('legendSort', JSON.stringify(legendSort)); } catch {}
            // re-draw legend only
            draw();
        });
    });
}
