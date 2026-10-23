import { Language } from '@/types';

export interface Translations {
  // Navigation & Headers
  appTitle: string;
  tagline: string;
  kioskMode: string;
  librarianMode: string;
  librarian: string;
  studentPortal: string;
  newArrivals: string;
  newArrivalsSub: string;
  catalog: string;
  circulation: string;
  members: string;
  labels: string;
  analytics: string;
  excel: string;
  cashFines: string;
  telegram: string;
  settings: string;
  scannerReady: string;
  camera: string;
  searchBooksPlaceholder: string;
  allCategories: string;
  allAges: string;
  statusAvailable: string;
  statusBorrowed: string;
  statusInRepair: string;
  bookDetail: string;
  borrowNow: string;
  addToWishlist: string;
  wishlistAdded: string;
  synopsis: string;
  copiesCount: string;
  shelfLocation: string;
  publisher: string;
  author: string;
  year: string;

  // Sidebar & Layout Extra
  mainNav: string;
  modulesTools: string;
  displaySettings: string;
  fontSizeLabel: string;
  fontSizeNormal: string;
  fontSizeLarge: string;
  fontSizeXLarge: string;
  printSpineLabels: string;
  excelModule: string;
  whatsAppCenter: string;
  collectionAnalytics: string;
  telegramBackup: string;
  auditHistory: string;
  digitalLibrarySystem: string;
  developerProfile: string;
  resetDemoData: string;
  testScan: string;
  quickScanSim: string;
  themeToggleLight: string;
  themeToggleDark: string;
  soundOn: string;
  soundOff: string;
  keyboardShortcuts: string;
  systemSettings: string;
  studentModeKiosk: string;
  offlineStatus: string;

  // Circulation Workflow
  circulationTitle: string;
  circulationSubtitle: string;
  newLoan: string;
  expressReturn: string;
  renewLoan: string;
  overdueAndFines: string;
  checkHistory: string;
  step1SelectMember: string;
  step1SelectMemberShort: string;
  step1Sub: string;
  searchMemberPlaceholder: string;
  changeStudent: string;
  parentContact: string;
  readingCorner: string;
  step2ScanBook: string;
  step2ScanBookShort: string;
  cartLabel: string;
  booksUnit: string;
  scanBookPlaceholder: string;
  addBtn: string;
  emptyCartTitle: string;
  emptyCartDesc: string;
  loanDurationLabel: string;
  duration3Days: string;
  duration7Days: string;
  duration14Days: string;
  duration30Days: string;
  confirmLoan: string;

  // Book & Collection Management
  booksTab: string;
  smartBarcodeRouter: string;
  smartBarcodeRouterDesc: string;
  testMode: string;
  booksHeaderTitle: string;
  booksHeaderSubtitle: string;
  addBookScanIsbn: string;
  printLabelsBtn: string;
  searchBiblioPlaceholder: string;
  sortNewest: string;
  sortTitle: string;
  sortCopies: string;
  shelfGuide: string;
  editBook: string;
  filterLabelStatus: string;
  allLabels: string;
  labelNotPrinted: string;
  labelPrinted: string;
  activeCatalogTab: string;
  unprintedTab: string;
  disposedTab: string;
  unprintedBanner: string;
  printMissingBtn: string;
  shelfSettingToggle: string;
  ddcCategoriesLabel: string;
  scroll1Line: string;
  wrapView: string;
  statusFilterLabel: string;
  statusAll: string;
  statusAvailableRack: string;
  statusBorrowedTag: string;
  statusRepairTag: string;
  statusLostTag: string;
  statusDisposedTag: string;
  colBookTitle: string;
  colCategory: string;
  colIsbnCopies: string;
  colCondition: string;
  colAssetValue: string;
  colActions: string;
  inputted: string;
  spineLabel: string;
  copiesShort: string;
  unprintedShort: string;
  affixedShort: string;
  availableShort: string;
  borrowedShort: string;
  repairShort: string;
  showingBooksPagination: string;
  showPerPage: string;
  perPageUnit: string;
  selectAll: string;
  syncSpinesBtn: string;
  backToTop: string;
  stockOpnameBtn: string;
  exportSlimsBtn: string;

  // Member & Grade Levels
  gradeToddler: string;
  gradeNursery: string;
  gradeTkA: string;
  gradeTkB: string;
  gradeTeacher: string;
  gradeAlumni: string;
  academicYear: string;
  academicYearTransition: string;
  academicYearPromotionDesc: string;
  studentActive: string;
  studentGraduated: string;
  studentName: string;
  parentPhone: string;
  classGroup: string;
  teacherQuotaNote: string;

  // Hero & Kid Sections & OPAC
  heroTitle: string;
  heroSubtitle: string;
  searchBtn: string;
  chipAnimals: string;
  chipDinos: string;
  chipBedtime: string;
  chipLearn: string;
  mostBorrowed: string;
  agePicks: string;
  exploreAll: string;
  comingSoon: string;
  statTotalCollection: string;
  statTitles: string;
  statAvailable: string;
  statBooksUnit: string;
  statBorrowed: string;
  statActiveMembers: string;
  statStudentsTeachers: string;
  pinnedAnnouncement: string;
  officialAnnouncement: string;
  readInfo: string;
  categoryFilterQuick: string;
  hide: string;
  allShelves: string;
  mostFavorite: string;
  ageAppropriate: string;
  exploreAllSubtitle: string;
  sortRecentlyAdded: string;
  sortTitleAZ: string;
  sortTitleZA: string;
  sortMostBorrowed: string;
  sortYearNewest: string;
  sortMostPages: string;
  viewGrid: string;
  viewList: string;
  showingCountOfBooks: string;
  filterLabel: string;
  filterAll: string;
  filterFreqBorrowed: string;
  filterRareBorrowed: string;
  filterWishlist: string;
  filterAllYears: string;
  filterAllAgesClasses: string;
  footerTotalShowing: string;
  backToCatalogTop: string;

  // DDC 10 Main Classes
  ddc000: string;
  ddc100: string;
  ddc200: string;
  ddc300: string;
  ddc400: string;
  ddc500: string;
  ddc600: string;
  ddc700: string;
  ddc800: string;
  ddc900: string;

  // General Buttons
  close: string;
  save: string;
  cancel: string;
  delete: string;
  filter: string;
  reset: string;
  exportXlsx: string;
  print: string;
  quickAdd: string;
  developerCredit: string;
  developerHelp: string;
}

export const DICTIONARY: Record<Language, Translations> = {
  id: {
    appTitle: 'KB-TK Bhakti Tunas Harapan (SBTH)',
    tagline: 'Be Smart, Be Kind • 好好学习，天天向上',
    kioskMode: 'Mode Kiosk Anak',
    librarianMode: 'Meja Pustakawan',
    librarian: 'Pustakawan',
    studentPortal: 'Portal Siswa & Buku Impian',
    newArrivals: 'Koleksi Buku Baru',
    newArrivalsSub: 'Buku-buku cerita terbaru yang baru saja tiba di perpustakaan SBTH',
    catalog: 'Katalog Visual Anak',
    circulation: 'Sirkulasi & Pinjam-Kembali',
    members: 'Data Anggota & Kelas',
    labels: 'Cetak Label Barcode',
    analytics: 'Analitik & Nilai Aset',
    excel: 'Excel Impor/Ekspor',
    cashFines: 'Kas Denda & QRIS',
    telegram: 'Telegram Bot & Backup',
    settings: 'Pengaturan',
    scannerReady: 'Scanner USB Siap',
    camera: 'Scan Kamera',
    searchBooksPlaceholder: 'Cari judul cerita, nama hewan, dinosaurus, atau pengarang...',
    allCategories: 'Semua Kategori Rak',
    allAges: 'Semua Tingkat Usia',
    statusAvailable: 'Tersedia di Rak',
    statusBorrowed: 'Sedang Dipinjam',
    statusInRepair: 'Dalam Perbaikan',
    bookDetail: 'Detail & Sinopsis Buku',
    borrowNow: 'Pinjam Buku Ini',
    addToWishlist: 'Simpan ke Buku Impianku',
    wishlistAdded: 'Tersimpan di Impianku',
    synopsis: 'Sinopsis / Ringkasan Cerita',
    copiesCount: 'Jumlah Eksemplar Fisik',
    shelfLocation: 'Posisi Rak',
    publisher: 'Penerbit',
    author: 'Pengarang / Ilustrator',
    year: 'Tahun Terbit',

    // Sidebar & Layout Extra
    mainNav: 'Navigasi Utama',
    modulesTools: 'Modul & Alat',
    displaySettings: 'Pengaturan Tampilan',
    fontSizeLabel: 'Ukuran Font:',
    fontSizeNormal: 'Normal (16px)',
    fontSizeLarge: 'Besar (18px)',
    fontSizeXLarge: 'Ekstra (20px)',
    printSpineLabels: 'Cetak Label Barcode',
    excelModule: 'Modul Excel Data',
    whatsAppCenter: 'WhatsApp Center',
    collectionAnalytics: 'Analitik Koleksi',
    telegramBackup: 'Telegram & Backup',
    auditHistory: 'Audit & Riwayat',
    digitalLibrarySystem: 'Sistem Informasi Perpustakaan Digital',
    developerProfile: 'Profil Pengembang',
    resetDemoData: 'Reset Data Demo',
    testScan: 'Tes Scan',
    quickScanSim: 'Simulasi Scan Cepat:',
    themeToggleLight: 'Ganti ke Mode Terang',
    themeToggleDark: 'Ganti ke Mode Gelap',
    soundOn: 'Suara Feedback Aktif',
    soundOff: 'Suara Dimatikan',
    keyboardShortcuts: 'Panduan Pintasan Keyboard Pustakawan (F1)',
    systemSettings: 'Pengaturan Sistem & Profil Sekolah',
    studentModeKiosk: 'Mode Siswa (Kiosk)',
    offlineStatus: '● Offline 100%',

    // Circulation Workflow
    circulationTitle: 'Sirkulasi & Pinjam-Kembali',
    circulationSubtitle: 'Alur cepat scan barcode untuk peminjaman, pengembalian kilat, dan tagihan buku terlambat',
    newLoan: 'Peminjaman Baru',
    expressReturn: 'Pengembalian Kilat',
    renewLoan: 'Perpanjangan Pinjam',
    overdueAndFines: 'Buku Terlambat & Denda',
    checkHistory: 'Cek Riwayat Buku',
    step1SelectMember: 'Pilih Siswa / Anggota',
    step1SelectMemberShort: 'Pilih Siswa',
    step1Sub: 'Scan kartu / cari nama',
    searchMemberPlaceholder: 'Cari nama siswa, username, atau kelas...',
    changeStudent: 'Ganti Siswa',
    parentContact: 'Wali / Kontak:',
    readingCorner: 'Pojok Baca:',
    step2ScanBook: 'Scan Barcode Buku',
    step2ScanBookShort: 'Scan Buku',
    cartLabel: 'Keranjang',
    booksUnit: 'Buku',
    scanBookPlaceholder: 'Scan atau ketik barcode slip buku (misal: 0143 atau SBTH-B-00101)...',
    addBtn: 'Tambah',
    emptyCartTitle: 'Belum ada buku di keranjang peminjaman',
    emptyCartDesc: 'Arahkan USB Barcode Scanner ke stiker barcode 4-digit di slip dalam buku (atau ketik nomor daftar)',
    loanDurationLabel: 'Durasi Pinjam:',
    duration3Days: '⚡ 3 Hari (Pinjaman Kilat)',
    duration7Days: '📅 1 Minggu (7 Hari - Siswa Standar)',
    duration14Days: '📚 2 Minggu (14 Hari - Guru / Tugas)',
    duration30Days: '🏫 1 Bulan (30 Hari - Pojok Baca Kelas)',
    confirmLoan: 'Konfirmasi Peminjaman',

    // Book Management
    booksTab: 'Koleksi & Eksemplar',
    smartBarcodeRouter: 'Smart Barcode Router Aktif',
    smartBarcodeRouterDesc: '• Scanner USB otomatis siap deteksi ISBN, buku fisik & kartu siswa',
    testMode: 'Mode Uji',
    booksHeaderTitle: 'Koleksi & Eksemplar Fisik',
    booksHeaderSubtitle: 'Manajemen katalog judul buku (Biblio) dan inventaris eksemplar fisik (Barcode unik SBTH)',
    addBookScanIsbn: 'Input Buku (Scan ISBN)',
    printLabelsBtn: 'Cetak Label',
    searchBiblioPlaceholder: 'Cari judul buku, nama pengarang, atau nomor ISBN...',
    sortNewest: 'Terbaru',
    sortTitle: 'Judul A-Z',
    sortCopies: 'Paling Banyak Eksemplar',
    shelfGuide: 'Panduan & Template Rak',
    editBook: 'Edit Buku & Eksemplar',
    filterLabelStatus: 'Status Label Stiker',
    allLabels: 'Semua Label',
    labelNotPrinted: 'Belum Dicetak Label / Belum Ditempel',
    labelPrinted: 'Sudah Ditempel Label',
    activeCatalogTab: 'Katalog Koleksi Aktif',
    unprintedTab: 'Belum Cetak Label',
    disposedTab: 'Pemusnahan Buku / Afkir',
    unprintedBanner: 'Perhatian: Terdapat {count} eksemplar buku yang belum dicetak atau belum ditempel stiker barcode fisik!',
    printMissingBtn: 'Cetak Label Sekarang',
    shelfSettingToggle: 'Setting Rak:',
    ddcCategoriesLabel: 'KATEGORI E-DDC DEWEY DECIMAL:',
    scroll1Line: 'Mode 1 Baris Geser',
    wrapView: 'Tampilkan Semua (Wrap)',
    statusFilterLabel: 'Filter Status:',
    statusAll: 'Semua Status',
    statusAvailableRack: 'Tersedia di Rak',
    statusBorrowedTag: 'Sedang Dipinjam',
    statusRepairTag: 'Perbaikan / Rusak',
    statusLostTag: 'Buku Hilang',
    statusDisposedTag: 'Dimusnahkan',
    colBookTitle: 'NO & JUDUL BUKU',
    colCategory: 'KATEGORI',
    colIsbnCopies: 'ISBN & EKSEMPLAR',
    colCondition: 'KONDISI / STATUS',
    colAssetValue: 'NILAI ASET',
    colActions: 'AKSI',
    inputted: 'Diinput:',
    spineLabel: 'PUNGGUNG:',
    copiesShort: 'Eks',
    unprintedShort: 'Belum',
    affixedShort: 'Dicap',
    availableShort: 'Ada',
    borrowedShort: 'Pinjam',
    repairShort: 'Rusak',
    showingBooksPagination: 'Menampilkan {start}–{end} dari {total} Judul Buku',
    showPerPage: 'Tampilkan:',
    perPageUnit: 'per hal',
    selectAll: 'Pilih Semua',
    syncSpinesBtn: 'Sinkronkan Punggung Koleksi',
    backToTop: 'Kembali ke Atas',
    stockOpnameBtn: 'Stock Opname',
    exportSlimsBtn: 'Ekspor SLiMS',

    gradeToddler: 'Toddler (Kelompok Bermain Kecil)',
    gradeNursery: 'Nursery (Kelompok Bermain)',
    gradeTkA: 'TK-A',
    gradeTkB: 'TK-B',
    gradeTeacher: 'Guru & Tenaga Pendidik',
    gradeAlumni: 'Alumni / Sudah Lulus',
    academicYear: 'Angkatan / Tahun Ajaran',
    academicYearTransition: 'Transisi Tahun Ajaran Baru & Naik Kelas Massal',
    academicYearPromotionDesc: 'Roll-over otomatis: Toddler ke Nursery, Nursery ke TK-A, TK-A ke TK-B, dan TK-B Lulus menjadi Alumni tanpa menghapus riwayat.',
    studentActive: 'Siswa Aktif',
    studentGraduated: 'Alumni (Lulus)',
    studentName: 'Nama Lengkap Siswa / Guru',
    parentPhone: 'No. WhatsApp Ortu / Guru',
    classGroup: 'Kelas / Rombel',
    teacherQuotaNote: 'Guru & Tenaga Pendidik dapat meminjam hingga 10 buku untuk keperluan mengajar di kelas (durasi 14 hari).',
    heroTitle: 'Ayo Cari & Pilih Buku Cerita Kesukaanmu Dari Rumah! 🌈📚',
    heroSubtitle: 'Ayah, Bunda & Ananda bisa mengecek ketersediaan buku di rak perpustakaan sebelum dipinjam teman lain.',
    searchBtn: 'Cari Buku',
    chipAnimals: '🦒 Hewan',
    chipDinos: '🦖 Dinosaurus',
    chipBedtime: '🌙 Dongeng Tidur',
    chipLearn: '🔤 Belajar Huruf',
    mostBorrowed: 'Paling Sering Dipinjam',
    agePicks: 'Pilihan Sesuai Usia',
    exploreAll: 'Jelajahi Semua Koleksi Buku',
    comingSoon: 'Segera Hadir',

    statTotalCollection: 'Total Koleksi',
    statTitles: 'Judul',
    statAvailable: 'Tersedia di Rak',
    statBooksUnit: 'Buku',
    statBorrowed: 'Sedang Dipinjam',
    statActiveMembers: 'Anggota Aktif',
    statStudentsTeachers: 'Siswa & Guru',
    pinnedAnnouncement: 'DISEMATKAN',
    officialAnnouncement: 'PENGUMUMAN RESMI',
    readInfo: 'Baca Info',
    categoryFilterQuick: 'Kategori Rak Buku (Filter Cepat):',
    hide: 'Sembunyikan',
    allShelves: 'Semua Rak',
    mostFavorite: 'Paling Favorit 🔥',
    ageAppropriate: 'Sesuai Usia 👶',
    exploreAllSubtitle: 'Pilih filter dan temukan buku cerita kesukaan dari seluruh koleksi',
    sortRecentlyAdded: 'Terbaru Ditambahkan',
    sortTitleAZ: 'Judul A - Z',
    sortTitleZA: 'Judul Z - A',
    sortMostBorrowed: 'Paling Sering Dipinjam 🔥',
    sortYearNewest: 'Tahun Terbit (Terbaru)',
    sortMostPages: 'Halaman Terbanyak',
    viewGrid: 'Grid',
    viewList: 'Daftar List',
    showingCountOfBooks: 'Menampilkan {count} dari {total} buku',
    filterLabel: 'Filter:',
    filterAll: 'Semua',
    filterFreqBorrowed: 'Sering Dipinjam',
    filterRareBorrowed: 'Jarang Dipinjam',
    filterWishlist: 'Buku Impianku',
    filterAllYears: 'Semua Tahun',
    filterAllAgesClasses: 'Semua Usia / Kelas',
    footerTotalShowing: 'Menampilkan {count} judul buku dari total {total} koleksi perpustakaan SBTH.',
    backToCatalogTop: 'Kembali ke Puncak Katalog ⬆️',

    ddc000: '000 Karya Umum, Komputer & Ensiklopedia',
    ddc100: '100 Filsafat, Karakter & Budi Pekerti',
    ddc200: '200 Agama, Doa & Nilai Religi',
    ddc300: '300 Ilmu Sosial, Kebiasaan & Cerita Rakyat',
    ddc400: '400 Bahasa, Fonik, Mandarin & Inggris',
    ddc500: '500 Sains Murni, Alam, Satwa & Berhitung',
    ddc600: '600 Teknologi, Kesehatan Tubuh & Rekayasa',
    ddc700: '700 Kesenian, Mewarnai, Musik & Olahraga',
    ddc800: '800 Kesusastraan, Cerita Bergambar & Fabel',
    ddc900: '900 Sejarah, Geografi, Pahlawan & Peta',

    close: 'Tutup',
    save: 'Simpan Data',
    cancel: 'Batal',
    delete: 'Hapus',
    filter: 'Saring',
    reset: 'Reset Filter',
    exportXlsx: 'Ekspor (.xlsx)',
    print: 'Cetak Sekarang',
    quickAdd: 'Tambah Eksemplar Cepat',
    developerCredit: 'Dikembangkan untuk KB-TK Bhakti Tunas Harapan Magelang oleh Prasetyo Handy Kurniawan',
    developerHelp: 'Bantuan Pengembang & Kontak Teknis',
  },
  en: {
    appTitle: 'KB-TK Bhakti Tunas Harapan (SBTH)',
    tagline: 'Be Smart, Be Kind • 好好学习，天天向上',
    kioskMode: 'Kids Kiosk Mode',
    librarianMode: 'Librarian Desk',
    librarian: 'Librarian',
    studentPortal: 'Student Portal & Dream Books',
    newArrivals: 'New Arrivals',
    newArrivalsSub: 'Fresh new picture and story books just added to SBTH Library',
    catalog: 'Visual Catalog',
    circulation: 'Circulation & Desk',
    members: 'Members & Classrooms',
    labels: 'Print Spine Labels',
    analytics: 'Analytics & Asset Value',
    excel: 'Excel Import / Export',
    cashFines: 'Fines & QRIS System',
    telegram: 'Telegram Bot & Backup',
    settings: 'Settings',
    scannerReady: 'USB Scanner Ready',
    camera: 'Camera Scanner',
    searchBooksPlaceholder: 'Search stories, animals, dinosaurs, or authors...',
    allCategories: 'All Categories',
    allAges: 'All Age Groups',
    statusAvailable: 'Available on Shelf',
    statusBorrowed: 'Currently Borrowed',
    statusInRepair: 'Under Repair',
    bookDetail: 'Book Details & Synopsis',
    borrowNow: 'Borrow This Book',
    addToWishlist: 'Add to My Dream Books',
    wishlistAdded: 'Saved in Wishlist',
    synopsis: 'Synopsis / Story Summary',
    copiesCount: 'Physical Copies Count',
    shelfLocation: 'Shelf Location',
    publisher: 'Publisher',
    author: 'Author / Illustrator',
    year: 'Publication Year',

    // Sidebar & Layout Extra
    mainNav: 'MAIN NAVIGATION',
    modulesTools: 'MODULES & TOOLS',
    displaySettings: 'DISPLAY SETTINGS',
    fontSizeLabel: 'Font Size:',
    fontSizeNormal: 'Normal (16px)',
    fontSizeLarge: 'Large (18px)',
    fontSizeXLarge: 'Extra (20px)',
    printSpineLabels: 'Print Barcode Labels',
    excelModule: 'Excel Data Module',
    whatsAppCenter: 'WhatsApp Center',
    collectionAnalytics: 'Collection Analytics',
    telegramBackup: 'Telegram & Backup',
    auditHistory: 'Audit & History',
    digitalLibrarySystem: 'Digital Library Information System',
    developerProfile: 'Developer Profile',
    resetDemoData: 'Reset Demo Data',
    testScan: 'Test Scan',
    quickScanSim: 'Quick Scan Simulation:',
    themeToggleLight: 'Switch to Light Mode',
    themeToggleDark: 'Switch to Dark Mode',
    soundOn: 'Sound FX On',
    soundOff: 'Sound FX Muted',
    keyboardShortcuts: 'Librarian Keyboard Shortcuts (F1)',
    systemSettings: 'System Settings & School Profile',
    studentModeKiosk: 'Student Mode (Kiosk)',
    offlineStatus: '● 100% Offline',

    // Circulation Workflow
    circulationTitle: 'Circulation & Borrow-Return',
    circulationSubtitle: 'Quick barcode scanning workflow for lending, express returns, and overdue book fines',
    newLoan: 'New Loan',
    expressReturn: 'Express Return',
    renewLoan: 'Renew Loan',
    overdueAndFines: 'Overdue Books & Fines',
    checkHistory: 'Check Book History',
    step1SelectMember: 'Select Student / Member',
    step1SelectMemberShort: 'Select Student',
    step1Sub: 'Scan card / search name',
    searchMemberPlaceholder: 'Search student name, username, or class...',
    changeStudent: 'Change Student',
    parentContact: 'Parent / Contact:',
    readingCorner: 'Reading Corner:',
    step2ScanBook: 'Scan Book Barcode',
    step2ScanBookShort: 'Scan Book',
    cartLabel: 'Cart',
    booksUnit: 'Books',
    scanBookPlaceholder: 'Scan or type book slip barcode (e.g., 0143 or SBTH-B-00101)...',
    addBtn: 'Add',
    emptyCartTitle: 'No books in the loan cart yet',
    emptyCartDesc: "Point the USB Barcode Scanner to the 4-digit barcode sticker on the book's inner slip (or type the registration number)",
    loanDurationLabel: 'Loan Duration:',
    duration3Days: '⚡ 3 Days (Express Loan)',
    duration7Days: '📅 1 Week (7 Days - Standard Student)',
    duration14Days: '📚 2 Weeks (14 Days - Teacher / Assignment)',
    duration30Days: '🏫 1 Month (30 Days - Class Reading Corner)',
    confirmLoan: 'Confirm Loan',

    // Book Management
    booksTab: 'Book Collections & Copies',
    smartBarcodeRouter: 'Smart Barcode Router Active',
    smartBarcodeRouterDesc: '• USB Scanner automatically ready for ISBN, book barcodes & student cards',
    testMode: 'Test Mode',
    booksHeaderTitle: 'Book Collections & Physical Copies',
    booksHeaderSubtitle: 'Manage bibliographic records (Biblio) and physical inventory copies (SBTH unique barcodes)',
    addBookScanIsbn: 'Add Book (Scan ISBN)',
    printLabelsBtn: 'Print Labels',
    searchBiblioPlaceholder: 'Search by title, author, or ISBN number...',
    sortNewest: 'Newest',
    sortTitle: 'Title A-Z',
    sortCopies: 'Most Copies',
    shelfGuide: 'Shelf Naming Guide',
    editBook: 'Edit Book & Copies',
    filterLabelStatus: 'Label Sticker Status',
    allLabels: 'All Labels',
    labelNotPrinted: 'Unprinted / Not Yet Affixed',
    labelPrinted: 'Label Affixed to Book',
    activeCatalogTab: 'Active Collection Catalog',
    unprintedTab: 'Unprinted Labels',
    disposedTab: 'Book Disposal / Withdrawn',
    unprintedBanner: 'Notice: There are {count} book copies that do not have printed barcode labels affixed yet.',
    printMissingBtn: 'Print Missing Labels',
    shelfSettingToggle: 'Shelf Setting:',
    ddcCategoriesLabel: 'E-DDC DEWEY DECIMAL CATEGORIES:',
    scroll1Line: '1-Line Scroll Mode',
    wrapView: 'Wrap View',
    statusFilterLabel: 'Status Filter:',
    statusAll: 'All Status',
    statusAvailableRack: 'Available on Shelf',
    statusBorrowedTag: 'Currently Borrowed',
    statusRepairTag: 'Under Repair / Damaged',
    statusLostTag: 'Lost Books',
    statusDisposedTag: 'Withdrawn',
    colBookTitle: 'NO & BOOK TITLE',
    colCategory: 'CATEGORY',
    colIsbnCopies: 'ISBN & COPIES',
    colCondition: 'CONDITION / STATUS',
    colAssetValue: 'ASSET VALUE',
    colActions: 'ACTIONS',
    inputted: 'Inputted:',
    spineLabel: 'SPINE:',
    copiesShort: 'Copies',
    unprintedShort: 'Unprinted',
    affixedShort: 'Affixed',
    availableShort: 'Available',
    borrowedShort: 'Borrowed',
    repairShort: 'Damaged',
    showingBooksPagination: 'Showing {start}–{end} of {total} Book Titles',
    showPerPage: 'Show:',
    perPageUnit: 'per page',
    selectAll: 'Select All',
    syncSpinesBtn: 'Sync Collection Spines',
    backToTop: 'Back to Top',
    stockOpnameBtn: 'Stock Opname',
    exportSlimsBtn: 'Export SLiMS',

    gradeToddler: 'Toddler (Playgroup A)',
    gradeNursery: 'Nursery (Playgroup B)',
    gradeTkA: 'Kindergarten A (TK-A)',
    gradeTkB: 'Kindergarten B (TK-B)',
    gradeTeacher: 'Teachers & School Staff',
    gradeAlumni: 'Alumni / Graduated',
    academicYear: 'Academic Cohort / Year',
    academicYearTransition: 'Academic Year Transition & Batch Promotion',
    academicYearPromotionDesc: '1-Click Roll-over: Toddler to Nursery, Nursery to TK-A, TK-A to TK-B, and TK-B graduated to Alumni without deleting history.',
    studentActive: 'Active Student',
    studentGraduated: 'Alumni (Graduated)',
    studentName: 'Full Name (Student / Teacher)',
    parentPhone: 'Parent / Teacher WhatsApp',
    classGroup: 'Classroom Group',
    teacherQuotaNote: 'Teachers and educators may borrow up to 10 books for classroom teaching (14 days loan period).',
    heroTitle: "Let's Find & Pick Your Favorite Storybooks From Home! 🌈📚",
    heroSubtitle: 'Parents & kids can check library book availability before others borrow them.',
    searchBtn: 'Search Book',
    chipAnimals: '🦒 Animals',
    chipDinos: '🦖 Dinosaurs',
    chipBedtime: '🌙 Bedtime Stories',
    chipLearn: '🔤 Alphabet & Phonics',
    mostBorrowed: 'Most Borrowed Books',
    agePicks: 'Picks by Age Group',
    exploreAll: 'Explore All Books',
    comingSoon: 'Coming Soon',

    statTotalCollection: 'Total Collection',
    statTitles: 'Titles',
    statAvailable: 'Available on Shelf',
    statBooksUnit: 'Books',
    statBorrowed: 'Currently Borrowed',
    statActiveMembers: 'Active Members',
    statStudentsTeachers: 'Students & Teachers',
    pinnedAnnouncement: 'PINNED',
    officialAnnouncement: 'OFFICIAL ANNOUNCEMENT',
    readInfo: 'Read Info',
    categoryFilterQuick: 'Bookshelf Categories (Quick Filter):',
    hide: 'Hide',
    allShelves: 'All Shelves',
    mostFavorite: 'Most Favorite 🔥',
    ageAppropriate: 'Age-Appropriate 👶',
    exploreAllSubtitle: 'Select filters and discover favorite storybooks from the entire collection',
    sortRecentlyAdded: 'Recently Added',
    sortTitleAZ: 'Title A - Z',
    sortTitleZA: 'Title Z - A',
    sortMostBorrowed: 'Most Frequently Borrowed 🔥',
    sortYearNewest: 'Publication Year (Newest)',
    sortMostPages: 'Most Pages',
    viewGrid: 'Grid',
    viewList: 'List View',
    showingCountOfBooks: 'Showing {count} of {total} books',
    filterLabel: 'Filter:',
    filterAll: 'All',
    filterFreqBorrowed: 'Frequently Borrowed',
    filterRareBorrowed: 'Rarely Borrowed',
    filterWishlist: 'My Wishlist Books',
    filterAllYears: 'All Years',
    filterAllAgesClasses: 'All Ages / Classes',
    footerTotalShowing: 'Showing {count} book titles out of a total of {total} SBTH library collections.',
    backToCatalogTop: 'Back to Catalog Top ⬆️',

    ddc000: '000 General Works, Computers & Encyclopedia',
    ddc100: '100 Philosophy, Character & Morals',
    ddc200: '200 Religion, Prayers & Religious Values',
    ddc300: '300 Social Sciences, Customs & Folklore',
    ddc400: '400 Language, Phonics, Mandarin & English',
    ddc500: '500 Pure Science, Nature, Animals & Counting',
    ddc600: '600 Technology, Body Health & Engineering',
    ddc700: '700 Arts, Coloring, Music & Sports',
    ddc800: '800 Literature, Picture Books & Fables',
    ddc900: '900 History, Geography, Heroes & Maps',

    close: 'Close',
    save: 'Save Changes',
    cancel: 'Cancel',
    delete: 'Delete',
    filter: 'Filter',
    reset: 'Reset Filter',
    exportXlsx: 'Export (.xlsx)',
    print: 'Print Now',
    quickAdd: 'Quick Add Copies',
    developerCredit: 'Developed for KB-TK Bhakti Tunas Harapan Magelang by Prasetyo Handy Kurniawan',
    developerHelp: 'Developer Support & Technical Contact',
  },
  zh: {
    appTitle: 'KB-TK Bhakti Tunas Harapan (SBTH)',
    tagline: 'Be Smart, Be Kind • 好好学习，天天向上',
    kioskMode: '儿童自主阅读角 (Kiosk)',
    librarianMode: '图书管理员操作台',
    librarian: '图书管理员',
    studentPortal: '学生乐园与心愿书单',
    newArrivals: '新书上架',
    newArrivalsSub: '刚刚入库的新绘本与双语故事书，快来看看吧！',
    catalog: '少儿视觉目录',
    circulation: '借还服务前台',
    members: '会员与班级',
    labels: '条形码标签打印',
    analytics: '藏书分析与资产评估',
    excel: 'Excel 批量导入导出',
    cashFines: '逾期金与QRIS扫码',
    telegram: 'Telegram 自动备份',
    settings: '系统设置',
    scannerReady: 'USB 扫描枪就绪',
    camera: '手机摄像头扫码',
    searchBooksPlaceholder: '搜索故事标题、小动物、恐龙或作者...',
    allCategories: '全部书架类别',
    allAges: '全部年龄段',
    statusAvailable: '在架可借',
    statusBorrowed: '借阅中',
    statusInRepair: '维护修补中',
    bookDetail: '图书详情与内容简介',
    borrowNow: '借阅此书',
    addToWishlist: '加入心愿书单',
    wishlistAdded: '已在心愿书单',
    synopsis: '内容简介 / 故事梗概',
    copiesCount: '实体藏书数量',
    shelfLocation: '书架具体位置',
    publisher: '出版社',
    author: '作者 / 绘者',
    year: '出版年份',

    // Sidebar & Layout Extra
    mainNav: '主导航',
    modulesTools: '工具与模块',
    displaySettings: '显示与偏好设置',
    fontSizeLabel: '字体大小:',
    fontSizeNormal: '标准 (16px)',
    fontSizeLarge: '大号 (18px)',
    fontSizeXLarge: '超大 (20px)',
    printSpineLabels: '打印条码标签',
    excelModule: 'Excel 数据管理',
    whatsAppCenter: 'WhatsApp 通知中心',
    collectionAnalytics: '藏书数据分析',
    telegramBackup: 'Telegram 备份',
    auditHistory: '审计与操作日志',
    digitalLibrarySystem: '数字图书馆管理系统',
    developerProfile: '开发者档案',
    resetDemoData: '恢复演示数据',
    testScan: '测试扫码',
    quickScanSim: '快速扫码模拟:',
    themeToggleLight: '切换至浅色模式',
    themeToggleDark: '切换至深色模式',
    soundOn: '音效已开启',
    soundOff: '音效已静音',
    keyboardShortcuts: '键盘快捷键指南 (F1)',
    systemSettings: '系统设置与学校资料',
    studentModeKiosk: '学生自主模式 (Kiosk)',
    offlineStatus: '● 100% 离线运行',

    // Circulation Workflow
    circulationTitle: '图书借阅与归还',
    circulationSubtitle: '快速扫码借书、快捷还书与逾期处理流程',
    newLoan: '新借阅',
    expressReturn: '快速还书',
    renewLoan: '续借图书',
    overdueAndFines: '逾期图书与罚金',
    checkHistory: '查询图书借阅史',
    step1SelectMember: '选择学生 / 会员',
    step1SelectMemberShort: '选择学生',
    step1Sub: '刷卡 / 搜索姓名',
    searchMemberPlaceholder: '搜索学生姓名、用户名或班级...',
    changeStudent: '更换学生',
    parentContact: '家长 / 紧急联系人:',
    readingCorner: '班级图书角:',
    step2ScanBook: '扫描图书条码',
    step2ScanBookShort: '扫描图书',
    cartLabel: '借书篮',
    booksUnit: '册',
    scanBookPlaceholder: '扫描或输入图书插页条码 (如: 0143 或 SBTH-B-00101)...',
    addBtn: '添加',
    emptyCartTitle: '借书篮中暂无图书',
    emptyCartDesc: '请将扫码枪对准书内插页的4位条形码 (或直接输入登记号)',
    loanDurationLabel: '借阅期限:',
    duration3Days: '⚡ 3天 (加急借阅)',
    duration7Days: '📅 1周 (7天 - 学生标准)',
    duration14Days: '📚 2周 (14天 - 教师备课)',
    duration30Days: '🏫 1个月 (30天 - 班级图书角)',
    confirmLoan: '确认办理借阅',

    // Book Management
    booksTab: '少儿藏书与实体册',
    smartBarcodeRouter: '智能条码路由器已启动',
    smartBarcodeRouterDesc: '• USB扫描枪已准备就绪，支持自动识别ISBN、图书条码及学生会员卡',
    testMode: '测试模式',
    booksHeaderTitle: '少儿藏书与实体册管理',
    booksHeaderSubtitle: '图书书目(Biblio)与实体藏书条码(SBTH)统一高效管理',
    addBookScanIsbn: '录入新书 (扫描ISBN)',
    printLabelsBtn: '打印书标',
    searchBiblioPlaceholder: '搜索书名、作者或ISBN条形码...',
    sortNewest: '最新入库',
    sortTitle: '按标题 (A-Z)',
    sortCopies: '藏书册数最多',
    shelfGuide: '书架命名与摆放指南',
    editBook: '编辑图书与实体册',
    filterLabelStatus: '书标状态',
    allLabels: '全部标签',
    labelNotPrinted: '未打印书标 / 未贴标',
    labelPrinted: '已贴标上架',
    activeCatalogTab: '现存藏书目录',
    unprintedTab: '待打标签图书',
    disposedTab: '报废注销图书',
    unprintedBanner: '提醒：尚有 {count} 本实体图书尚未打印或贴上条形码书标！',
    printMissingBtn: '立即打印书标',
    shelfSettingToggle: '书架位置:',
    ddcCategoriesLabel: '杜威十进制分类 (E-DDC):',
    scroll1Line: '单行横向滑动',
    wrapView: '全部展开',
    statusFilterLabel: '状态筛选:',
    statusAll: '全部状态',
    statusAvailableRack: '在架可借',
    statusBorrowedTag: '借出中',
    statusRepairTag: '维护修补中',
    statusLostTag: '遗失图书',
    statusDisposedTag: '报废图书',
    colBookTitle: '序号与图书标题',
    colCategory: '类别',
    colIsbnCopies: 'ISBN与册数',
    colCondition: '馆藏状态',
    colAssetValue: '资产价值',
    colActions: '操作',
    inputted: '入库时间:',
    spineLabel: '书脊索书号:',
    copiesShort: '册',
    unprintedShort: '未打印',
    affixedShort: '已盖章',
    availableShort: '可借',
    borrowedShort: '借出',
    repairShort: '修补',
    showingBooksPagination: '显示第 {start}–{end} 种，共 {total} 种藏书',
    showPerPage: '每页显示:',
    perPageUnit: '条/页',
    selectAll: '全选',
    syncSpinesBtn: '批量同步书脊索书号',
    backToTop: '回到顶部',
    stockOpnameBtn: '藏书盘点',
    exportSlimsBtn: '导出 SLiMS 格式',

    gradeToddler: '托儿班 (Toddler)',
    gradeNursery: '幼儿班 (Nursery)',
    gradeTkA: '幼儿低班 (TK-A)',
    gradeTkB: '幼儿高班 (TK-B)',
    gradeTeacher: '教师与教职工',
    gradeAlumni: '校友 / 往届毕业生',
    academicYear: '届别 / 入学学年',
    academicYearTransition: '新学年一键升班与毕业归档',
    academicYearPromotionDesc: '智能升班：Toddler升入Nursery，Nursery升入TK-A，TK-A升入TK-B，TK-B毕业转入校友归档，完整保留历史借阅数据。',
    studentActive: '在校学生',
    studentGraduated: '毕业校友 (Alumni)',
    studentName: '学生 / 教师姓名',
    parentPhone: '家长 / 教师微信或WhatsApp',
    classGroup: '所属班级',
    teacherQuotaNote: '教师借阅配额高达10册，借阅周期为14天，方便课堂辅助教学。',
    heroTitle: '在家探索并挑选你最喜爱的故事绘本！🌈📚',
    heroSubtitle: '家长与小朋友可在借阅前在线查看图书在架状态。',
    searchBtn: '搜索图书',
    chipAnimals: '🦒 小动物',
    chipDinos: '🦖 恐龙故事',
    chipBedtime: '🌙 晚安绘本',
    chipLearn: '🔤 快乐识字',
    mostBorrowed: '最受欢迎借阅榜',
    agePicks: '分龄阅读推荐',
    exploreAll: '浏览全部藏书',
    comingSoon: '敬请期待',

    statTotalCollection: '总藏书种数',
    statTitles: '种',
    statAvailable: '在架可借',
    statBooksUnit: '册',
    statBorrowed: '借出中',
    statActiveMembers: '活跃会员',
    statStudentsTeachers: '师生总计',
    pinnedAnnouncement: '置顶公告',
    officialAnnouncement: '官方通知',
    readInfo: '阅读详情',
    categoryFilterQuick: '书架类别 (快捷筛选):',
    hide: '收起',
    allShelves: '全部书架',
    mostFavorite: '最喜爱的绘本 🔥',
    ageAppropriate: '分龄推荐 👶',
    exploreAllSubtitle: '选择分类筛选，在全部馆藏中找到你最喜爱的故事绘本',
    sortRecentlyAdded: '最新入库',
    sortTitleAZ: '按标题 (A-Z)',
    sortTitleZA: '按标题 (Z-A)',
    sortMostBorrowed: '最常借阅榜 🔥',
    sortYearNewest: '出版年份 (最新)',
    sortMostPages: '页数最多',
    viewGrid: '网格视图',
    viewList: '列表视图',
    showingCountOfBooks: '正在显示 {count} / {total} 册图书',
    filterLabel: '筛选:',
    filterAll: '全部',
    filterFreqBorrowed: '常借好书',
    filterRareBorrowed: '小众宝藏',
    filterWishlist: '心愿书单',
    filterAllYears: '全部年份',
    filterAllAgesClasses: '全部年龄 / 班级',
    footerTotalShowing: '正在显示 {count} 种图书，SBTH 图书馆现有馆藏共 {total} 种。',
    backToCatalogTop: '返回目录顶部 ⬆️',

    ddc000: '000 通识百科、计算机与知识大全',
    ddc100: '100 启蒙德育、品格养成与自我认知',
    ddc200: '200 宗教哲学、祈祷与感恩故事',
    ddc300: '300 社会生活、节日风俗与民间传说',
    ddc400: '400 多语启蒙、拼音、英语与华语',
    ddc500: '500 自然科学、动植物探秘与趣味数学',
    ddc600: '600 实用科技、身体健康与发明创造',
    ddc700: '700 少儿艺术、填色绘画、音乐与体育',
    ddc800: '800 儿童文学、经典绘本与寓言童话',
    ddc900: '900 历史故事、地理探索、英雄与地图',

    close: '关闭',
    save: '保存数据',
    cancel: '取消',
    delete: '删除',
    filter: '筛选',
    reset: '重置筛选',
    exportXlsx: '导出 Excel (.xlsx)',
    print: '立即打印',
    quickAdd: '快速追加复本',
    developerCredit: '由 Prasetyo Handy Kurniawan 为 KB-TK Bhakti Tunas Harapan (SBTH) 精心开发',
    developerHelp: '系统开发者与技术支持联系方式',
  },
};

/**
 * Helper to get localized DDC short title for category chips
 */
export const getDdcShortNameByCode = (code: string, lang: Language): string => {
  if (lang === 'zh') {
    switch (code) {
      case '000': return '000 通识百科';
      case '100': return '100 启蒙德育';
      case '200': return '200 宗教哲学';
      case '300': return '300 社会习俗';
      case '400': return '400 语言学习';
      case '500': return '500 自然科学';
      case '600': return '600 实用技术';
      case '700': return '700 艺术体育';
      case '800': return '800 文学故事';
      case '900': return '900 历史地理';
    }
  } else if (lang === 'en') {
    switch (code) {
      case '000': return '000 GENERAL WORKS';
      case '100': return '100 CHARACTER & ETHICS';
      case '200': return '200 RELIGION';
      case '300': return '300 SOCIAL SCIENCES';
      case '400': return '400 LANGUAGE';
      case '500': return '500 SCIENCE';
      case '600': return '600 TECHNOLOGY';
      case '700': return '700 ARTS & RECREATION';
      case '800': return '800 LITERATURE';
      case '900': return '900 HISTORY & GEOGRAPHY';
    }
  }
  // Default Indonesian
  switch (code) {
    case '000': return '000 KARYA UMUM';
    case '100': return '100 KARAKTER';
    case '200': return '200 AGAMA';
    case '300': return '300 SOSIAL';
    case '400': return '400 BAHASA';
    case '500': return '500 SAINS';
    case '600': return '600 TEKNOLOGI';
    case '700': return '700 KESENIAN';
    case '800': return '800 SASTRA';
    case '900': return '900 SEJARAH';
    default: return code;
  }
};
