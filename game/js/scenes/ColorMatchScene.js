import { StarCounter } from '../ui/StarCounter.js';
import { FeedbackPopup } from '../ui/FeedbackPopup.js';

export class ColorMatchScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ColorMatchScene' });
    }

    init() {
        this.starCount = 0;
        this.totalShapes = 4;
        this.levelCompleted = false;
        
        this.colors = [
            { key: 'red', hex: 0xFF6B35, name: 'Merah' },
            { key: 'green', hex: 0x4ECB71, name: 'Hijau' },
            { key: 'blue', hex: 0x4A90D9, name: 'Biru' },
            { key: 'yellow', hex: 0xFFD93D, name: 'Kuning' }
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
        
        this._createDropZones(width, height);
        this._createDraggableObjects(width, height);
        this._setupDragEvents();
    }

    _createBackground(width, height) {
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x1a2a6c, 0xb21f1f, 0xfdbb2d, 0x1a2a6c, 1);
        bg.fillRect(0, 0, width, height);
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

        this.add.text(width / 2, 70, 'Tarik benda ke kotak dengan warna yang sama!', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '17px',
            color: '#ffffffaa',
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.starCounter = new StarCounter(this, width - 210, 28, this.totalShapes);
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

    _createDropZones(width, height) {
        this.dropZones = [];
        
        const positions = [
            { x: width * 0.65, y: height * 0.35 },
            { x: width * 0.85, y: height * 0.35 },
            { x: width * 0.65, y: height * 0.65 },
            { x: width * 0.85, y: height * 0.65 }
        ];

        this.colors.forEach((cData, index) => {
            const pos = positions[index];
            
            // Draw Box
            const boxContainer = this.add.container(pos.x, pos.y);
            const box = this.add.graphics();
            
            box.lineStyle(6, cData.hex, 0.8);
            box.strokeRoundedRect(-60, -60, 120, 120, 15);
            
            const label = this.add.text(0, 80, cData.name, {
                fontFamily: 'Nunito, sans-serif',
                fontSize: '20px',
                fontStyle: 'bold',
                color: '#ffffff'
            }).setOrigin(0.5);

            boxContainer.add([box, label]);
            
            boxContainer.colorKey = cData.key;
            boxContainer.isFilled = false;
            
            this.dropZones.push(boxContainer);
        });
    }

    _createDraggableObjects(width, height) {
        this.draggables = [];
        
        let shuffledColors = Phaser.Utils.Array.Shuffle([...this.colors]);
        
        shuffledColors.forEach((cData, index) => {
            const x = width * 0.2;
            const y = height * 0.25 + (index * 130);
            
            const objContainer = this.add.container(x, y);
            const graphic = this.add.graphics();
            
            graphic.fillStyle(cData.hex, 1);
            graphic.fillCircle(0, 0, 45);
            graphic.lineStyle(3, 0xffffff, 1);
            graphic.strokeCircle(0, 0, 45);
            
            objContainer.add(graphic);
            objContainer.setSize(90, 90);
            objContainer.setInteractive({ useHandCursor: true });
            this.input.setDraggable(objContainer);
            
            objContainer.colorKey = cData.key;
            objContainer.originalX = x;
            objContainer.originalY = y;
            
            this.draggables.push(objContainer);
        });
    }

    _setupDragEvents() {
        this.input.off('dragstart');
        this.input.off('drag');
        this.input.off('dragend');

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
            gameObject.setDepth(10);
            this.tweens.add({ targets: gameObject, scale: 1, duration: 100 });

            let droppedOnZone = null;
            for(let zone of this.dropZones) {
                if(!zone.isFilled && Phaser.Math.Distance.Between(gameObject.x, gameObject.y, zone.x, zone.y) < 80) {
                    droppedOnZone = zone;
                    break;
                }
            }

            if (droppedOnZone) {
                if (droppedOnZone.colorKey === gameObject.colorKey) {
                    this._handleCorrect(gameObject, droppedOnZone);
                } else {
                    this._handleWrong(gameObject);
                }
            } else {
                this.tweens.add({ targets: gameObject, x: gameObject.originalX, y: gameObject.originalY, duration: 300, ease: 'Back.easeOut' });
            }
        });
    }

    _handleCorrect(gameObject, zone) {
        zone.isFilled = true;
        gameObject.x = zone.x;
        gameObject.y = zone.y;
        this.input.setDraggable(gameObject, false);
        
        if (this.audioManager) this.audioManager.playSuccess();
        
        const particle = this.add.text(zone.x, zone.y, '✨', {fontSize:'60px'}).setOrigin(0.5);
        this.tweens.add({
            targets: particle,
            y: zone.y - 100,
            alpha: 0,
            duration: 800,
            onComplete: () => particle.destroy()
        });

        this.starCount++;
        this.starCounter.addStar(this.starCount);

        if (this.starCount >= this.totalShapes) {
            this.time.delayedCall(1000, () => this._finishLevel());
        }
    }

    _handleWrong(gameObject) {
        if (this.audioManager) this.audioManager.playError();
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

    _finishLevel() {
        this.levelCompleted = true;
        if (this.audioManager) this.audioManager.playCheer();
        this.feedbackPopup.show(
            this.starCount, 
            this.totalShapes, 
            () => {
                this.cameras.main.fadeOut(500);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('MenuScene');
                });
            },
            () => {
                this.scene.restart();
            }
        );
    }
}
