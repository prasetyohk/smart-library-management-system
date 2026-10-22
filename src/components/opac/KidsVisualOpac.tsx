'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sparkles,
  Leaf,
  Star,
  BookOpen,
  Heart,
  Eye,
  CheckCircle,
  Clock,
  MapPin,
  ArrowRight,
  Flame,
  TrendingDown,
  Calendar,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Users,
  Award,
  BookMarked,
  Filter,
  RotateCcw,
  BellRing,
  X,
  LayoutGrid,
  List,
  Zap,
  Bookmark,
  BookmarkPlus,
  Newspaper,
  Layers,
  ChevronRightCircle,
  Tag,
  ArrowUp,
} from 'lucide-react';
import { Book, CategoryId, AgeGroup, Category, SchoolProfile, WishlistNotification, Language, LibraryNewsArticle, Reservation } from '@/types';
import { libraryStore } from '@/lib/storage';
import { soundFx } from '@/lib/sound';
import { DICTIONARY } from '@/lib/i18n';
import { generateSlimsCallNumber } from '@/lib/constants';
import { SmartBookCover } from '@/components/common/SmartBookCover';

interface KidsVisualOpacProps {
  language?: Language;
  onSelectBookForLoan?: (book: Book) => void;
  onOpenScanIsbn?: () => void;
  isKioskMode?: boolean;
  onOpenLibrarianLogin?: () => void;
  onOpenStudentPortal?: () => void;
  onSwitchToKioskMode?: () => void;
}

export const KidsVisualOpac: React.FC<KidsVisualOpacProps> = ({
  language,
  onSelectBookForLoan,
  onOpenScanIsbn,
  isKioskMode = false,
  onOpenLibrarianLogin,
  onOpenStudentPortal,
  onSwitchToKioskMode,
}) => {
  const [mounted, setMounted] = useState<boolean>(false);
  const [lang, setLang] = useState<Language>(language || 'id');
  const activeLang = language || lang;
  const t = DICTIONARY[mounted ? activeLang : 'id'] || DICTIONARY.id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'ALL'>('ALL');
  const [selectedAge, setSelectedAge] = useState<AgeGroup | 'ALL'>('ALL');
  const [selectedPopularity, setSelectedPopularity] = useState<
    'ALL' | 'MOST_BORROWED' | 'RARE_BORROWED' | 'WISHLIST'
  >('ALL');
  const [selectedYear, setSelectedYear] = useState<string | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'TITLE_ASC' | 'TITLE_DESC' | 'MOST_BORROWED' | 'YEAR_DESC' | 'PAGES_DESC'>('NEWEST');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalBook, setActiveModalBook] = useState<Book | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [wishlistNotifs, setWishlistNotifs] = useState<WishlistNotification[]>([]);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(libraryStore.getSchoolProfile());
  const [isNewArrivalsExpanded, setIsNewArrivalsExpanded] = useState<boolean>(true);
  const [selectedAgePickTab, setSelectedAgePickTab] = useState<'PLAYGROUP' | 'TK_A' | 'TK_B'>('TK_A');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');

  // ✨ UX Consolidation: Tabbed highlights ('NEW' | 'POPULAR' | 'AGE') & Accordion state
  const [activeHighlightTab, setActiveHighlightTab] = useState<'NEW' | 'POPULAR' | 'AGE'>('NEW');
  const [isHighlightsMinimized, setIsHighlightsMinimized] = useState<boolean>(false);

  // 📢 CMS Library News (Multi-pinned auto-sliding carousel)
  const [libraryNews, setLibraryNews] = useState<LibraryNewsArticle[]>([]);
  const [activeNewsArticle, setActiveNewsArticle] = useState<LibraryNewsArticle | null>(null);
  const [activeNewsIndex, setActiveNewsIndex] = useState<number>(0);

  // 📌 Book Reservation state
  const [isReservationModalOpen, setIsReservationModalOpen] = useState<boolean>(false);
  const [reservationBook, setReservationBook] = useState<Book | null>(null);
  const [desiredPickupDate, setDesiredPickupDate] = useState<string>('');
  const [reservationNotice, setReservationNotice] = useState<string | null>(null);

  // 🚀 Floating Back to Top Button state for deep scrolling
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);

  const newArrivalsScrollRef = useRef<HTMLDivElement>(null);
  const catalogSectionRef = useRef<HTMLDivElement>(null);

  const books = libraryStore.getBooks();
  const allItems = libraryStore.getBookItems();
  const allLoans = libraryStore.getLoans();
  const allMembers = libraryStore.getMembers();
  const topBorrowedBooks = libraryStore.getMostBorrowedBooks(5);

  // Helper: Find who is currently borrowing a copy of this book
  const getBookActiveBorrower = (bookId: string) => {
    const bookItems = allItems.filter((i) => i.bookId === bookId);
    const borrowedItems = bookItems.filter((i) => i.status === 'BORROWED');
    if (borrowedItems.length === 0) return null;

    const barcodes = new Set(borrowedItems.map((b) => b.itemBarcode));
    const activeLoan = allLoans.find(
      (l) =>
        (l.status === 'ACTIVE' || l.status === 'OVERDUE') &&
        l.items.some((item) => barcodes.has(item.itemBarcode) && !item.returnDate)
    );

    if (activeLoan) {
      const member = allMembers.find((m) => m.id === activeLoan.memberId);
      if (member) {
        return {
          count: borrowedItems.length,
          name: member.name,
          group: member.classGroup || member.type || 'Siswa',
        };
      }
    }

    return {
      count: borrowedItems.length,
      name: 'Siswa SBTH',
      group: 'Kelas',
    };
  };

  const getAgeBadgeLabel = (ageGroup: AgeGroup) => {
    switch (ageGroup) {
      case 'PLAYGROUP':
        return '👶 KB / Playgroup';
      case 'TK_A':
        return '🧒 TK-A';
      case 'TK_B':
        return '👦 TK-B';
      default:
        return '🧒 TK-A & TK-B';
    }
  };

  const getLangLabel = (code?: string) => {
    if (code === 'bilingual') return 'Bilingual (ID-EN)';
    if (code === 'en') return 'English';
    if (code === 'zh') return 'Mandarin';
    return 'Indonesia';
  };

  const getCategoryEmoji = (categoryId: string) => {
    switch (categoryId) {
      case 'cat-dongeng':
        return '⭐';
      case 'cat-alam':
        return '🌿';
      case 'cat-aktivitas':
        return '📖';
      case 'cat-karakter':
        return '❤️';
      case 'cat-ensiklopedia':
        return '✨';
      case 'cat-bahasa':
        return '🈶';
      default:
        return '📚';
    }
  };

  // New Arrivals collection (most recent entries, max 10)
  const newArrivals = [...books]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 10);

  useEffect(() => {
    setMounted(true);
    setLang(language || libraryStore.getLanguage());
    setCategories(libraryStore.getCategories());
    setWishlist(libraryStore.getWishlist());
    setSchoolProfile(libraryStore.getSchoolProfile());
    setWishlistNotifs(libraryStore.getWishlistNotifications());
    setLibraryNews(libraryStore.getLibraryNews());
    if (typeof window !== 'undefined') {
      const savedView = localStorage.getItem('sbth_opac_view_mode') as 'GRID' | 'LIST';
      if (savedView === 'GRID' || savedView === 'LIST') {
        setViewMode(savedView);
      }
    }
  }, [language]);

  // Auto-minimize highlights when searching or selecting quick search tags
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setIsHighlightsMinimized(true);
    }
  }, [searchQuery]);

  // Scroll listener for Floating Back to Top Button
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const mainContainer = document.querySelector('main')?.parentElement;
      const scrollableDiv = document.querySelector('.overflow-y-auto');
      const parentPos = mainContainer ? mainContainer.scrollTop : 0;
      const divPos = scrollableDiv ? scrollableDiv.scrollTop : 0;
      const currentScroll = Math.max(scrollPos, parentPos, divPos);
      setShowBackToTop(currentScroll > 80);
    };

    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    const scrollableDiv = document.querySelector('.overflow-y-auto');
    if (scrollableDiv) {
      scrollableDiv.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      if (scrollableDiv) {
        scrollableDiv.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const mainContainer = document.querySelector('main')?.parentElement;
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
    const scrollableDiv = document.querySelector('.overflow-y-auto');
    if (scrollableDiv) {
      scrollableDiv.scrollTo({ top: 0, behavior: 'smooth' });
    }
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    if (document.body) {
      document.body.scrollTo({ top: 0, behavior: 'smooth' });
    }
    soundFx.playScanBeep();
  };

  // Compute borrow counts per book
  const borrowCountMap: Record<string, number> = {};
  allLoans.forEach((loan) => {
    loan.items.forEach((li) => {
      const item = allItems.find((i) => i.itemBarcode === li.itemBarcode || i.id === li.bookItemId);
      const bId = item
        ? item.bookId
        : books.find((b) => b.title.toLowerCase() === li.bookTitle.toLowerCase())?.id;
      if (bId) {
        borrowCountMap[bId] = (borrowCountMap[bId] || 0) + 1;
      }
    });
  });

  // Extract unique publication years
  const availableYears = Array.from(
    new Set(books.map((b) => String(b.publicationYear || '2024')).filter(Boolean))
  ).sort((a, b) => b.localeCompare(a));

  const getIconForCategory = (iconName: string) => {
    switch (iconName) {
      case 'Leaf':
        return <Leaf className="h-5 w-5" />;
      case 'Star':
        return <Star className="h-5 w-5" />;
      case 'BookOpen':
        return <BookOpen className="h-5 w-5" />;
      case 'Heart':
        return <Heart className="h-5 w-5" />;
      case 'Sparkles':
        return <Sparkles className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const handleToggleWishlist = (bookId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const added = libraryStore.toggleWishlist(bookId);
    setWishlist(libraryStore.getWishlist());
    if (added) {
      soundFx.playSuccessChime();
    } else {
      soundFx.playScanBeep();
    }
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (newArrivalsScrollRef.current) {
      const offset = direction === 'left' ? -280 : 280;
      newArrivalsScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Filter books with all criteria for the bottom catalog
  const filteredBooks = books.filter((book) => {
    // 1. Category Filter
    if (selectedCategory !== 'ALL' && book.categoryId !== selectedCategory) return false;

    // 2. Age Group Filter
    if (selectedAge !== 'ALL' && book.ageGroup !== selectedAge && book.ageGroup !== 'SEMUA_UMUR')
      return false;

    // 3. Year Filter
    if (selectedYear !== 'ALL' && String(book.publicationYear) !== String(selectedYear)) {
      return false;
    }

    // 4. Popularity Filter
    const bCount = borrowCountMap[book.id] || 0;
    if (selectedPopularity === 'MOST_BORROWED') {
      if (bCount < 2) return false;
    } else if (selectedPopularity === 'RARE_BORROWED') {
      if (bCount > 0) return false;
    } else if (selectedPopularity === 'WISHLIST') {
      if (!wishlist.includes(book.id)) return false;
    }

    // 5. Text Search Query - Sinkronisasi Penuh: Judul, Pengarang, Kategori, Rak, Barcode / No Aksesi, Kode Punggung / DDC
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const cat = categories.find((c) => c.id === book.categoryId);
      const copies = allItems.filter((i) => i.bookId === book.id);
      const matchTitle = book.title.toLowerCase().includes(q);
      const matchAuthor = book.author.toLowerCase().includes(q) || Boolean(book.authorCode && book.authorCode.toLowerCase().includes(q));
      const matchPublisher = book.publisher.toLowerCase().includes(q);
      const matchIsbn = book.isbn.includes(q);
      const matchShelf = Boolean((book.shelfLocation && book.shelfLocation.toLowerCase().includes(q)) || (book.shelfCode && book.shelfCode.toLowerCase().includes(q)));
      const matchCategory = Boolean(cat && (cat.name.toLowerCase().includes(q) || cat.shortName.toLowerCase().includes(q)));
      const matchCallNo = Boolean((book.callNumber && book.callNumber.toLowerCase().includes(q)) || (book.classification && book.classification.toLowerCase().includes(q)));
      const matchBarcode = copies.some((i) => i.itemBarcode.toLowerCase().includes(q) || i.itemBarcode.replace(/\D/g, '').includes(q));

      if (
        !matchTitle &&
        !matchAuthor &&
        !matchPublisher &&
        !matchIsbn &&
        !matchShelf &&
        !matchCategory &&
        !matchCallNo &&
        !matchBarcode
      ) {
        return false;
      }
    }

    return true;
  });

  // Multi-Mode Sorting for Catalog (Kiosk and Desktop List/Grid)
  const sortedFilteredBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === 'TITLE_ASC') return a.title.localeCompare(b.title);
    if (sortBy === 'TITLE_DESC') return b.title.localeCompare(a.title);
    if (sortBy === 'MOST_BORROWED') {
      const bA = borrowCountMap[a.id] || a.totalLoanCount || 0;
      const bB = borrowCountMap[b.id] || b.totalLoanCount || 0;
      return bB - bA;
    }
    if (sortBy === 'YEAR_DESC') {
      return (Number(b.publicationYear) || 0) - (Number(a.publicationYear) || 0);
    }
    if (sortBy === 'PAGES_DESC') {
      return (b.pageCount || 0) - (a.pageCount || 0);
    }
    // Default NEWEST
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  // Age group books for the "Pilihan Sesuai Usia" section
  const agePickBooks = books.filter(
    (b) => b.ageGroup === selectedAgePickTab || b.ageGroup === 'SEMUA_UMUR'
  ).slice(0, 6);

  // Statistics
  const totalTitles = books.length;
  const availableCopies = allItems.filter((i) => i.status === 'AVAILABLE').length;
  const borrowedCopies = allItems.filter((i) => i.status === 'BORROWED').length;
  const activeMembers = allMembers.filter((m) => m.status !== 'GRADUATED' && m.status !== 'INACTIVE').length;
  // Wishlist Notification Handlers
  const unreadNotifs = wishlistNotifs.filter((n) => !n.read);

  const handleOpenWishlistBook = (bookId: string, notifId: string) => {
    libraryStore.markWishlistNotificationRead(notifId);
    setWishlistNotifs(libraryStore.getWishlistNotifications());
    const found = books.find((b) => b.id === bookId);
    if (found) {
      setActiveModalBook(found);
      soundFx.playSuccessChime();
    }
  };

  const handleDismissNotif = (notifId: string) => {
    libraryStore.markWishlistNotificationRead(notifId);
    setWishlistNotifs(libraryStore.getWishlistNotifications());
  };

  return (
    <div className="space-y-10">
      {/* 🔔 NOTIFIKASI BUKU IMPIANKU SUDAH KEMBALI */}
      {unreadNotifs.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/15 to-surface-2 border border-amber-500/40 flex items-start sm:items-center justify-between gap-3 shadow-md animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
              <BellRing className="h-5 w-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wide">
                  Kabar Gembira Untukmu! 🌟
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold text-[10px]">
                  Buku Sudah Tersedia di Rak
                </span>
              </div>
              <p className="text-xs font-semibold text-text mt-0.5 leading-snug">
                Buku impianmu{' '}
                <span
                  onClick={() => handleOpenWishlistBook(unreadNotifs[0].bookId, unreadNotifs[0].id)}
                  className="text-amber-500 underline font-bold cursor-pointer hover:text-amber-400"
                >
                  &ldquo;{unreadNotifs[0].bookTitle}&rdquo;
                </span>{' '}
                baru saja dikembalikan teman dan sekarang siap dipinjam di perpustakaan! 📚
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenWishlistBook(unreadNotifs[0].bookId, unreadNotifs[0].id)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition cursor-pointer"
            >
              Lihat Buku
            </button>
            <button
              type="button"
              onClick={() => handleDismissNotif(unreadNotifs[0].id)}
              className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-2 transition cursor-pointer"
              title="Tutup Notifikasi"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          1. HERO SECTION (Playful, Child-Friendly, SVG Illustration, Trilingual)
          ========================================================================= */}
      <div className="rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-6 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
        {/* Soft floating decorative SVG blobs / clouds */}
        <div className="absolute top-2 right-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-10 left-10 w-44 h-44 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: School Tag + Big Friendly Heading + Large Search + Chips */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-200" />
                <span>{schoolProfile.name}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md text-xs text-amber-100">
                <span>{schoolProfile.tagline}</span>
              </div>
            </div>

            <h1
              suppressHydrationWarning
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-display tracking-tight leading-tight text-white drop-shadow-xs"
            >
              {t.heroTitle}
            </h1>

            <p
              suppressHydrationWarning
              className="text-xs sm:text-sm text-white/95 max-w-xl leading-relaxed"
            >
              {t.heroSubtitle}
            </p>

            {/* Large Search Bar: Height 56px (h-14), Radius 16px, Inside Search Button */}
            <div className="pt-2">
              <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-white/30 p-1.5">
                <Search className="h-5 w-5 text-amber-500 ml-3.5 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchBooksPlaceholder}
                  className="w-full h-11 bg-transparent px-3 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden font-medium"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition mr-1 font-semibold"
                  >
                    Reset
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => soundFx.playScanBeep()}
                  className="h-11 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition shrink-0"
                >
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">Cari Buku</span>
                </button>
              </div>

              {/* Quick Search Chips (Children Topics) */}
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-1">
                <span className="text-[11px] font-semibold text-white/80">Cari Cepat:</span>
                {[
                  { label: t.chipAnimals, query: 'hewan' },
                  { label: t.chipDinos, query: 'dino' },
                  { label: t.chipBedtime, query: 'dongeng' },
                  { label: t.chipLearn, query: 'baca' },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => {
                      setSearchQuery(chip.query);
                      soundFx.playScanBeep();
                    }}
                    className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 backdrop-blur-md text-xs font-semibold text-white shadow-2xs transition"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* 📊 Embedded Statistics Badges (Sleek, Compact, No Scroll Waste) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-white/20 mt-3">
                <div className="p-2 rounded-xl bg-black/20 backdrop-blur-md border border-white/15">
                  <div className="flex items-center gap-1.5 text-white/80 text-[10px] font-semibold">
                    <BookOpen className="h-3 w-3 text-amber-200" />
                    <span>Total Koleksi</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold font-display text-white mt-0.5">
                    {totalTitles} <span className="text-[10px] font-normal text-white/70">Judul</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-black/20 backdrop-blur-md border border-white/15">
                  <div className="flex items-center gap-1.5 text-emerald-200 text-[10px] font-semibold">
                    <CheckCircle className="h-3 w-3 text-emerald-300" />
                    <span>Tersedia di Rak</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold font-display text-emerald-300 mt-0.5">
                    {availableCopies} <span className="text-[10px] font-normal text-white/70">Buku</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-black/20 backdrop-blur-md border border-white/15">
                  <div className="flex items-center gap-1.5 text-amber-200 text-[10px] font-semibold">
                    <Clock className="h-3 w-3 text-amber-300" />
                    <span>Sedang Dipinjam</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold font-display text-amber-300 mt-0.5">
                    {borrowedCopies} <span className="text-[10px] font-normal text-white/70">Buku</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-black/20 backdrop-blur-md border border-white/15">
                  <div className="flex items-center gap-1.5 text-sky-200 text-[10px] font-semibold">
                    <Users className="h-3 w-3 text-sky-300" />
                    <span>Anggota Aktif</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold font-display text-white mt-0.5">
                    {activeMembers} <span className="text-[10px] font-normal text-white/70">Siswa & Guru</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Custom Cute Child Reading Vector Illustration */}
          <div className="lg:col-span-5 flex justify-center items-center py-2">
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-square flex items-center justify-center">
              <svg
                viewBox="0 0 320 320"
                className="w-full h-full drop-shadow-xl"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background soft sun disc */}
                <circle cx="160" cy="160" r="140" fill="white" fillOpacity="0.12" />
                <circle cx="160" cy="160" r="110" fill="white" fillOpacity="0.16" />

                {/* Floating playful sparkles */}
                <path
                  d="M60 70L63 80L73 83L63 86L60 96L57 86L47 83L57 80L60 70Z"
                  fill="#FEF08A"
                  fillOpacity="0.9"
                />
                <path
                  d="M260 90L262 97L269 99L262 101L260 108L258 101L251 99L258 97L260 90Z"
                  fill="#FEF08A"
                  fillOpacity="0.8"
                />
                <path
                  d="M270 210L272 216L278 218L272 220L270 226L268 220L262 218L268 216L270 210Z"
                  fill="#FFFFFF"
                  fillOpacity="0.75"
                />
                <circle cx="75" cy="220" r="4" fill="#FEF08A" fillOpacity="0.8" />
                <circle cx="230" cy="50" r="5" fill="#FFFFFF" fillOpacity="0.7" />

                {/* Cloud base */}
                <path
                  d="M80 250C80 236 92 224 106 224C111 224 116 226 120 228C127 218 138 212 150 212C165 212 178 221 182 234C186 232 191 230 196 230C210 230 220 240 220 254C220 254 220 256 220 256H80V250Z"
                  fill="white"
                  fillOpacity="0.25"
                />

                {/* Happy Reading Kid Mascot */}
                {/* Body / Sweater */}
                <ellipse cx="160" cy="210" rx="36" ry="34" fill="#38BDF8" />
                <path
                  d="M142 220C142 220 152 230 160 230C168 230 178 220 178 220"
                  stroke="#0284C7"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Neck */}
                <rect x="153" y="166" width="14" height="12" rx="4" fill="#FBCFE8" />

                {/* Head */}
                <ellipse cx="160" cy="140" rx="34" ry="32" fill="#FDE047" />

                {/* Cute Hair with Hair tuft */}
                <path
                  d="M128 140C128 116 142 104 160 104C178 104 192 116 192 140C188 132 180 128 170 128C162 128 156 132 150 132C144 132 136 128 128 140Z"
                  fill="#78350F"
                />
                <circle cx="160" cy="102" r="6" fill="#78350F" />

                {/* Happy Blushing Cheeks */}
                <circle cx="140" cy="148" r="6" fill="#FDA4AF" fillOpacity="0.8" />
                <circle cx="180" cy="148" r="6" fill="#FDA4AF" fillOpacity="0.8" />

                {/* Cheerful Smiling Eyes */}
                <path
                  d="M138 138C140 134 144 134 146 138"
                  stroke="#451A03"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M174 138C176 134 180 134 182 138"
                  stroke="#451A03"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Cute Open Smile */}
                <path
                  d="M153 150C155 156 165 156 167 150"
                  stroke="#78350F"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="#E11D48"
                />

                {/* Big Open Book Held by Kid */}
                {/* Book Spine Center */}
                <path
                  d="M160 188V232"
                  stroke="#D97706"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Left Page (Emerald Green cover / Cream page) */}
                <path
                  d="M160 190C144 184 122 186 104 194C102 195 100 197 100 200V238C100 240 102 242 104 241C122 233 144 231 160 236V190Z"
                  fill="#FEF3C7"
                  stroke="#F59E0B"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                {/* Left Cover back */}
                <path
                  d="M100 200C94 202 88 206 88 212V244C88 246 90 248 92 247C104 241 116 238 128 238"
                  stroke="#10B981"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Left Page Lines / Illustrations */}
                <line x1="114" y1="206" x2="148" y2="202" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
                <line x1="112" y1="214" x2="146" y2="210" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
                <circle cx="130" cy="223" r="5" fill="#F43F5E" />

                {/* Right Page (Cream page) */}
                <path
                  d="M160 190C176 184 198 186 216 194C218 195 220 197 220 200V238C220 240 218 242 216 241C198 233 176 231 160 236V190Z"
                  fill="#FFFBEB"
                  stroke="#F59E0B"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                {/* Right Cover back */}
                <path
                  d="M220 200C226 202 232 206 232 212V244C232 246 230 248 228 247C216 241 204 238 192 238"
                  stroke="#6366F1"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Right Page Lines */}
                <line x1="172" y1="202" x2="206" y2="206" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
                <line x1="174" y1="210" x2="208" y2="214" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
                <path
                  d="M188 220L190 226L196 227L191 230L193 236L188 232L183 236L185 230L180 227L186 226L188 220Z"
                  fill="#F59E0B"
                />

                {/* Hands holding the book */}
                <ellipse cx="106" cy="222" rx="7" ry="6" fill="#FDE047" stroke="#78350F" strokeWidth="1.5" />
                <ellipse cx="214" cy="222" rx="7" ry="6" fill="#FDE047" stroke="#78350F" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. CMS LIBRARY NEWS & ANNOUNCEMENT MULTI-PINNED CAROUSEL TICKER
          ========================================================================= */}
      {(() => {
        const activeNews = libraryNews
          .filter((n) => n.isActive)
          .sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
          });

        if (activeNews.length === 0) return null;

        const currentArticle = activeNews[activeNewsIndex % activeNews.length];

        return (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-surface-2 border border-amber-500/30 p-3 sm:p-4 shadow-xs transition hover:border-amber-500/60 group">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Left Side: Category, Pinned tag, Title & Date */}
              <div
                onClick={() => {
                  setActiveNewsArticle(currentArticle);
                  soundFx.playScanBeep();
                }}
                className="flex items-start sm:items-center gap-3 min-w-0 cursor-pointer flex-1"
              >
                <div className="h-9 w-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition">
                  <Newspaper className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {currentArticle.isPinned && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/40 text-[9px] font-extrabold uppercase tracking-wider">
                        📌 Disematkan
                      </span>
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                      {currentArticle.category === 'HOLIDAY'
                        ? 'Libur / Tutup'
                        : currentArticle.category === 'STOCK_OPNAME'
                        ? 'Stock Opname'
                        : currentArticle.category === 'EVENT'
                        ? 'Agenda / Event'
                        : 'Pengumuman Resmi'}
                    </span>
                    <span className="text-[10px] text-text-muted">• {currentArticle.publishedDate}</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-text truncate group-hover:text-amber-500 transition mt-0.5">
                    {currentArticle.title}
                  </p>
                </div>
              </div>

              {/* Right Side: Navigation buttons, counter, and Read More */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {activeNews.length > 1 && (
                  <div className="flex items-center gap-1 bg-surface-2/80 rounded-xl p-1 border border-border">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveNewsIndex((prev) => (prev - 1 + activeNews.length) % activeNews.length);
                      }}
                      className="p-1 rounded-lg text-text-muted hover:text-text hover:bg-surface transition cursor-pointer"
                      title="Pengumuman Sebelumnya"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-[10px] font-mono text-text-muted px-1.5 font-bold">
                      {(activeNewsIndex % activeNews.length) + 1}/{activeNews.length}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveNewsIndex((prev) => (prev + 1) % activeNews.length);
                      }}
                      className="p-1 rounded-lg text-text-muted hover:text-text hover:bg-surface transition cursor-pointer"
                      title="Pengumuman Berikutnya"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setActiveNewsArticle(currentArticle);
                    soundFx.playScanBeep();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer active:scale-95"
                >
                  <span>Baca Info</span>
                  <ChevronRightCircle className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Dots Indicator if multiple news items */}
            {activeNews.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-amber-500/10 mt-2">
                {activeNews.map((n, idx) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveNewsIndex(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === activeNewsIndex % activeNews.length
                        ? 'w-6 bg-amber-500'
                        : 'w-2 bg-text-muted/30 hover:bg-text-muted/60'
                    }`}
                    title={n.title}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* =========================================================================
          3. CONSOLIDATED TABBED HIGHLIGHTS CAROUSEL (New Arrivals, Popular, Age Picks)
          Equipped with Accordion Minimize / Expand to prevent Scroll Fatigue!
          ========================================================================= */}
      {isHighlightsMinimized ? (
        /* Minimized Compact Accordion Bar */
        <div
          onClick={() => {
            setIsHighlightsMinimized(false);
            soundFx.playScanBeep();
          }}
          className="rounded-2xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/15 p-3.5 flex items-center justify-between transition cursor-pointer shadow-xs group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500 text-slate-950 shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-text group-hover:text-amber-500 transition">
                ✨ Sorotan Buku, Kategori Rak & Rekomendasi Usia (Mode Ringkas Tersembunyi)
              </span>
              <p className="text-[11px] text-text-muted">
                Klik untuk membuka carousel rekomendasi Baru Masuk ({newArrivals.length}), Paling Sering Dipinjam & Sesuai Usia
              </p>
            </div>
          </div>
          <button
            type="button"
            className="px-3.5 py-1.5 rounded-xl bg-surface border border-border text-xs font-bold text-amber-500 flex items-center gap-1.5 shadow-2xs group-hover:bg-amber-500 group-hover:text-slate-950 transition"
          >
            <span>Buka Sorotan</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      ) : (
        /* Full Consolidated Tabbed Carousel Block */
        <div className="rounded-3xl border border-border bg-surface p-4 sm:p-5 shadow-xs space-y-4 transition animate-in fade-in">
          {/* Header Bar: Tab Switcher (Left) + Arrows & Minimize Button (Right) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
            {/* Tab Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface-2 border border-border">
              <button
                type="button"
                onClick={() => {
                  setActiveHighlightTab('NEW');
                  soundFx.playScanBeep();
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeHighlightTab === 'NEW'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Baru Masuk ({newArrivals.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveHighlightTab('POPULAR');
                  soundFx.playScanBeep();
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeHighlightTab === 'POPULAR'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                <Award className="h-3.5 w-3.5" />
                <span>Paling Favorit 🔥</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveHighlightTab('AGE');
                  soundFx.playScanBeep();
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeHighlightTab === 'AGE'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Sesuai Usia 👶</span>
              </button>
            </div>

            {/* Right Action: Scroll buttons + Minimize Accordion */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollCarousel('left')}
                  className="h-8 w-8 rounded-xl bg-surface-2 border border-border hover:bg-surface text-text flex items-center justify-center transition active:scale-95 shadow-2xs"
                  title="Geser ke kiri"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCarousel('right')}
                  className="h-8 w-8 rounded-xl bg-surface-2 border border-border hover:bg-surface text-text flex items-center justify-center transition active:scale-95 shadow-2xs"
                  title="Geser ke kanan"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsHighlightsMinimized(true);
                  soundFx.playScanBeep();
                }}
                className="px-3 py-1.5 rounded-xl bg-surface-2 border border-border hover:border-amber-500/50 text-xs font-bold text-text-muted hover:text-text flex items-center gap-1 transition shadow-2xs"
                title="Sembunyikan sorotan agar katalog langsung terlihat"
              >
                <span>Sembunyikan</span>
                <ChevronUp className="h-3.5 w-3.5 text-amber-500" />
              </button>
            </div>
          </div>

          {/* Sub-Age Switcher if AGE tab active */}
          {activeHighlightTab === 'AGE' && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] font-semibold text-text-muted">Pilih Jenjang:</span>
              {[
                { id: 'PLAYGROUP', label: '👶 Toddler / KB (2-3 th)' },
                { id: 'TK_A', label: '🧒 TK-A (4-5 th)' },
                { id: 'TK_B', label: '👦 TK-B (5-6 th)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setSelectedAgePickTab(tab.id as any);
                    soundFx.playScanBeep();
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                    selectedAgePickTab === tab.id
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-surface-2 text-text-muted hover:text-text border border-border'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Horizontal Carousel Content Container */}
          <div
            ref={newArrivalsScrollRef}
            className="flex gap-3.5 overflow-x-auto snap-x snap-mandatory pb-2 pt-1 no-scrollbar"
            style={{ scrollbarWidth: 'none' }}
          >
            {activeHighlightTab === 'NEW' &&
              newArrivals.map((b) => {
                const items = allItems.filter((i) => i.bookId === b.id);
                const availableCount = items.filter((i) => i.status === 'AVAILABLE').length;

                return (
                  <div
                    key={`carousel-new-${b.id}`}
                    onClick={() => {
                      setActiveModalBook(b);
                      soundFx.playScanBeep();
                    }}
                    className="w-40 sm:w-44 shrink-0 snap-start group cursor-pointer rounded-2xl bg-surface-2 border border-border hover:border-amber-500/60 p-2.5 transition transform hover:-translate-y-1 hover:shadow-md flex flex-col justify-between"
                  >
                    <div className="relative aspect-3/4 w-full rounded-xl overflow-hidden bg-slate-900 shadow-xs">
                      <SmartBookCover
                        title={b.title}
                        author={b.author}
                        coverUrl={b.coverImage}
                        categoryId={b.categoryId}
                        aspectRatio="h-full w-full"
                      />
                      <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/25 to-transparent pointer-events-none" />
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-bold text-[8px] shadow-xs uppercase tracking-wide">
                        Baru
                      </span>
                    </div>

                    <div className="mt-2 text-left flex flex-col justify-between flex-1">
                      <div>
                        <h4 className="text-xs font-semibold text-text line-clamp-1 group-hover:text-amber-500 transition leading-snug">
                          {b.title}
                        </h4>
                        <p className="text-[10px] text-text-muted truncate mt-0.5">
                          {b.author}
                        </p>
                      </div>

                      <div className="mt-1.5 flex items-center justify-between pt-1.5 border-t border-border/60 text-[10px]">
                        <span className={availableCount > 0 ? 'text-emerald-500 font-bold' : 'text-amber-500 font-medium'}>
                          {availableCount > 0 ? `Ada (${availableCount})` : 'Dipinjam'}
                        </span>
                        <span className="font-mono text-text-muted">{b.publicationYear}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

            {activeHighlightTab === 'POPULAR' &&
              topBorrowedBooks.map(({ book, borrowCount }, idx) => {
                const bCount = borrowCount || borrowCountMap[book.id] || 0;
                const medals = ['🥇', '🥈', '🥉', '#4', '#5'];

                return (
                  <div
                    key={`carousel-pop-${book.id}`}
                    onClick={() => {
                      setActiveModalBook(book);
                      soundFx.playScanBeep();
                    }}
                    className="w-40 sm:w-44 shrink-0 snap-start group cursor-pointer rounded-2xl bg-surface-2 border border-border hover:border-amber-500/60 p-2.5 transition transform hover:-translate-y-1 hover:shadow-md relative flex flex-col justify-between"
                  >
                    <div className="absolute top-1.5 left-1.5 z-10 h-6 w-6 rounded-lg bg-slate-900/90 text-white flex items-center justify-center font-bold text-[10px] shadow-sm border border-white/20">
                      {medals[idx] || `#${idx + 1}`}
                    </div>

                    <div className="relative aspect-3/4 rounded-xl overflow-hidden bg-slate-900 shadow-xs">
                      <SmartBookCover
                        title={book.title}
                        author={book.author}
                        coverUrl={book.coverImage}
                        categoryId={book.categoryId}
                        aspectRatio="h-full w-full"
                      />
                      <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/25 to-transparent pointer-events-none" />
                    </div>

                    <div className="mt-2 text-left">
                      <h4 className="text-xs font-semibold text-text line-clamp-1 group-hover:text-amber-500 transition leading-snug">
                        {book.title}
                      </h4>
                      <div className="mt-1 flex items-center justify-between text-[10px]">
                        <span className="text-text-muted truncate max-w-[80px]">{book.author}</span>
                        <span className="font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded-md">
                          {bCount}x
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

            {activeHighlightTab === 'AGE' &&
              agePickBooks.map((book) => {
                const items = allItems.filter((i) => i.bookId === book.id);
                const availableCount = items.filter((i) => i.status === 'AVAILABLE').length;

                return (
                  <div
                    key={`carousel-age-${book.id}`}
                    onClick={() => {
                      setActiveModalBook(book);
                      soundFx.playScanBeep();
                    }}
                    className="w-40 sm:w-44 shrink-0 snap-start group cursor-pointer rounded-2xl bg-surface-2 border border-border hover:border-amber-500/60 p-2.5 transition transform hover:-translate-y-1 hover:shadow-md flex flex-col justify-between"
                  >
                    <div className="relative aspect-3/4 rounded-xl overflow-hidden bg-slate-900 shadow-xs">
                      <SmartBookCover
                        title={book.title}
                        author={book.author}
                        coverUrl={book.coverImage}
                        categoryId={book.categoryId}
                        aspectRatio="h-full w-full"
                      />
                      <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
                    </div>

                    <div className="mt-2 text-left">
                      <h4 className="text-xs font-semibold text-text line-clamp-1 group-hover:text-amber-500 transition leading-snug">
                        {book.title}
                      </h4>
                      <div className="mt-1 flex items-center justify-between text-[10px]">
                        <span className="text-text-muted truncate max-w-[80px]">{book.author}</span>
                        <span className={availableCount > 0 ? 'text-emerald-500 font-bold' : 'text-amber-500 font-medium'}>
                          {availableCount > 0 ? `Ada (${availableCount})` : 'Dipinjam'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* =========================================================================
          4. HORIZONTAL CATEGORY SHELF PILLS (Compact, One-Row, Above Catalog)
          ========================================================================= */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-text flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-amber-500" />
            <span>Kategori Rak Buku (Filter Cepat):</span>
          </span>
          {selectedCategory !== 'ALL' && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('ALL');
                soundFx.playScanBeep();
              }}
              className="text-xs text-amber-500 hover:underline font-semibold"
            >
              Reset ke Semua Rak
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('ALL');
              soundFx.playScanBeep();
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition flex items-center gap-1.5 border shadow-2xs ${
              selectedCategory === 'ALL'
                ? 'bg-amber-500 text-slate-950 border-amber-600'
                : 'bg-surface hover:bg-surface-2 border-border text-text'
            }`}
          >
            <span>🌈 Semua Rak</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === 'ALL' ? 'bg-black/20 text-slate-950' : 'bg-surface-2 text-text-muted'}`}>
              {books.length}
            </span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = books.filter((b) => b.categoryId === cat.id).length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(isSelected ? 'ALL' : cat.id);
                  soundFx.playScanBeep();
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition flex items-center gap-1.5 border shadow-2xs ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-600'
                    : 'bg-surface hover:bg-surface-2 border-border text-text'
                }`}
                style={{
                  borderLeftColor: !isSelected ? cat.colorHex : undefined,
                  borderLeftWidth: !isSelected ? '3px' : undefined,
                }}
              >
                <span>{getCategoryEmoji(cat.id)}</span>
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-black/20 text-slate-950' : 'bg-surface-2 text-text-muted'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          7. MAIN CATALOG GRID: "JELAJAHI SEMUA BUKU" (Filters & Sort, Clean Pills)
          ========================================================================= */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-text">
                {t.exploreAll}
              </h2>
              <p className="text-xs text-text-muted">
                Pilih filter dan temukan buku cerita kesukaan dari seluruh koleksi
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                soundFx.playScanBeep();
              }}
              className="rounded-xl border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-text outline-hidden focus:border-amber-500 transition cursor-pointer"
              title="Urutkan Koleksi Buku"
            >
              <option value="NEWEST">Terbaru Ditambahkan</option>
              <option value="TITLE_ASC">Judul A - Z</option>
              <option value="TITLE_DESC">Judul Z - A</option>
              <option value="MOST_BORROWED">Paling Sering Dipinjam 🔥</option>
              <option value="YEAR_DESC">Tahun Terbit (Terbaru)</option>
              <option value="PAGES_DESC">Halaman Terbanyak</option>
            </select>

            {/* View Mode Toggle: Grid vs List */}
            <div className="flex items-center p-1 rounded-xl bg-surface-2 border border-border">
              <button
                type="button"
                onClick={() => {
                  setViewMode('GRID');
                  if (typeof window !== 'undefined') localStorage.setItem('sbth_opac_view_mode', 'GRID');
                  soundFx.playScanBeep();
                }}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition ${
                  viewMode === 'GRID'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-text-muted hover:text-text'
                }`}
                title="Tampilan Grid Sampul Buku"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('LIST');
                  if (typeof window !== 'undefined') localStorage.setItem('sbth_opac_view_mode', 'LIST');
                  setIsHighlightsMinimized(true);
                  soundFx.playScanBeep();
                }}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition ${
                  viewMode === 'LIST'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-text-muted hover:text-text'
                }`}
                title="Tampilan Mode Daftar List Ringkas (Auto-minimize sorotan atas)"
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Daftar List</span>
              </button>
            </div>

            <div className="text-xs text-text-muted">
              Menampilkan <strong className="text-text">{sortedFilteredBooks.length}</strong> dari {books.length} buku
            </div>
          </div>
        </div>

        {/* Small floating hint button to re-open highlights if currently minimized */}
        {isHighlightsMinimized && (
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface-2 border border-border text-xs">
            <span className="text-text-muted text-[11px] flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Sorotan atas sedang diminimalkan agar katalog buku lebih dekat ke pencarian.</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setIsHighlightsMinimized(false);
                soundFx.playScanBeep();
              }}
              className="text-amber-500 hover:text-amber-400 font-bold text-xs flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>Buka Kembali Sorotan</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Filter Bar: Clean Surface, Single Lucide Icons Only, No Double Emojis */}
        <div className="rounded-2xl border border-border bg-surface p-3.5 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Filter Pills (Semua / Sering Dipinjam / Jarang Dipinjam / Buku Impian) */}
            <div className="flex flex-wrap items-center gap-1.5 font-semibold">
              <span className="text-text-muted text-[11px] mr-1">Filter:</span>

              <button
                type="button"
                onClick={() => setSelectedPopularity('ALL')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  selectedPopularity === 'ALL'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-surface-2 text-text-muted hover:text-text'
                }`}
              >
                Semua ({books.length})
              </button>

              <button
                type="button"
                onClick={() => setSelectedPopularity('MOST_BORROWED')}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
                  selectedPopularity === 'MOST_BORROWED'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-surface-2 text-text-muted hover:text-text'
                }`}
              >
                <Flame className="h-3.5 w-3.5 text-amber-500" />
                <span>Sering Dipinjam</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPopularity('RARE_BORROWED')}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
                  selectedPopularity === 'RARE_BORROWED'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-surface-2 text-text-muted hover:text-text'
                }`}
              >
                <TrendingDown className="h-3.5 w-3.5 text-sky-500" />
                <span>Jarang Dipinjam</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPopularity('WISHLIST')}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
                  selectedPopularity === 'WISHLIST'
                    ? 'bg-rose-500 text-white font-bold shadow-xs'
                    : 'bg-surface-2 text-text-muted hover:text-text'
                }`}
              >
                <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
                <span>Buku Impianku ({wishlist.length})</span>
              </button>
            </div>

            {/* Year & Age Selectors */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-surface-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-border">
                <Calendar className="h-3.5 w-3.5 text-text-muted" />
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-transparent border-none outline-hidden text-text cursor-pointer font-medium"
                >
                  <option value="ALL">Semua Tahun</option>
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr} className="bg-surface text-text">
                      Tahun {yr}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={selectedAge}
                onChange={(e) => setSelectedAge(e.target.value as any)}
                className="bg-surface-2 text-text text-xs font-medium px-3 py-1.5 rounded-xl border border-border outline-hidden cursor-pointer"
              >
                <option value="ALL">Semua Usia / Kelas</option>
                <option value="PLAYGROUP">Playgroup (2-3 th)</option>
                <option value="TK_A">TK-A (4-5 th)</option>
                <option value="TK_B">TK-B (5-6 th)</option>
              </select>

              {(selectedCategory !== 'ALL' ||
                selectedPopularity !== 'ALL' ||
                selectedYear !== 'ALL' ||
                selectedAge !== 'ALL' ||
                searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('ALL');
                    setSelectedPopularity('ALL');
                    setSelectedYear('ALL');
                    setSelectedAge('ALL');
                    setSearchQuery('');
                  }}
                  className="p-1.5 rounded-xl bg-surface-2 hover:bg-surface text-text-muted hover:text-amber-500 border border-border transition"
                  title="Reset Semua Filter"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Catalog Grid */}
        {filteredBooks.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center space-y-3 bg-surface">
            <BookOpen className="h-12 w-12 text-text-muted mx-auto opacity-50" />
            <h3 className="text-base font-bold text-text">
              Tidak Ada Buku yang Cocok dengan Filter Ini
            </h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              Coba ganti kata kunci pencarian, pilih kategori lain, atau reset filter untuk melihat seluruh koleksi perpustakaan.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedPopularity('ALL');
                setSelectedYear('ALL');
                setSelectedAge('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-xs"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : viewMode === 'LIST' ? (
          /* =========================================================================
             MODE B: SUPER LIST ROW (4-Column Operational View for Teachers & Kiosk)
             ========================================================================= */
          <div className="space-y-2.5">
            {sortedFilteredBooks.map((book) => {
              const items = allItems.filter((i) => i.bookId === book.id);
              const totalCopies = items.length;
              const availableCount = items.filter((i) => i.status === 'AVAILABLE').length;
              const damagedCount = items.filter((i) => i.status === 'DAMAGED' || i.status === 'IN_REPAIR').length;
              const cat = categories.find((c) => c.id === book.categoryId) || categories[0] || {
                colorHex: '#10B981',
                shortName: 'BUKU',
                name: 'Katalog',
                shelfLocation: 'Rak Utama',
                iconName: 'BookOpen',
              };
              const firstBarcode = items[0]?.itemBarcode || `SBTH-${book.id}`;
              const loanCount = borrowCountMap[book.id] || book.totalLoanCount || 0;
              const borrowerInfo = getBookActiveBorrower(book.id);
              const isNew = newArrivals.some((na) => na.id === book.id);

              return (
                <div
                  key={book.id}
                  onClick={() => {
                    setActiveModalBook(book);
                    soundFx.playScanBeep();
                  }}
                  className="relative flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:py-2.5 sm:px-3.5 bg-surface hover:bg-surface-2 border border-border/80 hover:border-amber-500/50 rounded-2xl transition group pl-4 sm:pl-4.5 gap-3 cursor-pointer shadow-xs"
                >
                  {/* Indikator Garis Warna Rak di Sisi Kiri */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl transition"
                    style={{ backgroundColor: cat.colorHex }}
                  />

                  {/* KOLOM 1: Mini-Thumbnail Cover (48x64px) + Info Utama & Call Number SLiMS */}
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    {/* Mini-Thumbnail Cover (Rasio 3:4, Rounded, 48x64px) */}
                    <div className="w-12 h-16 shrink-0 rounded-lg overflow-hidden border border-border shadow-2xs bg-slate-900 relative group/thumb">
                      <SmartBookCover
                        title={book.title}
                        author={book.author}
                        coverUrl={book.coverImage}
                        categoryId={book.categoryId}
                        aspectRatio="h-full w-full"
                      />
                      <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-r from-black/30 to-transparent pointer-events-none" />
                    </div>

                    <div className="min-w-0 space-y-0.5 flex-1">
                      {/* Baris Judul & Call Number DDC SLiMS */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-bold text-text group-hover:text-amber-500 transition leading-snug line-clamp-1">
                          {book.title}
                        </h4>
                        <span className="font-mono text-[9px] px-1.5 py-0.2 rounded-md bg-amber-500/15 text-amber-500 font-bold border border-amber-500/30">
                          {book.callNumber || generateSlimsCallNumber(book.title, book.author, book.categoryId)}
                        </span>
                        <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-md">
                          {getAgeBadgeLabel(book.ageGroup)}
                        </span>
                        {isNew && (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-500 text-slate-950 rounded-md">
                            BARU
                          </span>
                        )}
                      </div>

                      {/* Baris Pengarang & Penerbit */}
                      <p className="text-[11px] text-text-muted truncate">
                        <span className="text-text-muted/70">Oleh:</span> {book.author} • {book.publisher} ({book.publicationYear})
                      </p>

                      {/* Baris Lokasi Rak & Barcode Fisik */}
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-text-muted font-medium">
                        <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold">
                          📍 {cat.shelfLocation || 'Rak Utama'}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-text-muted">🏷️ {firstBarcode}</span>
                        <span>•</span>
                        <span>{book.pageCount ? `${book.pageCount} Halaman` : '32 Hal'}</span>
                      </div>
                    </div>
                  </div>

                  {/* KOLOM 2: Total Dipinjam, Status Ketersediaan & Quick Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-t-0 border-border pt-2 sm:pt-0">
                    {/* Statistik Dipinjam */}
                    <div className="text-center px-2 py-1 rounded-lg bg-surface-2 border border-border min-w-[55px]">
                      <div className="text-xs font-bold text-amber-500">{loanCount}x</div>
                      <div className="text-[9px] text-text-muted">Dipinjam</div>
                    </div>

                    {/* Status Ketersediaan */}
                    <div className="text-right min-w-[110px]">
                      {availableCount > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          ● Ada ({availableCount}/{totalCopies})
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          ● Dipinjam ({availableCount}/{totalCopies})
                        </span>
                      )}
                      {borrowerInfo && (
                        <div
                          className="text-[9px] text-amber-400/90 mt-0.5 truncate max-w-[130px]"
                          title={`Sedang dipinjam ${borrowerInfo.name}`}
                        >
                          ⏳ {borrowerInfo.name}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons: Pinjam (if available) or Reservasi (if borrowed) */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {onSelectBookForLoan && availableCount > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectBookForLoan(book);
                          }}
                          className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-xs transition active:scale-95"
                          title="Buka Sirkulasi Peminjaman untuk buku ini"
                        >
                          <Zap className="h-3 w-3" />
                          <span>Pinjam</span>
                        </button>
                      )}

                      {availableCount === 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReservationBook(book);
                            setIsReservationModalOpen(true);
                            soundFx.playScanBeep();
                          }}
                          className="px-2.5 py-1 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 font-bold text-xs flex items-center gap-1 shadow-2xs transition active:scale-95"
                          title="Pesan/Booking buku ini agar tidak diambil orang lain saat kembali"
                        >
                          <BookmarkPlus className="h-3 w-3" />
                          <span>Reservasi</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* =========================================================================
             MODE A: GRID VIEW (Visual Hardcover Cards with Category Colors)
             ========================================================================= */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {sortedFilteredBooks.map((book) => {
              const items = allItems.filter((i) => i.bookId === book.id);
              const availableCount = items.filter((i) => i.status === 'AVAILABLE').length;
              const cat = categories.find((c) => c.id === book.categoryId) || categories[0] || {
                colorHex: '#10B981',
                shortName: 'BUKU',
                name: 'Katalog',
                shelfLocation: 'Rak Utama',
                iconName: 'BookOpen',
              };
              const isWishlisted = wishlist.includes(book.id);

              return (
                <div
                  key={book.id}
                  onClick={() => {
                    setActiveModalBook(book);
                    soundFx.playScanBeep();
                  }}
                  className="group cursor-pointer rounded-2xl bg-surface border border-border hover:border-amber-500/50 overflow-hidden shadow-xs hover:shadow-lg transition transform hover:-translate-y-1.5 flex flex-col justify-between"
                >
                  {/* Book Cover Container with 3:4 ratio */}
                  <div className="relative aspect-3/4 w-full bg-slate-900 overflow-hidden">
                    <SmartBookCover
                      title={book.title}
                      author={book.author}
                      coverUrl={book.coverImage}
                      categoryId={book.categoryId}
                      aspectRatio="h-full w-full"
                    />

                    {/* Category Top Stripe (3px) */}
                    <div
                      className="absolute top-0 inset-x-0 h-1"
                      style={{ backgroundColor: cat.colorHex }}
                    />

                    {/* Category Dot Badge */}
                    <div
                      className="absolute top-2.5 left-2.5 h-6 w-6 rounded-lg flex items-center justify-center text-white shadow-md text-[10px]"
                      style={{ backgroundColor: cat.colorHex }}
                      title={cat.name}
                    >
                      {getIconForCategory(cat.iconName)}
                    </div>

                    {/* Wishlist Heart Button with pop animation */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleWishlist(book.id, e)}
                      title={isWishlisted ? 'Hapus dari Buku Impian' : 'Simpan ke Buku Impian'}
                      className={`absolute top-2.5 right-2.5 h-7 w-7 rounded-full flex items-center justify-center backdrop-blur-md shadow-md transition active:scale-125 ${
                        isWishlisted
                          ? 'bg-rose-500 text-white'
                          : 'bg-black/35 hover:bg-black/55 text-white'
                      }`}
                    >
                      <Heart className={`h-3.5 w-3.5 ${isWishlisted ? 'fill-white' : ''}`} />
                    </button>
                  </div>

                  {/* Text Information & Status Pill below Title */}
                  <div className="p-3 text-left flex flex-col justify-between flex-1">
                    <div>
                      <h4 className="text-xs font-semibold text-text line-clamp-2 leading-snug group-hover:text-amber-500 transition">
                        {book.title}
                      </h4>
                      <p className="text-[11px] text-text-muted mt-0.5 truncate">
                        {book.author}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-border flex items-center justify-between">
                      {availableCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          <CheckCircle className="h-2.5 w-2.5" />
                          Ada ({availableCount})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                          <Clock className="h-2.5 w-2.5" />
                          Dipinjam
                        </span>
                      )}
                      <span
                        className="font-bold uppercase text-[9px] px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${cat.colorHex}20`, color: cat.colorHex }}
                      >
                        {cat.shortName}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Catalog Action Bar: Total Books info & Kembali ke Puncak button */}
        {filteredBooks.length > 0 && (
          <div className="pt-6 pb-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/80 text-xs text-text-muted">
            <span className="font-medium">
              Menampilkan <span className="font-bold text-text">{filteredBooks.length}</span> judul buku dari total <span className="font-bold text-text">{books.length}</span> koleksi perpustakaan SBTH.
            </span>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface border border-border hover:border-amber-500/50 text-text font-bold text-xs transition cursor-pointer active:scale-95 shadow-2xs"
            >
              <ArrowUp className="h-4 w-4 text-amber-500" />
              <span>Kembali ke Puncak Katalog ⬆️</span>
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          8. DETAIL MODAL POPUP (Child & Parent Friendly with Availability)
          ========================================================================= */}
      {activeModalBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-surface shadow-2xl border border-border p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="h-44 w-32 shrink-0 rounded-2xl overflow-hidden shadow-md border border-border bg-surface-2">
                <SmartBookCover
                  title={activeModalBook.title}
                  author={activeModalBook.author}
                  coverUrl={activeModalBook.coverImage}
                  categoryId={activeModalBook.categoryId}
                  aspectRatio="h-full w-full"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-amber-500/15 text-amber-500">
                    {activeModalBook.ageGroup.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-text-muted">
                    Tahun {activeModalBook.publicationYear}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold font-display text-text leading-snug">
                  {activeModalBook.title}
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  Penulis: <strong className="text-text">{activeModalBook.author}</strong> • Penerbit:{' '}
                  {activeModalBook.publisher}
                </p>
                <p className="text-xs text-text-muted font-mono mt-0.5">
                  ISBN: {activeModalBook.isbn}
                </p>

                {/* Spesifikasi Fisik: Halaman, Bahasa, Format */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-300">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 font-medium">
                    📄 {activeModalBook.pageCount ? `${activeModalBook.pageCount} Halaman` : '32 Halaman'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 font-medium">
                    🌐 {getLangLabel(activeModalBook.bookLanguage)}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 font-medium">
                    📘 {activeModalBook.physicalFormat || 'Cerita Bergambar'}
                  </span>
                </div>

                {/* Shelf Info */}
                {(() => {
                  const cat = categories.find((c) => c.id === activeModalBook.categoryId);
                  return (
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span>Lokasi: {cat?.shelfLocation || 'Rak Utama'}</span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Availability Banner for Parents Accessing from Home */}
            {(() => {
              const items = allItems.filter((i) => i.bookId === activeModalBook.id);
              const avail = items.filter((i) => i.status === 'AVAILABLE').length;

              return (
                <div
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                    avail > 0
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {avail > 0 ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                    ) : (
                      <Clock className="h-5 w-5 text-amber-500 shrink-0" />
                    )}
                    <div>
                      <span className="font-bold block text-text">
                        {avail > 0
                          ? 'Siap Dipinjam Besok di Sekolah'
                          : 'Sedang Dipinjam Teman Lain'}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        {avail > 0
                          ? `Tersedia ${avail} buku fisik siap diambil di rak perpustakaan.`
                          : 'Buku sedang dipinjam pulang, estimasi kembali 3-5 hari ke depan.'}
                      </span>
                    </div>
                  </div>

                  {/* Wishlist Button inside Modal */}
                  <button
                    type="button"
                    onClick={() => handleToggleWishlist(activeModalBook.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition active:scale-95 ${
                      wishlist.includes(activeModalBook.id)
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'bg-surface-2 text-text border border-border'
                    }`}
                  >
                    <Heart
                      className={`h-3.5 w-3.5 ${
                        wishlist.includes(activeModalBook.id) ? 'fill-white' : ''
                      }`}
                    />
                    <span>
                      {wishlist.includes(activeModalBook.id) ? 'Buku Impian' : 'Simpan'}
                    </span>
                  </button>
                </div>
              );
            })()}

            {/* Synopsis */}
            <div className="rounded-2xl bg-surface-2 p-3.5 text-xs text-text-muted leading-relaxed border border-border">
              <p className="font-bold text-text mb-1">Ringkasan Cerita:</p>
              {activeModalBook.synopsis || 'Buku cerita bergambar penuh warna untuk melatih imajinasi dan budi pekerti ananda.'}
            </div>

            {/* Copies list */}
            {(() => {
              const items = allItems.filter((i) => i.bookId === activeModalBook.id);
              return (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-text">
                    Eksemplar Fisik di Sekolah ({items.length} Buku):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((it) => (
                      <span
                        key={it.id}
                        className={`text-[11px] font-mono font-medium px-2.5 py-1 rounded-xl flex items-center gap-1.5 ${
                          it.status === 'AVAILABLE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-surface-2 text-text-muted border border-border'
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            it.status === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        {it.itemBarcode} ({it.status === 'AVAILABLE' ? 'Tersedia' : 'Dipinjam'})
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Actions in Book Detail: Reservasi if not available, Loan if available */}
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-border">
              <div>
                {(() => {
                  const items = allItems.filter((i) => i.bookId === activeModalBook.id);
                  const avail = items.filter((i) => i.status === 'AVAILABLE').length;

                  if (avail === 0) {
                    const activeStudent = libraryStore.getActiveStudentSession();
                    return (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!activeStudent) {
                              soundFx.playErrorBeep();
                              alert(
                                '🔒 Mode Reservasi Khusus Siswa & Orang Tua Terdaftar!\n\nUntuk memesan buku yang sedang dipinjam teman lain, silakan masuk ke Portal Mandiri Siswa terlebih dahulu menggunakan username dan password ananda.'
                              );
                              if (onOpenStudentPortal) {
                                onOpenStudentPortal();
                              }
                              return;
                            }
                            setReservationBook(activeModalBook);
                            setDesiredPickupDate(new Date().toISOString().split('T')[0]);
                            setIsReservationModalOpen(true);
                            soundFx.playScanBeep();
                          }}
                          className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
                        >
                          <BookmarkPlus className="h-4 w-4" />
                          <span>Reservasi Buku Ini (Booking)</span>
                        </button>
                        {!activeStudent && (
                          <button
                            type="button"
                            onClick={() => {
                              if (onOpenStudentPortal) onOpenStudentPortal();
                            }}
                            className="text-[10px] text-amber-500 hover:underline font-bold cursor-pointer"
                          >
                            Masuk Portal Siswa untuk pesan →
                          </button>
                        )}
                      </div>
                    );
                  }

                  if (onSelectBookForLoan) {
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectBookForLoan(activeModalBook);
                          setActiveModalBook(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
                      >
                        <Zap className="h-4 w-4" />
                        <span>Pinjam Sekarang</span>
                      </button>
                    );
                  }

                  return null;
                })()}
              </div>

              <button
                type="button"
                onClick={() => setActiveModalBook(null)}
                className="px-5 py-2.5 rounded-xl bg-surface-2 hover:bg-surface border border-border text-text font-bold text-xs transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: RESERVASI BUKU (BOOKING KHUSUS SISWA TERDAFTAR)
          ========================================================================= */}
      {isReservationModalOpen && reservationBook && (() => {
        const activeStudent = libraryStore.getActiveStudentSession();
        if (!activeStudent) return null;

        return (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-surface shadow-2xl border border-border p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                    <BookmarkPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-text">Reservasi Buku (Booking)</h3>
                    <p className="text-[11px] text-text-muted">Simpan buku saat dikembalikan agar tidak diambil orang</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsReservationModalOpen(false);
                    setReservationBook(null);
                    setDesiredPickupDate('');
                  }}
                  className="p-1 rounded-lg text-text-muted hover:text-text hover:bg-surface-2 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Book Info */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-2 border border-border">
                <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 border border-border bg-slate-900">
                  <SmartBookCover
                    title={reservationBook.title}
                    author={reservationBook.author}
                    coverUrl={reservationBook.coverImage}
                    categoryId={reservationBook.categoryId}
                    aspectRatio="h-full w-full"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-text truncate">{reservationBook.title}</h4>
                  <p className="text-[11px] text-text-muted">{reservationBook.author}</p>
                  <span className="font-mono text-[9px] text-amber-500 font-bold block mt-0.5">
                    🏷️ {reservationBook.callNumber || generateSlimsCallNumber(reservationBook.title, reservationBook.author, reservationBook.categoryId)}
                  </span>
                </div>
              </div>

              {/* Student Identity: Strictly Bound to Logged-in Session */}
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-1">
                <span className="text-[10px] text-purple-400 font-bold block uppercase tracking-wider">
                  👤 Siswa Pemesan (Akun Login Anda):
                </span>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-extrabold text-sm text-text">{activeStudent.name}</h5>
                    <p className="text-[11px] text-text-muted">
                      {activeStudent.classGroup} • Kode: {activeStudent.memberCode}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-600/20 text-purple-300 font-mono text-xs font-bold">
                    @{activeStudent.username || activeStudent.memberCode}
                  </span>
                </div>
              </div>

              {/* Desired Pickup Date Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Pilih Rencana Tanggal Pengambilan Buku:</span>
                </label>
                <input
                  type="date"
                  value={desiredPickupDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDesiredPickupDate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-xs text-text font-medium outline-hidden focus:border-indigo-500 cursor-pointer"
                />
                <p className="text-[10px] text-text-muted">
                  Buku akan disiapkan dan disimpan khusus untuk ananda saat dikembalikan.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  <span>Ketentuan Timer Rundown 1x24 Jam:</span>
                </p>
                <p>• Buku diprioritaskan untukmu begitu siswa peminjam mengembalikan fisik buku ke perpustakaan.</p>
                <p>• Masa simpan di rak reservasi adalah <strong>1x24 jam</strong> sejak buku tiba. Status dan timer countdown dapat dipantau di Tab &quot;Reservasi Saya&quot; pada Portal Siswa.</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsReservationModalOpen(false);
                    setReservationBook(null);
                    setDesiredPickupDate('');
                  }}
                  className="px-4 py-2 rounded-xl bg-surface-2 text-text font-semibold text-xs hover:bg-surface border border-border cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const res = libraryStore.createReservation(
                      reservationBook.id,
                      activeStudent.id,
                      activeStudent.name,
                      desiredPickupDate || undefined
                    );
                    soundFx.playSuccessChime();
                    alert(
                      `✅ Reservasi Berhasil!\n\nBuku "${reservationBook.title}" telah dipesan khusus atas nama ${activeStudent.name}.\n\n⏱️ Timer rundown 1x24 jam telah aktif dan tercatat di Portal Mandiri Siswa & Orang Tua (Tab "Reservasi Saya").`
                    );
                    setIsReservationModalOpen(false);
                    setReservationBook(null);
                    setDesiredPickupDate('');
                  }}
                  className="px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs shadow-md transition cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <BookmarkPlus className="h-4 w-4" />
                  Konfirmasi Reservasi
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          MODAL: CMS ARTIKEL BERITA & PENGUMUMAN PERPUSTAKAAN
          ========================================================================= */}
      {activeNewsArticle && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-surface shadow-2xl border border-border p-6 space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400">
                  {activeNewsArticle.category}
                </span>
                <h3 className="text-base sm:text-lg font-bold font-display text-text mt-1">
                  {activeNewsArticle.title}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Dipublikasikan: {activeNewsArticle.publishedDate} • Oleh: {activeNewsArticle.author}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveNewsArticle(null)}
                className="p-1 rounded-lg text-text-muted hover:text-text hover:bg-surface-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-text-muted leading-relaxed space-y-3 whitespace-pre-line max-h-96 overflow-y-auto pr-1">
              <p className="font-semibold text-text">{activeNewsArticle.summary}</p>
              <p>{activeNewsArticle.content}</p>
            </div>

            <div className="pt-2 flex justify-end border-t border-border">
              <button
                type="button"
                onClick={() => setActiveNewsArticle(null)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          FLOATING BACK TO TOP BUTTON (UNTUK OPAC YANG BISA SCROLL PANJANG KE BAWAH)
          ========================================================================= */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-60 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-slate-950 font-extrabold text-xs shadow-2xl shadow-amber-500/50 border-2 border-amber-300 transition-all cursor-pointer animate-in fade-in slide-in-from-bottom-4 group select-none"
          title="Kembali ke Atas Halaman"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-950/20 group-hover:-translate-y-0.5 transition-transform">
            <ArrowUp className="h-3.5 w-3.5 text-slate-950 stroke-[3]" />
          </div>
          <span>Kembali ke Atas</span>
        </button>
      )}
    </div>
  );
};
