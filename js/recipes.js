// Recipe definitions - simplified to 2 ingredients each
export const recipes = [
  {
    name: "Salad",
    ingredients: ["lettuce", "tomato"],
    points: 10,
  },
  {
    name: "Pizza",
    ingredients: ["dough", "tomato"],
    points: 20,
  },
  {
    name: "Sandwich",
    ingredients: ["bread", "lettuce"],
    points: 15,
  },
  {
    name: "Cheese Bread",
    ingredients: ["bread", "cheese"],
    points: 12,
  },
  {
    name: "Mushroom Toast",
    ingredients: ["bread", "mushroom"],
    points: 15,
  },
  {
    name: "Meat Sandwich",
    ingredients: ["bread", "meat"],
    points: 18,
  },
  {
    name: "Onion Bread",
    ingredients: ["bread", "onion"],
    points: 14,
  },
  {
    name: "Tomato Soup",
    ingredients: ["tomato", "onion"],
    points: 16,
  },
  {
    name: "Pizza Dough",
    ingredients: ["dough", "cheese"],
    points: 15,
  },
  {
    name: "Meat Sauce",
    ingredients: ["meat", "tomato"],
    points: 18,
  },
  {
    name: "Shrimp Salad",
    ingredients: ["lettuce", "shrimp"],
    points: 22,
  },
  {
    name: "Seafood Pasta",
    ingredients: ["dough", "shrimp"],
    points: 24,
  },
  {
    name: "Mushroom Soup",
    ingredients: ["mushroom", "onion"],
    points: 17,
  },
  {
    name: "Meat Stew",
    ingredients: ["meat", "onion"],
    points: 19,
  },
  {
    name: "Stuffed Mushrooms",
    ingredients: ["mushroom", "cheese"],
    points: 18,
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
