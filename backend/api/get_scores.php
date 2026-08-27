<?php
/**
 * ============================================
 * API Endpoint: Get Scores
 * GET /api/get_scores.php?nama_anak=Andi
 * ============================================
 * 
 * Mengambil riwayat skor anak berdasarkan nama.
 * Jika tanpa parameter, mengembalikan semua skor.
 * 
 * Query Parameters:
 *   - nama_anak (opsional): Filter berdasarkan nama anak
 *   - limit (opsional): Batas jumlah hasil (default: 50)
 * 
 * Response:
 * {
 *   "success": true,
 *   "count": 3,
 *   "data": [
 *     {
 *       "id": 1,
 *       "nama_anak": "Andi",
 *       "level_id": "shape_sort_1",
 *       "jumlah_bintang": 4,
 *       "waktu_bermain": "2026-08-26 07:00:00"
 *     }
 *   ]
 * }
 */

// Header JSON
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Hanya terima metode GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Metode tidak diizinkan. Gunakan GET.'
    ]);
    exit;
}

// Load koneksi database
require_once __DIR__ . '/../config/database.php';

try {
    $pdo = getDBConnection();

    // --- Build query berdasarkan parameter ---
    $params = [];
    $where  = '';
    $limit  = 50; // Default limit

    // Filter berdasarkan nama anak (opsional)
    if (isset($_GET['nama_anak']) && !empty(trim($_GET['nama_anak']))) {
        $namaAnak = trim(htmlspecialchars($_GET['nama_anak'], ENT_QUOTES, 'UTF-8'));
        $where = 'WHERE nama_anak = :nama_anak';
        $params[':nama_anak'] = $namaAnak;
    }

    // Custom limit (opsional, max 200)
    if (isset($_GET['limit']) && is_numeric($_GET['limit'])) {
        $limit = min((int) $_GET['limit'], 200);
    }

    // Query dengan urutan terbaru di atas
    $sql = "SELECT id, nama_anak, level_id, jumlah_bintang, waktu_bermain 
            FROM skor_anak 
            {$where} 
            ORDER BY waktu_bermain DESC 
            LIMIT {$limit}";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $results = $stmt->fetchAll();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'count'   => count($results),
        'data'    => $results
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Gagal mengambil data skor.'
    ]);
}
