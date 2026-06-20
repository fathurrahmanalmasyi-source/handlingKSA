const portal = {
    loadJadwal: async function() {
        const container = document.getElementById('list-jadwal');
        container.innerHTML = `<p class="text-sm text-gray-500">Memuat jadwal...</p>`;
        
        try {
            const jadwal = await app.apiGet('getJadwal');
            container.innerHTML = '';
            
            if(jadwal.length === 0) {
                container.innerHTML = `<p class="text-sm text-gray-500">Tidak ada jadwal tersedia.</p>`;
                return;
            }

            jadwal.forEach(item => {
                // Konversi tanggal GAS ISO ke string mudah dibaca
                let tgl = new Date(item.tanggal).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'});
                
                const card = `
                <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col">
                    <div class="flex justify-between items-start mb-2">
                        <h4 class="font-bold text-gray-800">${item.tugas}</h4>
                        <span class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Kuota: ${item.kuota}</span>
                    </div>
                    <div class="text-sm text-gray-600 mb-3 space-y-1">
                        <p>📅 ${tgl} | ⏰ ${item.jam}</p>
                        <p>📍 ${item.lokasi}</p>
                    </div>
                    <button onclick="portal.applyJadwal('${item.id}')" class="w-full bg-blue-50 text-blue-600 font-semibold py-2 rounded-lg border border-blue-200 hover:bg-blue-600 hover:text-white transition-colors text-sm">
                        Apply Tugas
                    </button>
                </div>`;
                container.innerHTML += card;
            });
        } catch (err) {}
    },

    applyJadwal: async function(jadwalId) {
        if(!confirm("Anda yakin ingin apply untuk tugas ini?")) return;
        
        try {
            await app.apiPost('applyJadwal', {
                userId: app.state.user.id,
                jadwalId: jadwalId
            });
            alert("Berhasil Apply! Menunggu disetujui oleh admin.");
        } catch(err) {}
    }
};
