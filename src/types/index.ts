export type AgeGroup = 'PLAYGROUP' | 'TK_A' | 'TK_B' | 'SEMUA_UMUR';

export type BookStatus = 'AVAILABLE' | 'BORROWED' | 'DAMAGED' | 'LOST' | 'IN_REPAIR' | 'DISPOSED';

export type MemberType = 'STUDENT' | 'TEACHER' | 'CLASSROOM';

export type CategoryId = string;

export type AcquisitionSource =
  | 'BELI_SEKOLAH'
  | 'SUMBANGAN_ORTU'
  | 'HIBAH_DINAS'
  | 'LAINNYA'
  | 'SUMBANGAN'
  | 'HIBAH'
  // Legacy aliases
  | 'BELI'
  | 'HIBAH_ORTU'
  | 'BOS'
  | 'YAYASAN';

export interface Category {
  id: CategoryId;
  name: string;
  shortName: string;
  colorHex: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  iconName: string;
  shelfLocation: string;
  description: string;
  shelfCode?: string; // Kode Rak Punggung SBTH (Default "SR", atau "AG", "SN", dll.)
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  publicationYear: number | string;
  categoryId: CategoryId;
  ageGroup: AgeGroup;
  synopsis: string;
  coverImage: string;
  shelfLocation?: string; // e.g. "Rak A (Dongeng) - Baris 2"
  callNumber?: string;    // Nomor Panggil SLiMS (e.g. "398.2 PUS d")
  classification?: string; // Klasifikasi DDC Baris 2 (e.g. "813", "220", "398.2")
  shelfCode?: string;      // Kode Rak Punggung Baris 1 (e.g. "SR", "AG", "CR", "SN")
  authorCode?: string;     // Kode 3 Huruf Pengarang Baris 3 (e.g. "JUL", "KID")
  titleCode?: string;      // Kode 1 Huruf Depan Judul Baris 4 (e.g. "T", "m")
  priceValue?: number;     // Estimasi nilai buku (Rp)
  assetValue?: number;     // Estimasi nilai buku / nilai aset (Rp)
  acquisitionSource?: AcquisitionSource;
  donorName?: string;      // Nama penyumbang jika hibah/donasi
  pageCount?: number;      // Jumlah halaman buku (opsional)
  bookLanguage?: 'id' | 'en' | 'zh' | 'bilingual' | string; // Bahasa buku (ID, EN, ZH, Bilingual)
  physicalFormat?: 'CERITA_BERGAMBAR' | 'BOARDBOOK' | 'POP_UP' | 'HARDCOVER' | 'KOMIK_EDUKASI' | string; // Format fisik buku TK
  totalLoanCount?: number; // Total kali buku pernah dipinjam
  createdAt: string;
}

export interface BookItem {
  id: string;
  bookId: string;
  itemBarcode: string; // e.g. "SBTH-B-00101"
  copyNumber: number;  // 1, 2, 3...
  status: BookStatus;
  conditionNote: string;
  disposalReason?: string; // Catatan berita acara pemusnahan
  disposedAt?: string;     // YYYY-MM-DD
  disposedBy?: string;     // Nama Pustakawan yang memusnahkan
  acquisitionDate: string; // YYYY-MM-DD
  createdAt?: string;      // YYYY-MM-DD
  source: AcquisitionSource;
  acquisitionSource?: AcquisitionSource;
  donorName?: string;      // e.g. "Orang Tua Ananda Budi - TK A"
  priceValue?: number;     // Estimasi nilai buku (Rp) - mendukung 0
  shelfLocation?: string;  // Lokasi fisik di rak (disimpan di sistem agar tidak perlu reprint label)
  labelPrinted?: boolean;  // Status apakah label stiker sudah dicetak & ditempel di fisik buku
  isReplaced?: boolean;    // True jika buku rusak lalu diganti baru (kode barcode tetap sama)
  replacementDate?: string;
  replacementNote?: string;
  statusUpdatedAt?: string;
}

export type GradeLevel = 'TODDLER' | 'NURSERY' | 'TK_A' | 'TK_B' | 'TEACHER' | 'ALUMNI';

export type MemberStatus = 'ACTIVE' | 'GRADUATED' | 'INACTIVE';

export type Language = 'id' | 'en' | 'zh';

export type FontSize = 'normal' | 'large' | 'xlarge';

export interface Member {
  id: string;
  memberCode: string; // e.g. "SBTH-M-0015" or "SBTH-C-TKA1"
  name: string;
  type: MemberType;
  classGroup: string; // e.g. "TK-A 1" or "Toddler B" or "Guru Kelas"
  gradeLevel?: GradeLevel;
  classLetter?: string; // "A", "B", "C", "D"
  academicYear?: string; // e.g. "2025/2026" (Angkatan wajib)
  status?: MemberStatus; // 'ACTIVE' (default) | 'GRADUATED' (Alumni TK-B) | 'INACTIVE'
  photoUrl: string;
  parentPhone?: string;
  parentName?: string;
  maxLoanLimit: number; // Siswa: 2-3, Guru: 10, Pojok Baca: 15
  username?: string; // Akun login mandiri siswa/ortu/guru
  password?: string; // Password login mandiri
}

export interface LoanItem {
  id: string;
  loanId: string;
  bookItemId: string;
  itemBarcode: string;
  bookTitle: string;
  returnDate: string | null;
  returnCondition?: 'GOOD' | 'DAMAGED' | 'LOST' | null;
  notes?: string;
}

export interface Loan {
  id: string;
  memberId: string;
  loanDate: string; // YYYY-MM-DD
  dueDate: string;  // YYYY-MM-DD
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
  handledBy: string;
  notes?: string;
  items: LoanItem[];
  renewalCount?: number;   // Berapa kali pinjaman ini sudah diperpanjang (default: 0)
  lastRenewedAt?: string;  // YYYY-MM-DD
}

export type FineType = 'DENDA_TERLAMBAT' | 'GANTI_RUSAK' | 'GANTI_HILANG' | 'SUMBANGAN_TUNAI';
export type FinePaymentStatus = 'UNPAID' | 'PAID' | 'WAIVED';

export interface FineAndDonation {
  id: string;
  loanItemId?: string;
  memberId: string;
  type: FineType;
  amount: number;
  replacementBookItemId?: string;
  paidStatus: FinePaymentStatus;
  paidAt?: string; // YYYY-MM-DD
  createdAt: string;
  notes?: string;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
  autoWeekly: boolean;
  autoMonthly: boolean;
  googleSheetsUrl?: string;
  lastBackupAt?: string;
  lastStatus?: string;
}

export interface BackupLog {
  id: string;
  timestamp: string;
  type: 'TELEGRAM' | 'LOCAL' | 'GOOGLE_SHEETS';
  status: 'SUCCESS' | 'FAILED';
  fileSize?: string;
  message?: string;
  fileName?: string;
  details?: string;
}

export interface WishlistNotification {
  id: string;
  bookId: string;
  bookTitle: string;
  itemBarcode: string;
  returnedAt: string;
  read: boolean;
}

export type PrintTemplateType = 'TJ_103' | 'SPINE_SBTH' | 'SLIP_DALAM_SBTH' | 'THERMAL_33x15' | 'THERMAL_40x30';

export type StaffRole = 'ADMIN' | 'LIBRARIAN';

export interface Librarian {
  id: string;
  name: string;
  username: string;
  role: StaffRole;
  pin: string;
  phone?: string;
  createdAt: string;
}

export interface SchoolProfile {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  instagram?: string;
  facebook?: string;
  logoUrl: string;
  headmasterName?: string; // Nama Kepala Sekolah (Editable)
  headmasterNip?: string;  // NIP / NUPTK Kepala Sekolah
  librarianName?: string;   // Nama Pustakawan / Penanggung Jawab
  librarianNip?: string;    // NIP / ID Pustakawan
  enableFinanceModule?: boolean; // Toggle aktif/nonaktif fitur kas & denda (Termasuk QRIS)
  lastStockOpnameDate?: string;  // e.g. "2026-10-15"
  lastStockOpnameSummary?: string;
}

export type ActivityLogCategory =
  | 'CIRCULATION'
  | 'CATALOG'
  | 'AUTH'
  | 'FINANCE'
  | 'SYSTEM'
  | 'STOCK_OPNAME';

export interface ActivityLogEntry {
  id: string;
  timestamp: string; // ISO String
  category: ActivityLogCategory;
  action: string;    // e.g. 'PINJAM_BUKU', 'KEMBALI_BUKU', 'TAMBAH_BUKU', 'EDIT_BUKU', 'LOGIN_PUSTAKAWAN'
  actor: string;     // e.g. 'Pustakawan' or 'Siswa Rafa'
  targetTitle?: string;
  targetBarcode?: string;
  targetMember?: string;
  details: string;
}

export interface ShelfLocationItem {
  id: string;
  code: string;         // e.g. "Rak A"
  name: string;         // e.g. "Dongeng & Cerita Bergambar"
  categoryName?: string;// alias for name
  colorHex: string;     // e.g. "#F59E0B"
  colorName: string;    // e.g. "Kuning"
  rowStructure: string; // e.g. "Baris 1 (Atas) s/d Baris 4 (Bawah)"
  capacity?: number;
  description?: string;
}

export interface WhatsAppReminderTemplate {
  id: string;
  title: string;
  type: 'DUE_REMINDER' | 'OVERDUE' | 'NEW_LOAN' | 'RETURN_THANKS' | 'CUSTOM' | 'REMINDER_DUE_DATE' | 'REMINDER_OVERDUE';
  templateText: string;
  template?: string; // alias for templateText
}

export type ReminderDay = 'EVERYDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
export type ReminderChannel = 'TELEGRAM' | 'WHATSAPP' | 'BOTH';

export interface ReminderSchedule {
  enabled: boolean;
  dayOfWeek: ReminderDay;
  timeStr: string; // e.g. "14:30"
  targetChannel: ReminderChannel;
  reportType: 'ALL' | 'WEEKLY_REPORT' | 'OVERDUE_ONLY';
  lastRunAt?: string;
}

export interface MemberTypeRule {
  memberType: MemberType;
  label: string;
  maxBooks: number;
  loanDurationDays: number;
  maxRenewals: number;
}

export interface Reservation {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor?: string;
  coverImage?: string;
  memberId: string;
  memberName: string;
  memberClass: string;
  parentPhone?: string;
  requestDate: string; // YYYY-MM-DD HH:mm
  expiryDate: string;  // YYYY-MM-DD HH:mm (e.g. 24 jam setelah buku ready / dibuat)
  desiredPickupDate?: string; // YYYY-MM-DD (Tanggal rencana siswa/wali mengambil buku)
  status: 'PENDING' | 'READY_FOR_PICKUP' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED';
  notifiedAt?: string;
  handledBy?: string;
  notes?: string;
}

export interface LibraryNewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'ANNOUNCEMENT' | 'EVENT' | 'HOLIDAY' | 'STOCK_OPNAME' | 'NEW_BOOKS';
  badgeText: string;
  publishedDate: string; // YYYY-MM-DD
  isPinned: boolean;
  isActive: boolean;
  author: string;
}

export interface SlimsPatternConfig {
  patternMode: 'SBTH' | 'SBTH_4DIGIT' | 'SLIMS_STANDARD' | 'CATEGORY_BASED' | 'CUSTOM';
  prefix: string; // e.g. "SBTH-B-" or "" or "B" or "DNG-"
  serialLength: number; // e.g. 4 or 5
  suffix: string; // e.g. "" or "/P/2026"
  nextNumber: number; // e.g. 143
}

export interface LoanRules {
  finePerDay: number; // default: 500 (Rp per hari per buku)
  loanDurationDays: number; // default: 7 hari (Siswa)
  maxBooksLimit: number; // default: 2 buku (Siswa)
  maxRenewals: number; // default: 1x perpanjangan
  renewalDurationDays: number; // default: 7 hari
  allowedDurations: number[]; // e.g. [3, 7, 14, 30]
  reservationExpiryHours: number; // default: 24 (jam)
  memberTypeRules: MemberTypeRule[];
  reminderDayBefore: number; // default: 1 (artinya dikirim di hari ke-6 untuk durasi 7 hari)
  reminderTimeStr: string; // default: "09:00"
  finesPurpose: string; // Tujuan kas/denda
  qrisMerchantName: string; // Nama merchant di QRIS
  qrisNmid: string; // National Merchant ID
  qrisImageUrl: string; // URL gambar QRIS
  enableFinanceModule?: boolean; // Toggle kas & denda (bisa di ON/OFF)
  maxReservationsTotal?: number; // Maksimal kuota reservasi total (default: 2)
  maxReservationsWhenBorrowing?: number; // Maksimal kuota reservasi jika sedang meminjam buku (default: 1)
  lastStockOpnameDate?: string;
  lastStockOpnameSummary?: string;
}

export interface KeyboardShortcutItem {
  id: string;
  label: string;
  key: string;
  ctrlKey: boolean;
  description: string;
  action:
    | 'NAV_BORROW'
    | 'NAV_RETURN'
    | 'NAV_BOOKS'
    | 'NAV_EXTEND'
    | 'NAV_MEMBERS'
    | 'NAV_OPAC'
    | 'OPEN_SETTINGS'
    | 'HELP_SHORTCUTS';
}

export interface KeyboardShortcutConfig {
  newLoan?: string;
  returnBook?: string;
  renewLoan?: string;
  overdueTab?: string;
  booksTab?: string;
  membersTab?: string;
  opacTab?: string;
  settingsModal?: string;
  helpModal?: string;
}

export interface StockOpnameRecord {
  id: string;
  date: string;
  auditDate?: string; // YYYY-MM-DD
  auditedBy: string;
  totalBooksAudited: number;
  matchedCount: number;
  missingCount: number;
  damagedCount?: number;
  totalExpected?: number;
  totalVerified?: number;
  totalMissing?: number;
  notes?: string;
  itemsAudited?: {
    barcode: string;
    title: string;
    shelf: string;
    verified: boolean;
    status: BookStatus;
  }[];
  details?: {
    itemBarcode: string;
    bookTitle: string;
    shelfLocation?: string;
    status: 'FOUND' | 'MISSING' | 'DAMAGED';
    notes?: string;
  }[];
}

export interface TelegramCommandTemplate {
  command: string; // e.g. '/rekap_hari_ini'
  title: string;
  description: string;
  template: string;
}

export type AppMode = 'KIOSK_ANAK' | 'PUSTAKAWAN' | 'PORTAL_SISWA';

export interface LibraryAnalytics {
  totalTitles: number;
  totalCopies: number;
  totalAssetValue: number;
  totalAvailable: number;
  totalBorrowed: number;
  totalDamagedOrLost: number;
  totalBought: number;
  totalDonated: number;
  activeLoansCount: number;
  totalLoansAllTime: number;
  mostBorrowedBooks: { book: Book; borrowCount: number; lastBorrowed?: string }[];
  rarelyBorrowedBooks: { book: Book; borrowCount: number; copies: number }[];
  topPublishers: { name: string; titleCount: number; borrowCount: number; percentage: number }[];
  topAuthors: { name: string; titleCount: number; borrowCount: number }[];
  categoryStats: { id: string; name: string; colorHex: string; titleCount: number; copyCount: number; borrowCount: number; assetValue: number }[];
  yearDistribution: { year: string; count: number }[];
  actionableInsights: { type: 'success' | 'warning' | 'info'; title: string; desc: string }[];
}

