import { Confetti } from '../utils/Confetti.js';
import { FeedbackPopup } from '../ui/FeedbackPopup.js';
import { ApiClient } from '../utils/ApiClient.js';
import { StarCounter } from '../ui/StarCounter.js';

export class MemoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MemoryScene' });
    }

    init() {
        this.starCount = 0;
        this.totalRounds = 4; // 4 pairs to match
        this.levelCompleted = false;
        
        this.cards = [];
        this.flippedCards = [];
        this.canFlip = true;
        
        // Emojis for the game
        const emojis = ['🐶', '🐱', '🐰', '🐼'];
        this.deck = [...emojis, ...emojis];
        Phaser.Utils.Array.Shuffle(this.deck);
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
        
        this._createCards(width, height);
    }

    _createBackground(width, height) {
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x36D1DC, 0x5B86E5, 0x36D1DC, 0x5B86E5, 1);
        bg.fillRect(0, 0, width, height);
    }

    _createHeader(width, height) {
        this.add.text(width / 2, 35, '🃏 Kartu Memori', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3,
            shadow: { offsetY: 2, color: '#00000044', blur: 4, fill: true }
        }).setOrigin(0.5).setDepth(100);

        this.add.text(width / 2, 70, 'Temukan pasangan kartu yang sama!', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '17px',
            color: '#ffffffaa',
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.starCounter = new StarCounter(this, width - 210, 28, this.totalRounds);
    }

    _createBackButton(width, height) {
        const backBtn = this.add.text(40, 40, '◀ Kembali', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#ffffff',
            backgroundColor: '#00000044',
            padding: { x: 15, y: 10 }
        }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true }).setDepth(100);

        backBtn.on('pointerdown', () => {
            if (this.audioManager) this.audioManager.playPop();
            this.cameras.main.fadeOut(300);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MenuScene');
            });
        });
    }

    _createCards(width, height) {
        const startX = width / 2 - 150;
        const startY = height / 2 - 80;
        const spacingX = 100;
        const spacingY = 130;

        for (let i = 0; i < 8; i++) {
            const row = Math.floor(i / 4);
            const col = i % 4;
            const x = startX + (col * spacingX);
            const y = startY + (row * spacingY);

            const card = this.add.container(x, y);
            
            // Card Back (Tutup)
            const cardBack = this.add.graphics();
            cardBack.fillStyle(0xFF9800, 1);
            cardBack.fillRoundedRect(-40, -55, 80, 110, 10);
            cardBack.lineStyle(4, 0xffffff, 1);
            cardBack.strokeRoundedRect(-40, -55, 80, 110, 10);
            
            const questionMark = this.add.text(0, 0, '❓', { fontSize: '40px' }).setOrigin(0.5);
            const backContainer = this.add.container(0, 0, [cardBack, questionMark]);

            // Card Front (Buka)
            const cardFrontBg = this.add.graphics();
            cardFrontBg.fillStyle(0xffffff, 1);
            cardFrontBg.fillRoundedRect(-40, -55, 80, 110, 10);
            cardFrontBg.lineStyle(4, 0x4CAF50, 1);
            cardFrontBg.strokeRoundedRect(-40, -55, 80, 110, 10);
            
            const emoji = this.add.text(0, 0, this.deck[i], { fontSize: '50px' }).setOrigin(0.5);
            const frontContainer = this.add.container(0, 0, [cardFrontBg, emoji]);
            frontContainer.setScale(0, 1); // Disembunyikan (scale X 0)

            card.add([backContainer, frontContainer]);
            card.setSize(80, 110);
            
            card.isFlipped = false;
            card.emojiValue = this.deck[i];
            card.frontContainer = frontContainer;
            card.backContainer = backContainer;
            
            card.setInteractive({ useHandCursor: true });
            card.on('pointerdown', () => this._flipCard(card));
            
            this.cards.push(card);
            
            // Entrance animation
            card.setScale(0);
            this.tweens.add({
                targets: card,
                scale: 1,
                duration: 300,
                delay: i * 100,
                ease: 'Back.easeOut'
            });
        }
    }

    _flipCard(card) {
        if (!this.canFlip || card.isFlipped) return;
        
        if (this.audioManager) this.audioManager.playPop();
        
        card.isFlipped = true;
        this.flippedCards.push(card);

        // Flip Animation
        this.tweens.add({
            targets: card.backContainer,
            scaleX: 0,
            duration: 150,
            onComplete: () => {
                this.tweens.add({
                    targets: card.frontContainer,
                    scaleX: 1,
                    duration: 150
                });
            }
        });

        if (this.flippedCards.length === 2) {
            this.canFlip = false;
            this.time.delayedCall(800, () => this._checkMatch());
        }
    }

    _checkMatch() {
        const card1 = this.flippedCards[0];
        const card2 = this.flippedCards[1];

        if (card1.emojiValue === card2.emojiValue) {
            // Cocok
            if (this.audioManager) this.audioManager.playCorrect();
            
            this.tweens.add({ targets: [card1, card2], scale: 1.1, duration: 200, yoyo: true });
            const p1 = this.add.text(card1.x, card1.y, '✨', {fontSize:'40px'}).setOrigin(0.5);
            const p2 = this.add.text(card2.x, card2.y, '✨', {fontSize:'40px'}).setOrigin(0.5);
            this.tweens.add({ targets: [p1, p2], y: '-=50', alpha: 0, duration: 800, onComplete: () => { p1.destroy(); p2.destroy(); }});

            this.starCount++;
            this.starCounter.addStar(this.starCount);
            
            this.flippedCards = [];
            this.canFlip = true;
            
            if (this.starCount >= this.totalRounds) {
                this.time.delayedCall(1000, () => this._finishLevel());
            }
        } else {
            // Salah
            if (this.audioManager) this.audioManager.playWrong();
            
            this.tweens.add({
                targets: card1.frontContainer,
                scaleX: 0,
                duration: 150,
                onComplete: () => {
                    card1.isFlipped = false;
                    this.tweens.add({ targets: card1.backContainer, scaleX: 1, duration: 150 });
                }
            });
            
            this.tweens.add({
                targets: card2.frontContainer,
                scaleX: 0,
                duration: 150,
                onComplete: () => {
                    card2.isFlipped = false;
                    this.tweens.add({ targets: card2.backContainer, scaleX: 1, duration: 150 });
                }
            });

            this.flippedCards = [];
            this.canFlip = true;
        }
    }

    async _finishLevel() {
        this.levelCompleted = true;
        if (this.audioManager) this.audioManager.playCelebrate();
        
        Confetti.burst(this, this.cameras.main.centerX, this.cameras.main.centerY);
        
        // Simpan skor (panggil API)
        const currentProfile = this.registry.get('currentProfile');
        const profilId = currentProfile ? currentProfile.id : 0;
        const nama = currentProfile ? currentProfile.nama : 'Tamu';
        
        try {
            await this.apiClient.saveScore(nama, 'memory_1', this.starCount, profilId);
        } catch (e) {
            console.error('Gagal menyimpan skor:', e);
        }

        this.time.delayedCall(500, () => {
            this.feedbackPopup.showLevelComplete();
            this.time.delayedCall(3000, () => {
                this.cameras.main.fadeOut(500);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('MenuScene');
                });
            });
        });
    }
}
