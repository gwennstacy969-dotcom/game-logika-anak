/**
 * ============================================
 * ColorMatchScene — Level: Mengenal Warna
 * ============================================
 * 
 * Anak harus menyortir benda-benda berwarna ke dalam
 * keranjang/kotak yang warnanya cocok.
 * 
 * Multi-tahap: 3 tahap dengan kesulitan naik
 * - Tahap 1: 4 warna dasar, 4 benda (1 per warna)
 * - Tahap 2: 4 warna dasar, 6 benda (beberapa berulang)
 * - Tahap 3: 4 warna dasar, 8 benda (banyak & cepat)
 */
import { StarCounter } from '../ui/StarCounter.js';
import { FeedbackPopup } from '../ui/FeedbackPopup.js';

export class ColorMatchScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ColorMatchScene' });
    }

    init() {
        this.starCount = 0;
        this.currentStage = 0;
        this.totalStages = 3;
        this.matchedInStage = 0;
        this.totalForStage = 0;
        this.levelCompleted = false;

        this.colorDefs = [
            { key: 'red',    hex: 0xFF6B35, name: 'Merah',  cssColor: '#FF6B35' },
            { key: 'green',  hex: 0x4ECB71, name: 'Hijau',  cssColor: '#4ECB71' },
            { key: 'blue',   hex: 0x4A90D9, name: 'Biru',   cssColor: '#4A90D9' },
            { key: 'yellow', hex: 0xFFD93D, name: 'Kuning', cssColor: '#FFD93D' }
        ];
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.fadeIn(500);

        this.audioManager = this.registry.get('audioManager');
        this.feedbackPopup = new FeedbackPopup(this);

        this._createBackground(width, height);
        this._createHeader(width, height);
        this._createBackButton(width, height);

        // Mulai tahap pertama
        this._startStage();
    }

    // ========================================
    // SCENE BUILDING
    // ========================================

    _createBackground(width, height) {
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x1a2a6c, 0x2d1b69, 0xfdbb2d, 0x1a2a6c, 1);
        bg.fillRect(0, 0, width, height);

        const deco = this.add.graphics();
        deco.fillStyle(0xffffff, 0.03);
        deco.fillCircle(width * 0.85, height * 0.2, 180);
        deco.fillCircle(width * 0.15, height * 0.8, 130);
    }

    _createHeader(width, height) {
        this.add.text(width / 2, 35, '🎨 Mengenal Warna!', {
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

        this.stageText = this.add.text(width / 2, height - 30, '', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '16px',
            color: '#ffffffaa',
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // Total bintang = sum semua benda di semua tahap (4 + 6 + 8 = 18)
        // Tapi itu terlalu banyak bintang. Kita pakai bintang per-tahap saja (3 tahap = 3 bintang)
        this.starCounter = new StarCounter(this, width - 210, 28, this.totalStages);
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
    // STAGE SYSTEM
    // ========================================

    _startStage() {
        const { width, height } = this.cameras.main;

        // Bersihkan tahap sebelumnya
        if (this._stageGroup) {
            this._stageGroup.forEach(obj => obj.destroy());
        }
        this._stageGroup = [];
        this.matchedInStage = 0;

        // Jumlah benda per tahap
        const objectCounts = [4, 6, 8];
        this.totalForStage = objectCounts[this.currentStage] || 4;

        // Update UI
        const stageNames = ['Mudah', 'Sedang', 'Sulit'];
        this.instructionText.setText(`Tarik benda ke kotak warna yang sama!`);
        this.stageText.setText(`Tahap ${this.currentStage + 1} / ${this.totalStages} — ${stageNames[this.currentStage]}`);

        // Buat drop zones (kotak warna)
        this._createDropZones(width, height);

        // Buat benda-benda berwarna
        this._createColorObjects(width, height);

        // Setup drag
        this._setupDragEvents();
    }

    _createDropZones(width, height) {
        this.dropZones = [];

        const positions = [
            { x: width * 0.62, y: height * 0.28 },
            { x: width * 0.82, y: height * 0.28 },
            { x: width * 0.62, y: height * 0.62 },
            { x: width * 0.82, y: height * 0.62 }
        ];

        this.colorDefs.forEach((cData, index) => {
            const pos = positions[index];

            // Kotak dengan border berwarna
            const box = this.add.graphics();
            box.fillStyle(cData.hex, 0.15);
            box.fillRoundedRect(pos.x - 55, pos.y - 55, 110, 110, 16);
            box.lineStyle(5, cData.hex, 0.8);
            box.strokeRoundedRect(pos.x - 55, pos.y - 55, 110, 110, 16);
            box.setDepth(5);
            this._stageGroup.push(box);

            // Label nama warna
            const label = this.add.text(pos.x, pos.y + 70, cData.name, {
                fontFamily: 'Nunito, sans-serif',
                fontSize: '17px',
                fontStyle: 'bold',
                color: cData.cssColor
            }).setOrigin(0.5).setDepth(5);
            this._stageGroup.push(label);

            // Counter di dalam kotak
            const counter = this.add.text(pos.x, pos.y, '0', {
                fontFamily: 'Nunito, sans-serif',
                fontSize: '28px',
                fontStyle: 'bold',
                color: '#ffffff'
            }).setOrigin(0.5).setAlpha(0.3).setDepth(6);
            this._stageGroup.push(counter);

            // Pulse animasi
            this.tweens.add({
                targets: box,
                alpha: { from: 0.7, to: 1 },
                duration: 1200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.dropZones.push({
                x: pos.x,
                y: pos.y,
                colorKey: cData.key,
                hex: cData.hex,
                count: 0,
                counterText: counter
            });
        });

        // Label area target
        this.add.text((positions[0].x + positions[1].x) / 2, positions[0].y - 80, '📥 Kotak Warna', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#ffffffaa'
        }).setOrigin(0.5).setDepth(50);
    }

    _createColorObjects(width, height) {
        this.draggables = [];

        // Buat array warna sesuai jumlah benda
        const colorList = [];
        for (let i = 0; i < this.totalForStage; i++) {
            colorList.push(this.colorDefs[i % this.colorDefs.length]);
        }
        Phaser.Utils.Array.Shuffle(colorList);

        // Bentuk-bentuk acak
        const shapeTypes = ['circle', 'square', 'triangle', 'diamond'];

        // Posisi di sisi kiri
        const cols = Math.min(colorList.length, 3);
        const rows = Math.ceil(colorList.length / cols);
        const startX = width * 0.08;
        const startY = 115;
        const cellW = (width * 0.42) / cols;
        const cellH = (height * 0.75) / rows;

        colorList.forEach((cData, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = startX + col * cellW + cellW / 2;
            const y = startY + row * cellH + cellH / 2;

            const container = this.add.container(x, y);
            container.setDepth(20);

            const graphic = this.add.graphics();
            const shapeType = shapeTypes[index % shapeTypes.length];
            const size = 32;

            // Gambar bentuk sesuai tipe
            switch (shapeType) {
                case 'circle':
                    graphic.fillStyle(cData.hex, 1);
                    graphic.fillCircle(0, 0, size);
                    graphic.lineStyle(3, 0xffffff, 0.3);
                    graphic.strokeCircle(0, 0, size);
                    break;
                case 'square':
                    graphic.fillStyle(cData.hex, 1);
                    graphic.fillRoundedRect(-size, -size, size * 2, size * 2, 6);
                    graphic.lineStyle(3, 0xffffff, 0.3);
                    graphic.strokeRoundedRect(-size, -size, size * 2, size * 2, 6);
                    break;
                case 'triangle':
                    graphic.fillStyle(cData.hex, 1);
                    graphic.fillTriangle(0, -size, -size, size, size, size);
                    graphic.lineStyle(3, 0xffffff, 0.3);
                    graphic.strokeTriangle(0, -size, -size, size, size, size);
                    break;
                case 'diamond':
                    graphic.fillStyle(cData.hex, 1);
                    graphic.fillPoints([
                        new Phaser.Geom.Point(0, -size),
                        new Phaser.Geom.Point(size * 0.7, 0),
                        new Phaser.Geom.Point(0, size),
                        new Phaser.Geom.Point(-size * 0.7, 0)
                    ], true);
                    graphic.lineStyle(3, 0xffffff, 0.3);
                    graphic.strokePoints([
                        new Phaser.Geom.Point(0, -size),
                        new Phaser.Geom.Point(size * 0.7, 0),
                        new Phaser.Geom.Point(0, size),
                        new Phaser.Geom.Point(-size * 0.7, 0)
                    ], true);
                    break;
            }

            container.add(graphic);

            // Hit area
            const hitSize = size * 2.5;
            container.setSize(hitSize, hitSize);
            container.setInteractive({
                hitArea: new Phaser.Geom.Rectangle(-hitSize / 2, -hitSize / 2, hitSize, hitSize),
                hitAreaCallback: Phaser.Geom.Rectangle.Contains,
                useHandCursor: true
            });
            this.input.setDraggable(container);

            container.colorKey = cData.key;
            container.colorHex = cData.hex;
            container.originalX = x;
            container.originalY = y;
            container.isPlaced = false;

            // Animasi masuk
            container.setScale(0);
            this.tweens.add({
                targets: container,
                scaleX: 1, scaleY: 1,
                duration: 350,
                delay: 200 + index * 100,
                ease: 'Back.easeOut'
            });

            // Idle wobble
            this.tweens.add({
                targets: container,
                angle: { from: -3, to: 3 },
                duration: Phaser.Math.Between(1800, 2500),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: Phaser.Math.Between(0, 800)
            });

            this.draggables.push(container);
            this._stageGroup.push(container);
        });
    }

    // ========================================
    // DRAG & DROP
    // ========================================

    _setupDragEvents() {
        this.input.off('dragstart');
        this.input.off('drag');
        this.input.off('dragend');

        this.input.on('dragstart', (pointer, gameObject) => {
            if (gameObject.isPlaced || this.levelCompleted) return;
            gameObject.setDepth(100);
            this.tweens.killTweensOf(gameObject);
            gameObject.angle = 0;
            this.tweens.add({ targets: gameObject, scaleX: 1.2, scaleY: 1.2, duration: 100 });
            if (this.audioManager) this.audioManager.playSnap();
        });

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (gameObject.isPlaced || this.levelCompleted) return;
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('dragend', (pointer, gameObject) => {
            if (gameObject.isPlaced || this.levelCompleted) return;
            gameObject.setDepth(20);
            this.tweens.add({ targets: gameObject, scaleX: 1, scaleY: 1, duration: 100 });

            // Cek drop zone terdekat
            let matchedZone = null;
            let minDist = Infinity;
            for (const zone of this.dropZones) {
                const dist = Phaser.Math.Distance.Between(gameObject.x, gameObject.y, zone.x, zone.y);
                if (dist < 70 && dist < minDist) {
                    minDist = dist;
                    matchedZone = zone;
                }
            }

            if (matchedZone) {
                if (matchedZone.colorKey === gameObject.colorKey) {
                    this._handleCorrect(gameObject, matchedZone);
                } else {
                    this._handleWrong(gameObject);
                }
            } else {
                this.tweens.add({
                    targets: gameObject,
                    x: gameObject.originalX, y: gameObject.originalY,
                    duration: 300,
                    ease: 'Back.easeOut',
                    onComplete: () => {
                        // Restart idle wobble
                        this.tweens.add({
                            targets: gameObject,
                            angle: { from: -3, to: 3 },
                            duration: 2000,
                            yoyo: true, repeat: -1,
                            ease: 'Sine.easeInOut'
                        });
                    }
                });
            }
        });
    }

    // ========================================
    // MATCH HANDLING
    // ========================================

    _handleCorrect(gameObject, zone) {
        gameObject.isPlaced = true;
        this.input.setDraggable(gameObject, false);
        this.tweens.killTweensOf(gameObject);

        // Snap ke kotak
        this.tweens.add({
            targets: gameObject,
            x: zone.x, y: zone.y,
            scaleX: 0.6, scaleY: 0.6,
            angle: 0,
            duration: 250,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets: gameObject,
                    scaleX: 0.7, scaleY: 0.7,
                    duration: 120, yoyo: true
                });
            }
        });

        // Update counter
        zone.count++;
        zone.counterText.setText(zone.count.toString());
        zone.counterText.setAlpha(0.6);

        // Audio & feedback
        if (this.audioManager) {
            this.audioManager.playCorrect();
            this.time.delayedCall(200, () => {
                if (this.audioManager) this.audioManager.playStar();
            });
        }
        this.feedbackPopup.showCorrect(zone.x, zone.y);

        // Partikel
        this._createParticleBurst(zone.x, zone.y, zone.hex);

        this.matchedInStage++;

        // Cek apakah tahap selesai
        if (this.matchedInStage >= this.totalForStage) {
            // Bintang per tahap
            this.starCount++;
            this.starCounter.addStar();
            this.currentStage++;

            if (this.currentStage >= this.totalStages) {
                this.time.delayedCall(1200, () => this._handleLevelComplete());
            } else {
                // Transisi ke tahap berikutnya
                this.time.delayedCall(1500, () => {
                    // Flash transisi
                    const flash = this.add.graphics();
                    flash.fillStyle(0xffffff, 0.3);
                    flash.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
                    flash.setDepth(400).setAlpha(0);

                    this.tweens.add({
                        targets: flash,
                        alpha: 1,
                        duration: 200,
                        yoyo: true,
                        onComplete: () => {
                            flash.destroy();
                            this._startStage();
                        }
                    });
                });
            }
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
            yoyo: true, repeat: 2,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                this.tweens.add({
                    targets: gameObject,
                    x: gameObject.originalX, y: gameObject.originalY,
                    duration: 400,
                    ease: 'Back.easeOut',
                    onComplete: () => {
                        this.tweens.add({
                            targets: gameObject,
                            angle: { from: -3, to: 3 },
                            duration: 2000,
                            yoyo: true, repeat: -1,
                            ease: 'Sine.easeInOut'
                        });
                    }
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

        this.instructionText.setText('🎉 Kamu sudah kenal semua warna! Hebat!');
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

            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0, scaleX: 0.2, scaleY: 0.2,
                duration: Phaser.Math.Between(400, 700),
                ease: 'Cubic.easeOut',
                onComplete: () => particle.destroy()
            });
        }
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
