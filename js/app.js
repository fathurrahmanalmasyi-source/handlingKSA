const app = {
    state: { user: JSON.parse(localStorage.getItem('jicrew_user')) || null },
    cache: {}, // ← Penyimpanan data sementara di memori

    init: function() {
        if (this.state.user) this.navigate(this.state.user.role === 'Admin' ? 'admin' : 'freelancer');
        else this.navigate('login');
    },

    renderIcons: function() { if (window.lucide) lucide.createIcons(); },

    navigate: function(viewId) {
        document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
        document.getElementById(`view-${viewId}`).classList.remove('hidden');
        if (viewId === 'freelancer') {
            document.getElementById('user-name').innerText = this.state.user.nama;
            document.getElementById('user-poin').innerText = this.state.user.poin;
            portal.switchTab('tugas');
        }
        if (viewId === 'admin') manager.switchTab('approval');
        this.renderIcons();
    },

    openModal: function(title, bodyHtml) {
        document.getElementById('modal-title').innerText = title;
        document.getElementById('modal-body').innerHTML = bodyHtml;
        document.getElementById('modal').classList.remove('hidden');
        this.renderIcons();
    },
    closeModal: function() { document.getElementById('modal').classList.add('hidden'); },

    showLoading: function(show) { document.getElementById('loading').style.display = show ? 'flex' : 'none'; },

    refreshUserPoin: async function() {
        if (!this.state.user) return;
        try {
            const u = await this.apiGet(`getUserData&userId=${this.state.user.id}`, true);
            this.state.user.poin = u.poin;
            localStorage.setItem('jicrew_user', JSON.stringify(this.state.user));
            const el = document.getElementById('user-poin');
            if (el) el.innerText = u.poin;
        } catch(e) {}
    },

    // GET dengan opsi 'silent' (tanpa overlay fullscreen)
    apiGet: async function(action, silent = false) {
        if (!silent) this.showLoading(true);
        try {
            const res = await fetch(`${CONFIG.API_URL}?action=${action}`);
            const result = await res.json();
            if (!silent) this.showLoading(false);
            if (!result.success) throw new Error(result.message);
            return result.data;
        } catch (error) {
            if (!silent) this.showLoading(false);
            if (error.message !== 'Failed to fetch') console.error("Error: " + error.message);
            throw error;
        }
    },

    apiPost: async function(action, data) {
        this.showLoading(true);
        try {
            const res = await fetch(CONFIG.API_URL, { method: 'POST', body: JSON.stringify({ action, data }) });
            const result = await res.json();
            this.showLoading(false);
            if (!result.success) throw new Error(result.message);
            // Setiap aksi tulis (POST) → hapus cache agar data ter-refresh
            this.cache = {};
            return result.data;
        } catch (error) {
            this.showLoading(false);
            alert(error.message === 'Failed to fetch' ? "Koneksi gagal! Cek link API & Deployment 'Anyone'." : "Error: " + error.message);
            throw error;
        }
    },

    /**
     * SMART FETCH: Tampilkan cache instan (jika ada), lalu refresh di background.
     * @param {string} key - kunci cache unik
     * @param {string} action - endpoint API
     * @param {function} renderFn - fungsi untuk merender data ke DOM
     */
    smartFetch: async function(key, action, renderFn) {
        // 1. Kalau ada di cache → render INSTAN (no loading!)
        if (this.cache[key]) {
            renderFn(this.cache[key]);
            // 2. Lalu refresh diam-diam di background (silent)
            try {
                const fresh = await this.apiGet(action, true);
                this.cache[key] = fresh;
                renderFn(fresh); // update kalau ada perubahan
            } catch(e) {}
        } else {
            // 3. Belum ada cache → ambil normal (dengan spinner kecil di konten)
            try {
                const data = await this.apiGet(action, true);
                this.cache[key] = data;
                renderFn(data);
            } catch(e) { renderFn(null); }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
