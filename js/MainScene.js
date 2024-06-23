import Player from "./Player.js";
import Enemy from "./enemy.js";
import Coins from "./coins.js";

let playerHeart = 3;
let heartGrp;
let isRestarting = false;
let scoreText
let score = 0

export default class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");
    }

    preload() {
        // Preload assets and player animations
        Player.preload(this);
        Enemy.preload(this);
        Coins.preload(this);

        this.load.image('heart', 'assets/images/heart.jpg');

        this.load.image('coin', 'assets/coins/coin.png')

        this.load.image('tiles', 'assets/map/Dungeon_Tileset_at.png');
        this.load.tilemapTiledJSON('map', 'assets/map/newmap.json');
    }

    create() {
        //heart
        heartGrp = this.add.group();
        this.createPlayerHeart();

        // Create tilemap and layers
        const map = this.make.tilemap({ key: 'map' });
        const tileset = map.addTilesetImage('Dungeon_Tileset_at', 'tiles', 32, 32, 0, 0);

        if (tileset) {
            const layer1 = map.createLayer('Tile Layer 1', tileset, 0, 0);
            layer1.setCollisionByProperty({ collides: true });
            this.matter.world.convertTilemapLayer(layer1);
            // this.world.convertTilemapLayer(layer1);

            // const layer2 = map.createLayer('Tile Layer 2', tileset, 0, 0);

            // const layer3 = map.createLayer('coins', tileset, 0, 0);
        } else {
            console.error("Tileset not found. Check if the tileset name in the JSON matches 'Dungeon_Tileset_at'.");
        }

        // Create player instance
        this.player = new Player({ scene: this, x: 110, y: 110, texture: 'female', frame: 'townsfolk_f_idle_1' });

        // Create enemy instance
        this.enemy = new Enemy({ scene: this, x: 210, y: 210, texture: 'lizard', frame: 'lizard_f_idle_anim_f0' });

        this.coins = new Coins({ scene: this, x: 150, y: 150, texture: 'coins', frame: 'coin_anim_f0' });
        

        // Listen for collision event
        this.matter.world.on('collisionstart', this.handleCollision, this);

        // Setup input listener for command input and button
        this.setupCommandInput();

        // this.physics.add.overlap(this.player,this.coins,this.onCollectCoins)
        this.matter.world.on('collisionstart', (event) => {
            event.pairs.forEach((pair) => {
                const { bodyA, bodyB } = pair;
                if ((bodyA.gameObject === this.player && bodyB.gameObject && bodyB.gameObject instanceof Coins) ||
                    (bodyB.gameObject === this.player && bodyA.gameObject && bodyA.gameObject instanceof Coins)) {
                    this.onCollectCoins(bodyA.gameObject, bodyB.gameObject); // A = player, B = coin
                }
            });
        });

        scoreText = this.add.text(this.cameras.main.width - 16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });
        scoreText.setOrigin(1, 0); // Set origin to the top-right corner
    }

    createPlayerHeart() {
        for (let i = 0; i < playerHeart; i++) {
            let heart = this.add.sprite(40 + (i * 50), 20, "heart");
            heart.setScale(0.05);
            heart.depth = 10;
            heartGrp.add(heart);
        }
    }

    update() {
        // Update game logic
        this.player.anims.play('female_idle', true);//movement

        this.enemy.anims.play('lizard_idle', true)

        // this.coins.anims.play('coins_idle', true);

        // Additional game logic updates can be added here
    }

    handleCollision(event) {
        event.pairs.forEach(pair => {
            const { bodyA, bodyB } = pair;
    
            // Check collision with static bodies (walls)
            if ((bodyA.label === 'playerCollider' && bodyB.isStatic) || (bodyB.label === 'playerCollider' && bodyA.isStatic)) {
                isRestarting = true; // Set restarting flag
                playerHeart--;
    
                if (playerHeart <= 0) {
                    playerHeart = 0;
                    console.log("gameOver");
                    this.showGameOverDialog();
                }
                this.updatePlayerHeart();
                this.scene.restart();
            }
    
            // Check collision with Enemy
            if ((bodyA.label === 'playerCollider' && bodyB.label === 'enemyCollider') || (bodyB.label === 'playerCollider' && bodyA.label === 'enemyCollider')) {
                isRestarting = true; // Set restarting flag
                playerHeart--;
    
                if (playerHeart <= 0) {
                    playerHeart = 0;
                    console.log("gameOver");
                    this.showGameOverDialog();
                }
                this.updatePlayerHeart();
                this.scene.restart();
            }
        });
    }
    

    showGameOverDialog() {
        const dialog = document.getElementById('game-over-dialog');
        const restartButton = document.getElementById('restart-button');

        dialog.style.display = 'block';

        const handleRestart = () => {
            dialog.style.display = 'none';
            playerHeart = 3; // Reset hearts to initial value
            this.scene.restart(); // Restart the game
            restartButton.removeEventListener('click', handleRestart);
        };

        restartButton.addEventListener('click', handleRestart);
    }

    updatePlayerHeart() {
        for (let i = heartGrp.getChildren().length - 1; i >= 0; i--) {
            if (playerHeart < i + 1) {
                heartGrp.getChildren()[i].setVisible(false);
            } else {
                heartGrp.getChildren()[i].setVisible(true);
            }
        }
    }

    onCollectCoins(Player,Coins){
            console.log("เก็บได้ละ")
            Coins.destroy()
            score += 10; // Increase score by 10
            scoreText.setText('Score: ' + score); // Update score text
    }

    setupCommandInput() {
        const commandLabel = document.getElementById('command-label'); // textarea
        const commandButton = document.getElementById('command-button');

        // Function to handle button click
        const executeCommands = async () => {
            isRestarting = true; // Set restarting flag
            this.scene.restart(); // Restart the scene

            // Wait for the scene to restart
            this.events.once('create', async () => {
                isRestarting = false; // Clear restarting flag
                const commands = commandLabel.value.toLowerCase().split('\n'); // Split by newline to read line by line
                for (const command of commands) {
                    if (command.trim() !== '' && !isRestarting) { // Skip empty lines and check if restarting
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
        const match = command.match(/(\w+)\((\d*)\)/);
        if (match) {
            const action = match[1];
            const repetitions = match[2] ? parseInt(match[2], 10) : 1; // Default to 1 if no repetitions provided
            await this.performActionWithDelay(action, repetitions);
        } else {
            console.log('Invalid command');
        }
    }

    async performActionWithDelay(action, repetitions) {
        for (let i = 0; i < repetitions; i++) {
            if (isRestarting) break; // Stop executing if restarting
            await this.performAction(action);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    async performAction(action) {
        switch (action) {
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
            case 'attack':
                this.player.playerAttack();
                break;
            default:
                console.log('Unknown action');
        }
    }
}
