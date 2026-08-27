/**
 * ============================================
 * DraggableShape — Objek Bentuk yang Bisa Di-drag
 * ============================================
 * 
 * Setiap shape memiliki:
 * - shapeType: tipe bentuk ('circle', 'triangle', 'square', 'star')
 * - Posisi awal yang disimpan untuk bounce-back
 * - Status isPlaced untuk menandai sudah cocok
 * - canDrag flag untuk kontrol kapan drag diperbolehkan
 * - Visual: bentuk 3D dengan shadow, highlight, glow, dan outline
 */
export class DraggableShape extends Phaser.GameObjects.Container {

    /**
     * @param {Phaser.Scene} scene - Scene tempat shape ditampilkan
     * @param {number} x - Posisi X awal
     * @param {number} y - Posisi Y awal
     * @param {string} shapeType - Tipe bentuk ('circle'|'triangle'|'square'|'star')
     * @param {number} color - Warna hex (misal: 0xFF6B35)
     * @param {number} size - Ukuran bentuk dalam pixel
     */
    constructor(scene, x, y, shapeType, color, size = 90) {
        super(scene, x, y);

        /** @type {string} Tipe bentuk untuk matching */
        this.shapeType = shapeType;

        /** @type {number} Posisi X awal (untuk bounce-back) */
        this.originalX = x;
        /** @type {number} Posisi Y awal (untuk bounce-back) */
        this.originalY = y;

        /** @type {boolean} Apakah sudah ditempatkan di zona yang benar */
        this.isPlaced = false;

        /** @type {boolean} Apakah shape boleh di-drag (diset oleh scene) */
        this.canDrag = false;

        /** @type {number} Warna bentuk */
        this.shapeColor = color;

        /** @type {number} Ukuran bentuk */
        this.shapeSize = size;

        // --- Buat visual bentuk ---
        this._createVisual();

        // --- Setup interaksi drag ---
        this._setupInteraction();

        // Tambahkan ke scene
        scene.add.existing(this);
    }

    /**
     * Buat grafik visual bentuk dengan shadow, outline, glow, dan highlight.
     * Memberikan tampilan 3D yang menarik untuk anak-anak.
     */
    _createVisual() {
        const s = this.shapeSize;
        const color = this.shapeColor;

        // 1. Outer glow (soft spread di belakang)
        const glow = this.scene.add.graphics();
        this._drawShape(glow, this.shapeType, 0, 0, s * 1.25, color, 0.12);
        this.add(glow);

        // 2. Shadow (dark version offset ke bawah-kanan)
        const shadow = this.scene.add.graphics();
        this._drawShape(shadow, this.shapeType, 3, 5, s, 0x000000, 0.25);
        this.add(shadow);

        // 3. Main shape (bentuk utama berwarna cerah)
        const main = this.scene.add.graphics();
        this._drawShape(main, this.shapeType, 0, 0, s, color, 1);
        this.add(main);

        // 4. Outline stroke untuk kejelasan bentuk
        const outline = this.scene.add.graphics();
        this._drawShapeOutline(outline, this.shapeType, 0, 0, s, 
            Phaser.Display.Color.ValueToColor(color).darken(25).color, 0.5);
        this.add(outline);

        // 5. Inner highlight (efek cahaya 3D dari atas)
        const highlight = this.scene.add.graphics();
        this._drawShape(highlight, this.shapeType, -1, -3, s * 0.55,
            Phaser.Display.Color.ValueToColor(color).lighten(45).color, 0.45);
        this.add(highlight);

        // 6. Titik cahaya kecil (specular highlight)
        const specular = this.scene.add.graphics();
        specular.fillStyle(0xffffff, 0.6);
        specular.fillCircle(-s * 0.12, -s * 0.15, s * 0.08);
        this.add(specular);
    }

    /**
     * Gambar bentuk tertentu ke graphics object.
     */
    _drawShape(graphics, type, offsetX, offsetY, size, color, alpha) {
        graphics.fillStyle(color, alpha);
        const half = size / 2;

        switch (type) {
            case 'circle':
                graphics.fillCircle(offsetX, offsetY, half);
                break;
            case 'triangle':
                graphics.fillTriangle(
                    offsetX, offsetY - half,
                    offsetX - half, offsetY + half,
                    offsetX + half, offsetY + half
                );
                break;
            case 'square':
                graphics.fillRoundedRect(
                    offsetX - half, offsetY - half,
                    size, size, size * 0.12
                );
                break;
            case 'star':
                this._drawStar(graphics, offsetX, offsetY, half, half * 0.45, 5);
                break;
        }
    }

    /**
     * Gambar outline (stroke) bentuk.
     */
    _drawShapeOutline(graphics, type, offsetX, offsetY, size, color, alpha) {
        graphics.lineStyle(2.5, color, alpha);
        const half = size / 2;

        switch (type) {
            case 'circle':
                graphics.strokeCircle(offsetX, offsetY, half);
                break;
            case 'triangle':
                graphics.strokeTriangle(
                    offsetX, offsetY - half,
                    offsetX - half, offsetY + half,
                    offsetX + half, offsetY + half
                );
                break;
            case 'square':
                graphics.strokeRoundedRect(
                    offsetX - half, offsetY - half,
                    size, size, size * 0.12
                );
                break;
            case 'star':
                this._strokeStar(graphics, offsetX, offsetY, half, half * 0.45, 5, color, alpha);
                break;
        }
    }

    /**
     * Gambar bintang 5 titik (fill).
     */
    _drawStar(graphics, cx, cy, outerR, innerR, points) {
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
        graphics.fillPoints(vertices, true);
    }

    /**
     * Gambar bintang 5 titik (stroke).
     */
    _strokeStar(graphics, cx, cy, outerR, innerR, points, color, alpha) {
        graphics.lineStyle(2.5, color, alpha);
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
     * Setup interaksi: buat hitbox besar yang ramah anak.
     * Hitbox 2x lebih besar dari visual untuk kemudahan sentuh.
     * 
     * Menggunakan flag `canDrag` untuk kontrol — TIDAK menggunakan
     * disableInteractive/enableInteractive yang unreliable pada Container.
     */
    _setupInteraction() {
        // Hitbox 2x ukuran shape agar mudah ditap anak kecil
        const hitSize = this.shapeSize * 2;

        // Set ukuran container
        this.setSize(hitSize, hitSize);

        // Set interactive dengan hit area rectangle
        this.setInteractive(
            new Phaser.Geom.Rectangle(
                -hitSize / 2, -hitSize / 2,
                hitSize, hitSize
            ),
            Phaser.Geom.Rectangle.Contains
        );

        // Daftarkan ke drag system Phaser
        this.scene.input.setDraggable(this);
    }

    /**
     * Mulai animasi idle wobble — dipanggil setelah shape muncul.
     * Memberikan kesan "hidup" pada shape yang mengundang interaksi.
     */
    startIdleAnimation() {
        this._idleTween = this.scene.tweens.add({
            targets: this,
            angle: { from: -3, to: 3 },
            duration: Phaser.Math.Between(1800, 2500),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: Phaser.Math.Between(0, 800)
        });
    }

    /**
     * Hentikan animasi idle wobble.
     */
    stopIdleAnimation() {
        if (this._idleTween) {
            this._idleTween.stop();
            this._idleTween = null;
        }
        this.angle = 0;
    }

    /**
     * Efek visual saat shape diangkat (picked up).
     * Dipanggil saat dragstart.
     */
    setPickedUp() {
        this.stopIdleAnimation();
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.2,
            scaleY: 1.2,
            angle: 0,
            duration: 120,
            ease: 'Back.easeOut'
        });
        this.setDepth(100);
    }

    /**
     * Efek visual saat shape dilepas (dropped).
     * Dipanggil saat dragend (sebelum snap/bounce).
     */
    setDropped() {
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.0,
            scaleY: 1.0,
            duration: 100,
            ease: 'Sine.easeOut'
        });
        this.setDepth(10);
    }

    /**
     * Snap shape ke posisi zona yang benar.
     * Animasi smooth dengan ease Back.
     */
    snapToZone(targetX, targetY, onComplete) {
        this.isPlaced = true;
        this.canDrag = false;

        this.scene.tweens.add({
            targets: this,
            x: targetX,
            y: targetY,
            scaleX: 1.0,
            scaleY: 1.0,
            angle: 0,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Pulse kecil sebagai konfirmasi visual
                this.scene.tweens.add({
                    targets: this,
                    scaleX: 1.12,
                    scaleY: 1.12,
                    duration: 180,
                    yoyo: true,
                    ease: 'Sine.easeInOut'
                });
                if (onComplete) onComplete();
            }
        });
    }

    /**
     * Bounce shape kembali ke posisi awal.
     * Digunakan saat shape diletakkan di tempat yang salah.
     */
    bounceBack() {
        // Gentle shake sebelum bounce back
        this.scene.tweens.add({
            targets: this,
            x: this.x + 12,
            duration: 50,
            yoyo: true,
            repeat: 2,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                // Bounce back ke posisi awal
                this.scene.tweens.add({
                    targets: this,
                    x: this.originalX,
                    y: this.originalY,
                    scaleX: 1.0,
                    scaleY: 1.0,
                    duration: 500,
                    ease: 'Back.easeOut',
                    onComplete: () => {
                        // Restart idle animation setelah kembali
                        this.startIdleAnimation();
                    }
                });
            }
        });
    }
}
