import { Confetti } from '../utils/Confetti.js';
import { FeedbackPopup } from '../ui/FeedbackPopup.js';
import { ApiClient } from '../utils/ApiClient.js';
import { StarCounter } from '../ui/StarCounter.js';

export class PatternScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PatternScene' });
    }

    init() {
        this.starCount = 0;
        this.totalRounds = 4;
        this.currentRound = 0;
        this.levelCompleted = false;
        
        // Pola-pola yang bisa digunakan (misalnya warna bulat, persegi, dsb)
        this.shapes = ['🔴', '🔵', '🟢', '🟡'];
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.fadeIn(500);

        this.audioManager = this.registry.get('audioManager');
        this.feedbackPopup = new FeedbackPopup(this);
        this.apiClient = new ApiClient();

        this._createBackground(width, height);
        this._createHeader(width, height);
        this._createBackButton(width, height);
        
        this._startRound(width, height);
    }

    _createBackground(width, height) {
        const bg = this.add.graphics();
        bg.fillGradientStyle(0xFF758C, 0xFF7EB3, 0xFF758C, 0xFF7EB3, 1);
        bg.fillRect(0, 0, width, height);
    }

    _createHeader(width, height) {
        this.add.text(width / 2, 35, '🔄 Tebak Pola', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3,
            shadow: { offsetY: 2, color: '#00000044', blur: 4, fill: true }
        }).setOrigin(0.5).setDepth(100);

        this.add.text(width / 2, 70, 'Lengkapi polanya dengan menarik objek yang tepat!', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '17px',
            color: '#ffffffaa',
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.starCounter = new StarCounter(this, width - 210, 28, this.totalRounds);
    }

    _createBackButton(width, height) {
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
        
        backBtn.on('pointerover', () => {
            this.tweens.add({ targets: backBtn, scale: 1.1, duration: 100 });
        });
        backBtn.on('pointerout', () => {
            this.tweens.add({ targets: backBtn, scale: 1, duration: 100 });
        });
    }

    _startRound(width, height) {
        if (this.patternGroup) this.patternGroup.destroy(true);
        if (this.optionsGroup) this.optionsGroup.destroy(true);

        this.patternGroup = this.add.group();
        this.optionsGroup = this.add.group();

        // Buat pola sederhana ABAB atau AABB
        Phaser.Utils.Array.Shuffle(this.shapes);
        const shapeA = this.shapes[0];
        const shapeB = this.shapes[1];
        
        let pattern = [];
        if (this.currentRound % 2 === 0) {
            pattern = [shapeA, shapeB, shapeA, shapeB, shapeA];
            this.correctAnswer = shapeB;
        } else {
            pattern = [shapeA, shapeA, shapeB, shapeB, shapeA, shapeA];
            this.correctAnswer = shapeB;
        }

        // Tampilkan pola
        const startX = width / 2 - ((pattern.length * 80) / 2) + 20;
        const startY = height * 0.4;
        
        for (let i = 0; i < pattern.length; i++) {
            const item = this.add.text(startX + (i * 80), startY, pattern[i], { fontSize: '60px' }).setOrigin(0.5);
            this.patternGroup.add(item);
            
            item.setScale(0);
            this.tweens.add({
                targets: item,
                scale: 1,
                duration: 400,
                delay: i * 150,
                ease: 'Back.easeOut'
            });
        }
        
        // Target (Kotak Kosong)
        const targetX = startX + (pattern.length * 80);
        const targetY = startY;
        const targetBox = this.add.graphics();
        targetBox.lineStyle(4, 0xffffff, 1);
        targetBox.strokeRoundedRect(targetX - 40, targetY - 40, 80, 80, 10);
        this.patternGroup.add(targetBox);
        
        const questionMark = this.add.text(targetX, targetY, '❓', { fontSize: '40px' }).setOrigin(0.5);
        this.patternGroup.add(questionMark);
        
        // Pilihan Jawaban
        let options = [this.correctAnswer, this.shapes[2], this.shapes[3]];
        Phaser.Utils.Array.Shuffle(options);
        
        const optStartX = width / 2 - 100;
        const optStartY = height * 0.75;
        
        this.input.off('dragstart');
        this.input.off('drag');
        this.input.off('dragend');

        options.forEach((opt, index) => {
            const x = optStartX + (index * 100);
            const optText = this.add.text(x, optStartY, opt, { fontSize: '70px' }).setOrigin(0.5);
            optText.setInteractive({ useHandCursor: true });
            this.input.setDraggable(optText);
            
            optText.originalX = x;
            optText.originalY = optStartY;
            optText.optValue = opt;
            
            this.optionsGroup.add(optText);
        });

        // Drag Events
        this.input.on('dragstart', (pointer, gameObject) => {
            gameObject.setDepth(100);
            this.tweens.add({ targets: gameObject, scale: 1.2, duration: 100 });
            if (this.audioManager) this.audioManager.playPop();
        });

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('dragend', (pointer, gameObject) => {
            gameObject.setDepth(1);
            this.tweens.add({ targets: gameObject, scale: 1, duration: 100 });

            const dist = Phaser.Math.Distance.Between(gameObject.x, gameObject.y, targetX, targetY);
            if (dist < 60) {
                if (gameObject.optValue === this.correctAnswer) {
                    this._handleCorrect(gameObject, targetX, targetY, questionMark);
                } else {
                    this._handleWrong(gameObject);
                }
            } else {
                this.tweens.add({ targets: gameObject, x: gameObject.originalX, y: gameObject.originalY, duration: 300, ease: 'Back.easeOut' });
            }
        });
    }

    _handleCorrect(gameObject, bx, by, questionMark) {
        this.input.off('dragstart');
        this.input.off('drag');
        this.input.off('dragend');
        
        questionMark.destroy();
        gameObject.x = bx;
        gameObject.y = by;
        
        if (this.audioManager) this.audioManager.playCorrect();
        
        this.starCount++;
        this.starCounter.addStar(this.starCount);
        this.currentRound++;

        const particle = this.add.text(bx, by, '✨', {fontSize:'60px'}).setOrigin(0.5);
        this.tweens.add({
            targets: particle,
            y: by - 100,
            alpha: 0,
            duration: 800,
            onComplete: () => particle.destroy()
        });

        if (this.currentRound >= this.totalRounds) {
            this.time.delayedCall(1000, () => this._finishLevel());
        } else {
            this.time.delayedCall(1500, () => this._startRound(this.cameras.main.width, this.cameras.main.height));
        }
    }

    _handleWrong(gameObject) {
        if (this.audioManager) this.audioManager.playWrong();
        this.tweens.add({
            targets: gameObject,
            x: gameObject.originalX,
            y: gameObject.originalY,
            duration: 500,
            ease: 'Back.easeOut'
        });
        
        const cross = this.add.text(gameObject.x, gameObject.y, '❌', {fontSize:'40px'}).setOrigin(0.5);
        this.tweens.add({ targets: cross, alpha: 0, y: cross.y - 50, duration: 800, onComplete: () => cross.destroy()});
    }

    async _finishLevel() {
        this.levelCompleted = true;
        if (this.audioManager) this.audioManager.playCelebrate();
        
        Confetti.burst(this, this.cameras.main.centerX, this.cameras.main.centerY);
        
        // Simpan skor
        const currentProfile = this.registry.get('currentProfile');
        const profilId = currentProfile ? currentProfile.id : 0;
        const nama = currentProfile ? currentProfile.nama : 'Tamu';
        
        try {
            await this.apiClient.saveScore(nama, 'pattern_1', this.starCount, profilId);
        } catch (e) {
            console.error('Gagal menyimpan skor:', e);
        }

        this.time.delayedCall(500, () => {
            this.feedbackPopup.showLevelComplete();
            // Fallback for custom popup finish
            this.time.delayedCall(3000, () => {
                this.cameras.main.fadeOut(500);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('MenuScene');
                });
            });
        });
    }
}
