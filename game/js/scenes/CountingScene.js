import { StarCounter } from '../ui/StarCounter.js';
import { FeedbackPopup } from '../ui/FeedbackPopup.js';
import { Confetti } from '../utils/Confetti.js';
import { ApiClient } from '../utils/ApiClient.js';

export class CountingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CountingScene' });
    }

    init() {
        this.starCount = 0;
        this.totalRounds = 5; 
        this.currentRound = 0;
        this.score = 0; // Tambah skor
        this.levelCompleted = false;
        this.draggableNumbers = [];
        this.fruits = ['🍎', '🍌', '🍊', '🍉', '🍇'];
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
        bg.fillGradientStyle(0x764ba2, 0x667eea, 0x8b5fbf, 0x5b6abf, 1);
        bg.fillRect(0, 0, width, height);
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

        this.add.text(width / 2, 70, 'Hitung buahnya dan tarik angka yang benar ke keranjang!', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '17px',
            color: '#ffffffaa',
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.starCounter = new StarCounter(this, width - 210, 28, this.totalRounds);
        
        // Tampilkan Skor
        this.scoreText = this.add.text(width - 400, 20, 'Skor: 0', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 3
        }).setDepth(100);
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

    _startRound(width, height) {
        if (this.objectsGroup) this.objectsGroup.destroy(true);
        if (this.numbersGroup) this.numbersGroup.destroy(true);
        if (this.basketGroup) this.basketGroup.destroy(true);

        this.objectsGroup = this.add.group();
        this.numbersGroup = this.add.group();
        this.basketGroup = this.add.group();

        // Progressive Difficulty
        if (this.currentRound < 2) {
            this.correctAnswer = Phaser.Math.Between(1, 3);
        } else if (this.currentRound < 4) {
            this.correctAnswer = Phaser.Math.Between(4, 6);
        } else {
            this.correctAnswer = Phaser.Math.Between(7, 9);
        }
        
        // Pilih buah acak
        const currentFruit = Phaser.Math.RND.pick(this.fruits);
        
        // Timer untuk bonus (mulai hitung)
        this.roundStartTime = this.time.now;

        // Draw Basket
        const basketX = width * 0.75;
        const basketY = height * 0.6;
        const basket = this.add.text(basketX, basketY, '🧺', { fontSize: '100px' }).setOrigin(0.5);
        this.basketGroup.add(basket);

        // Draw Fruits
        const startX = width * 0.25 - ((this.correctAnswer - 1) * 40);
        for (let i = 0; i < this.correctAnswer; i++) {
            // Posisi agak diacak agar tidak terlalu lurus
            const offsetX = Phaser.Math.Between(-10, 10);
            const offsetY = Phaser.Math.Between(-15, 15);
            const fruit = this.add.text(startX + (i * 80) + offsetX, height * 0.4 + offsetY, currentFruit, { fontSize: '60px' }).setOrigin(0.5);
            this.objectsGroup.add(fruit);
            
            // Pop animation
            fruit.setScale(0);
            this.tweens.add({
                targets: fruit,
                scale: 1,
                duration: 400,
                delay: i * 150,
                ease: 'Back.easeOut'
            });
        }

        // Draw Number Options
        const options = [this.correctAnswer];
        while(options.length < 4) {
            const r = Phaser.Math.Between(1, 9);
            if (!options.includes(r)) options.push(r);
        }
        Phaser.Utils.Array.Shuffle(options);

        options.forEach((num, index) => {
            const x = width * 0.15 + (index * 150);
            const y = height * 0.8;
            
            const numContainer = this.add.container(x, y);
            const bg = this.add.graphics();
            bg.fillStyle(0x4A90D9, 1);
            bg.fillRoundedRect(-45, -45, 90, 90, 15);
            bg.lineStyle(3, 0xffffff, 1);
            bg.strokeRoundedRect(-45, -45, 90, 90, 15);
            
            const txt = this.add.text(0, 0, num.toString(), {
                fontFamily: 'Nunito, sans-serif',
                fontSize: '40px',
                fontStyle: 'bold',
                color: '#ffffff'
            }).setOrigin(0.5);
            
            numContainer.add([bg, txt]);
            numContainer.setSize(90, 90);
            numContainer.setInteractive({ useHandCursor: true });
            this.input.setDraggable(numContainer);
            
            numContainer.numValue = num;
            numContainer.originalX = x;
            numContainer.originalY = y;
            
            this.numbersGroup.add(numContainer);
        });

        // Setup Drag Events
        // Pastikan event tidak tertumpuk
        this.input.off('dragstart');
        this.input.off('drag');
        this.input.off('dragend');

        this.input.on('dragstart', (pointer, gameObject) => {
            gameObject.setDepth(100);
            this.tweens.add({ targets: gameObject, scale: 1.1, duration: 100 });
            if (this.audioManager) this.audioManager.playPop();
        });

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('dragend', (pointer, gameObject) => {
            gameObject.setDepth(1);
            this.tweens.add({ targets: gameObject, scale: 1, duration: 100 });

            const dist = Phaser.Math.Distance.Between(gameObject.x, gameObject.y, basketX, basketY);
            if (dist < 100) {
                if (gameObject.numValue === this.correctAnswer) {
                    this._handleCorrect(gameObject, basketX, basketY);
                } else {
                    this._handleWrong(gameObject);
                }
            } else {
                this.tweens.add({ targets: gameObject, x: gameObject.originalX, y: gameObject.originalY, duration: 300, ease: 'Back.easeOut' });
            }
        });
    }

    _handleCorrect(gameObject, bx, by) {
        this.input.off('dragstart');
        this.input.off('drag');
        this.input.off('dragend');
        
        gameObject.x = bx;
        gameObject.y = by;
        gameObject.setScale(0);
        
        if (this.audioManager) this.audioManager.playCorrect();
        
        // Hitung bonus waktu (jika < 5 detik)
        const timeTaken = this.time.now - this.roundStartTime;
        let points = 10;
        let bonusText = '';
        if (timeTaken <= 3000) {
            points += 10; // Bonus super cepat
            bonusText = 'Cepat Sekali! +20';
            this._saveAchievement('Si Cepat');
        } else if (timeTaken <= 6000) {
            points += 5;
            bonusText = 'Bagus! +15';
        } else {
            bonusText = '+10';
        }

        this.score += points;
        this.scoreText.setText(`Skor: ${this.score}`);

        this.starCount++;
        this.starCounter.addStar(this.starCount);
        this.currentRound++;

        const particle = this.add.text(bx, by, '✨', {fontSize:'60px'}).setOrigin(0.5);
        const floatBonus = this.add.text(bx, by - 40, bonusText, {
            fontFamily: 'Nunito', fontSize: '24px', fontStyle: 'bold', color: '#4ECB71', stroke: '#fff', strokeThickness: 4
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: [particle, floatBonus],
            y: by - 120,
            alpha: 0,
            duration: 1000,
            onComplete: () => { particle.destroy(); floatBonus.destroy(); }
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
        
        this._saveAchievement('Jago Hitung');

        // Simpan skor
        const currentProfile = this.registry.get('currentProfile');
        const profilId = currentProfile ? currentProfile.id : 0;
        const nama = currentProfile ? currentProfile.nama : 'Tamu';
        
        try {
            await this.apiClient.saveScore(nama, 'counting_1', this.starCount, profilId);
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

    _saveAchievement(achievementName) {
        const currentProfile = this.registry.get('currentProfile');
        if (currentProfile) {
            const key = `achievements_${currentProfile.id || currentProfile.nama}`;
            let achievements = JSON.parse(localStorage.getItem(key) || '[]');
            if (!achievements.includes(achievementName)) {
                achievements.push(achievementName);
                localStorage.setItem(key, JSON.stringify(achievements));
                console.log('Achievement Unlocked:', achievementName);
            }
        }
    }
}
