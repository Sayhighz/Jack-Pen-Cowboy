// RankingScene.js

export default class RankingScene extends Phaser.Scene {
    constructor() {
        super('RankingScene');
    }

    preload() {
        // this.load.image('rankingBackground', 'assets/images/13.webp');
        this.load.image('rankingBackground', 'assets/bgrank/1.png');
        this.load.image('image2', 'assets/bgrank/2.png');
        this.load.image('image3', 'assets/bgrank/3.png');
        this.load.image('image4', 'assets/bgrank/4.png');
    }

    create() {
        const background = this.add.image(this.scale.width / 2, this.scale.height / 2, 'rankingBackground');
        background.setDisplaySize(this.scale.width, this.scale.height);

        // Add four images and position them
        // const image1 = this.add.image(this.scale.width / 4, this.scale.height / 4, 'image1');
        const image2 = this.add.image(3 * this.scale.width / 2, this.scale.height / 4, 'image2');
        const image3 = this.add.image(this.scale.width / 2, 3 * this.scale.height / 2, 'image3');
        const image4 = this.add.image(3 * this.scale.width / 2, 3 * this.scale.height / 2, 'image4');

        // image1.setDisplaySize(this.scale.width / 4, this.scale.height / 4);
        image2.setDisplaySize(this.scale.width / 4, this.scale.height / 4);
        image3.setDisplaySize(this.scale.width / 4, this.scale.height / 4);
        image4.setDisplaySize(this.scale.width / 4, this.scale.height / 4);

        // Display scores
        const scores = JSON.parse(localStorage.getItem('playerScores')) || [];
        console.log(scores)
        scores.sort((a, b) => b.score - a.score);

        this.add.text(this.scale.width / 2, 50, 'Ranking', { fontSize: '40px', fill: '#ffcc00' }).setOrigin(0.5);

        scores.slice(0, 10).forEach((score, index) => {
            this.add.text(this.scale.width / 2, 100 + index * 40, `${index + 1}. ${score.name} - ${score.score} (${score.character})`, { fontSize: '26px', fill: '#000000' }).setOrigin(0.5);
        });

        const backButton = this.add.text(this.scale.width / 2, this.scale.height - 15, 'Back To Menu', { fontSize: '32px', fill: '#ff0000' }).setOrigin(0.5).setInteractive();
        backButton.on('pointerdown', () => {
            this.scene.start('StartScene');
        });
    }
}
