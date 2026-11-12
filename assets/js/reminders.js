/**
 * PETCARE | Pengingat Kesehatan & Kontrol (Reminders Module)
 * Dynamic Reminders based on real stored vaccination and examination dates
 */

const RemindersModule = {
  currentFilter: 'all', // 'all', 'urgent', 'vaccine', 'control'

  init() {
    this.render();
    this.bindEvents();
  },

  bindEvents() {
    const filterBtns = document.querySelectorAll('.reminder-filter-btn');
    filterBtns.forEach(btn => {
      btn.onclick = () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.getAttribute('data-filter') || 'all';
        this.render();
      };
    });
  },

  render() {
    const container = document.getElementById('remindersListContainer');
    if (!container) return;

    let reminders = Store.getReminders();

    if (this.currentFilter === 'urgent') {
      reminders = reminders.filter(r => r.urgency === 'danger' || r.urgency === 'warning');
    } else if (this.currentFilter === 'vaccine') {
      reminders = reminders.filter(r => r.type === 'vaccine');
    } else if (this.currentFilter === 'control') {
      reminders = reminders.filter(r => r.type === 'control');
    }

    if (reminders.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔔</div>
          <h5 class="empty-state-title">Semua Terkendali!</h5>
          <p class="empty-state-desc">Tidak ada pengingat mendesak untuk hewan peliharaan Anda saat ini.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = reminders.map(r => {
      let icon = '💉';
      if (r.type === 'control') icon = '🩺';

      let urgencyBadge = '<span class="badge badge-info">Mendatang</span>';
      if (r.urgency === 'danger') urgencyBadge = '<span class="badge badge-danger">Perhatian / Terlewat</span>';
      else if (r.urgency === 'warning') urgencyBadge = '<span class="badge badge-warning">Segera</span>';

      return `
        <div class="upcoming-vaccine-item" style="padding: 18px; margin-bottom: 14px; border-left: 4px solid ${r.urgency === 'danger' ? 'var(--danger)' : (r.urgency === 'warning' ? 'var(--warning)' : 'var(--primary)')};">
          <div class="vaccine-item-left" style="gap: 16px;">
            <div class="timeline-icon-wrap" style="width: 44px; height: 44px; font-size: 1.2rem;">${icon}</div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <h5 style="font-size: 1rem; font-weight: 700; color: var(--text-main);">${r.title}</h5>
                ${urgencyBadge}
              </div>
              <p style="font-size: 0.885rem; color: var(--text-muted); line-height: 1.45; max-width: 600px;">
                ${r.message}
              </p>
              <div style="margin-top: 6px; font-size: 0.8rem; font-weight: 600; color: var(--text-light);">
                📅 Target Tanggal: ${App.formatIndoDate(r.date)}
              </div>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
            <button class="btn btn-primary btn-sm" onclick="RemindersModule.handleAction('${r.type}', ${r.pet_id})">
              ${r.action_label}
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  handleAction(type, petId) {
    if (type === 'vaccine') {
      App.navigateTo('vaccines');
    } else {
      App.navigateTo('appointments');
      if (AppointmentsModule) {
        AppointmentsModule.selectService('Pemeriksaan Umum');
      }
    }
  }
};

window.RemindersModule = RemindersModule;
