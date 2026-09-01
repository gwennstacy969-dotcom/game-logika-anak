export class Confetti {
    /**
     * Membuat ledakan confetti di layar.
     * @param {Phaser.Scene} scene - Scene tempat confetti dibuat
     * @param {number} x - Koordinat X
     * @param {number} y - Koordinat Y
     */
    static burst(scene, x, y) {
        // Buat tekstur kotak kecil untuk partikel jika belum ada
        if (!scene.textures.exists('confetti_particle')) {
            const g = scene.add.graphics();
            g.fillStyle(0xffffff, 1);
            g.fillRect(0, 0, 10, 10);
            g.generateTexture('confetti_particle', 10, 10);
            g.destroy();
        }

        // Warna-warna ceria untuk confetti
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];

        // Buat emitter
        const emitter = scene.add.particles(x, y, 'confetti_particle', {
            speed: { min: 200, max: 600 },
            angle: { min: 220, max: 320 }, // Meledak ke atas
            scale: { start: 1, end: 0 },
            gravityY: 500, // Jatuh ke bawah
            lifespan: 2000,
            tint: colors,
            emitting: false // Jangan meledak terus-terusan
        });

        // Meledakkan sejumlah partikel sekaligus
        emitter.explode(100);

        // Hapus emitter setelah selesai untuk menghemat memori
        scene.time.delayedCall(2500, () => {
            emitter.destroy();
        });
    }
}
