// Scene3.js

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
let sceneone = false;
let scenetwo = false;
let scenethree = true;
let isCommandOverLimit = false;
let commandCountText;


export default class Scene3 extends Phaser.Scene {
    constructor() {
        super("Scene3");
        this.character = null;
        this.playerName = null;
        this.playerHeart = 3;
        this.score = 0;
        this.initialScore = 0;
        this.isScoreSaved = false;
    }

    preload() {
        if (scenethree === true) {
            console.log('StartMain3');

            if (!this.textures.exists('heart')) {
                this.load.image('heart', 'assets/images/ui_heart_full.png');
            }
            if (!this.textures.exists('coin')) {
                this.load.image('coin', 'assets/coins/coin.png');
            }
            if (!this.textures.exists('tiles')) {
                this.load.image('tiles', 'assets/map/Full.png');
                this.load.image('back', 'assets/map/Dungeon_Tileset_at.png');
            }
            if (!this.cache.tilemap.exists('map3')) {
                this.load.tilemapTiledJSON('map3', 'assets/map/map3.json');
            }
            if (!this.textures.exists('crown')) {
                this.load.image('crown', 'assets/images/crown_NBG.png');
            }

            Player.preload(this);
            Enemy.preload(this);
            Coins.preload(this);
        }

        this.sendSceneOneDataToMainScene();
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

        isExecuting = false;

        this.isScoreSaved = false;

        heartGrp = this.add.group();
        this.createPlayerHeart();

        const map = this.make.tilemap({ key: 'map3' });
        const tileset = map.addTilesetImage('Full', 'tiles', 32, 32, 0, 0);
        const backset = map.addTilesetImage('Dungeon_Tileset_at', 'back', 32, 32, 0, 0);

        if (backset) {
            const layer1 = map.createLayer("back", backset, 0, 0);
            layer1.setCollisionByProperty({ collides: true });
            this.matter.world.convertTilemapLayer(layer1);
        } else {
            console.error("Tileset not found. Check if the tileset name in the JSON matches 'assets_spritesheet_v2_free'.");
        }
        

        if (tileset) {
            // const layer2 = map.createLayer('back', tileset, 0, 0);
            const layer1 = map.createLayer('Tile Layer 1', tileset, 0, 0);
            const layer2 = map.createLayer('top', tileset, 0, 0);
            layer1.setCollisionByProperty({ collides: true });
            this.matter.world.convertTilemapLayer(layer1);
        } else {
            console.error("Tileset not found. Check if the tileset name in the JSON matches 'Dungeon_Tileset_at'.");
        }

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

        this.player = new Player({ scene: this, x: 110, y: 110, texture, frame: `${animPrefix}_f_idle_anim_f0`, animPrefix });
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
        window.switchScene('map3');

        const commandLabel = document.getElementById('command-label');
        if (commandLabel) {
            commandLabel.value = commandLabel.value.trim();
            commandLabel.value = '';
            commandLabel.placeholder = "Enter your commands here...";
        }

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

        commandCountText = this.add.text(this.cameras.main.width / 2, 20, "0/6 คำสั่ง", {
            fontSize: "20px",
            fill: "#fff",
          });
          commandCountText.setOrigin(0.5, 0); // ตั้งจุดเริ่มต้นของข้อความไว้ที่กึ่งกลางของแกน x และบนสุดของแกน y
          commandCountText.setDepth(2);

        scoreText = this.add.text(this.cameras.main.width - 16, 16, 'Score: ' + this.score, { fontSize: '32px', fill: '#fff' });
        scoreText.setOrigin(1, 0);

        this.playerName = this.playerName;

        const playerNameLabel = this.add.text(
          this.cameras.main.width - 16, // x ตำแหน่งเดียวกับ scoreText
          scoreText.y + scoreText.height - 1, // y อยู่ใต้ scoreText และห่างน้อยลง
          `Player: ${this.playerName}`,
          {
            fontSize: "20px",
            fill: "#fff",
          }
        );
        playerNameLabel.setOrigin(1, 0); // ปรับการวางตำแหน่งให้ยึดตามขวาเหมือน scoreText
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
    }

    createCoins(posX, posY) {
        this.coins = new Coins({ scene: this, x: posX, y: posY, texture: 'coins', frame: 'coin_anim_f0' });
        let coins = this.coins;
        this.coins.anims.play('coins_idle', true);
        coinsGrp.push(coins);
    }

    update() {
        this.player.update()
        this.crown.x = this.player.x;
        this.crown.y = this.player.y - 10;

        scoreText.setText("SCORE : " + this.score.toString());
    }

    handleCollision(event) {
        event.pairs.forEach(pair => {
            const { bodyA, bodyB } = pair;

            if (
                (bodyA.gameObject === this.player &&
                    bodyB.gameObject &&
                    bodyB.gameObject.tile &&
                    bodyB.gameObject.tile.properties.collides) ||
                (bodyB.gameObject === this.player &&
                    bodyA.gameObject &&
                    bodyA.gameObject.tile &&
                    bodyA.gameObject.tile.properties.collides)
            ) {
                this.player.speak(`I can't go there`);

                // หยุดการเคลื่อนไหวของผู้เล่น
                this.player.stopMovement();
                this.player.setVelocity(0, 0);

                isExecuting = false; // หยุดการทำงานของคำสั่ง
                return; // ออกจากฟังก์ชันเมื่อชนกับกำแพง
            }

            if ((bodyA.label === 'playerCollider' && bodyB.label === 'enemyCollider') ||
                (bodyB.label === 'playerCollider' && bodyA.label === 'enemyCollider')) {
                this.playerHeart--;
                this.player.stopMovement();
                this.player.setVelocity(0, 0);
                isExecuting = false; // หยุดการทำงานของคำสั่ง

                this.player.speak(`I'm dead`);

                if (this.playerHeart <= 0) {
                    this.playerHeart = 0;
                    console.log("gameOver");
                    this.showGameOverDialog();
                } else {
                    this.resetPlayer();
                    this.resetCoins();
                    this.resetEnemies();
                    this.updatePlayerHeart();
                    this.score = this.initialScore;
                }
            }
        });
    }

    resetPlayer() {
        this.player.setPosition(110, 110);
        this.player.setVelocity(0, 0);
    }

    resetCoins() {
        // ทำลายเหรียญทั้งหมด
        coinsGrp.forEach((coin) => coin.destroy());
        // สร้างเหรียญใหม่
        this.createCoins(142, 142);
        this.createCoins(302, 142);
        this.createCoins(302, 302);
      }
    

    resetEnemies() {
        // ทำลายศัตรูและหลอดเลือดทั้งหมด
        enemyGrp.forEach((enemy) => {
          if (enemy.healthBars) {
            enemy.healthBars.forEach((healthBar) => healthBar.destroy());
          }
          enemy.destroy();
        });
    
        // รีเซ็ตอาเรย์ศัตรู
        enemyGrp = [];
    
        // สร้างศัตรูใหม่
        this.createEnemy(206, 206, 3);
        this.createEnemy(174, 238, 4);
        this.createEnemy(334, 142, 2);
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

        scoreText.textContent = `แพ้แล้ว! ${playerName}, คะแนนของคุณคือ: ${finalScore}`;

        dialog.style.display = 'block';

        const handleRestart = () => {
            dialog.style.display = "none";
            this.playerHeart = 3;
            this.score = 0;
      
            const commandLabel = document.getElementById("command-label");
            commandLabel.value = ""; // ตั้งค่าเป็นค่าว่าง หรือค่าที่ต้องการเริ่มต้น
            commandLabel.placeholder = "Enter your commands here...";
            this.scene.start("SelectScene"); // Go back to the character selection scene
            restartButton.removeEventListener("click", handleRestart);
          };
      
          const handleBack = () => {
            dialog.style.display = "none";
            this.playerHeart = 3;
            this.score = 0;
            // ซ่อน command-container
            const commandContainer = document.getElementById("command-container");
            commandContainer.style.display = "none";
      
            // ตั้งค่าเริ่มต้นให้กับ command-label
            const commandLabel = document.getElementById("command-label");
            commandLabel.value = ""; // ตั้งค่าเป็นค่าว่าง หรือค่าที่ต้องการเริ่มต้น
            commandLabel.placeholder = "Enter your commands here...";
      
            this.scene.start("StartScene");
            backButton.removeEventListener("click", handleBack);
          };
      
      
          restartButton.addEventListener("click", handleRestart);
          backButton.addEventListener("click", handleBack);
      
          if (!this.isScoreSaved) {
            // เช็คว่าคะแนนถูกบันทึกหรือยัง
            this.savePlayerScore(finalScore);
            this.isScoreSaved = true; // เปลี่ยนสถานะการบันทึกคะแนน
        }
    }

        savePlayerScore(finalScore) {
            let scores = JSON.parse(localStorage.getItem('playerScores')) || [];
            const newScore = { name: this.playerName, score: finalScore, character: this.character };
        
            if (!scores.some(score => score.name === newScore.name && score.score === newScore.score && score.character === newScore.character)) {
                scores.push(newScore);
                console.log("Scene3");
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
    
        if (scenethree === true) {
            console.log("scene 3 กำลังทำงาน");
            if (scenetwo === false) {
                const executeCommands = async () => {
                    if (isExecuting) {
                        console.log("คำสั่งกำลังทำงาน");
                        return;
                    }
                    isExecuting = true;
                    this.resetPlayer();
                    this.resetCoins();
                    this.resetEnemies();
                    this.score = this.initialScore;
    
                    const commands = commandLabel.value.toLowerCase().split("\n").filter(command => command.trim() !== "");
                    console.log(commands);
    
                    isCommandOverLimit = commands.length > 6;
                    commandCountText.setText(`${commands.length}/6 คำสั่ง`);
    
                    let isLoopOpen = false;
                    let isIfOpen = false;
                    let openLoops = 0;
                    let openIfs = 0;
    
                    for (let i = 0; i < commands.length; i++) {
                        let originalText = commands[i].trim();
                        let loopMatch = originalText.match(/^loop\((\d+)\)\s*\{$/);
                        let ifMatch = originalText.match(/^if\s*\(([^)]+)\)\s*\{$/);
    
                        if (loopMatch) {
                            if (isLoopOpen || isIfOpen) {
                                console.error("Error: Nested loops or if statements not allowed.");
                                alert("Error: Nested loops or if statements not allowed.");
                                isExecuting = false;
                                return;
                            }
                            openLoops++;
                            isLoopOpen = true;
                            let loop_repetitions = parseInt(loopMatch[1]);
                            let loopCommands = [];
                            i++;
    
                            while (i < commands.length && commands[i].trim() !== "}") {
                                loopCommands.push(commands[i].trim());
                                i++;
                            }
    
                            if (i >= commands.length || commands[i].trim() !== "}") {
                                console.error("Error: Missing closing } for loop");
                                alert("Error: Missing closing } for loop");
                                isExecuting = false;
                                return;
                            }
    
                            openLoops--;
                            if (openLoops === 0) {
                                isLoopOpen = false;
                            }
    
                            for (let j = 0; j < loop_repetitions; j++) {
                                for (const loopCommand of loopCommands) {
                                    if (loopCommand !== "") {
                                        timesOfCommand++;
                                        await this.executeCommand(loopCommand);
                                    }
                                }
                            }
                        } else if (ifMatch) {
                            if (isLoopOpen || isIfOpen) {
                                console.error("Error: Nested loops or if statements not allowed.");
                                alert("Error: Nested loops or if statements not allowed.");
                                isExecuting = false;
                                return;
                            }
                            openIfs++;
                            isIfOpen = true;
                            let condition = ifMatch[1];
                            let ifCommands = [];
                            i++;
    
                            while (i < commands.length && commands[i].trim() !== "}") {
                                ifCommands.push(commands[i].trim());
                                i++;
                            }
    
                            if (i >= commands.length || commands[i].trim() !== "}") {
                                console.error("Error: Missing closing } for if");
                                alert("Error: Missing closing } for if");
                                isExecuting = false;
                                return;
                            }
    
                            openIfs--;
                            if (openIfs === 0) {
                                isIfOpen = false;
                            }
    
                            if (eval(condition)) {
                                for (const ifCommand of ifCommands) {
                                    if (ifCommand !== "") {
                                        timesOfCommand++;
                                        await this.executeCommand(ifCommand);
                                    }
                                }
                            }
                        } else if (/^loop\((\d+)\)$/.test(originalText)) {
                            console.error("Error: Missing opening { for loop");
                            alert("Error: Missing opening { for loop");
                            isExecuting = false;
                            return;
                        } else if (/^if\s*\(([^)]+)\)$/.test(originalText)) {
                            console.error("Error: Missing opening { for if");
                            alert("Error: Missing opening { for if");
                            isExecuting = false;
                            return;
                        } else {
                            if (originalText === "{") {
                                console.error("Error: Unexpected '{' outside of loop or if");
                                alert("Error: Unexpected '{' outside of loop or if");
                                isExecuting = false;
                                return;
                            }
    
                            if (originalText !== "") {
                                timesOfCommand++;
                                await this.executeCommand(originalText);
                            }
                        }
                    }
    
                    // Final check to ensure all loops and ifs are properly closed
                    if (isLoopOpen || isIfOpen) {
                        console.error("Error: Unclosed loop or if block");
                        alert("Error: Unclosed loop or if block");
                        isExecuting = false;
                    }
    
                    isExecuting = false;
                };
    
                if (!this.commandEventListenerAdded) {
                    commandButton.addEventListener("click", executeCommands);
                    commandLabel.addEventListener("keypress", async (e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            await executeCommands();
                        }
                    });
    
                    commandLabel.addEventListener("input", () => {
                      const commands = commandLabel.value.toLowerCase().split("\n").filter(command => command.trim() !== "");
                      commandCountText.setText(`${commands.length}/6 คำสั่ง`);
    
                      if (commands.length > 6) {
                        commandLabel.style.color = 'red';
                        commandCountText.setColor('red');
                    } else {
                        commandLabel.style.color = 'black';
                        commandCountText.setColor('white');
                    }
                });
    
                    this.commandEventListenerAdded = true;
                }
            }
        }
    }

    async executeCommand(command) {
        const match = command.match(/player\.(\w+)\((\d*)\)/);
        if (match) {
          const action = match[1];
          const repetitions = match[2] ? parseInt(match[2], 10) : 1;
          await this.performActionWithDelay(action, repetitions);
        } else {
          console.log("Invalid command");
        }
      }

    async performActionWithDelay(action, repetitions) {
        for (let i = 0; i < repetitions; i++) {
            if (!isExecuting) break; // หยุดทำงานถ้า isExecuting เป็น false
            await this.performAction(action);
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
    }

    performAction(action) {
        switch (action) {
            case "left":
                this.player.moveLeft();
                lastActionMove = "left";
                break;
            case "right":
                this.player.moveRight();
                lastActionMove = "right";
                break;
            case "up":
                this.player.moveUp();
                lastActionMove = "up";
                break;
            case "down":
                this.player.moveDown();
                lastActionMove = "down";
                break;
            case "attack":
                this.playerAttack(this.player, lastActionMove, enemyGrp);
                break;
            case "turn_right":
                lastActionMove = "right";
                break;
            case "turn_left":
                lastActionMove = "left";
                break;
            case "turn_up":
                lastActionMove = "up";
                break;
            case "turn_down":
                lastActionMove = "down";
                break;
            default:
                console.log("Unknown action");
        }
    }

    playerAttack(player, lastActionMove, enemyGrp) {
        console.log("Attack direction: ", lastActionMove);
        console.log("Player position: ", player.x, player.y);
    
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
    
        console.log("Attack position: ", attackPosition.x, attackPosition.y);
    
        for (let i = 0; i < enemyGrp.length; i++) {
          if (enemyGrp[i].active) {
            console.log("Enemy position: ", enemyGrp[i].x, enemyGrp[i].y);
    
            let distance = Phaser.Math.Distance.Between(
              attackPosition.x,
              attackPosition.y,
              enemyGrp[i].x,
              enemyGrp[i].y
            );
    
            if (distance <= 10) {
              // ระยะห่างในพิกเซลที่โจมตีจะโดน
              console.log("Hit enemy at position: ", enemyGrp[i].x, enemyGrp[i].y);
              this.onPlayerAttack(enemyGrp[i]);
            } else {
              console.log(
                "Missed enemy at position: ",
                enemyGrp[i].x,
                enemyGrp[i].y
              );
            }
          }
        }
      }

      onPlayerAttack(enemy) {
        enemy.health--;
        console.log(`Enemy health after attack: ${enemy.health}`); // เพิ่มดีบัก
        this.playerAttackAni();
        this.updateHealthBar(enemy);
        if (enemy.health <= 0) {
          this.clearHealthBars(enemy);
          enemy.destroy();
          this.score += 10;
        }
      }

      clearHealthBars(enemy) {
        if (enemy.healthBars) {
          enemy.healthBars.forEach((healthBar) => healthBar.destroy());
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
