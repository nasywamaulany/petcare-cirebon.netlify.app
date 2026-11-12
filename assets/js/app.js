/**
 * PETCARE | Dokter Hewan Kota Cirebon
 * Main Application Controller, Router, Modal & Toast UI Helpers
 */

const App = {
  currentView: 'home', // 'home', 'about', 'services', 'schedule', 'contact', 'login', 'dashboard', etc.
  currentDashboardSection: 'overview', // 'overview', 'pets', 'records', 'vaccines', 'appointments', 'reminders', 'profile'
  selectedPetIdForDetail: 1, // Default Mochi

  init() {
    this.bindEvents();
    this.checkInitialRoute();
    this.updateUserUI();
    this.updateBadges();
  },

  bindEvents() {
    // Navigation links (public & dashboard)
    document.querySelectorAll('[data-navigate]').forEach(elem => {
      elem.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = elem.getAttribute('data-navigate');
        this.navigateTo(targetView);
      });
    });

    // Mobile sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.toggle('mobile-open');
      });
    }

    // Modal close buttons (all modals)
    document.querySelectorAll('.modal-close, [data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeAllModals();
      });
    });

    // Close modal on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          this.closeAllModals();
        }
      });
    });

    // Search bar shortcut
    const searchBtns = document.querySelectorAll('.nav-search-btn');
    searchBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.openSearchModal();
      });
    });
  },

  checkInitialRoute() {
    const hash = window.location.hash.replace('#', '') || 'home';
    this.navigateTo(hash);
  },

  navigateTo(target) {
    // Determine if public or dashboard
    const publicViews = ['home', 'about', 'services', 'schedule', 'contact', 'login', 'register'];
    const dashboardSections = ['overview', 'pets', 'records', 'vaccines', 'appointments', 'reminders', 'profile'];

    if (publicViews.includes(target)) {
      this.currentView = target;
      document.getElementById('publicLayout').style.display = 'block';
      document.getElementById('dashboardLayout').style.display = 'none';

      // Hide all public view containers
      document.querySelectorAll('.public-view-section').forEach(sec => sec.style.display = 'none');
      const activeSection = document.getElementById(`view-${target}`);
      if (activeSection) {
        activeSection.style.display = 'block';
      }

      // Update active navlinks
      document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('data-navigate') === target) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (dashboardSections.includes(target) || target === 'dashboard') {
      const section = target === 'dashboard' ? 'overview' : target;
      this.currentDashboardSection = section;
      document.getElementById('publicLayout').style.display = 'none';
      document.getElementById('dashboardLayout').style.display = 'flex';

      // Hide all dashboard sections
      document.querySelectorAll('.dashboard-view-section').forEach(sec => sec.style.display = 'none');
      const activeSection = document.getElementById(`dash-${section}`);
      if (activeSection) {
        activeSection.style.display = 'block';
      }

      // Update sidebar active state
      document.querySelectorAll('.sidebar-item').forEach(item => {
        if (item.getAttribute('data-navigate') === section || (section === 'overview' && item.getAttribute('data-navigate') === 'dashboard')) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });

      // Refresh section content
      this.refreshDashboardSection(section);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Close mobile sidebar if open
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) sidebar.classList.remove('mobile-open');
    }

    window.location.hash = target;
  },

  refreshDashboardSection(section) {
    if (section === 'overview') {
      this.renderOverview();
    } else if (section === 'pets') {
      PetsModule.init();
    } else if (section === 'records') {
      RecordsModule.init();
    } else if (section === 'vaccines') {
      VaccinesModule.init();
    } else if (section === 'appointments') {
      AppointmentsModule.init();
    } else if (section === 'reminders') {
      RemindersModule.init();
    } else if (section === 'profile') {
      ProfileModule.init();
    }
  },

  renderOverview() {
    const user = Store.getCurrentUser();
    const stats = Store.getDashboardStats();

    // Greeting
    const greetingElem = document.getElementById('dashGreetingName');
    if (greetingElem) greetingElem.textContent = user.full_name.split(' ')[0];

    // Counter stats
    const petCountElem = document.getElementById('statTotalPets');
    if (petCountElem) petCountElem.textContent = stats.totalPets;

    const vaccineCountElem = document.getElementById('statTotalVaccines');
    if (vaccineCountElem) vaccineCountElem.textContent = stats.upcomingVaccines;

    const apptCountElem = document.getElementById('statTotalAppts');
    if (apptCountElem) apptCountElem.textContent = stats.upcomingAppointments;

    // Upcoming vaccines panel (left)
    const upcomingContainer = document.getElementById('dashUpcomingVaccinesList');
    if (upcomingContainer) {
      const vaccines = Store.getVaccinations({ status: 'Terjadwal' }).slice(0, 3);
      if (vaccines.length === 0) {
        upcomingContainer.innerHTML = `
          <div class="empty-state" style="padding: 20px 0;">
            <p class="empty-state-desc">Tidak ada jadwal vaksinasi terdekat saat ini.</p>
          </div>
        `;
      } else {
        upcomingContainer.innerHTML = vaccines.map(v => {
          const pet = Store.getPet(v.pet_id) || { name: 'Hewan', photo_url: 'assets/images/dog-avatar.svg' };
          return `
            <div class="upcoming-vaccine-item" onclick="App.navigateTo('vaccines')">
              <div class="vaccine-item-left">
                <img src="${pet.photo_url || 'assets/images/dog-avatar.svg'}" alt="${pet.name}" class="vaccine-pet-avatar" onerror="this.src='assets/images/dog-avatar.svg'">
                <div class="vaccine-item-info">
                  <h5>${pet.name} - ${v.vaccine_name}</h5>
                  <p>${this.formatIndoDate(v.next_due_date)}</p>
                </div>
              </div>
              <span class="badge ${v.badge_class}">${v.badge_label}</span>
            </div>
          `;
        }).join('');
      }
    }

    // Recent activity panel (right)
    const activityContainer = document.getElementById('dashRecentActivityList');
    if (activityContainer) {
      const records = Store.getRecords().slice(0, 4);
      if (records.length === 0) {
        activityContainer.innerHTML = `
          <div class="empty-state" style="padding: 20px 0;">
            <p class="empty-state-desc">Belum ada aktivitas kesehatan tercatat.</p>
          </div>
        `;
      } else {
        activityContainer.innerHTML = records.map(r => {
          const pet = Store.getPet(r.pet_id) || { name: 'Hewan' };
          let icon = '🩺';
          if (r.service_type.includes('Vaksin')) icon = '💉';
          else if (r.service_type.includes('Pengobatan')) icon = '💊';

          return `
            <div class="timeline-item" onclick="App.navigateTo('records')" style="cursor: pointer;">
              <div class="timeline-icon-wrap">${icon}</div>
              <div class="timeline-content">
                <h5>${r.service_type} • ${pet.name}</h5>
                <p>${r.diagnosis} — ${this.formatIndoDate(r.exam_date)}</p>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  },

  updateUserUI() {
    const user = Store.getCurrentUser();
    // Public buttons
    const navAuthBtn = document.getElementById('navAuthBtn');
    if (navAuthBtn) {
      if (user) {
        navAuthBtn.innerHTML = `Dashboard <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
        navAuthBtn.onclick = () => App.navigateTo('dashboard');
      } else {
        navAuthBtn.innerHTML = 'Login / Daftar';
        navAuthBtn.onclick = () => App.navigateTo('login');
      }
    }

    // Dashboard User Pills
    document.querySelectorAll('.user-pill-name').forEach(elem => {
      elem.textContent = user.full_name.split(' ')[0];
    });
    document.querySelectorAll('.user-avatar-img').forEach(elem => {
      elem.src = user.avatar || 'assets/images/user-avatar.svg';
    });

    // Topbar Role Switcher Pill
    const rolePill = document.getElementById('topbarRoleSwitcher');
    const roleIcon = document.getElementById('roleIcon');
    const roleLabel = document.getElementById('roleLabel');

    if (rolePill && roleLabel && roleIcon) {
      if (user.role === 'vet' || user.role === 'admin') {
        rolePill.classList.add('active-vet');
        roleIcon.textContent = '👨‍⚕️';
        roleLabel.textContent = 'Mode Dokter / Admin';
      } else {
        rolePill.classList.remove('active-vet');
        roleIcon.textContent = '🐾';
        roleLabel.textContent = 'Mode Klien';
      }
    }
  },

  toggleUserRole() {
    const user = Store.getCurrentUser();
    if (user.role === 'vet' || user.role === 'admin') {
      // Switch to client (Nasywa)
      Store.setCurrentUser({
        id: 1,
        username: 'nasywa',
        email: 'nasywa@email.com',
        full_name: 'Nasywa Maulani Putri',
        phone: '0812-3456-7890',
        address: 'Jl. Kesambi, Kota Cirebon',
        role: 'client',
        avatar: 'assets/images/user-avatar.svg'
      });
      this.showToast('Beralih ke Mode Klien (Nasywa)', 'info');
    } else {
      // Switch to vet / admin (dr. Sari)
      Store.setCurrentUser({
        id: 2,
        username: 'drsari',
        email: 'dr.sari@petcare.com',
        full_name: 'dr. Sari Wijaya, Sp.KH',
        phone: '0821-3566-6170',
        address: 'Jl. Terusan Cipto No. 8, Pekiringan, Kesambi, Kota Cirebon',
        role: 'vet',
        avatar: 'assets/images/dr-avatar.svg'
      });
      this.showToast('Beralih ke Mode Dokter / Admin (dr. Sari Wijaya)', 'success');
    }

    this.updateUserUI();
    this.refreshDashboardSection(this.currentDashboardSection);
  },

  updateBadges() {
    const reminders = Store.getReminders();
    const urgentCount = reminders.filter(r => r.urgency === 'danger' || r.urgency === 'warning').length;
    const notifBadges = document.querySelectorAll('.notif-badge-count');
    notifBadges.forEach(b => {
      if (urgentCount > 0) {
        b.style.display = 'block';
      } else {
        b.style.display = 'none';
      }
    });

    if (window.AppointmentsModule && typeof AppointmentsModule.updatePendingBadge === 'function') {
      AppointmentsModule.updatePendingBadge();
    }
  },

  // Modals & UI Helpers
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.classList.remove('active');
    });
    document.body.style.overflow = '';
  },

  confirmAction(message, onConfirm) {
    const confirmModal = document.getElementById('confirmActionModal');
    const msgElem = document.getElementById('confirmActionMessage');
    const btnConfirm = document.getElementById('confirmActionAcceptBtn');

    if (confirmModal && msgElem && btnConfirm) {
      msgElem.textContent = message;
      btnConfirm.onclick = () => {
        this.closeAllModals();
        if (typeof onConfirm === 'function') onConfirm();
      };
      this.openModal('confirmActionModal');
    } else {
      if (window.confirm(message)) {
        if (typeof onConfirm === 'function') onConfirm();
      }
    }
  },

  showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    let icon = '✓';
    if (type === 'danger') icon = '✕';
    if (type === 'warning') icon = '⚠';

    toast.innerHTML = `
      <span style="font-weight: 800; font-size: 1.1rem;">${icon}</span>
      <div>${message}</div>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  formatIndoDate(dateString) {
    if (!dateString) return '-';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return `${day} ${months[monthIdx] || parts[1]} ${year}`;
    }
    return dateString;
  },

  openSearchModal() {
    this.openModal('globalSearchModal');
    const input = document.getElementById('globalSearchInput');
    if (input) {
      input.value = '';
      input.focus();
      this.handleGlobalSearch('');
    }
  },

  handleGlobalSearch(query) {
    const resultsContainer = document.getElementById('globalSearchResults');
    if (!resultsContainer) return;
    if (!query || query.trim().length === 0) {
      resultsContainer.innerHTML = '<p class="text-muted" style="text-align: center; padding: 20px;">Ketik kata kunci untuk mencari data hewan, dokter, atau rekam medis...</p>';
      return;
    }

    const q = query.toLowerCase();
    const pets = Store.getPets({ search: q });
    const records = Store.getRecords({ search: q });
    const vaccines = Store.getVaccinations({ search: q });

    let html = '';
    if (pets.length > 0) {
      html += `<h6 style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin: 10px 0 6px;">Hewan Peliharaan (${pets.length})</h6>`;
      html += pets.map(p => `
        <div class="upcoming-vaccine-item" style="cursor: pointer; margin-bottom: 6px;" onclick="App.closeAllModals(); App.selectedPetIdForDetail=${p.id}; App.navigateTo('pets');">
          <div class="vaccine-item-left">
            <img src="${p.photo_url || 'assets/images/dog-avatar.svg'}" class="vaccine-pet-avatar">
            <div>
              <strong>${p.name}</strong> (${p.species} • ${p.breed})
              <div style="font-size: 0.785rem; color: var(--text-muted);">${p.pet_code} • Pemilik: Nasywa</div>
            </div>
          </div>
          <span class="badge badge-primary">Buka Profil</span>
        </div>
      `).join('');
    }

    if (records.length > 0) {
      html += `<h6 style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin: 14px 0 6px;">Rekam Medis (${records.length})</h6>`;
      html += records.slice(0, 3).map(r => `
        <div class="upcoming-vaccine-item" style="cursor: pointer; margin-bottom: 6px;" onclick="App.closeAllModals(); App.navigateTo('records'); RecordsModule.viewRecordDetail(${r.id});">
          <div>
            <strong>${r.service_type}</strong> - ${r.diagnosis}
            <div style="font-size: 0.785rem; color: var(--text-muted);">${App.formatIndoDate(r.exam_date)} • ${r.doctor_name}</div>
          </div>
          <span class="badge badge-info">Detail</span>
        </div>
      `).join('');
    }

    if (vaccines.length > 0) {
      html += `<h6 style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin: 14px 0 6px;">Vaksinasi (${vaccines.length})</h6>`;
      html += vaccines.slice(0, 3).map(v => `
        <div class="upcoming-vaccine-item" style="cursor: pointer; margin-bottom: 6px;" onclick="App.closeAllModals(); App.navigateTo('vaccines');">
          <div>
            <strong>${v.vaccine_name}</strong>
            <div style="font-size: 0.785rem; color: var(--text-muted);">Jatuh tempo: ${App.formatIndoDate(v.next_due_date)}</div>
          </div>
          <span class="badge ${v.badge_class}">${v.badge_label}</span>
        </div>
      `).join('');
    }

    if (!html) {
      html = `<div style="text-align: center; padding: 24px; color: var(--text-muted);">Tidak ditemukan hasil untuk "<strong>${query}</strong>".</div>`;
    }

    resultsContainer.innerHTML = html;
  }
};

window.App = App;
