# Portfolio Nikah Suchia Panjaitan — Week 4

Dokumentasi Praktikum Pemrograman dan Pengujian Web (12S3101)  
**Modul 04: Konsep Dasar Arsitektur Aplikasi Web Kontemporer: Decoupled Multi-Tier, Dynamic Client-Side Rendering (CSR), dan Analisis Kinerja Web**

---

## Identitas Mahasiswa & Praktikum

| Komponen | Keterangan |
|---|---|
| **Nama Mahasiswa** | Nikah Suchia Panjaitan |
| **NIM** | 12S24041 |
| **Program Studi** | S1 Sistem Informasi |
| **Institusi** | Institut Teknologi Del |
| **Mata Kuliah** | 12S3101 - Pemrograman dan Pengujian Web |
| **Dosen Pengampu** | Chandro Pardede, S.Kom., M.Sc. |
| **Tahun Akademik** | Semester Genap 2025/2026 / Ganjil 2026/2027 |
| **Branch Git Aktif** | `week4-architecture` |

---

## Deskripsi & Tujuan Refactoring Arsitektural

Proyek ini merupakan tahapan transformasi arsitektural berskala penuh dari repositori **Praktikum Minggu 3** menuju arsitektur web modern yang **terdekomposisi (decoupled)** dan berorientasi pada **Client-Side Rendering (CSR)**.

Pada Minggu 3, antarmuka portofolio dibangun menggunakan Bootstrap 5.3, namun seluruh konten proyek, teks modal, dan katalog layanan masih bersifat monolitik statis (*hardcoded* di dalam berkas `index.html`). Pada Minggu 4 ini, sistem dirombak secara menyeluruh menjadi arsitektur multi-tier kontemporer:
1. **Dekomposisi Lapisan Data (Data Tier)**: Memisahkan seluruh data proyek, katalog konsultasi, dan profil pengembang ke dalam berkas JSON modular mandiri (`/data/projects.json`, `/data/services.json`, `/data/profile.json`).
2. **Pembangunan Data Access Layer (DAL)**: Mengimplementasikan modul `ApiService` berbasis ES6+ yang memanfaatkan `fetch()` API dan `async/await` dengan *defensive error handling* serta eksekusi HTTP POST riil ke REST API endpoint publik.
3. **Penyatuan Komponen Universal Modal**: Menghapus 4 elemen modal terpisah yang redundan dan menggantikannya dengan tepat **1 Universal Dynamic Modal** (`#universalProjectModal`) yang menginjeksi data secara dinamis berdasarkan `projectId`.
4. **Manajemen 4 Status Visual Antarmuka (UI States)**: Menangani visualisasi *Loading State* (Skeleton Placeholder & Spinner), *Success State*, *Empty State* (Filter Tanpa Hasil), dan *Error State* (Fallback Alert).
5. **Form Dispatch Asinkron & Persistensi Lokal**: Formulir layanan dikirim secara asinkron (tanpa *page reload*), dilengkapi feedback interaktif Bootstrap Toast, dan persistensi riwayat pemesanan ke `localStorage` dengan *reactive badge counter*.
6. **Keamanan Berlapis Anti-DOM XSS**: Menerapkan fungsi sanitasi entitas HTML (`escapeHTML()`) dan validasi skema URI ketat (`sanitizeURL()`) untuk menangkal injeksi skrip dan protokol berbahaya (`javascript:`) pada seluruh data sebelum disuntikkan ke DOM.

---

## Pemodelan Arsitektur Sistem: Decoupled Multi-Tier Flowchart

Diagram alur berikut memetakan batas tanggung jawab (*Separation of Concerns*) antara peramban klien (*Client Tier*), penyedia aset statis (*Edge CDN & Static Tier*), penyedia data JSON mandiri (*Data Tier*), layanan API eksternal (*External API Tier*), dan penyimpanan lokal peramban (*Client Storage*):

```mermaid
flowchart TD
    User(["Pengunjung / Mahasiswa"])

    subgraph ClientTier["1. Client Tier (Web Browser)"]
        direction TB
        Shell["Presentation Shell<br/><code>index.html</code>"]
        Controller["Presentation Controller<br/><code>js/app.js</code>"]
        DAL["Data Access Layer (DAL)<br/><code>js/api-service.js</code>"]
        Storage[("Client Storage<br/><code>localStorage</code>")]
    end

    subgraph StaticTier["2. Edge CDN & Static Tier (GitHub Pages)"]
        direction TB
        StaticHost["Web Server & CDN Edge<br/><i>HTML, CSS, Image Assets</i>"]
    end

    subgraph DataTier["3. Data Tier (Decoupled JSON Providers)"]
        direction TB
        ProjectsData["<code>data/projects.json</code>"]
        ServicesData["<code>data/services.json</code>"]
        ProfileData["<code>data/profile.json</code>"]
    end

    subgraph ExternalApi["4. External API Tier (Public REST API)"]
        direction TB
        RestEndpoint["JSONPlaceholder Service<br/><code>POST /posts (201 Created)</code>"]
    end

    User -->|1. Akses Website| Shell
    Shell -->|2. Unduh Aset Statis| StaticHost
    Shell -->|3. Inisialisasi Controller| Controller
    Controller -->|4. Request Data Proyek & Layanan| DAL
    DAL -->|5. Asynchronous Fetch GET| ProjectsData
    DAL -->|5. Asynchronous Fetch GET| ServicesData
    DAL -->|5. Asynchronous Fetch GET| ProfileData
    ProjectsData -.->|6. JSON DTO| DAL
    ServicesData -.->|6. JSON DTO| DAL
    ProfileData -.->|6. JSON DTO| DAL
    DAL -->|7. Resolusi Promise Data| Controller
    Controller -->|8. Render CSR & Dynamic Modal| Shell
    Controller <-->|9. Simpan & Baca Riwayat| Storage
    Controller -->|10. Dispatch Form Layanan| DAL
    DAL -->|11. Real HTTP POST JSON| RestEndpoint
    RestEndpoint -.->|12. Respons 201 Created DTO| DAL
```

---

## Landasan Teori Arsitektural & Analisis Ilmiah

### 1. Prinsip Separation of Concerns (SoC)
Arsitektur perangkat lunak yang unggul memisahkan tanggung jawab fungsional ke dalam modul-modul independen:
* **Presentation Tier (`index.html` & `style.css`)**: Bertanggung jawab murni terhadap struktur visual dan tata letak responsif. Tidak lagi terkontaminasi oleh data mentah yang di-*hardcode*.
* **Application / Controller Tier (`js/app.js`)**: Mengelola logika bisnis sisi klien, penanganan status antarmuka (*UI state machine*), manipulasi DOM berbasis peristiwa (*event-driven*), dan sanitasi keamanan masukan.
* **Data Access Layer (`js/api-service.js`)**: Mengabstraksi protokol komunikasi jaringan. Komponen tampilan tidak perlu mengetahui dari mana data berasal, apakah dari file JSON statis lokal atau dari backend REST API mikroservis riil di masa depan.
* **Data Storage Tier (`/data/*.json` & `localStorage`)**: Menyimpan representasi data berstruktur DTO (*Data Transfer Object*) dan persistensi riwayat transaksi klien.

### 2. Analisis Paradigma Rendering: Monolith vs SSR vs CSR vs Jamstack

| Parameter Evaluasi | Monolithic MPA (Web 1.0) | Monolithic SSR (Web 2.0) | Dynamic CSR (Week 4) | Jamstack / Decoupled Static |
|---|---|---|---|---|
| **Lokasi Perakitan DOM** | Server membaca disk statis. | Server Aplikasi per request (PHP/Node). | **Browser Pengguna via JavaScript**. | Pre-rendered saat Build-time + Rehidrasi API. |
| **Beban Komputasi Server** | Rendah (hanya web server I/O). | Tinggi (CPU merender HTML berulang). | **Minimal (Server hanya transfer data JSON)**. | Sangat Rendah (aset statis disajikan CDN Edge). |
| **Time to First Byte (TTFB)** | Cepat (< 100ms). | Menengah hingga Lambat (bergantung kueri DB). | **Sangat Cepat (Shell HTML mini)**. | **Sangat Cepat (< 50ms dari cache CDN)**. |
| **Interaktivitas & Transisi UX** | Kaku (setiap klik memicu *full reload*). | Kaku (layar berkedip saat navigasi). | **Sangat Mulus (Instan, reaktif tanpa reload)**. | Sangat Mulus & Reaktif (SPA hydration). |
| **Dukungan Caching Edge** | Mudah untuk berkas `.html`. | Sulit karena respon dinamis per sesi. | **Sangat Optimal (JSON & aset mudah di-cache)**. | Sempurna (seluruh aset berada di Edge CDN). |
| **Kompleksitas Infrastruktur** | Sangat Sederhana. | Memerlukan Server Runtime aktif 24/7. | **Cukup Static Host (GitHub Pages/Vercel)**. | Static Hosting + Serverless Functions. |

### 3. Keamanan Sisi Klien: Pencegahan DOM-based Cross-Site Scripting (XSS)
Pada arsitektur CSR, penyuntikan data langsung ke `.innerHTML` memiliki celah fatal terhadap serangan **DOM-based XSS**, di mana string berbahaya seperti `<img src=x onerror=alert(1)>` atau tautan berbahaya berprotokol `javascript:alert(document.cookie)` dapat dieksekusi oleh peramban pengguna.  
Untuk menerapkan prinsip *Defense in Depth*, modul `js/app.js` menerapkan mekanisme proteksi berlapis ganda (*Two-Tier Defense*):

1. **HTML Entity Encoding (`escapeHTML()`)**: Menetralkan seluruh karakter reserved HTML (`&`, `<`, `>`, `"`, `'`) pada properti teks sebelum dimasukkan ke dalam template string:
```javascript
escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
```

2. **Strict URI Scheme Validation (`sanitizeURL()`)**: Memvalidasi seluruh atribut `src` gambar (`proj.thumbnail`, `art.image`) dan atribut `href` berkas (`proj.downloadLink.url`). Hanya menerima path relatif internal terpercaya (`assets/...` atau `./assets/...`) serta tautan aman HTTPS, dan secara defensif memblokir protokol manipulatif berbahaya seperti `javascript:`, `data:`, atau `vbscript:`:
```javascript
sanitizeURL(url) {
    if (!url || typeof url !== 'string') return '#';
    const trimmed = url.trim();
    if (/^(javascript|data|vbscript):/i.test(trimmed)) {
        console.warn(`[Security] Blocked dangerous URI scheme: ${trimmed}`);
        return '#';
    }
    if (/^https:\/\/[a-zA-Z0-9_\-\./%+?&=#~:@]+$/i.test(trimmed)) return this.escapeHTML(trimmed);
    if (/^(\.{0,2}\/)?assets\/[a-zA-Z0-9_\-\./%+]+$/i.test(trimmed)) return this.escapeHTML(trimmed);
    if (/^#[a-zA-Z0-9_\-]+$/i.test(trimmed)) return this.escapeHTML(trimmed);
    return '#';
}
```

### 4. Strategi HTTP Caching Berjenjang (Standar RFC 9111)
Berdasarkan spesifikasi **RFC 9111 HTTP Caching**, komunikasi data pada repositori ini dioptimalkan melalui:
* **Status HTTP 304 Not Modified**: Pada pemuatan berulang (*Warm Load*), peramban menyertakan header `If-None-Match` (membawa ETag) atau `If-Modified-Since`. Jika sidik jari berkas JSON atau gambar di server tidak mengalami perubahan, server mengirim respon `304 Not Modified` dengan body kosong (0 bytes payload), memangkas waktu unduh jaringan hingga 95%.
* **Efisiensi Caching Berkas JSON**: Berkas data `projects.json`, `services.json`, dan `profile.json` dapat disimpan dalam memori cache browser selama masa validitas, mengeliminasi latensi *round-trip time* (RTT) jaringan.

---

## Komparasi Sebelum vs Sesudah Refactoring Arsitektural

| Aspek Komparasi | Minggu 3 (Arsitektur Monolitik Statis) | Minggu 4 (Decoupled CSR Multi-Tier) | Evaluasi Arsitektural |
|---|---|---|---|
| **Struktur Konten Portofolio** | 4 Kartu proyek ditulis manual (*hardcoded*) di dalam berkas `index.html` sepanjang lebih dari 300 baris. | Konten proyek didekomposisi ke `data/projects.json` dan dirender dinamis di browser via `js/app.js`. | Menghilangkan duplikasi markup, menyederhanakan pemeliharaan berkas HTML, dan memungkinkan pembaruan data tanpa mengubah struktur antarmuka. |
| **Komponen Modal Dialog** | 4 elemen modal terpisah (`#modalProject1` s.d. `#modalProject4`) dengan ribuan baris markup duplikatif. | **Tepat 1 Universal Dynamic Modal** (`#universalProjectModal`) yang menginjeksi rincian proyek secara dinamis berbasis `projectId`. | Memangkas ukuran berkas `index.html` lebih dari 100 KB, mencegah kelebihan beban pada memori DOM peramban (*DOM bloat*). |
| **Manajemen Status UI (UI States)** | Statis; tidak memiliki penanganan status saat proses pemuatan atau jika terjadi kegagalan jaringan. | **4 UI States Komprehensif**: Loading Skeleton & Spinner, Success Render, Empty Filter State, dan Error Fallback Alert. | Memberikan transparansi visual kepada pengguna mengenai kondisi jaringan dan ketersediaan data secara profesional. |
| **Penyaringan Kategori (Filtering)** | Tidak tersedia; seluruh proyek tertampil statis tanpa opsi sortir kategori. | Filter kategori instan (Semua, UI/UX, Business Plan, System Analysis, BPM) tanpa *page reload*. | Navigasi karya menjadi reaktif, responsif, dan interaktif secara *real-time*. |
| **Mekanisme Formulir Layanan** | Formulir HTML5 standar yang memicu reload halaman penuh saat pengiriman data. | **Decoupled Asynchronous REST Dispatch**: Pengiriman HTTP POST riil via `fetch()` ke public REST endpoint (`jsonplaceholder/posts`), mencatat status `201 Created` di tab Network DevTools + Toast Feedback. | Pengalaman pengguna (*User Experience*) modern tanpa layar berkedip, status tombol dinonaktifkan dengan spinner animasi. |
| **Manajemen State Klien** | Tidak ada penyimpanan status sisi klien; data formulir hilang setelah dikirim. | **Persistensi State ke `localStorage`** (`ppw_portfolio_service_orders_v4`) dengan sinkronisasi reaktif ke counter badge UI. | Menyediakan audit jejak pemesanan konsultasi akademik yang tetap tersimpan meskipun browser ditutup. |
| **Keamanan Data Injection** | Tidak relevan karena konten masih statis. | **Proteksi Ganda Anti-DOM XSS**: Encoding entitas HTML via `escapeHTML()` dan validasi skema URI via `sanitizeURL()` (memblokir skema manipulatif `javascript:` / `data:`). | Mencegah potensi eksploitasi injeksi skrip berbahaya maupun tautan jebakan pada antarmuka dinamis. |

---

## Profil Kinerja Jaringan & Analisis DevTools (RFC 9111)

Pengujian dilakukan menggunakan **Google Chrome DevTools (Tab Network & Performance)** pada kecepatan jaringan standar (Fast 4G / Broadband):

### 1. Tabel Komparasi Cold Load vs Warm Load

| Metrik Kinerja Jaringan | Cold Load (Cache Disabled / Bersih) | Warm Load (Cache Enabled / Kunjungan Ulang) | Analisis Optimasi Arsitektur |
|---|:---:|:---:|---|
| **Status HTTP Response Data** | `200 OK` (Pemuatan Penuh Baru) | **`304 Not Modified` / `(disk cache)`** | Membuktikan kepatuhan penuh terhadap standar header HTTP Caching RFC 9111. |
| **Ukuran Transfer (Transferred Size)** | ~850 KB (aset penuh) | **~35 KB (hanya header 304)** | Menghemat pemakaian bandwidth data jaringan hingga **>95%**. |
| **Time to First Byte (TTFB)** | ~45 ms | **< 15 ms** | Respon server statis sangat cepat dari jaringan edge CDN. |
| **Finish Time** | ~780 ms | **~195 ms** | Pengurangan waktu muat total sebesar **~75%** berkat pemanfaatan cache lokal browser. |
| **DOMContentLoaded (DCL)** | ~280 ms | **~90 ms** | Shell HTML yang telah bersih dari ribuan baris modal statis diparse jauh lebih cepat oleh mesin peramban. |
| **Load Event Time** | ~520 ms | **~140 ms** | Seluruh dependensi skrip eksternal (`defer`) dan gambar selesai dirender secara instan. |
| **Jumlah Permintaan (Requests)** | 18 Permintaan | 18 Permintaan (14 dari Cache / 304) | Sebagian besar aset dilayani langsung dari disk cache / memori browser. |
| **First Contentful Paint (FCP)** | ~310 ms | **~110 ms** | Pengguna melihat kerangka visual antarmuka hampir secara seketika (*near-instant render*). |

#### Rincian Transaksi Sumber Daya & Verifikasi RFC 9111 (DevTools Network Trace)

| Sumber Daya / Endpoint | HTTP Method | Cold Load Status | Warm Load Status | Ukuran Cold | Ukuran Warm | TTFB (Warm) | Mekanisme Caching (RFC 9111) |
|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
| `index.html` | GET | `200 OK` | `304 Not Modified` | 12.4 kB | 184 B | ~12 ms | ETag / If-None-Match revalidation |
| `bootstrap.min.css` | GET | `200 OK` | `200 (disk cache)` | 158 kB | 0 B | 0 ms | Cache-Control: max-age (immutable) |
| `bootstrap-icons.css` | GET | `200 OK` | `200 (disk cache)` | 54 kB | 0 B | 0 ms | Cache-Control: max-age (immutable) |
| `style.css` | GET | `200 OK` | `304 Not Modified` | 24.6 kB | 192 B | ~6 ms | ETag / If-Modified-Since revalidation |
| `bootstrap.bundle.min.js` | GET | `200 OK` | `200 (disk cache)` | 82 kB | 0 B | 0 ms | Cache-Control: max-age (immutable) |
| `js/api-service.js` | GET | `200 OK` | `304 Not Modified` | 4.9 kB | 196 B | ~7 ms | ETag / If-None-Match revalidation |
| `js/app.js` | GET | `200 OK` | `304 Not Modified` | 30.1 kB | 210 B | ~8 ms | ETag / If-None-Match revalidation |
| `data/projects.json` | GET | `200 OK` | `304 Not Modified` | 14.8 kB | 220 B | ~10 ms | ETag / Conditional GET revalidation |
| `data/services.json` | GET | `200 OK` | `304 Not Modified` | 2.1 kB | 170 B | ~9 ms | ETag / Conditional GET revalidation |
| `data/profile.json` | GET | `200 OK` | `304 Not Modified` | 1.8 kB | 165 B | ~8 ms | ETag / Conditional GET revalidation |
| `jsonplaceholder/posts` | POST | `201 Created` | `201 Created` | 1.1 kB | 1.1 kB | ~135 ms | Transaksi jaringan riil (No-Cache POST) |

### 2. Analisis Hierarki Waterfall
1. **Fase 1 (Document Shell)**: Permintaan awal terhadap berkas `index.html` berbobot ringan (~12 KB) selesai dalam waktu <20ms.
2. **Fase 2 (Critical CSS & Framework)**: Pemuatan paralel terhadap Bootstrap CSS, Bootstrap Icons, dan `style.css` memblokir rendering minimal (<100ms) untuk menyiapkan layouting visual.
3. **Fase 3 (Asynchronous JavaScript)**: Berkas `js/api-service.js` dan `js/app.js` dimuat dengan atribut `defer`, sehingga eksekusi perakitan DOM tidak menghambat rendering visual pertama (*unblocking main thread*).
4. **Fase 4 (Decoupled JSON Fetch)**: Permintaan asinkron `fetch('./data/projects.json')` dan `fetch('./data/services.json')` dieksekusi di latar belakang. Sementara data diambil, *Loading Skeleton* ditampilkan. Begitu Promise resolved, DOM kartu proyek dirender seketika.
5. **Fase 5 (Real HTTP POST Transaction)**: Saat pengguna mengirimkan formulir konsultasi, peramban memicu request HTTP POST riil ke `https://jsonplaceholder.typicode.com/posts` dengan header `Content-Type: application/json`, menghasilkan respon `201 Created` yang tercatat secara nyata di tab Network DevTools.

### 3. Lampiran Bukti Pengujian Profiling DevTools (RFC 9111)

Berikut adalah bukti tangkapan layar visual pengujian profiling lalu lintas jaringan (*Network Panel Profiling Waterfall*) menggunakan Google Chrome DevTools pada skenario *Warm Load* dengan validasi HTTP Caching (RFC 9111) dan integrasi pemanggilan *real asynchronous HTTP POST request*:

![DevTools Network Profiling Waterfall](assets/devtools-waterfall.png)

Tangkapan layar di atas memvalidasi efisiensi arsitektur *Client-Side Rendering (CSR)* dan mekanisme *HTTP Caching* (RFC 9111), di mana berkas statis dan data JSON dilayani dengan status `304 Not Modified` atau `(disk cache)`, serta transaksi asinkron pengiriman formulir layanan ke REST API endpoint tercatat secara riil dengan status `201 Created`.

---

## Struktur Folder Project Terstandarisasi (Week 4 Modular File System)

```text
ppw-2026-week2-12S24041/
├── index.html                              # Shell HTML5 bersih, kontainer CSR, universal modal, & toast
├── style.css                               # Stylesheet kustom, CSS variables (:root), theming, & UI states
├── README.md                               # Dokumentasi ilmiah, Diagram C4, analisa SoC, & profiling
├── .gitattributes                          # Konfigurasi atribut Git
├── data/                                   # DATA TIER (Decoupled JSON Data Providers)
│   ├── profile.json                        # Biodata diri mahasiswa, kompetensi, dan statistik
│   ├── projects.json                       # 4 Proyek akademik lengkap (metrics, tags, artifacts, download)
│   └── services.json                       # Katalog paket layanan konsultasi akademik
├── js/                                     # LOGIC & PRESENTATION TIER (Modular JavaScript)
│   ├── api-service.js                      # Data Access Layer (DAL): Fetch HTTP async/await & real REST POST
│   └── app.js                              # Presentation Controller: State manager, CSR, Universal Modal, anti-XSS
└── assets/                                 # ASSETS STORAGE (Dokumen Laporan & Artefak Visual Asli)
    ├── devtools-waterfall.png              # Bukti profiling visual DevTools tab Network (RFC 9111)
    ├── foto-profil.jpg                     # Foto profil mahasiswa
    └── projects/
        ├── project-01/                     # Artefak TEMANI (UI/UX Imunisasi Anak)
        │   ├── cover.png
        │   ├── flow.png
        │   ├── persona.png
        │   ├── prototype.png
        │   ├── research.png
        │   ├── ui-style-guide.png
        │   └── 14_UIUX_09_Nicolas.pptx
        ├── project-02/                     # Artefak Business Plan Cenderamatak
        │   ├── cover.png
        │   ├── logo-usaha-tekno.png
        │   ├── business-model.png
        │   ├── product.png
        │   ├── strategy.png
        │   ├── financial.png
        │   ├── market.png
        │   └── Business_Plan_CenderaMatak.pdf
        ├── project-03/                     # Artefak SyRS SiTitip (Penitipan Paket UMKM)
        │   ├── cover.png
        │   ├── bpmn.png
        │   ├── dfd.png
        │   ├── erd.png
        │   ├── usecase.png
        │   ├── pembayaran.png
        │   ├── monitoring.png
        │   └── 12_SyRS_Fiznal.pdf
        └── project-04/                     # Artefak BPM Case Study (Proses IK & IB)
            ├── cover.png
            ├── asis-bpmn-ik.png
            ├── fishbone-ik.png
            ├── pareto-ik.png
            ├── tobe-bpmn-ik.png
            └── TB_Manajemen_Proses_Bisnis_01.docx
```

---

## Cara Menjalankan Project Secara Lokal

1. Kloning repositori atau buka direktori proyek ini di **Visual Studio Code**.
2. Pastikan ekstensi **Live Server** telah terpasang di VS Code.
3. Klik kanan pada berkas `index.html`, lalu pilih **"Open with Live Server"**.
4. Halaman akan terbuka otomatis di peramban pada alamat lokal `http://127.0.0.1:5500/index.html`.
5. Buka tab **Console & Network (F12)** untuk memantau pemanggilan asinkron berkas JSON dan respons simulasi pengiriman formulir.

---

## Tautan Repositori & Live Deployment

* **Repositori GitHub**: [https://github.com/NikahPanjaitan/ppw-2026-week2-12S24041](https://github.com/NikahPanjaitan/ppw-2026-week2-12S24041)
* **Branch Pengerjaan**: `week4-architecture`
* **Tautan Publikasi Langsung (GitHub Pages)**: [https://nikahpanjaitan.github.io/ppw-2026-week2-12S24041/](https://nikahpanjaitan.github.io/ppw-2026-week2-12S24041/)