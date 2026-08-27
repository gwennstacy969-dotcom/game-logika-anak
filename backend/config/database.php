<?php
/**
 * ============================================
 * Database Configuration
 * Game Logika & Matematika Dasar
 * ============================================
 * 
 * Konfigurasi koneksi PDO ke MySQL.
 * Sesuaikan kredensial di bawah ini dengan server Anda.
 */

// --- Kredensial Database ---
// PENTING: Ganti nilai-nilai ini sesuai environment Anda!
define('DB_HOST', 'localhost');
define('DB_NAME', 'game_logika_anak');
define('DB_USER', 'root');
define('DB_PASS', '');           // Isi password MySQL Anda
define('DB_CHARSET', 'utf8mb4');

/**
 * Membuat koneksi PDO ke database MySQL.
 * 
 * @return PDO Instance koneksi database
 * @throws PDOException Jika koneksi gagal
 */
function getDBConnection(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        $dsn = sprintf(
            'mysql:host=%s;dbname=%s;charset=%s',
            DB_HOST,
            DB_NAME,
            DB_CHARSET
        );

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,   // Lempar exception saat error
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,         // Fetch sebagai associative array
            PDO::ATTR_EMULATE_PREPARES   => false,                    // Gunakan prepared statement asli
        ];

        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            // Jangan tampilkan detail error di production!
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Koneksi database gagal. Silakan cek konfigurasi.'
            ]);
            exit;
        }
    }

    return $pdo;
}
