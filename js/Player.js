export default class Player extends Phaser.Physics.Matter.Sprite {
    constructor(data) {
        let { scene, x, y, texture, frame, animPrefix } = data;
        super(scene.matter.world, x, y, texture, frame);
        this.animPrefix = animPrefix; // เพิ่ม property นี้

        this.scene.add.existing(this);

        this.tileSize = 32; // ขนาดของ tile
        this.isMoving = false;

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

        scene.load.atlas('wizard', 'assets/testhero/wizard/wizard.png', 'assets/testhero/wizard/wizard_atlas.json');
        scene.load.animation('wizard_anim', 'assets/testhero/wizard/wizard_anim.json');
    }

    moveLeft() {
        if (!this.isMoving) {
            this.isMoving = true;
            console.log('Playing run animation:', `${this.animPrefix}_run`);
            this.play(`${this.animPrefix}_run`);
            this.scene.tweens.add({
                targets: this,
                x: this.x - this.tileSize,
                duration: 300,
                onComplete: () => {
                    this.isMoving = false;
                    console.log('Playing idle animation:', `${this.animPrefix}_idle`);
                    this.play(`${this.animPrefix}_idle`);
                }
            });
        }
    }
    

    moveRight() {
        if (!this.isMoving) {
            this.isMoving = true;
            this.play(`${this.animPrefix}_run`);
            this.scene.tweens.add({
                targets: this,
                x: this.x + this.tileSize,
                duration: 300,
                onComplete: () => {
                    this.isMoving = false;
                    this.play(`${this.animPrefix}_idle`);
                }
            });
        }
    }

    moveUp() {
        if (!this.isMoving) {
            this.isMoving = true;
            this.play(`${this.animPrefix}_run`);
            this.scene.tweens.add({
                targets: this,
                y: this.y - this.tileSize,
                duration: 300,
                onComplete: () => {
                    this.isMoving = false;
                    this.play(`${this.animPrefix}_idle`);
                }
            });
        }
    }

    moveDown() {
        if (!this.isMoving) {
            this.isMoving = true;
            this.play(`${this.animPrefix}_run`);
            this.scene.tweens.add({
                targets: this,
                y: this.y + this.tileSize,
                duration: 300,
                onComplete: () => {
                    this.isMoving = false;
                    this.play(`${this.animPrefix}_idle`);
                }
            });
        }
    }
}
