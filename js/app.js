const app = {
    state: { user: JSON.parse(localStorage.getItem('jicrew_user')) || null },

    init: function() {
        if (this.state.user) this.navigate(this.state.user.role === 'Admin' ? 'admin' : 'freelancer');
        else this.navigate('login');
    },

    navigate: function(viewId) {
        document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
        document.getElementById(`view-${viewId}`).classList.remove('hidden');

        if (viewId === 'freelancer') {
            document.getElementById('user-name').innerText = this.state.user.nama + ' 👋';
            document.getElementById('user-poin').innerText = this.state.user.poin;
            portal.switchTab('tugas');
        }
        if (viewId === 'admin') manager.switchTab('approval');
    },

    // MODAL HELPER
    openModal: function(title, bodyHtml) {
        document.getElementById('modal-title').innerText = title;
        document.getElementById('modal-body').innerHTML = bodyHtml;
        document.getElementById('modal').classList.remove('hidden');
    },
    closeModal: function() { document.getElementById('modal').classList.add('hidden'); },

    showLoading: function(show) { document.getElementById('loading').style.display = show ? 'flex' : 'none'; },

    refreshUserPoin: async function() {
        if (!this.state.user) return;
        try {
            const u = await this.apiGet(`getUserData&userId=${this.state.user.id}`);
            this.state.user.poin = u.poin;
            localStorage.setItem('jicrew_user', JSON.stringify(this.state.user));
            const el = document.getElementById('user-poin');
            if (el) el.innerText = u.poin;
        } catch(e) {}
    },

    apiPost: async function(action, data) {
        this.showLoading(true);
        try {
            const res = await fetch(CONFIG.API_URL, { method: 'POST', body: JSON.stringify({ action, data }) });
            const result = await res.json();
            this.showLoading(false);
            if (!result.success) throw new Error(result.message);
            return result.data;
        } catch (error) {
            this.showLoading(false);
            alert(error.message === 'Failed to fetch' ? "Koneksi gagal! Cek link API & Deployment 'Anyone'." : "Error: " + error.message);
            throw error;
        }
    },

    apiGet: async function(action) {
        this.showLoading(true);
        try {
            const res = await fetch(`${CONFIG.API_URL}?action=${action}`);
            const result = await res.json();
            this.showLoading(false);
            if (!result.success) throw new Error(result.message);
            return result.data;
        } catch (error) {
            this.showLoading(false);
            if (error.message !== 'Failed to fetch') alert("Error: " + error.message);
            throw error;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
