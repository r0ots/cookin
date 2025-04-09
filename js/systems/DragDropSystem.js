export class DragDropSystem {
  constructor(scene) {
    this.scene = scene;
    this.draggedSprite = null;
  }

  init() {
    this.setupDragHandlers();
  }

  setupDragHandlers() {
    // Set up pointerdown event on ingredients to start creating drag sprites
    this.scene.input.on("pointerdown", (pointer) => {
      // Only proceed if ingredients area is clicked
      if (pointer.y > 550) {
        this.handleIngredientClick(pointer);
      }
    });
  }

  handleIngredientClick(pointer) {
    const { ingredientsPanel } = this.scene;

    // Convert pointer to container coordinates
    const localX = pointer.x - ingredientsPanel.container.x;
    const localY = pointer.y - ingredientsPanel.container.y;

    // Find the closest ingredient to where user clicked
    let closestIngredient = null;
    let closestDistance = Number.MAX_VALUE;

    ingredientsPanel.buttons.forEach((btn) => {
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
      this.createDragSprite(pointer.x, pointer.y, closestIngredient.type);
    }
  }

  createDragSprite(x, y, type) {
    // Create a completely new sprite at the world position
    const sprite = this.scene.add.sprite(x, y, type);

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
    const glow = this.scene.add.circle(x, y, 32, 0xffffff);
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
      const { cookingWindow } = this.scene;

      // Only check drop zones if cooking window is open
      if (cookingWindow.isOpen) {
        // Check drop zone 1
        if (cookingWindow.dropZone1 && !cookingWindow.dropZone1Content) {
          const bounds = cookingWindow.dropZone1.getBounds();
          if (Phaser.Geom.Rectangle.Contains(bounds, sprite.x, sprite.y)) {
            this.addIngredientToDropZone(
              type,
              "dropZone1Content",
              cookingWindow.dropZone1
            );
            dropped = true;
          }
        }

        // Check drop zone 2
        if (
          !dropped &&
          cookingWindow.dropZone2 &&
          !cookingWindow.dropZone2Content
        ) {
          const bounds = cookingWindow.dropZone2.getBounds();
          if (Phaser.Geom.Rectangle.Contains(bounds, sprite.x, sprite.y)) {
            this.addIngredientToDropZone(
              type,
              "dropZone2Content",
              cookingWindow.dropZone2
            );
            dropped = true;
          }
        }
      }

      // Clean up event handlers
      this.scene.input.off("pointermove", moveHandler);
      this.scene.input.off("pointerup", upHandler);

      // Always destroy the sprite and glow effect
      sprite.destroy();
      glow.destroy();
    };

    // Add event listeners
    this.scene.input.on("pointermove", moveHandler);
    this.scene.input.on("pointerup", upHandler);

    return sprite;
  }

  addIngredientToDropZone(type, contentKey, targetZone) {
    // Create ingredient sprite in the target zone
    const sprite = this.scene.add.sprite(targetZone.x, targetZone.y, type);

    // Ensure texture is valid
    this.ensureIngredientTexture(sprite, type);

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
    const nameLabel = this.scene.add.text(
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
    const container = this.scene.add.container(0, 0, [sprite, nameLabel]);
    container.depth = 15;

    // Store reference to the content
    this.scene.cookingWindow[contentKey] = {
      container: container,
      sprite: sprite,
      type: type,
    };

    // Add animation for the sprite
    this.scene.tweens.add({
      targets: sprite,
      scaleX: targetScaleX,
      scaleY: targetScaleY,
      duration: 200,
      ease: "Sine.easeOut",
    });

    // Add fade-in animation for the label
    this.scene.tweens.add({
      targets: nameLabel,
      alpha: { from: 0, to: 1 },
      duration: 200,
      ease: "Sine.easeOut",
    });

    console.log(`Added ${type} to ${contentKey}`);
  }

  ensureIngredientTexture(sprite, type) {
    if (!sprite.texture || sprite.texture.key === "__MISSING") {
      console.warn(`Missing texture for ${type}, using fallback`);
      if (this.scene.textures.exists(`${type}-fallback`)) {
        sprite.setTexture(`${type}-fallback`);
      }
    }
  }
}
