'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  Heart,
  Clock,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  QrCode,
  LogOut,
  Search,
  Calendar,
  Phone,
  Bookmark,
  Share2,
  ExternalLink,
  Lock,
  User,
  Star,
  Leaf,
  Layers,
  Plus,
  Key,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  Building2,
} from 'lucide-react';
import { Member, Book, Loan, LoanRules, Reservation, Language } from '@/types';
import { libraryStore } from '@/lib/storage';
import { soundFx } from '@/lib/sound';
import { SmartBookCover } from '@/components/common/SmartBookCover';

export const PORTAL_I18N = {
  id: {
    portalTitle: 'Portal Mandiri Siswa & Orang Tua (Buku Impian & Riwayat)',
    schoolTagline: 'KB-TK Bhakti Tunas Harapan (SBTH) Magelang • "Be Smart, Be Kind"',
    loginTitle: 'Masuk ke Akun Perpustakaan Ananda',
    loginSubtitle: 'Lihat buku impian yang ingin dipinjam, cek batas waktu buku di rumah, dan riwayat membaca ananda dari HP.',
    usernameLabel: 'Username / Kode Anggota Siswa',
    usernamePlaceholder: 'Contoh: alvaro / SBTH-M-0015',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Password ananda (default: 123)',
    forgotUserBtn: 'Lupa Username?',
    forgotPassBtn: 'Lupa Password?',
    loginSubmit: 'Masuk ke Akun Perpustakaan',
    quickDemoTitle: '— Coba Cepat Akun Contoh Siswa (1-Klik) —',
    forgotWaText: 'Lupa Username? Kirim via WhatsApp Ortu',
    resetPassText: 'Lupa Password? Reset Mandiri',
    noteHp: 'Data login ananda bisa dicek dan dikirim langsung ke WhatsApp nomor HP orang tua tanpa perlu repot antre.',
    hello: 'Halo',
    parentOf: 'Orang Tua/Wali',
    changePass: 'Ubah Password',
    closeAccount: 'Tutup Akun',
    logout: 'Keluar',
    tabWishlist: 'Buku Impianku',
    tabReservations: 'Reservasi Saya',
    tabActiveLoans: 'Sedang Kupinjam',
    tabHistory: 'Sudah Selesai Dibaca',
    tabFines: 'Kas Denda & QRIS',
    tabCatalog: 'Cari & Pilih Buku TK',
    wishlistHeading: 'Daftar Buku Impian yang Ingin Kupinjam Selanjutnya',
    wishlistSub: 'Tandai buku yang ananda sukai agar mudah ditemukan saat datang ke perpustakaan sekolah.',
    btnAddWishlist: '+ Tambah Buku Impian',
    emptyWishlist: 'Belum ada buku impian yang disimpan. Yuk, cari buku dongeng atau sains favorit ananda!',
    openCatalogBtn: 'Buka Katalog Buku TK',
    removeFromWish: 'Hapus dari Impian',
    resQueueHeading: 'Antrean Reservasi Buku Ananda',
    resQueueSub: 'Buku yang dipesan diprioritaskan saat dikembalikan ke perpustakaan dengan batas waktu simpan di rak 1x24 jam.',
    btnSearchRes: '+ Cari Buku untuk Direservasi',
    emptyRes: 'Belum ada buku yang direservasi. Jika buku favorit sedang dipinjam teman lain, ananda bisa memesan lebih dulu agar disimpan saat dikembalikan!',
    resReadyTag: '⚡ Siap Diambil di Rak',
    resPendingTag: '⏳ Dalam Antrean',
    resFulfilledTag: '✅ Selesai',
    resCancelledTag: 'Dibatalkan',
    dateReserved: 'Tanggal Reservasi',
    datePickupPlan: 'Rencana Ambil',
    shelfReadyHeading: 'Buku Siap di Rak Reservasi Perpustakaan!',
    timerRemaining: 'Sisa Waktu Simpan (1x24 Jam)',
    shelfReadyDesc: 'Silakan datang ke meja pustakawan sebelum waktu habis. Jika lewat 24 jam, buku otomatis tersedia kembali untuk umum.',
    waitingReturnHeading: 'Menunggu Buku Dikembalikan Peminjam Sebelumnya',
    waitingReturnDesc: 'Ananda mendapat prioritas pertama. Saat buku diserahkan ke perpustakaan, hitungan mundur 1x24 jam akan langsung dimulai dan buku disisihkan.',
    cancelResBtn: 'Batalkan Reservasi',
    loansHeading: 'Buku yang Sedang Ada di Rumah Ananda',
    emptyLoans: 'Saat ini belum ada buku perpustakaan yang sedang dipinjam.',
    historyHeading: 'Buku yang Sudah Pernah Dibaca & Dikembalikan',
    emptyHistory: 'Belum ada riwayat buku yang selesai dibaca.',
    catalogSearchPlaceholder: 'Ketik judul buku atau cerita (misal: Kancil, Dinosaurus)...',
    allCategories: 'Semua Kategori',
    addWish: '+ Buku Impianku',
    savedWish: 'Tersimpan di Impianku',
    reserveBtn: '🔖 Reservasi Buku',
    resModalTitle: 'Konfirmasi Reservasi Buku',
    resModalSub: 'Pesan buku ini agar otomatis disisihkan untuk ananda saat tiba di perpustakaan.',
    resPickupDateLabel: 'Rencana Tanggal Pengambilan (Opsional):',
    resConfirmBtn: 'Konfirmasi Pesan Buku Ini',
    resQuotaInfo: 'Ketentuan Kuota Reservasi:',
    resScenarioNoLoan: 'Belum ada pinjaman aktif: Kuota reservasi',
    resScenarioHasLoan: 'Masih meminjam buku di rumah: Kuota reservasi',
    cancel: 'Batal',
  },
  en: {
    portalTitle: 'Student & Parent Self-Service Portal (Wishlist & History)',
    schoolTagline: 'KB-TK Bhakti Tunas Harapan (SBTH) Magelang • "Be Smart, Be Kind"',
    loginTitle: 'Sign In to Student Library Account',
    loginSubtitle: 'View book wishlists, check due dates for books at home, and see reading history right from your phone.',
    usernameLabel: 'Student Username / Member ID',
    usernamePlaceholder: 'Example: alvaro / SBTH-M-0015',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Student password (default: 123)',
    forgotUserBtn: 'Forgot Username?',
    forgotPassBtn: 'Forgot Password?',
    loginSubmit: 'Sign In to Library',
    quickDemoTitle: '— Quick 1-Click Demo Accounts —',
    forgotWaText: 'Forgot Username? Send via WhatsApp',
    resetPassText: 'Forgot Password? Self Reset',
    noteHp: 'Credentials can be checked and sent directly to parent WhatsApp phone number without queuing.',
    hello: 'Hello',
    parentOf: 'Parent/Guardian',
    changePass: 'Change Password',
    closeAccount: 'Close Account',
    logout: 'Sign Out',
    tabWishlist: 'My Wishlist',
    tabReservations: 'My Reservations',
    tabActiveLoans: 'Currently Borrowing',
    tabHistory: 'Finished Books',
    tabFines: 'Fines & QRIS',
    tabCatalog: 'Search & Pick Books',
    wishlistHeading: 'My Book Wishlist for Future Visits',
    wishlistSub: 'Bookmark your favorite stories so you can easily find them when visiting the school library.',
    btnAddWishlist: '+ Add to Wishlist',
    emptyWishlist: 'No dream books saved yet. Go find your favorite fairy tale or science book!',
    openCatalogBtn: 'Open Kids Book Catalog',
    removeFromWish: 'Remove from Wishlist',
    resQueueHeading: 'My Book Reservation Queue',
    resQueueSub: 'Reserved books are prioritized when returned to the library and held for 1x24 hours.',
    btnSearchRes: '+ Find Book to Reserve',
    emptyRes: 'No books reserved yet. If a favorite book is currently borrowed by a friend, reserve it so it is held for you!',
    resReadyTag: '⚡ Ready for Pickup on Shelf',
    resPendingTag: '⏳ In Queue',
    resFulfilledTag: '✅ Completed',
    resCancelledTag: 'Cancelled',
    dateReserved: 'Reservation Date',
    datePickupPlan: 'Planned Pickup',
    shelfReadyHeading: 'Book Ready on the Reservation Shelf!',
    timerRemaining: 'Remaining Hold Time (1x24 Hours)',
    shelfReadyDesc: 'Please visit the librarian desk before time expires. After 24 hours, the book is released for other students.',
    waitingReturnHeading: 'Waiting for Current Borrower to Return',
    waitingReturnDesc: 'You have first priority! Once the physical book is returned, the 24-hour countdown will begin.',
    cancelResBtn: 'Cancel Reservation',
    loansHeading: 'Books Currently at Home',
    emptyLoans: 'No books currently borrowed from the library.',
    historyHeading: 'Books Already Read & Returned',
    emptyHistory: 'No reading history recorded yet.',
    catalogSearchPlaceholder: 'Search titles or stories (e.g. Rabbit, Dinosaur)...',
    allCategories: 'All Categories',
    addWish: '+ Wishlist',
    savedWish: 'Saved in Wishlist',
    reserveBtn: '🔖 Reserve Book',
    resModalTitle: 'Confirm Book Reservation',
    resModalSub: 'Reserve this book so it is automatically set aside for you when returned to the library.',
    resPickupDateLabel: 'Planned Pickup Date (Optional):',
    resConfirmBtn: 'Confirm Book Reservation',
    resQuotaInfo: 'Reservation Quota Policy:',
    resScenarioNoLoan: 'No active loans: Reservation quota is',
    resScenarioHasLoan: 'Currently holding books at home: Reservation quota is',
    cancel: 'Cancel',
  },
  zh: {
    portalTitle: '学生与家长自主服务中心 (心愿书单与借阅历史)',
    schoolTagline: 'KB-TK Bhakti Tunas Harapan (SBTH) • 好好学习，天天向上',
    loginTitle: '登录学生图书馆账户',
    loginSubtitle: '随时在手机上查看想要阅读的心愿书单、在借图书归还期限及借阅成长记录。',
    usernameLabel: '学生用户名 / 学员编号',
    usernamePlaceholder: '例如: alvaro / SBTH-M-0015',
    passwordLabel: '密码',
    passwordPlaceholder: '学生密码 (默认: 123)',
    forgotUserBtn: '忘记用户名？',
    forgotPassBtn: '忘记密码？',
    loginSubmit: '登录图书馆账户',
    quickDemoTitle: '— 一键体验学生示例账户 —',
    forgotWaText: '忘记用户名？发送至家长微信/WhatsApp',
    resetPassText: '忘记密码？自助重置',
    noteHp: '登录信息可直接发送至家长手机，无需排队即可快速找回。',
    hello: '你好',
    parentOf: '家长/监护人',
    changePass: '修改密码',
    closeAccount: '注销账户',
    logout: '退出登录',
    tabWishlist: '我的心愿单',
    tabReservations: '我的预订',
    tabActiveLoans: '正在借阅',
    tabHistory: '阅读历史',
    tabFines: '罚款与QRIS',
    tabCatalog: '搜索与选择图书',
    wishlistHeading: '我想要阅读的心愿书单',
    wishlistSub: '标记喜爱的图书，到校图书馆时即可快速找到。',
    btnAddWishlist: '+ 添加心愿图书',
    emptyWishlist: '暂无心愿图书。快去寻找喜欢的绘本或科普图书吧！',
    openCatalogBtn: '打开儿童图书目录',
    removeFromWish: '从心愿单移除',
    resQueueHeading: '我的图书预订排队',
    resQueueSub: '预订图书在还回图书馆后享有优先权，并在保留书架存放1x24小时。',
    btnSearchRes: '+ 查找图书进行预订',
    emptyRes: '暂无预订图书。如果心仪的书正被同学借阅，您可以提前预订！',
    resReadyTag: '⚡ 已在书架准备就绪',
    resPendingTag: '⏳ 正在排队等待',
    resFulfilledTag: '✅ 已完成',
    resCancelledTag: '已取消',
    dateReserved: '预订日期',
    datePickupPlan: '计划取书',
    shelfReadyHeading: '图书已放置在图书馆预订专架！',
    timerRemaining: '剩余保管时间 (1x24小时)',
    shelfReadyDesc: '请在倒计时结束前到图书馆柜台领取。超过24小时将自动重新向大众开放。',
    waitingReturnHeading: '正在等待前一位读者归还图书',
    waitingReturnDesc: '您享有第一顺位优先权。图书归还后将立即启动24小时保留倒计时。',
    cancelResBtn: '取消预订',
    loansHeading: '目前正在家中阅读的图书',
    emptyLoans: '当前没有正在借阅的图书。',
    historyHeading: '已读完并归还的图书',
    emptyHistory: '暂无阅读记录。',
    catalogSearchPlaceholder: '输入书名或故事主题 (如: 恐龙, 动物)...',
    allCategories: '所有分类',
    addWish: '+ 心愿单',
    savedWish: '已在心愿单',
    reserveBtn: '🔖 预订此书',
    resModalTitle: '确认图书预订',
    resModalSub: '预订此书，图书归还后系统将自动为您保留。',
    resPickupDateLabel: '计划到馆取书日期 (选填):',
    resConfirmBtn: '确认预订图书',
    resQuotaInfo: '预订配额规则:',
    resScenarioNoLoan: '无在借图书: 最大预订配额为',
    resScenarioHasLoan: '家中仍有借阅图书: 最大预订配额为',
    cancel: '取消',
  },
};

interface StudentPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBookForWishlist?: (book: Book) => void;
  language?: Language;
}

export const StudentPortalModal: React.FC<StudentPortalModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // Trilingual Language state for Student Portal
  const [portalLang, setPortalLang] = useState<Language>(language || 'id');
  const tPortal = PORTAL_I18N[portalLang] || PORTAL_I18N.id;

  const handleLanguageChange = (lang: Language) => {
    setPortalLang(lang);
    libraryStore.setLanguage(lang);
    soundFx.playScanBeep();
  };

  // Safe Date Formatter to eradicate any "Invalid Date"
  const formatDateSafe = (dateVal?: string | Date | null, locale = 'id-ID') => {
    if (!dateVal) return new Date().toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) {
      return new Date().toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Portal tabs
  const [activeTab, setActiveTab] = useState<'WISHLIST' | 'ACTIVE_LOANS' | 'RESERVATIONS' | 'HISTORY' | 'FINES' | 'CATALOG'>('WISHLIST');
  const [isFinanceEnabled, setIsFinanceEnabled] = useState<boolean>(() => libraryStore.getFinanceModuleEnabled());
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [catalogCategory, setCatalogCategory] = useState<string>('ALL');
  const [copiedRekening, setCopiedRekening] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setIsFinanceEnabled(libraryStore.getFinanceModuleEnabled());
    }
    const handleSettingsUpdated = () => {
      setIsFinanceEnabled(libraryStore.getFinanceModuleEnabled());
    };
    window.addEventListener('sbth_settings_updated', handleSettingsUpdated);
    window.addEventListener('storage', handleSettingsUpdated);
    return () => {
      window.removeEventListener('sbth_settings_updated', handleSettingsUpdated);
      window.removeEventListener('storage', handleSettingsUpdated);
    };
  }, [isOpen]);

  const handleCopyRekening = (noRek: string) => {
    if (!noRek) return;
    navigator.clipboard.writeText(noRek);
    setCopiedRekening(true);
    soundFx.playSuccessChime();
    setTimeout(() => setCopiedRekening(false), 2500);
  };

  // Direct Reservation Dialog state
  const [isResModalOpen, setIsResModalOpen] = useState<boolean>(false);
  const [resTargetBook, setResTargetBook] = useState<Book | null>(null);
  const [resPickupDate, setResPickupDate] = useState<string>('');
  const [resError, setResError] = useState<string>('');

  // Live ticking clock for 1x24h countdown
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Self-service modals
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [resetIdentifier, setResetIdentifier] = useState<string>('');
  const [resetResult, setResetResult] = useState<{
    newPassword: string;
    parentPhone: string;
    memberName: string;
    waUrl: string;
  } | null>(null);

  // Lupa username modal state
  const [isForgotUsernameOpen, setIsForgotUsernameOpen] = useState<boolean>(false);
  const [forgotPhoneInput, setForgotPhoneInput] = useState<string>('');
  const [forgotResults, setForgotResults] = useState<Member[]>([]);

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState<boolean>(false);
  const [newPasswordVal, setNewPasswordVal] = useState<string>('');
  const [changePasswordMsg, setChangePasswordMsg] = useState<string>('');

  const [isCloseAccountOpen, setIsCloseAccountOpen] = useState<boolean>(false);
  const [closeAccountError, setCloseAccountError] = useState<string>('');

  // Rules and data
  const [rules, setRules] = useState<LoanRules>(libraryStore.getLoanRules());
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState(libraryStore.getCategories());

  useEffect(() => {
    if (language) {
      setPortalLang(language);
    }
  }, [language]);

  useEffect(() => {
    if (isOpen) {
      const session = libraryStore.getActiveStudentSession();
      setCurrentUser(session);
      setRules(libraryStore.getLoanRules());
      setAllBooks(libraryStore.getBooks());
      setCategories(libraryStore.getCategories());
      setLoginError('');
      setResetResult(null);
      setChangePasswordMsg('');
      setCloseAccountError('');
      setPortalLang(language || libraryStore.getLanguage());
      if (!libraryStore.getFinanceModuleEnabled() && activeTab === 'FINES') {
        setActiveTab('WISHLIST');
      }
    }
  }, [isOpen, language, refreshTrigger, activeTab]);

  // Live 1-second interval for 24h countdown ticker
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const user = libraryStore.studentLogin(usernameInput, passwordInput);
    if (user) {
      setCurrentUser(user);
      soundFx.playSuccessChime();
      setUsernameInput('');
      setPasswordInput('');
    } else {
      soundFx.playErrorBeep();
      setLoginError('Username atau Password belum sesuai. Pastikan username dan password sama persis dengan yang terdaftar.');
    }
  };

  const handleQuickDemoLogin = (username: string) => {
    const allM = libraryStore.getMembers();
    const target = allM.find(
      (m) =>
        m.status !== 'GRADUATED' &&
        m.status !== 'INACTIVE' &&
        ((m.username || '').toLowerCase() === username.toLowerCase() ||
          m.name.toLowerCase().includes(username.toLowerCase()))
    );
    if (!target) return;

    const pass = (target.password || '1234').trim();
    setUsernameInput(target.username || target.name);
    setPasswordInput(pass);
    setLoginError('');

    const user = libraryStore.studentLogin(target.username || target.name, pass);
    if (user) {
      setCurrentUser(user);
      soundFx.playSuccessChime();
    }
  };

  const handleLogout = () => {
    libraryStore.setActiveStudentSession(null);
    setCurrentUser(null);
    soundFx.playScanBeep();
  };

  // Direct Self-Service Password Reset
  const handlePerformReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetIdentifier.trim()) return;

    const res = libraryStore.directResetStudentPassword(resetIdentifier);
    if (res && res.newPin && res.waUrl) {
      soundFx.playSuccessChime();
      setResetResult({
        newPassword: res.newPin,
        parentPhone: res.parentPhone,
        memberName: res.studentName,
        waUrl: res.waUrl,
      });
    } else {
      soundFx.playErrorBeep();
      alert('Data siswa dengan username/kode/nama tersebut tidak ditemukan.');
    }
  };

  // Self-Service Change Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (newPasswordVal.trim().length < 3) {
      alert('Password minimal 3 karakter.');
      return;
    }

    const updated = libraryStore.updateStudentPassword(currentUser.id, newPasswordVal.trim());
    if (updated) {
      currentUser.password = newPasswordVal.trim();
      setCurrentUser({ ...currentUser });
      soundFx.playSuccessChime();
      setChangePasswordMsg('✓ Password berhasil diubah!');
      setTimeout(() => {
        setIsChangePasswordOpen(false);
        setChangePasswordMsg('');
        setNewPasswordVal('');
      }, 1500);
    }
  };

  // Self-Service Account Closure
  const handleConfirmCloseAccount = () => {
    if (!currentUser) return;
    const res = libraryStore.closeStudentAccount(currentUser.id);

    if (res.success) {
      soundFx.playSuccessChime();
      alert('Akun perpustakaan ananda berhasil dinonaktifkan/ditutup dengan aman. Terima kasih telah menjadi bagian dari keluarga literasi SBTH!');
      setIsCloseAccountOpen(false);
      handleLogout();
    } else {
      soundFx.playErrorBeep();
      setCloseAccountError(res.message);
    }
  };

  const handleToggleWishlist = (bookId: string) => {
    if (!currentUser) return;
    libraryStore.toggleStudentWishlist(currentUser.id, bookId);
    soundFx.playScanBeep();
    setCurrentUser({ ...currentUser });
  };

  const userWishlistIds = currentUser ? libraryStore.getStudentWishlist(currentUser.id) : [];
  const wishlistBooks = allBooks.filter((b) => userWishlistIds.includes(b.id));
  const activeLoans = currentUser ? libraryStore.getStudentActiveLoans(currentUser.id) : [];
  const loanHistory = currentUser ? libraryStore.getStudentLoanHistory(currentUser.id) : [];
  const fineAmount = currentUser ? libraryStore.calculateStudentFineAmount(currentUser.id) : 0;
  const userReservations = currentUser
    ? libraryStore.getReservations().filter((r) => r.memberId === currentUser.id && r.status !== 'CANCELLED')
    : [];

  const formatCountdown = (expiryDateStr: string) => {
    const now = currentTime ? currentTime.getTime() : 0;
    if (!now) return { expired: false, text: 'Memuat waktu...', hours: 24, mins: 0, secs: 0 };
    const diff = new Date(expiryDateStr).getTime() - now;
    if (diff <= 0) return { expired: true, text: 'Waktu Simpan 1x24 Jam Telah Berakhir', hours: 0, mins: 0, secs: 0 };
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return {
      expired: false,
      text: `${hours} jam ${mins} menit ${secs} detik tersisa`,
      hours,
      mins,
      secs,
    };
  };

  const handleCancelReservation = (reservationId: string) => {
    if (confirm('Batalkan reservasi antrean buku ini?')) {
      libraryStore.cancelReservation(reservationId, 'Dibatalkan oleh siswa/ortu via portal mandiri');
      soundFx.playScanBeep();
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  const handleSearchForgotUsername = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPhoneInput.trim()) return;
    const results = libraryStore.findMembersByParentPhone(forgotPhoneInput);
    setForgotResults(results);
    if (results.length > 0) {
      soundFx.playSuccessChime();
    } else {
      soundFx.playErrorBeep();
    }
  };

  const filteredCatalogBooks = allBooks.filter((b) => {
    if (catalogCategory !== 'ALL' && b.categoryId !== catalogCategory) return false;
    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase();
      const matchTitle = b.title.toLowerCase().includes(q);
      const matchAuthor = b.author.toLowerCase().includes(q);
      if (!matchTitle && !matchAuthor) return false;
    }
    return true;
  });

  const handleOpenReservationModal = (book: Book) => {
    setResTargetBook(book);
    setResPickupDate('');
    setResError('');
    setIsResModalOpen(true);
  };

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !resTargetBook) return;
    try {
      libraryStore.createReservation(
        resTargetBook.id,
        currentUser.id,
        currentUser.name,
        resPickupDate || undefined
      );
      soundFx.playSuccessChime();
      setIsResModalOpen(false);
      setResTargetBook(null);
      setRefreshTrigger((v) => v + 1);
      setActiveTab('RESERVATIONS');
    } catch (err: any) {
      soundFx.playErrorBeep();
      setResError(err.message || 'Gagal melakukan reservasi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-5 bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-600/30">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {tPortal.portalTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {tPortal.schoolTagline}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Multilingual Selector Pills (ID | EN | 中文) */}
            <div className="flex items-center h-8 p-0.5 rounded-lg bg-surface-2 dark:bg-slate-800 border border-border dark:border-slate-700 text-xs font-medium">
              <button
                type="button"
                onClick={() => handleLanguageChange('id')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
                  portalLang === 'id'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Bahasa Indonesia"
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
                  portalLang === 'en'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('zh')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
                  portalLang === 'zh'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="中文"
              >
                中文
              </button>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 1. JIKA BELUM LOGIN: FORM LOGIN + RESET PASSWORD MANDIRI */}
        {!currentUser && (
          <div className="p-6 md:p-8 space-y-6">
            <div className="max-w-md mx-auto space-y-5">
              <div className="text-center space-y-1">
                <span className="inline-block p-3 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 text-2xl mb-1">
                  🎒
                </span>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                  {tPortal.loginTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {tPortal.loginSubtitle}
                </p>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Username / Kode Anggota Siswa
                  </label>
                  <div className="relative">
                    <User className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Contoh: alvaro / SBTH-M-0015"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-3 py-2.5 text-xs outline-hidden focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Password
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsForgotUsernameOpen(true)}
                        className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold hover:underline cursor-pointer"
                      >
                        Lupa Username?
                      </button>
                      <span className="text-slate-300 dark:text-slate-700">|</span>
                      <button
                        type="button"
                        onClick={() => setIsResetModalOpen(true)}
                        className="text-[11px] text-purple-600 hover:text-purple-700 font-bold hover:underline cursor-pointer"
                      >
                        Lupa Password?
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="Password ananda (default: 123)"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-3 py-2.5 text-xs outline-hidden focus:border-purple-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  Masuk ke Akun Perpustakaan
                </button>
              </form>

              {/* Quick Demo Login */}
              <div className="pt-2 text-center">
                <span className="text-[11px] font-bold text-slate-400 block mb-2">
                  — Coba Cepat Akun Contoh Siswa (1-Klik) —
                </span>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    { user: 'alvaro', label: '👦 Alvaro (TK-A A)' },
                    { user: 'aisyah', label: '👧 Aisyah (TK-A B)' },
                    { user: 'rayyan', label: '👦 Rayyan (TK-B A)' },
                    { user: 'nayla', label: '👧 Nayla (TK-B B)' },
                    { user: 'kenzi', label: '👶 Kenzi (Toddler A)' },
                    { user: 'oliver', label: '🧒 Oliver (Nursery A)' },
                  ].map((s) => (
                    <button
                      key={s.user}
                      type="button"
                      onClick={() => handleQuickDemoLogin(s.user)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-purple-50 dark:bg-slate-800 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 text-[11px] font-semibold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Self-service Reset Password & Forgot Username direct buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center space-y-2">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsForgotUsernameOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Lupa Username? Kirim via WhatsApp Ortu
                  </button>
                  <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
                  <button
                    type="button"
                    onClick={() => setIsResetModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 hover:underline cursor-pointer"
                  >
                    <Key className="h-3.5 w-3.5" />
                    Lupa Password? Reset Mandiri
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Data login ananda bisa dicek dan dikirim langsung ke WhatsApp nomor HP orang tua tanpa perlu repot antre.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. JIKA SUDAH LOGIN: DASHBOARD MANDIRI SISWA */}
        {currentUser && (
          <div>
            {/* Student Profile Banner */}
            <div className="p-5 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={currentUser.photoUrl}
                  alt={currentUser.name}
                  className="h-14 w-14 rounded-2xl object-cover border-2 border-purple-400 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                      {tPortal.hello}, {currentUser.name}! 👋
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                      {currentUser.classGroup}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {tPortal.parentOf}: <strong>{currentUser.parentName || '-'}</strong> ({currentUser.parentPhone || '-'})
                  </p>
                </div>
              </div>

              {/* Action buttons: Change Password, Close Account, Logout */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(true)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition hover:bg-slate-100 cursor-pointer"
                  title="Ubah Password Akun Siswa"
                >
                  <Key className="h-3.5 w-3.5 text-amber-500" />
                  <span>{tPortal.changePass}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCloseAccountError('');
                    setIsCloseAccountOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition hover:bg-rose-100 cursor-pointer"
                  title="Ajukan Penutupan / Penghapusan Akun"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{tPortal.closeAccount}</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  {tPortal.logout}
                </button>
              </div>
            </div>

            {/* Portal Tab Navigation */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2 gap-2 text-xs font-bold overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('WISHLIST')}
                className={`py-2 px-4 rounded-xl flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                  activeTab === 'WISHLIST'
                    ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Heart className="h-4 w-4 text-rose-500" />
                🌟 {tPortal.tabWishlist} ({wishlistBooks.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('RESERVATIONS')}
                className={`py-2 px-4 rounded-xl flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                  activeTab === 'RESERVATIONS'
                    ? 'bg-white dark:bg-slate-800 text-fuchsia-600 dark:text-fuchsia-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Bookmark className="h-4 w-4 text-fuchsia-500" />
                ⏳ {tPortal.tabReservations} ({userReservations.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ACTIVE_LOANS')}
                className={`py-2 px-4 rounded-xl flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                  activeTab === 'ACTIVE_LOANS'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <BookOpen className="h-4 w-4 text-blue-500" />
                📖 {tPortal.tabActiveLoans} ({activeLoans.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('HISTORY')}
                className={`py-2 px-4 rounded-xl flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                  activeTab === 'HISTORY'
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                📜 {tPortal.tabHistory} ({loanHistory.length})
              </button>
              {isFinanceEnabled && (
                <button
                  type="button"
                  onClick={() => setActiveTab('FINES')}
                  className={`py-2 px-4 rounded-xl flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                    activeTab === 'FINES'
                      ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <QrCode className="h-4 w-4 text-amber-500" />
                  💰 {tPortal.tabFines} {fineAmount > 0 ? `(Rp ${fineAmount.toLocaleString('id-ID')})` : ''}
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveTab('CATALOG')}
                className={`py-2 px-4 rounded-xl flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                  activeTab === 'CATALOG'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Search className="h-4 w-4 text-indigo-500" />
                🔍 {tPortal.tabCatalog}
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="p-6">
              {/* TAB 1: BUKU IMPIANKU */}
              {activeTab === 'WISHLIST' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Daftar Buku Impian yang Ingin Kupinjam Selanjutnya
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Tandai buku yang ananda sukai agar mudah ditemukan saat datang ke perpustakaan sekolah.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('CATALOG')}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      + Tambah Buku Impian
                    </button>
                  </div>

                  {wishlistBooks.length === 0 ? (
                    <div className="p-10 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                      <Heart className="h-10 w-10 text-rose-300 mx-auto" />
                      <p className="text-xs text-slate-500">
                        Belum ada buku impian yang disimpan. Yuk, cari buku dongeng atau sains favorit ananda!
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('CATALOG')}
                        className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
                      >
                        Buka Katalog Buku TK
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {wishlistBooks.map((book) => {
                        const cat = categories.find((c) => c.id === book.categoryId);
                        return (
                          <div
                            key={book.id}
                            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex gap-3 items-start relative group"
                          >
                            <div className="h-24 w-16 rounded-xl overflow-hidden shrink-0 shadow-xs">
                              <SmartBookCover
                                title={book.title}
                                author={book.author}
                                coverUrl={book.coverImage}
                                categoryId={book.categoryId}
                                aspectRatio="h-full w-full"
                              />
                            </div>
                            <div className="space-y-1 flex-1 min-w-0">
                              <span
                                className="inline-block px-2 py-0.5 rounded-md text-[9px] font-bold text-white truncate max-w-full"
                                style={{ backgroundColor: cat?.colorHex || '#9333ea' }}
                              >
                                {cat?.name || 'Cerita Anak'}
                              </span>
                              <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100 line-clamp-2">
                                {book.title}
                              </h5>
                              <p className="text-[10px] text-slate-400 truncate">{book.author}</p>
                              <button
                                type="button"
                                onClick={() => handleToggleWishlist(book.id)}
                                className="text-[10px] text-rose-600 hover:underline font-semibold block pt-1"
                              >
                                Hapus dari Impian
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 1.5: RESERVASI SAYA (DENGAN TIMER RUNDOWN 1X24 JAM) */}
              {activeTab === 'RESERVATIONS' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Antrean Reservasi Buku Ananda
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Buku yang dipesan diprioritaskan saat dikembalikan ke perpustakaan dengan batas waktu simpan di rak 1x24 jam.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('CATALOG')}
                      className="px-3.5 py-1.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      + Cari Buku untuk Direservasi
                    </button>
                  </div>

                  {userReservations.length === 0 ? (
                    <div className="p-10 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                      <Bookmark className="h-10 w-10 text-fuchsia-300 mx-auto" />
                      <p className="text-xs text-slate-500">
                        Belum ada buku yang direservasi. Jika buku favorit sedang dipinjam teman lain, ananda bisa memesan lebih dulu agar disimpan saat dikembalikan!
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('CATALOG')}
                        className="px-4 py-2 rounded-xl bg-fuchsia-600 text-white font-bold text-xs cursor-pointer hover:bg-fuchsia-700 transition"
                      >
                        Buka Katalog Buku TK
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userReservations.map((res) => {
                        const book = allBooks.find((b) => b.id === res.bookId);
                        const cat = categories.find((c) => c.id === book?.categoryId);
                        const countdown = formatCountdown(res.expiryDate);

                        return (
                          <div
                            key={res.id}
                            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between space-y-3"
                          >
                            <div className="flex gap-3 items-start">
                              <div className="h-24 w-16 rounded-xl overflow-hidden shrink-0 shadow-xs">
                                <SmartBookCover
                                  title={book?.title || res.bookTitle}
                                  author={book?.author || ''}
                                  coverUrl={book?.coverImage}
                                  categoryId={book?.categoryId || ''}
                                  aspectRatio="h-full w-full"
                                />
                              </div>
                              <div className="space-y-1 flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className="inline-block px-2 py-0.5 rounded-md text-[9px] font-bold text-white truncate max-w-[140px]"
                                    style={{ backgroundColor: cat?.colorHex || '#c026d3' }}
                                  >
                                    {cat?.name || 'Cerita Anak'}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                                      res.status === 'READY_FOR_PICKUP'
                                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                        : res.status === 'PENDING'
                                        ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                                        : res.status === 'FULFILLED'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {res.status === 'READY_FOR_PICKUP'
                                      ? tPortal.resReadyTag
                                      : res.status === 'PENDING'
                                      ? tPortal.resPendingTag
                                      : res.status === 'FULFILLED'
                                      ? tPortal.resFulfilledTag
                                      : tPortal.resCancelledTag}
                                  </span>
                                </div>

                                <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100 line-clamp-2">
                                  {book?.title || res.bookTitle}
                                </h5>
                                <p className="text-[10px] text-slate-400 truncate">
                                  {book?.author || 'Penulis Perpustakaan'}
                                </p>

                                <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5 pt-1">
                                  <div>
                                    📅 {tPortal.dateReserved}:{' '}
                                    <strong className="text-slate-700 dark:text-slate-200">
                                      {formatDateSafe(res.requestDate, portalLang === 'zh' ? 'zh-CN' : portalLang === 'en' ? 'en-US' : 'id-ID')}
                                    </strong>
                                  </div>
                                  {res.desiredPickupDate && (
                                    <div>
                                      🎯 {tPortal.datePickupPlan}:{' '}
                                      <strong className="text-purple-600 dark:text-purple-400">
                                        {formatDateSafe(res.desiredPickupDate, portalLang === 'zh' ? 'zh-CN' : portalLang === 'en' ? 'en-US' : 'id-ID')}
                                      </strong>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Rundown Timer 1x24 Jam Box */}
                            {res.status === 'READY_FOR_PICKUP' ? (
                              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-1">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                                  <Clock className="h-4 w-4 animate-spin text-amber-500" />
                                  <span>Buku Siap di Rak Reservasi Perpustakaan!</span>
                                </div>
                                <div className="font-mono text-sm font-black text-amber-700 dark:text-amber-300">
                                  ⏳ Sisa Waktu Simpan (1x24 Jam): {countdown.text}
                                </div>
                                <p className="text-[10px] text-slate-500 leading-tight">
                                  Silakan datang ke meja pustakawan sebelum waktu habis. Jika lewat 24 jam, buku otomatis tersedia kembali untuk umum.
                                </p>
                              </div>
                            ) : res.status === 'PENDING' ? (
                              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 space-y-1">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                                  <Sparkles className="h-3.5 w-3.5" />
                                  <span>Menunggu Buku Dikembalikan Peminjam Sebelumnya</span>
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                                  Ananda mendapat prioritas pertama. Saat buku diserahkan ke perpustakaan, hitungan mundur 1x24 jam akan langsung dimulai dan buku disisihkan.
                                </p>
                              </div>
                            ) : null}

                            {/* Cancel button if pending or ready */}
                            {(res.status === 'PENDING' || res.status === 'READY_FOR_PICKUP') && (
                              <div className="flex justify-end pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleCancelReservation(res.id)}
                                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer flex items-center gap-1"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Batalkan Reservasi
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SEDANG KUPINJAM */}
              {activeTab === 'ACTIVE_LOANS' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Buku yang Sedang Ada di Rumah Ananda
                  </h4>

                  {activeLoans.length === 0 ? (
                    <div className="p-10 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                      <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">Saat ini ananda tidak sedang meminjam buku dari perpustakaan.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activeLoans.flatMap((loan) =>
                        loan.items.filter((item) => !item.returnDate).map((item, idx) => {
                          const isLate = new Date().toISOString().split('T')[0] > loan.dueDate;
                          return (
                            <div
                              key={`${loan.id}-${item.id || idx}`}
                              className={`p-4 rounded-2xl border ${
                                isLate
                                  ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
                                  : 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                              } space-y-3`}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <span className="text-[10px] font-mono text-slate-400 block">
                                    {item.itemBarcode}
                                  </span>
                                  <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100">
                                    {item.bookTitle}
                                  </h5>
                                </div>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isLate
                                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200'
                                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                                  }`}
                                >
                                  {isLate ? '⚠️ Lewat Batas' : 'Sedang Dipinjam'}
                                </span>
                              </div>

                              <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                                <p>Tanggal Pinjam: <strong>{loan.loanDate}</strong></p>
                                <p>Batas Pengembalian: <strong>{loan.dueDate}</strong></p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: RIWAYAT BACA */}
              {activeTab === 'HISTORY' && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Buku-Buku yang Telah Selesai Dibaca Ananda
                  </h4>

                  {loanHistory.length === 0 ? (
                    <div className="p-10 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                      <CheckCircle className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">Belum ada riwayat buku yang selesai dibaca.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                      {loanHistory.map((hist, idx) => (
                        <div key={idx} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <div className="flex items-center gap-3">
                            <span className="text-amber-500 text-base">⭐</span>
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-200">
                                {hist.item.bookTitle}
                              </p>
                              <span className="text-[10px] text-slate-400">
                                Dipinjam: {hist.loan.loanDate} • Dikembalikan: {hist.item.returnDate || 'Selesai'}
                              </span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Sudah Dibaca ✓
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: KAS DENDA & BAYAR QRIS / REKENING BANK */}
              {activeTab === 'FINES' && isFinanceEnabled && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-4">
                      {fineAmount === 0 ? (
                        <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 space-y-2 shadow-xs">
                          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                          <h4 className="text-base font-extrabold">Tidak Ada Tunggakan Kas Denda!</h4>
                          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                            Ananda selalu tepat waktu mengembalikan buku perpustakaan. Terus pertahankan kedisiplinan membaca ya! ✨
                          </p>
                        </div>
                      ) : (
                        <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-3 shadow-xs">
                          <AlertCircle className="h-8 w-8 text-amber-600" />
                          <div>
                            <span className="text-xs uppercase font-bold text-amber-700">Tunggakan Kas Keterlambatan:</span>
                            <h4 className="text-2xl font-black text-rose-600">Rp {fineAmount.toLocaleString('id-ID')}</h4>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            Tarif kas denda: <strong>Rp {rules.finePerDay.toLocaleString('id-ID')}</strong> per hari per buku. Seluruh kas denda 100% dikumpulkan sekolah untuk <strong>membeli buku cerita anak baru</strong>.
                          </p>
                        </div>
                      )}

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                        <span className="font-bold text-slate-700 dark:text-slate-200 block text-xs">
                          Panduan Pembayaran Non-Tunai Wali Murid:
                        </span>
                        <div className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                          <p>1. Buka Mobile Banking atau Dompet Digital di HP Ayah/Bunda.</p>
                          <p>2. Pilih <strong>Scan QRIS</strong> atau <strong>Transfer Rekening Bank</strong> di sebelah kanan.</p>
                          <p>3. Masukkan nominal sesuai tunggakan dan kirim bukti transaksi ke Pustakawan.</p>
                        </div>
                      </div>
                    </div>

                    {/* Kolom Kanan: Kartu QRIS & Rekening Bank */}
                    <div className="space-y-4">
                      {/* Kartu QRIS */}
                      {rules.qrisImageUrl && (
                        <div className="bg-gradient-to-b from-rose-600 via-rose-700 to-slate-900 p-5 rounded-3xl text-white text-center shadow-lg space-y-3">
                          <div className="border-b border-rose-400/30 pb-2">
                            <span className="text-[9px] uppercase tracking-wider opacity-80">QRIS PERPUSTAKAAN RESMI</span>
                            <h5 className="text-xs font-black">{rules.qrisMerchantName || 'PERPUSTAKAAN KB-TK SBTH'}</h5>
                            {rules.qrisNmid && (
                              <span className="text-[9px] font-mono opacity-80 block mt-0.5">NMID: {rules.qrisNmid}</span>
                            )}
                          </div>
                          <div className="bg-white p-2.5 rounded-2xl mx-auto w-44 h-44 shadow-inner flex items-center justify-center">
                            <img src={rules.qrisImageUrl} alt="QRIS SBTH" className="w-full h-full object-contain" />
                          </div>
                          <p className="text-[10px] text-rose-100">
                            BCA • Mandiri • BRI • BNI • GoPay • OVO • Dana • ShopeePay • Bank Jateng
                          </p>
                        </div>
                      )}

                      {/* Kartu Rekening Bank */}
                      {rules.bankAccountNumber && (
                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
                          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-blue-500" />
                              <span>Transfer Bank Sekolah</span>
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                              {rules.bankName || 'BCA'}
                            </span>
                          </div>

                          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                            <div>
                              <span className="text-[10px] text-slate-400 block">Nomor Rekening:</span>
                              <span className="text-sm font-mono font-black text-slate-800 dark:text-slate-100 tracking-wide">
                                {rules.bankAccountNumber}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyRekening(rules.bankAccountNumber || '')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                                copiedRekening
                                  ? 'bg-emerald-500 text-white shadow-xs'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                              }`}
                            >
                              {copiedRekening ? (
                                <>
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Tersalin!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5" />
                                  <span>Salin Rekening</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="text-[11px] text-slate-500 flex justify-between items-center">
                            <span>Atas Nama (Pemilik):</span>
                            <strong className="text-slate-700 dark:text-slate-200">
                              {rules.bankAccountHolder || 'Perpustakaan KB-TK Bhakti Tunas Harapan'}
                            </strong>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: CARI & PILIH BUKU TK */}
              {activeTab === 'CATALOG' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Ketik judul buku atau cerita (misal: Kancil, Dinosaurus)..."
                        value={catalogSearch}
                        onChange={(e) => setCatalogSearch(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-3 py-2 text-xs outline-hidden"
                      />
                    </div>
                    <select
                      value={catalogCategory}
                      onChange={(e) => setCatalogCategory(e.target.value)}
                      className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs outline-hidden"
                    >
                      <option value="ALL">Semua Kategori</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-1">
                    {filteredCatalogBooks.map((book) => {
                      const isWish = userWishlistIds.includes(book.id);
                      const cat = categories.find((c) => c.id === book.categoryId);
                      return (
                        <div
                          key={book.id}
                          className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between space-y-2 group"
                        >
                          <div className="space-y-2">
                            <div className="relative h-32 w-full rounded-xl overflow-hidden bg-slate-900 shadow-xs">
                              <SmartBookCover
                                title={book.title}
                                author={book.author}
                                coverUrl={book.coverImage}
                                categoryId={book.categoryId}
                                aspectRatio="h-full w-full"
                              />
                              <span
                                className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[8px] font-bold text-white shadow-xs z-20"
                                style={{ backgroundColor: cat?.colorHex || '#9333ea' }}
                              >
                                {cat?.shortName || 'BUKU'}
                              </span>
                            </div>
                            <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100 line-clamp-2">
                              {book.title}
                            </h5>
                            <p className="text-[10px] text-slate-400 truncate">{book.author}</p>
                          </div>

                          <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button
                              type="button"
                              onClick={() => handleOpenReservationModal(book)}
                              className="w-full py-1.5 px-2.5 rounded-xl text-[11px] font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 active:scale-95 text-white flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                              title="Pesan buku ini untuk disisihkan di rak reservasi"
                            >
                              <Bookmark className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{tPortal.reserveBtn}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleWishlist(book.id)}
                              className={`w-full py-1.5 px-2.5 rounded-xl text-[10px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                                isWish
                                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-800 font-bold'
                                  : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <Heart className={`h-3 w-3 shrink-0 ${isWish ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                              <span className="truncate">{isWish ? tPortal.savedWish : tPortal.addWish}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SUB-MODAL 0: RESERVASI BUKU LANGSUNG DARI PORTAL SISWA */}
      {isResModalOpen && resTargetBook && currentUser && (() => {
        const cat = categories.find((c) => c.id === resTargetBook.categoryId);
        const maxQuota = activeLoans.length > 0 
          ? (rules.maxReservationsWhenBorrowing ?? 1)
          : (rules.maxReservationsTotal ?? 2);
        const activeResCount = userReservations.filter((r) => r.status === 'PENDING' || r.status === 'READY_FOR_PICKUP').length;
        const remainingQuota = Math.max(0, maxQuota - activeResCount);

        return (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-fuchsia-500" />
                  <span>{tPortal.resModalTitle}</span>
                </h3>
                <button
                  onClick={() => {
                    setIsResModalOpen(false);
                    setResTargetBook(null);
                    setResError('');
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {resError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{resError}</span>
                </div>
              )}

              {/* Target Book Info Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex gap-3 items-center">
                <div className="h-20 w-14 rounded-xl overflow-hidden shrink-0 shadow-xs">
                  <SmartBookCover
                    title={resTargetBook.title}
                    author={resTargetBook.author}
                    coverUrl={resTargetBook.coverImage}
                    categoryId={resTargetBook.categoryId}
                    aspectRatio="h-full w-full"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span
                    className="inline-block px-2 py-0.5 rounded-md text-[8px] font-bold text-white truncate max-w-full"
                    style={{ backgroundColor: cat?.colorHex || '#c026d3' }}
                  >
                    {cat?.name || 'Cerita Anak'}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-2 mt-1">
                    {resTargetBook.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate">{resTargetBook.author}</p>
                </div>
              </div>

              {/* Reservation Quota Explainer */}
              <div className="p-3 rounded-xl bg-fuchsia-50 dark:bg-fuchsia-950/30 border border-fuchsia-200 dark:border-fuchsia-800 text-[11px] text-fuchsia-900 dark:text-fuchsia-200 space-y-1 leading-relaxed">
                <div className="flex items-center justify-between font-bold text-fuchsia-700 dark:text-fuchsia-300">
                  <span>{tPortal.resQuotaInfo}</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-fuchsia-100 dark:bg-fuchsia-900/60">
                    Sisa Kuota: {remainingQuota} / {maxQuota} Buku
                  </span>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-400">
                  {activeLoans.length > 0 ? (
                    <>
                      • {tPortal.resScenarioHasLoan} <strong>{maxQuota} buku</strong> (saat ini sedang meminjam {activeLoans.length} buku di rumah).
                    </>
                  ) : (
                    <>
                      • {tPortal.resScenarioNoLoan} <strong>{maxQuota} buku</strong> (belum ada pinjaman di rumah).
                    </>
                  )}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  • Begitu buku dikembalikan ke perpustakaan, hitungan mundur <strong>1x24 jam</strong> akan aktif dan buku disisihkan khusus untuk ananda.
                </p>
              </div>

              <form onSubmit={handleConfirmReservation} className="space-y-4 text-xs">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {tPortal.resPickupDateLabel}
                  </label>
                  <input
                    type="date"
                    value={resPickupDate}
                    onChange={(e) => setResPickupDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-slate-100 outline-hidden focus:border-fuchsia-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Boleh dikosongkan. Rencana tanggal memudahkan pustakawan menyiapkan buku di meja sirkulasi.
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResModalOpen(false);
                      setResTargetBook(null);
                      setResError('');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                  >
                    {tPortal.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={remainingQuota <= 0}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 ${
                      remainingQuota <= 0
                        ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white active:scale-95'
                    }`}
                  >
                    <Bookmark className="h-4 w-4" />
                    <span>{remainingQuota <= 0 ? 'Batas Kuota Tercapai' : tPortal.resConfirmBtn}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* SUB-MODAL 1: RESET PASSWORD LANGSUNG KE WA ORTU */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-emerald-500" />
                <span>Reset Password Siswa Mandiri</span>
              </h3>
              <button
                onClick={() => {
                  setIsResetModalOpen(false);
                  setResetResult(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!resetResult ? (
              <form onSubmit={handlePerformReset} className="space-y-4 text-xs">
                <p className="text-slate-500 leading-relaxed">
                  Masukkan Nama Siswa, Username, atau Kode Anggota SBTH. Sistem akan membuatkan PIN 4-digit baru dan mengirimkan tautan konfirmasi langsung ke WhatsApp nomor HP orang tua yang terdaftar.
                </p>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nama Siswa / Username / No. Anggota:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Alvaro / alvaro / SBTH-M-0015"
                    value={resetIdentifier}
                    onChange={(e) => setResetIdentifier(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsResetModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md"
                  >
                    Reset & Buat Password Baru
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <span>Password Baru Berhasil Dibuat!</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Siswa: <strong>{resetResult.memberName}</strong>
                  </p>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-center font-mono text-xl font-bold text-emerald-600">
                    {resetResult.newPassword}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    No. WhatsApp Terdaftar Ortu: <strong>{resetResult.parentPhone}</strong>
                  </p>
                </div>

                <a
                  href={resetResult.waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md flex items-center justify-center gap-2 transition"
                >
                  <Phone className="h-4 w-4" />
                  <span>Kirim Password Baru ke WhatsApp Ortu (Buka WA)</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setIsResetModalOpen(false);
                    setResetResult(null);
                  }}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Selesai & Kembali ke Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-MODAL 2: UBAH PASSWORD SENDIRI */}
      {isChangePasswordOpen && currentUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Key className="h-5 w-5 text-amber-500" />
                <span>Ubah Password Siswa</span>
              </h3>
              <button
                onClick={() => setIsChangePasswordOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Password Baru Ananda:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ketik password baru (misal: 1234 atau kata sandi mudah)"
                  value={newPasswordVal}
                  onChange={(e) => setNewPasswordVal(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-hidden focus:border-amber-500"
                />
              </div>

              {changePasswordMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold">
                  {changePasswordMsg}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md"
                >
                  Simpan Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL 3: PENGAJUAN PENUTUPAN / PENGHAPUSAN AKUN MANDIRI */}
      {isCloseAccountOpen && currentUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-rose-500" />
                <span>Ajukan Penutupan Akun Perpustakaan</span>
              </h3>
              <button
                onClick={() => setIsCloseAccountOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <p>
                Fitur ini digunakan oleh Ayah/Bunda bila ananda telah <strong>lulus dari TK-B</strong> atau <strong>pindah sekolah</strong>, untuk menyelesaikan administrasi dan menutup akses akun perpustakaan.
              </p>

              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-1">
                <span className="font-bold block">Syarat Bebas Pustaka:</span>
                <p>• Tidak ada buku fisik yang sedang dipinjam (0 buku aktif).</p>
                <p>• Seluruh kewajiban buku dikembalikan dalam kondisi baik.</p>
              </div>

              {closeAccountError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-semibold flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{closeAccountError}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsCloseAccountOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmCloseAccount}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
              >
                Konfirmasi Tutup Akun
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 4: LUPA USERNAME VIA WHATSAPP ORTU */}
      {isForgotUsernameOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Phone className="h-5 w-5 text-emerald-500" />
                <span>Cari Username & Kirim ke WhatsApp Ortu</span>
              </h3>
              <button
                onClick={() => {
                  setIsForgotUsernameOpen(false);
                  setForgotResults([]);
                  setForgotPhoneInput('');
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSearchForgotUsername} className="space-y-4 text-xs">
              <p className="text-slate-500 leading-relaxed">
                Ketik nomor WhatsApp Ayah/Bunda yang terdaftar saat registrasi siswa. Sistem akan menampilkan username login ananda dan tautan kirim langsung ke WhatsApp.
              </p>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nomor WhatsApp Orang Tua:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 08123456789 atau 628..."
                    value={forgotPhoneInput}
                    onChange={(e) => setForgotPhoneInput(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 outline-hidden focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md shrink-0 cursor-pointer"
                  >
                    Cari Akun
                  </button>
                </div>
              </div>
            </form>

            {/* Results */}
            {forgotResults.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 max-h-60 overflow-y-auto pr-1">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Ditemukan {forgotResults.length} siswa dengan nomor WhatsApp ini:
                </p>
                {forgotResults.map((m) => {
                  const cleanPhone = (m.parentPhone || '').replace(/\D/g, '').replace(/^0/, '62');
                  const waMsg = encodeURIComponent(
                    `Halo Ayah/Bunda ${m.parentName || ''},\n\nBerikut data login Portal Perpustakaan SBTH untuk Ananda:\n` +
                      `👤 *Nama:* ${m.name}\n` +
                      `🏷️ *Kelas:* ${m.classGroup}\n` +
                      `🔑 *Username:* ${m.username || m.memberCode}\n` +
                      `🔒 *Password Default:* ${m.password || '1234'}\n\n` +
                      `Buka portal perpustakaan di browser dan masukkan username serta password di atas. Terima kasih!`
                  );
                  const waLink = `https://wa.me/${cleanPhone}?text=${waMsg}`;

                  return (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-extrabold text-slate-800 dark:text-slate-100">{m.name}</h5>
                          <p className="text-[11px] text-slate-500">
                            {m.classGroup} • Kode: {m.memberCode}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold text-[10px]">
                          @{m.username || m.memberCode}
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-700 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Username Login:</span>
                          <strong className="text-purple-600 dark:text-purple-400 font-mono text-xs">
                            {m.username || m.memberCode}
                          </strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setUsernameInput(m.username || m.memberCode);
                            setPasswordInput(m.password || '1234');
                            setIsForgotUsernameOpen(false);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold text-[10px] cursor-pointer"
                        >
                          Gunakan Login
                        </button>
                      </div>

                      {cleanPhone && (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[11px] shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          Kirim Data Akun ke WhatsApp ({m.parentPhone})
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {forgotResults.length === 0 && forgotPhoneInput && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs">
                Nomor WhatsApp belum cocok dengan data siswa aktif. Pastikan nomor yang diinput sama dengan nomor saat pendaftaran anggota.
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsForgotUsernameOpen(false);
                  setForgotResults([]);
                  setForgotPhoneInput('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
