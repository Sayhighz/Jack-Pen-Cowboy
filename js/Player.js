export default class Player extends Phaser.Physics.Matter.Sprite {
    constructor(data) {
        let { scene, x, y, texture, frame, animPrefix } = data;
        super(scene.matter.world, x, y, texture, frame);
        this.animPrefix = animPrefix;

        this.scene.add.existing(this);

        this.tileSize = 32; // ขนาดของ tile
        this.isMoving = false;
        this.targetX = x;
        this.targetY = y;

        this.speechText = this.scene.add.text(this.x, this.y - 20, '', {
            font: '16px Arial',
            fill: '#ffffff',
            backgroundColor: '#25468797'
        }).setOrigin(0.5).setAlpha(1);

        // Set up physics body
        const { Body, Bodies } = Phaser.Physics.Matter.Matter;
        const playerCollider = Bodies.circle(this.x, this.y, 3, { isSensor: false, label: 'playerCollider' });
        const playerSensor = Bodies.circle(this.x, this.y, 6, { isSensor: true, label: 'playerSensor' });
        const compoundBody = Body.create({
            parts: [playerCollider, playerSensor],
            frictionAir: 0.01,
            friction: 0.01
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

    speak(message) {
        this.speechText.setText(message);
        this.speechText.setAlpha(1);

        // ซ่อนคำพูดหลังจากเวลาผ่านไป
        this.scene.time.addEvent({
            delay: 2000,
            callback: () => {
                this.speechText.setAlpha(0);
            },
            callbackScope: this
        });
    }

    update() {
        if (this.isMoving) {
            const deltaX = this.targetX - this.x;
            const deltaY = this.targetY - this.y;

            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (distance < 1) {
                this.setVelocity(0, 0);
                this.isMoving = false;
                this.play(`${this.animPrefix}_idle`);
            } else {
                const speed = 2; // ความเร็วในการเคลื่อนที่
                const angle = Math.atan2(deltaY, deltaX);
                const velocityX = Math.cos(angle) * speed;
                const velocityY = Math.sin(angle) * speed;
                this.setVelocity(velocityX, velocityY);
            }
        }

        this.speechText.setPosition(this.x, this.y - 20);
    }

    moveTo(targetX, targetY) {
        this.targetX = targetX;
        this.targetY = targetY;
        this.isMoving = true;
        this.play(`${this.animPrefix}_run`);
    }

    moveLeft() {
        this.flipX = true
        this.moveTo(this.x - this.tileSize, this.y);
    }

    moveRight() {
        this.flipX = false
        this.moveTo(this.x + this.tileSize, this.y);
    }

    moveUp() {
        this.moveTo(this.x, this.y - this.tileSize);
    }

    moveDown() {
        this.moveTo(this.x, this.y + this.tileSize);
    }

    stopMovement() {
        this.setVelocity(0, 0);
        this.isMoving = false;
        this.anims.stop();
        this.play(`${this.animPrefix}_idle`);
    }
}
