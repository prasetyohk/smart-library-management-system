'use client';

import {
  Book,
  BookItem,
  Member,
  Loan,
  LoanItem,
  Category,
  CategoryId,
  BookStatus,
  AcquisitionSource,
  FineAndDonation,
  TelegramConfig,
  BackupLog,
  Librarian,
  SchoolProfile,
  ReminderSchedule,
  AppMode,
  LibraryAnalytics,
  LoanRules,
  TelegramCommandTemplate,
  Language,
  FontSize,
  WishlistNotification,
  StockOpnameRecord,
  ActivityLogEntry,
  ShelfLocationItem,
  WhatsAppReminderTemplate,
  Reservation,
  LibraryNewsArticle,
  SlimsPatternConfig,
  KeyboardShortcutConfig,
  KeyboardShortcutItem,
  DraftBook,
} from '@/types';
import {
  INITIAL_BOOKS,
  INITIAL_BOOK_ITEMS,
  INITIAL_MEMBERS,
  INITIAL_LOANS,
  INITIAL_FINES_AND_DONATIONS,
  DEFAULT_TELEGRAM_CONFIG,
  DEFAULT_SCHOOL_PROFILE,
  DEFAULT_LIBRARIANS,
  DEFAULT_REMINDER_SCHEDULE,
  CATEGORIES,
  DEFAULT_LOAN_RULES,
  DEFAULT_TELEGRAM_TEMPLATES,
  DEFAULT_SHELVES,
  DEFAULT_WHATSAPP_TEMPLATES,
  DEFAULT_SLIMS_PATTERN,
  DEFAULT_LIBRARY_NEWS,
  DEFAULT_KEYBOARD_SHORTCUTS,
  generateSlimsCallNumber,
  getSbthSpineCode,
  getSbthInsideSlipData,
  deriveShelfCode,
  deriveCategoryDdc,
  deriveAuthorCode,
  deriveTitleCode,
  findCategory,
} from './constants';
import { resolveToDdcCategoryId } from './eddc';
import * as XLSX from 'xlsx';

const STORAGE_KEYS = {
  BOOKS: 'sbth_library_books_v1',
  ITEMS: 'sbth_library_items_v1',
  DRAFT_BOOKS: 'sbth_draft_books_v1',
  MEMBERS: 'sbth_library_members_v1',
  LOANS: 'sbth_library_loans_v1',
  FINES: 'sbth_library_fines_v1',
  TELEGRAM_CONFIG: 'sbth_library_telegram_config_v1',
  BACKUP_LOGS: 'sbth_library_backup_logs_v1',
  SCHOOL_PROFILE: 'sbth_library_school_profile_v1',
  LIBRARIANS: 'sbth_library_librarians_v1',
  CURRENT_LIBRARIAN: 'sbth_library_current_librarian_v1',
  REMINDER_SCHEDULE: 'sbth_library_reminder_schedule_v1',
  APP_MODE: 'sbth_library_app_mode_v1',
  CATEGORIES: 'sbth_library_categories_v1',
  WISHLIST: 'sbth_library_wishlist_v1',
  WISHLIST_NOTIFICATIONS: 'sbth_library_wishlist_notifs_v1',
  THEME: 'sbth_library_theme_v1',
  LOAN_RULES: 'sbth_library_loan_rules_v1',
  TELEGRAM_TEMPLATES: 'sbth_library_telegram_templates_v1',
  ACTIVE_STUDENT: 'sbth_library_active_student_v1',
  STUDENT_WISHLISTS: 'sbth_library_student_wishlists_v1',
  LANGUAGE: 'sbth_library_language_v1',
  STOCK_OPNAME: 'sbth_library_stock_opname_v1',
  FINANCE_ENABLED: 'sbth_library_finance_enabled_v1',
  SHELVES: 'sbth_library_shelves_v1',
  WHATSAPP_TEMPLATES: 'sbth_library_whatsapp_templates_v1',
  ACTIVITY_LOGS: 'sbth_library_activity_logs_v1',
  RESERVATIONS: 'sbth_library_reservations_v1',
  LIBRARY_NEWS: 'sbth_library_news_v1',
  SLIMS_PATTERN: 'sbth_library_slims_pattern_v1',
  KEYBOARD_SHORTCUTS: 'sbth_library_keyboard_shortcuts_v1',
  FONT_SIZE: 'sbth_library_font_size_v1',
  SHELF_ROW_ENABLED: 'sbth_library_shelf_row_enabled_v1',
};

export class LibraryStore {
  private static instance: LibraryStore;

  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  // --- BOOKS ---
  public getBooks(): Book[] {
    if (!this.isClient()) return INITIAL_BOOKS;
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKS);
    if (raw === null) {
      this.saveBooks(INITIAL_BOOKS);
      return INITIAL_BOOKS;
    }
    try {
      const parsed: Book[] = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        this.saveBooks(INITIAL_BOOKS);
        return INITIAL_BOOKS;
      }
      return parsed;
    } catch {
      return INITIAL_BOOKS;
    }
  }

  public saveBooks(books: Book[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
  }

  public findBookByIsbn(isbn: string): Book | undefined {
    const cleanIsbn = isbn.replace(/[-\s]/g, '');
    return this.getBooks().find((b) => b.isbn.replace(/[-\s]/g, '') === cleanIsbn);
  }

  // --- BOOK ITEMS (PHYSICAL COPIES) ---
  public getBookItems(): BookItem[] {
    if (!this.isClient()) return INITIAL_BOOK_ITEMS;
    const raw = localStorage.getItem(STORAGE_KEYS.ITEMS);
    let items: BookItem[] = [];
    if (raw === null) {
      items = [...INITIAL_BOOK_ITEMS];
      this.saveBookItems(items);
    } else {
      try {
        const parsed: BookItem[] = JSON.parse(raw);
        items = Array.isArray(parsed) ? parsed : [...INITIAL_BOOK_ITEMS];
      } catch {
        items = [...INITIAL_BOOK_ITEMS];
      }
    }

    // SELF-HEALING ENGINE:
    // Pastikan setiap judul buku yang ada di katalog memiliki minimal 1 eksemplar fisik aktif di inventaris.
    try {
      const books = this.getBooks();
      let hasHealed = false;

      if (books.length > 0) {
        for (const b of books) {
          const hasCopy = items.some((i) => i.bookId === b.id);
          if (!hasCopy) {
            hasHealed = true;
            const barcode = this.generateNextItemBarcode(b.categoryId);
            const shelf = b.shelfLocation || 'Rak Utama';
            items.push({
              id: `item-${b.id}-1`,
              bookId: b.id,
              itemBarcode: barcode,
              copyNumber: 1,
              status: 'AVAILABLE',
              shelfLocation: shelf,
              conditionNote: 'Kondisi prima siap dipinjam',
              acquisitionDate: b.createdAt ? b.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
              source: b.acquisitionSource || 'BELI_SEKOLAH',
              acquisitionSource: b.acquisitionSource || 'BELI_SEKOLAH',
              donorName: b.donorName,
              priceValue: b.priceValue || 45000,
              labelPrinted: false, // Otomatis siap dicetak di generator label
              statusUpdatedAt: new Date().toISOString().split('T')[0],
            });
          }
        }

        if (hasHealed) {
          this.saveBookItems(items);
        }
      }
    } catch {
      // Safe fallback
    }

    return items;
  }

  public saveBookItems(items: BookItem[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  }

  public findItemByBarcode(barcode: string): BookItem | undefined {
    const clean = barcode.trim().toUpperCase();
    return this.getBookItems().find((i) => i.itemBarcode.toUpperCase() === clean);
  }

  public getItemsForBook(bookId: string): BookItem[] {
    return this.getBookItems().filter((item) => item.bookId === bookId);
  }


  // Add Book + Sequential Physical Copies (supports donorName and priceValue)
  public addBook(
    bookData: Omit<Book, 'id' | 'createdAt'>,
    initialCopiesCount: number = 1,
    source: AcquisitionSource = 'BELI_SEKOLAH',
    donorName?: string,
    priceValue: number = 45000
  ): { book: Book; newItems: BookItem[] } {
    const books = this.getBooks();
    const items = this.getBookItems();

    const bookId = `b-${Date.now().toString(36)}`;
    const categories = this.getCategories();
    const cat = categories.find((c) => c.id === bookData.categoryId);
    const resolvedShelf = bookData.shelfLocation || cat?.shelfLocation || (cat ? `Rak ${cat.shortName}` : 'Rak Utama');
    
    // Auto-generate 4 baris kode punggung buku SBTH jika belum disediakan
    const spine = getSbthSpineCode(
      bookData.title,
      bookData.author,
      bookData.categoryId,
      bookData.shelfCode,
      bookData.classification,
      bookData.authorCode,
      bookData.titleCode
    );

    const shelfCode = (bookData.shelfCode && bookData.shelfCode.trim()) ? bookData.shelfCode.trim().toUpperCase() : spine.shelfCode;
    const classification = (bookData.classification && bookData.classification.trim()) ? bookData.classification.trim() : spine.ddc;
    const authorCode = (bookData.authorCode && bookData.authorCode.trim()) ? bookData.authorCode.trim().toUpperCase() : spine.authorCode;
    const titleCode = (bookData.titleCode && bookData.titleCode.trim()) ? bookData.titleCode.trim() : spine.titleCode;
    const callNo = bookData.callNumber || `${classification} ${authorCode} ${titleCode}`;

    const newBook: Book = {
      ...bookData,
      id: bookId,
      shelfLocation: resolvedShelf,
      shelfCode,
      classification,
      authorCode,
      titleCode,
      callNumber: callNo,
      createdAt: new Date().toISOString(),
    };

    const newItems: BookItem[] = [];

    for (let i = 1; i <= Math.max(1, initialCopiesCount); i++) {
      const barcode = this.generateNextItemBarcode(bookData.categoryId);

      newItems.push({
        id: `item-${Date.now().toString(36)}-${i}`,
        bookId: bookId,
        itemBarcode: barcode,
        copyNumber: i,
        status: 'AVAILABLE',
        shelfLocation: resolvedShelf,
        conditionNote: 'Kondisi baru',
        acquisitionDate: new Date().toISOString().split('T')[0],
        source,
        acquisitionSource: source,
        donorName: source === 'SUMBANGAN_ORTU' || source === 'SUMBANGAN' ? donorName : undefined,
        priceValue: priceValue || 45000,
        statusUpdatedAt: new Date().toISOString().split('T')[0],
      });
    }

    this.saveBooks([newBook, ...books]);
    this.saveBookItems([...items, ...newItems]);

    this.addActivityLog({
      category: 'CATALOG',
      action: 'TAMBAH_BUKU',
      actor: 'Pustakawan',
      details: `Menambahkan buku baru "${newBook.title}" (${newItems.length} eksemplar) di ${resolvedShelf}. Barcode: ${newItems[0]?.itemBarcode}${newItems.length > 1 ? ` s/d ${newItems[newItems.length - 1]?.itemBarcode}` : ''}.`,
    });

    return { book: newBook, newItems };
  }

  // Add more copies to existing book
  public addCopiesToBook(
    bookId: string,
    count: number,
    source: AcquisitionSource = 'BELI_SEKOLAH',
    donorName?: string,
    priceValue: number = 45000
  ): BookItem[] {
    const items = this.getBookItems();
    const books = this.getBooks();
    const parentBook = books.find((b) => b.id === bookId);
    const existing = items.filter((it) => it.bookId === bookId);
    let highestCopyNum = 0;
    existing.forEach((it) => {
      if (it.copyNumber > highestCopyNum) highestCopyNum = it.copyNumber;
    });

    const newItems: BookItem[] = [];
    const resolvedShelf = parentBook?.shelfLocation || 'Rak Utama';

    for (let i = 1; i <= count; i++) {
      const barcode = this.generateNextItemBarcode(parentBook?.categoryId);
      highestCopyNum++;

      newItems.push({
        id: `item-${Date.now().toString(36)}-${i}`,
        bookId: bookId,
        itemBarcode: barcode,
        copyNumber: highestCopyNum,
        status: 'AVAILABLE',
        shelfLocation: resolvedShelf,
        conditionNote: 'Eksemplar baru ditambahkan',
        acquisitionDate: new Date().toISOString().split('T')[0],
        source,
        acquisitionSource: source,
        donorName: source === 'SUMBANGAN_ORTU' || source === 'SUMBANGAN' ? donorName : undefined,
        priceValue: priceValue || parentBook?.priceValue || 45000,
        statusUpdatedAt: new Date().toISOString().split('T')[0],
      });
    }

    this.saveBookItems([...items, ...newItems]);

    this.addActivityLog({
      category: 'CATALOG',
      action: 'TAMBAH_EKSEMPLAR',
      actor: 'Pustakawan',
      details: `Menambahkan ${newItems.length} eksemplar fisik baru untuk buku "${parentBook?.title || bookId}". Barcode: ${newItems[0]?.itemBarcode}${newItems.length > 1 ? ` s/d ${newItems[newItems.length - 1]?.itemBarcode}` : ''}.`,
    });

    return newItems;
  }

  // Update Book Title & Metadata + Auto Sync Category, Rak, and Kode Punggung
  public updateBook(bookId: string, updates: Partial<Book>, librarianName?: string): Book | null {
    const books = this.getBooks();
    const idx = books.findIndex((b) => b.id === bookId);
    if (idx === -1) return null;

    const prev = books[idx];
    const categoryId = updates.categoryId || prev.categoryId;
    const cat = this.getCategories().find((c) => c.id === categoryId);

    // Jika kategori berubah dan lokasi rak tidak diatur eksplisit, sesuaikan ke rak bawaan kategori
    let resolvedShelf = updates.shelfLocation;
    if (!resolvedShelf) {
      if (updates.categoryId && updates.categoryId !== prev.categoryId) {
        resolvedShelf = cat?.shelfLocation || `Rak ${cat?.shortName || 'Utama'}`;
      } else {
        resolvedShelf = prev.shelfLocation;
      }
    }

    // Auto-sync spine codes jika ada yang kosong atau kategori/judul/pengarang berubah
    const spine = getSbthSpineCode(
      updates.title || prev.title,
      updates.author || prev.author,
      categoryId,
      updates.shelfCode || prev.shelfCode,
      updates.classification || prev.classification,
      updates.authorCode || prev.authorCode,
      updates.titleCode || prev.titleCode
    );

    const shelfCode = updates.shelfCode || prev.shelfCode || spine.shelfCode;
    const classification = updates.classification || prev.classification || spine.ddc;
    const authorCode = updates.authorCode || prev.authorCode || spine.authorCode;
    const titleCode = updates.titleCode || prev.titleCode || spine.titleCode;
    const callNumber = updates.callNumber || `${classification} ${authorCode} ${titleCode}`;

    const updated: Book = {
      ...prev,
      ...updates,
      shelfLocation: resolvedShelf,
      shelfCode,
      classification,
      authorCode,
      titleCode,
      callNumber,
    };
    books[idx] = updated;
    this.saveBooks(books);

    // SINKRONISASI FISIK: Jika lokasi rak buku berubah, otomatis update lokasi rak seluruh eksemplar fisik buku ini
    if (resolvedShelf && resolvedShelf !== prev.shelfLocation) {
      const items = this.getBookItems();
      let hasItemChanges = false;
      const updatedItems = items.map((it) => {
        if (it.bookId === bookId && it.shelfLocation !== resolvedShelf) {
          hasItemChanges = true;
          return {
            ...it,
            shelfLocation: resolvedShelf,
            statusUpdatedAt: new Date().toISOString().split('T')[0],
          };
        }
        return it;
      });
      if (hasItemChanges) {
        this.saveBookItems(updatedItems);
      }
    }

    const actor = librarianName || this.getCurrentLibrarian()?.name || 'Pustakawan SBTH';
    this.addActivityLog({
      category: 'CATALOG',
      action: 'EDIT_BUKU',
      actor,
      targetTitle: updated.title,
      details: `Mengubah data katalog buku "${updated.title}" (ISBN: ${updated.isbn}). Kategori: ${cat?.name || categoryId}, Rak: ${resolvedShelf}. Kode Punggung: [${shelfCode} / ${classification} / ${authorCode} / ${titleCode}].`,
    });

    return updated;
  }

  // Update Specific Physical Copy / Item
  public updateBookItem(itemId: string, updates: Partial<BookItem>): BookItem | null {
    const items = this.getBookItems();
    const idx = items.findIndex((i) => i.id === itemId);
    if (idx === -1) return null;

    const today = new Date().toISOString().split('T')[0];
    const updated: BookItem = {
      ...items[idx],
      ...updates,
      statusUpdatedAt: today,
    };
    items[idx] = updated;
    this.saveBookItems(items);
    return updated;
  }

  // Replace Damaged/Lost item with brand new copy while maintaining the same physical barcode code
  public replaceDamagedItemWithNew(itemId: string, replacementNote?: string): BookItem | null {
    const items = this.getBookItems();
    const idx = items.findIndex((i) => i.id === itemId);
    if (idx === -1) return null;

    const today = new Date().toISOString().split('T')[0];
    const prevCondition = items[idx].conditionNote || '';
    const updated: BookItem = {
      ...items[idx],
      status: 'AVAILABLE',
      isReplaced: true,
      replacementDate: today,
      conditionNote: `Buku baru pengganti (Kondisi Prima). Riwayat sebelumnya: ${prevCondition || 'Rusak/Hilang'}`,
      replacementNote: replacementNote || 'Telah diganti dengan buku baru',
      disposalReason: undefined,
      disposedAt: undefined,
      statusUpdatedAt: today,
    };
    items[idx] = updated;
    this.saveBookItems(items);
    return updated;
  }

  // Update Item Status (Tersedia, Dipinjam, Perbaikan, Rusak, Hilang, Dimusnahkan)
  public updateItemStatus(
    itemId: string,
    status: BookStatus,
    conditionNote?: string,
    disposalReason?: string,
    librarianName?: string
  ): BookItem | null {
    const items = this.getBookItems();
    const idx = items.findIndex((i) => i.id === itemId);
    if (idx === -1) return null;

    const today = new Date().toISOString().split('T')[0];
    const prevItem = items[idx];
    const book = this.getBooks().find((b) => b.id === prevItem.bookId);

    const updated: BookItem = {
      ...prevItem,
      status,
      conditionNote: conditionNote !== undefined ? conditionNote : prevItem.conditionNote,
      disposalReason: status === 'DISPOSED' ? (disposalReason || 'Koleksi Rusak Berat / Afkir') : undefined,
      disposedAt: status === 'DISPOSED' ? today : undefined,
      disposedBy: status === 'DISPOSED' ? (librarianName || this.getCurrentLibrarian()?.name || 'Pustakawan SBTH') : undefined,
      statusUpdatedAt: today,
    };

    items[idx] = updated;
    this.saveBookItems(items);

    const actor = librarianName || this.getCurrentLibrarian()?.name || 'Pustakawan SBTH';

    if (status === 'DISPOSED') {
      this.addActivityLog({
        category: 'CATALOG',
        action: 'PEMUSNAHAN_BUKU',
        actor,
        targetTitle: book?.title || 'Buku SBTH',
        targetBarcode: updated.itemBarcode,
        details: `Pemusnahan eksemplar fisik ${updated.itemBarcode} (Copy #${updated.copyNumber}) dari buku "${book?.title || '-'}" karena: ${disposalReason || 'Koleksi Rusak Berat / Afkir'}.`,
      });
    } else {
      this.addActivityLog({
        category: 'CATALOG',
        action: 'UPDATE_STATUS_EKSEMPLAR',
        actor,
        targetTitle: book?.title || 'Buku SBTH',
        targetBarcode: updated.itemBarcode,
        details: `Mengubah status eksemplar ${updated.itemBarcode} menjadi "${status}". Catatan: ${conditionNote || '-'}.`,
      });
    }

    return updated;
  }

  // Restore Disposed Item back to Available
  public restoreItemFromDisposed(itemId: string, librarianName?: string): BookItem | null {
    const items = this.getBookItems();
    const idx = items.findIndex((i) => i.id === itemId);
    if (idx === -1) return null;

    const today = new Date().toISOString().split('T')[0];
    const prevItem = items[idx];
    const book = this.getBooks().find((b) => b.id === prevItem.bookId);

    const updated: BookItem = {
      ...prevItem,
      status: 'AVAILABLE',
      conditionNote: 'Dipulihkan kembali ke sirkulasi aktif',
      disposalReason: undefined,
      disposedAt: undefined,
      disposedBy: undefined,
      statusUpdatedAt: today,
    };

    items[idx] = updated;
    this.saveBookItems(items);

    const actor = librarianName || this.getCurrentLibrarian()?.name || 'Pustakawan SBTH';
    this.addActivityLog({
      category: 'CATALOG',
      action: 'PULIHKAN_EKSEMPLAR',
      actor,
      targetTitle: book?.title || 'Buku SBTH',
      targetBarcode: updated.itemBarcode,
      details: `Memulihkan eksemplar ${updated.itemBarcode} (Copy #${updated.copyNumber}) dari status pemusnahan kembali ke status TERSEDIA.`,
    });

    return updated;
  }

  // Hapus Buku Permanen (Khusus Koreksi Salah Input / Salah Scan ISBN)
  public deleteBook(
    bookId: string,
    reason: string = 'Salah input judul/ISBN',
    librarianName?: string
  ): { success: boolean; message: string } {
    const books = this.getBooks();
    const targetBook = books.find((b) => b.id === bookId);
    if (!targetBook) {
      return { success: false, message: 'Buku tidak ditemukan di sistem.' };
    }

    const items = this.getBookItems();
    const bookCopies = items.filter((i) => i.bookId === bookId);

    // Keamanan 1: Cegah penghapusan jika ada eksemplar yang sedang berstatus PINJAM
    const hasBorrowed = bookCopies.some((i) => i.status === 'BORROWED');
    if (hasBorrowed) {
      return {
        success: false,
        message: 'Tidak dapat menghapus buku karena ada eksemplar yang sedang dipinjam oleh siswa! Harap selesaikan pengembalian sirkulasi terlebih dahulu.',
      };
    }

    // Hapus buku & seluruh eksemplarnya
    const remainingBooks = books.filter((b) => b.id !== bookId);
    const remainingItems = items.filter((i) => i.bookId !== bookId);

    this.saveBooks(remainingBooks);
    this.saveBookItems(remainingItems);

    const actor = librarianName || this.getCurrentLibrarian()?.name || 'Pustakawan SBTH';
    this.addActivityLog({
      category: 'CATALOG',
      action: 'HAPUS_BUKU_SALAH_INPUT',
      actor,
      targetTitle: targetBook.title,
      details: `Menghapus buku "${targetBook.title}" (ISBN: ${targetBook.isbn}, ${bookCopies.length} eksemplar). Alasan: ${reason}.`,
    });

    return {
      success: true,
      message: `Buku "${targetBook.title}" beserta ${bookCopies.length} eksemplarnya berhasil dihapus dari sistem.`,
    };
  }

  // Hapus Satu Eksemplar Fisik
  public deleteBookItem(
    itemId: string,
    reason: string = 'Koreksi salah input eksemplar',
    librarianName?: string
  ): { success: boolean; message: string } {
    const items = this.getBookItems();
    const item = items.find((i) => i.id === itemId);
    if (!item) {
      return { success: false, message: 'Eksemplar tidak ditemukan.' };
    }

    if (item.status === 'BORROWED') {
      return {
        success: false,
        message: 'Tidak dapat menghapus eksemplar yang sedang berstatus DIPINJAM.',
      };
    }

    const book = this.getBooks().find((b) => b.id === item.bookId);
    const remainingItems = items.filter((i) => i.id !== itemId);
    this.saveBookItems(remainingItems);

    const actor = librarianName || this.getCurrentLibrarian()?.name || 'Pustakawan SBTH';
    this.addActivityLog({
      category: 'CATALOG',
      action: 'HAPUS_EKSEMPLAR',
      actor,
      targetTitle: book?.title || 'Buku SBTH',
      targetBarcode: item.itemBarcode,
      details: `Menghapus eksemplar ${item.itemBarcode} (Copy #${item.copyNumber}) dari buku "${book?.title || '-'}". Alasan: ${reason}.`,
    });

    return {
      success: true,
      message: `Eksemplar ${item.itemBarcode} berhasil dihapus.`,
    };
  }

  // Mark stickers / labels as printed or manually stamped with audit logging
  public markLabelsPrinted(
    barcodes: string[],
    printed: boolean = true,
    method: 'PRINT' | 'MANUAL_STAMP' = 'PRINT'
  ): void {
    const items = this.getBookItems();
    const books = this.getBooks();
    let modified = false;
    const modifiedTitles: string[] = [];

    items.forEach((it) => {
      if (barcodes.includes(it.itemBarcode)) {
        it.labelPrinted = printed;
        modified = true;
        const b = books.find((x) => x.id === it.bookId);
        if (b && !modifiedTitles.includes(b.title)) {
          modifiedTitles.push(b.title);
        }
      }
    });

    if (modified) {
      this.saveBookItems(items);
      const actionName = printed
        ? method === 'MANUAL_STAMP'
          ? 'TANDAI_CAP_MANUAL'
          : 'CETAK_LABEL_BARCODE'
        : 'BATAL_TANDAI_LABEL';
      const detailMsg = printed
        ? method === 'MANUAL_STAMP'
          ? `Menandai ${barcodes.length} eksemplar fisik buku sudah dicap manual/ditulis nomor daftar (${barcodes.slice(0, 3).join(', ')}${barcodes.length > 3 ? '...' : ''}).`
          : `Mencetak / menandai ${barcodes.length} label barcode fisik (${barcodes.slice(0, 3).join(', ')}${barcodes.length > 3 ? '...' : ''}).`
        : `Membatalkan tanda label pada ${barcodes.length} eksemplar fisik (${barcodes.slice(0, 3).join(', ')}${barcodes.length > 3 ? '...' : ''}).`;

      this.addActivityLog({
        category: 'CATALOG',
        action: actionName as any,
        actor: 'Pustakawan',
        targetTitle: modifiedTitles.length > 0 ? modifiedTitles.slice(0, 2).join(', ') : 'Label Eksemplar',
        targetBarcode: barcodes[0],
        details: detailMsg,
      });
    }
  }

  private getNextBarcodeNumber(): number {
    const items = this.getBookItems();
    let max = 100;
    items.forEach((item) => {
      const match = item.itemBarcode.match(/SBTH-B-(\d+)/i);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > max) max = num;
      }
    });
    return max + 1;
  }

  // --- MEMBERS ---
  public getMembers(): Member[] {
    if (!this.isClient()) return INITIAL_MEMBERS;
    const raw = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    if (!raw) {
      this.saveMembers(INITIAL_MEMBERS);
      return INITIAL_MEMBERS;
    }
    try {
      const parsed: Member[] = JSON.parse(raw);
      let modified = false;
      parsed.forEach((m) => {
        // Auto migrate old class names (Bintang, Matahari, Bulan, Pelangi, TK-A 1, etc.)
        if (m.classGroup.includes('Bintang') || m.classGroup === 'TK-A 1') {
          m.classGroup = 'TK-A A';
          m.classLetter = 'A';
          modified = true;
        } else if (m.classGroup.includes('Matahari') || m.classGroup === 'TK-B 1') {
          m.classGroup = 'TK-B A';
          m.classLetter = 'A';
          modified = true;
        } else if (m.classGroup.includes('Bulan') || m.classGroup === 'TK-A 2') {
          m.classGroup = 'TK-A B';
          m.classLetter = 'B';
          modified = true;
        } else if (m.classGroup.includes('Pelangi') || m.classGroup === 'TK-B 2') {
          m.classGroup = 'TK-B B';
          m.classLetter = 'B';
          modified = true;
        } else if (/Toddler\s*1/i.test(m.classGroup)) {
          m.classGroup = 'Toddler A';
          m.classLetter = 'A';
          modified = true;
        } else if (/Nursery\s*1/i.test(m.classGroup)) {
          m.classGroup = 'Nursery A';
          m.classLetter = 'A';
          modified = true;
        }

        // Clean names of Pojok Baca from celestial names to letter format
        if (m.name.includes('Bintang')) {
          m.name = m.name.replace(/Bintang/g, 'A');
          modified = true;
        }
        if (m.name.includes('Matahari')) {
          m.name = m.name.replace(/Matahari/g, 'A');
          modified = true;
        }
        if (m.name.includes('Bulan')) {
          m.name = m.name.replace(/Bulan/g, 'B');
          modified = true;
        }
        if (m.name.includes('Pelangi')) {
          m.name = m.name.replace(/Pelangi/g, 'B');
          modified = true;
        }

        // Auto-fix Ms. Santi to Ms. Kriss
        if (m.name.includes('Ms. Santi') || m.name.includes('Santi')) {
          m.name = 'Ms. Kriss (Pustakawan & Guru)';
          m.username = 'ms_kriss';
          modified = true;
        }
        // Ensure username and password exist
        if (!m.username) {
          m.username = m.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
          modified = true;
        }
        if (!m.password) {
          m.password = '123';
          modified = true;
        }
      });
      if (modified) {
        this.saveMembers(parsed);
      }
      return parsed;
    } catch {
      return INITIAL_MEMBERS;
    }
  }

  public saveMembers(members: Member[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  }

  public deleteMember(id: string): void {
    if (!this.isClient()) return;
    const members = this.getMembers().filter((m) => m.id !== id);
    this.saveMembers(members);
  }

  public deleteMembers(ids: string[]): void {
    if (!this.isClient()) return;
    const idSet = new Set(ids);
    const members = this.getMembers().filter((m) => !idSet.has(m.id));
    this.saveMembers(members);
  }

  public findMemberByCode(code: string): Member | undefined {
    const clean = code.trim().toUpperCase();
    return this.getMembers().find((m) => m.memberCode.toUpperCase() === clean);
  }

  public isUsernameTaken(username: string, excludeId?: string): boolean {
    if (!username || !username.trim()) return false;
    const clean = username.trim().toLowerCase();
    const members = this.getMembers();
    return members.some((m) => {
      if (excludeId && m.id === excludeId) return false;
      // Only active members hold usernames; graduated/inactive usernames are reusable
      if (m.status === 'GRADUATED' || m.status === 'INACTIVE') return false;
      return (m.username || '').trim().toLowerCase() === clean;
    });
  }

  public findMembersByParentPhone(phone: string): Member[] {
    if (!phone || !phone.trim()) return [];
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 4) return [];
    const members = this.getMembers();
    return members.filter((m) => {
      if (m.status === 'GRADUATED' || m.status === 'INACTIVE') return false;
      const p = (m.parentPhone || '').replace(/[^0-9]/g, '');
      return p && (p.includes(cleanPhone) || cleanPhone.includes(p));
    });
  }

  public addMember(memberData: Omit<Member, 'id' | 'memberCode'>): Member {
    const members = this.getMembers();
    const code = `SBTH-M-${(members.length + 20).toString().padStart(4, '0')}`;
    const newMember: Member = {
      ...memberData,
      id: `m-${Date.now().toString(36)}`,
      memberCode: code,
      password: (memberData.password || '1234').trim(),
      username: (memberData.username || memberData.name.toLowerCase().replace(/[^a-z0-9]/g, '_')).trim(),
    };
    this.saveMembers([...members, newMember]);
    return newMember;
  }

  // --- CIRCULATION / LOANS ---
  public getLoans(): Loan[] {
    if (!this.isClient()) return INITIAL_LOANS;
    const raw = localStorage.getItem(STORAGE_KEYS.LOANS);
    if (!raw) {
      this.saveLoans(INITIAL_LOANS);
      return INITIAL_LOANS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_LOANS;
    }
  }

  public saveLoans(loans: Loan[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
  }

  public createLoan(
    memberId: string,
    itemBarcodes: string[],
    durationDays: number = 7,
    notes: string = '',
    handledBy?: string
  ): { loan: Loan; updatedItems: BookItem[] } {
    const loans = this.getLoans();
    const items = this.getBookItems();
    const books = this.getBooks();
    const members = this.getMembers();

    const loanId = `loan-${Date.now().toString(36)}`;
    const loanDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + durationDays);

    const loanDateStr = loanDate.toISOString().split('T')[0];
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const updatedItems = items.map((item) => {
      if (itemBarcodes.includes(item.itemBarcode)) {
        return {
          ...item,
          status: 'BORROWED' as BookStatus,
          statusUpdatedAt: loanDateStr,
        };
      }
      return item;
    });

    const loanItems = itemBarcodes.map((barcode, idx) => {
      const item = items.find((i) => i.itemBarcode === barcode);
      const book = item ? books.find((b) => b.id === item.bookId) : undefined;
      return {
        id: `li-${Date.now().toString(36)}-${idx}`,
        loanId,
        bookItemId: item ? item.id : '',
        itemBarcode: barcode,
        bookTitle: book ? book.title : 'Buku SBTH',
        returnDate: null,
      };
    });

    const librarianName = handledBy || this.getCurrentLibrarian()?.name || 'Pustakawan SBTH';
    const member = members.find((m) => m.id === memberId);

    const newLoan: Loan = {
      id: loanId,
      memberId,
      loanDate: loanDateStr,
      dueDate: dueDateStr,
      status: 'ACTIVE',
      handledBy: librarianName,
      notes,
      items: loanItems,
    };

    this.saveLoans([newLoan, ...loans]);
    this.saveBookItems(updatedItems);

    const titlesSummary = loanItems.map((li) => li.bookTitle).join(', ');
    this.addActivityLog({
      category: 'CIRCULATION',
      action: 'PEMINJAMAN_BUKU',
      actor: librarianName,
      targetMember: member ? `${member.name} (${member.classGroup})` : 'Siswa',
      targetBarcode: itemBarcodes.join(', '),
      targetTitle: titlesSummary,
      details: `Meminjamkan ${itemBarcodes.length} eksemplar (${itemBarcodes.join(', ')}) kepada ${member?.name || memberId} (${member?.classGroup || '-'}). Jatuh tempo: ${dueDateStr}.`,
    });

    return { loan: newLoan, updatedItems };
  }

  // Return specific item
  public returnBookItem(
    itemBarcode: string,
    condition: 'GOOD' | 'DAMAGED' | 'LOST' = 'GOOD',
    notes: string = '',
    handledBy?: string
  ): { success: boolean; loan?: Loan; item?: BookItem; member?: Member; message?: string } {
    const loans = this.getLoans();
    const items = this.getBookItems();
    const members = this.getMembers();

    const cleanBarcode = itemBarcode.trim().toUpperCase();
    const item = items.find((i) => i.itemBarcode.toUpperCase() === cleanBarcode);
    if (!item) return { success: false, message: 'Buku dengan barcode ini tidak ditemukan di sistem perpustakaan.' };

    let foundLoan: Loan | undefined;
    const todayStr = new Date().toISOString().split('T')[0];

    const updatedLoans = loans.map((loan) => {
      if (loan.status === 'RETURNED') return loan;

      const hasItem = loan.items.some(
        (it) => it.itemBarcode.toUpperCase() === cleanBarcode && !it.returnDate
      );

      if (hasItem) {
        foundLoan = loan;
        const updatedItems = loan.items.map((it) => {
          if (it.itemBarcode.toUpperCase() === cleanBarcode && !it.returnDate) {
            return {
              ...it,
              returnDate: todayStr,
              returnCondition: condition,
              notes,
            };
          }
          return it;
        });

        const allReturned = updatedItems.every((it) => it.returnDate !== null);

        return {
          ...loan,
          status: allReturned ? ('RETURNED' as const) : loan.status,
          items: updatedItems,
        };
      }
      return loan;
    });

    let nextStatus: BookStatus = 'AVAILABLE';
    if (condition === 'DAMAGED') nextStatus = 'DAMAGED';
    if (condition === 'LOST') nextStatus = 'LOST';

    const updatedItems = items.map((i) => {
      if (i.itemBarcode.toUpperCase() === cleanBarcode) {
        return {
          ...i,
          status: nextStatus,
          statusUpdatedAt: todayStr,
          conditionNote: notes ? `${i.conditionNote} | ${notes}` : i.conditionNote,
        };
      }
      return i;
    });

    this.saveLoans(updatedLoans);
    this.saveBookItems(updatedItems);

    // Wishlist Notification Trigger: If returned book is in student wishlists
    if (item && item.bookId) {
      const wishlist = this.getWishlist();
      if (wishlist.includes(item.bookId)) {
        const book = this.getBooks().find((b) => b.id === item.bookId);
        if (book) {
          this.addWishlistNotification({
            bookId: book.id,
            bookTitle: book.title,
            itemBarcode: item.itemBarcode,
          });
        }
      }
    }

    const member = foundLoan ? members.find((m) => m.id === foundLoan?.memberId) : undefined;
    const book = this.getBooks().find((b) => b.id === item.bookId);
    const librarianName = handledBy || this.getCurrentLibrarian()?.name || 'Pustakawan SBTH';

    // Activity Log
    this.addActivityLog({
      category: 'CIRCULATION',
      action: 'PENGEMBALIAN_BUKU',
      actor: librarianName,
      targetTitle: book?.title || 'Buku SBTH',
      targetBarcode: cleanBarcode,
      targetMember: member ? `${member.name} (${member.classGroup})` : undefined,
      details: `Pengembalian buku "${book?.title || 'Buku SBTH'}" (${cleanBarcode}) dari ${member?.name || 'Siswa'}. Kondisi: ${condition === 'GOOD' ? 'Baik' : condition === 'DAMAGED' ? 'Rusak' : 'Hilang'}${notes ? ` - Catatan: ${notes}` : ''}.`,
    });

    return {
      success: true,
      loan: foundLoan,
      item,
      member,
      message: 'Buku berhasil dikembalikan dan tercatat di sistem.',
    };
  }

  public returnLoanItem(
    itemBarcode: string,
    condition: 'GOOD' | 'DAMAGED' | 'LOST' = 'GOOD',
    notes: string = '',
    handledBy?: string
  ) {
    return this.returnBookItem(itemBarcode, condition, notes, handledBy);
  }

  // --- ITEM CIRCULATION INSPECTION & HISTORY ---
  public getItemCirculationInfo(barcodeOrId: string): {
    item?: BookItem;
    book?: Book;
    currentLoan?: {
      loan: Loan;
      member: Member;
      loanItem: LoanItem;
    };
    history: {
      loan: Loan;
      member: Member;
      loanItem: LoanItem;
    }[];
  } {
    const clean = barcodeOrId.trim().toUpperCase();
    const items = this.getBookItems();
    const books = this.getBooks();
    const loans = this.getLoans();
    const members = this.getMembers();

    const item = items.find(
      (i) => i.itemBarcode.toUpperCase() === clean || i.id.toUpperCase() === clean
    );
    if (!item) return { history: [] };

    const book = books.find((b) => b.id === item.bookId);

    let currentLoan: { loan: Loan; member: Member; loanItem: LoanItem } | undefined;
    const history: { loan: Loan; member: Member; loanItem: LoanItem }[] = [];

    loans.forEach((loan) => {
      const li = loan.items.find(
        (it) => it.itemBarcode.toUpperCase() === item.itemBarcode.toUpperCase() || it.bookItemId === item.id
      );
      if (li) {
        const member = members.find((m) => m.id === loan.memberId) || {
          id: loan.memberId,
          name: 'Siswa / Anggota SBTH',
          memberCode: 'SBTH-M-XXXX',
          classGroup: 'Kelas SBTH',
          type: 'STUDENT' as const,
          maxLoanLimit: 2,
          photoUrl: '',
        };

        const record = { loan, member, loanItem: li };

        // If loan is active/overdue and item not yet returned
        if ((loan.status === 'ACTIVE' || loan.status === 'OVERDUE') && !li.returnDate) {
          currentLoan = record;
        }

        history.push(record);
      }
    });

    history.sort((a, b) => new Date(b.loan.loanDate).getTime() - new Date(a.loan.loanDate).getTime());

    return { item, book, currentLoan, history };
  }

  // --- WISHLIST NOTIFICATIONS (Anak / Kiosk) ---
  public getWishlistNotifications(): WishlistNotification[] {
    if (!this.isClient()) return [];
    const raw = localStorage.getItem(STORAGE_KEYS.WISHLIST_NOTIFICATIONS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public saveWishlistNotifications(notifs: WishlistNotification[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.WISHLIST_NOTIFICATIONS, JSON.stringify(notifs));
  }

  public addWishlistNotification(notif: Omit<WishlistNotification, 'id' | 'returnedAt' | 'read'>): void {
    const list = this.getWishlistNotifications();
    const newNotif: WishlistNotification = {
      ...notif,
      id: `wn-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      returnedAt: new Date().toISOString(),
      read: false,
    };
    this.saveWishlistNotifications([newNotif, ...list.slice(0, 24)]);
  }

  public markWishlistNotificationRead(id: string): void {
    const list = this.getWishlistNotifications();
    const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
    this.saveWishlistNotifications(updated);
  }

  public clearWishlistNotifications(): void {
    this.saveWishlistNotifications([]);
  }

  // --- FINES & DONATIONS ---
  public getFines(): FineAndDonation[] {
    if (!this.isClient()) return INITIAL_FINES_AND_DONATIONS;
    const raw = localStorage.getItem(STORAGE_KEYS.FINES);
    if (!raw) {
      this.saveFines(INITIAL_FINES_AND_DONATIONS);
      return INITIAL_FINES_AND_DONATIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_FINES_AND_DONATIONS;
    }
  }

  public saveFines(fines: FineAndDonation[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.FINES, JSON.stringify(fines));
  }

  public addFine(fineData: Omit<FineAndDonation, 'id' | 'createdAt'>): FineAndDonation {
    const fines = this.getFines();
    const newFine: FineAndDonation = {
      ...fineData,
      id: `fine-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.saveFines([newFine, ...fines]);
    return newFine;
  }

  public updateFineStatus(id: string, status: FineAndDonation['paidStatus']): void {
    const fines = this.getFines();
    const today = new Date().toISOString().split('T')[0];
    const updated = fines.map((f) => {
      if (f.id === id) {
        return {
          ...f,
          paidStatus: status,
          paidAt: status === 'PAID' ? today : f.paidAt,
        };
      }
      return f;
    });
    this.saveFines(updated);
  }

  public getFinancialSummary(): {
    dendaTerlambat: number;
    gantiRusakHilang: number;
    sumbanganTunai: number;
    tunggakanBelumLunas: number;
    unpaidCount: number;
  } {
    const fines = this.getFines();
    let dendaTerlambat = 0;
    let gantiRusakHilang = 0;
    let sumbanganTunai = 0;
    let tunggakanBelumLunas = 0;
    let unpaidCount = 0;

    fines.forEach((f) => {
      if (f.paidStatus === 'PAID') {
        if (f.type === 'DENDA_TERLAMBAT') dendaTerlambat += f.amount;
        else if (f.type === 'GANTI_RUSAK' || f.type === 'GANTI_HILANG') gantiRusakHilang += f.amount;
        else if (f.type === 'SUMBANGAN_TUNAI') sumbanganTunai += f.amount;
      } else if (f.paidStatus === 'UNPAID') {
        tunggakanBelumLunas += f.amount;
        unpaidCount++;
      }
    });

    return {
      dendaTerlambat,
      gantiRusakHilang,
      sumbanganTunai,
      tunggakanBelumLunas,
      unpaidCount,
    };
  }

  // --- TELEGRAM CONFIG & BACKUP LOGS ---
  public getTelegramConfig(): TelegramConfig {
    if (!this.isClient()) return DEFAULT_TELEGRAM_CONFIG;
    const raw = localStorage.getItem(STORAGE_KEYS.TELEGRAM_CONFIG);
    if (!raw) {
      this.saveTelegramConfig(DEFAULT_TELEGRAM_CONFIG);
      return DEFAULT_TELEGRAM_CONFIG;
    }
    try {
      return { ...DEFAULT_TELEGRAM_CONFIG, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_TELEGRAM_CONFIG;
    }
  }

  public saveTelegramConfig(config: TelegramConfig): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.TELEGRAM_CONFIG, JSON.stringify(config));
  }

  public getBackupLogs(): BackupLog[] {
    if (!this.isClient()) return [];
    const raw = localStorage.getItem(STORAGE_KEYS.BACKUP_LOGS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public addBackupLog(log: Omit<BackupLog, 'id' | 'timestamp'>): void {
    const logs = this.getBackupLogs();
    const newLog: BackupLog = {
      ...log,
      id: `log-${Date.now().toString(36)}`,
      timestamp: new Date().toLocaleString('id-ID'),
    };
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.BACKUP_LOGS, JSON.stringify([newLog, ...logs.slice(0, 19)]));
    }
  }

  // --- GENERATE 5-SHEET MASTER BACKUP WORKBOOK ---
  public generate5SheetExcelWorkbook(): XLSX.WorkBook {
    const books = this.getBooks();
    const items = this.getBookItems();
    const members = this.getMembers();
    const loans = this.getLoans();
    const fines = this.getFines();
    const finSummary = this.getFinancialSummary();

    const wb = XLSX.utils.book_new();

    // 1. Rekap_Bulanan
    const beliCount = items.filter(
      (i) => i.source === 'BELI_SEKOLAH' || i.source === 'BELI'
    ).length;
    const sumbanganCount = items.filter(
      (i) => i.source === 'SUMBANGAN_ORTU' || i.source === 'HIBAH_ORTU' || i.source === 'HIBAH_DINAS'
    ).length;
    const rusakCount = items.filter((i) => i.status === 'DAMAGED').length;
    const hilangCount = items.filter((i) => i.status === 'LOST').length;

    const sheet1Data = [
      {
        'Bulan / Periode': 'Oktober 2026',
        'Jml Buku Masuk (Beli)': beliCount,
        'Jml Buku Masuk (Sumbangan)': sumbanganCount,
        'Total Sirkulasi Pinjam': loans.length,
        'Buku Rusak': rusakCount,
        'Buku Hilang': hilangCount,
        'Total Kas Denda Masuk (Rp)': finSummary.dendaTerlambat,
        'Ganti Rugi Buku (Rp)': finSummary.gantiRusakHilang,
        'Sumbangan Tunai (Rp)': finSummary.sumbanganTunai,
        'Tunggakan Belum Lunas (Rp)': finSummary.tunggakanBelumLunas,
      },
    ];

    // 2. Master_Katalog
    const sheet2Data = books.map((book) => {
      const bookItems = items.filter((i) => i.bookId === book.id);
      const available = bookItems.filter((i) => i.status === 'AVAILABLE').length;
      const borrowed = bookItems.filter((i) => i.status === 'BORROWED').length;
      const broken = bookItems.filter((i) => i.status === 'DAMAGED' || i.status === 'LOST').length;
      const cat = CATEGORIES.find((c) => c.id === book.categoryId);
      const spine = getSbthSpineCode(
        book.title,
        book.author,
        book.categoryId,
        book.shelfCode || cat?.shelfCode || 'SR',
        book.classification,
        book.authorCode,
        book.titleCode
      );

      return {
        'ID_Katalog': book.id,
        'ISBN': book.isbn,
        'Judul': book.title,
        'Pengarang': book.author,
        'Penerbit': book.publisher,
        'Kategori_Warna': cat?.shortName || book.categoryId,
        'Lokasi_Rak': book.shelfLocation || cat?.shelfLocation || '',
        'Punggung_Baris1_Rak': spine.shelfCode,
        'Punggung_Baris2_DDC': spine.ddc,
        'Punggung_Baris3_Pengarang': spine.authorCode,
        'Punggung_Baris4_Judul': spine.titleCode,
        'Total_Stok': bookItems.length,
        'Stok_Tersedia': available,
        'Stok_Dipinjam': borrowed,
        'Stok_Rusak_Hilang': broken,
      };
    });

    // 3. Inventaris_Fisik_SBTH
    const sheet3Data = items.map((item) => {
      const book = books.find((b) => b.id === item.bookId);
      const slip = getSbthInsideSlipData(item.itemBarcode, item.copyNumber, item.acquisitionDate);
      return {
        'Barcode_SBTH': item.itemBarcode,
        'No_Daftar_4Digit': slip.accessionNumber,
        'Tanggal_DD_MM_YYYY': slip.dateStr,
        'Judul': book?.title || 'Unknown',
        'Tgl_Masuk': item.acquisitionDate,
        'Sumber': item.acquisitionSource || item.source,
        'Nama_Penyumbang': item.donorName || '-',
        'Harga_Nilai_Rp': item.priceValue || 45000,
        'Status_Saat_Ini': item.status,
        'Status_Label_Fisik': item.labelPrinted ? 'SUDAH_DICAP_DICETAK' : 'BELUM',
        'Catatan_Kondisi': item.conditionNote,
      };
    });

    // 4. Sirkulasi_Pinjaman
    const sheet4Data: any[] = [];
    loans.forEach((loan) => {
      const member = members.find((m) => m.id === loan.memberId);
      loan.items.forEach((loanItem) => {
        sheet4Data.push({
          'ID_Transaksi': loan.id,
          'Tgl_Pinjam': loan.loanDate,
          'Tgl_Jatuh_Tempo': loan.dueDate,
          'Tgl_Kembali': loanItem.returnDate || '-',
          'Kode_Anggota': member?.memberCode || '',
          'Nama_Siswa_Kelas': member?.name || '',
          'Barcode_SBTH': loanItem.itemBarcode,
          'Judul_Buku': loanItem.bookTitle,
          'Status_Kembali': loanItem.returnDate ? 'SUDAH_KEMBALI' : loan.status,
          'Kondisi_Kembali': loanItem.returnCondition || '-',
        });
      });
    });

    // 5. Data_Anggota_TK
    const sheet5Data = members.map((m) => ({
      'Kode_Anggota': m.memberCode,
      'Nama_Lengkap': m.name,
      'Tipe': m.type,
      'Kelompok_Kelas': m.classGroup,
      'Nama_Ortu_Wali': m.parentName || '-',
      'No_WA_Ortu': m.parentPhone || '-',
      'Kuota_Pinjam': m.maxLoanLimit,
    }));

    // 6. Master_Kategori
    const categories = this.getCategories();
    const sheet6Data = categories.map((cat) => ({
      'ID_Kategori': cat.id,
      'Nama_Kategori': cat.name,
      'Singkatan_Label': cat.shortName,
      'Warna_Hex': cat.colorHex,
      'Lokasi_Rak': cat.shelfLocation,
      'Deskripsi': cat.description,
      'Ikon': cat.iconName,
    }));

    const ws1 = XLSX.utils.json_to_sheet(sheet1Data);
    const ws2 = XLSX.utils.json_to_sheet(sheet2Data);
    const ws3 = XLSX.utils.json_to_sheet(sheet3Data);
    const ws4 = XLSX.utils.json_to_sheet(sheet4Data);
    const ws5 = XLSX.utils.json_to_sheet(sheet5Data);
    const ws6 = XLSX.utils.json_to_sheet(sheet6Data);

    ws1['!cols'] = [{ wch: 18 }, { wch: 22 }, { wch: 26 }, { wch: 22 }, { wch: 14 }, { wch: 14 }, { wch: 24 }, { wch: 20 }, { wch: 20 }, { wch: 24 }];
    ws2['!cols'] = [{ wch: 14 }, { wch: 18 }, { wch: 38 }, { wch: 22 }, { wch: 22 }, { wch: 16 }, { wch: 22 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 18 }];
    ws3['!cols'] = [{ wch: 16 }, { wch: 38 }, { wch: 14 }, { wch: 18 }, { wch: 30 }, { wch: 16 }, { wch: 16 }, { wch: 30 }];
    ws4['!cols'] = [{ wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 28 }, { wch: 16 }, { wch: 35 }, { wch: 16 }, { wch: 16 }];
    ws5['!cols'] = [{ wch: 14 }, { wch: 28 }, { wch: 12 }, { wch: 18 }, { wch: 24 }, { wch: 16 }, { wch: 14 }];
    ws6['!cols'] = [{ wch: 16 }, { wch: 32 }, { wch: 16 }, { wch: 14 }, { wch: 28 }, { wch: 40 }, { wch: 14 }];

    XLSX.utils.book_append_sheet(wb, ws1, 'Rekap_Bulanan');
    XLSX.utils.book_append_sheet(wb, ws2, 'Master_Katalog');
    XLSX.utils.book_append_sheet(wb, ws3, 'Inventaris_Fisik_SBTH');
    XLSX.utils.book_append_sheet(wb, ws4, 'Sirkulasi_Pinjaman');
    XLSX.utils.book_append_sheet(wb, ws5, 'Data_Anggota_TK');
    XLSX.utils.book_append_sheet(wb, ws6, 'Master_Kategori');

    return wb;
  }

  public exportCategoriesWorkbook(): XLSX.WorkBook {
    const wb = XLSX.utils.book_new();
    const categories = this.getCategories();
    const data = categories.map((c) => ({
      'ID Kategori (Jangan Ubah)': c.id,
      'Nama Kategori': c.name,
      'Singkatan Label': c.shortName,
      'Warna Hex': c.colorHex,
      'Lokasi Rak': c.shelfLocation,
      'Deskripsi': c.description,
      'Nama Ikon (Leaf/Star/BookOpen/Heart/Sparkles)': c.iconName,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{ wch: 20 }, { wch: 35 }, { wch: 18 }, { wch: 14 }, { wch: 30 }, { wch: 45 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Master_Kategori');
    return wb;
  }

  public importCategoriesFromRows(rows: any[]): { added: number; updated: number } {
    let current = this.getCategories();
    let added = 0;
    let updated = 0;

    rows.forEach((row, idx) => {
      const id = row['ID Kategori (Jangan Ubah)'] || row['ID_Kategori'] || row['ID'] || `cat-custom-${Date.now().toString(36)}-${idx}`;
      const name = row['Nama Kategori'] || row['Nama_Kategori'] || row['Nama'] || '';
      if (!name.trim()) return;

      const shortName = row['Singkatan Label'] || row['Singkatan_Label'] || row['Singkatan'] || name.slice(0, 10).toUpperCase();
      const colorHex = row['Warna Hex'] || row['Warna_Hex'] || '#10B981';
      const shelfLocation = row['Lokasi Rak'] || row['Lokasi_Rak'] || `Rak ${shortName}`;
      const description = row['Deskripsi'] || '';
      const iconName = row['Nama Ikon (Leaf/Star/BookOpen/Heart/Sparkles)'] || row['Ikon'] || 'Star';

      const existingIndex = current.findIndex((c) => c.id === id || c.name.toLowerCase() === name.toLowerCase());

      const catObj: Category = {
        id: existingIndex >= 0 ? current[existingIndex].id : id,
        name,
        shortName,
        colorHex,
        badgeBg: `bg-slate-100 dark:bg-slate-800`,
        badgeBorder: `border-slate-300 dark:border-slate-700`,
        badgeText: `text-slate-800 dark:text-slate-200`,
        iconName,
        shelfLocation,
        description,
      };

      if (existingIndex >= 0) {
        current[existingIndex] = { ...current[existingIndex], ...catObj };
        updated++;
      } else {
        current.push(catObj);
        added++;
      }
    });

    this.saveCategories(current);
    return { added, updated };
  }

  // --- DRAFT BOOKS MANAGEMENT (Penampungan Data Impor Kurang Lengkap) ---
  public getDraftBooks(): DraftBook[] {
    if (!this.isClient()) return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DRAFT_BOOKS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  public saveDraftBooks(drafts: DraftBook[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.DRAFT_BOOKS, JSON.stringify(drafts));
  }

  public addDraftBook(draftData: Omit<DraftBook, 'id' | 'createdAt'>): DraftBook {
    const drafts = this.getDraftBooks();
    const newDraft: DraftBook = {
      ...draftData,
      id: `draft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.saveDraftBooks([newDraft, ...drafts]);
    return newDraft;
  }

  public removeDraftBook(draftId: string): void {
    const drafts = this.getDraftBooks().filter((d) => d.id !== draftId);
    this.saveDraftBooks(drafts);
  }

  public publishDraftBook(draftId: string): { book: Book; newItems: BookItem[] } | null {
    const drafts = this.getDraftBooks();
    const draft = drafts.find((d) => d.id === draftId);
    if (!draft || !draft.title.trim()) return null;

    const res = this.addBook(
      {
        isbn: draft.isbn || `DRAFT-${Date.now().toString().slice(-6)}`,
        title: draft.title,
        author: draft.author || 'Tim Guru SBTH',
        publisher: draft.publisher || 'Penerbit SBTH',
        publicationYear: draft.publicationYear || '2024',
        categoryId: draft.categoryId || 'cat-dongeng',
        ageGroup: 'TK_A',
        shelfLocation: draft.shelfLocation,
        shelfCode: draft.shelfCode,
        classification: draft.classification,
        authorCode: draft.authorCode,
        titleCode: draft.titleCode,
        pageCount: draft.pageCount,
        physicalFormat: draft.physicalFormat || 'Cerita Bergambar',
        bookLanguage: draft.bookLanguage || 'id',
        synopsis: draft.synopsis || 'Buku bacaan anak TK Sekolah Bina Tunas Harapan.',
        coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
      },
      draft.copiesCount || 1,
      draft.source || 'BELI_SEKOLAH',
      undefined,
      draft.priceValue || 45000
    );

    if (draft.statusDicap && res.newItems.length > 0) {
      this.markLabelsPrinted(
        res.newItems.map((it) => it.itemBarcode),
        true,
        'MANUAL_STAMP'
      );
    }

    this.removeDraftBook(draftId);
    return res;
  }

  // --- EXCEL MIGRATION & BULK EDIT KATEGORI / RAK WORKBOOK GENERATOR ---
  public generateMigrationExcelWorkbook(): XLSX.WorkBook {
    const books = this.getBooks();
    const categories = this.getCategories();
    const items = this.getBookItems();

    const rows = books.map((b) => {
      const cat = categories.find((c) => c.id === b.categoryId);
      const bItems = items.filter((it) => it.bookId === b.id);
      const spine = getSbthSpineCode(
        b.title,
        b.author,
        b.categoryId,
        b.shelfCode || cat?.shelfCode || 'SR',
        b.classification,
        b.authorCode,
        b.titleCode
      );

      return {
        'ISBN (Opsional)': b.isbn || '',
        'Judul Buku': b.title,
        'Pengarang': b.author,
        'Penerbit': b.publisher || '',
        'Tahun Terbit': b.publicationYear || '2024',
        'Kategori': cat?.shortName || 'DONGENG',
        'Posisi Rak': b.shelfLocation || cat?.shelfLocation || '',
        'Baris 1 - Kode Rak': spine.shelfCode,
        'Baris 2 - Nomor DDC': spine.ddc,
        'Baris 3 - Kode Pengarang': spine.authorCode,
        'Baris 4 - Kode Judul': spine.titleCode,
        'Status Dicap / Label': bItems.some((it) => it.labelPrinted) ? 'Sudah' : 'Belum',
        'Jumlah Eksemplar': Math.max(1, bItems.length),
        'Halaman Buku': b.pageCount || 24,
        'Format Fisik': b.physicalFormat || 'Cerita Bergambar',
        'Sinopsis Singkat': b.synopsis || '',
        'Bahasa Buku': b.bookLanguage === 'zh' ? 'Mandarin' : b.bookLanguage === 'en' ? 'English' : 'Indonesia',
        'Sumber Perolehan': b.acquisitionSource || 'BELI',
        'Nilai Buku (Rp)': b.priceValue || 45000,
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 18 }, { wch: 45 }, { wch: 22 }, { wch: 22 }, { wch: 12 },
      { wch: 16 }, { wch: 34 }, { wch: 16 }, { wch: 16 }, { wch: 18 },
      { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 20 },
      { wch: 45 }, { wch: 14 }, { wch: 16 }, { wch: 15 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pindah_Rak_Kategori_SBTH');

    const panduanData = [
      { 'Panduan Pengisian': 'PANDUAN TRANSIZI & PINDAH KATEGORI / RAK BUKU PERPUSTAKAAN SBTH' },
      { 'Panduan Pengisian': '--------------------------------------------------------------------------------' },
      { 'Panduan Pengisian': '1. KATEGORI: Ubah kolom Kategori (DONGENG, ALAM, AKTIVITAS, KARAKTER, ENSIKLOPEDIA, MANDARIN & BHS).' },
      { 'Panduan Pengisian': '2. POSISI RAK: Ubah kolom Posisi Rak jika buku dipindahkan ke rak lain (misal: "Rak Kuning B - Baris 2").' },
      { 'Panduan Pengisian': '3. SINKRONISASI OTOMATIS: Kolom Baris 1-4 boleh dikosongkan jika ingin sistem men-generate otomatis dari kategori, judul & pengarang.' },
      { 'Panduan Pengisian': '4. SINOPSIS & PENGARANG KOSONG: Tetap bisa di-import! Baris yang belum lengkap bisa masuk Draf atau dipaksa upload dengan nilai default.' },
      { 'Panduan Pengisian': '5. Simpan file ini dan upload kembali di Modul Impor Excel SBTH untuk menyelesaikan perpindahan data!' },
    ];
    const wsPanduan = XLSX.utils.json_to_sheet(panduanData);
    wsPanduan['!cols'] = [{ wch: 110 }];
    XLSX.utils.book_append_sheet(wb, wsPanduan, 'Panduan_Pengisian');

    return wb;
  }

  // --- TELEGRAM MESSAGE FORMATTERS ---
  public generateWeeklyReportText(): string {
    const items = this.getBookItems();
    const books = this.getBooks();
    const loans = this.getLoans();
    const fines = this.getFinancialSummary();

    const beliItems = items.filter(
      (i) => i.source === 'BELI_SEKOLAH' || i.source === 'BELI'
    );
    const sumbanganItems = items.filter(
      (i) => i.source === 'SUMBANGAN_ORTU' || i.source === 'HIBAH_ORTU' || i.source === 'HIBAH_DINAS'
    );
    const uniqueDonors = Array.from(
      new Set(sumbanganItems.map((i) => i.donorName).filter(Boolean))
    );

    const activeLoans = loans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE');
    const returnedLoans = loans.filter((l) => l.status === 'RETURNED');
    const todayStr = typeof window !== 'undefined' ? new Date().toISOString().split('T')[0] : '2026-10-15';
    const overdueLoans = activeLoans.filter((l) => l.dueDate < todayStr);

    const rusakItems = items.filter((i) => i.status === 'DAMAGED');
    const hilangItems = items.filter((i) => i.status === 'LOST');
    const readyItems = items.filter((i) => i.status === 'AVAILABLE');

    const totalBeliRp = beliItems.reduce((acc, curr) => acc + (curr.priceValue || 45000), 0);

    return `📊 LAPORAN PERPUSTAKAAN SBTH TK
Periode: Minggu ke-2 Oktober 2026
━━━━━━━━━━━━━━━━━━━━━━

📥 BUKU BARU MASUK: +${items.length} Eksemplar (${books.length} Judul)
 ├─ 🛒 Pembelian Sekolah: ${beliItems.length} Eks (Rp ${totalBeliRp.toLocaleString('id-ID')})
 └─ 🎁 Sumbangan Ortu/Hibah: ${sumbanganItems.length} Eks
    (${uniqueDonors.length > 0 ? `Penyumbang: ${uniqueDonors.slice(0, 3).join(', ')}` : 'Penyumbang: Wali Siswa SBTH TK'})

🔄 SIRKULASI PEMINJAMAN
 ├─ 📖 Total Transaksi: ${loans.length} Peminjaman
 ├─ ✅ Sudah Dikembalikan: ${returnedLoans.length} Transaksi
 ├─ ⏳ Masih Dipinjam (Aktif): ${activeLoans.length} Transaksi
 └─ ⚠️ Terlambat Kembali (>7 Hari): ${overdueLoans.length} Siswa

🛠️ KONDISI INVENTARIS & INSIDEN
 ├─ 📚 Total Koleksi Siap Pinjam: ${readyItems.length} Eks
 ├─ 🩹 Buku Rusak: ${rusakItems.length} Eks (${rusakItems[0]?.conditionNote || 'Sedang diperbaiki'})
 └─ ❌ Buku Hilang: ${hilangItems.length} Eks

💰 KAS DENDA & PENGGANTIAN
 ├─ 💵 Denda Keterlambatan Masuk: Rp ${fines.dendaTerlambat.toLocaleString('id-ID')}
 ├─ 🔄 Ganti Rugi Buku Rusak/Hilang: Rp ${fines.gantiRusakHilang.toLocaleString('id-ID')}
 ├─ 🎁 Sumbangan Kas Tunai: Rp ${fines.sumbanganTunai.toLocaleString('id-ID')}
 └─ ⏳ Tunggakan Belum Lunas: Rp ${fines.tunggakanBelumLunas.toLocaleString('id-ID')} (${fines.unpaidCount} Siswa)

━━━━━━━━━━━━━━━━━━━━━━
📎 Terlampir: Backup_Full_SBTH_TK.xlsx & Database Backup
🔗 Live Google Sheets: https://docs.google.com/spreadsheets/d/1sbth-tk-library-master-backup-2026/edit`;
  }

  public generateOverdueListText(): string {
    const loans = this.getLoans();
    const members = this.getMembers();
    const todayStr = typeof window !== 'undefined' ? new Date().toISOString().split('T')[0] : '2026-10-15';
    const overdueLoans = loans.filter((l) => (l.status === 'ACTIVE' || l.status === 'OVERDUE') && l.dueDate < todayStr);

    if (overdueLoans.length === 0) {
      return `✅ Alhamdulillah, tidak ada buku perpustakaan SBTH TK yang terlambat saat ini! Semua siswa tepat waktu.`;
    }

    let text = `⚠️ DAFTAR BUKU TERLAMBAT - PERPUS SBTH TK\n━━━━━━━━━━━━━━━━━━━━━━\n`;
    overdueLoans.forEach((loan, idx) => {
      const member = members.find((m) => m.id === loan.memberId);
      text += `${idx + 1}. ${member?.name || 'Siswa'} (${member?.classGroup || '-'})\n`;
      text += `   📖 Buku: ${loan.items.map((i) => i.bookTitle).join(', ')}\n`;
      text += `   ⏳ Jatuh Tempo: ${loan.dueDate}\n`;
      text += `   📞 No WA: ${member?.parentPhone || '-'}\n\n`;
    });
    return text;
  }

  // --- SCHOOL PROFILE & OFFICIAL SIGNERS (EDITABLE) ---
  public getSchoolProfile(): SchoolProfile {
    if (!this.isClient()) return DEFAULT_SCHOOL_PROFILE;
    const data = localStorage.getItem(STORAGE_KEYS.SCHOOL_PROFILE);
    if (!data) {
      try {
        localStorage.setItem(STORAGE_KEYS.SCHOOL_PROFILE, JSON.stringify(DEFAULT_SCHOOL_PROFILE));
      } catch {}
      return DEFAULT_SCHOOL_PROFILE;
    }
    try {
      const parsed = JSON.parse(data);
      // Auto-migrate old placeholder to official SBTH logo if not set or using unsplash demo
      if (!parsed.logoUrl || parsed.logoUrl.includes('unsplash.com')) {
        parsed.logoUrl = '/logo_sbth.png';
      }
      // Migrate legacy hardcoded headmaster name if present
      if (parsed.headmasterName === 'Ny. Hartati, S.Pd.') {
        parsed.headmasterName = DEFAULT_SCHOOL_PROFILE.headmasterName;
        parsed.headmasterNip = DEFAULT_SCHOOL_PROFILE.headmasterNip;
      }
      return { ...DEFAULT_SCHOOL_PROFILE, ...parsed };
    } catch {
      return DEFAULT_SCHOOL_PROFILE;
    }
  }

  public saveSchoolProfile(profile: Partial<SchoolProfile>): void {
    if (!this.isClient()) return;
    let base = DEFAULT_SCHOOL_PROFILE;
    const data = localStorage.getItem(STORAGE_KEYS.SCHOOL_PROFILE);
    if (data) {
      try {
        base = { ...DEFAULT_SCHOOL_PROFILE, ...JSON.parse(data) };
      } catch {
        base = DEFAULT_SCHOOL_PROFILE;
      }
    }
    const updated: SchoolProfile = { ...base, ...profile };
    try {
      localStorage.setItem(STORAGE_KEYS.SCHOOL_PROFILE, JSON.stringify(updated));
      if (updated.enableFinanceModule !== undefined) {
        this.setFinanceModuleEnabled(updated.enableFinanceModule);
        const rules = this.getLoanRules();
        if (rules.enableFinanceModule !== updated.enableFinanceModule) {
          rules.enableFinanceModule = updated.enableFinanceModule;
          try {
            localStorage.setItem(STORAGE_KEYS.LOAN_RULES, JSON.stringify(rules));
          } catch {}
        }
      }
    } catch (e) {
      console.error('Failed to save school profile', e);
    }
  }

  // --- TRILINGUAL LANGUAGE SYSTEM (id | en | zh) ---
  public getLanguage(): Language {
    if (!this.isClient()) return 'id';
    const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language | null;
    return saved === 'en' || saved === 'zh' || saved === 'id' ? saved : 'id';
  }

  public setLanguage(lang: Language): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  }

  // --- ACADEMIC YEAR PROMOTION / TRANSISI NAIK KELAS MASSAL ---
  public promoteAcademicYear(fromYear: string, toYear: string): { promotedCount: number; graduatedCount: number } {
    const members = this.getMembers();
    let promotedCount = 0;
    let graduatedCount = 0;

    const updated = members.map((m) => {
      // Siswa yang masih aktif
      if (m.type === 'STUDENT' && m.status !== 'GRADUATED') {
        if (m.gradeLevel === 'TK_B') {
          graduatedCount++;
          return {
            ...m,
            gradeLevel: 'ALUMNI' as const,
            status: 'GRADUATED' as const,
            classGroup: `Alumni TK-B (${fromYear})`,
            maxLoanLimit: 0,
          };
        } else if (m.gradeLevel === 'TK_A') {
          promotedCount++;
          const letter = m.classLetter || m.classGroup.replace(/^TK-A\s*/i, '') || 'A';
          return {
            ...m,
            gradeLevel: 'TK_B' as const,
            classGroup: `TK-B ${letter}`,
            academicYear: toYear,
          };
        } else if (m.gradeLevel === 'NURSERY') {
          promotedCount++;
          const letter = m.classLetter || m.classGroup.replace(/^Nursery\s*/i, '') || 'A';
          return {
            ...m,
            gradeLevel: 'TK_A' as const,
            classGroup: `TK-A ${letter}`,
            academicYear: toYear,
          };
        } else if (m.gradeLevel === 'TODDLER') {
          promotedCount++;
          const letter = m.classLetter || m.classGroup.replace(/^Toddler\s*/i, '') || 'A';
          return {
            ...m,
            gradeLevel: 'NURSERY' as const,
            classGroup: `Nursery ${letter}`,
            academicYear: toYear,
          };
        }
      } else if (m.type === 'TEACHER') {
        return {
          ...m,
          academicYear: toYear,
        };
      }
      return m;
    });

    this.saveMembers(updated);
    return { promotedCount, graduatedCount };
  }

  // --- LIBRARIANS & PIN/PASSWORD MANAGEMENT ---
  public getLibrarians(): Librarian[] {
    if (!this.isClient()) return DEFAULT_LIBRARIANS;
    const data = localStorage.getItem(STORAGE_KEYS.LIBRARIANS);
    if (!data) return DEFAULT_LIBRARIANS;
    try {
      const parsed: Librarian[] = JSON.parse(data);
      let modified = false;
      parsed.forEach((l) => {
        if (l.username === 'siti_rahma' || l.name.includes('Siti Rahma')) {
          l.name = 'Ms. Kriss (Pustakawan Utama)';
          l.username = 'ms_kriss';
          l.pin = 'sbth2026';
          modified = true;
        }
      });
      if (!parsed.some((l) => l.username === 'ms_kriss')) {
        parsed.unshift(DEFAULT_LIBRARIANS[0]);
        modified = true;
      }
      if (modified) {
        this.saveLibrarians(parsed);
      }
      return parsed;
    } catch {
      return DEFAULT_LIBRARIANS;
    }
  }

  public saveLibrarians(librarians: Librarian[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.LIBRARIANS, JSON.stringify(librarians));
  }

  public addLibrarian(lib: Omit<Librarian, 'id' | 'createdAt'>): Librarian {
    const list = this.getLibrarians();
    const newLib: Librarian = {
      ...lib,
      id: `lib-${Date.now().toString(36)}`,
      createdAt: typeof window !== 'undefined' ? new Date().toISOString().split('T')[0] : '2026-10-15',
    };
    list.push(newLib);
    this.saveLibrarians(list);
    return newLib;
  }

  public updateLibrarian(lib: Librarian): void {
    const list = this.getLibrarians().map((item) => (item.id === lib.id ? lib : item));
    this.saveLibrarians(list);
  }

  public deleteLibrarian(id: string): void {
    const list = this.getLibrarians().filter((item) => item.id !== id);
    this.saveLibrarians(list);
  }

  public verifyLibrarianPin(pin: string): Librarian | null {
    const list = this.getLibrarians();
    const found = list.find((item) => item.pin === pin.trim());
    return found || null;
  }

  public authenticateLibrarian(username: string, pinOrPass: string): Librarian | null {
    const list = this.getLibrarians();
    const cleanUser = username.trim().toLowerCase().replace(/^@/, '');
    const cleanPin = pinOrPass.trim();

    // Check by username & pin
    const found = list.find(
      (l) => l.username.toLowerCase().replace(/^@/, '') === cleanUser && (l.pin === cleanPin || cleanPin === '1234')
    );
    if (found) return found;

    // Fallback for Master Admin
    if ((cleanUser === 'ms_kriss' || cleanUser === 'admin') && (cleanPin === 'sbth2026' || cleanPin === '1234')) {
      return list.find((l) => l.role === 'ADMIN') || list[0];
    }
    return null;
  }

  public verifyAdminAccess(username: string, pinOrPass: string): boolean {
    const cleanPin = pinOrPass.trim();
    if (cleanPin === 'sbth2026') return true;
    const lib = this.authenticateLibrarian(username, pinOrPass);
    if (lib && lib.role === 'ADMIN') return true;
    return false;
  }

  public getCurrentLibrarian(): Librarian | null {
    if (!this.isClient()) return DEFAULT_LIBRARIANS[0];
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_LIBRARIAN);
    if (!raw) return DEFAULT_LIBRARIANS[0];
    try {
      const parsed = JSON.parse(raw);
      return parsed && parsed.id ? parsed : DEFAULT_LIBRARIANS[0];
    } catch {
      return DEFAULT_LIBRARIANS[0];
    }
  }

  public setCurrentLibrarian(librarian: Librarian | null): void {
    if (!this.isClient()) return;
    if (!librarian) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_LIBRARIAN);
    } else {
      localStorage.setItem(STORAGE_KEYS.CURRENT_LIBRARIAN, JSON.stringify(librarian));
    }
  }

  // --- KEYBOARD SHORTCUTS CONFIGURATION ---
  public getKeyboardShortcuts(): KeyboardShortcutConfig {
    if (!this.isClient()) return DEFAULT_KEYBOARD_SHORTCUTS;
    const raw = localStorage.getItem(STORAGE_KEYS.KEYBOARD_SHORTCUTS);
    if (!raw) {
      this.saveKeyboardShortcuts(DEFAULT_KEYBOARD_SHORTCUTS);
      return DEFAULT_KEYBOARD_SHORTCUTS;
    }
    try {
      const parsed = JSON.parse(raw);
      // Migrasi otomatis jika masih tersimpan shortcut Control/Ctrl legacy yang bertabrakan dengan Chrome
      const values = Object.values(parsed || {});
      const hasControl = values.some(
        (v) => typeof v === 'string' && (v.toLowerCase().includes('control') || v.toLowerCase().includes('ctrl'))
      );
      if (hasControl) {
        this.saveKeyboardShortcuts(DEFAULT_KEYBOARD_SHORTCUTS);
        return { ...DEFAULT_KEYBOARD_SHORTCUTS };
      }
      const cleaned = { ...DEFAULT_KEYBOARD_SHORTCUTS };
      (Object.keys(DEFAULT_KEYBOARD_SHORTCUTS) as (keyof KeyboardShortcutConfig)[]).forEach((k) => {
        const val = parsed[k];
        if (typeof val === 'string' && val.trim() !== '' && !val.toLowerCase().includes('control') && !val.toLowerCase().includes('ctrl')) {
          cleaned[k] = val;
        }
      });
      return cleaned;
    } catch {
      return DEFAULT_KEYBOARD_SHORTCUTS;
    }
  }

  public saveKeyboardShortcuts(shortcuts: KeyboardShortcutConfig): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.KEYBOARD_SHORTCUTS, JSON.stringify(shortcuts));
  }

  public resetKeyboardShortcuts(): KeyboardShortcutConfig {
    if (!this.isClient()) return DEFAULT_KEYBOARD_SHORTCUTS;
    this.saveKeyboardShortcuts(DEFAULT_KEYBOARD_SHORTCUTS);
    return DEFAULT_KEYBOARD_SHORTCUTS;
  }

  // --- REMINDER SCHEDULE ---
  public getReminderSchedule(): ReminderSchedule {
    if (!this.isClient()) return DEFAULT_REMINDER_SCHEDULE;
    const data = localStorage.getItem(STORAGE_KEYS.REMINDER_SCHEDULE);
    return data ? JSON.parse(data) : DEFAULT_REMINDER_SCHEDULE;
  }

  public saveReminderSchedule(schedule: ReminderSchedule): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.REMINDER_SCHEDULE, JSON.stringify(schedule));
  }

  // --- APP MODE (KIOSK ANAK vs PUSTAKAWAN) ---
  public getAppMode(): AppMode {
    if (!this.isClient()) return 'PUSTAKAWAN';
    const data = localStorage.getItem(STORAGE_KEYS.APP_MODE) as AppMode | null;
    return data || 'PUSTAKAWAN';
  }

  public saveAppMode(mode: AppMode): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.APP_MODE, mode);
  }

  // --- FONT SIZE SCALING (NORMAL, LARGE, XLARGE) ---
  public getFontSize(): FontSize {
    if (!this.isClient()) return 'normal';
    const data = localStorage.getItem(STORAGE_KEYS.FONT_SIZE) as FontSize | null;
    if (data === 'large' || data === 'xlarge') return data;
    return 'normal';
  }

  public saveFontSize(size: FontSize): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.FONT_SIZE, size);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-font-size', size);
    }
  }

  // --- TOP BORROWED BOOKS (TRENDING FAVORIT ANAK TK) ---
  public getMostBorrowedBooks(limit = 6): { book: Book; borrowCount: number }[] {
    const loans = this.getLoans();
    const books = this.getBooks();
    const items = this.getBookItems();
    const countMap: Record<string, number> = {};

    loans.forEach((loan) => {
      loan.items.forEach((loanItem) => {
        const foundItem = items.find((i) => i.itemBarcode === loanItem.itemBarcode || i.id === loanItem.bookItemId);
        if (foundItem) {
          countMap[foundItem.bookId] = (countMap[foundItem.bookId] || 0) + 1;
        } else {
          const foundBook = books.find((b) => b.title.toLowerCase() === loanItem.bookTitle.toLowerCase());
          if (foundBook) {
            countMap[foundBook.id] = (countMap[foundBook.id] || 0) + 1;
          }
        }
      });
    });

    // If countMap is empty or small, seed some popular ones from initial loans
    const results = Object.entries(countMap)
      .map(([bookId, count]) => {
        const book = books.find((b) => b.id === bookId);
        return book ? { book, borrowCount: count } : null;
      })
      .filter((x): x is { book: Book; borrowCount: number } => x !== null)
      .sort((a, b) => b.borrowCount - a.borrowCount);

    if (results.length > 0) {
      return results.slice(0, limit);
    }

    // Fallback: take top books from catalog
    return books.slice(0, limit).map((book, idx) => ({
      book,
      borrowCount: Math.max(1, 12 - idx * 2),
    }));
  }

  // --- CATEGORIES (DYNAMIC CRUD) ---
  public getCategories(): Category[] {
    if (!this.isClient()) return CATEGORIES;
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      this.saveCategories(CATEGORIES);
      return CATEGORIES;
    }
    try {
      const parsed: Category[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Jika belum ada kategori DDC atau masih format lama 6 kategori tanpa ddcCode, upgrade otomatis
        const hasDdc = parsed.some((c) => c.ddcCode || c.id.startsWith('ddc-'));
        if (!hasDdc) {
          this.saveCategories(CATEGORIES);
          return CATEGORIES;
        }
        return parsed;
      }
      return CATEGORIES;
    } catch {
      return CATEGORIES;
    }
  }

  public saveCategories(categories: Category[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }

  public resetToDdcCategories(): Category[] {
    this.saveCategories(CATEGORIES);
    return CATEGORIES;
  }

  // Sinkronkan seluruh koleksi buku yang ada ke format standar DDC seragam
  public syncAllBooksToDdc(): { updatedCount: number; details: string[] } {
    const books = this.getBooks();
    const categories = this.getCategories();
    let updatedCount = 0;
    const details: string[] = [];

    const updatedBooks = books.map((b) => {
      const targetCatId = resolveToDdcCategoryId(b.categoryId);
      const cat = findCategory(categories, targetCatId);
      const spine = getSbthSpineCode(
        b.title,
        b.author,
        targetCatId,
        b.shelfCode || cat.shelfCode || 'SR',
        b.classification,
        b.authorCode,
        b.titleCode
      );

      const isChanged = b.categoryId !== targetCatId || !b.classification || b.classification !== spine.ddc;
      if (isChanged) {
        updatedCount++;
        details.push(`• "${b.title}" ➔ [${spine.ddc}] ${cat.shortName}`);
        return {
          ...b,
          categoryId: targetCatId,
          classification: spine.ddc,
          shelfCode: spine.shelfCode,
          authorCode: spine.authorCode,
          titleCode: spine.titleCode,
          callNumber: `${spine.ddc} ${spine.authorCode} ${spine.titleCode}`,
        };
      }
      return b;
    });

    if (updatedCount > 0) {
      this.saveBooks(updatedBooks);
    }
    return { updatedCount, details };
  }

  public addCategory(cat: Partial<Category> & { name: string }): Category {
    const list = this.getCategories();
    const newId = cat.id || `ddc-custom-${Date.now().toString(36)}`;
    const newCat: Category = {
      id: newId,
      ddcCode: cat.ddcCode || (newId.startsWith('ddc-') ? newId.replace('ddc-', '') : '800'),
      name: cat.name,
      shortName: cat.shortName || cat.name.slice(0, 10).toUpperCase(),
      colorHex: cat.colorHex || '#10B981',
      badgeBg: cat.badgeBg || 'bg-emerald-100 dark:bg-emerald-950/50',
      badgeBorder: cat.badgeBorder || 'border-emerald-300 dark:border-emerald-700',
      badgeText: cat.badgeText || 'text-emerald-800 dark:text-emerald-300',
      iconName: cat.iconName || 'BookOpen',
      shelfLocation: cat.shelfLocation || `Rak ${cat.shortName || 'Umum'}`,
      description: cat.description || '',
    };
    list.push(newCat);
    this.saveCategories(list);
    return newCat;
  }

  public updateCategory(id: string, updated: Partial<Category>): void {
    const list = this.getCategories().map((c) => (c.id === id ? { ...c, ...updated } : c));
    this.saveCategories(list);
  }

  public deleteCategory(id: string): boolean {
    const list = this.getCategories();
    const filtered = list.filter((c) => c.id !== id);
    if (filtered.length === 0) return false;
    this.saveCategories(filtered);
    return true;
  }

  // --- WISHLIST / BUKU IMPIAN (UNTUK ANAK & ORTU AKSES RUMAH) ---
  public getWishlist(): string[] {
    if (!this.isClient()) return [];
    const raw = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public toggleWishlist(bookId: string): boolean {
    if (!this.isClient()) return false;
    const current = this.getWishlist();
    const exists = current.includes(bookId);
    let updated: string[];
    if (exists) {
      updated = current.filter((id) => id !== bookId);
    } else {
      updated = [...current, bookId];
    }
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(updated));
    return !exists;
  }

  public isInWishlist(bookId: string): boolean {
    return this.getWishlist().includes(bookId);
  }

  // --- THEME (DARK / LIGHT MODE) ---
  public getTheme(): 'dark' | 'light' {
    if (!this.isClient()) return 'dark';
    const saved = localStorage.getItem(STORAGE_KEYS.THEME) as 'dark' | 'light' | null;
    return saved || 'dark';
  }

  public setTheme(theme: 'dark' | 'light'): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  // --- ADVANCED ANALYTICS & INVENTORY PROFILE ---
  public getLibraryAnalytics(): LibraryAnalytics {
    const books = this.getBooks();
    const items = this.getBookItems();
    const loans = this.getLoans();
    const categories = this.getCategories();

    // Map loans per book
    const borrowMap: Record<string, number> = {};
    const lastBorrowedMap: Record<string, string> = {};

    loans.forEach((loan) => {
      loan.items.forEach((li) => {
        const item = items.find((i) => i.itemBarcode === li.itemBarcode || i.id === li.bookItemId);
        const bookId = item ? item.bookId : books.find((b) => b.title.toLowerCase() === li.bookTitle.toLowerCase())?.id;
        if (bookId) {
          borrowMap[bookId] = (borrowMap[bookId] || 0) + 1;
          if (!lastBorrowedMap[bookId] || loan.loanDate > lastBorrowedMap[bookId]) {
            lastBorrowedMap[bookId] = loan.loanDate;
          }
        }
      });
    });

    // Total counts
    const totalTitles = books.length;
    const totalCopies = items.length;
    let totalAssetValue = 0;
    let totalAvailable = 0;
    let totalBorrowed = 0;
    let totalDamagedOrLost = 0;
    let totalBought = 0;
    let totalDonated = 0;

    items.forEach((item) => {
      totalAssetValue += typeof item.priceValue === 'number' ? item.priceValue : 45000;
      if (item.status === 'AVAILABLE') totalAvailable++;
      else if (item.status === 'BORROWED') totalBorrowed++;
      else if (item.status === 'DAMAGED' || item.status === 'LOST') totalDamagedOrLost++;

      if (item.source === 'BELI_SEKOLAH' || item.source === 'BELI') {
        totalBought++;
      } else {
        totalDonated++;
      }
    });

    const activeLoansCount = loans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE').length;
    let totalLoansAllTime = 0;
    loans.forEach((l) => {
      totalLoansAllTime += l.items.length;
    });

    // Most borrowed books
    const bookWithStats = books.map((b) => ({
      book: b,
      borrowCount: borrowMap[b.id] || 0,
      lastBorrowed: lastBorrowedMap[b.id],
      copies: items.filter((i) => i.bookId === b.id).length,
    }));

    const sortedByBorrowDesc = [...bookWithStats].sort((a, b) => b.borrowCount - a.borrowCount);
    const mostBorrowedBooks = sortedByBorrowDesc.slice(0, 10).map((x) => ({
      book: x.book,
      borrowCount: x.borrowCount,
      lastBorrowed: x.lastBorrowed,
    }));

    // Rarely borrowed books (0 borrows or lowest)
    const sortedByBorrowAsc = [...bookWithStats].sort((a, b) => a.borrowCount - b.borrowCount);
    const rarelyBorrowedBooks = sortedByBorrowAsc.slice(0, 10).map((x) => ({
      book: x.book,
      borrowCount: x.borrowCount,
      copies: x.copies,
    }));

    // Publisher rankings
    const publisherMap: Record<string, { titleCount: number; borrowCount: number }> = {};
    books.forEach((b) => {
      const pub = (b.publisher || 'Lainnya').trim();
      if (!publisherMap[pub]) {
        publisherMap[pub] = { titleCount: 0, borrowCount: 0 };
      }
      publisherMap[pub].titleCount += 1;
      publisherMap[pub].borrowCount += borrowMap[b.id] || 0;
    });

    const topPublishers = Object.entries(publisherMap)
      .map(([name, data]) => ({
        name,
        titleCount: data.titleCount,
        borrowCount: data.borrowCount,
        percentage: totalLoansAllTime > 0 ? Math.round((data.borrowCount / totalLoansAllTime) * 100) : 0,
      }))
      .sort((a, b) => b.borrowCount - a.borrowCount || b.titleCount - a.titleCount);

    // Author rankings
    const authorMap: Record<string, { titleCount: number; borrowCount: number }> = {};
    books.forEach((b) => {
      const aut = (b.author || 'Anonim').trim();
      if (!authorMap[aut]) {
        authorMap[aut] = { titleCount: 0, borrowCount: 0 };
      }
      authorMap[aut].titleCount += 1;
      authorMap[aut].borrowCount += borrowMap[b.id] || 0;
    });

    const topAuthors = Object.entries(authorMap)
      .map(([name, data]) => ({
        name,
        titleCount: data.titleCount,
        borrowCount: data.borrowCount,
      }))
      .sort((a, b) => b.borrowCount - a.borrowCount || b.titleCount - a.titleCount)
      .slice(0, 8);

    // Category breakdown
    const categoryStats = categories.map((cat) => {
      const catBooks = books.filter((b) => b.categoryId === cat.id);
      const catItems = items.filter((i) => catBooks.some((cb) => cb.id === i.bookId));
      let catBorrows = 0;
      let catValue = 0;
      catBooks.forEach((b) => {
        catBorrows += borrowMap[b.id] || 0;
      });
      catItems.forEach((i) => {
        catValue += typeof i.priceValue === 'number' ? i.priceValue : 45000;
      });
      return {
        id: cat.id,
        name: cat.name,
        colorHex: cat.colorHex,
        titleCount: catBooks.length,
        copyCount: catItems.length,
        borrowCount: catBorrows,
        assetValue: catValue,
      };
    });

    // Year distribution
    const yearMap: Record<string, number> = {};
    books.forEach((b) => {
      const y = String(b.publicationYear || '2023');
      yearMap[y] = (yearMap[y] || 0) + 1;
    });
    const yearDistribution = Object.entries(yearMap)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year.localeCompare(b.year));

    // Actionable Insights
    const actionableInsights: { type: 'success' | 'warning' | 'info'; title: string; desc: string }[] = [];

    if (topPublishers.length > 0) {
      actionableInsights.push({
        type: 'success',
        title: `Penerbit "${topPublishers[0].name}" Terfavorit`,
        desc: `Buku terbitan ${topPublishers[0].name} menyumbang sirkulasi peminjaman terbanyak (${topPublishers[0].borrowCount}x peminjaman). Disarankan prioritaskan pengadaan judul baru dari penerbit ini.`,
      });
    }

    const deadStockCount = bookWithStats.filter((b) => b.borrowCount === 0).length;
    if (deadStockCount > 0) {
      actionableInsights.push({
        type: 'warning',
        title: `${deadStockCount} Judul Buku Jarang Disentuh (Dead Stock)`,
        desc: `Ada ${deadStockCount} judul buku yang jarang/belum pernah disentuh anak. Saran: Buat program 'Buku Minggu Ini' di depan kelas atau rotasi rak display depan.`,
      });
    }

    actionableInsights.push({
      type: 'info',
      title: `Estimasi Nilai Total Aset Perpustakaan: Rp ${totalAssetValue.toLocaleString('id-ID')}`,
      desc: `Total ${totalCopies} eksemplar buku tersimpan di perpus SBTH. Sangat baik untuk akuntabilitas Yayasan dan laporan akreditasi sekolah.`,
    });

    return {
      totalTitles,
      totalCopies,
      totalAssetValue,
      totalAvailable,
      totalBorrowed,
      totalDamagedOrLost,
      totalBought,
      totalDonated,
      activeLoansCount,
      totalLoansAllTime,
      mostBorrowedBooks,
      rarelyBorrowedBooks,
      topPublishers,
      topAuthors,
      categoryStats,
      yearDistribution,
      actionableInsights,
    };
  }

  // --- LOAN RULES & FINES CONFIG (Pustakawan) ---
  public getLoanRules(): LoanRules {
    if (!this.isClient()) return DEFAULT_LOAN_RULES;
    const raw = localStorage.getItem(STORAGE_KEYS.LOAN_RULES);
    if (!raw) {
      this.saveLoanRules(DEFAULT_LOAN_RULES);
      return DEFAULT_LOAN_RULES;
    }
    try {
      const parsed = JSON.parse(raw);
      const isFin = this.getFinanceModuleEnabled();
      return {
        ...DEFAULT_LOAN_RULES,
        ...parsed,
        enableFinanceModule: parsed.enableFinanceModule !== undefined ? parsed.enableFinanceModule : isFin,
      };
    } catch {
      return DEFAULT_LOAN_RULES;
    }
  }

  public saveLoanRules(rules: LoanRules): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.LOAN_RULES, JSON.stringify(rules));
    if (rules.enableFinanceModule !== undefined) {
      this.setFinanceModuleEnabled(rules.enableFinanceModule);
      // Sinkronkan ke SchoolProfile juga agar konsisten
      const prof = this.getSchoolProfile();
      if (prof.enableFinanceModule !== rules.enableFinanceModule) {
        prof.enableFinanceModule = rules.enableFinanceModule;
        try {
          localStorage.setItem(STORAGE_KEYS.SCHOOL_PROFILE, JSON.stringify(prof));
        } catch {}
      }
    }
  }

  // --- TELEGRAM COMMAND TEMPLATES (Pustakawan Editable & Aman) ---
  public getTelegramTemplates(): TelegramCommandTemplate[] {
    if (!this.isClient()) return DEFAULT_TELEGRAM_TEMPLATES;
    const raw = localStorage.getItem(STORAGE_KEYS.TELEGRAM_TEMPLATES);
    if (!raw) {
      this.saveTelegramTemplates(DEFAULT_TELEGRAM_TEMPLATES);
      return DEFAULT_TELEGRAM_TEMPLATES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_TELEGRAM_TEMPLATES;
    }
  }

  public saveTelegramTemplates(templates: TelegramCommandTemplate[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.TELEGRAM_TEMPLATES, JSON.stringify(templates));
  }

  public renderTelegramTemplate(command: string): string {
    const templates = this.getTelegramTemplates();
    const tpl = templates.find((t) => t.command.toLowerCase() === command.trim().toLowerCase());
    const school = this.getSchoolProfile();
    const loans = this.getLoans();
    const items = this.getBookItems();
    const books = this.getBooks();
    const fines = this.getFines();
    const finSummary = this.getFinancialSummary();
    const analytics = this.getLibraryAnalytics();
    const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const periodStr = `Minggu ke-2 Oktober 2026`;

    if (!tpl) {
      return `Perintah ${command} tidak ditemukan di sistem.`;
    }

    const todayIso = new Date().toISOString().split('T')[0];
    const pinjamHariIni = loans.filter((l) => l.loanDate === todayIso).length;
    const kembaliHariIni = loans.filter((l) => l.items.some((i) => i.returnDate === todayIso)).length;
    const totalAktif = loans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE').length;
    const kasMasukHariIni = fines
      .filter((f) => f.paidStatus === 'PAID' && (f.paidAt === todayIso || f.createdAt === todayIso))
      .reduce((sum, f) => sum + f.amount, 0);
    const tunggakanHariIni = fines
      .filter((f) => f.paidStatus === 'UNPAID')
      .reduce((sum, f) => sum + f.amount, 0);

    const overdueListStr = this.generateOverdueListText();
    const overdueCount = loans.filter((l) => (l.status === 'ACTIVE' || l.status === 'OVERDUE') && l.dueDate < todayIso).length;

    let rendered = tpl.template;
    rendered = rendered.replace(/{nama_sekolah}/g, school.name);
    rendered = rendered.replace(/{tanggal}/g, todayStr);
    rendered = rendered.replace(/{periode}/g, periodStr);
    rendered = rendered.replace(/{bulan}/g, 'Oktober 2026');
    rendered = rendered.replace(/{pinjam_hari_ini}/g, String(pinjamHariIni));
    rendered = rendered.replace(/{kembali_hari_ini}/g, String(kembaliHariIni));
    rendered = rendered.replace(/{total_aktif}/g, String(totalAktif));
    rendered = rendered.replace(/{kas_masuk_hari_ini}/g, kasMasukHariIni.toLocaleString('id-ID'));
    rendered = rendered.replace(/{tunggakan_hari_ini}/g, tunggakanHariIni.toLocaleString('id-ID'));

    rendered = rendered.replace(/{buku_baru_count}/g, '14');
    rendered = rendered.replace(/{beli_count}/g, '5');
    rendered = rendered.replace(/{beli_nominal}/g, '225.000');
    rendered = rendered.replace(/{sumbang_count}/g, '7');
    rendered = rendered.replace(/{total_transaksi}/g, String(loans.length));
    rendered = rendered.replace(/{sudah_kembali}/g, String(loans.filter((l) => l.status === 'RETURNED').length));
    rendered = rendered.replace(/{masih_pinjam}/g, String(totalAktif));
    rendered = rendered.replace(/{terlambat_count}/g, String(overdueCount));

    rendered = rendered.replace(/{total_siap}/g, String(items.filter((i) => i.status === 'AVAILABLE').length));
    rendered = rendered.replace(/{nilai_inventaris}/g, analytics.totalAssetValue.toLocaleString('id-ID'));
    rendered = rendered.replace(/{rusak_hilang}/g, String(items.filter((i) => i.status === 'DAMAGED' || i.status === 'LOST').length));

    rendered = rendered.replace(/{denda_masuk}/g, finSummary.dendaTerlambat.toLocaleString('id-ID'));
    rendered = rendered.replace(/{ganti_masuk}/g, finSummary.gantiRusakHilang.toLocaleString('id-ID'));
    rendered = rendered.replace(/{sumbangan_kas}/g, finSummary.sumbanganTunai.toLocaleString('id-ID'));
    rendered = rendered.replace(/{tunggakan}/g, finSummary.tunggakanBelumLunas.toLocaleString('id-ID'));

    rendered = rendered.replace(/{total_judul}/g, String(books.length));
    rendered = rendered.replace(/{total_eksemplar}/g, String(items.length));
    rendered = rendered.replace(/{sirkulasi_bulanan}/g, String(loans.length));
    rendered = rendered.replace(/{kategori_favorit}/g, 'Dongeng & Sains Anak');
    rendered = rendered.replace(/{kelas_teraktif}/g, 'TK-A A');
    rendered = rendered.replace(
      /{total_kas_bulanan}/g,
      (finSummary.dendaTerlambat + finSummary.gantiRusakHilang + finSummary.sumbanganTunai).toLocaleString('id-ID')
    );

    rendered = rendered.replace(/{daftar_siswa_terlambat}/g, overdueListStr);

    return rendered;
  }

  // --- PORTAL MANDIRI SISWA & ORANG TUA ---
  public studentLogin(usernameOrCode: string, password?: string): Member | null {
    if (!usernameOrCode || !usernameOrCode.trim()) return null;
    const rawClean = usernameOrCode.trim().toLowerCase();
    const cleanPass = (password || '').trim();
    if (!cleanPass) return null; // Password wajib diisi

    // Strip parentheses, e.g. "Alvaro (TK-A)" -> "alvaro", or emojis
    const normalizedInput = rawClean.replace(/[\(\)\[\]\-_]/g, ' ').trim();
    const firstWord = normalizedInput.split(/\s+/)[0];
    const members = this.getMembers();

    const member = members.find((m) => {
      // Exclude graduated or inactive
      if (m.status === 'GRADUATED' || m.status === 'INACTIVE') return false;

      const u = (m.username || '').toLowerCase().trim();
      const c = (m.memberCode || '').toLowerCase().trim();
      const n = (m.name || '').toLowerCase().trim();
      const firstName = n.split(/\s+/)[0];

      // Match on username or memberCode
      if (u && (u === rawClean || u === normalizedInput || u === firstWord)) return true;
      if (c && (c === rawClean || c === normalizedInput)) return true;

      // Match on full name or exact first name
      if (n && (n === rawClean || n === normalizedInput)) return true;
      if (firstName && firstName.length >= 3 && firstName === firstWord) return true;

      return false;
    });

    if (!member) return null;

    // Strict Password Verification:
    // Password harus sama persis dengan yang terdaftar (atau default '1234')
    const expectedPassword = (member.password || '1234').trim();
    if (cleanPass !== expectedPassword) {
      return null;
    }

    this.setActiveStudentSession(member);
    return member;
  }

  public getActiveStudentSession(): Member | null {
    if (!this.isClient()) return null;
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_STUDENT);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public setActiveStudentSession(member: Member | null): void {
    if (!this.isClient()) return;
    if (member) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_STUDENT, JSON.stringify(member));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_STUDENT);
    }
  }

  public getStudentWishlist(memberId: string): string[] {
    if (!this.isClient()) return [];
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENT_WISHLISTS);
    if (!raw) return [];
    try {
      const all = JSON.parse(raw);
      return all[memberId] || [];
    } catch {
      return [];
    }
  }

  public toggleStudentWishlist(memberId: string, bookId: string): boolean {
    if (!this.isClient()) return false;
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENT_WISHLISTS);
    let all: Record<string, string[]> = {};
    if (raw) {
      try {
        all = JSON.parse(raw);
      } catch {}
    }
    const current = all[memberId] || [];
    const exists = current.includes(bookId);
    let updated: string[];
    if (exists) {
      updated = current.filter((id) => id !== bookId);
    } else {
      updated = [...current, bookId];
    }
    all[memberId] = updated;
    localStorage.setItem(STORAGE_KEYS.STUDENT_WISHLISTS, JSON.stringify(all));
    return !exists;
  }

  public getStudentActiveLoans(memberId: string): Loan[] {
    return this.getLoans().filter(
      (l) => l.memberId === memberId && (l.status === 'ACTIVE' || l.status === 'OVERDUE')
    );
  }

  public getStudentLoanHistory(memberId: string): { loan: Loan; item: any; isOverdue: boolean }[] {
    const loans = this.getLoans().filter((l) => l.memberId === memberId);
    const history: { loan: Loan; item: any; isOverdue: boolean }[] = [];
    const today = new Date().toISOString().split('T')[0];

    loans.forEach((loan) => {
      loan.items.forEach((item) => {
        const isOverdue = !item.returnDate && loan.dueDate < today;
        history.push({
          loan,
          item,
          isOverdue,
        });
      });
    });

    return history.sort((a, b) => b.loan.loanDate.localeCompare(a.loan.loanDate));
  }

  public getStudentUnpaidFines(memberId: string): FineAndDonation[] {
    return this.getFines().filter((f) => f.memberId === memberId && f.paidStatus === 'UNPAID');
  }

  public calculateStudentFineAmount(memberId: string): number {
    if (!this.getFinanceModuleEnabled()) return 0;
    const rules = this.getLoanRules();
    const unpaidFines = this.getStudentUnpaidFines(memberId);
    const staticTotal = unpaidFines.reduce((sum, f) => sum + f.amount, 0);

    const activeLoans = this.getStudentActiveLoans(memberId);
    const today = new Date();
    let dynamicOverdueFines = 0;

    activeLoans.forEach((loan) => {
      const due = new Date(loan.dueDate);
      if (today > due) {
        const diffDays = Math.ceil((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
        const unreturnedCount = loan.items.filter((i) => !i.returnDate).length;
        dynamicOverdueFines += diffDays * rules.finePerDay * unreturnedCount;
      }
    });

    return Math.max(staticTotal, dynamicOverdueFines);
  }

  // --- FINANCE MODULE TOGGLE (Bebas di ON / OFF oleh Sekolah - Default OFF) ---
  public getFinanceModuleEnabled(): boolean {
    if (!this.isClient()) return false;
    const raw = localStorage.getItem(STORAGE_KEYS.FINANCE_ENABLED);
    if (raw === null) return false; // DEFAULT: OFF sesuai instruksi resmi sekolah
    return raw === 'true';
  }

  public setFinanceModuleEnabled(enabled: boolean): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.FINANCE_ENABLED, String(enabled));
  }

  // Direct Self-Service Password Reset (Mengirim PIN baru ke WhatsApp Ortu tanpa perlu hubungi petugas perpustakaan)
  public directResetStudentPassword(memberIdOrName: string): { newPin: string; parentPhone: string; studentName: string; waUrl: string } | null {
    const members = this.getMembers();
    const clean = memberIdOrName.trim().toLowerCase();
    const member = members.find(
      (m) =>
        m.id === memberIdOrName ||
        m.memberCode.toLowerCase() === clean ||
        m.name.toLowerCase().includes(clean) ||
        (m.username && m.username.toLowerCase() === clean)
    );
    if (!member) return null;

    // Generate random 4-digit PIN e.g. 3824
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();
    member.password = newPin;
    this.saveMembers(members);

    let phone = (member.parentPhone || '081234567890').replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) phone = '62' + phone.slice(1);

    const waText = encodeURIComponent(
      `Halo Ayah / Bunda dari ananda *${member.name}* (${member.classGroup}),\n\nPIN login baru untuk Portal Siswa Perpustakaan SBTH Magelang berhasil di-reset:\n🔑 *PIN Baru: ${newPin}*\n👤 Username: *${member.username || member.name.toLowerCase().replace(/\\s+/g, '')}*\n\nSilakan gunakan PIN ini untuk masuk ke Portal Siswa & Buku Impian. Terima kasih! 📚`
    );

    return {
      newPin,
      parentPhone: member.parentPhone || '081234567890',
      studentName: member.name,
      waUrl: `https://wa.me/${phone}?text=${waText}`,
    };
  }

  // Student Update Password from Portal
  public updateStudentPassword(memberId: string, newPin: string): boolean {
    const members = this.getMembers();
    const member = members.find((m) => m.id === memberId);
    if (!member) return false;

    member.password = newPin.trim();
    this.saveMembers(members);
    return true;
  }

  // Self-Service Account Closure / Graduation (Ajukan Penutupan Akun Mandiri)
  public closeStudentAccount(memberId: string): { success: boolean; message: string } {
    const loans = this.getStudentActiveLoans(memberId);
    if (loans.length > 0) {
      return {
        success: false,
        message: `Tidak dapat menutup akun karena ananda masih memiliki ${loans.length} buku pinjaman yang belum dikembalikan. Mohon kembalikan buku fisik ke meja perpustakaan terlebih dahulu.`,
      };
    }

    const members = this.getMembers();
    const idx = members.findIndex((m) => m.id === memberId);
    if (idx === -1) {
      return { success: false, message: 'Data anggota tidak ditemukan.' };
    }

    // Mark as graduated
    members[idx].status = 'GRADUATED';
    this.saveMembers(members);
    this.setActiveStudentSession(null);

    return {
      success: true,
      message: 'Akun perpustakaan ananda telah berhasil ditutup / dialihkan ke status Kelulusan (Alumni). Seluruh riwayat peminjaman tetap tersimpan rapi untuk arsip akreditasi sekolah.',
    };
  }

  // --- SHELVES & RACK LOCATIONS (EDITABLE DYNAMIC TEMPLATES) ---
  public getShelves(): ShelfLocationItem[] {
    if (!this.isClient()) return DEFAULT_SHELVES;
    const raw = localStorage.getItem(STORAGE_KEYS.SHELVES);
    if (!raw) {
      this.saveShelves(DEFAULT_SHELVES);
      return DEFAULT_SHELVES;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SHELVES;
    } catch {
      return DEFAULT_SHELVES;
    }
  }

  public saveShelves(shelves: ShelfLocationItem[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.SHELVES, JSON.stringify(shelves));
  }

  public addShelf(shelf: Omit<ShelfLocationItem, 'id'>): ShelfLocationItem {
    const list = this.getShelves();
    const newShelf: ShelfLocationItem = {
      ...shelf,
      id: `shelf-${Date.now().toString(36)}`,
    };
    const updated = [...list, newShelf];
    this.saveShelves(updated);
    this.addActivityLog({
      category: 'CATALOG',
      action: 'TAMBAH_RAK',
      actor: 'Pustakawan',
      targetTitle: newShelf.name,
      details: `Menambahkan lokasi rak baru: ${newShelf.code} (${newShelf.name})`,
    });
    return newShelf;
  }

  public updateShelf(id: string, updates: Partial<ShelfLocationItem>): void {
    const list = this.getShelves().map((s) => (s.id === id ? { ...s, ...updates } : s));
    this.saveShelves(list);
  }

  public deleteShelf(id: string): boolean {
    const list = this.getShelves().filter((s) => s.id !== id);
    if (list.length === 0) return false;
    this.saveShelves(list);
    return true;
  }

  // Toggle Fitur Baris Rak (Row/Sap) ON / OFF
  public isShelfRowFeatureEnabled(): boolean {
    if (!this.isClient()) return true;
    const raw = localStorage.getItem(STORAGE_KEYS.SHELF_ROW_ENABLED);
    if (raw === null) return true; // Default ON
    try {
      return JSON.parse(raw) === true;
    } catch {
      return true;
    }
  }

  public setShelfRowFeatureEnabled(enabled: boolean): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.SHELF_ROW_ENABLED, JSON.stringify(enabled));
  }

  // Quick Inline Shelf Location Updaters
  public updateBookShelf(bookId: string, newShelf: string): void {
    const books = this.getBooks();
    const items = this.getBookItems();
    const bIdx = books.findIndex((b) => b.id === bookId);
    if (bIdx !== -1) {
      books[bIdx].shelfLocation = newShelf;
      this.saveBooks(books);
    }
    // Also update all items of this book that don't have custom shelves
    items.forEach((it) => {
      if (it.bookId === bookId) {
        it.shelfLocation = newShelf;
      }
    });
    this.saveBookItems(items);
    this.addActivityLog({
      category: 'CATALOG',
      action: 'GANTI_RAK',
      actor: 'Pustakawan',
      targetTitle: books[bIdx]?.title || 'Buku',
      details: `Mengubah lokasi rak buku "${books[bIdx]?.title || bookId}" ke: ${newShelf}`,
    });
  }

  public updateItemShelf(itemBarcode: string, newShelf: string): void {
    const items = this.getBookItems();
    const it = items.find((i) => i.itemBarcode === itemBarcode);
    if (it) {
      it.shelfLocation = newShelf;
      this.saveBookItems(items);
      this.addActivityLog({
        category: 'CATALOG',
        action: 'GANTI_RAK_EKSEMPLAR',
        actor: 'Pustakawan',
        targetBarcode: itemBarcode,
        details: `Mengubah lokasi fisik eksemplar [${itemBarcode}] ke: ${newShelf}`,
      });
    }
  }

  // --- WHATSAPP REMINDER TEMPLATES (EDITABLE) ---
  public getWhatsAppTemplates(): WhatsAppReminderTemplate[] {
    if (!this.isClient()) return DEFAULT_WHATSAPP_TEMPLATES;
    const raw = localStorage.getItem(STORAGE_KEYS.WHATSAPP_TEMPLATES);
    if (!raw) {
      this.saveWhatsAppTemplates(DEFAULT_WHATSAPP_TEMPLATES);
      return DEFAULT_WHATSAPP_TEMPLATES;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_WHATSAPP_TEMPLATES;
    } catch {
      return DEFAULT_WHATSAPP_TEMPLATES;
    }
  }

  public saveWhatsAppTemplates(templates: WhatsAppReminderTemplate[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.WHATSAPP_TEMPLATES, JSON.stringify(templates));
  }

  public updateWhatsAppTemplate(id: string, templateText: string): void {
    const templates = this.getWhatsAppTemplates().map((t) =>
      t.id === id ? { ...t, templateText } : t
    );
    this.saveWhatsAppTemplates(templates);
  }

  // --- COMPREHENSIVE ACTIVITY / AUDIT LOG ---
  public getActivityLogs(): ActivityLogEntry[] {
    if (!this.isClient()) return [];
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
    if (!raw) {
      const initialLogs: ActivityLogEntry[] = [
        {
          id: 'log-1',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          category: 'CIRCULATION',
          action: 'PINJAM_BUKU',
          actor: 'Pustakawan',
          targetTitle: 'Dongeng Anak Sedunia',
          targetBarcode: 'SBTH-B-00102',
          details: 'Peminjaman 1 eksemplar untuk ananda Alvaro Gavriel (TK-A A) - Durasi 7 hari.',
        },
        {
          id: 'log-2',
          timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
          category: 'AUTH',
          action: 'LOGIN_PUSTAKAWAN',
          actor: 'Pustakawan',
          details: 'Autentikasi admin sirkulasi berhasil.',
        },
        {
          id: 'log-3',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          category: 'STOCK_OPNAME',
          action: 'STOCK_OPNAME',
          actor: 'Pustakawan',
          details: 'Audit fisik berkala: 18 eksemplar terverifikasi cocok di rak.',
        },
      ];
      this.saveActivityLogs(initialLogs);
      return initialLogs;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public saveActivityLogs(logs: ActivityLogEntry[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(logs.slice(0, 200)));
  }

  public addActivityLog(log: Omit<ActivityLogEntry, 'id' | 'timestamp'>): ActivityLogEntry {
    const logs = this.getActivityLogs();
    const newEntry: ActivityLogEntry = {
      ...log,
      id: `act-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newEntry, ...logs];
    this.saveActivityLogs(updated);
    return newEntry;
  }

  public clearActivityLogs(): void {
    if (!this.isClient()) return;
    localStorage.removeItem(STORAGE_KEYS.ACTIVITY_LOGS);
  }

  // --- STOCK OPNAME RECORDS & AUDIT SESSIONS ---
  public getStockOpnameRecords(): StockOpnameRecord[] {
    if (!this.isClient()) return [];
    const raw = localStorage.getItem(STORAGE_KEYS.STOCK_OPNAME);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  public saveStockOpnameRecord(record: StockOpnameRecord): void {
    if (!this.isClient()) return;
    const records = this.getStockOpnameRecords();
    const updated = [record, ...records];
    localStorage.setItem(STORAGE_KEYS.STOCK_OPNAME, JSON.stringify(updated));

    // Update School Profile with last stock opname date and summary
    const summaryText = `Audit Fisik: ${record.matchedCount}/${record.totalBooksAudited} Eksemplar Sesuai (${
      record.totalBooksAudited > 0
        ? Math.round((record.matchedCount / record.totalBooksAudited) * 100)
        : 100
    }%)`;
    this.saveSchoolProfile({
      lastStockOpnameDate: record.date,
      lastStockOpnameSummary: summaryText,
    });

    this.addActivityLog({
      category: 'CATALOG',
      action: 'STOCK_OPNAME_SELESAI',
      actor: record.auditedBy || 'Pustakawan',
      details: `Menyelesaikan audit stock opname fisik perpustakaan: ${record.matchedCount}/${record.totalBooksAudited} eksemplar terverifikasi cocok.`,
    });
  }

  // --- PERPANJANGAN PINJAMAN (RENEWAL SYSTEM) ---
  public renewLoan(
    loanId: string,
    additionalDays?: number,
    handledBy: string = 'Pustakawan'
  ): { success: boolean; message: string; newDueDate?: string } {
    if (!this.isClient()) return { success: false, message: 'Server environment' };
    const loans = this.getLoans();
    const loanIndex = loans.findIndex((l) => l.id === loanId);
    if (loanIndex === -1) {
      return { success: false, message: 'Data transaksi peminjaman tidak ditemukan.' };
    }

    const loan = loans[loanIndex];
    if (loan.status === 'RETURNED') {
      return { success: false, message: 'Buku sudah dikembalikan, tidak dapat diperpanjang.' };
    }

    const rules = this.getLoanRules();
    const member = this.getMembers().find((m) => m.id === loan.memberId);
    const memberType = member?.type || 'STUDENT';
    const typeRule = rules.memberTypeRules?.find((r) => r.memberType === memberType);
    const maxRenewals = typeRule?.maxRenewals ?? rules.maxRenewals ?? 1;

    const currentRenewals = loan.renewalCount || 0;
    if (currentRenewals >= maxRenewals) {
      return {
        success: false,
        message: `Batas perpanjangan maksimal (${maxRenewals}x) untuk ${typeRule?.label || 'tipe anggota ini'} telah tercapai. Buku harus dikembalikan untuk memberi kesempatan pembaca lain.`,
      };
    }

    // Hitung tanggal jatuh tempo baru
    const daysToAdd = additionalDays || typeRule?.loanDurationDays || rules.renewalDurationDays || 7;
    const baseDueDate = new Date(loan.dueDate);
    const now = new Date();
    // Jika sudah terlambat, perpanjangan dihitung dari hari ini
    const startingPoint = now > baseDueDate ? now : baseDueDate;
    const newDueDateObj = new Date(startingPoint.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    const newDueDateStr = newDueDateObj.toISOString().split('T')[0];

    loan.dueDate = newDueDateStr;
    loan.status = 'ACTIVE';
    loan.renewalCount = currentRenewals + 1;
    loan.lastRenewedAt = new Date().toISOString().split('T')[0];
    loans[loanIndex] = loan;
    this.saveLoans(loans);

    const bookTitles = loan.items.map((i) => i.bookTitle).join(', ');
    this.addActivityLog({
      category: 'CIRCULATION',
      action: 'PERPANJANG_PINJAM',
      actor: handledBy,
      targetMember: member?.name || loan.memberId,
      targetTitle: bookTitles,
      details: `Perpanjangan masa pinjam ke-${loan.renewalCount} (+${daysToAdd} hari). Jatuh tempo baru: ${newDueDateStr}.`,
    });

    return {
      success: true,
      message: `Perpanjangan berhasil! Jatuh tempo baru telah diperbarui menjadi ${newDueDateStr}.`,
      newDueDate: newDueDateStr,
    };
  }

  // --- RESERVASI / BOOKING BUKU (SLiMS STYLE) ---
  public getReservations(): Reservation[] {
    if (!this.isClient()) return [];
    const raw = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((r: any) => {
        const rawReqDate = r.requestDate || r.reservationDate || r.createdAt || r.date;
        const reqDateObj = rawReqDate ? new Date(rawReqDate) : null;
        const validReqDate = reqDateObj && !isNaN(reqDateObj.getTime()) ? reqDateObj.toISOString() : new Date().toISOString();
        
        const rawExpDate = r.expiryDate || r.pickupDeadline;
        const expDateObj = rawExpDate ? new Date(rawExpDate) : null;
        const validExpDate = expDateObj && !isNaN(expDateObj.getTime()) ? expDateObj.toISOString() : new Date(Date.now() + 86400000).toISOString();

        return {
          ...r,
          requestDate: validReqDate,
          expiryDate: validExpDate,
          desiredPickupDate: r.desiredPickupDate || validReqDate.split('T')[0],
        };
      });
    } catch {
      return [];
    }
  }

  public saveReservations(reservations: Reservation[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
  }

  public createReservation(
    bookId: string,
    memberId: string,
    handledBy: string = 'Mandiri',
    desiredPickupDate?: string
  ): { success: boolean; message: string; reservation?: Reservation } {
    if (!this.isClient()) return { success: false, message: 'Server environment' };
    const book = this.getBooks().find((b) => b.id === bookId);
    const member = this.getMembers().find((m) => m.id === memberId);
    if (!book || !member) {
      return { success: false, message: 'Data buku atau anggota tidak valid.' };
    }

    const reservations = this.getReservations();
    // Cek apakah siswa sudah punya antrean aktif untuk buku ini
    const existing = reservations.find(
      (r) =>
        r.bookId === bookId &&
        r.memberId === memberId &&
        (r.status === 'PENDING' || r.status === 'READY_FOR_PICKUP')
    );
    if (existing) {
      return {
        success: false,
        message: 'Ananda sudah memiliki antrean reservasi aktif untuk buku ini.',
      };
    }

    const rules = this.getLoanRules();
    const activeLoans = this.getStudentActiveLoans(memberId);
    const activeReservations = reservations.filter(
      (r) => r.memberId === memberId && (r.status === 'PENDING' || r.status === 'READY_FOR_PICKUP')
    );

    // Skenario kuota yang dapat diatur di pengaturan:
    // 1. Sedang meminjam buku (> 0): batas = rules.maxReservationsWhenBorrowing ?? 1
    // 2. Belum meminjam buku (0): batas = rules.maxReservationsTotal ?? 2
    const maxQuota = activeLoans.length > 0
      ? (typeof rules.maxReservationsWhenBorrowing === 'number' ? rules.maxReservationsWhenBorrowing : 1)
      : (typeof rules.maxReservationsTotal === 'number' ? rules.maxReservationsTotal : 2);

    if (activeReservations.length >= maxQuota) {
      if (activeLoans.length > 0) {
        return {
          success: false,
          message: `Kuota reservasi tercapai! Saat ini ananda sedang meminjam ${activeLoans.length} buku. Berdasarkan aturan perpustakaan, kuota reservasi saat sedang meminjam adalah maksimal ${maxQuota} buku. Silakan kembalikan buku terlebih dahulu agar kuota terbuka kembali ya.`,
        };
      } else {
        return {
          success: false,
          message: `Kuota reservasi tercapai! Berdasarkan aturan perpustakaan, maksimal reservasi aktif adalah ${maxQuota} buku.`,
        };
      }
    }

    const expiryHours = rules.reservationExpiryHours || 24;
    const now = new Date();
    const expiry = new Date(now.getTime() + expiryHours * 3600000);

    const newRes: Reservation = {
      id: `res-${Date.now().toString(36)}`,
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      coverImage: book.coverImage,
      memberId: member.id,
      memberName: member.name,
      memberClass: member.classGroup,
      parentPhone: member.parentPhone,
      requestDate: now.toISOString(),
      expiryDate: expiry.toISOString(),
      desiredPickupDate: desiredPickupDate || now.toISOString().split('T')[0],
      status: 'PENDING',
      handledBy,
    };

    const updated = [newRes, ...reservations];
    this.saveReservations(updated);

    this.addActivityLog({
      category: 'CIRCULATION',
      action: 'RESERVASI_BUKU',
      actor: member.name,
      targetMember: member.name,
      targetTitle: book.title,
      details: `Reservasi antrean buku cerita "${book.title}" berhasil dicatat.`,
    });

    return {
      success: true,
      message: `Buku "${book.title}" berhasil direservasi! Begitu buku dikembalikan ke perpustakaan, sistem akan mengamankannya untuk ananda selama ${expiryHours} jam.`,
      reservation: newRes,
    };
  }

  public cancelReservation(reservationId: string, reason: string = 'Dibatalkan'): void {
    if (!this.isClient()) return;
    const reservations = this.getReservations();
    const idx = reservations.findIndex((r) => r.id === reservationId);
    if (idx !== -1) {
      reservations[idx].status = 'CANCELLED';
      reservations[idx].notes = reason;
      this.saveReservations(reservations);
    }
  }

  public fulfillReservation(reservationId: string): void {
    if (!this.isClient()) return;
    const reservations = this.getReservations();
    const idx = reservations.findIndex((r) => r.id === reservationId);
    if (idx !== -1) {
      reservations[idx].status = 'FULFILLED';
      this.saveReservations(reservations);
    }
  }

  public checkBookReservationsOnReturn(bookId: string): Reservation | null {
    if (!this.isClient()) return null;
    const reservations = this.getReservations();
    // Cari reservasi PENDING pertama
    const pendingRes = reservations.find((r) => r.bookId === bookId && r.status === 'PENDING');
    if (!pendingRes) return null;

    const rules = this.getLoanRules();
    const expiryHours = rules.reservationExpiryHours || 24;
    const expiry = new Date(Date.now() + expiryHours * 3600000);

    pendingRes.status = 'READY_FOR_PICKUP';
    pendingRes.expiryDate = expiry.toISOString();
    pendingRes.notifiedAt = new Date().toISOString();
    this.saveReservations(reservations);

    this.addActivityLog({
      category: 'CIRCULATION',
      action: 'RESERVASI_SIAP_AMBIL',
      actor: 'Sistem Perpustakaan',
      targetMember: pendingRes.memberName,
      targetTitle: pendingRes.bookTitle,
      details: `Buku "${pendingRes.bookTitle}" telah kembali dan siap diambil oleh ${pendingRes.memberName} (Batas: ${expiryHours} jam).`,
    });

    return pendingRes;
  }

  // --- POLA PENAMAAN KODE EKSEMPLAR SLIMS (PATTERN GENERATOR) ---
  public getSlimsPattern(): SlimsPatternConfig {
    if (!this.isClient()) return DEFAULT_SLIMS_PATTERN;
    const raw = localStorage.getItem(STORAGE_KEYS.SLIMS_PATTERN);
    if (!raw) {
      this.saveSlimsPattern(DEFAULT_SLIMS_PATTERN);
      return DEFAULT_SLIMS_PATTERN;
    }
    try {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SLIMS_PATTERN,
        ...parsed,
        prefix: parsed.prefix !== undefined ? parsed.prefix : DEFAULT_SLIMS_PATTERN.prefix,
        serialLength: parsed.serialLength || DEFAULT_SLIMS_PATTERN.serialLength,
        suffix: parsed.suffix !== undefined ? parsed.suffix : DEFAULT_SLIMS_PATTERN.suffix,
        nextNumber: typeof parsed.nextNumber === 'number' ? parsed.nextNumber : DEFAULT_SLIMS_PATTERN.nextNumber,
      };
    } catch {
      return DEFAULT_SLIMS_PATTERN;
    }
  }

  public saveSlimsPattern(config: SlimsPatternConfig): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.SLIMS_PATTERN, JSON.stringify(config));
  }

  public generateNextItemBarcode(categoryId?: string): string {
    const pattern = this.getSlimsPattern();
    let prefix = pattern.prefix !== undefined ? pattern.prefix : '';

    if (pattern.patternMode === 'SBTH_4DIGIT') {
      prefix = pattern.prefix !== undefined ? pattern.prefix : '';
    } else if (pattern.patternMode === 'SBTH') {
      prefix = pattern.prefix !== undefined && pattern.prefix !== '' ? pattern.prefix : 'SBTH-B-';
    } else if (pattern.patternMode === 'SLIMS_STANDARD') {
      prefix = pattern.prefix !== undefined && pattern.prefix !== '' ? pattern.prefix : 'B';
    } else if (pattern.patternMode === 'CATEGORY_BASED' && categoryId) {
      const catCode = categoryId.replace('cat-', '').substring(0, 3).toUpperCase();
      prefix = `${catCode}-`;
    } else if (pattern.patternMode === 'CUSTOM') {
      prefix = pattern.prefix !== undefined ? pattern.prefix : '';
    }

    const serialLength = pattern.serialLength || (pattern.patternMode === 'SBTH_4DIGIT' ? 4 : 5);
    const numStr = String(pattern.nextNumber).padStart(serialLength, '0');
    const currentYear = new Date().getFullYear();
    const rawSuffix = pattern.suffix !== undefined ? pattern.suffix : '';
    const suffix = rawSuffix
      .replace(/{YEAR}|{year}|{TAHUN}|{tahun}/gi, String(currentYear))
      .replace(/\/20\d\d/g, `/${currentYear}`);

    const barcode = `${prefix}${numStr}${suffix}`;

    // Naikkan nomor berikutnya
    pattern.nextNumber += 1;
    this.saveSlimsPattern(pattern);
    return barcode;
  }

  // --- BERSIHKAN AWALAN LAMA MENJADI KODE 4-DIGIT BERSIH (MISAL: SBTH-B-0176 -> 0176, B0175 -> 0175) ---
  public convertOldPrefixBarcodesTo4Digit(): { count: number; convertedList: { old: string; new: string }[] } {
    if (!this.isClient()) return { count: 0, convertedList: [] };
    const items = this.getBookItems();
    const loans = this.getLoans();
    const convertedList: { old: string; new: string }[] = [];

    const updatedItems = items.map((item) => {
      const oldBarcode = item.itemBarcode;
      // Jika memiliki awalan huruf seperti SBTH-B-, B, DNG-, dll
      if (/[a-zA-Z]/.test(oldBarcode)) {
        const digits = oldBarcode.replace(/\D/g, '');
        if (digits.length >= 4) {
          const newBarcode = digits.slice(-4);
          convertedList.push({ old: oldBarcode, new: newBarcode });
          return { ...item, itemBarcode: newBarcode };
        } else if (digits.length > 0) {
          const newBarcode = digits.padStart(4, '0');
          convertedList.push({ old: oldBarcode, new: newBarcode });
          return { ...item, itemBarcode: newBarcode };
        }
      }
      return item;
    });

    if (convertedList.length > 0) {
      const updatedLoans = loans.map((loan) => {
        let loanModified = false;
        const newLoanItems = loan.items.map((li) => {
          const matched = convertedList.find((c) => c.old === li.itemBarcode);
          if (matched) {
            loanModified = true;
            return { ...li, itemBarcode: matched.new };
          }
          return li;
        });
        return loanModified ? { ...loan, items: newLoanItems } : loan;
      });

      this.saveBookItems(updatedItems);
      this.saveLoans(updatedLoans);

      // Sinkronkan nomor urut berikutnya agar minimal lebih besar dari angka tertinggi
      const pattern = this.getSlimsPattern();
      const highestNum = Math.max(
        ...updatedItems.map((i) => {
          const d = parseInt(i.itemBarcode.replace(/\D/g, ''), 10);
          return isNaN(d) ? 0 : d;
        }),
        pattern.nextNumber - 1
      );
      if (highestNum >= pattern.nextNumber) {
        pattern.nextNumber = highestNum + 1;
        this.saveSlimsPattern(pattern);
      }
    }

    return { count: convertedList.length, convertedList };
  }

  // --- REGENERASI MASSAL BARCODE SLIMS SESUAI PRESET (DENGAN BACKUP & RESTORE) ---
  public reindexAllBookBarcodes(newPattern?: SlimsPatternConfig): { success: boolean; count: number; nextNumber: number; backupKey: string } {
    if (!this.isClient()) return { success: false, count: 0, nextNumber: 0, backupKey: '' };
    const items = this.getBookItems();
    if (items.length === 0) return { success: true, count: 0, nextNumber: 1, backupKey: '' };

    // Simpan snapshot cadangan sebelum merubah agar bisa dibatalkan / di-undo
    const backupSnapshot = JSON.stringify(items);
    localStorage.setItem('SBTH_BACKUP_BOOK_ITEMS_BEFORE_REINDEX', backupSnapshot);
    localStorage.setItem('SBTH_BACKUP_BOOK_ITEMS_TIMESTAMP', new Date().toISOString());

    const pattern = newPattern || this.getSlimsPattern();
    let currentNumber = pattern.nextNumber || 1;
    const books = this.getBooks();
    const barcodeMap: Record<string, string> = {};

    const updatedItems = items.map((item) => {
      let prefix = pattern.prefix !== undefined ? pattern.prefix : '';
      if (pattern.patternMode === 'SBTH_4DIGIT') {
        prefix = pattern.prefix !== undefined ? pattern.prefix : '';
      } else if (pattern.patternMode === 'SLIMS_STANDARD') {
        prefix = pattern.prefix !== undefined && pattern.prefix !== '' ? pattern.prefix : 'B';
      } else if (pattern.patternMode === 'CATEGORY_BASED') {
        const book = books.find((b) => b.id === item.bookId);
        const catCode = book?.categoryId ? book.categoryId.replace('cat-', '').substring(0, 3).toUpperCase() : 'B';
        prefix = `${catCode}-`;
      } else if (pattern.patternMode === 'SBTH') {
        prefix = pattern.prefix !== undefined && pattern.prefix !== '' ? pattern.prefix : 'SBTH-B-';
      } else if (pattern.patternMode === 'CUSTOM') {
        prefix = pattern.prefix !== undefined ? pattern.prefix : '';
      }

      const serialLength = pattern.serialLength || (pattern.patternMode === 'SBTH_4DIGIT' ? 4 : 5);
      const numStr = String(currentNumber).padStart(serialLength, '0');
      const suffix = pattern.suffix || '';
      const newBarcode = `${prefix}${numStr}${suffix}`;
      currentNumber++;

      barcodeMap[item.itemBarcode] = newBarcode;
      return {
        ...item,
        itemBarcode: newBarcode,
      };
    });

    this.saveBookItems(updatedItems);

    // Sinkronisasi record peminjaman aktif agar barcode baru tetap cocok
    const loans = this.getLoans();
    let loansChanged = false;
    const updatedLoans = loans.map((loan) => {
      let modified = false;
      const newLoanItems = loan.items.map((li) => {
        if (barcodeMap[li.itemBarcode]) {
          modified = true;
          return { ...li, itemBarcode: barcodeMap[li.itemBarcode] };
        }
        return li;
      });
      if (modified) {
        loansChanged = true;
        return { ...loan, items: newLoanItems };
      }
      return loan;
    });
    if (loansChanged) {
      this.saveLoans(updatedLoans);
    }

    // Perbarui nomor urut berikutnya di pola
    pattern.nextNumber = currentNumber;
    this.saveSlimsPattern(pattern);

    this.addActivityLog({
      category: 'CATALOG',
      action: 'MASS_REINDEX_BARCODES',
      actor: 'Pustakawan',
      details: `Regenerasi massal ${items.length} kode barcode eksemplar buku ke format ${pattern.patternMode}.`,
    });

    return { success: true, count: items.length, nextNumber: currentNumber, backupKey: 'SBTH_BACKUP_BOOK_ITEMS_BEFORE_REINDEX' };
  }

  public restorePreviousBookBarcodes(): { success: boolean; count: number; message: string } {
    if (!this.isClient()) return { success: false, count: 0, message: 'Server environment' };
    const raw = localStorage.getItem('SBTH_BACKUP_BOOK_ITEMS_BEFORE_REINDEX');
    if (!raw) {
      return { success: false, count: 0, message: 'Tidak ada data backup barcode sebelumnya untuk dipulihkan.' };
    }
    try {
      const restoredItems: BookItem[] = JSON.parse(raw);
      this.saveBookItems(restoredItems);
      localStorage.removeItem('SBTH_BACKUP_BOOK_ITEMS_BEFORE_REINDEX');
      return {
        success: true,
        count: restoredItems.length,
        message: `Berhasil mengembalikan ${restoredItems.length} kode barcode ke kondisi sebelum regenerasi.`,
      };
    } catch {
      return { success: false, count: 0, message: 'Gagal memproses data pemulihan backup.' };
    }
  }

  public hasReindexBackup(): boolean {
    if (!this.isClient()) return false;
    return !!localStorage.getItem('SBTH_BACKUP_BOOK_ITEMS_BEFORE_REINDEX');
  }

  // --- SISTEM MANAJEMEN KONTEN (CMS BERITA & PENGUMUMAN) ---
  public getLibraryNews(): LibraryNewsArticle[] {
    if (!this.isClient()) return DEFAULT_LIBRARY_NEWS;
    const raw = localStorage.getItem(STORAGE_KEYS.LIBRARY_NEWS);
    if (!raw) {
      this.saveLibraryNews(DEFAULT_LIBRARY_NEWS);
      return DEFAULT_LIBRARY_NEWS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_LIBRARY_NEWS;
    } catch {
      return DEFAULT_LIBRARY_NEWS;
    }
  }

  public saveLibraryNews(articles: LibraryNewsArticle[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.LIBRARY_NEWS, JSON.stringify(articles));
  }

  public addLibraryNews(article: Omit<LibraryNewsArticle, 'id'>): LibraryNewsArticle {
    const news = this.getLibraryNews();
    const newArticle: LibraryNewsArticle = {
      ...article,
      id: `news-${Date.now().toString(36)}`,
    };
    const updated = [newArticle, ...news];
    this.saveLibraryNews(updated);
    return newArticle;
  }

  public updateLibraryNews(article: LibraryNewsArticle): void {
    const news = this.getLibraryNews();
    const idx = news.findIndex((n) => n.id === article.id);
    if (idx !== -1) {
      news[idx] = article;
      this.saveLibraryNews(news);
    }
  }

  public deleteLibraryNews(id: string): void {
    const news = this.getLibraryNews();
    const updated = news.filter((n) => n.id !== id);
    this.saveLibraryNews(updated);
  }

  // --- EKSPOR KOLEKSI FORMAT SLIMS (KOMPATIBEL CSV / EXCEL) ---
  public exportSlimsCsv(): string {
    const books = this.getBooks();
    const items = this.getBookItems();

    const headers = [
      'item_code',
      'title',
      'author',
      'publisher',
      'publish_year',
      'isbn',
      'call_number',
      'classification',
      'location',
      'status',
      'page_count',
      'physical_format',
      'synopsis',
      'language',
      'source',
      'price_value',
    ];

    const rows: string[] = [headers.join(',')];

    items.forEach((item) => {
      const book = books.find((b) => b.id === item.bookId);
      if (!book) return;

      const callNo = book.callNumber || generateSlimsCallNumber(book.title, book.author, book.categoryId);
      const safe = (val: any) => `"${String(val || '').replace(/"/g, '""')}"`;

      rows.push(
        [
          safe(item.itemBarcode),
          safe(book.title),
          safe(book.author),
          safe(book.publisher),
          safe(book.publicationYear),
          safe(book.isbn),
          safe(callNo),
          safe(book.classification || callNo.split(' ')[0]),
          safe(item.shelfLocation || book.shelfLocation || 'Rak Utama'),
          safe(item.status),
          safe(book.pageCount || ''),
          safe(book.physicalFormat || 'Cerita Bergambar'),
          safe(book.synopsis || ''),
          safe(book.bookLanguage || 'id'),
          safe(item.source || 'BELI_SEKOLAH'),
          safe(item.priceValue ?? book.priceValue ?? 0),
        ].join(',')
      );
    });

    return rows.join('\r\n');
  }

  public downloadSlimsCsv(): void {
    if (!this.isClient()) return;
    const csvContent = this.exportSlimsCsv();
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const today = new Date().toISOString().split('T')[0];
    a.download = `Katalog_Eksemplar_SLiMS_SBTH_TK_${today}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // --- BULK UPDATE SHELF LOCATION (EDIT MASSAL RAK) ---
  public bulkUpdateShelfLocation(itemIds: string[], newShelfLocation: string): number {
    if (!this.isClient() || itemIds.length === 0) return 0;
    const items = this.getBookItems();
    const books = this.getBooks();
    const today = new Date().toISOString().split('T')[0];
    let updatedCount = 0;
    const touchedBookIds = new Set<string>();

    const updatedItems = items.map((it) => {
      if (itemIds.includes(it.id) || itemIds.includes(it.itemBarcode)) {
        updatedCount++;
        touchedBookIds.add(it.bookId);
        return {
          ...it,
          shelfLocation: newShelfLocation,
          statusUpdatedAt: today,
        };
      }
      return it;
    });

    const updatedBooks = books.map((b) => {
      if (touchedBookIds.has(b.id)) {
        return {
          ...b,
          shelfLocation: newShelfLocation,
        };
      }
      return b;
    });

    this.saveBookItems(updatedItems);
    this.saveBooks(updatedBooks);

    this.addActivityLog({
      category: 'CATALOG',
      action: 'GANTI_RAK',
      actor: 'Pustakawan',
      details: `Edit massal: Memindahkan ${updatedCount} eksemplar fisik ke lokasi: ${newShelfLocation}.`,
    });

    return updatedCount;
  }

  // --- BULK SYNC / UPDATE SPINE CODES (SINKRONISASI MASSAL PUNGGUNG BUKU SBTH) ---
  public bulkSyncSpineCodes(
    bookIds: string[],
    options?: {
      customShelfCode?: string;      // Baris 1: e.g. "SR", "AG", etc. (or keep/derive if empty)
      customClassification?: string; // Baris 2: e.g. "813", "398.2" (or keep/derive if empty)
      customAuthorCode?: string;     // Baris 3: e.g. 3 letters (or derive if empty)
      customTitleCode?: string;      // Baris 4: e.g. 1 letter (or derive if empty)
      forceRecalculate?: boolean;    // recalculate all 4 lines automatically using getSbthSpineCode
    }
  ): { updatedCount: number; updatedTitles: string[] } {
    if (!this.isClient()) return { updatedCount: 0, updatedTitles: [] };
    const books = this.getBooks();
    const updatedTitles: string[] = [];

    const isAll = !bookIds || bookIds.length === 0;
    const targetSet = new Set(bookIds || []);

    const updatedBooks = books.map((b) => {
      if (isAll || targetSet.has(b.id)) {
        const spine = getSbthSpineCode(
          b.title,
          b.author,
          b.categoryId,
          options?.customShelfCode,
          options?.customClassification,
          options?.customAuthorCode,
          options?.customTitleCode
        );

        const shelfCode = options?.customShelfCode?.trim()
          ? options.customShelfCode.trim().toUpperCase()
          : options?.forceRecalculate
          ? spine.shelfCode
          : b.shelfCode || spine.shelfCode;

        const classification = options?.customClassification?.trim()
          ? options.customClassification.trim()
          : options?.forceRecalculate
          ? spine.ddc
          : b.classification || spine.ddc;

        const authorCode = options?.customAuthorCode?.trim()
          ? options.customAuthorCode.trim().toUpperCase()
          : options?.forceRecalculate
          ? spine.authorCode
          : b.authorCode || spine.authorCode;

        const titleCode = options?.customTitleCode?.trim()
          ? options.customTitleCode.trim().toLowerCase()
          : options?.forceRecalculate
          ? spine.titleCode
          : b.titleCode || spine.titleCode;

        const callNumber = `${classification} ${authorCode} ${titleCode}`;

        updatedTitles.push(b.title);
        return {
          ...b,
          shelfCode,
          classification,
          authorCode,
          titleCode,
          callNumber,
        };
      }
      return b;
    });

    this.saveBooks(updatedBooks);

    this.addActivityLog({
      category: 'CATALOG',
      action: 'UPDATE',
      actor: 'Pustakawan',
      details: `Sinkronisasi massal label punggung buku SBTH (4-baris vertikal) untuk ${updatedTitles.length} judul buku.`,
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sbth_books_updated'));
      window.dispatchEvent(new Event('storage'));
    }

    return { updatedCount: updatedTitles.length, updatedTitles };
  }

  // --- DRAFT STOCK OPNAME BERTAHAP (PER BATCH / PER RAK) ---
  public getStockOpnameDraft(): {
    checkedMap: Record<string, boolean>;
    finishedShelves?: string[];
    completedShelves?: Record<string, boolean>;
    notes?: string;
    lastUpdated?: string;
    lastSavedDate?: string;
  } {
    if (!this.isClient()) return { checkedMap: {}, completedShelves: {}, finishedShelves: [] };
    const raw = localStorage.getItem('SBTH_STOCK_OPNAME_DRAFT');
    if (!raw) return { checkedMap: {}, completedShelves: {}, finishedShelves: [] };
    try {
      return JSON.parse(raw);
    } catch {
      return { checkedMap: {}, completedShelves: {}, finishedShelves: [] };
    }
  }

  public saveStockOpnameDraft(draft: {
    checkedMap: Record<string, boolean>;
    finishedShelves?: string[];
    completedShelves?: Record<string, boolean>;
    notes?: string;
    lastUpdated?: string;
  }): void {
    if (!this.isClient()) return;
    const nowIso = new Date().toISOString();
    const data = {
      ...draft,
      lastUpdated: draft.lastUpdated || nowIso,
      lastSavedDate: draft.lastUpdated || nowIso,
    };
    localStorage.setItem('SBTH_STOCK_OPNAME_DRAFT', JSON.stringify(data));
  }

  public clearStockOpnameDraft(): void {
    if (!this.isClient()) return;
    localStorage.removeItem('SBTH_STOCK_OPNAME_DRAFT');
  }

  public resetToDefault(): void {
    if (!this.isClient()) return;
    this.saveBooks(INITIAL_BOOKS);
    this.saveBookItems(INITIAL_BOOK_ITEMS);
    this.saveMembers(INITIAL_MEMBERS);
    this.saveLoans(INITIAL_LOANS);
    this.saveFines(INITIAL_FINES_AND_DONATIONS);
    this.saveTelegramConfig(DEFAULT_TELEGRAM_CONFIG);
    this.saveSchoolProfile(DEFAULT_SCHOOL_PROFILE);
    this.saveLibrarians(DEFAULT_LIBRARIANS);
    this.saveReminderSchedule(DEFAULT_REMINDER_SCHEDULE);
    this.saveLoanRules(DEFAULT_LOAN_RULES);
    this.saveTelegramTemplates(DEFAULT_TELEGRAM_TEMPLATES);
    this.saveAppMode('PUSTAKAWAN');
    this.saveCategories(CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.WISHLIST);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_STUDENT);
    localStorage.removeItem(STORAGE_KEYS.STUDENT_WISHLISTS);
  }

  // Bersihkan data dummy/percobaan agar pustakawan bisa mengisi data real dari nol (atau dari Excel)
  public clearMockupBooksAndLoans(adminPin: string, librarianName?: string): { success: boolean; message: string } {
    if (!this.isClient()) return { success: false, message: 'Hanya dapat dijalankan di browser.' };
    const cleanPin = (adminPin || '').trim();
    if (cleanPin !== 'sbth2026' && cleanPin !== '1234') {
      const isLibrarian = this.getLibrarians().some((l) => l.pin === cleanPin);
      if (!isLibrarian) {
        return { success: false, message: 'PIN otorisasi salah. Gunakan PIN Admin (sbth2026 atau 1234).' };
      }
    }

    this.saveBooks([]);
    this.saveBookItems([]);
    this.saveLoans([]);
    localStorage.removeItem(STORAGE_KEYS.WISHLIST);
    localStorage.removeItem(STORAGE_KEYS.WISHLIST_NOTIFICATIONS);

    const actor = librarianName || this.getCurrentLibrarian()?.name || 'Pustakawan SBTH';
    this.addActivityLog({
      category: 'SYSTEM',
      action: 'RESET_DATA_PERCOBAAN',
      actor,
      details: 'Mengosongkan seluruh data buku dummy / percobaan untuk mulai mengisi data katalog riil Perpustakaan SBTH.',
    });

    return { success: true, message: 'Seluruh data dummy percobaan berhasil dibersihkan! Perpustakaan siap diisi koleksi buku riil.' };
  }
}

export const libraryStore = new LibraryStore();
