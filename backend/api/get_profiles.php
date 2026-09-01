<?php
/**
 * API: get_profiles.php
 * Endpoint untuk mengambil daftar profil anak dari database.
 * Method: GET
 */

// Aktifkan CORS (Cross-Origin Resource Sharing)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Hanya terima method GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// Include koneksi database
require_once '../config/database.php';

try {
    $pdo = getDBConnection();
    
    // Ambil semua profil
    $stmt = $pdo->query("SELECT id, nama, avatar, dibuat_pada FROM profil_anak ORDER BY dibuat_pada DESC");
    $profiles = $stmt->fetchAll();
    
    // Kirim response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $profiles
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Terjadi kesalahan pada server saat mengambil data profil.'
    ]);
}
