/**
 * ============================================
 * MenuScene — Menu Utama Game
 * ============================================
 * 
 * Tampilan menu utama dengan:
 * - Judul game besar dan colorful
 * - Input nama anak (opsional)
 * - Tombol besar untuk mulai bermain
 * - Pilihan level (untuk sekarang hanya Shape Sorting)
 * - Background animasi dekoratif
 */
export class MenuScene extends Phaser.Scene {

    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Fade in dari BootScene
        this.cameras.main.fadeIn(500);

        // --- Background ---
        this._createBackground(width, height);

        // --- Judul Game ---
        this._createTitle(width, height);

        // --- Input Nama Anak ---
        this._createNameInput(width, height);

        // --- Tombol Level ---
        this._createLevelButtons(width, height);

        // Audio diinisialisasi di dalam handler tombol/input
        // agar tidak mencuri klik pertama dari user.
    }

    /**
     * Background gradient dengan bentuk dekoratif.
     */
    _createBackground(width, height) {
        // Gradient utama
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x667eea, 0x764ba2, 0x667eea, 0x764ba2, 1);
        bg.fillRect(0, 0, width, height);

        // Lingkaran dekoratif besar (soft)
        const deco = this.add.graphics();
        deco.fillStyle(0xffffff, 0.03);
        deco.fillCircle(width * 0.85, height * 0.2, 200);
        deco.fillCircle(width * 0.1, height * 0.8, 150);
        deco.fillCircle(width * 0.5, height * 0.9, 100);

        // Bentuk-bentuk kecil melayang
        this._addFloatingDecorations(width, height);
    }

    /**
     * Judul game dengan animasi masuk.
     */
    _createTitle(width, height) {
        // Emoji dekoratif
        const emoji = this.add.text(width / 2, 80, '🧩🔢🌟', {
            fontSize: '48px'
        }).setOrigin(0.5).setAlpha(0);

        // Judul utama
        const title = this.add.text(width / 2, 145, 'Logika & Matematika', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '46px',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: { offsetY: 3, color: '#00000044', blur: 6, fill: true }
        }).setOrigin(0.5).setScale(0);

        // Subjudul
        const subtitle = this.add.text(width / 2, 195, 'Untuk Usia 4-7 Tahun', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '20px',
            color: '#ffffffaa',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        // Animasi masuk
        this.tweens.add({ targets: emoji, alpha: 1, duration: 400, delay: 100, ease: 'Sine.easeOut' });
        this.tweens.add({ targets: title, scaleX: 1, scaleY: 1, duration: 500, delay: 200, ease: 'Back.easeOut' });
        this.tweens.add({ targets: subtitle, alpha: 1, duration: 400, delay: 500, ease: 'Sine.easeOut' });
    }

    /**
     * Input field untuk nama anak.
     * Menggunakan Phaser text + DOM element.
     */
    _createNameInput(width, height) {
        const y = 280;

        // Label
        this.add.text(width / 2, y - 25, '👶 Siapa nama kamu?', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Input field background
        const inputBg = this.add.graphics();
        inputBg.fillStyle(0xffffff, 0.15);
        inputBg.fillRoundedRect(width / 2 - 130, y, 260, 45, 22);
        inputBg.lineStyle(2, 0xffffff, 0.3);
        inputBg.strokeRoundedRect(width / 2 - 130, y, 260, 45, 22);

        // Teks input (simulasi — klik untuk mengganti nama)
        this.nameText = this.add.text(width / 2, y + 22, '✏️ Ketuk untuk isi nama', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '16px',
            color: '#ffffffaa',
            align: 'center'
        }).setOrigin(0.5);

        // Buat area klik
        const inputZone = this.add.zone(width / 2, y + 22, 260, 45)
            .setInteractive({ useHandCursor: true });

        inputZone.on('pointerdown', () => {
            // Gunakan prompt browser untuk input nama (paling kompatibel)
            const name = prompt('Masukkan nama anak:', 
                this.registry.get('playerName') || 'Anak');
            
            if (name && name.trim() !== '') {
                this.registry.set('playerName', name.trim());
                this.nameText.setText(`👤 ${name.trim()}`);
                this.nameText.setStyle({ color: '#ffffff' });
            }

            // Init audio saat interaksi
            const audioManager = this.registry.get('audioManager');
            if (audioManager) audioManager.init();
        });
    }

    /**
     * Tombol-tombol level yang tersedia.
     */
    _createLevelButtons(width, height) {
        // --- Tombol Level 1: Mencocokkan Bentuk ---
        this._createButton(
            width / 2, 420,
            '🧩 Mencocokkan Bentuk',
            'Drag & letakkan bentuk ke tempatnya!',
            0x4ECB71,      // Hijau
            0x3DAF5C,      // Hijau hover
            () => {
                const audioManager = this.registry.get('audioManager');
                if (audioManager) {
                    audioManager.init();
                    audioManager.playPop();
                }

                // Transisi ke ShapeSortScene
                this.cameras.main.fadeOut(400, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('ShapeSortScene');
                });
            },
            200  // Delay animasi
        );

        // --- Tombol Level 2: Menghitung Objek ---
        this._createButton(
            width / 2, 540,
            '🔢 Menghitung Objek',
            'Hitung benda dan pilih angkanya!',
            0x4A90D9,      // Biru
            0x3A80C9,
            () => {
                const audioManager = this.registry.get('audioManager');
                if (audioManager) {
                    audioManager.init();
                    audioManager.playPop();
                }
                this.cameras.main.fadeOut(400, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('CountingScene');
                });
            },
            400
        );

        // --- Tombol Level 3: Mengenal Warna ---
        this._createButton(
            width / 2, 630,
            '🎨 Mengenal Warna',
            'Kelompokkan benda sesuai warnanya!',
            0xFFB03B,      // Kuning-Oranye
            0xEFA02B,
            () => {
                const audioManager = this.registry.get('audioManager');
                if (audioManager) {
                    audioManager.init();
                    audioManager.playPop();
                }
                this.cameras.main.fadeOut(400, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('ColorMatchScene');
                });
            },
            500
        );
    }

    /**
     * Tampilkan popup "Segera Hadir" untuk level yang belum tersedia.
     */
    _showComingSoon(x, y) {
        const text = this.add.text(x, y - 60, '🔒 Segera Hadir!', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#FFD93D',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5).setDepth(300).setScale(0);

        this.tweens.add({
            targets: text,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 250,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets: text,
                    y: y - 100,
                    alpha: 0,
                    scaleX: 0.8,
                    scaleY: 0.8,
                    duration: 700,
                    delay: 500,
                    ease: 'Sine.easeIn',
                    onComplete: () => text.destroy()
                });
            }
        });
    }

    /**
     * Helper: buat tombol interaktif yang besar dan ramah anak.
     * 
     * FIX: Menggunakan Graphics-based hit area pada container
     * dengan setInteractive() langsung pada container, bukan zone child.
     * Ini memperbaiki masalah klik yang tidak terdeteksi.
     * 
     * @param {number} x - Center X
     * @param {number} y - Center Y
     * @param {string} label - Teks tombol
     * @param {string} desc - Deskripsi kecil
     * @param {number} color - Warna normal
     * @param {number} hoverColor - Warna hover
     * @param {Function} onClick - Callback saat diklik
     * @param {number} delay - Delay animasi masuk
     */
    _createButton(x, y, label, desc, color, hoverColor, onClick, delay = 0) {
        const btnWidth = 380;
        const btnHeight = 75;

        // Container untuk grouping
        const container = this.add.container(x, y);
        container.setScale(0);
        container.setDepth(10);

        // Background tombol
        const bg = this.add.graphics();
        bg.fillStyle(color, 1);
        bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 20);
        // Subtle border
        bg.lineStyle(2, 0xffffff, 0.15);
        bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 20);
        container.add(bg);

        // Label teks
        const labelText = this.add.text(0, -10, label, {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        container.add(labelText);

        // Deskripsi
        const descText = this.add.text(0, 16, desc, {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '14px',
            color: '#ffffffaa',
            align: 'center'
        }).setOrigin(0.5);
        container.add(descText);

        // ===== FIX: Set interactive langsung pada container =====
        // Menggunakan setSize + setInteractive pada container itu sendiri
        // Ini jauh lebih reliable daripada child zone di dalam container
        container.setSize(btnWidth + 20, btnHeight + 20);
        container.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(
                -(btnWidth + 20) / 2, -(btnHeight + 20) / 2,
                btnWidth + 20, btnHeight + 20
            ),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            useHandCursor: true
        });

        // --- Redraw helper ---
        const redrawBg = (fillColor, borderAlpha) => {
            bg.clear();
            bg.fillStyle(fillColor, 1);
            bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 20);
            bg.lineStyle(2, 0xffffff, borderAlpha);
            bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 20);
        };

        // --- Event handlers langsung pada container ---
        container.on('pointerover', () => {
            redrawBg(hoverColor, 0.3);
            this.tweens.add({
                targets: container,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100,
                ease: 'Sine.easeOut'
            });
        });

        container.on('pointerout', () => {
            redrawBg(color, 0.15);
            this.tweens.add({
                targets: container,
                scaleX: 1.0,
                scaleY: 1.0,
                duration: 100,
                ease: 'Sine.easeOut'
            });
        });

        container.on('pointerdown', () => {
            // Init audio pada klik pertama
            const audioManager = this.registry.get('audioManager');
            if (audioManager) audioManager.init();

            // Press effect (visual only — jangan tunda callback)
            this.tweens.add({
                targets: container,
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 80,
                yoyo: true,
                ease: 'Sine.easeInOut'
            });

            // Fire callback langsung tanpa menunggu animasi
            if (onClick) onClick();
        });

        // --- Animasi masuk ---
        this.tweens.add({
            targets: container,
            scaleX: 1,
            scaleY: 1,
            duration: 400,
            delay: delay,
            ease: 'Back.easeOut'
        });
    }

    /**
     * Dekorasi melayang di background.
     */
    _addFloatingDecorations(width, height) {
        const shapes = ['●', '▲', '■', '★', '♦'];
        const colors = ['#FF6B35', '#4ECB71', '#4A90D9', '#FFD93D', '#E84393'];

        for (let i = 0; i < 8; i++) {
            const shape = Phaser.Math.RND.pick(shapes);
            const color = Phaser.Math.RND.pick(colors);
            const x = Phaser.Math.Between(30, width - 30);
            const y = Phaser.Math.Between(30, height - 30);

            const text = this.add.text(x, y, shape, {
                fontSize: `${Phaser.Math.Between(20, 40)}px`,
                color: color
            }).setOrigin(0.5).setAlpha(0.12);

            // Animasi melayang
            this.tweens.add({
                targets: text,
                y: y - Phaser.Math.Between(15, 35),
                alpha: { from: 0.08, to: 0.18 },
                duration: Phaser.Math.Between(3000, 5000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: Phaser.Math.Between(0, 2000)
            });
        }
    }
}
