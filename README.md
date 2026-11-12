# PETCARE | Dokter Hewan Kota Cirebon 🐾

Website resmi dan sistem manajemen klinik hewan **PETCARE**, yang berlokasi di Kota Cirebon. Project ini dibangun dengan fokus utama pada **Sistem Rekam Medis Hewan (Medical Records)** dan **Pengelolaan Jadwal Vaksinasi Hewan (Vaccination Schedule Management)**, didukung oleh sistem janji temu (appointment booking), manajemen data pasien hewan (CRUD), serta dashboard monitoring kesehatan hewan peliharaan.

Aplikasi ini mengadopsi rancangan visual dari mockup resmi **PETCARE** dengan antarmuka modern, profesional, bersih, dan responsif.

---

## 🌟 Fitur Utama Website

### 1. Rekam Medis Hewan (Medical Records) - *Fitur Utama*
- **Pencatatan Lengkap**: Tanggal pemeriksaan, nama & kode hewan pasien, keluhan awal, hasil pemeriksaan fisik (suhu, berat badan, detak jantung), diagnosis dokter, tindakan medis/pengobatan, resep obat yang diberikan, catatan dokter, dan jadwal kontrol berikutnya.
- **Koneksi Pasien**: Terhubung langsung dengan identitas hewan dan profil pemilik secara kronologis.
- **Filter & Pencarian**: Filter berdasarkan hewan tertentu, pencarian keluhan, diagnosis, atau nama dokter.
- **Cetak Lembar Rekam Medis (Printable Slip)**: Fitur cetak/print surat riwayat rekam medis resmi klinik.
- **CRUD Penuh**: Tambah, lihat detail popup, edit, dan hapus rekam medis dengan konfirmasi.

### 2. Jadwal Vaksinasi (Vaccination Management) - *Fitur Utama*
- **Kalender Interaktif**: Kalender bulanan yang menampilkan penanda titik (indicator dots) pada tanggal-tanggal jadwal vaksinasi.
- **Perhitungan Status Dinamis Berdasarkan Tanggal Aktual**:
  - 🔴 **Terlewat**: Tanggal vaksin sudah lewat namun belum ditandai selesai.
  - 🟠 **X hari lagi / Mendekat**: Vaksin yang jatuh tempo dalam 1 - 3 hari mendatang.
  - 🟢 **X hari lagi / Mendatang**: Vaksin yang masih terjadwal dalam waktu dekat.
  - 🔵 **Selesai**: Vaksin yang telah berhasil diberikan kepada hewan.
- **Aksi Cepat**: Tombol **"✓ Selesai"** langsung untuk memperbarui status vaksinasi setelah hewan divaksin.
- **Filter & Pencarian**: Filter status (Terjadwal, Selesai), filter hewan, dan pencarian jenis vaksin.

### 3. Buat & Kelola Janji Temu (3-Step Booking Wizard & Meja Admin Resepsionis)
- **Tampilan Meja Admin (Admin Appointment Desk)**:
  - **KPI Ringkasan Cepat**: Total Janji Temu, Menunggu Konfirmasi (dengan penanda badge merah), Telah Dikonfirmasi, dan Kunjungan Selesai.
  - **Aksi Konfirmasi**: Menentukan dokter jaga (*dr. Sari Wijaya, Sp.KH* / *dr. Budi Santoso*), ruangan periksa (*Ruang Periksa 1, Ruang Periksa 2, Ruang Bedah*), dan catatan konfirmasi.
  - **Integrasi WhatsApp Langsung**: Tombol hijau **"💬 Hubungi WA"** otomatis membuka tautan WhatsApp ke pemilik hewan dengan pesan konfirmasi yang sudah terformat rapi dan sopan.
  - **Jadwal Ulang (Reschedule)**: Mengubah tanggal dan jam janji temu dengan validasi ketersediaan slot.
  - **Konversi ke Rekam Medis**: Tombol **"+ Buat Rekam Medis"** langsung memindahkan data janji temu menjadi formulir rekam medis tanpa perlu input ulang.
  - **Peralihan Mode Cepat**: Tombol *pill* di bilah atas (*topbar*) memungkinkan beralih instan antara **Mode Klien (Nasywa)** dan **Mode Dokter / Admin (dr. Sari)**.
- **Tampilan Formulir Pasien (Client Booking Wizard)**:
  - **Step 1 - Pilih Layanan**: Pemeriksaan Umum, Vaksinasi, Sterilisasi & Kastrasi, Pengobatan Penyakit, dll.
  - **Step 2 - Pilih Tanggal & Waktu**: Pemilih tanggal interaktif dan pilihan jam slot kunjungan (09:00, 10:00, 11:00, 13:00, 14:00, 15:00).
  - **Pencegahan Pemesanan Ganda (Slot Collision Prevention)**: Mencegah slot waktu yang sama dipesan oleh pasien lain secara bersamaan.
  - **Step 3 - Konfirmasi & Pasien**: Pemilihan hewan yang akan diperiksa, keluhan awal, dan peninjauan data sebelum pengajuan.
  - Status janji temu realistis: *Menunggu Konfirmasi*, *Dikonfirmasi*, *Selesai*, atau *Dibatalkan*.

### 4. Data Hewan Peliharaan (Pets Management)
- **CRUD Lengkap**: Tambah hewan, edit informasi, hapus dengan dialog konfirmasi keamanan.
- **Profil Hewan Komprehensif** (sesuai Mockup):
  - Foto hewan, nama, badge spesies, ras, jenis kelamin, usia/tanggal lahir, berat badan, ciri khusus/warna bulu.
  - No. Rekam Medis unik (misal: `SV-0001`).
  - Informasi pemilik (nama, no. HP, alamat di Cirebon).
  - Catatan alergi dan kondisi khusus.
  - Tab navigasi internal di profil hewan: **Informasi**, **Rekam Medis**, dan **Jadwal Vaksinasi** per hewan.

### 5. Dashboard Pengguna
- Ringkasan statistik: Jumlah Hewan Peliharaan, Jadwal Vaksinasi Aktif, dan Pemeriksaan Terdekat.
- Panel **Jadwal Vaksinasi Terdekat** dengan indikator relatif hari.
- Panel **Aktivitas Terbaru** (timeline pemeriksaan dan riwayat tindakan terakhir).

### 6. Pengingat Otomatis (Reminders Engine)
- Menampilkan peringatan jatuh tempo vaksinasi dan rekomendasi tanggal kontrol ulang dokter secara otomatis berdasarkan tanggal sistem aktual.
- Filter tingkat urgensi: *Mendesak*, *Vaksin*, dan *Kontrol Dokter*.

### 7. Halaman Publik & Profil Klinik
- **Beranda (Landing Page)**: Hero section dengan foto anjing & kucing, tombol CTA, 3 kartu keunggulan, dan preview layanan.
- **Tentang Kami**: Profil klinik, visi-misi, alamat lengkap di Cirebon (Jl. Terusan Cipto No. 8, Pekiringan, Kesambi), telepon, jam operasional, dan foto klinik.
- **Layanan**: 6 kartu layanan spesialis dengan modal detail dan tombol langsung ke booking.
- **Kontak**: Informasi klinik dan formulir pesan/konsultasi.
- **Login & Registrasi**: Form autentikasi dengan toggle tampilkan/sembunyikan password dan tombol akun demonstrasi instan.

---

## 💻 Teknologi yang Digunakan

1. **Frontend**:
   - **HTML5 Semantic**: Struktur dokumen yang rapi dan terstandar.
   - **CSS3 Modern**: Menggunakan CSS Custom Properties (Design System), Flexbox & CSS Grid, responsive media queries, dan palet warna identitas:
     - Warna Utama: `#1769E8` (Royal Blue)
     - Warna Sekunder: `#EFF6FF` (Soft Light Blue)
     - Latar Belakang: `#F8FAFC`
     - Typography: *Plus Jakarta Sans*
   - **JavaScript (ES6+) Modular**:
     - Arsitektur berbasis modul (`store.js`, `pets.js`, `medical-records.js`, `vaccinations.js`, `appointments.js`, `reminders.js`, `profile.js`, `public.js`, `app.js`).
     - State persistence otomatis menggunakan `localStorage`.

2. **Backend & Database (Opsional / Siap Pakai)**:
   - **PHP (8.x)**: Arsitektur REST API dengan prepared statements PDO.
   - **MySQL**: Skema database relasional lengkap di file `database.sql`.

---

## 📁 Struktur Direktori Project

```
c:\xampp\htdocs\SHINEVET\
│
├── index.html                   # Aplikasi Web Interaktif (Frontend SPA + Portal)
├── index.php                    # Entry point PHP server-side
│
├── config/
│   └── database.php             # Konfigurasi koneksi database MySQL (PDO)
│
├── api/                         # Backend REST API Endpoints (PHP)
│   ├── auth.php                 # Autentikasi, login, registrasi, logout
│   ├── pets.php                 # Endpoint CRUD data hewan
│   ├── records.php              # Endpoint CRUD rekam medis
│   ├── vaccinations.php         # Endpoint jadwal & status vaksinasi
│   └── appointments.php         # Endpoint booking & ketersediaan slot waktu
│
├── database.sql                 # Skema SQL, tabel relasi, foreign keys, & data seed
│
├── assets/
│   ├── css/
│   │   ├── style.css            # Desain sistem, warna, tombol, modal, toast, tabel
│   │   ├── public.css           # Styling halaman Beranda, Tentang Kami, Layanan, Kontak, Auth
│   │   └── dashboard.css        # Styling sidebar portal, dashboard, kartu hewan, kalender
│   ├── js/
│   │   ├── store.js             # Data Store & data contoh realistis (Mochi, Luna, Oreo)
│   │   ├── app.js               # Router navigasi, toast, dialog konfirmasi, format tanggal Indo
│   │   ├── pets.js              # Modul CRUD & detail profil hewan
│   │   ├── medical-records.js   # Modul rekam medis & slip cetak
│   │   ├── vaccinations.js      # Modul kalender vaksinasi & perhitungan tanggal aktual
│   │   ├── appointments.js      # Modul 3-step wizard & pencegahan bentrok slot
│   │   ├── reminders.js         # Modul pengingat kontrol & vaksin
│   │   ├── profile.js           # Modul profil pengguna & ganti password
│   │   └── public.js            # Interaksi halaman publik, modal layanan, autentikasi
│   └── images/                  # Aset foto hewan & klinik hasil ekstraksi mockup
│       ├── hero-pets.jpg        # Foto hero anjing & kucing
│       ├── clinic.jpg           # Foto gedung klinik PETCARE Cirebon
│       ├── login-pets.jpg       # Foto anjing & kucing halaman login
│       ├── mochi.jpg            # Foto profil Mochi (Golden Retriever)
│       ├── luna.jpg             # Foto profil Luna (Kucing Persia)
│       ├── oreo.jpg             # Foto profil Oreo (Kucing Domestik)
│       ├── logo.svg             # Logo PETCARE
│       ├── dog-avatar.svg       # Avatar SVG hewan anjing
│       ├── cat-avatar.svg       # Avatar SVG hewan kucing
│       ├── user-avatar.svg      # Avatar SVG pengguna
│       └── dr-avatar.svg        # Avatar SVG dokter hewan
│
└── README.md                    # Dokumentasi lengkap project
```

---

## 🚀 Cara Menjalankan Project

Project ini dirancang agar **langsung dapat dijalankan 100% tanpa konfigurasi rumit**:

### Opsi A: Buka Langsung di Web Browser (Rekomendasi Tercepat)
1. Buka File Explorer di komputer Anda.
2. Masuk ke folder: `C:\xampp\htdocs\SHINEVET\`.
3. Klik dua kali pada file `index.html` (atau klik kanan > *Open with* > Google Chrome / Microsoft Edge / Mozilla Firefox).
4. Website akan terbuka dan seluruh fitur (CRUD hewan, rekam medis, kalender vaksinasi, janji temu, dan modal) berfungsi penuh secara interaktif menggunakan penyimpanan lokal (`localStorage`).

### Opsi B: Jalankan Melalui XAMPP (Apache)
1. Buka aplikasi **XAMPP Control Panel**.
2. Klik tombol **Start** pada modul **Apache**.
3. Buka browser dan ketik alamat:
   ```
   http://localhost/SHINEVET/
   ```
   atau
   ```
   http://localhost/SHINEVET/index.php
   ```

### Opsi C: Menghubungkan ke Database MySQL Penuh (Jika Dibutuhkan)
1. Pada **XAMPP Control Panel**, klik **Start** pada modul **MySQL**.
2. Buka phpMyAdmin di browser: `http://localhost/phpmyadmin/`.
3. Buat database baru bernama `shinevet_db`.
4. Pilih tab **Import**, lalu pilih file `database.sql` yang ada di dalam folder project ini, kemudian klik **Import**.
5. File konfigurasi database berada di `config/database.php` dengan setelan default:
   - Host: `localhost`
   - Port: `3306`
   - Database: `shinevet_db`
   - User: `root`
   - Password: `(kosong)`

---

## 👤 Akun Demonstrasi (Demo Credentials)

Untuk mencoba aplikasi secara instan, Anda dapat menggunakan tombol cepat di halaman Login atau memasukkan kredensial berikut:

| Peran (Role) | Nama | Email / Username | Password |
| :--- | :--- | :--- | :--- |
| **Klien / Pemilik Hewan** | Nasywa Maulani Putri | `nasywa@email.com` | `password123` |
| **Dokter Hewan / Admin** | dr. Sari Wijaya, Sp.KH | `dr.sari@petcare.com` | `password123` |

---

## 📌 Catatan Transparansi Data
Seluruh data pasien (Mochi, Luna, Oreo), dokter, riwayat rekam medis, dan jadwal vaksinasi yang disertakan merupakan **data fiktif** yang ditujukan semata-mata untuk demonstrasi fitur sistem PETCARE Kota Cirebon.
