'use client';

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Printer,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUp,
  Wrench,
  AlertTriangle,
  Trash2,
  CheckCircle,
  FileText,
  Clock,
  X,
  LayoutGrid,
  List as ListIcon,
  ArrowUpDown,
  History,
  UserCheck,
  RotateCcw,
  Edit3,
  MapPin,
  Tag,
  Info,
  Check,
  Table as TableIcon,
  ClipboardCheck,
  Download,
  CheckSquare,
  Square,
  BookOpen,
} from 'lucide-react';
import { Book, BookItem, BookStatus, CategoryId, Language, ShelfLocationItem, Category } from '@/types';
import {
  CATEGORIES,
  formatDateTimeIndo,
  formatDateDDMMYYYY,
  parseShelfLocation,
  combineShelfLocation,
  DEFAULT_SHELF_ROWS,
  deriveAuthorCode,
  deriveTitleCode,
} from '@/lib/constants';
import { libraryStore } from '@/lib/storage';
import { soundFx } from '@/lib/sound';
import { DICTIONARY, getDdcShortNameByCode } from '@/lib/i18n';
import { PageHeader } from '@/components/common/PageHeader';
import { SmartBookCover } from '@/components/common/SmartBookCover';
import { EditBookModal } from './EditBookModal';
import { BulkSpineSyncModal } from './BulkSpineSyncModal';
import { ShelfManagementModal } from '@/components/shelves/ShelfManagementModal';
import { CategoryManagementModal } from '@/components/categories/CategoryManagementModal';
import { StockOpnameModal } from '@/components/stockopname/StockOpnameModal';
import { ActivityLogModal } from '@/components/audit/ActivityLogModal';

interface BookManagementProps {
  onOpenScanIsbn: () => void;
  onOpenLabelPrinter: (barcodes: string[]) => void;
  language?: Language;
  onRefresh?: () => void;
}

export const BookManagement: React.FC<BookManagementProps> = ({
  onOpenScanIsbn,
  onOpenLabelPrinter,
  language = 'id',
  onRefresh,
}) => {
  const t = DICTIONARY[language] || DICTIONARY.id;

  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'ALL'>('ALL');
  
  // Lazy initialize tab dari localStorage agar tidak pernah flash / reset ke CATALOG
  const [mainTab, setMainTab] = useState<'CATALOG' | 'UNPRINTED' | 'DISPOSED'>(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('sbth_books_maintab') as any;
      if (savedTab && ['CATALOG', 'UNPRINTED', 'DISPOSED'].includes(savedTab)) {
        return savedTab;
      }
    }
    return 'CATALOG';
  });

  const [isBastModalOpen, setIsBastModalOpen] = useState<boolean>(false);
  const [isDisposeNewModalOpen, setIsDisposeNewModalOpen] = useState<boolean>(false);
  const [disposeBarcodeSearch, setDisposeBarcodeSearch] = useState<string>('');
  const [disposeSelectedItemId, setDisposeSelectedItemId] = useState<string>('');
  const [disposeReasonType, setDisposeReasonType] = useState<string>('RUSAK_BERAT');
  const [disposeCustomReason, setDisposeCustomReason] = useState<string>('');
  const [disposeConditionNote, setDisposeConditionNote] = useState<string>('');
  const [labelFilter, setLabelFilter] = useState<'ALL' | 'UNPRINTED' | 'PRINTED'>('ALL');
  const [shelfFilter, setShelfFilter] = useState<string>('ALL');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [isBulkSpineModalOpen, setIsBulkSpineModalOpen] = useState<boolean>(false);
  const [bulkShelfTarget, setBulkShelfTarget] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'BORROWED' | 'DAMAGED' | 'LOST' | 'DISPOSED'>('ALL');
  const [sortBy, setSortBy] = useState<'TITLE' | 'NEWEST' | 'COPIES'>('NEWEST');
  
  // Lazy initialize viewMode dari localStorage
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE' | 'GRID'>(() => {
    if (typeof window !== 'undefined') {
      const savedView = localStorage.getItem('sbth_books_viewmode') as any;
      if (savedView && ['CARDS', 'TABLE', 'GRID'].includes(savedView)) {
        return savedView;
      }
    }
    return 'CARDS';
  });

  // Paginasi & Batas Item per Tampilan (10 / 20 / 50 / 100)
  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sbth_books_per_page');
      if (saved && ['10', '20', '50', '100'].includes(saved)) {
        return Number(saved);
      }
    }
    return 20; // default 20 buku per view
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);

  // Simpan pilihan batas buku per tampilan
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sbth_books_per_page', String(itemsPerPage));
    }
  }, [itemsPerPage]);

  // Reset ke halaman 1 saat filter pencarian, kategori, label, rak, status, sort, atau limit berubah
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, labelFilter, shelfFilter, statusFilter, sortBy, itemsPerPage, mainTab]);

  // Scroll listener untuk Back to Top floating button (sinkron dengan container main-content-scroll dan window)
  React.useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        const scrollEl = document.getElementById('main-content-scroll');
        const scrollY = scrollEl ? scrollEl.scrollTop : window.scrollY;
        if (scrollY > 220) {
          setShowBackToTop(true);
        } else {
          setShowBackToTop(false);
        }
      }
    };
    const scrollEl = document.getElementById('main-content-scroll');
    if (scrollEl) {
      scrollEl.addEventListener('scroll', handleScroll, { passive: true });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      if (scrollEl) {
        scrollEl.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      const scrollEl = document.getElementById('main-content-scroll');
      if (scrollEl) {
        scrollEl.scrollTo({ top: 0, behavior: 'smooth' });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      soundFx.playScanBeep();
    }
  };

  const [selectedBookForCopies, setSelectedBookForCopies] = useState<Book | null>(null);
  const [newCopiesCount, setNewCopiesCount] = useState<number>(1);
  const [expandedBookIds, setExpandedBookIds] = useState<Record<string, boolean>>({});
  
  // Fitur Rak & Baris Fisik: Default OFF sesuai instruksi SBTH (Buku disusun murni per Kategori DDC)
  const [isShelfFeatureEnabled, setIsShelfFeatureEnabled] = useState<boolean>(() => libraryStore.isShelfFeatureEnabled());
  const [isShelfRowEnabled, setIsShelfRowEnabled] = useState<boolean>(() => libraryStore.isShelfRowFeatureEnabled());
  const [isCategoryWrap, setIsCategoryWrap] = useState<boolean>(true); // Wrap badge kategori agar tidak perlu repot geser

  // Sinkronisasi status fitur rak & baris
  React.useEffect(() => {
    setIsShelfFeatureEnabled(libraryStore.isShelfFeatureEnabled());
    setIsShelfRowEnabled(libraryStore.isShelfRowFeatureEnabled());
  }, []);

  // Simpan pilihan tab saat berubah
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sbth_books_maintab', mainTab);
    }
  }, [mainTab]);

  // Simpan pilihan view mode saat berubah
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sbth_books_viewmode', viewMode);
    }
  }, [viewMode]);

  // Modals state
  const [selectedBookForEdit, setSelectedBookForEdit] = useState<Book | null>(null);
  const [isShelfModalOpen, setIsShelfModalOpen] = useState<boolean>(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [isStockOpnameOpen, setIsStockOpnameOpen] = useState<boolean>(false);
  const [isActivityLogOpen, setIsActivityLogOpen] = useState<boolean>(false);

  // Copy condition / status management modal
  const [selectedItemForStatus, setSelectedItemForStatus] = useState<BookItem | null>(null);
  const [statusInput, setStatusInput] = useState<BookStatus>('AVAILABLE');
  const [conditionNoteInput, setConditionNoteInput] = useState<string>('');
  const [disposalReasonInput, setDisposalReasonInput] = useState<string>('');
  const [refreshTick, setRefreshTick] = useState<number>(0);

  const books = libraryStore.getBooks();
  const allItems = libraryStore.getBookItems();
  const shelves = libraryStore.getShelves();
  const categories = libraryStore.getCategories();

  const toggleBookExpand = (bookId: string) => {
    setExpandedBookIds((prev) => ({
      ...prev,
      [bookId]: prev[bookId] === undefined ? false : !prev[bookId],
    }));
  };

  const isBookExpanded = (bookId: string) => {
    return expandedBookIds[bookId] !== false;
  };

  // Unprinted counts
  const unprintedCopies = allItems.filter((i) => !i.labelPrinted);
  const unprintedCount = unprintedCopies.length;
  const printedCount = allItems.filter((i) => i.labelPrinted).length;

  // Disposed / weeded counts
  const disposedItems = allItems.filter((i) => i.status === 'DISPOSED');
  const disposedCount = disposedItems.length;

  // Extract all unique shelf locations for filter and bulk mover
  const uniqueShelves = React.useMemo(() => {
    const set = new Set<string>();
    shelves.forEach((s) => {
      if (s.name) set.add(s.name);
      for (let r = 1; r <= 4; r++) {
        set.add(`${s.name} - Baris ${r}`);
      }
    });
    categories.forEach((c) => {
      if (c.shelfLocation) set.add(c.shelfLocation);
    });
    allItems.forEach((i) => {
      if (i.shelfLocation) set.add(i.shelfLocation);
    });
    books.forEach((b) => {
      if (b.shelfLocation) set.add(b.shelfLocation);
    });
    return Array.from(set).filter(Boolean).sort();
  }, [shelves, categories, allItems, books, refreshTick]);

  const toggleSelectBook = (bookId: string) => {
    const bookCopies = allItems.filter((i) => i.bookId === bookId);
    const copyIds = bookCopies.map((i) => i.id);

    setSelectedBookIds((prevBooks) => {
      const isSelected = prevBooks.includes(bookId);
      if (isSelected) {
        setSelectedItemIds((prevItems) => prevItems.filter((id) => !copyIds.includes(id)));
        return prevBooks.filter((id) => id !== bookId);
      } else {
        setSelectedItemIds((prevItems) => Array.from(new Set([...prevItems, ...copyIds])));
        return [...prevBooks, bookId];
      }
    });
    soundFx.playScanBeep();
  };

  const toggleSelectItem = (copyId: string) => {
    const item = allItems.find((i) => i.id === copyId || i.itemBarcode === copyId);
    setSelectedItemIds((prev) => {
      const isSelected = prev.includes(copyId);
      const next = isSelected ? prev.filter((x) => x !== copyId) : [...prev, copyId];
      if (item) {
        const bookCopies = allItems.filter((i) => i.bookId === item.bookId);
        const anyCopySelected = bookCopies.some((c) => next.includes(c.id));
        setSelectedBookIds((prevBooks) => {
          if (anyCopySelected && !prevBooks.includes(item.bookId)) {
            return [...prevBooks, item.bookId];
          } else if (!anyCopySelected && prevBooks.includes(item.bookId)) {
            return prevBooks.filter((id) => id !== item.bookId);
          }
          return prevBooks;
        });
      }
      return next;
    });
    soundFx.playScanBeep();
  };

  const handleSelectAllVisible = () => {
    // Memilih atau membatalkan pilihan buku di halaman yang sedang dilihat
    const pageBookIds = paginatedBooks.map((b) => b.id);
    const pageCopyIds = paginatedBooks.flatMap((b) =>
      allItems.filter((i) => i.bookId === b.id).map((i) => i.id)
    );

    const isAllPageSelected =
      pageBookIds.length > 0 &&
      pageBookIds.every((id) => selectedBookIds.includes(id));

    if (isAllPageSelected) {
      setSelectedBookIds((prev) => prev.filter((id) => !pageBookIds.includes(id)));
      setSelectedItemIds((prev) => prev.filter((id) => !pageCopyIds.includes(id)));
    } else {
      setSelectedBookIds((prev) => Array.from(new Set([...prev, ...pageBookIds])));
      setSelectedItemIds((prev) => Array.from(new Set([...prev, ...pageCopyIds])));
    }
    soundFx.playScanBeep();
  };

  const handleSelectAllFiltered = () => {
    const allVisibleBookIds = filteredBooks.map((b) => b.id);
    const allVisibleCopyIds = filteredBooks.flatMap((b) =>
      allItems.filter((i) => i.bookId === b.id).map((i) => i.id)
    );

    const isAllSelected =
      allVisibleBookIds.length > 0 &&
      allVisibleBookIds.every((id) => selectedBookIds.includes(id));

    if (isAllSelected) {
      setSelectedBookIds([]);
      setSelectedItemIds([]);
    } else {
      setSelectedBookIds(allVisibleBookIds);
      setSelectedItemIds(allVisibleCopyIds);
    }
    soundFx.playScanBeep();
  };

  const handleResetSelection = () => {
    setSelectedBookIds([]);
    setSelectedItemIds([]);
    soundFx.playScanBeep();
  };

  const handleApplyBulkShelf = () => {
    if (!bulkShelfTarget.trim()) {
      alert('Pilih lokasi rak tujuan terlebih dahulu.');
      return;
    }
    if (selectedItemIds.length === 0) {
      alert('Tidak ada eksemplar yang dipilih.');
      return;
    }

    const updated = libraryStore.bulkUpdateShelfLocation(selectedItemIds, bulkShelfTarget.trim());
    soundFx.playSuccessChime();
    alert(`✓ Berhasil memindahkan ${updated} eksemplar fisik ke ${bulkShelfTarget}!`);
    setSelectedItemIds([]);
    setSelectedBookIds([]);
    setRefreshTick((r) => r + 1);
  };

  const handleBulkMarkPrinted = (printed: boolean) => {
    const selectedBarcodes = allItems
      .filter((i) => selectedItemIds.includes(i.id))
      .map((i) => i.itemBarcode);
    if (selectedBarcodes.length === 0) {
      alert('Tidak ada eksemplar yang dipilih.');
      return;
    }
    libraryStore.markLabelsPrinted(
      selectedBarcodes,
      printed,
      printed ? 'MANUAL_STAMP' : undefined
    );
    soundFx.playSuccessChime();
    alert(
      printed
        ? `✓ Berhasil menandai ${selectedBarcodes.length} eksemplar sebagai SUDAH DICAP / DICETAK LABEL.`
        : `✓ Berhasil mengubah ${selectedBarcodes.length} eksemplar menjadi BELUM DICAP / BELUM CETAK LABEL.`
    );
    setSelectedItemIds([]);
    setSelectedBookIds([]);
    setRefreshTick((r) => r + 1);
    onRefresh?.();
  };

  const filteredBooks = books
    .filter((b) => {
      if (selectedCategory !== 'ALL' && b.categoryId !== selectedCategory) return false;

      // Label filter
      if (labelFilter !== 'ALL') {
        const bookCopies = allItems.filter((i) => i.bookId === b.id);
        if (labelFilter === 'UNPRINTED' && !bookCopies.some((i) => !i.labelPrinted)) return false;
        if (labelFilter === 'PRINTED' && !bookCopies.some((i) => i.labelPrinted)) return false;
      }

      // Shelf location filter
      if (shelfFilter !== 'ALL') {
        const bookCopies = allItems.filter((i) => i.bookId === b.id);
        const matchBook = b.shelfLocation === shelfFilter;
        const matchCopy = bookCopies.some((i) => i.shelfLocation === shelfFilter);
        if (!matchBook && !matchCopy) return false;
      }

      // Physical copy status filter (Tersedia, Dipinjam, Rusak, Hilang, Dimusnahkan)
      if (statusFilter !== 'ALL') {
        const bookCopies = allItems.filter((i) => i.bookId === b.id);
        if (statusFilter === 'AVAILABLE' && !bookCopies.some((i) => i.status === 'AVAILABLE')) return false;
        if (statusFilter === 'BORROWED' && !bookCopies.some((i) => i.status === 'BORROWED')) return false;
        if (
          statusFilter === 'DAMAGED' &&
          !bookCopies.some(
            (i) => i.status === 'DAMAGED' || i.status === 'IN_REPAIR'
          )
        )
          return false;
        if (statusFilter === 'LOST' && !bookCopies.some((i) => i.status === 'LOST')) return false;
        if (statusFilter === 'DISPOSED' && !bookCopies.some((i) => i.status === 'DISPOSED')) return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const cat = categories.find((c) => c.id === b.categoryId);
        const copies = allItems.filter((i) => i.bookId === b.id);
        const matchTitle = b.title.toLowerCase().includes(q);
        const matchAuthor = b.author.toLowerCase().includes(q) || (b.authorCode && b.authorCode.toLowerCase().includes(q));
        const matchIsbn = b.isbn.toLowerCase().includes(q);
        const matchShelf = (b.shelfLocation && b.shelfLocation.toLowerCase().includes(q)) || (b.shelfCode && b.shelfCode.toLowerCase().includes(q));
        const matchCategory = Boolean(cat && (cat.name.toLowerCase().includes(q) || cat.shortName.toLowerCase().includes(q)));
        const matchCallNo = Boolean((b.callNumber && b.callNumber.toLowerCase().includes(q)) || (b.classification && b.classification.toLowerCase().includes(q)));
        const matchBarcode = copies.some((i) => i.itemBarcode.toLowerCase().includes(q) || i.itemBarcode.replace(/\D/g, '').includes(q));
        return (
          matchTitle ||
          matchAuthor ||
          matchIsbn ||
          matchShelf ||
          matchCategory ||
          matchCallNo ||
          matchBarcode
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'TITLE') return a.title.localeCompare(b.title);
      if (sortBy === 'COPIES') {
        const countA = allItems.filter((i) => i.bookId === a.id).length;
        const countB = allItems.filter((i) => i.bookId === b.id).length;
        return countB - countA;
      }
      // NEWEST
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

  // Paginasi Kalkulasi & State
  const totalBooks = filteredBooks.length;
  const totalPages = Math.max(1, Math.ceil(totalBooks / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalBooks);
  const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

  const allFilteredItemIds = filteredBooks.flatMap((b) => allItems.filter((i) => i.bookId === b.id).map((i) => i.id));
  const isAllPageSelected =
    paginatedBooks.length > 0 &&
    paginatedBooks.every((b) => selectedBookIds.includes(b.id));
  const isSomePageSelected =
    !isAllPageSelected &&
    paginatedBooks.some((b) => selectedBookIds.includes(b.id));

  const isAllVisibleSelected =
    filteredBooks.length > 0 &&
    filteredBooks.every((b) => selectedBookIds.includes(b.id));
  const isSomeVisibleSelected =
    !isAllVisibleSelected &&
    (selectedBookIds.length > 0 || selectedItemIds.length > 0);

  const handleAddCopies = () => {
    if (!selectedBookForCopies) return;
    const added = libraryStore.addCopiesToBook(selectedBookForCopies.id, newCopiesCount, 'BELI');
    soundFx.playSuccessChime();
    alert(`Berhasil menambahkan ${added.length} eksemplar fisik baru untuk "${selectedBookForCopies.title}".`);
    setSelectedBookForCopies(null);
    setNewCopiesCount(1);
  };

  const handleOpenStatusModal = (item: BookItem) => {
    setSelectedItemForStatus(item);
    setStatusInput(item.status);
    setConditionNoteInput(item.conditionNote || '');
    setDisposalReasonInput(item.disposalReason || '');
    soundFx.playScanBeep();
  };

  const handleSaveItemStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForStatus) return;

    if (statusInput === 'DISPOSED' && !disposalReasonInput.trim()) {
      alert('Mohon isi Alasan Pemusnahan / Berita Acara untuk arsip inventaris sekolah.');
      return;
    }

    const currentLib = libraryStore.getCurrentLibrarian();
    libraryStore.updateItemStatus(
      selectedItemForStatus.id,
      statusInput,
      conditionNoteInput.trim() || undefined,
      statusInput === 'DISPOSED' ? disposalReasonInput.trim() : undefined,
      currentLib?.name
    );

    soundFx.playSuccessChime();
    setSelectedItemForStatus(null);
    setRefreshTick((r) => r + 1);
  };

  const handleRestoreItem = (item: BookItem) => {
    const book = books.find((b) => b.id === item.bookId);
    const confirmRestore = confirm(
      `Pulihkan eksemplar [${item.itemBarcode}] untuk buku "${book?.title || '-'}" kembali ke status TERSEDIA?\n\nEksemplar ini akan kembali aktif dan dapat dipinjam oleh siswa.`
    );
    if (!confirmRestore) return;

    const currentLib = libraryStore.getCurrentLibrarian();
    libraryStore.restoreItemFromDisposed(item.id, currentLib?.name);
    soundFx.playSuccessChime();
    setRefreshTick((r) => r + 1);
  };

  const handleConfirmDisposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disposeSelectedItemId) {
      alert('Pilih eksemplar buku yang akan diafkir/dimusnahkan.');
      return;
    }
    const finalReason =
      disposeReasonType === 'RUSAK_BERAT'
        ? 'Rusak Berat / Robek Dimakan Usia / Serangga'
        : disposeReasonType === 'HILANG'
        ? 'Hilang Permanen oleh Peminjam / Tidak Kembali'
        : disposeReasonType === 'KADALUARSA'
        ? 'Kadaluarsa Kurikulum / Informasi Tidak Lagi Relevan'
        : disposeCustomReason.trim() || 'Pemusnahan Koleksi';

    const currentLib = libraryStore.getCurrentLibrarian();
    libraryStore.updateItemStatus(
      disposeSelectedItemId,
      'DISPOSED',
      disposeConditionNote.trim() || undefined,
      finalReason,
      currentLib?.name
    );

    soundFx.playSuccessChime();
    alert('✓ Eksemplar buku berhasil dipindahkan ke Daftar Pemusnahan & Afkir (Weeding)!');
    setIsDisposeNewModalOpen(false);
    setDisposeBarcodeSearch('');
    setDisposeSelectedItemId('');
    setDisposeConditionNote('');
    setDisposeCustomReason('');
    setRefreshTick((r) => r + 1);
    onRefresh?.();
  };

  // Komponen Paginasi Bersih & Ringkas (Batas 10 / 20 / 50 / 100 per view dan nomor halaman 1 2 3 dst)
  const renderPaginationBar = (position: 'TOP' | 'BOTTOM') => {
    if (totalBooks === 0) return null;

    // Nomor halaman pintar (1, 2, ..., N)
    const getPageNumbers = () => {
      const delta = 2;
      const range: (number | string)[] = [];
      const rangeWithDots: (number | string)[] = [];
      let l: number | undefined;

      for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= safeCurrentPage - delta && i <= safeCurrentPage + delta)) {
          range.push(i);
        }
      }

      for (const i of range) {
        if (l) {
          if (typeof i === 'number' && i - l === 2) {
            rangeWithDots.push(l + 1);
          } else if (typeof i === 'number' && i - l !== 1) {
            rangeWithDots.push('...');
          }
        }
        rangeWithDots.push(i);
        if (typeof i === 'number') l = i;
      }

      return rangeWithDots;
    };

    const handlePageClick = (page: number) => {
      if (page < 1 || page > totalPages || page === safeCurrentPage) return;
      setCurrentPage(page);
      soundFx.playScanBeep();
      if (position === 'BOTTOM' && typeof window !== 'undefined') {
        const scrollEl = document.getElementById('main-content-scroll');
        if (scrollEl) {
          scrollEl.scrollTo({ top: 380, behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 380, behavior: 'smooth' });
        }
      }
    };

    return (
      <div
        className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:px-4 rounded-2xl bg-surface border border-border shadow-2xs ${
          position === 'TOP' ? 'mb-1' : 'mt-4'
        }`}
      >
        {/* Kiri: Info Jumlah & Pilihan Limit 10 / 20 / 50 / 100 */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="text-text font-medium">
            {t.showingBooksPagination
              ?.replace('{start}', String(totalBooks === 0 ? 0 : startIndex + 1))
              .replace('{end}', String(endIndex))
              .replace('{total}', String(totalBooks)) || (
              <>
                Menampilkan{' '}
                <span className="font-bold text-amber-500 font-mono">
                  {totalBooks === 0 ? 0 : startIndex + 1}–{endIndex}
                </span>{' '}
                dari <span className="font-bold font-mono text-text">{totalBooks}</span> Judul Buku
              </>
            )}
          </div>

          <div className="h-4 w-[1px] bg-border hidden sm:block" />

          {/* Selector Batas Tampilan: 10 / 20 / 50 / 100 */}
          <div className="flex items-center gap-1.5 text-text-muted">
            <span className="text-[11px] font-medium hidden md:inline">{t.showPerPage || 'Tampilkan'}:</span>
            <div className="flex items-center bg-surface-2 p-0.5 rounded-xl border border-border">
              {[10, 20, 50, 100].map((limit) => (
                <button
                  key={limit}
                  type="button"
                  onClick={() => {
                    if (itemsPerPage !== limit) {
                      setItemsPerPage(limit);
                      setCurrentPage(1);
                      soundFx.playScanBeep();
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    itemsPerPage === limit
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-text-muted hover:text-text hover:bg-surface'
                  }`}
                  title={`Batasi ${limit} judul buku per halaman`}
                >
                  {limit}
                </button>
              ))}
            </div>
            <span className="text-[11px] font-medium hidden md:inline">per hal</span>
          </div>
        </div>

        {/* Kanan: Navigasi Halaman (Awal, Prev, 1, 2, 3..., Next, Akhir) */}
        <div className="flex items-center gap-1">
          {/* Tombol Awal (<<) */}
          <button
            type="button"
            disabled={safeCurrentPage <= 1}
            onClick={() => handlePageClick(1)}
            className="p-1.5 rounded-xl border border-border bg-surface-2 text-text-muted hover:text-text hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            title="Halaman Pertama (Awal)"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>

          {/* Tombol Sebelumnya (<) */}
          <button
            type="button"
            disabled={safeCurrentPage <= 1}
            onClick={() => handlePageClick(safeCurrentPage - 1)}
            className="p-1.5 rounded-xl border border-border bg-surface-2 text-text-muted hover:text-text hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Angka-angka halaman 1, 2, 3, dst */}
          <div className="flex items-center gap-1 mx-0.5">
            {getPageNumbers().map((num, i) => {
              if (num === '...') {
                return (
                  <span key={`dots-${i}`} className="px-1.5 text-xs text-text-muted font-bold select-none">
                    ...
                  </span>
                );
              }
              const pageNum = Number(num);
              const isActive = pageNum === safeCurrentPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => handlePageClick(pageNum)}
                  className={`min-w-8 h-8 px-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-xs border border-amber-400'
                      : 'border border-border bg-surface-2 text-text-muted hover:text-text hover:bg-surface'
                  }`}
                  title={`Ke Halaman ${pageNum}`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Tombol Selanjutnya (>) */}
          <button
            type="button"
            disabled={safeCurrentPage >= totalPages}
            onClick={() => handlePageClick(safeCurrentPage + 1)}
            className="p-1.5 rounded-xl border border-border bg-surface-2 text-text-muted hover:text-text hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            title="Halaman Selanjutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Tombol Akhir (>>) */}
          <button
            type="button"
            disabled={safeCurrentPage >= totalPages}
            onClick={() => handlePageClick(totalPages)}
            className="p-1.5 rounded-xl border border-border bg-surface-2 text-text-muted hover:text-text hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            title="Halaman Terakhir (Akhir)"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header: Localized & Uniform */}
      <PageHeader
        icon={<Layers className="h-5 w-5" />}
        title={t.booksHeaderTitle || 'Koleksi & Eksemplar Fisik'}
        subtitle={t.booksHeaderSubtitle || 'Manajemen katalog judul buku (Biblio) dan inventaris eksemplar fisik (Barcode unik SBTH)'}
        actions={
          <>
            <button
              type="button"
              onClick={() => setIsStockOpnameOpen(true)}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-surface border border-border hover:bg-surface-2 text-text font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="Audit Fisik & Stock Opname Koleksi Buku"
            >
              <ClipboardCheck className="h-4 w-4 text-emerald-500" />
              <span>Stock Opname</span>
            </button>

            {isShelfFeatureEnabled && (
              <button
                type="button"
                onClick={() => setIsShelfModalOpen(true)}
                className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-surface border border-border hover:bg-surface-2 text-text font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                title="Kelola Struktur & Penamaan Rak SBTH"
              >
                <MapPin className="h-4 w-4 text-amber-500" />
                <span>Template Rak</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-surface border border-border hover:bg-surface-2 text-text font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="Kelola Kategori, Warna Punggung & Ikon"
            >
              <Tag className="h-4 w-4 text-purple-400" />
              <span>Kategori & Warna</span>
            </button>

            <button
              type="button"
              onClick={() => setIsActivityLogOpen(true)}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-surface border border-border hover:bg-surface-2 text-text font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="Buka Log Riwayat Aktivitas Besar"
            >
              <History className="h-4 w-4 text-blue-400" />
              <span>Log Riwayat</span>
            </button>

            <button
              type="button"
              onClick={onOpenScanIsbn}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>{t.addBookScanIsbn || 'Scan ISBN'}</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenLabelPrinter([])}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-surface border border-border hover:bg-surface-2 text-text font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="h-4 w-4 text-text-muted" />
              <span>{t.printLabelsBtn || 'Cetak Label'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                libraryStore.downloadSlimsCsv();
                soundFx.playSuccessChime();
              }}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-surface border border-border hover:bg-surface-2 text-text font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="Ekspor Seluruh Katalog & Eksemplar ke Format CSV Standar SLiMS (Senayan) Langsung Unduh"
            >
              <Download className="h-4 w-4 text-emerald-500" />
              <span>Ekspor SLiMS</span>
            </button>
          </>
        }
      />

      {/* Sub-Tabs Navigasi: Katalog Aktif | Belum Cetak Label | Pemusnahan Buku */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => {
            setMainTab('CATALOG');
            setLabelFilter('ALL');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            mainTab === 'CATALOG'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'bg-surface hover:bg-surface-2 text-text-muted hover:text-text border border-border'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>{t.activeCatalogTab || 'Katalog Koleksi Aktif'} ({books.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMainTab('UNPRINTED');
            setLabelFilter('UNPRINTED');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            mainTab === 'UNPRINTED'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'bg-surface hover:bg-surface-2 text-text-muted hover:text-text border border-border'
          }`}
        >
          <Tag className="h-4 w-4 text-amber-500" />
          <span>{t.unprintedTab || 'Belum Cetak Label'} ({unprintedCount})</span>
          {unprintedCount > 0 && (
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setMainTab('DISPOSED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            mainTab === 'DISPOSED'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-surface hover:bg-surface-2 text-text-muted hover:text-text border border-border'
          }`}
        >
          <Trash2 className="h-4 w-4 text-rose-500" />
          <span>{t.disposedTab || 'Pemusnahan Buku / Afkir'} ({disposedCount})</span>
        </button>
      </div>

      {/* Unprinted Label Sticker Warning Banner */}
      {unprintedCount > 0 && mainTab !== 'DISPOSED' && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5 text-amber-500 font-semibold">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              {t.unprintedBanner?.replace('{count}', String(unprintedCount)) ||
                `Perhatian: Terdapat ${unprintedCount} eksemplar buku yang belum dicetak atau belum ditempel stiker barcode fisik!`}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              const unprintedBarcodes = unprintedCopies.map((i) => i.itemBarcode);
              onOpenLabelPrinter(unprintedBarcodes);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shrink-0 transition flex items-center gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>
              {t.printMissingBtn || 'Cetak Label Sekarang'}
            </span>
          </button>
        </div>
      )}

      {mainTab === 'DISPOSED' ? (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Pemusnahan Buku Header */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-rose-500/30 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-500/15 text-rose-500">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-text flex items-center gap-2">
                    Daftar Pemusnahan & Afkir Koleksi Buku (Weeding)
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-500 font-mono text-xs font-bold border border-rose-500/30">
                      {disposedCount} Eksemplar
                    </span>
                  </h3>
                  <p className="text-xs text-text-muted">
                    Eksemplar fisik yang dikeluarkan dari peredaran sekolah karena rusak berat, hilang permanen, atau kadaluarsa kurikulum.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
              <button
                type="button"
                onClick={() => setIsDisposeNewModalOpen(true)}
                className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-rose-600/30 transition cursor-pointer"
                title="Pilih dan afkir eksemplar buku yang rusak berat atau hilang"
              >
                <Trash2 className="h-4 w-4" />
                <span>+ Afkir Eksemplar</span>
              </button>

              <button
                type="button"
                disabled={disposedCount === 0}
                onClick={() => setIsBastModalOpen(true)}
                className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-2 border border-rose-500/40 text-rose-500 disabled:opacity-50 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                title="Cetak Berita Acara Pemusnahan Koleksi Pustaka Resmi"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak Berita Acara (BAST)</span>
              </button>
            </div>
          </div>

          {/* Table / List */}
          {disposedCount === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-surface border border-border space-y-3">
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle className="h-7 w-7" />
              </div>
              <h4 className="text-sm font-bold text-text">Belum Ada Buku yang Dimusnahkan</h4>
              <p className="text-xs text-text-muted max-w-md mx-auto">
                Seluruh eksemplar koleksi fisik perpustakaan dalam kondisi baik atau masih dalam sirkulasi aktif. Jika ada buku yang rusak parah atau hilang permanen, klik tombol &quot;+ Afkir Eksemplar&quot; di atas untuk mencatatnya ke buku afkir resmi.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDisposeNewModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>+ Afkir Eksemplar Rusak</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMainTab('CATALOG');
                    setLabelFilter('ALL');
                  }}
                  className="px-4 py-2 rounded-xl bg-surface hover:bg-surface-2 border border-border text-text font-bold text-xs inline-flex items-center gap-2 transition cursor-pointer"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Kembali ke Katalog Koleksi</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-2 text-text-muted border-b border-border font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4 w-10">No</th>
                      <th className="py-3 px-4">Judul & Eksemplar Buku</th>
                      <th className="py-3 px-3">Kategori & Panggil</th>
                      <th className="py-3 px-3">Tgl Pemusnahan</th>
                      <th className="py-3 px-3">Alasan Pemusnahan / BA</th>
                      <th className="py-3 px-3">Petugas</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {disposedItems.map((item, idx) => {
                      const book = books.find((b) => b.id === item.bookId);
                      const cat = categories.find((c) => c.id === book?.categoryId) || CATEGORIES[0];
                      return (
                        <tr key={item.id} className="hover:bg-surface-2/40 transition">
                          <td className="py-3 px-4 font-mono text-[11px] text-text-muted">{idx + 1}.</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-9 rounded-lg overflow-hidden shrink-0 border border-border bg-surface-2">
                                <SmartBookCover
                                  title={book?.title || 'Buku'}
                                  author={book?.author || ''}
                                  coverUrl={book?.coverImage}
                                  categoryId={book?.categoryId}
                                  className="h-full w-full object-cover text-[8px]"
                                />
                              </div>
                              <div>
                                <div
                                  className="font-bold text-text hover:text-amber-500 transition cursor-pointer"
                                  onClick={() => book && setSelectedBookForEdit(book)}
                                >
                                  {book?.title || 'Judul Tidak Diketahui'}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                  <span className="font-mono text-[10px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                                    {item.itemBarcode}
                                  </span>
                                  <span className="text-[10px] text-text-muted">Copy #{item.copyNumber}</span>
                                  <span className="text-[10px] text-text-muted">• {book?.author || '-'}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1"
                              style={{ backgroundColor: `${cat.colorHex}20`, color: cat.colorHex }}
                            >
                              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cat.colorHex }} />
                              {cat.shortName}
                            </span>
                            <div className="font-mono text-[10px] text-text-muted mt-1">{book?.callNumber || '-'}</div>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap text-text font-medium text-[11px]">
                            {item.disposedAt || item.statusUpdatedAt || '-'}
                          </td>
                          <td className="py-3 px-3 max-w-xs">
                            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-medium text-[11px]">
                              {item.disposalReason || item.conditionNote || 'Koleksi Rusak Berat / Afkir'}
                            </div>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap text-text-muted text-[11px]">
                            {item.disposedBy || 'Pustakawan SBTH'}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-right">
                            <button
                              type="button"
                              onClick={() => handleRestoreItem(item)}
                              className="px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:border-emerald-500/40 text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
                              title="Batalkan pemusnahan dan kembalikan eksemplar ini ke status TERSEDIA"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              <span>Pulihkan Eksemplar</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : mainTab === 'UNPRINTED' ? (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Header Panel Belum Cetak Label */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-amber-500/30 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500">
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-text flex items-center gap-2">
                    Antrean Eksemplar Belum Cetak Label & Belum Dicap
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 font-mono text-xs font-bold border border-amber-500/30">
                      {unprintedCount} Eksemplar
                    </span>
                  </h3>
                  <p className="text-xs text-text-muted">
                    Daftar seluruh eksemplar fisik buku di perpustakaan yang belum ditempel stiker barcode fisik atau belum dicap/ditulis manual nomor inventarisnya.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
              <button
                type="button"
                disabled={unprintedCount === 0}
                onClick={() => {
                  const unprintedBarcodes = unprintedCopies.map((i) => i.itemBarcode);
                  onOpenLabelPrinter(unprintedBarcodes);
                }}
                className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-amber-500/30 transition cursor-pointer"
                title="Buka Generator & Cetak Semua Stiker Barcode Tom & Jerry 103"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak Semua Label ({unprintedCount})</span>
              </button>

              <button
                type="button"
                disabled={unprintedCount === 0}
                onClick={() => {
                  const unprintedBarcodes = unprintedCopies.map((i) => i.itemBarcode);
                  libraryStore.markLabelsPrinted(unprintedBarcodes, true, 'MANUAL_STAMP');
                  soundFx.playSuccessChime();
                  alert(`✓ Berhasil menandai ${unprintedBarcodes.length} eksemplar sudah dicap manual / ditulis ballpoint!`);
                  setRefreshTick((r) => r + 1);
                  onRefresh?.();
                }}
                className="flex-1 md:flex-initial px-3.5 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 disabled:opacity-50 text-emerald-500 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                title="Tandai semua eksemplar sudah dicap stempel inventaris manual tanpa printer"
              >
                <CheckSquare className="h-4 w-4" />
                <span>Tandai Semua Dicap ({unprintedCount})</span>
              </button>
            </div>
          </div>

          {/* Body: Empty State or Table */}
          {unprintedCount === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-surface border border-border space-y-3">
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle className="h-7 w-7" />
              </div>
              <h4 className="text-sm font-bold text-text">Semua Eksemplar Sudah Dicetak / Dicap Label! 🎉</h4>
              <p className="text-xs text-text-muted max-w-md mx-auto">
                Seluruh eksemplar koleksi fisik perpustakaan ({allItems.length} eksemplar) sudah memiliki stiker barcode fisik atau sudah dicap stempel inventaris manual. Tidak ada antrean cetak yang tertunda.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMainTab('CATALOG');
                    setLabelFilter('ALL');
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs inline-flex items-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Kembali ke Katalog Koleksi Aktif</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-2 text-text-muted border-b border-border font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4 w-10">No</th>
                      <th className="py-3 px-4">Judul & Eksemplar Buku</th>
                      <th className="py-3 px-3">Kategori & Posisi Rak</th>
                      <th className="py-3 px-3">Barcode Unik</th>
                      <th className="py-3 px-3">Tgl Masuk / Asal</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-4 text-right">Aksi Cepat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {unprintedCopies.map((item, idx) => {
                      const book = books.find((b) => b.id === item.bookId);
                      const cat = categories.find((c) => c.id === book?.categoryId) || CATEGORIES[0];
                      return (
                        <tr key={item.id} className="hover:bg-surface-2/40 transition">
                          <td className="py-3 px-4 font-mono text-[11px] text-text-muted">{idx + 1}.</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-9 rounded-lg overflow-hidden shrink-0 border border-border bg-surface-2">
                                <SmartBookCover
                                  title={book?.title || 'Buku'}
                                  author={book?.author || ''}
                                  coverUrl={book?.coverImage}
                                  categoryId={book?.categoryId}
                                  className="h-full w-full object-cover text-[8px]"
                                />
                              </div>
                              <div>
                                <div
                                  className="font-bold text-text hover:text-amber-500 transition cursor-pointer"
                                  onClick={() => book && setSelectedBookForEdit(book)}
                                >
                                  {book?.title || 'Judul Tidak Diketahui'}
                                </div>
                                <div className="text-[11px] text-text-muted mt-0.5">
                                  {book?.author || '-'} • {book?.publisher} ({book?.publicationYear})
                                </div>
                                <div className="mt-1 flex items-center gap-1">
                                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">
                                    Punggung:
                                  </span>
                                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-500 font-bold">
                                    {book?.shelfCode || 'SR'}
                                  </span>
                                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-surface-2 border border-border text-text font-bold">
                                    {book?.classification || '813'}
                                  </span>
                                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-surface-2 border border-border text-text font-bold uppercase">
                                    {book?.authorCode || deriveAuthorCode(book?.author || '')}
                                  </span>
                                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-surface-2 border border-border text-text font-bold lowercase">
                                    {book?.titleCode || deriveTitleCode(book?.title || '')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1"
                              style={{ backgroundColor: `${cat.colorHex}20`, color: cat.colorHex }}
                            >
                              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cat.colorHex }} />
                              {cat.shortName}
                            </span>
                            <div className="text-[11px] text-text-muted mt-1">📍 {item.shelfLocation || book?.shelfLocation || 'Rak Utama'}</div>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap font-mono">
                            <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              {item.itemBarcode}
                            </span>
                            <div className="text-[10px] text-text-muted mt-0.5 font-sans">
                              Eksemplar #{item.copyNumber}
                            </div>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap text-[11px] text-text-muted">
                            <div>{item.acquisitionDate || '-'}</div>
                            <div className="text-[10px]">{item.source === 'BELI_SEKOLAH' ? 'Beli Sekolah' : 'Sumbangan'}</div>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                              ⚠️ Belum Cetak
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => onOpenLabelPrinter([item.itemBarcode])}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                                title="Cetak label barcode untuk eksemplar ini"
                              >
                                <Printer className="h-3.5 w-3.5" />
                                <span>Cetak</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  libraryStore.markLabelsPrinted([item.itemBarcode], true, 'MANUAL_STAMP');
                                  soundFx.playSuccessChime();
                                  setRefreshTick((r) => r + 1);
                                  onRefresh?.();
                                }}
                                className="px-2.5 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-bold text-xs inline-flex items-center gap-1.5 transition cursor-pointer"
                                title="Tandai eksemplar ini sudah dicap stempel / ditulis manual"
                              >
                                <CheckSquare className="h-3.5 w-3.5" />
                                <span>Tandai Dicap</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* 2. Toolbar: Search on left + Segmented Category Chips + View & Sort Toggles */}
          <div className="rounded-2xl bg-surface border border-border p-3.5 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchBiblioPlaceholder || 'Cari judul buku, nama pengarang, atau nomor ISBN...'}
              className="w-full rounded-xl border border-border bg-surface-2 pl-10 pr-4 py-2 text-xs text-text placeholder-text-muted focus:outline-hidden focus:ring-1 focus:ring-amber-500 transition"
            />
          </div>

          {/* Filter Label Status & Sort & View Mode */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Label Print Filter */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface-2 border border-border text-xs">
              <Tag className="h-3.5 w-3.5 text-text-muted" />
              <select
                value={labelFilter}
                onChange={(e) => setLabelFilter(e.target.value as any)}
                className="bg-transparent border-none outline-hidden text-xs text-text cursor-pointer font-medium"
              >
                <option value="ALL" className="bg-surface text-text">
                  {t.allLabels || 'Semua Label'}
                </option>
                <option value="UNPRINTED" className="bg-surface text-text">
                  {t.labelNotPrinted || 'Belum Cetak Label'} ({unprintedCount})
                </option>
                <option value="PRINTED" className="bg-surface text-text">
                  {t.labelPrinted || 'Sudah Ditempel Label'} ({printedCount})
                </option>
              </select>
            </div>

            {/* Shelf Location Filter (Hanya Tampil Jika Setting Rak ON) */}
            {isShelfFeatureEnabled && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface-2 border border-border text-xs">
                <Layers className="h-3.5 w-3.5 text-amber-500" />
                <select
                  value={shelfFilter}
                  onChange={(e) => setShelfFilter(e.target.value)}
                  className="bg-transparent border-none outline-hidden text-xs text-text cursor-pointer font-medium max-w-[150px] truncate"
                  title="Filter berdasarkan lokasi rak fisik buku"
                >
                  <option value="ALL" className="bg-surface text-text">
                    📍 Semua Rak Fisik
                  </option>
                  {uniqueShelves.map((sh) => (
                    <option key={sh} value={sh} className="bg-surface text-text">
                      {sh}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface-2 border border-border text-xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-text-muted" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none outline-hidden text-xs text-text cursor-pointer font-medium"
              >
                <option value="NEWEST" className="bg-surface text-text">{t.sortNewest || 'Terbaru'}</option>
                <option value="TITLE" className="bg-surface text-text">{t.sortTitle || 'Judul A-Z'}</option>
                <option value="COPIES" className="bg-surface text-text">{t.sortCopies || 'Paling Banyak Eksemplar'}</option>
              </select>
            </div>

            {/* Toggle Fitur Rak & Baris (ON / OFF - Default: OFF Sesuai Standar SBTH) */}
            <button
              type="button"
              onClick={() => {
                const next = !isShelfFeatureEnabled;
                setIsShelfFeatureEnabled(next);
                libraryStore.setShelfFeatureEnabled(next);
                soundFx.playScanBeep();
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
                isShelfFeatureEnabled
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 hover:bg-amber-500/25'
                  : 'bg-surface-2 border-border text-text-muted hover:text-text'
              }`}
              title="Klik untuk ON/OFF fitur setting Rak & Baris (Default: OFF, SBTH menyusun buku murni berdasarkan kategori e-DDC)"
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>{t.shelfSettingToggle || 'Setting Rak:'} <strong className={isShelfFeatureEnabled ? 'text-amber-500 font-extrabold' : 'text-text-muted'}>{isShelfFeatureEnabled ? 'ON' : 'OFF'}</strong></span>
            </button>

            {isShelfFeatureEnabled && (
              <button
                type="button"
                onClick={() => {
                  const next = !isShelfRowEnabled;
                  setIsShelfRowEnabled(next);
                  libraryStore.setShelfRowFeatureEnabled(next);
                  soundFx.playScanBeep();
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
                  isShelfRowEnabled
                    ? 'bg-sky-500/15 border-sky-500/40 text-sky-500 hover:bg-sky-500/25'
                    : 'bg-surface-2 border-border text-text-muted hover:text-text'
                }`}
                title="Klik untuk ON/OFF kolom Baris/Sap pada posisi rak"
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Kolom Baris: <strong className={isShelfRowEnabled ? 'text-sky-500 font-extrabold' : 'text-text-muted'}>{isShelfRowEnabled ? 'ON' : 'OFF'}</strong></span>
              </button>
            )}

            {/* View Mode Toggle (Cards, Table Tanpa Cover, Grid) */}
            <div className="flex items-center p-1 rounded-xl bg-surface-2 border border-border">
              <button
                type="button"
                onClick={() => setViewMode('CARDS')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'CARDS'
                    ? 'bg-amber-500 text-slate-950 shadow-2xs'
                    : 'text-text-muted hover:text-text'
                }`}
                title="Tampilan Kartu Lengkap & Cover"
              >
                <ListIcon className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('TABLE')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'TABLE'
                    ? 'bg-amber-500 text-slate-950 shadow-2xs'
                    : 'text-text-muted hover:text-text'
                }`}
                title="Tampilan Mode List / Tabel Cepat (Tanpa Cover)"
              >
                <TableIcon className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('GRID')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'GRID'
                    ? 'bg-amber-500 text-slate-950 shadow-2xs'
                    : 'text-text-muted hover:text-text'
                }`}
                title="Tampilan Grid Sampul"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Chips Bar: Ramping & Fleksibel (Wrap atau 1 Baris dengan Toggle) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              {t.ddcCategoriesLabel || 'Kategori e-DDC Dewey Decimal:'}
            </span>
            <button
              type="button"
              onClick={() => setIsCategoryWrap((w) => !w)}
              className="text-[10px] text-amber-500 hover:text-amber-600 font-semibold px-2 py-0.5 rounded-md hover:bg-surface-2 transition cursor-pointer"
            >
              {isCategoryWrap ? (t.scroll1Line || '↔️ Mode 1 Baris Geser') : (t.wrapView || '↕️ Tampilkan Semua (Wrap)')}
            </button>
          </div>

          <div
            className={`flex items-center gap-1.5 pb-1 ${
              isCategoryWrap ? 'flex-wrap' : 'overflow-x-auto scrollbar-thin scrollbar-thumb-border'
            }`}
          >
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-amber-500 text-slate-950 shadow-xs ring-1 ring-amber-400'
                  : 'bg-surface-2 text-text-muted hover:text-text border border-border/80'
              }`}
            >
              {language === 'zh' ? '全部' : language === 'en' ? 'All' : 'Semua'} ({books.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap flex items-center gap-1.5 transition cursor-pointer border ${
                  selectedCategory === cat.id
                    ? 'bg-surface-2 border-amber-500 text-amber-500 font-bold shadow-xs'
                    : 'bg-surface-2 border-border/80 text-text-muted hover:text-text hover:border-amber-500/40'
                }`}
                title={`Kategori ${cat.name} (${cat.ddcCode || ''})`}
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0 shadow-2xs"
                  style={{ backgroundColor: cat.colorHex }}
                />
                <span>{getDdcShortNameByCode(cat.ddcCode || '', language) || cat.shortName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Physical Status Filter Pills (Semua, Tersedia, Dipinjam, Rusak, Hilang, Dimusnahkan) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-border/60 text-xs font-semibold">
          <span className="text-[11px] text-text-muted mr-1 shrink-0">{t.statusFilterLabel || 'Filter Status:'}</span>
          {[
            { id: 'ALL', label: t.statusAll || 'Semua Status' },
            { id: 'AVAILABLE', label: t.statusAvailableRack || 'Tersedia di Rak' },
            { id: 'BORROWED', label: t.statusBorrowedTag || 'Sedang Dipinjam' },
            { id: 'DAMAGED', label: t.statusRepairTag || 'Perbaikan / Rusak' },
            { id: 'LOST', label: t.statusLostTag || 'Buku Hilang' },
            { id: 'DISPOSED', label: t.statusDisposedTag || 'Dimusnahkan' },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setStatusFilter(st.id as any)}
              className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap text-[11px] ${
                statusFilter === st.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                  : 'bg-surface-2 text-text-muted hover:text-text'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2b. Bulk Action Bar (Edit Massal Posisi Rak & Punggung Buku) */}
      <div className="rounded-2xl bg-surface border border-border p-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleSelectAllVisible}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              isAllVisibleSelected
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-2xs'
                : 'bg-surface-2 hover:bg-surface-3 border-border text-text'
            }`}
          >
            <CheckSquare className={`h-4 w-4 ${isAllVisibleSelected ? 'text-slate-950' : 'text-amber-500'}`} />
            <span>{t.selectAll || 'Pilih Semua'} ({filteredBooks.length} Judul • {allFilteredItemIds.length} Eks)</span>
          </button>

          {(selectedBookIds.length > 0 || selectedItemIds.length > 0) && (
            <button
              type="button"
              onClick={handleResetSelection}
              className="px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-rose-500/10 text-rose-500 border border-border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Pilihan ({selectedBookIds.length})</span>
            </button>
          )}

          <div className="text-xs text-text-muted">
            {selectedBookIds.length > 0 ? (
              <span className="text-amber-500 font-bold">
                ✓ {selectedBookIds.length} judul ({selectedItemIds.length} eksemplar) terpilih untuk edit massal
              </span>
            ) : (
              <span>Centang buku atau eksemplar untuk memindahkan rak & sinkron punggung massal</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sinkronkan Massal Punggung Buku Button */}
          <button
            type="button"
            onClick={() => setIsBulkSpineModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-500 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            title="Kustomisasi & Sinkronkan 4 Baris Stiker Punggung Buku secara massal"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>
              {selectedBookIds.length > 0
                ? `⚡ ${t.syncSpinesBtn || 'Sinkronkan Punggung'} (${selectedBookIds.length})`
                : `⚡ ${t.syncSpinesBtn || 'Sinkronkan Punggung Koleksi'}`}
            </span>
          </button>

          {(selectedItemIds.length > 0 || selectedBookIds.length > 0) && (
            <>
              {isShelfFeatureEnabled && (
                <>
                  <span className="text-xs font-semibold text-text whitespace-nowrap">Pindah ke:</span>
                  <select
                    value={bulkShelfTarget}
                    onChange={(e) => setBulkShelfTarget(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl bg-surface-2 border border-border text-xs text-text font-semibold outline-hidden cursor-pointer max-w-[210px] truncate"
                  >
                    <option value="" className="bg-surface text-text">-- Pilih Posisi Rak --</option>
                    {shelves.map((sh) => (
                      <option
                        key={sh.id}
                        value={isShelfRowEnabled ? `${sh.name} - Baris 1` : sh.name}
                        className="bg-surface text-text"
                      >
                        {sh.name} {isShelfRowEnabled ? '- Baris 1' : ''} ({sh.categoryName || sh.code})
                      </option>
                    ))}
                    {uniqueShelves.map((sh) => (
                      <option key={sh} value={sh} className="bg-surface text-text">
                        {sh}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!bulkShelfTarget}
                    onClick={handleApplyBulkShelf}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
                    title="Terapkan lokasi rak ke semua eksemplar terpilih"
                  >
                    <Check className="h-4 w-4" />
                    <span>Pindah ({selectedItemIds.length})</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => handleBulkMarkPrinted(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-500 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                title="Tandai terpilih sudah dicap stempel / ditulis nomor daftar manual (tanpa printer)"
              >
                <CheckSquare className="h-3.5 w-3.5" />
                <span>Tandai Dicap ({selectedItemIds.length > 0 ? selectedItemIds.length : allItems.filter((i) => selectedBookIds.includes(i.bookId)).length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const barcodes = allItems
                    .filter((i) => selectedItemIds.includes(i.id) || selectedBookIds.includes(i.bookId))
                    .map((i) => i.itemBarcode);
                  if (barcodes.length === 0) {
                    alert('Tidak ada eksemplar fisik pada buku yang dipilih.');
                    return;
                  }
                  onOpenLabelPrinter(barcodes);
                }}
                className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                title="Cetak stiker barcode untuk eksemplar terpilih (bisa cetak kapan saja)"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Cetak Barcode ({selectedItemIds.length > 0 ? selectedItemIds.length : allItems.filter((i) => selectedBookIds.includes(i.bookId)).length})</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Paginasi Atas (Top Pagination Bar) */}
      {renderPaginationBar('TOP')}

      {/* 3. Book List Cards / Table / Grid */}
      {viewMode === 'TABLE' ? (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-2 text-text-muted border-b border-border font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3 w-8 text-center">
                    <button
                      type="button"
                      onClick={handleSelectAllVisible}
                      title={isAllPageSelected ? 'Batalkan pilihan halaman ini' : `Pilih Semua di Halaman Ini (${paginatedBooks.length} Judul Buku)`}
                      className="p-1 rounded-md hover:bg-surface-3 transition cursor-pointer"
                    >
                      {isAllPageSelected ? (
                        <CheckSquare className="h-4 w-4 text-amber-500" />
                      ) : isSomePageSelected ? (
                        <div className="h-4 w-4 rounded border-2 border-amber-500 bg-amber-500/20 flex items-center justify-center text-[10px] text-amber-500 font-bold leading-none">-</div>
                      ) : (
                        <Square className="h-4 w-4 text-text-muted hover:text-amber-500" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4">{t.colBookTitle || 'No & Judul Buku'}</th>
                  <th className="py-3 px-3">{t.colCategory || 'Kategori'}</th>
                  <th className="py-3 px-3">{t.colIsbnCopies || 'ISBN & Eksemplar'}</th>
                  {isShelfFeatureEnabled && <th className="py-3 px-3">{language === 'zh' ? '书架位置' : language === 'en' ? 'Shelf Position' : 'Posisi Rak'}</th>}
                  {isShelfFeatureEnabled && isShelfRowEnabled && <th className="py-3 px-3">{language === 'zh' ? '层/行' : language === 'en' ? 'Row' : 'Baris'}</th>}
                  <th className="py-3 px-3">{t.colCondition || 'Kondisi / Status'}</th>
                  <th className="py-3 px-3 text-right">{t.colAssetValue || 'Nilai Aset'}</th>
                  <th className="py-3 px-4 text-right">{t.colActions || 'Aksi'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedBooks.map((book, idx) => {
                  const items = allItems.filter((i) => i.bookId === book.id);
                  const bookItemIds = items.map((i) => i.id);
                  const isBookSelected = selectedBookIds.includes(book.id) || (bookItemIds.length > 0 && bookItemIds.every((id) => selectedItemIds.includes(id)));
                  const someBookItemsSelected = !isBookSelected && (bookItemIds.some((id) => selectedItemIds.includes(id)) || selectedBookIds.includes(book.id));
                  const available = items.filter((i) => i.status === 'AVAILABLE').length;
                  const borrowed = items.filter((i) => i.status === 'BORROWED').length;
                  const inRepair = items.filter((i) => i.status === 'IN_REPAIR').length;
                  const damaged = items.filter((i) => i.status === 'DAMAGED').length;
                  const lost = items.filter((i) => i.status === 'LOST').length;
                  const disposed = items.filter((i) => i.status === 'DISPOSED').length;
                  const cat = categories.find((c) => c.id === book.categoryId) || CATEGORIES[0];

                  return (
                    <tr key={book.id} className="hover:bg-surface-2/50 transition">
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectBook(book.id)}
                          className="p-1 rounded-md hover:bg-surface-3 transition cursor-pointer"
                          title="Pilih buku ini untuk aksi massal"
                        >
                          {isBookSelected ? (
                            <CheckSquare className="h-4 w-4 text-amber-500" />
                          ) : someBookItemsSelected ? (
                            <div className="h-4 w-4 rounded border-2 border-amber-500 bg-amber-500/20 flex items-center justify-center text-[10px] text-amber-500 font-bold leading-none">-</div>
                          ) : (
                            <Square className="h-4 w-4 text-text-muted hover:text-text" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-text-muted w-5 shrink-0">{startIndex + idx + 1}.</span>
                          <div>
                            <div
                              className="font-bold text-text hover:text-amber-500 transition cursor-pointer"
                              onClick={() => setSelectedBookForEdit(book)}
                            >
                              {book.title}
                            </div>
                            <div className="text-[11px] text-text-muted mt-0.5">
                              {book.author} • {book.publisher} ({book.publicationYear}) {book.pageCount ? `• ${book.pageCount} Hal` : ''}
                            </div>
                            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5 flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5 shrink-0" />
                              <span>{t.inputted || 'Diinput'}: {formatDateTimeIndo(book.createdAt)}</span>
                            </div>

                            {/* Standar Punggung Buku SBTH 4-Baris Badge */}
                            <div className="mt-1 flex flex-wrap items-center gap-1">
                              <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">
                                {t.spineLabel || 'Punggung'}:
                              </span>
                              <span
                                className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-500 font-bold"
                                title="Baris 1: Kode Rak / Kategori"
                              >
                                {book.shelfCode || 'SR'}
                              </span>
                              <span
                                className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-surface-2 border border-border text-text font-bold"
                                title="Baris 2: Nomor Klasifikasi DDC"
                              >
                                {book.classification || '813'}
                              </span>
                              <span
                                className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-surface-2 border border-border text-text font-bold uppercase"
                                title="Baris 3: 3 Huruf Pengarang (Cutter)"
                              >
                                {book.authorCode || deriveAuthorCode(book.author)}
                              </span>
                              <span
                                className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-surface-2 border border-border text-text font-bold lowercase"
                                title="Baris 4: 1 Huruf Depan Judul"
                              >
                                {book.titleCode || deriveTitleCode(book.title)}
                              </span>
                              <span className="text-[9px] text-text-muted font-mono ml-0.5" title="Nomor Panggil SLiMS">
                                ({book.callNumber || `${book.classification || '813'} ${book.authorCode || deriveAuthorCode(book.author)} ${book.titleCode || deriveTitleCode(book.title)}`})
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1"
                          style={{ backgroundColor: `${cat.colorHex}20`, color: cat.colorHex }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cat.colorHex }} />
                          {getDdcShortNameByCode(cat.ddcCode || '', language) || cat.shortName}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-text-muted">
                        <div>{book.isbn}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-amber-500 font-sans font-semibold">{items.length} {t.copiesShort || 'Eks'}</span>
                          {items.some(i => !i.labelPrinted) ? (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/15 text-amber-500 font-bold" title="Ada eksemplar belum dicap/dicetak">
                              {items.filter(i => !i.labelPrinted).length} {t.unprintedShort || 'Belum'}
                            </span>
                          ) : (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/15 text-emerald-500 font-bold" title="Semua eksemplar sudah dicap/dicetak">
                              ✓ {t.affixedShort || 'Dicap'}
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Posisi Rak Cepat & Baris Cepat */}
                      {(() => {
                        const parsedShelf = parseShelfLocation(book.shelfLocation);
                        return (
                          <>
                            {isShelfFeatureEnabled && (
                              <td className="py-3 px-3 whitespace-nowrap">
                                {/* Inline quick shelf changer dropdown */}
                                <div className="inline-flex items-center gap-1 bg-surface-2 px-2 py-1 rounded-lg border border-border">
                                  <MapPin className="h-3 w-3 text-amber-500 shrink-0" />
                                  <select
                                    value={shelves.some((s) => s.name === parsedShelf.shelfName) ? parsedShelf.shelfName : parsedShelf.shelfName || ''}
                                    onChange={(e) => {
                                      const newShelf = e.target.value;
                                      const combined = combineShelfLocation(newShelf, parsedShelf.rowName, isShelfRowEnabled);
                                      libraryStore.updateBookShelf(book.id, combined);
                                      soundFx.playSuccessChime();
                                      setRefreshTick((r) => r + 1);
                                    }}
                                    className="bg-transparent text-[11px] font-semibold text-text outline-hidden cursor-pointer max-w-[130px] truncate"
                                    title="Klik untuk memilih nama rak buku ini"
                                  >
                                    <option value="" className="bg-surface text-text">Pilih Rak...</option>
                                    {shelves.map((sh) => (
                                      <option key={sh.id} value={sh.name} className="bg-surface text-text">
                                        {sh.name} ({sh.categoryName || sh.code})
                                      </option>
                                    ))}
                                    {parsedShelf.shelfName && !shelves.some((s) => s.name === parsedShelf.shelfName) && (
                                      <option value={parsedShelf.shelfName} className="bg-surface text-text">
                                        {parsedShelf.shelfName}
                                      </option>
                                    )}
                                  </select>
                                </div>
                              </td>
                            )}

                            {isShelfFeatureEnabled && isShelfRowEnabled && (
                              <td className="py-3 px-3 whitespace-nowrap">
                                <div className="inline-flex items-center gap-1 bg-surface-2 px-2 py-1 rounded-lg border border-border">
                                  <Layers className="h-3 w-3 text-sky-500 shrink-0" />
                                  <select
                                    value={parsedShelf.rowName || ''}
                                    onChange={(e) => {
                                      const newRow = e.target.value;
                                      const baseShelf = parsedShelf.shelfName || shelves[0]?.name || 'Rak Utama';
                                      const combined = combineShelfLocation(baseShelf, newRow, true);
                                      libraryStore.updateBookShelf(book.id, combined);
                                      soundFx.playSuccessChime();
                                      setRefreshTick((r) => r + 1);
                                    }}
                                    className="bg-transparent text-[11px] font-semibold text-sky-600 dark:text-sky-400 outline-hidden cursor-pointer min-w-[85px]"
                                    title="Klik untuk memilih tingkat/baris rak buku ini"
                                  >
                                    <option value="" className="bg-surface text-text">- Tanpa Baris -</option>
                                    {DEFAULT_SHELF_ROWS.map((r) => (
                                      <option key={r} value={r} className="bg-surface text-text">
                                        {r}
                                      </option>
                                    ))}
                                    {parsedShelf.rowName && !DEFAULT_SHELF_ROWS.includes(parsedShelf.rowName) && (
                                      <option value={parsedShelf.rowName} className="bg-surface text-text">
                                        {parsedShelf.rowName}
                                      </option>
                                    )}
                                  </select>
                                </div>
                              </td>
                            )}
                          </>
                        );
                      })()}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex flex-wrap items-center gap-1 text-[10px]">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500 font-bold">
                            {available} {t.availableShort || 'Ada'}
                          </span>
                          {borrowed > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500 font-bold">
                              {borrowed} {t.borrowedShort || 'Pinjam'}
                            </span>
                          )}
                          {(damaged > 0 || inRepair > 0) && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-500 font-bold">
                              {damaged + inRepair} {t.repairShort || 'Rusak'}
                            </span>
                          )}
                          {lost > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-500 font-bold">
                              {lost} {language === 'zh' ? '丢失' : language === 'en' ? 'Lost' : 'Hilang'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-right font-mono text-[11px] text-text">
                        {book.assetValue ? `Rp ${book.assetValue.toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedBookForEdit(book)}
                            className="p-1.5 rounded-lg border border-border hover:bg-surface-2 text-amber-500 transition cursor-pointer"
                            title="Edit Buku & Eksemplar"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setNewCopiesCount(1);
                              setSelectedBookForCopies(book);
                            }}
                            className="p-1.5 rounded-lg border border-border hover:bg-surface-2 text-emerald-500 transition cursor-pointer"
                            title="Tambah Eksemplar"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                          {items.some((i) => !i.labelPrinted) && (
                            <button
                              type="button"
                              onClick={() => {
                                const unprinted = items.filter((i) => !i.labelPrinted).map((i) => i.itemBarcode);
                                libraryStore.markLabelsPrinted(unprinted, true, 'MANUAL_STAMP');
                                soundFx.playSuccessChime();
                                setRefreshTick((r) => r + 1);
                                onRefresh?.();
                              }}
                              className="p-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 transition cursor-pointer"
                              title="Tandai semua eksemplar buku ini sudah dicap manual / ditulis ballpoint"
                            >
                              <CheckSquare className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const bcs = items.map((i) => i.itemBarcode);
                              if (bcs.length === 0) {
                                alert(`Buku "${book.title}" belum memiliki eksemplar fisik. Silakan tambahkan eksemplar terlebih dahulu menggunakan tombol (+).`);
                                return;
                              }
                              onOpenLabelPrinter(bcs);
                            }}
                            className="p-1.5 rounded-lg border border-border hover:bg-surface-2 text-text-muted hover:text-text transition cursor-pointer"
                            title="Cetak Label Barcode (tetap bisa dicetak kapan saja)"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className={viewMode === 'GRID' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
          {paginatedBooks.map((book) => {
            const items = allItems.filter((i) => i.bookId === book.id);
            const available = items.filter((i) => i.status === 'AVAILABLE').length;
            const borrowed = items.filter((i) => i.status === 'BORROWED').length;
            const inRepair = items.filter((i) => i.status === 'IN_REPAIR').length;
            const damaged = items.filter((i) => i.status === 'DAMAGED').length;
            const lost = items.filter((i) => i.status === 'LOST').length;
            const disposed = items.filter((i) => i.status === 'DISPOSED').length;
            const unprintedInBook = items.filter((i) => !i.labelPrinted).length;
            const cat = categories.find((c) => c.id === book.categoryId) || CATEGORIES[0];
            const expanded = isBookExpanded(book.id);
            const bookItemIds = items.map((i) => i.id);
            const isBookSelected = selectedBookIds.includes(book.id) || (bookItemIds.length > 0 && bookItemIds.every((id) => selectedItemIds.includes(id)));
            const someBookItemsSelected = !isBookSelected && (bookItemIds.some((id) => selectedItemIds.includes(id)) || selectedBookIds.includes(book.id));

            return (
              <div
                key={book.id}
                className="rounded-2xl bg-surface border border-border p-4 sm:p-5 shadow-xs hover:border-border/80 transition space-y-4"
              >
                {/* Card Header: Cover (56x75) | Info | Badges & Actions */}
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    {/* Book-level Checkbox for Bulk Selection */}
                    <button
                      type="button"
                      onClick={() => toggleSelectBook(book.id)}
                      className="p-1 rounded-md hover:bg-surface-2 transition self-center sm:self-start mt-1 cursor-pointer"
                      title="Pilih buku ini untuk aksi massal"
                    >
                      {isBookSelected ? (
                        <CheckSquare className="h-4 w-4 text-amber-500" />
                      ) : someBookItemsSelected ? (
                        <div className="h-4 w-4 rounded border-2 border-amber-500 bg-amber-500/20 flex items-center justify-center text-[10px] text-amber-500 font-bold leading-none">-</div>
                      ) : (
                        <Square className="h-4 w-4 text-text-muted hover:text-text" />
                      )}
                    </button>

                    <div className="h-[75px] w-[56px] rounded-lg overflow-hidden shrink-0 border border-border bg-surface-2 shadow-2xs">
                      <SmartBookCover
                        title={book.title}
                        author={book.author}
                        coverUrl={book.coverImage}
                        categoryId={book.categoryId}
                        aspectRatio="h-full w-full"
                      />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase"
                          style={{ backgroundColor: `${cat.colorHex}20`, color: cat.colorHex }}
                        >
                          {getDdcShortNameByCode(cat.ddcCode || '', language) || cat.name}
                        </span>
                        <span className="text-[11px] font-mono text-text-muted">
                          ISBN: {book.isbn}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          <Clock className="h-2.5 w-2.5" />
                          <span>{t.inputted || 'Input'}: {formatDateTimeIndo(book.createdAt)}</span>
                        </span>
                        {unprintedInBook > 0 && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-500 border border-amber-500/30">
                            {unprintedInBook} {language === 'zh' ? '未打印标签' : language === 'en' ? 'Unprinted Labels' : 'Belum Cetak Label'}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-semibold text-text mt-1 leading-snug">
                        {book.title}
                      </h3>

                      {/* Standar Punggung Buku SBTH 4-Baris Badge */}
                      <div className="mt-1 flex flex-wrap items-center gap-1">
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">
                          {t.spineLabel || 'Punggung'}:
                        </span>
                        <span
                          className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-500 font-bold"
                          title="Baris 1: Kode Rak / Kategori"
                        >
                          {book.shelfCode || 'SR'}
                        </span>
                        <span
                          className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-surface-2 border border-border text-text font-bold"
                          title="Baris 2: Nomor Klasifikasi DDC"
                        >
                          {book.classification || '813'}
                        </span>
                        <span
                          className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-surface-2 border border-border text-text font-bold uppercase"
                          title="Baris 3: 3 Huruf Pengarang (Cutter)"
                        >
                          {book.authorCode || deriveAuthorCode(book.author)}
                        </span>
                        <span
                          className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-surface-2 border border-border text-text font-bold lowercase"
                          title="Baris 4: 1 Huruf Depan Judul"
                        >
                          {book.titleCode || deriveTitleCode(book.title)}
                        </span>
                        <span className="text-[9px] text-text-muted font-mono ml-0.5" title="Nomor Panggil SLiMS">
                          ({book.callNumber || `${book.classification || '813'} ${book.authorCode || deriveAuthorCode(book.author)} ${book.titleCode || deriveTitleCode(book.title)}`})
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-text-muted mt-1">
                        <span>{book.author} • {book.publisher} ({book.publicationYear})</span>
                        {book.pageCount && <span>• 📄 {book.pageCount} Hal</span>}
                        {/* Quick Inline Shelf Selector */}
                        {(() => {
                          if (!isShelfFeatureEnabled) return null;
                          const parsedShelf = parseShelfLocation(book.shelfLocation);
                          return (
                            <div className="inline-flex items-center gap-1.5 flex-wrap">
                              <div className="inline-flex items-center gap-1 bg-surface-2 px-2 py-0.5 rounded-md border border-border">
                                <MapPin className="h-3 w-3 text-amber-500 shrink-0" />
                                <select
                                  value={shelves.some((s) => s.name === parsedShelf.shelfName) ? parsedShelf.shelfName : parsedShelf.shelfName || ''}
                                  onChange={(e) => {
                                    const newShelf = e.target.value;
                                    const combined = combineShelfLocation(newShelf, parsedShelf.rowName, isShelfRowEnabled);
                                    libraryStore.updateBookShelf(book.id, combined);
                                    soundFx.playSuccessChime();
                                    setRefreshTick((r) => r + 1);
                                  }}
                                  className="bg-transparent text-[11px] font-semibold text-amber-500 outline-hidden cursor-pointer max-w-[140px] truncate"
                                  title="Ubah posisi rak buku ini"
                                >
                                  <option value="" className="bg-surface text-text">Pilih Rak...</option>
                                  {shelves.map((sh) => (
                                    <option key={sh.id} value={sh.name} className="bg-surface text-text">
                                      {sh.name}
                                    </option>
                                  ))}
                                  {parsedShelf.shelfName && !shelves.some((s) => s.name === parsedShelf.shelfName) && (
                                    <option value={parsedShelf.shelfName} className="bg-surface text-text">
                                      {parsedShelf.shelfName}
                                    </option>
                                  )}
                                </select>
                              </div>

                              {isShelfRowEnabled && (
                                <div className="inline-flex items-center gap-1 bg-surface-2 px-2 py-0.5 rounded-md border border-border">
                                  <Layers className="h-3 w-3 text-sky-500 shrink-0" />
                                  <select
                                    value={parsedShelf.rowName || ''}
                                    onChange={(e) => {
                                      const newRow = e.target.value;
                                      const baseShelf = parsedShelf.shelfName || shelves[0]?.name || 'Rak Utama';
                                      const combined = combineShelfLocation(baseShelf, newRow, true);
                                      libraryStore.updateBookShelf(book.id, combined);
                                      soundFx.playSuccessChime();
                                      setRefreshTick((r) => r + 1);
                                    }}
                                    className="bg-transparent text-[11px] font-semibold text-sky-500 outline-hidden cursor-pointer"
                                    title="Ubah baris/tingkat rak buku ini"
                                  >
                                    <option value="" className="bg-surface text-text">- Tanpa Baris -</option>
                                    {DEFAULT_SHELF_ROWS.map((r) => (
                                      <option key={r} value={r} className="bg-surface text-text">
                                        {r}
                                      </option>
                                    ))}
                                    {parsedShelf.rowName && !DEFAULT_SHELF_ROWS.includes(parsedShelf.rowName) && (
                                      <option value={parsedShelf.rowName} className="bg-surface text-text">
                                        {parsedShelf.rowName}
                                      </option>
                                    )}
                                  </select>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Status Pills & Actions */}
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[11px] font-medium">
                        {available} {t.statusAvailableRack || 'Ada di Rak'}
                      </span>
                      {borrowed > 0 && (
                        <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[11px] font-medium">
                          {borrowed} {t.statusBorrowedTag || 'Dipinjam'}
                        </span>
                      )}
                      {inRepair > 0 && (
                        <span className="px-2.5 py-1 rounded-md bg-sky-500/10 text-sky-500 border border-sky-500/20 text-[11px] font-medium">
                          {inRepair} {t.statusRepairTag || 'Perbaikan'}
                        </span>
                      )}
                      {damaged > 0 && (
                        <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[11px] font-medium">
                          {damaged} {t.repairShort || 'Rusak'}
                        </span>
                      )}
                      {lost > 0 && (
                        <span className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-500 border border-purple-500/20 text-[11px] font-medium">
                          {lost} {t.statusLostTag || 'Hilang'}
                        </span>
                      )}
                      {disposed > 0 && (
                        <span className="px-2.5 py-1 rounded-md bg-slate-500/10 text-slate-400 border border-slate-500/20 text-[11px] font-medium">
                          {disposed} {t.statusDisposedTag || 'Dimusnahkan'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedBookForEdit(book)}
                        className="px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-2 text-amber-500 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                        title={t.editBook || 'Edit Buku & Eksemplar'}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>{language === 'zh' ? '编辑' : language === 'en' ? 'Edit' : 'Edit Buku'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setNewCopiesCount(1);
                          setSelectedBookForCopies(book);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-border bg-surface-2 hover:bg-surface text-text text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                        title="Tambah Eksemplar Fisik"
                      >
                        <Plus className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{t.copiesShort || 'Eksemplar'}</span>
                      </button>

                      {unprintedInBook > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const unprintedBarcodes = items.filter((i) => !i.labelPrinted).map((i) => i.itemBarcode);
                            libraryStore.markLabelsPrinted(unprintedBarcodes, true, 'MANUAL_STAMP');
                            soundFx.playSuccessChime();
                            setRefreshTick((r) => r + 1);
                            onRefresh?.();
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                          title="Tandai semua eksemplar belum cetak di buku ini sudah dicap / ditulis ballpoint"
                        >
                          <CheckSquare className="h-3.5 w-3.5" />
                          <span>Tandai Dicap ({unprintedInBook})</span>
                        </button>
                      )}

                      {unprintedInBook > 0 && unprintedInBook < items.length && (
                        <button
                          type="button"
                          onClick={() => onOpenLabelPrinter(items.filter((i) => !i.labelPrinted).map((i) => i.itemBarcode))}
                          className="px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                          title="Cetak stiker label untuk salinan baru saja (tidak cetak ulang eksemplar lama)"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span>Cetak Label Baru ({unprintedInBook})</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          const bcs = items.map((i) => i.itemBarcode);
                          if (bcs.length === 0) {
                            alert(`Buku "${book.title}" belum memiliki eksemplar fisik. Silakan tambahkan eksemplar terlebih dahulu.`);
                            return;
                          }
                          onOpenLabelPrinter(bcs);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-2 text-text text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                        title="Cetak label untuk semua eksemplar judul buku ini (bisa dicetak kapan saja)"
                      >
                        <Printer className="h-3.5 w-3.5 text-text-muted" />
                        <span>Cetak Semua ({items.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleBookExpand(book.id)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-2 transition cursor-pointer"
                        title={expanded ? 'Tutup Daftar Eksemplar' : 'Buka Daftar Eksemplar'}
                      >
                        {expanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Physical Copies Collapsible Section */}
                {expanded && (
                  <div className="pt-3 border-t border-border/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                        Daftar Eksemplar Fisik ({items.length} Buku) • Klik chip untuk kelola status / perbaikan
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {items.map((item) => {
                        let borderClass = 'border-l-emerald-500';
                        let statusBadge = (
                          <span className="text-emerald-500 font-bold">TERSEDIA</span>
                        );

                        if (item.status === 'BORROWED') {
                          borderClass = 'border-l-amber-500';
                          statusBadge = <span className="text-amber-500 font-bold">DIPINJAM</span>;
                        } else if (item.status === 'IN_REPAIR') {
                          borderClass = 'border-l-sky-500';
                          statusBadge = <span className="text-sky-500 font-bold">PERBAIKAN</span>;
                        } else if (item.status === 'DAMAGED') {
                          borderClass = 'border-l-rose-500';
                          statusBadge = <span className="text-rose-500 font-bold">RUSAK</span>;
                        } else if (item.status === 'LOST') {
                          borderClass = 'border-l-purple-500';
                          statusBadge = <span className="text-purple-500 font-bold">HILANG</span>;
                        } else if (item.status === 'DISPOSED') {
                          borderClass = 'border-l-slate-500 opacity-60';
                          statusBadge = <span className="text-slate-400 font-bold">DIMUSNAHKAN</span>;
                        }

                        const isItemSelected = selectedItemIds.includes(item.id);

                        return (
                          <div
                            key={item.id}
                            onClick={() => handleOpenStatusModal(item)}
                            className={`p-2.5 rounded-xl bg-surface-2 border-0 border-l-[3px] ${borderClass} hover:ring-1 hover:ring-amber-500/50 cursor-pointer transition flex flex-col justify-between select-none shadow-2xs ${
                              isItemSelected ? 'ring-2 ring-amber-500 bg-amber-500/10' : ''
                            }`}
                            title="Klik untuk ubah kondisi (Buku Rusak, Perbaikan, Hilang, Dimusnahkan)"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSelectItem(item.id);
                                  }}
                                  className="text-text-muted hover:text-amber-500 transition"
                                  title="Pilih eksemplar ini untuk edit massal posisi rak"
                                >
                                  {isItemSelected ? (
                                    <CheckSquare className="h-3.5 w-3.5 text-amber-500" />
                                  ) : (
                                    <Square className="h-3.5 w-3.5 text-text-muted hover:text-text" />
                                  )}
                                </button>
                                <span className="font-mono text-xs font-semibold text-text">
                                  {item.itemBarcode}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenLabelPrinter([item.itemBarcode]);
                                  }}
                                  className="p-1 rounded-md text-text-muted hover:text-amber-500 hover:bg-surface transition cursor-pointer"
                                  title={`Cetak stiker label untuk eksemplar ini saja (${item.itemBarcode} - Copy #${item.copyNumber})`}
                                >
                                  <Printer className="h-3 w-3" />
                                </button>
                                <span className="text-[10px] text-text-muted font-medium">
                                  #{item.copyNumber}
                                </span>
                              </div>
                            </div>

                            <div className="mt-1.5 flex items-center justify-between text-[10px]">
                              {statusBadge}
                              <span className="text-text-muted truncate max-w-[70px]">
                                {item.source === 'BELI_SEKOLAH' ? 'Beli' : 'Sumbangan'}
                              </span>
                            </div>

                            {/* Shelf & Label Status indicator */}
                            <div className="mt-1 pt-1 border-t border-border/40 flex items-center justify-between text-[9px] text-text-muted">
                              <span className="truncate">📍 {item.shelfLocation || book.shelfLocation || 'Rak'}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newPrinted = !item.labelPrinted;
                                  libraryStore.markLabelsPrinted(
                                    [item.itemBarcode],
                                    newPrinted,
                                    newPrinted ? 'MANUAL_STAMP' : undefined
                                  );
                                  soundFx.playScanBeep();
                                  setRefreshTick((r) => r + 1);
                                  onRefresh?.();
                                }}
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition cursor-pointer ${
                                  item.labelPrinted
                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20'
                                }`}
                                title={
                                  item.labelPrinted
                                    ? 'Status: Sudah Dicap / Cetak Label. Klik untuk ubah jadi Belum.'
                                    : 'Status: Belum. Klik untuk langsung tandai Sudah Dicap / Ditulis manual (tanpa printer).'
                                }
                              >
                                {item.labelPrinted ? '🏷️ Dicap/Cetak' : '⚠️ Belum'}
                              </button>
                            </div>

                            {item.conditionNote && (
                              <div className="mt-0.5 text-[9px] text-text-muted truncate" title={item.conditionNote}>
                                📝 {item.conditionNote}
                              </div>
                            )}

                            {item.status === 'DISPOSED' && item.disposalReason && (
                              <div className="mt-0.5 text-[9px] text-rose-500 truncate" title={item.disposalReason}>
                                🗑️ {item.disposalReason}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Paginasi Bawah (Bottom Pagination Bar) */}
      {renderPaginationBar('BOTTOM')}
        </>
      )}


      {/* MODAL EDIT BUKU LENGKAP */}
      {selectedBookForEdit && (
        <EditBookModal
          book={selectedBookForEdit}
          isOpen={!!selectedBookForEdit}
          onClose={() => setSelectedBookForEdit(null)}
          onSaved={() => {
            setSelectedBookForEdit(null);
            setRefreshTick((r) => r + 1);
          }}
        />
      )}

      {/* SINKRONISASI MASSAL PUNGGUNG BUKU SBTH (4 BARIS VERTIKAL) */}
      {isBulkSpineModalOpen && (
        <BulkSpineSyncModal
          isOpen={isBulkSpineModalOpen}
          onClose={() => setIsBulkSpineModalOpen(false)}
          selectedBookIds={selectedBookIds}
          onSuccess={(count) => {
            setRefreshTick((r) => r + 1);
            onRefresh?.();
          }}
        />
      )}

      {/* 4 MODALS SISTEM LENGKAP: RAK DINAMIS, KATEGORI & WARNA, STOCK OPNAME, LOG RIWAYAT BESAR */}
      <ShelfManagementModal
        isOpen={isShelfModalOpen}
        onClose={() => {
          setIsShelfModalOpen(false);
          setIsShelfRowEnabled(libraryStore.isShelfRowFeatureEnabled());
          setRefreshTick((r) => r + 1);
        }}
        onShelvesUpdated={() => {
          setIsShelfRowEnabled(libraryStore.isShelfRowFeatureEnabled());
          setRefreshTick((r) => r + 1);
        }}
      />

      <CategoryManagementModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setRefreshTick((r) => r + 1);
        }}
      />

      <StockOpnameModal
        isOpen={isStockOpnameOpen}
        onClose={() => {
          setIsStockOpnameOpen(false);
          setRefreshTick((r) => r + 1);
        }}
      />

      <ActivityLogModal
        isOpen={isActivityLogOpen}
        onClose={() => {
          setIsActivityLogOpen(false);
        }}
      />

      {/* Modal Tambah Eksemplar Cepat */}
      {selectedBookForCopies && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl bg-surface border border-border p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-text">Tambah Eksemplar Fisik</h3>
            <p className="text-xs text-text-muted">
              Tambahkan eksemplar fisik baru untuk buku:{' '}
              <strong className="text-text">{selectedBookForCopies.title}</strong>
            </p>

            <div>
              <label className="text-xs font-semibold text-text block mb-1">
                Jumlah Eksemplar Tambahan:
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={newCopiesCount}
                onChange={(e) => setNewCopiesCount(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-bold text-text outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setSelectedBookForCopies(null)}
                className="px-4 py-2 text-xs font-semibold text-text-muted rounded-xl hover:bg-surface-2"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAddCopies}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs"
              >
                Tambah Eksemplar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ubah Status / Kondisi Eksemplar */}
      {selectedItemForStatus && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-surface border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-text">Kelola Kondisi Eksemplar Fisik</h3>
                <span className="text-xs font-mono text-amber-500 font-semibold">
                  {selectedItemForStatus.itemBarcode} (Copy #{selectedItemForStatus.copyNumber})
                </span>
              </div>
              <button
                onClick={() => setSelectedItemForStatus(null)}
                className="p-1 rounded-lg text-text-muted hover:text-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItemStatus} className="space-y-3 text-xs">
              <div>
                <label className="text-xs font-semibold text-text block mb-1">
                  Status Fisik Saat Ini:
                </label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value as BookStatus)}
                  className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-text outline-hidden"
                >
                  <option value="AVAILABLE">🟢 Tersedia di Rak (Baik & Siap Pinjam)</option>
                  <option value="IN_REPAIR">🟡 Sedang Diperbaiki (Dilem / Perawatan Guru)</option>
                  <option value="DAMAGED">🔴 Rusak Berat (Perlu Diganti)</option>
                  <option value="LOST">🟣 Hilang</option>
                  <option value="DISPOSED">🗑️ Dimusnahkan (Dihapus dari Aset Aktif)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1">
                  Catatan Kondisi Fisik:
                </label>
                <input
                  type="text"
                  value={conditionNoteInput}
                  onChange={(e) => setConditionNoteInput(e.target.value)}
                  placeholder="Contoh: Halaman 4 robek sedikit, sudah diisolasi bening"
                  className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs text-text placeholder-text-muted focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Disposal Reason input if DISPOSED */}
              {statusInput === 'DISPOSED' && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                  <label className="text-xs font-bold text-rose-500 flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    Alasan Pemusnahan / No. Berita Acara:
                  </label>
                  <textarea
                    rows={2}
                    value={disposalReasonInput}
                    onChange={(e) => setDisposalReasonInput(e.target.value)}
                    placeholder="Contoh: BA-MUSNAH/2026/04 - Buku basah parah dan berjamur, disetujui Kepala Sekolah"
                    className="w-full rounded-lg border border-rose-500/40 bg-surface px-3 py-2 text-xs text-text placeholder-text-muted focus:outline-hidden focus:ring-1 focus:ring-rose-400"
                    required
                  />
                  <p className="text-[10px] text-text-muted">
                    💡 <em>Aturan Akuntansi Perpustakaan:</em> Nilai buku ini akan otomatis dikurangkan dari nilai total aset rak perpustakaan, namun riwayat eksemplar tetap tersimpan dalam sistem untuk audit akreditasi.
                  </p>
                </div>
              )}

              {/* Riwayat Peminjaman Eksemplar Ini */}
              {(() => {
                const itemCirc = libraryStore.getItemCirculationInfo(selectedItemForStatus.itemBarcode);
                return (
                  <div className="pt-2 border-t border-border space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-text flex items-center gap-1.5">
                        <History className="h-3.5 w-3.5 text-text-muted" />
                        Riwayat Peminjaman Eksemplar Ini ({itemCirc.history.length}x)
                      </span>
                    </div>
                    {itemCirc.history && itemCirc.history.length > 0 ? (
                      <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                        {itemCirc.history.map((h, i) => (
                          <div
                            key={i}
                            className="p-2 rounded-lg bg-surface-2 border border-border text-[11px] flex items-center justify-between"
                          >
                            <div>
                              <div className="font-semibold text-text">
                                {h.member.name}{' '}
                                <span className="text-text-muted font-normal">
                                  ({h.member.classGroup})
                                </span>
                              </div>
                              <div className="text-[10px] text-text-muted">
                                Pinjam: {h.loan.loanDate} → Kembali:{' '}
                                {h.loanItem.returnDate || 'Belum'}
                              </div>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                h.loanItem.returnDate
                                  ? 'bg-emerald-500/15 text-emerald-500'
                                  : 'bg-amber-500/15 text-amber-500'
                              }`}
                            >
                              {h.loanItem.returnDate ? 'Dikembalikan' : 'Sedang Dipinjam'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-text-muted italic">
                        Eksemplar fisik ini baru dan belum memiliki riwayat peminjaman.
                      </p>
                    )}
                  </div>
                );
              })()}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setSelectedItemForStatus(null)}
                  className="px-4 py-2 text-xs font-semibold text-text-muted rounded-xl hover:bg-surface-2 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition"
                >
                  Simpan Perubahan Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL BERITA ACARA PEMUSNAHAN BUKU (BAST) */}
      {isBastModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white text-slate-900 shadow-2xl p-6 sm:p-8 my-8 border border-slate-200">
            {/* Header controls (hidden when printing) */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Pratinjau Berita Acara Pemusnahan Buku (BAST)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <Printer className="h-4 w-4" />
                  <span>Cetak Dokumen / Simpan PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsBastModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Sheet */}
            <div className="pt-4 space-y-5 text-xs text-slate-800 leading-relaxed">
              {/* Kop Surat Sekolah */}
              <div className="text-center border-b-2 border-slate-900 pb-3">
                <h2 className="text-base sm:text-lg font-bold tracking-wide uppercase">
                  YAYASAN BINA TUNAS HARAPAN
                </h2>
                <h3 className="text-lg sm:text-xl font-extrabold text-amber-600 uppercase tracking-wider">
                  TK BINA TUNAS HARAPAN (SBTH)
                </h3>
                <p className="text-xs text-slate-600">
                  UNIT PERPUSTAKAAN SEKOLAH RAMAH ANAK • NSS/NPSN: 0021481092 / 20109921
                </p>
                <p className="text-[11px] text-slate-500">
                  Jl. Bina Tunas Harapan No. 1, Kota SBTH • Email: perpustakaan@sbth.sch.id
                </p>
              </div>

              {/* Judul Surat */}
              <div className="text-center space-y-1">
                <h4 className="text-sm sm:text-base font-bold uppercase underline">
                  BERITA ACARA PEMUSNAHAN / WEEDING KOLEKSI PUSTAKA
                </h4>
                <p className="text-xs font-mono text-slate-600">
                  Nomor: BAST-PUS/SBTH/{new Date().getFullYear()}/{String(new Date().getMonth() + 1).padStart(2, '0')}/001
                </p>
              </div>

              {/* Pembuka */}
              <p className="text-justify">
                Pada hari ini, tanggal <strong>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>, bertempat di Perpustakaan TK Bina Tunas Harapan, kami yang bertanda tangan di bawah ini telah melakukan pemeriksaan fisik, verifikasi administrasi, dan pemusnahan (afkir/weeding) terhadap eksemplar koleksi buku perpustakaan yang dinyatakan rusak berat, hilang permanen, atau kadaluarsa kurikulum:
              </p>

              {/* Tabel Daftar Buku */}
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 border-b border-slate-300 font-bold">
                    <tr>
                      <th className="py-2 px-2.5 w-8">No</th>
                      <th className="py-2 px-2.5">Barcode & Copy</th>
                      <th className="py-2 px-2.5">Judul Buku & Pengarang</th>
                      <th className="py-2 px-2.5">No. Panggil</th>
                      <th className="py-2 px-2.5">Alasan Pemusnahan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {disposedItems.map((item, idx) => {
                      const b = books.find((x) => x.id === item.bookId);
                      return (
                        <tr key={item.id}>
                          <td className="py-1.5 px-2.5 font-mono">{idx + 1}.</td>
                          <td className="py-1.5 px-2.5 font-mono font-bold">
                            {item.itemBarcode} (#{item.copyNumber})
                          </td>
                          <td className="py-1.5 px-2.5">
                            <strong>{b?.title || 'Judul Buku'}</strong> - {b?.author || '-'}
                          </td>
                          <td className="py-1.5 px-2.5 font-mono text-[10px]">
                            {b?.callNumber || '-'}
                          </td>
                          <td className="py-1.5 px-2.5 italic text-rose-700">
                            {item.disposalReason || item.conditionNote || 'Rusak Berat / Afkir'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <p className="text-[11px] text-slate-600">
                Total eksemplar yang dimusnahkan: <strong>{disposedCount} eksemplar</strong>. Buku-buku tersebut di atas telah dikeluarkan dari sirkulasi aktif perpustakaan dan nilainya disesuaikan pada laporan inventaris aset sekolah.
              </p>

              {/* Tanda Tangan Tiga Pihak */}
              <div className="pt-8 grid grid-cols-3 gap-4 text-center text-xs">
                <div>
                  <p className="text-slate-600">Petugas / Pustakawan,</p>
                  <div className="h-16 flex items-end justify-center font-bold">
                    ({libraryStore.getCurrentLibrarian()?.name || 'Pustakawan SBTH'})
                  </div>
                </div>
                <div>
                  <p className="text-slate-600">Kepala Perpustakaan,</p>
                  <div className="h-16 flex items-end justify-center font-bold">
                    (Ibu Siti Rahma, S.Pd)
                  </div>
                </div>
                <div>
                  <p className="text-slate-600">Mengetahui,<br />Kepala Sekolah TK SBTH</p>
                  <div className="h-14 flex items-end justify-center font-bold">
                    (Ibu Maria Ulfah, M.Pd)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* MODAL CATAT PEMUSNAHAN / AFKIR EKSEMPLAR (WEEDING) */}
      {isDisposeNewModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-surface border border-border shadow-2xl p-6 sm:p-7 my-8 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-500/15 text-rose-500">
                  <Trash2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text">
                    Catat Pemusnahan & Afkir Buku
                  </h3>
                  <p className="text-xs text-text-muted">
                    Keluarkan eksemplar koleksi dari peredaran sekolah karena rusak berat, hilang, atau kadaluarsa.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsDisposeNewModalOpen(false);
                  setDisposeSelectedItemId('');
                  setDisposeBarcodeSearch('');
                }}
                className="p-1.5 rounded-xl hover:bg-surface-2 text-text-muted transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmDisposal} className="space-y-4">
              {/* Cari & Pilih Eksemplar */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text flex items-center justify-between">
                  <span>Pilih Eksemplar Fisik yang Diafkir:</span>
                  <span className="text-[11px] text-text-muted font-normal">
                    {allItems.filter((i) => i.status !== 'DISPOSED').length} Eksemplar Aktif
                  </span>
                </label>

                {/* Input filter search */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    value={disposeBarcodeSearch}
                    onChange={(e) => setDisposeBarcodeSearch(e.target.value)}
                    placeholder="Ketik barcode (cth: SBTH-) atau judul buku..."
                    className="w-full rounded-xl border border-border bg-surface-2 pl-9 pr-3 py-2 text-xs text-text placeholder-text-muted focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                {/* Dropdown pilih item */}
                <select
                  value={disposeSelectedItemId}
                  onChange={(e) => setDisposeSelectedItemId(e.target.value)}
                  required
                  size={5}
                  className="w-full rounded-xl border border-border bg-surface-2 p-2 text-xs text-text focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                >
                  <option value="" disabled className="text-text-muted">
                    -- Klik salah satu eksemplar di bawah ini --
                  </option>
                  {allItems
                    .filter((i) => i.status !== 'DISPOSED')
                    .filter((i) => {
                      if (!disposeBarcodeSearch.trim()) return true;
                      const q = disposeBarcodeSearch.toLowerCase();
                      const b = books.find((x) => x.id === i.bookId);
                      return (
                        i.itemBarcode.toLowerCase().includes(q) ||
                        (b && b.title.toLowerCase().includes(q)) ||
                        (b && b.author.toLowerCase().includes(q))
                      );
                    })
                    .slice(0, 40)
                    .map((item) => {
                      const b = books.find((x) => x.id === item.bookId);
                      return (
                        <option key={item.id} value={item.id} className="py-1">
                          [{item.itemBarcode}] {b?.title || 'Buku'} (Copy #{item.copyNumber}) • {item.shelfLocation || 'Rak'}
                        </option>
                      );
                    })}
                </select>
              </div>

              {/* Detail Buku Terpilih (Pratinjau) */}
              {disposeSelectedItemId && (() => {
                const item = allItems.find((i) => i.id === disposeSelectedItemId);
                const book = item ? books.find((b) => b.id === item.bookId) : null;
                if (!item || !book) return null;
                return (
                  <div className="p-3 rounded-2xl bg-surface-2 border border-border flex items-center gap-3">
                    <div className="h-12 w-9 rounded-lg overflow-hidden shrink-0 border border-border bg-surface">
                      <SmartBookCover
                        title={book.title}
                        author={book.author}
                        coverUrl={book.coverImage}
                        categoryId={book.categoryId}
                        className="h-full w-full object-cover text-[8px]"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-text truncate">{book.title}</div>
                      <div className="text-[11px] text-text-muted truncate">{book.author}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-[10px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                          {item.itemBarcode}
                        </span>
                        <span className="text-[10px] text-text-muted">Copy #{item.copyNumber}</span>
                        <span className="text-[10px] text-amber-500 font-semibold">{item.shelfLocation || '-'}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Alasan Pemusnahan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text">Alasan Pemusnahan / Weeding:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition ${
                    disposeReasonType === 'RUSAK_BERAT'
                      ? 'border-rose-500 bg-rose-500/10 text-rose-500 font-bold'
                      : 'border-border bg-surface-2 text-text'
                  }`}>
                    <input
                      type="radio"
                      name="disposeReason"
                      checked={disposeReasonType === 'RUSAK_BERAT'}
                      onChange={() => setDisposeReasonType('RUSAK_BERAT')}
                      className="hidden"
                    />
                    <span>Rusak Parah / Robek</span>
                  </label>

                  <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition ${
                    disposeReasonType === 'HILANG'
                      ? 'border-rose-500 bg-rose-500/10 text-rose-500 font-bold'
                      : 'border-border bg-surface-2 text-text'
                  }`}>
                    <input
                      type="radio"
                      name="disposeReason"
                      checked={disposeReasonType === 'HILANG'}
                      onChange={() => setDisposeReasonType('HILANG')}
                      className="hidden"
                    />
                    <span>Hilang Permanen</span>
                  </label>

                  <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition ${
                    disposeReasonType === 'KADALUARSA'
                      ? 'border-rose-500 bg-rose-500/10 text-rose-500 font-bold'
                      : 'border-border bg-surface-2 text-text'
                  }`}>
                    <input
                      type="radio"
                      name="disposeReason"
                      checked={disposeReasonType === 'KADALUARSA'}
                      onChange={() => setDisposeReasonType('KADALUARSA')}
                      className="hidden"
                    />
                    <span>Kurikulum Usang</span>
                  </label>

                  <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition ${
                    disposeReasonType === 'LAINNYA'
                      ? 'border-rose-500 bg-rose-500/10 text-rose-500 font-bold'
                      : 'border-border bg-surface-2 text-text'
                  }`}>
                    <input
                      type="radio"
                      name="disposeReason"
                      checked={disposeReasonType === 'LAINNYA'}
                      onChange={() => setDisposeReasonType('LAINNYA')}
                      className="hidden"
                    />
                    <span>Alasan Khusus Lainnya</span>
                  </label>
                </div>

                {disposeReasonType === 'LAINNYA' && (
                  <input
                    type="text"
                    value={disposeCustomReason}
                    onChange={(e) => setDisposeCustomReason(e.target.value)}
                    required
                    placeholder="Tulis alasan pemusnahan resmi..."
                    className="w-full mt-2 rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs text-text focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                  />
                )}
              </div>

              {/* Catatan Tambahan / Kondisi Fisik */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text">Catatan Kondisi Fisik (Opsional):</label>
                <textarea
                  value={disposeConditionNote}
                  onChange={(e) => setDisposeConditionNote(e.target.value)}
                  placeholder="Contoh: Cover terlepas, 10 halaman hilang, terkena tumpahan susu siswa..."
                  rows={2}
                  className="w-full rounded-xl border border-border bg-surface-2 p-2.5 text-xs text-text focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* Pustakawan Petugas */}
              <div className="p-2.5 rounded-xl bg-surface-2 border border-border text-[11px] text-text-muted flex items-center justify-between">
                <span>Petugas Pencatat:</span>
                <span className="font-bold text-text">
                  {libraryStore.getCurrentLibrarian()?.name || 'Pustakawan SBTH'}
                </span>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsDisposeNewModalOpen(false);
                    setDisposeSelectedItemId('');
                    setDisposeBarcodeSearch('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:bg-surface-2 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!disposeSelectedItemId}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-rose-600/30 transition cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Konfirmasi Afkir Eksemplar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Button: Back to Top (Kembali ke Paling Atas) */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 px-3.5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold shadow-xl shadow-amber-500/25 border border-amber-400 flex items-center gap-2 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 cursor-pointer group"
          title="Kembali ke Bagian Atas Halaman (Back to Top)"
        >
          <ArrowUp className="h-5 w-5 transition-transform group-hover:-translate-y-1" />
          <span className="text-xs hidden sm:inline-block font-bold">Ke Atas</span>
        </button>
      )}
    </div>
  );
};
