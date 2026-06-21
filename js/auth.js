const auth = {
    loginMode: 'freelancer', // default mode

    setLoginMode: function(mode) {
        this.loginMode = mode;
        const slider = document.getElementById('toggle-slider');
        const fBtn = document.getElementById('mode-freelancer');
        const mBtn = document.getElementById('mode-manajemen');
        const logo = document.getElementById('login-logo');
        const blob = document.getElementById('login-blob');
        const subtitle = document.getElementById('login-subtitle');
        const regLink = document.getElementById('login-register-link');

        if (mode === 'freelancer') {
            // Geser slider ke kiri, tema GOLD
            slider.style.left = '6px';
            slider.classList.remove('bg-dark');
            slider.classList.add('bg-gold');
            fBtn.classList.add('text-dark'); fBtn.classList.remove('text-gray-400');
            mBtn.classList.add('text-gray-400'); mBtn.classList.remove('text-white');

            logo.classList.remove('bg-gold','text-dark'); logo.classList.add('bg-dark','text-gold');
            blob.classList.remove('bg-dark'); blob.classList.add('bg-gold');
            subtitle.innerText = 'Portal Tim Handling Lapangan';
            regLink.style.display = 'block';
        } else {
            // Geser slider ke kanan, tema HITAM
            slider.style.left = 'calc(50% + 0px)';
            slider.classList.remove('bg-gold');
            slider.classList.add('bg-dark');
            mBtn.classList.add('text-white'); mBtn.classList.remove('text-gray-400');
            fBtn.classList.add('text-gray-400'); fBtn.classList.remove('text-dark');

            logo.classList.remove('bg-dark','text-gold'); logo.classList.add('bg-gold','text-dark');
            blob.classList.remove('bg-gold'); blob.classList.add('bg-dark');
            subtitle.innerText = 'Control Panel Manajemen ⚙️';
            regLink.style.display = 'none'; // Manajemen tidak bisa daftar mandiri
        }
    },

    login: async function(e) {
        e.preventDefault();
        const email = document.getElementById('log-email').value.trim();
        const password = document.getElementById('log-pass').value.trim();

        try {
            const user = await app.apiPost('login', { email, password });

            // VALIDASI MODE: cocokkan pilihan toggle dengan role asli di database
            if (auth.loginMode === 'manajemen' && user.role !== 'Admin') {
                alert("Akun ini bukan akun Manajemen! Silakan login lewat mode Freelancer 🕋");
                return;
            }
            if (auth.loginMode === 'freelancer' && user.role === 'Admin') {
                alert("Ini akun Manajemen! Silakan pindah ke mode Manajemen ⚙️ untuk login.");
                return;
            }

            localStorage.setItem('jicrew_user', JSON.stringify(user));
            app.state.user = user;
            app.navigate(user.role === 'Admin' ? 'admin' : 'freelancer');
        } catch (err) {}
    },

    register: async function(e) {
        e.preventDefault();
        const data = {
            nama: document.getElementById('reg-nama').value,
            email: document.getElementById('reg-email').value.trim(),
            password: document.getElementById('reg-pass').value.trim()
        };
        try {
            await app.apiPost('register', data);
            alert("✨ Berhasil daftar! Tunggu Manajemen ubah statusmu jadi 'Approved' ya!");
            app.navigate('login');
        } catch (err) {}
    },

    logout: function() {
        localStorage.removeItem('jicrew_user');
        app.state.user = null;
        app.navigate('login');
    }
};

document.getElementById('form-login').addEventListener('submit', auth.login);
document.getElementById('form-register').addEventListener('submit', auth.register);

// Set mode default saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => auth.setLoginMode('freelancer'));
