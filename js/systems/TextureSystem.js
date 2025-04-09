export class TextureSystem {
  constructor(scene) {
    this.scene = scene;
  }

  preloadTextures() {
    // Load ingredient images
    this.scene.load.image("lettuce", "assets/lettuce.png");
    this.scene.load.image("tomato", "assets/tomato.png");
    this.scene.load.image("cucumber", "assets/cucumber.png");
    this.scene.load.image("dough", "assets/dough.png");
    this.scene.load.image("cheese", "assets/cheese.png");
    this.scene.load.image("bread", "assets/bread.png");
    this.scene.load.image("mushroom", "assets/mushroom.png");
    this.scene.load.image("meat", "assets/meat.png");
    this.scene.load.image("onion", "assets/onion.png");
    this.scene.load.image("shrimp", "assets/shrimp.png");
    this.scene.load.image("recipe-zone", "assets/recipe-zone.png");
    this.scene.load.image("kitchen-bg", "assets/kitchen.png");
    this.scene.load.image("up-arrow", "assets/up-arrow.png");
    this.scene.load.image("down-arrow", "assets/down-arrow.png");

    // Create emoji-based textures for new ingredients
    this.createEmojiTexture("eggplant", "🍆");
    this.createEmojiTexture("egg", "🥚");
    this.createEmojiTexture("zucchini", "🥒");
    this.createEmojiTexture("carrot", "🥕");
    this.createEmojiTexture("potato", "🥔");

    // Create fallback colored squares
    this.createColorTexture("eggplant-fallback", "#8E44AD"); // Purple
    this.createColorTexture("egg-fallback", "#F5F5F5"); // White
    this.createColorTexture("zucchini-fallback", "#2ECC71"); // Green
    this.createColorTexture("carrot-fallback", "#E67E22"); // Orange
    this.createColorTexture("potato-fallback", "#D0B084"); // Tan

    // Add error handling
    this.scene.load.on("loaderror", (file) => {
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
    this.scene.textures.addCanvas(key, canvas);

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
    this.scene.textures.addCanvas(key, canvas);
  }

  ensureTexture(sprite, type) {
    // Check if the texture exists and has a valid frame
    if (!sprite.texture || sprite.texture.key === "__MISSING") {
      console.warn(`Missing texture for ${type}, using fallback`);
      // Try the fallback texture if main one is missing
      if (this.scene.textures.exists(`${type}-fallback`)) {
        sprite.setTexture(`${type}-fallback`);
      }
    }
  }
}
