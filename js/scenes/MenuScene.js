/**
 * ============================================
 * MenuScene — Menu Utama Game
 * ============================================
 *
 * Tampilan menu utama dengan layout responsif:
 * - Judul game besar dan colorful
 * - Input nama anak (opsional)
 * - Tombol besar untuk mulai bermain
 * - Background animasi dekoratif
 *
 * FIX: Semua posisi menggunakan persentase dari ukuran canvas
 *      sehingga tampilan pas di mobile portrait, landscape, & desktop.
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

        // --- Handle resize (orientasi berubah di mobile) ---
        this.scale.on('resize', this._onResize, this);
    }

    /**
     * Saat layar di-resize, restart scene agar layout
     * dihitung ulang sesuai ukuran baru.
     */
    _onResize() {
        this.scale.off('resize', this._onResize, this);
        // Beri jeda agar Phaser selesai menghitung ukuran baru
        this.time.delayedCall(100, () => {
            this.scene.restart();
        });
    }

    /**
     * Background gradient dengan bentuk dekoratif.
     */
    _createBackground(width, height) {
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x667eea, 0x764ba2, 0x667eea, 0x764ba2, 1);
        bg.fillRect(0, 0, width, height);

        // Lingkaran dekoratif besar (soft)
        const deco = this.add.graphics();
        deco.fillStyle(0xffffff, 0.03);
        deco.fillCircle(width * 0.85, height * 0.2, Math.min(width, height) * 0.25);
        deco.fillCircle(width * 0.1, height * 0.8, Math.min(width, height) * 0.18);
        deco.fillCircle(width * 0.5, height * 0.95, Math.min(width, height) * 0.12);

        this._addFloatingDecorations(width, height);
    }

    /**
     * Judul game — ukuran font responsif terhadap lebar canvas.
     */
    _createTitle(width, height) {
        const isPortrait = height > width;

        // Ukuran font dinamis
        const emojiFontSize  = Math.max(24, Math.min(52, width * 0.045)) + 'px';
        const titleFontSize  = Math.max(20, Math.min(48, width * 0.038)) + 'px';
        const subtitleFontSize = Math.max(13, Math.min(22, width * 0.018)) + 'px';

        // Posisi Y responsif: 10% teratas untuk judul
        const titleY      = height * (isPortrait ? 0.10 : 0.12);
        const emojiY      = titleY - height * 0.07;
        const subtitleY   = titleY + height * 0.07;

        const emoji = this.add.text(width / 2, emojiY, '🧩🔢🌟', {
            fontSize: emojiFontSize
        }).setOrigin(0.5).setAlpha(0);

        const title = this.add.text(width / 2, titleY, 'Logika & Matematika', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: titleFontSize,
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3,
            shadow: { offsetY: 3, color: '#00000044', blur: 6, fill: true }
        }).setOrigin(0.5).setScale(0);

        const subtitle = this.add.text(width / 2, subtitleY, 'Untuk Usia 4–7 Tahun', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: subtitleFontSize,
            color: '#ffffffaa',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({ targets: emoji,    alpha: 1,            duration: 400, delay: 100, ease: 'Sine.easeOut' });
        this.tweens.add({ targets: title,    scaleX: 1, scaleY: 1, duration: 500, delay: 200, ease: 'Back.easeOut' });
        this.tweens.add({ targets: subtitle, alpha: 1,            duration: 400, delay: 500, ease: 'Sine.easeOut' });
    }

    /**
     * Input field nama anak — posisi adaptif.
     */
    _createNameInput(width, height) {
        const isPortrait = height > width;

        // Zona input ada di sekitar 28% tinggi (portrait) atau 27% (landscape)
        const centerY    = height * (isPortrait ? 0.30 : 0.28);
        const inputW     = Math.min(280, width * 0.55);
        const inputH     = 44;
        const labelSize  = Math.max(13, Math.min(20, width * 0.016)) + 'px';
        const inputSize  = Math.max(12, Math.min(17, width * 0.014)) + 'px';

        this.add.text(width / 2, centerY - 26, '👶 Siapa nama kamu?', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: labelSize,
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        const inputBg = this.add.graphics();
        inputBg.fillStyle(0xffffff, 0.15);
        inputBg.fillRoundedRect(width / 2 - inputW / 2, centerY - inputH / 2, inputW, inputH, 22);
        inputBg.lineStyle(2, 0xffffff, 0.3);
        inputBg.strokeRoundedRect(width / 2 - inputW / 2, centerY - inputH / 2, inputW, inputH, 22);

        this.nameText = this.add.text(width / 2, centerY, '✏️ Ketuk untuk isi nama', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: inputSize,
            color: '#ffffffaa',
            align: 'center'
        }).setOrigin(0.5);

        const inputZone = this.add.zone(width / 2, centerY, inputW, inputH)
            .setInteractive({ useHandCursor: true });

        inputZone.on('pointerdown', () => {
            const name = prompt('Masukkan nama anak:',
                this.registry.get('playerName') || 'Anak');

            if (name && name.trim() !== '') {
                this.registry.set('playerName', name.trim());
                this.nameText.setText(`👤 ${name.trim()}`);
                this.nameText.setStyle({ color: '#ffffff' });
            }

            const audioManager = this.registry.get('audioManager');
            if (audioManager) audioManager.init();
        });
    }

    /**
     * Tombol-tombol level — diatur secara vertikal dengan spasi proporsional.
     */
    _createLevelButtons(width, height) {
        const isPortrait = height > width;

        // Lebar tombol responsif (maks 400px, min 55% layar)
        const btnWidth  = Math.min(400, Math.max(width * 0.55, 220));
        const btnHeight = Math.min(78, Math.max(height * 0.09, 52));

        // Ukuran font responsif
        const labelSize = Math.max(14, Math.min(22, width * 0.018)) + 'px';
        const descSize  = Math.max(10, Math.min(14, width * 0.012)) + 'px';

        // Posisi vertikal tombol pertama: 42% ke bawah (portrait) atau 40% (landscape)
        const startY  = height * (isPortrait ? 0.44 : 0.40);
        const spacing = btnHeight + Math.max(14, height * 0.035);

        const buttons = [
            {
                label: '🧩 Mencocokkan Bentuk',
                desc:  'Drag & letakkan bentuk ke tempatnya!',
                color: 0x4ECB71, hover: 0x3DAF5C,
                scene: 'ShapeSortScene'
            },
            {
                label: '🔢 Menghitung Objek',
                desc:  'Hitung benda dan pilih angkanya! (5 ronde)',
                color: 0x4A90D9, hover: 0x3A80C9,
                scene: 'CountingScene'
            },
            {
                label: '🎨 Mengenal Warna',
                desc:  'Kelompokkan benda sesuai warnanya! (3 tahap)',
                color: 0xFFB03B, hover: 0xEFA02B,
                scene: 'ColorMatchScene'
            }
        ];

        buttons.forEach((btn, i) => {
            const y = startY + i * spacing;
            this._createButton(
                width / 2, y,
                btn.label, btn.desc,
                btn.color, btn.hover,
                btnWidth, btnHeight,
                labelSize, descSize,
                () => {
                    const audioManager = this.registry.get('audioManager');
                    if (audioManager) { audioManager.init(); audioManager.playPop?.(); }
                    this.cameras.main.fadeOut(400, 0, 0, 0);
                    this.cameras.main.once('camerafadeoutcomplete', () => {
                        this.scene.start(btn.scene);
                    });
                },
                i * 150  // stagger delay
            );
        });
    }

    /**
     * Helper: buat satu tombol interaktif responsif.
     */
    _createButton(x, y, label, desc, color, hoverColor, btnWidth, btnHeight, labelSize, descSize, onClick, delay = 0) {
        const container = this.add.container(x, y);
        container.setScale(0);
        container.setDepth(10);

        const bg = this.add.graphics();

        const drawBg = (fillColor, borderAlpha) => {
            bg.clear();
            bg.fillStyle(fillColor, 1);
            bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 18);
            bg.lineStyle(2, 0xffffff, borderAlpha);
            bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 18);
        };

        drawBg(color, 0.15);
        container.add(bg);

        const labelText = this.add.text(0, -btnHeight * 0.14, label, {
            fontFamily: 'Nunito, sans-serif',
            fontSize: labelSize,
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        container.add(labelText);

        const descText = this.add.text(0, btnHeight * 0.22, desc, {
            fontFamily: 'Nunito, sans-serif',
            fontSize: descSize,
            color: '#ffffffaa',
            align: 'center'
        }).setOrigin(0.5);
        container.add(descText);

        container.setSize(btnWidth + 20, btnHeight + 20);
        container.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(
                -(btnWidth + 20) / 2, -(btnHeight + 20) / 2,
                btnWidth + 20, btnHeight + 20
            ),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            useHandCursor: true
        });

        container.on('pointerover', () => {
            drawBg(hoverColor, 0.3);
            this.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 100, ease: 'Sine.easeOut' });
        });

        container.on('pointerout', () => {
            drawBg(color, 0.15);
            this.tweens.add({ targets: container, scaleX: 1.0, scaleY: 1.0, duration: 100, ease: 'Sine.easeOut' });
        });

        container.on('pointerdown', () => {
            const audioManager = this.registry.get('audioManager');
            if (audioManager) audioManager.init();

            this.tweens.add({
                targets: container,
                scaleX: 0.95, scaleY: 0.95,
                duration: 80, yoyo: true,
                ease: 'Sine.easeInOut'
            });

            if (onClick) onClick();
        });

        // Animasi masuk
        this.tweens.add({
            targets: container,
            scaleX: 1, scaleY: 1,
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
            const size = Math.max(18, Math.min(40, width * 0.03));

            const text = this.add.text(x, y, shape, {
                fontSize: `${Phaser.Math.Between(Math.round(size * 0.7), size)}px`,
                color: color
            }).setOrigin(0.5).setAlpha(0.12);

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
