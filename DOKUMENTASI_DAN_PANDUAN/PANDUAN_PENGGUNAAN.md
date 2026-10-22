# 📚 Panduan Lengkap Penggunaan Perpustakaan Digital SBTH Magelang
> **Sistem Informasi Perpustakaan Modern Kompatibel SLiMS 9 Bulian untuk KB-TK Bhakti Tunas Harapan**  
> *"Be Smart, Be Kind"* • 好好学习，天天向上

---

## 📑 Daftar Isi
1. [Instalasi Apa Saja yang Dibutuhkan](#1-instalasi-apa-saja-yang-dibutuhkan)
2. [Mode 1-Klik Jalankan Aplikasi (Ikon Desktop Resmi)](#2-mode-1-klik-jalankan-aplikasi-ikon-desktop-resmi)
3. [Menghubungkan Komputer Pusat & Komputer Klien (Multi-PC LAN)](#3-menghubungkan-komputer-pusat--komputer-klien-multi-pc-lan)
4. [Keamanan Data & Penyimpanan Pengaturan Permanen (Anti-Reset)](#4-keamanan-data--penyimpanan-pengaturan-permanen-anti-reset)
5. [Aktivasi & Masuk ke Mode Pustakawan (Admin PIN: 1234 & sbth2026)](#5-aktivasi--masuk-ke-mode-pustakawan-admin-pin-1234--sbth2026)
6. [Input Buku Baru & Scan ISBN Cepat (Autofill Dinamis & Ganti Buku Cepat)](#6-input-buku-baru--scan-isbn-cepat-autofill-dinamis--ganti-buku-cepat)
7. [Sirkulasi Peminjaman & Perpanjangan (Pencarian Nama & Username)](#7-sirkulasi-peminjaman--perpanjangan-pencarian-nama--username)
8. [Manajemen Anggota (Username Unik & Pemakaian Ulang Akun)](#8-manajemen-anggota-username-unik--pemakaian-ulang-akun)
9. [Lupa Username & Password Siswa (Kirim Langsung ke WhatsApp Ortu)](#9-lupa-username--password-siswa-kirim-langsung-ke-whatsapp-ortu)
10. [Mode Reservasi Mandiri Siswa (Timer Rundown 1x24 Jam)](#10-mode-reservasi-mandiri-siswa-timer-rundown-1x24-jam)
11. [Panduan Penggunaan Format SLiMS & Barcode (4 Langkah Mudah)](#11-panduan-penggunaan-format-slims--barcode-4-langkah-mudah)
12. [Penomoran Ulang Massal Barcode & Fitur Pemulihan (Restore)](#12-penomoran-ulang-massal-barcode--fitur-pemulihan-restore)
13. [CMS Warta & Pengumuman Multi-Disematkan (Auto-Carousel)](#13-cms-warta--pengumuman-multi-disematkan-auto-carousel)
14. [Ekspor Cadangan Master Excel & SLiMS CSV](#14-ekspor-cadangan-master-excel--slims-csv)
15. [Kontak Bantuan Teknis](#15-kontak-bantuan-teknis)

---

## 1. Instalasi Apa Saja yang Dibutuhkan

Sebelum memulai, pastikan komputer memiliki perangkat lunak dasar berikut:
1. **Node.js versi 18 atau lebih baru (LTS disarankan):**
   - Download gratis di [https://nodejs.org/](https://nodejs.org/) (pilih versi *LTS Recommended for Most Users*).
   - Jalankan installer dan klik *Next* sampai selesai.
2. **Browser Modern:**
   - Google Chrome atau Microsoft Edge (bawaan Windows).
3. **Jaringan Wi-Fi / Router Sekolah:**
   - Diperlukan agar komputer server dan komputer klien/laptop guru berada dalam satu jaringan lokal yang sama.
   - **TIDAK memerlukan internet berkecepatan tinggi** untuk operasional lokal sehari-hari.

---

## 2. Mode 1-Klik Jalankan Aplikasi (Ikon Desktop Resmi)

Aplikasi telah dilengkapi pembuat jalan pintas (*desktop shortcut*) berikon logo resmi KB-TK Bhakti Tunas Harapan (`public/app_icon.ico`):

### Cara Memasang Ikon ke Layar Desktop Windows:
1. Buka folder aplikasi di Windows Explorer.
2. Klik 2x file:
   ```text
   PASANG_SHORTCUT_DESKTOP.bat
   ```
3. Sistem secara otomatis membuat **2 Ikon Resmi** di Desktop Windows Anda:
   - 🎒 **Perpustakaan SBTH TK (Pusat)** ➔ untuk Komputer Server / Meja Pustakawan Utama.
   - 💻 **Perpustakaan SBTH (PC Klien)** ➔ untuk Laptop Guru, Pojok Baca, atau PC Klien lain.

### Cara Menjalankan dengan 1-Klik:
- **Di Komputer Pusat:** Cukup klik 2x ikon **Perpustakaan SBTH TK (Pusat)** di Desktop. Server langsung menyala, mendeteksi IP lokal, dan browser terbuka otomatis dalam 4 detik. Selesai!
- **Di PC Klien / Guru:** Klik 2x ikon **Perpustakaan SBTH (PC Klien)** di Desktop untuk langsung tersambung ke Server Pusat.

---

## 3. Menghubungkan Komputer Pusat & Komputer Klien (Multi-PC LAN)

Sistem ini didesain agar satu server di perpustakaan dapat melayani banyak komputer guru dan tablet siswa sekaligus tanpa perlu instalasi rumit:

```
                     ┌───────────────────────────────────┐
                     │    ROUTER WI-FI / LAN SEKOLAH     │
                     └─────────────────┬─────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         │                             │                             │
         ▼                             ▼                             ▼
┌───────────────────┐         ┌───────────────────┐         ┌───────────────────┐
│ KOMPUTER PUSAT    │         │ PC KLIEN GURU 1   │         │ TABLET KIOSK OPAC │
│ (Server Aktif)    │         │ (Buka Web Klien)  │         │ (Buka Web Klien)  │
│ 192.168.1.13:3000 │         │ 192.168.1.13:3000 │         │ 192.168.1.13:3000 │
└───────────────────┘         └───────────────────┘         └───────────────────┘
```

### Langkah Mudah:
1. **Nyalakan Komputer Pusat:**
   - Klik 2x `JALANKAN_PERPUSTAKAAN_PUSAT.bat` atau shortcut di Desktop.
   - Di layar hitam akan tertulis alamat IP komputer pusat, contoh:
     ```text
     Aplikasi Perpustakaan SBTH siap diakses:
     1. Komputer Pusat ini : http://localhost:3000
     2. PC Lain / HP Guru  : http://192.168.1.13:3000
     ```
2. **Buka dari PC Lain / Laptop Guru:**
   - Klik 2x `BUKA_PERPUSTAKAAN_KLIEN.bat`.
   - Sistem akan langsung membuka alamat IP server pusat yang tersimpan otomatis di `IP_SERVER_PUSAT.txt`.
   - Guru dan siswa dapat langsung mencari buku, meminjam, dan mengecek akun secara bersamaan!

---

## 4. Keamanan Data & Penyimpanan Pengaturan Permanen (Anti-Reset)

Untuk menjaga kenyamanan operasional staf dan kerahasiaan data sekolah:
1. **Penyimpanan Pengaturan & Mode Kerja Permanen (Tidak Mengulang):**
   - Seluruh preferensi pustakawan tersimpan secara otomatis di memori lokal peramban:
     - **Tab Terakhir** (OPAC, Meja Sirkulasi, Koleksi Buku, atau Data Anggota).
     - **Sub-Tab Sirkulasi** (Pinjam Baru, Pengembalian, Perpanjangan, Terlambat, Audit).
     - **Mode Tampilan** (Tampilan Kartu, Tabel, atau Grid) pada katalog buku, daftar anggota, dan OPAC anak.
     - **Efek Suara Suasana (Sound FX)**: Pilihan menyala/senyap (*mute*) tersimpan permanen.
     - **Tema Warna**: Dark Mode / Light Mode tetap aktif sesuai pilihan terakhir.
   - Setiap kali peramban ditutup atau komputer dimatikan, saat dibuka kembali **seluruh pengaturan yang sudah disimpan akan terbuka persis seperti semula tanpa reset**.
2. **Database Offline-First & Perlindungan Koleksi:**
   - Seluruh data judul buku riil, eksemplar, anggota, nomor WhatsApp, dan riwayat sirkulasi tersimpan di komputer sekolah.
   - Sistem memiliki proteksi anti-timpa sehingga buku riil yang sudah diinput pustakawan tidak akan pernah ter-reset atau terhapus oleh data mock-up demo.
3. **Proteksi Autentikasi Ganda Pustakawan:**
   - Mode staf perpustakaan terkunci rapat di balik PIN Keamanan.
   - Tanpa PIN, layar hanya menampilkan Katalog Visual Anak (OPAC) yang aman disentuh anak-anak tanpa khawatir merusak setelan.
4. **Pencadangan Rutin (Snapshot Backup):**
   - Sebelum melakukan perubahan besar (seperti penomoran ulang barcode massal), sistem secara otomatis membuat *Backup Snapshot* lokal.
   - Pustakawan dapat mengunduh seluruh database perpustakaan ke dalam format **Excel 5-Sheet Lengkap** kapan saja untuk arsip offline.

---

## 5. Aktivasi & Masuk ke Mode Pustakawan (Admin PIN: 1234 & sbth2026)

Secara bawaan, aplikasi akan membuka Katalog Visual Anak (OPAC). Untuk masuk ke meja kerja pustakawan:

1. Di pojok kanan atas layar, klik tombol **"Mode Pustakawan"**.
2. Masukkan PIN keamanan. **Kedua metode berikut aktif dan berfungsi:**
   - **PIN Angka (Touchscreen / Keypad):** `1234`
   - **Master Password (Keyboard Fisik):** `sbth2026`
   - *(Atau PIN khusus pustakawan masing-masing yang didaftarkan di menu Pengaturan).*
3. Tersedia tombol bantuan 1-klik `[⚡ PIN Cepat: 1234]` dan `[🔑 Master: sbth2026]` pada jendela login.
4. Anda dapat mengganti PIN atau menambah pustakawan lain sewaktu-waktu melalui menu **Lainnya ➔ Pengaturan ➔ Tab Pustakawan**.

---

## 6. Input Buku Baru & Scan ISBN Cepat (Autofill Dinamis & Ganti Buku Cepat)

Buka menu **Koleksi & Eksemplar ➔ + Scan ISBN / Tambah Buku**:

### A. Alur Scan ISBN & Autofill Otomatis:
1. **Arahkan USB Barcode Scanner** ke barcode ISBN pabrik (13 digit) di sampul belakang buku, atau ketik nomor ISBN di kolom yang tersedia.
2. Sistem otomatis menarik metadata resmi buku (Judul, Penulis, Penerbit, Tahun, DDC Klasifikasi, dan Sampul HD).

### B. Penggantian Buku Dinamis (Tanpa Perlu Tutup & Buka Ulang Modal):
- **Jika Buku Sudah Terdaftar di Perpustakaan SBTH:**
  - Kotak bawah akan menampilkan kartu hijau: *"Buku Sudah Terdaftar di Perpustakaan SBTH"* beserta total eksemplar yang sudah ada di rak.
- **Jika Ingin Mengganti Buku Lain atau Mengetik Judul Baru:**
  - Anda **TIDAK PERLU MENUTUP (CLOSE) DAN MEMBUKA ULANG ISBN**.
  - Cukup ketik judul baru di kotak pencarian cepat (misal: `"Kancil"`, `"Dinosaurus"`) atau ketik ISBN baru.
  - Jika Anda mengklik salah satu kartu saran buku (baik koleksi perpustakaan maupun buku baru online), **tampilan bawah otomatis langsung berganti seketika**!
  - Untuk buku baru, form input dan autofill lengkap langsung terbuka siap disimpan.
  - Tersedia pula tombol cepat `[ 🔄 Ganti / Input Buku Baru ]` pada kartu buku terdaftar untuk mengosongkan status secara instan.

### C. Default Jumlah Eksemplar adalah 1 (Bukan 3):
- Jumlah eksemplar default saat menambahkan buku baru kini ditetapkan **1 Eksemplar**, sehingga aman dan pas untuk pengadaan satuan tanpa menghasilkan barcode berlebih.
- Jika perpustakaan menerima beberapa salinan sekaligus, cukup pilih tombol cepat `[+2 Eksemplar]`, `[+3 Eksemplar]`, `[+5 Eksemplar]`, atau ketik jumlah yang diinginkan.

---

## 7. Sirkulasi Peminjaman & Perpanjangan (Pencarian Nama & Username)

Meja Sirkulasi Pustakawan memudahkan pencarian anggota secara fleksibel:
- **Mode Peminjaman Baru:**
  - Ketik **Nama Siswa** (contoh: `Alvaro`) ATAU **Username** (contoh: `alvaro` atau `SBTH-M-0015`).
  - Sistem menampilkan kartu siswa lengkap dengan badge `@username`.
  - Scan barcode buku fisik (contoh: `B00001` atau `SBTH-B-00101`).
- **Mode Perpanjangan Pinjaman (Renewal):**
  - Bisa mencari transaksi berdasarkan **Nama Siswa** maupun **Username**.
  - Pilih durasi perpanjangan (`+3 Hari`, `+7 Hari`, `+14 Hari`). Kuota perpanjangan otomatis diawasi sistem.

---

## 8. Manajemen Anggota (Username Unik & Pemakaian Ulang Akun)

Buka menu **Anggota & Kartu ➔ + Tambah Anggota**:
1. **Wajib Mengisi Username:**
   - Username digunakan siswa dan orang tua untuk login mandiri.
   - Sistem otomatis memvalidasi keunikan username (tidak boleh ganda/duplikat di antara siswa aktif).
2. **Pemakaian Ulang Username Lama:**
   - Jika ada siswa lama yang sudah **Lulus (Graduated)** atau **Keluar (Inactive)**, username lama tersebut **dapat dipakai kembali** untuk siswa baru pada tahun ajaran berikutnya tanpa error.
3. **Password Default:**
   - Sistem menetapkan password awal default `1234` yang nantinya dapat diubah mandiri oleh siswa/orang tua.

---

## 9. Lupa Username & Password Siswa (Kirim Langsung ke WhatsApp Ortu)

Jika siswa atau orang tua lupa data akun login:
1. Klik tombol **🎒 Masuk Akun Siswa & Ortu** di pojok kanan atas.
2. Di bawah form login, klik **"Lupa Username? Kirim via WhatsApp Ortu"**.
3. Masukkan nomor WhatsApp orang tua yang terdaftar (contoh: `08123456789`).
4. Sistem otomatis menampilkan akun ananda beserta tombol hijau:
   `[ 📱 Kirim Data Akun ke WhatsApp ]`
5. Mengklik tombol tersebut akan langsung membuka WhatsApp dengan draf pesan resmi berisi Nama, Kelas, Username, dan Password siswa siap kirim tanpa repot antre ke pustakawan.
6. Hal yang sama berlaku untuk fitur **"Lupa Password?"** yang membuatkan PIN baru dan mengirimkan tautan konfirmasi ke WhatsApp orang tua.

---

## 10. Mode Reservasi Mandiri Siswa (Timer Rundown 1x24 Jam)

Aturan ketat reservasi antrean buku:
1. **Mode Tamu Umum Dimatikan:**
   - Pengunjung umum yang belum login **tidak dapat melakukan reservasi**. Tombol reservasi menampilkan gembok aman dan mengarahkan pengguna untuk login ke Portal Siswa.
2. **Hanya Memesan untuk Diri Sendiri:**
   - Menu dropdown pilih siswa telah dihapus. Reservasi secara otomatis terikat khusus pada akun siswa yang sedang login.
3. **Pilihan Rencana Tanggal Pengambilan:**
   - Siswa dapat memilih tanggal rencana pengambilan buku di perpustakaan melalui kalender picker.
4. **Timer Rundown 1x24 Jam:**
   - Saat peminjam sebelumnya mengembalikan buku fisik ke perpustakaan, status reservasi berubah menjadi **READY_FOR_PICKUP**.
   - **Timer countdown hitung mundur 1x24 jam** langsung aktif dan berdetik live detik-demi-detik di **Tab "⏳ Reservasi Saya"** pada Portal Mandiri Siswa.
   - Jika buku tidak diambil dalam waktu 24 jam, buku otomatis tersedia kembali untuk umum.

---

## 11. Panduan Penggunaan Format SLiMS & Barcode (4 Langkah Mudah)

Buka menu **Lainnya ➔ Pengaturan ➔ Tab "Pola SLiMS & Barcode"**:

### Langkah 1: Pilih Gaya Kode Barcode (Cukup Klik Salah Satu Kotak di Atas)
Di bagian *"Pilih Preset Pola Penamaan"*, klik salah satu dari 4 kotak yang paling cocok dengan kebutuhan sekolah Anda:
- **Jika ingin yang paling standar (Rekomendasi):** Biarkan terpilih di kotak ke-2 (**SLiMS 9 Bulian**). Kode bukunya nanti simpel: `B00001`, `B00002`, dst.
- **Jika ingin ada nama sekolah SBTH:** Klik kotak ke-1 (**Standar SBTH TK**). Kode bukunya nanti otomatis menjadi: `SBTH-B-00001`, dst.
- **Jika ingin tahu posisi rak langsung dari kode barcode:** Klik kotak ke-3 (**Kode Kategori Rak**). Kode bukunya nanti mengikuti topik rak, misalnya `DNG-00001` (Dongeng) atau `SAI-00001` (Sains).
*(Catatan: Jika Anda sudah mengklik salah satu dari kotak di atas, kolom-kolom di bagian tengah otomatis terisi sendiri).*

### Langkah 2: Cek Bagian Tengah (Hanya Jika Perlu Diubah)
Bagian *"Detail Konfigurasi Pola Nomor Barcode"* otomatis terisi saat Anda memilih kotak di Langkah 1. Anda hanya perlu mengubahnya jika:
- **Nomor Urut Berikutnya:** Saat ini tertulis angka 1 (artinya buku baru pertama yang akan dimasukkan nanti kodenya `B00001`). Jika di perpustakaan sudah ada 50 buku yang ditempeli barcode lama dan Anda ingin melanjutkan dari nomor 51, ganti angka 1 tersebut menjadi **51**.
- **Suffix (Akhiran):** Boleh dikosongkan saja. Isi dengan `/2026` hanya jika Anda ingin ada tahun pengadaan di ujung kode buku (contoh hasil: `B00001/2026`).
- Lihat tulisan kuning di bagian *"Pratinjau Kode Eksemplar Baru"* (saat ini tertulis `B00001`). Jika bentuk kodenya sudah sesuai keinginan Anda, berarti pengaturannya sudah pas.

### Langkah 3: Bagian Bawah Tidak Perlu Diotak-atik
Kotak paling bawah (*Standar Nomor Panggil Buku / Call Number 3-Baris SLiMS*) tidak perlu disetting. Bagian itu hanya info/contoh bahwa setiap kali Anda menambah buku baru dan mengisi judul serta nama pengarangnya, sistem otomatis membuatkan label stiker punggung buku 3 baris:
```text
┌──────────────┐
│   398.2      │  <- Baris 1: Nomor Klasifikasi DDC
│    TIM       │  <- Baris 2: 3 Huruf Nama Pengarang (KAPITAL)
│     d        │  <- Baris 3: 1 Huruf Pertama Judul (kecil)
└──────────────┘
```

### Langkah 4: Klik Simpan
Jika sudah memilih kotak di Langkah 1, langsung klik tombol oranye **"Simpan Format SLiMS"** di pojok kanan atas. Selesai!

---

## 12. Penomoran Ulang Massal Barcode & Fitur Pemulihan (Restore)

Di panel SLiMS tersedia fitur canggih untuk mengubah format seluruh koleksi:
- **Tombol `[ Ubah Semua Kode Buku Lama Mengikuti Pola Ini ]`:**
  - Mengubah seluruh kode barcode buku lama agar seragam mengikuti pola baru.
  - Seluruh riwayat peminjaman otomatis disesuaikan agar tidak ada data yang putus.
  - Dilengkapi konfirmasi ganda pengamanan data.
- **Tombol `[ ↩️ Kembalikan (Restore) Kode Barcode Sebelumnya ]`:**
  - Jika terjadi kesalahan pemilihan preset, pustakawan dapat mengklik tombol ini untuk memulihkan seluruh barcode buku ke kondisi awal secara instan.
- **💡 Saran Teknis Pustakawan:**
  - Pola penamaan barcode **wajib ditentukan dari awal** sebelum mencetak dan menempel stiker barcode fisik pada buku.
  - Hindari sering merubah pola penamaan index barcode buku yang sudah berjalan agar label fisik buku di rak tidak perlu dicetak ulang.

---

## 13. CMS Warta & Pengumuman Multi-Disematkan (Auto-Carousel)

Buka menu **Lainnya ➔ Pengaturan ➔ Tab "Warta Perpus (CMS)"**:
- Pustakawan dapat menerbitkan banyak pengumuman sekaligus (Jadwal Libur, Stock Opname, Agenda Dongeng, Buku Baru).
- Setiap pengumuman dapat disematkan (*Pin Article*) dengan mencentang opsi **"📌 Sematkan di urutan paling atas"**.
- Di halaman utama OPAC anak, pengumuman tampil dalam bentuk **Auto-Sliding Carousel Ticker** yang:
  - Otomatis bergulir (*slide*) setiap 6 detik.
  - Memiliki tombol panah kiri-kanan manual dan indikator titik (*dots*).
  - Menampilkan badge oranye menyala jika disematkan.
  - Klik kartu untuk membaca isi pengumuman lengkap.

---

## 14. Ekspor Cadangan Master Excel & SLiMS CSV

Pustakawan dapat mengamankan data secara berkala:
1. **Master Excel 5-Sheet Yayasan SBTH:**
   - Buka menu **Lainnya ➔ Master Excel**.
   - Klik **"Unduh Master Excel 5-Sheet"**.
   - Berisi Rekap Bulanan, Master Katalog, Inventaris Fisik, Riwayat Sirkulasi, dan Data Anggota Siswa.
2. **Ekspor SLiMS CSV:**
   - Buka menu **Koleksi & Eksemplar ➔ Unduh Format SLiMS**.
   - File CSV langsung siap diimpor ke aplikasi SLiMS 9 Bulian standar perpustakaan nasional.

---

## 15. Kontak Bantuan Teknis

Aplikasi ini dikembangkan dan didukung penuh oleh:
- **Nama**: Prasetyo Handy Kurniawan
- **WhatsApp**: [+62 812-9125-5917](https://wa.me/6281291255917)
- **Email**: prasetyo.handy@gmail.com
- **Lokasi**: Kota Magelang, Jawa Tengah, Indonesia

*Untuk penambahan fitur lanjutan, integrasi server sekolah, atau pendampingan operasional, silakan hubungi kontak di atas.*
