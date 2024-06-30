export default class SelectScene extends Phaser.Scene {
    constructor() {
        super('SelectScene');
        this.selectedCharacter = null;
    }

    preload() {
        // โหลดภาพพื้นหลังและปุ่ม
        this.load.image('ss', 'assets/images/ง่วง (1).jpg');
        this.load.spritesheet('startButton', 'assets/images/play_button.png', { frameWidth: 190, frameHeight: 49 });

        // โหลดภาพตัวละคร
        this.load.image('knightt', 'assets/hero/knight.png');
        this.load.image('wizzard', 'assets/hero/wizard.png');
        this.load.image('elff', 'assets/hero/elf.png');
        

        // ตรวจสอบสถานะการโหลดไฟล์
        this.load.on('filecomplete', (fileKey) => {
            console.log(`ไฟล์โหลดสำเร็จ: ${fileKey}`);
        });

        this.load.on('complete', () => {
            console.log('โหลดไฟล์ทั้งหมดเสร็จสิ้น');
        });

        this.load.on('loaderror', (file) => {
            console.error(`เกิดข้อผิดพลาดในการโหลดไฟล์: ${file.key}`);
        });
    }

    create() {
        // เพิ่มภาพพื้นหลัง
        const background = this.add.image(this.scale.width / 2, this.scale.height / 2, 'ss');
        background.setDisplaySize(this.scale.width, this.scale.height);
    
        // เพิ่มปุ่มตัวละครพร้อมขนาดเริ่มต้น
        const knightButton = this.add.sprite(this.scale.width / 2 - 100, this.scale.height / 2 + 90, 'knightt').setInteractive();
        const wizardButton = this.add.sprite(this.scale.width / 2 + 100, this.scale.height / 2 + 90, 'wizzard').setInteractive();
        const elfButton = this.add.sprite(this.scale.width / 2, this.scale.height / 2 + 90, 'elff').setInteractive();

        knightButton.setScale(2);
        wizardButton.setScale(2);
        elfButton.setScale(2);

        // เพิ่มป้ายชื่อ
        this.add.text(this.scale.width / 2, 200, 'Select Character', { font: '20px Anton', fill: '#ffffff' }).setOrigin(0.5);
        this.add.text(knightButton.x, knightButton.y - 30, 'Knight', { font: '20px Anton', fill: '#ffffff' }).setOrigin(0.5);
        this.add.text(wizardButton.x, wizardButton.y - 30, 'Wizard', { font: '20px Anton', fill: '#ffffff' }).setOrigin(0.5);
        this.add.text(elfButton.x, elfButton.y - 30, 'Elf', { font: '20px Anton', fill: '#ffffff' }).setOrigin(0.5);

        // เพิ่มเอฟเฟกต์เมื่อวางเมาส์และคลิก
        this.addHoverEffect(knightButton);
        this.addHoverEffect(wizardButton);
        this.addHoverEffect(elfButton);

        knightButton.on('pointerdown', () => {
            this.selectedCharacter = 'knightt';
            this.startGame();
        });
        
        wizardButton.on('pointerdown', () => {
            this.selectedCharacter = 'wizzard';
            this.startGame();
        });

        elfButton.on('pointerdown', () => {
            this.selectedCharacter = 'elff';
            this.startGame();
        });
    }

    addHoverEffect(button) {
        const originalScaleX = button.scaleX;
        const originalScaleY = button.scaleY;

        button.on('pointerover', () => {
            button.setTint(0xff0000);
            this.tweens.add({
                targets: button,
                scaleX: originalScaleX * 1.4,
                scaleY: originalScaleY * 1.4,
                duration: 200,
                ease: 'Linear',
                yoyo: true,
                repeat: 0
            });
        });

        button.on('pointerout', () => {
            button.clearTint();
            button.setScale(originalScaleX, originalScaleY);
        });
    }

    startGame() {
        if (this.selectedCharacter) {
            this.scene.start('MainScene', { character: this.selectedCharacter });
        } else {
            alert('Select Character First!!');
            console.error('Error: dont choose character');
        }
    }
}
