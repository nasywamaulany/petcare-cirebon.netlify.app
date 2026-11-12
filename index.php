<?php
/**
 * PETCARE | Dokter Hewan Kota Cirebon
 * PHP Entry Point
 */

if (session_status() === PHP_SESSION_NONE) {
    @session_start();
}
require_once __DIR__ . '/config/database.php';

// Include the interactive SPA view
require_once __DIR__ . '/index.html';
