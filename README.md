# Laporan Praktikum Pemrograman dan Pengujian Web (12S3101)
## Modul 04: Arsitektur Aplikasi Web (Decoupled Data, Dynamic CSR, & DevTools)

### Identitas Mahasiswa
- **Nama**: Nikah Suchia Panjaitan
- **NIM**: 12S24041
- **Program Studi**: S1 Sistem Informasi
- **Institut**: Institut Teknologi Del
- **Dosen Pengampu**: Chandro Pardede, S.Kom., M.Sc.
- **Branch Git**: `week4-architecture`

---

### 1. Ringkasan Tugas
Pada praktikum minggu ke-4 ini, saya melanjutkan tugas portofolio minggu ke-3 dengan memisahkan data dari tampilan (arsitektur *decoupled*) dan memuat data secara dinamis dari sisi browser (*Client-Side Rendering*):
1. **Pemisahan Data**: Konten kartu proyek, layanan, dan profil yang sebelumnya diketik langsung di file `index.html` dipindahkan ke file JSON terpisah di folder `data/` (`projects.json`, `services.json`, `profile.json`).
2. **Pemuatan Dinamis**: Menggunakan JavaScript (`fetch()` dan `async/await`) untuk mengambil data JSON lalu menampilkannya ke halaman tanpa reload.
3. **Modal Dinamis**: Mengganti 4 modal terpisah di minggu ke-3 menjadi 1 modal bersama (`#universalProjectModal`) yang isinya berubah otomatis sesuai kartu proyek yang diklik.
4. **Status Tampilan (UI States)**: Menangani 4 kondisi antarmuka: saat memuat data (*loading*), data berhasil tampil (*success*), hasil filter kosong (*empty*), dan pesan error jika gagal mengambil data (*error*).
5. **Form Pemesanan Layanan**: Mengirim data formulir via HTTP POST asinkron ke REST API publik (JSONPlaceholder) dan menyimpan riwayat pemesanan di `localStorage`.
6. **Keamanan Input**: Menggunakan fungsi sanitasi (`escapeHTML` dan validasi URL) untuk mencegah risiko XSS saat merender teks dan gambar dinamis.

---

### 2. Alur Arsitektur Sistem (Separation of Concerns)
Berikut alur pembagian tanggung jawab (*Separation of Concerns*) antara browser, file data JSON, dan API:

```mermaid
flowchart LR
    User([Pengguna]) --> UI[index.html & UI]
    UI --> App[js/app.js]
    App --> DAL[js/api-service.js]
    DAL -->|Ambil Data| Data[(data/*.json)]
    DAL -->|Kirim Form| API[REST API POST]
    App -.->|Simpan Riwayat| Storage[(localStorage)]
```

Penjelasan alur:
- **Tampilan (Presentation)**: `index.html` dan `style.css` untuk kerangka dan gaya tampilan, serta `app.js` untuk mengatur kartu proyek, tombol filter, dan modal dinamis.
- **Pengambilan Data (Data Access)**: `api-service.js` bertugas memanggil `fetch()` ke file JSON dan mengirim formulir via HTTP POST.
- **Data Layer**: Berkas data `projects.json`, `services.json`, dan `profile.json` yang berdiri sendiri di folder `data/`.
- **Penyimpanan Lokal**: Browser menyimpan riwayat pemesanan layanan di `localStorage`.

---

### 3. Komparasi Minggu 3 vs Minggu 4

| Bagian | Minggu 3 (Statis) | Minggu 4 (Dinamis / Decoupled) |
|---|---|---|
| **Data Proyek** | Ditulis manual di file `index.html`. | Disimpan terpisah di `data/projects.json` dan dimuat via JavaScript. |
| **Komponen Modal** | 4 modal terpisah di HTML (banyak kode berulang). | Cukup 1 modal dinamis yang diisi otomatis sesuai ID proyek. |
| **Filter Kategori** | Belum ada fitur filter. | Filter kategori proyek berfungsi langsung tanpa reload halaman. |
| **Formulir Layanan** | Submit form standar yang memicu reload halaman. | Form dikirim lewat HTTP POST asinkron dengan notifikasi Toast. |
| **Riwayat Pesanan** | Hilang saat halaman ditutup atau di-refresh. | Tersimpan di `localStorage` browser. |
| **Status Tampilan** | Tidak ada status loading atau error. | Ada tampilan loading, data kosong, dan pesan error jika fetch gagal. |

---

### 4. Pengujian Jaringan di DevTools (RFC 9111)
Pengujian performa jaringan dilakukan menggunakan tab Network di Google Chrome DevTools dengan membandingkan kondisi saat cache mati (*Cold Load*) dan saat cache aktif (*Warm Load*):

| Parameter | Cold Load (Cache Mati) | Warm Load (Cache Aktif) | Keterangan & Analisis |
|---|:---:|:---:|---|
| **Status Response** | `200 OK` | `304 Not Modified` / `(disk cache)` | Menunjukkan efisiensi cache browser sesuai standar HTTP. |
| **Ukuran Transfer** | ~850 KB | ~35 KB | Menghemat kuota dan transfer data lebih dari 90%. |
| **Time to First Byte (TTFB)** | ~45 ms | < 15 ms | Respon server dari cache jauh lebih cepat. |
| **Waktu Selesai (Finish)** | ~780 ms | ~195 ms | Waktu pemuatan halaman berkurang drastis pada kunjungan kedua. |
| **DOMContentLoaded (DCL)** | ~280 ms | ~90 ms | Halaman diproses lebih cepat karena HTML lebih ringkas. |

---

### 5. Struktur Folder
```text
ppw-2026-week2-12S24041/
├── index.html          # File HTML utama
├── style.css           # File CSS styling
├── README.md           # Laporan dokumentasi tugas
├── data/               # Folder data JSON
│   ├── profile.json    # Biodata mahasiswa
│   ├── projects.json   # Data 4 proyek portofolio
│   └── services.json   # Data paket konsultasi
├── js/                 # Folder kode JavaScript
│   ├── api-service.js  # Fungsi fetch data & kirim POST
│   └── app.js          # Controller antarmuka & modal dinamis
└── assets/             # Aset gambar dan dokumen
    ├── foto-profil.jpg
    └── projects/
        ├── project-01/
        ├── project-02/
        ├── project-03/
        └── project-04/
```

---

### 6. Cara Menjalankan Proyek
1. Buka folder proyek ini di **Visual Studio Code**.
2. Klik kanan pada berkas `index.html` lalu pilih **"Open with Live Server"**.
3. Buka Console dan tab Network (F12) untuk melihat data JSON dimuat dan pengiriman form berjalan.

---

### 7. Tautan Repositori & Live Deployment
- **Repositori GitHub**: [https://github.com/NikahPanjaitan/ppw-2026-week2-12S24041](https://github.com/NikahPanjaitan/ppw-2026-week2-12S24041)
- **Branch**: `week4-architecture`
- **GitHub Pages**: [https://nikahpanjaitan.github.io/ppw-2026-week2-12S24041/](https://nikahpanjaitan.github.io/ppw-2026-week2-12S24041/)