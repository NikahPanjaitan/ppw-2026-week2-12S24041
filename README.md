# Portfolio Nikah Suchia Panjaitan

## Deskripsi

Website ini merupakan halaman portfolio mahasiswa yang dikembangkan sebagai
implementasi Praktikum Week 2 pada Mata Kuliah Pemrograman dan Pengujian
Aplikasi Web.

Website dibuat dalam bentuk single-page portfolio menggunakan HTML5 dan CSS3.
Halaman memuat informasi profil, bidang yang sedang dipelajari, skills,
portofolio, riwayat mata kuliah, serta formulir konsultasi.

Pengembangan website menerapkan struktur HTML5 semantik, penyajian data
menggunakan list dan tabel, formulir interaktif yang memperhatikan
aksesibilitas, serta desain antarmuka yang responsif menggunakan CSS modern.

---

## Identitas

| Keterangan | Informasi |
|---|---|
| Nama | Nikah Suchia Panjaitan |
| NIM | 12S24041 |
| Program Studi | S1 Sistem Informasi |
| Institusi | Institut Teknologi Del |
| Semester | V |

---

## Tujuan

Pembuatan website ini bertujuan untuk menerapkan konsep HTML5 dan CSS3 yang
dipelajari pada praktikum, meliputi:

1. Menerapkan struktur dokumen menggunakan elemen HTML5 semantik.
2. Menyajikan informasi menggunakan HTML Lists.
3. Menyajikan data menggunakan tabel HTML semantik.
4. Membuat formulir interaktif dengan berbagai jenis kontrol input.
5. Menerapkan prinsip dasar accessibility pada elemen formulir dan navigasi.
6. Menerapkan CSS eksternal untuk mengatur tampilan halaman.
7. Menerapkan Flexbox dan CSS Grid dalam pengaturan layout.
8. Menerapkan responsive design menggunakan Media Queries.
9. Menerapkan elemen visual seperti warna, typography, border-radius,
   box-shadow, dan hover effects.
10. Mengelola dan mempublikasikan project menggunakan Git, GitHub, dan
    GitHub Pages.

---

## Struktur Halaman

Website terdiri dari beberapa bagian utama:

### 1. Beranda

Menampilkan identitas utama mahasiswa, deskripsi singkat, foto profil,
informasi program studi, semester, NIM, institusi, serta fokus bidang.

### 2. Tentang

Menampilkan informasi mengenai profil dan bidang yang sedang dipelajari.

### 3. Skills

Menampilkan kemampuan yang berkaitan dengan pengembangan web, UI/UX, serta
analisis dan perancangan sistem.

### 4. Portofolio

Menampilkan beberapa project dan aktivitas yang berkaitan dengan kegiatan
pembelajaran dan pengembangan kemampuan di bidang Sistem Informasi.

### 5. Riwayat

Menampilkan riwayat beberapa mata kuliah dan fokus pembelajaran dalam bentuk
tabel HTML semantik.

### 6. Kontak

Menyediakan formulir layanan konsultasi yang dapat digunakan untuk
menyampaikan kebutuhan konsultasi.

---

## Implementasi HTML5

Website menggunakan elemen HTML5 semantik untuk membangun struktur halaman,
antara lain:

- `<header>`
- `<nav>`
- `<main>`
- `<section>`
- `<article>`
- `<aside>`
- `<footer>`

Penggunaan elemen tersebut digunakan untuk membedakan struktur dan fungsi
masing-masing bagian halaman.

Website juga menggunakan HTML Lists dan tabel untuk menyajikan informasi.
Tabel riwayat menggunakan:

- `<caption>`
- `<thead>`
- `<tbody>`
- `<tfoot>`
- `<th>`
- `<td>`
- `scope="col"`
- `scope="row"`

---

## Implementasi Formulir dan Accessibility

Formulir konsultasi menggunakan `<form>`, `<fieldset>`, dan `<legend>` untuk
mengelompokkan informasi yang berkaitan.

Jenis kontrol input yang digunakan meliputi:

- Text
- Email
- Telephone
- Number
- Radio
- Checkbox
- Select
- Textarea

Formulir juga menerapkan validasi native HTML5 seperti:

- `required`
- `min`
- `max`
- `minlength`

Setiap input memiliki label yang terhubung secara eksplisit menggunakan
atribut `for` dan `id`.

Aspek accessibility lainnya diterapkan melalui penggunaan atribut seperti
`alt`, `aria-label`, dan `aria-describedby`, serta focus state pada elemen
interaktif.

---

## Implementasi CSS

Tampilan website menggunakan CSS eksternal melalui file `style.css`.

Beberapa konsep CSS yang diterapkan meliputi:

- Universal box-sizing reset
- CSS Variables
- Flexbox
- CSS Grid
- Media Queries
- Responsive Layout
- Typography
- Border Radius
- Box Shadow
- Hover Effects
- Focus States
- Reduced Motion

Website menggunakan beberapa breakpoint untuk menyesuaikan tampilan pada
desktop, tablet, dan perangkat dengan ukuran layar yang lebih kecil.

---

## Struktur Folder

```text
portfolio-nikah-suchia/
│
├── index.html
├── style.css
├── README.md
│
└── assets/
    └── foto-profil.jpg