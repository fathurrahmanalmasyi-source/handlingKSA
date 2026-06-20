const portal = {
    switchTab: function(tab) {
        document.getElementById('fl-tab-tugas').classList.toggle('hidden', tab !== 'tugas');
        document.getElementById('fl-tab-mytask').classList.toggle('hidden', tab !== 'mytask');
        document.querySelectorAll('#view-freelancer .tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('ftab-' + tab).classList.add('active');
        if (tab === 'tugas') this.loadJadwal();
        if (tab === 'mytask') this.loadMyTasks();
    },

    loadJadwal: async function() {
        const c = document.getElementById('list-jadwal');
        c.innerHTML = `<div class="flex justify-center py-6"><div class="animate-spin rounded-full h-8 w-8 border-4 border-gold border-t-transparent"></div></div>`;
        try {
            const data = await app.apiGet('getJadwal');
            c.innerHTML = '';
            if (!data.length) { c.innerHTML = this.empty("Belum ada tugas baru nih 📭"); return; }
            data.forEach(it => {
                let tgl = new Date(it.tanggal).toLocaleDateString('id-ID', {day:'numeric',month:'short',year:'numeric'});
                c.innerHTML += `
                <div class="bento-card p-5">
                    <div class="flex justify-between items-start mb-4">
                        <h4 class="font-extrabold text-dark text-lg leading-tight">${it.tugas}</h4>
                        <span class="bg-gray-100 text-dark text-[10px] font-extrabold px-3 py-1.5 rounded-full">Sisa: ${it.kuota}</span>
                    </div>
                    <div class="flex items-center text-sm font-medium text-gray-500 mb-2 gap-2"><span class="bg-surface p-1.5 rounded-lg">📅</span> ${tgl} • ${it.jam}</div>
                    <div class="flex items-center text-sm font-medium text-gray-500 mb-5 gap-2"><span class="bg-surface p-1.5 rounded-lg">📍</span> ${it.lokasi}</div>
                    <button onclick="portal.applyJadwal('${it.id}')" class="btn-bounce w-full bg-dark text-white font-bold py-3.5 rounded-2xl text-sm">Ambil Tugas Ini ✨</button>
                </div>`;
            });
        } catch(e) { c.innerHTML = this.empty("Gagal memuat 😢"); }
    },

    applyJadwal: async function(id) {
        if (!confirm("Yakin ambil tugas ini? Pastikan kamu bisa hadir! 🤝")) return;
        try {
            await app.apiPost('applyJadwal', { userId: app.state.user.id, jadwalId: id });
            alert("Mantap! Tugas diajukan 🚀. Tunggu Admin konfirmasi.");
            this.loadJadwal();
        } catch(e) {}
    },

    loadMyTasks: async function() {
        const c = document.getElementById('list-mytask');
        c.innerHTML = `<div class="flex justify-center py-6"><div class="animate-spin rounded-full h-8 w-8 border-4 border-gold border-t-transparent"></div></div>`;
        try {
            const data = await app.apiGet(`getMyTasks&userId=${app.state.user.id}`);
            c.innerHTML = '';
            if (!data.length) { c.innerHTML = this.empty("Kamu belum apply tugas apapun 📭"); return; }
            data.forEach(it => {
                let tgl = new Date(it.tanggal).toLocaleDateString('id-ID', {day:'numeric',month:'short'});
                let badge = '', actionBtn = '';

                if (it.statusApply === 'Pending') {
                    badge = `<span class="bg-yellow-100 text-yellow-700 text-[10px] font-extrabold px-3 py-1.5 rounded-full">⏳ Menunggu Approve</span>`;
                    actionBtn = `<p class="text-xs text-gray-400 font-medium text-center py-2">Menunggu persetujuan admin...</p>`;
                } else if (it.statusApply === 'Rejected') {
                    badge = `<span class="bg-red-100 text-red-600 text-[10px] font-extrabold px-3 py-1.5 rounded-full">❌ Ditolak</span>`;
                } else if (it.statusApply === 'Approved') {
                    badge = `<span class="bg-green-100 text-green-600 text-[10px] font-extrabold px-3 py-1.5 rounded-full">✅ Disetujui</span>`;
                    if (!it.sudahAbsen) {
                        actionBtn = `<button onclick="portal.absen('${it.applyId}')" class="btn-bounce w-full bg-gold text-dark font-bold py-3 rounded-2xl text-sm">📍 Absen Hadir Sekarang</button>`;
                    } else {
                        let nilaiInfo = it.poin > 0 ? `<span class="text-green-600">🏆 +${it.poin} Poin</span>` : `<span class="text-gray-400">Menunggu penilaian...</span>`;
                        actionBtn = `
                        <div class="bg-surface rounded-xl p-3 text-xs font-medium space-y-1 mb-3">
                            <p>✅ Absen: ${it.waktuAbsen}</p>
                            <p>💰 Cashflow: ${it.cashflow ? 'Rp '+Number(it.cashflow).toLocaleString('id-ID') : 'Belum diisi'}</p>
                            <p class="font-bold">${nilaiInfo}</p>
                        </div>
                        <button onclick="portal.openLaporan('${it.applyId}', ${it.cashflow||0})" class="btn-bounce w-full bg-dark text-white font-bold py-3 rounded-2xl text-sm">💰 ${it.cashflow ? 'Edit' : 'Isi'} Laporan Keuangan</button>`;
                    }
                }

                c.innerHTML += `
                <div class="bento-card p-5">
                    <div class="flex justify-between items-start mb-3">
                        <div><h4 class="font-extrabold text-dark text-base">${it.tugas}</h4>
                        <p class="text-xs text-gray-400 font-medium mt-1">📅 ${tgl} • ${it.jam} • 📍${it.lokasi}</p></div>
                    </div>
                    <div class="mb-3">${badge}</div>
                    ${actionBtn}
                </div>`;
            });
        } catch(e) { c.innerHTML = this.empty("Gagal memuat 😢"); }
    },

    absen: async function(applyId) {
        if (!confirm("Konfirmasi kehadiranmu di lokasi sekarang? 📍")) return;
        try {
            await app.apiPost('absen', { applyId });
            alert("Absen berhasil dicatat! ✅ Jangan lupa isi laporan keuangan ya.");
            this.loadMyTasks();
        } catch(e) {}
    },

    openLaporan: function(applyId, cashflow) {
        app.openModal('Laporan Keuangan 💰', `
            <p class="text-sm text-gray-500 mb-4">Input pemasukan/pengeluaran teknis di lapangan.</p>
            <label class="text-xs font-bold text-gray-600">Nominal Cashflow (Rp)</label>
            <input type="number" id="lap-cashflow" value="${cashflow||''}" class="w-full p-3.5 bg-surface rounded-xl mt-1 mb-4 font-medium" placeholder="Contoh: 50000">
            <label class="text-xs font-bold text-gray-600">Catatan</label>
            <textarea id="lap-catatan" class="w-full p-3.5 bg-surface rounded-xl mt-1 mb-5 font-medium" rows="3" placeholder="Detail pengeluaran/kejadian..."></textarea>
            <button onclick="portal.submitLaporan('${applyId}')" class="btn-bounce w-full bg-dark text-white font-bold py-4 rounded-2xl">Simpan Laporan ✨</button>
            <button onclick="app.closeModal()" class="w-full mt-3 text-gray-400 font-bold text-sm">Batal</button>
        `);
    },

    submitLaporan: async function(applyId) {
        const cashflow = document.getElementById('lap-cashflow').value;
        const catatan = document.getElementById('lap-catatan').value;
        try {
            await app.apiPost('isiLaporan', { applyId, cashflow, catatan });
            app.closeModal();
            alert("Laporan tersimpan! 🎉");
            this.loadMyTasks();
        } catch(e) {}
    },

    empty: (msg) => `<div class="bento-card text-center py-8"><span class="text-4xl">😴</span><p class="text-sm text-gray-500 mt-3 font-bold">${msg}</p></div>`
};
