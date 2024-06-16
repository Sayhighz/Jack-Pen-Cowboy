import Player from "./Player.js";

export default class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");
    }

    preload() {
        // Preload assets and player animations
        Player.preload(this);
        this.load.image('tiles', 'assets/images/Dungeon_Tileset_at.png');
        this.load.tilemapTiledJSON('map', 'assets/images/newmap.json');
    }

    create() {
        // Create tilemap and layers
        const map = this.make.tilemap({ key: 'map' });
        const tileset = map.addTilesetImage('Dungeon_Tileset_at', 'tiles', 32, 32, 0, 0);

        if (tileset) {
            const layer1 = map.createLayer('Tile Layer 1', tileset, 0, 0);
            layer1.setCollisionByProperty({ collides: true });
            this.matter.world.convertTilemapLayer(layer1);

            const layer2 = map.createLayer('Tile Layer 2', tileset, 0, 0);

            const layer3 = map.createLayer('Tile Layer 3', tileset, 0, 0);
        } else {
            console.error("Tileset not found. Check if the tileset name in the JSON matches 'Dungeon_Tileset_at'.");
        }

        // Create player instance
        this.player = new Player({ scene: this, x: 50, y: 50, texture: 'female', frame: 'townsfolk_f_idle_1' });

        // Listen for collision event
        this.matter.world.on('collisionstart', this.handleCollision, this);

        // Setup input listener for command input and button
        this.setupCommandInput();
    }

    update() {
        // Update game logic
        this.player.anims.play('female_idle', true);
        // Additional game logic updates can be added here
    }

    handleCollision(event) {
        event.pairs.forEach(pair => {
            const { bodyA, bodyB } = pair;

            if ((bodyA.label === 'playerCollider' && bodyB.isStatic) || (bodyB.label === 'playerCollider' && bodyA.isStatic)) {
                alert('แพ้แล้ว! เกมจะเริ่มใหม่');
                this.scene.restart();
            }
        });
    }

    setupCommandInput() {
        const commandLabel = document.getElementById('command-label');
        const commandButton = document.getElementById('command-button');

        // Function to handle button click
        const executeCommands = async () => {
            this.scene.restart(); // Restart the scene

            // Wait for the scene to restart
            this.events.once('create', async () => {
                const commands = commandLabel.value.toLowerCase().split('\n'); // Split by newline to read line by line
                for (const command of commands) {
                    if (command.trim() !== '') { // Skip empty lines
                        await this.executeCommand(command.trim());
                    }
                }
            });
        };

        // Button click event listener
        commandButton.addEventListener('click', () => {
            executeCommands();
        });

        // Also handle Enter key press in textarea
        commandLabel.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // Prevent default Enter key behavior (submitting form)
                await executeCommands(); // Execute commands when Enter is pressed
            }
        });
    }

    async executeCommand(command) {
        const match = command.match(/(\w+)\((\d+)\)/);
        if (match) {
            const action = match[1];
            const repetitions = parseInt(match[2], 10);
            await this.performActionWithDelay(action, repetitions);
        } else {
            await this.performAction(command);
        }
    }

    async performActionWithDelay(action, repetitions) {
        for (let i = 0; i < repetitions; i++) {
            await this.performAction(action);
            await new Promise(resolve => setTimeout(resolve, 500)); // Delay 500 milliseconds
        }
    }

    async performAction(action) {
        switch (action) {
            case 'left':
                await this.player.moveLeft();
                break;
            case 'right':
                await this.player.moveRight();
                break;
            case 'up':
                await this.player.moveUp();
                break;
            case 'down':
                await this.player.moveDown();
                break;
            default:
                console.log('Invalid command');
        }
    }
}
