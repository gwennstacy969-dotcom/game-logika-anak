<?php
/**
 * API: create_profile.php
 * Endpoint untuk membuat profil anak baru.
 * Method: POST
 * Body (JSON): { "nama": "Budi", "avatar": "lion" }
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed. Use POST.']);
    exit;
}

require_once '../config/database.php';

// Ambil raw input
$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

// Validasi
if (!isset($data['nama']) || trim($data['nama']) === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Nama anak wajib diisi.']);
    exit;
}

$nama = trim($data['nama']);
$avatar = isset($data['avatar']) ? trim($data['avatar']) : 'default';

try {
    $pdo = getDBConnection();
    
    // Insert profil baru
    $stmt = $pdo->prepare("INSERT INTO profil_anak (nama, avatar) VALUES (:nama, :avatar)");
    $stmt->execute([
        ':nama' => $nama,
        ':avatar' => $avatar
    ]);
    
    $newId = $pdo->lastInsertId();
    
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Profil berhasil dibuat.',
        'data' => [
            'id' => $newId,
            'nama' => $nama,
            'avatar' => $avatar
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Gagal menyimpan profil: ' . $e->getMessage()
    ]);
}
