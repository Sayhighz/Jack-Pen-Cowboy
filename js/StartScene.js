// import Phaser from 'phaser';

export default class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene');
    }

    preload() {
        // โหลดภาพพื้นหลังและปุ่ม
        this.load.image('startBackground', 'assets/images/title_bg.jpg');
        this.load.spritesheet('startButton', 'assets/images/play_button.png', { frameWidth: 190, frameHeight: 49 });

        // ตรวจสอบการโหลดไฟล์ภาพ
        this.load.on('filecomplete', (fileKey, type, data) => {
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
        // ตรวจสอบว่าภาพพื้นหลังถูกโหลดหรือไม่
        if (this.textures.exists('startBackground')) {
            // เพิ่มภาพพื้นหลัง
            this.add.image(this.scale.width / 2, this.scale.height / 2, 'startBackground');
        } else {
            console.error('Error: startBackground image not found');
        }

        // เพิ่มปุ่มเริ่มเกม
        const startButton = this.add.sprite(this.scale.width / 2, this.scale.height / 2 + 100, 'startButton').setInteractive();

        // เพิ่ม event เมื่อคลิกปุ่ม
        startButton.on('pointerdown', () => {
            this.scene.start('MainScene');  // เรียก MainScene เมื่อคลิกปุ่ม
        });
    }
}
