/**
 * PETCARE | Profil Pengguna (Profile Module)
 * View & Edit Profile, Change Password, Switch Demo User, Logout
 */

const ProfileModule = {
  init() {
    this.render();
    this.bindEvents();
  },

  bindEvents() {
    const profileForm = document.getElementById('userProfileForm');
    if (profileForm) {
      profileForm.onsubmit = (e) => {
        e.preventDefault();
        this.saveProfile();
      };
    }

    const passwordForm = document.getElementById('userPasswordForm');
    if (passwordForm) {
      passwordForm.onsubmit = (e) => {
        e.preventDefault();
        this.changePassword();
      };
    }

    const logoutBtns = document.querySelectorAll('.action-logout-btn');
    logoutBtns.forEach(btn => {
      btn.onclick = () => this.confirmLogout();
    });
  },

  render() {
    const user = Store.getCurrentUser();
    if (!user) return;

    // Fill profile fields
    const nameInput = document.getElementById('profileFullName');
    const emailInput = document.getElementById('profileEmail');
    const phoneInput = document.getElementById('profilePhone');
    const addressInput = document.getElementById('profileAddress');
    const roleBadge = document.getElementById('profileRoleBadge');

    if (nameInput) nameInput.value = user.full_name || '';
    if (emailInput) emailInput.value = user.email || '';
    if (phoneInput) phoneInput.value = user.phone || '';
    if (addressInput) addressInput.value = user.address || '';
    if (roleBadge) {
      roleBadge.textContent = user.role === 'vet' ? 'Dokter Hewan' : 'Pemilik Hewan';
      roleBadge.className = `badge ${user.role === 'vet' ? 'badge-success' : 'badge-primary'}`;
    }
  },

  saveProfile() {
    const user = Store.getCurrentUser();
    const fullName = document.getElementById('profileFullName').value.trim();
    const email = document.getElementById('profileEmail').value.trim();
    const phone = document.getElementById('profilePhone').value.trim();
    const address = document.getElementById('profileAddress').value.trim();

    if (!fullName || !email || !phone) {
      App.showToast('Nama, email, dan nomor telepon wajib diisi!', 'danger');
      return;
    }

    const updatedUser = {
      ...user,
      full_name: fullName,
      email,
      phone,
      address
    };

    Store.setCurrentUser(updatedUser);
    App.updateUserUI();
    App.showToast('Informasi profil berhasil diperbarui!', 'success');
  },

  changePassword() {
    const oldPass = document.getElementById('passOld').value;
    const newPass = document.getElementById('passNew').value;
    const confirmPass = document.getElementById('passConfirm').value;

    if (!oldPass || !newPass || !confirmPass) {
      App.showToast('Semua kolom password wajib diisi!', 'danger');
      return;
    }

    if (newPass.length < 6) {
      App.showToast('Password baru minimal 6 karakter!', 'warning');
      return;
    }

    if (newPass !== confirmPass) {
      App.showToast('Konfirmasi password tidak cocok!', 'danger');
      return;
    }

    // Reset password form
    document.getElementById('userPasswordForm').reset();
    App.showToast('Password Anda berhasil diperbarui!', 'success');
  },

  confirmLogout() {
    App.confirmAction('Apakah Anda yakin ingin keluar dari akun Anda?', () => {
      Store.logout();
      App.showToast('Anda telah berhasil keluar.', 'info');
      App.updateUserUI();
      App.navigateTo('login');
    });
  }
};

window.ProfileModule = ProfileModule;
