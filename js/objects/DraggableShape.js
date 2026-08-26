/**
 * ============================================
 * DraggableShape — Objek Bentuk yang Bisa Di-drag
 * ============================================
 * 
 * Setiap shape memiliki:
 * - shapeType: tipe bentuk ('circle', 'triangle', 'square', 'star')
 * - Posisi awal yang disimpan untuk bounce-back
 * - Status isPlaced untuk menandai sudah cocok
 * - Visual: sprite dengan warna cerah dan shadow
 * 
 * FIX: Menggunakan scene.input.setDraggable() secara eksplisit
 * untuk memastikan drag bekerja di semua versi Phaser 3.
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

        /** @type {number} Warna bentuk */
        this.shapeColor = color;

        /** @type {number} Ukuran bentuk */
        this.shapeSize = size;

        // --- Buat visual bentuk ---
        this._createVisual();

        // --- Setup interaksi drag ---
        this._setupInteraction();

        // Mulai dalam keadaan non-interactive.
        // Scene harus memanggil enableDrag() setelah animasi masuk selesai.
        this.disableInteractive();

        // Tambahkan ke scene
        scene.add.existing(this);
    }

    /**
     * Buat grafik visual bentuk dengan shadow dan gradient-like effect.
     */
    _createVisual() {
        const s = this.shapeSize;
        const color = this.shapeColor;

        // Shadow (dark version di belakang, offset ke bawah)
        const shadow = this.scene.add.graphics();
        this._drawShape(shadow, this.shapeType, 0, 4, s, 0x000000, 0.2);
        this.add(shadow);

        // Main shape (bentuk utama berwarna cerah)
        const main = this.scene.add.graphics();
        this._drawShape(main, this.shapeType, 0, 0, s, color, 1);
        this.add(main);

        // Highlight (versi terang kecil di atas untuk efek 3D)
        const highlight = this.scene.add.graphics();
        this._drawShape(highlight, this.shapeType, 0, -2, s * 0.7, 
            Phaser.Display.Color.ValueToColor(color).lighten(30).color, 0.4);
        this.add(highlight);

        // Label nama bentuk di bawah (opsional, untuk edukasi)
        const labels = {
            circle: '●',
            triangle: '▲',
            square: '■',
            star: '★'
        };
    }

    /**
     * Gambar bentuk tertentu ke graphics object.
     * @param {Phaser.GameObjects.Graphics} graphics 
     * @param {string} type - Tipe bentuk
     * @param {number} offsetX - Offset X
     * @param {number} offsetY - Offset Y
     * @param {number} size - Ukuran
     * @param {number} color - Warna hex
     * @param {number} alpha - Transparansi
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
                    offsetX, offsetY - half,           // Atas
                    offsetX - half, offsetY + half,    // Kiri bawah
                    offsetX + half, offsetY + half     // Kanan bawah
                );
                break;

            case 'square':
                // Persegi dengan sudut sedikit rounded (via fillRect)
                graphics.fillRect(
                    offsetX - half, offsetY - half,
                    size, size
                );
                break;

            case 'star':
                this._drawStar(graphics, offsetX, offsetY, half, half * 0.45, 5);
                break;
        }
    }

    /**
     * Gambar bintang 5 titik.
     * @param {Phaser.GameObjects.Graphics} graphics
     * @param {number} cx - Center X
     * @param {number} cy - Center Y
     * @param {number} outerR - Radius luar
     * @param {number} innerR - Radius dalam
     * @param {number} points - Jumlah titik
     */
    _drawStar(graphics, cx, cy, outerR, innerR, points) {
        const step = Math.PI / points;
        const vertices = [];

        for (let i = 0; i < 2 * points; i++) {
            const radius = i % 2 === 0 ? outerR : innerR;
            const angle = i * step - Math.PI / 2; // Mulai dari atas
            vertices.push(new Phaser.Geom.Point(
                cx + radius * Math.cos(angle),
                cy + radius * Math.sin(angle)
            ));
        }

        graphics.fillPoints(vertices, true);
    }

    /**
     * Setup interaksi: buat hitbox besar yang ramah anak.
     * Hitbox 1.5x lebih besar dari visual untuk kemudahan sentuh.
     * 
     * FIX: Panggil scene.input.setDraggable() secara eksplisit
     * setelah setInteractive(). Ini memastikan Phaser 3 mendaftarkan
     * container ini ke drag system dengan benar.
     */
    _setupInteraction() {
        const hitSize = this.shapeSize * 1.5;

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

        // FIX: Eksplisit daftarkan ke drag system Phaser
        this.scene.input.setDraggable(this);
    }

    /**
     * Aktifkan drag setelah animasi masuk selesai.
     * Dipanggil dari scene saat shape sudah visible dan siap dimainkan.
     */
    enableDrag() {
        this.setInteractive(
            new Phaser.Geom.Rectangle(
                -this.shapeSize * 1.5 / 2, -this.shapeSize * 1.5 / 2,
                this.shapeSize * 1.5, this.shapeSize * 1.5
            ),
            Phaser.Geom.Rectangle.Contains
        );
        this.scene.input.setDraggable(this);
    }

    /**
     * Efek visual saat shape diangkat (picked up).
     * Dipanggil saat dragstart.
     */
    setPickedUp() {
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.15,
            scaleY: 1.15,
            duration: 100,
            ease: 'Back.easeOut'
        });
        // Naikkan depth agar di atas shape lain
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
     * @param {number} targetX - Posisi X target
     * @param {number} targetY - Posisi Y target
     * @param {Function} [onComplete] - Callback saat selesai
     */
    snapToZone(targetX, targetY, onComplete) {
        this.isPlaced = true;
        this.disableInteractive(); // Tidak bisa di-drag lagi

        this.scene.tweens.add({
            targets: this,
            x: targetX,
            y: targetY,
            scaleX: 1.0,
            scaleY: 1.0,
            duration: 250,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Pulse kecil sebagai konfirmasi visual
                this.scene.tweens.add({
                    targets: this,
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 150,
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
            x: this.x + 10,
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
                    ease: 'Bounce.easeOut'
                });
            }
        });
    }
}
