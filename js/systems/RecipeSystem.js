export class RecipeSystem {
  constructor(scene) {
    this.scene = scene;
    this.isLoading = false;
  }

  startCooking() {
    const { cookingWindow } = this.scene;

    // Check if we have two ingredients
    if (!cookingWindow.dropZone1Content || !cookingWindow.dropZone2Content) {
      cookingWindow.showError("Need two ingredients!");
      return;
    }

    // Disable cook button during cooking
    cookingWindow.cookButton.disableInteractive();
    cookingWindow.cookButton.fillColor = 0x9e9e9e;

    // Start cooking animation
    this.isLoading = true;
    const spinner = this.scene.add.text(225, 400, "Cooking...", {
      fontSize: "20px",
      fill: "#663300",
      backgroundColor: "#FFFFFF",
      padding: { x: 10, y: 5 },
    });
    spinner.setOrigin(0.5);
    spinner.depth = 12;

    // Wait for cooking to complete
    this.scene.time.delayedCall(2000, () => {
      this.finishCooking(spinner);
    });
  }

  finishCooking(spinner) {
    const { cookingWindow } = this.scene;

    // Remove spinner
    spinner.destroy();

    // Hide ingredients
    cookingWindow.dropZone1Content.sprite.alpha = 0;
    cookingWindow.dropZone2Content.sprite.alpha = 0;

    // Find matching recipe
    const ingredients = [
      { type: cookingWindow.dropZone1Content.type },
      { type: cookingWindow.dropZone2Content.type },
    ];

    const recipe = this.findMatchingRecipe(ingredients);

    // Display result
    if (recipe) {
      this.displaySuccessfulRecipe(recipe);
    } else {
      this.displayFailedRecipe();
    }

    // Re-enable cook button after cooking
    cookingWindow.cookButton.setInteractive();
    cookingWindow.cookButton.fillColor = 0x4caf50;

    // Change to RESET button
    cookingWindow.cookButton.removeAllListeners("pointerdown");
    cookingWindow.cookButton.on("pointerdown", () => cookingWindow.reset());

    // Change button text to "RESET"
    this.scene.children.list.forEach((child) => {
      if (child.text === "COOK" && child.depth === 12) {
        child.setText("RESET");
      }
    });

    this.isLoading = false;
  }

  displaySuccessfulRecipe(recipe) {
    const { cookingWindow } = this.scene;

    // Create result icon (using first ingredient as placeholder)
    const resultSprite = this.scene.add.sprite(
      cookingWindow.resultZone.x,
      cookingWindow.resultZone.y,
      cookingWindow.dropZone1Content.type
    );
    resultSprite.setDisplaySize(100, 100);
    resultSprite.depth = 12;

    // Add recipe name
    const recipeName = this.scene.add.text(225, 400, `✨ ${recipe.name} ✨`, {
      fontSize: "22px",
      fill: "#4CAF50",
      backgroundColor: "#FFFFFF",
      padding: { x: 10, y: 5 },
    });
    recipeName.setOrigin(0.5);
    recipeName.depth = 12;

    // Store result reference
    cookingWindow.resultContent = {
      sprite: resultSprite,
      name: recipeName,
      recipe: recipe,
    };
  }

  displayFailedRecipe() {
    const noRecipe = this.scene.add.text(225, 400, "No recipe found!", {
      fontSize: "20px",
      fill: "#FF0000",
      backgroundColor: "#FFFFFF",
      padding: { x: 10, y: 5 },
    });
    noRecipe.setOrigin(0.5);
    noRecipe.depth = 12;
  }

  findMatchingRecipe(ingredients) {
    if (!ingredients || ingredients.length !== 2) {
      return null;
    }

    const ingredientTypes = ingredients.map((ing) => ing.type);

    // Find a recipe that matches these ingredients
    for (const recipe of this.recipes) {
      if (this.areArraysEqual(ingredientTypes, recipe.ingredients)) {
        return recipe;
      }
    }

    return null;
  }

  areArraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    const sorted1 = [...arr1].sort();
    const sorted2 = [...arr2].sort();
    return sorted1.every((value, index) => value === sorted2[index]);
  }

  // Recipe definitions
  recipes = [
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
}
