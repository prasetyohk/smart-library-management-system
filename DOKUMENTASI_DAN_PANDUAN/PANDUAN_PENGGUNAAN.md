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
11. [Panduan Penggunaan Format SLiMS & Barcode (Preset SBTH 4-Digit & Format 4-Baris)](#11-panduan-penggunaan-format-slims--barcode-preset-sbth-4-digit--format-4-baris)
12. [Penomoran Ulang Massal Barcode & Fitur Pemulihan (Restore)](#12-penomoran-ulang-massal-barcode--fitur-pemulihan-restore)
13. [CMS Warta & Pengumuman Multi-Disematkan (Auto-Carousel)](#13-cms-warta--pengumuman-multi-disematkan-auto-carousel)
14. [Ekspor & Impor Master Excel (.xlsx) dengan 4 Baris Punggung Buku](#14-ekspor--impor-master-excel-xlsx-dengan-4-baris-punggung-buku)
15. [Panduan Cetak Label Barcode, Tips Kertas Awet & Cap Manual Tanpa Printer](#15-panduan-cetak-label-barcode-tips-kertas-awet--cap-manual-tanpa-printer)
16. [Mode Kembali ke Atas (Back to Top) di OPAC](#16-mode-kembali-ke-atas-back-to-top-di-opac)
17. [Kontak Bantuan Teknis](#17-kontak-bantuan-teknis)

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

## 11. Panduan Penggunaan Format SLiMS & Barcode (Preset SBTH 4-Digit & Format 4-Baris)

Buka menu **Lainnya ➔ Pengaturan ➔ Tab "Pola SLiMS & Barcode"**:

### Langkah 1: Pilih Gaya Kode Barcode (Klik Salah Satu Kotak di Atas)
Di bagian *"Pilih Preset Pola Penamaan"*, tersedia 5 pilihan preset yang siap digunakan:
1. **Standar SBTH 4-Digit (Fisik) — *Sesuai Buku Fisik & Cap Sekolah*:**
   - Prefix: *(kosong)*
   - Panjang Seri: **4 digit** angka murni (`0001`, `0101`, `0143`, dst.)
   - Suffix: *(kosong)*
   - Format ini persis seperti cap stempel nomor daftar fisik pada buku lama sekolah.
2. **Standar SBTH TK:** Awalan `SBTH-B-` diikuti 5 digit nomor seri (contoh: `SBTH-B-00143`).
3. **SLiMS 9 Bulian (Rekomendasi Standar Nasional):** Awalan `B` diikuti 5 digit nomor seri (contoh: `B00143`).
4. **Kode Kategori Rak:** Mengikuti kode topik buku (contoh: `DNG-00143` untuk Dongeng, `SAI-00143` untuk Sains).
5. **Kustom Bebas:** Anda bebas menentukan awalan, panjang digit seri, dan akhiran sesuai kebutuhan.

*(Catatan: Setelah mengklik salah satu kotak di atas, kolom konfigurasi di bagian tengah otomatis terisi sendiri).*

### Langkah 2: Cek Bagian Tengah (Hanya Jika Perlu Diubah)
- **Nomor Urut Berikutnya:** Jika di perpustakaan sudah ada 50 buku lama dan Anda ingin melanjutkan dari nomor 51, cukup ganti angka 1 menjadi **51**.
- **Suffix (Akhiran):** Boleh dikosongkan. Isi `/2026` jika ingin mencantumkan tahun pengadaan.
- Perhatikan tulisan kuning di bagian *"Pratinjau Kode Eksemplar Baru"*. Jika bentuk kodenya sudah cocok, format sudah siap.

### Langkah 3: Format Standar 4-Baris Stiker Punggung Buku SBTH
Pada stiker punggung buku yang ditempel di rak, sistem menyediakan susunan **4 baris vertikal rapi**:
```text
┌──────────────┐
│     SR       │  <- Baris 1: Kode Rak / Koleksi (misal SR, AG, CR, SN)
│    813       │  <- Baris 2: Nomor Klasifikasi DDC (misal 813 Cerpen, 398.2 Dongeng)
│    JUL       │  <- Baris 3: 3 Huruf Pengarang Kapital (Cutter, misal JUL dari Juliet)
│     T        │  <- Baris 4: 1 Huruf Depan Judul Buku (misal T dari Timeless)
└──────────────┘
```
*(Catatan: Keempat baris ini dapat disunting secara fleksibel pada menu Edit Buku, serta didukung penuh melalui impor/ekspor file Excel).*

### Langkah 4: Klik Simpan
Klik tombol oranye **"Simpan Format SLiMS"** di pojok kanan atas untuk menyimpan konfigurasi.

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

## 14. Ekspor & Impor Master Excel (.xlsx) dengan 4 Baris Punggung Buku

Pustakawan dapat mengamankan dan memindahkan data lama sekolah secara rapi:
1. **Unduh Master Excel 5-Sheet Yayasan SBTH:**
   - Buka menu **Lainnya ➔ Master Excel ➔ Unduh Master Excel 5-Sheet**.
   - Berisi Sheet: `Ringkasan_Statistik`, `Master_Katalog`, `Inventaris_Fisik_SBTH`, `Riwayat_Sirkulasi`, dan `Data_Anggota_Siswa`.
2. **Dukungan 4 Baris Punggung Buku & Status Label di Excel:**
   - Kolom Excel mencakup:
     - `Baris 1 - Kode Rak (misal SR)`
     - `Baris 2 - Nomor DDC (misal 813)`
     - `Baris 3 - Kode Pengarang (misal JUL)`
     - `Baris 4 - Kode Judul (misal T)`
     - `Status Dicap / Label (Sudah/Belum)`
3. **Impor Koleksi dari Excel:**
   - Pustakawan cukup mengunggah file Excel data buku lama sekolah.
   - Sistem akan langsung membaca seluruh metadata buku, posisi 4 baris punggung buku, dan otomatis menandai eksemplar yang sudah dicap stempel.

---

## 15. Panduan Cetak Label Barcode, Tips Kertas Awet & Cap Manual Tanpa Printer

Buka menu **Koleksi & Eksemplar ➔ Cetak Label Barcode**:

### A. Kertas HVS vs Thermal (Keawetan Jangka Panjang)
- **Kertas Thermal (Roll Thermal 40x30 mm):**
  - Menggunakan reaksi kimia panas (*thermo-sensitive*). Dalam **6–12 bulan**, hasil cetak akan memudar karena pengaruh suhu ruang dan gesekan. Kurang cocok untuk buku perpustakaan yang digunakan bertahun-tahun.
- **Kertas Stiker HVS (Tom & Jerry No. 103 / Kertas Stiker HVS A4):**
  - **Sangat Awet Puluhan Tahun.**
  - **Pilihan Tinta:** Gunakan **Printer Laser (Toner Bubuk)** atau **Printer Inkjet Tinta Pigment / Art Paper**. Toner laser menyatu permanen ke serat kertas dan tidak akan luntur atau pudar.
  - **Tips Perlindungan Ekstra:** Setelah stiker ditempel pada buku, lapisi permukaannya dengan **lakban bening tebal / selotip jilid transparan (*book tape*)** agar anti-air, tidak mudah robek, dan tahan terhadap tangan anak-anak.

### B. Opsi Tanpa Printer: Cukup Cap Manual & Tulis Ballpoint
- Jika sekolah belum ingin mencetak stiker barcode, pustakawan cukup mengecap stempel buku perpustakaan dan menulis nomor daftarnya memakai ballpoint.
- Klik tombol **`🏷️ Tandai Dicap`** pada kartu buku atau klik badge **`⚠️ Belum`** pada eksemplar untuk langsung menandainya sebagai **`🏷️ Dicap/Cetak`**.
- **Tetap Bisa Dicetak Kapan Saja:** Buku yang sudah ditandai dicap ini **tetap bisa dicetak ulang stiker barcodenya kapan saja** lewat tombol *"Cetak Barcode"* atau *"Cetak Semua"* saat sekolah ingin menambahkan stiker barcode untuk keperluan scan USB.
- **Audit Log:** Seluruh aksi penandaan dicatat otomatis ke menu **Lainnya ➔ Audit & Riwayat** (`TANDAI_CAP_MANUAL` / `CETAK_LABEL_BARCODE`).

---

## 16. Mode Kembali ke Atas (Back to Top) di OPAC

Pada halaman katalog OPAC (baik Mode Kiosk Layar Penuh Anak maupun Mode Pustakawan):
1. **Floating Button Cepat:**
   - Saat pengguna menggulir (*scroll*) halaman ke bawah lebih dari 80px, tombol oranye melayang **"Kembali ke Atas"** akan otomatis muncul di sudut kanan bawah.
   - Mengklik tombol ini akan mengembalikan layar secara halus (*smooth scroll*) ke bagian paling atas halaman.
2. **Bilah Navigasi Statis Bawah Katalog:**
   - Di bagian paling bawah daftar buku, tersedia ringkasan jumlah buku yang sedang tampil serta tombol **`Kembali ke Puncak Katalog ⬆️`** sebagai navigasi alternatif.

---

## 17. Kontak Bantuan Teknis

Aplikasi ini dikembangkan dan didukung penuh oleh:
- **Nama**: Prasetyo Handy Kurniawan
- **WhatsApp**: [+62 812-9125-5917](https://wa.me/6281291255917)
- **Email**: prasetyo.handy@gmail.com
- **Lokasi**: Kota Magelang, Jawa Tengah, Indonesia

*Untuk penambahan fitur lanjutan, integrasi server sekolah, atau pendampingan operasional, silakan hubungi kontak di atas.*
