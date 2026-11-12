<?php
header('Content-Type: application/json; charset=utf-8');
if (session_status() === PHP_SESSION_NONE) {
    @session_start();
}
require_once __DIR__ . '/../config/database.php';

$pdo = Database::getConnection();
if (!$pdo) {
    echo json_encode(['status' => 'offline', 'message' => 'Database offline']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare("SELECT p.*, u.full_name as owner_name, u.phone as owner_phone, u.address as owner_address FROM pets p JOIN users u ON p.user_id = u.id WHERE p.id = ?");
            $stmt->execute([$_GET['id']]);
            $pet = $stmt->fetch();
            echo json_encode(['status' => 'success', 'data' => $pet]);
        } else {
            $search = $_GET['q'] ?? '';
            $species = $_GET['species'] ?? '';
            $userId = $_GET['user_id'] ?? null;

            $sql = "SELECT p.*, u.full_name as owner_name, u.phone as owner_phone, u.address as owner_address FROM pets p JOIN users u ON p.user_id = u.id WHERE 1=1";
            $params = [];

            if (!empty($userId)) {
                $sql .= " AND p.user_id = ?";
                $params[] = $userId;
            }
            if (!empty($search)) {
                $sql .= " AND (p.name LIKE ? OR p.pet_code LIKE ? OR u.full_name LIKE ?)";
                $params[] = "%$search%";
                $params[] = "%$search%";
                $params[] = "%$search%";
            }
            if (!empty($species) && $species !== 'Semua') {
                $sql .= " AND p.species = ?";
                $params[] = $species;
            }

            $sql .= " ORDER BY p.id DESC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $pets = $stmt->fetchAll();

            echo json_encode(['status' => 'success', 'data' => $pets]);
        }
        break;

    case 'POST':
        $userId = $input['user_id'] ?? 1;
        $name = trim($input['name'] ?? '');
        $species = trim($input['species'] ?? 'Anjing');
        $breed = trim($input['breed'] ?? '');
        $gender = trim($input['gender'] ?? 'Jantan');
        $birthDate = $input['birth_date'] ?? null;
        $weight = floatval($input['weight'] ?? 0);
        $colorMarks = trim($input['color_marks'] ?? '');
        $allergyNotes = trim($input['allergy_notes'] ?? '');
        $photoUrl = trim($input['photo_url'] ?? 'assets/images/dog-avatar.svg');

        if (empty($name)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Nama hewan wajib diisi.']);
            exit;
        }

        // Generate unique pet_code
        $petCode = 'SV-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);

        $stmt = $pdo->prepare("INSERT INTO pets (user_id, pet_code, name, species, breed, gender, birth_date, weight, color_marks, allergy_notes, photo_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Aktif')");
        $stmt->execute([$userId, $petCode, $name, $species, $breed, $gender, $birthDate, $weight, $colorMarks, $allergyNotes, $photoUrl]);
        $newId = $pdo->lastInsertId();

        echo json_encode(['status' => 'success', 'message' => 'Data hewan berhasil ditambahkan.', 'id' => $newId, 'pet_code' => $petCode]);
        break;

    case 'PUT':
        $id = $input['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID hewan diperlukan.']);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE pets SET name = ?, species = ?, breed = ?, gender = ?, birth_date = ?, weight = ?, color_marks = ?, allergy_notes = ?, photo_url = ?, status = ? WHERE id = ?");
        $stmt->execute([
            $input['name'],
            $input['species'],
            $input['breed'],
            $input['gender'],
            $input['birth_date'],
            $input['weight'],
            $input['color_marks'],
            $input['allergy_notes'],
            $input['photo_url'],
            $input['status'] ?? 'Aktif',
            $id
        ]);

        echo json_encode(['status' => 'success', 'message' => 'Data hewan berhasil diperbarui.']);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID hewan diperlukan.']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM pets WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode(['status' => 'success', 'message' => 'Data hewan berhasil dihapus.']);
        break;
}
