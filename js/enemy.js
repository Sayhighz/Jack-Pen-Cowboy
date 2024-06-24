export default class Enemy extends Phaser.Physics.Matter.Sprite {
    constructor(data) {
        let { scene, x, y, texture, frame } = data;
        super(scene.matter.world, x, y, texture, frame);
        this.scene.add.existing(this);

        // Set up physics body
        const { Body, Bodies } = Phaser.Physics.Matter.Matter;
        const enemyCollider = Bodies.circle(this.x, this.y, 6, { isSensor: false, label: 'enemyCollider' });
        const compoundBody = Body.create({
            parts: [enemyCollider],
            frictionAir: 0.35,
        });
        this.setExistingBody(compoundBody);
        this.setFixedRotation();
    }

    static preload(scene) {
        scene.load.atlas('lizard', 'assets/enemies/lizard.png', 'assets/enemies/lizard_atlas.json');
        scene.load.animation('lizard_anim', 'assets/enemies/lizard_anim.json');
    }
}
