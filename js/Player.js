export default class Player extends Phaser.Physics.Matter.Sprite {
    constructor(data) {
        let { scene, x, y, texture, frame, animPrefix } = data;
        super(scene.matter.world, x, y, texture, frame);
        this.animPrefix = animPrefix;

        this.scene.add.existing(this);

        this.tileSize = 32; // ขนาดของ tile
        this.isMoving = false;

        // Set up physics body
        const { Body, Bodies } = Phaser.Physics.Matter.Matter;
        const playerCollider = Bodies.circle(this.x, this.y, 6, { isSensor: false, label: 'playerCollider' });
        const playerSensor = Bodies.circle(this.x, this.y, 10, { isSensor: true, label: 'playerSensor' });
        const compoundBody = Body.create({
            parts: [playerCollider, playerSensor],
            frictionAir: 0.01, // ลด frictionAir เพื่อให้เคลื่อนที่สมูทขึ้น
            friction: 0.01 // ลด friction เพื่อให้เคลื่อนที่สมูทขึ้น
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

        scene.load.atlas('elf', 'assets/testhero/elf/elf.png', 'assets/testhero/elf/elf_atlas.json');
        scene.load.animation('elf_anim', 'assets/testhero/elf/elf_anim.json');
    }

    moveLeft() {
        if (!this.isMoving) {
            this.isMoving = true;
            this.play(`${this.animPrefix}_run`);
            this.flipX = true; // Flip the sprite to face left
            this.setVelocityX(-2); // Move left with velocity
            this.scene.time.delayedCall(300, () => {
                this.stopMovement();
            });
        }
    }

    moveRight() {
        if (!this.isMoving) {
            this.isMoving = true;
            this.play(`${this.animPrefix}_run`);
            this.flipX = false; // Ensure the sprite is not flipped to face right
            this.setVelocityX(2); // Move right with velocity
            this.scene.time.delayedCall(300, () => {
                this.stopMovement();
            });
        }
    }

    moveUp() {
        if (!this.isMoving) {
            this.isMoving = true;
            this.play(`${this.animPrefix}_run`);
            this.setVelocityY(-2); // Move up with velocity
            this.scene.time.delayedCall(300, () => {
                this.stopMovement();
            });
        }
    }

    moveDown() {
        if (!this.isMoving) {
            this.isMoving = true;
            this.play(`${this.animPrefix}_run`);
            this.setVelocityY(2); // Move down with velocity
            this.scene.time.delayedCall(300, () => {
                this.stopMovement();
            });
        }
    }

    stopMovement() {
        this.setVelocity(0, 0);
        this.isMoving = false;
        this.anims.stop();
        this.play(`${this.animPrefix}_idle`); // เล่นอนิเมชัน idle
    }
}
