// ============================================================================
// CONSTANTS - All configuration and data constants
// ============================================================================

const BASE = 'https://donnees-fermes-sunflower.s3.eu-west-3.amazonaws.com/data/219328/';
const COLORS = ['#4caf50', '#2196f3', '#f44336', '#ff9800', '#9c27b0', '#00bcd4'];

const ITEM_COLORS = {
    'coins': 'rgb(242, 177, 79)',
    'Gem': 'rgb(151, 228, 237)',
    'FLOWER': 'rgb(255, 182, 193)',
    'Mark': 'rgb(194, 203, 218)',
    'Love Charm': 'rgb(220, 20, 60)',
    'Sunflower': 'rgb(218, 165, 32)',
    'Potato': 'rgb(202, 123, 78)',
    'Rhubarb': 'rgb(200, 50, 80)',
    'Pumpkin': 'rgb(231, 125, 59)',
    'Zucchini': 'rgb(50, 120, 50)',
    'Carrot': 'rgb(242, 177, 79)',
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
    'Kale': 'rgb(82, 135, 79)',
    'Artichoke': 'rgb(220, 190, 255)',
    'Barley': 'rgb(202, 123, 78)',
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
    'Egg': 'rgb(255, 206, 86)',
    'Honey': 'rgb(255, 99, 132)',
    'Leather': 'rgb(54, 162, 235)',
    'Wool': 'rgb(75, 192, 192)',
    'Merino Wool': 'rgb(153, 102, 255)',
    'Feather': 'rgb(194, 203, 218)',
    'Milk': 'rgb(142, 155, 178)',
    'Wood': 'rgb(174, 114, 86)',
    'Stone': 'rgb(142, 155, 178)',
    'Iron': 'rgb(200, 207, 204)',
    'Gold': 'rgb(241, 224, 128)',
    'Crimstone': 'rgb(203, 51, 43)',
    'Sunstone': 'rgb(255, 251, 0)',
    'Oil': 'rgb(200, 200, 200)',
    'Sprout Mix': 'rgb(2, 128, 2)',
    'Fruitful Blend': 'rgb(178, 34, 34)',
    'Rapid Root': 'rgb(0, 0, 204)',
    'Earthworm': 'rgb(163, 101, 84)',
    'Grub': 'rgb(133, 94, 66)',
    'Red Wiggler': 'rgb(165, 60, 53)'
};

const CATEGORIES = {
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
    'Other': {
        'name': "Others",
        'items': []
    }
};

const CATEGORY_ORDER = [
    'Balance', 'basicCrops', 'mediumCrops', 'advancedCrops',
    'fruits', 'Mushroom', 'serre', 'Animals', 'resources', 'composters', 'Other'
];

const FLOWER_DB = {
    "recipes": {
        "Red Pansy": {"base_seed": "Sunpetal Seed", "additionals": ["Radish", "Banana"], "time": 1},
        "Yellow Pansy": {"base_seed": "Sunpetal Seed", "additionals": ["Sunflower", "Apple"], "time": 1},
        "Purple Pansy": {"base_seed": "Sunpetal Seed", "additionals": ["Blue Pansy", "Purple Balloon Flower", "Purple Carnation"], "time": 1},
        "White Pansy": {"base_seed": "Sunpetal Seed", "additionals": ["Yellow Cosmos"], "time": 1},
        "Blue Pansy": {"base_seed": "Sunpetal Seed", "additionals": ["Purple Cosmos", "White Pansy", "White Cosmos", "White Daffodil", "Blue Daffodil", "White Carnation"], "time": 1},
        "Red Cosmos": {"base_seed": "Sunpetal Seed", "additionals": ["Yellow Daffodil", "Purple Lotus", "White Lotus"], "time": 1},
        "Yellow Cosmos": {"base_seed": "Sunpetal Seed", "additionals": ["Yellow Pansy", "White Balloon Flower", "Red Carnation"], "time": 1},
        "Purple Cosmos": {"base_seed": "Sunpetal Seed", "additionals": ["Beetroot", "Eggplant", "Kale"], "time": 1},
        "White Cosmos": {"base_seed": "Sunpetal Seed", "additionals": ["Yellow Lotus"], "time": 1},
        "Blue Cosmos": {"base_seed": "Sunpetal Seed", "additionals": ["Cauliflower", "Parsnip", "Blueberry"], "time": 1},
        "Prism Petal": {"base_seed": "Sunpetal Seed", "additionals": ["Blue Lotus"], "time": 1},
        "Red Balloon Flower": {"base_seed": "Bloom Seed", "additionals": ["Sunflower", "Beetroot", "Apple", "Banana"], "time": 2},
        "Yellow Balloon Flower": {"base_seed": "Bloom Seed", "additionals": ["Yellow Lotus"], "time": 2},
        "Purple Balloon Flower": {"base_seed": "Bloom Seed", "additionals": ["Blue Carnation"], "time": 2},
        "White Balloon Flower": {"base_seed": "Bloom Seed", "additionals": ["White Cosmos", "Blue Daffodil", "White Daffodil"], "time": 2},
        "Blue Balloon Flower": {"base_seed": "Bloom Seed", "additionals": ["Cauliflower", "Parsnip", "Eggplant", "Kale"], "time": 2},
        "Red Daffodil": {"base_seed": "Bloom Seed", "additionals": ["Yellow Pansy", "Yellow Balloon Flower", "Red Carnation"], "time": 2},
        "Yellow Daffodil": {"base_seed": "Bloom Seed", "additionals": ["Red Cosmos", "White Carnation", "White Lotus"], "time": 2},
        "Purple Daffodil": {"base_seed": "Bloom Seed", "additionals": ["Radish", "Blueberry"], "time": 2},
        "White Daffodil": {"base_seed": "Bloom Seed", "additionals": ["Yellow Cosmos"], "time": 2},
        "Blue Daffodil": {"base_seed": "Bloom Seed", "additionals": ["Purple Balloon Flower", "Purple Carnation", "Purple Lotus"], "time": 2},
        "Celestial Frostbloom": {"base_seed": "Bloom Seed", "additionals": ["White Pansy"], "time": 2},
        "Red Carnation": {"base_seed": "Lily Seed", "additionals": ["Purple Pansy"], "time": 5},
        "Yellow Carnation": {"base_seed": "Lily Seed", "additionals": ["Sunflower"], "time": 5},
        "Purple Carnation": {"base_seed": "Lily Seed", "additionals": ["Eggplant", "Blueberry", "Apple"], "time": 5},
        "White Carnation": {"base_seed": "Lily Seed", "additionals": ["Yellow Pansy", "White Cosmos", "Yellow Daffodil"], "time": 5},
        "Blue Carnation": {"base_seed": "Lily Seed", "additionals": ["Purple Daffodil", "White Balloon Flower"], "time": 5},
        "Red Lotus": {"base_seed": "Lily Seed", "additionals": ["Beetroot", "Radish"], "time": 5},
        "Yellow Lotus": {"base_seed": "Lily Seed", "additionals": ["Red Pansy", "Red Cosmos", "Red Daffodil"], "time": 5},
        "Purple Lotus": {"base_seed": "Lily Seed", "additionals": ["Blue Carnation"], "time": 5},
        "White Lotus": {"base_seed": "Lily Seed", "additionals": ["Cauliflower", "Parsnip", "Kale", "Banana"], "time": 5},
        "Blue Lotus": {"base_seed": "Lily Seed", "additionals": ["Blue Pansy", "White Daffodil"], "time": 5},
        "Primula Enigma": {"base_seed": "Lily Seed", "additionals": ["Purple Balloon Flower"], "time": 5},
        "Red Edelweiss": {"base_seed": "Edelweiss Seed", "additionals": ["Artichoke", "Barley"], "time": 3},
        "Yellow Edelweiss": {"base_seed": "Edelweiss Seed", "additionals": ["Onion"], "time": 3},
        "Purple Edelweiss": {"base_seed": "Edelweiss Seed", "additionals": ["Rhubarb", "Pepper"], "time": 3},
        "White Edelweiss": {"base_seed": "Edelweiss Seed", "additionals": ["Blue Edelweiss", "Yellow Clover"], "time": 3},
        "Blue Edelweiss": {"base_seed": "Edelweiss Seed", "additionals": ["Purple Edelweiss", "White Edelweiss", "White Gladiolus", "Purple Clover", "White Clover"], "time": 3},
        "Red Gladiolus": {"base_seed": "Gladiolus Seed", "additionals": ["Yellow Edelweiss"], "time": 3},
        "Yellow Gladiolus": {"base_seed": "Gladiolus Seed", "additionals": ["Pepper", "Onion", "Barley"], "time": 3},
        "Purple Gladiolus": {"base_seed": "Gladiolus Seed", "additionals": ["Artichoke"], "time": 3},
        "White Gladiolus": {"base_seed": "Gladiolus Seed", "additionals": ["White Edelweiss", "Blue Edelweiss", "Blue Gladiolus"], "time": 3},
        "Blue Gladiolus": {"base_seed": "Gladiolus Seed", "additionals": ["Rhubarb"], "time": 3},
        "Red Lavender": {"base_seed": "Lavender Seed", "additionals": ["Pepper", "Artichoke"], "time": 3},
        "Yellow Lavender": {"base_seed": "Lavender Seed", "additionals": ["Red Gladiolus", "Yellow Gladiolus", "White Gladiolus", "Yellow Lavender", "Red Clover"], "time": 3},
        "Purple Lavender": {"base_seed": "Lavender Seed", "additionals": ["Blue Lavender", "Purple Gladiolus"], "time": 3},
        "White Lavender": {"base_seed": "Lavender Seed", "additionals": ["Rhubarb", "Onion", "Barley"], "time": 3},
        "Blue Lavender": {"base_seed": "Lavender Seed", "additionals": ["White Edelweiss", "Blue Edelweiss", "Purple Clover", "White Clover", "Blue Clover"], "time": 3},
        "Red Clover": {"base_seed": "Clover Seed", "additionals": ["Red Edelweiss", "Purple Clover"], "time": 3},
        "Yellow Clover": {"base_seed": "Clover Seed", "additionals": ["Pepper", "Onion", "Barley"], "time": 3},
        "Purple Clover": {"base_seed": "Clover Seed", "additionals": ["Red Lavender", "Red Clover"], "time": 3},
        "White Clover": {"base_seed": "Clover Seed", "additionals": ["Blue Edelweiss", "Yellow Gladiolus", "Blue Lavender"], "time": 3},
        "Blue Clover": {"base_seed": "Clover Seed", "additionals": ["Rhubarb", "Artichoke"], "time": 3}
    }
};

const SEASONAL_SEEDS = {
    "Edelweiss Seed": "winter",
    "Gladiolus Seed": "summer",
    "Lavender Seed": "spring",
    "Clover Seed": "autumn"
};

const SEASON_EMOJIS = {
    "winter": "❄️",
    "summer": "☀️",
    "spring": "🌸",
    "autumn": "🍂"
};

const BASE_ITEMS = ["Sunpetal Seed", "Bloom Seed", "Lily Seed", "Edelweiss Seed", "Gladiolus Seed", "Lavender Seed", "Clover Seed", "Radish", "Banana", "Sunflower", "Apple", "Beetroot", "Eggplant", "Kale", "Cauliflower", "Parsnip", "Blueberry", "Artichoke", "Barley", "Onion", "Rhubarb", "Pepper"];
