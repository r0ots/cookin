export class IngredientsPanel {
  constructor(scene) {
    this.scene = scene;
    this.container = null;
    this.scrollingMask = null;
    this.scrollPosition = 0;
    this.scrollStep = 70;
    this.lastScrollTime = 0;
    this.buttons = [];
  }

  create() {
    this.createBackground();
    this.createScrollableArea();
    this.createIngredientButtons();
    this.setupScrollControls();
  }

  createBackground() {
    // Create an opaque background for the ingredients area
    const bg = this.scene.add.rectangle(225, 650, 400, 250, 0xdeb887);
    bg.setAlpha(0.9);
    bg.setStrokeStyle(3, 0x8b4513);
    bg.depth = 0;

    // Add a title for the ingredients section
    const title = this.scene.add.text(225, 550, "Ingredients", {
      fontSize: "20px",
      fill: "#333333",
      backgroundColor: "#FFFFFF",
      padding: { x: 10, y: 5 },
    });
    title.setOrigin(0.5);
    title.depth = 1;
  }

  createScrollableArea() {
    // Create a mask for the scrollable area
    this.scrollingMask = this.scene.make.graphics();
    this.scrollingMask.fillRect(25, 580, 400, 200);

    // Create a container for all ingredients
    this.container = this.scene.add.container(225, 650);
    this.container.depth = 1;

    // Apply the mask to the container
    const maskObject = this.scrollingMask.createGeometryMask();
    this.container.setMask(maskObject);

    // Set initial position
    this.container.y = 585;
  }

  createIngredientButtons() {
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
      "eggplant",
      "egg",
      "zucchini",
      "carrot",
      "potato",
    ];

    console.log(
      `Setting up ${ingredientTypes.length} ingredients:`,
      ingredientTypes
    );

    const numColumns = 3;
    const columnWidth = 125;
    const rowHeight = 100;
    const startX = -(columnWidth * (numColumns - 1)) / 2;

    ingredientTypes.forEach((type, index) => {
      const column = index % numColumns;
      const row = Math.floor(index / numColumns);
      const x = startX + column * columnWidth;
      const y = -70 + row * rowHeight;

      this.createIngredientButton(type, x, y);
    });
  }

  createIngredientButton(type, x, y) {
    // Create highlight effect
    const highlight = this.scene.add.circle(x, y, 30, 0xffffff);
    highlight.setAlpha(0.3);
    highlight.depth = 0.5;

    // Create sprite
    const sprite = this.scene.add.sprite(x, y, type);
    this.ensureIngredientTexture(sprite, type);
    sprite.setDisplaySize(55, 55);
    sprite.depth = 1;
    sprite.type = type;

    // Make interactive
    sprite.setInteractive();
    sprite.on("pointerover", () => {
      sprite.setTint(0x2196f3);
    });
    sprite.on("pointerout", () => {
      sprite.clearTint();
    });

    // Add name label
    const nameText = this.scene.add.text(
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

    // Create button group
    const buttonGroup = this.scene.add.container(0, 0, [
      highlight,
      sprite,
      nameText,
    ]);

    // Add to ingredients container
    this.container.add(buttonGroup);

    // Store reference
    this.buttons.push({
      container: buttonGroup,
      sprite: sprite,
      type: type,
      nameText: nameText,
    });

    console.log(`Created ingredient: ${type}`);
  }

  setupScrollControls() {
    // Create scroll buttons
    this.createScrollButton(400, 580, "up", -this.scrollStep);
    this.createScrollButton(400, 720, "down", this.scrollStep);

    // Enable wheel scrolling
    this.scene.input.on(
      "wheel",
      (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
        if (pointer.y > 550) {
          const now = Date.now();
          if (now - this.lastScrollTime > 50) {
            this.scroll(deltaY * 0.7);
            this.lastScrollTime = now;
          }
        }
      }
    );

    // Set up keyboard controls
    this.scene.input.keyboard.on("keydown-DOWN", () => {
      this.scroll(this.scrollStep);
    });

    this.scene.input.keyboard.on("keydown-UP", () => {
      this.scroll(-this.scrollStep);
    });
  }

  createScrollButton(x, y, direction, amount) {
    const arrow = this.scene.add.image(x, y, `${direction}-arrow`);
    if (!arrow.texture.key) {
      // Create fallback triangle if image not available
      const points =
        direction === "up"
          ? [
              [0, 10],
              [10, 0],
              [20, 10],
            ]
          : [
              [0, 0],
              [10, 10],
              [20, 0],
            ];
      arrow = this.scene.add.triangle(x, y, ...points.flat(), 0x333333);
      if (direction === "up") arrow.setRotation(Math.PI);
    }
    arrow.setDisplaySize(30, 30);
    arrow.setInteractive();
    arrow.depth = 2;
    arrow.on("pointerdown", () => this.scroll(amount));

    // Add scroll indicator
    const indicator = this.scene.add.text(
      x,
      direction === "up" ? y - 30 : y + 30,
      direction === "up" ? "⬆" : "⬇",
      {
        fontSize: "20px",
        fill: "#333333",
      }
    );
    indicator.setOrigin(0.5);
    indicator.depth = 3;

    // Make indicators pulse
    this.scene.tweens.add({
      targets: indicator,
      alpha: { from: 1, to: 0.5 },
      duration: 600,
      yoyo: true,
      repeat: -1,
    });
  }

  scroll(amount) {
    const newY = this.container.y + amount;

    // Calculate total height of ingredients
    const numRows = Math.ceil(this.buttons.length / 3);
    const totalHeight = numRows * 100;

    // Calculate valid scroll range
    const maxScroll = 650 + totalHeight / 2;
    const minScroll = 650 - totalHeight / 2;

    console.log(
      `Scrolling: current=${this.container.y}, new=${newY}, min=${minScroll}, max=${maxScroll}, rows=${numRows}`
    );

    // Apply scroll within bounds
    if (newY <= maxScroll && newY >= minScroll) {
      this.container.y = newY;
    } else if (newY > maxScroll) {
      this.container.y = maxScroll;
    } else if (newY < minScroll) {
      this.container.y = minScroll;
    }

    this.highlightVisibleIngredients();
  }

  highlightVisibleIngredients() {
    const visibleTop = this.container.y - 100;
    const visibleBottom = this.container.y + 100;

    this.buttons.forEach((btn, index) => {
      const worldY = this.container.y + btn.sprite.y;
      const isVisible = worldY > visibleTop && worldY < visibleBottom;

      if (index === this.buttons.length - 5) {
        console.log(
          `Ingredient ${btn.type} at y=${worldY}, visible=${isVisible}`
        );
      }
    });
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
