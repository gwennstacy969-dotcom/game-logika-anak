/**
 * ============================================
 * CodingScene — Game Algoritma Dasar
 * ============================================
 * 
 * Anak belajar membuat urutan perintah (sekuens)
 * untuk memindahkan robot dari start ke finish.
 */
export class CodingScene extends Phaser.Scene {

    constructor() {
        super({ key: 'CodingScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        this.cameras.main.fadeIn(500);

        // Background Premium
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0a192f, 0x112240, 0x0a192f, 0x112240, 1);
        bg.fillRect(0, 0, width, height);

        // Header
        this._createUI(width, height);

        // Setup Level Data (Grid 6x4)
        this.tileSize = 80;
        this.gridOffsetX = width / 2 - (this.tileSize * 3);
        this.gridOffsetY = height / 2 - (this.tileSize * 2.5);
        
        // 0 = kosong, 1 = obstacle, 2 = start, 3 = goal
        this.levelMap = [
            [0, 0, 0, 1, 0, 3],
            [0, 1, 0, 1, 0, 0],
            [0, 1, 0, 0, 1, 0],
            [2, 0, 1, 0, 0, 0]
        ];

        this.commands = [];
        this.isPlaying = false;

        this._drawGrid();
        this._setupCharacters();
        this._createCommandPanel(width, height);
    }

    _createUI(width, height) {
        // Back Button (Glass)
        const backBtn = this.add.container(60, 50);
        const backBg = this.add.graphics();
        backBg.fillStyle(0xffffff, 0.15);
        backBg.fillRoundedRect(-30, -20, 60, 40, 10);
        backBg.lineStyle(2, 0xffffff, 0.5);
        backBg.strokeRoundedRect(-30, -20, 60, 40, 10);
        const backText = this.add.text(0, 0, '⬅️', { fontSize: '24px' }).setOrigin(0.5);
        backBtn.add([backBg, backText]);
        backBtn.setSize(60, 40);
        backBtn.setInteractive({ useHandCursor: true });
        
        backBtn.on('pointerdown', () => {
            const audioManager = this.registry.get('audioManager');
            if (audioManager) audioManager.playPop();
            this.cameras.main.fadeOut(300);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MenuScene');
            });
        });

        // Title
        this.add.text(width / 2, 50, '🤖 Robot Coding', {
            fontFamily: 'Nunito',
            fontSize: '36px',
            fontWeight: '900',
            color: '#00CEC9',
            shadow: { offsetY: 2, blur: 4, color: '#000000', fill: true }
        }).setOrigin(0.5);
        
        // Instruction
        this.add.text(width / 2, 95, 'Beri perintah pada robot untuk mencapai bintang!', {
            fontFamily: 'Nunito',
            fontSize: '20px',
            color: '#ffffffaa'
        }).setOrigin(0.5);
    }

    _drawGrid() {
        this.tiles = [];
        
        for (let row = 0; row < this.levelMap.length; row++) {
            for (let col = 0; col < this.levelMap[row].length; col++) {
                const x = this.gridOffsetX + col * this.tileSize;
                const y = this.gridOffsetY + row * this.tileSize;
                
                const type = this.levelMap[row][col];
                
                const tileBg = this.add.graphics();
                // Sel kosong vs Rintangan
                if (type === 1) {
                    tileBg.fillStyle(0xE74C3C, 0.8); // Obstacle (Merah/Lava)
                } else {
                    tileBg.fillStyle(0xffffff, 0.1); // Path (Transparan putih)
                }
                
                tileBg.fillRoundedRect(x, y, this.tileSize - 4, this.tileSize - 4, 8);
                tileBg.lineStyle(2, 0xffffff, 0.2);
                tileBg.strokeRoundedRect(x, y, this.tileSize - 4, this.tileSize - 4, 8);
                
                // Tambah dekorasi batu jika obstacle
                if (type === 1) {
                    this.add.text(x + this.tileSize/2 - 2, y + this.tileSize/2 - 2, '🪨', {fontSize: '30px'}).setOrigin(0.5);
                }

                // Tambah bintang jika goal
                if (type === 3) {
                    this.add.text(x + this.tileSize/2 - 2, y + this.tileSize/2 - 2, '⭐', {fontSize: '45px'}).setOrigin(0.5);
                }
            }
        }
    }

    _setupCharacters() {
        // Cari posisi start
        let startCol = 0, startRow = 0;
        for (let r = 0; r < this.levelMap.length; r++) {
            for (let c = 0; c < this.levelMap[r].length; c++) {
                if (this.levelMap[r][c] === 2) {
                    startCol = c;
                    startRow = r;
                }
            }
        }

        this.robotCol = startCol;
        this.robotRow = startRow;
        this.robotStartX = this.gridOffsetX + startCol * this.tileSize + this.tileSize/2;
        this.robotStartY = this.gridOffsetY + startRow * this.tileSize + this.tileSize/2;

        this.robot = this.add.text(this.robotStartX, this.robotStartY, '🤖', {fontSize: '50px'}).setOrigin(0.5);
        this.robot.setDepth(10);
        
        // Animasi bernapas
        this.robotIdle = this.tweens.add({
            targets: this.robot,
            y: this.robotStartY - 5,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    _createCommandPanel(width, height) {
        const panelY = height - 120;
        
        // Background panel
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.4);
        bg.fillRect(0, panelY - 50, width, 170);

        // Queue Display Area (tempat command berjejer)
        this.queueBg = this.add.graphics();
        this.queueBg.fillStyle(0xffffff, 0.1);
        this.queueBg.fillRoundedRect(width/2 - 250, panelY - 20, 500, 60, 10);
        this.queueBg.lineStyle(2, 0xffffff, 0.3);
        this.queueBg.strokeRoundedRect(width/2 - 250, panelY - 20, 500, 60, 10);
        
        this.commandTexts = [];

        // Tombol Perintah
        this._createCmdBtn(width/2 - 120, panelY + 80, '⬆️', 'up', 0x3498db);
        this._createCmdBtn(width/2 - 40, panelY + 80, '⬇️', 'down', 0x9b59b6);
        this._createCmdBtn(width/2 + 40, panelY + 80, '⬅️', 'left', 0xf1c40f);
        this._createCmdBtn(width/2 + 120, panelY + 80, '➡️', 'right', 0xe67e22);

        // Tombol Play
        const playBtn = this._createActionBtn(width/2 + 320, panelY + 10, '▶️ JALAN', 0x2ecc71);
        playBtn.on('pointerdown', () => this._playSequence());

        // Tombol Reset
        const resetBtn = this._createActionBtn(width/2 - 320, panelY + 10, '🔄 HAPUS', 0xe74c3C);
        resetBtn.on('pointerdown', () => this._resetCommands());
    }

    _createCmdBtn(x, y, icon, action, color) {
        const btn = this.add.container(x, y);
        const bg = this.add.graphics();
        bg.fillStyle(color, 1);
        bg.fillRoundedRect(-30, -30, 60, 60, 15);
        bg.lineStyle(2, 0xffffff, 0.5);
        bg.strokeRoundedRect(-30, -30, 60, 60, 15);
        
        const text = this.add.text(0, 0, icon, {fontSize: '30px'}).setOrigin(0.5);
        
        btn.add([bg, text]);
        btn.setSize(60, 60);
        btn.setInteractive({useHandCursor: true});

        btn.on('pointerdown', () => {
            if(this.isPlaying || this.commands.length >= 10) return;
            
            const audioManager = this.registry.get('audioManager');
            if (audioManager) audioManager.playPop();

            this.commands.push({action, icon});
            this._updateQueueDisplay();
            
            // Animasi klik
            this.tweens.add({
                targets: btn,
                scale: 0.9,
                duration: 50,
                yoyo: true
            });
        });
    }

    _createActionBtn(x, y, label, color) {
        const btn = this.add.container(x, y);
        const bg = this.add.graphics();
        bg.fillStyle(color, 1);
        bg.fillRoundedRect(-60, -25, 120, 50, 25);
        bg.lineStyle(3, 0xffffff, 0.7);
        bg.strokeRoundedRect(-60, -25, 120, 50, 25);
        
        const text = this.add.text(0, 0, label, {
            fontFamily: 'Nunito',
            fontSize: '18px',
            fontWeight: '900',
            color: '#fff'
        }).setOrigin(0.5);
        
        btn.add([bg, text]);
        btn.setSize(120, 50);
        btn.setInteractive({useHandCursor: true});
        
        btn.on('pointerdown', () => {
            this.tweens.add({ targets: btn, scale: 0.9, duration: 50, yoyo: true });
        });
        
        return btn;
    }

    _updateQueueDisplay() {
        const { width, height } = this.cameras.main;
        const panelY = height - 120;
        
        // Hapus teks lama
        this.commandTexts.forEach(t => t.destroy());
        this.commandTexts = [];

        // Gambar ulang urutan
        const startX = width/2 - 250 + 25;
        this.commands.forEach((cmd, i) => {
            const t = this.add.text(startX + (i * 45), panelY + 10, cmd.icon, {fontSize: '28px'}).setOrigin(0.5);
            this.commandTexts.push(t);
        });
    }

    _resetCommands() {
        if(this.isPlaying) return;
        
        const audioManager = this.registry.get('audioManager');
        if (audioManager) audioManager.playPop();

        this.commands = [];
        this._updateQueueDisplay();
        
        // Reset posisi robot
        this.robotCol = 0; // Seharusnya startCol
        // Cari posisi start ulang
        for (let r = 0; r < this.levelMap.length; r++) {
            for (let c = 0; c < this.levelMap[r].length; c++) {
                if (this.levelMap[r][c] === 2) {
                    this.robotCol = c;
                    this.robotRow = r;
                }
            }
        }
        this.robot.x = this.gridOffsetX + this.robotCol * this.tileSize + this.tileSize/2;
        this.robot.y = this.gridOffsetY + this.robotRow * this.tileSize + this.tileSize/2;
    }

    async _playSequence() {
        if(this.isPlaying || this.commands.length === 0) return;
        this.isPlaying = true;
        
        const audioManager = this.registry.get('audioManager');
        
        this.robotIdle.pause();

        for (let i = 0; i < this.commands.length; i++) {
            const cmd = this.commands[i];
            
            // Highlight text in queue
            this.commandTexts[i].setScale(1.5);
            
            if (audioManager) audioManager.playPop();

            // Hitung target
            let targetCol = this.robotCol;
            let targetRow = this.robotRow;

            if (cmd.action === 'up') targetRow--;
            if (cmd.action === 'down') targetRow++;
            if (cmd.action === 'left') targetCol--;
            if (cmd.action === 'right') targetCol++;

            // Cek batasan (out of bounds atau nabrak rintangan)
            let crashed = false;
            if (targetRow < 0 || targetRow >= this.levelMap.length || targetCol < 0 || targetCol >= this.levelMap[0].length) {
                crashed = true;
            } else if (this.levelMap[targetRow][targetCol] === 1) { // 1 = batu
                crashed = true;
            }

            if (crashed) {
                // Animasi mentok
                await this._animateRobotHit(targetCol, targetRow);
                if (audioManager) audioManager.playWrong();
                break; // Stop sekuens
            } else {
                // Jalan sukses
                this.robotCol = targetCol;
                this.robotRow = targetRow;
                await this._animateRobotMove();
                
                // Cek Menang
                if (this.levelMap[this.robotRow][this.robotCol] === 3) {
                    this._winGame();
                    return;
                }
            }
            
            this.commandTexts[i].setScale(1); // Normal kembali
            await new Promise(r => setTimeout(r, 200)); // Jeda antar step
        }

        // Kalau sequence habis tapi belum sampai
        this.isPlaying = false;
        this.robotIdle.resume();
    }

    _animateRobotMove() {
        return new Promise(resolve => {
            const targetX = this.gridOffsetX + this.robotCol * this.tileSize + this.tileSize/2;
            const targetY = this.gridOffsetY + this.robotRow * this.tileSize + this.tileSize/2;
            
            this.tweens.add({
                targets: this.robot,
                x: targetX,
                y: targetY,
                duration: 400,
                ease: 'Sine.easeInOut',
                onComplete: resolve
            });
        });
    }

    _animateRobotHit(tCol, tRow) {
        return new Promise(resolve => {
            // Hitung arah mentok sedikit lalu kembali
            const tX = this.gridOffsetX + tCol * this.tileSize + this.tileSize/2;
            const tY = this.gridOffsetY + tRow * this.tileSize + this.tileSize/2;
            
            const dx = (tX - this.robot.x) * 0.3;
            const dy = (tY - this.robot.y) * 0.3;

            this.tweens.add({
                targets: this.robot,
                x: this.robot.x + dx,
                y: this.robot.y + dy,
                duration: 150,
                yoyo: true,
                onComplete: resolve
            });
        });
    }

    _winGame() {
        const audioManager = this.registry.get('audioManager');
        if (audioManager) audioManager.playCorrect();

        // Tambah Confetti
        import('../utils/Confetti.js').then(module => {
            const confetti = new module.Confetti(this);
            confetti.fire();
        });

        // Bintang lompat
        this.tweens.add({
            targets: this.robot,
            scale: 1.5,
            y: this.robot.y - 50,
            duration: 300,
            yoyo: true,
            repeat: 3
        });

        // Panel Sukses
        setTimeout(() => {
            const panel = this.add.container(this.cameras.main.width/2, this.cameras.main.height/2);
            const bg = this.add.graphics();
            bg.fillStyle(0x000000, 0.8);
            bg.fillRoundedRect(-200, -100, 400, 200, 20);
            
            const text = this.add.text(0, -30, 'Hebat! Robot Sampai!', {
                fontFamily: 'Nunito', fontSize: '28px', color: '#2ecc71', fontWeight: '900'
            }).setOrigin(0.5);
            
            const btn = this._createActionBtn(0, 40, 'KEMBALI', 0x3498db);
            btn.on('pointerdown', () => {
                this.cameras.main.fadeOut(300);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('MenuScene');
                });
            });

            panel.add([bg, text, btn]);
        }, 1500);
    }
}
