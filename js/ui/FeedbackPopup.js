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
        const text = this.scene.add.text(centerX, centerY - 30, msg, {
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
        const subText = this.scene.add.text(centerX, centerY + 50, 'Semua bentuk cocok! 🧩', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setDepth(301).setAlpha(0);

        // Tombol "Main Lagi"
        const btnBg = this.scene.add.graphics();
        btnBg.fillStyle(0x4ECB71, 1);
        btnBg.fillRoundedRect(centerX - 100, centerY + 100, 200, 60, 30);
        btnBg.setDepth(301).setAlpha(0);

        const btnText = this.scene.add.text(centerX, centerY + 130, '🔄 Main Lagi', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setDepth(302).setAlpha(0);

        // Buat tombol interactive
        const btnZone = this.scene.add.zone(centerX, centerY + 130, 200, 60)
            .setInteractive({ useHandCursor: true })
            .setDepth(303)
            .setAlpha(0);

        btnZone.on('pointerover', () => {
            btnBg.clear();
            btnBg.fillStyle(0x5AE085, 1);
            btnBg.fillRoundedRect(centerX - 100, centerY + 100, 200, 60, 30);
        });

        btnZone.on('pointerout', () => {
            btnBg.clear();
            btnBg.fillStyle(0x4ECB71, 1);
            btnBg.fillRoundedRect(centerX - 100, centerY + 100, 200, 60, 30);
        });

        btnZone.on('pointerdown', () => {
            // Restart scene
            this.scene.scene.restart();
        });

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

        // Tombol fade in
        this.scene.tweens.add({
            targets: [btnBg, btnText, btnZone],
            alpha: 1,
            duration: 300,
            delay: 900,
            ease: 'Sine.easeOut'
        });
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
