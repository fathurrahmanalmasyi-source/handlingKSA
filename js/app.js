const app = {
    state: {
        user: JSON.parse(localStorage.getItem('jicrew_user')) || null,
        currentView: 'login'
    },

    init: function() {
        if (this.state.user) {
            this.navigate(this.state.user.role === 'Admin' ? 'admin' : 'freelancer');
        } else {
            this.navigate('login');
        }
    },

    navigate: function(viewId) {
        document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
        document.getElementById(`view-${viewId}`).classList.remove('hidden');
        this.state.currentView = viewId;

        // Hook eksekusi saat masuk view tertentu
        if(viewId === 'freelancer') {
            document.getElementById('user-name').innerText = this.state.user.nama;
            document.getElementById('user-poin').innerText = this.state.user.poin;
            portal.loadJadwal();
        }
    },

    showLoading: function(show) {
        document.getElementById('loading').style.display = show ? 'flex' : 'none';
    },

    apiPost: async function(action, data) {
        this.showLoading(true);
        try {
            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                // Hapus header Content-Type agar browser otomatis mendeteksi plain text tanpa preflight OPTIONS
                body: JSON.stringify({ action: action, data: data })
            });
            const result = await response.json();
            this.showLoading(false);
            if (!result.success) throw new Error(result.message);
            return result.data;
        } catch (error) {
            this.showLoading(false);
            // Memberikan pesan error yang lebih jelas jika gagal koneksi
            if (error.message === 'Failed to fetch') {
                alert("Koneksi ke server gagal. Pastikan link API benar dan Deployment Apps Script diset ke 'Anyone'.");
            } else {
                alert("Error: " + error.message);
            }
            throw error;
        }
    },
    
    apiGet: async function(action) {
        this.showLoading(true);
        try {
            const response = await fetch(`${CONFIG.API_URL}?action=${action}`);
            const result = await response.json();
            this.showLoading(false);
            if (!result.success) throw new Error(result.message);
            return result.data;
        } catch (error) {
            this.showLoading(false);
            alert("Error: " + error.message);
            throw error;
        }
    }
};

// Bootstrap App
document.addEventListener('DOMContentLoaded', () => app.init());
