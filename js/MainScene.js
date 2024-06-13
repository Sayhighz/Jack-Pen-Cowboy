import Player from "./Player.js";

export default class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");
    }
    
    preload() {
        Player.preload(this);
        this.load.image('tiles', 'assets/images/RPG Nature Tileset.png');
        this.load.tilemapTiledJSON('map', 'assets/images/map.json');
    }

    create() {
        const map = this.make.tilemap({ key: 'map' });
        console.log("Map:", map);
        
        const tileset = map.addTilesetImage('RPG Nature Tileset', 'tiles', 32, 32, 0, 0);
        console.log("Tileset:", tileset);

        if (tileset) {
            const layer1 = map.createLayer('Tile Layer 1', tileset, 0, 0);
            console.log("Layer1:", layer1);
        } else {
            console.error("Tileset not found. Check if the tileset name in the JSON matches 'RPG Nature Tileset'.");
        }
        
        this.player = new Player({ scene: this, x: 100, y: 100, texture: 'female', frame: 'townsfolk_f_idle_1' });
    }

    update() {
        const commandInput = document.getElementById('command-input');
        commandInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const commands = commandInput.value.toLowerCase().split(',');
                commands.forEach(command => {
                    this.executeCommand(command.trim());
                });
                commandInput.value = ''; // Clear input after executing commands
            }
        });
    }

    executeCommand(command) {
        switch (command) {
            case 'left':
                this.player.moveLeft();
                break;
            case 'right':
                this.player.moveRight();
                break;
            case 'up':
                this.player.moveUp();
                break;
            case 'down':
                this.player.moveDown();
                break;
            default:
                console.log('Invalid command');
        }
    }
}
