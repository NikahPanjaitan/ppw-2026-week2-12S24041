# Portfolio Nikah Suchia Panjaitan — Week 3

Dokumentasi Praktikum Pemrograman dan Pengujian Web (12S3101) — **Week 3: Refactoring Personal Portfolio Website Menggunakan Bootstrap 5.3 & Advanced Custom CSS**.

---

## Identitas Mahasiswa

| Keterangan | Informasi |
|---|---|
| **Nama** | Nikah Suchia Panjaitan |
| **NIM** | 12S24041 |
| **Program Studi** | S1 Sistem Informasi |
| **Institusi** | Institut Teknologi Del |
| **Mata Kuliah** | 12S3101 - Pemrograman dan Pengujian Web |
| **Topik Praktikum** | Minggu 3: Integrasi Framework Bootstrap 5.3 & Komponen Modern |

---

## Deskripsi Project

Project ini merupakan kelanjutan dan *refactoring* tugas **Personal Portfolio Website Minggu 2** menjadi versi **Minggu 3** yang mengintegrasikan framework **Bootstrap 5.3.3**, **Bootstrap Icons 1.11.3**, sistem **Bootstrap Grid**, **Cards**, **Modals**, serta formulir modern (**Floating Labels**, **Input Groups**, dan validasi native HTML5).

Refactoring dilakukan dengan mengintegrasikan komponen dan utilitas Bootstrap 5.3.3 bersama stylesheet kustom `style.css` untuk mempertahankan desain personal sesuai spesifikasi penugasan tanpa penggunaan aturan `!important` (*Zero `!important`*).

---

## Sebelum vs Sesudah Integrasi Framework

Berikut adalah tabel komparasi detail antara implementasi **Minggu 2 (HTML5 & CSS Manual)** dan **Minggu 3 (Bootstrap 5.3 + Custom Overrides)** sesuai spesifikasi modul:

| Aspek Komparasi | Minggu 2 (Sebelum / Baseline) | Minggu 3 (Sesudah / Framework Integration) |
|---|---|---|
| **Grid / Layout** | Disusun manual menggunakan CSS Grid & Flexbox per section dengan penentuan kolom dan media query secara independen. | Menggunakan **Bootstrap 5.3 Responsive Grid System** (`.container`, `.row`, `.col-*`) dengan gutter standar dan breakpoint fluid (`row-cols-1 row-cols-md-2 row-cols-lg-3`). |
| **Navbar** | Header sticky manual dengan menu navigasi statis (list horizontal) tanpa mekanisme menu hamburger collapse di layar kecil. | Menggunakan **Bootstrap Navbar** dengan utility `.sticky-top`, background translusen berfilter blur, serta menu hamburger responsif (`.navbar-toggler` & `.collapse`) via Bootstrap bundle. |
| **Kartu Proyek & Modal** | Kartu proyek CSS manual sederhana yang hanya memuat ringkasan teks statis tanpa jendela popup interaktif untuk rincian studi kasus. | Menggunakan komponen **Bootstrap Cards** (`.card`, `.card-body`, `.h-100`) terstandar dipadukan dengan **4 Bootstrap Modals** (`.modal`, `.modal-dialog-scrollable`) untuk membedah artefak lengkap. |
| **Formulir** | Formulir HTML/CSS tradisional dengan input box standar, border biasa, dan penataan vertikal sederhana. | Modern **Bootstrap Form Components**: pemanfaatan `.form-floating`, `.input-group` dengan ikon visual Bootstrap Icons, dropdown `.form-select`, serta validasi native HTML5 yang rapi. |
| **CSS Variables** | Variabel kustom `--primary`, `--accent`, `--font-main` dideklarasikan terpisah tanpa integrasi variabel framework. | Sinergi **CSS Variables Personal** (`--primary`, `--primary-dark`, `--surface`, dll.) dengan CSS custom properties Bootstrap tanpa saling merusak dan **0 penggunaan `!important`**. |

### Dampak & Manfaat Refactoring:
1. **Efisiensi & Ketahanan Layout**: Pemanfaatan sistem 12-kolom Bootstrap menyederhanakan pengelolaan breakpoint multi-perangkat sekaligus mencegah *horizontal overflow* pada layar mobile.
2. **Modularitas Komponen**: Komponen Cards dan Modals memisahkan ringkasan ringkas di beranda dengan dokumentasi studi kasus mendalam pada dialog interaktif.
3. **Pengalaman Pengguna (UX) Formulir**: Floating labels dan input groups meningkatkan keterbacaan serta memberikan ruang interaksi yang ramah bagi pengguna mobile.

---

## Daftar Fitur Utama Minggu 3

Sesuai dengan capaian pembelajaran pada modul Bagian V dan VI:

1. **Integrasi Bootstrap 5.3 CDN**: Framework CSS dan JavaScript bundle terintegrasi via CDN resmi JsDelivr (`bootstrap.min.css` dan `bootstrap.bundle.min.js`).
2. **Bootstrap Icons 1.11.3**: Library ikon resmi terpasang untuk navigasi, tombol, badges, dan input group addons.
3. **Responsive Sticky Navbar Collapse**: Navigasi sticky di posisi teratas (`.sticky-top`) dengan menu hamburger responsif pada viewport `< 992px` menggunakan data attributes Bootstrap.
4. **4 Responsive Project Cards dengan Modal Dialog**:
   - Menampilkan 4 studi kasus nyata yang tertata rapi dalam Bootstrap Grid.
   - Dilengkapi 4 jendela Bootstrap Modal interaktif untuk eksplorasi artefak lengkap per proyek.
5. **Modern Consultation Form**:
   - Pemanfaatan `.form-floating` pada field Nama, Email, Telepon, Subjek, dan Pesan.
   - Pemanfaatan `.input-group` yang dipadukan dengan Bootstrap Icons (`bi-person`, `bi-envelope`, `bi-telephone`, `bi-chat-left-text`).
   - Komponen dropdown `.form-select` untuk kategori layanan.
   - Kontrol radio dan checkbox (`.form-check`) untuk paket konsultasi dan persetujuan syarat ketentuan.
   - Validasi murni berbasis atribut native HTML5 (`required`, `type`, `pattern`, `minlength`, `maxlength`).
6. **Zero `!important` (0 Penggunaan `!important`)**: Seluruh stylesheet kustom `style.css` bersih dari deklarasi `!important`, mengandalkan spesifisitas selector yang rapi dan CSS Custom Properties.
7. **Elemen Semantik HTML5 Utuh**: Penggunaan elemen `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`, `<form>`, `<fieldset>`, `<legend>`, dan `<table>`.

---

## Dokumentasi Portfolio Projects

Website mendokumentasikan 4 proyek nyata mahasiswa yang merepresentasikan kompetensi akademik dan teknis:

### Project 01: Perancangan Aplikasi Jadwal Imunisasi Anak Indonesia
- **Kategori**: UI/UX DESIGN & MOBILE PROTOTYPE
- **Deskripsi**: Perancangan prototipe UI/UX menggunakan Figma untuk memodelkan solusi aplikasi seluler jadwal imunisasi balita. Antarmuka memodelkan alur pemantauan jadwal imunisasi, pencatatan riwayat vaksin, pengingat jadwal, dan pemetaan fasilitas kesehatan.
- **Teknologi & Tools**: UI/UX Research, Figma, Mobile Wireframing, Usability Testing, Interactive Prototype.
- **Artefak Unggulan**: User Persona, Alur Pengguna (User Flow), Wireframe & Prototipe Interaktif Figma, serta UI Style Guide Komprehensif.

### Project 02: Business Plan CENDERAMATAK
- **Kategori**: BUSINESS PLANNING & DIGITAL VENTURE
- **Deskripsi**: Perencanaan bisnis strategis untuk produk suvenir kacamata terpersonalisasi khas kawasan Danau Toba yang memadukan identitas ornamen budaya Batak, material ramah lingkungan, dan analisis rantai pasok lokal.
- **Teknologi & Tools**: Business Model Canvas, Financial Projection, Market Analysis, Product Roadmap, Strategic Marketing.
- **Artefak Unggulan**: Logo Usaha Resmi, Business Model Canvas (BMC), Desain Varian Produk, Strategi Pemasaran Digital, dan Proyeksi Finansial.

### Project 03: Sistem Informasi Pengelolaan Keuangan & Monitoring SPP
- **Kategori**: SYSTEM ANALYSIS & SOFTWARE REQUIREMENTS
- **Deskripsi**: Analisis dan pemodelan kebutuhan perangkat lunak melalui dokumen SyRS IEEE 830 (Spesifikasi Kebutuhan Perangkat Lunak) untuk sistem keuangan institusi pendidikan. Proyek ini merupakan tugas rekayasa kebutuhan perangkat lunak (tanpa implementasi source code aplikasi berjalan atau integrasi payment gateway live) yang memodelkan tata kelola pencatatan pembayaran SPP dan pemantauan tunggakan.
- **Teknologi & Tools**: System Analysis, SyRS IEEE 830, BPMN 2.0, Data Flow Diagram (DFD), ERD Modeling, Use Case Specification.
- **Artefak Unggulan**: Diagram Alir Proses Bisnis BPMN, Diagram Dekomposisi DFD Bertingkat, Entity Relationship Diagram (ERD), dan Matriks Spesifikasi Use Case.

### Project 04: Pengembangan Personal Portfolio Website Responsif
- **Kategori**: FRONTEND WEB DEVELOPMENT
- **Deskripsi**: Pengembangan dan refactoring website portfolio personal yang responsif dan aksesibel melalui standarisasi semantik HTML5, arsitektur CSS kustom bertema personal, dan integrasi komponen Bootstrap 5.3.3.
- **Teknologi & Tools**: HTML5 Semantics, Modern CSS3, Bootstrap 5.3.3, Bootstrap Icons 1.11.3, Mobile-First Media Queries, W3C Accessibility Standards, Git.
- **Artefak Unggulan**: Pratinjau Desktop Hero & Navigation, Showcase Section Skills, Formulir Konsultasi Interaktif, dan Pratinjau Mobile Viewport (390×844).

---

## Pratinjau Visual (Screenshots)

Berikut adalah tangkapan layar representatif antarmuka website Week 3:

### 1. Homepage & Hero Section
![Homepage & Hero Section](assets/projects/project-04/cover.png)

### 2. Skills & Capability Showcase
![Skills & Capability Showcase](assets/projects/project-04/skills-preview.png)

### 3. Showcase Portofolio & Case Studies
![Project 01 Cover](assets/projects/project-01/cover.png)
*Cover Project 01 — Perancangan Aplikasi Jadwal Imunisasi Anak Indonesia*

![Project 02 Cover](assets/projects/project-02/cover.png)
*Cover Project 02 — Business Plan CENDERAMATAK*

![Project 03 Cover](assets/projects/project-03/cover.png)
*Cover Project 03 — Sistem Informasi Pengelolaan Keuangan & Monitoring SPP*

### 4. Formulir Konsultasi Modern
![Formulir Kontak Modern](assets/projects/project-04/form-preview.png)

### 5. Tampilan Responsif (Mobile Viewport)
![Pratinjau Mobile Viewport](assets/projects/project-04/mobile-preview.png)

---

## Struktur Folder Project

```text
ppw-2026-week2-12S24041/
├── index.html                                          # Dokumen utama website (Bootstrap 5.3 + Semantik HTML5)
├── style.css                                           # Stylesheet kustom personal & design system (Zero !important)
├── README.md                                           # Dokumentasi resmi proyek (Week 3)
├── logo usaha tekno.png                                # Aset logo usaha CenderaMatak
├── 12_SyRS_Fiznal.pdf                                  # Dokumen SyRS asli (Project 03)
├── 14_UIUX_09_Nicolas.pptx                             # Dokumen materi UI/UX asli (Project 01)
├── W09S01_Business_Plan_01_CenderaMatak (9).docx       # Dokumen Business Plan asli (Project 02)
└── assets/
    ├── foto-profil.jpg                                 # Foto profil mahasiswa
    └── projects/
        ├── project-01/                                 # Aset artefak Project 01 (Imunisasi Anak)
        │   ├── cover.png
        │   ├── flow.png
        │   ├── persona.png
        │   ├── prototype.png
        │   ├── research.png
        │   ├── ui-style-guide.png
        │   └── 14_UIUX_09_Nicolas.pptx
        ├── project-02/                                 # Aset artefak Project 02 (CenderaMatak)
        │   ├── cover.png
        │   ├── logo-usaha-tekno.png
        │   ├── business-model.png
        │   ├── product.png
        │   ├── strategy.png
        │   ├── financial.png
        │   ├── market.png
        │   └── Business_Plan_CenderaMatak.pdf
        ├── project-03/                                 # Aset artefak Project 03 (Sistem SPP)
        │   ├── cover.png
        │   ├── title-cover.png
        │   ├── bpmn.png
        │   ├── dfd.png
        │   ├── erd.png
        │   ├── usecase.png
        │   ├── pembayaran.png
        │   ├── monitoring.png
        │   └── 12_SyRS_Fiznal.pdf
        └── project-04/                                 # Aset tangkapan layar Website Portfolio
            ├── cover.png                               # Preview Hero & Navigasi Desktop
            ├── skills-preview.png                      # Preview Skills Showcase
            ├── form-preview.png                        # Preview Formulir Kontak Interaktif
            └── mobile-preview.png                      # Preview Tampilan Mobile Viewport
```

---

## Cara Menjalankan Project Secara Lokal

1. Buka folder proyek ini di **Visual Studio Code**.
2. Pastikan ekstensi **Live Server** terpasang.
3. Buka file `index.html`.
4. Klik kanan dan pilih **"Open with Live Server"** (atau buka langsung `index.html` via browser).
5. Akses halaman melalui URL lokal `http://127.0.0.1:5500/index.html`.

---

## Tautan Deployment & Repositori

- **URL Repositori GitHub**: [https://github.com/NikahPanjaitan/ppw-2026-week2-12S24041](https://github.com/NikahPanjaitan/ppw-2026-week2-12S24041)
- **Tautan Deployment (GitHub Pages)**: [https://nikahpanjaitan.github.io/ppw-2026-week2-12S24041/](https://nikahpanjaitan.github.io/ppw-2026-week2-12S24041/)
  - *Catatan Status Deployment*: Tautan GitHub Pages di atas saat ini aktif menyajikan baseline Minggu 2 (branch `main`). Implementasi Minggu 3 berada di branch `week3-bootstrap` dan akan otomatis aktif pada tautan publik tersebut setelah proses merge ke branch utama selesai dilakukan.