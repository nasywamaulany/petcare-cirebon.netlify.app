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
        // Check slot availability query: /api/appointments.php?check_slots=1&date=2026-11-05
        if (isset($_GET['check_slots']) && !empty($_GET['date'])) {
            $date = $_GET['date'];
            $stmt = $pdo->prepare("SELECT appointment_time FROM appointments WHERE appointment_date = ? AND status != 'Dibatalkan'");
            $stmt->execute([$date]);
            $bookedSlots = $stmt->fetchAll(PDO::FETCH_COLUMN);
            echo json_encode(['status' => 'success', 'date' => $date, 'booked_slots' => $bookedSlots]);
            exit;
        }

        $userId = $_GET['user_id'] ?? null;
        $status = $_GET['status'] ?? null;

        $sql = "SELECT a.*, p.name as pet_name, p.species, u.full_name as user_name, u.phone as user_phone FROM appointments a LEFT JOIN pets p ON a.pet_id = p.id JOIN users u ON a.user_id = u.id WHERE 1=1";
        $params = [];

        if (!empty($userId)) {
            $sql .= " AND a.user_id = ?";
            $params[] = $userId;
        }
        if (!empty($status) && $status !== 'Semua') {
            $sql .= " AND a.status = ?";
            $params[] = $status;
        }

        $sql .= " ORDER BY a.appointment_date DESC, a.appointment_time ASC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $appointments = $stmt->fetchAll();

        echo json_encode(['status' => 'success', 'data' => $appointments]);
        break;

    case 'POST':
        $userId = $input['user_id'] ?? 1;
        $petId = !empty($input['pet_id']) ? $input['pet_id'] : null;
        $serviceType = trim($input['service_type'] ?? '');
        $date = trim($input['appointment_date'] ?? '');
        $time = trim($input['appointment_time'] ?? '');
        $complaints = trim($input['complaints'] ?? '');

        if (empty($serviceType) || empty($date) || empty($time)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Layanan, tanggal kunjungan, dan jam kunjungan wajib diisi.']);
            exit;
        }

        // Prevent duplicate booking for the exact slot
        $stmt = $pdo->prepare("SELECT id FROM appointments WHERE appointment_date = ? AND appointment_time = ? AND status != 'Dibatalkan' LIMIT 1");
        $stmt->execute([$date, $time]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['status' => 'error', 'message' => "Slot waktu $time pada tanggal $date sudah dipesan oleh pasien lain. Silakan pilih jam lain."]);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO appointments (user_id, pet_id, service_type, appointment_date, appointment_time, complaints, status) VALUES (?, ?, ?, ?, ?, ?, 'Menunggu Konfirmasi')");
        $stmt->execute([$userId, $petId, $serviceType, $date, $time, $complaints]);
        $newId = $pdo->lastInsertId();

        echo json_encode([
            'status' => 'success',
            'message' => 'Janji temu berhasil diajukan dengan status "Menunggu Konfirmasi". Tim kami akan memverifikasi jadwal Anda.',
            'id' => $newId,
            'appointment_status' => 'Menunggu Konfirmasi'
        ]);
        break;

    case 'PUT':
        $id = $input['id'] ?? null;
        $newStatus = $input['status'] ?? null;
        $adminNotes = $input['admin_notes'] ?? null;

        if (!$id || !$newStatus) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID janji temu dan status baru diperlukan.']);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE appointments SET status = ?, admin_notes = COALESCE(?, admin_notes) WHERE id = ?");
        $stmt->execute([$newStatus, $adminNotes, $id]);

        echo json_encode(['status' => 'success', 'message' => "Status janji temu diperbarui menjadi '$newStatus'."]);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID janji temu diperlukan.']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM appointments WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode(['status' => 'success', 'message' => 'Janji temu berhasil dibatalkan / dihapus.']);
        break;
}
