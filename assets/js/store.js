/**
 * PETCARE | Dokter Hewan Kota Cirebon
 * Data Store & Persistent State Management (localStorage + API Sync)
 */

const STORAGE_KEYS = {
  USER: 'petcare_current_user',
  PETS: 'petcare_pets_data',
  RECORDS: 'petcare_medical_records',
  VACCINES: 'petcare_vaccinations_data',
  APPOINTMENTS: 'petcare_appointments_data',
  SETTINGS: 'petcare_settings'
};

const DEFAULT_USERS = [
  {
    id: 1,
    username: 'nasywa',
    email: 'nasywa@email.com',
    full_name: 'Nasywa Maulani Putri',
    phone: '0812-3456-7890',
    address: 'Jl. Kesambi, Kota Cirebon',
    role: 'client',
    avatar: 'assets/images/user-avatar.svg'
  },
  {
    id: 2,
    username: 'drsari',
    email: 'dr.sari@petcare.com',
    full_name: 'dr. Sari Wijaya, Sp.KH',
    phone: '0821-3566-6170',
    address: 'Jl. Terusan Cipto No. 8, Pekiringan, Kesambi, Kota Cirebon',
    role: 'vet',
    avatar: 'assets/images/dr-avatar.svg'
  }
];

// Helper to format date offset from today for realistic dynamic demo dates
function getOffsetDate(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

const DEFAULT_PETS = [
  {
    id: 1,
    user_id: 1,
    pet_code: 'SV-0001',
    name: 'Mochi',
    species: 'Anjing',
    breed: 'Golden Retriever',
    gender: 'Jantan',
    birth_date: '2022-06-15',
    weight: 28.0,
    color_marks: 'Emas kecokelatan, bercak putih di dada',
    allergy_notes: 'Alergi ayam potong broiler, hindari pakan tinggi jagung',
    photo_url: 'assets/images/mochi.jpg',
    status: 'Aktif',
    created_at: '2024-01-12'
  },
  {
    id: 2,
    user_id: 1,
    pet_code: 'SV-0002',
    name: 'Luna',
    species: 'Kucing',
    breed: 'Persia Medium',
    gender: 'Betina',
    birth_date: '2023-03-10',
    weight: 4.2,
    color_marks: 'Abu-abu keperakan lebat',
    allergy_notes: 'Tidak ada riwayat alergi yang dilaporkan',
    photo_url: 'assets/images/luna.jpg',
    status: 'Aktif',
    created_at: '2024-02-05'
  },
  {
    id: 3,
    user_id: 1,
    pet_code: 'SV-0003',
    name: 'Oreo',
    species: 'Kucing',
    breed: 'Domestik Tuxedo',
    gender: 'Jantan',
    birth_date: '2023-08-01',
    weight: 3.8,
    color_marks: 'Hitam dan putih seperti biskuit oreo',
    allergy_notes: 'Hipersensitif terhadap shampo berparfum menyengat',
    photo_url: 'assets/images/oreo.jpg',
    status: 'Aktif',
    created_at: '2024-05-20'
  }
];

const DEFAULT_RECORDS = [
  {
    id: 1,
    pet_id: 1,
    doctor_name: 'dr. Sari Wijaya, Sp.KH',
    exam_date: '2025-10-12',
    service_type: 'Vaksinasi Rabies',
    complaints: 'Pemberian vaksin rabies tahunan rutin pencegahan zoonosis.',
    physical_exam: 'Suhu 38.4°C, detak jantung 95 bpm, berat 28 kg, selaput lendir normal dan aktif.',
    diagnosis: 'Vaksinasi Rabies (1 tahun)',
    treatment: 'Injeksi subkutan vaksin rabies inactivated 1 dosis.',
    medicine: 'Vaksin Rabies Defensor 3',
    notes: 'Hewan dalam kondisi sehat prima. Hindari memandikan selama 5 hari setelah vaksin.',
    next_control_date: '2026-10-12'
  },
  {
    id: 2,
    pet_id: 1,
    doctor_name: 'dr. Budi Santoso',
    exam_date: '2025-09-05',
    service_type: 'Pemeriksaan Umum',
    complaints: 'Sering menggaruk telinga kiri dan bagian tengkuk.',
    physical_exam: 'Ditemukan kemerahan lokal, eritema ringan pada daun telinga dalam, tidak ada infeksi parasit telinga.',
    diagnosis: 'Infeksi kulit ringan (Dermatitis Kontak)',
    treatment: 'Pembersihan daun telinga dengan antiseptic otic rinse dan pemberian salep topikal.',
    medicine: 'Salep Gentamicin 0.1% + Betamethasone topikal',
    notes: 'Gunakan collar pelindung jika masih terus menggaruk. Evaluasi dalam 7 hari.',
    next_control_date: '2025-09-12'
  },
  {
    id: 3,
    pet_id: 1,
    doctor_name: 'dr. Sari Wijaya, Sp.KH',
    exam_date: '2025-08-20',
    service_type: 'Pengobatan',
    complaints: 'Kaki kanan depan agak pincang setelah melompat tangga.',
    physical_exam: 'Palpasi sendi carpus normal, nyeri tekan ringan pada otot brachiocephalicus, refleks baik.',
    diagnosis: 'Otot terkilir ringan / Muscle Strain',
    treatment: 'Terapi kompres hangat dan fisioterapi ringan.',
    medicine: 'Meloxicam oral syrup 1.5mg/ml (dosis 1x sehari)',
    notes: 'Batasi aktivitas lari atau lompat tinggi selama 1 minggu.',
    next_control_date: ''
  },
  {
    id: 4,
    pet_id: 1,
    doctor_name: 'dr. Budi Santoso',
    exam_date: '2025-07-10',
    service_type: 'Vaksinasi DHPPi',
    complaints: 'Vaksinasi berkala tahunan untuk perlindungan distemper & parvovirus.',
    physical_exam: 'Suhu 38.6°C, mukosa merah muda lembap, BB 27.5 kg, sehat.',
    diagnosis: 'Vaksinasi DHPPi (tahunan)',
    treatment: 'Injeksi vaksin kombinasi DHPPi 1 dosis subkutan.',
    medicine: 'Nobivac DHPPi',
    notes: 'Kondisi hewan sangat baik. Pemilik diedukasi mengenai jadwal vaksin rabies berikutnya.',
    next_control_date: '2025-10-12'
  },
  {
    id: 5,
    pet_id: 1,
    doctor_name: 'dr. Sari Wijaya, Sp.KH',
    exam_date: '2025-05-15',
    service_type: 'Pemeriksaan Umum',
    complaints: 'Pemeriksaan kesehatan rutin berkala (General Check-up).',
    physical_exam: 'Suhu 38.3°C, berat 27.2 kg, gigi bebas karang berlebih, mata bersih, bulu berkilau.',
    diagnosis: 'Cek kesehatan rutin',
    treatment: 'Pemberian obat cacing spektrum luas.',
    medicine: 'Drontal Plus Dog (2.5 tablet)',
    notes: 'Pertahankan pola makan dan aktivitas fisik yang rutin.',
    next_control_date: '2025-11-15'
  },
  {
    id: 6,
    pet_id: 2,
    doctor_name: 'dr. Sari Wijaya, Sp.KH',
    exam_date: '2025-07-12',
    service_type: 'Pengobatan',
    complaints: 'Bersin-bersin dan hidung sedikit berlendir selama 2 hari.',
    physical_exam: 'Suhu 38.8°C, mukosa hidung hiperemis ringan, paru-paru bersih.',
    diagnosis: 'Flu Ringan Kucing (Feline Rhinotracheitis ringan)',
    treatment: 'Nebulisasi saline dan injeksi vitamin daya tahan tubuh.',
    medicine: 'Antibiotik Doxycycline sirup + Lysine supplement',
    notes: 'Jaga kehangatan ruangan dan isolasi sementara dari kucing lain.',
    next_control_date: '2025-07-19'
  }
];

// Initial Vaccinations - with dynamic dates so relative days badges always work!
const DEFAULT_VACCINES = [
  {
    id: 1,
    pet_id: 1,
    vaccine_name: 'Vaksin Rabies',
    batch_number: 'RB-2025-9921',
    administered_date: getOffsetDate(-365),
    next_due_date: getOffsetDate(2), // 2 hari lagi (or overdue if -2)
    doctor_name: 'dr. Sari Wijaya, Sp.KH',
    status: 'Terjadwal',
    notes: 'Vaksinasi booster rabies tahunan perlindungan optimal.'
  },
  {
    id: 2,
    pet_id: 2,
    vaccine_name: 'Vaksin FVRCP (Tricat)',
    batch_number: 'FV-2025-1044',
    administered_date: getOffsetDate(-360),
    next_due_date: getOffsetDate(7), // 7 hari lagi
    doctor_name: 'dr. Sari Wijaya, Sp.KH',
    status: 'Terjadwal',
    notes: 'Booster tahunan perlindungan terhadap Panleukopenia, Calici, dan Rhinotracheitis.'
  },
  {
    id: 3,
    pet_id: 3,
    vaccine_name: 'Vaksin Rabies',
    batch_number: 'RB-2025-4428',
    administered_date: getOffsetDate(-350),
    next_due_date: getOffsetDate(20), // 20 hari lagi
    doctor_name: 'dr. Budi Santoso',
    status: 'Terjadwal',
    notes: 'Vaksinasi rabies berkala untuk Oreo.'
  },
  {
    id: 4,
    pet_id: 1,
    vaccine_name: 'Vaksin DHPPi Booster',
    batch_number: 'DH-2025-7801',
    administered_date: '2025-07-10',
    next_due_date: '2026-07-10',
    doctor_name: 'dr. Budi Santoso',
    status: 'Selesai',
    notes: 'Vaksinasi tahunan lengkap terlaksana dengan kondisi hewan sehat.'
  }
];

const DEFAULT_APPOINTMENTS = [
  {
    id: 1,
    user_id: 1,
    pet_id: 1,
    service_type: 'Pemeriksaan Umum',
    appointment_date: getOffsetDate(5),
    appointment_time: '11:00',
    complaints: 'Kontrol kesehatan rutin dan potong kuku.',
    status: 'Dikonfirmasi',
    admin_notes: 'Telah diverifikasi. Dokter jaga: dr. Sari Wijaya.'
  },
  {
    id: 2,
    user_id: 1,
    pet_id: 2,
    service_type: 'Vaksinasi',
    appointment_date: getOffsetDate(7),
    appointment_time: '14:00',
    complaints: 'Booster Vaksin FVRCP tahunan.',
    status: 'Menunggu Konfirmasi',
    admin_notes: ''
  },
  {
    id: 3,
    user_id: 1,
    pet_id: 3,
    service_type: 'Pengobatan Penyakit',
    appointment_date: getOffsetDate(-10),
    appointment_time: '10:00',
    complaints: 'Flu dan bersin-bersin selama 2 hari.',
    status: 'Selesai',
    admin_notes: 'Selesai ditangani dr. Budi.'
  },
  {
    id: 4,
    user_id: 1,
    pet_id: 1,
    service_type: 'Sterilisasi & Kastrasi',
    appointment_date: getOffsetDate(1), // Besok
    appointment_time: '09:00',
    complaints: 'Konsultasi tindakan sterilisasi dan cek darah pra-operasi.',
    status: 'Menunggu Konfirmasi',
    admin_notes: ''
  }
];

class DataStore {
  constructor() {
    this.init();
  }

  init() {
    // Migrate data from previous keys if exists
    const keyMap = [
      ['shinevet_current_user', STORAGE_KEYS.USER],
      ['shinevet_pets_data', STORAGE_KEYS.PETS],
      ['shinevet_medical_records', STORAGE_KEYS.RECORDS],
      ['shinevet_vaccinations_data', STORAGE_KEYS.VACCINES],
      ['shinevet_appointments_data', STORAGE_KEYS.APPOINTMENTS]
    ];
    keyMap.forEach(([oldKey, newKey]) => {
      if (!localStorage.getItem(newKey) && localStorage.getItem(oldKey)) {
        localStorage.setItem(newKey, localStorage.getItem(oldKey));
      }
    });

    if (!localStorage.getItem(STORAGE_KEYS.USER)) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USERS[0]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PETS)) {
      localStorage.setItem(STORAGE_KEYS.PETS, JSON.stringify(DEFAULT_PETS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RECORDS)) {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(DEFAULT_RECORDS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.VACCINES)) {
      localStorage.setItem(STORAGE_KEYS.VACCINES, JSON.stringify(DEFAULT_VACCINES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(DEFAULT_APPOINTMENTS));
    }
  }

  // --- Auth / User Management ---
  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)) || DEFAULT_USERS[0];
    } catch {
      return DEFAULT_USERS[0];
    }
  }

  setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  login(identifier, password) {
    const user = DEFAULT_USERS.find(
      u => u.email.toLowerCase() === identifier.toLowerCase() ||
           u.username.toLowerCase() === identifier.toLowerCase() ||
           u.phone === identifier
    );
    if (user) {
      this.setCurrentUser(user);
      return { success: true, user };
    }
    // Generic demo fallback allows login with any filled credential
    const fallbackUser = {
      id: 99,
      username: identifier.split('@')[0],
      email: identifier.includes('@') ? identifier : `${identifier}@mail.com`,
      full_name: identifier.split('@')[0].toUpperCase(),
      phone: '0812-0000-0000',
      address: 'Kota Cirebon',
      role: 'client',
      avatar: 'assets/images/user-avatar.svg'
    };
    this.setCurrentUser(fallbackUser);
    return { success: true, user: fallbackUser };
  }

  logout() {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  // --- Pets CRUD ---
  getPets(filter = {}) {
    let pets = JSON.parse(localStorage.getItem(STORAGE_KEYS.PETS) || '[]');
    if (filter.species && filter.species !== 'Semua') {
      pets = pets.filter(p => p.species.toLowerCase() === filter.species.toLowerCase());
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      pets = pets.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.pet_code.toLowerCase().includes(q) ||
        (p.breed && p.breed.toLowerCase().includes(q))
      );
    }
    return pets;
  }

  getPet(id) {
    const pets = this.getPets();
    return pets.find(p => p.id === parseInt(id, 10)) || null;
  }

  savePet(petData) {
    const pets = this.getPets();
    if (petData.id) {
      const idx = pets.findIndex(p => p.id === parseInt(petData.id, 10));
      if (idx !== -1) {
        pets[idx] = { ...pets[idx], ...petData, id: parseInt(petData.id, 10) };
        localStorage.setItem(STORAGE_KEYS.PETS, JSON.stringify(pets));
        return pets[idx];
      }
    }
    // Insert new
    const newId = pets.length ? Math.max(...pets.map(p => p.id)) + 1 : 1;
    const petCode = 'SV-' + String(newId).padStart(4, '0');
    const newPet = {
      ...petData,
      id: newId,
      pet_code: petCode,
      status: petData.status || 'Aktif',
      created_at: new Date().toISOString().split('T')[0]
    };
    pets.push(newPet);
    localStorage.setItem(STORAGE_KEYS.PETS, JSON.stringify(pets));
    return newPet;
  }

  deletePet(id) {
    let pets = this.getPets();
    pets = pets.filter(p => p.id !== parseInt(id, 10));
    localStorage.setItem(STORAGE_KEYS.PETS, JSON.stringify(pets));
    return true;
  }

  // --- Medical Records CRUD ---
  getRecords(filter = {}) {
    let records = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECORDS) || '[]');
    if (filter.pet_id && filter.pet_id !== 'Semua') {
      records = records.filter(r => r.pet_id === parseInt(filter.pet_id, 10));
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      records = records.filter(r => 
        r.diagnosis.toLowerCase().includes(q) ||
        r.service_type.toLowerCase().includes(q) ||
        r.doctor_name.toLowerCase().includes(q) ||
        (r.complaints && r.complaints.toLowerCase().includes(q))
      );
    }
    return records.sort((a, b) => new Date(b.exam_date) - new Date(a.exam_date));
  }

  getRecord(id) {
    const records = this.getRecords();
    return records.find(r => r.id === parseInt(id, 10)) || null;
  }

  saveRecord(recordData) {
    const records = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECORDS) || '[]');
    if (recordData.id) {
      const idx = records.findIndex(r => r.id === parseInt(recordData.id, 10));
      if (idx !== -1) {
        records[idx] = { ...records[idx], ...recordData, id: parseInt(recordData.id, 10) };
        localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
        return records[idx];
      }
    }
    const newId = records.length ? Math.max(...records.map(r => r.id)) + 1 : 1;
    const newRecord = { ...recordData, id: newId };
    records.push(newRecord);
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    return newRecord;
  }

  deleteRecord(id) {
    let records = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECORDS) || '[]');
    records = records.filter(r => r.id !== parseInt(id, 10));
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    return true;
  }

  // --- Vaccinations CRUD & Dynamic Calculation ---
  getVaccinations(filter = {}) {
    let vaccines = JSON.parse(localStorage.getItem(STORAGE_KEYS.VACCINES) || '[]');
    if (filter.pet_id && filter.pet_id !== 'Semua') {
      vaccines = vaccines.filter(v => v.pet_id === parseInt(filter.pet_id, 10));
    }
    if (filter.status && filter.status !== 'Semua') {
      vaccines = vaccines.filter(v => v.status === filter.status);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      vaccines = vaccines.filter(v => 
        v.vaccine_name.toLowerCase().includes(q) ||
        v.doctor_name.toLowerCase().includes(q)
      );
    }

    // Attach dynamic days remaining & badges calculated from actual system date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return vaccines.map(v => {
      const due = new Date(v.next_due_date);
      due.setHours(0, 0, 0, 0);
      const diffTime = due - today;
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      let badgeLabel = '';
      let badgeClass = '';
      let computedStatus = v.status;

      if (v.status === 'Terjadwal') {
        if (diffDays < 0) {
          computedStatus = 'Terlewat';
          badgeLabel = 'Terlewat';
          badgeClass = 'badge-danger';
        } else if (diffDays === 0) {
          computedStatus = 'Hari ini';
          badgeLabel = 'Hari ini';
          badgeClass = 'badge-warning';
        } else if (diffDays <= 3) {
          computedStatus = 'Mendekat';
          badgeLabel = `${diffDays} hari lagi`;
          badgeClass = 'badge-warning';
        } else {
          computedStatus = 'Mendatang';
          badgeLabel = `${diffDays} hari lagi`;
          badgeClass = 'badge-success';
        }
      } else if (v.status === 'Selesai') {
        badgeLabel = 'Selesai';
        badgeClass = 'badge-info';
      } else {
        badgeLabel = 'Dibatalkan';
        badgeClass = 'badge-muted';
      }

      return {
        ...v,
        days_remaining: diffDays,
        computed_status: computedStatus,
        badge_label: badgeLabel,
        badge_class: badgeClass
      };
    }).sort((a, b) => new Date(a.next_due_date) - new Date(b.next_due_date));
  }

  saveVaccination(vaccineData) {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.VACCINES) || '[]');
    if (vaccineData.id) {
      const idx = list.findIndex(v => v.id === parseInt(vaccineData.id, 10));
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...vaccineData, id: parseInt(vaccineData.id, 10) };
        localStorage.setItem(STORAGE_KEYS.VACCINES, JSON.stringify(list));
        return list[idx];
      }
    }
    const newId = list.length ? Math.max(...list.map(v => v.id)) + 1 : 1;
    const item = { ...vaccineData, id: newId };
    list.push(item);
    localStorage.setItem(STORAGE_KEYS.VACCINES, JSON.stringify(list));
    return item;
  }

  completeVaccination(id) {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.VACCINES) || '[]');
    const idx = list.findIndex(v => v.id === parseInt(id, 10));
    if (idx !== -1) {
      list[idx].status = 'Selesai';
      localStorage.setItem(STORAGE_KEYS.VACCINES, JSON.stringify(list));
      return list[idx];
    }
    return null;
  }

  deleteVaccination(id) {
    let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.VACCINES) || '[]');
    list = list.filter(v => v.id !== parseInt(id, 10));
    localStorage.setItem(STORAGE_KEYS.VACCINES, JSON.stringify(list));
    return true;
  }

  // --- Appointments CRUD & Slot Check ---
  getAppointments(filter = {}) {
    let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]');
    if (filter.status && filter.status !== 'Semua') {
      list = list.filter(a => a.status === filter.status);
    }
    return list.sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));
  }

  getPendingAppointmentsCount() {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]');
    return list.filter(a => a.status === 'Menunggu Konfirmasi').length;
  }

  confirmAppointment(id, doctorName = 'dr. Sari Wijaya, Sp.KH', room = 'Ruang Periksa 1', notes = '') {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]');
    const idx = list.findIndex(a => a.id === parseInt(id, 10));
    if (idx !== -1) {
      list[idx].status = 'Dikonfirmasi';
      list[idx].assigned_doctor = doctorName;
      list[idx].assigned_room = room;
      list[idx].admin_notes = notes || `Dikonfirmasi oleh Admin. Dokter: ${doctorName} di ${room}.`;
      list[idx].confirmed_at = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(list));
      return list[idx];
    }
    return null;
  }

  rescheduleAppointment(id, newDate, newTime, reason = '') {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]');
    // Check if new slot already booked by another appointment
    const clash = list.find(a => a.id !== parseInt(id, 10) && a.appointment_date === newDate && a.appointment_time === newTime && a.status !== 'Dibatalkan');
    if (clash) {
      return { success: false, message: `Slot ${newTime} pada ${newDate} sudah terisi.` };
    }

    const idx = list.findIndex(a => a.id === parseInt(id, 10));
    if (idx !== -1) {
      list[idx].appointment_date = newDate;
      list[idx].appointment_time = newTime;
      list[idx].admin_notes = reason ? `Jadwal diubah: ${reason}` : 'Jadwal kunjungan telah disesuaikan ulang.';
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(list));
      return { success: true, item: list[idx] };
    }
    return { success: false, message: 'Janji temu tidak ditemukan.' };
  }

  isSlotBooked(date, time) {
    const list = this.getAppointments();
    return list.some(a => a.appointment_date === date && a.appointment_time === time && a.status !== 'Dibatalkan');
  }

  saveAppointment(apptData) {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]');
    // Check clash
    if (!apptData.id && this.isSlotBooked(apptData.appointment_date, apptData.appointment_time)) {
      return { success: false, message: `Slot waktu ${apptData.appointment_time} pada tanggal ${apptData.appointment_date} sudah dipesan. Silakan pilih jam lain.` };
    }

    if (apptData.id) {
      const idx = list.findIndex(a => a.id === parseInt(apptData.id, 10));
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...apptData, id: parseInt(apptData.id, 10) };
        localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(list));
        return { success: true, item: list[idx] };
      }
    }

    const newId = list.length ? Math.max(...list.map(a => a.id)) + 1 : 1;
    const newItem = {
      ...apptData,
      id: newId,
      status: apptData.status || 'Menunggu Konfirmasi',
      created_at: new Date().toISOString()
    };
    list.push(newItem);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(list));
    return { success: true, item: newItem };
  }

  updateAppointmentStatus(id, newStatus) {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]');
    const idx = list.findIndex(a => a.id === parseInt(id, 10));
    if (idx !== -1) {
      list[idx].status = newStatus;
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(list));
      return list[idx];
    }
    return null;
  }

  deleteAppointment(id) {
    let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]');
    list = list.filter(a => a.id !== parseInt(id, 10));
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(list));
    return true;
  }

  // --- Dynamic Reminders Engine ---
  getReminders() {
    const reminders = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Upcoming and Overdue Vaccines
    const vaccines = this.getVaccinations();
    vaccines.forEach(v => {
      const pet = this.getPet(v.pet_id);
      const petName = pet ? pet.name : 'Hewan Peliharaan';
      if (v.status === 'Terjadwal') {
        if (v.days_remaining < 0) {
          reminders.push({
            type: 'vaccine',
            urgency: 'danger',
            title: `Jadwal Vaksinasi Terlewat: ${v.vaccine_name}`,
            message: `Jadwal vaksin ${v.vaccine_name} untuk ${petName} telah terlewat ${Math.abs(v.days_remaining)} hari. Harap segera jadwalkan kunjungan!`,
            date: v.next_due_date,
            pet_id: v.pet_id,
            pet_name: petName,
            action_label: 'Jadwalkan Vaksin'
          });
        } else if (v.days_remaining <= 7) {
          reminders.push({
            type: 'vaccine',
            urgency: v.days_remaining <= 3 ? 'warning' : 'info',
            title: `Vaksinasi Mendatang: ${v.vaccine_name}`,
            message: `Jadwal vaksin ${v.vaccine_name} untuk ${petName} jatuh tempo dalam ${v.days_remaining} hari (${v.next_due_date}).`,
            date: v.next_due_date,
            pet_id: v.pet_id,
            pet_name: petName,
            action_label: 'Lihat Jadwal'
          });
        }
      }
    });

    // 2. Upcoming Medical Controls / Checkups
    const records = this.getRecords();
    records.forEach(r => {
      if (r.next_control_date) {
        const ctrlDate = new Date(r.next_control_date);
        ctrlDate.setHours(0, 0, 0, 0);
        const diff = Math.round((ctrlDate - today) / (1000 * 60 * 60 * 24));
        const pet = this.getPet(r.pet_id);
        const petName = pet ? pet.name : 'Hewan Peliharaan';

        if (diff >= -5 && diff <= 14) {
          reminders.push({
            type: 'control',
            urgency: diff <= 2 ? 'warning' : 'info',
            title: `Kontrol Kesehatan Dokter: ${petName}`,
            message: `Rekomendasi kontrol ulang pasca pemeriksaan ${r.service_type} (${r.diagnosis}) dengan ${r.doctor_name}.`,
            date: r.next_control_date,
            pet_id: r.pet_id,
            pet_name: petName,
            action_label: 'Buat Janji Kontrol'
          });
        }
      }
    });

    return reminders;
  }

  // --- Stats for Dashboard Overview ---
  getDashboardStats() {
    const pets = this.getPets();
    const vaccines = this.getVaccinations({ status: 'Terjadwal' });
    const appointments = this.getAppointments();
    const upcomingAppts = appointments.filter(a => a.status === 'Dikonfirmasi' || a.status === 'Menunggu Konfirmasi');

    return {
      totalPets: pets.length,
      upcomingVaccines: vaccines.length,
      upcomingAppointments: upcomingAppts.length
    };
  }
}

// Global Store Instance
window.Store = new DataStore();
