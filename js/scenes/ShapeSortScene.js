/**
 * ============================================
 * ShapeSortScene — Level: Mencocokkan Bentuk
 * ============================================
 * 
 * Level prototype utama game.
 * Anak harus drag 4 bentuk (lingkaran, segitiga, persegi, bintang)
 * ke zona target (lubang) yang sesuai.
 * 
 * Mekanik:
 * - Drag & drop responsif untuk mouse dan touch
 * - Hitbox besar (1.5x) agar ramah jari anak
 * - Benar → snap ke posisi + partikel + bintang
 * - Salah → bounce back ke posisi awal (tanpa penalti)
 * - Semua cocok → celebration + kirim skor ke API
 */
import { DraggableShape } from '../objects/DraggableShape.js';
import { DropZone } from '../objects/DropZone.js';
import { StarCounter } from '../ui/StarCounter.js';
import { FeedbackPopup } from '../ui/FeedbackPopup.js';
import { ApiClient } from '../utils/ApiClient.js';

export class ShapeSortScene extends Phaser.Scene {

    constructor() {
        super({ key: 'ShapeSortScene' });
    }

    /**
     * Inisialisasi variabel scene.
     */
    init() {
        /** @type {DraggableShape[]} Array semua shape yang bisa di-drag */
        this.shapes = [];

        /** @type {DropZone[]} Array semua zona target */
        this.dropZones = [];

        /** @type {number} Jumlah bintang yang sudah dikumpulkan */
        this.starCount = 0;

        /** @type {number} Total shape yang harus dicocokkan */
        this.totalShapes = 4;

        /** @type {boolean} Apakah level sudah selesai */
        this.levelCompleted = false;
    }

    /**
     * Setup scene: background, shapes, zones, UI, events.
     */
    create() {
        const { width, height } = this.cameras.main;

        // Fade in
        this.cameras.main.fadeIn(500);

        // --- Ambil referensi ke systems ---
        /** @type {import('../utils/AudioManager.js').AudioManager} */
        this.audioManager = this.registry.get('audioManager');

        /** @type {FeedbackPopup} */
        this.feedbackPopup = new FeedbackPopup(this);

        /** @type {ApiClient} */
        this.apiClient = new ApiClient();

        // --- Build Scene ---
        this._createBackground(width, height);
        this._createHeader(width, height);
        this._createDropZones(width, height);
        this._createDraggableShapes(width, height);
        this._setupDragEvents();
        this._createBackButton(width, height);
    }

    // ========================================
    // SCENE BUILDING
    // ========================================

    /**
     * Background gradient berwarna-warni dengan dekorasi.
     */
    _createBackground(width, height) {
        // Gradient utama (biru-ungu lembut)
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x667eea, 0x764ba2, 0x5b6abf, 0x8b5fbf, 1);
        bg.fillRect(0, 0, width, height);

        // Dekorasi: lingkaran besar transparan
        const deco = this.add.graphics();
        deco.fillStyle(0xffffff, 0.03);
        deco.fillCircle(width * 0.15, height * 0.3, 180);
        deco.fillCircle(width * 0.85, height * 0.7, 140);
        deco.fillCircle(width * 0.5, height * 0.15, 100);

        // Dekorasi: bentuk kecil melayang
        const symbols = ['●', '▲', '■', '★'];
        const colors = ['#FF6B35', '#4ECB71', '#4A90D9', '#FFD93D'];
        
        for (let i = 0; i < 6; i++) {
            const sym = Phaser.Math.RND.pick(symbols);
            const col = Phaser.Math.RND.pick(colors);
            const x = Phaser.Math.Between(30, width - 30);
            const y = Phaser.Math.Between(30, height - 30);

            const t = this.add.text(x, y, sym, {
                fontSize: `${Phaser.Math.Between(14, 28)}px`,
                color: col
            }).setOrigin(0.5).setAlpha(0.08);

            this.tweens.add({
                targets: t,
                y: y - Phaser.Math.Between(10, 25),
                duration: Phaser.Math.Between(3000, 5000),
                yoyo: true, repeat: -1,
                ease: 'Sine.easeInOut',
                delay: Phaser.Math.Between(0, 2000)
            });
        }
    }

    /**
     * Header: judul level + star counter.
     */
    _createHeader(width, height) {
        // Judul level
        const title = this.add.text(width / 2, 35, '🧩 Cocokkan Bentuk!', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3,
            shadow: { offsetY: 2, color: '#00000044', blur: 4, fill: true }
        }).setOrigin(0.5).setDepth(100);

        // Instruksi
        this.instructionText = this.add.text(width / 2, 70, 'Tarik bentuk ke tempatnya yang benar!', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '17px',
            color: '#ffffffaa',
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // Star counter di kanan atas
        this.starCounter = new StarCounter(this, width - 210, 28, this.totalShapes);
    }

    /**
     * Buat 4 zona target (drop zones) di sisi kanan.
     * Layout 2×2 grid.
     */
    _createDropZones(width, height) {
        // Definisi zona: tipe, posisi, warna
        const zoneConfigs = [
            { type: 'circle',   x: width * 0.62, y: height * 0.32, color: 0xFF6B35 },
            { type: 'triangle', x: width * 0.82, y: height * 0.32, color: 0x4ECB71 },
            { type: 'square',   x: width * 0.62, y: height * 0.68, color: 0x4A90D9 },
            { type: 'star',     x: width * 0.82, y: height * 0.68, color: 0xFFD93D },
        ];

        zoneConfigs.forEach(config => {
            const zone = new DropZone(
                this,
                config.x, config.y,
                config.type,
                config.color,
                90 // Ukuran zona
            );
            this.dropZones.push(zone);
        });

        // Label area target
        this.add.text(width * 0.72, height * 0.12, '📥 Letakkan di sini', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#ffffffaa',
            align: 'center'
        }).setOrigin(0.5).setDepth(50);
    }

    /**
     * Buat 4 bentuk yang bisa di-drag di sisi kiri.
     * Posisi acak agar setiap kali bermain terasa berbeda.
     */
    _createDraggableShapes(width, height) {
        // Definisi shape: tipe, warna, dan posisi basis
        const shapeConfigs = [
            { type: 'circle',   color: 0xFF6B35 },
            { type: 'triangle', color: 0x4ECB71 },
            { type: 'square',   color: 0x4A90D9 },
            { type: 'star',     color: 0xFFD93D },
        ];

        // Acak urutan agar anak tidak menghafal pola
        Phaser.Utils.Array.Shuffle(shapeConfigs);

        // Posisi yang tersedia di sisi kiri (pre-defined, ramah layout)
        const positions = [
            { x: width * 0.15, y: height * 0.32 },
            { x: width * 0.37, y: height * 0.32 },
            { x: width * 0.15, y: height * 0.68 },
            { x: width * 0.37, y: height * 0.68 },
        ];

        shapeConfigs.forEach((config, index) => {
            // Sedikit randomisasi posisi agar terasa natural
            const pos = positions[index];
            const offsetX = Phaser.Math.Between(-15, 15);
            const offsetY = Phaser.Math.Between(-15, 15);

            const shape = new DraggableShape(
                this,
                pos.x + offsetX,
                pos.y + offsetY,
                config.type,
                config.color,
                85 // Ukuran shape (sedikit lebih kecil dari zona)
            );

            this.shapes.push(shape);

            // Animasi masuk: shapes pop in satu per satu
            shape.setScale(0);
            this.tweens.add({
                targets: shape,
                scaleX: 1,
                scaleY: 1,
                duration: 400,
                delay: 300 + index * 150,
                ease: 'Back.easeOut'
            });
        });

        // Label area shapes
        this.add.text(width * 0.26, height * 0.12, '✋ Tarik bentuk ini', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#ffffffaa',
            align: 'center'
        }).setOrigin(0.5).setDepth(50);
    }

    // ========================================
    // DRAG & DROP LOGIC
    // ========================================

    /**
     * Setup semua event drag & drop.
     * Ini adalah inti mekanik gameplay.
     */
    _setupDragEvents() {
        // --- DRAG START ---
        // Saat anak mulai menyentuh/klik shape
        this.input.on('dragstart', (pointer, gameObject) => {
            if (gameObject.isPlaced || this.levelCompleted) return;

            // Visual feedback: shape membesar sedikit
            gameObject.setPickedUp();

            // Audio feedback
            if (this.audioManager) this.audioManager.playSnap();

            // Highlight drop zones yang cocok (petunjuk visual)
            this._highlightMatchingZones(gameObject.shapeType, true);
        });

        // --- DRAG ---
        // Saat shape di-drag mengikuti jari/mouse
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (gameObject.isPlaced || this.levelCompleted) return;

            // Update posisi shape mengikuti pointer
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        // --- DRAG END ---
        // Saat anak melepas shape
        this.input.on('dragend', (pointer, gameObject) => {
            if (gameObject.isPlaced || this.levelCompleted) return;

            // Visual: kembali ke ukuran normal
            gameObject.setDropped();

            // Matikan highlight zona
            this._highlightMatchingZones(gameObject.shapeType, false);

            // --- Cek apakah shape masuk ke zona yang benar ---
            let matched = false;

            for (const zone of this.dropZones) {
                if (zone.checkMatch(gameObject)) {
                    // ✅ COCOK! — Shape masuk ke zona yang benar
                    this._handleCorrectMatch(gameObject, zone);
                    matched = true;
                    break; // Berhenti cek setelah menemukan match
                }
            }

            if (!matched) {
                // ❌ TIDAK COCOK — Bounce back ke posisi awal
                this._handleWrongPlacement(gameObject);
            }
        });
    }

    // ========================================
    // MATCH HANDLING
    // ========================================

    /**
     * Handle saat shape diletakkan di zona yang BENAR.
     * @param {DraggableShape} shape - Shape yang cocok
     * @param {DropZone} zone - Zona target
     */
    _handleCorrectMatch(shape, zone) {
        // 1. Snap shape ke posisi zona (animasi smooth)
        shape.snapToZone(zone.x, zone.y, () => {
            // Callback setelah snap selesai
        });

        // 2. Tandai zona sebagai terisi
        zone.markFilled();

        // 3. Efek partikel sparkle di posisi zona
        this._createParticleBurst(zone.x, zone.y, zone.zoneColor);

        // 4. Audio: suara benar (nada naik ceria)
        if (this.audioManager) {
            this.audioManager.playCorrect();
            // Delay sedikit lalu play star sound
            this.time.delayedCall(200, () => {
                if (this.audioManager) this.audioManager.playStar();
            });
        }

        // 5. Tambah bintang
        this.starCount++;
        this.starCounter.addStar();

        // 6. Popup feedback "Hebat!" di dekat zona
        this.feedbackPopup.showCorrect(zone.x, zone.y);

        // 7. Cek apakah semua bentuk sudah cocok → level selesai
        if (this.starCount >= this.totalShapes) {
            this.time.delayedCall(800, () => {
                this._handleLevelComplete();
            });
        }
    }

    /**
     * Handle saat shape diletakkan di tempat yang SALAH.
     * Tidak ada penalti — hanya bounce back dengan animasi halus.
     * @param {DraggableShape} shape - Shape yang salah tempat
     */
    _handleWrongPlacement(shape) {
        // 1. Bounce back ke posisi awal
        shape.bounceBack();

        // 2. Audio: suara lembut (bukan menakutkan)
        if (this.audioManager) this.audioManager.playWrong();

        // 3. Popup feedback positif "Coba lagi!"
        this.feedbackPopup.showTryAgain(shape.x, shape.y);
    }

    // ========================================
    // LEVEL COMPLETE
    // ========================================

    /**
     * Handle saat semua bentuk berhasil dicocokkan.
     */
    _handleLevelComplete() {
        this.levelCompleted = true;

        // 1. Audio: fanfare celebration
        if (this.audioManager) this.audioManager.playCelebrate();

        // 2. Confetti rain!
        this._createConfettiRain();

        // 3. Popup celebration besar
        this.time.delayedCall(300, () => {
            this.feedbackPopup.showLevelComplete();
        });

        // 4. Kirim skor ke backend API
        this._submitScore();

        // 5. Ubah instruksi
        this.instructionText.setText('🎉 Semua bentuk cocok! Kamu hebat!');
        this.instructionText.setStyle({ color: '#FFD700' });
    }

    /**
     * Kirim skor ke backend PHP via API.
     */
    async _submitScore() {
        const playerName = this.registry.get('playerName') || 'Anak';
        const levelId = 'shape_sort_1';

        try {
            const result = await this.apiClient.saveScore(
                playerName,
                levelId,
                this.starCount
            );

            if (result.success) {
                console.log('✅ Skor berhasil disimpan:', result);
            } else {
                console.warn('⚠️ Skor tidak tersimpan:', result.message);
            }
        } catch (error) {
            // Jangan crash game — skor tetap terlihat di UI
            console.warn('⚠️ Gagal mengirim skor:', error);
        }
    }

    // ========================================
    // VISUAL EFFECTS
    // ========================================

    /**
     * Buat efek partikel burst saat shape cocok.
     * Menggunakan graphics objects sebagai partikel sederhana.
     * @param {number} x - Center X
     * @param {number} y - Center Y
     * @param {number} color - Warna partikel
     */
    _createParticleBurst(x, y, color) {
        const particleCount = 12;

        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = Phaser.Math.Between(80, 160);
            const size = Phaser.Math.Between(4, 10);

            // Buat partikel sebagai circle graphics
            const particle = this.add.graphics();
            particle.fillStyle(color, 1);
            particle.fillCircle(0, 0, size);
            particle.setPosition(x, y);
            particle.setDepth(150);

            // Target position
            const targetX = x + Math.cos(angle) * speed;
            const targetY = y + Math.sin(angle) * speed;

            // Animasi: terbang keluar lalu menghilang
            this.tweens.add({
                targets: particle,
                x: targetX,
                y: targetY,
                alpha: 0,
                scaleX: 0.2,
                scaleY: 0.2,
                duration: Phaser.Math.Between(400, 700),
                ease: 'Cubic.easeOut',
                onComplete: () => particle.destroy()
            });
        }

        // Sparkle tambahan: emoji bintang berputar
        const sparkle = this.add.text(x, y, '✨', {
            fontSize: '32px'
        }).setOrigin(0.5).setDepth(151).setScale(0);

        this.tweens.add({
            targets: sparkle,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            y: y - 40,
            angle: 360,
            duration: 600,
            ease: 'Cubic.easeOut',
            onComplete: () => sparkle.destroy()
        });
    }

    /**
     * Confetti rain saat level selesai.
     * Warna-warni dari atas layar.
     */
    _createConfettiRain() {
        const { width } = this.cameras.main;
        const colors = [0xFF6B35, 0x4ECB71, 0x4A90D9, 0xFFD93D, 0xE84393, 0x00CEC9, 0xFF69B4];

        for (let i = 0; i < 40; i++) {
            const x = Phaser.Math.Between(20, width - 20);
            const delay = Phaser.Math.Between(0, 1500);
            const color = Phaser.Math.RND.pick(colors);
            const size = Phaser.Math.Between(4, 8);

            const confetti = this.add.graphics();
            confetti.fillStyle(color, 1);

            // Bentuk acak (persegi atau lingkaran kecil)
            if (Math.random() > 0.5) {
                confetti.fillRect(-size / 2, -size / 2, size, size * 1.5);
            } else {
                confetti.fillCircle(0, 0, size / 2);
            }

            confetti.setPosition(x, -20);
            confetti.setDepth(250);

            // Animasi jatuh dengan rotasi
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

    /**
     * Highlight zona yang cocok saat shape sedang di-drag.
     * Membantu anak memahami ke mana harus meletakkan shape.
     * @param {string} shapeType - Tipe shape yang sedang di-drag
     * @param {boolean} active - true untuk highlight, false untuk reset
     */
    _highlightMatchingZones(shapeType, active) {
        this.dropZones.forEach(zone => {
            if (zone.isFilled) return; // Skip yang sudah terisi

            if (zone.acceptedShape === shapeType && active) {
                // Highlight zona yang cocok dengan pulse cepat
                this.tweens.add({
                    targets: zone,
                    scaleX: 1.08,
                    scaleY: 1.08,
                    duration: 300,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            } else if (!active) {
                // Reset semua animasi highlight
                this.tweens.killTweensOf(zone);
                zone.setScale(1);
            }
        });
    }

    // ========================================
    // NAVIGATION
    // ========================================

    /**
     * Tombol kembali ke menu.
     */
    _createBackButton(width, height) {
        const btnContainer = this.add.container(60, height - 35);
        btnContainer.setDepth(200);

        // Background
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.3);
        bg.fillRoundedRect(-45, -18, 90, 36, 18);
        btnContainer.add(bg);

        // Label
        const label = this.add.text(0, 0, '◀ Menu', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#ffffffcc'
        }).setOrigin(0.5);
        btnContainer.add(label);

        // FIX: Set interactive pada container langsung
        btnContainer.setSize(100, 44);
        btnContainer.setInteractive(
            new Phaser.Geom.Rectangle(-50, -22, 100, 44),
            Phaser.Geom.Rectangle.Contains
        );

        btnContainer.on('pointerover', () => {
            label.setStyle({ color: '#ffffff' });
            bg.clear();
            bg.fillStyle(0x000000, 0.5);
            bg.fillRoundedRect(-45, -18, 90, 36, 18);
        });

        btnContainer.on('pointerout', () => {
            label.setStyle({ color: '#ffffffcc' });
            bg.clear();
            bg.fillStyle(0x000000, 0.3);
            bg.fillRoundedRect(-45, -18, 90, 36, 18);
        });

        btnContainer.on('pointerdown', () => {
            if (this.audioManager) this.audioManager.playPop();
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MenuScene');
            });
        });
    }
}
