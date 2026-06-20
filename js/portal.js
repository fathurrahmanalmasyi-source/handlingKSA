const portal = {
    loadJadwal: async function() {
        const container = document.getElementById('list-jadwal');
        container.innerHTML = `
            <div class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
            </div>`;
        
        try {
            const jadwal = await app.apiGet('getJadwal');
            container.innerHTML = '';
            
            if(jadwal.length === 0) {
                container.innerHTML = `
                <div class="text-center py-10 bg-white rounded-2xl border border-gray-100">
                    <span class="text-4xl">📭</span>
                    <p class="text-sm text-gray-500 mt-2 font-medium">Belum ada jadwal tugas tersedia saat ini.</p>
                </div>`;
                return;
            }

            jadwal.forEach(item => {
                let tgl = new Date(item.tanggal).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'});
                
                // Desain Card Modern Premium (Putih, Teks Hitam, Aksen Gold)
                const card = `
                <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div class="absolute top-0 right-0 w-16 h-16 bg-gold-100 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                    
                    <div class="flex justify-between items-start mb-3">
                        <h4 class="font-bold text-dark text-lg leading-tight w-3/4">${item.tugas}</h4>
                        <span class="bg-dark text-gold-500 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm">
                            Kuota: ${item.kuota}
                        </span>
                    </div>
                    
                    <div class="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-100">
                        <div class="flex items-center text-sm text-gray-700 mb-2">
                            <span class="w-6 text-center">📅</span> 
                            <span class="font-semibold ml-1">${tgl}</span>
                            <span class="mx-2 text-gray-300">|</span>
                            <span class="font-semibold text-gold-700">${item.jam}</span>
                        </div>
                        <div class="flex items-start text-sm text-gray-700">
                            <span class="w-6 text-center">📍</span> 
                            <span class="ml-1 leading-snug">${item.lokasi}</span>
                        </div>
                    </div>

                    <button onclick="portal.applyJadwal('${item.id}')" class="w-full bg-white text-dark font-bold py-3.5 rounded-xl border-2 border-gold-500 hover:bg-gold-500 hover:text-white transition-all text-sm shadow-sm flex justify-center items-center gap-2">
                        <span>Ambil Tugas Ini</span>
                        <span>→</span>
                    </button>
                </div>`;
                container.innerHTML += card;
            });
        } catch (err) {
            container.innerHTML = `<p class="text-sm text-red-500 text-center py-4">Gagal memuat jadwal. Silakan refresh.</p>`;
        }
    },

    applyJadwal: async function(jadwalId) {
        if(!confirm("Anda yakin bersedia dan komitmen untuk mengambil tugas ini?")) return;
        
        try {
            await app.apiPost('applyJadwal', {
                userId: app.state.user.id,
                jadwalId: jadwalId
            });
            alert("Tugas berhasil diajukan! Silakan tunggu approval dari Admin.");
            this.loadJadwal(); // Auto refresh daftar tugas
        } catch(err) {
            // Error ditangani oleh app.js
        }
    }
};
