'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  BookPlus,
  X,
  Sparkles,
  CheckCircle2,
  Copy,
  Printer,
  AlertTriangle,
  Leaf,
  Star,
  BookOpen,
  Heart,
  Loader2,
  ExternalLink,
  RotateCcw,
  Clock,
  Calendar,
} from 'lucide-react';
import { Book, BookItem, CategoryId, AgeGroup, AcquisitionSource, Category } from '@/types';
import {
  CATEGORIES,
  PHYSICAL_FORMAT_OPTIONS,
  getSbthSpineCode,
  deriveAuthorCode,
  deriveTitleCode,
  deriveCategoryDdc,
  deriveShelfCode,
  formatDateTimeIndo,
} from '@/lib/constants';
import { libraryStore } from '@/lib/storage';
import { soundFx } from '@/lib/sound';
import { SmartBookCover } from '@/components/common/SmartBookCover';
import { matchDdcCategory } from '@/lib/eddc';

interface ScanIsbnModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialIsbn?: string;
  onBookAdded?: (book: Book, items: BookItem[]) => void;
  onOpenLabelPrinter?: (barcodes: string[]) => void;
}

export const ScanIsbnModal: React.FC<ScanIsbnModalProps> = ({
  isOpen,
  onClose,
  initialIsbn = '',
  onBookAdded,
  onOpenLabelPrinter,
}) => {
  const [isbnInput, setIsbnInput] = useState<string>('');
  const [searchTitleInput, setSearchTitleInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lookupNotice, setLookupNotice] = useState<{ type: 'success' | 'warning' | 'info'; message: string } | null>(null);
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Existing book detected state
  const [existingBook, setExistingBook] = useState<Book | null>(null);
  const [existingItems, setExistingItems] = useState<BookItem[]>([]);
  const [quickAddCount, setQuickAddCount] = useState<number>(1);

  // New book form state
  const [title, setTitle] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [publisher, setPublisher] = useState<string>('');
  const [publicationYear, setPublicationYear] = useState<string>('2024');
  const [pageCount, setPageCount] = useState<number | ''>('');
  const [bookLanguage, setBookLanguage] = useState<string>('id');
  const [physicalFormat, setPhysicalFormat] = useState<string>('Cerita Bergambar');
  const [categoryId, setCategoryId] = useState<CategoryId>('cat-dongeng');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('TK_A');
  const [synopsis, setSynopsis] = useState<string>('');
  const [coverImage, setCoverImage] = useState<string>('');
  const [isSearchingCover, setIsSearchingCover] = useState<boolean>(false);
  const [copiesCount, setCopiesCount] = useState<number>(1);
  const [source, setSource] = useState<AcquisitionSource>('BELI_SEKOLAH');
  const [donorName, setDonorName] = useState<string>('');
  const [priceValue, setPriceValue] = useState<number>(45000);

  // Standar Punggung Buku SBTH 4-Baris Vertikal
  const [shelfCode, setShelfCode] = useState<string>('SR');
  const [classification, setClassification] = useState<string>('398.2');
  const [authorCode, setAuthorCode] = useState<string>('SBT');
  const [titleCode, setTitleCode] = useState<string>('t');
  const [isSpineManualEdited, setIsSpineManualEdited] = useState<boolean>(false);

  // Success summary state
  const [createdSummary, setCreatedSummary] = useState<{
    book: Book;
    items: BookItem[];
  } | null>(null);

  // Otomatis sinkronkan 4 kode punggung buku saat Judul, Pengarang, atau Kategori berubah
  useEffect(() => {
    if (!isSpineManualEdited) {
      const spine = getSbthSpineCode(title, author, categoryId);
      setShelfCode(spine.shelfCode);
      setClassification(spine.ddc);
      setAuthorCode(spine.authorCode);
      setTitleCode(spine.titleCode);
    }
  }, [title, author, categoryId, isSpineManualEdited]);

  const handleSyncSpineCodesManually = () => {
    const spine = getSbthSpineCode(title, author, categoryId);
    setShelfCode(spine.shelfCode);
    setClassification(spine.ddc);
    setAuthorCode(spine.authorCode);
    setTitleCode(spine.titleCode);
    setIsSpineManualEdited(false);
    soundFx.playScanBeep();
  };

  useEffect(() => {
    if (isOpen) {
      setCategories(libraryStore.getCategories());
      if (initialIsbn) {
        setIsbnInput(initialIsbn);
        handleLookupIsbn(initialIsbn);
      } else {
        resetForm();
      }
    }
  }, [isOpen, initialIsbn]);

  const resetForm = () => {
    setIsbnInput('');
    setSearchTitleInput('');
    setExistingBook(null);
    setExistingItems([]);
    setTitle('');
    setAuthor('');
    setPublisher('');
    setPublicationYear(new Date().getFullYear().toString());
    setPageCount('');
    setBookLanguage('id');
    setPhysicalFormat('Cerita Bergambar');
    setCategoryId('cat-dongeng');
    setAgeGroup('TK_A');
    setSynopsis('');
    setCoverImage('');
    setCopiesCount(1);
    setSource('BELI_SEKOLAH');
    setDonorName('');
    setPriceValue(45000);
    setShelfCode('SR');
    setClassification('398.2');
    setAuthorCode('SBT');
    setTitleCode('t');
    setIsSpineManualEdited(false);
    setCreatedSummary(null);
    setSearchSuggestions([]);
    setCategories(libraryStore.getCategories());
  };

  // Waterfall Lookup: Local DB -> /api/isbn-lookup (Verified Cache, OpenLibrary, Heuristics, Google Books)
  const handleLookupIsbn = async (isbnToLookup: string) => {
    const cleanIsbn = isbnToLookup.replace(/[-\s]/g, '').trim();
    if (!cleanIsbn) {
      setLookupNotice({
        type: 'warning',
        message: 'Silakan masukkan nomor barcode ISBN (10 atau 13 digit) terlebih dahulu.',
      });
      return;
    }

    setIsLoading(true);
    setExistingBook(null);
    setLookupNotice(null);

    // 1. Cek Database Lokal Perpustakaan SBTH
    const localBook = libraryStore.findBookByIsbn(cleanIsbn);
    if (localBook) {
      const items = libraryStore.getItemsForBook(localBook.id);
      setExistingBook(localBook);
      setExistingItems(items);
      setIsLoading(false);
      setLookupNotice({
        type: 'success',
        message: `Buku "${localBook.title}" sudah terdaftar di koleksi SBTH (${items.length} eksemplar). Anda dapat menambah salinan langsung di bawah.`,
      });
      soundFx.playScanBeep();
      return;
    }

    // 2. Fetch ke Server Route /api/isbn-lookup (Bypass Client Quota & Network Issues) dengan Timeout 5 detik
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5500);

      const res = await fetch(`/api/isbn-lookup?isbn=${encodeURIComponent(cleanIsbn)}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          applyBookMetadata({
            title: json.data.title || '',
            author: json.data.author || '',
            publisher: json.data.publisher || '',
            year: json.data.year || '2024',
            synopsis: json.data.synopsis || '',
            cover: json.data.cover || '',
            pageCount: json.data.pageCount,
            bookLanguage: json.data.bookLanguage,
            physicalFormat: json.data.physicalFormat,
          });

          // Kasus 1: Ditemukan Judul Lengkap
          if (json.data.title) {
            setLookupNotice({
              type: 'success',
              message: `✅ Berhasil Ditemukan: "${json.data.title}" (${json.data.source || 'Online'}). Rincian buku telah terisi otomatis!`,
            });
            // Auto-fetch Google Books cover if cover was empty
            if (!json.data.cover) {
              handleAutoFetchCover(cleanIsbn || json.data.title);
            }
          } 
          // Kasus 2: Ditemukan Prefix Penerbit (misal Gramedia/National Geographic) tapi judul spesifik belum terindeks
          else if (json.data.publisher && json.data.publisher !== 'Penerbit Buku Anak') {
            setLookupNotice({
              type: 'warning',
              message: `ℹ️ Prefix ISBN terdaftar atas nama "${json.data.publisher}". Judul spesifik belum terindeks online, silakan lengkapi Judul & Pengarang di formulir bawah.`,
            });
          }
          // Kasus 3: ISBN belum terdaftar di database online
          else {
            setLookupNotice({
              type: 'info',
              message: `⚠️ ISBN ${cleanIsbn} belum terdaftar di database publik online. Jangan khawatir, silakan langsung ketik judul buku di formulir bawah untuk menyimpannya.`,
            });
          }

          setIsLoading(false);
          soundFx.playScanBeep();
          return;
        }
      }
    } catch (e: any) {
      console.warn('ISBN lookup route error / timeout:', e);
      setLookupNotice({
        type: 'info',
        message: `⚠️ Pencarian online ISBN ${cleanIsbn} tidak merespons (timeout). Anda dapat langsung mengetik judul dan pengarang di formulir bawah.`,
      });
    }

    // Selesai (Jika belum ada judul, tetap isi dengan default penerbit / biarkan pustakawan isi)
    setIsLoading(false);
    soundFx.playScanBeep();
  };

  const applyBookMetadata = (meta: {
    title: string;
    author: string;
    publisher: string;
    year: string;
    synopsis: string;
    cover?: string;
    pageCount?: number;
    bookLanguage?: string;
    physicalFormat?: string;
  }) => {
    if (meta.title) setTitle(meta.title);
    if (meta.author) setAuthor(meta.author);
    if (meta.publisher) setPublisher(meta.publisher);
    if (meta.year) setPublicationYear(meta.year);
    if (meta.synopsis) setSynopsis(meta.synopsis);
    if (meta.cover !== undefined) setCoverImage(meta.cover);
    if (meta.pageCount && typeof meta.pageCount === 'number') setPageCount(meta.pageCount);
    if (meta.bookLanguage) setBookLanguage(meta.bookLanguage);
    if (meta.physicalFormat) setPhysicalFormat(meta.physicalFormat);

    // Auto-detect DDC category & classification code based on title, synopsis, publisher, language
    const ddcMatch = matchDdcCategory(
      meta.title,
      meta.synopsis || '',
      meta.publisher || '',
      '',
      meta.bookLanguage || 'id'
    );
    setCategoryId(ddcMatch.categoryId as CategoryId);
    if (!isSpineManualEdited && ddcMatch.ddcCode) {
      setClassification(ddcMatch.ddcCode);
    }
  };

  // Smart Search by Title/Author (menggabungkan katalog lokal SBTH + lookup online)
  const handleSearchByTitle = async () => {
    const q = searchTitleInput.trim();
    if (!q) return;
    setIsLoading(true);
    setLookupNotice(null);
    // Reset existingBook sebelumnya agar hasil pencarian baru menggantikan tampilan bawah secara dinamis
    setExistingBook(null);
    setExistingItems([]);

    // 1. Cek buku di database lokal SBTH
    const qLower = q.toLowerCase();
    const localMatches = libraryStore.getBooks().filter(
      (b) =>
        b.title.toLowerCase().includes(qLower) ||
        b.author.toLowerCase().includes(qLower) ||
        (b.isbn && b.isbn.replace(/[-\s]/g, '').includes(q.replace(/[-\s]/g, '')))
    );

    const localSuggestions = localMatches.map((b) => ({
      ...b,
      isLocal: true,
      source: 'Katalog Perpustakaan SBTH',
      cover: b.coverImage,
    }));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5500);
      const res = await fetch(`/api/isbn-lookup?title=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      let onlineItems: any[] = [];
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.items && json.items.length > 0) {
          // Filter buku online yang sudah ada di lokal agar tidak duplikat
          onlineItems = json.items.filter(
            (oi: any) =>
              !localSuggestions.some(
                (li) => li.title.trim().toLowerCase() === (oi.title || '').trim().toLowerCase()
              )
          );
        }
      }

      const combined = [...localSuggestions, ...onlineItems];
      if (combined.length > 0) {
        setSearchSuggestions(combined);
        setLookupNotice({
          type: 'success',
          message: `Ditemukan ${combined.length} buku untuk "${q}" (${localSuggestions.length} di lokal SBTH, ${onlineItems.length} online). Klik salah satu buku di bawah untuk membuka data autofill.`,
        });
      } else {
        setSearchSuggestions([]);
        setLookupNotice({
          type: 'info',
          message: `Tidak ditemukan buku dengan judul "${q}". Silakan isi formulir di bawah secara manual.`,
        });
      }
    } catch {
      if (localSuggestions.length > 0) {
        setSearchSuggestions(localSuggestions);
        setLookupNotice({
          type: 'success',
          message: `Ditemukan ${localSuggestions.length} buku di katalog lokal SBTH untuk "${q}". Klik untuk melihat detail.`,
        });
      } else {
        setSearchSuggestions([]);
        setLookupNotice({
          type: 'info',
          message: `Koneksi pencarian online tidak merespons. Anda dapat mengetik judul di formulir bawah secara manual.`,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSuggestion = (item: any) => {
    const cleanIsbn = (item.isbn || '').replace(/[-\s]/g, '').trim();

    // 1. Cek apakah buku ini sudah terdaftar di database lokal SBTH
    let localBook: Book | undefined = undefined;
    if (item.isLocal && item.id) {
      localBook = libraryStore.getBooks().find((b) => b.id === item.id);
    } else if (cleanIsbn) {
      localBook = libraryStore.findBookByIsbn(cleanIsbn);
    } else if (item.title) {
      localBook = libraryStore.getBooks().find(
        (b) => b.title.trim().toLowerCase() === item.title.trim().toLowerCase()
      );
    }

    if (localBook) {
      // BUKU SUDAH TERDAFTAR DI SBTH -> Ganti tampilan bawah ke buku ini
      const items = libraryStore.getItemsForBook(localBook.id);
      setExistingBook(localBook);
      setExistingItems(items);
      setIsbnInput(localBook.isbn || '');
      setLookupNotice({
        type: 'success',
        message: `Buku "${localBook.title}" sudah terdaftar di koleksi SBTH (${items.length} eksemplar). Anda dapat menambah salinan langsung di bawah.`,
      });
      soundFx.playScanBeep();
    } else {
      // BUKU BARU -> Bersihkan existingBook dan isi formulir autofill lengkap!
      setExistingBook(null);
      setExistingItems([]);
      if (cleanIsbn) {
        setIsbnInput(cleanIsbn);
      }
      applyBookMetadata({
        title: item.title || '',
        author: item.author || '',
        publisher: item.publisher || '',
        year: item.year || '2024',
        synopsis: item.synopsis || '',
        cover: item.cover || '',
        pageCount: item.pageCount,
        bookLanguage: item.bookLanguage,
        physicalFormat: item.physicalFormat,
      });
      setLookupNotice({
        type: 'success',
        message: `✅ Data buku "${item.title}" berhasil di-autofill! Silakan periksa atau simpan di bawah.`,
      });
      soundFx.playSuccessChime();
    }

    setSearchSuggestions([]);
  };

  const handleAutoFetchCover = async (forcedQuery?: string) => {
    const cleanIsbn = isbnInput.replace(/[-\s]/g, '').trim();
    const hasValidIsbn = /^\d{10,13}$/.test(cleanIsbn);
    // Prioritize ISBN when valid, otherwise title/search input
    const q = (forcedQuery || (hasValidIsbn ? cleanIsbn : (title || searchTitleInput))).trim();
    if (!q && !cleanIsbn) {
      alert('Ketik judul buku atau scan ISBN terlebih dahulu untuk mencari gambar.');
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
        } else if (!forcedQuery) {
          alert('Tidak ditemukan gambar sampul di Google Books. Anda dapat menggunakan sampul resmi bawaan.');
        }
      }
    } catch {
      if (!forcedQuery) alert('Gagal mencari gambar sampul. Periksa koneksi internet.');
    } finally {
      setIsSearchingCover(false);
    }
  };

  // Submit quick copies for existing book
  const handleAddExistingCopies = (count: number) => {
    if (!existingBook) return;
    const newCopies = libraryStore.addCopiesToBook(
      existingBook.id,
      count,
      source,
      source === 'SUMBANGAN_ORTU' ? donorName : undefined,
      priceValue
    );
    soundFx.playSuccessChime();
    setCreatedSummary({
      book: existingBook,
      items: newCopies,
    });
    if (onBookAdded) onBookAdded(existingBook, newCopies);
  };

  // Submit new book creation
  const handleSaveNewBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Judul buku wajib diisi.');
      return;
    }

    const { book, newItems } = libraryStore.addBook(
      {
        isbn: isbnInput.trim() || `LOCAL-${Date.now().toString().slice(-8)}`,
        title: title.trim(),
        author: author.trim() || 'Tim SBTH Kids',
        publisher: publisher.trim() || 'SBTH Press',
        publicationYear: publicationYear || '2024',
        pageCount: typeof pageCount === 'number' && pageCount > 0 ? pageCount : undefined,
        bookLanguage: bookLanguage || 'id',
        physicalFormat: physicalFormat || 'Cerita Bergambar',
        categoryId,
        ageGroup,
        shelfCode: shelfCode.trim() || undefined,
        classification: classification.trim() || undefined,
        authorCode: authorCode.trim() || undefined,
        titleCode: titleCode.trim() || undefined,
        synopsis: synopsis.trim() || 'Buku bacaan anak TK Sekolah Bina Tunas Harapan.',
        coverImage: coverImage.trim(),
      },
      copiesCount,
      source,
      source === 'SUMBANGAN_ORTU' ? donorName : undefined,
      priceValue
    );

    soundFx.playSuccessChime();
    setCreatedSummary({ book, items: newItems });
    if (onBookAdded) onBookAdded(book, newItems);
  };

  if (!isOpen) return null;

  const selectedCat = CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-5 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/30">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Input Buku Baru & Scan ISBN
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Waterfall Lookup: Database Lokal → Google Books API → Auto-Fill Cepat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* STEP 1: SCAN ISBN INPUT / AUTO-FILL TRIGGER */}
          {!createdSummary && (
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200/80 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Search className="h-3.5 w-3.5 text-amber-500" />
                  1. Scan Barcode ISBN Pabrik (13 Digit di Sampul Belakang)
                </label>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  ⚡ USB Scanner Ready
                </span>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={isbnInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setIsbnInput(val);
                      if (existingBook && val.trim().replace(/[-\s]/g, '') !== existingBook.isbn.replace(/[-\s]/g, '')) {
                        setExistingBook(null);
                        setExistingItems([]);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleLookupIsbn(isbnInput);
                      }
                    }}
                    placeholder="Contoh: 9786022497653 (Arahkan alat scanner atau ketik)"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-mono focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-hidden"
                  />
                  {isLoading && (
                    <div className="absolute right-3 top-2.5 text-amber-500 animate-spin">
                      <Loader2 className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleLookupIsbn(isbnInput)}
                  disabled={isLoading || !isbnInput.trim()}
                  className="rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2.5 flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  Auto-Fill
                </button>
              </div>

              {/* Status Notice / Feedback Banner */}
              {lookupNotice && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start justify-between gap-2 border animate-in fade-in ${
                    lookupNotice.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
                      : lookupNotice.type === 'warning'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                      : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {lookupNotice.type === 'success' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : lookupNotice.type === 'warning' ? (
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-relaxed font-medium">{lookupNotice.message}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLookupNotice(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Alternative Title Autocomplete Fallback */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1.5">
                  Buku dongeng lokal tidak punya ISBN? Ketik judul atau pengarang cepat:
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchTitleInput}
                    onChange={(e) => {
                      setSearchTitleInput(e.target.value);
                      if (existingBook) {
                        setExistingBook(null);
                        setExistingItems([]);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearchByTitle();
                      }
                    }}
                    placeholder="Contoh: Kancil Erlangga / Sains Anak Gramedia..."
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900 px-3 py-1.5 text-xs focus:border-blue-500 outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleSearchByTitle}
                    disabled={isLoading || !searchTitleInput.trim()}
                    className="rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs px-3 py-1.5 font-medium transition border border-blue-200 dark:border-blue-800"
                  >
                    Cari Judul
                  </button>
                </div>

                {/* Suggestions List */}
                {searchSuggestions.length > 0 && (
                  <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md max-h-48 overflow-y-auto">
                    {searchSuggestions.map((item, idx) => {
                      const coverImg =
                        item.cover ||
                        item.volumeInfo?.imageLinks?.thumbnail?.replace('http:', 'https:') ||
                        item.volumeInfo?.imageLinks?.smallThumbnail?.replace('http:', 'https:');
                      const titleStr = item.title || item.volumeInfo?.title || 'Judul Buku';
                      const authorStr =
                        item.author ||
                        (Array.isArray(item.volumeInfo?.authors) ? item.volumeInfo.authors.join(', ') : item.volumeInfo?.authors) ||
                        'Penulis tidak diketahui';
                      const publisherStr = item.publisher || item.volumeInfo?.publisher || '';

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectSuggestion(item)}
                          className="w-full text-left p-2.5 hover:bg-amber-50/60 dark:hover:bg-slate-800/80 flex items-center gap-3 transition cursor-pointer border-b last:border-b-0 border-slate-100 dark:border-slate-800"
                        >
                          {coverImg ? (
                            <img
                              src={coverImg}
                              alt=""
                              className="h-10 w-8 object-cover rounded shadow-xs"
                            />
                          ) : (
                            <div className="h-10 w-8 rounded bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[9px] text-slate-400">
                              No Cover
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                {titleStr}
                              </p>
                              {item.isLocal ? (
                                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded border border-emerald-300 dark:border-emerald-700 shrink-0">
                                  Sudah di SBTH
                                </span>
                              ) : (
                                <span className="text-[10px] bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded border border-blue-200 dark:border-blue-800 shrink-0">
                                  Buku Baru
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">
                              {authorStr} {publisherStr ? `• ${publisherStr}` : ''}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CASE A: EXISTING BOOK DETECTED (QUICK ADD COPIES) */}
          {existingBook && !createdSummary && (
            <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 space-y-4 animate-in fade-in">
              <div className="flex items-start gap-4">
                <img
                  src={existingBook.coverImage}
                  alt={existingBook.title}
                  className="h-24 w-18 object-cover rounded-xl shadow-md border border-emerald-200"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Buku Sudah Terdaftar di Perpustakaan SBTH
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setExistingBook(null);
                        setExistingItems([]);
                        setIsbnInput('');
                        setSearchTitleInput('');
                        setLookupNotice({
                          type: 'info',
                          message: 'Pilihan dibersihkan. Anda sekarang dapat mengisi formulir buku baru di bawah.',
                        });
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center gap-1 transition cursor-pointer"
                      title="Bersihkan pilihan buku ini dan buka formulir input buku baru"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Ganti / Input Buku Baru
                    </button>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {existingBook.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {existingBook.author} • {existingBook.publisher} ({existingBook.publicationYear})
                  </p>
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-2">
                    📦 Total Eksemplar Saat Ini: <span className="font-bold underline">{existingItems.length} Buku</span> ({existingItems.filter(i => i.status === 'AVAILABLE').length} Tersedia di Rak)
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-white dark:bg-slate-900 p-4 border border-emerald-200 dark:border-emerald-800/60">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                  Sekolah baru membeli eksemplar tambahan? Pilih jumlah buku baru:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {[1, 2, 3, 5, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleAddExistingCopies(num)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm hover:scale-105 active:scale-95 transition"
                    >
                      +{num} Eksemplar
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-2 italic">
                  Sistem otomatis men-generate barcode berurutan (misal: SBTH-B-00125 s.d. SBTH-B-00129) dan langsung siap cetak label.
                </p>
              </div>
            </div>
          )}

          {/* CASE B: NEW BOOK FORM */}
          {!existingBook && !createdSummary && (
            <form onSubmit={handleSaveNewBook} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Cover Preview & URL */}
                <div className="flex flex-col items-center justify-start space-y-2">
                  <div className="relative h-44 w-32 rounded-2xl overflow-hidden shadow-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-900 flex items-center justify-center group">
                    <SmartBookCover
                      title={title || 'Pratinjau Sampul'}
                      author={author || 'Koleksi SBTH'}
                      coverUrl={coverImage}
                      categoryId={selectedCat.id}
                      categoryCode={selectedCat.id.replace('cat-', '').toUpperCase()}
                      aspectRatio="h-full w-full"
                    />
                  </div>
                  <div className="w-full space-y-1.5">
                    <input
                      type="text"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="URL Foto Sampul (Opsional)"
                      className="w-full text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1 bg-slate-50 dark:bg-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => handleAutoFetchCover()}
                      disabled={isSearchingCover}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
                      title="Cari gambar sampul resmi dari Google Books berdasarkan judul / ISBN"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{isSearchingCover ? 'Mencari Google...' : 'Auto Cari Sampul Google'}</span>
                    </button>
                    {coverImage && (
                      <button
                        type="button"
                        onClick={() => setCoverImage('')}
                        className="w-full text-[10px] text-rose-500 hover:underline cursor-pointer text-center"
                      >
                        Reset ke Sampul Warna Kategori
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 text-center leading-tight">
                    Otomatis dibuatkan sampul buku indah sesuai warna rak jika kosong.
                  </p>
                </div>

                {/* Main Fields */}
                <div className="md:col-span-2 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Judul Buku *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Contoh: Kancil dan Buaya yang Cerdik"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-semibold focus:border-amber-500 outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Pengarang / Penulis
                      </label>
                      <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Contoh: Kak Bambang"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Penerbit
                      </label>
                      <input
                        type="text"
                        value={publisher}
                        onChange={(e) => setPublisher(e.target.value)}
                        placeholder="Contoh: Erlangga for Kids"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Tahun Terbit
                      </label>
                      <input
                        type="text"
                        value={publicationYear}
                        onChange={(e) => setPublicationYear(e.target.value)}
                        placeholder="2024"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Spesifikasi Buku: Halaman, Bahasa, Format */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Halaman <span className="text-[10px] text-slate-400 font-normal">(Boleh kosong)</span>
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={pageCount}
                        onChange={(e) => setPageCount(e.target.value ? parseInt(e.target.value, 10) : '')}
                        placeholder="Contoh: 32"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Bahasa
                      </label>
                      <select
                        value={bookLanguage}
                        onChange={(e) => setBookLanguage(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs outline-hidden"
                      >
                        <option value="id">🇮🇩 Indonesia</option>
                        <option value="bilingual">🌐 Bilingual (ID-EN)</option>
                        <option value="en">🇬🇧 English</option>
                        <option value="zh">🇨🇳 Mandarin</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Format Fisik Buku
                      </label>
                      <select
                        value={physicalFormat}
                        onChange={(e) => setPhysicalFormat(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs outline-hidden"
                      >
                        {PHYSICAL_FORMAT_OPTIONS.map((fmt) => (
                          <option key={fmt.value} value={fmt.value}>
                            {fmt.icon} {fmt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Kategori Visual dengan Warna Solid */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Kategori Punggung Buku (Stiker Warna & Ikon TK)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(categories.length > 0 ? categories : CATEGORIES).map((cat) => {
                        const isSelected = categoryId === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategoryId(cat.id)}
                            className={`flex items-center gap-2 p-2 rounded-xl border text-left text-xs transition ${
                              isSelected
                                ? 'border-2 shadow-sm font-bold'
                                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                            style={{
                              borderColor: isSelected ? cat.colorHex : undefined,
                              backgroundColor: isSelected ? `${cat.colorHex}15` : undefined,
                            }}
                          >
                            <span
                              className="h-3.5 w-3.5 rounded-full shrink-0 shadow-xs"
                              style={{ backgroundColor: cat.colorHex }}
                            />
                            <span className="truncate">{cat.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Standar Label Punggung Buku SBTH 4-Baris Vertikal */}
                  <div className="rounded-2xl p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 dark:border-amber-800/40 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🏷️</span>
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-100 text-xs uppercase tracking-wider block">
                            Standar Punggung Buku SBTH (4 Baris Vertikal)
                          </span>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            Otomatis di-generate dari kategori, pengarang (Cutter), & judul buku untuk penempatan di rak fisik.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleSyncSpineCodesManually}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 hover:bg-amber-100/50 text-[10px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1 shadow-xs transition self-start sm:self-auto cursor-pointer"
                        title="Otomatis buat ulang kode dari data formulir saat ini"
                      >
                        <Sparkles className="h-3 w-3 text-amber-500" />
                        <span>⚡ Sinkronkan Ulang</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {/* Baris 1: Kode Rak */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Baris 1: Kode Rak
                        </label>
                        <input
                          type="text"
                          value={shelfCode}
                          onChange={(e) => {
                            setShelfCode(e.target.value.toUpperCase());
                            setIsSpineManualEdited(true);
                          }}
                          placeholder="e.g. SR"
                          className="w-full rounded-xl border border-amber-300/80 dark:border-amber-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 text-center uppercase outline-hidden"
                        />
                        <span className="text-[9px] text-slate-400 mt-0.5 block text-center">Bawaan: SR</span>
                      </div>

                      {/* Baris 2: Nomor DDC */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Baris 2: Nomor DDC
                        </label>
                        <input
                          type="text"
                          value={classification}
                          onChange={(e) => {
                            setClassification(e.target.value);
                            setIsSpineManualEdited(true);
                          }}
                          placeholder="e.g. 398.2"
                          className="w-full rounded-xl border border-amber-300/80 dark:border-amber-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 text-center outline-hidden"
                        />
                        <span className="text-[9px] text-slate-400 mt-0.5 block text-center">e.g. 398.2, 500, 170</span>
                      </div>

                      {/* Baris 3: 3 Huruf Pengarang */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Baris 3: 3 Huruf Pengarang
                        </label>
                        <input
                          type="text"
                          maxLength={3}
                          value={authorCode}
                          onChange={(e) => {
                            setAuthorCode(e.target.value.toUpperCase());
                            setIsSpineManualEdited(true);
                          }}
                          placeholder="e.g. BAM"
                          className="w-full rounded-xl border border-amber-300/80 dark:border-amber-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 text-center uppercase outline-hidden"
                        />
                        <span className="text-[9px] text-slate-400 mt-0.5 block text-center">Cutter 3 Huruf</span>
                      </div>

                      {/* Baris 4: 1 Huruf Depan Judul */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Baris 4: 1 Huruf Judul
                        </label>
                        <input
                          type="text"
                          maxLength={2}
                          value={titleCode}
                          onChange={(e) => {
                            setTitleCode(e.target.value);
                            setIsSpineManualEdited(true);
                          }}
                          placeholder="e.g. k"
                          className="w-full rounded-xl border border-amber-300/80 dark:border-amber-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 text-center outline-hidden"
                        />
                        <span className="text-[9px] text-slate-400 mt-0.5 block text-center">1 Huruf Judul</span>
                      </div>
                    </div>

                    {/* Pratinjau Mini Label Samping Buku */}
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/50">
                      <div className="w-12 h-20 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 flex flex-col items-center justify-center font-mono font-bold text-[10px] leading-tight text-slate-800 dark:text-slate-200 shadow-xs shrink-0">
                        <span className="text-amber-600 dark:text-amber-400 font-extrabold">{shelfCode || 'SR'}</span>
                        <span>{classification || '813'}</span>
                        <span className="text-blue-600 dark:text-blue-400">{authorCode || 'SBT'}</span>
                        <span className="text-rose-600 dark:text-rose-400">{titleCode || 't'}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
                          Pratinjau Fisik Punggung Buku SBTH:
                        </span>
                        Format 4 baris ini siap langsung dicetak pada stiker label punggung buku atau ditulis cap manual di perpustakaan.
                      </div>
                    </div>
                  </div>

                  {/* Kelompok Usia & Jumlah Eksemplar */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Kelompok Usia Sasaran
                      </label>
                      <select
                        value={ageGroup}
                        onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs outline-hidden"
                      >
                        <option value="PLAYGROUP">Playgroup (2-3 Tahun)</option>
                        <option value="TK_A">TK-A (4-5 Tahun)</option>
                        <option value="TK_B">TK-B (5-6 Tahun)</option>
                        <option value="SEMUA_UMUR">Semua Tingkat TK</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Jumlah Eksemplar Fisik
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={copiesCount}
                          onChange={(e) => setCopiesCount(parseInt(e.target.value, 10) || 1)}
                          className="w-20 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-center font-bold outline-hidden"
                        />
                        <span className="text-xs text-slate-500">Buku fisik</span>
                      </div>
                    </div>
                  </div>

                  {/* Sumber Perolehan & Donatur Buku */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Sumber Perolehan Buku
                      </label>
                      <select
                        value={source}
                        onChange={(e) => setSource(e.target.value as AcquisitionSource)}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs outline-hidden font-medium"
                      >
                        <option value="BELI_SEKOLAH">🛒 Pembelian Sekolah (Inventaris)</option>
                        <option value="SUMBANGAN_ORTU">🎁 Sumbangan Orang Tua Murid</option>
                        <option value="HIBAH_DINAS">🏛️ Hibah Dinas / BOS</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Taksiran Nilai / Harga Buku (Rp)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={5000}
                        value={priceValue}
                        onChange={(e) => setPriceValue(parseInt(e.target.value, 10) || 0)}
                        placeholder="45000"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs outline-hidden"
                      />
                    </div>

                    {source === 'SUMBANGAN_ORTU' && (
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Nama Orang Tua Penyumbang *
                        </label>
                        <input
                          type="text"
                          value={donorName}
                          onChange={(e) => setDonorName(e.target.value)}
                          placeholder="Contoh: Orang Tua Ananda Sinta - TK A"
                          className="w-full rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/30 px-3 py-1.5 text-xs outline-hidden font-medium"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Sinopsis Singkat
                    </label>
                    <textarea
                      rows={2}
                      value={synopsis}
                      onChange={(e) => setSynopsis(e.target.value)}
                      placeholder="Cerita singkat tentang buku..."
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-2 transition"
                >
                  <BookPlus className="h-4 w-4" />
                  Simpan Buku & Generate {copiesCount} Barcode SBTH
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: CREATION SUCCESS SUMMARY + PRINT BUTTON */}
          {createdSummary && (
            <div className="space-y-5 animate-in zoom-in-95 duration-200">
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-5 text-center space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                  Buku Berhasil Ditambahkan ke Katalog SBTH!
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  &quot;{createdSummary.book.title}&quot; ({createdSummary.items.length} Eksemplar Fisik Siap Pakai)
                </p>
                <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">
                  <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Waktu Input: {formatDateTimeIndo(createdSummary.book.createdAt)}</span>
                </div>
              </div>

              {/* Generated Barcode Items List */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 bg-slate-50 dark:bg-slate-900/60">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Kode Barcode Eksemplar yang Diterbitkan:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {createdSummary.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          Eksemplar #{item.copyNumber}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                          {item.itemBarcode}
                        </span>
                      </div>
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition border border-slate-200 dark:border-slate-700"
                >
                  + Input Buku Baru Lagi
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl transition"
                  >
                    Tutup
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenLabelPrinter) {
                        onOpenLabelPrinter(createdSummary.items.map((i) => i.itemBarcode));
                      }
                      onClose();
                    }}
                    className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/30 flex items-center justify-center gap-2 transition"
                  >
                    <Printer className="h-4 w-4" />
                    Cetak Stiker Label ({createdSummary.items.length})
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
