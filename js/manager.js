const manager = {
    switchTab: function(tab) {
        ['approval','nilai','jadwal'].forEach(t => {
            document.getElementById('ad-tab-'+t).classList.toggle('hidden', t !== tab);
            document.getElementById('atab-'+t).classList.remove('active');
        });
        document.getElementById('atab-'+tab).classList.add('active');
        if (tab === 'approval') this.loadApproval();
        if (tab === 'nilai') this.loadReview();
        if (tab === 'jadwal') this.loadAllJadwal();
    },

    // ===== APPROVAL =====
    loadApproval: async function() {
        const cu = document.getElementById('list-pending-users');
        const ca = document.getElementById('list-pending-apply');
        cu.innerHTML = ca.innerHTML = `<p class="text-xs text-gray-400 font-medium">Memuat...</p>`;
        try {
            const [users, applies] = await Promise.all([
                app.apiGet('getPendingUsers'),
                app.apiGet('getPendingApply')
            ]);

            cu.innerHTML = users.length ? '' : `<p class="text-xs text-gray-400 font-medium">Tidak ada pendaftar baru ✨</p>`;
            users.forEach(u => {
                cu.innerHTML += `
                <div class="bento-card p-4 flex justify-between items-center">
                    <div><h4 class="font-bold text-dark text-sm">${u.nama}</h4><p class="text-xs text-gray-400">${u.email}</p></div>
                    <div class="flex gap-2">
                        <button onclick="manager.decideUser('${u.id}','approve')" class="btn-bounce bg-green-500 text-white text-xs font-bold px-3 py-2 rounded-xl">✓</button>
                        <button onclick="manager.decideUser('${u.id}','reject')" class="btn-bounce bg-red-100 text-red-500 text-xs font-bold px-3 py-2 rounded-xl">✕</button>
                    </div>
                </div>`;
            });

            ca.innerHTML = applies.length ? '' : `<p class="text-xs text-gray-400 font-medium">Tidak ada apply baru ✨</p>`;
            applies.forEach(a => {
                ca.innerHTML += `
                <div class="bento-card p-4 flex justify-between items-center">
                    <div><h4 class="font-bold text-dark text-sm">${a.nama}</h4><p class="text-xs text-gray-400">📋 ${a.tugas}</p></div>
                    <div class="flex gap-2">
                        <button onclick="manager.decideApply('${a.applyId}','approve')" class="btn-bounce bg-green-500 text-white text-xs font-bold px-3 py-2 rounded-xl">✓</button>
                        <button onclick="manager.decideApply('${a.applyId}','reject')" class="btn-bounce bg-red-100 text-red-500 text-xs font-bold px-3 py-2 rounded-xl">✕</button>
                    </div>
                </div>`;
            });
        } catch(e) {}
    },

    decideUser: async function(userId, decision) {
        try { await app.apiPost('approveUser', { userId, decision }); this.loadApproval(); } catch(e){}
    },
    decideApply: async function(applyId, decision) {
        try { await app.apiPost('approveApply', { applyId, decision }); this.loadApproval(); } catch(e){}
    },

    // ===== PENILAIAN =====
    loadReview: async function() {
        const c = document.getElementById('list-review');
        c.innerHTML = `<div class="flex justify-center py-6"><div class="animate-spin rounded-full h-8 w-8 border-4 border-gold border-t-transparent"></div></div>`;
        try {
            const data = await app.apiGet('getTasksToReview');
            c.innerHTML = data.length ? '' : `<div class="bento-card text-center py-8"><span class="text-4xl">🎉</span><p class="text-sm text-gray-500 mt-3 font-bold">Semua tugas sudah dinilai!</p></div>`;
            data.forEach(it => {
                c.innerHTML += `
                <div class="bento-card p-5">
                    <h4 class="font-extrabold text-dark text-base">${it.nama}</h4>
                    <p class="text-xs text-gray-400 font-medium mb-3">📋 ${it.tugas}</p>
                    <div class="bg-surface rounded-xl p-3 text-xs font-medium space-y-1 mb-4">
                        <p>✅ Absen: ${it.waktuAbsen}</p>
                        <p>💰 Cashflow: ${it.cashflow ? 'Rp '+Number(it.cashflow).toLocaleString('id-ID') : '-'}</p>
                        <p>📝 Catatan: ${it.catatan || '-'}</p>
                    </div>
                    <div class="flex gap-2">
                        <input type="number" id="poin-${it.laporanId}" class="flex-1 p-3 bg-surface rounded-xl font-bold text-center" placeholder="Poin">
                        <button onclick="manager.submitNilai('${it.laporanId}')" class="btn-bounce bg-gold text-dark font-bold px-5 rounded-xl text-sm">Beri Nilai 🏆</button>
                    </div>
                </div>`;
            });
        } catch(e) {}
    },

    submitNilai: async function(laporanId) {
        const poin = document.getElementById('poin-'+laporanId).value;
        if (!poin || poin <= 0) { alert("Masukkan poin yang valid!"); return; }
        try {
            await app.apiPost('beriNilai', { laporanId, poin: Number(poin) });
            alert("Poin berhasil diberikan & ditambahkan ke total user! 🏆");
            this.loadReview();
        } catch(e) {}
    },

    // ===== JADWAL =====
    loadAllJadwal: async function() {
        const c = document.getElementById('list-all-jadwal');
        c.innerHTML = `<div class="flex justify-center py-6"><div class="animate-spin rounded-full h-8 w-8 border-4 border-gold border-t-transparent"></div></div>`;
        try {
            const data = await app.apiGet('getAllJadwal');
            c.innerHTML = data.length ? '' : `<div class="bento-card text-center py-8"><p class="text-sm text-gray-500 font-bold">Belum ada jadwal. Tambah yuk!</p></div>`;
            data.forEach(it => {
                let tgl = new Date(it.tanggal).toLocaleDateString('id-ID', {day:'numeric',month:'short',year:'numeric'});
                let statusColor = it.status === 'Tersedia' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500';
                c.innerHTML += `
                <div class="bento-card p-5">
                    <div class="flex justify-between items-start mb-2">
                        <h4 class="font-extrabold text-dark text-base">${it.tugas}</h4>
                        <span class="${statusColor} text-[10px] font-extrabold px-3 py-1.5 rounded-full">${it.status}</span>
                    </div>
                    <p class="text-xs text-gray-400 font-medium">📅 ${tgl} • ${it.jam}</p>
                    <p class="text-xs text-gray-400 font-medium">📍 ${it.lokasi} • Kuota: ${it.kuota}</p>
                </div>`;
            });
        } catch(e) {}
    },

    openAddJadwal: function() {
        app.openModal('Tambah Jadwal Baru 📅', `
            <label class="text-xs font-bold text-gray-600">Nama Tugas</label>
            <input type="text" id="jd-tugas" class="w-full p-3.5 bg-surface rounded-xl mt-1 mb-3 font-medium" placeholder="Handling Jamaah...">
            <div class="grid grid-cols-2 gap-3 mb-3">
                <div><label class="text-xs font-bold text-gray-600">Tanggal</label><input type="date" id="jd-tanggal" class="w-full p-3.5 bg-surface rounded-xl mt-1 font-medium"></div>
                <div><label class="text-xs font-bold text-gray-600">Jam</label><input type="time" id="jd-jam" class="w-full p-3.5 bg-surface rounded-xl mt-1 font-medium"></div>
            </div>
            <label class="text-xs font-bold text-gray-600">Lokasi</label>
            <input type="text" id="jd-lokasi" class="w-full p-3.5 bg-surface rounded-xl mt-1 mb-3 font-medium" placeholder="Bandara Soetta...">
            <label class="text-xs font-bold text-gray-600">Kuota</label>
            <input type="number" id="jd-kuota" class="w-full p-3.5 bg-surface rounded-xl mt-1 mb-5 font-medium" placeholder="5">
            <button onclick="manager.submitJadwal()" class="btn-bounce w-full bg-dark text-white font-bold py-4 rounded-2xl">Simpan Jadwal ✨</button>
            <button onclick="app.closeModal()" class="w-full mt-3 text-gray-400 font-bold text-sm">Batal</button>
        `);
    },

    submitJadwal: async function() {
        const data = {
            tugas: document.getElementById('jd-tugas').value,
            tanggal: document.getElementById('jd-tanggal').value,
            jam: document.getElementById('jd-jam').value,
            lokasi: document.getElementById('jd-lokasi').value,
            kuota: document.getElementById('jd-kuota').value
        };
        if (!data.tugas || !data.tanggal) { alert("Isi minimal nama tugas & tanggal!"); return; }
        try {
            await app.apiPost('addJadwal', data);
            app.closeModal();
            alert("Jadwal baru ditambahkan! 🎉");
            this.loadAllJadwal();
        } catch(e) {}
    }
};
