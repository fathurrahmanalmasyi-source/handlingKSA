const auth = {
    login: async function(e) {
        e.preventDefault();
        const email = document.getElementById('log-email').value;
        const password = document.getElementById('log-pass').value;

        try {
            const user = await app.apiPost('login', { email, password });
            localStorage.setItem('jicrew_user', JSON.stringify(user));
            app.state.user = user;
            app.navigate(user.role === 'Admin' ? 'admin' : 'freelancer');
        } catch (err) {} // Error handled in app.apiPost
    },

    register: async function(e) {
        e.preventDefault();
        const data = {
            nama: document.getElementById('reg-nama').value,
            email: document.getElementById('reg-email').value,
            password: document.getElementById('reg-pass').value
        };

        try {
            await app.apiPost('register', data);
            alert("Registrasi berhasil! Menunggu Approval Manajemen.");
            app.navigate('login');
        } catch (err) {}
    },

    logout: function() {
        localStorage.removeItem('jicrew_user');
        app.state.user = null;
        app.navigate('login');
    }
};

// Event Listeners
document.getElementById('form-login').addEventListener('submit', auth.login);
document.getElementById('form-register').addEventListener('submit', auth.register);
