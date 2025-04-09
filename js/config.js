// Game configuration
const config = {
  type: Phaser.AUTO,
  width: 450, // Mobile width (9:16 ratio)
  height: 800, // Keep same height
  parent: "game-container",
  scene: null, // Will be set in main.js
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  banner: true,
  title: "Cooking Game",
  version: "1.0",
  loader: {
    baseURL: "./",
    path: "./",
    maxParallelDownloads: 32,
    crossOrigin: "anonymous",
    timeout: 0,
  },
};

// Add global error handler
window.onerror = function (msg, url, lineNo, columnNo, error) {
  console.error(
    "Error: " +
      msg +
      "\nURL: " +
      url +
      "\nLine: " +
      lineNo +
      "\nColumn: " +
      columnNo +
      "\nError object: " +
      JSON.stringify(error)
  );
  return false;
};

export default config;
