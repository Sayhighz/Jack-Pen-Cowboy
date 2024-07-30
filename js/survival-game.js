import MainScene from "./MainScene.js";
import StartScene from "./StartScene.js";
import SelectScene from "./SelectScene.js";
import RankingScene from "./RankingScene.js";
import TurorialScene from "./TutorialScene.js";
import Scene2 from "./Scene2.js";
import Scene3 from "./Scene3.js";

const config = {
  type: Phaser.AUTO,
  parent: "survival-game",
  scene: [
    StartScene,
    SelectScene,
    TurorialScene,
    MainScene,
    Scene2,
    Scene3,
    RankingScene,
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 512,
    height: 512,
  },
  physics: {
    default: "matter",
    matter: {
      debug: {
        showBody: true, // Disable body debug drawing globally
        showStaticBody: true, // Disable static body debug drawing globally
      },
      gravity: { y: 0 },
    },
  },
  plugins: {
    scene: [
      {
        plugin: PhaserMatterCollisionPlugin,
        key: "matterCollision",
        mapping: "matterCollision",
      },
    ],
  },
};

new Phaser.Game(config);
