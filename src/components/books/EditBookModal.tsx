'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Save,
  Trash2,
  Upload,
  Image as ImageIcon,
  BookOpen,
  Layers,
  Wrench,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Barcode,
  Tag,
  DollarSign,
  HeartHandshake,
  MapPin,
  RefreshCw,
  Clock,
  Calendar,
} from 'lucide-react';
import { Book, BookItem, CategoryId, AcquisitionSource, AgeGroup, BookStatus } from '@/types';
import {
  CATEGORIES,
  PHYSICAL_FORMAT_OPTIONS,
  getSbthSpineCode,
  formatDateTimeIndo,
  formatDateDDMMYYYY,
  parseShelfLocation,
  combineShelfLocation,
  DEFAULT_SHELF_ROWS,
} from '@/lib/constants';
import { libraryStore } from '@/lib/storage';
import { soundFx } from '@/lib/sound';
import { SmartBookCover } from '@/components/common/SmartBookCover';

interface EditBookModalProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const EditBookModal: React.FC<EditBookModalProps> = ({
  book,
  isOpen,
  onClose,
  onSaved,
}) => {
  // Form states
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [publisher, setPublisher] = useState(book.publisher);
  const [publicationYear, setPublicationYear] = useState(String(book.publicationYear || '2024'));
  const [pageCount, setPageCount] = useState<number | ''>(
    typeof book.pageCount === 'number' ? book.pageCount : ''
  );
  const [bookLanguage, setBookLanguage] = useState<string>(book.bookLanguage || 'id');
  const [physicalFormat, setPhysicalFormat] = useState<string>(book.physicalFormat || 'Cerita Bergambar');

  // Safe Deletion state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('Salah input data');
  const [deletePin, setDeletePin] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [categoryId, setCategoryId] = useState<CategoryId>(book.categoryId);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(book.ageGroup || 'TK_A');
  const [synopsis, setSynopsis] = useState(book.synopsis || '');
  const [shelfLocation, setShelfLocation] = useState(book.shelfLocation || '');
  const isShelfRowEnabled = libraryStore.isShelfRowFeatureEnabled();
  const shelves = libraryStore.getShelves();
  const parsedShelf = parseShelfLocation(shelfLocation);
  const [shelfCode, setShelfCode] = useState(book.shelfCode || '');
  const [classification, setClassification] = useState(book.classification || '');
  const [authorCode, setAuthorCode] = useState(book.authorCode || '');
  const [titleCode, setTitleCode] = useState(book.titleCode || '');
  const [acquisitionSource, setAcquisitionSource] = useState<AcquisitionSource>(
    book.acquisitionSource || 'BELI_SEKOLAH'
  );
  const [priceValue, setPriceValue] = useState<number>(
    typeof book.priceValue === 'number' ? book.priceValue : 45000
  );
  const [donorName, setDonorName] = useState(book.donorName || '');

  // Cover image states
  const [coverImage, setCoverImage] = useState(book.coverImage || '');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSearchingCover, setIsSearchingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active section tab: 'INFO' | 'COVER' | 'COPIES'
  const [activeSection, setActiveSection] = useState<'INFO' | 'COVER' | 'COPIES'>('INFO');

  // Copies items
  const [items, setItems] = useState<BookItem[]>(libraryStore.getItemsForBook(book.id));
  const [isAddingCopy, setIsAddingCopy] = useState(false);
  const [newCopyShelf, setNewCopyShelf] = useState(book.shelfLocation || 'Rak A - Baris 1');
  const [newCopyPrice, setNewCopyPrice] = useState(priceValue);

  const handleAutoFetchCover = async () => {
    const cleanIsbn = (book.isbn || '').replace(/[-\s]/g, '').trim();
    const hasValidIsbn = /^\d{10,13}$/.test(cleanIsbn);
    const q = (hasValidIsbn ? cleanIsbn : title).trim();
    if (!q && !cleanIsbn) {
      alert('Ketik judul atau ISBN terlebih dahulu.');
      return;
    }
    setIsSearchingCover(true);
    try {
      const params = new URLSearchParams();
      params.set('coverQuery', q || cleanIsbn);
      if (cleanIsbn) params.set('isbn', cleanIsbn);
      if (title) params.set('title', title);
      const res = await fetch(`/api/isbn-lookup?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.cover) {
          setCoverImage(json.cover);
          soundFx.playSuccessChime();
        } else {
          alert('Tidak ditemukan gambar sampul di Google Books.');
        }
      }
    } catch {
      alert('Gagal mencari gambar sampul. Periksa koneksi internet.');
    } finally {
      setIsSearchingCover(false);
    }
  };

  const handleSyncSpineCodes = () => {
    const spine = getSbthSpineCode(title, author, categoryId);
    setShelfCode(spine.shelfCode);
    setClassification(spine.ddc);
    setAuthorCode(spine.authorCode);
    setTitleCode(spine.titleCode);
    soundFx.playScanBeep();
  };

  if (!isOpen) return null;

  // Client-Side Canvas Image Compression (Resize to max 400x560, JPEG 0.75 ~30-40KB)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 560;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
          setCoverImage(compressedDataUrl);
          soundFx.playSuccessChime();
        }
        setIsCompressing(false);
      };
      img.onerror = () => {
        alert('Gagal memproses gambar. Silakan gunakan format JPG atau PNG.');
        setIsCompressing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Save Book Metadata Changes
  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Judul buku wajib diisi.');
      return;
    }

    libraryStore.updateBook(book.id, {
      title: title.trim(),
      author: author.trim() || 'Tim SBTH Kids',
      publisher: publisher.trim() || 'SBTH Press',
      publicationYear: publicationYear.trim() || '2024',
      categoryId,
      ageGroup,
      pageCount: typeof pageCount === 'number' && pageCount > 0 ? pageCount : undefined,
      bookLanguage,
      physicalFormat,
      synopsis: synopsis.trim(),
      shelfLocation: shelfLocation.trim(),
      shelfCode: shelfCode.trim() || undefined,
      classification: classification.trim() || undefined,
      authorCode: authorCode.trim() || undefined,
      titleCode: titleCode.trim() || undefined,
      coverImage: coverImage.trim(),
      acquisitionSource,
      priceValue: Number(priceValue) || 0,
      donorName: acquisitionSource === 'SUMBANGAN_ORTU' ? donorName.trim() : undefined,
    });

    soundFx.playSuccessChime();
    onSaved();
    onClose();
  };

  // Toggle labelPrinted on item
  const handleToggleItemLabel = (item: BookItem) => {
    const updated = libraryStore.updateBookItem(item.id, {
      labelPrinted: !item.labelPrinted,
    });
    if (updated) {
      setItems(libraryStore.getItemsForBook(book.id));
      soundFx.playScanBeep();
    }
  };

  // Update item barcode
  const handleUpdateItemBarcode = (item: BookItem, newBarcode: string) => {
    const clean = newBarcode.trim().toUpperCase();
    if (!clean) return;
    const updated = libraryStore.updateBookItem(item.id, { itemBarcode: clean });
    if (updated) {
      setItems(libraryStore.getItemsForBook(book.id));
    }
  };

  // Update item shelf
  const handleUpdateItemShelf = (item: BookItem, newShelf: string) => {
    const updated = libraryStore.updateBookItem(item.id, { shelfLocation: newShelf.trim() });
    if (updated) {
      setItems(libraryStore.getItemsForBook(book.id));
    }
  };

  // Replace damaged item with new book
  const handleReplaceItem = (item: BookItem) => {
    const confirmReplace = confirm(
      `Konfirmasi penggantian buku baru untuk eksemplar [${item.itemBarcode}]?\n\nStatus akan dikembalikan menjadi 'TERSEDIA' dengan kode barcode yang sama, dan riwayat penggantian akan dicatat di inventaris.`
    );
    if (!confirmReplace) return;

    const replaced = libraryStore.replaceDamagedItemWithNew(
      item.id,
      'Telah diganti dengan buku baru kondisi prima (barcode sama)'
    );
    if (replaced) {
      soundFx.playSuccessChime();
      setItems(libraryStore.getItemsForBook(book.id));
      alert(`Eksemplar [${item.itemBarcode}] berhasil diganti dengan buku baru dan kini berstatus TERSEDIA.`);
    }
  };

  // Safe Deletion Handler for Wrong Input
  const handleDeleteBook = (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError('');
    const cleanPin = deletePin.trim();
    if (cleanPin !== 'sbth2026' && cleanPin !== '1234') {
      const isLibrarian = libraryStore.getLibrarians().some((l) => l.pin === cleanPin);
      if (!isLibrarian) {
        setDeleteError('PIN otorisasi Pustakawan/Admin belum sesuai. Coba 1234 atau sbth2026.');
        soundFx.playErrorBeep();
        return;
      }
    }

    const currentLib = libraryStore.getCurrentLibrarian();
    const res = libraryStore.deleteBook(book.id, deleteReason || 'Salah input judul/ISBN', currentLib?.name);
    if (!res.success) {
      setDeleteError(res.message || 'Gagal menghapus buku.');
      soundFx.playErrorBeep();
      return;
    }

    soundFx.playSuccessChime();
    alert(`✓ Buku "${book.title}" berhasil dihapus dari sistem.`);
    setIsDeleteModalOpen(false);
    onSaved();
    onClose();
  };

  // Add 1 New Copy directly from this modal
  const handleAddNewCopy = () => {
    const added = libraryStore.addCopiesToBook(
      book.id,
      1,
      acquisitionSource,
      acquisitionSource === 'SUMBANGAN_ORTU' ? donorName : undefined,
      newCopyPrice
    );
    if (added.length > 0) {
      if (newCopyShelf) {
        libraryStore.updateBookItem(added[0].id, {
          shelfLocation: newCopyShelf,
          labelPrinted: false, // Baru ditambahkan, belum ditempel
        });
      }
      setItems(libraryStore.getItemsForBook(book.id));
      setIsAddingCopy(false);
      soundFx.playSuccessChime();
    }
  };

  const selectedCat = CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-surface border border-border shadow-2xl my-6 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-border p-5 bg-surface-2/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold shadow-xs">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text truncate max-w-[280px] sm:max-w-md">
                Edit: {book.title}
              </h2>
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-text-muted mt-0.5">
                <span>ISBN: {book.isbn || '-'}</span>
                <span>•</span>
                <span>{items.length} Eksemplar Fisik</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  <Clock className="h-3 w-3" />
                  <span>Diinput: {formatDateTimeIndo(book.createdAt)}</span>
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-text-muted hover:text-text hover:bg-surface transition"
            title="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-border bg-surface px-6 gap-6 text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setActiveSection('INFO')}
            className={`py-3 flex items-center gap-2 border-b-2 transition ${
              activeSection === 'INFO'
                ? 'border-amber-500 text-amber-500 font-bold'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Data Buku & Nilai Aset</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('COVER')}
            className={`py-3 flex items-center gap-2 border-b-2 transition ${
              activeSection === 'COVER'
                ? 'border-amber-500 text-amber-500 font-bold'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Gambar Sampul (Auto-Kompres)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('COPIES')}
            className={`py-3 flex items-center gap-2 border-b-2 transition ${
              activeSection === 'COPIES'
                ? 'border-amber-500 text-amber-500 font-bold'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Kelola Eksemplar & Posisi Rak ({items.length})</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-text">
          {/* TAB 1: DATA BUKU & NILAI ASET */}
          {activeSection === 'INFO' && (
            <form id="edit-book-form" onSubmit={handleSaveBook} className="space-y-4 text-xs">
              {/* Tanggal & Waktu Input ke Koleksi Perpustakaan */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-2xs font-bold">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold text-text text-xs block">
                      Waktu & Tanggal Input Buku ke Koleksi Perpustakaan:
                    </span>
                    <span className="text-text-muted text-[11px]">
                      Tercatat saat buku pertama kali didaftarkan oleh pustakawan ke sistem
                    </span>
                  </div>
                </div>
                <div className="font-mono font-extrabold text-xs text-amber-500 bg-surface px-3 py-1.5 rounded-xl border border-border w-fit shrink-0 flex items-center gap-1.5 shadow-2xs">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatDateTimeIndo(book.createdAt)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-text block mb-1">
                    Judul Buku Cerita <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-2 px-3.5 py-2 text-xs font-semibold text-text focus:border-amber-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Pengarang / Ilustrator:
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-2 px-3.5 py-2 text-xs text-text focus:border-amber-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text block mb-1">Penerbit:</label>
                  <input
                    type="text"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-2 px-3.5 py-2 text-xs text-text focus:border-amber-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text block mb-1">Tahun Terbit:</label>
                  <input
                    type="text"
                    value={publicationYear}
                    onChange={(e) => setPublicationYear(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-2 px-3.5 py-2 text-xs text-text focus:border-amber-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Jumlah Halaman <span className="text-[10px] text-text-muted font-normal">(Boleh kosong)</span>:
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={pageCount}
                    onChange={(e) => setPageCount(e.target.value ? parseInt(e.target.value, 10) : '')}
                    placeholder="Contoh: 32"
                    className="w-full rounded-xl border border-border bg-surface-2 px-3.5 py-2 text-xs text-text focus:border-amber-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text block mb-1">Bahasa Buku:</label>
                  <select
                    value={bookLanguage}
                    onChange={(e) => setBookLanguage(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-2 px-3.5 py-2 text-xs text-text focus:border-amber-500 outline-hidden"
                  >
                    <option value="id">🇮🇩 Indonesia</option>
                    <option value="bilingual">🌐 Bilingual (ID-EN)</option>
                    <option value="en">🇬🇧 English</option>
                    <option value="zh">🇨🇳 Mandarin</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text block mb-1">Format Fisik:</label>
                  <select
                    value={physicalFormat}
                    onChange={(e) => setPhysicalFormat(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-2 px-3.5 py-2 text-xs text-text focus:border-amber-500 outline-hidden"
                  >
                    {PHYSICAL_FORMAT_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.icon} {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text block mb-1">Kategori Rak:</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-2 px-3.5 py-2 text-xs text-text focus:border-amber-500 outline-hidden"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.shelfLocation})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Kelompok Usia Pembaca:
                  </label>
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-surface-2 px-3.5 py-2 text-xs text-text focus:border-amber-500 outline-hidden"
                  >
                    <option value="PLAYGROUP">Playgroup / Toddler (2-3 Tahun)</option>
                    <option value="TK_A">TK-A (4-5 Tahun)</option>
                    <option value="TK_B">TK-B (5-6 Tahun)</option>
                    <option value="SEMUA_UMUR">Semua Tingkat Usia TK</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text flex items-center justify-between">
                    <span>Posisi Rak Default di Sistem:</span>
                    <span className="text-[10px] text-amber-500 font-normal">
                      Fitur Baris: {isShelfRowEnabled ? 'ON' : 'OFF'}
                    </span>
                  </label>
                  <div className={`grid grid-cols-1 ${isShelfRowEnabled ? 'sm:grid-cols-2' : ''} gap-2`}>
                    <div>
                      <select
                        value={shelves.some((s) => s.name === parsedShelf.shelfName) ? parsedShelf.shelfName : ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setShelfLocation(combineShelfLocation(val, parsedShelf.rowName, isShelfRowEnabled));
                        }}
                        className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs text-text focus:border-amber-500 outline-hidden font-semibold"
                      >
                        <option value="">-- Pilih Rak Tersedia --</option>
                        {shelves.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name} ({s.code})
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={parsedShelf.shelfName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setShelfLocation(combineShelfLocation(val, parsedShelf.rowName, isShelfRowEnabled));
                        }}
                        placeholder="Atau ketik nama rak..."
                        className="w-full mt-1.5 rounded-xl border border-border bg-surface-2 px-3 py-1.5 text-xs text-text focus:border-amber-500 outline-hidden"
                      />
                    </div>

                    {isShelfRowEnabled && (
                      <div>
                        <select
                          value={parsedShelf.rowName || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setShelfLocation(combineShelfLocation(parsedShelf.shelfName || 'Rak Utama', val, true));
                          }}
                          className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs text-sky-600 dark:text-sky-400 font-semibold focus:border-amber-500 outline-hidden"
                        >
                          <option value="">- Tanpa Baris -</option>
                          {DEFAULT_SHELF_ROWS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                          {parsedShelf.rowName && !DEFAULT_SHELF_ROWS.includes(parsedShelf.rowName) && (
                            <option value={parsedShelf.rowName}>
                              {parsedShelf.rowName}
                            </option>
                          )}
                        </select>
                        <span className="text-[10px] text-text-muted mt-1 block">
                          Tingkat/sap rak ({parsedShelf.rowName || 'Tanpa Baris'})
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-text-muted block">
                    {shelfLocation ? `Lokasi tersimpan: "${shelfLocation}"` : 'Disimpan di database. Jika buku berpindah rak, tidak perlu cetak ulang label!'}
                  </span>
                </div>
              </div>

              {/* Standar Punggung Buku Fisik SBTH (4 Baris Vertikal) */}
              <div className="rounded-2xl p-4 bg-amber-500/10 border border-amber-500/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📏</span>
                    <div>
                      <span className="font-bold text-text text-xs uppercase tracking-wider block">
                        Standar Label Punggung Buku SBTH (4 Baris Vertikal)
                      </span>
                      <p className="text-[10px] text-text-muted">
                        Kustomisasi 4 baris stiker samping buku agar cocok 100% dengan buku lama di rak perpustakaan
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSyncSpineCodes}
                    className="px-2.5 py-1 rounded-lg bg-surface border border-amber-500/40 hover:bg-amber-500/10 text-[10px] font-bold text-amber-500 flex items-center gap-1 shadow-xs transition self-start sm:self-auto cursor-pointer"
                    title="Otomatis buat ulang kode dari data kategori, pengarang, dan judul saat ini"
                  >
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span>⚡ Sinkronkan Ulang</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-text block mb-1">
                      Baris 1: Kode Rak / Kategori
                    </label>
                    <input
                      type="text"
                      value={shelfCode}
                      onChange={(e) => setShelfCode(e.target.value.toUpperCase())}
                      placeholder="e.g. SR / AG / CR"
                      className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-mono font-bold text-text text-center focus:border-amber-500 outline-hidden uppercase"
                    />
                    <span className="text-[9px] text-text-muted mt-0.5 block text-center">Bawaan: SR</span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-text block mb-1">
                      Baris 2: Nomor DDC
                    </label>
                    <input
                      type="text"
                      value={classification}
                      onChange={(e) => setClassification(e.target.value)}
                      placeholder="e.g. 813 / 220"
                      className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-mono font-bold text-text text-center focus:border-amber-500 outline-hidden"
                    />
                    <span className="text-[9px] text-text-muted mt-0.5 block text-center">e.g. 813, 220, 398.2</span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-text block mb-1">
                      Baris 3: 3 Huruf Pengarang
                    </label>
                    <input
                      type="text"
                      maxLength={3}
                      value={authorCode}
                      onChange={(e) => setAuthorCode(e.target.value.toUpperCase())}
                      placeholder="e.g. JUL / KID"
                      className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-mono font-bold text-text text-center focus:border-amber-500 outline-hidden uppercase"
                    />
                    <span className="text-[9px] text-text-muted mt-0.5 block text-center">3 Huruf Besar</span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-text block mb-1">
                      Baris 4: 1 Huruf Judul
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      value={titleCode}
                      onChange={(e) => setTitleCode(e.target.value)}
                      placeholder="e.g. T / m"
                      className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-mono font-bold text-text text-center focus:border-amber-500 outline-hidden"
                    />
                    <span className="text-[9px] text-text-muted mt-0.5 block text-center">1 Huruf Judul</span>
                  </div>
                </div>
              </div>

              {/* Akuntabilitas Keuangan & Sumber Aset */}
              <div className="rounded-2xl p-4 bg-surface-2/60 border border-border space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  <span className="font-bold text-text text-xs uppercase tracking-wider">
                    Valuasi Aset & Sumber Perolehan Buku
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-text-muted block mb-1">
                      Sumber Perolehan:
                    </label>
                    <select
                      value={acquisitionSource}
                      onChange={(e) => setAcquisitionSource(e.target.value as any)}
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text outline-hidden"
                    >
                      <option value="BELI_SEKOLAH">Beli Kas Sekolah (BOS/Yayasan)</option>
                      <option value="SUMBANGAN_ORTU">Sumbangan / Donasi Orang Tua</option>
                      <option value="HIBAH_DINAS">Hibah Dinas / Perpustakaan Daerah</option>
                      <option value="LAINNYA">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-text-muted block mb-1">
                      Taksiran Nilai Buku (Rp) <span className="text-emerald-500">(Bisa 0)</span>:
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={5000}
                      value={priceValue}
                      onChange={(e) => setPriceValue(Number(e.target.value))}
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs font-mono font-bold text-text outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-text-muted block mb-1">
                      Nama Donatur / Orang Tua Murid:
                    </label>
                    <input
                      type="text"
                      disabled={acquisitionSource !== 'SUMBANGAN_ORTU'}
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder={acquisitionSource === 'SUMBANGAN_ORTU' ? 'Contoh: Ortu Budi (TK-A)' : '-'}
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text outline-hidden disabled:opacity-40"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1">
                  Sinopsis Singkat Cerita Anak:
                </label>
                <textarea
                  rows={3}
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  placeholder="Ringkasan cerita anak untuk menarik minat baca..."
                  className="w-full rounded-xl border border-border bg-surface-2 p-3 text-xs text-text focus:border-amber-500 outline-hidden resize-none"
                />
              </div>
            </form>
          )}

          {/* TAB 2: GAMBAR SAMPUL & KOMPRESI OTOMATIS */}
          {activeSection === 'COVER' && (
            <div className="space-y-4 text-xs">
              <div className="rounded-2xl p-4 bg-surface-2/60 border border-border flex flex-col sm:flex-row items-center gap-5">
                {/* Cover Preview (110x150) */}
                <div className="h-[150px] w-[110px] rounded-xl overflow-hidden shrink-0 border border-border shadow-md bg-slate-900 flex items-center justify-center">
                  <SmartBookCover
                    title={title}
                    author={author}
                    coverUrl={coverImage}
                    categoryId={categoryId}
                    categoryCode={categoryId.replace('cat-', '').toUpperCase()}
                    aspectRatio="h-full w-full"
                  />
                </div>

                <div className="space-y-2.5 flex-1">
                  <h4 className="font-bold text-text text-sm">
                    {coverImage ? 'Sampul Buku Aktif' : 'Belum Ada Gambar Sampul (Tampilan Vektor Otomatis)'}
                  </h4>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Aplikasi mendukung upload dari HP/kamera atau drop screenshot dari internet. Fitur kompresi otomatis kami akan mengecilkan gambar menjadi ~35KB sehingga memori penyimpanan tetap sangat ringan dan cepat!
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isCompressing}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>{isCompressing ? 'Mengompres...' : 'Upload dari HP / Kamera'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSearchingCover}
                      onClick={handleAutoFetchCover}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
                      title="Cari otomatis gambar sampul buku dari Google Books"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{isSearchingCover ? 'Mencari Google...' : 'Auto Cari Sampul Google'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCoverImage('');
                        soundFx.playScanBeep();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-surface border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      title="Hapus tautan gambar dan gunakan desain sampul warna kategori resmi SBTH"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Reset ke Mode Nama & Warna (Hapus Gambar)</span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1">
                  Atau Tempelkan URL Gambar Langsung (HTTPS / CDN):
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://... (Kosongkan untuk otomatis pakai Sampul Tipografi Warna Kategori)"
                    className="flex-1 rounded-xl border border-border bg-surface-2 px-3.5 py-2 text-xs text-text font-mono focus:border-amber-500 outline-hidden"
                  />
                  {coverImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setCoverImage('');
                        soundFx.playScanBeep();
                      }}
                      className="px-3 py-2 rounded-xl bg-rose-500/15 text-rose-500 border border-rose-500/30 text-xs font-bold flex items-center gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Hapus URL</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-text-muted mt-1">
                  💡 Tips: Jika sampul buku dari Google Books menampilkan teks &quot;image not available&quot;, cukup klik tombol <strong className="text-amber-500">Reset ke Mode Nama & Warna</strong> di atas.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: KELOLA EKSEMPLAR FISIK & POSISI RAK */}
          {activeSection === 'COPIES' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-text text-sm">
                    Daftar {items.length} Eksemplar Fisik
                  </h4>
                  <p className="text-[11px] text-text-muted">
                    Setiap eksemplar memiliki kode barcode unik SBTH. Anda dapat mengubah posisi rak dan status cetak label tanpa print ulang stiker.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingCopy(!isAddingCopy)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Barcode className="h-3.5 w-3.5" />
                  <span>+ Tambah Eksemplar</span>
                </button>
              </div>

              {/* Add Copy Inline Form */}
              {isAddingCopy && (
                <div className="rounded-2xl p-4 bg-amber-500/10 border border-amber-500/30 space-y-3 animate-in fade-in">
                  <span className="font-bold text-amber-600 dark:text-amber-400 block text-xs">
                    Tambah 1 Eksemplar Fisik Baru
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-text-muted block mb-1">Posisi Rak:</label>
                      <input
                        type="text"
                        value={newCopyShelf}
                        onChange={(e) => setNewCopyShelf(e.target.value)}
                        placeholder="Contoh: Rak A - Baris 1"
                        className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-text outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-text-muted block mb-1">Nilai Buku (Rp):</label>
                      <input
                        type="number"
                        min={0}
                        step={5000}
                        value={newCopyPrice}
                        onChange={(e) => setNewCopyPrice(Number(e.target.value))}
                        className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-text font-mono outline-hidden"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingCopy(false)}
                      className="px-3 py-1 text-xs font-semibold text-text-muted hover:text-text"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleAddNewCopy}
                      className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                    >
                      Simpan Eksemplar
                    </button>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-2">
                {items.map((item) => {
                  const isDamagedOrLost = item.status === 'DAMAGED' || item.status === 'LOST';

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${
                        isDamagedOrLost
                          ? 'bg-rose-500/5 border-rose-500/30'
                          : 'bg-surface-2/60 border-border'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-text text-xs bg-surface px-2 py-0.5 rounded-md border border-border">
                            {item.itemBarcode}
                          </span>
                          <span className="text-[11px] text-text-muted">
                            Copy #{item.copyNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              item.status === 'AVAILABLE'
                                ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                                : item.status === 'BORROWED'
                                ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                                : item.status === 'IN_REPAIR'
                                ? 'bg-sky-500/15 text-sky-500 border border-sky-500/30'
                                : 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                            }`}
                          >
                            {item.status}
                          </span>

                          {item.isReplaced && (
                            <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-400 border border-purple-500/30 text-[10px] font-bold">
                              Sudah Diganti Baru
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-text-muted flex flex-wrap items-center gap-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-amber-500" />
                            {item.shelfLocation || shelfLocation || 'Rak Belum Diset'}
                          </span>
                          <span>•</span>
                          <span>Rp {(item.priceValue ?? priceValue).toLocaleString('id-ID')}</span>
                          <span>•</span>
                          <span>{item.source === 'SUMBANGAN_ORTU' ? `Donasi: ${item.donorName || 'Ortu'}` : 'Beli Sekolah'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-amber-500" />
                            <span>Tgl Masuk: {formatDateDDMMYYYY(item.acquisitionDate || book.createdAt)}</span>
                          </span>
                        </div>
                      </div>

                      {/* Item Actions */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {/* Toggle Label Affixed Status */}
                        <button
                          type="button"
                          onClick={() => handleToggleItemLabel(item)}
                          className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center gap-1.5 transition ${
                            item.labelPrinted
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
                          }`}
                          title="Klik untuk ubah status tempel label"
                        >
                          <Tag className="h-3 w-3" />
                          <span>{item.labelPrinted ? '✓ Label Ditempel' : '⚠️ Belum Dicetak/Tempel'}</span>
                        </button>

                        {/* Replace Damaged with New Book button */}
                        {isDamagedOrLost && (
                          <button
                            type="button"
                            onClick={() => handleReplaceItem(item)}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[11px] flex items-center gap-1.5 transition active:scale-95 shadow-xs"
                            title="Ganti dengan buku baru (masuk available dengan kode barcode sama)"
                          >
                            <Sparkles className="h-3 w-3" />
                            <span>Ganti Buku Baru</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Footer */}
        <div className="p-4 border-t border-border bg-surface flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-2 transition"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => {
                setDeleteError('');
                setDeletePin('');
                setIsDeleteModalOpen(true);
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 border border-rose-500/25 flex items-center gap-1.5 transition cursor-pointer"
              title="Batalkan atau hapus buku jika salah input judul / salah scan ISBN"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Hapus Buku (Salah Input)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveBook}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Simpan Perubahan Buku</span>
          </button>
        </div>
      </div>

      {/* MODAL DIALOG AMAN: HAPUS BUKU KARENA SALAH INPUT */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-surface border border-rose-500/40 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="h-10 w-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text">Hapus Buku (Salah Input)</h3>
                <p className="text-[11px] text-text-muted">Proses ini akan menghapus buku & seluruh eksemplarnya</p>
              </div>
            </div>

            <form onSubmit={handleDeleteBook} className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-2 border border-border">
                <span className="text-[11px] text-text-muted block">Buku yang akan dihapus:</span>
                <p className="font-bold text-text mt-0.5">{book.title}</p>
                <span className="font-mono text-[10px] text-text-muted">ISBN: {book.isbn} • {items.length} Eksemplar</span>
              </div>

              <div>
                <label className="font-semibold text-text block mb-1">Alasan Penghapusan / Pembatalan:</label>
                <select
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs text-text outline-hidden"
                >
                  <option value="Salah input judul / salah scan ISBN">Salah input judul / salah scan ISBN</option>
                  <option value="Duplikasi entri katalog buku">Duplikasi entri katalog buku</option>
                  <option value="Buku dibatalkan oleh pihak sekolah">Buku dibatalkan oleh pihak sekolah</option>
                  <option value="Input percobaan / demo data">Input percobaan / demo data</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-text block mb-1">
                  Masukkan PIN Admin / Pustakawan: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Ketik PIN (contoh: 1234 atau sbth2026)"
                  value={deletePin}
                  onChange={(e) => setDeletePin(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs font-mono text-text outline-hidden focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {deleteError && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-[11px] font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-text-muted hover:bg-surface-2 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Konfirmasi Hapus Permanen</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
