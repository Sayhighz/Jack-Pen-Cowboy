// import Phaser from 'phaser';

export default class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene');
    }

    preload() {
        // โหลดภาพพื้นหลังและปุ่ม
        this.load.image('startBackground', 'assets/images/title_bg.jpg');
        this.load.spritesheet('startButton', 'assets/images/play_button.png', { frameWidth: 190, frameHeight: 49 });
        this.load.image('settingsButton', 'assets/images/setting_btn.png', { frameWidth: 190, frameHeight: 49 }); // โหลดภาพปุ่มใหม่

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
        // ซ่อน command-container
        const commandContainer = document.getElementById('command-container');
        const tutorial = document.getElementById('tutorial-box');
        commandContainer.style.display = 'none';
        tutorial.style.display = 'none';
    
        // ตรวจสอบว่าภาพพื้นหลังถูกโหลดหรือไม่
        if (this.textures.exists('startBackground')) {
            // เพิ่มภาพพื้นหลัง
            this.add.image(this.scale.width / 2, this.scale.height / 2, 'startBackground');
        } else {
            console.error('Error: startBackground image not found');
        }
    
        // เพิ่มปุ่มเริ่มเกม
        const startButton = this.add.sprite(this.scale.width / 2, this.scale.height / 2 + 100, 'startButton').setInteractive();
        this.tweens.add({
            targets: startButton,
            alpha: { from: 1, to: 0.5 },
            duration: 1000, // duration of one blink cycle
            yoyo: true,
            repeat: -1 // repeat forever
        });
        
        // เพิ่มปุ่มตั้งค่า
        const settingsButton = this.add.sprite(this.scale.width / 2, this.scale.height / 2 + 225, 'settingsButton').setInteractive();
        settingsButton.setScale(0.1)

        // เพิ่ม event เมื่อคลิกปุ่มเริ่มเกม
        startButton.on('pointerdown', () => {
            this.scene.start('SelectScene');  // เรียก MainScene เมื่อคลิกปุ่ม
            commandContainer.style.display = 'block'
            tutorial.style.display = 'block';
        });

        // เพิ่ม event เมื่อคลิกปุ่มตั้งค่า
        settingsButton.on('pointerdown', () => {
            this.scene.start('Settings');
        });
    }
    
}
