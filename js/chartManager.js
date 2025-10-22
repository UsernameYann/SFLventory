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

        // Seasons and events overlays are intentionally disabled to keep the
        // charts clean. Previously custom plugins were registered here; they
        // are left in the file for reference but not activated.
    }

    /**
     * Registers a custom Chart.js plugin to draw season backgrounds
     */
    registerSeasonBackgroundPlugin() {
        // Plugin implementation kept for reference but not registered.
        return;
    }    /**
     * Registers a custom Chart.js plugin to draw events with diagonal patterns
     */
    registerEventsPlugin() {
        // Plugin implementation kept for reference but not registered.
        return;
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
        
        // Use default legend behavior — only actual datasets will be shown.
        if (!options.plugins) options.plugins = {};
        options.plugins.legend = {
            display: true,
            position: 'top'
        };
        
        // Only use the provided data datasets
        const combinedData = {
            labels: chartData.labels,
            datasets: chartData.datasets.map(dataset => ({
                ...dataset,
                order: 1
            }))
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