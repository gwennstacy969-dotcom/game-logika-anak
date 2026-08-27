-- ============================================
-- Database Schema — Game Logika & Matematika Dasar
-- ============================================
-- Jalankan script ini di MySQL untuk membuat database dan tabel.

CREATE DATABASE IF NOT EXISTS game_logika_anak
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE game_logika_anak;

-- Tabel utama: menyimpan skor setiap sesi bermain
CREATE TABLE IF NOT EXISTS skor_anak (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nama_anak       VARCHAR(100) NOT NULL COMMENT 'Nama anak yang bermain',
    level_id        VARCHAR(50)  NOT NULL COMMENT 'ID level (misal: shape_sort_1)',
    jumlah_bintang  INT          NOT NULL DEFAULT 0 COMMENT 'Bintang yang dikumpulkan (0-4)',
    waktu_bermain   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu sesi bermain selesai',

    -- Index untuk query per anak
    INDEX idx_nama_anak (nama_anak),
    INDEX idx_level_id (level_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Riwayat skor bermain anak';
