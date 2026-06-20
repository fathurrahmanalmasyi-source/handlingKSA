const auth = {
    login: async function(e) {
        e.preventDefault();
        const email = document.getElementById('log-email').value.trim(); // Hapus spasi
        const password = document.getElementById('log-pass').value.trim();

        try {
            const user = await app.apiPost('login', { email, password });
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
            alert("✨ Berhasil daftar! Tunggu Manajemen mengubah statusmu jadi 'Approved' di Database ya!");
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
