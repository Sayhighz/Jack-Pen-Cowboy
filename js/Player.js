export default class Player extends Phaser.Physics.Matter.Sprite {
    constructor(data) {
        let { scene, x, y, texture, frame } = data;
        super(scene.matter.world, x, y, texture, frame);
        this.scene.add.existing(this);

        this.tileSize = 32; // ขนาดของ tile             //เดินไปเท่านี้
        this.isMoving = false; // ตรวจสอบว่าตัวละครกำลังเคลื่อนที่อยู่หรือไม่

        // Set up physics body
        const { Body, Bodies } = Phaser.Physics.Matter.Matter;
        const playerCollider = Bodies.circle(this.x, this.y, 12, { isSensor: false, label: 'playerCollider' });
        const playerSensor = Bodies.circle(this.x, this.y, 24, { isSensor: true, label: 'playerSensor' });
        const compoundBody = Body.create({
            parts: [playerCollider, playerSensor],
            frictionAir: 0.35,
        });
        this.setExistingBody(compoundBody);
        this.setFixedRotation();

        // Ensure debug drawing is disabled for this body
        this.body.debugShowBody = false;
        this.body.debugShowStaticBody = false;
    }

    static preload(scene) {
        scene.load.atlas('knight', 'assets/testhero/knight.png', 'assets/testhero/knight_atlas.json');
        scene.load.animation('knight_anim', 'assets/testhero/knight_anim.json');
    }

    moveLeft() {
        if (!this.isMoving) {
            this.isMoving = true;
            this.play('run');
            this.scene.tweens.add({
                targets: this,
                x: this.x - this.tileSize,
                duration: 300,
                onComplete: () => {
                    this.isMoving = false;
                   this.play('idle')
                }
            });
        }
    }

    moveRight() {
        if (!this.isMoving) {
            this.isMoving = true;
            this.play('run');
            this.scene.tweens.add({
                targets: this,
                x: this.x + this.tileSize,
                duration: 300,
                onComplete: () => {
                    this.isMoving = false;
                   this.play('idle')
                }
            });
        }
    }

    moveUp() {
        if (!this.isMoving) {
            this.isMoving = true;
            this.play('run');
            this.scene.tweens.add({
                targets: this,
                y: this.y - this.tileSize,
                duration: 300,
                onComplete: () => {
                    this.isMoving = false;
                   this.play('idle')
                }
            });
        }
    }

    moveDown() {
        if (!this.isMoving) {
            this.isMoving = true;
            this.play('run');
            this.scene.tweens.add({
                targets: this,
                y: this.y + this.tileSize,
                duration: 300,
                onComplete: () => {
                    this.isMoving = false;
                   this.play('idle')
                }
            });
        }
    }

    playerAttack(player, lastActionMove, enemyGrp) {
        console.log("attack = ", lastActionMove);
        console.log(player.x, player.y);

        if (lastActionMove == "right") {
            let playerAttack_R = Number(Math.round(player.x)) + 32;
            for (let i = 0; i < enemyGrp.length; i++) {
                if (enemyGrp[i].active == true) {
                    if (playerAttack_R == Math.round(enemyGrp[i].x)) {
                        this.play('hit'); // เริ่มเล่น animation การโจมตี
                        this.stopAnimation(); // หยุด animation เดิน
                        enemyGrp[i].destroy(); // ทำลาย enemy

                        // คืนสถานะเป็น animation idle หลังจาก animation การโจมตีเสร็จสิ้น
                        this.scene.time.delayedCall(300, () => {
                            this.play('idle');
                        });
                    }
                }
            }
        }
        // เพิ่มเงื่อนไขสำหรับทิศทางอื่น ๆ ตามต้องการ
        // }

        else if (lastActionMove == "left") {
            let playerAttack_L = Number(Math.round(player.x)) - 32;
            for (let i = 0; i < enemyGrp.length; i++) {
                if (enemyGrp[i].active == true) {
                    if (playerAttack_L == Math.round(enemyGrp[i].x)) {
                        this.play('hit');
                        this.stopAnimation();
                        enemyGrp[i].destroy();

                        // เพิ่มการเรียกใช้งาน animation idle หลังจาก animation การโจมตีเสร็จสิ้น
                        this.scene.time.delayedCall(300, () => {
                            this.play('idle');
                        });
                    }
                }
            }
        }
        else if (lastActionMove == "up") {
            let playerAttack_U = Number(Math.round(player.y)) - 32;
            for (let i = 0; i < enemyGrp.length; i++) {
                if (enemyGrp[i].active == true) {
                    if (playerAttack_U == Math.round(enemyGrp[i].y)) {
                        this.play('hit');
                        this.stopAnimation();
                        enemyGrp[i].destroy();

                        // เพิ่มการเรียกใช้งาน animation idle หลังจาก animation การโจมตีเสร็จสิ้น
                        this.scene.time.delayedCall(300, () => {
                            this.play('idle');
                        });
                    }
                }
            }
        }
        else if (lastActionMove == "down") {
            let playerAttack_D = Number(Math.round(player.y)) + 32;
            for (let i = 0; i < enemyGrp.length; i++) {
                if (enemyGrp[i].active == true) {
                    if (playerAttack_D == Math.round(enemyGrp[i].y)) {
                        this.play('hit');
                        this.stopAnimation();
                        enemyGrp[i].destroy();

                        // เพิ่มการเรียกใช้งาน animation idle หลังจาก animation การโจมตีเสร็จสิ้น
                        this.scene.time.delayedCall(300, () => {
                            this.play('idle');
                        });
                    }
                }
            }
        }
    }

    stopAnimation() {
        this.anims.stop();
        // this.play('idle')
        // this.setFrame('knight_m_idle_anim_f1'); // Set frame to idle
    }
}