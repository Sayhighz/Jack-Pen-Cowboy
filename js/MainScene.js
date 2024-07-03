import Player from "./Player.js";
import Enemy from "./enemy.js";
import Coins from "./coins.js";



let playerHeart = 3;
let heartGrp;
let isRestarting = false;
let lastActionMove = "right"
let scoreText
let score = 0
let enemyGrp = []
let coinsGrp = []
let timesOfCommand = 0                      //เอาไว้นับจำนวนคำสั่ง สามารถใช้ได้แล้ว 

export default class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");
    }

    preload() {

        console.log('StartMain')
        // Preload assets and player animations
        Player.preload(this);
        Enemy.preload(this);
        Coins.preload(this);

        this.load.image('heart', 'assets/images/ui_heart_full.png');
        this.load.image('coin', 'assets/coins/coin.png');
        this.load.image('tiles', 'assets/map/Dungeon_Tileset_at.png');
        this.load.tilemapTiledJSON('map', 'assets/map/newmap.json');
        this.load.image('crown', 'assets/images/crown_NBG.png')
    }

    create() {

        if (!this.eventListenersAdded) {
            this.setupCommandInput();
            this.eventListenersAdded = true; // ใช้ flag เพื่อหลีกเลี่ยงการเพิ่ม event listener ซ้ำ
        }

        enemyGrp = [];
        coinsGrp = [];

        // Heart
        heartGrp = this.add.group();
        this.createPlayerHeart();

        // Create tilemap and layers
        const map = this.make.tilemap({ key: 'map' });
        const tileset = map.addTilesetImage('Dungeon_Tileset_at', 'tiles', 32, 32, 0, 0);

        if (tileset) {
            const layer1 = map.createLayer('Tile Layer 1', tileset, 0, 0);
            layer1.setCollisionByProperty({ collides: true });
            this.matter.world.convertTilemapLayer(layer1);
        } else {
            console.error("Tileset not found. Check if the tileset name in the JSON matches 'Dungeon_Tileset_at'.");
        }

        // Create player instance
        const selectedCharacter = this.scene.settings.data.character;

        // กำหนด texture และ animations สำหรับตัวละครที่ถูกเลือก
        let texture, animPrefix;

        if (selectedCharacter === 'knightt') {
            texture = 'knight';
            animPrefix = 'knightt';
        } else if (selectedCharacter === 'wizzard') {
            texture = 'wizard';
            animPrefix = 'wizzard';
        }
        else if (selectedCharacter === 'elff') {
            texture = 'elf';
            animPrefix = 'elff';
        }

        // สร้าง player instance
        this.player = new Player({ scene: this, x: 110, y: 110, texture, frame: `${animPrefix}_f_idle_anim_f0`, animPrefix });
        this.player.anims.play(`${animPrefix}_idle`, true);

        this.crown = this.add.image(this.player.x, this.player.y - 10, 'crown');
        this.crown.setScale(0.05)

        this.tweens.add({
            targets: this.crown,
            alpha: { from: 1, to: 0.3 },
            duration: 800, // duration of one blink cycle
            yoyo: true,
            repeat: -1 // repeat forever
        });


        // Create Enemy and Coins
        this.createEnemy(206, 206, 3)
        this.createEnemy(174, 238, 4)
        this.createEnemy(334, 142, 2)

        this.createCoins(142, 142)
        this.createCoins(302, 142)
        this.createCoins(302, 302)

        // Listen for collision event
        this.matter.world.on('collisionstart', this.handleCollision, this);

        // Setup input listener for command input and button
        this.setupCommandInput();

        this.matter.world.on('collisionstart', (event) => {
            event.pairs.forEach((pair) => {
                const { bodyA, bodyB } = pair;
                if ((bodyA.gameObject === this.player && bodyB.gameObject && bodyB.gameObject instanceof Coins) ||
                    (bodyB.gameObject === this.player && bodyA.gameObject && bodyA.gameObject instanceof Coins)) {
                    this.onCollectCoins(bodyA.gameObject, bodyB.gameObject); // A = player, B = coin
                }
            });
        });

        // Score
        scoreText = this.add.text(this.cameras.main.width - 16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });
        scoreText.setOrigin(1, 0); // Set origin to the top-right corner
    }

    createPlayerHeart() {
        for (let i = 0; i < playerHeart; i++) {
            let heart = this.add.sprite(40 + (i * 50), 20, "heart");
            heart.setScale(2.5);
            heart.depth = 10;
            heartGrp.add(heart);
        }
    }

    createEnemy(posX, posY, health) {
        // สร้างศัตรู
        this.enemy = new Enemy({ scene: this, x: posX, y: posY, texture: 'lizard', frame: 'lizard_f_idle_anim_f0' });
        let enemy = this.enemy;
        enemy.anims.play('lizard_idle', true);
        enemy.health = health;
        enemy.maxHealth = health; // ต้องกำหนดค่า maxHealth ด้วย

        this.updateHealthBar(enemy);

        // เพิ่มศัตรูลงในกลุ่ม
        enemyGrp.push(enemy);
    }

    updateHealthBar(enemy) {
        // สร้างกราฟิกหลอดเลือด
        let barWidth = 5; // ความกว้างของช่องหลอดเลือด
        let barHeight = 3; // ความสูงของช่องหลอดเลือด
        let barSpacing = 2; // ช่องว่างระหว่างหลอดเลือด
        let totalWidth = enemy.maxHealth * (barWidth + barSpacing) - barSpacing; // ความกว้างรวมของหลอดเลือดทั้งหมด
        enemy.healthBars = [];

        for (let i = 0; i < enemy.maxHealth; i++) {
            const healthBar = this.add.graphics();
            if (i < enemy.health) {
                healthBar.fillStyle(0x00ff00, 1); // สีเขียวถ้ายังมีสุขภาพ
            } else {
                healthBar.fillStyle(0xff0000, 1); // สีแดงถ้าสุขภาพลด
            }
            healthBar.fillRect(enemy.x - totalWidth / 2 + i * (barWidth + barSpacing), enemy.y - 10, barWidth, barHeight); // ขนาดและตำแหน่งของหลอดเลือด
            enemy.healthBars.push(healthBar);
        }

        if (enemy.health === 0) {
            console.log("เลือดไม่เหลือ");
        }
    }

    createCoins(posX, posY) {
        this.coins = new Coins({ scene: this, x: posX, y: posY, texture: 'coins', frame: 'coin_anim_f0' });
        let coins = this.coins
        this.coins.anims.play('coins_idle', true);
        coinsGrp.push(coins)
    }

    update() {
        // Update game logic
        // this.player.anims.play('idle', true); // Player movement

        this.crown.x = this.player.x;
        this.crown.y = this.player.y - 10;


        // this.enemy.anims.play('lizard_idle', true); // Enemy movement

        // Check if the coin exists before playing its animation

        // Additional game logic updates can be added here

        scoreText.setText("SCORE : " + score)
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
                score = 0
                // this.enemyReset()
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
                score = 0
                // this.enemyReset()
            }
        });
    }

    enemyReset() {
        console.log(enemyGrp)
        for (let i = 0; i < enemyGrp.length; i++) {
            enemyGrp[i].health = enemyGrp[i].maxHealth
            console.log(enemyGrp[i].health, enemyGrp[i].maxHealth, "ตัวที่ ", i)
        }

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

    onCollectCoins(Player, Coins) {
        Coins.destroy()         //แก้ให้ไม่หายทั้งหมด
        score += 5
    }

    setupCommandInput() {
        const commandLabel = document.getElementById('command-label'); // textarea
        const commandButton = document.getElementById('command-button');
    
        const executeCommands = async () => {
            isRestarting = true; // Set restarting flag
            this.scene.restart(); // Restart the scene
            this.enemyReset()
            score = 0
    
            // Wait for the scene to restart
            this.events.once('create', async () => {
                isRestarting = false; // Clear restarting flag
                const commands = commandLabel.value.toLowerCase().split('\n'); // Split by newline to read line by line
                for (const command of commands) {
                    if (command.trim() !== '' && !isRestarting) { // Skip empty lines and check if restarting
                        timesOfCommand++
                        console.log(timesOfCommand)
                        await this.executeCommand(command.trim());
                    }
                }
            });
        };
    
        if (!this.commandEventListenerAdded) {
            // Button click event listener
            commandButton.addEventListener('click', executeCommands);
    
            // Also handle Enter key press in textarea
            commandLabel.addEventListener('keypress', async (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault(); // Prevent default Enter key behavior (submitting form)
                    await executeCommands(); // Execute commands when Enter is pressed
                }
            });
    
            this.commandEventListenerAdded = true; // Use flag to ensure event listener is added only once
        }
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
                lastActionMove = "left"
                break;
            case 'right':
                this.player.moveRight();
                lastActionMove = "right"
                break;
            case 'up':
                this.player.moveUp();
                lastActionMove = "up"
                break;
            case 'down':
                this.player.moveDown();
                lastActionMove = "down"
                break;
            case 'attack':
                this.playerAttack(this.player, lastActionMove, enemyGrp);
                break;
            case 'turn_right':
                lastActionMove = "right"
                break;
            case 'turn_left':
                lastActionMove = "left"
                break;
            case 'turn_up':
                lastActionMove = "up"
                break;
            case 'turn_down':
                lastActionMove = "down"
                break;
            default:
                console.log('Unknown action');
        }
    }

    playerAttack(player, lastActionMove, enemyGrp) {
        console.log("attack = ", lastActionMove);
        console.log(player.x, player.y);

        let attackPosition = { x: player.x, y: player.y };

        switch (lastActionMove) {
            case "right":
                attackPosition.x += 32;
                break;
            case "left":
                attackPosition.x -= 32;
                break;
            case "up":
                attackPosition.y -= 32;
                break;
            case "down":
                attackPosition.y += 32;
                break;
        }

        for (let i = 0; i < enemyGrp.length; i++) {
            if (enemyGrp[i].active == true) {
                if (Math.round(attackPosition.x) == Math.round(enemyGrp[i].x) &&
                    Math.round(attackPosition.y) == Math.round(enemyGrp[i].y)) {
                    this.onPlayerAttack(enemyGrp[i])
                }
            }
        }
    }

    onPlayerAttack(enemy) {
        enemy.health--
        console.log(enemy.health, enemy.maxHealth)
        this.playerAttackAni();
        this.updateHealthBar(enemy)
        if (enemy.health <= 0) {
            enemy.destroy()
            score += 10
        }
        // this.input.keyboard.on('keydown', (event) => {
        //     if (event.key === 'Enter') {
        //         this.enemyReset();
        //         this.executeCommand();
        //     }
        // });
    }

    playerAttackAni() {
        this.player.anims.play(`${this.player.animPrefix}_hit`);
        this.stopAnimation();

        setTimeout(() => {
            this.player.anims.play(`${this.player.animPrefix}_idle`);
        }, 300);
    }

    stopAnimation() {
        this.player.anims.stop();
    }
}


//คำสั่ง
//right()           //เดินขวา
//left()            //เดินซ้าย
//up()              //เดินขึ้น
//down()            //เดินลง
//attack()          //โจมตี
//turn_right()      //หันขวา
//turn_left()       //หันซ้าย
//turn_up()         //หันหน้า
//turn_down()       //หันหลัง