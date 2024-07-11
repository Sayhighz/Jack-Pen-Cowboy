import MainScene from "./MainScene.js";
import StartScene from "./StartScene.js";
import SelectScene  from "./SelectScene.js";
import RankingScene from "./RankingScene.js";
import Scene2 from "./Scene2.js";

const config = {
    type: Phaser.AUTO,
    parent: 'survival-game',
    scene: [StartScene, SelectScene, MainScene, Scene2, RankingScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 512,
        height: 512,
    },
    physics: {
        default: 'matter',
        matter: {
            debug: {
                showBody: false,  // Disable body debug drawing globally
                showStaticBody: false,  // Disable static body debug drawing globally
            },
            gravity: { y: 0 },
        }
    },
    plugins: {
        scene: [
            {
                plugin: PhaserMatterCollisionPlugin,
                key: 'matterCollision',
                mapping: 'matterCollision'
            }
        ]
    }
};

new Phaser.Game(config);
