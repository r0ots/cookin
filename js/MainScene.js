import { findMatchingRecipe } from "./recipes.js";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
    this.ingredients = [];
    this.dropZone1 = null;
    this.dropZone2 = null;
    this.resultZone = null;
    this.cookingWindow = null;
    this.cookButton = null;
    this.dropZone1Content = null;
    this.dropZone2Content = null;
    this.resultContent = null;
    this.isWindowOpen = false;
  }

  preload() {
    // Load ingredient images
    this.load.image("lettuce", "assets/lettuce.png");
    this.load.image("tomato", "assets/tomato.png");
    this.load.image("cucumber", "assets/cucumber.png");
    this.load.image("dough", "assets/dough.png");
    this.load.image("cheese", "assets/cheese.png");
    this.load.image("bread", "assets/bread.png");
    // Add new ingredients
    this.load.image("mushroom", "assets/mushroom.png");
    this.load.image("meat", "assets/meat.png");
    this.load.image("onion", "assets/onion.png");
    this.load.image("shrimp", "assets/shrimp.png");
    this.load.image("recipe-zone", "assets/recipe-zone.png");
    this.load.image("kitchen-bg", "assets/kitchen.png");

    // Add error handling
    this.load.on("loaderror", (file) => {
      console.error("Error loading asset:", file.key);
    });
  }

  create() {
    // Add background image
    const bg = this.add.image(225, 400, "kitchen-bg");
    bg.setDisplaySize(450, 800);
    bg.depth = -2;

    // Add an instructional text at the top
    const instructionText = this.add.text(
      225,
      100,
      "Click the cooking pot\nto start cooking!",
      {
        fontSize: "24px",
        fill: "#333333",
        align: "center",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        padding: { x: 15, y: 10 },
      }
    );
    instructionText.setOrigin(0.5);
    instructionText.depth = 1;

    // Create cooking pot button in the center
    const cookingPot = this.add.circle(225, 350, 70, 0x663300);
    const potOutline = this.add.circle(225, 350, 70);
    potOutline.setStrokeStyle(4, 0x331a00);

    const potText = this.add.text(225, 350, "🍲", {
      fontSize: "60px",
      align: "center",
    });
    potText.setOrigin(0.5);

    // Make cooking pot interactive
    cookingPot.setInteractive();
    cookingPot.on("pointerdown", () => {
      this.openCookingWindow();
    });

    // Create ingredients at the bottom
    this.createIngredients();
  }

  createIngredients() {
    // Create ingredient buttons arranged in a 4x3 grid at the bottom
    const ingredientTypes = [
      "lettuce",
      "tomato",
      "cucumber",
      "dough",
      "cheese",
      "bread",
      "mushroom",
      "meat",
      "onion",
      "shrimp",
    ];

    // Calculate spacing based on number of ingredients and screen width
    const numColumns = 4;
    const columnWidth = 95;
    const startX = 225 - ((numColumns - 1) * columnWidth) / 2;
    const startY = 630;
    const rowHeight = 75;

    // Arrange ingredients in a grid at the bottom
    ingredientTypes.forEach((type, index) => {
      const column = index % numColumns;
      const row = Math.floor(index / numColumns);

      const x = startX + column * columnWidth;
      const y = startY + row * rowHeight;

      const sprite = this.add.sprite(x, y, type);
      sprite.setInteractive();
      sprite.setDisplaySize(55, 55);
      sprite.ingredientType = type;
      sprite.depth = 1;

      // Add ingredient name below the sprite
      this.add
        .text(x, y + 35, type.charAt(0).toUpperCase() + type.slice(1), {
          fontSize: "11px",
          fill: "#333333",
          align: "center",
          backgroundColor: "#FFFFFF",
          padding: { x: 3, y: 1 },
        })
        .setOrigin(0.5).depth = 1;

      // Add click handler for each ingredient
      sprite.on("pointerdown", () => {
        if (this.isWindowOpen) {
          this.selectIngredient(type);
        }
      });
    });
  }

  openCookingWindow() {
    // If window is already open, do nothing
    if (this.isWindowOpen) return;

    this.isWindowOpen = true;

    // Create background overlay
    const overlay = this.add.rectangle(225, 400, 450, 800, 0x000000);
    overlay.alpha = 0.7;
    overlay.depth = 5;

    // Create popup window background
    this.cookingWindow = this.add.rectangle(225, 400, 400, 600, 0xf5f5dc);
    this.cookingWindow.setStrokeStyle(4, 0x663300);
    this.cookingWindow.depth = 10;

    // Add title
    const title = this.add.text(225, 180, "Cooking Station", {
      fontSize: "28px",
      fill: "#663300",
      fontStyle: "bold",
    });
    title.setOrigin(0.5);
    title.depth = 11;

    // Add close button
    const closeBtn = this.add.text(405, 180, "X", {
      fontSize: "24px",
      fill: "#663300",
    });
    closeBtn.setOrigin(0.5);
    closeBtn.setInteractive();
    closeBtn.depth = 11;
    closeBtn.on("pointerdown", () => {
      this.closeCookingWindow();
    });

    // Create drop zones
    const dropZone1Bg = this.add.rectangle(150, 300, 120, 120, 0xffffff);
    dropZone1Bg.setStrokeStyle(3, 0x663300);
    dropZone1Bg.depth = 11;

    const dropZone2Bg = this.add.rectangle(300, 300, 120, 120, 0xffffff);
    dropZone2Bg.setStrokeStyle(3, 0x663300);
    dropZone2Bg.depth = 11;

    // Create result zone
    const resultZoneBg = this.add.rectangle(225, 480, 150, 150, 0xffffff);
    resultZoneBg.setStrokeStyle(3, 0x663300);
    resultZoneBg.depth = 11;

    // Store references to zones
    this.dropZone1 = dropZone1Bg;
    this.dropZone2 = dropZone2Bg;
    this.resultZone = resultZoneBg;

    // Add labels
    const label1 = this.add.text(150, 260, "Ingredient 1", {
      fontSize: "16px",
      fill: "#663300",
    });
    label1.setOrigin(0.5);
    label1.depth = 11;

    const label2 = this.add.text(300, 260, "Ingredient 2", {
      fontSize: "16px",
      fill: "#663300",
    });
    label2.setOrigin(0.5);
    label2.depth = 11;

    const resultLabel = this.add.text(225, 430, "Result", {
      fontSize: "16px",
      fill: "#663300",
    });
    resultLabel.setOrigin(0.5);
    resultLabel.depth = 11;

    // Create cook button
    this.cookButton = this.add.rectangle(225, 600, 120, 50, 0x4caf50);
    this.cookButton.setStrokeStyle(3, 0x388e3c);
    this.cookButton.depth = 11;

    const cookText = this.add.text(225, 600, "COOK", {
      fontSize: "20px",
      fill: "#FFFFFF",
      fontStyle: "bold",
    });
    cookText.setOrigin(0.5);
    cookText.depth = 12;

    // Make cook button interactive
    this.cookButton.setInteractive();
    this.cookButton.on("pointerdown", () => {
      this.startCooking();
    });

    // Initialize drop zone content trackers
    this.dropZone1Content = null;
    this.dropZone2Content = null;
    this.resultContent = null;
  }

  closeCookingWindow() {
    if (!this.isWindowOpen) return;

    // Clean up all UI components
    this.isWindowOpen = false;
    this.children.list.forEach((child) => {
      if (child.depth >= 5) {
        child.destroy();
      }
    });

    // Clear references
    this.dropZone1 = null;
    this.dropZone2 = null;
    this.resultZone = null;
    this.cookButton = null;
    this.dropZone1Content = null;
    this.dropZone2Content = null;
    this.resultContent = null;
  }

  selectIngredient(type) {
    if (!this.isWindowOpen) return;

    // Determine which drop zone to use
    let targetZone, content;
    if (!this.dropZone1Content) {
      targetZone = this.dropZone1;
      content = "dropZone1Content";
    } else if (!this.dropZone2Content) {
      targetZone = this.dropZone2;
      content = "dropZone2Content";
    } else {
      // Both zones are full
      return;
    }

    // Create ingredient sprite in the target zone
    const sprite = this.add.sprite(targetZone.x, targetZone.y, type);
    sprite.setDisplaySize(80, 80);
    sprite.depth = 12;
    sprite.type = type;

    // Store reference to the content
    this[content] = sprite;
  }

  startCooking() {
    // Check if we have two ingredients
    if (!this.dropZone1Content || !this.dropZone2Content) {
      // Display error message
      const errorMsg = this.add.text(225, 550, "Need two ingredients!", {
        fontSize: "18px",
        fill: "#FF0000",
        backgroundColor: "#FFFFFF",
        padding: { x: 10, y: 5 },
      });
      errorMsg.setOrigin(0.5);
      errorMsg.depth = 12;

      // Auto-remove error message after 1.5 seconds
      this.time.delayedCall(1500, () => {
        errorMsg.destroy();
      });

      return;
    }

    // Disable cook button during cooking
    this.cookButton.disableInteractive();
    this.cookButton.fillColor = 0x9e9e9e;

    // Start cooking animation - add a loading spinner or effect
    const spinner = this.add.text(225, 550, "Cooking...", {
      fontSize: "20px",
      fill: "#663300",
    });
    spinner.setOrigin(0.5);
    spinner.depth = 12;

    // Wait 2 seconds for cooking to complete
    this.time.delayedCall(2000, () => {
      // Remove spinner
      spinner.destroy();

      // Hide ingredients
      this.dropZone1Content.alpha = 0;
      this.dropZone2Content.alpha = 0;

      // Find matching recipe
      const ingredients = [
        { type: this.dropZone1Content.type },
        { type: this.dropZone2Content.type },
      ];

      const recipe = findMatchingRecipe(ingredients);

      // Display result
      if (recipe) {
        // Create result icon (using first ingredient as placeholder)
        this.resultContent = this.add.sprite(
          this.resultZone.x,
          this.resultZone.y,
          this.dropZone1Content.type
        );
        this.resultContent.setDisplaySize(100, 100);
        this.resultContent.depth = 12;

        // Add recipe name
        const recipeName = this.add.text(225, 550, `✨ ${recipe.name} ✨`, {
          fontSize: "22px",
          fill: "#4CAF50",
          backgroundColor: "#FFFFFF",
          padding: { x: 10, y: 5 },
        });
        recipeName.setOrigin(0.5);
        recipeName.depth = 12;
      } else {
        // No matching recipe
        const noRecipe = this.add.text(225, 550, "No recipe found!", {
          fontSize: "20px",
          fill: "#FF0000",
          backgroundColor: "#FFFFFF",
          padding: { x: 10, y: 5 },
        });
        noRecipe.setOrigin(0.5);
        noRecipe.depth = 12;
      }

      // Re-enable cook button after cooking
      this.cookButton.setInteractive();
      this.cookButton.fillColor = 0x4caf50;

      // Allow resetting after 1 second
      this.time.delayedCall(1000, () => {
        this.cookButton.on("pointerdown", () => {
          this.resetCooking();
        });

        // Change button text to "RESET"
        this.children.list.forEach((child) => {
          if (child.text === "COOK" && child.depth === 12) {
            child.setText("RESET");
          }
        });
      });
    });
  }

  resetCooking() {
    // Clean up previous result and ingredients
    if (this.dropZone1Content) {
      this.dropZone1Content.destroy();
      this.dropZone1Content = null;
    }

    if (this.dropZone2Content) {
      this.dropZone2Content.destroy();
      this.dropZone2Content = null;
    }

    if (this.resultContent) {
      this.resultContent.destroy();
      this.resultContent = null;
    }

    // Remove any recipe name or error messages
    this.children.list.forEach((child) => {
      if (
        (child.text && child.text.includes("✨")) ||
        (child.text && child.text === "No recipe found!")
      ) {
        child.destroy();
      }

      // Change button text back to "COOK"
      if (child.text === "RESET" && child.depth === 12) {
        child.setText("COOK");
      }
    });

    // Reset button handler
    this.cookButton.removeAllListeners("pointerdown");
    this.cookButton.on("pointerdown", () => {
      this.startCooking();
    });
  }
}
