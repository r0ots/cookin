import { CookingWindow } from "./components/CookingWindow.js";
import { IngredientsPanel } from "./components/IngredientsPanel.js";
import { DragDropSystem } from "./systems/DragDropSystem.js";
import { RecipeSystem } from "./systems/RecipeSystem.js";
import { TextureSystem } from "./systems/TextureSystem.js";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
    this.textureSystem = new TextureSystem(this);
  }

  create() {
    // Initialize systems
    this.recipeSystem = new RecipeSystem(this);
    this.dragDropSystem = new DragDropSystem(this);

    // Initialize UI components
    this.cookingWindow = new CookingWindow(this);
    this.ingredientsPanel = new IngredientsPanel(this);

    // Add background image
    this.createBackground();

    // Add instructional text
    this.createInstructions();

    // Create cooking pot button
    this.createCookingPot();

    // Initialize ingredients panel
    this.ingredientsPanel.create();

    // Initialize drag-drop system
    this.dragDropSystem.init();
  }

  createBackground() {
    const bg = this.add.image(225, 400, "kitchen-bg");
    bg.setDisplaySize(450, 800);
    bg.depth = -2;
  }

  createInstructions() {
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
  }

  createCookingPot() {
    // Create cooking pot button in the center
    const cookingPot = this.add.circle(125, 350, 70, 0x663300);
    const potOutline = this.add.circle(125, 350, 70);
    potOutline.setStrokeStyle(4, 0x331a00);

    const potText = this.add.text(125, 350, "🍲", {
      fontSize: "60px",
      align: "center",
    });
    potText.setOrigin(0.5);

    // Make cooking pot interactive
    cookingPot.setInteractive();
    cookingPot.on("pointerdown", () => {
      this.cookingWindow.open();
    });
  }

  startCooking() {
    this.recipeSystem.startCooking();
  }

  preload() {
    this.textureSystem.preloadTextures();
  }
}
