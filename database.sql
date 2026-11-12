-- ====================================================================
-- PETCARE | Dokter Hewan Kota Cirebon
-- Database Schema & Initial Seed Data
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `shinevet_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `shinevet_db`;

-- Drop existing tables if re-creating
DROP TABLE IF EXISTS `appointments`;
DROP TABLE IF EXISTS `vaccinations`;
DROP TABLE IF EXISTS `medical_records`;
DROP TABLE IF EXISTS `pets`;
DROP TABLE IF EXISTS `users`;

-- --------------------------------------------------------------------
-- 1. Tabel users (Pengguna: Pemilik Hewan, Dokter Hewan, Admin)
-- --------------------------------------------------------------------
CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(25) NOT NULL,
  `address` TEXT NULL,
  `role` ENUM('client', 'vet', 'admin') NOT NULL DEFAULT 'client',
  `avatar` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 2. Tabel pets (Data Hewan Peliharaan)
-- --------------------------------------------------------------------
CREATE TABLE `pets` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `pet_code` VARCHAR(20) NOT NULL UNIQUE,
  `name` VARCHAR(60) NOT NULL,
  `species` VARCHAR(30) NOT NULL, -- Anjing, Kucing, Kelinci, dll
  `breed` VARCHAR(60) NULL,
  `gender` ENUM('Jantan', 'Betina') NOT NULL DEFAULT 'Jantan',
  `birth_date` DATE NULL,
  `weight` DECIMAL(5, 2) NOT NULL DEFAULT 0.00, -- kg
  `color_marks` VARCHAR(150) NULL,
  `allergy_notes` TEXT NULL,
  `photo_url` VARCHAR(255) NULL,
  `status` ENUM('Aktif', 'Nonaktif') NOT NULL DEFAULT 'Aktif',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_pets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 3. Tabel medical_records (Rekam Medis Kesehatan Hewan)
-- --------------------------------------------------------------------
CREATE TABLE `medical_records` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `pet_id` INT UNSIGNED NOT NULL,
  `doctor_name` VARCHAR(100) NOT NULL,
  `exam_date` DATE NOT NULL,
  `service_type` VARCHAR(100) NOT NULL,
  `complaints` TEXT NOT NULL,
  `physical_exam` TEXT NULL,
  `diagnosis` VARCHAR(255) NOT NULL,
  `treatment` TEXT NOT NULL,
  `medicine` TEXT NULL,
  `notes` TEXT NULL,
  `next_control_date` DATE NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_records_pet` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 4. Tabel vaccinations (Jadwal & Riwayat Vaksinasi)
-- --------------------------------------------------------------------
CREATE TABLE `vaccinations` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `pet_id` INT UNSIGNED NOT NULL,
  `vaccine_name` VARCHAR(100) NOT NULL,
  `batch_number` VARCHAR(50) NULL,
  `administered_date` DATE NOT NULL,
  `next_due_date` DATE NOT NULL,
  `doctor_name` VARCHAR(100) NOT NULL,
  `status` ENUM('Terjadwal', 'Selesai', 'Terlewat', 'Dibatalkan') NOT NULL DEFAULT 'Terjadwal',
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_vaccinations_pet` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 5. Tabel appointments (Janji Temu Kunjungan Klinik)
-- --------------------------------------------------------------------
CREATE TABLE `appointments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `pet_id` INT UNSIGNED NULL,
  `service_type` VARCHAR(100) NOT NULL,
  `appointment_date` DATE NOT NULL,
  `appointment_time` VARCHAR(10) NOT NULL, -- e.g. '10:00'
  `complaints` TEXT NULL,
  `status` ENUM('Menunggu Konfirmasi', 'Dikonfirmasi', 'Selesai', 'Dibatalkan') NOT NULL DEFAULT 'Menunggu Konfirmasi',
  `admin_notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_appointments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_appointments_pet` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`id`) ON DELETE SET NULL,
  UNIQUE KEY `uk_slot_date_time` (`appointment_date`, `appointment_time`)
) ENGINE=InnoDB;

-- ====================================================================
-- SEED DATA (Data Contoh Fiktif Untuk Demonstrasi)
-- ====================================================================

-- Catatan: Password hashing menggunakan bcrypt untuk string: "password123"
-- $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
INSERT INTO `users` (`id`, `username`, `email`, `password`, `full_name`, `phone`, `address`, `role`, `avatar`) VALUES
(1, 'nasywa', 'nasywa@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nasywa Maulani Putri', '0812-3456-7890', 'Jl. Kesambi, Kota Cirebon', 'client', 'assets/images/user-avatar.svg'),
(2, 'drsari', 'dr.sari@petcare.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'dr. Sari Wijaya, Sp.KH', '0821-3566-6170', 'Pekiringan, Kesambi, Cirebon', 'vet', 'assets/images/dr-avatar.svg'),
(3, 'drbudi', 'dr.budi@petcare.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'dr. Budi Santoso', '0821-3566-6170', 'Pekiringan, Kesambi, Cirebon', 'vet', 'assets/images/dr-avatar.svg');

-- Data Hewan Peliharaan
INSERT INTO `pets` (`id`, `user_id`, `pet_code`, `name`, `species`, `breed`, `gender`, `birth_date`, `weight`, `color_marks`, `allergy_notes`, `photo_url`, `status`) VALUES
(1, 1, 'SV-0001', 'Mochi', 'Anjing', 'Golden Retriever', 'Jantan', '2022-06-15', 28.00, 'Emas kecokelatan, bercak putih di dada', 'Alergi ayam potong broiler', 'assets/images/mochi.jpg', 'Aktif'),
(2, 1, 'SV-0002', 'Luna', 'Kucing', 'Persia Medium', 'Betina', '2023-03-10', 4.20, 'Abu-abu keperakan lebat', 'Tidak ada riwayat alergi', 'assets/images/luna.jpg', 'Aktif'),
(3, 1, 'SV-0003', 'Oreo', 'Kucing', 'Domestik Mix', 'Jantan', '2023-08-01', 3.80, 'Hitam dan putih seperti biskuit oreo', 'Hipersensitif terhadap shampo berparfum kuat', 'assets/images/oreo.jpg', 'Aktif');

-- Data Rekam Medis
INSERT INTO `medical_records` (`id`, `pet_id`, `doctor_name`, `exam_date`, `service_type`, `complaints`, `physical_exam`, `diagnosis`, `treatment`, `medicine`, `notes`, `next_control_date`) VALUES
(1, 1, 'dr. Sari Wijaya, Sp.KH', '2025-10-12', 'Vaksinasi Rabies', 'Pemberian vaksin rabies tahunan rutin', 'Suhu 38.4C, detak jantung normal 95 bpm, berat 28 kg, kondisi fisik sehat dan aktif', 'Vaksinasi Rabies (1 tahun)', 'Injeksi subkutan vaksin rabies inactivated 1 dosis', 'Vaksin Rabies Defensor 3', 'Hewan dalam kondisi sehat prima. Hindari memandikan selama 5 hari setelah vaksin.', '2026-10-12'),
(2, 1, 'dr. Budi Santoso', '2025-09-05', 'Pemeriksaan Umum', 'Sering menggaruk telinga kiri dan bagian tengkuk', 'Ditemukan kemerahan lokal, eritema ringan pada daun telinga dalam, tidak ada infeksi parasit telinga', 'Infeksi kulit ringan (Dermatitis Kontak)', 'Pembersihan daun telinga dengan antiseptic otic rinse dan pemberian salep topikal', 'Salep Gentamicin 0.1% + Betamethasone topikal', 'Gunakan collar pelindung jika masih terus menggaruk. Evaluasi dalam 7 hari.', '2025-09-12'),
(3, 1, 'dr. Sari Wijaya, Sp.KH', '2025-08-20', 'Pengobatan', 'Kaki kanan depan agak pincang setelah melompat tangga', 'Palpasi sendi carpus normal, nyeri tekan ringan pada otot brachiocephalicus, refleks baik', 'Otot terkilir ringan / Muscle Strain', 'Terapi kompres hangat dan fisioterapi ringan', 'Meloxicam injeksi dosis tunggal + Meloxicam oral syrup 1.5mg/ml', 'Batasi aktivitas lari atau lompat tinggi selama 1 minggu.', NULL),
(4, 1, 'dr. Budi Santoso', '2025-07-10', 'Vaksinasi DHPPi', 'Vaksinasi berkala tahunan untuk pencegahan distemper & parvovirus', 'Suhu 38.6C, mukosa merah muda lembap, BB 27.5 kg, sehat', 'Vaksinasi DHPPi (tahunan)', 'Injeksi vaksin kombinasi DHPPi 1 dosis subkutan', 'Nobivac DHPPi', 'Kondisi hewan sangat baik. Pemilik diedukasi mengenai jadwal vaksin rabies berikutnya.', '2025-10-12'),
(5, 1, 'dr. Sari Wijaya, Sp.KH', '2025-05-15', 'Pemeriksaan Umum', 'Pemeriksaan kesehatan rutin berkala (General Check-up)', 'Suhu 38.3C, berat 27.2 kg, gigi bebas karang berlebih, mata bersih, bulu berkilau', 'Cek kesehatan rutin (Sehat)', 'Pemberian obat cacing spektrum luas', 'Drontal Plus Dog (2.5 tablet)', 'Pertahankan pola makan dan aktivitas fisik yang rutin.', '2025-11-15');

-- Data Jadwal Vaksinasi
INSERT INTO `vaccinations` (`id`, `pet_id`, `vaccine_name`, `batch_number`, `administered_date`, `next_due_date`, `doctor_name`, `status`, `notes`) VALUES
(1, 1, 'Vaksin Rabies', 'RB-2025-9921', '2025-10-12', '2026-10-12', 'dr. Sari Wijaya, Sp.KH', 'Selesai', 'Vaksinasi rabies tahunan telah diberikan.'),
(2, 2, 'Vaksin FVRCP (Tricat)', 'FV-2025-1044', '2024-10-25', '2025-10-25', 'dr. Sari Wijaya, Sp.KH', 'Terjadwal', 'Booster tahunan perlindungan terhadap Panleukopenia, Calici, dan Rhinotracheitis.'),
(3, 3, 'Vaksin Rabies', 'RB-2025-4428', '2024-11-10', '2025-11-10', 'dr. Budi Santoso', 'Terjadwal', 'Vaksinasi rabies pertama untuk Oreo.'),
(4, 1, 'Vaksin DHPPi Booster', 'DH-2025-7801', '2025-07-10', '2026-07-10', 'dr. Budi Santoso', 'Selesai', 'Vaksinasi tahunan lengkap terlaksana.');

-- Data Janji Temu
INSERT INTO `appointments` (`id`, `user_id`, `pet_id`, `service_type`, `appointment_date`, `appointment_time`, `complaints`, `status`, `admin_notes`) VALUES
(1, 1, 1, 'Pemeriksaan Umum', '2026-11-05', '11:00', 'Kontrol kesehatan dan potong kuku rutin', 'Dikonfirmasi', 'Telah dijadwalkan dengan dr. Sari di Ruang Pemeriksaan 1'),
(2, 1, 2, 'Vaksinasi', '2026-11-08', '14:00', 'Vaksinasi FVRCP rutin tahunan', 'Menunggu Konfirmasi', 'Menunggu konfirmasi ketersediaan dokter'),
(3, 1, 3, 'Pengobatan Penyakit', '2026-10-20', '10:00', 'Flu dan bersin-bersin selama 2 hari', 'Selesai', 'Telah diperiksa dan diberikan obat sirup'),
(4, 1, 1, 'Sterilisasi & Kastrasi', '2026-11-02', '09:00', 'Konsultasi tindakan sterilisasi dan cek darah pra-operasi', 'Menunggu Konfirmasi', NULL);
