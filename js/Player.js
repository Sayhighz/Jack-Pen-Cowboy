export default class Player extends Phaser.Physics.Matter.Sprite {
    constructor(data) {
        let { scene, x, y, texture, frame } = data;
        super(scene.matter.world, x, y, texture, frame);
        this.scene.add.existing(this);

        this.tileSize = 32; // ขนาดของ tile
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
    }

    static preload(scene) {
        scene.load.atlas('female', 'assets/images/female.png', 'assets/images/female_atlas.json');
        scene.load.animation('female_anim', 'assets/images/female_anim.json');
    }

    moveLeft() {
        if (!this.isMoving) {
            this.isMoving = true;
            this.play('walk_left');
            this.scene.tweens.add({
                targets: this,
                x: this.x - this.tileSize,
                duration: 500,
                onComplete: () => {
                    this.isMoving = false;
                    this.stopAnimation();
                }
            });
        }
    }

    moveRight() {
        if (!this.isMoving) {
            this.isMoving = true;
            this.play('walk_right');
            this.scene.tweens.add({
                targets: this,
                x: this.x + this.tileSize,
                duration: 500,
                onComplete: () => {
                    this.isMoving = false;
                    this.stopAnimation();
                }
            });
        }
    }

    moveUp() {
        if (!this.isMoving) {
            this.isMoving = true;
            this.play('walk_up');
            this.scene.tweens.add({
                targets: this,
                y: this.y - this.tileSize,
                duration: 500,
                onComplete: () => {
                    this.isMoving = false;
                    this.stopAnimation();
                }
            });
        }
    }

    moveDown() {
        if (!this.isMoving) {
            this.isMoving = true;
            this.play('walk_down');
            this.scene.tweens.add({
                targets: this,
                y: this.y + this.tileSize,
                duration: 500,
                onComplete: () => {
                    this.isMoving = false;
                    this.stopAnimation();
                }
            });
        }
    }

    stopAnimation() {
        this.anims.stop();
        this.setFrame('townsfolk_f_idle_1'); // ตั้งกรอบไปที่ท่าทางยืนนิ่ง
    }
}
