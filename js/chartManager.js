/**
 * Chart manager for Sunflower Land Inventory Tracker application
 */
class ChartManager {
    constructor() {
        this.chart = null;
        this.chartElement = document.getElementById('inventory-chart');
        this.seasons = null;
        this.events = null;
        this.hiddenSeasons = new Set(); // Track hidden seasons
        this.hiddenEvents = new Set(); // Track hidden events

        // Register the custom plugins for backgrounds
        this.registerSeasonBackgroundPlugin();
        this.registerEventsPlugin();
    }

    /**
     * Registers a custom Chart.js plugin to draw season backgrounds
     */
    registerSeasonBackgroundPlugin() {
        const plugin = {
            id: 'seasonBackgrounds',
            beforeDraw: (chart, args, options) => {
                if (!options.enabled || !this.seasons) {
                    return;
                }

                // Only log if debug mode is enabled
                if (CONFIG.DEBUG_MODE) {
                    console.log('Drawing season backgrounds, seasons data:', this.seasons);
                }
                const { ctx, chartArea, scales } = chart;
                const { top, bottom, left, right } = chartArea;
                const width = right - left;
                const height = bottom - top;

                // Sort season dates for proper rendering
                const seasonDates = Object.keys(this.seasons).sort();
                if (CONFIG.DEBUG_MODE) {
                    console.log('Chart X axis labels:', chart.data.labels);
                    console.log('Sorted season dates:', seasonDates);
                }

                // Draw each season area
                let currentSeason = null;
                let startX = left;

                for (let i = 0; i < seasonDates.length; i++) {
                    const currentDate = seasonDates[i];
                    const nextDate = i < seasonDates.length - 1 ? seasonDates[i + 1] : null;
                    
                    const season = this.seasons[currentDate];
                    // Skip if this season is hidden via legend toggle
                    if (this.hiddenSeasons.has(season)) {
                        continue;
                    }
                    
                    const seasonColor = CONFIG.SEASON_COLORS[season];
                    
                    if (!seasonColor) {
                        console.log('No color found for season:', season);
                        continue;
                    }
                    
                    // Find the index in the chart labels that matches or is closest to our date
                    let startIndex = chart.data.labels.findIndex(label => 
                        label >= currentDate
                    );
                    
                    let endIndex = nextDate ? 
                        chart.data.labels.findIndex(label => label >= nextDate) : 
                        chart.data.labels.length;
                    
                    // Handle edge cases
                    if (startIndex === -1) startIndex = 0;
                    if (endIndex === -1) endIndex = chart.data.labels.length;
                    
                    if (CONFIG.DEBUG_MODE) {
                        console.log(`Season ${season} (${currentDate}): startIndex=${startIndex}, endIndex=${endIndex}`);
                    }
                    
                    // Calculate x positions
                    const xStart = startIndex >= 0 ? 
                        scales.x.getPixelForValue(chart.data.labels[startIndex]) : 
                        left;
                    
                    const xEnd = endIndex < chart.data.labels.length ? 
                        scales.x.getPixelForValue(chart.data.labels[endIndex]) : 
                        right;
                    
                    // Only draw if the positions are valid
                    if (isNaN(xStart) || isNaN(xEnd)) continue;
                    
                    // Draw the rectangle for this season
                    ctx.fillStyle = seasonColor;
                    ctx.fillRect(xStart, top, xEnd - xStart, height);
                }
            }
        };

        Chart.register(plugin);
    }    /**
     * Registers a custom Chart.js plugin to draw events with diagonal patterns
     */
    registerEventsPlugin() {
        const plugin = {
            id: 'eventsPattern',
            beforeDraw: (chart, args, options) => {
                if (!this.events) {
                    return;
                }

                // Only log if debug mode is enabled
                if (CONFIG.DEBUG_MODE) {
                    console.log('Drawing events patterns, events data:', this.events);
                }
                
                const { ctx, chartArea, scales } = chart;
                const { top, bottom, left, right } = chartArea;
                const height = bottom - top;

                // Process each event date
                for (const [eventDate, eventType] of Object.entries(this.events)) {
                    // Skip if this event type is hidden via legend toggle
                    if (this.hiddenEvents.has(eventType)) {
                        continue;
                    }
                    
                    // Get color for this event type
                    const eventColor = CONFIG.EVENTS_COLORS[eventType];
                    if (!eventColor) {
                        if (CONFIG.DEBUG_MODE) {
                            console.log('No color found for event type:', eventType);
                        }
                        continue;
                    }
                    
                    // Find corresponding index in chart labels
                    const dateIndex = chart.data.labels.findIndex(label => label === eventDate);
                    if (dateIndex === -1) continue; // Skip if date not found in chart
                    
                    // Calculate x position for event (same day, so only one position)
                    const xPos = scales.x.getPixelForValue(chart.data.labels[dateIndex]);
                    
                    // Skip if position is invalid
                    if (isNaN(xPos)) continue;
                    
                    // Determine width of a single day by estimating based on nearby points or fixed value
                    let dayWidth;
                    if (dateIndex < chart.data.labels.length - 1) {
                        const nextDayPos = scales.x.getPixelForValue(chart.data.labels[dateIndex + 1]);
                        dayWidth = nextDayPos - xPos;
                    } else if (dateIndex > 0) {
                        const prevDayPos = scales.x.getPixelForValue(chart.data.labels[dateIndex - 1]);
                        dayWidth = xPos - prevDayPos;
                    } else {
                        // Fallback to estimated width if can't calculate
                        dayWidth = 20; 
                    }
                    
                    // Ensure we have a positive width
                    dayWidth = Math.max(dayWidth, 10);
                    
                    // Draw diagonal pattern
                    ctx.save();
                    ctx.fillStyle = eventColor;
                    
                    // Create diagonal stripes pattern
                    const patternCanvas = document.createElement('canvas');
                    const patternContext = patternCanvas.getContext('2d');
                    const patternSize = 10;
                    
                    patternCanvas.width = patternSize;
                    patternCanvas.height = patternSize;
                    
                    // Draw diagonal lines for pattern
                    patternContext.fillStyle = 'transparent';
                    patternContext.fillRect(0, 0, patternSize, patternSize);
                    patternContext.strokeStyle = eventColor;
                    patternContext.lineWidth = 1;
                    patternContext.beginPath();
                    patternContext.moveTo(0, 0);
                    patternContext.lineTo(patternSize, patternSize);
                    patternContext.stroke();
                    
                    // Create pattern and apply
                    const pattern = ctx.createPattern(patternCanvas, 'repeat');
                    ctx.fillStyle = pattern;
                    
                    // Draw event rectangle with pattern
                    ctx.fillRect(xPos - dayWidth/2, top, dayWidth, height);
                    
                    // Add a border to help visibility
                    ctx.strokeStyle = eventColor;
                    ctx.lineWidth = 1;
                    ctx.strokeRect(xPos - dayWidth/2, top, dayWidth, height);
                    
                    ctx.restore();
                }
            }
        };

        Chart.register(plugin);
    }
    /**
     * Creates legend datasets for seasons
     * @returns {Array} Array of legend-only datasets for seasons
     */
    createSeasonsLegendDatasets() {
        if (!this.seasons) {
            return [];
        }
        
        const legendDatasets = [];
        const uniqueSeasons = new Set();
        
        // Get unique seasons
        Object.values(this.seasons).forEach(season => {
            uniqueSeasons.add(season);
        });
        
        // Create a dataset for each season (for legend purposes only)
        uniqueSeasons.forEach(season => {
            const seasonColor = CONFIG.SEASON_COLORS[season];
            if (!seasonColor) return;
            
            legendDatasets.push({
                label: season.charAt(0).toUpperCase() + season.slice(1), // Capitalize first letter
                backgroundColor: seasonColor,
                borderColor: seasonColor,
                data: [], // Empty data as this is only for the legend
                hidden: false,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 0,
                borderWidth: 0,
                tension: 0,
                order: 0 // Make sure these appear first in the legend
            });
        });
        
        return legendDatasets;
    }
    
    /**
     * Creates legend datasets for events
     * @returns {Array} Array of legend-only datasets for events
     */
    createEventsLegendDatasets() {
        if (!this.events) {
            return [];
        }
        
        const legendDatasets = [];
        const uniqueEventTypes = new Set();
        
        // Get unique event types
        Object.values(this.events).forEach(eventType => {
            uniqueEventTypes.add(eventType);
        });
        
        // Create a dataset for each event type (for legend purposes only)
        uniqueEventTypes.forEach(eventType => {
            const eventColor = CONFIG.EVENTS_COLORS[eventType];
            if (!eventColor) return;
            
            // Create a pattern canvas for the legend item
            const patternCanvas = document.createElement('canvas');
            const patternContext = patternCanvas.getContext('2d');
            const patternSize = 10;
            
            patternCanvas.width = patternSize;
            patternCanvas.height = patternSize;
            
            // Draw diagonal lines pattern
            patternContext.fillStyle = 'transparent';
            patternContext.fillRect(0, 0, patternSize, patternSize);
            patternContext.strokeStyle = eventColor;
            patternContext.lineWidth = 1;
            patternContext.beginPath();
            patternContext.moveTo(0, 0);
            patternContext.lineTo(patternSize, patternSize);
            patternContext.stroke();
            
            // Format event type name for display (capitalize first letter, add spaces before capitals)
            const formattedLabel = eventType
                .replace(/([A-Z])/g, ' $1') // Add space before capitals
                .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
            
            legendDatasets.push({
                label: formattedLabel.trim(), // Trim any leading space
                backgroundColor: eventColor,
                borderColor: eventColor,
                data: [], // Empty data as this is only for the legend
                hidden: false,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 0,
                borderWidth: 0,
                tension: 0,
                order: 0, // Same order as seasons to be grouped in legend
                // Add a property to identify event datasets in legend filter
                isEventDataset: true,
                patternCanvas: patternCanvas // Store canvas for pattern
            });
        });
        
        return legendDatasets;
    }
    
    /**
     * Initializes or updates the chart with provided data
     * @param {Object} chartData - Data formatted for Chart.js
     */
    async updateChart(chartData) {
        if (!chartData || !chartData.datasets || chartData.datasets.length === 0) {
            this.clearChart();
            return null;
        }

        // Load seasons data if not already loaded
        if (!this.seasons) {
            await this.loadSeasons();
        }

        const options = { ...CONFIG.CHART_OPTIONS };
        
        // Ensure season background plugin is enabled
        if (!options.plugins) {
            options.plugins = {};
        }
        
        if (!options.plugins.seasonBackgrounds) {
            options.plugins.seasonBackgrounds = { enabled: true };
        }
        
        // Enable legend and configure it to show only seasons
        if (!options.plugins.legend) {
            options.plugins.legend = {};
        }
        
        options.plugins.legend = {
            display: true,
            position: 'top',
            onClick: (e, legendItem, legend) => {
                // Call the original onClick handler
                const originalOnClick = Chart.defaults.plugins.legend.onClick;
                originalOnClick.call(legend, e, legendItem, legend);
                
                // Identify if this is an event dataset or a season dataset
                const dataset = legend.chart.data.datasets.find(ds => ds.label === legendItem.text);
                if (!dataset) return;
                
                if (dataset.isEventDataset) {
                    // Get the original event type from the formatted label
                    let eventType = legendItem.text
                        .replace(/\s([A-Z])/g, '$1') // Remove spaces before capitals
                        .replace(/\s/g, '')  // Remove any remaining spaces
                        .replace(/^./, str => str.toLowerCase()); // Lowercase first letter
                    
                    // Toggle the event visibility in our tracking Set
                    if (this.hiddenEvents.has(eventType)) {
                        this.hiddenEvents.delete(eventType);
                    } else {
                        this.hiddenEvents.add(eventType);
                    }
                } else {
                    // For seasons, handle as before
                    const seasonName = legendItem.text.toLowerCase();
                    
                    // Toggle the season visibility in our tracking Set
                    if (this.hiddenSeasons.has(seasonName)) {
                        this.hiddenSeasons.delete(seasonName);
                    } else {
                        this.hiddenSeasons.add(seasonName);
                    }
                }
                
                // Update the chart to reflect the changes in background
                this.chart.update();
            },
            labels: {
                // Filter to show both seasons and events in the legend
                filter: (legendItem, chartData) => {
                    // For event datasets (identified by the isEventDataset property)
                    const dataset = chartData.datasets.find(ds => ds.label === legendItem.text);
                    if (dataset && dataset.isEventDataset) {
                        return true;
                    }
                    
                    // For season datasets
                    const uniqueSeasons = new Set();
                    if (this.seasons) {
                        Object.values(this.seasons).forEach(season => {
                            uniqueSeasons.add(season.charAt(0).toUpperCase() + season.slice(1));
                        });
                    }
                    
                    // Show if label matches a season
                    return uniqueSeasons.has(legendItem.text);
                },
                usePointStyle: true,
                boxWidth: 15,
                boxHeight: 15,
                padding: 10,
                // Custom label generator to show pattern for events
                generateLabels: (chart) => {
                    const defaultLabels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                    
                    // Process each label to add pattern for events
                    defaultLabels.forEach(label => {
                        const dataset = chart.data.datasets.find(ds => ds.label === label.text);
                        if (dataset && dataset.isEventDataset && dataset.patternCanvas) {
                            // Set pattern as background
                            const pattern = chart.ctx.createPattern(dataset.patternCanvas, 'repeat');
                            label.fillStyle = pattern || label.fillStyle;
                            label.strokeStyle = dataset.borderColor;
                        }
                    });
                    
                    return defaultLabels;
                }
            }
        };
        
        // Create legend datasets for both seasons and events
        const seasonLegendDatasets = this.createSeasonsLegendDatasets();
        const eventsLegendDatasets = this.createEventsLegendDatasets();
        
        // Combine all legend datasets with actual data datasets
        // Make sure the actual data datasets are not used for the legend
        const combinedData = {
            labels: chartData.labels,
            datasets: [
                ...seasonLegendDatasets,
                ...eventsLegendDatasets,
                ...chartData.datasets.map(dataset => ({
                    ...dataset,
                    order: 1 // Make sure data appears behind legend-only datasets in z-order
                }))
            ]
        };
        
        // If the chart already exists, update it
        if (this.chart) {
            this.chart.data = combinedData;
            this.chart.options = options;
            this.chart.update();
            return this.chart;
        }

        // Otherwise, create a new chart
        this.chart = new Chart(this.chartElement, {
            type: 'line',
            data: combinedData,
            options: options
        });

        return this.chart;
    }

    /**
     * Clears the current chart
     */
    clearChart() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
        // Reset hidden elements when clearing the chart
        this.hiddenSeasons.clear();
        this.hiddenEvents.clear();
    }

    /**
     * Updates the chart with data from selected items
     */
    async refreshChart() {
        try {
            // Reset hidden elements when refreshing the chart
            this.hiddenSeasons.clear();
            this.hiddenEvents.clear();
            const chartData = await dataManager.getChartData();
            this.updateChart(chartData);
        } catch (error) {
            console.error('Error updating chart:', error);
            this.displayError('Unable to update chart. ' + error.message);
        }
    }

    /**
     * Displays an error in the chart container
     * @param {string} message - Error message to display
     */
    displayError(message) {
        this.clearChart();
        
        const chartElement = document.getElementById('inventory-chart');
        if (!chartElement) {
            console.error("Element 'inventory-chart' not found when displaying an error");
            console.error("Error message not displayed:", message);
            return;
        }
        
        // Find parent container
        const container = chartElement.closest('.chart-container');
        if (!container) {
            console.error("Container '.chart-container' not found");
            return;
        }
        
        // Create and display error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'chart-error';
        errorDiv.textContent = message;
        
        // Add error message after canvas
        container.appendChild(errorDiv);
    }

    /**
     * Updates statistics display
     */
    async updateStatistics() {
        try {
            const stats = await dataManager.getStatistics();
            this.renderStatistics(stats);
        } catch (error) {
            console.error('Error updating statistics:', error);
            this.displayStatisticsError('Unable to load statistics. ' + error.message);
        }
    }

    /**
     * Displays statistics in the dedicated container
     * @param {Array} stats - Array of objects containing statistics
     */
    renderStatistics(stats) {
        const container = document.getElementById('statistics-content');
        
        if (!stats || stats.length === 0) {
            container.innerHTML = '<p>No statistics available. Please select at least one item.</p>';
            return;
        }
        
        // Create statistics header
        let html = `
            <div class="stat-item stat-header">
                <div>Item</div>
                <div>Start</div>
                <div>End</div>
                <div>Highest</div>
                <div>Lowest</div>
                <div>Change</div>
            </div>
        `;
        
        // Add each statistic item
        stats.forEach(stat => {
            const changeDirection = stat.absoluteChange > 0 ? 'positive' : (stat.absoluteChange < 0 ? 'negative' : 'neutral');
            const changeSymbol = stat.absoluteChange > 0 ? '+' : '';
            
            // Format numbers with two decimals
            const formattedStartValue = parseFloat(stat.startValue).toFixed(2);
            const formattedEndValue = parseFloat(stat.endValue).toFixed(2);
            const formattedHighestValue = parseFloat(stat.highestValue).toFixed(2);
            const formattedLowestValue = parseFloat(stat.lowestValue).toFixed(2);
            const formattedAbsoluteChange = parseFloat(stat.absoluteChange).toFixed(2);
            const formattedPercentageChange = parseFloat(stat.percentageChange).toFixed(1);
            
            // Create a style for the item name based on its predefined color
            let itemNameStyle = '';
            let itemNameClass = '';
            
            if (CONFIG.ITEM_COLORS[stat.itemName]) {
                const color = CONFIG.ITEM_COLORS[stat.itemName];
                
                // Create an element object to apply styles
                itemNameClass = 'colored-item';
                
                // Convert RGB color to RGBA with transparency for background
                if (color.startsWith('rgb(')) {
                    const rgbaColor = color.replace('rgb(', 'rgba(').replace(')', ', 0.2)');
                    itemNameStyle = `background-color: ${rgbaColor}; border-left: 3px solid ${color};`;
                } else {
                    // If color is hex or another format
                    itemNameStyle = `background-color: ${color}33; border-left: 3px solid ${color};`;
                }
            }
            
            html += `
                <div class="stat-item">
                    <div class="${itemNameClass}" style="${itemNameStyle}">${stat.itemName}</div>
                    <div>${formattedStartValue}</div>
                    <div>${formattedEndValue}</div>
                    <div>${formattedHighestValue}</div>
                    <div>${formattedLowestValue}</div>
                    <div class="change ${changeDirection}">
                        ${changeSymbol}${formattedAbsoluteChange} (${changeSymbol}${formattedPercentageChange}%)
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    /**
     * Displays an error message in the statistics container
     * @param {string} message - Error message to display
     */
    displayStatisticsError(message) {
        const container = document.getElementById('statistics-content');
        container.innerHTML = `<p class="error-message">${message}</p>`;
    }

    /**
     * Loads season and events data from the API
     */
    async loadSeasons() {
        try {
            if (CONFIG.DEBUG_MODE) {
                console.log('Loading seasons and events data from:', CONFIG.SEASONS_PATH);
            }
            const response = await fetch(CONFIG.SEASONS_PATH);
            if (!response.ok) {
                console.error('Failed to load seasons data');
                return;
            }
            const data = await response.json();
            this.seasons = data.seasons;
            this.events = data.events || {}; // Store events data
            
            // Log loaded data for debugging
            if (CONFIG.DEBUG_MODE) {
                console.log('Loaded seasons data:', this.seasons);
                console.log('Loaded events data:', this.events);
            }
        } catch (error) {
            console.error('Error loading seasons and events data:', error);
        }
    }
}

// Create a global instance of the chart manager
const chartManager = new ChartManager();