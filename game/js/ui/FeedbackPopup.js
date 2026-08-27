/**
 * ============================================
 * FeedbackPopup — Popup Feedback Positif
 * ============================================
 * 
 * Menampilkan pesan pujian saat jawaban benar dan
 * pesan dorongan lembut saat jawaban salah.
 * 
 * Popup muncul sebentar lalu menghilang secara otomatis.
 * Tidak ada pesan negatif — semuanya positif dan mendorong.
 */
export class FeedbackPopup {

    /**
     * @param {Phaser.Scene} scene - Scene tempat popup ditampilkan
     */
    constructor(scene) {
        /** @type {Phaser.Scene} */
        this.scene = scene;

        /** @type {string[]} Pesan acak saat benar */
        this.correctMessages = [
            '⭐ Hebat!',
            '🎉 Pintar!',
            '👏 Bagus Sekali!',
            '🌟 Keren!',
            '💪 Mantap!',
            '🎊 Wow!'
        ];

        /** @type {string[]} Pesan acak saat salah (lembut & positif) */
        this.tryAgainMessages = [
            '🤔 Coba lagi yuk!',
            '💪 Hampir! Ayo coba lagi!',
            '🌈 Tidak apa-apa, coba yang lain!',
            '😊 Coba di tempat lain!'
        ];

        /** @type {string[]} Pesan saat level selesai */
        this.completeMessages = [
            '🏆 LUAR BIASA! 🏆',
            '🎉 SEMPURNA! 🎉',
            '⭐ HEBAT SEKALI! ⭐'
        ];
    }

    /**
     * Tampilkan popup feedback benar.
     * @param {number} x - Posisi X (biasanya di dekat shape yang cocok)
     * @param {number} y - Posisi Y
     */
    showCorrect(x, y) {
        const msg = Phaser.Math.RND.pick(this.correctMessages);
        this._showPopup(msg, x, y - 60, '#4ECB71', 36);
    }

    /**
     * Tampilkan popup feedback salah (tetap positif).
     * @param {number} x - Posisi X
     * @param {number} y - Posisi Y
     */
    showTryAgain(x, y) {
        const msg = Phaser.Math.RND.pick(this.tryAgainMessages);
        this._showPopup(msg, x, y - 40, '#FFD93D', 24);
    }

    /**
     * Tampilkan popup celebration saat level selesai.
     * Tampil di tengah layar dengan ukuran besar.
     * 
     * FIX: Menggunakan container-based buttons yang reliable
     * untuk "Main Lagi" dan "Kembali ke Menu".
     */
    showLevelComplete() {
        const msg = Phaser.Math.RND.pick(this.completeMessages);
        const centerX = this.scene.cameras.main.centerX;
        const centerY = this.scene.cameras.main.centerY;

        // Background overlay (semi-transparan)
        const overlay = this.scene.add.graphics();
        overlay.fillStyle(0x000000, 0.5);
        overlay.fillRect(0, 0, 1280, 720);
        overlay.setDepth(300);
        overlay.setAlpha(0);

        // Teks celebration besar
        const text = this.scene.add.text(centerX, centerY - 50, msg, {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '56px',
            fontStyle: 'bold',
            color: '#FFD700',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: {
                offsetX: 2,
                offsetY: 4,
                color: '#000000',
                blur: 8,
                fill: true
            }
        }).setOrigin(0.5).setDepth(301).setScale(0);

        // Sub-text "Semua bentuk cocok!"
        const subText = this.scene.add.text(centerX, centerY + 25, 'Semua bentuk cocok! 🧩', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setDepth(301).setAlpha(0);

        // --- Tombol "Main Lagi" ---
        const playAgainBtn = this._createCompleteButton(
            centerX - 120, centerY + 100,
            '🔄 Main Lagi',
            0x4ECB71,
            0x5AE085,
            () => {
                this.scene.scene.restart();
            }
        );

        // --- Tombol "Kembali ke Menu" ---
        const menuBtn = this._createCompleteButton(
            centerX + 120, centerY + 100,
            '🏠 Menu',
            0x4A90D9,
            0x5BA3E0,
            () => {
                this.scene.cameras.main.fadeOut(300, 0, 0, 0);
                this.scene.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.scene.start('MenuScene');
                });
            }
        );

        // --- Animasi masuk ---
        // Overlay fade in
        this.scene.tweens.add({
            targets: overlay,
            alpha: 1,
            duration: 300,
            ease: 'Sine.easeOut'
        });

        // Teks utama bounce in
        this.scene.tweens.add({
            targets: text,
            scaleX: 1,
            scaleY: 1,
            duration: 500,
            delay: 200,
            ease: 'Back.easeOut'
        });

        // Sub-text fade in
        this.scene.tweens.add({
            targets: subText,
            alpha: 1,
            duration: 300,
            delay: 600,
            ease: 'Sine.easeOut'
        });

        // Tombol-tombol fade in
        this.scene.tweens.add({
            targets: [playAgainBtn, menuBtn],
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 400,
            delay: 900,
            ease: 'Back.easeOut'
        });
    }

    /**
     * Helper: buat tombol untuk level complete screen.
     * Menggunakan container dengan interactive langsung — RELIABLE.
     * 
     * @param {number} x - Center X
     * @param {number} y - Center Y
     * @param {string} label - Teks tombol
     * @param {number} color - Warna normal
     * @param {number} hoverColor - Warna hover
     * @param {Function} onClick - Callback saat diklik
     * @returns {Phaser.GameObjects.Container} Container tombol
     */
    _createCompleteButton(x, y, label, color, hoverColor, onClick) {
        const btnWidth = 180;
        const btnHeight = 55;

        const container = this.scene.add.container(x, y);
        container.setDepth(302);
        container.setAlpha(0);
        container.setScale(0);

        // Background
        const bg = this.scene.add.graphics();
        bg.fillStyle(color, 1);
        bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 27);
        bg.lineStyle(2, 0xffffff, 0.2);
        bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 27);
        container.add(bg);

        // Label
        const text = this.scene.add.text(0, 0, label, {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        container.add(text);

        // Interactive pada container langsung
        container.setSize(btnWidth + 10, btnHeight + 10);
        container.setInteractive(
            new Phaser.Geom.Rectangle(
                -(btnWidth + 10) / 2, -(btnHeight + 10) / 2,
                btnWidth + 10, btnHeight + 10
            ),
            Phaser.Geom.Rectangle.Contains
        );

        const redrawBg = (fillColor, borderAlpha) => {
            bg.clear();
            bg.fillStyle(fillColor, 1);
            bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 27);
            bg.lineStyle(2, 0xffffff, borderAlpha);
            bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 27);
        };

        container.on('pointerover', () => {
            redrawBg(hoverColor, 0.4);
            this.scene.tweens.add({
                targets: container,
                scaleX: 1.08,
                scaleY: 1.08,
                duration: 100,
                ease: 'Sine.easeOut'
            });
        });

        container.on('pointerout', () => {
            redrawBg(color, 0.2);
            this.scene.tweens.add({
                targets: container,
                scaleX: 1.0,
                scaleY: 1.0,
                duration: 100,
                ease: 'Sine.easeOut'
            });
        });

        container.on('pointerdown', () => {
            this.scene.tweens.add({
                targets: container,
                scaleX: 0.92,
                scaleY: 0.92,
                duration: 60,
                yoyo: true,
                ease: 'Sine.easeInOut'
            });

            // Fire callback langsung tanpa menunggu animasi
            if (onClick) onClick();
        });

        return container;
    }

    /**
     * Helper: tampilkan popup teks dengan animasi naik + fade out.
     * @param {string} message - Pesan yang ditampilkan
     * @param {number} x - Posisi X
     * @param {number} y - Posisi Y
     * @param {string} color - Warna teks (CSS color string)
     * @param {number} fontSize - Ukuran font
     */
    _showPopup(message, x, y, color, fontSize) {
        const text = this.scene.add.text(x, y, message, {
            fontFamily: 'Nunito, sans-serif',
            fontSize: `${fontSize}px`,
            fontStyle: 'bold',
            color: color,
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: {
                offsetX: 1,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                fill: true
            }
        }).setOrigin(0.5).setDepth(250);

        // Animasi: scale in → float up → fade out
        text.setScale(0);

        this.scene.tweens.add({
            targets: text,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 200,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: text,
                    y: y - 50,
                    alpha: 0,
                    scaleX: 0.8,
                    scaleY: 0.8,
                    duration: 800,
                    delay: 400,
                    ease: 'Sine.easeIn',
                    onComplete: () => text.destroy()
                });
            }
        });
    }
}
