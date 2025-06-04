/**
 * Main application Sunflower Land Inventory Tracker
 */
class App {
    constructor() {
        // References to DOM elements
        this.farmSelector = document.getElementById('farm-selector');
        this.dateRangeSelector = document.getElementById('date-range-selector');
        this.customDateContainer = document.getElementById('custom-date-container');
        this.startDateInput = document.getElementById('start-date');
        this.endDateInput = document.getElementById('end-date');
        this.applyCustomDateBtn = document.getElementById('apply-custom-date');
        this.itemSearchInput = document.getElementById('item-search');
        this.selectAllCheckbox = document.getElementById('select-all');
        this.itemList = document.getElementById('item-list');

        // Application state
        this.currentFilter = '';
        this.categoryCheckboxes = new Map(); // To track category checkboxes
        
        // Bind event handlers
        this.bindEventHandlers();
    }

    /**
     * Initializes the application
     */
    async initialize() {
        try {
            // Load data manifest
            await dataManager.loadManifest();
            
            // Populate farm selector
            this.populateFarmSelector();
            
            // Display welcome message
            this.displayWelcomeMessage();
        } catch (error) {
            console.error('Initialization error:', error);
            this.displayError('Error initializing the application: ' + error.message);
        }
    }

    /**
     * Binds all event handlers
     */
    bindEventHandlers() {
        // Handler for farm change
        this.farmSelector.addEventListener('change', () => this.handleFarmChange());
        
        // Handler for date range change
        this.dateRangeSelector.addEventListener('change', () => this.handleDateRangeChange());
        
        // Handler for custom date range
        this.applyCustomDateBtn.addEventListener('click', () => this.handleCustomDateApply());
        
        // Handler for item search
        this.itemSearchInput.addEventListener('input', (e) => this.handleItemSearch(e.target.value));
        
        // Handler for "Select all" checkbox
        this.selectAllCheckbox.addEventListener('change', (e) => this.handleSelectAll(e.target.checked));
    }

    /**
     * Populates farm selector with manifest data
     */
    populateFarmSelector() {
        const farms = dataManager.getFarmsList();
        
        if (farms.length === 0) {
            this.displayError('No farms available in the manifest.');
            return;
        }
        
        // Clear the selector (except the default option)
        while (this.farmSelector.options.length > 1) {
            this.farmSelector.remove(1);
        }
        
        // Add options for each farm
        farms.forEach(farm => {
            const option = document.createElement('option');
            option.value = farm.id;
            option.textContent = `${farm.username} (ID: ${farm.id})`;
            this.farmSelector.appendChild(option);
        });
    }

    /**
     * Handles farm selection change
     */
    async handleFarmChange() {
        const farmId = this.farmSelector.value;
        
        if (!farmId) {
            // No farm selected, display welcome message
            this.displayWelcomeMessage();
            return;
        }
        
        try {
            // Select farm and load its data
            const farmInfo = await dataManager.selectFarm(farmId);
            
            // Update interface with available inventory items
            this.populateItemList();
            
            // Reset date range selector
            this.dateRangeSelector.value = '30';
            this.showCustomDateContainer(false);
            
            // Update date range
            dataManager.setDateRangeByDays(30, farmInfo.mostRecentDate);
            
            // Initialize custom dates
            this.initializeCustomDateInputs();
            
            // Display farm welcome message
            this.displayFarmWelcome(farmInfo);
        } catch (error) {
            console.error('Error when changing farm:', error);
            this.displayError('Error loading farm: ' + error.message);
        }
    }

    /**
     * Handles date range change
     */
    async handleDateRangeChange() {
        const value = this.dateRangeSelector.value;
        
        // Show or hide custom range container
        if (value === 'custom') {
            this.showCustomDateContainer(true);
            return;
        }
        
        this.showCustomDateContainer(false);
        
        // If no farm selected, ignore
        if (!dataManager.selectedFarm) return;
        
        try {
            // Update date range
            const days = parseInt(value, 10);
            dataManager.setDateRangeByDays(days);
            
            // Update chart and statistics if items are selected
            if (dataManager.selectedItems.size > 0) {
                await chartManager.refreshChart();
                await chartManager.updateStatistics();
            }
        } catch (error) {
            console.error('Error when changing date range:', error);
            this.displayError('Error updating date range: ' + error.message);
        }
    }

    /**
     * Shows or hides the custom date container
     * @param {boolean} show - Show or hide
     */
    showCustomDateContainer(show) {
        // Get parent control panel
        const controlsPanel = document.querySelector('.controls-panel');
        
        // Show or hide the entire control panel
        if (controlsPanel) {
            controlsPanel.style.display = show ? 'flex' : 'none';
        }
        
        // Also show or hide custom date container
        this.customDateContainer.style.display = show ? 'flex' : 'none';
        
        // Add or remove a class on body to adjust layout
        if (show) {
            document.body.classList.add('custom-date-active');
        } else {
            document.body.classList.remove('custom-date-active');
        }
    }

    /**
     * Initializes custom date input fields
     */
    initializeCustomDateInputs() {
        if (!dataManager.selectedFarm || !dataManager.manifest.farms[dataManager.selectedFarm]) {
            return;
        }
        
        const farmInfo = dataManager.manifest.farms[dataManager.selectedFarm];
        
        // Find min and max available dates
        const dates = [...farmInfo.available_dates].sort();
        if (dates.length === 0) return;
        
        const minDate = dates[0];
        const maxDate = dates[dates.length - 1];
        
        // Set default values and limits
        this.startDateInput.min = minDate;
        this.startDateInput.max = maxDate;
        this.startDateInput.value = minDate;
        
        this.endDateInput.min = minDate;
        this.endDateInput.max = maxDate;
        this.endDateInput.value = maxDate;
    }

    /**
     * Handles custom date range application
     */
    async handleCustomDateApply() {
        const startDate = new Date(this.startDateInput.value);
        const endDate = new Date(this.endDateInput.value);
        
        if (isNaN(startDate) || isNaN(endDate)) {
            alert('Please enter valid dates.');
            return;
        }
        
        if (startDate > endDate) {
            alert('Start date must be before end date.');
            return;
        }
        
        try {
            // Update date range
            dataManager.setCustomDateRange(startDate, endDate);
            
            // Update chart and statistics if items are selected
            if (dataManager.selectedItems.size > 0) {
                await chartManager.refreshChart();
                await chartManager.updateStatistics();
            }
        } catch (error) {
            console.error('Error when applying custom range:', error);
            this.displayError('Error updating date range: ' + error.message);
        }
    }

    /**
     * Handles item search
     * @param {string} searchText - Search text
     */
    handleItemSearch(searchText) {
        this.currentFilter = searchText;
        this.populateItemList();
    }

    /**
     * Populates the available items list, possibly filtered
     */
    populateItemList() {
        // Clear current list
        this.itemList.innerHTML = '';
        this.categoryCheckboxes.clear();
        
        // If no farm selected, display message
        if (!dataManager.selectedFarm) {
            this.itemList.innerHTML = '<p>Please select a farm to view its inventory.</p>';
            return;
        }
        
        // Get available items, filtered and grouped by category
        const groupedItems = dataManager.getAvailableItems(this.currentFilter);
        
        // Check if there are results
        const hasItems = Object.values(groupedItems).some(category => category.items && category.items.length > 0);
        
        if (!hasItems) {
            this.itemList.innerHTML = '<p>No items match your search.</p>';
            return;
        }

        // Update "Select all" checkbox
        this.updateSelectAllCheckbox();
        
        // Create item list by category in the order defined by CONFIG.CATEGORY_ORDER
        CONFIG.CATEGORY_ORDER.forEach(categoryKey => {
            const category = groupedItems[categoryKey];
            
            // Don't display empty categories
            if (!category || !category.items || category.items.length === 0) return;
            
            // Create category container
            const categoryContainer = document.createElement('div');
            categoryContainer.className = 'item-category-container';
            
            // Generate unique ID for category checkbox
            const categoryId = `category-${categoryKey.replace(/\s+/g, '-').toLowerCase()}`;
            
            // Check if all items in this category are selected
            const categoryItems = category.items;
            const allSelected = categoryItems.every(item => dataManager.selectedItems.has(item));
            const someSelected = categoryItems.some(item => dataManager.selectedItems.has(item));
            
            // Create checkbox and label for category
            const categoryCheckbox = document.createElement('input');
            categoryCheckbox.type = 'checkbox';
            categoryCheckbox.id = categoryId;
            categoryCheckbox.checked = allSelected;
            categoryCheckbox.indeterminate = !allSelected && someSelected;
            
            // Register checkbox in our Map for future reference
            this.categoryCheckboxes.set(categoryKey, {
                checkbox: categoryCheckbox,
                items: categoryItems
            });
            
            // Create label for category
            const categoryLabel = document.createElement('label');
            categoryLabel.htmlFor = categoryId;
            categoryLabel.className = 'item-category-label';
            categoryLabel.appendChild(categoryCheckbox);
            categoryLabel.appendChild(document.createTextNode(category.name));
            
            // Add event handler to category checkbox
            categoryCheckbox.addEventListener('change', (e) => this.handleCategorySelection(e.target, categoryKey));
            
            categoryContainer.appendChild(categoryLabel);
            
            // Create container for items in this category
            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'item-category-content';
            
            // Add items for this category
            category.items.forEach(itemName => {
                const id = `item-${itemName.replace(/\s+/g, '-').toLowerCase()}`;
                
                // Create container for item
                const itemDiv = document.createElement('div');
                itemDiv.className = 'item-checkbox';
                
                // Add background color to item based on predefined color
                if (CONFIG.ITEM_COLORS[itemName]) {
                    const color = CONFIG.ITEM_COLORS[itemName];
                    // Convert RGB color to RGBA with transparency for background
                    if (color.startsWith('rgb(')) {
                        const rgbaColor = color.replace('rgb(', 'rgba(').replace(')', ', 0.2)');
                        itemDiv.style.backgroundColor = rgbaColor;
                        // Also add a thin border of original color
                        itemDiv.style.borderLeft = `3px solid ${color}`;
                    } else {
                        // If color is hex or another format
                        itemDiv.style.backgroundColor = `${color}33`; // Add 33 for 20% opacity in hex
                        itemDiv.style.borderLeft = `3px solid ${color}`;
                    }
                    
                    // Add class to mark this item as colored
                    itemDiv.classList.add('colored-item-container');
                }
                
                // Create checkbox
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = id;
                checkbox.value = itemName;
                checkbox.checked = dataManager.selectedItems.has(itemName);
                
                // Create label and add checkbox inside
                const label = document.createElement('label');
                label.htmlFor = id;
                label.className = 'item-checkbox-label';
                
                // Add checkbox and text to label
                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(itemName));
                
                // Add event handler to checkbox
                checkbox.addEventListener('change', (e) => this.handleItemSelection(e.target, categoryKey));
                
                // Add only the label (which now contains the checkbox) to parent div
                itemDiv.appendChild(label);
                itemsContainer.appendChild(itemDiv);
                
                // Apply initial style
                if (checkbox.checked) {
                    itemDiv.classList.add('selected'); // Apply class to container
                    label.classList.add('selected');
                }
            });
            
            // Add items to category container
            categoryContainer.appendChild(itemsContainer);
            
            // Add category container to list
            this.itemList.appendChild(categoryContainer);
        });
    }
    
    /**
     * Handles category selection
     * @param {HTMLInputElement} checkbox - Category checkbox
     * @param {string} categoryKey - Category key
     */
    async handleCategorySelection(checkbox, categoryKey) {
        const selected = checkbox.checked;
        const categoryInfo = this.categoryCheckboxes.get(categoryKey);
        
        if (!categoryInfo) {
            console.error(`Category not found: ${categoryKey}`);
            return;
        }
        
        // Update checkboxes for items in this category
        const itemCheckboxes = this.itemList.querySelectorAll(`.item-category-container:has(#category-${categoryKey.replace(/\s+/g, '-').toLowerCase()}) input[type="checkbox"]:not([id^="category-"])`);
        
        // Update each item
        itemCheckboxes.forEach(itemCheckbox => {
            itemCheckbox.checked = selected;
            
            // Update selection state in data manager
            dataManager.toggleItemSelection(itemCheckbox.value, selected);
            
            // Update style
            this.updateItemSelectionStyle(itemCheckbox);
        });
        
        // Update "Select all" checkbox
        this.updateSelectAllCheckbox();
        
        // Update chart and statistics
        if (dataManager.selectedItems.size > 0) {
            // If items are selected, remove welcome messages
            this.removeWelcomeMessages();
            await chartManager.refreshChart();
            await chartManager.updateStatistics();
        } else {
            // If no items are selected, display welcome message
            if (dataManager.selectedFarm) {
                const farmInfo = {
                    farmId: dataManager.selectedFarm,
                    username: dataManager.manifest.farms[dataManager.selectedFarm].username,
                    mostRecentDate: [...dataManager.manifest.farms[dataManager.selectedFarm].available_dates].sort().reverse()[0]
                };
                this.displayFarmWelcome(farmInfo);
            } else {
                this.displayWelcomeMessage();
            }
            chartManager.clearChart();
            chartManager.renderStatistics([]);
        }
    }
    
    /**
     * Handles item selection
     * @param {HTMLInputElement} checkbox - Item checkbox
     * @param {string} categoryKey - Category key of the item
     */
    async handleItemSelection(checkbox, categoryKey) {
        const itemName = checkbox.value;
        const selected = checkbox.checked;
        
        // Update selection in data manager
        dataManager.toggleItemSelection(itemName, selected);
        
        // Update style
        const label = checkbox.closest('label');
        const itemDiv = label.closest('.item-checkbox');
        
        if (label && itemDiv) {
            if (selected) {
                label.classList.add('selected');
                itemDiv.classList.add('selected');
            } else {
                label.classList.remove('selected');
                itemDiv.classList.remove('selected');
            }
        }
        
        // Update category checkbox state
        this.updateCategoryCheckbox(categoryKey);
        
        // Update "Select all" checkbox
        this.updateSelectAllCheckbox();
        
        // Update chart and statistics
        if (dataManager.selectedItems.size > 0) {
            // If items are selected, remove welcome messages
            this.removeWelcomeMessages();
            await chartManager.refreshChart();
            await chartManager.updateStatistics();
        } else {
            // If no items are selected, display welcome message
            if (dataManager.selectedFarm) {
                const farmInfo = {
                    farmId: dataManager.selectedFarm,
                    username: dataManager.manifest.farms[dataManager.selectedFarm].username,
                    mostRecentDate: [...dataManager.manifest.farms[dataManager.selectedFarm].available_dates].sort().reverse()[0]
                };
                this.displayFarmWelcome(farmInfo);
            } else {
                this.displayWelcomeMessage();
            }
            chartManager.clearChart();
            chartManager.renderStatistics([]);
        }
    }
    
    /**
     * Updates the state of a category checkbox based on its items' state
     * @param {string} categoryKey - Category key
     */
    updateCategoryCheckbox(categoryKey) {
        const categoryInfo = this.categoryCheckboxes.get(categoryKey);
        if (!categoryInfo) return;
        
        const { checkbox, items } = categoryInfo;
        
        // Check if all items are selected
        const allSelected = items.every(item => dataManager.selectedItems.has(item));
        // Check if some items are selected
        const someSelected = items.some(item => dataManager.selectedItems.has(item));
        
        // Update category checkbox
        checkbox.checked = allSelected;
        checkbox.indeterminate = !allSelected && someSelected;
    }
    
    /**
     * Updates the state of the "Select all" checkbox
     */
    updateSelectAllCheckbox() {
        if (!this.selectAllCheckbox) return;
        
        if (dataManager.availableItems.size === 0) {
            this.selectAllCheckbox.checked = false;
            this.selectAllCheckbox.indeterminate = false;
            return;
        }
        
        // Check if all available items are selected
        const allSelected = [...dataManager.availableItems].every(item => dataManager.selectedItems.has(item));
        // Check if some items are selected
        const someSelected = dataManager.selectedItems.size > 0;
        
        // Update "Select all" checkbox
        this.selectAllCheckbox.checked = allSelected;
        this.selectAllCheckbox.indeterminate = !allSelected && someSelected;
        
        // Update label style
        const label = this.selectAllCheckbox.closest('label');
        if (label) {
            if (allSelected || someSelected) {
                label.classList.add('selected');
            } else {
                label.classList.remove('selected');
            }
        }
    }
    
    /**
     * Handles selecting/deselecting all items
     * @param {boolean} select - Select (true) or deselect (false)
     */
    async handleSelectAll(select) {
        dataManager.selectAllItems(select);
        
        // Update all item checkboxes
        const itemCheckboxes = this.itemList.querySelectorAll('input[type="checkbox"]:not([id^="category-"]):not(#select-all)');
        itemCheckboxes.forEach(checkbox => {
            checkbox.checked = select;
            this.updateItemSelectionStyle(checkbox);
        });
        
        // Update all category checkboxes
        this.categoryCheckboxes.forEach((info, key) => {
            info.checkbox.checked = select;
            info.checkbox.indeterminate = false;
        });
        
        // Update "Select all" label style
        const label = this.selectAllCheckbox.closest('label');
        if (label) {
            if (select) {
                label.classList.add('selected');
            } else {
                label.classList.remove('selected');
            }
        }
        
        // Update chart and statistics
        if (select && dataManager.selectedItems.size > 0) {
            // If items are selected, remove welcome messages
            this.removeWelcomeMessages();
            await chartManager.refreshChart();
            await chartManager.updateStatistics();
        } else {
            // If no items are selected, display farm-specific welcome message
            if (dataManager.selectedFarm) {
                const farmInfo = {
                    farmId: dataManager.selectedFarm,
                    username: dataManager.manifest.farms[dataManager.selectedFarm].username,
                    mostRecentDate: [...dataManager.manifest.farms[dataManager.selectedFarm].available_dates].sort().reverse()[0]
                };
                this.displayFarmWelcome(farmInfo);
            } else {
                this.displayWelcomeMessage();
            }
            chartManager.clearChart();
            chartManager.renderStatistics([]);
        }
    }
    
    /**
     * Updates the style of an item based on its selection
     * @param {HTMLInputElement} checkbox - Item checkbox
     */
    updateItemSelectionStyle(checkbox) {
        const label = checkbox.closest('label');
        if (label) {
            const itemDiv = label.closest('.item-checkbox');
            
            if (checkbox.checked) {
                label.classList.add('selected');
                if (itemDiv) itemDiv.classList.add('selected');
            } else {
                label.classList.remove('selected');
                if (itemDiv) itemDiv.classList.remove('selected');
            }
        }
    }

    /**
     * Displays general welcome message
     */
    displayWelcomeMessage() {
        const chartElement = document.getElementById('inventory-chart');
        if (!chartElement) {
            console.error("Element 'inventory-chart' not found in DOM");
            return;
        }
        
        // Find chart container
        const chartContainer = document.querySelector('.chart-container');
        if (!chartContainer) {
            console.error("Container .chart-container not found");
            return;
        }
        
        const farmCount = dataManager.farmsList ? Object.keys(dataManager.farmsList.farms).length : 0;
        const itemCount = dataManager.itemsList ? dataManager.itemsList.allItems.length : 0;
        
        // Clear existing chart if present
        if (chartManager.chart) {
            chartManager.chart.destroy();
            chartManager.chart = null;
        }
        
        // Create welcome message element
        const messageDiv = document.createElement('div');
        messageDiv.className = 'welcome-message';
        messageDiv.innerHTML = `
            <h2>Welcome to SFLventory</h2>
            <p>This application allows you to track your inventory evolution in Sunflower Land.</p>
            <p>We currently have ${farmCount} farms and ${itemCount} inventory items available for tracking.</p>
            <p>To get started, please select a farm from the dropdown menu at the top of the page.</p>
            <div class="connection-options">
                <div class="telegram-option">
                    <p class="telegram-notice"><strong>💬 Don't see your farm?</strong> You can add your farm to our tracking system using the Telegram bot <a href="https://t.me/SLFventory_bot" target="_blank">@SLFventory_bot</a>.</p>
                </div>
                <div class="metamask-option">
                    <div class="metamask-highlight">
                        <h3>🦊 Connect with MetaMask</h3>
                        <p><strong>Connect with MetaMask and start tracking your farm statistics!</strong></p>
                        <p>If you connect daily, an automatic backup will be created and you can watch your farm evolution over time.</p>
                        <p class="metamask-cta">👇 Scroll down to connect your wallet and start tracking!</p>
                    </div>
                </div>
            </div>
        `;
        
        // Remove any existing messages
        const existingMessages = chartContainer.querySelectorAll('.welcome-message, .error-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Add new message to chart container only
        chartContainer.appendChild(messageDiv);
        
        // Reset statistics
        const statsElement = document.getElementById('statistics-content');
        if (statsElement) {
            statsElement.innerHTML = '';
        }
        
        // Reset item list
        if (this.itemList) {
            this.itemList.innerHTML = '<p>Please select a farm to view its inventory.</p>';
        }
    }

    /**
     * Displays farm-specific welcome message
     * @param {Object} farmInfo - Farm information
     */
    displayFarmWelcome(farmInfo) {
        const chartElement = document.getElementById('inventory-chart');
        if (!chartElement) {
            console.error("Element 'inventory-chart' not found in DOM");
            return;
        }
        
        // Find chart container directly
        const chartContainer = document.querySelector('.chart-container');
        if (!chartContainer) {
            console.error("Container .chart-container not found");
            return;
        }
        
        // Clear existing chart if present
        if (chartManager.chart) {
            chartManager.chart.destroy();
            chartManager.chart = null;
        }
        
        // Create welcome message element
        const messageDiv = document.createElement('div');
        messageDiv.className = 'welcome-message';
        messageDiv.innerHTML = `
            <h2>${farmInfo.username}'s Farm (ID: ${farmInfo.farmId})</h2>
            <p>The tracking system contains ${dataManager.itemsList.allItems.length} possible inventory items.</p>
            <p>Last updated: ${farmInfo.mostRecentDate}</p>
            <p>To display data, please select one or more items from the inventory list on the left.</p>
            <div class="connection-options">
                <div class="telegram-option">
                    <p class="telegram-notice"><strong>💬 Don't see your farm?</strong> You can add your farm to our tracking system using the Telegram bot <a href="https://t.me/SLFventory_bot" target="_blank">@SLFventory_bot</a>.</p>
                </div>
                <div class="metamask-option">
                    <div class="metamask-highlight">
                        <h3>🦊 Connect with MetaMask</h3>
                        <p><strong>Connect with MetaMask and start tracking your farm statistics!</strong></p>
                        <p>If you connect daily, an automatic backup will be created and you can watch your farm evolution over time.</p>
                        <p class="metamask-cta">👇 Scroll down to connect your wallet and start tracking!</p>
                    </div>
                </div>
            </div>
        `;
        
        // Remove any existing messages
        const existingMessages = chartContainer.querySelectorAll('.welcome-message, .error-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Add new message to chart container only
        chartContainer.appendChild(messageDiv);
        
        // Reset statistics without hiding them
        const statsElement = document.getElementById('statistics-content');
        if (statsElement) {
            statsElement.innerHTML = '';
        }
    }

    /**
     * Removes welcome messages from the DOM
     */
    removeWelcomeMessages() {
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
            const welcomeMessages = chartContainer.querySelectorAll('.welcome-message, .error-message');
            welcomeMessages.forEach(msg => msg.remove());
        }
    }

    /**
     * Displays general error message
     * @param {string} message - Error message
     */
    displayError(message) {
        const chartElement = document.getElementById('inventory-chart');
        if (!chartElement) {
            console.error("Element 'inventory-chart' not found in DOM");
            console.error("Error message not displayed:", message);
            return;
        }
        
        const container = chartElement.closest('.chart-section');
        if (!container) {
            console.error("Parent container for 'inventory-chart' not found");
            console.error("Error message not displayed:", message);
            return;
        }
        
        // Clear existing chart if present
        if (chartManager.chart) {
            chartManager.chart.destroy();
            chartManager.chart = null;
        }
        
        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <h2>Error</h2>
            <p>${message}</p>
        `;
        
        // Find chart container
        const chartContainer = container.querySelector('.chart-container');
        if (!chartContainer) {
            console.error("Container .chart-container not found");
            return;
        }
        
        // Remove any existing messages
        const existingMessages = chartContainer.querySelectorAll('.welcome-message, .error-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Add new error message
        chartContainer.appendChild(errorDiv);
    }
}

// On document load, initialize application
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.initialize();
});