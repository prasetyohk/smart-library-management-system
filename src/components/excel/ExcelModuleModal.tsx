'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Printer,
  Sparkles,
  Info,
  Edit3,
  Trash2,
  FileText,
  BookmarkCheck,
  Check,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Book, BookItem, CategoryId, AcquisitionSource, DraftBook } from '@/types';
import {
  CATEGORIES,
  getSbthSpineCode,
  deriveShelfCode,
  deriveCategoryDdc,
  deriveAuthorCode,
  deriveTitleCode,
} from '@/lib/constants';
import { libraryStore } from '@/lib/storage';
import { soundFx } from '@/lib/sound';

interface ExcelModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLabelPrinter?: (barcodes: string[]) => void;
  onDataImported?: () => void;
}

export interface ParsedImportRow {
  tempId: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  year: string;
  categoryId: CategoryId;
  categoryName: string;
  shelfLocation: string;
  shelfCode: string;
  classification: string;
  authorCode: string;
  titleCode: string;
  statusDicap: boolean;
  copiesCount: number;
  pageCount?: number;
  physicalFormat: string;
  synopsis: string;
  bookLanguage: string;
  source: AcquisitionSource;
  priceValue: number;
  isExistingMatch: boolean;
  
  // Validation status
  isComplete: boolean;
  missingFields: string[];
}

export const ExcelModuleModal: React.FC<ExcelModuleModalProps> = ({
  isOpen,
  onClose,
  onOpenLabelPrinter,
  onDataImported,
}) => {
  const [activeTab, setActiveTab] = useState<'IMPORT' | 'EXPORT' | 'DRAFTS'>('IMPORT');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<string>('');
  const [importedBarcodes, setImportedBarcodes] = useState<string[]>([]);
  
  // Review / Interactive Validation state
  const [reviewRows, setReviewRows] = useState<ParsedImportRow[]>([]);
  const [reviewFilter, setReviewFilter] = useState<'ALL' | 'READY' | 'INCOMPLETE'>('ALL');
  const [isReviewMode, setIsReviewMode] = useState<boolean>(false);

  // Drafts state
  const [draftBooks, setDraftBooks] = useState<DraftBook[]>([]);

  useEffect(() => {
    if (isOpen) {
      setDraftBooks(libraryStore.getDraftBooks());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Helper: Evaluasi kelengkapan baris dan deteksi kolom yang kosong
  const evaluateRow = (row: Partial<ParsedImportRow>): { isComplete: boolean; missingFields: string[] } => {
    const missing: string[] = [];
    if (!row.title || !row.title.trim()) missing.push('Judul Buku Kosong');
    if (!row.author || !row.author.trim() || row.author === 'Penulis Belum Diisi') missing.push('Pengarang Kosong');
    if (!row.synopsis || !row.synopsis.trim()) missing.push('Sinopsis Kosong');
    if (!row.shelfLocation || !row.shelfLocation.trim()) missing.push('Posisi Rak Belum Diatur');

    // Lengkap jika judul dan pengarang terisi, dan sinopsis tidak kosong
    const isComplete = Boolean(
      row.title && row.title.trim() &&
      row.author && row.author.trim() && row.author !== 'Penulis Belum Diisi' &&
      row.synopsis && row.synopsis.trim() &&
      row.shelfLocation && row.shelfLocation.trim()
    );

    return { isComplete, missingFields: missing };
  };

  // 1. Download Master Template Excel (.xlsx) disertai Panduan Pengisian 2-Sheet
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'ISBN (Opsional)': '9786022497653',
        'Judul Buku': 'Kancil dan Buaya yang Cerdik',
        'Pengarang': 'Kak Bambang',
        'Penerbit': 'Erlangga for Kids',
        'Tahun Terbit': '2024',
        'Kategori': 'DONGENG',
        'Posisi Rak': 'Rak Kuning B (Dongeng & Fabel) - Baris 1',
        'Baris 1 - Kode Rak': 'SR',
        'Baris 2 - Nomor DDC': '398.2',
        'Baris 3 - Kode Pengarang': 'BAM',
        'Baris 4 - Kode Judul': 'k',
        'Status Dicap / Label': 'Belum',
        'Jumlah Eksemplar': 3,
        'Halaman Buku': 32,
        'Format Fisik': 'Cerita Bergambar',
        'Sinopsis Singkat': 'Kisah fabel klasik kancil cerdik menyeberangi sungai penuh buaya dengan kejujuran dan kecerdikan.',
        'Bahasa Buku': 'Indonesia',
        'Sumber Perolehan': 'BELI',
        'Nilai Buku (Rp)': 45000,
      },
      {
        'ISBN (Opsional)': '9786020524412',
        'Judul Buku': 'Seri Hewan Liar: Mengapa Jerapah Lehernya Panjang?',
        'Pengarang': 'dr. Satwa',
        'Penerbit': 'Gramedia Pustaka Utama',
        'Tahun Terbit': '2023',
        'Kategori': 'ALAM',
        'Posisi Rak': 'Rak Hijau A (Sains & Alam) - Baris 1',
        'Baris 1 - Kode Rak': 'SR',
        'Baris 2 - Nomor DDC': '500',
        'Baris 3 - Kode Pengarang': 'SAT',
        'Baris 4 - Kode Judul': 'h',
        'Status Dicap / Label': 'Sudah',
        'Jumlah Eksemplar': 2,
        'Halaman Buku': 28,
        'Format Fisik': 'Hardcover Bergambar',
        'Sinopsis Singkat': 'Mengenal keunikan leher jerapah dan adaptasi hewan di sabana Afrika.',
        'Bahasa Buku': 'Indonesia',
        'Sumber Perolehan': 'HIBAH_ORTU',
        'Nilai Buku (Rp)': 55000,
      },
      {
        'ISBN (Opsional)': '9786237171447',
        'Judul Buku': 'Bendi dan Dompu',
        'Pengarang': 'Yovita Siswati',
        'Penerbit': 'ASTA Ilmu Publishing',
        'Tahun Terbit': '2020',
        'Kategori': 'DONGENG',
        'Posisi Rak': 'Rak Kuning B (Dongeng & Fabel) - Baris 2',
        'Baris 1 - Kode Rak': 'SR',
        'Baris 2 - Nomor DDC': '813',
        'Baris 3 - Kode Pengarang': 'SIS',
        'Baris 4 - Kode Judul': 'b',
        'Status Dicap / Label': 'Sudah',
        'Jumlah Eksemplar': 3,
        'Halaman Buku': 24,
        'Format Fisik': 'Cerita Bergambar',
        'Sinopsis Singkat': 'Kisah persahabatan Bendi (sebuah kereta) dan Dompu (seekor kuda) yang saling membantu.',
        'Bahasa Buku': 'Indonesia',
        'Sumber Perolehan': 'BOS',
        'Nilai Buku (Rp)': 38000,
      },
      {
        'ISBN (Opsional)': '',
        'Judul Buku': 'Mengenal Adab Makan & Berdoa Bersama Mimi',
        'Pengarang': 'Bunda Hani',
        'Penerbit': 'Mizan Kids',
        'Tahun Terbit': '2024',
        'Kategori': 'KARAKTER',
        'Posisi Rak': 'Rak Merah D (Karakter & Akhlak) - Baris 1',
        'Baris 1 - Kode Rak': 'SR',
        'Baris 2 - Nomor DDC': '170',
        'Baris 3 - Kode Pengarang': 'HAN',
        'Baris 4 - Kode Judul': 'm',
        'Status Dicap / Label': 'Belum',
        'Jumlah Eksemplar': 4,
        'Halaman Buku': 24,
        'Format Fisik': 'Boardbook Balita',
        'Sinopsis Singkat': 'Belajar adab makan dengan tangan kanan dan berdoa bersama ananda.',
        'Bahasa Buku': 'Indonesia',
        'Sumber Perolehan': 'SUMBANGAN',
        'Nilai Buku (Rp)': 48000,
      },
      {
        'ISBN (Opsional)': '',
        'Judul Buku': 'Koleksi Cerita Dongeng Teladan TK (Belum Ada Sinopsis)',
        'Pengarang': '',
        'Penerbit': 'Pustaka SBTH',
        'Tahun Terbit': '2024',
        'Kategori': 'DONGENG',
        'Posisi Rak': '',
        'Baris 1 - Kode Rak': '',
        'Baris 2 - Nomor DDC': '',
        'Baris 3 - Kode Pengarang': '',
        'Baris 4 - Kode Judul': '',
        'Status Dicap / Label': 'Belum',
        'Jumlah Eksemplar': 1,
        'Halaman Buku': 16,
        'Format Fisik': 'Cerita Bergambar',
        'Sinopsis Singkat': '',
        'Bahasa Buku': 'Indonesia',
        'Sumber Perolehan': 'BELI',
        'Nilai Buku (Rp)': 35000,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    ws['!cols'] = [
      { wch: 18 }, { wch: 45 }, { wch: 22 }, { wch: 24 }, { wch: 12 },
      { wch: 16 }, { wch: 34 }, { wch: 16 }, { wch: 16 }, { wch: 18 },
      { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 20 },
      { wch: 45 }, { wch: 14 }, { wch: 16 }, { wch: 15 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_Buku_SBTH');

    // Sheet 2: Panduan Lengkap Cara Pengisian & Transisi Pindah Rak
    const panduanData = [
      { 'Petunjuk': 'PANDUAN LENGKAP PENGISIAN EXCEL & TRANSIZI PERPUSTAKAAN SBTH', 'Penjelasan': '' },
      { 'Petunjuk': '---------------------------------------------------------', 'Penjelasan': '--------------------------------------------------------------------------------------------------------------------------------------------------------------------' },
      { 'Petunjuk': '1. ISBN (Opsional)', 'Penjelasan': 'Boleh dikosongkan. Jika diisi nomor barcode ISBN 10/13 digit, sistem dapat melengkapi judul otomatis dari database online.' },
      { 'Petunjuk': '2. Judul Buku (Wajib)', 'Penjelasan': 'Nama judul buku fisik. Wajib diisi agar dapat diindeks dalam katalog dan pencarian.' },
      { 'Petunjuk': '3. Pengarang (Disarankan)', 'Penjelasan': 'Nama penulis buku. Sistem otomatis mengambil 3 huruf kapital (Cutter) untuk punggung buku (misal: "Kak Bambang" -> BAM, "Yovita Siswati" -> SIS).' },
      { 'Petunjuk': '4. Kategori (Wajib/Disarankan)', 'Penjelasan': 'Pilih salah satu dari 6 kategori SBTH: DONGENG, ALAM, AKTIVITAS, KARAKTER, ENSIKLOPEDIA, MANDARIN & BHS.' },
      { 'Petunjuk': '5. Posisi Rak (Pindah Lokasi)', 'Penjelasan': 'Tentukan nama rak fisik buku (misal: "Rak Kuning B - Baris 1"). Jika dikosongkan, sistem otomatis mengikuti rak standar kategori yang dipilih.' },
      { 'Petunjuk': '6. Baris 1 - Kode Rak (Opsional)', 'Penjelasan': 'Bawaan "SR" (Story Rack). Boleh diisi kode rak khusus seperti "SN", "AG", "CR". Dikosongkan = otomatis "SR".' },
      { 'Petunjuk': '7. Baris 2 - Nomor DDC (Opsional)', 'Penjelasan': 'Nomor klasifikasi DDC. Jika kosong, otomatis mengikuti kategori: Dongeng (398.2 / 813), Alam (500), Karakter (170), dll.' },
      { 'Petunjuk': '8. Baris 3 - Kode Pengarang (Opsional)', 'Penjelasan': '3 huruf kapital pengarang. Boleh dikosongkan jika ingin sistem men-generate otomatis dari kolom Pengarang.' },
      { 'Petunjuk': '9. Baris 4 - Kode Judul (Opsional)', 'Penjelasan': '1 huruf depan judul buku (huruf kecil). Boleh dikosongkan jika ingin sistem men-generate otomatis dari kolom Judul.' },
      { 'Petunjuk': '10. Status Dicap / Label', 'Penjelasan': 'Isi "Sudah" jika buku fisik di rak perpustakaan sudah dicap manual/ditempel stiker barcode sebelumnya, atau "Belum" jika perlu dicetak stiker baru.' },
      { 'Petunjuk': '11. Sinopsis Singkat (Opsional)', 'Penjelasan': 'Ringkasan buku untuk siswa/ortu. Jika dikosongi, Anda bisa mengeditnya di pratinjau, memasukkannya ke DRAF, atau memaksa impor dengan teks default.' },
      { 'Petunjuk': '12. Jumlah Eksemplar', 'Penjelasan': 'Jumlah buku fisik yang ada di perpustakaan. Tiap eksemplar akan mendapatkan nomor barcode fisik berurutan otomatis (e.g. SBTH-B-0001).' },
    ];
    const wsPanduan = XLSX.utils.json_to_sheet(panduanData);
    wsPanduan['!cols'] = [{ wch: 32 }, { wch: 110 }];
    XLSX.utils.book_append_sheet(wb, wsPanduan, 'Panduan_Pengisian');

    XLSX.writeFile(wb, 'Template_Master_Impor_Buku_SBTH_TK.xlsx');
    soundFx.playScanBeep();
  };

  // 2. Handle File Upload & Parse into Interactive Review
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setImportStatus('Membaca & menganalisis file Excel...');
    setImportedBarcodes([]);
    setReviewRows([]);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      if (rows.length === 0) {
        alert('File Excel kosong atau format tabel tidak dikenali.');
        setIsProcessing(false);
        return;
      }

      setImportStatus(`Ditemukan ${rows.length} baris data. Sedang menyinkronkan kode punggung & metadata...`);

      const parsed: ParsedImportRow[] = [];
      const existingBooks = libraryStore.getBooks();

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        let isbn = String(row['ISBN (Opsional)'] || row['ISBN'] || '').trim();
        let title = String(row['Judul Buku'] || row['Judul'] || '').trim();
        let author = String(row['Pengarang'] || row['Penulis'] || '').trim();
        let publisher = String(row['Penerbit'] || '').trim();
        let year = String(row['Tahun Terbit'] || row['Tahun'] || '2024').trim();
        let catCode = String(row['Kategori'] || 'DONGENG').toUpperCase().trim();
        let shelfLocation = String(row['Posisi Rak'] || row['Lokasi Rak'] || row['Rak'] || '').trim();
        let rawShelfCode = String(row['Baris 1 - Kode Rak'] || row['Kode Rak'] || row['Shelf Code'] || '').trim();
        let rawClassification = String(row['Baris 2 - Nomor DDC'] || row['Nomor DDC'] || row['DDC'] || row['Klasifikasi'] || '').trim();
        let rawAuthorCode = String(row['Baris 3 - Kode Pengarang'] || row['Kode Pengarang'] || row['Author Code'] || '').trim();
        let rawTitleCode = String(row['Baris 4 - Kode Judul'] || row['Kode Judul'] || row['Title Code'] || '').trim();
        let rawLabelStatus = String(row['Status Dicap / Label'] || row['Status Dicap'] || row['Status Label'] || row['Status Cetak'] || '').toLowerCase().trim();
        const isStampedOrPrinted = rawLabelStatus.includes('sudah') || rawLabelStatus.includes('cap') || rawLabelStatus.includes('cetak') || rawLabelStatus === 'ya' || rawLabelStatus === 'true' || rawLabelStatus === '1';

        let count = parseInt(row['Jumlah Eksemplar'] || row['Jumlah Buku'] || row['Jumlah'] || '1', 10) || 1;
        let rawSource = String(row['Sumber Perolehan'] || row['Sumber'] || 'BELI').toUpperCase().trim();
        let pageCount = parseInt(row['Halaman Buku'] || row['Halaman'] || '0', 10) || undefined;
        let physicalFormat = String(row['Format Fisik'] || 'Cerita Bergambar').trim();
        let synopsis = String(row['Sinopsis Singkat'] || row['Sinopsis'] || '').trim();
        let bookLanguage = String(row['Bahasa Buku'] || row['Bahasa'] || 'id').toLowerCase().trim();
        let priceValue = parseInt(row['Nilai Buku (Rp)'] || row['Nilai Buku'] || row['Harga'] || '45000', 10) || 45000;

        // Map category string to CategoryId
        let categoryId: CategoryId = 'cat-dongeng';
        let categoryName = 'DONGENG';
        if (catCode.includes('ALAM') || catCode.includes('SAINS')) {
          categoryId = 'cat-alam';
          categoryName = 'ALAM';
        } else if (catCode.includes('AKTIVITAS') || catCode.includes('BACA') || catCode.includes('HITUNG')) {
          categoryId = 'cat-aktivitas';
          categoryName = 'AKTIVITAS';
        } else if (catCode.includes('KARAKTER') || catCode.includes('AGAMA') || catCode.includes('BUDI')) {
          categoryId = 'cat-karakter';
          categoryName = 'KARAKTER';
        } else if (catCode.includes('ENSIKLOPEDIA') || catCode.includes('IPTEK')) {
          categoryId = 'cat-ensiklopedia';
          categoryName = 'ENSIKLOPEDIA';
        } else if (catCode.includes('BAHASA') || catCode.includes('MANDARIN') || catCode.includes('ENGLISH')) {
          categoryId = 'cat-bahasa';
          categoryName = 'MANDARIN & BHS';
        }

        // Cek apakah buku ini sudah ada di database (untuk transisi/pindah rak & kategori massal)
        const isMatch = Boolean(
          (isbn && existingBooks.some((b) => b.isbn === isbn)) ||
          (title && existingBooks.some((b) => b.title.toLowerCase() === title.toLowerCase()))
        );

        // Auto-fetch via Google Books jika judul kosong namun ada ISBN
        if (!title && isbn) {
          try {
            const cleanIsbn = isbn.replace(/[-\s]/g, '');
            const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`);
            const gData = await res.json();
            if (gData.items?.[0]?.volumeInfo) {
              const info = gData.items[0].volumeInfo;
              title = info.title || title;
              author = info.authors ? info.authors.join(', ') : author;
              publisher = info.publisher || publisher;
              if (info.publishedDate) year = info.publishedDate.substring(0, 4);
              if (info.description) synopsis = info.description.replace(/<[^>]*>/g, '').trim();
              if (info.pageCount) pageCount = info.pageCount;
            }
          } catch (e) {
            console.warn('Google Books fallback error:', e);
          }
        }

        // Auto-derive spine codes jika kosong
        const spine = getSbthSpineCode(
          title || 'Buku Baru',
          author || 'Pengarang',
          categoryId,
          rawShelfCode,
          rawClassification,
          rawAuthorCode,
          rawTitleCode
        );

        const targetCat = CATEGORIES.find((c) => c.id === categoryId);
        const resolvedShelf = shelfLocation || targetCat?.shelfLocation || `Rak ${categoryName}`;

        let acquisitionSource: AcquisitionSource = 'BELI_SEKOLAH';
        if (rawSource.includes('ORTU') || rawSource.includes('SUMBANGAN') || rawSource === 'S') acquisitionSource = 'SUMBANGAN_ORTU';
        else if (rawSource.includes('DINAS') || rawSource.includes('HIBAH') || rawSource === 'H') acquisitionSource = 'HIBAH_DINAS';
        else if (rawSource.includes('BOS') || rawSource.includes('PROYEK') || rawSource === 'PR') acquisitionSource = 'BOS';

        const rowObj: ParsedImportRow = {
          tempId: `row-${Date.now().toString(36)}-${i}`,
          isbn,
          title,
          author,
          publisher,
          year,
          categoryId,
          categoryName,
          shelfLocation: resolvedShelf,
          shelfCode: spine.shelfCode,
          classification: spine.ddc,
          authorCode: spine.authorCode,
          titleCode: spine.titleCode,
          statusDicap: isStampedOrPrinted,
          copiesCount: count,
          pageCount,
          physicalFormat,
          synopsis,
          bookLanguage,
          source: acquisitionSource,
          priceValue,
          isExistingMatch: isMatch,
          isComplete: false,
          missingFields: [],
        };

        const evalResult = evaluateRow(rowObj);
        rowObj.isComplete = evalResult.isComplete;
        rowObj.missingFields = evalResult.missingFields;

        parsed.push(rowObj);
      }

      setReviewRows(parsed);
      setIsReviewMode(true);
      soundFx.playScanBeep();
    } catch (err: any) {
      console.error('Import parse error:', err);
      alert('Terjadi kesalahan saat memproses file Excel.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Update cell in Review table inline
  const handleUpdateReviewCell = (tempId: string, field: keyof ParsedImportRow, value: any) => {
    setReviewRows((prev) =>
      prev.map((r) => {
        if (r.tempId !== tempId) return r;
        const updated = { ...r, [field]: value };

        // Jika judul, pengarang, atau kategori diubah, sinkronkan ulang kode punggung
        if (field === 'title' || field === 'author' || field === 'categoryId') {
          const spine = getSbthSpineCode(
            field === 'title' ? value : updated.title,
            field === 'author' ? value : updated.author,
            field === 'categoryId' ? value : updated.categoryId,
            updated.shelfCode,
            updated.classification,
            updated.authorCode,
            updated.titleCode
          );
          updated.shelfCode = spine.shelfCode;
          updated.classification = spine.ddc;
          updated.authorCode = spine.authorCode;
          updated.titleCode = spine.titleCode;

          if (field === 'categoryId') {
            const targetCat = CATEGORIES.find((c) => c.id === value);
            if (targetCat) {
              updated.categoryName = targetCat.shortName;
              updated.shelfLocation = targetCat.shelfLocation;
            }
          }
        }

        const evalResult = evaluateRow(updated);
        updated.isComplete = evalResult.isComplete;
        updated.missingFields = evalResult.missingFields;

        return updated;
      })
    );
  };

  // Eksekusi Impor untuk baris tertentu
  const executeImportRows = (rowsToImport: ParsedImportRow[], sendRemainingToDraft: boolean) => {
    setIsProcessing(true);
    setImportStatus('Memasukkan data ke dalam koleksi perpustakaan...');

    try {
      const allNewBarcodes: string[] = [];
      const existingBooks = libraryStore.getBooks();

      rowsToImport.forEach((row, idx) => {
        const cleanTitle = row.title.trim() || `Buku SBTH Impor #${idx + 1}`;
        const cleanAuthor = row.author.trim() || 'Tim Guru SBTH';
        const cleanSynopsis = row.synopsis.trim() || `Buku koleksi perpustakaan KB-TK Bhakti Tunas Harapan.`;

        // Cek jika buku sudah ada -> update metadata / pindah rak & kategori
        const existing = existingBooks.find(
          (b) => (row.isbn && b.isbn === row.isbn) || b.title.toLowerCase() === cleanTitle.toLowerCase()
        );

        if (existing) {
          libraryStore.updateBook(existing.id, {
            categoryId: row.categoryId,
            shelfLocation: row.shelfLocation,
            shelfCode: row.shelfCode,
            classification: row.classification,
            authorCode: row.authorCode,
            titleCode: row.titleCode,
            synopsis: cleanSynopsis,
            publisher: row.publisher || existing.publisher,
            publicationYear: row.year || existing.publicationYear,
          });

          // Jika jumlah eksemplar di Excel lebih banyak dari yang ada, tambahkan salinan baru
          const currentCopies = libraryStore.getItemsForBook(existing.id);
          if (row.copiesCount > currentCopies.length) {
            const needed = row.copiesCount - currentCopies.length;
            const added = libraryStore.addCopiesToBook(existing.id, needed, row.source, undefined, row.priceValue);
            added.forEach((it) => allNewBarcodes.push(it.itemBarcode));
          }
        } else {
          // Buku Baru
          const { newItems } = libraryStore.addBook(
            {
              isbn: row.isbn || `EXCEL-${Date.now().toString().slice(-6)}-${idx}`,
              title: cleanTitle,
              author: cleanAuthor,
              publisher: row.publisher || 'Penerbit SBTH',
              publicationYear: row.year || '2024',
              categoryId: row.categoryId,
              ageGroup: 'TK_A',
              shelfLocation: row.shelfLocation,
              shelfCode: row.shelfCode,
              classification: row.classification,
              authorCode: row.authorCode,
              titleCode: row.titleCode,
              pageCount: row.pageCount,
              physicalFormat: row.physicalFormat,
              bookLanguage: row.bookLanguage,
              synopsis: cleanSynopsis,
              coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
            },
            row.copiesCount,
            row.source,
            undefined,
            row.priceValue
          );

          if (row.statusDicap && newItems.length > 0) {
            libraryStore.markLabelsPrinted(
              newItems.map((it) => it.itemBarcode),
              true,
              'MANUAL_STAMP'
            );
          }

          newItems.forEach((it) => allNewBarcodes.push(it.itemBarcode));
        }
      });

      // Jika ada sisa baris yang belum selesai dan opsi sendRemainingToDraft aktif
      if (sendRemainingToDraft) {
        const remaining = reviewRows.filter((r) => !rowsToImport.some((imp) => imp.tempId === r.tempId));
        if (remaining.length > 0) {
          const currentDrafts = libraryStore.getDraftBooks();
          const newDrafts: DraftBook[] = remaining.map((rem) => ({
            id: `draft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
            isbn: rem.isbn,
            title: rem.title || 'Buku Draf Belum Berjudul',
            author: rem.author,
            publisher: rem.publisher,
            publicationYear: rem.year,
            categoryId: rem.categoryId,
            shelfLocation: rem.shelfLocation,
            shelfCode: rem.shelfCode,
            classification: rem.classification,
            authorCode: rem.authorCode,
            titleCode: rem.titleCode,
            copiesCount: rem.copiesCount,
            statusDicap: rem.statusDicap,
            synopsis: rem.synopsis,
            pageCount: rem.pageCount,
            physicalFormat: rem.physicalFormat,
            bookLanguage: rem.bookLanguage,
            source: rem.source,
            priceValue: rem.priceValue,
            missingFields: rem.missingFields,
            createdAt: new Date().toISOString(),
          }));

          libraryStore.saveDraftBooks([...newDrafts, ...currentDrafts]);
          setDraftBooks(libraryStore.getDraftBooks());
        }
      }

      setImportedBarcodes(allNewBarcodes);
      setImportStatus(
        `Sukses memproses ${rowsToImport.length} judul (${allNewBarcodes.length} barcode eksemplar fisik baru)!`
      );
      soundFx.playSuccessChime();
      setIsReviewMode(false);
      setReviewRows([]);

      if (onDataImported) onDataImported();
    } catch (err: any) {
      console.error('Import execution error:', err);
      alert('Terjadi kesalahan saat menyimpan data ke koleksi.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Simpan Semua ke Draf Koleksi
  const handleSaveAllToDraft = () => {
    if (reviewRows.length === 0) return;
    const currentDrafts = libraryStore.getDraftBooks();
    const newDrafts: DraftBook[] = reviewRows.map((rem) => ({
      id: `draft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      isbn: rem.isbn,
      title: rem.title || 'Buku Draf Belum Berjudul',
      author: rem.author,
      publisher: rem.publisher,
      publicationYear: rem.year,
      categoryId: rem.categoryId,
      shelfLocation: rem.shelfLocation,
      shelfCode: rem.shelfCode,
      classification: rem.classification,
      authorCode: rem.authorCode,
      titleCode: rem.titleCode,
      copiesCount: rem.copiesCount,
      statusDicap: rem.statusDicap,
      synopsis: rem.synopsis,
      pageCount: rem.pageCount,
      physicalFormat: rem.physicalFormat,
      bookLanguage: rem.bookLanguage,
      source: rem.source,
      priceValue: rem.priceValue,
      missingFields: rem.missingFields,
      createdAt: new Date().toISOString(),
    }));

    libraryStore.saveDraftBooks([...newDrafts, ...currentDrafts]);
    setDraftBooks(libraryStore.getDraftBooks());
    soundFx.playSuccessChime();
    alert(`✓ Berhasil menyimpan ${newDrafts.length} buku ke Draf Koleksi! Anda dapat melengkapinya kapan saja.`);
    setIsReviewMode(false);
    setReviewRows([]);
    setActiveTab('DRAFTS');
  };

  // 3. Export Comprehensive 5-Sheet Excel Backup
  const handleExportFullReport = () => {
    setIsProcessing(true);
    const wb = libraryStore.generate5SheetExcelWorkbook();
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Laporan_Lengkap_Perpus_SBTH_TK_${dateStr}.xlsx`);
    setIsProcessing(false);
    soundFx.playSuccessChime();
  };

  // 4. Export Migration Template (Format Pindah Rak & Kategori untuk Semua Buku Aktif)
  const handleExportMigrationTemplate = () => {
    setIsProcessing(true);
    const wb = libraryStore.generateMigrationExcelWorkbook();
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Format_Pindah_Rak_Kategori_SBTH_${dateStr}.xlsx`);
    setIsProcessing(false);
    soundFx.playSuccessChime();
  };

  // Publish a single draft
  const handlePublishDraft = (draftId: string) => {
    const res = libraryStore.publishDraftBook(draftId);
    if (res) {
      soundFx.playSuccessChime();
      setDraftBooks(libraryStore.getDraftBooks());
      if (onDataImported) onDataImported();
      alert(`✓ Buku "${res.book.title}" berhasil diterbitkan ke koleksi aktif!`);
    } else {
      alert('Gagal menerbitkan draf. Pastikan judul buku telah diisi.');
    }
  };

  // Delete a draft
  const handleDeleteDraft = (draftId: string) => {
    if (confirm('Hapus draf buku ini?')) {
      libraryStore.removeDraftBook(draftId);
      setDraftBooks(libraryStore.getDraftBooks());
      soundFx.playScanBeep();
    }
  };

  const readyCount = reviewRows.filter((r) => r.isComplete).length;
  const incompleteCount = reviewRows.length - readyCount;

  const filteredReviewRows = reviewRows.filter((r) => {
    if (reviewFilter === 'READY') return r.isComplete;
    if (reviewFilter === 'INCOMPLETE') return !r.isComplete;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-5 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                Modul Ekspor & Impor Excel (.xlsx)
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  Sinkronisasi Rak & Kategori
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transisi Koleksi Lama, Pindah Rak Buku Massal, & Penanganan Draf Data Kurang Lengkap
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2 gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('IMPORT');
              setIsReviewMode(false);
            }}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'IMPORT'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Upload className="h-4 w-4" />
            1. Impor & Transisi Excel
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('EXPORT')}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'EXPORT'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Download className="h-4 w-4" />
            2. Ekspor Laporan & Format Transisi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('DRAFTS')}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'DRAFTS'
                ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <BookmarkCheck className="h-4 w-4" />
            3. Draf Koleksi ({draftBooks.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {activeTab === 'IMPORT' && (
            <div className="space-y-5">
              {!isReviewMode ? (
                <>
                  {/* Step 1: Template Download & Guidance */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Download className="h-4 w-4 text-emerald-600" />
                        Langkah 1: Unduh Format Master Template Excel SBTH TK
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Lengkap 2-Sheet (Data Buku & Panduan Pengisian) untuk ISBN, Judul, Kategori, Rak, 4 Baris Punggung, dan Eksemplar.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-600 shadow-xs shrink-0 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Unduh Template (.xlsx)
                    </button>
                  </div>

                  {/* Step 2: Upload File Box */}
                  <div className="rounded-3xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20 p-8 text-center flex flex-col items-center justify-center relative hover:border-emerald-500 transition">
                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileUpload}
                      disabled={isProcessing}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 mb-3">
                      <Upload className="h-7 w-7" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Langkah 2: Tarik & Letakkan File Excel Di Sini
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      Pilih file (.xlsx / .csv). Jika ada data kurang lengkap (misal sinopsis kosong), Anda bisa mengeditnya langsung di pratinjau atau memindahkannya ke draf.
                    </p>

                    {isProcessing && (
                      <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{importStatus}</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* INTERACTIVE REVIEW & INLINE VALIDATION SCREEN */
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base">📋</span>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          Pratinjau & Validasi Data Impor ({reviewRows.length} Baris Terbaca)
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Anda dapat melengkapi judul, pengarang, kategori, atau rak langsung di tabel bawah sebelum disimpan.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{readyCount} Lengkap</span>
                      </span>
                      {incompleteCount > 0 && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>{incompleteCount} Perlu Dilengkapi / Draf</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Filter View Toggle */}
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setReviewFilter('ALL')}
                      className={`px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                        reviewFilter === 'ALL'
                          ? 'bg-slate-800 text-white border-slate-800 dark:bg-slate-200 dark:text-slate-900'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      Semua ({reviewRows.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewFilter('READY')}
                      className={`px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                        reviewFilter === 'READY'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      Siap Diimpor ({readyCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewFilter('INCOMPLETE')}
                      className={`px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                        reviewFilter === 'INCOMPLETE'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      Kurang Lengkap ({incompleteCount})
                    </button>
                  </div>

                  {/* Table with Inline Editing */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="py-2.5 px-3 w-10">No</th>
                          <th className="py-2.5 px-3 min-w-[200px]">Judul Buku</th>
                          <th className="py-2.5 px-3 min-w-[140px]">Pengarang (Cutter)</th>
                          <th className="py-2.5 px-3 min-w-[130px]">Kategori & DDC</th>
                          <th className="py-2.5 px-3 min-w-[150px]">Lokasi Rak Buku</th>
                          <th className="py-2.5 px-3 min-w-[160px]">Sinopsis Singkat</th>
                          <th className="py-2.5 px-3 w-20 text-center">Eksemplar</th>
                          <th className="py-2.5 px-3 min-w-[130px]">Status & Punggung</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredReviewRows.map((row, idx) => (
                          <tr
                            key={row.tempId}
                            className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition ${
                              !row.isComplete ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                            }`}
                          >
                            <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                            
                            {/* Judul Buku */}
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={row.title}
                                onChange={(e) => handleUpdateReviewCell(row.tempId, 'title', e.target.value)}
                                placeholder="Judul Buku Wajib Diisi..."
                                className={`w-full px-2 py-1 rounded-lg border text-xs font-semibold outline-hidden ${
                                  !row.title.trim()
                                    ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/30 text-rose-700'
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
                                }`}
                              />
                              {row.isbn && (
                                <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                                  ISBN: {row.isbn}
                                </span>
                              )}
                            </td>

                            {/* Pengarang */}
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={row.author}
                                onChange={(e) => handleUpdateReviewCell(row.tempId, 'author', e.target.value)}
                                placeholder="Nama Pengarang..."
                                className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-hidden"
                              />
                              <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
                                Kode: <strong>{row.authorCode}</strong>
                              </span>
                            </td>

                            {/* Kategori & DDC */}
                            <td className="py-2 px-3">
                              <select
                                value={row.categoryId}
                                onChange={(e) => handleUpdateReviewCell(row.tempId, 'categoryId', e.target.value)}
                                className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold outline-hidden"
                              >
                                {CATEGORIES.map((cat) => (
                                  <option key={cat.id} value={cat.id}>
                                    {cat.shortName}
                                  </option>
                                ))}
                              </select>
                              <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
                                DDC: <strong>{row.classification}</strong>
                              </span>
                            </td>

                            {/* Lokasi Rak Buku */}
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={row.shelfLocation}
                                onChange={(e) => handleUpdateReviewCell(row.tempId, 'shelfLocation', e.target.value)}
                                placeholder="Posisi Rak..."
                                className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-hidden"
                              />
                            </td>

                            {/* Sinopsis Singkat */}
                            <td className="py-2 px-3">
                              <textarea
                                rows={2}
                                value={row.synopsis}
                                onChange={(e) => handleUpdateReviewCell(row.tempId, 'synopsis', e.target.value)}
                                placeholder="Sinopsis singkat buku..."
                                className={`w-full px-2 py-1 rounded-lg border text-xs outline-hidden resize-none ${
                                  !row.synopsis.trim()
                                    ? 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 text-slate-700'
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
                                }`}
                              />
                            </td>

                            {/* Jumlah Eksemplar */}
                            <td className="py-2 px-3 text-center">
                              <input
                                type="number"
                                min={1}
                                max={50}
                                value={row.copiesCount}
                                onChange={(e) =>
                                  handleUpdateReviewCell(
                                    row.tempId,
                                    'copiesCount',
                                    parseInt(e.target.value, 10) || 1
                                  )
                                }
                                className="w-14 px-1 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-bold text-xs"
                              />
                            </td>

                            {/* Status & Mini Spine Preview */}
                            <td className="py-2 px-3">
                              {row.isComplete ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-700 mb-1">
                                  <Check className="h-3 w-3" />
                                  Siap Impor
                                </span>
                              ) : (
                                <div className="space-y-0.5 mb-1">
                                  {row.missingFields.map((m, mIdx) => (
                                    <span
                                      key={mIdx}
                                      className="inline-block text-[9px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-700"
                                    >
                                      {m}
                                    </span>
                                  ))}
                                </div>
                              )}

                              <div className="flex items-center gap-1 font-mono text-[9px] bg-slate-100 dark:bg-slate-800 p-1 rounded border border-slate-200 dark:border-slate-700">
                                <span className="text-amber-600 font-bold">{row.shelfCode}</span>
                                <span>/</span>
                                <span>{row.classification}</span>
                                <span>/</span>
                                <span className="text-blue-600 font-bold">{row.authorCode}</span>
                                <span>/</span>
                                <span className="text-rose-600 font-bold">{row.titleCode}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Action Buttons for Review */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsReviewMode(false);
                        setReviewRows([]);
                      }}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
                    >
                      Batal / Ganti File
                    </button>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSaveAllToDraft}
                        className="px-3.5 py-2.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <BookmarkCheck className="h-4 w-4" />
                        Simpan Semua ke Draf ({reviewRows.length})
                      </button>

                      {readyCount > 0 && incompleteCount > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const readyRows = reviewRows.filter((r) => r.isComplete);
                            executeImportRows(readyRows, true);
                          }}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Impor yang Siap Saja ({readyCount}) & Sisa ke Draf ({incompleteCount})
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (
                            incompleteCount > 0 &&
                            !confirm(
                              `Ada ${incompleteCount} buku yang belum lengkap (misal sinopsis atau pengarang kosong). Tetap paksa impor semua dengan nilai default perpustakaan SBTH?`
                            )
                          ) {
                            return;
                          }
                          executeImportRows(reviewRows, false);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/30 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Sparkles className="h-4 w-4" />
                        Paksa Impor Semua ({reviewRows.length})
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Status and Batch Print Trigger */}
              {importedBarcodes.length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>{importStatus}</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Semua eksemplar fisik telah diterbitkan dan tersinkronisasi dengan kode rak & DDC. Anda dapat langsung mencetak seluruh stiker punggung & barcode!
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenLabelPrinter) {
                        onOpenLabelPrinter(importedBarcodes);
                      }
                      onClose();
                    }}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/30 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Printer className="h-4 w-4" />
                    Cetak Semua Barcode dari Batch Impor Ini ({importedBarcodes.length} Stiker)
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'EXPORT' && (
            <div className="space-y-5">
              {/* Card 1: Format Transisi & Pindah Kategori / Rak */}
              <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                      Ekspor Format Transisi / Pindah Rak & Kategori (Semua Koleksi Aktif)
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                      Mengekspor seluruh koleksi buku aktif lengkap dengan posisi rak dan 4-baris kode punggung saat ini ke format template impor.
                      Pustakawan dapat mengedit kolom <strong>Kategori</strong> atau <strong>Posisi Rak</strong> di Excel lalu mengunggahnya kembali untuk memindahkan rak secara massal tanpa merubah riwayat pinjaman!
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExportMigrationTemplate}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  Unduh Excel Transisi & Pindah Rak (.xlsx)
                </button>
              </div>

              {/* Card 2: Laporan 5-Sheet Lengkap Yayasan */}
              <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Download className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200">
                      Ekspor Laporan Master 5-Sheet Standar Yayasan SBTH TK
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                      Rekap bulanan, Master Katalog, Inventaris Fisik (Barcode), Sirkulasi Pinjaman, dan Data Anggota Siswa & Guru.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExportFullReport}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  Unduh Laporan Perpustakaan Lengkap 5-Sheet (.xlsx)
                </button>
              </div>
            </div>
          )}

          {activeTab === 'DRAFTS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2">
                  <span className="text-base">📑</span>
                  <div>
                    <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Draf Koleksi Buku Belum Selesai ({draftBooks.length} Draf Tersimpan)
                    </h3>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">
                      Buku dari impor Excel yang memiliki kolom kosong disimpan di sini agar tidak hilang. Anda bisa melengkapinya dan menerbitkannya kapan saja.
                    </p>
                  </div>
                </div>

                {draftBooks.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Terbitkan semua ${draftBooks.length} draf ke koleksi perpustakaan?`)) {
                        draftBooks.forEach((d) => libraryStore.publishDraftBook(d.id));
                        setDraftBooks(libraryStore.getDraftBooks());
                        soundFx.playSuccessChime();
                        if (onDataImported) onDataImported();
                        alert('✓ Seluruh draf buku berhasil diterbitkan ke katalog perpustakaan!');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition cursor-pointer shrink-0"
                  >
                    Terbitkan Semua Draf
                  </button>
                )}
              </div>

              {draftBooks.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Tidak Ada Draf Tertunda
                  </p>
                  <p className="text-xs">
                    Semua buku dari impor Excel telah berhasil masuk ke koleksi aktif perpustakaan!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {draftBooks.map((draft) => (
                    <div
                      key={draft.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-amber-400 transition"
                    >
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                            {draft.title || 'Buku Tanpa Judul'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                            Draf
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Pengarang: <strong>{draft.author || '-'}</strong> • Kategori: <strong>{draft.categoryId || 'Dongeng'}</strong> • Rak: <strong>{draft.shelfLocation || '-'}</strong> • Jumlah: <strong>{draft.copiesCount || 1} buku</strong>
                        </p>
                        {draft.missingFields && draft.missingFields.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {draft.missingFields.map((mf, mfIdx) => (
                              <span
                                key={mfIdx}
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950 text-rose-600 border border-rose-200 dark:border-rose-800"
                              >
                                ⚠️ {mf}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handlePublishDraft(draft.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Terbitkan ke Koleksi</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDraft(draft.id)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                          title="Hapus Draf"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
