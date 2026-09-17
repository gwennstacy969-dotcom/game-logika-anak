/**
 * ============================================
 * NumberCatchScene — Tangkap Angka
 * ============================================
 * 
 * Anak harus meletuskan balon dengan angka tertentu.
 * Melatih pengenalan angka dan kecepatan respons.
 */
export class NumberCatchScene extends Phaser.Scene {

    constructor() {
        super({ key: 'NumberCatchScene' });
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.fadeIn(500);

        // Background Sky
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x74b9ff, 0x0984e3, 0x74b9ff, 0x0984e3, 1);
        bg.fillRect(0, 0, width, height);

        // Awan bergerak (dekorasi)
        this._createClouds(width, height);

        this.score = 0;
        this.targetScore = 10;
        this.balloons = this.add.group();
        this.isPlaying = true;

        // Tentukan angka target
        this.targetNumber = Phaser.Math.Between(1, 9);

        this._createUI(width, height);

        // Spawn balon berkala
        this.spawnTimer = this.time.addEvent({
            delay: 1500, // Tiap 1.5 detik
            callback: this._spawnBalloon,
            callbackScope: this,
            loop: true
        });
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
        backBtn.setInteractive({ useHandCursor: true }).setDepth(200);
        
        backBtn.on('pointerdown', () => {
            const audioManager = this.registry.get('audioManager');
            if (audioManager) audioManager.playPop();
            this.cameras.main.fadeOut(300);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MenuScene');
            });
        });

        // Title Target
        this.add.text(width / 2, 40, '🎯 Tangkap Angka', {
            fontFamily: 'Nunito',
            fontSize: '28px',
            fontWeight: '900',
            color: '#ffffff',
            shadow: { offsetY: 2, blur: 4, color: '#00000088', fill: true }
        }).setOrigin(0.5).setDepth(200);
        
        // Instruksi besar
        this.instructionText = this.add.text(width / 2, 85, `Pecahkan balon dengan angka ${this.targetNumber}!`, {
            fontFamily: 'Nunito',
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#FFEAA7',
            stroke: '#2D3436',
            strokeThickness: 5
        }).setOrigin(0.5).setDepth(200);

        // Score display
        this.scoreText = this.add.text(width - 100, 50, `⭐ 0 / ${this.targetScore}`, {
            fontFamily: 'Nunito',
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#FFF'
        }).setOrigin(0.5).setDepth(200);
    }

    _createClouds(width, height) {
        for(let i = 0; i < 5; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(50, height/2);
            const cloud = this.add.text(x, y, '☁️', { fontSize: `${Phaser.Math.Between(60, 120)}px` });
            cloud.setAlpha(0.6);
            
            this.tweens.add({
                targets: cloud,
                x: width + 100,
                duration: Phaser.Math.Between(15000, 30000),
                repeat: -1,
                onRepeat: () => { cloud.x = -100; }
            });
        }
    }

    _spawnBalloon() {
        if (!this.isPlaying) return;

        const { width, height } = this.cameras.main;
        const x = Phaser.Math.Between(100, width - 100);
        const y = height + 100;

        // 40% kemungkinan spawn angka target, 60% angka acak lain
        let num;
        if (Math.random() < 0.4) {
            num = this.targetNumber;
        } else {
            do {
                num = Phaser.Math.Between(1, 9);
            } while (num === this.targetNumber);
        }

        const colors = [0xFF7675, 0x55EFC4, 0x74B9FF, 0xFDCB6E, 0xA29BFE];
        const color = Phaser.Math.RND.pick(colors);

        // Buat container balon
        const balloon = this.add.container(x, y);
        
        const graphic = this.add.graphics();
        graphic.fillStyle(color, 1);
        graphic.fillCircle(0, 0, 45); // Badan balon
        // Tali balon
        graphic.lineStyle(2, 0xffffff, 0.8);
        graphic.beginPath();
        graphic.moveTo(0, 45);
        graphic.lineTo(0, 90);
        graphic.strokePath();

        const text = this.add.text(0, -5, num.toString(), {
            fontFamily: 'Nunito',
            fontSize: '40px',
            fontWeight: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        balloon.add([graphic, text]);
        balloon.numValue = num;

        // Interaksi
        balloon.setSize(90, 110);
        balloon.setInteractive({ useHandCursor: true });

        balloon.on('pointerdown', () => this._popBalloon(balloon, color));

        this.balloons.add(balloon);

        // Animasi melayang ke atas
        const speed = Phaser.Math.Between(4000, 7000); // Variasi kecepatan
        
        this.tweens.add({
            targets: balloon,
            y: -150,
            x: x + Phaser.Math.Between(-100, 100), // Goyang sedikit
            duration: speed,
            ease: 'Sine.inOut',
            onComplete: () => {
                if (balloon.active) balloon.destroy();
            }
        });
    }

    _popBalloon(balloon, color) {
        if (!this.isPlaying || !balloon.active) return;

        const audioManager = this.registry.get('audioManager');

        // Partikel pecah
        const particles = this.add.particles(balloon.x, balloon.y, 'particle', {
            speed: { min: -100, max: 100 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            lifespan: 300,
            quantity: 10
        });
        
        // Bikin grafis temporary untuk warna partikel pecah
        const g = this.add.graphics();
        g.fillStyle(color, 1);
        g.fillCircle(4, 4, 4);
        g.generateTexture(`pop_${color}`, 8, 8);
        g.destroy();
        particles.setTexture(`pop_${color}`);

        if (balloon.numValue === this.targetNumber) {
            // BENAR
            if (audioManager) audioManager.playCorrect();
            this.score++;
            this.scoreText.setText(`⭐ ${this.score} / ${this.targetScore}`);
            
            // Animasi text floating score
            const plus = this.add.text(balloon.x, balloon.y - 20, '+1', {
                fontSize: '30px', color: '#55EFC4', fontWeight: 'bold', stroke: '#000', strokeThickness: 4
            }).setOrigin(0.5);
            this.tweens.add({ targets: plus, y: plus.y - 50, alpha: 0, duration: 800, onComplete: () => plus.destroy() });

            if (this.score >= this.targetScore) {
                this._winGame();
            }
        } else {
            // SALAH
            if (audioManager) audioManager.playWrong();
            
            const minus = this.add.text(balloon.x, balloon.y - 20, 'Oops!', {
                fontSize: '25px', color: '#FF7675', fontWeight: 'bold', stroke: '#000', strokeThickness: 4
            }).setOrigin(0.5);
            this.tweens.add({ targets: minus, y: minus.y - 50, alpha: 0, duration: 800, onComplete: () => minus.destroy() });
        }

        balloon.destroy();
    }

    _winGame() {
        this.isPlaying = false;
        this.spawnTimer.remove();

        // Ledakkan semua sisa balon
        this.balloons.getChildren().forEach(b => {
            this.tweens.add({ targets: b, scale: 0, duration: 200, onComplete: () => b.destroy() });
        });

        const audioManager = this.registry.get('audioManager');
        if (audioManager) audioManager.playCelebrate();

        import('../utils/Confetti.js').then(module => {
            const confetti = new module.Confetti(this);
            confetti.fire();
        });

        setTimeout(() => {
            const panel = this.add.container(this.cameras.main.width/2, this.cameras.main.height/2);
            
            const bg = this.add.graphics();
            bg.fillStyle(0x000000, 0.85);
            bg.fillRoundedRect(-200, -120, 400, 240, 20);
            bg.lineStyle(4, 0x55efc4, 1);
            bg.strokeRoundedRect(-200, -120, 400, 240, 20);
            
            const text = this.add.text(0, -50, 'Selamat!', {
                fontFamily: 'Nunito', fontSize: '36px', color: '#55efc4', fontWeight: '900'
            }).setOrigin(0.5);
            
            const sub = this.add.text(0, 0, 'Kamu hebat berhitung!', {
                fontFamily: 'Nunito', fontSize: '20px', color: '#FFF'
            }).setOrigin(0.5);

            // Tombol Kembali
            const btn = this.add.container(0, 60);
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

            panel.add([bg, text, sub, btn]);
            panel.setScale(0);
            
            this.tweens.add({
                targets: panel,
                scale: 1,
                duration: 500,
                ease: 'Back.easeOut'
            });

        }, 1000);
    }
}
