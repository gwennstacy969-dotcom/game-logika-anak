<?php
/**
 * ============================================
 * API Endpoint: Save Score
 * POST /api/save_score.php
 * ============================================
 * 
 * Menerima data skor anak via POST (JSON body).
 * 
 * Request Body:
 * {
 *   "nama_anak": "Andi",
 *   "level_id": "shape_sort_1",
 *   "jumlah_bintang": 4
 * }
 * 
 * Response:
 * { "success": true, "message": "Skor berhasil disimpan", "id": 1 }
 */

// Header JSON
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Hanya terima metode POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Metode tidak diizinkan. Gunakan POST.'
    ]);
    exit;
}

// Load koneksi database
require_once __DIR__ . '/../config/database.php';

// --- Ambil & validasi input ---
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

// Cek apakah JSON valid
if ($data === null) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Format JSON tidak valid.'
    ]);
    exit;
}

// Validasi field yang wajib ada
$requiredFields = ['nama_anak', 'level_id', 'jumlah_bintang'];
$missingFields = [];

foreach ($requiredFields as $field) {
    if (!isset($data[$field]) || $data[$field] === '') {
        $missingFields[] = $field;
    }
}

if (!empty($missingFields)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Field berikut wajib diisi: ' . implode(', ', $missingFields)
    ]);
    exit;
}

// Sanitasi & validasi tipe data
$namaAnak      = trim(htmlspecialchars($data['nama_anak'], ENT_QUOTES, 'UTF-8'));
$levelId       = trim(htmlspecialchars($data['level_id'], ENT_QUOTES, 'UTF-8'));
$jumlahBintang = (int) $data['jumlah_bintang'];

// Validasi panjang nama
if (strlen($namaAnak) < 1 || strlen($namaAnak) > 100) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Nama anak harus 1-100 karakter.'
    ]);
    exit;
}

// Validasi jumlah bintang (0-10 untuk fleksibilitas level berbeda)
if ($jumlahBintang < 0 || $jumlahBintang > 10) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Jumlah bintang harus antara 0-10.'
    ]);
    exit;
}

// --- Simpan ke database ---
try {
    $pdo = getDBConnection();

    $sql = "INSERT INTO skor_anak (nama_anak, level_id, jumlah_bintang) 
            VALUES (:nama_anak, :level_id, :jumlah_bintang)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':nama_anak'      => $namaAnak,
        ':level_id'       => $levelId,
        ':jumlah_bintang' => $jumlahBintang
    ]);

    $insertId = $pdo->lastInsertId();

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Skor berhasil disimpan!',
        'id'      => (int) $insertId
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Gagal menyimpan skor. Silakan coba lagi.'
    ]);
}
