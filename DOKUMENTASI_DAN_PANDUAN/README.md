# 📚 Perpustakaan Digital KB-TK Bhakti Tunas Harapan (SBTH) Magelang
> **Sistem Informasi Manajemen Perpustakaan Terpadu Standar SLiMS 9 Bulian dengan Pengalaman Modern Child-Friendly**  
> *"Be Smart, Be Kind"* • 好好学习，天天向上

---

## 🌟 Ikhtisar Sistem & Keunggulan Dibanding SLiMS 9 Bulian

Aplikasi Perpustakaan Digital SBTH dirancang untuk menghadirkan seluruh kapabilitas standar perpustakaan profesional seperti **SLiMS (Senayan Library Management System 9 Bulian)**, namun dikemas dalam arsitektur modern (Next.js 16 + React 19 + TypeScript + Tailwind CSS) yang jauh **lebih ringan, instan, bebas instalasi server web rumit (Apache/PHP/MySQL)**, dan ramah anak usia dini (PAUD/TK).

### 📊 Tabel Matriks Perbandingan: Perpustakaan SBTH vs SLiMS 9 Bulian

| Fitur Utama | SLiMS 9 Bulian (Tradisional) | Perpustakaan Digital SBTH (Aplikasi Ini) |
|---|---|---|
| **Teknologi & Instalasi** | Wajib pasang XAMPP/Apache, PHP 8, MySQL/MariaDB. Sering kendala port tabrakan di Windows. | **Siap pakai 1-klik di Windows** (`BUKA_APLIKASI_PERPUSTAKAAN_SBTH.vbs`). Hening, tanpa jendela hitam CMD, tanpa database server terpisah. |
| **Katalogisasi Otomatis (ISBN)** | Butuh konfigurasi server P2P/Z39.50/SRU perpustakaan nasional yang sering *timeout*. | **Scan ISBN & Dynamic Switch Cerdas**: Timeout 5 detik, deteksi prefix otomatis, dynamic switching tanpa tutup modal saat ganti buku/judul baru, default 1 eksemplar, dan feedback instan. |
| **Pelacakan Pustakawan & Audit Log** | Log aktivitas terbatas di database admin. | **Audit Trail Lengkap Teratribusi**: Setiap sirkulasi, penambahan, edit, hapus salah input, dan afkir dicatat dengan nama pustakawan aktif serta filter dropdown riwayat. |
| **Cetak Label & Barcode** | Harus cetak per lembar antrean atau cetak semua. | **Cetak Label Fleksibel**: Pilihan Cetak Semua, Cetak Hanya Eksemplar Baru yang belum dicetak, atau Cetak 1 Eksemplar spesifik langsung dari chip eksemplar. |
| **Pemusnahan Buku (Weeding / Afkir)** | Status buku diubah manual, minim dokumentasi legal. | **Tab Pemusnahan Terdedikasi & BAST**: Eksemplar rusak/usang tersimpan terpisah, bisa dipulihkan (*Restore*), dan cetak resmi Berita Acara Pemusnahan (BAST) 3 tanda tangan. |
| **Format Fisik Buku Anak** | Tipe media umum (Text, Audio, Visual). | **17 Format Khusus Buku Anak**: Boardbook, Sound Book, Pop-Up, Cloth Book/Bantal, Lift-the-Flap, Big Book, dll. |
| **Sampul Buku Otomatis (Auto-Cover)** | Manual lewat DuckDuckGo atau perlu plugin pihak ketiga Google Books API. | **Otomatis Cover HD Resmi** + sistem *SmartBookCover* generatif 3D warna-warni jika buku belum memiliki cover digital. |
| **Pola Barcode Eksemplar** | Menu Master File ➔ Pola Eksemplar (`B00001`, `00001/P/2026`). | **Preset SLiMS Lengkap**: Format SLiMS (`B00001`), format SBTH (`SBTH-B-00001`), Rak (`DNG-00001`), atau Kustom dengan auto-increment. |
| **Nomor Panggil 3-Baris (Call Number)** | Rumus: `[DDC] [3-HURUF PENGARANG] [1-huruf judul]`. | **Dihasilkan Otomatis**: Contoh `398.2 TIM d` lengkap dengan DDC ramah anak dan generator stiker label punggung buku siap cetak. |
| **Preferensi & Mode Kerja** | Sering reset ke default jika cache browser bersih. | **Penyimpanan Preferensi Permanen**: Mode tampilan (Grid/Tabel/Kartu), Tab/Sub-tab, Sound FX, Tema, dan data katalog riil terlindungi permanen tanpa ter-reset saat tutup/buka aplikasi. |
| **Antarmuka Anak (OPAC)** | Tampilan web katalog standar dewasa/umum. | **Kiosk Visual Anak Trilingual (ID/EN/ZH)**: Desain playful, tabbed carousel sorotan, horizontal category pills, anti-scroll fatigue, dan filter cerdas. |
| **Akses Jaringan Lokal & Online VPS** | Konfigurasi virtual host Apache manual. | **Dukungan Multi-PC LAN & VPS Online**: Siap jalan di jaringan Wi-Fi sekolah maupun dihosting di Ubuntu VPS dengan panduan lengkap Word `.docx` & `.txt`. |

---

## 🚀 Cara Menjalankan Aplikasi di Windows (Bebas Jendela Hitam CMD)

Untuk kenyamanan pustakawan dan staf sekolah, aplikasi dilengkapi peluncur hening (*silent background launcher*) sehingga **tidak memunculkan jendela hitam Command Prompt** yang mengganggu.

### 1. Peluncur Hening 1-Klik (Rekomendasi Utama)
Cukup klik ganda file:
```text
BUKA_APLIKASI_PERPUSTAKAAN_SBTH.vbs
```
- Server Next.js akan berjalan otomatis di latar belakang secara hening.
- Browser default Anda akan langsung terbuka menampilkan aplikasi di `http://localhost:3000`.
- Jika server sudah menyala sebelumnya, script tidak akan membuat server ganda, melainkan langsung membuka halaman aplikasi di browser.

### 2. Membuat Shortcut di Desktop Windows
Agar aplikasi mudah diakses dari layar depan komputer perpustakaan:
1. Klik ganda file:
   ```text
   PASANG_SHORTCUT_DESKTOP.bat
   ```
2. Ikon jalan pintas **"Perpustakaan Digital SBTH"** akan langsung terpasang di Desktop Windows Anda.

### 3. Menghentikan Server Perpustakaan
Jika ingin mematikan server perpustakaan setelah jam operasional sekolah:
- Klik ganda file:
  ```text
  HENTIKAN_SERVER_PERPUSTAKAAN.bat
  ```

### 4. Mode Jaringan Sekolah (Multi-PC LAN & Tablet Guru/Siswa)
Untuk membuka akses perpustakaan ke laptop guru di kelas atau tablet siswa melalui Wi-Fi sekolah:
- Klik ganda:
  ```text
  start_server_lan.bat
  ```
- Script akan menampilkan alamat IP LAN sekolah (misal: `http://192.168.1.50:3000`) yang dapat dibuka di browser gadget guru dan siswa.

---

## 🌐 Panduan Deploy ke VPS Online (Akses Internet Luar Sekolah)

Aplikasi ini dapat dihosting di VPS Linux Ubuntu sehingga dapat diakses oleh guru, siswa, dan wali murid dari rumah atau luar sekolah dengan alamat domain resmi sekolah (contoh: `https://perpustakaan.sekolah.sch.id`).

Panduan langkah demi langkah yang sangat lengkap telah disediakan dalam dua format:
1. 📄 **Dokumen Microsoft Word Resmi**:  
   👉 [`PANDUAN_DEPLOY_VPS_ONLINE_PERPUSTAKAAN_SBTH.docx`](./PANDUAN_DEPLOY_VPS_ONLINE_PERPUSTAKAAN_SBTH.docx)  
   *(Lengkap dengan format tabel, blok kode perintah, kotak catatan arsitektur, dan checklist produksi).*
2. 📝 **File Teks Notepad Cepat**:  
   👉 [`PANDUAN_DEPLOY_VPS_ONLINE.txt`](./PANDUAN_DEPLOY_VPS_ONLINE.txt)  
   *(Dapat dibaca langsung di terminal server SSH atau Notepad).*

**Ringkasan Stack VPS:**
- OS: Ubuntu 22.04 LTS / 24.04 LTS
- Runtime: Node.js v20/v22 LTS + PM2 Cluster (Autorestart saat reboot)
- Web Server / Reverse Proxy: Nginx (Port 80 ➔ Port 3000)
- Keamanan: Firewall UFW + SSL HTTPS Gratis otomatis diperbarui via Certbot Let's Encrypt.

---

## 🧹 Reset Data Mockup (Memulai Inventaris Riil Sekolah)

Aplikasi secara bawaan menyertakan data koleksi buku cerita anak anak dan sirkulasi percontohan untuk memudahkan pelatihan pustakawan. Ketika sekolah siap melakukan inventarisasi buku fisik riil milik KB-TK SBTH:

1. Klik tombol **Pengaturan Perpustakaan** (Ikon Gerigi) di pojok kanan atas.
2. Masukkan PIN Pengawas/Admin: `8888` (atau PIN kustom Anda).
3. Gulir ke bagian paling bawah, lalu klik tombol merah:
   ```text
   [ 🗑️ Reset Data Mockup / Percobaan (Mulai Data Riil) ]
   ```
4. Masukkan kembali PIN Konfirmasi untuk keamanan.
5. Seluruh buku dummy, sirkulasi percobaan, dan riwayat demo akan dibersihkan secara instan.
6. Data pengaturan aturan pinjam, nama sekolah, logo, dan akun pustakawan tetap aman terjaga. Nomor barcode eksemplar akan siap dimulai dari nomor inventaris riil sekolah (`SBTH-B-00001`).

---

## 🛠️ Rincian Fitur & Modul Utama

### 1. Pelacakan Pustakawan & Log Audit Terpadu
- Setiap pustakawan memiliki PIN akun masing-masing (Pustakawan Utama, Staf Sirkulasi, Admin Pengawas).
- Setiap transaksi peminjaman, pengembalian, perpanjangan, penambahan koleksi baru, pengeditan data, penghapusan salah input, serta pemusnahan buku dicatat secara otomatis lengkap dengan **stempel waktu** dan **nama pustakawan yang bertugas**.
- Panel Log Aktivitas dilengkapi fitur **Filter Berdasarkan Pustakawan** untuk memudahkan audit kerja harian.

### 2. Pencarian ISBN Cerdas & Non-Blocking
- Dilengkapi sistem *timeout abort* 5.5 detik agar pustakawan tidak pernah terjebak menunggu loading saat koneksi internet lambat.
- Mendeteksi prefix penerbit buku Indonesia (Gramedia, Erlangga, Kemendikbud, Mizan, BIP, Kanisius, dll.).
- Banner status visual instan:
  - 🟢 **Buku Ditemukan Penuh** (Metadata judul, pengarang, penerbit, cover terisi otomatis).
  - 🟡 **Penerbit Terdeteksi** (Penerbit otomatis terisi, pustakawan cukup melengkapi judul).
  - ⚪ **Pencarian Mandiri** (Jika offline, pustakawan langsung dapat mengisi form tanpa terhambat).

### 3. Cetak Label Fleksibel & Selektif
- **Cetak Semua**: Mencetak stiker label untuk seluruh eksemplar buku.
- **Cetak Hanya Eksemplar Baru**: Tombol otomatis mendeteksi eksemplar yang belum pernah dicetak (`Belum Dicetak`), sehingga tidak memboroskan stiker kertas label.
- **Cetak 1 Eksemplar Spesifik**: Setiap chip eksemplar (misal: Copy #2 saja) memiliki tombol cetak cepat mandiri.

### 4. Modul Pemusnahan Buku (Weeding / Afkir)
- Tab khusus di menu Koleksi & Eksemplar untuk mengarsipkan buku-buku yang telah rusak parah, basah, hilang, atau kadaluarsa materi.
- Buku yang diafkir tidak hilang begitu saja (menjaga akreditasi dan riwayat inventaris), namun statusnya menjadi `DISPOSED` sehingga tidak muncul di OPAC anak.
- Tombol **Pulihkan Eksemplar** tersedia jika buku yang dilaporkan hilang ternyata ditemukan kembali.
- Cetak resmi **Berita Acara Pemusnahan (BAST)** siap cetak format A4 lengkap dengan kop surat sekolah dan 3 kolom tanda tangan (Pustakawan, Pengawas/Komite, dan Kepala Sekolah).

### 5. Penghapusan Buku "Salah Input" (Safe Delete)
- Jika pustakawan tidak sengaja salah mengetik judul atau salah memindai barcode, buku dapat dihapus total dari database dengan konfirmasi PIN Pengawas dan alasan penghapusan yang tercatat di Log Audit.

### 6. 17 Format Standar Koleksi Anak Usia Dini
Mendukung spesifikasi ragam media buku anak:
`Boardbook`, `Paperback`, `Hardcover`, `Pop-Up Book`, `Sound Book`, `Cloth Book (Buku Kain/Bantal)`, `Lift-the-Flap`, `Touch and Feel`, `Big Book`, `Bilingual Book`, `Komik Anak`, `Buku Aktivitas`, `Picture Book`, `Flashcards`, `Fabel / Cerita Rakyat`, `Buku Ensiklopedia Mini`, dan `E-Book Interaktif`.

---

## 💻 Panduan Pengembang (Development)

```bash
# Instalasi modul dependensi
npm install

# Menjalankan dev server lokal
npm run dev

# Menjalankan dev server jaringan LAN
npm run dev -- -H 0.0.0.0 -p 3000

# Validasi build produksi TypeScript & Next.js
npm run build
```

---

## 👨‍💻 Profil Pengembang & Dukungan Teknis

- **Pengembang**: Prasetyo Handy Kurniawan
- **WhatsApp**: [+62 812-9125-5917](https://wa.me/6281291255917)
- **Email**: prasetyo.handy@gmail.com
- **Lokasi**: Kota Magelang, Jawa Tengah  
*Aplikasi ini didesain dan direkayasa secara khusus untuk memajukan literasi anak usia dini di KB-TK Bhakti Tunas Harapan (SBTH).*
