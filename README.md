# 📚 Sistem Manajemen Perpustakaan Digital KB-TK Bhakti Tunas Harapan (SBTH)

<div align="center">

![Logo SBTH](public/logo_sbth.png)

### **Aplikasi Perpustakaan Sekolah Modern Standar SLiMS 9 Bulian & Klasifikasi e-DDC Perpusnas RI**
*"Be Smart, Be Kind"* • 好好学习，天天向上  
**KB-TK Bhakti Tunas Harapan — Jl. Jendral Sudirman No 68 A, Magelang**

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.1_Turbopack-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Standard SLiMS 9](https://img.shields.io/badge/SLiMS_9_Bulian-Compatible-emerald?style=for-the-badge)](https://slims.web.id/)
[![Dewey Decimal DDC](https://img.shields.io/badge/e--DDC_Perpusnas-000--900-amber?style=for-the-badge)](https://perpusnas.go.id/)

</div>

---

## 📸 Galeri Tampilan Antarmuka & Fitur Unggulan

### 1. 🌟 OPAC Kiosk Visual Anak (Trilingual ID/EN/ZH)
Katalog pencarian buku visual ramah anak usia dini (PAUD/TK) dengan ilustrasi ceria, filter kategori interaktif, dan pencarian instan.
![OPAC Kiosk Anak](docs/screenshots/01_opac_kiosk.png)

---

### 2. 🏷️ Generator Cetak Label Punggung Presisi (7.4 x 4 cm Kotak Potong Manual)
Sistem cetak label punggung buku fisik presisi tinggi dengan garis potong manual tegas (`1pt solid black`), **KOP Resmi SBTH (Logo di pojok kiri, Tulisan di tengah)**, strip warna DDC, nomor panggil 4-baris vertikal, dan Barcode Vector Code-128.
![Cetak Label Punggung SBTH](docs/screenshots/04_cetak_label_punggung_sbth.png)

---

### 3. 📑 Slip Cap Bagian Dalam Buku Fisik (6 x 2.5 cm Kotak Potong Manual)
Label khusus halaman dalam buku untuk mencatat No. Daftar 4-digit (misal: `0101`) dan Tanggal Masuk (`DD/MM/YYYY`) dengan KOP resmi sekolah dan garis potong rapi.
![Slip Cap Bagian Dalam Buku](docs/screenshots/05_cetak_slip_dalam_buku.png)

---

### 4. 🎨 Klasifikasi e-DDC & Pengaturan Warna Stiker Instan (1-Click Color Change)
Manajemen 10 Kelas Utama DDC (000 s/d 900) dengan fitur ganti warna stiker instan dari 16 palet kurasi sekolah, tombol unduh skema resmi e-DDC ke file Excel (`.xlsx`), dan tombol sinkronisasi buku lama ke format DDC.
![Klasifikasi e-DDC dan Pengaturan Warna](docs/screenshots/06_kelola_kategori_warna_eddc.png)

---

### 5. ⚡ Input Buku & Scan ISBN Cerdas (Auto-Matching DDC)
Waterfall Lookup (Database Lokal ➔ Google Books API ➔ OpenLibrary). Sistem mendeteksi kata kunci judul/penerbit secara otomatis dan memetakan buku ke kategori DDC dan kode rak tanpa perlu pustakawan mencari manual.
![Scan ISBN dan Auto DDC](docs/screenshots/03_scan_isbn_auto_ddc.png)

---

### 6. 📚 Manajemen Katalog & Inventaris Eksemplar Fisik (Biblio & Copies)
Tampilan koleksi buku lengkap dengan filter kategori DDC, status cetak label, filter rusak/afkir, ekspor CSV SLiMS 9, dan pencarian multi-parameter.
![Katalog Koleksi Buku](docs/screenshots/02_katalog_koleksi.png)

---

### 7. ⚡ Meja Sirkulasi Pustakawan (Peminjaman & Pengembalian Kilat)
Transaksi sirkulasi super cepat dengan pemindai barcode USB. Mendukung peminjaman mandiri, pengembalian buku, denda otomatis, dan penerbitan slip sirkulasi.
![Meja Sirkulasi](docs/screenshots/07_meja_sirkulasi.png)

---

### 8. 🎈 Portal Siswa Mandiri & Buku Impianku
Portal interaktif khusus siswa untuk melihat buku yang sedang dipinjam, histori membaca, serta menandai "Buku Impian" yang ingin dibaca selanjutnya.
![Portal Siswa Kiosk](docs/screenshots/08_portal_siswa_kiosk.png)

---

## 🎯 Spesifikasi & Fitur Lengkap Sistem

### 📐 1. Format Cetak Label Presisi SBTH
- **Label Punggung Buku (7.4 x 4 cm)**:
  - Format kotak presisi untuk dipotong gunting/cutter manual.
  - KOP Resmi SBTH: Logo sekolah di pojok kiri atas, teks instansi di tengah:
    - *Baris 1*: `PERPUSTAKAAN KB-TK BHAKTI TUNAS HARAPAN`
    - *Baris 2*: `Jl. Jendral Sudirman No 68 A Magelang`
  - Strip warna kategori DDC cerah kontras untuk navigasi visual di rak.
  - Kotak Call Number 4-Baris Vertikal: `[KODE RAK]` / `[DDC]` / `[3-HURUF PENGARANG]` / `[1-huruf judul]`.
  - Barcode Vector Code-128 anti-pecah.
  - Pilihan orientasi: Default **Lanskap (7.4 x 4 cm)** dan opsional **Potret (4 x 7.4 cm)**.
- **Slip Cap Dalam Buku (6 x 2.5 cm)**:
  - Format kotak presisi potong manual.
  - KOP Resmi SBTH (Logo kiri, teks tengah).
  - No. Daftar 4 Digit (contoh: `0101`, `0102`).
  - Tanggal Pengadaan Buku (`DD/MM/YYYY`).
  - Judul buku, nomor ISBN, dan nomor salinan eksemplar.

### 📚 2. Klasifikasi e-DDC Standar Perpusnas RI
- Mengadopsi 10 Kelas Utama Dewey Decimal Classification:
  - **`000`** – Karya Umum, Komputer & Ensiklopedia Cilik
  - **`100`** – Filsafat, Karakter & Budi Pekerti Anak
  - **`200`** – Agama, Doa Sehari-hari & Nilai Religi
  - **`300`** – Ilmu Sosial, Kebiasaan & Cerita Rakyat Nusantara (`398.2`)
  - **`400`** – Bahasa, Fonik, Buku Cerita Mandarin (中文) & English
  - **`500`** – Sains Murni, Alam, Dinosaurus, Satwa & Berhitung
  - **`600`** – Teknologi, Kesehatan Tubuh & Kendaraan
  - **`700`** – Kesenian, Mewarnai, Musik & Olahraga
  - **`800`** – Kesusastraan, Cerita Bergambar & Fabel Sedunia (`813`)
  - **`900`** – Sejarah, Geografi, Tokoh Pahlawan & Peta Dunia
- **Subdivisi e-DDC PAUD/TK**: Memuat 40+ rincian subjek spesifik buku anak.
- **Ekspor Excel Langsung**: Unduh skema resmi e-DDC dalam format `.xlsx` (3 sheet: 10 Kelas DDC, Subdivisi PAUD/TK, dan Panduan Cetak).
- **Auto-Matching Scanner**: Pencocokan otomatis nomor klasifikasi DDC saat barcode ISBN dipindai.
- **1-Click Color Swatches**: Ubah warna stiker kategori seketika dengan 1 klik.
- **Sinkronisasi Koleksi**: 1 tombol untuk menyeragamkan seluruh buku lama ke standar DDC.

### 🏛️ 3. Kompatibilitas SLiMS 9 Bulian
- Format biblio & eksemplar kompatibel dengan sistem Senayan Library Management System (SLiMS).
- Fitur Ekspor CSV SLiMS 1-klik untuk integrasi P2P atau migrasi data perpustakaan.
- Pola barcode eksemplar fleksibel (`SBTH-B-00001`, `B00001`, `DNG-00001`, dll).
- Modul Pemusnahan Buku (*Weeding/Afkir*) lengkap dengan Berita Acara Pemusnahan (BAST) resmi 3 tanda tangan.

### 🚀 4. Sirkulasi Cepat & Keamanan Data
- Mendukung pemindai barcode USB Plug-and-Play dan pemindai kamera perangkat.
- Fitur Kas Denda & QRIS otomatis untuk buku terlambat.
- Audit Trail teratribusi: Setiap perubahan dicatat dengan nama pustakawan aktif.
- Integrasi Backup Otomatis ke Telegram Cloud Bot & WhatsApp Notification Center.

---

## 🛠️ Panduan Menjalankan Aplikasi di Windows

### 1. Menjalankan Server (1-Klik Tanpa CMD Hitam)
Klik ganda file:
```text
Perpustakaan SBTH.exe
atau
BUKA_APLIKASI_PERPUSTAKAAN_SBTH.vbs
```
Aplikasi akan langsung terbuka di browser Anda pada alamat `http://localhost:3000`.

### 2. Memasang Ikon Shortcut di Desktop
Klik ganda file:
```text
PASANG_IKON_DESKTOP.bat
```
Ikon pintasan resmi **Perpustakaan SBTH** akan langsung muncul di layar Desktop komputer.

### 3. Menghentikan Aplikasi
Jika ingin mematikan server setelah jam operasional sekolah selesai:
```text
HENTIKAN_APLIKASI.bat
```

---

## 💻 Panduan Pengembangan (Developer Setup)

```bash
# 1. Clone repositori
git clone https://github.com/prasetyohk/Sistem-Perpustakaan-SBTH.git
cd Sistem-Perpustakaan-SBTH

# 2. Pasang dependensi
npm install

# 3. Jalankan server lokal Next.js
npm run dev

# 4. Buka di browser
# http://localhost:3000
```

---

## 📂 Struktur Berkas Proyek

```text
├── public/                 # Aset statis & logo resmi KB-TK SBTH
├── docs/
│   └── screenshots/        # Tangkapan layar resolusi tinggi fitur aplikasi
├── src/
│   ├── app/                # Next.js App Router (globals.css, layout.tsx, page.tsx)
│   ├── components/
│   │   ├── books/          # ScanIsbnModal, BookManagement, EditBookModal
│   │   ├── categories/     # CategoryManagementModal (e-DDC & Quick Color Picker)
│   │   ├── labels/         # LabelPrintGenerator (Punggung 7.4x4 cm & Slip 6x2.5 cm)
│   │   ├── circulation/    # CirculationDesk (Peminjaman & Pengembalian)
│   │   ├── portal/         # StudentPortalModal (Kiosk Anak)
│   │   └── analytics/      # AnalyticsModal (Statistik & Nilai Aset)
│   ├── lib/
│   │   ├── eddc.ts         # 10 Kelas DDC, Subdivisi Perpusnas, Excel Exporter, Auto-Matcher
│   │   ├── constants.ts    # Standar nomor panggil SBTH & opsi format buku
│   │   ├── storage.ts      # Engine database lokal & audit trail
│   │   └── i18n.ts         # Kamus trilingual (Indonesia, English, Mandarin)
│   └── types/              # Definisi interface TypeScript
└── README.md               # Dokumentasi utama proyek
```

---

## 📄 Lisensi & Hak Cipta

Dikembangkan khusus untuk **Perpustakaan KB-TK Bhakti Tunas Harapan (SBTH) Magelang**.  
Dilisensikan di bawah [MIT License](LICENSE).
