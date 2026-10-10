/**
 * @file api-service.js
 * @description Data Access Layer (DAL) untuk memfasilitasi komunikasi asinkron
 *              dengan decoupled JSON providers dan simulasi RESTful API endpoint.
 * @module ApiService
 * @author Nikah Suchia Panjaitan (NIM: 12S24041)
 * @course 12S3101 - Pemrograman dan Pengujian Web (Modul 04)
 */

class ApiService {
    /**
     * Endpoint path ke berkas data JSON
     * @private
     */
    static #endpoints = {
        projects: './data/projects.json',
        services: './data/services.json',
        profile: './data/profile.json'
    };

    /**
     * Fungsi pembantu generik untuk melakukan HTTP GET menggunakan fetch API
     * dengan penanganan error defensif.
     * @private
     * @param {string} endpoint 
     * @returns {Promise<any>}
     */
    static async #fetchData(endpoint) {
        try {
            const response = await fetch(endpoint, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP Error ${response.status}: Gagal memuat data dari ${endpoint} (${response.statusText})`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`[ApiService Network Error] Kegagalan saat memanggil ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Mengambil seluruh koleksi data proyek portofolio akademik
     * @returns {Promise<Array<object>>}
     */
    static async getProjects() {
        return await this.#fetchData(this.#endpoints.projects);
    }

    /**
     * Mengambil katalog paket layanan konsultasi akademik
     * @returns {Promise<Array<object>>}
     */
    static async getServices() {
        return await this.#fetchData(this.#endpoints.services);
    }

    /**
     * Mengambil data diri mahasiswa pengembang
     * @returns {Promise<object>}
     */
    static async getProfile() {
        return await this.#fetchData(this.#endpoints.profile);
    }

    /**
     * Mengambil satu proyek spesifik berdasarkan ID
     * @param {string} projectId 
     * @returns {Promise<object|null>}
     */
    static async getProjectById(projectId) {
        const projects = await this.getProjects();
        return projects.find(p => p.id === projectId) || null;
    }

    /**
     * Mengirimkan data pemesanan layanan via HTTP POST asinkron (RESTful API riil)
     * ke endpoint publik (jsonplaceholder) dengan header terstandarisasi,
     * penanganan status HTTP defensif, dan pencatatan transaksi di Network DevTools.
     * @param {object} payload Data pemesanan formulir
     * @returns {Promise<object>} DTO JSON terstruktur hasil respons server
     */
    static async submitServiceOrder(payload) {
        // Validasi defensif masukan di sisi service logic tier
        if (!payload || typeof payload !== 'object') {
            throw new Error('Payload pemesanan tidak valid.');
        }

        if (!payload.nama || !payload.email || !payload.layanan) {
            throw new Error('Kolom Nama, Email, dan Layanan wajib diisi.');
        }

        const requestPayload = {
            nama: String(payload.nama).trim(),
            email: String(payload.email).trim(),
            telepon: payload.telepon ? String(payload.telepon).trim() : '-',
            layanan: payload.layanan,
            sesi: Number(payload.sesi) || 1,
            metode: payload.metode || 'Daring (Online)',
            deskripsi: payload.deskripsi ? String(payload.deskripsi).trim() : '',
            persetujuan: Boolean(payload.persetujuan),
            submittedAt: new Date().toISOString()
        };

        try {
            // Eksekusi HTTP POST riil ke public REST endpoint
            const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestPayload)
            });

            if (!response.ok) {
                throw new Error(`HTTP Error ${response.status}: Gagal mengirim data pemesanan (${response.statusText})`);
            }

            const responseJson = await response.json();

            // Kembalikan DTO terstruktur untuk presentation layer dan persistensi client-side
            return {
                success: true,
                statusCode: response.status, // 201 Created
                message: 'Permintaan layanan konsultasi akademik berhasil diproses dan dicatat oleh REST API.',
                orderId: `ORD-${Date.now()}-${responseJson.id || Math.floor(Math.random() * 1000)}`,
                receivedAt: new Date().toISOString(),
                data: requestPayload
            };
        } catch (error) {
            console.error('[ApiService POST Error] Kegagalan saat memproses HTTP POST:', error);
            throw error;
        }
    }
}

// Pastikan ApiService dapat diakses baik di lingkungan browser global maupun ES Modules
if (typeof window !== 'undefined') {
    window.ApiService = ApiService;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiService;
}
