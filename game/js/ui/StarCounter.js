/**
 * ============================================
 * StarCounter — UI Penghitung Bintang
 * ============================================
 * 
 * Menampilkan bintang yang dikumpulkan di pojok atas layar.
 * Bintang baru muncul dengan animasi bounce yang menyenangkan.
 */
export class StarCounter extends Phaser.GameObjects.Container {

    /**
     * @param {Phaser.Scene} scene - Scene tempat counter ditampilkan
     * @param {number} x - Posisi X
     * @param {number} y - Posisi Y
     * @param {number} totalStars - Total bintang yang bisa dikumpulkan
     */
    constructor(scene, x, y, totalStars = 4) {
        super(scene, x, y);

        /** @type {number} Jumlah bintang saat ini */
        this.currentStars = 0;

        /** @type {number} Total bintang */
        this.totalStars = totalStars;

        /** @type {Phaser.GameObjects.Text[]} Array teks bintang */
        this.starIcons = [];

        // Buat visual
        this._createVisual();

        // Set depth tinggi agar selalu di atas
        this.setDepth(200);

        scene.add.existing(this);
    }

    /**
     * Buat tampilan visual: icon bintang kosong/penuh + teks.
     */
    _createVisual() {
        // Background panel (semi-transparan)
        const panelWidth = 60 + this.totalStars * 45;
        const panel = this.scene.add.graphics();
        panel.fillStyle(0x000000, 0.3);
        panel.fillRoundedRect(-10, -20, panelWidth, 52, 16);
        this.add(panel);

        // Icon bintang (kosong dulu)
        for (let i = 0; i < this.totalStars; i++) {
            const star = this.scene.add.text(i * 45, 0, '☆', {
                fontFamily: 'Nunito, sans-serif',
                fontSize: '32px',
                color: '#555555'
            }).setOrigin(0, 0.5);

            this.starIcons.push(star);
            this.add(star);
        }
    }

    /**
     * Tambah satu bintang dengan animasi.
     * @returns {number} Jumlah bintang saat ini
     */
    addStar() {
        if (this.currentStars >= this.totalStars) return this.currentStars;

        const starIcon = this.starIcons[this.currentStars];
        
        // Ubah ke bintang penuh dengan warna emas
        starIcon.setText('★');
        starIcon.setStyle({ color: '#FFD700' });

        // Animasi bounce saat muncul
        starIcon.setScale(0);
        this.scene.tweens.add({
            targets: starIcon,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 200,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: starIcon,
                    scaleX: 1.0,
                    scaleY: 1.0,
                    duration: 150,
                    ease: 'Sine.easeInOut'
                });
            }
        });

        this.currentStars++;
        return this.currentStars;
    }

    /**
     * Cek apakah semua bintang sudah terkumpul.
     * @returns {boolean}
     */
    isComplete() {
        return this.currentStars >= this.totalStars;
    }

    /**
     * Reset counter ke 0.
     */
    reset() {
        this.currentStars = 0;
        this.starIcons.forEach(star => {
            star.setText('☆');
            star.setStyle({ color: '#555555' });
            star.setScale(1);
        });
    }
}
