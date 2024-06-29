export default class SelectScene extends Phaser.Scene {
    constructor() {
        super('SelectScene');
        this.selectedCharacter = null;
    }

    preload() {
        // Load background and buttons
        this.load.image('ss', 'assets/images/game_bg.jpg');
        this.load.spritesheet('startButton', 'assets/images/play_button.png', { frameWidth: 190, frameHeight: 49 });

        // Load character images
        this.load.image('knightt', 'assets/hero/knight.png');
        this.load.image('wizzard', 'assets/hero/wizard.png');

        // Check file loading status
        this.load.on('filecomplete', (fileKey) => {
            console.log(`File loaded: ${fileKey}`);
        });

        this.load.on('complete', () => {
            console.log('All assets loaded');
        });

        this.load.on('loaderror', (file) => {
            console.error(`Error loading file: ${file.key}`);
        });
    }

    create() {
        // Add background image
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'ss');
    
        // Add character buttons with initial scale
        const knightButton = this.add.sprite(this.scale.width / 2 - 100, this.scale.height / 2, 'knightt').setInteractive();
        const wizardButton = this.add.sprite(this.scale.width / 2 + 100, this.scale.height / 2, 'wizzard').setInteractive();

        knightButton.setScale(2); // Adjust the scale factor as needed

        // Scale up the wizard button
        wizardButton.setScale(2); // Adjust the scale factor as needed
    
        // Handle hover animation for knightButton
        knightButton.on('pointerover', () => {
            knightButton.setTint(0xff0000); // เปลี่ยนสีพื้นหลังเป็นสีแดง
            this.tweens.add({
                targets: knightButton,
                scaleX: 2.8,
                scaleY: 2.8,
                duration: 200,
                ease: 'Linear',
                yoyo: true,
                repeat: 0
            });
        });
        
        knightButton.on('pointerout', () => {
            knightButton.clearTint(); // กลับไปที่สีเดิมเมื่อไม่ได้วางเมาส์เหนือปุ่ม
        });
    
        // Handle hover animation for wizardButton
        wizardButton.on('pointerover', () => {
            wizardButton.setTint(0xff0000);
            this.tweens.add({
                targets: wizardButton,
                scaleX: 2.8,
                scaleY: 2.8,
                duration: 200,
                ease: 'Linear',
                yoyo: true,
                repeat: 0
            });
        });

        wizardButton.on('pointerout', () => {
            wizardButton.clearTint(); // กลับไปที่สีเดิมเมื่อไม่ได้วางเมาส์เหนือปุ่ม
        });
    
        // Handle character button click
        knightButton.on('pointerdown', () => {
            this.selectedCharacter = 'knightt';
            this.startGame();
        });
    
        wizardButton.on('pointerdown', () => {
            this.selectedCharacter = 'wizzard';
            this.startGame();
        });
    
        // // Add start game button
        // const startButton = this.add.sprite(this.scale.width / 2, this.scale.height / 2 + 100, 'startButton').setInteractive();
    
        // Add event when start button is clicked
        // startButton.on('pointerdown', () => {
        //     this.startGame();  // Call startGame when button is clicked
        // });
    }
    

    startGame() {
        if (this.selectedCharacter) {
            this.scene.start('MainScene', { character: this.selectedCharacter });
        } else {
            alert('กดเลือกตัวละครก่อนนะไอโง่')
            console.error('Error: No character selected');
        }
    }
}