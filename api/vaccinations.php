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
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

switch ($method) {
    case 'GET':
        $petId = $_GET['pet_id'] ?? null;
        $status = $_GET['status'] ?? null;
        $vaccineName = $_GET['vaccine_name'] ?? null;
        $search = $_GET['q'] ?? '';

        $sql = "SELECT v.*, p.name as pet_name, p.species, p.breed, p.photo_url as pet_photo, u.full_name as owner_name, u.phone as owner_phone FROM vaccinations v JOIN pets p ON v.pet_id = p.id JOIN users u ON p.user_id = u.id WHERE 1=1";
        $params = [];

        if (!empty($petId) && $petId !== 'Semua') {
            $sql .= " AND v.pet_id = ?";
            $params[] = $petId;
        }
        if (!empty($status) && $status !== 'Semua') {
            $sql .= " AND v.status = ?";
            $params[] = $status;
        }
        if (!empty($vaccineName) && $vaccineName !== 'Semua') {
            $sql .= " AND v.vaccine_name LIKE ?";
            $params[] = "%$vaccineName%";
        }
        if (!empty($search)) {
            $sql .= " AND (p.name LIKE ? OR v.vaccine_name LIKE ? OR u.full_name LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }

        $sql .= " ORDER BY v.next_due_date ASC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $vaccinations = $stmt->fetchAll();

        // Calculate dynamic time difference based on current date
        $today = new DateTime();
        $today->setTime(0, 0, 0);

        foreach ($vaccinations as &$item) {
            $dueDate = new DateTime($item['next_due_date']);
            $dueDate->setTime(0, 0, 0);
            $diff = $today->diff($dueDate);
            $daysDiff = (int)$diff->format("%r%a");

            $item['days_remaining'] = $daysDiff;
            if ($item['status'] === 'Terjadwal') {
                if ($daysDiff < 0) {
                    $item['computed_status'] = 'Terlewat';
                    $item['badge_label'] = 'Terlewat';
                    $item['badge_class'] = 'badge-danger';
                } elseif ($daysDiff === 0) {
                    $item['computed_status'] = 'Hari Ini';
                    $item['badge_label'] = 'Hari ini';
                    $item['badge_class'] = 'badge-warning';
                } elseif ($daysDiff <= 3) {
                    $item['computed_status'] = 'Mendekat';
                    $item['badge_label'] = "$daysDiff hari lagi";
                    $item['badge_class'] = 'badge-warning';
                } else {
                    $item['computed_status'] = 'Mendatang';
                    $item['badge_label'] = "$daysDiff hari lagi";
                    $item['badge_class'] = 'badge-info';
                }
            } elseif ($item['status'] === 'Selesai') {
                $item['computed_status'] = 'Selesai';
                $item['badge_label'] = 'Selesai';
                $item['badge_class'] = 'badge-success';
            } else {
                $item['computed_status'] = 'Dibatalkan';
                $item['badge_label'] = 'Dibatalkan';
                $item['badge_class'] = 'badge-muted';
            }
        }

        echo json_encode(['status' => 'success', 'data' => $vaccinations]);
        break;

    case 'POST':
        $petId = $input['pet_id'] ?? null;
        $vaccineName = trim($input['vaccine_name'] ?? '');
        $batchNumber = trim($input['batch_number'] ?? '');
        $administeredDate = $input['administered_date'] ?? date('Y-m-d');
        $nextDueDate = $input['next_due_date'] ?? null;
        $doctorName = trim($input['doctor_name'] ?? 'dr. Sari Wijaya, Sp.KH');
        $status = $input['status'] ?? 'Terjadwal';
        $notes = trim($input['notes'] ?? '');

        if (!$petId || empty($vaccineName) || empty($nextDueDate)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Pilih hewan, jenis vaksin, dan tanggal vaksin berikutnya wajib diisi.']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO vaccinations (pet_id, vaccine_name, batch_number, administered_date, next_due_date, doctor_name, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$petId, $vaccineName, $batchNumber, $administeredDate, $nextDueDate, $doctorName, $status, $notes]);
        $newId = $pdo->lastInsertId();

        echo json_encode(['status' => 'success', 'message' => 'Jadwal vaksinasi berhasil disimpan.', 'id' => $newId]);
        break;

    case 'PUT':
        $id = $input['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID jadwal vaksinasi diperlukan.']);
            exit;
        }

        // Support toggle/mark completed directly
        if (isset($input['quick_action']) && $input['quick_action'] === 'complete') {
            $stmt = $pdo->prepare("UPDATE vaccinations SET status = 'Selesai' WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['status' => 'success', 'message' => 'Vaksinasi telah ditandai selesai.']);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE vaccinations SET pet_id = ?, vaccine_name = ?, batch_number = ?, administered_date = ?, next_due_date = ?, doctor_name = ?, status = ?, notes = ? WHERE id = ?");
        $stmt->execute([
            $input['pet_id'],
            $input['vaccine_name'],
            $input['batch_number'] ?? '',
            $input['administered_date'],
            $input['next_due_date'],
            $input['doctor_name'],
            $input['status'],
            $input['notes'] ?? '',
            $id
        ]);

        echo json_encode(['status' => 'success', 'message' => 'Jadwal vaksinasi berhasil diperbarui.']);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID jadwal diperlukan.']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM vaccinations WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode(['status' => 'success', 'message' => 'Jadwal vaksinasi berhasil dihapus.']);
        break;
}
