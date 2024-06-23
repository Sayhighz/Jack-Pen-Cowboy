import MainScene from "./MainScene.js";
import StartScene from "./StartScene.js";

const config = {
    type: Phaser.AUTO,
    parent: 'survival-game',
    scene: [StartScene, MainScene],  // เพิ่ม StartScene ก่อน MainScene
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 512,
        height: 512,
    },
    physics: {
        default: 'matter',
        matter: {
            debug: true,
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
