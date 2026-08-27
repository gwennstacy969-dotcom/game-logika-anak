/**
 * ============================================
 * AudioManager — Manajemen Audio Game
 * ============================================
 * 
 * Menggunakan Web Audio API untuk menghasilkan sound effect
 * secara programatis (tidak perlu file audio eksternal).
 * 
 * Suara yang tersedia:
 * - correct  : Nada naik ceria saat jawaban benar
 * - wrong    : Nada rendah lembut saat jawaban salah
 * - snap     : Suara klik pendek saat shape snap ke posisi
 * - star     : Bling! saat bintang muncul
 * - celebrate: Fanfare saat level selesai
 * - pop      : Suara pop saat tombol ditekan
 */
export class AudioManager {

    constructor() {
        /** @type {AudioContext|null} */
        this.ctx = null;
        /** @type {boolean} Apakah audio sudah di-unlock oleh interaksi user */
        this.unlocked = false;
        /** @type {number} Volume master (0-1) */
        this.masterVolume = 0.4;
    }

    /**
     * Inisialisasi AudioContext.
     * HARUS dipanggil dari event handler user interaction (click/touch)
     * karena browser memblokir auto-play audio.
     */
    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.unlocked = true;
    }

    /**
     * Pastikan AudioContext aktif (resume jika suspended).
     */
    _ensureContext() {
        if (!this.ctx) this.init();
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    /**
     * Helper: mainkan nada sinusoidal.
     * @param {number} frequency - Frekuensi dalam Hz
     * @param {number} duration - Durasi dalam detik
     * @param {number} startTime - Waktu mulai relatif terhadap ctx.currentTime
     * @param {string} type - Tipe oscillator ('sine', 'triangle', 'square', 'sawtooth')
     * @param {number} volume - Volume (0-1)
     */
    _playTone(frequency, duration, startTime = 0, type = 'sine', volume = 0.3) {
        this._ensureContext();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime + startTime);

        // Envelope: attack cepat, decay halus
        const t = this.ctx.currentTime + startTime;
        const vol = volume * this.masterVolume;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(vol, t + 0.02);  // Attack 20ms
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration); // Decay

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + duration);
    }

    /**
     * 🎵 Suara benar — nada naik ceria (C5 → E5 → G5)
     */
    playCorrect() {
        this._playTone(523.25, 0.15, 0, 'triangle', 0.4);     // C5
        this._playTone(659.25, 0.15, 0.1, 'triangle', 0.4);   // E5
        this._playTone(783.99, 0.25, 0.2, 'triangle', 0.5);   // G5
    }

    /**
     * 🔉 Suara salah — nada rendah lembut (tidak menakutkan)
     */
    playWrong() {
        this._playTone(220, 0.3, 0, 'sine', 0.2);   // A3, pelan
        this._playTone(196, 0.3, 0.1, 'sine', 0.15); // G3, lebih pelan
    }

    /**
     * 🔘 Suara snap / klik pendek
     */
    playSnap() {
        this._playTone(880, 0.06, 0, 'square', 0.15); // Klik tajam pendek
    }

    /**
     * ⭐ Suara bintang muncul — bling!
     */
    playStar() {
        this._playTone(1318.5, 0.08, 0, 'sine', 0.3);    // E6
        this._playTone(1568.0, 0.12, 0.06, 'sine', 0.35); // G6
    }

    /**
     * 🎉 Fanfare celebration — saat level selesai
     */
    playCelebrate() {
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            this._playTone(freq, 0.2, i * 0.12, 'triangle', 0.4);
        });
        // Akord akhir
        this._playTone(523.25, 0.5, 0.55, 'triangle', 0.3);
        this._playTone(659.25, 0.5, 0.55, 'triangle', 0.3);
        this._playTone(783.99, 0.5, 0.55, 'triangle', 0.3);
        this._playTone(1046.5, 0.5, 0.55, 'triangle', 0.35);
    }

    /**
     * 👆 Suara pop untuk tombol
     */
    playPop() {
        this._playTone(660, 0.08, 0, 'sine', 0.2);
    }
}
