/**
 * PETCARE | Public Page Interactions & Auth Module
 * Hero CTA, Service Details Modal, Contact Form, Login & Register
 */

const PublicModule = {
  serviceDetails: {
    'pemeriksaan-umum': {
      title: 'Pemeriksaan Umum (General Check-up)',
      icon: '🩺',
      desc: 'Pemeriksaan kesehatan menyeluruh untuk hewan kesayangan Anda meliputi pengecekan suhu tubuh, berat badan, detak jantung, kesehatan mata, telinga, rongga mulut, kulit, dan refleks fisik.',
      benefits: ['Deteksi dini indikasi penyakit', 'Konsultasi nutrisi dan gaya hidup', 'Pemeriksaan parasit dan kutu'],
      serviceKey: 'Pemeriksaan Umum'
    },
    'vaksinasi': {
      title: 'Vaksinasi Hewan Rutin',
      icon: '💉',
      desc: 'Melindungi hewan kesayangan dari virus mematikan seperti Rabies, Parvovirus, Distemper, Feline Panleukopenia, Calicivirus, dan Rhinotracheitis.',
      benefits: ['Vaksin berkualitas dengan sertifikat resmi', 'Jadwal pengingat booster otomatis', 'Aman dan ditangani dokter hewan berpengalaman'],
      serviceKey: 'Vaksinasi'
    },
    'sterilisasi': {
      title: 'Sterilisasi & Kastrasi',
      icon: '✂️',
      desc: 'Tindakan bedah minor untuk mencegah kehamilan yang tidak diinginkan, menurunkan risiko tumor organ reproduksi, dan memperbaiki temperamen hewan kesayangan.',
      benefits: ['Fasilitas ruang operasi steril', 'Anestesi aman dan pemantauan ketat', 'Perawatan pasca-operasi ramah pasien'],
      serviceKey: 'Sterilisasi & Kastrasi'
    },
    'pengobatan': {
      title: 'Pengobatan & Terapi Penyakit',
      icon: '💊',
      desc: 'Diagnosa komprehensif dan terapi medis untuk berbagai keluhan seperti gangguan pencernaan, penyakit kulit, masalah pernapasan, serta infeksi akut lainnya.',
      benefits: ['Pemeriksaan laboratorium pendukung', 'Resep obat aman dan terstandar', 'Monitoring follow-up berkala'],
      serviceKey: 'Pengobatan Penyakit'
    },
    'gigi': {
      title: 'Perawatan Gigi & Mulut (Dental Care)',
      icon: '🦷',
      desc: 'Scaling karang gigi ultrasonik, pembersihan plak, dan pengobatan radang gusi (gingivitis) agar hewan tetap nyaman saat makan dan bebas dari bau mulut.',
      benefits: ['Pembersihan karang gigi tanpa merusak enamel', 'Pencegahan infeksi gusi kronis', 'Konsultasi perawatan gigi rumahan'],
      serviceKey: 'Perawatan Gigi'
    },
    'rawat-inap': {
      title: 'Rawat Inap & Observasi Intensif',
      icon: '🏥',
      desc: 'Fasilitas kamar rawat inap yang tenang, bersih, dengan sirkulasi udara baik dan pengawasan dokter serta paramedis hewan 24/7 untuk pasien kritis atau pasca operasi.',
      benefits: ['Kandang higienis terpisah antar spesies', 'Pemberian obat dan infus terjadwal', 'Laporan perkembangan pasien berkala ke pemilik'],
      serviceKey: 'Rawat Inap'
    }
  },

  init() {
    this.bindEvents();
  },

  bindEvents() {
    // Password visibility toggle
    document.querySelectorAll('.input-toggle-btn').forEach(btn => {
      btn.onclick = () => {
        const input = btn.parentElement.querySelector('input');
        if (input) {
          if (input.type === 'password') {
            input.type = 'text';
            btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
          } else {
            input.type = 'password';
            btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
          }
        }
      };
    });

    // Login Form Submit
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.onsubmit = (e) => {
        e.preventDefault();
        this.handleLogin();
      };
    }

    // Register Form Submit
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.onsubmit = (e) => {
        e.preventDefault();
        this.handleRegister();
      };
    }

    // Contact Form Submit
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.onsubmit = (e) => {
        e.preventDefault();
        this.handleContactSubmit();
      };
    }
  },

  openServiceModal(serviceKey) {
    const data = this.serviceDetails[serviceKey];
    if (!data) return;

    const modal = document.getElementById('serviceDetailModal');
    const title = document.getElementById('serviceModalTitle');
    const content = document.getElementById('serviceModalContent');
    const ctaBtn = document.getElementById('serviceModalCtaBtn');

    if (title) title.textContent = data.title;
    if (content) {
      content.innerHTML = `
        <div style="font-size: 2.2rem; margin-bottom: 12px;">${data.icon}</div>
        <p style="font-size: 0.95rem; line-height: 1.6; color: var(--text-muted); margin-bottom: 20px;">
          ${data.desc}
        </p>
        <h5 style="font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin-bottom: 10px;">Keunggulan Layanan:</h5>
        <ul style="padding-left: 20px; line-height: 1.8; color: var(--text-main); font-size: 0.9rem; margin-bottom: 24px;">
          ${data.benefits.map(b => `<li>${b}</li>`).join('')}
        </ul>
      `;
    }

    if (ctaBtn) {
      ctaBtn.onclick = () => {
        App.closeAllModals();
        App.navigateTo('appointments');
        if (AppointmentsModule) {
          AppointmentsModule.selectService(data.serviceKey);
        }
      };
    }

    App.openModal('serviceDetailModal');
  },

  handleLogin() {
    const identifier = document.getElementById('loginIdentifier').value.trim();
    const pass = document.getElementById('loginPassword').value.trim();

    if (!identifier || !pass) {
      App.showToast('Email/No HP dan password wajib diisi!', 'danger');
      return;
    }

    const res = Store.login(identifier, pass);
    if (res.success) {
      App.showToast(`Selamat datang kembali, ${res.user.full_name}!`, 'success');
      App.updateUserUI();
      App.navigateTo('dashboard');
    } else {
      App.showToast('Login gagal. Periksa kembali akun Anda.', 'danger');
    }
  },

  quickDemoLogin(userType) {
    if (userType === 'nasywa') {
      Store.login('nasywa@email.com', 'password123');
      App.showToast('Masuk sebagai Klien: Nasywa Maulani Putri', 'success');
    } else if (userType === 'vet') {
      Store.login('dr.sari@petcare.com', 'password123');
      App.showToast('Masuk sebagai Dokter: dr. Sari Wijaya, Sp.KH', 'success');
    }
    App.updateUserUI();
    App.navigateTo('dashboard');
  },

  handleRegister() {
    const fullName = document.getElementById('regFullName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const pass = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirmPassword').value;

    if (!fullName || !email || !phone || !pass) {
      App.showToast('Harap lengkapi semua kolom pendaftaran!', 'danger');
      return;
    }

    if (pass !== confirm) {
      App.showToast('Konfirmasi password tidak sesuai!', 'danger');
      return;
    }

    const newUser = {
      id: Date.now(),
      username: email.split('@')[0],
      email,
      full_name: fullName,
      phone,
      address: 'Kota Cirebon',
      role: 'client',
      avatar: 'assets/images/user-avatar.svg'
    };

    Store.setCurrentUser(newUser);
    App.showToast('Pendaftaran berhasil! Selamat datang di PETCARE.', 'success');
    App.updateUserUI();
    App.navigateTo('dashboard');
  },

  handleContactSubmit() {
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const msg = document.getElementById('contactMsg').value.trim();

    if (!name || !email || !msg) {
      App.showToast('Harap lengkapi nama, email, dan pesan Anda!', 'danger');
      return;
    }

    document.getElementById('contactForm').reset();
    App.showToast('Terima kasih! Pesan konsultasi Anda telah diterima oleh tim PETCARE Cirebon.', 'success');
  }
};

window.PublicModule = PublicModule;
