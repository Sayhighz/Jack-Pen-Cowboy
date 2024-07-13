export default class SelectScene extends Phaser.Scene {
    constructor() {
        super('SelectScene');
        this.selectedCharacter = null;
        this.profileInput = null;
        this.startButton = null;
        this.characterButtons = {};  // เก็บปุ่มตัวละคร
    }

    preload() {
        // โหลดภาพพื้นหลังและปุ่ม
        this.load.image('ss', 'assets/images/select-bg.webp');
        this.load.spritesheet('startButton', 'assets/images/play_button.png', { frameWidth: 190, frameHeight: 49 });

        // โหลดภาพตัวละคร
        this.load.image('knightt', 'assets/hero/knight.png');
        this.load.image('wizzard', 'assets/hero/wizard.png');
        this.load.image('elff', 'assets/hero/elf.png');
    }

    create() {
        
        // ซ่อน command-container
        const commandContainer = document.getElementById('command-container');
        commandContainer.style.display = 'none';
    
        // เพิ่มภาพพื้นหลัง
        const background = this.add.image(this.scale.width / 2, this.scale.height / 2, 'ss');
        const scaleX = this.scale.width / background.width;
        const scaleY = this.scale.height / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale).setScrollFactor(0);
    
        // เพิ่มปุ่มตัวละครพร้อมขนาดเริ่มต้น
        this.characterButtons.knightt = this.add.sprite(this.scale.width / 2 - 160, this.scale.height / 2 + 90, 'knightt').setInteractive();
        this.characterButtons.wizzard = this.add.sprite(this.scale.width / 2 + 160, this.scale.height / 2 + 90, 'wizzard').setInteractive();
        this.characterButtons.elff = this.add.sprite(this.scale.width / 2, this.scale.height / 2 + 90, 'elff').setInteractive();
    
        this.characterButtons.knightt.setScale(2);
        this.characterButtons.wizzard.setScale(2);
        this.characterButtons.elff.setScale(2);
    
        // เพิ่มป้ายชื่อ
        this.add.text(this.scale.width / 2, 200, 'Select Character', { font: '20px Anton', fill: '#ffffff' }).setOrigin(0.5);
        this.add.text(this.characterButtons.knightt.x, this.characterButtons.knightt.y - 30, 'Knight', { font: '20px Anton', fill: '#ffffff' }).setOrigin(0.5);
        this.add.text(this.characterButtons.wizzard.x, this.characterButtons.wizzard.y - 30, 'Wizard', { font: '20px Anton', fill: '#ffffff' }).setOrigin(0.5);
        this.add.text(this.characterButtons.elff.x, this.characterButtons.elff.y - 30, 'Elf', { font: '20px Anton', fill: '#ffffff' }).setOrigin(0.5);
    
        // เพิ่มเอฟเฟกต์เมื่อวางเมาส์และคลิก
        this.addHoverEffect(this.characterButtons.knightt, 'knightt');
        this.addHoverEffect(this.characterButtons.wizzard, 'wizzard');
        this.addHoverEffect(this.characterButtons.elff, 'elff');
    
        this.characterButtons.knightt.on('pointerdown', () => {
            this.selectCharacter('knightt');
        });
        
        this.characterButtons.wizzard.on('pointerdown', () => {
            this.selectCharacter('wizzard');
        });
    
        this.characterButtons.elff.on('pointerdown', () => {
            this.selectCharacter('elff');
        });
    
        // สร้างปุ่ม Start Game ในตำแหน่งที่กำหนดในหน้าจอเกม
        this.createStartButton();
    }
    
    createStartButton() {
        // ลบปุ่ม Start Game ถ้ามีอยู่ก่อนหน้า
        if (this.startButton) {
            this.startButton.destroy();
        }
    
        // เพิ่มปุ่ม Start Game ที่ล่างขวาสุดของหน้าจอเกม
        this.startButton = this.add.text(this.scale.width / 2, this.scale.height, 'Start Game', {
            font: '20px Anton',
            fill: '#ffffff',
            backgroundColor: 'rgba(60, 60, 60,0.6)',
            padding: { left: 10, right: 10, top: 10, bottom: 10 },
            align: 'center',
        })
        .setInteractive()
        .setOrigin(0.5, 1.5);
    
        this.startButton.on('pointerdown', () => {
            if (this.selectedCharacter) {
                if (this.profileInput) {
                    const playerName = this.profileInput.value.trim();
                    if (playerName) {
                        this.profileInput.remove();
                        this.startButton.destroy();
                        this.startGame(playerName);
                    } else {
                        alert('Please enter your name');
                    }
                }
            } else {
                alert('Choose character first');
            }
        });
    }
    
    addHoverEffect(button, character) {
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
            if (this.selectedCharacter === character) {
                button.setTint(0x00ff00);
            } else {
                button.clearTint();
            }
            button.setScale(originalScaleX, originalScaleY);
        });
    }

    selectCharacter(character) {
        if (this.selectedCharacter !== character) {
            this.selectedCharacter = character;
            this.showProfileInput(character);
            this.updateCharacterSelection();
        }
    }
    
    showProfileInput(character) {
        if (this.profileInput) {
            this.profileInput.remove();
        }
    
        let selectedButton = this.characterButtons[character];
        let inputX = selectedButton.x - selectedButton.displayWidth / 2; // ตำแหน่ง X ของปุ่มตัวละครที่เลือก
        let inputY = selectedButton.y + selectedButton.displayHeight / 2 + 20; // ตำแหน่ง Y ของปุ่มตัวละครที่เลือก + ระยะห่าง
    
        this.profileInput = document.createElement('input');
        this.profileInput.type = 'text';
        this.profileInput.placeholder = 'Enter your name';
        this.profileInput.style.position = 'absolute';
        this.profileInput.style.top = `${this.scale.canvas.offsetTop + inputY}px`;
        this.profileInput.style.left = `${this.scale.canvas.offsetLeft + inputX}px`;
        this.profileInput.style.width = '200px'; // กำหนดขนาดกว้างของ input
    
        // เพิ่มการตกแต่ง CSS
        this.profileInput.style.border = '2px solid #000';
        this.profileInput.style.borderRadius = '5px';
        this.profileInput.style.fontSize = '1rem';
        this.profileInput.style.backgroundColor = 'rgba(255, 255, 255,0.5)';
        this.profileInput.style.textAlign = 'center';
    
        document.body.appendChild(this.profileInput);
    }
    
    
    updateCharacterSelection() {
        // เคลียร์เอฟเฟกต์เรืองแสงทั้งหมด
        Object.keys(this.characterButtons).forEach(character => {
            if (this.selectedCharacter !== character) {
                this.characterButtons[character].clearTint();
            }
        });
    
        // เพิ่มเอฟเฟกต์เรืองแสงให้กับตัวละครที่เลือก
        if (this.selectedCharacter) {
            this.characterButtons[this.selectedCharacter].setTint(0x00ff00);  // สีเขียวบอกว่าถูกเลือก
        }
    }
    
    startGame(playerName) {
        if (this.selectedCharacter) {
            this.scene.start('MainScene', { character: this.selectedCharacter, playerName });
        } else {
            alert('Select Character First!!');
            console.error('Error: dont choose character');
        }
    }
}
