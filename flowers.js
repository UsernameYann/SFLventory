// Widget Scriptable : Affiche les fleurs avec inventaire < 10 et recommande les recettes

// Récupère le cache
let cacheKey = 'RAW_API_CACHE_KEY';
let cacheValue = Keychain.get(cacheKey);

// Si tu veux tester avec le fichier newapi.json, décommente les lignes suivantes :
// let fm = FileManager.iCloud();
// let cacheValue = fm.readString(fm.joinPath(fm.documentsDirectory(), "../Desktop/new widget/newapi.json"));

if (!cacheValue) {
  let alert = new Alert();
  alert.title = "Cache introuvable";
  alert.message = `Aucune donnée trouvée pour la clé "${cacheKey}".`;
  await alert.present();
  Script.complete();
}

let data = JSON.parse(cacheValue);
let inventory = data.farm.inventory;

// Lire la saison actuelle (peut être dans farm.season ou season.season selon la structure)
let currentSeason = data.farm?.season?.season || data.season?.season || "winter";

// Mapping des graines saisonnières
let seasonalSeeds = {
  "Edelweiss Seed": "winter",
  "Gladiolus Seed": "summer",
  "Lavender Seed": "spring",
  "Clover Seed": "autumn"
};

// Emoji par saison
let seasonEmojis = {
  "winter": "❄️",
  "summer": "☀️",
  "spring": "🌸",
  "autumn": "🍂"
};

// Fonction pour vérifier si une graine est disponible cette saison
function isSeedAvailableThisSeason(seedName, season) {
  let seedSeason = seasonalSeeds[seedName];
  if (!seedSeason) return true; // Graines non-saisonnières (Sunpetal, Bloom, Lily)
  return seedSeason === season;
}

// Fonction pour obtenir l'emoji de saison d'une fleur
function getSeasonEmoji(flowerName) {
  let recipe = flowerDB.recipes[flowerName];
  if (!recipe) return "";
  let seedSeason = seasonalSeeds[recipe.base_seed];
  if (!seedSeason) return ""; // Pas une graine saisonnière
  return seasonEmojis[seedSeason] + " ";
}

// Base de données des recettes de fleurs (intégrée)
let flowerDB = {
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
  },
  "base_items": ["Sunpetal Seed", "Bloom Seed", "Lily Seed", "Edelweiss Seed", "Gladiolus Seed", "Lavender Seed", "Clover Seed", "Radish", "Banana", "Sunflower", "Apple", "Beetroot", "Eggplant", "Kale", "Cauliflower", "Parsnip", "Blueberry", "Artichoke", "Barley", "Onion", "Rhubarb", "Pepper"]
};

// Liste des items de base (légumes, fruits) - prioritaires pour les recettes
let baseItems = flowerDB.base_items || [];

// Fonction pour vérifier si un item est disponible (>= 10 ou item de base avec stock)
function isAvailable(item, inventory, baseItems) {
  if (baseItems.includes(item) && !item.includes("Seed")) {
    // Légume/fruit de base - vérifier le stock
    return inventory[item] && parseFloat(inventory[item]) > 50;
  }
  // Fleur ou graine - vérifier si >= 10
  return inventory[item] && parseInt(inventory[item]) >= 10;
}

// Fonction pour calculer le temps THÉORIQUE de production (indépendant du stock)
function calculateTheoreticalTime(ingredientName, recipes) {
  let recipe = recipes[ingredientName];
  if (!recipe) return 0;
  
  let myTime = recipe.time || 0;
  let bestSubTime = 999;
  
  // Trouver le meilleur sous-ingrédient (temps le plus court)
  for (let subIng of recipe.additionals) {
    let subRecipe = recipes[subIng];
    if (subRecipe) {
      let subTime = subRecipe.time || 0;
      if (subTime < bestSubTime) {
        bestSubTime = subTime;
      }
    }
  }
  
  if (bestSubTime !== 999) {
    myTime += bestSubTime;
  }
  
  return myTime;
}

// Fonction pour calculer le temps total de production d'un ingrédient (récursif)
function calculateTotalProductionTime(ingredientName, inventory, baseItems, recipes, visited = new Set()) {
  // Éviter les boucles infinies
  if (visited.has(ingredientName)) return 999;
  visited.add(ingredientName);
  
  // Si déjà disponible, pas de temps de production
  
  let recipe = recipes[ingredientName];
  if (!recipe) return 0;
  
  // Temps de cette recette + temps du meilleur ingrédient
  let myTime = recipe.time || 0;
  let bestIngredientTime = 999;
  
  for (let subIngredient of recipe.additionals) {
    let subTime = calculateTotalProductionTime(subIngredient, inventory, baseItems, recipes, new Set(visited));
    if (subTime < bestIngredientTime) {
      bestIngredientTime = subTime;
    }
  }
  
  if (bestIngredientTime === 999) bestIngredientTime = 0;
  return myTime + bestIngredientTime;
}

// Fonction pour calculer une répartition optimale entre plusieurs ingrédients
function calculateOptimalMix(availableIngredients, quantityNeeded, inventory, baseItems, recipes) {
  // Calculer combien chaque ingrédient peut donner (en tenant compte de la réserve)
  let options = [];
  for (let ingredientInfo of availableIngredients) {
    let ingredient = ingredientInfo.name || ingredientInfo;
    let stock = parseInt(inventory[ingredient] || 0);
    let minToKeep = (!baseItems.includes(ingredient) || ingredient.includes("Seed")) ? 10 : 0;
    let canGive = Math.max(0, stock - minToKeep);
    
    // Calculer le temps de production THÉORIQUE (indépendamment du stock)
    let recipeTime = calculateTheoreticalTime(ingredient, recipes);
    
    // Vérifier si cet ingrédient peut fournir toute la quantité à lui seul
    let needsProduction = canGive < quantityNeeded ? 1 : 0;
    
    if (canGive > 0) {
      options.push({ ingredient, stock, canGive, minToKeep, time: recipeTime, needsProduction });
    }
  }
  
  if (options.length === 0) return [];
  
  // Trier par : 1) durée (plus rapide d'abord), 2) peut fournir tout seul, 3) stock disponible
  options.sort((a, b) => {
    if (a.time !== b.time) return a.time - b.time;
    if (a.needsProduction !== b.needsProduction) return a.needsProduction - b.needsProduction;
    return b.canGive - a.canGive;
  });
  
  // TOUJOURS prendre le plus rapide (premier de la liste), quel que soit le stock
  let mix = [];
  let fastest = options[0]; // Le plus rapide est toujours en premier
  
  mix.push({ 
    ingredient: fastest.ingredient, 
    quantity: quantityNeeded 
  });
  
  return mix;
}

// Fonction récursive pour calculer le chemin de fabrication d'une fleur
function calculateCraftingPath(flowerName, inventory, baseItems, recipes, visited = new Set()) {
  // Éviter les boucles infinies
  if (visited.has(flowerName)) {
    return { steps: [], totalTime: 999, error: true };
  }
  visited.add(flowerName);
  
  // Si la fleur est déjà disponible, pas besoin de la fabriquer
  if (isAvailable(flowerName, inventory, baseItems)) {
    return { steps: [], totalTime: 0, available: true };
  }
  
  let recipe = recipes[flowerName];
  if (!recipe) {
    return { steps: [], totalTime: 0, available: false };
  }
  
  // Identifier tous les ingrédients disponibles et leur temps de recette
  let availableIngredients = [];
  let unavailableIngredients = [];
  
  for (let ingredient of recipe.additionals) {
    if (isAvailable(ingredient, inventory, baseItems)) {
      // Ajouter avec info de durée si c'est une fleur
      let ingredientRecipe = recipes[ingredient];
      let directTime = ingredientRecipe ? ingredientRecipe.time : 0;
      let totalTime = calculateTotalProductionTime(ingredient, inventory, baseItems, recipes);
      availableIngredients.push({ name: ingredient, time: directTime, totalTime: totalTime });
    } else {
      unavailableIngredients.push(ingredient);
    }
  }
  
  // Si on a des ingrédients disponibles, trier par temps total puis retourner
  if (availableIngredients.length > 0) {
    // Trier par durée TOTALE de recette croissante (plus court en premier)
    availableIngredients.sort((a, b) => a.totalTime - b.totalTime);
    
    return {
      steps: [],
      totalTime: 0,
      availableIngredients: availableIngredients,
      mixMode: true
    };
  }
  
  // Sinon, chercher le meilleur chemin parmi les indisponibles
  let bestPath = null;
  let bestIngredient = null;
  
  for (let ingredient of unavailableIngredients) {
    if (recipes[ingredient]) {
      let subPath = calculateCraftingPath(ingredient, inventory, baseItems, recipes, new Set(visited));
      if (!subPath.error && (!bestPath || subPath.totalTime < bestPath.totalTime)) {
        bestPath = subPath;
        bestIngredient = ingredient;
      }
    }
  }
  
  if (!bestIngredient) {
    bestIngredient = recipe.additionals[0];
    bestPath = { steps: [], totalTime: 0 };
  }
  
  // Construire le chemin complet
  let totalTime = recipe.time + (bestPath ? bestPath.totalTime : 0);
  let steps = [
    ...(bestPath ? bestPath.steps : []),
    {
      flower: flowerName,
      seed: recipe.base_seed,
      ingredient: bestIngredient,
      time: recipe.time,
      needsCrafting: !isAvailable(bestIngredient, inventory, baseItems)
    }
  ];
  
  return { steps, totalTime, ingredient: bestIngredient };
}

// Filtrer les fleurs < 10 et calculer les chemins de fabrication
let lowFlowers = [];
for (let flowerName in flowerDB.recipes) {
  if (inventory[flowerName]) {
    let count = parseInt(inventory[flowerName]);
    if (count < 10) {
      let recipe = flowerDB.recipes[flowerName];
      
      // Vérifier si la graine de base est disponible cette saison
      if (!isSeedAvailableThisSeason(recipe.base_seed, currentSeason)) {
        continue; // Ignorer cette fleur, la graine n'est pas de saison
      }
      
      // Calculer le chemin optimal pour cette fleur
      let path = calculateCraftingPath(flowerName, inventory, baseItems, flowerDB.recipes);
      
      lowFlowers.push({
        name: flowerName,
        count: count,
        needed: 10 - count,
        path: path,
        totalTime: path.totalTime,
        steps: path.steps
      });
    }
  }
}

// Accumulation DIRECTE avec choix optimal + recalculs jusqu'a stabilisation
let missingIngredients = {};
let optimalChoices = {};

function findOptimalIngredient(ingredients) {
  let minTime = Infinity;
  for (let ing of ingredients) {
    let time = calculateTotalProductionTime(ing, inventory, baseItems, flowerDB.recipes);
    if (time < minTime) minTime = time;
  }
  
  let bestIngredient = null;
  let bestStock = -1;
  for (let ing of ingredients) {
    let time = calculateTotalProductionTime(ing, inventory, baseItems, flowerDB.recipes);
    if (time === minTime) {
      let stock = parseInt(inventory[ing] || 0);
      if (stock > bestStock) {
        bestStock = stock;
        bestIngredient = ing;
      }
    }
  }
  
  return bestIngredient || ingredients[0];
}

function computeMissingAndChoices(flowers) {
  let missing = {};
  let choices = {};
  
  for (let flower of flowers) {
    let recipe = flowerDB.recipes[flower.name];
    if (!recipe) continue;
    
    let optimalIngredient = findOptimalIngredient(recipe.additionals);
    choices[flower.name] = optimalIngredient;
    let ingredientStock = parseInt(inventory[optimalIngredient] || 0);
    
    if (!missing[optimalIngredient]) {
      missing[optimalIngredient] = {
        count: 0,
        usedBy: [],
        stock: ingredientStock
      };
    }
    missing[optimalIngredient].count += flower.needed;
    if (!missing[optimalIngredient].usedBy.includes(flower.name)) {
      missing[optimalIngredient].usedBy.push(flower.name);
    }
  }
  
  return { missing, choices };
}

let bottlenecks = [];
let iterations = 0;
let changed = true;

while (changed && iterations < 5) {
  iterations += 1;
  changed = false;
  
  let result = computeMissingAndChoices(lowFlowers);
  missingIngredients = result.missing;
  optimalChoices = result.choices;
  
  for (let ingredient in missingIngredients) {
    let missing = missingIngredients[ingredient];
    let stock = parseInt(inventory[ingredient] || 0);
    
    let minToKeep = (!baseItems.includes(ingredient) || ingredient.includes("Seed")) ? 10 : 0;
    let totalRequired = missing.count + minToKeep;
    let deficit = totalRequired - stock;
    let needed = Math.max(deficit, missing.count);
    
    let existingFlower = lowFlowers.find(f => f.name === ingredient);
    
    if (existingFlower) {
      let reserveNeed = Math.max(0, 10 - stock);
      let finalNeed = reserveNeed + missing.count;
      if (finalNeed > existingFlower.needed) {
        existingFlower.needed = finalNeed;
        existingFlower.isBottleneck = true;
        changed = true;
      }
    } else if (flowerDB.recipes[ingredient] && deficit > 0) {
      let ingredientRecipe = flowerDB.recipes[ingredient];
      if (!isSeedAvailableThisSeason(ingredientRecipe.base_seed, currentSeason)) {
        continue;
      }
      
      let path = calculateCraftingPath(ingredient, inventory, baseItems, flowerDB.recipes);
      
      lowFlowers.push({
        name: ingredient,
        count: stock,
        needed: needed,
        path: path,
        totalTime: path.totalTime,
        steps: path.steps,
        isBottleneck: true
      });
      changed = true;
    }
    
    if (flowerDB.recipes[ingredient]) {
      bottlenecks.push(ingredient);
    }
  }
}

// Trier uniquement par quantité à produire (du plus au moins)
lowFlowers.sort((a, b) => {
  return b.needed - a.needed;
});

// Fonction pour créer l'affichage d'une fleur
function addFlowerToStack(stack, flower) {
  // TITRE DE LA FLEUR avec emoji de saison et stock sur la même ligne
  let seasonEmoji = getSeasonEmoji(flower.name);
  let flowerText = `${seasonEmoji}${flower.name} ${flower.count}/10`;
  let nameRow = stack.addText(flowerText);
  nameRow.font = Font.boldSystemFont(10);
  nameRow.textColor = new Color("#ffffff");
  
  // ÉTAPES DE FABRICATION
  let recipe = flowerDB.recipes[flower.name];
  if (!recipe) return;
  
  let seedTime = recipe.time || 0;
  
  // Si des steps existent (chaîne de fabrication complexe)
  if (flower.steps.length > 0) {
    for (let i = 0; i < flower.steps.length; i++) {
      let step = flower.steps[i];
      let ingredientStock = parseInt(inventory[step.ingredient] || 0);
      
      let ingredientNeeded = flower.needed;
      let minToKeep = (!baseItems.includes(step.ingredient) || step.ingredient.includes("Seed")) ? 10 : 0;
      let totalRequired = ingredientNeeded + minToKeep;
      let ingredientToProduce = Math.max(0, totalRequired - ingredientStock);
      
      let stepText = `${step.seed} (${seedTime}d) + ${step.ingredient} ×${flower.needed}`;
      if (ingredientToProduce > 0) {
        stepText += ` ⚠️`;
      } else {
        stepText += ` ✓`;
      }
      
      let stepRow = stack.addText(stepText);
      stepRow.font = Font.systemFont(7);
      stepRow.textColor = ingredientToProduce > 0 ? new Color("#ff851b") : new Color("#2ecc40");
    }
  } else {
    // Sinon afficher la meilleure recette avec mix optimal
    if (recipe.additionals.length > 0) {
      // Vérifier si on peut faire un mix optimal
      let availableIngredients = [];
      for (let ingredient of recipe.additionals) {
        if (isAvailable(ingredient, inventory, baseItems)) {
          let ingredientRecipe = flowerDB.recipes[ingredient];
          let directTime = ingredientRecipe ? ingredientRecipe.time : 0;
          // Utiliser le temps THÉORIQUE pour trier correctement
          let theoreticalTime = calculateTheoreticalTime(ingredient, flowerDB.recipes);
          availableIngredients.push({ name: ingredient, time: directTime, totalTime: theoreticalTime });
        }
      }
      
      if (availableIngredients.length > 1) {
        // Calculer le mix optimal
        let mix = calculateOptimalMix(availableIngredients, flower.needed, inventory, baseItems, flowerDB.recipes);
        
        // Afficher chaque ligne du mix avec vérification du besoin de production
        for (let item of mix) {
          let ingredientStock = parseInt(inventory[item.ingredient] || 0);
          let minToKeep = (!baseItems.includes(item.ingredient) || item.ingredient.includes("Seed")) ? 10 : 0;
          let totalRequired = item.quantity + minToKeep;
          let ingredientToProduce = Math.max(0, totalRequired - ingredientStock);
          
          let stepText = `${recipe.base_seed} (${seedTime}d) + ${item.ingredient} ×${item.quantity}`;
          if (ingredientToProduce > 0) {
            stepText += ` ⚠️`;
          } else {
            stepText += ` ✓`;
          }
          
          let stepRow = stack.addText(stepText);
          stepRow.font = Font.systemFont(7);
          stepRow.textColor = ingredientToProduce > 0 ? new Color("#ff851b") : new Color("#2ecc40");
        }
      } else {
        // Un seul ingrédient disponible (ou aucun)
        let bestIngredient = flower.path?.ingredient || recipe.additionals[0];
        let ingredientStock = parseInt(inventory[bestIngredient] || 0);
        
        let ingredientNeeded = flower.needed;
        let minToKeep = (!baseItems.includes(bestIngredient) || bestIngredient.includes("Seed")) ? 10 : 0;
        let totalRequired = ingredientNeeded + minToKeep;
        let ingredientToProduce = Math.max(0, totalRequired - ingredientStock);
        
        let stepText = `${recipe.base_seed} (${seedTime}d) + ${bestIngredient} ×${flower.needed}`;
        if (ingredientToProduce > 0) {
          stepText += ` ⚠️`;
        } else {
          stepText += ` ✓`;
        }
        
        let stepRow = stack.addText(stepText);
        stepRow.font = Font.systemFont(7);
        stepRow.textColor = ingredientToProduce > 0 ? new Color("#ff851b") : new Color("#2ecc40");
      }
    }
  }
  
  stack.addSpacer(4);
}

// Création du widget
let widget = new ListWidget();
widget.backgroundColor = new Color("#000000");
widget.setPadding(8, 8, 8, 8);

if (lowFlowers.length === 0) {
  let noFlowers = widget.addText("✅ Toutes les fleurs >= 10");
  noFlowers.font = Font.systemFont(12);
  noFlowers.textColor = new Color("#2ecc40");
} else {
  // Créer deux colonnes
  let mainStack = widget.addStack();
  mainStack.layoutHorizontally();
  
  // Colonne gauche
  let leftColumn = mainStack.addStack();
  leftColumn.layoutVertically();
  leftColumn.size = new Size(165, 0);
  
  mainStack.addSpacer(4);
  
  // Colonne droite
  let rightColumn = mainStack.addStack();
  rightColumn.layoutVertically();
  rightColumn.size = new Size(165, 0);
  
  // Répartir les fleurs entre les deux colonnes
  let maxFlowers = Math.min(lowFlowers.length, 24); // 12 par colonne max
  for (let i = 0; i < maxFlowers; i++) {
    let flower = lowFlowers[i];
    
    // Alterner entre gauche et droite
    if (i % 2 === 0) {
      addFlowerToStack(leftColumn, flower);
    } else {
      addFlowerToStack(rightColumn, flower);
    }
  }
  
  // Résumé si trop de fleurs
  if (lowFlowers.length > maxFlowers) {
    leftColumn.addSpacer(4);
    let summary = leftColumn.addText(`+${lowFlowers.length - maxFlowers} autres...`);
    summary.font = Font.systemFont(8);
    summary.textColor = new Color("#666666");
  }
}

// Afficher le widget
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentLarge();
}

Script.complete();
