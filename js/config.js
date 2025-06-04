/**
 * Global configuration for Sunflower Land Inventory Tracker application
 */
const CONFIG = {
    // Debug mode - set to false to disable console logs
    DEBUG_MODE: false,
    
    // Paths to manifest files on S3
    FARMS_LIST_PATH: 'https://donnees-fermes-sunflower.s3.amazonaws.com/data/farms_list.json',
    ITEMS_LIST_PATH: 'https://donnees-fermes-sunflower.s3.amazonaws.com/data/items.json',
    FARM_INFO_PATH: 'https://donnees-fermes-sunflower.s3.amazonaws.com/data/{farmId}/info.json',
    SEASONS_PATH: 'https://donnees-fermes-sunflower.s3.eu-west-3.amazonaws.com/data/seasons.json',
    
    // Base path for farm data
    FARM_DATA_PATH: 'https://donnees-fermes-sunflower.s3.amazonaws.com/data/',
    
    // Chart colors
    CHART_COLORS: [
        '#4caf50', // Green
        '#2196f3', // Blue
        '#f44336', // Red
        '#ff9800', // Orange
        '#9c27b0', // Purple
        '#00bcd4', // Cyan
        '#ff5722', // Dark orange
        '#795548', // Brown
        '#607d8b', // Blue grey
        '#ffc107', // Yellow
    ],
    
    // Specific colors for items (CSS rgb format)
    ITEM_COLORS: {
        'coins': 'rgb(242, 177, 79)',
        'Gem': 'rgb(151, 228, 237)',
        'FLOWER': 'rgb(255, 182, 193)',
        'Mark': 'rgb(194, 203, 218)',
        'Love Charm': 'rgb(220, 20, 60)',
        'Sunflower': 'rgb(254, 249, 110)',
        'Potato': 'rgb(202, 123, 78)',
        'Rhubarb': 'rgb(200, 50, 80)',
        'Pumpkin': 'rgb(231, 125, 59)',
        'Zucchini': 'rgb(50, 120, 50)',
        'Carrot': 'rgb(242, 177, 79)', // Note: Same color as 'coins'
        'Yam': 'rgb(255, 130, 60)',
        'Cabbage': 'rgb(230, 124, 125)',
        'Broccoli': 'rgb(100, 160, 80)',
        'Soybean': 'rgb(82, 135, 79)',
        'Beetroot': 'rgb(169, 86, 134)',
        'Pepper': 'rgb(200, 30, 30)',
        'Cauliflower': 'rgb(224, 185, 155)',
        'Parsnip': 'rgb(230, 213, 175)',
        'Eggplant': 'rgb(98, 99, 132)',
        'Corn': 'rgb(239, 175, 78)',
        'Onion': 'rgb(150, 60, 90)',
        'Radish': 'rgb(208, 73, 73)',
        'Wheat': 'rgb(247, 221, 80)',
        'Turnip': 'rgb(255, 140, 160)',
        'Kale': 'rgb(82, 135, 79)', // Note: Same color as 'Soybean'
        'Artichoke': 'rgb(220, 190, 255)',
        'Barley': 'rgb(202, 123, 78)', // Note: Same color as 'Potato'
        'Tomato': 'rgb(203, 71, 71)',
        'Lemon': 'rgb(241, 231, 171)',
        'Blueberry': 'rgb(44, 94, 193)',
        'Orange': 'rgb(232, 168, 67)',
        'Apple': 'rgb(149, 49, 55)',
        'Banana': 'rgb(250, 232, 119)',
        'Wild Mushroom': 'rgb(255, 99, 132)',
        'Magic Mushroom': 'rgb(255, 206, 86)',
        'Grape': 'rgb(75, 192, 192)',
        'Rice': 'rgb(153, 102, 255)',
        'Olive': 'rgb(255, 159, 64)',
        'Egg': 'rgb(255, 206, 86)', // Note: Same color as 'Magic Mushroom'
        'Honey': 'rgb(255, 99, 132)', // Note: Same color as 'Wild Mushroom'
        'Leather': 'rgb(54, 162, 235)',
        'Wool': 'rgb(75, 192, 192)', // Note: Same color as 'Grape'
        'Merino Wool': 'rgb(153, 102, 255)', // Note: Same color as 'Rice'
        'Feather': 'rgb(194, 203, 218)', // Note: Same color as 'Mark'
        'Milk': 'rgb(142, 155, 178)',
        'Wood': 'rgb(174, 114, 86)',
        'Stone': 'rgb(142, 155, 178)', // Note: Same color as 'Milk'
        'Iron': 'rgb(200, 207, 204)',
        'Gold': 'rgb(241, 224, 128)',
        'Crimstone': 'rgb(203, 51, 43)',
        'Sunstone': 'rgb(255, 251, 0)',
        'Oil': 'rgb(40, 40, 40)',
        'Sprout Mix': 'rgb(2, 128, 2)',
        'Fruitful Blend': 'rgb(178, 34, 34)',
        'Rapid Root': 'rgb(0, 0, 204)', // Corrected from (0, 0, 0.8, 1)
        'Earthworm': 'rgb(163, 101, 84)', // Corrected from double parenthesis
        'Grub': 'rgb(133, 94, 66)',
        'Red Wiggler': 'rgb(165, 60, 53)'
        // Add other colors if necessary
    },
    
    // Category structure
    CATEGORIES: {
        'Balance': {
            'name': "Balance",
            'items': ['coins', 'Gem', 'FLOWER', 'Love Charm', 'Mark']
        },
        'basicCrops': {
            'name': "Basic Vegetables",
            'items': ['Sunflower', 'Potato', 'Rhubarb', 'Pumpkin', 'Zucchini']
        },
        'mediumCrops': {
            'name': "Medium Vegetables",
            'items': ['Carrot', 'Yam', 'Cabbage', 'Broccoli', 'Soybean', 'Beetroot', 'Pepper', 'Cauliflower', 'Parsnip']
        },
        'advancedCrops': {
            'name': "Advanced Vegetables",
            'items': ['Eggplant', 'Corn', 'Onion', 'Radish', 'Wheat', 'Turnip', 'Kale', 'Artichoke', 'Barley']
        },
        'fruits': {
            'name': "Fruits",
            'items': ['Tomato', 'Lemon', 'Blueberry', 'Orange', 'Apple', 'Banana']
        },
        'Mushroom': {
            'name': "Mushrooms",
            'items': ['Wild Mushroom', 'Magic Mushroom']
        },
        'serre': {
            'name': "Greenhouses",
            'items': ['Grape', 'Rice', 'Olive']
        },
        'Animals': {
            'name': "Animals",
            'items': ['Egg', 'Honey', 'Leather', 'Wool', 'Merino Wool', 'Feather', 'Milk']
        },
        'resources': {
            'name': "Resources",
            'items': ['Wood', 'Stone', 'Iron', 'Gold', 'Crimstone', 'Sunstone', 'Oil']
        },
        'composters': {
            'name': "Composts",
            'items': ['Rapid Root', 'Fruitful Blend', 'Sprout Mix', 'Earthworm', 'Grub', 'Red Wiggler']
        },
        'Other': { // Category for unclassified items
            'name': "Others",
            'items': [] // Will be filled dynamically
        }
    },
    
    // Display order for categories (uses CATEGORIES keys)
    CATEGORY_ORDER: [
        'Balance', 'basicCrops', 'mediumCrops', 'advancedCrops',
        'fruits', 'Mushroom', 'serre', 'Animals', 'resources', 'composters', 'Other'
    ],
    
    // Season colors for chart backgrounds
    SEASON_COLORS: {
        'winter': '#E0F7FA',  // Bleu clair
        'spring': '#E8F5E9',  // Vert clair
        'summer': '#FFF9C4',  // Jaune clair
        'autumn': '#FFEBEE'   // Rouge clair/orangé
    },

    EVENTS_COLORS: {
        'fullMoon': '#9575CD', 
        'doubleDelivery': '#43A047',  
        'tsunami': '#0288D1',  
        'insectPlague': '#D81B60',
        'greatFreeze': '#00ACC1',
        'tornado': '#546E7A',
        'sunshower': '#FDD835',
        'fishFrenzy': '#039BE5',
        'bountifulHarvest': '#FB8C00',
        'meteorShower': '#F4511E',
    },    
    
    // Default chart settings
    CHART_OPTIONS: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'point',  // To only show information for the hovered point
            intersect: true
        },
        plugins: {
            tooltip: {
                enabled: false,  // Disable default tooltip
                textDirection: 'ltr',
                // Completely customize tooltip display
                external: function(context) {
                    // Get tooltip elements
                    const { chart, tooltip } = context;
                    let tooltipEl = chart.canvas.parentNode.querySelector('div.custom-tooltip');
                    
                    // Create tooltip if it doesn't exist yet
                    if (!tooltipEl) {
                        tooltipEl = document.createElement('div');
                        tooltipEl.className = 'custom-tooltip';
                        tooltipEl.style.background = 'rgba(0, 0, 0, 0.8)';
                        tooltipEl.style.borderRadius = '4px';
                        tooltipEl.style.color = '#fff';
                        tooltipEl.style.width = 'auto';
                        tooltipEl.style.minWidth = '80px'; // Reduced minimum width
                        tooltipEl.style.position = 'absolute';
                        tooltipEl.style.transition = 'all .1s ease';
                        tooltipEl.style.pointerEvents = 'none';
                        tooltipEl.style.padding = '6px 8px'; // Reduced padding
                        tooltipEl.style.zIndex = '10000'; // Ensure it's in the foreground
                        tooltipEl.style.fontSize = '12px'; // Reduced font size
                        tooltipEl.style.fontFamily = 'Segoe UI, sans-serif';
                        tooltipEl.style.boxShadow = '0 2px 5px rgba(0,0,0,0.25)';
                        tooltipEl.style.opacity = 0;
                        
                        // Add to DOM
                        chart.canvas.parentNode.appendChild(tooltipEl);
                    }
                    
                    // Hide if no tooltip
                    if (tooltip.opacity === 0) {
                        tooltipEl.style.opacity = 0;
                        return;
                    }
                    
                    // Title
                    const title = tooltip.title[0] || '';
                    // Content
                    const bodyLines = tooltip.body.map(b => b.lines);
                    
                    // Clear previous content
                    tooltipEl.innerHTML = '';
                    
                    // Add title
                    const titleEl = document.createElement('div');
                    titleEl.style.marginBottom = '3px'; // Reduced margin
                    titleEl.style.fontWeight = 'bold';
                    titleEl.style.borderBottom = '1px solid rgba(255,255,255,0.2)';
                    titleEl.style.paddingBottom = '2px'; // Reduced padding
                    titleEl.style.fontSize = '11px'; // Reduced font size
                    titleEl.textContent = title;
                    tooltipEl.appendChild(titleEl);
                    
                    // Add each line of the body
                    bodyLines.forEach((body, i) => {
                        const bodyItem = tooltip.dataPoints[i];
                        const label = bodyItem.dataset.label || '';
                        const value = bodyItem.parsed.y;
                        
                        const bodyLineEl = document.createElement('div');
                        bodyLineEl.style.padding = '1px 0'; // Reduced padding
                        bodyLineEl.style.fontSize = '12px'; // Standard font size for body
                        bodyLineEl.textContent = `${label}: ${value.toFixed(2)}`;
                        tooltipEl.appendChild(bodyLineEl);
                        
                        // Add variation if not the first point
                        const dataIndex = bodyItem.dataIndex;
                        const dataPoints = bodyItem.dataset.data;
                        
                        if (dataIndex > 0 && dataPoints[dataIndex - 1] !== null) {
                            const previousValue = dataPoints[dataIndex - 1];
                            const difference = value - previousValue;
                            const percentChange = previousValue !== 0 ? 
                                (difference / previousValue) * 100 : 
                                value > 0 ? 100 : 0;
                            
                            // Format variation with correct sign
                            const sign = difference >= 0 ? '+' : '';
                            
                            // Create element for variation
                            const variationEl = document.createElement('div');
                            variationEl.style.padding = '1px 0'; // Reduced padding
                            variationEl.style.fontWeight = 'bold';
                            variationEl.style.fontSize = '12px'; // Standard font size for variation
                            // Apply color based on variation
                            variationEl.style.color = difference >= 0 ? '#4caf50' : '#f44336';
                            variationEl.textContent = `${sign}${difference.toFixed(2)} (${sign}${percentChange.toFixed(1)}%)`;
                            tooltipEl.appendChild(variationEl);
                        }
                    });
                    
                    // Tooltip position with smart adjustments
                    const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;
                    
                    // Make element visible but with absolute position to measure dimensions
                    tooltipEl.style.opacity = 1;
                    tooltipEl.style.left = '0';
                    tooltipEl.style.top = '0';
                    tooltipEl.style.transform = 'none';
                    
                    // Get dimensions after rendering
                    const tooltipWidth = tooltipEl.offsetWidth;
                    const tooltipHeight = tooltipEl.offsetHeight;
                    
                    // Get canvas dimensions
                    const canvasWidth = chart.canvas.width;
                    const canvasHeight = chart.canvas.height;
                    
                    // Initial position (under cursor)
                    let finalX = positionX + tooltip.caretX;
                    let finalY = positionY + tooltip.caretY - 10;
                    
                    // Adjust horizontally
                    if (tooltip.caretX + tooltipWidth / 2 > canvasWidth) {
                        // Too far right, place at right of canvas
                        finalX = positionX + canvasWidth - tooltipWidth / 2;
                    } else if (tooltip.caretX - tooltipWidth / 2 < 0) {
                        // Too far left, place at left of canvas
                        finalX = positionX + tooltipWidth / 2;
                    }
                    
                    // Adjust vertically
                    if (tooltip.caretY - tooltipHeight - 10 < 0) {
                        // If tooltip is too high, display below the point
                        finalY = positionY + tooltip.caretY + 20;
                        tooltipEl.style.transform = 'translate(-50%, 0)';
                    } else {
                        // Otherwise, display above the point (default behavior)
                        finalY = positionY + tooltip.caretY - 10;
                        tooltipEl.style.transform = 'translate(-50%, -100%)';
                    }
                    
                    // Apply final position
                    tooltipEl.style.left = finalX + 'px';
                    tooltipEl.style.top = finalY + 'px';
                }
            },
            legend: {
                display: false // Hide legend
            },
            // Plugin to add season backgrounds
            seasonBackgrounds: {
                enabled: true
            }
        },
        scales: {
            x: {
                title: {
                    display: false // Hide X axis title
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: false // Hide Y axis title
                }
            }
        }
    }
};