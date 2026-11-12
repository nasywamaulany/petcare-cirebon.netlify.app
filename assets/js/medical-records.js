/**
 * PETCARE | Rekam Medis Kesehatan Hewan (Medical Records Module)
 * Core feature: Table matching Mockup Row 2 Screen 3, Filters, Detail Modal, CRUD, Print Summary
 */

const RecordsModule = {
  selectedPetFilter: 'Semua',
  searchQuery: '',

  init() {
    this.populatePetFilterDropdown();
    this.render();
    this.bindEvents();
  },

  bindEvents() {
    // Pet filter select
    const petFilter = document.getElementById('recordPetFilter');
    if (petFilter) {
      petFilter.onchange = (e) => {
        this.selectedPetFilter = e.target.value;
        this.render();
      };
    }

    // Search input
    const searchInput = document.getElementById('recordSearchInput');
    if (searchInput) {
      searchInput.oninput = (e) => {
        this.searchQuery = e.target.value;
        this.render();
      };
    }

    // Add Record Button
    const addBtn = document.getElementById('btnAddRecordModal');
    if (addBtn) {
      addBtn.onclick = () => this.openAddEditModal();
    }

    // Record form submission
    const form = document.getElementById('recordForm');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        this.saveRecordFromForm();
      };
    }
  },

  populatePetFilterDropdown() {
    const filterSelect = document.getElementById('recordPetFilter');
    const formPetSelect = document.getElementById('recordFormPetId');
    const pets = Store.getPets();

    if (filterSelect) {
      filterSelect.innerHTML = `<option value="Semua">Semua Hewan Peliharaan</option>` +
        pets.map(p => `<option value="${p.id}">${p.name} (${p.breed || p.species})</option>`).join('');
    }

    if (formPetSelect) {
      formPetSelect.innerHTML = pets.map(p => `<option value="${p.id}">${p.name} (${p.pet_code} - ${p.species})</option>`).join('');
    }
  },

  render() {
    const tableBody = document.getElementById('recordsTableBody');
    if (!tableBody) return;

    const records = Store.getRecords({
      pet_id: this.selectedPetFilter,
      search: this.searchQuery
    });

    if (records.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 40px 20px;">
            <div class="empty-state" style="padding: 0;">
              <div class="empty-state-icon">📋</div>
              <h5 class="empty-state-title">Tidak Ada Rekam Medis</h5>
              <p class="empty-state-desc">Belum ada riwayat pemeriksaan yang sesuai dengan filter pencarian.</p>
              <button class="btn btn-primary btn-sm" onclick="RecordsModule.openAddEditModal()">+ Buat Rekam Medis Baru</button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = records.map(r => {
      const pet = Store.getPet(r.pet_id) || { name: 'Hewan', species: 'Hewan' };
      return `
        <tr>
          <td>
            <div style="font-weight: 700; color: var(--text-main);">${App.formatIndoDate(r.exam_date)}</div>
            <div style="font-size: 0.775rem; color: var(--text-muted);">${pet.name} (${pet.species})</div>
          </td>
          <td>
            <span style="font-weight: 600;">${r.service_type}</span>
          </td>
          <td>
            <div style="font-weight: 600; color: var(--text-main);">${r.diagnosis}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${r.complaints || '-'}</div>
          </td>
          <td>
            <span style="font-size: 0.885rem; color: var(--text-muted);">${r.doctor_name}</span>
          </td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-secondary btn-sm" onclick="RecordsModule.viewRecordDetail(${r.id})">Detail</button>
              <button class="btn btn-outline btn-sm btn-icon" onclick="RecordsModule.openAddEditModal(null, ${r.id})" title="Edit Rekam Medis">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button class="btn btn-outline btn-sm btn-icon" style="color: var(--danger); border-color: var(--danger-bg);" onclick="RecordsModule.confirmDeleteRecord(${r.id})" title="Hapus">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  viewRecordDetail(recordId) {
    const r = Store.getRecord(recordId);
    if (!r) return;

    const pet = Store.getPet(r.pet_id) || { name: 'Hewan', pet_code: 'SV-XXXX', breed: '-', species: 'Hewan' };
    const container = document.getElementById('recordDetailContent');
    if (!container) return;

    container.innerHTML = `
      <div id="printableRecordSlip" style="background: #FFFFFF; padding: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--primary-100); padding-bottom: 14px; margin-bottom: 18px;">
          <div>
            <h4 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin-bottom: 2px;">PETCARE</h4>
            <p style="font-size: 0.8rem; color: var(--text-muted);">Dokter Hewan Kota Cirebon • Rekam Kesehatan Hewan</p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.8rem; color: var(--text-muted);">Nomor Rekam:</div>
            <div style="font-size: 1.05rem; font-weight: 800; color: var(--primary);">${pet.pet_code}</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; background: var(--bg-page); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px; margin-bottom: 20px;">
          <div>
            <div style="font-size: 0.775rem; color: var(--text-muted); font-weight: 700;">NAMA PASIEN / HEWAN</div>
            <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">${pet.name} (${pet.species} - ${pet.breed || '-'})</div>
          </div>
          <div>
            <div style="font-size: 0.775rem; color: var(--text-muted); font-weight: 700;">TANGGAL PEMERIKSAAN</div>
            <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">${App.formatIndoDate(r.exam_date)}</div>
          </div>
          <div>
            <div style="font-size: 0.775rem; color: var(--text-muted); font-weight: 700;">JENIS LAYANAN</div>
            <div style="font-size: 0.95rem; font-weight: 600; color: var(--primary);">${r.service_type}</div>
          </div>
          <div>
            <div style="font-size: 0.775rem; color: var(--text-muted); font-weight: 700;">DOKTER PENANGGUNG JAWAB</div>
            <div style="font-size: 0.95rem; font-weight: 600; color: var(--text-main);">${r.doctor_name}</div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 14px; font-size: 0.9rem;">
          <div>
            <strong style="color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">Keluhan Awal:</strong>
            <p style="margin-top: 4px; color: var(--text-main);">${r.complaints || '-'}</p>
          </div>
          <div>
            <strong style="color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">Hasil Pemeriksaan Fisik:</strong>
            <p style="margin-top: 4px; color: var(--text-main);">${r.physical_exam || '-'}</p>
          </div>
          <div style="background: var(--primary-light); padding: 12px; border-radius: var(--radius-sm); border-left: 4px solid var(--primary);">
            <strong style="color: var(--primary); font-size: 0.85rem; text-transform: uppercase;">Diagnosis Dokter:</strong>
            <p style="margin-top: 4px; font-weight: 700; color: var(--text-main); font-size: 1rem;">${r.diagnosis}</p>
          </div>
          <div>
            <strong style="color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">Tindakan / Pengobatan:</strong>
            <p style="margin-top: 4px; color: var(--text-main);">${r.treatment}</p>
          </div>
          <div>
            <strong style="color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">Obat yang Diberikan:</strong>
            <p style="margin-top: 4px; color: var(--text-main); font-weight: 600;">${r.medicine || 'Tidak ada resep obat tambahan'}</p>
          </div>
          <div>
            <strong style="color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">Catatan & Saran Perawatan:</strong>
            <p style="margin-top: 4px; color: var(--text-main); font-style: italic;">${r.notes || '-'}</p>
          </div>
          ${r.next_control_date ? `
            <div style="margin-top: 8px; padding: 10px; background: #FEF3C7; border-radius: var(--radius-sm); border: 1px solid #FDE68A; display: flex; align-items: center; justify-content: space-between;">
              <span style="font-weight: 700; color: #92400E; font-size: 0.875rem;">📅 Jadwal Kontrol Ulang Berikutnya:</span>
              <strong style="color: #92400E;">${App.formatIndoDate(r.next_control_date)}</strong>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Bind print slip button
    const btnPrint = document.getElementById('btnPrintRecordDetail');
    if (btnPrint) {
      btnPrint.onclick = () => {
        window.print();
      };
    }

    App.openModal('recordDetailModal');
  },

  openAddEditModal(defaultPetId = null, recordId = null) {
    this.populatePetFilterDropdown();
    const modalTitle = document.getElementById('recordModalTitle');
    const form = document.getElementById('recordForm');
    if (!form) return;

    form.reset();
    document.getElementById('recordFormId').value = '';
    document.getElementById('recordFormExamDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('recordFormDoctor').value = 'dr. Sari Wijaya, Sp.KH';

    if (defaultPetId) {
      document.getElementById('recordFormPetId').value = defaultPetId;
    }

    if (recordId) {
      const r = Store.getRecord(recordId);
      if (r) {
        if (modalTitle) modalTitle.textContent = 'Edit Rekam Medis';
        document.getElementById('recordFormId').value = r.id;
        document.getElementById('recordFormPetId').value = r.pet_id;
        document.getElementById('recordFormExamDate').value = r.exam_date;
        document.getElementById('recordFormService').value = r.service_type;
        document.getElementById('recordFormDoctor').value = r.doctor_name;
        document.getElementById('recordFormComplaints').value = r.complaints || '';
        document.getElementById('recordFormExam').value = r.physical_exam || '';
        document.getElementById('recordFormDiagnosis').value = r.diagnosis;
        document.getElementById('recordFormTreatment').value = r.treatment;
        document.getElementById('recordFormMedicine').value = r.medicine || '';
        document.getElementById('recordFormNotes').value = r.notes || '';
        document.getElementById('recordFormNextControl').value = r.next_control_date || '';
      }
    } else {
      if (modalTitle) modalTitle.textContent = 'Tambah Rekam Medis Baru';
    }

    App.openModal('recordFormModal');
  },

  saveRecordFromForm() {
    const id = document.getElementById('recordFormId').value;
    const petId = parseInt(document.getElementById('recordFormPetId').value, 10);
    const examDate = document.getElementById('recordFormExamDate').value;
    const service = document.getElementById('recordFormService').value;
    const doctor = document.getElementById('recordFormDoctor').value.trim();
    const complaints = document.getElementById('recordFormComplaints').value.trim();
    const exam = document.getElementById('recordFormExam').value.trim();
    const diagnosis = document.getElementById('recordFormDiagnosis').value.trim();
    const treatment = document.getElementById('recordFormTreatment').value.trim();
    const medicine = document.getElementById('recordFormMedicine').value.trim();
    const notes = document.getElementById('recordFormNotes').value.trim();
    const nextControl = document.getElementById('recordFormNextControl').value;

    if (!petId || !examDate || !diagnosis || !treatment) {
      App.showToast('Hewan, tanggal, diagnosis, dan tindakan wajib diisi!', 'danger');
      return;
    }

    const recordData = {
      pet_id: petId,
      exam_date: examDate,
      service_type: service,
      doctor_name: doctor || 'dr. Sari Wijaya, Sp.KH',
      complaints,
      physical_exam: exam,
      diagnosis,
      treatment,
      medicine,
      notes,
      next_control_date: nextControl || null
    };

    if (id) {
      recordData.id = parseInt(id, 10);
    }

    Store.saveRecord(recordData);
    App.closeAllModals();
    App.showToast('Rekam medis berhasil disimpan!', 'success');
    this.render();

    // If on pet detail view, refresh it too
    if (PetsModule && App.selectedPetIdForDetail === petId) {
      PetsModule.renderDetail();
    }
  },

  confirmDeleteRecord(id) {
    App.confirmAction(
      'Apakah Anda yakin ingin menghapus catatan rekam medis ini?',
      () => {
        Store.deleteRecord(id);
        App.showToast('Rekam medis berhasil dihapus.', 'warning');
        this.render();
      }
    );
  }
};

window.RecordsModule = RecordsModule;
