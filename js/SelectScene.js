export default class SelectScene extends Phaser.Scene {
    constructor() {
        super('SelectScene');
        this.selectedCharacter = null;
    }

    preload() {
        // Load background and buttons
        this.load.image('ss', 'assets/images/ง่วง (1).jpg');
        this.load.spritesheet('startButton', 'assets/images/play_button.png', { frameWidth: 190, frameHeight: 49 });

        // Load character images
        this.load.image('knightt', 'assets/hero/knight.png');
        this.load.image('wizzard', 'assets/hero/wizard.png');
        this.load.image('elff', 'assets/hero/elf.png');

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
        const background = this.add.image(this.scale.width / 2, this.scale.height / 2, 'ss');
        background.setDisplaySize(this.scale.width, this.scale.height);
    
        // Add character buttons with initial scale
        const knightButton = this.add.sprite(this.scale.width / 2 - 100, this.scale.height / 2 + 90, 'knightt').setInteractive();
        const wizardButton = this.add.sprite(this.scale.width / 2 + 100, this.scale.height / 2 + 90, 'wizzard').setInteractive();
        const elfButton = this.add.sprite(this.scale.width / 2 , this.scale.height / 2 + 90, 'elff').setInteractive();

        knightButton.setScale(2); // Adjust the scale factor as needed
     
        elfButton.setScale(2); // Adjust the scale factor as needed

        // Scale up the wizard button
        wizardButton.setScale(2); // Adjust the scale factor as needed

        const WordTop = this.add.text(this.scale.width / 2, 200, 'Select Character', { font: '20px Anton', fill: '#ffffff' }).setOrigin(0.5);

        const knightName = this.add.text(knightButton.x, knightButton.y - 30, 'Knight', { font: '20px Anton', fill: '#ffffff' }).setOrigin(0.5);
        const wizardName = this.add.text(wizardButton.x, wizardButton.y - 30, 'Wizard', { font: '20px Anton', fill: '#ffffff' }).setOrigin(0.5);
        const elfName = this.add.text(elfButton.x, elfButton.y - 30, 'Elf', { font: '20px Anton', fill: '#ffffff' }).setOrigin(0.5);
    
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

        elfButton.on('pointerover', () => {
            elfButton.setTint(0xff0000);
            this.tweens.add({
                targets: elfButton,
                scaleX: 2.8,
                scaleY: 2.8,
                duration: 200,
                ease: 'Linear',
                yoyo: true,
                repeat: 0
            });
        });

        elfButton.on('pointerout', () => {
            elfButton.clearTint(); // กลับไปที่สีเดิมเมื่อไม่ได้วางเมาส์เหนือปุ่ม
        });
        
        elfButton.on('pointerdown', () => {
            this.selectedCharacter = 'elff';
            this.startGame();
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
