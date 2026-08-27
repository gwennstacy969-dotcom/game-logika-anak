/**
 * ============================================
 * BootScene — Loading & Preload Scene
 * ============================================
 * 
 * Scene pertama yang ditampilkan saat game dimuat.
 * Menampilkan animasi loading yang menyenangkan,
 * lalu otomatis pindah ke MenuScene.
 * 
 * Karena semua grafik digambar secara programatis
 * dan audio dihasilkan via Web Audio API, scene ini
 * berfungsi sebagai splash screen dan inisialisasi.
 */
import { AudioManager } from '../utils/AudioManager.js';

export class BootScene extends Phaser.Scene {

    constructor() {
        super({ key: 'BootScene' });
    }

    /**
     * Preload: muat aset eksternal jika ada.
     * Untuk prototype ini, semua grafik dibuat programatis.
     */
    preload() {
        // --- Loading bar ---
        this._createLoadingBar();

        // Simulasi loading (karena tidak ada aset berat untuk dimuat)
        // Di production, preload sprite sheets dan audio files di sini
        // Contoh:
        // this.load.image('bg', 'assets/sprites/backgrounds/level1.png');
        // this.load.spritesheet('shapes', 'assets/sprites/shapes/sheet.png', ...);
        // this.load.audio('bgm', 'assets/audio/bgm/background_music.mp3');
    }

    /**
     * Create: inisialisasi game systems dan transisi ke menu.
     */
    create() {
        // --- Inisialisasi Audio Manager ---
        // Disimpan di registry agar bisa diakses dari scene manapun
        const audioManager = new AudioManager();
        this.registry.set('audioManager', audioManager);

        // --- Simpan nama anak (default, bisa diubah di menu) ---
        this.registry.set('playerName', 'Anak');

        // --- Animasi splash screen ---
        this._showSplashScreen();
    }

    /**
     * Buat loading bar animasi.
     */
    _createLoadingBar() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background gradient
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x667eea, 0x667eea, 0x764ba2, 0x764ba2, 1);
        bg.fillRect(0, 0, width, height);

        // Teks "Memuat..."
        this.loadText = this.add.text(width / 2, height / 2 - 30, 'Memuat...', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Loading bar background
        const barBg = this.add.graphics();
        barBg.fillStyle(0xffffff, 0.2);
        barBg.fillRoundedRect(width / 2 - 150, height / 2 + 10, 300, 20, 10);

        // Loading bar fill
        const barFill = this.add.graphics();
        
        // Progress event dari Phaser loader
        this.load.on('progress', (value) => {
            barFill.clear();
            barFill.fillStyle(0xffffff, 0.8);
            barFill.fillRoundedRect(
                width / 2 - 148, height / 2 + 12,
                296 * value, 16, 8
            );
        });

        // Saat loading selesai
        this.load.on('complete', () => {
            // Animasi loading bar penuh
            barFill.clear();
            barFill.fillStyle(0xffffff, 0.8);
            barFill.fillRoundedRect(
                width / 2 - 148, height / 2 + 12,
                296, 16, 8
            );
        });
    }

    /**
     * Tampilkan splash screen dengan animasi sebelum ke menu.
     */
    _showSplashScreen() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Hapus loading bar
        if (this.loadText) this.loadText.destroy();

        // --- Background gradient ---
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x667eea, 0x667eea, 0x764ba2, 0x764ba2, 1);
        bg.fillRect(0, 0, width, height);

        // --- Bentuk dekoratif melayang ---
        this._addFloatingShapes();

        // --- Judul Game ---
        const title = this.add.text(width / 2, height / 2 - 40, '🧩 Logika Anak 🧩', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '52px',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 4,
                color: '#00000044',
                blur: 8,
                fill: true
            }
        }).setOrigin(0.5).setScale(0);

        // Sub-judul
        const subtitle = this.add.text(width / 2, height / 2 + 30, 'Belajar sambil bermain!', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '24px',
            color: '#ffffffcc',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        // --- Animasi masuk ---
        // Judul bounce in
        this.tweens.add({
            targets: title,
            scaleX: 1,
            scaleY: 1,
            duration: 600,
            delay: 200,
            ease: 'Back.easeOut'
        });

        // Subtitle fade in
        this.tweens.add({
            targets: subtitle,
            alpha: 1,
            duration: 400,
            delay: 700,
            ease: 'Sine.easeOut'
        });

        // --- Transisi ke Menu setelah 2 detik ---
        this.time.delayedCall(2500, () => {
            // Fade out semua
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MenuScene');
            });
        });
    }

    /**
     * Tambahkan bentuk-bentuk kecil melayang di background sebagai dekorasi.
     */
    _addFloatingShapes() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const colors = [0xFF6B35, 0x4ECB71, 0x4A90D9, 0xFFD93D, 0xE84393, 0x00CEC9];

        for (let i = 0; i < 12; i++) {
            const g = this.add.graphics();
            const color = Phaser.Math.RND.pick(colors);
            const size = Phaser.Math.Between(15, 35);
            const x = Phaser.Math.Between(50, width - 50);
            const y = Phaser.Math.Between(50, height - 50);

            g.fillStyle(color, 0.15);

            // Bentuk acak
            const shapeType = Phaser.Math.Between(0, 2);
            if (shapeType === 0) {
                g.fillCircle(x, y, size);
            } else if (shapeType === 1) {
                g.fillRect(x - size / 2, y - size / 2, size, size);
            } else {
                g.fillTriangle(x, y - size, x - size, y + size, x + size, y + size);
            }

            // Animasi melayang naik-turun
            this.tweens.add({
                targets: g,
                y: `-=${Phaser.Math.Between(10, 30)}`,
                duration: Phaser.Math.Between(2000, 4000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: Phaser.Math.Between(0, 2000)
            });
        }
    }
}
