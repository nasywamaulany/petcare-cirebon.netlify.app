/**
 * PETCARE | Pengelolaan Jadwal Vaksinasi (Vaccinations Module)
 * Core feature: Interactive Calendar & Upcoming List matching Mockup Row 3 Screen 1, Dynamic Date Badges, CRUD
 */

const VaccinesModule = {
  currentCalDate: new Date(),
  selectedCalDay: null,
  selectedStatusFilter: 'Semua',
  selectedPetFilter: 'Semua',
  searchQuery: '',

  init() {
    this.populateDropdowns();
    this.render();
    this.bindEvents();
  },

  bindEvents() {
    // Calendar prev & next month buttons
    const prevBtn = document.getElementById('calPrevMonthBtn');
    const nextBtn = document.getElementById('calNextMonthBtn');
    if (prevBtn) {
      prevBtn.onclick = () => {
        this.currentCalDate.setMonth(this.currentCalDate.getMonth() - 1);
        this.renderCalendar();
      };
    }
    if (nextBtn) {
      nextBtn.onclick = () => {
        this.currentCalDate.setMonth(this.currentCalDate.getMonth() + 1);
        this.renderCalendar();
      };
    }

    // Status filter
    const statusFilter = document.getElementById('vaccineStatusFilter');
    if (statusFilter) {
      statusFilter.onchange = (e) => {
        this.selectedStatusFilter = e.target.value;
        this.renderList();
      };
    }

    // Pet filter
    const petFilter = document.getElementById('vaccinePetFilter');
    if (petFilter) {
      petFilter.onchange = (e) => {
        this.selectedPetFilter = e.target.value;
        this.renderList();
      };
    }

    // Search query
    const searchInput = document.getElementById('vaccineSearchInput');
    if (searchInput) {
      searchInput.oninput = (e) => {
        this.searchQuery = e.target.value;
        this.renderList();
      };
    }

    // Add Vaccine button
    const addBtn = document.getElementById('btnAddVaccineModal');
    if (addBtn) {
      addBtn.onclick = () => this.openAddEditModal();
    }

    // Vaccine Form submit
    const form = document.getElementById('vaccineForm');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        this.saveVaccineFromForm();
      };
    }
  },

  populateDropdowns() {
    const petSelect = document.getElementById('vaccineFormPetId');
    const filterPetSelect = document.getElementById('vaccinePetFilter');
    const pets = Store.getPets();

    if (petSelect) {
      petSelect.innerHTML = pets.map(p => `<option value="${p.id}">${p.name} (${p.breed || p.species})</option>`).join('');
    }
    if (filterPetSelect) {
      filterPetSelect.innerHTML = `<option value="Semua">Semua Hewan</option>` +
        pets.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }
  },

  render() {
    this.renderCalendar();
    this.renderList();
  },

  renderCalendar() {
    const monthTitle = document.getElementById('calCurrentMonthTitle');
    const grid = document.getElementById('calDaysGrid');
    if (!monthTitle || !grid) return;

    const year = this.currentCalDate.getFullYear();
    const month = this.currentCalDate.getMonth();
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    monthTitle.textContent = `${monthNames[month]} ${year}`;

    // Get vaccines for event dots
    const vaccines = Store.getVaccinations();
    const eventDates = new Set();
    vaccines.forEach(v => {
      if (v.status !== 'Dibatalkan') {
        const parts = v.next_due_date.split('-');
        if (parts.length === 3 && parseInt(parts[0], 10) === year && parseInt(parts[1], 10) === month + 1) {
          eventDates.add(parseInt(parts[2], 10));
        }
      }
    });

    // Calendar Days
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    let cellsHtml = '';

    // Day headers
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    dayNames.forEach(d => {
      cellsHtml += `<div class="calendar-day-label">${d}</div>`;
    });

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cellsHtml += `<div class="calendar-date-cell other-month">${prevMonthDays - i}</div>`;
    }

    // Current month days
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    for (let day = 1; day <= totalDays; day++) {
      const isToday = isCurrentMonth && today.getDate() === day;
      const hasEvent = eventDates.has(day);
      const isSelected = this.selectedCalDay === day;

      cellsHtml += `
        <div class="calendar-date-cell ${isToday ? 'active-date' : ''} ${hasEvent ? 'has-event' : ''} ${isSelected ? 'active-date' : ''}" 
             onclick="VaccinesModule.filterByDay(${day})" 
             title="${hasEvent ? 'Ada jadwal vaksinasi' : ''}">
          ${day}
        </div>
      `;
    }

    grid.innerHTML = cellsHtml;
  },

  filterByDay(day) {
    this.selectedCalDay = (this.selectedCalDay === day) ? null : day;
    this.renderCalendar();
    this.renderList();
  },

  renderList() {
    const container = document.getElementById('upcomingVaccinesListContainer');
    if (!container) return;

    let vaccines = Store.getVaccinations({
      status: this.selectedStatusFilter,
      pet_id: this.selectedPetFilter,
      search: this.searchQuery
    });

    // Filter by calendar day if clicked
    if (this.selectedCalDay) {
      const year = this.currentCalDate.getFullYear();
      const monthStr = String(this.currentCalDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(this.selectedCalDay).padStart(2, '0');
      const targetDate = `${year}-${monthStr}-${dayStr}`;
      vaccines = vaccines.filter(v => v.next_due_date === targetDate);
    }

    if (vaccines.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 30px 10px;">
          <div class="empty-state-icon">💉</div>
          <h5 class="empty-state-title">Tidak Ada Jadwal Vaksinasi</h5>
          <p class="empty-state-desc">Belum ada jadwal yang cocok dengan filter atau tanggal yang dipilih.</p>
          <button class="btn btn-primary btn-sm" onclick="VaccinesModule.openAddEditModal()">+ Tambah Jadwal Vaksin</button>
        </div>
      `;
      return;
    }

    container.innerHTML = vaccines.map(v => {
      const pet = Store.getPet(v.pet_id) || { name: 'Hewan', photo_url: 'assets/images/dog-avatar.svg' };
      return `
        <div class="upcoming-vaccine-item">
          <div class="vaccine-item-left">
            <img src="${pet.photo_url || 'assets/images/dog-avatar.svg'}" alt="${pet.name}" class="vaccine-pet-avatar" onerror="this.src='assets/images/dog-avatar.svg'">
            <div class="vaccine-item-info">
              <h5>${pet.name}</h5>
              <div style="font-weight: 600; font-size: 0.885rem; color: var(--text-main); margin: 2px 0;">${v.vaccine_name}</div>
              <p style="font-size: 0.8rem; color: var(--text-muted);">
                Jatuh tempo: <strong>${App.formatIndoDate(v.next_due_date)}</strong> • Dokter: ${v.doctor_name}
              </p>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
            <span class="badge ${v.badge_class}">${v.badge_label}</span>
            <div style="display: flex; gap: 4px;">
              ${v.status === 'Terjadwal' ? `
                <button class="btn btn-secondary btn-sm" onclick="VaccinesModule.markCompleted(${v.id})" title="Tandai Sudah Selesai">✓ Selesai</button>
              ` : ''}
              <button class="btn btn-outline btn-sm btn-icon" onclick="VaccinesModule.openAddEditModal(null, ${v.id})" title="Edit">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button class="btn btn-outline btn-sm btn-icon" style="color: var(--danger); border-color: var(--danger-bg);" onclick="VaccinesModule.confirmDeleteVaccine(${v.id})" title="Hapus">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  openAddEditModal(defaultPetId = null, vaccineId = null) {
    this.populateDropdowns();
    const modalTitle = document.getElementById('vaccineModalTitle');
    const form = document.getElementById('vaccineForm');
    if (!form) return;

    form.reset();
    document.getElementById('vaccineFormId').value = '';
    document.getElementById('vaccineFormAdminDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('vaccineFormDoctor').value = 'dr. Sari Wijaya, Sp.KH';
    document.getElementById('vaccineFormStatus').value = 'Terjadwal';

    if (defaultPetId) {
      document.getElementById('vaccineFormPetId').value = defaultPetId;
    }

    if (vaccineId) {
      const v = Store.getVaccinations().find(item => item.id === parseInt(vaccineId, 10));
      if (v) {
        if (modalTitle) modalTitle.textContent = 'Edit Jadwal Vaksinasi';
        document.getElementById('vaccineFormId').value = v.id;
        document.getElementById('vaccineFormPetId').value = v.pet_id;
        document.getElementById('vaccineFormName').value = v.vaccine_name;
        document.getElementById('vaccineFormBatch').value = v.batch_number || '';
        document.getElementById('vaccineFormAdminDate').value = v.administered_date;
        document.getElementById('vaccineFormDueDate').value = v.next_due_date;
        document.getElementById('vaccineFormDoctor').value = v.doctor_name;
        document.getElementById('vaccineFormStatus').value = v.status;
        document.getElementById('vaccineFormNotes').value = v.notes || '';
      }
    } else {
      if (modalTitle) modalTitle.textContent = 'Tambah Jadwal Vaksinasi Baru';
      // Default next due date 1 year from now
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      document.getElementById('vaccineFormDueDate').value = nextYear.toISOString().split('T')[0];
    }

    App.openModal('vaccineFormModal');
  },

  saveVaccineFromForm() {
    const id = document.getElementById('vaccineFormId').value;
    const petId = parseInt(document.getElementById('vaccineFormPetId').value, 10);
    const vaccineName = document.getElementById('vaccineFormName').value.trim();
    const batch = document.getElementById('vaccineFormBatch').value.trim();
    const adminDate = document.getElementById('vaccineFormAdminDate').value;
    const dueDate = document.getElementById('vaccineFormDueDate').value;
    const doctor = document.getElementById('vaccineFormDoctor').value.trim();
    const status = document.getElementById('vaccineFormStatus').value;
    const notes = document.getElementById('vaccineFormNotes').value.trim();

    if (!petId || !vaccineName || !dueDate) {
      App.showToast('Pilih hewan, nama jenis vaksin, dan tanggal jatuh tempo wajib diisi!', 'danger');
      return;
    }

    const vaccineData = {
      pet_id: petId,
      vaccine_name: vaccineName,
      batch_number: batch,
      administered_date: adminDate,
      next_due_date: dueDate,
      doctor_name: doctor || 'dr. Sari Wijaya, Sp.KH',
      status,
      notes
    };

    if (id) {
      vaccineData.id = parseInt(id, 10);
    }

    Store.saveVaccination(vaccineData);
    App.closeAllModals();
    App.showToast('Jadwal vaksinasi berhasil disimpan!', 'success');
    this.render();
    App.renderOverview();
  },

  markCompleted(id) {
    Store.completeVaccination(id);
    App.showToast('Vaksinasi telah ditandai Selesai!', 'success');
    this.render();
    App.renderOverview();
  },

  confirmDeleteVaccine(id) {
    App.confirmAction(
      'Apakah Anda yakin ingin menghapus jadwal vaksinasi ini?',
      () => {
        Store.deleteVaccination(id);
        App.showToast('Jadwal vaksinasi berhasil dihapus.', 'warning');
        this.render();
        App.renderOverview();
      }
    );
  }
};

window.VaccinesModule = VaccinesModule;
