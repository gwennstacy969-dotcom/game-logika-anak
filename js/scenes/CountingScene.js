/**
 * ============================================
 * CountingScene — Level: Menghitung Objek
 * ============================================
 * 
 * Anak harus menghitung objek di layar lalu menarik
 * angka yang benar ke zona target.
 * 
 * Multi-tahap: 5 ronde dengan tingkat kesulitan naik
 * - Ronde 1-2: 1-3 objek (mudah)
 * - Ronde 3-4: 3-6 objek (sedang)
 * - Ronde 5: 5-9 objek (sulit)
 */
import { StarCounter } from '../ui/StarCounter.js';
import { FeedbackPopup } from '../ui/FeedbackPopup.js';

export class CountingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CountingScene' });
    }

    init() {
        this.starCount = 0;
        this.totalRounds = 5;
        this.currentRound = 0;
        this.levelCompleted = false;
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.fadeIn(500);

        this.audioManager = this.registry.get('audioManager');
        this.feedbackPopup = new FeedbackPopup(this);

        this._createBackground(width, height);
        this._createHeader(width, height);
        this._createBackButton(width, height);

        // Mulai ronde pertama
        this._startRound();
    }

    // ========================================
    // SCENE BUILDING
    // ========================================

    _createBackground(width, height) {
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x764ba2, 0x667eea, 0x8b5fbf, 0x5b6abf, 1);
        bg.fillRect(0, 0, width, height);

        // Dekorasi
        const deco = this.add.graphics();
        deco.fillStyle(0xffffff, 0.03);
        deco.fillCircle(width * 0.1, height * 0.3, 150);
        deco.fillCircle(width * 0.9, height * 0.7, 120);
    }

    _createHeader(width, height) {
        this.add.text(width / 2, 35, '🔢 Menghitung Objek!', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3,
            shadow: { offsetY: 2, color: '#00000044', blur: 4, fill: true }
        }).setOrigin(0.5).setDepth(100);

        this.instructionText = this.add.text(width / 2, 70, '', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '17px',
            color: '#ffffffaa',
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // Progress ronde
        this.roundText = this.add.text(width / 2, height - 30, '', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '16px',
            color: '#ffffffaa',
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.starCounter = new StarCounter(this, width - 270, 28, this.totalRounds);
    }

    _createBackButton(width, height) {
        const btnContainer = this.add.container(60, height - 35);
        btnContainer.setDepth(200);

        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.3);
        bg.fillRoundedRect(-45, -18, 90, 36, 18);
        btnContainer.add(bg);

        const label = this.add.text(0, 0, '◀ Menu', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#ffffffcc'
        }).setOrigin(0.5);
        btnContainer.add(label);

        btnContainer.setSize(100, 44);
        btnContainer.setInteractive(
            new Phaser.Geom.Rectangle(-50, -22, 100, 44),
            Phaser.Geom.Rectangle.Contains
        );

        btnContainer.on('pointerdown', () => {
            if (this.audioManager) this.audioManager.playPop();
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MenuScene');
            });
        });
    }

    // ========================================
    // RONDE SYSTEM
    // ========================================

    _startRound() {
        const { width, height } = this.cameras.main;

        // Bersihkan ronde sebelumnya
        if (this._roundGroup) {
            this._roundGroup.forEach(obj => obj.destroy());
        }
        this._roundGroup = [];

        // Tingkat kesulitan berdasarkan ronde
        let minCount, maxCount;
        if (this.currentRound < 2) {
            minCount = 1; maxCount = 3;   // Mudah
        } else if (this.currentRound < 4) {
            minCount = 3; maxCount = 6;   // Sedang
        } else {
            minCount = 5; maxCount = 9;   // Sulit
        }

        this.correctAnswer = Phaser.Math.Between(minCount, maxCount);

        // Update instruksi
        const emojis = ['🍎', '🍊', '🍋', '🍇', '🍓', '🌟', '🎈', '🐱', '🐶'];
        this.currentEmoji = emojis[this.currentRound % emojis.length];
        this.instructionText.setText(`Hitung ${this.currentEmoji} nya, lalu tarik angka yang benar ke kotak!`);
        this.roundText.setText(`Ronde ${this.currentRound + 1} / ${this.totalRounds}`);

        // Tampilkan objek-objek untuk dihitung
        this._createCountableObjects(width, height);

        // Buat zona target
        this._createTargetZone(width, height);

        // Buat pilihan angka
        this._createNumberChoices(width, height);

        // Setup drag events
        this._setupDragEvents();
    }

    _createCountableObjects(width, height) {
        const count = this.correctAnswer;
        const areaX = width * 0.08;
        const areaY = 110;
        const areaW = width * 0.55;
        const areaH = height * 0.45;

        // Grid layout agar rapi
        const cols = Math.min(count, 5);
        const rows = Math.ceil(count / cols);
        const cellW = areaW / cols;
        const cellH = areaH / rows;

        for (let i = 0; i < count; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = areaX + col * cellW + cellW / 2 + Phaser.Math.Between(-10, 10);
            const y = areaY + row * cellH + cellH / 2 + Phaser.Math.Between(-10, 10);

            const obj = this.add.text(x, y, this.currentEmoji, {
                fontSize: '52px'
            }).setOrigin(0.5).setDepth(10);

            // Animasi masuk
            obj.setScale(0);
            this.tweens.add({
                targets: obj,
                scaleX: 1, scaleY: 1,
                duration: 350,
                delay: i * 120,
                ease: 'Back.easeOut'
            });

            this._roundGroup.push(obj);
        }
    }

    _createTargetZone(width, height) {
        const zoneX = width * 0.78;
        const zoneY = height * 0.35;

        // Kotak target
        const box = this.add.graphics();
        box.lineStyle(5, 0xFFD93D, 0.8);
        box.strokeRoundedRect(zoneX - 65, zoneY - 65, 130, 130, 18);
        box.fillStyle(0x000000, 0.2);
        box.fillRoundedRect(zoneX - 65, zoneY - 65, 130, 130, 18);
        box.setDepth(5);
        this._roundGroup.push(box);

        // Label
        const label = this.add.text(zoneX, zoneY + 85, '📥 Letakkan di sini', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '15px',
            fontStyle: 'bold',
            color: '#ffffffaa'
        }).setOrigin(0.5).setDepth(5);
        this._roundGroup.push(label);

        // Tanda tanya di dalam kotak
        const qMark = this.add.text(zoneX, zoneY, '?', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '56px',
            fontStyle: 'bold',
            color: '#FFD93D'
        }).setOrigin(0.5).setAlpha(0.4).setDepth(6);
        this._roundGroup.push(qMark);

        // Pulse animasi
        this.tweens.add({
            targets: [box, qMark],
            alpha: { from: 0.4, to: 0.9 },
            scaleX: { from: 0.98, to: 1.02 },
            scaleY: { from: 0.98, to: 1.02 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this._targetX = zoneX;
        this._targetY = zoneY;
    }

    _createNumberChoices(width, height) {
        // Buat opsi angka (selalu 4 pilihan)
        const options = [this.correctAnswer];
        while (options.length < 4) {
            const r = Phaser.Math.Between(1, 9);
            if (!options.includes(r)) options.push(r);
        }
        Phaser.Utils.Array.Shuffle(options);

        const startY = height * 0.62;
        const spacing = 120;
        const startX = width * 0.5 - ((options.length - 1) * spacing) / 2;

        this._draggables = [];

        options.forEach((num, index) => {
            const x = startX + index * spacing;
            const y = startY + 50;

            const container = this.add.container(x, y);
            container.setDepth(20);

            // Kotak angka berwarna
            const colors = [0xFF6B35, 0x4ECB71, 0x4A90D9, 0xE84393];
            const bg = this.add.graphics();
            bg.fillStyle(colors[index], 1);
            bg.fillRoundedRect(-40, -40, 80, 80, 14);
            bg.lineStyle(3, 0xffffff, 0.3);
            bg.strokeRoundedRect(-40, -40, 80, 80, 14);
            container.add(bg);

            const txt = this.add.text(0, 0, num.toString(), {
                fontFamily: 'Nunito, sans-serif',
                fontSize: '38px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);
            container.add(txt);

            container.setSize(90, 90);
            container.setInteractive({
                hitArea: new Phaser.Geom.Rectangle(-45, -45, 90, 90),
                hitAreaCallback: Phaser.Geom.Rectangle.Contains,
                useHandCursor: true
            });
            this.input.setDraggable(container);

            container.numValue = num;
            container.originalX = x;
            container.originalY = y;
            container.bgGraphics = bg;
            container.bgColor = colors[index];

            // Animasi masuk
            container.setScale(0);
            this.tweens.add({
                targets: container,
                scaleX: 1, scaleY: 1,
                duration: 350,
                delay: 400 + index * 100,
                ease: 'Back.easeOut'
            });

            this._draggables.push(container);
            this._roundGroup.push(container);
        });
    }

    // ========================================
    // DRAG & DROP
    // ========================================

    _setupDragEvents() {
        // Bersihkan event lama
        this.input.off('dragstart');
        this.input.off('drag');
        this.input.off('dragend');

        this.input.on('dragstart', (pointer, gameObject) => {
            if (this.levelCompleted) return;
            gameObject.setDepth(100);
            this.tweens.add({ targets: gameObject, scaleX: 1.15, scaleY: 1.15, duration: 100 });
            if (this.audioManager) this.audioManager.playSnap();
        });

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (this.levelCompleted) return;
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('dragend', (pointer, gameObject) => {
            if (this.levelCompleted) return;
            gameObject.setDepth(20);
            this.tweens.add({ targets: gameObject, scaleX: 1, scaleY: 1, duration: 100 });

            const dist = Phaser.Math.Distance.Between(
                gameObject.x, gameObject.y,
                this._targetX, this._targetY
            );

            if (dist < 80) {
                if (gameObject.numValue === this.correctAnswer) {
                    this._handleCorrect(gameObject);
                } else {
                    this._handleWrong(gameObject);
                }
            } else {
                // Bounce back
                this.tweens.add({
                    targets: gameObject,
                    x: gameObject.originalX, y: gameObject.originalY,
                    duration: 300,
                    ease: 'Back.easeOut'
                });
            }
        });
    }

    // ========================================
    // MATCH HANDLING
    // ========================================

    _handleCorrect(gameObject) {
        // Disable semua drag
        this._draggables.forEach(d => {
            if (d !== gameObject) {
                this.input.setDraggable(d, false);
            }
        });

        // Snap ke target
        this.tweens.add({
            targets: gameObject,
            x: this._targetX, y: this._targetY,
            scaleX: 1.2, scaleY: 1.2,
            duration: 200,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets: gameObject,
                    scaleX: 1, scaleY: 1,
                    duration: 150
                });
            }
        });

        // Audio & feedback
        if (this.audioManager) {
            this.audioManager.playCorrect();
            this.time.delayedCall(200, () => {
                if (this.audioManager) this.audioManager.playStar();
            });
        }
        this.feedbackPopup.showCorrect(this._targetX, this._targetY);

        // Partikel
        this._createParticleBurst(this._targetX, this._targetY, gameObject.bgColor);

        // Bintang
        this.starCount++;
        this.starCounter.addStar();
        this.currentRound++;

        // Lanjut ke ronde berikutnya atau selesai
        if (this.currentRound >= this.totalRounds) {
            this.time.delayedCall(1200, () => this._handleLevelComplete());
        } else {
            this.time.delayedCall(1500, () => this._startRound());
        }
    }

    _handleWrong(gameObject) {
        if (this.audioManager) this.audioManager.playWrong();
        this.feedbackPopup.showTryAgain(gameObject.x, gameObject.y);

        // Shake + bounce back
        this.tweens.add({
            targets: gameObject,
            x: gameObject.x + 12,
            duration: 50,
            yoyo: true,
            repeat: 2,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                this.tweens.add({
                    targets: gameObject,
                    x: gameObject.originalX, y: gameObject.originalY,
                    duration: 400,
                    ease: 'Back.easeOut'
                });
            }
        });
    }

    // ========================================
    // LEVEL COMPLETE
    // ========================================

    _handleLevelComplete() {
        this.levelCompleted = true;
        if (this.audioManager) this.audioManager.playCelebrate();

        this._createConfettiRain();

        this.time.delayedCall(300, () => {
            this.feedbackPopup.showLevelComplete();
        });

        this.instructionText.setText('🎉 Kamu pintar menghitung! Hebat!');
        this.instructionText.setStyle({ color: '#FFD700' });
    }

    // ========================================
    // VISUAL EFFECTS
    // ========================================

    _createParticleBurst(x, y, color) {
        const particleCount = 10;
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = Phaser.Math.Between(60, 130);
            const size = Phaser.Math.Between(3, 8);

            const particle = this.add.graphics();
            particle.fillStyle(color, 1);
            particle.fillCircle(0, 0, size);
            particle.setPosition(x, y);
            particle.setDepth(150);

            const targetX = x + Math.cos(angle) * speed;
            const targetY = y + Math.sin(angle) * speed;

            this.tweens.add({
                targets: particle,
                x: targetX, y: targetY,
                alpha: 0, scaleX: 0.2, scaleY: 0.2,
                duration: Phaser.Math.Between(400, 700),
                ease: 'Cubic.easeOut',
                onComplete: () => particle.destroy()
            });
        }

        const sparkle = this.add.text(x, y, '✨', { fontSize: '32px' })
            .setOrigin(0.5).setDepth(151).setScale(0);

        this.tweens.add({
            targets: sparkle,
            scaleX: 1.5, scaleY: 1.5,
            alpha: 0, y: y - 40, angle: 360,
            duration: 600,
            ease: 'Cubic.easeOut',
            onComplete: () => sparkle.destroy()
        });
    }

    _createConfettiRain() {
        const { width } = this.cameras.main;
        const colors = [0xFF6B35, 0x4ECB71, 0x4A90D9, 0xFFD93D, 0xE84393, 0x00CEC9];

        for (let i = 0; i < 35; i++) {
            const x = Phaser.Math.Between(20, width - 20);
            const delay = Phaser.Math.Between(0, 1500);
            const color = Phaser.Math.RND.pick(colors);
            const size = Phaser.Math.Between(4, 8);

            const confetti = this.add.graphics();
            confetti.fillStyle(color, 1);
            if (Math.random() > 0.5) {
                confetti.fillRect(-size / 2, -size / 2, size, size * 1.5);
            } else {
                confetti.fillCircle(0, 0, size / 2);
            }
            confetti.setPosition(x, -20);
            confetti.setDepth(250);

            this.tweens.add({
                targets: confetti,
                y: 750,
                x: x + Phaser.Math.Between(-60, 60),
                angle: Phaser.Math.Between(180, 720),
                duration: Phaser.Math.Between(1500, 3000),
                delay: delay,
                ease: 'Sine.easeIn',
                onComplete: () => confetti.destroy()
            });
        }
    }
}
