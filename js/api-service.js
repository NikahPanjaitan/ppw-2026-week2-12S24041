/**
 * api-service.js
 * Modul pembantu untuk mengambil data JSON dan mengirim form ke REST API.
 * Mahasiswa: Nikah Suchia Panjaitan (12S24041)
 */

class ApiService {
    // Alamat berkas data JSON lokal
    static endpoints = {
        projects: './data/projects.json',
        services: './data/services.json',
        profile: './data/profile.json'
    };

    // Fungsi bantu untuk memanggil fetch dengan penanganan error sederhana
    static async fetchData(endpoint) {
        try {
            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error(`Gagal memuat data dari ${endpoint} (Status: ${response.status})`);
            }
            return await response.json();
        } catch (error) {
            console.error('Terjadi error saat fetch data:', error);
            throw error;
        }
    }

    // Mengambil data proyek dari projects.json
    static async getProjects() {
        return await this.fetchData(this.endpoints.projects);
    }

    // Mengambil data paket layanan dari services.json
    static async getServices() {
        return await this.fetchData(this.endpoints.services);
    }

    // Mengambil data profil mahasiswa dari profile.json
    static async getProfile() {
        return await this.fetchData(this.endpoints.profile);
    }

    // Mengambil satu proyek berdasarkan ID
    static async getProjectById(projectId) {
        const projects = await this.getProjects();
        return projects.find(p => p.id === projectId) || null;
    }

    // Mengirim data formulir pemesanan layanan via HTTP POST ke REST API
    static async submitServiceOrder(payload) {
        if (!payload || !payload.nama || !payload.email || !payload.layanan) {
            throw new Error('Kolom Nama, Email, dan Layanan wajib diisi.');
        }

        const dataKirim = {
            nama: payload.nama.trim(),
            email: payload.email.trim(),
            telepon: payload.telepon ? payload.telepon.trim() : '-',
            layanan: payload.layanan,
            sesi: Number(payload.sesi) || 1,
            metode: payload.metode || 'Daring (Online)',
            deskripsi: payload.deskripsi ? payload.deskripsi.trim() : '',
            persetujuan: Boolean(payload.persetujuan),
            tanggal: new Date().toISOString()
        };

        // Kirim HTTP POST ke endpoint publik JSONPlaceholder
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataKirim)
        });

        if (!response.ok) {
            throw new Error(`Gagal mengirim data ke server (HTTP ${response.status})`);
        }

        const hasil = await response.json();

        return {
            success: true,
            message: 'Permintaan layanan konsultasi berhasil dikirim!',
            orderId: `ORD-${Date.now()}-${hasil.id || '01'}`,
            data: dataKirim
        };
    }
}

// Supaya bisa diakses dari app.js di browser
if (typeof window !== 'undefined') {
    window.ApiService = ApiService;
}
