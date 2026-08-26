/**
 * ============================================
 * DropZone — Zona Target untuk Shape Sorting
 * ============================================
 * 
 * Menampilkan outline/silhouette bentuk yang diharapkan.
 * Saat shape yang benar masuk, zone berubah menjadi "filled".
 */
export class DropZone extends Phaser.GameObjects.Container {

    /**
     * @param {Phaser.Scene} scene - Scene tempat zona ditampilkan
     * @param {number} x - Posisi X zona
     * @param {number} y - Posisi Y zona
     * @param {string} acceptedShape - Tipe bentuk yang diterima ('circle'|'triangle'|'square'|'star')
     * @param {number} color - Warna outline hex
     * @param {number} size - Ukuran zona
     */
    constructor(scene, x, y, acceptedShape, color, size = 100) {
        super(scene, x, y);

        /** @type {string} Tipe bentuk yang diterima */
        this.acceptedShape = acceptedShape;

        /** @type {boolean} Apakah zona sudah terisi */
        this.isFilled = false;

        /** @type {number} Warna zona */
        this.zoneColor = color;

        /** @type {number} Ukuran zona */
        this.zoneSize = size;

        /** @type {number} Radius deteksi (untuk jarak drop) */
        this.detectionRadius = size * 0.8;

        // Buat visual
        this._createVisual();

        // Tambahkan ke scene
        scene.add.existing(this);
    }

    /**
     * Buat visual outline bentuk sebagai panduan anak.
     * Menggunakan dashed outline dengan glow effect.
     */
    _createVisual() {
        const s = this.zoneSize;
        const color = this.zoneColor;

        // Background circle/area dengan warna transparan
        const bg = this.scene.add.graphics();
        bg.fillStyle(color, 0.08);
        bg.fillCircle(0, 0, s * 0.7);
        this.add(bg);

        // Outline bentuk (dashed look via multiple segments)
        this.outlineGraphics = this.scene.add.graphics();
        this._drawOutline(this.outlineGraphics, this.acceptedShape, s, color, 0.4);
        this.add(this.outlineGraphics);

        // Pulse animation untuk menarik perhatian anak
        this.scene.tweens.add({
            targets: this.outlineGraphics,
            alpha: { from: 0.3, to: 0.6 },
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Label bentuk di bawah zona (opsional)
        const labelMap = {
            circle: 'Lingkaran',
            triangle: 'Segitiga',
            square: 'Persegi',
            star: 'Bintang'
        };

        this.label = this.scene.add.text(0, s * 0.65, labelMap[this.acceptedShape] || '', {
            fontFamily: 'Nunito, sans-serif',
            fontSize: '16px',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0.6);
        this.add(this.label);
    }

    /**
     * Gambar outline bentuk.
     * @param {Phaser.GameObjects.Graphics} graphics
     * @param {string} type - Tipe bentuk
     * @param {number} size - Ukuran
     * @param {number} color - Warna
     * @param {number} alpha - Transparansi
     */
    _drawOutline(graphics, type, size, color, alpha) {
        graphics.lineStyle(3, color, alpha);

        const half = size / 2;

        switch (type) {
            case 'circle':
                graphics.strokeCircle(0, 0, half);
                break;

            case 'triangle':
                graphics.strokeTriangle(
                    0, -half,
                    -half, half,
                    half, half
                );
                break;

            case 'square':
                graphics.strokeRect(-half, -half, size, size);
                break;

            case 'star':
                this._strokeStar(graphics, 0, 0, half, half * 0.45, 5, color, alpha);
                break;
        }
    }

    /**
     * Gambar outline bintang.
     */
    _strokeStar(graphics, cx, cy, outerR, innerR, points, color, alpha) {
        graphics.lineStyle(3, color, alpha);
        const step = Math.PI / points;
        const vertices = [];

        for (let i = 0; i < 2 * points; i++) {
            const radius = i % 2 === 0 ? outerR : innerR;
            const angle = i * step - Math.PI / 2;
            vertices.push(new Phaser.Geom.Point(
                cx + radius * Math.cos(angle),
                cy + radius * Math.sin(angle)
            ));
        }

        graphics.strokePoints(vertices, true);
    }

    /**
     * Cek apakah shape yang di-drop cocok dan cukup dekat.
     * @param {DraggableShape} shape - Shape yang di-drop
     * @returns {boolean} true jika cocok
     */
    checkMatch(shape) {
        if (this.isFilled) return false;

        // Cek jarak antara shape dan center zona
        const distance = Phaser.Math.Distance.Between(
            shape.x, shape.y,
            this.x, this.y
        );

        // Cek tipe bentuk cocok DAN jarak cukup dekat
        return (distance <= this.detectionRadius) && 
               (shape.shapeType === this.acceptedShape);
    }

    /**
     * Tandai zona sebagai terisi.
     * Hentikan pulse animation dan tunjukkan visual "filled".
     */
    markFilled() {
        this.isFilled = true;

        // Stop pulse animation
        this.scene.tweens.killTweensOf(this.outlineGraphics);
        this.outlineGraphics.setAlpha(0.2);

        // Glow effect saat terisi
        const glow = this.scene.add.graphics();
        glow.fillStyle(this.zoneColor, 0.15);
        glow.fillCircle(0, 0, this.zoneSize * 0.7);
        this.add(glow);

        // Fade in glow
        glow.setAlpha(0);
        this.scene.tweens.add({
            targets: glow,
            alpha: 0.3,
            duration: 300,
            ease: 'Sine.easeOut'
        });

        // Sembunyikan label
        this.scene.tweens.add({
            targets: this.label,
            alpha: 0,
            duration: 200
        });
    }
}
