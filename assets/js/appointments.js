/**
 * PETCARE | Buat & Kelola Janji Temu (Appointments Module)
 * Client 3-Step Wizard & Complete Admin / Receptionist Appointment Desk
 */

const AppointmentsModule = {
  currentTab: 'admin', // 'admin' (Meja Kelola Admin) or 'client' (Formulir Buat Janji)
  adminStatusFilter: 'Semua',
  adminDateFilter: 'Semua',
  adminSearchQuery: '',
  selectedApptForAction: null,

  // Client Wizard State
  currentStep: 1,
  bookingData: {
    service: 'Pemeriksaan Umum',
    date: '',
    time: '11:00',
    petId: 1,
    complaints: ''
  },
  availableTimes: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],

  init() {
    const user = Store.getCurrentUser();
    // Default to admin desk if logged in as vet/admin or by default to showcase admin capabilities
    this.currentTab = (user && user.role === 'vet') ? 'admin' : 'admin';

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.bookingData.date = tomorrow.toISOString().split('T')[0];

    this.populatePetsList();
    this.bindEvents();
    this.render();
  },

  bindEvents() {
    // Stepper navigation buttons (client wizard)
    const btnNext = document.getElementById('wizardBtnNext');
    const btnBack = document.getElementById('wizardBtnBack');

    if (btnNext) btnNext.onclick = () => this.handleNextStep();
    if (btnBack) btnBack.onclick = () => this.handlePrevStep();

    // Date picker change in Step 2
    const dateInput = document.getElementById('wizardDateInput');
    if (dateInput) {
      dateInput.min = new Date().toISOString().split('T')[0];
      dateInput.value = this.bookingData.date;
      dateInput.onchange = (e) => {
        this.bookingData.date = e.target.value;
        this.renderTimeSlots();
      };
    }

    // Admin search input
    const adminSearch = document.getElementById('adminApptSearch');
    if (adminSearch) {
      adminSearch.oninput = (e) => {
        this.adminSearchQuery = e.target.value;
        this.renderAdminTable();
      };
    }

    // Admin date filter
    const adminDate = document.getElementById('adminApptDateFilter');
    if (adminDate) {
      adminDate.onchange = (e) => {
        this.adminDateFilter = e.target.value;
        this.renderAdminTable();
      };
    }

    // Confirm Appointment Modal Form Submit
    const confirmForm = document.getElementById('adminConfirmApptForm');
    if (confirmForm) {
      confirmForm.onsubmit = (e) => {
        e.preventDefault();
        this.submitAdminConfirmation();
      };
    }

    // Reschedule Modal Form Submit
    const rescheduleForm = document.getElementById('adminRescheduleForm');
    if (rescheduleForm) {
      rescheduleForm.onsubmit = (e) => {
        e.preventDefault();
        this.submitAdminReschedule();
      };
    }
  },

  switchViewTab(tab) {
    this.currentTab = tab;
    this.render();
  },

  render() {
    const adminSection = document.getElementById('apptAdminSection');
    const clientSection = document.getElementById('apptClientSection');
    const tabBtnAdmin = document.getElementById('tabBtnApptAdmin');
    const tabBtnClient = document.getElementById('tabBtnApptClient');

    if (this.currentTab === 'admin') {
      if (adminSection) adminSection.style.display = 'block';
      if (clientSection) clientSection.style.display = 'none';
      if (tabBtnAdmin) tabBtnAdmin.classList.add('active');
      if (tabBtnClient) tabBtnClient.classList.remove('active');
      this.renderAdminKPIs();
      this.renderAdminTable();
    } else {
      if (adminSection) adminSection.style.display = 'none';
      if (clientSection) clientSection.style.display = 'block';
      if (tabBtnAdmin) tabBtnAdmin.classList.remove('active');
      if (tabBtnClient) tabBtnClient.classList.add('active');
      this.renderWizard();
      this.renderClientAppointmentsTable();
    }

    this.updatePendingBadge();
  },

  updatePendingBadge() {
    const pendingCount = Store.getPendingAppointmentsCount();
    document.querySelectorAll('.badge-pending-count').forEach(elem => {
      elem.textContent = pendingCount;
      elem.style.display = pendingCount > 0 ? 'inline-flex' : 'none';
    });
  },

  // ====================================================================
  // ADMIN DESK FUNCTIONS
  // ====================================================================
  renderAdminKPIs() {
    const list = Store.getAppointments();
    const total = list.length;
    const pending = list.filter(a => a.status === 'Menunggu Konfirmasi').length;
    const confirmed = list.filter(a => a.status === 'Dikonfirmasi').length;
    const completed = list.filter(a => a.status === 'Selesai').length;

    const elTotal = document.getElementById('kpiTotalAppts');
    const elPending = document.getElementById('kpiPendingAppts');
    const elConfirmed = document.getElementById('kpiConfirmedAppts');
    const elCompleted = document.getElementById('kpiCompletedAppts');

    if (elTotal) elTotal.textContent = total;
    if (elPending) elPending.textContent = pending;
    if (elConfirmed) elConfirmed.textContent = confirmed;
    if (elCompleted) elCompleted.textContent = completed;
  },

  filterAdminByStatus(status) {
    this.adminStatusFilter = status;
    document.querySelectorAll('.admin-filter-pill').forEach(btn => {
      if (btn.getAttribute('data-status') === status) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    this.renderAdminTable();
  },

  renderAdminTable() {
    const tbody = document.getElementById('adminApptsTableBody');
    if (!tbody) return;

    let list = Store.getAppointments();

    // Filter status
    if (this.adminStatusFilter !== 'Semua') {
      list = list.filter(a => a.status === this.adminStatusFilter);
    }

    // Filter date
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    if (this.adminDateFilter === 'today') {
      list = list.filter(a => a.appointment_date === today);
    } else if (this.adminDateFilter === 'tomorrow') {
      list = list.filter(a => a.appointment_date === tomorrowStr);
    }

    // Search query
    if (this.adminSearchQuery) {
      const q = this.adminSearchQuery.toLowerCase();
      list = list.filter(a => {
        const pet = Store.getPet(a.pet_id) || { name: '' };
        return a.service_type.toLowerCase().includes(q) ||
               pet.name.toLowerCase().includes(q) ||
               (a.complaints && a.complaints.toLowerCase().includes(q)) ||
               (a.appointment_time && a.appointment_time.includes(q));
      });
    }

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 36px 20px;">
            <div class="empty-state" style="padding: 0;">
              <div class="empty-state-icon">📋</div>
              <h5 class="empty-state-title">Tidak Ada Janji Temu</h5>
              <p class="empty-state-desc">Belum ada pengajuan janji temu yang cocok dengan filter yang dipilih.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    const defaultUser = Store.getCurrentUser();

    tbody.innerHTML = list.map(a => {
      const pet = Store.getPet(a.pet_id) || { name: 'Pasien Hewan', species: 'Hewan', breed: '-' };
      const ownerName = defaultUser.full_name || 'Nasywa Maulani Putri';
      const ownerPhone = defaultUser.phone || '0812-3456-7890';

      let statusBadge = '';
      if (a.status === 'Menunggu Konfirmasi') {
        statusBadge = '<span class="badge badge-warning">⏳ Menunggu Konfirmasi</span>';
      } else if (a.status === 'Dikonfirmasi') {
        statusBadge = '<span class="badge badge-success">✓ Dikonfirmasi</span>';
      } else if (a.status === 'Selesai') {
        statusBadge = '<span class="badge badge-info">✓ Selesai</span>';
      } else {
        statusBadge = '<span class="badge badge-danger">✕ Dibatalkan</span>';
      }

      // Format clean phone for WA (replace leading 0 with 62)
      const cleanPhone = ownerPhone.replace(/[^0-9]/g, '').replace(/^0/, '62');
      const waMessage = encodeURIComponent(
        `Halo Kak ${ownerName},\n\nKami dari *PETCARE Cirebon* ingin mengonfirmasi jadwal kunjungan untuk *${pet.name}*:\n` +
        `🗓 Tanggal: ${App.formatIndoDate(a.appointment_date)}\n` +
        `⏰ Waktu: ${a.appointment_time} WIB\n` +
        `🩺 Layanan: ${a.service_type}\n\n` +
        `Mohon hadir 10 menit sebelum jadwal. Jika ada pertanyaan silakan balas pesan ini. Terima kasih! 🐾`
      );
      const waLink = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${waMessage}`;

      return `
        <tr style="${a.status === 'Menunggu Konfirmasi' ? 'background-color: #FFFDF8;' : ''}">
          <td>
            <div style="font-weight: 800; color: var(--primary);">#SV-APT${String(a.id).padStart(3, '0')}</div>
            <div style="font-size: 0.775rem; color: var(--text-muted);">${App.formatIndoDate(a.appointment_date)}</div>
            <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);">${a.appointment_time} WIB</div>
          </td>
          <td>
            <div style="font-weight: 700; color: var(--text-main);">${ownerName}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${ownerPhone}</div>
          </td>
          <td>
            <div style="font-weight: 700; color: var(--text-main);">${pet.name}</div>
            <div style="font-size: 0.785rem; color: var(--text-muted);">${pet.species} • ${pet.breed || '-'}</div>
          </td>
          <td>
            <div style="font-weight: 700; color: var(--primary);">${a.service_type}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); max-width: 200px; white-space: normal;">
              ${a.complaints ? `"${a.complaints}"` : 'Tidak ada keluhan tertulis'}
            </div>
          </td>
          <td>
            ${statusBadge}
            ${a.assigned_doctor ? `
              <div style="font-size: 0.775rem; color: var(--text-muted); margin-top: 4px;">
                👨‍⚕️ ${a.assigned_doctor} (${a.assigned_room || 'Ruang Periksa'})
              </div>
            ` : ''}
            ${a.admin_notes ? `
              <div style="font-size: 0.75rem; color: var(--text-light); font-style: italic; margin-top: 2px;">
                Catatan: ${a.admin_notes}
              </div>
            ` : ''}
          </td>
          <td>
            <div style="display: flex; flex-direction: column; gap: 6px; min-width: 130px;">
              ${a.status === 'Menunggu Konfirmasi' ? `
                <button class="btn btn-primary btn-sm" onclick="AppointmentsModule.openAdminConfirmModal(${a.id})">
                  ✓ Terima & Konfirmasi
                </button>
              ` : ''}

              ${a.status === 'Dikonfirmasi' ? `
                <button class="btn btn-secondary btn-sm" onclick="AppointmentsModule.markAsCompleted(${a.id})" title="Pasien telah hadir dan selesai diperiksa">
                  ✓ Tandai Selesai
                </button>
                <button class="btn btn-outline btn-sm" onclick="AppointmentsModule.createRecordFromAppt(${a.id})" title="Buat rekam medis langsung dari data janji temu ini">
                  + Buat Rekam Medis
                </button>
              ` : ''}

              <!-- Direct WhatsApp button -->
              <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-whatsapp" style="text-align: center;">
                💬 Hubungi WA
              </a>

              ${a.status !== 'Selesai' && a.status !== 'Dibatalkan' ? `
                <button class="btn btn-outline btn-sm" onclick="AppointmentsModule.openAdminRescheduleModal(${a.id})">
                  📅 Jadwal Ulang
                </button>
                <button class="btn btn-outline btn-sm" style="color: var(--danger); border-color: var(--danger-bg);" onclick="AppointmentsModule.cancelByAdmin(${a.id})">
                  ✕ Tolak / Batalkan
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  openAdminConfirmModal(apptId) {
    const list = Store.getAppointments();
    const a = list.find(item => item.id === parseInt(apptId, 10));
    if (!a) return;

    this.selectedApptForAction = a;
    const pet = Store.getPet(a.pet_id) || { name: 'Pasien' };
    const user = Store.getCurrentUser();

    document.getElementById('confirmApptId').value = a.id;
    document.getElementById('confirmModalInfo').innerHTML = `
      <div style="background: var(--primary-light); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--primary-200); margin-bottom: 16px; font-size: 0.9rem;">
        <div><strong>Pemilik:</strong> ${user.full_name} (${user.phone})</div>
        <div><strong>Pasien Hewan:</strong> ${pet.name} (${pet.species})</div>
        <div><strong>Layanan:</strong> ${a.service_type}</div>
        <div><strong>Jadwal:</strong> ${App.formatIndoDate(a.appointment_date)} pukul ${a.appointment_time} WIB</div>
        ${a.complaints ? `<div><strong>Keluhan:</strong> "${a.complaints}"</div>` : ''}
      </div>
    `;

    document.getElementById('confirmApptNotes').value = `Jadwal janji temu telah diverifikasi. Silakan datang ke klinik tepat waktu.`;
    App.openModal('adminConfirmApptModal');
  },

  submitAdminConfirmation() {
    if (!this.selectedApptForAction) return;

    const id = this.selectedApptForAction.id;
    const doctor = document.getElementById('confirmApptDoctor').value;
    const room = document.getElementById('confirmApptRoom').value;
    const notes = document.getElementById('confirmApptNotes').value.trim();

    Store.confirmAppointment(id, doctor, room, notes);
    App.closeAllModals();
    App.showToast(`Janji temu #SV-APT${String(id).padStart(3, '0')} berhasil dikonfirmasi!`, 'success');
    this.render();
    App.renderOverview();
  },

  openAdminRescheduleModal(apptId) {
    const list = Store.getAppointments();
    const a = list.find(item => item.id === parseInt(apptId, 10));
    if (!a) return;

    this.selectedApptForAction = a;
    document.getElementById('rescheduleApptId').value = a.id;
    document.getElementById('rescheduleNewDate').value = a.appointment_date;
    document.getElementById('rescheduleNewTime').value = a.appointment_time;
    document.getElementById('rescheduleReason').value = 'Penyesuaian jadwal dokter jaga klinik.';

    App.openModal('adminRescheduleModal');
  },

  submitAdminReschedule() {
    if (!this.selectedApptForAction) return;

    const id = this.selectedApptForAction.id;
    const newDate = document.getElementById('rescheduleNewDate').value;
    const newTime = document.getElementById('rescheduleNewTime').value;
    const reason = document.getElementById('rescheduleReason').value.trim();

    const res = Store.rescheduleAppointment(id, newDate, newTime, reason);
    if (!res.success) {
      App.showToast(res.message, 'danger');
      return;
    }

    App.closeAllModals();
    App.showToast(`Jadwal janji temu berhasil diubah ke ${App.formatIndoDate(newDate)} pukul ${newTime} WIB.`, 'success');
    this.render();
    App.renderOverview();
  },

  markAsCompleted(id) {
    Store.updateAppointmentStatus(id, 'Selesai');
    App.showToast('Janji temu telah ditandai Selesai.', 'success');
    this.render();
    App.renderOverview();
  },

  createRecordFromAppt(id) {
    const list = Store.getAppointments();
    const a = list.find(item => item.id === parseInt(id, 10));
    if (!a) return;

    App.navigateTo('records');
    if (RecordsModule) {
      RecordsModule.openAddEditModal(a.pet_id);
      setTimeout(() => {
        const servSelect = document.getElementById('recordFormService');
        const compText = document.getElementById('recordFormComplaints');
        const docInput = document.getElementById('recordFormDoctor');
        if (servSelect) servSelect.value = a.service_type;
        if (compText && a.complaints) compText.value = a.complaints;
        if (docInput && a.assigned_doctor) docInput.value = a.assigned_doctor;
      }, 150);
    }
  },

  cancelByAdmin(id) {
    App.confirmAction('Apakah Anda yakin ingin membatalkan jadwal janji temu ini?', () => {
      Store.updateAppointmentStatus(id, 'Dibatalkan');
      App.showToast('Janji temu telah dibatalkan.', 'warning');
      this.render();
      App.renderOverview();
    });
  },

  // ====================================================================
  // CLIENT WIZARD FUNCTIONS
  // ====================================================================
  populatePetsList() {
    const petSelect = document.getElementById('wizardPetSelect');
    if (petSelect) {
      const pets = Store.getPets();
      petSelect.innerHTML = pets.map(p => `
        <option value="${p.id}" ${p.id === this.bookingData.petId ? 'selected' : ''}>
          ${p.name} (${p.species} • ${p.breed || '-'})
        </option>
      `).join('');
    }
  },

  selectService(serviceName) {
    this.bookingData.service = serviceName;
    document.querySelectorAll('.service-select-card').forEach(card => {
      if (card.getAttribute('data-service') === serviceName) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });
  },

  selectTime(timeSlot) {
    if (Store.isSlotBooked(this.bookingData.date, timeSlot)) {
      App.showToast(`Slot pukul ${timeSlot} sudah penuh terisi. Silakan pilih waktu lain.`, 'warning');
      return;
    }
    this.bookingData.time = timeSlot;
    document.querySelectorAll('.time-slot-btn').forEach(btn => {
      if (btn.getAttribute('data-time') === timeSlot) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    });
  },

  renderTimeSlots() {
    const container = document.getElementById('wizardTimeSlotsContainer');
    if (!container) return;

    container.innerHTML = this.availableTimes.map(time => {
      const isBooked = Store.isSlotBooked(this.bookingData.date, time);
      const isSelected = this.bookingData.time === time;
      return `
        <button type="button" 
                class="time-slot-btn ${isSelected && !isBooked ? 'selected' : ''}" 
                data-time="${time}" 
                ${isBooked ? 'disabled title="Sudah dipesan"' : ''}
                onclick="AppointmentsModule.selectTime('${time}')">
          ${time} ${isBooked ? '<span style="font-size: 0.7rem; display:block;">(Penuh)</span>' : ''}
        </button>
      `;
    }).join('');
  },

  renderWizard() {
    for (let i = 1; i <= 3; i++) {
      const stepElem = document.getElementById(`stepItem${i}`);
      if (stepElem) {
        stepElem.classList.remove('active', 'completed');
        if (i < this.currentStep) {
          stepElem.classList.add('completed');
        } else if (i === this.currentStep) {
          stepElem.classList.add('active');
        }
      }
      const panel = document.getElementById(`wizardStep${i}`);
      if (panel) {
        panel.style.display = i === this.currentStep ? 'block' : 'none';
      }
    }

    const btnBack = document.getElementById('wizardBtnBack');
    const btnNext = document.getElementById('wizardBtnNext');

    if (btnBack) {
      btnBack.style.display = this.currentStep > 1 ? 'inline-flex' : 'none';
    }

    if (btnNext) {
      if (this.currentStep === 3) {
        btnNext.innerHTML = `Konfirmasi & Ajukan Janji <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      } else {
        btnNext.innerHTML = `Lanjutkan <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
      }
    }

    if (this.currentStep === 2) {
      this.renderTimeSlots();
    } else if (this.currentStep === 3) {
      this.renderSummaryReview();
    }
  },

  renderSummaryReview() {
    const summaryContainer = document.getElementById('wizardReviewSummary');
    if (!summaryContainer) return;

    const pet = Store.getPet(this.bookingData.petId) || { name: 'Hewan' };
    const user = Store.getCurrentUser();

    summaryContainer.innerHTML = `
      <div style="background: var(--bg-page); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px; margin-bottom: 20px;">
        <h5 style="font-weight: 800; margin-bottom: 12px; color: var(--text-main);">Ringkasan Rencana Kunjungan</h5>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.9rem;">
          <div>
            <span style="color: var(--text-muted); font-size: 0.8rem; font-weight: 700;">LAYANAN DIPILIH:</span>
            <div style="font-weight: 700; color: var(--primary);">${this.bookingData.service}</div>
          </div>
          <div>
            <span style="color: var(--text-muted); font-size: 0.8rem; font-weight: 700;">TANGGAL & JAM:</span>
            <div style="font-weight: 700; color: var(--text-main);">${App.formatIndoDate(this.bookingData.date)} • Pukul ${this.bookingData.time} WIB</div>
          </div>
          <div>
            <span style="color: var(--text-muted); font-size: 0.8rem; font-weight: 700;">PASIEN HEWAN:</span>
            <div style="font-weight: 700; color: var(--text-main);">${pet.name} (${pet.species})</div>
          </div>
          <div>
            <span style="color: var(--text-muted); font-size: 0.8rem; font-weight: 700;">PEMILIK:</span>
            <div style="font-weight: 600; color: var(--text-main);">${user.full_name} (${user.phone})</div>
          </div>
        </div>
        <div style="margin-top: 14px; padding: 10px; background: #FEF3C7; border-radius: var(--radius-sm); border: 1px solid #FDE68A; font-size: 0.825rem; color: #92400E;">
          ℹ Status awal janji temu adalah <strong>"Menunggu Konfirmasi"</strong>. Admin/petugas klinik akan meninjau dan mengonfirmasi janji temu Anda.
        </div>
      </div>
    `;
  },

  handleNextStep() {
    if (this.currentStep === 1) {
      if (!this.bookingData.service) {
        App.showToast('Silakan pilih salah satu layanan!', 'danger');
        return;
      }
      this.currentStep = 2;
      this.renderWizard();
    } else if (this.currentStep === 2) {
      if (!this.bookingData.date || !this.bookingData.time) {
        App.showToast('Silakan tentukan tanggal dan jam kunjungan!', 'danger');
        return;
      }
      if (Store.isSlotBooked(this.bookingData.date, this.bookingData.time)) {
        App.showToast('Slot waktu tersebut sudah dipesan. Silakan pilih jam lain.', 'danger');
        return;
      }
      this.currentStep = 3;
      this.renderWizard();
    } else if (this.currentStep === 3) {
      this.submitBooking();
    }
  },

  handlePrevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.renderWizard();
    }
  },

  submitBooking() {
    const petSelect = document.getElementById('wizardPetSelect');
    const complaintsInput = document.getElementById('wizardComplaintsInput');

    if (petSelect) this.bookingData.petId = parseInt(petSelect.value, 10);
    if (complaintsInput) this.bookingData.complaints = complaintsInput.value.trim();

    const user = Store.getCurrentUser();
    const result = Store.saveAppointment({
      user_id: user.id || 1,
      pet_id: this.bookingData.petId,
      service_type: this.bookingData.service,
      appointment_date: this.bookingData.date,
      appointment_time: this.bookingData.time,
      complaints: this.bookingData.complaints,
      status: 'Menunggu Konfirmasi'
    });

    if (!result.success) {
      App.showToast(result.message, 'danger');
      return;
    }

    App.showToast('Janji temu berhasil diajukan dengan status "Menunggu Konfirmasi"!', 'success');
    this.currentStep = 1;
    this.switchViewTab('admin'); // Automatically switch to admin desk so admin can see the new incoming appointment!
    App.renderOverview();
  },

  renderClientAppointmentsTable() {
    const tbody = document.getElementById('appointmentsListTableBody');
    if (!tbody) return;

    const list = Store.getAppointments();
    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 24px;">
            Belum ada janji temu yang Anda ajukan.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(a => {
      const pet = Store.getPet(a.pet_id) || { name: 'Hewan' };
      let badgeClass = 'badge-warning';
      if (a.status === 'Dikonfirmasi') badgeClass = 'badge-success';
      else if (a.status === 'Selesai') badgeClass = 'badge-info';
      else if (a.status === 'Dibatalkan') badgeClass = 'badge-danger';

      return `
        <tr>
          <td>
            <strong>${App.formatIndoDate(a.appointment_date)}</strong>
            <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Pukul ${a.appointment_time} WIB</div>
          </td>
          <td>${pet.name}</td>
          <td>${a.service_type}</td>
          <td><span class="badge ${badgeClass}">${a.status}</span></td>
          <td>
            <div style="display: flex; gap: 6px;">
              ${a.status !== 'Dibatalkan' && a.status !== 'Selesai' ? `
                <button class="btn btn-sm btn-outline" style="color: var(--danger); border-color: var(--danger-bg);" onclick="AppointmentsModule.cancelByAdmin(${a.id})">Batalkan</button>
              ` : ''}
              <button class="btn btn-sm btn-icon" style="color: var(--text-light);" onclick="AppointmentsModule.deleteAppointment(${a.id})" title="Hapus">✕</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  deleteAppointment(id) {
    App.confirmAction('Hapus riwayat janji temu ini?', () => {
      Store.deleteAppointment(id);
      App.showToast('Janji temu dihapus.', 'warning');
      this.render();
      App.renderOverview();
    });
  }
};

window.AppointmentsModule = AppointmentsModule;
