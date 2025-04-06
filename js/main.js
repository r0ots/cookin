import config from "./config.js";
import MainScene from "./MainScene.js";

// Set the scene
config.scene = MainScene;

// Initialize the game
const game = new Phaser.Game(config);
