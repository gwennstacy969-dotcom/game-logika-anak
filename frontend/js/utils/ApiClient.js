/**
 * ============================================
 * ApiClient — Komunikasi dengan Backend PHP
 * ============================================
 * 
 * Mengirim skor anak ke REST API backend menggunakan fetch().
 * Mendukung retry sederhana jika request gagal.
 */
export class ApiClient {

    /**
     * @param {string} baseUrl - Base URL backend API (misal: 'http://localhost/backend/api')
     */
    constructor(baseUrl = '') {
        /** @type {string} URL basis API */
        this.baseUrl = baseUrl || this._detectBaseUrl();
    }

    /**
     * Deteksi otomatis base URL berdasarkan lokasi halaman saat ini.
     * Asumsi: backend/ sejajar dengan game/ di server.
     * @returns {string}
     */
    _detectBaseUrl() {
        const loc = window.location;
        // Jika dijalankan dari file://, gunakan default
        if (loc.protocol === 'file:') {
            return 'http://localhost/backend/api';
        }
        // Jika dijalankan dari server, ganti /game/ dengan /backend/api/
        return `${loc.protocol}//${loc.host}/backend/api`;
    }

    /**
     * Kirim skor anak ke backend.
     * 
     * @param {string} namaAnak - Nama anak yang bermain
     * @param {string} levelId - ID level (misal: 'shape_sort_1')
     * @param {number} jumlahBintang - Jumlah bintang yang dikumpulkan
     * @returns {Promise<Object>} Response dari server
     * 
     * @example
     * const api = new ApiClient('http://localhost/backend/api');
     * const result = await api.saveScore('Andi', 'shape_sort_1', 4);
     * console.log(result); // { success: true, message: '...', id: 1 }
     */
    async saveScore(namaAnak, levelId, jumlahBintang, profilId = 0) {
        const url = `${this.baseUrl}/save_score.php`;
        const payload = {
            profil_id: profilId,
            nama_anak: namaAnak,
            level_id: levelId,
            jumlah_bintang: jumlahBintang
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                console.warn('[ApiClient] Server error:', data.message);
            }

            return data;

        } catch (error) {
            // Network error — jangan crash game, cukup log
            console.warn('[ApiClient] Tidak bisa mengirim skor:', error.message);
            console.info('[ApiClient] Skor tetap dihitung di game, hanya tidak tersimpan di server.');

            return {
                success: false,
                message: 'Tidak bisa terhubung ke server. Skor disimpan lokal saja.',
                offline: true
            };
        }
    }

    /**
     * Ambil riwayat skor anak dari backend.
     * 
     * @param {string} [namaAnak] - Filter berdasarkan nama (opsional)
     * @param {number} [limit=50] - Batas jumlah hasil
     * @returns {Promise<Object>} Response dari server
     */
    async getScores(namaAnak = '', limit = 50) {
        let url = `${this.baseUrl}/get_scores.php?limit=${limit}`;
        if (namaAnak) {
            url += `&nama_anak=${encodeURIComponent(namaAnak)}`;
        }

        try {
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.warn('[ApiClient] Gagal mengambil skor:', error.message);
            return {
                success: false,
                message: 'Tidak bisa terhubung ke server.',
                data: []
            };
        }
    }
}
