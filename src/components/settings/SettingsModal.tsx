'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  X,
  School,
  Users,
  Bell,
  Upload,
  ShieldCheck,
  Key,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  UserPlus,
  Tags,
  Download,
  Plus,
  Globe,
  Save,
  Wallet,
  Sliders,
  Barcode,
  Newspaper,
  BookOpen,
  Calendar,
  Eye,
  EyeOff,
  BookmarkCheck,
  HelpCircle,
  Megaphone,
  Keyboard,
  RotateCcw,
} from 'lucide-react';
import {
  SchoolProfile,
  Librarian,
  ReminderSchedule,
  StaffRole,
  ReminderDay,
  ReminderChannel,
  Category,
  LoanRules,
  MemberTypeRule,
  SlimsPatternConfig,
  LibraryNewsArticle,
  KeyboardShortcutConfig,
} from '@/types';
import { libraryStore } from '@/lib/storage';
import { soundFx } from '@/lib/sound';
import * as XLSX from 'xlsx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<
    'SCHOOL' | 'LOAN_RULES' | 'SLIMS_CONFIG' | 'CMS_NEWS' | 'LIBRARIANS' | 'CATEGORIES' | 'REMINDERS' | 'SHORTCUTS'
  >('SCHOOL');
  const [toastMessage, setToastMessage] = useState<string>('');

  // School Profile state
  const [profile, setProfile] = useState<SchoolProfile>(libraryStore.getSchoolProfile());
  const [logoPreview, setLogoPreview] = useState<string>(profile.logoUrl);

  // Librarians state
  const [librarians, setLibrarians] = useState<Librarian[]>(libraryStore.getLibrarians());
  const [newLibName, setNewLibName] = useState<string>('');
  const [newLibUsername, setNewLibUsername] = useState<string>('');
  const [newLibRole, setNewLibRole] = useState<StaffRole>('LIBRARIAN');
  const [newLibPin, setNewLibPin] = useState<string>('');
  const [newLibPhone, setNewLibPhone] = useState<string>('');
  const [isAddLibOpen, setIsAddLibOpen] = useState<boolean>(false);

  // Categories state
  const [categories, setCategories] = useState<Category[]>(libraryStore.getCategories());
  const [isAddCatOpen, setIsAddCatOpen] = useState<boolean>(false);
  const [catName, setCatName] = useState<string>('');
  const [catShort, setCatShort] = useState<string>('');
  const [catColor, setCatColor] = useState<string>('#10B981');
  const [catShelf, setCatShelf] = useState<string>('');
  const [catDesc, setCatDesc] = useState<string>('');
  const [catIcon, setCatIcon] = useState<string>('Star');

  // Reminders state
  const [schedule, setSchedule] = useState<ReminderSchedule>(libraryStore.getReminderSchedule());

  // Loan Rules state
  const [loanRules, setLoanRules] = useState<LoanRules>(libraryStore.getLoanRules());

  // Keyboard Shortcuts state
  const [shortcuts, setShortcuts] = useState<KeyboardShortcutConfig>(libraryStore.getKeyboardShortcuts());

  // SLiMS Pattern Config state
  const [slimsPattern, setSlimsPattern] = useState<SlimsPatternConfig>(libraryStore.getSlimsPattern());
  const [hasBackup, setHasBackup] = useState<boolean>(false);
  const [isGuideExpanded, setIsGuideExpanded] = useState<boolean>(true);

  // CMS News state
  const [newsList, setNewsList] = useState<LibraryNewsArticle[]>(libraryStore.getLibraryNews());
  const [isAddNewsOpen, setIsAddNewsOpen] = useState<boolean>(false);
  const [newsTitle, setNewsTitle] = useState<string>('');
  const [newsSummary, setNewsSummary] = useState<string>('');
  const [newsContent, setNewsContent] = useState<string>('');
  const [newsCategory, setNewsCategory] = useState<LibraryNewsArticle['category']>('ANNOUNCEMENT');
  const [newsBadge, setNewsBadge] = useState<string>('PENGUMUMAN');
  const [newsPinned, setNewsPinned] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const p = libraryStore.getSchoolProfile();
      setProfile(p);
      setLogoPreview(p.logoUrl);
      setLibrarians(libraryStore.getLibrarians());
      setSchedule(libraryStore.getReminderSchedule());
      setCategories(libraryStore.getCategories());
      setLoanRules(libraryStore.getLoanRules());
      setShortcuts(libraryStore.getKeyboardShortcuts());
      setSlimsPattern(libraryStore.getSlimsPattern());
      setHasBackup(libraryStore.hasReindexBackup());
      setNewsList(libraryStore.getLibraryNews());
      setToastMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Handle Logo Upload (Base64 file reader)
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file logo maksimal 2 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setLogoPreview(result);
        setProfile((prev) => ({ ...prev, logoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...profile,
      logoUrl: logoPreview,
    };
    libraryStore.saveSchoolProfile(updated);
    if (updated.enableFinanceModule !== undefined) {
      libraryStore.setFinanceModuleEnabled(updated.enableFinanceModule);
    }
    soundFx.playSuccessChime();
    showToast('✓ Profil, Tanda Tangan & Konfigurasi Sekolah berhasil disimpan!');
    if (onProfileUpdated) onProfileUpdated();
  };

  const handleAddLibrarian = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLibName || !newLibUsername || !newLibPin) {
      alert('Lengkapi nama, username, dan PIN/password pustakawan.');
      return;
    }

    const created = libraryStore.addLibrarian({
      name: newLibName.trim(),
      username: newLibUsername.trim().toLowerCase(),
      role: newLibRole,
      pin: newLibPin.trim(),
      phone: newLibPhone.trim(),
    });

    setLibrarians(libraryStore.getLibrarians());
    setIsAddLibOpen(false);
    setNewLibName('');
    setNewLibUsername('');
    setNewLibPin('');
    setNewLibPhone('');
    soundFx.playSuccessChime();
    showToast(`✓ Pustakawan ${created.name} berhasil ditambahkan! PIN: ${created.pin}`);
  };

  const handleDeleteLibrarian = (id: string, name: string) => {
    try {
      if (librarians.length <= 1) {
        alert('Minimal harus ada 1 akun pustakawan / admin di sistem.');
        return;
      }
      const target = librarians.find((l) => l.id === id);
      if (target?.username === 'ms_kriss') {
        const otherAdmin = librarians.some((l) => l.id !== id && l.role === 'ADMIN');
        if (!otherAdmin) {
          alert('Akun Admin Utama "Ms. Kriss" tidak dapat dihapus agar sistem tidak terkunci.');
          return;
        }
      }
      if (confirm(`Yakin ingin menghapus akun pustakawan "${name}"?`)) {
        libraryStore.deleteLibrarian(id);
        setLibrarians(libraryStore.getLibrarians());
        soundFx.playScanBeep();
        showToast(`Pustakawan ${name} telah dihapus.`);
      }
    } catch (err) {
      console.error('Error deleting librarian:', err);
      alert('Terjadi kesalahan saat menghapus akun pustakawan.');
    }
  };

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    libraryStore.saveReminderSchedule(schedule);
    soundFx.playSuccessChime();
    showToast('✓ Jadwal pengingat rutin berhasil disimpan!');
  };

  // Category handlers
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      alert('Nama kategori wajib diisi.');
      return;
    }
    const created = libraryStore.addCategory({
      name: catName.trim(),
      shortName: catShort.trim() || catName.trim().slice(0, 10).toUpperCase(),
      colorHex: catColor,
      shelfLocation: catShelf.trim() || `Rak ${catShort.trim() || 'Umum'}`,
      description: catDesc.trim(),
      iconName: catIcon,
    });
    setCategories(libraryStore.getCategories());
    setIsAddCatOpen(false);
    setCatName('');
    setCatShort('');
    setCatShelf('');
    setCatDesc('');
    soundFx.playSuccessChime();
    showToast(`✓ Kategori "${created.name}" berhasil ditambahkan!`);
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (categories.length <= 1) {
      alert('Minimal harus tersisa 1 kategori di perpustakaan.');
      return;
    }
    if (confirm(`Hapus kategori "${name}"? Buku yang berkategori ini akan tetap ada di katalog.`)) {
      libraryStore.deleteCategory(id);
      setCategories(libraryStore.getCategories());
      soundFx.playScanBeep();
      showToast(`Kategori ${name} telah dihapus.`);
    }
  };

  const handleExportCategoryExcel = () => {
    const wb = libraryStore.exportCategoriesWorkbook();
    XLSX.writeFile(wb, `Master_Kategori_Perpus_SBTH.xlsx`);
    soundFx.playSuccessChime();
  };

  // --- LOAN RULES HANDLERS ---
  const handleSaveLoanRules = (e: React.FormEvent) => {
    e.preventDefault();
    libraryStore.saveLoanRules(loanRules);
    soundFx.playSuccessChime();
    showToast('✓ Aturan peminjaman, durasi & kuota berhasil disimpan!');
  };

  const handleUpdateMemberRule = (memberType: string, field: keyof MemberTypeRule, value: number) => {
    const updated = (loanRules.memberTypeRules || []).map((r) => {
      if (r.memberType === memberType) {
        return { ...r, [field]: value };
      }
      return r;
    });
    setLoanRules({ ...loanRules, memberTypeRules: updated });
  };

  // --- SLIMS CONFIG HANDLERS ---
  const handleSaveSlimsPattern = (e: React.FormEvent) => {
    e.preventDefault();
    libraryStore.saveSlimsPattern(slimsPattern);
    soundFx.playSuccessChime();
    showToast('✓ Konfigurasi pola nomor eksemplar SLiMS berhasil disimpan!');
  };

  const handleApplyPreset = (mode: SlimsPatternConfig['patternMode']) => {
    let prefix = slimsPattern.prefix;
    let serialLength = slimsPattern.serialLength || 5;
    let suffix = slimsPattern.suffix || '';
    if (mode === 'SBTH_4DIGIT') {
      prefix = '';
      serialLength = 4;
      suffix = '';
    } else if (mode === 'SBTH') {
      prefix = 'SBTH-B-';
      serialLength = 5;
      suffix = '';
    } else if (mode === 'SLIMS_STANDARD') {
      prefix = 'B';
      serialLength = 5;
      suffix = '';
    } else if (mode === 'CATEGORY_BASED') {
      prefix = 'DNG-';
      serialLength = 5;
      suffix = '';
    }
    setSlimsPattern({
      ...slimsPattern,
      patternMode: mode,
      prefix,
      serialLength,
      suffix,
    });
    soundFx.playScanBeep();
  };

  const handleReindexAllBarcodes = () => {
    const totalItems = libraryStore.getBookItems().length;
    const confirm1 = confirm(
      `⚠️ PERINGATAN PENTING & KRUSIAL:\n\n` +
        `Apakah Anda yakin ingin MENGUBAH SEMUA (${totalItems} eksemplar) KODE BARCODE BUKU di perpustakaan agar seragam mengikuti pola "${slimsPattern.prefix}..."?\n\n` +
        `⚠️ SARAN TEKNIS PUSTAKAWAN:\n` +
        `Pola penamaan index barcode buku WAJIB DITENTUKAN DARI AWAL dan sangat disarankan TIDAK DIUBAH-UBAH setelah stiker fisik ditempel pada buku, karena barcode fisik yang sudah ditempel pada buku harus dicetak dan diganti ulang jika kodenya berubah!\n\n` +
        `Apakah Anda tetap ingin melanjutkan penomoran ulang seluruh buku sekarang?`
    );
    if (!confirm1) return;

    const confirm2 = confirm(
      `🚨 KONFIRMASI KEDUA (PENGAMANAN DATA):\n\n` +
        `Sistem akan otomatis membuat CADANGAN (BACKUP SNAPSHOT) kode lama sebelum proses berjalan. Anda dapat membatalkan/mengembalikan kode kapan saja.\n\n` +
        `Ketik OK untuk melanjutkan proses penomoran ulang massal.`
    );
    if (!confirm2) return;

    const res = libraryStore.reindexAllBookBarcodes(slimsPattern);
    setHasBackup(true);
    soundFx.playSuccessChime();
    alert(
      `✅ Penomoran Ulang Berhasil!\n\nSebanyak ${res.count} eksemplar buku telah disesuaikan dengan pola "${slimsPattern.prefix}...".\n\nNomor urut berikutnya otomatis diset ke: ${res.nextNumber}.`
    );
    setSlimsPattern(libraryStore.getSlimsPattern());
    if (onProfileUpdated) onProfileUpdated();
    showToast(`✓ Berhasil memperbarui ${res.count} barcode buku.`);
  };

  const handleRestoreBarcodes = () => {
    const confirmRestore = confirm(
      `🔄 KEMBALIKAN (RESTORE) KODE BARCODE SEBELUMNYA?\n\n` +
        `Sistem akan memulihkan seluruh nomor barcode eksemplar buku ke kondisi sebelum penomoran ulang terakhir.\n\n` +
        `Lanjutkan pemulihan kode lama?`
    );
    if (!confirmRestore) return;

    const res = libraryStore.restorePreviousBookBarcodes();
    if (res.success) {
      setHasBackup(false);
      soundFx.playSuccessChime();
      alert(`✅ Berhasil Dipulihkan!\n\nSebanyak ${res.count} buku telah dikembalikan ke kode barcode semula.`);
      setSlimsPattern(libraryStore.getSlimsPattern());
      if (onProfileUpdated) onProfileUpdated();
      showToast(`✓ Berhasil memulihkan ${res.count} barcode lama.`);
    } else {
      soundFx.playErrorBeep();
      alert(`Gagal memulihkan: ${res.message}`);
    }
  };

  // --- CMS NEWS HANDLERS ---
  const handleAddNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsContent.trim()) {
      alert('Judul dan isi berita wajib diisi.');
      return;
    }
    libraryStore.addLibraryNews({
      title: newsTitle.trim(),
      summary: newsSummary.trim() || newsContent.trim().slice(0, 100),
      content: newsContent.trim(),
      category: newsCategory,
      badgeText: newsBadge.trim() || 'PENGUMUMAN',
      publishedDate: new Date().toISOString().split('T')[0],
      isPinned: newsPinned,
      isActive: true,
      author: profile.librarianName || 'Pustakawan SBTH',
    });
    setNewsList(libraryStore.getLibraryNews());
    setIsAddNewsOpen(false);
    setNewsTitle('');
    setNewsSummary('');
    setNewsContent('');
    setNewsBadge('PENGUMUMAN');
    setNewsPinned(false);
    soundFx.playSuccessChime();
    showToast('✓ Berita / Warta perpustakaan berhasil diterbitkan!');
  };

  const handleToggleNews = (id: string) => {
    const target = newsList.find((n) => n.id === id);
    if (target) {
      const updated = { ...target, isActive: !target.isActive };
      libraryStore.updateLibraryNews(updated);
      setNewsList(libraryStore.getLibraryNews());
      soundFx.playScanBeep();
      showToast(updated.isActive ? 'Warta diaktifkan (muncul di OPAC).' : 'Warta dinonaktifkan.');
    }
  };

  const handleDeleteNews = (id: string, title: string) => {
    if (confirm(`Hapus warta/berita "${title}"?`)) {
      libraryStore.deleteLibraryNews(id);
      setNewsList(libraryStore.getLibraryNews());
      soundFx.playScanBeep();
      showToast('Warta telah dihapus.');
    }
  };

  // --- KEYBOARD SHORTCUTS HANDLERS ---
  const handleShortcutChange = (keyName: keyof KeyboardShortcutConfig, val: string) => {
    setShortcuts((prev) => ({
      ...prev,
      [keyName]: val,
    }));
  };

  const handleSaveShortcuts = () => {
    libraryStore.saveKeyboardShortcuts(shortcuts);
    soundFx.playSuccessChime();
    showToast('✓ Shortcut keyboard berhasil disimpan!');
  };

  const handleResetShortcuts = () => {
    if (confirm('Kembalikan semua shortcut ke pengaturan bawaan (default)?')) {
      const def = libraryStore.resetKeyboardShortcuts();
      setShortcuts(def);
      soundFx.playSuccessChime();
      showToast('✓ Shortcut keyboard dikembalikan ke default!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-surface border-l border-border h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* 1. Neutral Header */}
        <div className="flex items-center justify-between border-b border-border p-5 bg-surface shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 border border-border shrink-0 shadow-2xs">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-display text-text">
                  Pengaturan Perpustakaan SBTH
                </h2>
                <span className="bg-amber-500/15 text-amber-500 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Konfigurasi Sistem
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Profil sekolah, aturan pinjam, standar SLiMS, CMS warta, akun pustakawan, dan kategori rak
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-text-muted hover:text-text hover:bg-surface-2 transition"
            title="Tutup Panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 font-semibold text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 2. Main Layout: Vertical Navigation on Left + Content on Right */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Vertical Navigation Bar on Left */}
          <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-border bg-surface-2/40 p-3 space-y-1 shrink-0 overflow-x-auto md:overflow-visible flex md:flex-col">
            {[
              { id: 'SCHOOL', label: 'Profil Sekolah', icon: School, desc: 'Nama, Logo & Kontak' },
              { id: 'LOAN_RULES', label: 'Aturan Pinjam', icon: Sliders, desc: 'Durasi, Kuota & Reservasi' },
              { id: 'SLIMS_CONFIG', label: 'Pola SLiMS & Barcode', icon: Barcode, desc: 'DDC, Call No & Barcode' },
              { id: 'CMS_NEWS', label: 'Warta Perpus (CMS)', icon: Newspaper, desc: 'Berita & Info OPAC' },
              { id: 'LIBRARIANS', label: 'Pustakawan', icon: Users, desc: 'Akun & PIN Akses' },
              { id: 'CATEGORIES', label: 'Kategori Rak', icon: Tags, desc: 'Rak & Topik Buku' },
              { id: 'REMINDERS', label: 'Pengingat Rutin', icon: Bell, desc: 'Jadwal WA & Telegram' },
              { id: 'SHORTCUTS', label: 'Shortcut Keyboard', icon: Keyboard, desc: 'Kustom Tombol Cepat (F1)' },
            ].map((nav) => {
              const Icon = nav.icon;
              const isActive = activeTab === nav.id;

              return (
                <button
                  key={nav.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(nav.id as any);
                    soundFx.playScanBeep();
                  }}
                  className={`w-full p-3 rounded-xl text-left transition flex items-center gap-3 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'text-text-muted hover:text-text hover:bg-surface'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-amber-500'}`} />
                  <div className="min-w-0">
                    <div className="text-xs truncate">{nav.label}</div>
                    <div
                      className={`text-[10px] truncate hidden md:block ${
                        isActive ? 'text-slate-900/80' : 'text-text-muted/70'
                      }`}
                    >
                      {nav.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Content Area (Scrollable 2-Column Form with 44px Inputs) */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            
            {/* TAB 1: PROFIL SEKOLAH */}
            {activeTab === 'SCHOOL' && (
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold font-display text-text">
                    Identitas Resmi Sekolah & Perpustakaan
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Nama dan logo ini otomatis dicantumkan di header aplikasi dan kop cetak laporan
                  </p>
                </div>

                {/* Logo Upload Box */}
                <div className="p-4 rounded-2xl bg-surface-2 border border-border flex flex-col sm:flex-row items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl border border-border bg-surface p-1.5 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                    <img
                      src={logoPreview || '/logo_sbth.png'}
                      alt="Logo Sekolah"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="space-y-1.5 flex-1 text-center sm:text-left">
                    <span className="text-xs font-semibold text-text block">
                      Ganti Logo Sekolah (.png / .jpg)
                    </span>
                    <p className="text-[11px] text-text-muted">
                      Rekomendasi rasio 1:1 transparan PNG, maksimal ukuran 2 MB.
                    </p>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border hover:bg-surface-2 text-text text-xs font-semibold cursor-pointer transition">
                      <Upload className="h-3.5 w-3.5 text-amber-500" />
                      <span>Pilih File Gambar</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* 2-Column Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-text block mb-1">
                      Nama Lengkap Lembaga:
                    </label>
                    <input
                      type="text"
                      required
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full h-11 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text outline-hidden focus:ring-1 focus:ring-amber-500"
                    />
                    <span className="text-[10px] text-text-muted mt-1 block">Contoh: KB-TK Bhakti Tunas Harapan (SBTH)</span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text block mb-1">
                      Slogan / Motto Sekolah:
                    </label>
                    <input
                      type="text"
                      required
                      value={profile.tagline}
                      onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                      className="w-full h-11 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text outline-hidden focus:ring-1 focus:ring-amber-500"
                    />
                    <span className="text-[10px] text-text-muted mt-1 block">"Be Smart, Be Kind" • 好好学习，天天向上</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Alamat Lengkap Sekolah:
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="w-full h-11 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-text-muted mt-1 block">Jl. Jendral Sudirman No. 68A, Magelang Selatan, Kota Magelang</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-text block mb-1">
                      Nomor WhatsApp Sekolah / Pustakawan:
                    </label>
                    <input
                      type="text"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full h-11 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text outline-hidden focus:ring-1 focus:ring-amber-500"
                    />
                    <span className="text-[10px] text-text-muted mt-1 block">0815-7773-256 (Ms. Kriss)</span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text block mb-1">
                      Akun Instagram:
                    </label>
                    <input
                      type="text"
                      value={profile.instagram}
                      onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                      className="w-full h-11 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text outline-hidden focus:ring-1 focus:ring-amber-500"
                    />
                    <span className="text-[10px] text-text-muted mt-1 block">@sbth.kbtk</span>
                  </div>
                </div>

                {/* Editable Penandatangan Laporan / Berita Acara Resmi */}
                <div className="p-4 rounded-2xl bg-surface-2 border border-border space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-text flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      <span>Pejabat Penandatangan Laporan & Berita Acara</span>
                    </h4>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Nama dan NIP/NIK ini otomatis dicantumkan pada Berita Acara Stock Opname, Laporan Sirkulasi, dan Sertifikat Donatur
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-text block mb-1">
                        Nama Kepala Sekolah:
                      </label>
                      <input
                        type="text"
                        required
                        value={profile.headmasterName || ''}
                        onChange={(e) => setProfile({ ...profile, headmasterName: e.target.value })}
                        placeholder="Contoh: Kepala Sekolah KB-TK SBTH"
                        className="w-full h-11 rounded-xl border border-border bg-surface px-3 text-xs text-text outline-hidden focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-text block mb-1">
                        NIP / Identitas Kepala Sekolah:
                      </label>
                      <input
                        type="text"
                        value={profile.headmasterNip || ''}
                        onChange={(e) => setProfile({ ...profile, headmasterNip: e.target.value })}
                        placeholder="Contoh: - atau NIP. 1980xxxx"
                        className="w-full h-11 rounded-xl border border-border bg-surface px-3 text-xs text-text outline-hidden focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-text block mb-1">
                        Nama Penanggung Jawab Perpustakaan:
                      </label>
                      <input
                        type="text"
                        required
                        value={profile.librarianName || ''}
                        onChange={(e) => setProfile({ ...profile, librarianName: e.target.value })}
                        placeholder="Contoh: Pustakawan KB-TK SBTH"
                        className="w-full h-11 rounded-xl border border-border bg-surface px-3 text-xs text-text outline-hidden focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-text block mb-1">
                        NIP / Identitas Pustakawan:
                      </label>
                      <input
                        type="text"
                        value={profile.librarianNip || ''}
                        onChange={(e) => setProfile({ ...profile, librarianNip: e.target.value })}
                        placeholder="Contoh: - atau Perpustakaan SBTH"
                        className="w-full h-11 rounded-xl border border-border bg-surface px-3 text-xs text-text outline-hidden focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Feature Toggle: Modul Kas & Denda */}
                <div className="p-4 rounded-2xl bg-surface-2 border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-text flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-amber-500" />
                        <span>Modul Kas & Denda Perpustakaan</span>
                      </h4>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        Opsional sekolah: Aktifkan atau nonaktifkan sistem kas, denda & pembayaran QRIS
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.enableFinanceModule ?? true}
                        onChange={(e) =>
                          setProfile({ ...profile, enableFinanceModule: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 border border-border"></div>
                    </label>
                  </div>
                  <p className="text-[10px] text-text-muted/80">
                    💡 <em>Catatan:</em> Jika toggle ini dimatikan (OFF), tombol dan menu Kas & Denda akan disembunyikan sepenuhnya dari aplikasi agar operasional berjalan bebas tanpa sistem denda uang.
                  </p>
                </div>

                {/* Reset Data Mockup / Percobaan */}
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-rose-500 flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      <span>Reset Data Mockup / Percobaan (Mulai Data Riil)</span>
                    </h4>
                    <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                      Jika Anda telah selesai menguji fitur aplikasi dan ingin mengosongkan seluruh data buku dummy/contoh agar dapat mulai memasukkan inventaris riil dari nol (atau melalui impor Excel), gunakan tombol di bawah ini. Profil sekolah dan akun staf tetap aman.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const pin = prompt('Masukkan PIN Admin/Pustakawan (1234 atau sbth2026) untuk mengosongkan data dummy:');
                      if (!pin) return;
                      const res = libraryStore.clearMockupBooksAndLoans(pin);
                      if (res.success) {
                        soundFx.playSuccessChime();
                        alert(res.message);
                        window.location.reload();
                      } else {
                        soundFx.playErrorBeep();
                        alert(res.message);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs shadow-rose-600/30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Kosongkan Seluruh Buku Percobaan</span>
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs flex items-center gap-2 transition active:scale-95"
                  >
                    <Save className="h-4 w-4" />
                    <span>Simpan Perubahan Profil</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: PUSTAKAWAN */}
            {activeTab === 'LIBRARIANS' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold font-display text-text">
                      Kelola Pustakawan & Kunci PIN Akses
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Pustakawan dapat mengakses meja sirkulasi, manajemen eksemplar, dan kas
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddLibOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs flex items-center gap-1.5 transition active:scale-95"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Tambah Pustakawan</span>
                  </button>
                </div>

                <div className="divide-y divide-border border border-border rounded-2xl bg-surface overflow-hidden">
                  {librarians.map((lib) => (
                    <div key={lib.id} className="p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold text-xs">
                          {lib.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-text">{lib.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-2 text-text-muted font-mono">
                              {lib.role}
                            </span>
                          </div>
                          <span className="text-[11px] text-text-muted font-mono">
                            Username: @{lib.username} • PIN: {lib.pin}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteLibrarian(lib.id, lib.name)}
                        className="p-1.5 text-text-muted hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition"
                        title="Hapus akun"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: PENGINGAT RUTIN */}
            {activeTab === 'REMINDERS' && (
              <form onSubmit={handleSaveReminder} className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold font-display text-text">
                    Jadwal Pengingat Rutin Sirkulasi Buku
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Kirim ringkasan buku jatuh tempo secara otomatis ke grup WA wali murid atau bot Telegram
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-text block mb-1">
                      Hari Pengingat Rutin:
                    </label>
                    <select
                      value={schedule.dayOfWeek}
                      onChange={(e) => setSchedule({ ...schedule, dayOfWeek: e.target.value as any })}
                      className="w-full h-11 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text outline-hidden"
                    >
                      <option value="SENIN">Setiap Senin</option>
                      <option value="KAMIS">Setiap Kamis</option>
                      <option value="JUMAT">Setiap Jumat</option>
                      <option value="SABTU">Setiap Sabtu</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text block mb-1">
                      Jam Pengiriman (WIB):
                    </label>
                    <input
                      type="time"
                      value={schedule.timeStr}
                      onChange={(e) => setSchedule({ ...schedule, timeStr: e.target.value })}
                      className="w-full h-11 rounded-xl border border-border bg-surface-2 px-3 text-xs font-bold text-text outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Saluran Notifikasi:
                  </label>
                  <select
                    value={schedule.targetChannel}
                    onChange={(e) => setSchedule({ ...schedule, targetChannel: e.target.value as any })}
                    className="w-full h-11 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text outline-hidden"
                  >
                    <option value="WHATSAPP">WhatsApp Broadcast Orang Tua</option>
                    <option value="TELEGRAM">Telegram Bot Perpustakaan</option>
                    <option value="BOTH">Keduanya (WhatsApp & Telegram)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs flex items-center gap-2 transition active:scale-95"
                  >
                    <Save className="h-4 w-4" />
                    <span>Simpan Jadwal Pengingat</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 4: KATEGORI RAK */}
            {activeTab === 'CATEGORIES' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold font-display text-text">
                      Master Kategori & Lokasi Rak Buku
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Sesuaikan kode warna, nama rak, dan topik cerita buku
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportCategoryExcel}
                      className="px-3 py-1.5 rounded-xl border border-border bg-surface-2 hover:bg-surface text-text font-semibold text-xs flex items-center gap-1.5 transition"
                    >
                      <Download className="h-3.5 w-3.5 text-text-muted" />
                      <span>Ekspor Excel</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddCatOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Tambah Kategori</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-3.5 rounded-2xl bg-surface border border-border flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ backgroundColor: `${cat.colorHex}25`, color: cat.colorHex }}
                        >
                          {cat.shortName.slice(0, 3)}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-text">{cat.name}</h4>
                          <span className="text-[11px] text-text-muted block">
                            📍 {cat.shelfLocation}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1.5 text-text-muted hover:text-rose-500 rounded-lg transition"
                        title="Hapus kategori"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: ATURAN PEMINJAMAN FLEKSIBEL (LOAN RULES) */}
            {activeTab === 'LOAN_RULES' && (
              <form onSubmit={handleSaveLoanRules} className="space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold font-display text-text flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-amber-500" />
                      <span>Aturan Peminjaman Fleksibel (Loan Rules)</span>
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Atur kuota buku, durasi pinjam per tipe anggota, dan kebijakan batas waktu reservasi
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Simpan Aturan</span>
                  </button>
                </div>

                {/* Member Type Rules Grid */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-text block">
                    Batas Pinjam & Perpanjangan Menurut Tipe Anggota:
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {(loanRules.memberTypeRules || []).map((rule) => (
                      <div
                        key={rule.memberType}
                        className="p-4 rounded-2xl bg-surface border border-border shadow-2xs space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-border pb-2.5">
                          <span className="text-xs font-bold text-text flex items-center gap-1.5">
                            {rule.memberType === 'STUDENT' ? '👶' : rule.memberType === 'TEACHER' ? '👩‍🏫' : '📖'} {rule.label}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-2 border border-border text-text-muted">
                            {rule.memberType}
                          </span>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div>
                            <label className="text-[11px] text-text-muted block mb-1">Maks. Buku Dipinjam:</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="1"
                                max="50"
                                value={rule.maxBooks}
                                onChange={(e) =>
                                  handleUpdateMemberRule(rule.memberType, 'maxBooks', parseInt(e.target.value) || 1)
                                }
                                className="w-full h-9 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text font-bold text-center"
                              />
                              <span className="text-[11px] text-text-muted shrink-0">Buku</span>
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] text-text-muted block mb-1">Durasi Pinjam Standar:</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="1"
                                max="90"
                                value={rule.loanDurationDays}
                                onChange={(e) =>
                                  handleUpdateMemberRule(rule.memberType, 'loanDurationDays', parseInt(e.target.value) || 7)
                                }
                                className="w-full h-9 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text font-bold text-center"
                              />
                              <span className="text-[11px] text-text-muted shrink-0">Hari</span>
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] text-text-muted block mb-1">Batas Maks. Perpanjangan:</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                max="10"
                                value={rule.maxRenewals}
                                onChange={(e) =>
                                  handleUpdateMemberRule(rule.memberType, 'maxRenewals', parseInt(e.target.value) || 0)
                                }
                                className="w-full h-9 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text font-bold text-center"
                              />
                              <span className="text-[11px] text-text-muted shrink-0">Kali</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Durasi Pilihan Cepat di Kasir */}
                <div className="p-4 rounded-2xl bg-surface-2 border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-text flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-amber-500" />
                        <span>Pilihan Durasi Cepat di Kasir Sirkulasi</span>
                      </h4>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        Pustakawan bisa memilih opsi durasi ini secara fleksibel saat checkout peminjaman baru
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[3, 7, 14, 21, 30].map((days) => {
                      const isSelected = (loanRules.allowedDurations || [3, 7, 14, 30]).includes(days);
                      return (
                        <button
                          key={days}
                          type="button"
                          onClick={() => {
                            const current = loanRules.allowedDurations || [3, 7, 14, 30];
                            let nextList = isSelected
                              ? current.filter((d) => d !== days)
                              : [...current, days].sort((a, b) => a - b);
                            if (nextList.length === 0) nextList = [7];
                            setLoanRules({ ...loanRules, allowedDurations: nextList });
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-2xs'
                              : 'bg-surface text-text-muted border-border hover:text-text'
                          }`}
                        >
                          {days === 3 ? '⚡ 3 Hari (Kilat)' : days === 7 ? '🗓️ 7 Hari (1 Minggu)' : days === 14 ? '📅 14 Hari (2 Minggu)' : days === 21 ? '📅 21 Hari' : '📚 30 Hari (1 Bulan)'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Kebijakan Reservasi Buku & Kuota Skenario Pinjaman */}
                <div className="p-4 rounded-2xl bg-surface-2 border border-border space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-purple-500/15 text-purple-500 border border-purple-500/30 flex items-center justify-center shrink-0">
                      <BookmarkCheck className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-text">
                        Kebijakan Kuota Reservasi & Skenario Peminjaman Siswa
                      </h4>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        Atur batas jumlah buku yang boleh direservasi siswa saat belum ada pinjaman vs saat masih ada pinjaman di rumah
                      </p>
                    </div>
                  </div>

                  {/* 2 Skenario Kuota Reservasi */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    <div className="p-3.5 rounded-xl bg-surface border border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text flex items-center gap-1.5">
                          <span>🏠 Skenario A: Belum Ada Pinjaman</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold">
                          Bebas Pinjaman
                        </span>
                      </div>
                      <p className="text-[10px] text-text-muted leading-relaxed">
                        Jika siswa saat ini belum meminjam buku apa pun di rumah, kuota buku yang boleh direservasi adalah:
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={loanRules.maxReservationsTotal ?? 2}
                          onChange={(e) =>
                            setLoanRules({
                              ...loanRules,
                              maxReservationsTotal: parseInt(e.target.value) || 1,
                            })
                          }
                          className="w-24 h-10 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text font-bold text-center"
                        />
                        <span className="text-xs font-semibold text-text">Buku Direservasi</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-surface border border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text flex items-center gap-1.5">
                          <span>📚 Skenario B: Masih Ada Pinjaman</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-bold">
                          Sedang Pinjam
                        </span>
                      </div>
                      <p className="text-[10px] text-text-muted leading-relaxed">
                        Jika siswa masih memegang buku di rumah, kuota reservasi dibatasi agar koleksi buku terbagi adil:
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={loanRules.maxReservationsWhenBorrowing ?? 1}
                          onChange={(e) =>
                            setLoanRules({
                              ...loanRules,
                              maxReservationsWhenBorrowing: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-24 h-10 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text font-bold text-center"
                        />
                        <span className="text-xs font-semibold text-text">Buku Direservasi</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/60">
                    <div>
                      <label className="text-[11px] font-semibold text-text block mb-1">
                        Batas Waktu Pengambilan (Hold Expiry):
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="72"
                          value={loanRules.reservationExpiryHours || 24}
                          onChange={(e) =>
                            setLoanRules({
                              ...loanRules,
                              reservationExpiryHours: parseInt(e.target.value) || 24,
                            })
                          }
                          className="w-24 h-10 rounded-xl border border-border bg-surface px-3 text-xs text-text font-bold text-center"
                        />
                        <span className="text-xs text-text-muted">Jam (default: 24 Jam / 1x24 Jam)</span>
                      </div>
                      <span className="text-[10px] text-text-muted mt-1 block">
                        Bila melewati batas waktu ini, reservasi otomatis dibatalkan agar buku tersedia lagi.
                      </span>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-text block mb-1">
                        Denda Keterlambatan:
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-muted">Rp</span>
                        <input
                          type="number"
                          min="0"
                          step="100"
                          value={loanRules.finePerDay || 500}
                          onChange={(e) =>
                            setLoanRules({
                              ...loanRules,
                              finePerDay: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-32 h-10 rounded-xl border border-border bg-surface px-3 text-xs text-text font-bold text-center"
                        />
                        <span className="text-xs text-text-muted">/ hari / buku</span>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* TAB: POLA PENAMAAN SLIMS & BARCODE GENERATOR */}
            {activeTab === 'SLIMS_CONFIG' && (
              <form onSubmit={handleSaveSlimsPattern} className="space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold font-display text-text flex items-center gap-2">
                      <Barcode className="h-4 w-4 text-amber-500" />
                      <span>Pola Kode Eksemplar SLiMS & Standarisasi Barcode</span>
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Generator otomatis nomor inventaris fisik buku dan nomor panggil (Call Number) 3-baris standar SLiMS 9 Bulian
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsGuideExpanded(!isGuideExpanded)}
                      className="px-3 py-2 rounded-xl bg-surface-2 hover:bg-surface border border-border text-amber-500 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                      <span>{isGuideExpanded ? 'Sembunyikan Panduan' : '📖 Buka Panduan Cara Pakai'}</span>
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>Simpan Format SLiMS</span>
                    </button>
                  </div>
                </div>

                {/* 📘 PANDUAN PENGGUNAAN FORMAT SLIMS (BAHASA SEDERHANA) */}
                {isGuideExpanded && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3.5 text-xs text-text animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-500 font-bold text-xs">
                        <BookOpen className="h-4 w-4" />
                        <span>PANDUAN PRAKTIS CARA PENGGUNAAN FORMAT SLIMS (4 LANGKAH MUDAH):</span>
                      </div>
                      <span className="text-[10px] text-text-muted">Mudah dipahami guru & pustakawan</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
                      {/* Langkah 1 */}
                      <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1.5">
                        <span className="font-extrabold text-amber-500 flex items-center gap-1.5 text-xs">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-[11px] font-bold">1</span>
                          Langkah 1: Pilih Gaya Kode Barcode (Klik Salah Satu Kotak)
                        </span>
                        <p className="text-text-muted text-[11px]">
                          Di bagian <strong>&quot;Pilih Preset Pola Penamaan&quot;</strong>, klik salah satu dari 4 kotak yang paling cocok:
                        </p>
                        <ul className="text-[11px] text-text-muted space-y-1 list-disc list-inside">
                          <li><strong>Standar Fisik SBTH (Cap 4-Digit):</strong> Kotak ke-1 (<em>Standar SBTH 4-Digit</em>) → kode nomor murni 4 digit tanpa awalan: <code>0101</code>, <code>0143</code>, dst. (sesuai cap fisik sekolah).</li>
                          <li><strong>Paling Standar SLiMS (Rekomendasi Nasional):</strong> Kotak ke-3 (<em>SLiMS 9 Bulian</em>) → kode simpel: <code>B00001</code>, <code>B00002</code>, dst.</li>
                          <li><strong>Ada Nama Sekolah:</strong> Kotak ke-2 (<em>Standar SBTH TK</em>) → <code>SBTH-B-00001</code>, dst.</li>
                          <li><strong>Posisi Rak Langsung:</strong> Kotak ke-4 (<em>Kode Kategori Rak</em>) → <code>DNG-00001</code> (Dongeng) atau <code>SAI-00001</code> (Sains).</li>
                        </ul>
                        <p className="text-[10px] text-emerald-500 font-semibold">
                          *(Catatan: Setelah mengklik salah satu kotak di atas, kolom-kolom di bagian tengah otomatis terisi sendiri).*
                        </p>
                      </div>

                      {/* Langkah 2 */}
                      <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1.5">
                        <span className="font-extrabold text-amber-500 flex items-center gap-1.5 text-xs">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-[11px] font-bold">2</span>
                          Langkah 2: Cek Bagian Tengah (Hanya Jika Perlu Diubah)
                        </span>
                        <p className="text-text-muted text-[11px]">
                          Bagian tengah otomatis terisi. Anda hanya perlu mengubahnya jika:
                        </p>
                        <ul className="text-[11px] text-text-muted space-y-1 list-disc list-inside">
                          <li><strong>Nomor Urut Berikutnya:</strong> Jika di perpustakaan sudah ada 50 buku lama dan ingin melanjutkan dari nomor 51, ganti angka 1 menjadi <strong>51</strong>.</li>
                          <li><strong>Suffix (Akhiran):</strong> Boleh dikosongkan. Isi <code>/2026</code> jika ingin ada tahun pengadaan (contoh: <code>B00001/2026</code>).</li>
                          <li><strong>Pratinjau Kuning:</strong> Jika bentuk kodenya sudah sesuai keinginan Anda, berarti pengaturannya sudah pas.</li>
                        </ul>
                      </div>

                      {/* Langkah 3 */}
                      <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1.5">
                        <span className="font-extrabold text-amber-500 flex items-center gap-1.5 text-xs">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-[11px] font-bold">3</span>
                          Langkah 3: Bagian Bawah Tidak Perlu Diotak-atik
                        </span>
                        <p className="text-text-muted text-[11px]">
                          Kotak paling bawah (<em>Standar Nomor Panggil Buku / Call Number 3-Baris SLiMS</em>) tidak perlu disetting. Bagian itu hanya info/contoh bahwa setiap kali Anda menambah buku baru, sistem otomatis membuatkan label stiker punggung buku 3 baris (Klasifikasi DDC, 3 Huruf Pengarang, 1 Huruf Judul).
                        </p>
                      </div>

                      {/* Langkah 4 */}
                      <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1.5 flex flex-col justify-between">
                        <div>
                          <span className="font-extrabold text-amber-500 flex items-center gap-1.5 text-xs">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-[11px] font-bold">4</span>
                            Langkah 4: Klik Simpan
                          </span>
                          <p className="text-text-muted text-[11px] mt-1">
                            Jika sudah memilih kotak di Langkah 1, langsung klik tombol oranye <strong>&quot;Simpan Format SLiMS&quot;</strong> di pojok kanan atas. Selesai! Buku baru berikutnya akan otomatis mendapatkan nomor urut rapi.
                          </p>
                        </div>
                        <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] text-text-muted">
                          <span>Panduan Format SLiMS Magelang SBTH</span>
                          <a
                            href="#panduan-slims"
                            onClick={(e) => {
                              e.preventDefault();
                              alert('Anda sedang berada di halaman konfigurasi dan panduan resmi format barcode SLiMS 9 Bulian SBTH TK.');
                            }}
                            className="text-amber-500 font-bold hover:underline"
                          >
                            Tautan Dokumen Panduan ↗
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preset Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text block">
                    Pilih Preset Pola Penamaan:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
                    {[
                      {
                        id: 'SBTH_4DIGIT',
                        title: 'Standar SBTH 4-Digit (Fisik)',
                        sample: '0143',
                        desc: 'Prefix kosong, 4 digit nomor seri (sesuai slip cap dalam & buku lama)',
                      },
                      {
                        id: 'SBTH',
                        title: 'Standar SBTH TK',
                        sample: 'SBTH-B-00143',
                        desc: 'Awalan SBTH-B- diikuti 5 digit nomor seri',
                      },
                      {
                        id: 'SLIMS_STANDARD',
                        title: 'SLiMS 9 Bulian',
                        sample: 'B00143',
                        desc: 'Awalan "B" standar bawaan sistem SLiMS',
                      },
                      {
                        id: 'CATEGORY_BASED',
                        title: 'Kode Kategori Rak',
                        sample: 'DNG-00143',
                        desc: 'Awalan sesuai rak (DNG, SAI, AKT)',
                      },
                      {
                        id: 'CUSTOM',
                        title: 'Kustom Bebas',
                        sample: (slimsPattern.prefix || '') + '0143' + (slimsPattern.suffix || ''),
                        desc: 'Tentukan awalan dan akhiran manual',
                      },
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplyPreset(preset.id as any)}
                        className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                          slimsPattern.patternMode === preset.id
                            ? 'bg-amber-500/15 border-amber-500/60 shadow-2xs'
                            : 'bg-surface border-border hover:bg-surface-2'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-text">{preset.title}</span>
                            {slimsPattern.patternMode === preset.id && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-text-muted mt-1">{preset.desc}</p>
                        </div>
                        <div className="mt-2 font-mono text-[11px] font-bold text-amber-500 bg-surface-2 px-2 py-0.5 rounded-lg border border-border w-fit">
                          {preset.sample}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Pattern Settings */}
                <div className="p-4 rounded-2xl bg-surface-2 border border-border space-y-4">
                  <h4 className="text-xs font-bold text-text">Detail Konfigurasi Pola Nomor Barcode</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-text block mb-1">Prefix (Awalan):</label>
                      <input
                        type="text"
                        value={slimsPattern.prefix}
                        onChange={(e) => setSlimsPattern({ ...slimsPattern, prefix: e.target.value })}
                        placeholder="SBTH-B- atau B"
                        className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-xs text-text font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-text block mb-1">Panjang Seri (Digit):</label>
                      <input
                        type="number"
                        min="3"
                        max="10"
                        value={slimsPattern.serialLength || 5}
                        onChange={(e) =>
                          setSlimsPattern({ ...slimsPattern, serialLength: parseInt(e.target.value) || 5 })
                        }
                        className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-xs text-text font-mono font-bold text-center"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-text block mb-1">Suffix (Akhiran):</label>
                      <input
                        type="text"
                        value={slimsPattern.suffix || ''}
                        onChange={(e) => setSlimsPattern({ ...slimsPattern, suffix: e.target.value })}
                        placeholder="misal: /2026"
                        className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-xs text-text font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-text block mb-1">Nomor Urut Berikutnya:</label>
                      <input
                        type="number"
                        min="1"
                        value={slimsPattern.nextNumber || 1}
                        onChange={(e) =>
                          setSlimsPattern({ ...slimsPattern, nextNumber: parseInt(e.target.value) || 1 })
                        }
                        className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-xs text-amber-500 font-mono font-bold text-center"
                      />
                    </div>
                  </div>

                  {/* Live Preview Box */}
                  <div className="p-3.5 rounded-xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-semibold text-text-muted block">
                        Pratinjau Kode Eksemplar Baru Saat Tambah Buku:
                      </span>
                      <span className="font-mono text-base font-extrabold text-amber-500 tracking-wider">
                        {slimsPattern.prefix}
                        {String(slimsPattern.nextNumber || 1).padStart(slimsPattern.serialLength || 5, '0')}
                        {slimsPattern.suffix || ''}
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-500 font-semibold bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg w-fit">
                      ✓ Kompatibel Scanner Barcode USB
                    </span>
                  </div>
                </div>

                {/* 🔄 PENYESUAIAN MASSAL KODE BARCODE BUKU (DENGAN SARAN & BACKUP SNAPSHOT) */}
                <div className="p-5 rounded-2xl bg-surface-2 border border-border space-y-3.5">
                  <div className="flex items-center gap-2 text-text font-bold text-xs">
                    <Sliders className="h-4 w-4 text-amber-500" />
                    <span>Penyesuaian Massal Kode Barcode Buku (Update Semua Preset)</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 space-y-1.5 leading-relaxed">
                    <p className="font-bold flex items-center gap-1.5 text-amber-400">
                      <span>💡 SARAN TEKNIS PUSTAKAWAN (PENTING):</span>
                    </p>
                    <p>
                      • Pola penamaan index kode eksemplar <strong>wajib ditentukan dari awal</strong> sebelum mencetak dan menempel stiker barcode fisik pada buku.
                    </p>
                    <p>
                      • <strong>Hindari sering mengubah-ubah pola penamaan</strong> pada buku yang sudah berjalan, karena jika kode di sistem diganti, stiker fisik barcode pada buku di rak harus dicetak dan ditempel ulang agar cocok saat discan!
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleReindexAllBarcodes}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Barcode className="h-4 w-4" />
                      <span>Ubah Semua Kode Buku Lama Mengikuti Pola Ini</span>
                    </button>

                    {hasBackup && (
                      <button
                        type="button"
                        onClick={handleRestoreBarcodes}
                        className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                        title="Kembalikan nomor barcode eksemplar ke kondisi sebelum diubah"
                      >
                        <Clock className="h-4 w-4" />
                        <span>↩️ Kembalikan (Restore) Kode Barcode Sebelumnya</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* SLiMS 3-Line Call Number Reference Box */}
                <div className="p-4 rounded-2xl bg-surface-2 border border-border space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    <h4 className="text-xs font-bold text-text">
                      Standar Nomor Panggil Buku (Call Number 3-Baris SLiMS)
                    </h4>
                  </div>
                  <p className="text-[11px] text-text-muted">
                    Format ini otomatis dicetak pada stiker punggung buku untuk memudahkan guru dan anak mencari buku di rak:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-surface border border-border">
                      <span className="text-[10px] font-bold text-blue-500 uppercase block">Baris 1: DDC Klasifikasi</span>
                      <span className="font-mono text-xs font-bold text-text mt-1 block">398.2 (Dongeng & Fabel)</span>
                      <span className="text-[10px] text-text-muted">Sains: 500, Aktivitas: 372.2</span>
                    </div>
                    <div className="p-3 rounded-xl bg-surface border border-border">
                      <span className="text-[10px] font-bold text-emerald-500 uppercase block">Baris 2: 3 Huruf Pengarang</span>
                      <span className="font-mono text-xs font-bold text-text mt-1 block">TIM (Huruf Besar)</span>
                      <span className="text-[10px] text-text-muted">Dari 3 huruf nama pengarang</span>
                    </div>
                    <div className="p-3 rounded-xl bg-surface border border-border">
                      <span className="text-[10px] font-bold text-purple-500 uppercase block">Baris 3: 1 Huruf Judul</span>
                      <span className="font-mono text-xs font-bold text-text mt-1 block">d (Huruf Kecil)</span>
                      <span className="text-[10px] text-text-muted">1 huruf pertama judul buku</span>
                    </div>
                  </div>
                </div>

                {/* Standar Kode Sumber Perolehan / Pengadaan Koleksi SLiMS */}
                <div className="p-4 rounded-2xl bg-surface-2 border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tags className="h-4 w-4 text-emerald-500" />
                      <h4 className="text-xs font-bold text-text">
                        Standar Kode Sumber Perolehan Koleksi (Pengadaan Buku SLiMS)
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                      Klasifikasi SLiMS 9
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    Sesuai standar SLiMS (Senayan Library Management System) dan Perpustakaan Nasional RI, sumber perolehan buku diklasifikasikan dengan kode singkatan resmi. Klik tombol preset untuk langsung menerapkan awalan barcode:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                    {/* 1. Beli Sendiri */}
                    <div className="p-3 rounded-xl bg-surface border border-border flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-amber-500 uppercase">1. Beli Sendiri</span>
                          <span className="font-mono text-xs font-extrabold text-amber-500">BELI</span>
                        </div>
                        <p className="text-[10px] text-text-muted mt-1">
                          Pengadaan mandiri via anggaran rutin / yayasan sekolah
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSlimsPattern({ ...slimsPattern, prefix: 'SBTH-BELI-' });
                          soundFx.playScanBeep();
                          showToast('Prefix diubah ke: SBTH-BELI-');
                        }}
                        className="mt-2.5 px-2 py-1 rounded-lg bg-surface-2 hover:bg-amber-500/15 text-text hover:text-amber-500 border border-border text-[10px] font-bold transition text-center cursor-pointer"
                      >
                        Gunakan Prefix SBTH-BELI-
                      </button>
                    </div>

                    {/* 2. Hibah BOS */}
                    <div className="p-3 rounded-xl bg-surface border border-border flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-blue-500 uppercase">2. Hibah Dana BOS</span>
                          <span className="font-mono text-xs font-extrabold text-blue-500">BOS</span>
                        </div>
                        <p className="text-[10px] text-text-muted mt-1">
                          Bantuan Operasional Sekolah / DAK Pendidikan Kemendikbud
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSlimsPattern({ ...slimsPattern, prefix: 'SBTH-BOS-' });
                          soundFx.playScanBeep();
                          showToast('Prefix diubah ke: SBTH-BOS-');
                        }}
                        className="mt-2.5 px-2 py-1 rounded-lg bg-surface-2 hover:bg-blue-500/15 text-text hover:text-blue-500 border border-border text-[10px] font-bold transition text-center cursor-pointer"
                      >
                        Gunakan Prefix SBTH-BOS-
                      </button>
                    </div>

                    {/* 3. Hibah Ortu Murid */}
                    <div className="p-3 rounded-xl bg-surface border border-border flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-purple-500 uppercase">3. Hibah Orang Tua</span>
                          <span className="font-mono text-xs font-extrabold text-purple-500">ORTU</span>
                        </div>
                        <p className="text-[10px] text-text-muted mt-1">
                          Donasi sukarela orang tua murid, paguyuban kelas, atau alumni
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSlimsPattern({ ...slimsPattern, prefix: 'SBTH-ORTU-' });
                          soundFx.playScanBeep();
                          showToast('Prefix diubah ke: SBTH-ORTU-');
                        }}
                        className="mt-2.5 px-2 py-1 rounded-lg bg-surface-2 hover:bg-purple-500/15 text-text hover:text-purple-500 border border-border text-[10px] font-bold transition text-center cursor-pointer"
                      >
                        Gunakan Prefix SBTH-ORTU-
                      </button>
                    </div>

                    {/* 4. Bantuan Pemerintah / Dinas */}
                    <div className="p-3 rounded-xl bg-surface border border-border flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-emerald-500 uppercase">4. Bantuan Lain / Dinas</span>
                          <span className="font-mono text-xs font-extrabold text-emerald-500">DINAS</span>
                        </div>
                        <p className="text-[10px] text-text-muted mt-1">
                          Dropping buku Dinas Perpustakaan, CSR, atau instansi lain
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSlimsPattern({ ...slimsPattern, prefix: 'SBTH-DINAS-' });
                          soundFx.playScanBeep();
                          showToast('Prefix diubah ke: SBTH-DINAS-');
                        }}
                        className="mt-2.5 px-2 py-1 rounded-lg bg-surface-2 hover:bg-emerald-500/15 text-text hover:text-emerald-500 border border-border text-[10px] font-bold transition text-center cursor-pointer"
                      >
                        Gunakan Prefix SBTH-DINAS-
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* TAB: CMS WARTA & PENGUMUMAN */}
            {activeTab === 'CMS_NEWS' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold font-display text-text flex items-center gap-2">
                      <Newspaper className="h-4 w-4 text-amber-500" />
                      <span>Warta & Pengumuman Perpustakaan (CMS)</span>
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Kelola berita perpustakaan, jadwal libur, renovasi, atau pengumuman stock opname yang tampil di OPAC
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddNewsOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Terbitkan Warta Baru</span>
                  </button>
                </div>

                {/* News List */}
                <div className="space-y-3">
                  {newsList.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-surface-2 border border-border text-text-muted text-xs">
                      Belum ada warta atau pengumuman yang diterbitkan.
                    </div>
                  ) : (
                    newsList.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl border transition flex items-start justify-between gap-4 ${
                          item.isActive
                            ? 'bg-surface border-border shadow-2xs'
                            : 'bg-surface-2/40 border-border opacity-60'
                        }`}
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                              {item.badgeText}
                            </span>
                            {item.isPinned && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-500 border border-purple-500/30">
                                📌 Disematkan
                              </span>
                            )}
                            <span className="text-[11px] text-text-muted">
                              🗓️ {item.publishedDate} • oleh {item.author}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-text truncate">{item.title}</h4>
                          <p className="text-xs text-text-muted line-clamp-2">{item.summary}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleNews(item.id)}
                            className={`p-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                              item.isActive
                                ? 'text-emerald-500 hover:bg-emerald-500/10'
                                : 'text-text-muted hover:bg-surface-2'
                            }`}
                            title={item.isActive ? 'Nonaktifkan dari OPAC' : 'Aktifkan di OPAC'}
                          >
                            {item.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteNews(item.id, item.title)}
                            className="p-2 text-text-muted hover:text-rose-500 rounded-xl transition cursor-pointer"
                            title="Hapus warta"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB: SHORTCUT KEYBOARD PUSTAKAWAN */}
            {activeTab === 'SHORTCUTS' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold font-display text-text flex items-center gap-2">
                      <Keyboard className="h-4 w-4 text-amber-500" />
                      <span>Kustomisasi Pintasan Keyboard (Shortcuts Mode Pustakawan)</span>
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Atur tombol cepat keyboard untuk mempercepat navigasi dan operasional sirkulasi pustakawan
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetShortcuts}
                      className="px-3.5 py-2 rounded-xl bg-surface-2 hover:bg-surface border border-border text-rose-500 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Reset ke Bawaan</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveShortcuts}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>Simpan Shortcut</span>
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2.5">
                  <span className="text-base">💡</span>
                  <p>
                    Tombol pintasan disetel ke <strong>Alt + 1 s/d Alt + 8</strong> dan <strong>F1</strong> agar 100% aman dan tidak pernah bentrok dengan Google Chrome di Windows (terhindar dari tab tertutup seperti Ctrl+W). Tekan <strong>F1</strong> kapan saja untuk membuka ringkasan panduan shortcut cepat.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { key: 'newLoan' as const, label: 'Peminjaman Baru', desc: 'Sirkulasi: Buka tab Peminjaman Baru', defaultVal: 'Alt+1' },
                    { key: 'returnBook' as const, label: 'Pengembalian Kilat', desc: 'Sirkulasi: Buka tab Pengembalian Kilat 4-Langkah (Aman dari close tab)', defaultVal: 'Alt+2' },
                    { key: 'renewLoan' as const, label: 'Perpanjangan Pinjaman', desc: 'Sirkulasi: Buka tab Perpanjangan Pinjaman', defaultVal: 'Alt+3' },
                    { key: 'overdueTab' as const, label: 'Tagihan & Terlambat', desc: 'Sirkulasi: Buka tab Buku Terlambat', defaultVal: 'Alt+4' },
                    { key: 'booksTab' as const, label: 'Koleksi & Eksemplar Buku', desc: 'Buka tab Koleksi & Eksemplar Buku', defaultVal: 'Alt+5' },
                    { key: 'membersTab' as const, label: 'Data Anggota Siswa', desc: 'Buka tab Anggota & Data Siswa', defaultVal: 'Alt+6' },
                    { key: 'opacTab' as const, label: 'Katalog Visual Anak (OPAC)', desc: 'Buka Katalog Visual Anak (OPAC)', defaultVal: 'Alt+7' },
                    { key: 'settingsModal' as const, label: 'Pengaturan Sistem', desc: 'Buka Pengaturan Sistem Perpustakaan', defaultVal: 'Alt+8' },
                    { key: 'helpModal' as const, label: 'Panduan Pintasan Keyboard', desc: 'Tampilkan panduan tombol pintasan cepat', defaultVal: 'F1' },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="p-4 rounded-2xl bg-surface border border-border shadow-2xs flex items-center justify-between gap-3"
                    >
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-text">{item.label}</h4>
                        <p className="text-[11px] text-text-muted mt-0.5">{item.desc}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <input
                          type="text"
                          value={shortcuts[item.key] || item.defaultVal}
                          onChange={(e) => handleShortcutChange(item.key, e.target.value)}
                          placeholder={item.defaultVal}
                          className="w-28 h-9 rounded-lg border border-amber-500/50 bg-amber-500/10 text-center font-mono font-bold text-xs text-amber-400 outline-hidden focus:border-amber-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Sticky Drawer Footer */}
        <div className="p-4 border-t border-border bg-surface flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-2 transition"
          >
            Tutup Panel
          </button>

          <span className="text-[11px] text-text-muted">
            Konfigurasi langsung disimpan ke local storage browser
          </span>
        </div>
      </div>

      {/* Add Librarian Sub-Modal */}
      {isAddLibOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl bg-surface border border-border p-6 shadow-2xl space-y-4">
            <h4 className="text-sm font-bold text-text">Tambah Akun Pustakawan</h4>
            <form onSubmit={handleAddLibrarian} className="space-y-3 text-xs">
              <div>
                <label className="text-xs font-semibold text-text block mb-1">Nama Pustakawan:</label>
                <input
                  type="text"
                  required
                  value={newLibName}
                  onChange={(e) => setNewLibName(e.target.value)}
                  placeholder="Ms. Kriss"
                  className="w-full h-10 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text block mb-1">Username Login:</label>
                <input
                  type="text"
                  required
                  value={newLibUsername}
                  onChange={(e) => setNewLibUsername(e.target.value)}
                  placeholder="kriss"
                  className="w-full h-10 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text block mb-1">PIN / Password (4-6 angka):</label>
                <input
                  type="password"
                  required
                  value={newLibPin}
                  onChange={(e) => setNewLibPin(e.target.value)}
                  placeholder="1234"
                  className="w-full h-10 rounded-xl border border-border bg-surface-2 px-3 text-xs font-mono text-text outline-hidden"
                />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddLibOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-text-muted hover:bg-surface-2 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Sub-Modal */}
      {isAddCatOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl bg-surface border border-border p-6 shadow-2xl space-y-4">
            <h4 className="text-sm font-bold text-text">Tambah Kategori Rak Buku</h4>
            <form onSubmit={handleAddCategory} className="space-y-3 text-xs">
              <div>
                <label className="text-xs font-semibold text-text block mb-1">Nama Kategori:</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Dongeng Fabel & Cerita"
                  className="w-full h-10 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text block mb-1">Label Singkat (Badge):</label>
                <input
                  type="text"
                  value={catShort}
                  onChange={(e) => setCatShort(e.target.value)}
                  placeholder="DONGENG"
                  className="w-full h-10 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text block mb-1">Lokasi Rak:</label>
                <input
                  type="text"
                  value={catShelf}
                  onChange={(e) => setCatShelf(e.target.value)}
                  placeholder="Rak Kuning A"
                  className="w-full h-10 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text block mb-1">Warna Aksen:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={catColor}
                    onChange={(e) => setCatColor(e.target.value)}
                    className="h-10 w-14 rounded-xl border border-border cursor-pointer bg-surface p-1"
                  />
                  <span className="font-mono text-xs text-text-muted">{catColor}</span>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddCatOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-text-muted hover:bg-surface-2 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add CMS News Sub-Modal */}
      {isAddNewsOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-border p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="text-sm font-bold text-text flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-amber-500" />
                <span>Terbitkan Warta / Pengumuman Baru</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsAddNewsOpen(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text hover:bg-surface-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddNews} className="space-y-3.5 text-xs">
              <div>
                <label className="text-xs font-semibold text-text block mb-1">Judul Warta / Pengumuman:</label>
                <input
                  type="text"
                  required
                  value={newsTitle}
                  onChange={(e) => setNewsTitle(e.target.value)}
                  placeholder="Misal: Perpustakaan Buka Kembali Setelah Stock Opname"
                  className="w-full h-10 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">Kategori:</label>
                  <select
                    value={newsCategory}
                    onChange={(e) => {
                      const cat = e.target.value as LibraryNewsArticle['category'];
                      setNewsCategory(cat);
                      if (cat === 'HOLIDAY') setNewsBadge('LIBUR');
                      else if (cat === 'STOCK_OPNAME') setNewsBadge('STOCK OPNAME');
                      else if (cat === 'EVENT') setNewsBadge('AGENDA');
                      else if (cat === 'NEW_BOOKS') setNewsBadge('KOLEKSI BARU');
                      else setNewsBadge('PENGUMUMAN');
                    }}
                    className="w-full h-10 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text outline-hidden"
                  >
                    <option value="ANNOUNCEMENT">📢 Pengumuman Umum</option>
                    <option value="HOLIDAY">🏖️ Libur Sekolah / Perpus Tutup</option>
                    <option value="STOCK_OPNAME">📋 Stock Opname / Renovasi</option>
                    <option value="EVENT">🎉 Agenda / Hari Mendongeng</option>
                    <option value="NEW_BOOKS">📚 Buku Baru Masuk</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text block mb-1">Teks Badge / Label:</label>
                  <input
                    type="text"
                    value={newsBadge}
                    onChange={(e) => setNewsBadge(e.target.value)}
                    placeholder="PENGUMUMAN"
                    className="w-full h-10 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text outline-hidden font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1">Ringkasan Singkat (Muncul di Banner):</label>
                <input
                  type="text"
                  value={newsSummary}
                  onChange={(e) => setNewsSummary(e.target.value)}
                  placeholder="Ringkasan 1-2 kalimat untuk teks berjalan / banner atas..."
                  className="w-full h-10 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1">Isi Lengkap Warta:</label>
                <textarea
                  rows={4}
                  required
                  value={newsContent}
                  onChange={(e) => setNewsContent(e.target.value)}
                  placeholder="Tuliskan detail pengumuman, tanggal buka kembali, ketentuan peminjaman, dll..."
                  className="w-full p-3 rounded-xl border border-border bg-surface-2 text-xs text-text outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinNewsCheckbox"
                  checked={newsPinned}
                  onChange={(e) => setNewsPinned(e.target.checked)}
                  className="rounded border-border text-amber-500 focus:ring-amber-500 h-4 w-4"
                />
                <label htmlFor="pinNewsCheckbox" className="text-xs text-text font-semibold cursor-pointer">
                  📌 Sematkan di urutan paling atas (Pinned)
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddNewsOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-text-muted hover:bg-surface-2 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                >
                  Terbitkan Warta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
