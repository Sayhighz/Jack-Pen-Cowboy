// survival-game.js
import MainScene from "./MainScene.js";

const config = {
    type: Phaser.AUTO,
    parent: 'survival-game',
    scene: [MainScene],
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
    // physics: {
    //     default: "arcade",
    //     arcade: {
    //         gravity: { y: 0 },
    //         debug: false
    //     }
    // },
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
