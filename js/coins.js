export default class Coins extends Phaser.Physics.Matter.Sprite {
    constructor(data) {
        let { scene, x, y, texture, frame } = data;
        super(scene.matter.world, x, y, texture, frame);
        this.scene.add.existing(this);

        // Set up physics body
        const { Body, Bodies } = Phaser.Physics.Matter.Matter;
        const coinCollider = Bodies.circle(this.x, this.y, 6, { isSensor: false, label: 'coinCollider' });
        const compoundBody = Body.create({
            parts: [coinCollider],
            frictionAir: 0.35,
        });
        this.setExistingBody(compoundBody);
        this.setFixedRotation();
    }

    static preload(scene) {
        scene.load.atlas('coins', 'assets/coins/coins.png', 'assets/coins/coins_atlas.json');
        scene.load.animation('coins_anim', 'assets/coins/coins_anim.json');
    }
}
