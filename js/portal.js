const portal = {
    loadJadwal: async function() {
        const container = document.getElementById('list-jadwal');
        container.innerHTML = `
            <div class="flex justify-center py-6">
                <div class="animate-spin rounded-full h-8 w-8 border-4 border-gold border-t-transparent"></div>
            </div>`;
        
        try {
            const jadwal = await app.apiGet('getJadwal');
            container.innerHTML = '';
            
            if(jadwal.length === 0) {
                container.innerHTML = `
                <div class="bento-card text-center py-8">
                    <span class="text-4xl">📭</span>
                    <p class="text-sm text-gray-500 mt-3 font-bold">Yeay! Belum ada tugas baru nih.</p>
                </div>`;
                return;
            }

            jadwal.forEach(item => {
                let tgl = new Date(item.tanggal).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'});
                
                const card = `
                <div class="bento-card p-5 group">
                    <div class="flex justify-between items-start mb-4">
                        <h4 class="font-extrabold text-dark text-lg leading-tight">${item.tugas}</h4>
                        <span class="bg-gray-100 text-dark text-[10px] font-extrabold px-3 py-1.5 rounded-full">
                            Sisa: ${item.kuota}
                        </span>
                    </div>
                    
                    <div class="flex items-center text-sm font-medium text-gray-500 mb-2 gap-2">
                        <span class="bg-surface p-1.5 rounded-lg">📅</span> ${tgl} • ${item.jam}
                    </div>
                    <div class="flex items-center text-sm font-medium text-gray-500 mb-5 gap-2">
                        <span class="bg-surface p-1.5 rounded-lg">📍</span> ${item.lokasi}
                    </div>

                    <button onclick="portal.applyJadwal('${item.id}')" class="btn-bounce w-full bg-dark text-white font-bold py-3.5 rounded-2xl transition-all text-sm shadow-md flex justify-center items-center gap-2">
                        Ambil Tugas Ini ✨
                    </button>
                </div>`;
                container.innerHTML += card;
            });
        } catch (err) {
            container.innerHTML = `<p class="text-sm text-red-500 text-center py-4 font-bold">Gagal memuat jadwal. Cek koneksimu!</p>`;
        }
    },

    applyJadwal: async function(jadwalId) {
        if(!confirm("Yakin mau ambil tugas ini? Pastikan kamu bisa hadir ya! 🤝")) return;
        
        try {
            await app.apiPost('applyJadwal', {
                userId: app.state.user.id,
                jadwalId: jadwalId
            });
            alert("Mantap! Tugas berhasil diajukan 🚀. Tunggu Admin konfirmasi ya!");
            this.loadJadwal();
        } catch(err) {
            // Error ditangani app.js
        }
    }
};
