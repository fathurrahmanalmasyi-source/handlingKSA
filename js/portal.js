const portal = {
    switchTab: function(tab) {
        document.getElementById('fl-tab-tugas').classList.toggle('hidden', tab !== 'tugas');
        document.getElementById('fl-tab-mytask').classList.toggle('hidden', tab !== 'mytask');
        document.querySelectorAll('#view-freelancer .tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('ftab-' + tab).classList.add('active');
        if (tab === 'tugas') this.loadJadwal();
        if (tab === 'mytask') this.loadMyTasks();
    },

    spinner: () => `<div class="flex justify-center py-6"><div class="animate-spin rounded-full h-8 w-8 border-4 border-gold border-t-transparent"></div></div>`,
    empty: (icon, msg) => `<div class="bento-card text-center py-8"><i data-lucide="${icon}" class="w-10 h-10 text-gray-300 mx-auto mb-3"></i><p class="text-sm text-gray-500 font-bold">${msg}</p></div>`,

    loadJadwal: function() {
        const c = document.getElementById('list-jadwal');
        if (!app.cache['jadwal']) c.innerHTML = this.spinner(); // spinner cuma kalau belum ada cache
        app.smartFetch('jadwal', 'getJadwal', (data) => this.renderJadwal(c, data));
    },

    renderJadwal: function(c, data) {
        if (data === null) { c.innerHTML = this.empty('alert-circle', "Gagal memuat"); app.renderIcons(); return; }
        if (!data.length) { c.innerHTML = this.empty('inbox', "Belum ada tugas baru nih"); app.renderIcons(); return; }
        c.innerHTML = '';
        data.forEach(it => {
            let tgl = new Date(it.tanggal).toLocaleDateString('id-ID', {day:'numeric',month:'short',year:'numeric'});
            c.innerHTML += `
            <div class="bento-card p-5">
                <div class="flex justify-between items-start mb-4">
                    <h4 class="font-extrabold text-dark text-lg leading-tight">${it.tugas}</h4>
                    <span class="bg-gray-100 text-dark text-[10px] font-extrabold px-3 py-1.5 rounded-full whitespace-nowrap">Sisa: ${it.kuota}</span>
                </div>
                <div class="flex items-center text-sm font-medium text-gray-500 mb-2 gap-2"><i data-lucide="calendar" class="w-4 h-4"></i> ${tgl} • ${it.jam}</div>
                <div class="flex items-center text-sm font-medium text-gray-500 mb-5 gap-2"><i data-lucide="map-pin" class="w-4 h-4"></i> ${it.lokasi}</div>
                <button onclick="portal.applyJadwal('${it.id}')" class="btn-bounce w-full bg-dark text-white font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2">Ambil Tugas Ini <i data-lucide="arrow-right" class="w-4 h-4"></i></button>
            </div>`;
        });
        app.renderIcons();
    },

    applyJadwal: async function(id) {
        if (!confirm("Yakin ambil tugas ini? Pastikan kamu bisa hadir!")) return;
        try {
            await app.apiPost('applyJadwal', { userId: app.state.user.id, jadwalId: id });
            alert("Mantap! Tugas diajukan. Tunggu Admin konfirmasi.");
            this.loadJadwal();
        } catch(e) {}
    },

    loadMyTasks: function() {
        const c = document.getElementById('list-mytask');
        if (!app.cache['mytask']) c.innerHTML = this.spinner();
        app.smartFetch('mytask', `getMyTasks&userId=${app.state.user.id}`, (data) => this.renderMyTasks(c, data));
    },

    renderMyTasks: function(c, data) {
        if (data === null) { c.innerHTML = this.empty('alert-circle', "Gagal memuat"); app.renderIcons(); return; }
        if (!data.length) { c.innerHTML = this.empty('clipboard-x', "Kamu belum apply tugas apapun"); app.renderIcons(); return; }
        c.innerHTML = '';
        data.forEach(it => {
            let tgl = new Date(it.tanggal).toLocaleDateString('id-ID', {day:'numeric',month:'short'});
            let badge = '', actionBtn = '';
            if (it.statusApply === 'Pending') {
                badge = `<span class="bg-yellow-100 text-yellow-700 text-[10px] font-extrabold px-3 py-1.5 rounded-full inline-flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i> Menunggu Approve</span>`;
                actionBtn = `<p class="text-xs text-gray-400 font-medium text-center py-2">Menunggu persetujuan admin...</p>`;
            } else if (it.statusApply === 'Rejected') {
                badge = `<span class="bg-red-100 text-red-600 text-[10px] font-extrabold px-3 py-1.5 rounded-full inline-flex items-center gap-1"><i data-lucide="x" class="w-3 h-3"></i> Ditolak</span>`;
            } else if (it.statusApply === 'Approved') {
                badge = `<span class="bg-green-100 text-green-600 text-[10px] font-extrabold px-3 py-1.5 rounded-full inline-flex items-center gap-1"><i data-lucide="check" class="w-3 h-3"></i> Disetujui</span>`;
                if (!it.sudahAbsen) {
                    actionBtn = `<button onclick="portal.absen('${it.applyId}')" class="btn-bounce w-full bg-gold text-dark font-bold py-3 rounded-2xl text-sm flex items-center justify-center gap-2"><i data-lucide="map-pin-check" class="w-4 h-4"></i> Absen Hadir Sekarang</button>`;
                } else {
                    let nilaiInfo = it.poin > 0
                        ? `<span class="text-green-600 inline-flex items-center gap-1"><i data-lucide="award" class="w-3.5 h-3.5"></i> +${it.poin} Poin</span>`
                        : `<span class="text-gray-400">Menunggu penilaian...</span>`;
                    actionBtn = `
                    <div class="bg-surface rounded-xl p-3 text-xs font-medium space-y-1.5 mb-3">
                        <p class="flex items-center gap-1.5"><i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-green-500"></i> Absen: ${it.waktuAbsen}</p>
                        <p class="flex items-center gap-1.5"><i data-lucide="wallet" class="w-3.5 h-3.5"></i> Cashflow: ${it.cashflow ? 'Rp '+Number(it.cashflow).toLocaleString('id-ID') : 'Belum diisi'}</p>
                        <p class="font-bold">${nilaiInfo}</p>
                    </div>
                    <button onclick="portal.openLaporan('${it.applyId}', ${it.cashflow||0})" class="btn-bounce w-full bg-dark text-white font-bold py-3 rounded-2xl text-sm flex items-center justify-center gap-2"><i data-lucide="wallet" class="w-4 h-4"></i> ${it.cashflow ? 'Edit' : 'Isi'} Laporan Keuangan</button>`;
                }
            }
            c.innerHTML += `
            <div class="bento-card p-5">
                <h4 class="font-extrabold text-dark text-base">${it.tugas}</h4>
                <p class="text-xs text-gray-400 font-medium mt-1 flex items-center gap-1.5 flex-wrap"><i data-lucide="calendar" class="w-3.5 h-3.5"></i> ${tgl} • ${it.jam} <i data-lucide="map-pin" class="w-3.5 h-3.5 ml-1"></i> ${it.lokasi}</p>
                <div class="my-3">${badge}</div>
                ${actionBtn}
            </div>`;
        });
        app.renderIcons();
    },

    absen: async function(applyId) {
        if (!confirm("Konfirmasi kehadiranmu di lokasi sekarang?")) return;
        try {
            await app.apiPost('absen', { applyId });
            alert("Absen berhasil dicatat! Jangan lupa isi laporan keuangan ya.");
            this.loadMyTasks();
        } catch(e) {}
    },

    openLaporan: function(applyId, cashflow) {
        app.openModal('Laporan Keuangan', `
            <p class="text-sm text-gray-500 mb-4">Input pemasukan/pengeluaran teknis di lapangan.</p>
            <label class="text-xs font-bold text-gray-600">Nominal Cashflow (Rp)</label>
            <input type="number" id="lap-cashflow" value="${cashflow||''}" class="w-full p-3.5 bg-surface rounded-xl mt-1 mb-4 font-medium" placeholder="Contoh: 50000">
            <label class="text-xs font-bold text-gray-600">Catatan</label>
            <textarea id="lap-catatan" class="w-full p-3.5 bg-surface rounded-xl mt-1 mb-5 font-medium" rows="3" placeholder="Detail pengeluaran/kejadian..."></textarea>
            <button onclick="portal.submitLaporan('${applyId}')" class="btn-bounce w-full bg-dark text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2">Simpan Laporan <i data-lucide="save" class="w-5 h-5"></i></button>
            <button onclick="app.closeModal()" class="w-full mt-3 text-gray-400 font-bold text-sm">Batal</button>
        `);
    },

    submitLaporan: async function(applyId) {
        const cashflow = document.getElementById('lap-cashflow').value;
        const catatan = document.getElementById('lap-catatan').value;
        try {
            await app.apiPost('isiLaporan', { applyId, cashflow, catatan });
            app.closeModal();
            alert("Laporan tersimpan!");
            this.loadMyTasks();
        } catch(e) {}
    }
};
