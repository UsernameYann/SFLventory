/**
 * Data manager for Sunflower Land Inventory Tracker application
 */
class DataManager {
    constructor() {
        this.farmsList = null;       // List of farms
        this.itemsList = null;       // List of available items
        this.farmInfos = {};         // Info per farm (available dates)
        this.selectedFarm = null;
        this.farmData = {};
        this.selectedItems = new Set();
        this.availableItems = new Set();
        this.dateRange = {
            start: null,
            end: null
        };
        this.cache = {}; // Temporary in-memory cache
    }

    /**
     * Checks if data is in cache
     * @param {string} key - Unique key to identify the data
     */
    getFromCache(key) {
        return this.cache[key] || null;
    }

    /**
     * Adds data to cache
     * @param {string} key - Unique key to identify the data
     * @param {any} data - Data to cache
     */
    addToCache(key, data) {
        this.cache[key] = data;
    }

    /**
     * Loads data manifests required by the application
     */
    async loadManifest() {
        try {
            // Load farms list
            const farmsResponse = await fetch(CONFIG.FARMS_LIST_PATH);
            if (!farmsResponse.ok) {
                throw new Error('Unable to load farms list.');
            }
            this.farmsList = await farmsResponse.json();

            // Load items list
            const itemsResponse = await fetch(CONFIG.ITEMS_LIST_PATH);
            if (!itemsResponse.ok) {
                throw new Error('Unable to load items list.');
            }
            this.itemsList = await itemsResponse.json();

            // Create manifest compatible with older functions
            this.manifest = {
                farms: this.farmsList.farms,
                allItems: this.itemsList.allItems
            };

            return this.manifest;
        } catch (error) {
            console.error('Error loading manifests:', error);
            throw error;
        }
    }

    /**
     * Loads information specific to a farm (available dates)
     * @param {string} farmId - Farm ID
     */
    async loadFarmInfo(farmId) {
        const cacheKey = `farmInfo-${farmId}`;
        const cachedData = this.getFromCache(cacheKey);
        if (cachedData) {
            console.log(`Data loaded from cache for farm ${farmId}`);
            return cachedData;
        }

        try {
            const infoPath = `${CONFIG.FARM_INFO_PATH.replace('{farmId}', farmId)}`; // No timestamp
            const response = await fetch(infoPath);
            if (!response.ok) {
                throw new Error(`Unable to load information for farm ${farmId}.`);
            }
            const farmInfo = await response.json();
            this.farmInfos[farmId] = farmInfo;

            // Update manifest to maintain compatibility
            if (!this.manifest.farms[farmId].available_dates) {
                this.manifest.farms[farmId].available_dates = farmInfo.available_dates;
            }

            this.addToCache(cacheKey, farmInfo); // Add data to cache
            return farmInfo;
        } catch (error) {
            console.error(`Error loading information for farm ${farmId}:`, error);
            throw error;
        }
    }

    /**
     * Returns the list of available farms
     */
    getFarmsList() {
        if (!this.farmsList) return [];
        
        return Object.keys(this.farmsList.farms).map(farmId => {
            return {
                id: farmId,
                username: this.farmsList.farms[farmId].username
            };
        });
    }

    /**
     * Selects a farm by its ID and loads its data
     * @param {string} farmId - ID of the farm to select
     */
    async selectFarm(farmId) {
        if (!this.farmsList || !this.farmsList.farms[farmId]) {
            throw new Error(`Farm with ID ${farmId} not found.`);
        }
        
        this.selectedFarm = farmId;
        const farmBasicInfo = this.farmsList.farms[farmId];
        
        // Load farm information (available dates)
        const farmInfo = await this.loadFarmInfo(farmId);
        
        // Check if dates are available
        if (!farmInfo.available_dates || farmInfo.available_dates.length === 0) {
            throw new Error(`No data available for farm ${farmId}.`);
        }
        
        // Find the most recent available date
        const sortedDates = [...farmInfo.available_dates].sort().reverse();
        const mostRecentDate = sortedDates[0];
        
        // Load data for the most recent date
        const farmData = await this.loadFarmDataForDate(farmId, mostRecentDate);
        
        // Get username from farm's basic data
        const username = farmBasicInfo.username;
        
        // Initialize default date range
        this.setDateRangeByDays(30, mostRecentDate);
        
        // Identify all available items in inventory
        this.identifyAvailableItems();
        
        return {
            farmId,
            username,
            mostRecentDate,
            availableItems: this.getAvailableItems()
        };
    }

    /**
     * Loads farm data for a specific date
     * @param {string} farmId - Farm ID
     * @param {string} dateString - Date in YYYY-MM-DD format
     */
    async loadFarmDataForDate(farmId, dateString) {
        const cacheKey = `farmData-${farmId}-${dateString}`;
        const cachedData = this.getFromCache(cacheKey);
        if (cachedData) {
            if (CONFIG.DEBUG_MODE) {
                console.log(`Data loaded from cache for farm ${farmId} on date ${dateString}`);
            }
            return cachedData;
        }

        if (this.farmData[farmId]?.[dateString]) {
            return this.farmData[farmId][dateString];
        }

        try {
            const filePath = `${CONFIG.FARM_DATA_PATH}${farmId}/${dateString}.json`; // No timestamp
            // Masquer l'URL sensible dans la console
            if (CONFIG.DEBUG_MODE) {
                console.log(`Chargement des données pour ${dateString}...`);
            }
            const response = await fetch(filePath);
            if (!response.ok) {
                console.warn(`Données non trouvées pour la date ${dateString}`);
                return {
                    farm: {
                        username: this.manifest.farms[farmId].username,
                        inventory: {}
                    }
                };
            }
            const data = await response.json();
            if (!this.farmData[farmId]) {
                this.farmData[farmId] = {};
            }
            this.farmData[farmId][dateString] = data;
            this.addToCache(cacheKey, data); // Add data to cache
            return data;
        } catch (error) {
            console.error(`Error loading data for ${farmId} on date ${dateString}:`, error);
            return {
                farm: {
                    username: this.manifest.farms[farmId].username,
                    inventory: {}
                }
            };
        }
    }

    /**
     * Loads data for a specific date range
     * @param {string} farmId - Farm ID
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     */
    async loadFarmDataForDateRange(farmId, startDate, endDate) {
        if (!this.farmsList || !this.farmsList.farms[farmId]) {
            throw new Error(`Farm with ID ${farmId} not found.`);
        }
        
        // Ensure farm information is loaded
        if (!this.farmInfos[farmId]) {
            await this.loadFarmInfo(farmId);
        }
        
        // Convert dates to YYYY-MM-DD strings for comparison
        const startStr = this.formatDate(startDate);
        const endStr = this.formatDate(endDate);
        
        // Filter available dates within the specified range
        const availableDates = this.farmInfos[farmId].available_dates
            .filter(date => date >= startStr && date <= endStr)
            .sort();
        
        if (availableDates.length === 0) {
            console.warn(`No data available for farm ${farmId} between ${startStr} and ${endStr}`);
            return [];
        }
        
        // First check which files actually exist
        const existingDates = [];
        
        // Load data for each available date
        for (const date of availableDates) {
            try {
                const data = await this.loadFarmDataForDate(farmId, date);
                if (data && (data.farm || data.inventory)) {
                    // If we have valid data, add the date to the list
                    existingDates.push(date);
                }
            } catch (error) {
                console.warn(`Error loading data for date ${date}:`, error);
            }
        }
        
        return existingDates;
    }

    /**
     * Set date range based on a number of days preceding a reference date
     * @param {number} days - Number of days to include
     * @param {string} referenceDate - Reference date (format YYYY-MM-DD), uses most recent date by default
     */
    setDateRangeByDays(days, referenceDate = null) {
        if (!this.selectedFarm || !this.manifest.farms[this.selectedFarm]) {
            throw new Error('No farm selected.');
        }
        
        const farmInfo = this.manifest.farms[this.selectedFarm];
        
        // If no reference date is provided, use the most recent date
        if (!referenceDate) {
            const sortedDates = [...farmInfo.available_dates].sort().reverse();
            if (sortedDates.length === 0) {
                throw new Error('No data available for this farm.');
            }
            referenceDate = sortedDates[0];
        }
        
        // Convert the reference date to a Date object
        const refDate = new Date(referenceDate);
        
        // Calculate start date (X days before reference date)
        const startDate = new Date(refDate);
        startDate.setDate(refDate.getDate() - days);
        
        this.dateRange = {
            start: startDate,
            end: refDate
        };
        
        return this.dateRange;
    }

    /**
     * Set custom date range
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     */
    setCustomDateRange(startDate, endDate) {
        if (startDate > endDate) {
            throw new Error('Start date must be before end date.');
        }
        
        this.dateRange = {
            start: startDate,
            end: endDate
        };
        
        return this.dateRange;
    }

    /**
     * Identifies all available items in inventory
     * Uses the item list from items.json file
     */
    identifyAvailableItems() {
        if (!this.itemsList) {
            return [];
        }
        
        this.availableItems = new Set(this.itemsList.allItems);
        
        return Array.from(this.availableItems);
    }

    /**
     * Returns available items, optionally filtered and grouped by category
     * @param {string} filter - Text filter (optional)
     * @param {boolean} groupByCategory - If true, groups items by category
     */
    getAvailableItems(filter = '', groupByCategory = true) {
        if (!this.manifest || this.availableItems.size === 0) {
            return groupByCategory ? {} : [];
        }
        
        const items = Array.from(this.availableItems);
        
        // Apply filter if provided
        const filteredItems = filter 
            ? items.filter(item => item.toLowerCase().includes(filter.toLowerCase())) 
            : items;
            
        // If no category grouping, simply return the filtered list
        if (!groupByCategory) {
            return filteredItems;
        }
        
        // Group by category using the new CONFIG.CATEGORIES structure
        const groupedItems = {};
        
        // Initialize all categories
        CONFIG.CATEGORY_ORDER.forEach(categoryKey => {
            if (CONFIG.CATEGORIES[categoryKey]) {
                groupedItems[categoryKey] = {
                    name: CONFIG.CATEGORIES[categoryKey].name,
                    items: []
                };
            }
        });
        
        // Associate each item with its category
        filteredItems.forEach(itemName => {
            let categorized = false;
            
            // Search in each category
            for (const categoryKey of CONFIG.CATEGORY_ORDER) {
                if (CONFIG.CATEGORIES[categoryKey] && CONFIG.CATEGORIES[categoryKey].items.includes(itemName)) {
                    groupedItems[categoryKey].items.push(itemName);
                    categorized = true;
                    break;
                }
            }
            
            // If the item doesn't belong to any defined category, put it in "Other"
            if (!categorized) {
                groupedItems['Other'].items.push(itemName);
            }
        });
        
        return groupedItems;
    }

    /**
     * Adds or removes an item from the list of selected items
     * @param {string} itemName - Item name
     * @param {boolean} selected - Whether the item is selected or not
     */
    toggleItemSelection(itemName, selected) {
        if (selected) {
            this.selectedItems.add(itemName);
        } else {
            this.selectedItems.delete(itemName);
        }
        
        return Array.from(this.selectedItems);
    }

    /**
     * Selects or deselects all available items
     * @param {boolean} select - If true, selects all items; if false, deselects all
     */
    selectAllItems(select = true) {
        if (select) {
            this.availableItems.forEach(item => this.selectedItems.add(item));
        } else {
            this.selectedItems.clear();
        }
        
        return Array.from(this.selectedItems);
    }

    /**
     * Gets data for a chart of selected items over the current date range
     */
    async getChartData() {
        if (!this.selectedFarm || this.selectedItems.size === 0) {
            return null;
        }
        
        // Load all necessary data for the date range
        const availableDates = await this.loadFarmDataForDateRange(
            this.selectedFarm,
            this.dateRange.start,
            this.dateRange.end
        );
        
        if (availableDates.length === 0) {
            console.warn("No data available for the selected date range");
            return {
                labels: [],
                datasets: []
            };
        }
        
        // Prepare chart data
        const chartData = {
            labels: availableDates,
            datasets: []
        };
        
        // For each selected item, create a dataset
        const selectedItemsArray = Array.from(this.selectedItems);
        selectedItemsArray.forEach((itemName, index) => {
            // Use item-specific color if available, otherwise use a default color
            const itemColor = CONFIG.ITEM_COLORS[itemName] || CONFIG.CHART_COLORS[index % CONFIG.CHART_COLORS.length];
            
            const itemData = {
                label: itemName,
                data: [],
                borderColor: itemColor,
                backgroundColor: itemColor.includes('rgb') 
                    ? itemColor.replace('rgb', 'rgba').replace(')', ', 0.2)')
                    : `${itemColor}33`, // Adds transparency
                borderWidth: 2,
                tension: 0.1
            };
            
            // Collect quantities for each date
            availableDates.forEach(date => {
                // Check if data exists for this date
                if (!this.farmData[this.selectedFarm] || !this.farmData[this.selectedFarm][date]) {
                    itemData.data.push(0);
                    return;
                }
                
                const farmData = this.farmData[this.selectedFarm][date];
                
                // Special handling for 'coins' and 'FLOWER' which are stored differently
                let quantity = 0;
                
                if (itemName === 'coins' && farmData && farmData.farm && farmData.farm.coins) {
                    // Coins are directly in farm.coins
                    quantity = parseFloat(farmData.farm.coins) || 0;
                } else if (itemName === 'FLOWER' && farmData && farmData.farm && farmData.farm.balance) {
                    // FLOWER are in farm.balance
                    quantity = parseFloat(farmData.farm.balance) || 0;
                } else {
                    // Other items in inventory
                    const inventory = farmData && farmData.farm ? farmData.farm.inventory : 
                                    (farmData ? farmData.inventory : {});
                    
                    quantity = inventory && inventory[itemName] 
                        ? parseFloat(inventory[itemName]) 
                        : 0;
                }
                    
                itemData.data.push(quantity);
            });
            
            chartData.datasets.push(itemData);
        });
        
        return chartData;
    }

    /**
     * Calculates statistics for selected items over the current date range
     */
    async getStatistics() {
        if (!this.selectedFarm || this.selectedItems.size === 0) {
            return [];
        }
        
        // Ensure all data is loaded
        const availableDates = await this.loadFarmDataForDateRange(
            this.selectedFarm,
            this.dateRange.start,
            this.dateRange.end
        );
        
        if (availableDates.length === 0) {
            console.warn("No data available for the selected date range");
            return [];
        }
        
        // If only one date is available, use that date for start and end statistics
        const firstDate = availableDates[0];
        const lastDate = availableDates.length > 1 ? availableDates[availableDates.length - 1] : firstDate;
        
        // Check if data exists for start and end dates
        if (!this.farmData[this.selectedFarm] || 
            !this.farmData[this.selectedFarm][firstDate]) {
            console.warn("Missing data for statistics calculation");
            return [];
        }
        
        const stats = [];
        
        // For each selected item, calculate statistics
        this.selectedItems.forEach(itemName => {
            // Start and end values
            const firstData = this.farmData[this.selectedFarm][firstDate];
            // If only one date is available or if end data is missing, use start data
            const lastData = (availableDates.length > 1 && this.farmData[this.selectedFarm][lastDate]) 
                          ? this.farmData[this.selectedFarm][lastDate] 
                          : firstData;
            
            // Initialize start and end values
            let startValue = 0;
            let endValue = 0;
            let highestValue = Number.NEGATIVE_INFINITY;
            let lowestValue = Number.POSITIVE_INFINITY;
            
            // Special handling for 'coins' and 'FLOWER' which are stored differently
            if (itemName === 'coins') {
                // Coins are directly in farm.coins
                startValue = firstData && firstData.farm ? parseFloat(firstData.farm.coins) || 0 : 0;
                endValue = lastData && lastData.farm ? parseFloat(lastData.farm.coins) || 0 : 0;
            } else if (itemName === 'FLOWER') {
                // FLOWER are in farm.balance
                startValue = firstData && firstData.farm ? parseFloat(firstData.farm.balance) || 0 : 0;
                endValue = lastData && lastData.farm ? parseFloat(lastData.farm.balance) || 0 : 0;
            } else {
                // Other items in inventory
                const firstInventory = firstData && firstData.farm ? firstData.farm.inventory : 
                                    (firstData ? firstData.inventory : {});
                                    
                const lastInventory = lastData && lastData.farm ? lastData.farm.inventory :
                                    (lastData ? lastData.inventory : {});
                
                startValue = firstInventory && firstInventory[itemName] 
                    ? parseFloat(firstInventory[itemName]) 
                    : 0;
                    
                endValue = lastInventory && lastInventory[itemName] 
                    ? parseFloat(lastInventory[itemName]) 
                    : 0;
            }
            
            // Go through all dates to find min and max
            for (const dateStr of availableDates) {
                const dateData = this.farmData[this.selectedFarm][dateStr];
                if (!dateData) continue;
                
                let value = 0;
                
                if (itemName === 'coins') {
                    value = dateData && dateData.farm ? parseFloat(dateData.farm.coins) || 0 : 0;
                } else if (itemName === 'FLOWER') {
                    value = dateData && dateData.farm ? parseFloat(dateData.farm.balance) || 0 : 0;
                } else {
                    const inventory = dateData && dateData.farm ? dateData.farm.inventory : 
                                    (dateData ? dateData.inventory : {});
                    
                    value = inventory && inventory[itemName] 
                        ? parseFloat(inventory[itemName]) 
                        : 0;
                }
                
                // Update min and max
                if (value > highestValue) highestValue = value;
                if (value < lowestValue) lowestValue = value;
            }
            
            // If no value was found, set min to 0 (instead of +Infinity)
            if (lowestValue === Number.POSITIVE_INFINITY) lowestValue = 0;
            // If no value was found, set max to 0 (instead of -Infinity)
            if (highestValue === Number.NEGATIVE_INFINITY) highestValue = 0;
                
            // Calculate changes (if only one date, changes will be 0)
            const absoluteChange = endValue - startValue;
            const percentageChange = startValue !== 0 
                ? (absoluteChange / startValue) * 100 
                : (endValue > 0 ? 100 : 0); // If initial value is 0, consider either 100% (if > 0) or 0%
                
            stats.push({
                itemName,
                startValue,
                endValue,
                highestValue,
                lowestValue,
                absoluteChange,
                percentageChange
            });
        });
        
        return stats;
    }

    /**
     * Formats a date as a YYYY-MM-DD string
     * @param {Date} date - Date to format
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}

// Create a global instance of the data manager
const dataManager = new DataManager();