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
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare("SELECT r.*, p.name as pet_name, p.species, p.breed, p.pet_code, u.full_name as owner_name FROM medical_records r JOIN pets p ON r.pet_id = p.id JOIN users u ON p.user_id = u.id WHERE r.id = ?");
            $stmt->execute([$_GET['id']]);
            $record = $stmt->fetch();
            echo json_encode(['status' => 'success', 'data' => $record]);
        } else {
            $petId = $_GET['pet_id'] ?? null;
            $search = $_GET['q'] ?? '';
            $startDate = $_GET['start_date'] ?? '';
            $endDate = $_GET['end_date'] ?? '';

            $sql = "SELECT r.*, p.name as pet_name, p.species, p.breed, p.pet_code, u.full_name as owner_name FROM medical_records r JOIN pets p ON r.pet_id = p.id JOIN users u ON p.user_id = u.id WHERE 1=1";
            $params = [];

            if (!empty($petId) && $petId !== 'Semua') {
                $sql .= " AND r.pet_id = ?";
                $params[] = $petId;
            }
            if (!empty($search)) {
                $sql .= " AND (p.name LIKE ? OR r.diagnosis LIKE ? OR r.service_type LIKE ? OR r.doctor_name LIKE ?)";
                $params[] = "%$search%";
                $params[] = "%$search%";
                $params[] = "%$search%";
                $params[] = "%$search%";
            }
            if (!empty($startDate) && !empty($endDate)) {
                $sql .= " AND r.exam_date BETWEEN ? AND ?";
                $params[] = $startDate;
                $params[] = $endDate;
            }

            $sql .= " ORDER BY r.exam_date DESC, r.id DESC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $records = $stmt->fetchAll();

            echo json_encode(['status' => 'success', 'data' => $records]);
        }
        break;

    case 'POST':
        $petId = $input['pet_id'] ?? null;
        $doctorName = trim($input['doctor_name'] ?? 'dr. Sari Wijaya, Sp.KH');
        $examDate = $input['exam_date'] ?? date('Y-m-d');
        $serviceType = trim($input['service_type'] ?? 'Pemeriksaan Umum');
        $complaints = trim($input['complaints'] ?? '');
        $physicalExam = trim($input['physical_exam'] ?? '');
        $diagnosis = trim($input['diagnosis'] ?? '');
        $treatment = trim($input['treatment'] ?? '');
        $medicine = trim($input['medicine'] ?? '');
        $notes = trim($input['notes'] ?? '');
        $nextControlDate = !empty($input['next_control_date']) ? $input['next_control_date'] : null;

        if (!$petId || empty($diagnosis) || empty($treatment)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Pilih hewan, diagnosis, dan tindakan/pengobatan wajib diisi.']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO medical_records (pet_id, doctor_name, exam_date, service_type, complaints, physical_exam, diagnosis, treatment, medicine, notes, next_control_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$petId, $doctorName, $examDate, $serviceType, $complaints, $physicalExam, $diagnosis, $treatment, $medicine, $notes, $nextControlDate]);
        $newId = $pdo->lastInsertId();

        echo json_encode(['status' => 'success', 'message' => 'Rekam medis berhasil disimpan.', 'id' => $newId]);
        break;

    case 'PUT':
        $id = $input['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID rekam medis diperlukan.']);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE medical_records SET pet_id = ?, doctor_name = ?, exam_date = ?, service_type = ?, complaints = ?, physical_exam = ?, diagnosis = ?, treatment = ?, medicine = ?, notes = ?, next_control_date = ? WHERE id = ?");
        $stmt->execute([
            $input['pet_id'],
            $input['doctor_name'],
            $input['exam_date'],
            $input['service_type'],
            $input['complaints'],
            $input['physical_exam'] ?? '',
            $input['diagnosis'],
            $input['treatment'],
            $input['medicine'] ?? '',
            $input['notes'] ?? '',
            !empty($input['next_control_date']) ? $input['next_control_date'] : null,
            $id
        ]);

        echo json_encode(['status' => 'success', 'message' => 'Rekam medis berhasil diperbarui.']);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID rekam medis diperlukan.']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM medical_records WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode(['status' => 'success', 'message' => 'Rekam medis berhasil dihapus.']);
        break;
}
