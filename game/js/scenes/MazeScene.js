/**
 * ============================================
 * MazeScene — Labirin Pintar
 * ============================================
 * 
 * Melatih spasial dan problem solving dengan 
 * mencari jalan keluar dari labirin.
 */
export class MazeScene extends Phaser.Scene {

    constructor() {
        super({ key: 'MazeScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        this.cameras.main.fadeIn(500);

        // Background Premium
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x2d3436, 0x000000, 0x2d3436, 0x000000, 1);
        bg.fillRect(0, 0, width, height);

        this._createUI(width, height);

        // Maze Grid Definition
        // 1 = Wall, 0 = Path, 2 = Start, 3 = Goal
        this.mazeMap = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 2, 0, 0, 1, 0, 0, 0, 0, 1],
            [1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 0, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 3, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];

        this.tileSize = 70;
        this.gridOffsetX = width / 2 - (this.tileSize * 5);
        this.gridOffsetY = height / 2 - (this.tileSize * 3.5) + 30;

        this.walls = this.physics.add.staticGroup();
        
        this._drawMaze();
        this._setupPlayer();
        
        // Physics collision
        this.physics.add.collider(this.player, this.walls);
    }

    _createUI(width, height) {
        // Back Button
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
        this.add.text(width / 2, 50, '🗺️ Labirin Pintar', {
            fontFamily: 'Nunito',
            fontSize: '36px',
            fontWeight: '900',
            color: '#FD79A8',
            shadow: { offsetY: 2, blur: 4, color: '#000000', fill: true }
        }).setOrigin(0.5);
        
        // Instruction
        this.add.text(width / 2, 95, 'Tarik anjing ke rumahnya, jangan tabrak tembok!', {
            fontFamily: 'Nunito',
            fontSize: '20px',
            color: '#ffffffaa'
        }).setOrigin(0.5);
    }

    _drawMaze() {
        for (let row = 0; row < this.mazeMap.length; row++) {
            for (let col = 0; col < this.mazeMap[row].length; col++) {
                const type = this.mazeMap[row][col];
                const x = this.gridOffsetX + col * this.tileSize + this.tileSize/2;
                const y = this.gridOffsetY + row * this.tileSize + this.tileSize/2;

                if (type === 1) { // Wall
                    // Buat kotak physics untuk dinding
                    const wall = this.add.rectangle(x, y, this.tileSize, this.tileSize, 0x0984e3);
                    wall.setStrokeStyle(4, 0x74b9ff);
                    this.walls.add(wall);
                } else if (type === 0 || type === 2 || type === 3) { // Path
                    this.add.rectangle(x, y, this.tileSize, this.tileSize, 0xffffff, 0.1);
                }

                if (type === 3) { // Goal
                    this.goalX = x;
                    this.goalY = y;
                    
                    this.house = this.add.text(x, y, '🏠', {fontSize: '40px'}).setOrigin(0.5);
                    this.tweens.add({
                        targets: this.house,
                        scale: 1.1,
                        duration: 600,
                        yoyo: true,
                        repeat: -1
                    });
                }

                if (type === 2) {
                    this.startX = x;
                    this.startY = y;
                }
            }
        }
    }

    _setupPlayer() {
        this.player = this.add.text(this.startX, this.startY, '🐶', {fontSize: '45px'}).setOrigin(0.5);
        this.physics.add.existing(this.player);
        
        // Atur ukuran body hitbox lebih kecil sedikit agar mudah belok
        this.player.body.setSize(30, 30);
        this.player.body.setCollideWorldBounds(true);
        this.player.setInteractive({ draggable: true });

        // Efek trail/garis yang digambar
        this.trail = this.add.graphics();
        this.trailPath = [];

        this.input.on('dragstart', (pointer, gameObject) => {
            if (gameObject !== this.player || this.isWon) return;
            this.trailPath = [{x: this.player.x, y: this.player.y}];
            this.tweens.add({targets: this.player, scale: 1.2, duration: 100});
        });

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (gameObject !== this.player || this.isWon) return;
            
            // Set kecepatan fisik agar collider bereaksi
            // Daripada memaksa x/y secara manual
            // Lebih baik gunakan moveTo atau atur position tapi andalkan arcade physics separation
            
            // Simpan posisi lama sebelum diubah
            const oldX = this.player.x;
            const oldY = this.player.y;
            
            this.player.x = dragX;
            this.player.y = dragY;

            // Pastikan tidak ada overlap, kalau ada geser balik
            this.physics.world.collide(this.player, this.walls);

            // Simpan jejak
            this.trailPath.push({x: this.player.x, y: this.player.y});
            this._drawTrail();
            this._checkGoal();
        });

        this.input.on('dragend', (pointer, gameObject) => {
            if (gameObject !== this.player || this.isWon) return;
            this.tweens.add({targets: this.player, scale: 1.0, duration: 100});
            
            // Jika dilepas sebelum goal, biarkan di situ
        });
    }

    _drawTrail() {
        this.trail.clear();
        this.trail.lineStyle(6, 0x55efc4, 0.6);
        this.trail.beginPath();
        for (let i = 0; i < this.trailPath.length; i++) {
            const p = this.trailPath[i];
            if (i === 0) this.trail.moveTo(p.x, p.y);
            else this.trail.lineTo(p.x, p.y);
        }
        this.trail.strokePath();
    }

    _checkGoal() {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.goalX, this.goalY);
        if (dist < 40 && !this.isWon) {
            this.isWon = true;
            this.player.disableInteractive();
            this.player.x = this.goalX;
            this.player.y = this.goalY;
            this._winGame();
        }
    }

    _winGame() {
        const audioManager = this.registry.get('audioManager');
        if (audioManager) audioManager.playCorrect();

        // Tambah Confetti
        import('../utils/Confetti.js').then(module => {
            const confetti = new module.Confetti(this);
            confetti.fire();
        });

        this.tweens.add({
            targets: this.player,
            y: this.player.y - 40,
            scale: 1.5,
            duration: 300,
            yoyo: true,
            repeat: 3
        });

        // Panel Sukses
        setTimeout(() => {
            const panel = this.add.container(this.cameras.main.width/2, this.cameras.main.height/2);
            const bg = this.add.graphics();
            bg.fillStyle(0x000000, 0.85);
            bg.fillRoundedRect(-200, -100, 400, 200, 20);
            bg.lineStyle(4, 0x55efc4, 1);
            bg.strokeRoundedRect(-200, -100, 400, 200, 20);
            
            const text = this.add.text(0, -30, 'Luar Biasa!', {
                fontFamily: 'Nunito', fontSize: '32px', color: '#55efc4', fontWeight: '900'
            }).setOrigin(0.5);
            
            // Tombol Kembali
            const btn = this.add.container(0, 40);
            const btnBg = this.add.graphics();
            btnBg.fillStyle(0x0984e3, 1);
            btnBg.fillRoundedRect(-70, -25, 140, 50, 25);
            const btnText = this.add.text(0, 0, 'KEMBALI', {
                fontFamily: 'Nunito', fontSize: '18px', fontWeight: 'bold', color: '#fff'
            }).setOrigin(0.5);
            btn.add([btnBg, btnText]);
            btn.setSize(140, 50);
            btn.setInteractive({useHandCursor: true});
            
            btn.on('pointerdown', () => {
                this.cameras.main.fadeOut(300);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('MenuScene');
                });
            });

            panel.add([bg, text, btn]);
            panel.setScale(0);
            
            this.tweens.add({
                targets: panel,
                scale: 1,
                duration: 500,
                ease: 'Back.easeOut'
            });

        }, 1500);
    }
}
