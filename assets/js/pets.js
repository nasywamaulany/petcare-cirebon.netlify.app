/**
 * PETCARE | Data Hewan Peliharaan (Pets Module)
 * CRUD, Profile View matching Mockup Row 2 Screen 2, Filter & Search
 */

const PetsModule = {
  currentFilter: 'Semua',
  searchQuery: '',
  activeProfileTab: 'info', // 'info', 'records', 'vaccines'

  init() {
    this.render();
    this.bindEvents();
  },

  bindEvents() {
    // Search input
    const searchInput = document.getElementById('petsSearchInput');
    if (searchInput) {
      searchInput.oninput = (e) => {
        this.searchQuery = e.target.value;
        this.renderList();
      };
    }

    // Filter species buttons / select
    const speciesFilter = document.getElementById('petsSpeciesFilter');
    if (speciesFilter) {
      speciesFilter.onchange = (e) => {
        this.currentFilter = e.target.value;
        this.renderList();
      };
    }

    // Add Pet Button
    const addBtn = document.getElementById('btnAddPetModal');
    if (addBtn) {
      addBtn.onclick = () => this.openAddEditModal();
    }

    // Add / Edit Form submission
    const form = document.getElementById('petForm');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        this.savePetFromForm();
      };
    }
  },

  render() {
    this.renderDetail();
    this.renderList();
  },

  renderDetail() {
    const container = document.getElementById('petProfileDetailContainer');
    if (!container) return;

    const petId = App.selectedPetIdForDetail || 1;
    const pet = Store.getPet(petId) || Store.getPets()[0];

    if (!pet) {
      container.innerHTML = `
        <div class="empty-state">
          <p class="empty-state-title">Belum ada data hewan.</p>
          <button class="btn btn-primary" onclick="PetsModule.openAddEditModal()">+ Tambah Hewan Baru</button>
        </div>
      `;
      return;
    }

    App.selectedPetIdForDetail = pet.id;
    const user = Store.getCurrentUser();

    // Calculate age from birth_date
    let ageStr = 'Usia tidak tercatat';
    if (pet.birth_date) {
      const birth = new Date(pet.birth_date);
      const now = new Date();
      const years = now.getFullYear() - birth.getFullYear();
      ageStr = years > 0 ? `${years} tahun` : 'Kurang dari 1 tahun';
    }

    // Tab contents based on active tab
    let tabContentHtml = '';
    if (this.activeProfileTab === 'info') {
      tabContentHtml = `
        <div class="pet-info-grid">
          <div>
            <h5 class="pet-info-group-title">Informasi Pemilik</h5>
            <div class="pet-info-row">
              <div class="pet-info-label">Nama Pemilik</div>
              <div class="pet-info-value">${user.full_name || 'Nasywa Maulani Putri'}</div>
            </div>
            <div class="pet-info-row">
              <div class="pet-info-label">Nomor Telepon</div>
              <div class="pet-info-value">${user.phone || '0812-3456-7890'}</div>
            </div>
            <div class="pet-info-row">
              <div class="pet-info-label">Alamat</div>
              <div class="pet-info-value">${user.address || 'Jl. Kesambi, Kota Cirebon'}</div>
            </div>
            <div class="pet-info-row" style="margin-top: 14px;">
              <div class="pet-info-label">Catatan Alergi / Khusus</div>
              <div class="pet-info-value" style="color: ${pet.allergy_notes && !pet.allergy_notes.toLowerCase().includes('tidak') ? 'var(--danger)' : 'var(--text-main)'};">
                ${pet.allergy_notes || 'Tidak ada catatan alergi'}
              </div>
            </div>
          </div>
          <div>
            <h5 class="pet-info-group-title">Info Tambahan</h5>
            <div class="pet-info-row">
              <div class="pet-info-label">No. Rekam Medis</div>
              <div class="pet-info-value" style="font-weight: 700; color: var(--primary);">${pet.pet_code || 'SV-0001'}</div>
            </div>
            <div class="pet-info-row">
              <div class="pet-info-label">Tanggal Terdaftar</div>
              <div class="pet-info-value">${App.formatIndoDate(pet.created_at || '2024-01-12')}</div>
            </div>
            <div class="pet-info-row">
              <div class="pet-info-label">Warna / Ciri Khusus</div>
              <div class="pet-info-value">${pet.color_marks || '-'}</div>
            </div>
            <div class="pet-info-row">
              <div class="pet-info-label">Status Pasien</div>
              <div class="pet-info-value">
                <span class="badge ${pet.status === 'Aktif' ? 'badge-success' : 'badge-muted'}">${pet.status || 'Aktif'}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (this.activeProfileTab === 'records') {
      const records = Store.getRecords({ pet_id: pet.id });
      if (records.length === 0) {
        tabContentHtml = `
          <div class="empty-state" style="padding: 24px 0;">
            <p class="empty-state-desc">Belum ada riwayat rekam medis untuk ${pet.name}.</p>
            <button class="btn btn-secondary btn-sm" onclick="RecordsModule.openAddEditModal(${pet.id})">+ Tambah Rekam Medis</button>
          </div>
        `;
      } else {
        tabContentHtml = `
          <div style="display: flex; justify-content: flex-end; margin-bottom: 12px;">
            <button class="btn btn-primary btn-sm" onclick="RecordsModule.openAddEditModal(${pet.id})">+ Tambah Rekam Medis</button>
          </div>
          <div class="table-responsive">
            <table class="table-custom">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Layanan</th>
                  <th>Diagnosis / Keluhan</th>
                  <th>Dokter</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${records.map(r => `
                  <tr>
                    <td><strong>${App.formatIndoDate(r.exam_date)}</strong></td>
                    <td>${r.service_type}</td>
                    <td>${r.diagnosis}</td>
                    <td>${r.doctor_name}</td>
                    <td>
                      <button class="btn btn-secondary btn-sm" onclick="RecordsModule.viewRecordDetail(${r.id})">Detail</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }
    } else if (this.activeProfileTab === 'vaccines') {
      const vaccines = Store.getVaccinations({ pet_id: pet.id });
      if (vaccines.length === 0) {
        tabContentHtml = `
          <div class="empty-state" style="padding: 24px 0;">
            <p class="empty-state-desc">Belum ada jadwal vaksinasi tercatat untuk ${pet.name}.</p>
            <button class="btn btn-secondary btn-sm" onclick="VaccinesModule.openAddEditModal(${pet.id})">+ Tambah Jadwal Vaksin</button>
          </div>
        `;
      } else {
        tabContentHtml = `
          <div style="display: flex; justify-content: flex-end; margin-bottom: 12px;">
            <button class="btn btn-primary btn-sm" onclick="VaccinesModule.openAddEditModal(${pet.id})">+ Tambah Jadwal Vaksin</button>
          </div>
          <div class="table-responsive">
            <table class="table-custom">
              <thead>
                <tr>
                  <th>Jenis Vaksin</th>
                  <th>Diberikan</th>
                  <th>Jadwal Berikutnya</th>
                  <th>Status</th>
                  <th>Dokter</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${vaccines.map(v => `
                  <tr>
                    <td><strong>${v.vaccine_name}</strong></td>
                    <td>${App.formatIndoDate(v.administered_date)}</td>
                    <td>${App.formatIndoDate(v.next_due_date)}</td>
                    <td><span class="badge ${v.badge_class}">${v.badge_label}</span></td>
                    <td>${v.doctor_name}</td>
                    <td>
                      ${v.status === 'Terjadwal' ? `
                        <button class="btn btn-sm btn-secondary" onclick="VaccinesModule.markCompleted(${v.id})" title="Tandai Selesai">✓ Selesai</button>
                      ` : ''}
                      <button class="btn btn-sm btn-outline" onclick="VaccinesModule.openAddEditModal(null, ${v.id})">Edit</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }
    }

    container.innerHTML = `
      <div class="pet-profile-card">
        <div class="pet-profile-header">
          <div class="pet-main-info">
            <img src="${pet.photo_url || 'assets/images/dog-avatar.svg'}" alt="${pet.name}" class="pet-avatar-large" onerror="this.src='assets/images/dog-avatar.svg'">
            <div>
              <div class="pet-name-line">
                <h3>${pet.name}</h3>
                <span class="badge badge-primary">${pet.species}</span>
              </div>
              <div class="pet-specs-sub">
                ${pet.breed || '-'} • ${pet.gender} • ${ageStr} • Berat badan: ${pet.weight} kg
              </div>
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-outline btn-sm" onclick="PetsModule.openAddEditModal(${pet.id})">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Edit
            </button>
            <button class="btn btn-danger btn-sm" onclick="PetsModule.confirmDeletePet(${pet.id}, '${pet.name}')" title="Hapus Data Hewan">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="pet-profile-tabs">
          <button class="pet-tab-btn ${this.activeProfileTab === 'info' ? 'active' : ''}" onclick="PetsModule.switchTab('info')">Informasi</button>
          <button class="pet-tab-btn ${this.activeProfileTab === 'records' ? 'active' : ''}" onclick="PetsModule.switchTab('records')">Rekam Medis</button>
          <button class="pet-tab-btn ${this.activeProfileTab === 'vaccines' ? 'active' : ''}" onclick="PetsModule.switchTab('vaccines')">Jadwal Vaksinasi</button>
        </div>

        ${tabContentHtml}
      </div>
    `;
  },

  switchTab(tab) {
    this.activeProfileTab = tab;
    this.renderDetail();
  },

  renderList() {
    const listContainer = document.getElementById('petsCardsListContainer');
    if (!listContainer) return;

    const pets = Store.getPets({
      species: this.currentFilter,
      search: this.searchQuery
    });

    if (pets.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🐾</div>
          <h4 class="empty-state-title">Hewan Tidak Ditemukan</h4>
          <p class="empty-state-desc">Tidak ada hewan yang sesuai dengan filter atau kata kunci pencarian Anda.</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = pets.map(p => {
      const isSelected = p.id === App.selectedPetIdForDetail;
      return `
        <div class="pet-single-card ${isSelected ? 'selected' : ''}" style="${isSelected ? 'border-color: var(--primary); background: #FAFDFE;' : ''}">
          <div class="pet-card-top">
            <img src="${p.photo_url || 'assets/images/dog-avatar.svg'}" alt="${p.name}" class="vaccine-pet-avatar" onerror="this.src='assets/images/dog-avatar.svg'">
            <div>
              <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main);">${p.name}</h4>
              <span class="badge badge-primary">${p.species}</span>
            </div>
          </div>
          <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">
            <div><strong>Ras:</strong> ${p.breed || '-'}</div>
            <div><strong>Kelamin:</strong> ${p.gender} • <strong>BB:</strong> ${p.weight} kg</div>
            <div><strong>Kode:</strong> ${p.pet_code}</div>
          </div>
          <div class="pet-card-actions">
            <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="PetsModule.selectPetForView(${p.id})">Lihat Profil</button>
            <button class="btn btn-outline btn-sm btn-icon" onclick="PetsModule.openAddEditModal(${p.id})" title="Edit Hewan">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  selectPetForView(id) {
    App.selectedPetIdForDetail = id;
    this.render();
    window.scrollTo({ top: 120, behavior: 'smooth' });
  },

  openAddEditModal(petId = null) {
    const modalTitle = document.getElementById('petModalTitle');
    const form = document.getElementById('petForm');
    if (!form) return;

    form.reset();
    document.getElementById('petFormId').value = '';

    if (petId) {
      const pet = Store.getPet(petId);
      if (pet) {
        if (modalTitle) modalTitle.textContent = `Edit Data Hewan - ${pet.name}`;
        document.getElementById('petFormId').value = pet.id;
        document.getElementById('petFormName').value = pet.name;
        document.getElementById('petFormSpecies').value = pet.species;
        document.getElementById('petFormBreed').value = pet.breed || '';
        document.getElementById('petFormGender').value = pet.gender || 'Jantan';
        document.getElementById('petFormBirthDate').value = pet.birth_date || '';
        document.getElementById('petFormWeight').value = pet.weight || '';
        document.getElementById('petFormColor').value = pet.color_marks || '';
        document.getElementById('petFormAllergy').value = pet.allergy_notes || '';
        document.getElementById('petFormPhoto').value = pet.photo_url || '';
        document.getElementById('petFormStatus').value = pet.status || 'Aktif';
      }
    } else {
      if (modalTitle) modalTitle.textContent = 'Tambah Hewan Peliharaan Baru';
      document.getElementById('petFormSpecies').value = 'Anjing';
      document.getElementById('petFormGender').value = 'Jantan';
      document.getElementById('petFormStatus').value = 'Aktif';
    }

    App.openModal('petFormModal');
  },

  savePetFromForm() {
    const id = document.getElementById('petFormId').value;
    const name = document.getElementById('petFormName').value.trim();
    const species = document.getElementById('petFormSpecies').value;
    const breed = document.getElementById('petFormBreed').value.trim();
    const gender = document.getElementById('petFormGender').value;
    const birthDate = document.getElementById('petFormBirthDate').value;
    const weight = parseFloat(document.getElementById('petFormWeight').value) || 0;
    const color = document.getElementById('petFormColor').value.trim();
    const allergy = document.getElementById('petFormAllergy').value.trim();
    let photo = document.getElementById('petFormPhoto').value.trim();
    const status = document.getElementById('petFormStatus').value;

    if (!name) {
      App.showToast('Nama hewan wajib diisi!', 'danger');
      return;
    }

    if (!photo) {
      photo = species === 'Kucing' ? 'assets/images/cat-avatar.svg' : 'assets/images/dog-avatar.svg';
    }

    const petData = {
      name,
      species,
      breed,
      gender,
      birth_date: birthDate,
      weight,
      color_marks: color,
      allergy_notes: allergy,
      photo_url: photo,
      status
    };

    if (id) {
      petData.id = parseInt(id, 10);
    }

    const saved = Store.savePet(petData);
    App.closeAllModals();
    App.showToast(`Data hewan ${saved.name} berhasil disimpan!`, 'success');
    App.selectedPetIdForDetail = saved.id;
    this.render();
  },

  confirmDeletePet(id, name) {
    App.confirmAction(
      `Apakah Anda yakin ingin menghapus data hewan "${name}"? Tindakan ini tidak dapat dibatalkan.`,
      () => {
        Store.deletePet(id);
        App.showToast(`Data hewan "${name}" berhasil dihapus.`, 'warning');
        const remaining = Store.getPets();
        App.selectedPetIdForDetail = remaining.length ? remaining[0].id : null;
        this.render();
      }
    );
  }
};

window.PetsModule = PetsModule;
