// Recipe definitions - 30 soup recipes
export const recipes = [
  {
    name: "Tomato Soup",
    ingredients: ["tomato", "onion"],
  },
  {
    name: "Mushroom Soup",
    ingredients: ["mushroom", "onion"],
  },
  {
    name: "Vegetable Soup",
    ingredients: ["lettuce", "tomato"],
  },
  {
    name: "Cucumber Soup",
    ingredients: ["cucumber", "onion"],
  },
  {
    name: "Cheese Soup",
    ingredients: ["cheese", "onion"],
  },
  {
    name: "Seafood Soup",
    ingredients: ["shrimp", "onion"],
  },
  {
    name: "Meat Soup",
    ingredients: ["meat", "onion"],
  },
  {
    name: "Bread Soup",
    ingredients: ["bread", "tomato"],
  },
  {
    name: "Creamy Tomato Soup",
    ingredients: ["tomato", "cheese"],
  },
  {
    name: "Tomato Shrimp Soup",
    ingredients: ["tomato", "shrimp"],
  },
  {
    name: "Tomato Meat Soup",
    ingredients: ["tomato", "meat"],
  },
  {
    name: "Lettuce Soup",
    ingredients: ["lettuce", "onion"],
  },
  {
    name: "Cream of Mushroom",
    ingredients: ["mushroom", "cheese"],
  },
  {
    name: "Mushroom Shrimp Soup",
    ingredients: ["mushroom", "shrimp"],
  },
  {
    name: "Mushroom Meat Soup",
    ingredients: ["mushroom", "meat"],
  },
  {
    name: "Cucumber Cream Soup",
    ingredients: ["cucumber", "cheese"],
  },
  {
    name: "Cucumber Seafood Soup",
    ingredients: ["cucumber", "shrimp"],
  },
  {
    name: "Cucumber Meat Soup",
    ingredients: ["cucumber", "meat"],
  },
  {
    name: "Bread Bowl Soup",
    ingredients: ["bread", "cheese"],
  },
  {
    name: "Seafood Bread Soup",
    ingredients: ["bread", "shrimp"],
  },
  {
    name: "Meat Bread Soup",
    ingredients: ["bread", "meat"],
  },
  {
    name: "Lettuce Cream Soup",
    ingredients: ["lettuce", "cheese"],
  },
  {
    name: "Seafood Lettuce Soup",
    ingredients: ["lettuce", "shrimp"],
  },
  {
    name: "Meat Lettuce Soup",
    ingredients: ["lettuce", "meat"],
  },
  {
    name: "Dumpling Soup",
    ingredients: ["dough", "onion"],
  },
  {
    name: "Cheese Dumpling Soup",
    ingredients: ["dough", "cheese"],
  },
  {
    name: "Seafood Dumpling Soup",
    ingredients: ["dough", "shrimp"],
  },
  {
    name: "Meat Dumpling Soup",
    ingredients: ["dough", "meat"],
  },
  {
    name: "Garden Vegetable Soup",
    ingredients: ["cucumber", "lettuce"],
  },
  {
    name: "Chef's Special Soup",
    ingredients: ["mushroom", "tomato"],
  },
  {
    name: "Potato Soup",
    ingredients: ["potato", "onion"],
  },
  {
    name: "Carrot Soup",
    ingredients: ["carrot", "onion"],
  },
  {
    name: "Eggplant Soup",
    ingredients: ["eggplant", "onion"],
  },
  {
    name: "Egg Drop Soup",
    ingredients: ["egg", "onion"],
  },
  {
    name: "Zucchini Soup",
    ingredients: ["zucchini", "onion"],
  },
  {
    name: "Potato Leek Soup",
    ingredients: ["potato", "lettuce"],
  },
  {
    name: "Creamy Potato Soup",
    ingredients: ["potato", "cheese"],
  },
  {
    name: "Carrot Ginger Soup",
    ingredients: ["carrot", "tomato"],
  },
  {
    name: "Ratatouille Soup",
    ingredients: ["eggplant", "zucchini"],
  },
  {
    name: "Egg and Potato Soup",
    ingredients: ["egg", "potato"],
  },
  {
    name: "Minestrone",
    ingredients: ["carrot", "tomato"],
  },
  {
    name: "Hearty Vegetable Soup",
    ingredients: ["carrot", "potato"],
  },
  {
    name: "Garden Egg Soup",
    ingredients: ["egg", "zucchini"],
  },
  {
    name: "Eggplant Parmesan Soup",
    ingredients: ["eggplant", "cheese"],
  },
  {
    name: "Seafood Egg Soup",
    ingredients: ["egg", "shrimp"],
  },
];

// Utility function to compare recipe ingredients - order doesn't matter for cooking
export function areArraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();
  return sorted1.every((value, index) => value === sorted2[index]);
}

// Find a recipe that matches the given ingredients
export function findMatchingRecipe(ingredients) {
  if (!ingredients || ingredients.length !== 2) {
    return null;
  }

  const ingredientTypes = ingredients.map((ing) => ing.type);

  // Find a recipe that matches these ingredients
  for (const recipe of recipes) {
    if (areArraysEqual(ingredientTypes, recipe.ingredients)) {
      return recipe;
    }
  }

  return null; // No matching recipe found
}
