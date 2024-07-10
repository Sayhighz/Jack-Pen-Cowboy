// Scene2.js

import Player from "./Player.js";
import Enemy from "./enemy.js";
import Coins from "./coins.js";
import RankingScene from "./RankingScene.js";

let heartGrp;
let isRestarting = false;
let lastActionMove = "right";
let scoreText;
let enemyGrp = [];
let coinsGrp = [];
let timesOfCommand = 0;
let isExecuting = false;
let sceneone = false
let scenetwo = true

export default class Scene2 extends Phaser.Scene {
    constructor() {
        super("Scene2");
        this.character = null;
        this.playerName = null;
        this.playerHeart = 3;
        this.score = 0;
        this.initialScore = 0;
        this.isScoreSaved = false;
    }

    preload() {
        console.log('StartMain2');
        
        if (!this.textures.exists('heart')) {
            this.load.image('heart', 'assets/images/ui_heart_full.png');
        }
        if (!this.textures.exists('coin')) {
            this.load.image('coin', 'assets/coins/coin.png');
        }
        if (!this.textures.exists('tiles')) {
            this.load.image('tiles', 'assets/map/Dungeon_Tileset_at.png');
        }
        if (!this.cache.tilemap.exists('map2')) {
            this.load.tilemapTiledJSON('map2', 'assets/map/map2.json');
        }
        if (!this.textures.exists('crown')) {
            this.load.image('crown', 'assets/images/crown_NBG.png');
        }
        
        Player.preload(this);
        Enemy.preload(this);
        Coins.preload(this);

        this.sendSceneOneDataToMainScene()
    }

    sendSceneOneDataToMainScene() {
        const mainScene = this.scene.get('MainScene');
        if (mainScene) {
            mainScene.receiveSceneOneData(sceneone);
        } else {
            console.error('Main scene not found');
        }
    }

    create() {
        if (!this.eventListenersAdded) {
            this.setupCommandInput();
            this.eventListenersAdded = true;
        }
    
        const data = this.scene.settings.data || {};
        if (data.character) this.character = data.character;
        if (data.playerName) this.playerName = data.playerName;
        if (data.playerX) this.playerX = data.playerX;
        if (data.playerY) this.playerY = data.playerY;
        if (data.playerHeart) this.playerHeart = data.playerHeart;
        if (data.score) {
            this.initialScore = data.score;
            this.score = data.score;
        }
    
        console.log("Character:", this.character);
        console.log("Player Name:", this.playerName);
        console.log("Player X:", this.playerX);
        console.log("Player Y:", this.playerY);
        console.log("Player Heart:", this.playerHeart);
        console.log("Score:", this.score);
    
        enemyGrp = [];
        coinsGrp = [];
    
        heartGrp = this.add.group();
        this.createPlayerHeart();
    
        const map = this.make.tilemap({ key: 'map2' });
        const tileset = map.addTilesetImage('Dungeon_Tileset_at', 'tiles', 32, 32, 0, 0);
    
        if (tileset) {
            const layer1 = map.createLayer('Tile Layer 1', tileset, 0, 0);
            layer1.setCollisionByProperty({ collides: true });
            this.matter.world.convertTilemapLayer(layer1);
        } else {
            console.error("Tileset not found. Check if the tileset name in the JSON matches 'Dungeon_Tileset_at'.");
        }
    
        this.matter.world.on('collisionstart', this.handleCollision, this);
    
        let texture, animPrefix;
    
        if (this.character === 'knightt') {
            texture = 'knight';
            animPrefix = 'knightt';
        } else if (this.character === 'wizzard') {
            texture = 'wizard';
            animPrefix = 'wizzard';
        } else if (this.character === 'elff') {
            texture = 'elf';
            animPrefix = 'elff';
        } else {
            console.error('Character not found');
            return;
        }
    
        this.player = new Player({ scene: this, x:  110, y: 110, texture, frame: `${animPrefix}_f_idle_anim_f0`, animPrefix });
        this.player.anims.play(`${animPrefix}_idle`, true);
    
        this.score = this.initialScore;
    
        this.crown = this.add.image(this.player.x, this.player.y - 10, 'crown');
        this.crown.setScale(0.05);
    
        this.tweens.add({
            targets: this.crown,
            alpha: { from: 1, to: 0.3 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });
    
        this.enemyPos();
    
        this.createCoins(142, 142);
        this.createCoins(302, 142);
        this.createCoins(302, 302);
    
        this.matter.world.on('collisionstart', this.handleCollision, this);
        this.setupCommandInput();
        this.matter.world.on('collisionstart', (event) => {
            event.pairs.forEach((pair) => {
                const { bodyA, bodyB } = pair;
                if ((bodyA.gameObject === this.player && bodyB.gameObject && bodyB.gameObject instanceof Coins) ||
                    (bodyB.gameObject === this.player && bodyA.gameObject && bodyA.gameObject instanceof Coins)) {
                    this.onCollectCoins(bodyA.gameObject, bodyB.gameObject);
                }
            });
        });
    
        scoreText = this.add.text(this.cameras.main.width - 16, 16, 'Score: ' + this.score, { fontSize: '32px', fill: '#fff' });
        scoreText.setOrigin(1, 0);
    }
    

    createPlayerHeart() {
        for (let i = 0; i < this.playerHeart; i++) {
            let heart = this.add.sprite(40 + (i * 50), 20, "heart");
            heart.setScale(2.5);
            heart.depth = 10;
            heartGrp.add(heart);
        }
    }

    enemyPos() {
        enemyGrp = [];

        this.createEnemy(206, 206, 3);
        this.createEnemy(174, 238, 4);
        this.createEnemy(334, 142, 2);
    }

    createEnemy(posX, posY, health) {
        this.enemy = new Enemy({ scene: this, x: posX, y: posY, texture: 'lizard', frame: 'lizard_f_idle_anim_f0' });
        let enemy = this.enemy;
        enemy.anims.play('lizard_idle', true);
        enemy.health = health;
        enemy.maxHealth = health;

        this.updateHealthBar(enemy);
        enemyGrp.push(enemy);
    }

    updateHealthBar(enemy) {
        if (enemy.healthBars) {
            enemy.healthBars.forEach(healthBar => healthBar.destroy());
        }
        let barWidth = 5;
        let barHeight = 3;
        let barSpacing = 2;
        let totalWidth = enemy.maxHealth * (barWidth + barSpacing) - barSpacing;
        enemy.healthBars = [];

        for (let i = 0; i < enemy.maxHealth; i++) {
            const healthBar = this.add.graphics();
            if (i < enemy.health) {
                healthBar.fillStyle(0x00ff00, 1);
            } else {
                healthBar.fillStyle(0xff0000, 1);
            }
            healthBar.fillRect(enemy.x - totalWidth / 2 + i * (barWidth + barSpacing), enemy.y - 10, barWidth, barHeight);
            enemy.healthBars.push(healthBar);
        }

        // if (enemy.health === 0) {
        //     console.log("เลือดไม่เหลือ");
        // }
    }

    createCoins(posX, posY) {
        this.coins = new Coins({ scene: this, x: posX, y: posY, texture: 'coins', frame: 'coin_anim_f0' });
        let coins = this.coins;
        this.coins.anims.play('coins_idle', true);
        coinsGrp.push(coins);
    }

    update() {
        this.crown.x = this.player.x;
        this.crown.y = this.player.y - 10;

        scoreText.setText("SCORE : " + this.score.toString());
    }

    handleCollision(event) {
        event.pairs.forEach(pair => {
            const { bodyA, bodyB } = pair;
    
            if ((bodyA.label === 'playerCollider' && bodyB.isStatic) || (bodyB.label === 'playerCollider' && bodyA.isStatic)) {
                if (!isRestarting) {
                    isRestarting = true;
                    this.playerHeart--;
    
                    if (this.playerHeart <= 0) {
                        this.playerHeart = 0;
                        this.showGameOverDialog();
                    } else {
                        this.updatePlayerHeart();
                        this.score = this.initialScore; // รีเซ็ตคะแนนกลับไปยังคะแนนเริ่มต้น
                        this.scene.restart('Scene2', {
                            character: this.character,
                            playerName: this.playerName,
                            playerHeart: this.playerHeart,
                            score: this.score
                        });
                    }
                }
            }
    
            if ((bodyA.label === 'playerCollider' && bodyB.label === 'enemyCollider') || (bodyB.label === 'playerCollider' && bodyA.label === 'enemyCollider')) {
                if (!isRestarting) {
                    isRestarting = true;
                    this.playerHeart--;
    
                    if (this.playerHeart <= 0) {
                        this.playerHeart = 0;
                        this.showGameOverDialog();
                    } else {
                        this.updatePlayerHeart();
                        this.score = this.initialScore; // รีเซ็ตคะแนนกลับไปยังคะแนนเริ่มต้น
                        this.scene.restart('Scene2', {
                            character: this.character,
                            playerName: this.playerName,
                            playerHeart: this.playerHeart,
                            score: this.score
                        });
                    }
                }
            }
        });
    }
    

    enemyReset() {
        console.log(enemyGrp);
        for (let i = 0; i < enemyGrp.length; i++) {
            enemyGrp[i].health = enemyGrp[i].maxHealth;
            console.log(enemyGrp[i].health, enemyGrp[i].maxHealth, "ตัวที่ ", i);
        }
    }

    showGameOverDialog() {
        const dialog = document.getElementById('game-over-dialog');
        const restartButton = document.getElementById('restart-button');
        const backButton = document.getElementById('back-button');
        const scoreText = document.getElementById('game-over-score');

        const playerName = this.playerName;

        const finalScore = this.score;
        scoreText.textContent = `แพ้แล้ว! ${playerName}, คะแนนรวมของคุณคือ: ${finalScore}`;

        dialog.style.display = 'block';

        const handleRestart = () => {
            dialog.style.display = 'none';
            this.playerHeart = 3;
            this.scene.restart({
                character: this.character,
                playerName: this.playerName,
                playerHeart: this.playerHeart,
                score: this.score
            });
            restartButton.removeEventListener('click', handleRestart);
        };

        const handleBack = () => {
            dialog.style.display = 'none';
            // this.scene.start('StartScene');
            // console.log("ไปหน้าหลัก")
            backButton.removeEventListener('click', handleBack);
            this.scene.start('RankingScene');
            console.log("ไปหาคะแนน")
        };

        restartButton.addEventListener('click', handleRestart);
        backButton.addEventListener('click', handleBack);

        if (!this.isScoreSaved) { 
            this.savePlayerScore(finalScore);
            this.isScoreSaved = true; 
        }
    }

    savePlayerScore(finalScore) {
        let scores = JSON.parse(localStorage.getItem('playerScores')) || [];
        const newScore = { name: this.playerName, score: finalScore, character: this.character };
    
        if (!scores.some(score => score.name === newScore.name && score.score === newScore.score && score.character === newScore.character)) {
            scores.push(newScore);
            console.log("Scene2");
            localStorage.setItem('playerScores', JSON.stringify(scores));
        }
    }

    updatePlayerHeart() {
        for (let i = heartGrp.getChildren().length - 1; i >= 0; i--) {
            if (this.playerHeart < i + 1) {
                heartGrp.getChildren()[i].setVisible(false);
            } else {
                heartGrp.getChildren()[i].setVisible(true);
            }
        }
    }

    onCollectCoins(Player, Coins) {
        Coins.destroy();
        this.score += 5;
        scoreText.setText("SCORE : " + this.score);
    }

    setupCommandInput() {
        const commandLabel = document.getElementById('command-label');
        const commandButton = document.getElementById('command-button');

        if(sceneone === false){
            console.log("scene 2 กำลังทำงาน")
            if(scenetwo === true){
                const executeCommands = async () => {
                    if (isExecuting) {
                        console.log('คำสั่งกำลังทำงาน');
                        return;
                    }
                    isExecuting = true;
        
                    isRestarting = true;
                    this.scene.restart();
                    this.enemyReset();
                    this.score = 0;
        
                    this.events.once('create', async () => {
                        isRestarting = false;
                        const commands = commandLabel.value.toLowerCase().split('\n');
                        for (const command of commands) {
                            if (command.trim() !== '' && !isRestarting) {
                                timesOfCommand++;
                                console.log(timesOfCommand);
                                await this.executeCommand(command.trim());
                            }
                        }
                        isExecuting = false;
                    });
                };
        
                if (!this.commandEventListenerAdded) {
                    commandButton.addEventListener('click', executeCommands);
                    commandLabel.addEventListener('keypress', async (e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            await executeCommands();
                        }
                    });
        
                    this.commandEventListenerAdded = true;
                }
            }
        }
    }

    async executeCommand(command) {
        const match = command.match(/(\w+)\((\d*)\)/);
        if (match) {
            const action = match[1];
            const repetitions = match[2] ? parseInt(match[2], 10) : 1;
            await this.performActionWithDelay(action, repetitions);
        } else {
            console.log('Invalid command');
        }
    }

    async performActionWithDelay(action, repetitions) {
        for (let i = 0; i < repetitions; i++) {
            if (isRestarting) break;
            await this.performAction(action);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    async performAction(action) {
        switch (action) {
            case 'left':
                this.player.moveLeft();
                lastActionMove = "left";
                break;
            case 'right':
                this.player.moveRight();
                lastActionMove = "right";
                break;
            case 'up':
                this.player.moveUp();
                lastActionMove = "up";
                break;
            case 'down':
                this.player.moveDown();
                lastActionMove = "down";
                break;
            case 'attack':
                this.playerAttack(this.player, lastActionMove, enemyGrp);
                break;
            case 'turn_right':
                lastActionMove = "right";
                break;
            case 'turn_left':
                lastActionMove = "left";
                break;
            case 'turn_up':
                lastActionMove = "up";
                break;
            case 'turn_down':
                lastActionMove = "down";
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
                    this.onPlayerAttack(enemyGrp[i]);
                }
            }
        }
    }

    onPlayerAttack(enemy) {
        enemy.health--;
        console.log(enemy.health, enemy.maxHealth);
        this.playerAttackAni();
        this.updateHealthBar(enemy);
        if (enemy.health <= 0) {
            this.clearHealthBars(enemy);
            enemy.destroy();
            this.score += 10;
            scoreText.setText("SCORE : " + this.score);
        }
    }

    clearHealthBars(enemy) {
        if (enemy.healthBars) {
            enemy.healthBars.forEach(healthBar => healthBar.destroy());
            enemy.healthBars = [];
        }
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
