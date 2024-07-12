// MainScene.js

import Player from "./Player.js";
import Enemy from "./enemy.js";
import Coins from "./coins.js";
import RankingScene from "./RankingScene.js";

let playerHeart = 3;
let heartGrp;
let isRestarting = false;
let isExecuting = false;
let lastActionMove = "right";
let scoreText;
let score = 0;
let enemyGrp = [];
let coinsGrp = [];
let timesOfCommand = 0;
let sceneone = true;
let scenetwo = false;

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
    this.isScoreSaved = false;
  }

  preload() {
    if (sceneone === true) {
      console.log("StartMain");

      if (!this.textures.exists("heart")) {
        this.load.image("heart", "assets/images/ui_heart_full.png");
      }
      if (!this.textures.exists("coin")) {
        this.load.image("coin", "assets/coins/coin.png");
      }
      if (!this.textures.exists("tiles")) {
        this.load.image("tiles", "assets/map/Dungeon_Tileset_at.png");
      }
      if (!this.cache.tilemap.exists("map")) {
        this.load.tilemapTiledJSON("map", "assets/map/newmap.json");
      }
      if (!this.textures.exists("crown")) {
        this.load.image("crown", "assets/images/crown_NBG.png");
      }

      Player.preload(this);
      Enemy.preload(this);
      Coins.preload(this);
    }
  }

  receiveSceneOneData(sceneoneData) {
    // นำ sceneoneData ไปใช้งานตามที่ต้องการใน mainscene
    console.log("Received sceneone data:", sceneoneData);
    // ตัวอย่างเช่นการเซ็ตค่าใน mainscene จาก sceneoneData
    sceneone = sceneoneData;
  }

  create() {
    // แสดง command-container
    const commandContainer = document.getElementById("command-container");
    commandContainer.style.display = "flex";

    if (!this.eventListenersAdded) {
      this.setupCommandInput();
      this.eventListenersAdded = true;
    }

    this.isScoreSaved = false;

    enemyGrp = [];
    coinsGrp = [];

    heartGrp = this.add.group();
    this.createPlayerHeart();

    const map = this.make.tilemap({ key: "map" });
    const tileset = map.addTilesetImage(
      "Dungeon_Tileset_at",
      "tiles",
      32,
      32,
      0,
      0
    );

    if (tileset) {
      const layer1 = map.createLayer("Tile Layer 1", tileset, 0, 0);
      layer1.setCollisionByProperty({ collides: true });
      this.matter.world.convertTilemapLayer(layer1);
    } else {
      console.error(
        "Tileset not found. Check if the tileset name in the JSON matches 'Dungeon_Tileset_at'."
      );
    }

    if (tileset) {
      const doorLayer = map.createLayer("Door Layer", tileset, 0, 0);
      doorLayer.setCollisionByProperty({ isDoor: true });
      this.matter.world.convertTilemapLayer(doorLayer);
    } else {
      console.error(
        "Tileset not found. Check if the tileset name in the JSON matches 'Dungeon_Tileset_at'."
      );
    }

    this.matter.world.on("collisionstart", this.handleCollision, this);

    const selectedCharacter = this.scene.settings.data.character;
    const playerName = this.scene.settings.data.playerName;

    let texture, animPrefix;

    if (selectedCharacter === "knightt") {
      texture = "knight";
      animPrefix = "knightt";
    } else if (selectedCharacter === "wizzard") {
      texture = "wizard";
      animPrefix = "wizzard";
    } else if (selectedCharacter === "elff") {
      texture = "elf";
      animPrefix = "elff";
    }

    this.player = new Player({
      scene: this,
      x: 110,
      y: 110,
      texture,
      frame: `${animPrefix}_f_idle_anim_f0`,
      animPrefix,
    });
    this.player.anims.play(`${animPrefix}_idle`, true);

    this.crown = this.add.image(this.player.x, this.player.y - 10, "crown");
    this.crown.setScale(0.05);

    this.tweens.add({
      targets: this.crown,
      alpha: { from: 1, to: 0.3 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    this.enemyAndCoinsPos();

    // this.matter.world.on('collisionstart', this.handleCollision, this);
    this.setupCommandInput();
    this.matter.world.on("collisionstart", (event) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;
        if (
          (bodyA.gameObject === this.player &&
            bodyB.gameObject &&
            bodyB.gameObject instanceof Coins) ||
          (bodyB.gameObject === this.player &&
            bodyA.gameObject &&
            bodyA.gameObject instanceof Coins)
        ) {
          this.onCollectCoins(bodyA.gameObject, bodyB.gameObject);
        }
      });
    });

    scoreText = this.add.text(this.cameras.main.width - 16, 16, "Score: 0", {
      fontSize: "28px",
      fill: "#fff",
    });
    scoreText.setOrigin(1, 0);

    this.playerName = playerName;

    const playerNameLabel = this.add.text(
      16,
      16,
      `Player: ${this.playerName}`,
      {
        fontSize: "20px",
        fill: "#fff",
      }
    );
    this.player.speak(`Hi ${this.playerName}`);
    playerNameLabel.setOrigin(0, -1.3);
  }

  createPlayerHeart() {
    for (let i = 0; i < playerHeart; i++) {
      let heart = this.add.sprite(40 + i * 50, 20, "heart");
      heart.setScale(2.5);
      heart.depth = 10;
      heartGrp.add(heart);
    }
  }

  enemyAndCoinsPos() {
    enemyGrp = [];

    this.createEnemy(206, 206, 3);
    this.createEnemy(174, 238, 4);
    this.createEnemy(334, 142, 2);

    this.createCoins(142, 142);
    this.createCoins(302, 142);
    this.createCoins(302, 302);
  }

  createEnemy(posX, posY, health) {
    this.enemy = new Enemy({
      scene: this,
      x: posX,
      y: posY,
      texture: "lizard",
      frame: "lizard_f_idle_anim_f0",
    });
    let enemy = this.enemy;
    enemy.anims.play("lizard_idle", true);
    enemy.health = health;
    enemy.maxHealth = health;

    this.updateHealthBar(enemy);
    enemyGrp.push(enemy);
  }

  updateHealthBar(enemy) {
    if (enemy.healthBars) {
      enemy.healthBars.forEach((healthBar) => healthBar.destroy());
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
      healthBar.fillRect(
        enemy.x - totalWidth / 2 + i * (barWidth + barSpacing),
        enemy.y - 10,
        barWidth,
        barHeight
      );
      enemy.healthBars.push(healthBar);
    }

    if (enemy.health === 0) {
      console.log("เลือดไม่เหลือ");
    }
  }

  createCoins(posX, posY) {
    this.coins = new Coins({
      scene: this,
      x: posX,
      y: posY,
      texture: "coins",
      frame: "coin_anim_f0",
    });
    let coins = this.coins;
    this.coins.anims.play("coins_idle", true);
    coinsGrp.push(coins);
  }

  update() {
    this.player.update(); // เพิ่มบรรทัดนี้
    this.crown.x = this.player.x;
    this.crown.y = this.player.y - 10;

    scoreText.setText("SCORE : " + score);
  }

  async performActionWithDelay(action, repetitions) {
    for (let i = 0; i < repetitions; i++) {
      if (!isExecuting) break; // หยุดทำงานถ้า isExecuting เป็น false
      await this.performAction(action);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  handleCollision(event) {
    event.pairs.forEach((pair) => {
      const { bodyA, bodyB } = pair;

      // เช็คการชนกับกำแพง
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

      // เช็คการชนกับประตู
      if (
        (bodyA.gameObject === this.player &&
          bodyB.gameObject &&
          bodyB.gameObject.tile &&
          bodyB.gameObject.tile.properties.isDoor) ||
        (bodyB.gameObject === this.player &&
          bodyA.gameObject &&
          bodyA.gameObject.tile &&
          bodyA.gameObject.tile.properties.isDoor)
      ) {
        console.log("Entering new map");
        // this.player.stopMovement();
        this.scene.start("Scene2", {
          character: this.scene.settings.data.character,
          playerName: this.scene.settings.data.playerName,
          playerX: this.player.x,
          playerY: this.player.y,
          playerHeart: playerHeart,
          score: score,
        });
        return;
      }

      // เช็คการชนกับศัตรู
      if ((bodyA.label === 'playerCollider' && bodyB.label === 'enemyCollider') ||
        (bodyB.label === 'playerCollider' && bodyA.label === 'enemyCollider')) {
        playerHeart--;
        this.player.stopMovement();
        this.player.setVelocity(0, 0);
        isExecuting = false; // หยุดการทำงานของคำสั่ง

        this.player.speak(`I'm dead`);

        if (playerHeart <= 0) {
          playerHeart = 0;
          console.log("gameOver");
          this.showGameOverDialog();
        } else {
          this.resetPlayer();
          this.resetCoins();
          this.resetEnemies();
          this.updatePlayerHeart();
          score = 0;
        }
      }
    });
  }

  checkCollision(x, y) {
    const bodies = this.matter.world.localWorld.bodies;
    for (let i = 0; i < bodies.length; i++) {
      const body = bodies[i];
      if (body.label === "playerCollider" || body.label === "playerSensor")
        continue;

      if (
        Phaser.Physics.Matter.Matter.Bounds.overlaps(body.bounds, {
          min: { x, y },
          max: { x, y },
        })
      ) {
        return false;
      }
    }
    return true;
  }

  resetPlayer() {
    this.player.stopMovement();
    this.player.setPosition(110, 110); // ตำแหน่งเริ่มต้น
    this.player.setVelocity(0, 0); // หยุดการเคลื่อนไหว
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
    for (let i = 0; i < enemyGrp.length; i++) {
      enemyGrp[i].health = enemyGrp[i].maxHealth;
      // console.log(enemyGrp[i].health, enemyGrp[i].maxHealth, "ตัวที่ ", i);
    }
  }

  showGameOverDialog() {
    const dialog = document.getElementById("game-over-dialog");
    const restartButton = document.getElementById("restart-button");
    const backButton = document.getElementById("back-button");
    const scoreText = document.getElementById("game-over-score");

    const playerName = this.playerName;

    scoreText.textContent = `แพ้แล้ว! ${playerName}, คะแนนของคุณคือ: ${score}`;

    dialog.style.display = "block";

    const handleRestart = () => {
      dialog.style.display = "none";
      playerHeart = 3;
      score = 0;

      const commandLabel = document.getElementById("command-label");
      commandLabel.value = ""; // ตั้งค่าเป็นค่าว่าง หรือค่าที่ต้องการเริ่มต้น
      commandLabel.placeholder = "Enter your commands here...";
      this.scene.start("SelectScene"); // Go back to the character selection scene
      restartButton.removeEventListener("click", handleRestart);
    };

    const handleBack = () => {
      dialog.style.display = "none";
      playerHeart = 3;
      score = 0;
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
      this.savePlayerScore();
      this.isScoreSaved = true; // เปลี่ยนสถานะการบันทึกคะแนน
    }
  }

  updatePlayerHeart() {
    for (let i = heartGrp.getChildren().length - 1; i >= 0; i--) {
      if (playerHeart < i + 1) {
        heartGrp.getChildren()[i].setVisible(false);
      } else {
        heartGrp.getChildren()[i].setVisible(true);
      }
    }

    if (playerHeart <= 0) {
      console.log("gameOver");
      this.showGameOverDialog();
    }
  }

  onCollectCoins(Player, Coins) {
    Coins.destroy();
    score += 5;
  }

  setupCommandInput() {
    const commandLabel = document.getElementById("command-label");
    const commandButton = document.getElementById("command-button");

    if (sceneone === true) {
      console.log("scene 1 กำลังทำงาน");
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
          // this.enemyReset();
          score = 0;

          const commands = commandLabel.value.toLowerCase().split("\n");
          for (const command of commands) {
            if (command.trim() !== "") {
              timesOfCommand++;
              await this.executeCommand(command.trim());
            }
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
      console.log("Invalid command");
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

  playerAttackAni() {
    this.player.anims.play(`${this.player.animPrefix}_hit`);
    this.stopAnimation();

    setTimeout(() => {
      this.player.anims.play(`${this.player.animPrefix}_idle`);
    }, 300);
  }

  onPlayerAttack(enemy) {
    enemy.health--;
    console.log(`Enemy health after attack: ${enemy.health}`); // เพิ่มดีบัก
    this.playerAttackAni();
    this.updateHealthBar(enemy);
    if (enemy.health <= 0) {
      this.clearHealthBars(enemy);
      enemy.destroy();
      score += 10;
    }
  }

  clearHealthBars(enemy) {
    if (enemy.healthBars) {
      enemy.healthBars.forEach((healthBar) => healthBar.destroy());
      enemy.healthBars = [];
    }
  }

  stopAnimation() {
    this.player.anims.stop();
  }

  savePlayerScore() {
    let scores = JSON.parse(localStorage.getItem("playerScores")) || [];
    const selectedCharacter = this.scene.settings.data.character;
    const newScore = {
      name: this.playerName,
      score: score,
      character: selectedCharacter,
    };

    // ตรวจสอบว่ามีข้อมูลซ้ำหรือไม่
    if (
      !scores.some(
        (score) =>
          score.name === newScore.name &&
          score.score === newScore.score &&
          score.character === newScore.character
      )
    ) {
      scores.push(newScore);
      console.log("Scene1");
      console.log(scores);
      localStorage.setItem("playerScores", JSON.stringify(scores));
    }
  }
}
