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
    this.ingredientsContainer = null;
    this.ingredientButtons = [];
    this.scrollingMask = null;
    this.scrollPosition = 0;
    this.scrollStep = 70; // Amount to scroll per step
    this.lastScrollTime = 0; // For scroll throttling
    this.draggedSprite = null; // Track currently dragged sprite
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
    this.load.image("up-arrow", "assets/up-arrow.png");
    this.load.image("down-arrow", "assets/down-arrow.png");

    // Create emoji-based textures for new ingredients
    this.createEmojiTexture("eggplant", "🍆");
    this.createEmojiTexture("egg", "🥚");
    this.createEmojiTexture("zucchini", "🥒");
    this.createEmojiTexture("carrot", "🥕");
    this.createEmojiTexture("potato", "🥔");

    // Create fallback colored squares in case emojis don't render
    this.createColorTexture("eggplant-fallback", "#8E44AD"); // Purple
    this.createColorTexture("egg-fallback", "#F5F5F5"); // White
    this.createColorTexture("zucchini-fallback", "#2ECC71"); // Green
    this.createColorTexture("carrot-fallback", "#E67E22"); // Orange
    this.createColorTexture("potato-fallback", "#D0B084"); // Tan

    // Add error handling
    this.load.on("loaderror", (file) => {
      console.error("Error loading asset:", file.key);
    });
  }

  createEmojiTexture(key, emoji) {
    // Create a canvas to draw the emoji
    const canvas = document.createElement("canvas");
    canvas.width = 128; // Increase canvas size for better quality
    canvas.height = 128;
    const ctx = canvas.getContext("2d");

    // Clear canvas with a light background
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw a subtle circular background
    ctx.fillStyle = "rgba(240, 240, 240, 0.9)";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 55, 0, Math.PI * 2);
    ctx.fill();

    // Draw emoji centered on canvas with larger size
    ctx.font = "80px Arial, 'Segoe UI Emoji', sans-serif"; // Use emoji-compatible font
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, canvas.width / 2, canvas.height / 2);

    // Add a subtle border
    ctx.strokeStyle = "rgba(150, 150, 150, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 55, 0, Math.PI * 2);
    ctx.stroke();

    // Create a texture from the canvas and update atlas
    this.textures.addCanvas(key, canvas);

    // Log success for debugging
    console.log(`Created emoji texture for "${key}" with emoji: ${emoji}`);
  }

  createColorTexture(key, color) {
    // Create a simple colored square as fallback
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");

    // Draw colored square with border
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

    // Add texture to game
    this.textures.addCanvas(key, canvas);
  }

  // Method to ensure an ingredient has a valid texture
  ensureIngredientTexture(spriteObj, type) {
    // Check if the texture exists and has a valid frame
    if (!spriteObj.texture || spriteObj.texture.key === "__MISSING") {
      console.warn(`Missing texture for ${type}, using fallback`);
      // Try the fallback texture if main one is missing
      if (this.textures.exists(`${type}-fallback`)) {
        spriteObj.setTexture(`${type}-fallback`);
      }
    }
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
      this.openCookingWindow();
    });

    // Create scrollable ingredients area at the bottom
    this.createScrollableIngredients();

    // Setup drag-and-drop system
    this.setupDragDrop();
  }

  createScrollableIngredients() {
    // Create an opaque background for the ingredients area
    const ingredientsBg = this.add.rectangle(225, 650, 400, 250, 0xdeb887);
    ingredientsBg.setAlpha(0.9); // Make it mostly opaque
    ingredientsBg.setStrokeStyle(3, 0x8b4513);
    ingredientsBg.depth = 0;

    // Add a title for the ingredients section
    const ingredientsTitle = this.add.text(225, 550, "Ingredients", {
      fontSize: "20px",
      fill: "#333333",
      backgroundColor: "#FFFFFF",
      padding: { x: 10, y: 5 },
    });
    ingredientsTitle.setOrigin(0.5);
    ingredientsTitle.depth = 1;

    // Create a mask for the scrollable area
    this.scrollingMask = this.make.graphics();
    this.scrollingMask.fillRect(25, 580, 400, 200);

    // Create a container for all ingredients
    this.ingredientsContainer = this.add.container(225, 650);
    this.ingredientsContainer.depth = 1;

    // Create scroll buttons
    const upButton = this.add.image(400, 580, "up-arrow");
    if (!upButton.texture.key) {
      // If image not available, create a simple button
      const upButton = this.add.triangle(
        400,
        580,
        0,
        10,
        10,
        0,
        20,
        10,
        0x333333
      );
      upButton.setRotation(Math.PI); // Point upward
    }
    upButton.setDisplaySize(30, 30);
    upButton.setInteractive();
    upButton.depth = 2;
    upButton.on("pointerdown", () => this.scrollIngredients(-this.scrollStep));

    const downButton = this.add.image(400, 720, "down-arrow");
    if (!downButton.texture.key) {
      // If image not available, create a simple button
      const downButton = this.add.triangle(
        400,
        720,
        0,
        0,
        10,
        10,
        20,
        0,
        0x333333
      );
    }
    downButton.setDisplaySize(30, 30);
    downButton.setInteractive();
    downButton.depth = 2;
    downButton.on("pointerdown", () => this.scrollIngredients(this.scrollStep));

    // Apply the mask to the container
    const maskObject = this.scrollingMask.createGeometryMask();
    this.ingredientsContainer.setMask(maskObject);

    // Create ingredient buttons
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
      // New emoji-based ingredients
      "eggplant",
      "egg",
      "zucchini",
      "carrot",
      "potato",
      // Add more ingredients as needed - the container will scroll
    ];

    // Log ingredient types for debug
    console.log(
      `Setting up ${ingredientTypes.length} ingredients:`,
      ingredientTypes
    );

    // Calculate spacing based on number of ingredients
    const numColumns = 3;
    const columnWidth = 125;
    const rowHeight = 100;

    // X positions will be relative to container center
    const startX = -(columnWidth * (numColumns - 1)) / 2;

    // Arrange ingredients in a grid in the container
    ingredientTypes.forEach((type, index) => {
      const column = index % numColumns;
      const row = Math.floor(index / numColumns);

      const x = startX + column * columnWidth;
      const y = -70 + row * rowHeight; // Start above center, will be scrollable

      // Create ingredient button
      const sprite = this.add.sprite(x, y, type);

      // Verify texture was loaded
      this.ensureIngredientTexture(sprite, type);

      sprite.setDisplaySize(55, 55);
      sprite.depth = 1;
      sprite.type = type;

      // Make the sprite itself interactive
      sprite.setInteractive();
      sprite.on("pointerover", () => {
        sprite.setTint(0x2196f3); // Light blue tint
      });
      sprite.on("pointerout", () => {
        sprite.clearTint();
      });

      // Add a small highlight effect behind the ingredient
      const highlight = this.add.circle(x, y, 30, 0xffffff);
      highlight.setAlpha(0.3);
      highlight.depth = 0.5;

      // Add ingredient name below the sprite
      const nameText = this.add.text(
        x,
        y + 35,
        type.charAt(0).toUpperCase() + type.slice(1),
        {
          fontSize: "12px",
          fill: "#333333",
          align: "center",
          backgroundColor: "#FFFFFF",
          padding: { x: 4, y: 2 },
        }
      );
      nameText.setOrigin(0.5);

      // Create a group including the sprite and its label
      const buttonGroup = this.add.container(0, 0, [
        highlight,
        sprite,
        nameText,
      ]);

      // Add to the ingredients container
      this.ingredientsContainer.add(buttonGroup);

      // Store a reference to the button group
      this.ingredientButtons.push({
        container: buttonGroup,
        sprite: sprite,
        type: type,
        nameText: nameText,
      });

      // Log successful creation
      console.log(`Created ingredient: ${type}`);
    });

    // Enable wheel scrolling on the ingredients area
    this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      // Only scroll if pointer is over the ingredients area
      if (pointer.y > 550) {
        // Throttle scroll events
        const now = Date.now();
        if (now - this.lastScrollTime > 50) {
          // 50ms throttle
          this.scrollIngredients(deltaY * 0.7); // Increased multiplier from 0.5 to 0.7
          this.lastScrollTime = now;
        }
      }
    });

    // Set initial scroll position to show the beginning of the list
    this.ingredientsContainer.y = 585; // Adjusted starting position

    // Set up keyboard controls for scrolling (up/down arrows)
    this.input.keyboard.on("keydown-DOWN", () => {
      this.scrollIngredients(this.scrollStep);
    });

    this.input.keyboard.on("keydown-UP", () => {
      this.scrollIngredients(-this.scrollStep);
    });

    // Add scroll indicators on both buttons
    const upIndicator = this.add.text(400, 550, "⬆", {
      fontSize: "20px",
      fill: "#333333",
    });
    upIndicator.setOrigin(0.5);
    upIndicator.depth = 3;

    const downIndicator = this.add.text(400, 750, "⬇", {
      fontSize: "20px",
      fill: "#333333",
    });
    downIndicator.setOrigin(0.5);
    downIndicator.depth = 3;

    // Make indicators pulse
    this.tweens.add({
      targets: [upIndicator, downIndicator],
      alpha: { from: 1, to: 0.5 },
      duration: 600,
      yoyo: true,
      repeat: -1,
    });
  }

  setupDragDrop() {
    // Set up pointerdown event on ingredients to start creating drag sprites
    this.input.on("pointerdown", (pointer, gameObjects) => {
      // Only proceed if ingredients area is clicked
      if (pointer.y > 550) {
        // Find which ingredient was clicked by converting pointer to container coordinates
        const localX = pointer.x - this.ingredientsContainer.x;
        const localY = pointer.y - this.ingredientsContainer.y;

        // Find the closest ingredient to where user clicked
        let closestIngredient = null;
        let closestDistance = Number.MAX_VALUE;

        this.ingredientButtons.forEach((btn) => {
          const sprite = btn.sprite;
          const dx = sprite.x - localX;
          const dy = sprite.y - localY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // If this is closer than previous closest and within reasonable distance
          if (distance < closestDistance && distance < 50) {
            closestDistance = distance;
            closestIngredient = btn;
          }
        });

        // If found a close ingredient, create a draggable sprite for it
        if (closestIngredient) {
          // Do NOT auto-open cooking window
          this.createDragSprite(pointer.x, pointer.y, closestIngredient.type);
        }
      }
    });
  }

  createDragSprite(x, y, type) {
    // Create a completely new sprite at the world position
    const sprite = this.add.sprite(x, y, type);

    // Check if texture is valid and use fallback if needed
    this.ensureIngredientTexture(sprite, type);

    sprite.setDisplaySize(55, 55);
    sprite.type = type;
    sprite.depth = 100; // Very high depth to ensure it's above everything

    // Make it partially transparent
    sprite.setAlpha(0.8);

    // Add a more visible drag effect
    sprite.setTint(0x2196f3);

    // Add a glow effect
    const glow = this.add.circle(x, y, 32, 0xffffff);
    glow.setAlpha(0.5);
    glow.depth = 99;

    // Track if we're dragging this sprite
    let isDragging = true;

    // Create a pointer move handler that updates the sprite position
    const moveHandler = (pointer) => {
      if (isDragging) {
        sprite.x = pointer.x;
        sprite.y = pointer.y;
        glow.x = pointer.x;
        glow.y = pointer.y;
      }
    };

    // Create a pointer up handler that checks for drop zones and cleans up
    const upHandler = (pointer) => {
      if (!isDragging) return;

      // Stop dragging
      isDragging = false;

      let dropped = false;

      // Only check drop zones if cooking window is open
      if (this.isWindowOpen) {
        // Check drop zone 1
        if (this.dropZone1 && !this.dropZone1Content) {
          const bounds = this.dropZone1.getBounds();
          if (Phaser.Geom.Rectangle.Contains(bounds, sprite.x, sprite.y)) {
            this.addIngredientToDropZone(
              type,
              "dropZone1Content",
              this.dropZone1
            );
            dropped = true;
          }
        }

        // Check drop zone 2
        if (!dropped && this.dropZone2 && !this.dropZone2Content) {
          const bounds = this.dropZone2.getBounds();
          if (Phaser.Geom.Rectangle.Contains(bounds, sprite.x, sprite.y)) {
            this.addIngredientToDropZone(
              type,
              "dropZone2Content",
              this.dropZone2
            );
            dropped = true;
          }
        }
      }

      // Clean up event handlers
      this.input.off("pointermove", moveHandler);
      this.input.off("pointerup", upHandler);

      // Always destroy the sprite and glow effect
      sprite.destroy();
      glow.destroy();
    };

    // Add event listeners
    this.input.on("pointermove", moveHandler);
    this.input.on("pointerup", upHandler);

    return sprite;
  }

  addIngredientToDropZone(type, contentKey, targetZone) {
    // Create ingredient sprite in the target zone
    const sprite = this.add.sprite(targetZone.x, targetZone.y, type);

    // Ensure texture is valid
    this.ensureIngredientTexture(sprite, type);

    // Don't set display size yet - will do it after measuring natural size
    sprite.depth = 15; // Higher depth to appear above the cooking window
    sprite.type = type;

    // Get natural size of the sprite
    const naturalWidth = sprite.width;
    const naturalHeight = sprite.height;

    // Calculate the scale needed to make the sprite 55x55 pixels
    const targetScaleX = 55 / naturalWidth;
    const targetScaleY = 55 / naturalHeight;

    // Set initial scale to be smaller for animation
    const startScale = targetScaleX * 0.5;
    sprite.setScale(startScale);

    // Add a name label for the ingredient
    const nameLabel = this.add.text(
      targetZone.x,
      targetZone.y + 35,
      type.charAt(0).toUpperCase() + type.slice(1),
      {
        fontSize: "12px",
        fill: "#333333",
        backgroundColor: "#FFFFFF",
        padding: { x: 4, y: 2 },
      }
    );
    nameLabel.setOrigin(0.5);
    nameLabel.depth = 15;
    nameLabel.alpha = 0; // Start invisible for fade-in

    // Create a container for both the sprite and label
    const container = this.add.container(0, 0, [sprite, nameLabel]);
    container.depth = 15;

    // Store reference to the content
    this[contentKey] = {
      container: container,
      sprite: sprite,
      type: type,
    };

    // Add animation for the sprite - animate to the target scale
    this.tweens.add({
      targets: sprite,
      scaleX: targetScaleX,
      scaleY: targetScaleY,
      duration: 200,
      ease: "Sine.easeOut",
    });

    // Add fade-in animation for the label
    this.tweens.add({
      targets: nameLabel,
      alpha: { from: 0, to: 1 },
      duration: 200,
      ease: "Sine.easeOut",
    });

    // Log that we successfully added the ingredient
    console.log(`Added ${type} to ${contentKey}`);
  }

  scrollIngredients(amount) {
    // Calculate new position
    const newY = this.ingredientsContainer.y + amount;

    // Get total height of ingredients
    const numRows = Math.ceil(this.ingredientButtons.length / 3);
    const totalHeight = numRows * 100; // Row height is 100

    // Calculate valid scroll range - expand range to allow more scrolling
    // Adjust these values to ensure we can scroll to see all ingredients
    const maxScroll = 650 + totalHeight / 2; // Remove the -100 to allow more upward scrolling
    const minScroll = 650 - totalHeight / 2; // Remove the +100 to allow more downward scrolling

    console.log(
      `Scrolling: current=${this.ingredientsContainer.y}, new=${newY}, min=${minScroll}, max=${maxScroll}, rows=${numRows}`
    );

    // Apply scroll within bounds - make condition more lenient by flipping comparison operators
    if (newY <= maxScroll && newY >= minScroll) {
      this.ingredientsContainer.y = newY;
    } else if (newY > maxScroll) {
      // If we're trying to scroll too far up, cap at maximum
      this.ingredientsContainer.y = maxScroll;
    } else if (newY < minScroll) {
      // If we're trying to scroll too far down, cap at minimum
      this.ingredientsContainer.y = minScroll;
    }

    // Highlight ingredients that are currently in view for debugging
    this.highlightVisibleIngredients();
  }

  // Add a helper method to determine which ingredients are visible
  highlightVisibleIngredients() {
    // Define the visible area (the mask area)
    const visibleTop = this.ingredientsContainer.y - 100; // Approximate top of mask
    const visibleBottom = this.ingredientsContainer.y + 100; // Approximate bottom of mask

    // Update all ingredients to show which are visible
    this.ingredientButtons.forEach((btn, index) => {
      // Calculate the world Y position of this ingredient
      const worldY = this.ingredientsContainer.y + btn.sprite.y;

      // Check if this ingredient is in the visible area
      const isVisible = worldY > visibleTop && worldY < visibleBottom;

      // Log visibility status for debugging
      if (index === this.ingredientButtons.length - 5) {
        // Just log for new ingredients
        console.log(
          `Ingredient ${btn.type} at y=${worldY}, visible=${isVisible}`
        );
      }
    });
  }

  openCookingWindow() {
    // If window is already open, close it instead
    if (this.isWindowOpen) {
      this.closeCookingWindow();
      return;
    }

    this.isWindowOpen = true;

    // Create popup window background (semi-transparent so ingredients are still visible)
    this.cookingWindow = this.add.rectangle(225, 250, 400, 400, 0xf5f5dc);
    this.cookingWindow.setStrokeStyle(4, 0x663300);
    this.cookingWindow.setAlpha(0.95);
    this.cookingWindow.depth = 10;

    // Add title
    const title = this.add.text(225, 100, "Cooking Station", {
      fontSize: "28px",
      fill: "#663300",
      fontStyle: "bold",
      backgroundColor: "rgba(245, 245, 220, 0.9)",
      padding: { x: 15, y: 5 },
    });
    title.setOrigin(0.5);
    title.depth = 11;

    // Add close button
    const closeBtn = this.add.text(405, 100, "X", {
      fontSize: "24px",
      fill: "#663300",
      backgroundColor: "#FFFFFF",
      padding: { x: 8, y: 2 },
    });
    closeBtn.setOrigin(0.5);
    closeBtn.setInteractive();
    closeBtn.depth = 11;
    closeBtn.on("pointerdown", () => {
      this.closeCookingWindow();
    });

    // Create drop zones
    const dropZone1Bg = this.add.rectangle(150, 200, 120, 120, 0xffffff);
    dropZone1Bg.setStrokeStyle(3, 0x663300);
    dropZone1Bg.depth = 11;

    const dropZone2Bg = this.add.rectangle(300, 200, 120, 120, 0xffffff);
    dropZone2Bg.setStrokeStyle(3, 0x663300);
    dropZone2Bg.depth = 11;

    // Create result zone
    const resultZoneBg = this.add.rectangle(225, 350, 150, 150, 0xffffff);
    resultZoneBg.setStrokeStyle(3, 0x663300);
    resultZoneBg.depth = 11;

    // Store references to zones
    this.dropZone1 = dropZone1Bg;
    this.dropZone2 = dropZone2Bg;
    this.resultZone = resultZoneBg;

    // Add labels
    const label1 = this.add.text(150, 160, "Ingredient 1", {
      fontSize: "16px",
      fill: "#663300",
      backgroundColor: "#FFFFFF",
      padding: { x: 5, y: 2 },
    });
    label1.setOrigin(0.5);
    label1.depth = 11;

    const label2 = this.add.text(300, 160, "Ingredient 2", {
      fontSize: "16px",
      fill: "#663300",
      backgroundColor: "#FFFFFF",
      padding: { x: 5, y: 2 },
    });
    label2.setOrigin(0.5);
    label2.depth = 11;

    const resultLabel = this.add.text(225, 300, "Result", {
      fontSize: "16px",
      fill: "#663300",
      backgroundColor: "#FFFFFF",
      padding: { x: 5, y: 2 },
    });
    resultLabel.setOrigin(0.5);
    resultLabel.depth = 11;

    // Create cook button
    this.cookButton = this.add.rectangle(225, 450, 120, 50, 0x4caf50);
    this.cookButton.setStrokeStyle(3, 0x388e3c);
    this.cookButton.depth = 11;

    const cookText = this.add.text(225, 450, "COOK", {
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

    // Add drop zone hints
    const dropHint1 = this.add.text(150, 200, "Drop\nHere", {
      fontSize: "16px",
      fill: "#AAAAAA",
      align: "center",
    });
    dropHint1.setOrigin(0.5);
    dropHint1.depth = 11;
    dropHint1.alpha = 0.7;

    const dropHint2 = this.add.text(300, 200, "Drop\nHere", {
      fontSize: "16px",
      fill: "#AAAAAA",
      align: "center",
    });
    dropHint2.setOrigin(0.5);
    dropHint2.depth = 11;
    dropHint2.alpha = 0.7;
  }

  closeCookingWindow() {
    if (!this.isWindowOpen) return;

    // Track all elements that belong to the cooking window
    const elementsToDestroy = [];

    // Clean up all UI components related to cooking window by depth
    this.children.list.forEach((child) => {
      // All cooking window elements have depth 10 or higher
      if (child.depth >= 10) {
        elementsToDestroy.push(child);
      }

      // Also check for any text elements that could be related to cooking
      if (child.type === "Text" && child.text) {
        if (
          child.text.includes("Drop") ||
          child.text.includes("Ingredient") ||
          child.text.includes("Result") ||
          child.text.includes("Cooking") ||
          child.text.includes("COOK") ||
          child.text.includes("RESET") ||
          child.text === "X" ||
          child.text.includes("✨")
        ) {
          elementsToDestroy.push(child);
        }
      }
    });

    // Destroy all collected elements
    elementsToDestroy.forEach((element) => {
      if (element && !element.destroyed) {
        element.destroy();
      }
    });

    // Make sure to clear these references
    this.dropZone1 = null;
    this.dropZone2 = null;
    this.resultZone = null;
    this.cookButton = null;

    // Clean up any dropped ingredients
    if (this.dropZone1Content) {
      this.dropZone1Content.container.destroy();
      this.dropZone1Content = null;
    }
    if (this.dropZone2Content) {
      this.dropZone2Content.container.destroy();
      this.dropZone2Content = null;
    }
    if (this.resultContent) {
      if (this.resultContent.sprite) this.resultContent.sprite.destroy();
      if (this.resultContent.name) this.resultContent.name.destroy();
      if (this.resultContent.container) this.resultContent.container.destroy();
      this.resultContent = null;
    }

    // Set window state to closed
    this.isWindowOpen = false;

    // Remove any lingering event listeners for the cook button
    if (this.cookButton && this.cookButton.removeAllListeners) {
      this.cookButton.removeAllListeners("pointerdown");
    }

    // Force garbage collection to clean up any remaining references
    this.children.each((child) => {
      if (child && !child.active) {
        this.children.remove(child);
      }
    });
  }

  startCooking() {
    // Check if we have two ingredients
    if (!this.dropZone1Content || !this.dropZone2Content) {
      // Display error message
      const errorMsg = this.add.text(225, 400, "Need two ingredients!", {
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
    const spinner = this.add.text(225, 400, "Cooking...", {
      fontSize: "20px",
      fill: "#663300",
      backgroundColor: "#FFFFFF",
      padding: { x: 10, y: 5 },
    });
    spinner.setOrigin(0.5);
    spinner.depth = 12;

    // Wait 2 seconds for cooking to complete
    this.time.delayedCall(2000, () => {
      // Remove spinner
      spinner.destroy();

      // Hide ingredients
      this.dropZone1Content.sprite.alpha = 0;
      this.dropZone2Content.sprite.alpha = 0;

      // Find matching recipe
      const ingredients = [
        { type: this.dropZone1Content.type },
        { type: this.dropZone2Content.type },
      ];

      const recipe = findMatchingRecipe(ingredients);

      // Display result
      if (recipe) {
        // Create result icon (using first ingredient as placeholder)
        const resultSprite = this.add.sprite(
          this.resultZone.x,
          this.resultZone.y,
          this.dropZone1Content.type
        );
        resultSprite.setDisplaySize(100, 100);
        resultSprite.depth = 12;

        // Add recipe name
        const recipeName = this.add.text(225, 400, `✨ ${recipe.name} ✨`, {
          fontSize: "22px",
          fill: "#4CAF50",
          backgroundColor: "#FFFFFF",
          padding: { x: 10, y: 5 },
        });
        recipeName.setOrigin(0.5);
        recipeName.depth = 12;

        // Store result reference
        this.resultContent = {
          sprite: resultSprite,
          name: recipeName,
          recipe: recipe,
        };
      } else {
        // No matching recipe
        const noRecipe = this.add.text(225, 400, "No recipe found!", {
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

      // Change to RESET button immediately instead of waiting
      this.cookButton.removeAllListeners("pointerdown");
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
  }

  resetCooking() {
    // Clean up previous result and ingredients
    if (this.dropZone1Content) {
      this.dropZone1Content.container.destroy();
      this.dropZone1Content = null;
    }

    if (this.dropZone2Content) {
      this.dropZone2Content.container.destroy();
      this.dropZone2Content = null;
    }

    // More thorough cleanup for result content
    if (this.resultContent) {
      if (this.resultContent.sprite) this.resultContent.sprite.destroy();
      if (this.resultContent.name) this.resultContent.name.destroy();

      // Destroy any other components that might exist
      if (this.resultContent.container) this.resultContent.container.destroy();

      this.resultContent = null;
    }

    // More thorough cleanup of all elements with specific depths or text content
    this.children.list.forEach((child) => {
      // Check for result-related texts
      if (
        child.text &&
        (child.text.includes("✨") ||
          child.text === "No recipe found!" ||
          child.text === "Cooking...")
      ) {
        child.destroy();
      }

      // Check for result-related graphics at specific depths
      if (
        child.depth >= 12 &&
        (child.type === "Sprite" ||
          child.type === "Text" ||
          child.type === "Container")
      ) {
        // Only destroy if in the result zone area
        if (
          this.resultZone &&
          Math.abs(child.x - this.resultZone.x) < 100 &&
          Math.abs(child.y - this.resultZone.y) < 100
        ) {
          child.destroy();
        }
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

    // Re-add drop zone hints
    const dropHint1 = this.add.text(150, 200, "Drop\nHere", {
      fontSize: "16px",
      fill: "#AAAAAA",
      align: "center",
    });
    dropHint1.setOrigin(0.5);
    dropHint1.depth = 11;
    dropHint1.alpha = 0.7;

    const dropHint2 = this.add.text(300, 200, "Drop\nHere", {
      fontSize: "16px",
      fill: "#AAAAAA",
      align: "center",
    });
    dropHint2.setOrigin(0.5);
    dropHint2.depth = 11;
    dropHint2.alpha = 0.7;
  }
}
