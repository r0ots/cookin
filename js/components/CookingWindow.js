export class CookingWindow {
  constructor(scene) {
    this.scene = scene;
    this.isOpen = false;
    this.window = null;
    this.dropZone1 = null;
    this.dropZone2 = null;
    this.resultZone = null;
    this.cookButton = null;
    this.dropZone1Content = null;
    this.dropZone2Content = null;
    this.resultContent = null;
  }

  open() {
    if (this.isOpen) {
      this.close();
      return;
    }

    this.isOpen = true;
    this.createWindow();
    this.createDropZones();
    this.createResultZone();
    this.createCookButton();
  }

  createWindow() {
    // Create popup window background
    this.window = this.scene.add.rectangle(225, 250, 400, 400, 0xf5f5dc);
    this.window.setStrokeStyle(4, 0x663300);
    this.window.setAlpha(0.95);
    this.window.depth = 10;

    // Add title
    const title = this.scene.add.text(225, 100, "Cooking Station", {
      fontSize: "28px",
      fill: "#663300",
      fontStyle: "bold",
      backgroundColor: "rgba(245, 245, 220, 0.9)",
      padding: { x: 15, y: 5 },
    });
    title.setOrigin(0.5);
    title.depth = 11;

    // Add close button
    const closeBtn = this.scene.add.text(405, 100, "X", {
      fontSize: "24px",
      fill: "#663300",
      backgroundColor: "#FFFFFF",
      padding: { x: 8, y: 2 },
    });
    closeBtn.setOrigin(0.5);
    closeBtn.setInteractive();
    closeBtn.depth = 11;
    closeBtn.on("pointerdown", () => this.close());
  }

  createDropZones() {
    // Create drop zones
    this.dropZone1 = this.scene.add.rectangle(150, 200, 120, 120, 0xffffff);
    this.dropZone1.setStrokeStyle(3, 0x663300);
    this.dropZone1.depth = 11;

    this.dropZone2 = this.scene.add.rectangle(300, 200, 120, 120, 0xffffff);
    this.dropZone2.setStrokeStyle(3, 0x663300);
    this.dropZone2.depth = 11;

    // Add labels
    const label1 = this.scene.add.text(150, 160, "Ingredient 1", {
      fontSize: "16px",
      fill: "#663300",
      backgroundColor: "#FFFFFF",
      padding: { x: 5, y: 2 },
    });
    label1.setOrigin(0.5);
    label1.depth = 11;

    const label2 = this.scene.add.text(300, 160, "Ingredient 2", {
      fontSize: "16px",
      fill: "#663300",
      backgroundColor: "#FFFFFF",
      padding: { x: 5, y: 2 },
    });
    label2.setOrigin(0.5);
    label2.depth = 11;

    // Add drop zone hints
    this.addDropZoneHints();
  }

  createResultZone() {
    this.resultZone = this.scene.add.rectangle(225, 350, 150, 150, 0xffffff);
    this.resultZone.setStrokeStyle(3, 0x663300);
    this.resultZone.depth = 11;

    const resultLabel = this.scene.add.text(225, 300, "Result", {
      fontSize: "16px",
      fill: "#663300",
      backgroundColor: "#FFFFFF",
      padding: { x: 5, y: 2 },
    });
    resultLabel.setOrigin(0.5);
    resultLabel.depth = 11;
  }

  createCookButton() {
    this.cookButton = this.scene.add.rectangle(225, 450, 120, 50, 0x4caf50);
    this.cookButton.setStrokeStyle(3, 0x388e3c);
    this.cookButton.depth = 11;

    const cookText = this.scene.add.text(225, 450, "COOK", {
      fontSize: "20px",
      fill: "#FFFFFF",
      fontStyle: "bold",
    });
    cookText.setOrigin(0.5);
    cookText.depth = 12;

    this.cookButton.setInteractive();
    this.cookButton.on("pointerdown", () => this.scene.startCooking());
  }

  addDropZoneHints() {
    const dropHint1 = this.scene.add.text(150, 200, "Drop\nHere", {
      fontSize: "16px",
      fill: "#AAAAAA",
      align: "center",
    });
    dropHint1.setOrigin(0.5);
    dropHint1.depth = 11;
    dropHint1.alpha = 0.7;

    const dropHint2 = this.scene.add.text(300, 200, "Drop\nHere", {
      fontSize: "16px",
      fill: "#AAAAAA",
      align: "center",
    });
    dropHint2.setOrigin(0.5);
    dropHint2.depth = 11;
    dropHint2.alpha = 0.7;
  }

  close() {
    if (!this.isOpen) return;

    // Track all elements that belong to the cooking window
    const elementsToDestroy = [];

    // Clean up all UI components related to cooking window by depth
    this.scene.children.list.forEach((child) => {
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

    // Clear references
    this.window = null;
    this.dropZone1 = null;
    this.dropZone2 = null;
    this.resultZone = null;
    this.cookButton = null;

    // Clean up dropped ingredients
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

    this.isOpen = false;

    // Force garbage collection
    this.scene.children.each((child) => {
      if (child && !child.active) {
        this.scene.children.remove(child);
      }
    });
  }

  reset() {
    // Clean up previous result and ingredients
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

    // Clean up result-related elements
    this.scene.children.list.forEach((child) => {
      if (
        child.text &&
        (child.text.includes("✨") ||
          child.text === "No recipe found!" ||
          child.text === "Cooking...")
      ) {
        child.destroy();
      }

      if (
        child.depth >= 12 &&
        (child.type === "Sprite" ||
          child.type === "Text" ||
          child.type === "Container")
      ) {
        if (
          this.resultZone &&
          Math.abs(child.x - this.resultZone.x) < 100 &&
          Math.abs(child.y - this.resultZone.y) < 100
        ) {
          child.destroy();
        }
      }

      if (child.text === "RESET" && child.depth === 12) {
        child.setText("COOK");
      }
    });

    // Reset button handler
    this.cookButton.removeAllListeners("pointerdown");
    this.cookButton.on("pointerdown", () => this.scene.startCooking());

    // Re-add drop zone hints
    this.addDropZoneHints();
  }

  showError(message) {
    const errorMsg = this.scene.add.text(225, 400, message, {
      fontSize: "18px",
      fill: "#FF0000",
      backgroundColor: "#FFFFFF",
      padding: { x: 10, y: 5 },
    });
    errorMsg.setOrigin(0.5);
    errorMsg.depth = 12;

    this.scene.time.delayedCall(1500, () => {
      errorMsg.destroy();
    });
  }
}
