<?php
header('Content-Type: application/json; charset=utf-8');
if (session_status() === PHP_SESSION_NONE) {
    @session_start();
}
require_once __DIR__ . '/../config/database.php';

$pdo = Database::getConnection();
$action = $_GET['action'] ?? ($_POST['action'] ?? 'check');

if (!$pdo) {
    echo json_encode([
        'status' => 'offline',
        'message' => 'Backend database sedang offline. Aplikasi berjalan dengan penyimpanan lokal.',
        'data' => null
    ]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

switch ($action) {
    case 'login':
        $identifier = trim($input['identifier'] ?? '');
        $password = trim($input['password'] ?? '');

        if (empty($identifier) || empty($password)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Email/Username dan password wajib diisi.']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? OR username = ? OR phone = ? LIMIT 1");
        $stmt->execute([$identifier, $identifier, $identifier]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            unset($user['password']);
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_role'] = $user['role'];
            $_SESSION['user_name'] = $user['full_name'];

            echo json_encode(['status' => 'success', 'message' => 'Login berhasil.', 'user' => $user]);
        } else {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Email/Username atau password salah.']);
        }
        break;

    case 'register':
        $fullName = trim($input['full_name'] ?? '');
        $email = trim($input['email'] ?? '');
        $phone = trim($input['phone'] ?? '');
        $password = trim($input['password'] ?? '');
        $username = trim($input['username'] ?? strtolower(explode('@', $email)[0]));

        if (empty($fullName) || empty($email) || empty($phone) || empty($password)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Semua kolom wajib diisi.']);
            exit;
        }

        // Check duplicate
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1");
        $stmt->execute([$email, $username]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['status' => 'error', 'message' => 'Email atau username sudah terdaftar.']);
            exit;
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $insert = $pdo->prepare("INSERT INTO users (username, email, password, full_name, phone, role, avatar) VALUES (?, ?, ?, ?, ?, 'client', 'assets/images/user-avatar.svg')");
        $insert->execute([$username, $email, $hash, $fullName, $phone]);
        $newId = $pdo->lastInsertId();

        echo json_encode([
            'status' => 'success',
            'message' => 'Pendaftaran berhasil. Silakan login.',
            'user' => [
                'id' => $newId,
                'username' => $username,
                'email' => $email,
                'full_name' => $fullName,
                'phone' => $phone,
                'role' => 'client'
            ]
        ]);
        break;

    case 'check':
        if (isset($_SESSION['user_id'])) {
            $stmt = $pdo->prepare("SELECT id, username, email, full_name, phone, address, role, avatar FROM users WHERE id = ?");
            $stmt->execute([$_SESSION['user_id']]);
            $user = $stmt->fetch();
            echo json_encode(['status' => 'success', 'authenticated' => true, 'user' => $user]);
        } else {
            echo json_encode(['status' => 'success', 'authenticated' => false, 'user' => null]);
        }
        break;

    case 'logout':
        session_destroy();
        echo json_encode(['status' => 'success', 'message' => 'Berhasil keluar.']);
        break;

    default:
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Aksi tidak valid.']);
        break;
}
