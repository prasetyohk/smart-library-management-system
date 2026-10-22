'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Zap,
  Printer,
  FileSpreadsheet,
  Users,
  Camera,
  Volume2,
  VolumeX,
  Layers,
  Search,
  Scan,
  RefreshCw,
  Info,
  CheckCircle2,
  Clock,
  Coins,
  Bot,
  Settings,
  Lock,
  Monitor,
  Sun,
  Moon,
  BarChart3,
  ChevronDown,
  LayoutGrid,
  Globe,
  MessageSquare,
  Keyboard,
  History,
  ChevronLeft,
  ChevronRight,
  Type,
} from 'lucide-react';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import { KidsVisualOpac } from '@/components/opac/KidsVisualOpac';
import { CirculationDesk } from '@/components/circulation/CirculationDesk';
import { BookManagement } from '@/components/books/BookManagement';
import { MemberManagement } from '@/components/members/MemberManagement';
import { ScanIsbnModal } from '@/components/books/ScanIsbnModal';
import { LabelPrintGenerator } from '@/components/labels/LabelPrintGenerator';
import { ExcelModuleModal } from '@/components/excel/ExcelModuleModal';
import { CameraScannerModal } from '@/components/scanner/CameraScannerModal';
import { FinanceAndFinesModal } from '@/components/finance/FinanceAndFinesModal';
import { TelegramBackupModal } from '@/components/backup/TelegramBackupModal';
import { WhatsAppCenterModal } from '@/components/whatsapp/WhatsAppCenterModal';
import { DeveloperProfileModal } from '@/components/developer/DeveloperProfileModal';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { PinAuthModal } from '@/components/auth/PinAuthModal';
import { AdminAuthModal } from '@/components/auth/AdminAuthModal';
import { ShortcutHelpModal } from '@/components/common/ShortcutHelpModal';
import { ActivityLogModal } from '@/components/audit/ActivityLogModal';
import { AnalyticsModal } from '@/components/analytics/AnalyticsModal';
import { StudentPortalModal } from '@/components/portal/StudentPortalModal';
import { soundFx } from '@/lib/sound';
import { libraryStore } from '@/lib/storage';
import { SchoolProfile, AppMode, Language, FontSize } from '@/types';
import { DEFAULT_SCHOOL_PROFILE } from '@/lib/constants';
import { DICTIONARY } from '@/lib/i18n';

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    'OPAC' | 'CIRCULATION' | 'BOOKS' | 'MEMBERS'
  >('CIRCULATION');

  // Modals state
  const [isScanIsbnOpen, setIsScanIsbnOpen] = useState<boolean>(false);
  const [scannedIsbnToLookup, setScannedIsbnToLookup] = useState<string>('');

  const [isLabelPrinterOpen, setIsLabelPrinterOpen] = useState<boolean>(false);
  const [preSelectedBarcodes, setPreSelectedBarcodes] = useState<string[]>([]);

  const [isExcelModalOpen, setIsExcelModalOpen] = useState<boolean>(false);
  const [isFinanceOpen, setIsFinanceOpen] = useState<boolean>(false);
  const [isTelegramOpen, setIsTelegramOpen] = useState<boolean>(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState<boolean>(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [isShortcutHelpOpen, setIsShortcutHelpOpen] = useState<boolean>(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [circulationSubTab, setCirculationSubTab] = useState<
    'BORROW' | 'RETURN' | 'RENEW' | 'OVERDUE' | 'INSPECT'
  >('BORROW');
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);
  const [isStudentPortalOpen, setIsStudentPortalOpen] = useState<boolean>(false);
  const [isDevCreditOpen, setIsDevCreditOpen] = useState<boolean>(false);
  const [cameraTitle, setCameraTitle] = useState<string>('Scan Barcode');

  // Dropdown states for neat header
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState<boolean>(false);

  // Language & Trilingual Dictionary
  const [language, setLanguage] = useState<Language>('id');
  const t = DICTIONARY[language];

  // Theme (Dark / Light Mode)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // App Mode & School Branding
  const [appMode, setAppMode] = useState<AppMode>('PUSTAKAWAN');
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(DEFAULT_SCHOOL_PROFILE);

  // Sound FX toggle
  const [isSoundOn, setIsSoundOn] = useState<boolean>(true);

  // Font Size Scaling ('normal' | 'large' | 'xlarge')
  const [fontSize, setFontSize] = useState<FontSize>('normal');

  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Active circulation scanned code pipeline
  const [activeCirculationScan, setActiveCirculationScan] = useState<string>('');

  // Quick scanner simulation drawer toggle (Default FALSE / Collapsed)
  const [showSimulator, setShowSimulator] = useState<boolean>(false);

  // Initialize storage & date
  const [currentDateStr, setCurrentDateStr] = useState<string>('');
  const [dataVersion, setDataVersion] = useState<number>(0);

  useEffect(() => {
    const d = new Date();
    setCurrentDateStr(
      d.toLocaleDateString(language === 'zh' ? 'zh-CN' : language === 'en' ? 'en-US' : 'id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    );
    setAppMode(libraryStore.getAppMode());
    setSchoolProfile(libraryStore.getSchoolProfile());
    setLanguage(libraryStore.getLanguage());
    
    // Theme init: sync HTML class and data-theme attribute
    const currentTheme = libraryStore.getTheme();
    setTheme(currentTheme);
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }

    // Font size init
    const currentFontSize = libraryStore.getFontSize();
    setFontSize(currentFontSize);
    document.documentElement.setAttribute('data-font-size', currentFontSize);

    // Sidebar collapse init
    const savedSidebar = localStorage.getItem('sbth_sidebar_collapsed');
    if (savedSidebar !== null) {
      setIsSidebarCollapsed(savedSidebar === 'true');
    }

    // Restore saved active tab, subtab, and sound settings
    const savedTab = localStorage.getItem('sbth_active_tab') as any;
    if (savedTab && ['OPAC', 'CIRCULATION', 'BOOKS', 'MEMBERS'].includes(savedTab)) {
      setActiveTab(savedTab);
    }
    const savedCircSub = localStorage.getItem('sbth_circulation_subtab') as any;
    if (savedCircSub && ['BORROW', 'RETURN', 'RENEW', 'OVERDUE', 'INSPECT'].includes(savedCircSub)) {
      setCirculationSubTab(savedCircSub);
    }
    const savedSound = localStorage.getItem('sbth_sound_fx');
    if (savedSound !== null) {
      const isEnabled = savedSound === 'true';
      setIsSoundOn(isEnabled);
      soundFx.setSoundEnabled(isEnabled);
    }
  }, [dataVersion, language]);

  // Persist activeTab & circulationSubTab
  useEffect(() => {
    if (typeof window !== 'undefined' && appMode === 'PUSTAKAWAN') {
      localStorage.setItem('sbth_active_tab', activeTab);
    }
  }, [activeTab, appMode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sbth_circulation_subtab', circulationSubTab);
    }
  }, [circulationSubTab]);

  // Global Keyboard Shortcuts for Librarian Mode (Ctrl+Q, Ctrl+W, Ctrl+E, Ctrl+R, Ctrl+M, Ctrl+K, Ctrl+P, F1)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F1 opens Shortcut Help Modal in any tab
      if (e.key === 'F1') {
        e.preventDefault();
        setIsShortcutHelpOpen((prev) => !prev);
        return;
      }

      // Escape closes open submodals
      if (e.key === 'Escape') {
        if (isShortcutHelpOpen) {
          setIsShortcutHelpOpen(false);
          return;
        }
        if (isAdminAuthOpen) {
          setIsAdminAuthOpen(false);
          return;
        }
      }

      // Ignore shortcuts if user is typing in form inputs
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      // Only listen in PUSTAKAWAN mode
      if (appMode !== 'PUSTAKAWAN') return;

      const sc = libraryStore.getKeyboardShortcuts();

      const matchShortcut = (keyCombo: string | undefined): boolean => {
        if (!keyCombo) return false;
        const parts = keyCombo.split('+').map((p) => p.trim().toLowerCase());
        const hasCtrl = parts.includes('control') || parts.includes('ctrl');
        const hasAlt = parts.includes('alt');
        const hasShift = parts.includes('shift');
        const mainKey = parts.filter((p) => !['control', 'ctrl', 'alt', 'shift'].includes(p))[0] || '';

        if (hasCtrl && !(e.ctrlKey || e.metaKey)) return false;
        if (!hasCtrl && (e.ctrlKey || e.metaKey)) return false;
        if (hasAlt !== e.altKey) return false;
        if (hasShift !== e.shiftKey) return false;

        return e.key.toLowerCase() === mainKey.toLowerCase();
      };

      if (matchShortcut(sc.newLoan || 'Alt+1') || (e.altKey && (e.key === '1' || e.key.toLowerCase() === 'q'))) {
        e.preventDefault();
        setActiveTab('CIRCULATION');
        setCirculationSubTab('BORROW');
        soundFx.playScanBeep();
        return;
      }
      if (matchShortcut(sc.returnBook || 'Alt+2') || (e.altKey && (e.key === '2' || e.key.toLowerCase() === 'w'))) {
        e.preventDefault();
        setActiveTab('CIRCULATION');
        setCirculationSubTab('RETURN');
        soundFx.playScanBeep();
        return;
      }
      if (matchShortcut(sc.renewLoan || 'Alt+3') || (e.altKey && (e.key === '3' || e.key.toLowerCase() === 'e'))) {
        e.preventDefault();
        setActiveTab('CIRCULATION');
        setCirculationSubTab('RENEW');
        soundFx.playScanBeep();
        return;
      }
      if (matchShortcut(sc.overdueTab || 'Alt+4') || (e.altKey && (e.key === '4' || e.key.toLowerCase() === 'r'))) {
        e.preventDefault();
        setActiveTab('CIRCULATION');
        setCirculationSubTab('OVERDUE');
        soundFx.playScanBeep();
        return;
      }
      if (matchShortcut(sc.booksTab || 'Alt+5') || (e.altKey && (e.key === '5' || e.key.toLowerCase() === 'b'))) {
        e.preventDefault();
        setActiveTab('BOOKS');
        soundFx.playScanBeep();
        return;
      }
      if (matchShortcut(sc.membersTab || 'Alt+6') || (e.altKey && (e.key === '6' || e.key.toLowerCase() === 'm'))) {
        e.preventDefault();
        setActiveTab('MEMBERS');
        soundFx.playScanBeep();
        return;
      }
      if (matchShortcut(sc.opacTab || 'Alt+7') || (e.altKey && (e.key === '7' || e.key.toLowerCase() === 'k'))) {
        e.preventDefault();
        setActiveTab('OPAC');
        soundFx.playScanBeep();
        return;
      }
      if (matchShortcut(sc.settingsModal || 'Alt+8') || (e.altKey && (e.key === '8' || e.key.toLowerCase() === 'p'))) {
        e.preventDefault();
        setIsAdminAuthOpen(true);
        soundFx.playScanBeep();
        return;
      }
      if (matchShortcut(sc.helpModal || 'F1') || e.key === 'F1') {
        e.preventDefault();
        setIsShortcutHelpOpen(true);
        soundFx.playScanBeep();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appMode, isShortcutHelpOpen, isAdminAuthOpen]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    libraryStore.setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    soundFx.playScanBeep();
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    libraryStore.setLanguage(lang);
    setDataVersion((v) => v + 1);
    soundFx.playScanBeep();
  };

  // GLOBAL HARDWARE BARCODE SCANNER ROUTER (USB Keystrokes < 50ms)
  const { lastScan, simulateScan, isScannerActive } = useBarcodeScanner({
    onScanISBN: (isbn) => {
      // 1. ISBN-13 scanned -> Open Scan ISBN Modal with Waterfall Lookup
      setScannedIsbnToLookup(isbn);
      setIsScanIsbnOpen(true);
    },
    onScanBookItem: (barcode) => {
      // 2. Physical Book Barcode scanned -> Route to Circulation desk
      setActiveTab('CIRCULATION');
      setActiveCirculationScan(barcode);
    },
    onScanMember: (memberCode) => {
      // 3. Member / Classroom Card scanned -> Route to Circulation desk
      setActiveTab('CIRCULATION');
      setActiveCirculationScan(memberCode);
    },
  });

  const toggleSound = () => {
    const next = !isSoundOn;
    setIsSoundOn(next);
    soundFx.setSoundEnabled(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sbth_sound_fx', String(next));
    }
  };

  const handleFontSizeChange = (size: FontSize) => {
    setFontSize(size);
    libraryStore.saveFontSize(size);
    soundFx.playScanBeep();
  };

  const toggleSidebar = () => {
    const next = !isSidebarCollapsed;
    setIsSidebarCollapsed(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sbth_sidebar_collapsed', String(next));
    }
    soundFx.playScanBeep();
  };

  const handleOpenLabelPrinterWithBarcodes = (barcodes: string[]) => {
    setPreSelectedBarcodes(barcodes);
    setIsLabelPrinterOpen(true);
  };

  const handleRefreshData = () => {
    setDataVersion((v) => v + 1);
  };

  const handleCameraScanResult = (code: string) => {
    simulateScan(code);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {appMode === 'PUSTAKAWAN' ? (
        <div className="flex-1 flex min-h-screen overflow-x-hidden">
          {/* ======================================================== */}
          {/* 1. MODERN LEFT SIDEBAR (MODE PERPUSTAKAWAN)               */}
          {/* Sembunyikan total jika Portal Siswa sedang aktif agar bersih */}
          {/* ======================================================== */}
          {!isStudentPortalOpen && (
            <aside
              className={`print:hidden flex flex-col shrink-0 border-r border-border bg-surface transition-all duration-300 z-30 select-none ${
                isSidebarCollapsed ? 'w-20' : 'w-64'
              }`}
            >
            {/* 1.1 Brand & School Header */}
            <div className="h-16 px-3.5 flex items-center justify-between border-b border-border/80 bg-surface-2/30">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="h-9 w-9 rounded-xl overflow-hidden border border-border bg-surface shadow-xs flex items-center justify-center shrink-0">
                  <img
                    src={schoolProfile.logoUrl}
                    alt="Logo Sekolah"
                    className="h-full w-full object-contain p-0.5"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo_sbth.png';
                    }}
                  />
                </div>
                {!isSidebarCollapsed && (
                  <div className="truncate">
                    <span className="text-sm font-bold tracking-tight text-text block truncate leading-tight">
                      SBTH Magelang
                    </span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Pustakawan
                    </span>
                  </div>
                )}
              </div>

              {/* Collapse/Expand Toggle */}
              <button
                type="button"
                onClick={toggleSidebar}
                className="h-8 w-8 rounded-lg border border-border bg-surface text-text-muted hover:text-text hover:bg-surface-2 flex items-center justify-center transition shrink-0 cursor-pointer"
                title={isSidebarCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
              >
                {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            </div>

            {/* 1.2 USB Scanner Status Bar */}
            <div
              className={`px-3 py-2 border-b border-border/60 bg-emerald-500/5 flex items-center transition ${
                isSidebarCollapsed ? 'justify-center' : 'justify-between gap-2'
              }`}
              title="Scanner Barcode USB Siap & Aktif Otomatis"
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                {!isSidebarCollapsed && (
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    Scanner USB Siap
                  </span>
                )}
              </div>
              {!isSidebarCollapsed && (
                <button
                  type="button"
                  onClick={() => setShowSimulator(!showSimulator)}
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono border transition cursor-pointer ${
                    showSimulator
                      ? 'bg-amber-500/20 text-amber-500 border-amber-500/40 font-bold'
                      : 'bg-surface text-text-muted border-border hover:text-text'
                  }`}
                  title="Simulasi Tes Barcode"
                >
                  Tes Scan
                </button>
              )}
            </div>

            {/* 1.3 Barcode Simulation Drawer */}
            {!isSidebarCollapsed && showSimulator && (
              <div className="p-2 border-b border-border/80 bg-surface-2/60 text-[10px] space-y-1 animate-in fade-in">
                <span className="text-text-muted font-medium block">Simulasi Scan Cepat:</span>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => simulateScan('9786022497653')}
                    className="p-1 rounded bg-surface hover:bg-surface-2 border border-border text-text font-mono truncate text-left cursor-pointer"
                    title="ISBN Kancil"
                  >
                    📖 ISBN Kancil
                  </button>
                  <button
                    type="button"
                    onClick={() => simulateScan('SBTH-M-0015')}
                    className="p-1 rounded bg-surface hover:bg-surface-2 border border-border text-text font-mono truncate text-left cursor-pointer"
                    title="Kartu Alvaro"
                  >
                    👤 Alvaro (TK-A)
                  </button>
                  <button
                    type="button"
                    onClick={() => simulateScan('SBTH-B-00101')}
                    className="p-1 rounded bg-surface hover:bg-surface-2 border border-border text-text font-mono truncate text-left cursor-pointer"
                    title="Buku 00101"
                  >
                    🏷️ SBTH-B-00101
                  </button>
                  <button
                    type="button"
                    onClick={() => simulateScan('9786020524412')}
                    className="p-1 rounded bg-surface hover:bg-surface-2 border border-border text-text font-mono truncate text-left cursor-pointer"
                    title="ISBN Jerapah"
                  >
                    📖 ISBN Jerapah
                  </button>
                </div>
              </div>
            )}

            {/* 1.4 Scrollable Navigation & Tools */}
            <div className="flex-1 overflow-y-auto p-2 space-y-4">
              {/* GROUP 1: NAVIGASI UTAMA */}
              <div>
                {!isSidebarCollapsed && (
                  <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                    Navigasi Utama
                  </p>
                )}
                <nav className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('OPAC')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      activeTab === 'OPAC'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs'
                        : 'text-text-muted hover:text-text hover:bg-surface-2 border border-transparent'
                    } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                    title="Katalog Buku Digital (OPAC)"
                  >
                    <Sparkles className={`h-4 w-4 shrink-0 ${activeTab === 'OPAC' ? 'text-amber-500' : ''}`} />
                    {!isSidebarCollapsed && <span>{t.catalog}</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('CIRCULATION')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      activeTab === 'CIRCULATION'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs'
                        : 'text-text-muted hover:text-text hover:bg-surface-2 border border-transparent'
                    } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                    title="Sirkulasi Peminjaman & Pengembalian"
                  >
                    <Zap className={`h-4 w-4 shrink-0 ${activeTab === 'CIRCULATION' ? 'text-amber-500' : ''}`} />
                    {!isSidebarCollapsed && <span>{t.circulation}</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('BOOKS')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      activeTab === 'BOOKS'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs'
                        : 'text-text-muted hover:text-text hover:bg-surface-2 border border-transparent'
                    } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                    title="Manajemen Inventaris & Eksemplar Buku"
                  >
                    <Layers className={`h-4 w-4 shrink-0 ${activeTab === 'BOOKS' ? 'text-amber-500' : ''}`} />
                    {!isSidebarCollapsed && <span>{t.booksTab}</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('MEMBERS')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      activeTab === 'MEMBERS'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs'
                        : 'text-text-muted hover:text-text hover:bg-surface-2 border border-transparent'
                    } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                    title="Data Anggota Siswa & Guru"
                  >
                    <Users className={`h-4 w-4 shrink-0 ${activeTab === 'MEMBERS' ? 'text-amber-500' : ''}`} />
                    {!isSidebarCollapsed && <span>{t.members}</span>}
                  </button>
                </nav>
              </div>

              {/* GROUP 2: MODUL & ALAT PUSTAKAWAN */}
              <div>
                {!isSidebarCollapsed && (
                  <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                    Modul & Alat
                  </p>
                )}
                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => handleOpenLabelPrinterWithBarcodes([])}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text hover:bg-surface-2 transition cursor-pointer ${
                      isSidebarCollapsed ? 'justify-center px-0' : ''
                    }`}
                    title="Cetak Label Barcode & Nomor Panggil (Tom & Jerry 103 / Thermal)"
                  >
                    <Printer className="h-4 w-4 text-emerald-500 shrink-0" />
                    {!isSidebarCollapsed && <span>Cetak Label Barcode</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsExcelModalOpen(true)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text hover:bg-surface-2 transition cursor-pointer ${
                      isSidebarCollapsed ? 'justify-center px-0' : ''
                    }`}
                    title="Impor / Ekspor Excel Database"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-emerald-500 shrink-0" />
                    {!isSidebarCollapsed && <span>Modul Excel Data</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsWhatsAppOpen(true)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text hover:bg-surface-2 transition cursor-pointer ${
                      isSidebarCollapsed ? 'justify-center px-0' : ''
                    }`}
                    title="Pusat WhatsApp Notifikasi & Reminder"
                  >
                    <MessageSquare className="h-4 w-4 text-emerald-500 shrink-0" />
                    {!isSidebarCollapsed && <span>WhatsApp Center</span>}
                  </button>

                  {libraryStore.getFinanceModuleEnabled() && (
                    <button
                      type="button"
                      onClick={() => setIsFinanceOpen(true)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text hover:bg-surface-2 transition cursor-pointer ${
                        isSidebarCollapsed ? 'justify-center px-0' : ''
                      }`}
                      title="Kas Perpustakaan & Denda"
                    >
                      <Coins className="h-4 w-4 text-amber-500 shrink-0" />
                      {!isSidebarCollapsed && <span>Kas & Denda</span>}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsAnalyticsOpen(true)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text hover:bg-surface-2 transition cursor-pointer ${
                      isSidebarCollapsed ? 'justify-center px-0' : ''
                    }`}
                    title="Analisis & Statistik Koleksi"
                  >
                    <BarChart3 className="h-4 w-4 text-indigo-500 shrink-0" />
                    {!isSidebarCollapsed && <span>Analitik Koleksi</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsTelegramOpen(true)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text hover:bg-surface-2 transition cursor-pointer ${
                      isSidebarCollapsed ? 'justify-center px-0' : ''
                    }`}
                    title="Telegram Bot & Backup Otomatis"
                  >
                    <Bot className="h-4 w-4 text-sky-500 shrink-0" />
                    {!isSidebarCollapsed && <span>Telegram & Backup</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsLogModalOpen(true)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text hover:bg-surface-2 transition cursor-pointer ${
                      isSidebarCollapsed ? 'justify-center px-0' : ''
                    }`}
                    title="Log Riwayat & Audit Sistem"
                  >
                    <History className="h-4 w-4 text-purple-500 shrink-0" />
                    {!isSidebarCollapsed && <span>Audit & Riwayat</span>}
                  </button>
                </div>
              </div>

              {/* GROUP 3: TAMPILAN, UKURAN FONT & PENGATURAN */}
              <div>
                {!isSidebarCollapsed && (
                  <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
                    Pengaturan Tampilan
                  </p>
                )}

                {/* FONT SIZE CONTROLLER (A- / A / A+) */}
                <div className={`p-2 rounded-xl bg-surface-2/60 border border-border/80 ${isSidebarCollapsed ? 'flex flex-col items-center gap-1.5' : 'space-y-1.5'}`}>
                  {!isSidebarCollapsed ? (
                    <>
                      <div className="flex items-center justify-between text-[11px] font-medium text-text-muted">
                        <span className="flex items-center gap-1.5">
                          <Type className="h-3.5 w-3.5 text-amber-500" />
                          <span>Ukuran Font:</span>
                        </span>
                        <span className="font-semibold text-text text-[10px] uppercase">
                          {fontSize === 'normal' ? 'Normal (16px)' : fontSize === 'large' ? 'Besar (18px)' : 'Ekstra (20px)'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 bg-surface p-1 rounded-lg border border-border">
                        <button
                          type="button"
                          onClick={() => handleFontSizeChange('normal')}
                          className={`py-1 rounded text-center text-xs font-bold transition cursor-pointer ${
                            fontSize === 'normal'
                              ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : 'text-text-muted hover:text-text hover:bg-surface-2'
                          }`}
                          title="Ukuran Standar (16px)"
                        >
                          A-
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFontSizeChange('large')}
                          className={`py-1 rounded text-center text-xs font-bold transition cursor-pointer ${
                            fontSize === 'large'
                              ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : 'text-text-muted hover:text-text hover:bg-surface-2'
                          }`}
                          title="Ukuran Besar (18px) - Lebih Nyaman Dibaca"
                        >
                          A
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFontSizeChange('xlarge')}
                          className={`py-1 rounded text-center text-xs font-bold transition cursor-pointer ${
                            fontSize === 'xlarge'
                              ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : 'text-text-muted hover:text-text hover:bg-surface-2'
                          }`}
                          title="Ukuran Ekstra Besar (20px)"
                        >
                          A+
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const nextSize = fontSize === 'normal' ? 'large' : fontSize === 'large' ? 'xlarge' : 'normal';
                        handleFontSizeChange(nextSize);
                      }}
                      className="h-8 w-8 rounded-lg bg-surface border border-border hover:bg-surface-2 flex items-center justify-center text-amber-500 font-bold text-xs cursor-pointer"
                      title={`Ganti Ukuran Font: Saat ini ${fontSize}. Klik untuk ubah.`}
                    >
                      A+
                    </button>
                  )}
                </div>

                {/* THEME, AUDIO, PINTASAN, SETTINGS ICONS */}
                <div className={`mt-2 ${isSidebarCollapsed ? 'flex flex-col items-center gap-1' : 'grid grid-cols-4 gap-1'}`}>
                  {/* Theme Button */}
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="h-8 rounded-lg border border-border bg-surface hover:bg-surface-2 text-text flex items-center justify-center transition cursor-pointer"
                    title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
                  >
                    {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
                  </button>

                  {/* Sound FX Button */}
                  <button
                    type="button"
                    onClick={toggleSound}
                    className="h-8 rounded-lg border border-border bg-surface hover:bg-surface-2 text-text flex items-center justify-center transition cursor-pointer"
                    title={isSoundOn ? 'Suara Feedback Aktif' : 'Suara Dimatikan'}
                  >
                    {isSoundOn ? <Volume2 className="h-4 w-4 text-amber-400" /> : <VolumeX className="h-4 w-4 text-text-muted" />}
                  </button>

                  {/* Shortcut Help Button (F1) */}
                  <button
                    type="button"
                    onClick={() => setIsShortcutHelpOpen(true)}
                    className="h-8 rounded-lg border border-border bg-surface hover:bg-surface-2 text-amber-500 flex items-center justify-center transition cursor-pointer font-bold text-xs"
                    title="Panduan Pintasan Keyboard Pustakawan (F1)"
                  >
                    <Keyboard className="h-4 w-4" />
                  </button>

                  {/* Settings Button */}
                  <button
                    type="button"
                    onClick={() => setIsAdminAuthOpen(true)}
                    className="h-8 rounded-lg border border-border bg-surface hover:bg-surface-2 text-text-muted hover:text-text flex items-center justify-center transition cursor-pointer"
                    title="Pengaturan Sistem & Profil Sekolah"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 1.5 Footer of Sidebar: Switch to Mode Siswa */}
            <div className="p-3 border-t border-border/80 bg-surface-2/40 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setAppMode('KIOSK_ANAK');
                  setActiveTab('OPAC');
                  libraryStore.saveAppMode('KIOSK_ANAK');
                  soundFx.playScanBeep();
                }}
                className={`w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer ${
                  isSidebarCollapsed ? 'justify-center px-0' : 'justify-center'
                }`}
                title="Beralih ke Mode Siswa (Layar Penuh Anak TK)"
              >
                <Monitor className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span>Mode Siswa (Kiosk)</span>}
              </button>

              {!isSidebarCollapsed && (
                <div className="text-[10px] text-text-muted text-center flex items-center justify-between px-1">
                  <span>v1.0.0 Standalone</span>
                  <span className="text-emerald-500 font-medium">● Offline 100%</span>
                </div>
              )}
            </div>
          </aside>
          )}

          {/* ======================================================== */}
          {/* 2. MAIN WORKSPACE & TOP BAR                              */}
          {/* ======================================================== */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            {/* Top Bar (Clean & Slim 54px) */}
            <header className="print:hidden sticky top-0 z-20 h-14 bg-surface/90 backdrop-blur-md border-b border-border px-4 sm:px-6 flex items-center justify-between gap-3 shadow-xs">
              {/* Left: Active Tab Title & Breadcrumb */}
              <div className="flex items-center gap-3">
                <h1 className="text-sm sm:text-base font-bold tracking-tight text-text flex items-center gap-2">
                  {activeTab === 'OPAC' && (
                    <>
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span>{t.catalog}</span>
                    </>
                  )}
                  {activeTab === 'CIRCULATION' && (
                    <>
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span>{t.circulation}</span>
                    </>
                  )}
                  {activeTab === 'BOOKS' && (
                    <>
                      <Layers className="h-4 w-4 text-amber-500" />
                      <span>{t.booksTab}</span>
                    </>
                  )}
                  {activeTab === 'MEMBERS' && (
                    <>
                      <Users className="h-4 w-4 text-amber-500" />
                      <span>{t.members}</span>
                    </>
                  )}
                </h1>
                <span className="text-text-muted text-xs hidden md:inline">•</span>
                <span className="text-xs text-text-muted hidden md:inline">{currentDateStr}</span>
              </div>

              {/* Right: Quick Camera, Language, Librarian Profile */}
              <div className="flex items-center gap-2">
                {/* Camera Scan Button */}
                <button
                  type="button"
                  onClick={() => {
                    setCameraTitle('Scan Barcode via Kamera HP / Laptop');
                    setIsCameraOpen(true);
                  }}
                  className="h-8 px-2.5 rounded-lg border border-border bg-surface hover:bg-surface-2 text-text text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                  title="Gunakan Kamera HP atau Webcam"
                >
                  <Camera className="h-3.5 w-3.5 text-text-muted" />
                  <span className="hidden sm:inline">Kamera</span>
                </button>

                {/* Language Selector */}
                <div className="flex items-center h-8 p-0.5 rounded-lg bg-surface-2 border border-border text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => handleLanguageChange('id')}
                    className={`px-2 py-0.5 rounded-md transition text-[11px] font-semibold cursor-pointer ${
                      language === 'id' ? 'bg-surface text-amber-500 shadow-xs' : 'text-text-muted hover:text-text'
                    }`}
                    title="Bahasa Indonesia"
                  >
                    ID
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLanguageChange('en')}
                    className={`px-2 py-0.5 rounded-md transition text-[11px] font-semibold cursor-pointer ${
                      language === 'en' ? 'bg-surface text-amber-500 shadow-xs' : 'text-text-muted hover:text-text'
                    }`}
                    title="English"
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLanguageChange('zh')}
                    className={`px-2 py-0.5 rounded-md transition text-[11px] font-semibold cursor-pointer ${
                      language === 'zh' ? 'bg-surface text-amber-500 shadow-xs' : 'text-text-muted hover:text-text'
                    }`}
                    title="中文"
                  >
                    ZH
                  </button>
                </div>

                {/* Mode Kiosk Siswa / Layar Penuh Anak */}
                {activeTab === 'OPAC' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAppMode('KIOSK_ANAK');
                      libraryStore.saveAppMode('KIOSK_ANAK');
                      soundFx.playScanBeep();
                    }}
                    className="h-8 px-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    title="Beralih ke Mode Layar Penuh Siswa (Kiosk Anak Tanpa Menu Pustakawan)"
                  >
                    <Monitor className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Mode Siswa (Kiosk)</span>
                  </button>
                )}

                {/* Portal Siswa Quick View */}
                <button
                  type="button"
                  onClick={() => setIsStudentPortalOpen(true)}
                  className="h-8 px-2.5 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  title="Buka Portal Mandiri Siswa & Orang Tua (Buku Impian, Pinjaman & Riwayat)"
                >
                  <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                  <span>Portal Siswa</span>
                </button>
              </div>
            </header>

            {/* Main Content Workspace */}
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6">
              {activeTab === 'OPAC' && (
                <KidsVisualOpac
                  language={language}
                  onSelectBookForLoan={(book) => {
                    setActiveTab('CIRCULATION');
                  }}
                  onOpenScanIsbn={() => setIsScanIsbnOpen(true)}
                  onOpenStudentPortal={() => setIsStudentPortalOpen(true)}
                  onSwitchToKioskMode={() => {
                    setAppMode('KIOSK_ANAK');
                    libraryStore.saveAppMode('KIOSK_ANAK');
                    soundFx.playScanBeep();
                  }}
                />
              )}

              {activeTab === 'CIRCULATION' && (
                <CirculationDesk
                  scannedCode={activeCirculationScan}
                  onClearScannedCode={() => setActiveCirculationScan('')}
                  initialSubTab={circulationSubTab}
                  onOpenScannerCamera={(title) => {
                    setCameraTitle(title);
                    setIsCameraOpen(true);
                  }}
                />
              )}

              {activeTab === 'BOOKS' && (
                <BookManagement
                  key={dataVersion}
                  language={language}
                  onOpenScanIsbn={() => {
                    setScannedIsbnToLookup('');
                    setIsScanIsbnOpen(true);
                  }}
                  onOpenLabelPrinter={handleOpenLabelPrinterWithBarcodes}
                />
              )}

              {activeTab === 'MEMBERS' && (
                <MemberManagement
                  key={dataVersion}
                  onRefresh={() => handleRefreshData()}
                />
              )}
            </main>

            {/* Footer */}
            <footer className="print:hidden border-t border-border bg-surface py-4 text-xs text-text-muted mt-auto">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
                <div>
                  <p className="font-bold text-text">
                    © 2026 {schoolProfile.name} — Sistem Informasi Perpustakaan Digital
                  </p>
                  <p className="text-[11px] text-text-muted">
                    {schoolProfile.tagline} • {schoolProfile.address} • 📞 {schoolProfile.phone}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDevCreditOpen(true)}
                    className="text-amber-500 font-semibold hover:underline cursor-pointer"
                  >
                    Profil Pengembang
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Reset database ke data demo bawaan SBTH TK?')) {
                        libraryStore.resetToDefault();
                        window.location.reload();
                      }
                    }}
                    className="text-text-muted hover:text-rose-500 transition cursor-pointer"
                  >
                    Reset Data Demo
                  </button>
                </div>
              </div>
            </footer>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* 3. MODE SISWA (KIOSK LAYAR PENUH ANAK TK)                */
        /* ======================================================== */
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="print:hidden sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl overflow-hidden border border-border bg-surface-2 shadow-xs flex items-center justify-center shrink-0">
                  <img
                    src={schoolProfile.logoUrl}
                    alt="Logo Sekolah"
                    className="h-full w-full object-contain p-0.5"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo_sbth.png';
                    }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold tracking-tight text-text">
                      SBTH Magelang
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 text-[10px] font-bold">
                      Kiosk Anak
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">
                    KB-TK Bhakti Tunas Harapan
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Font Scaling for Kiosk */}
                <div className="flex items-center h-9 p-0.5 rounded-lg bg-surface-2 border border-border">
                  <button
                    type="button"
                    onClick={() => handleFontSizeChange('normal')}
                    className={`px-2 py-1 rounded text-xs font-bold transition cursor-pointer ${
                      fontSize === 'normal' ? 'bg-surface text-amber-500 shadow-xs' : 'text-text-muted hover:text-text'
                    }`}
                    title="Font Normal"
                  >
                    A-
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFontSizeChange('large')}
                    className={`px-2 py-1 rounded text-xs font-bold transition cursor-pointer ${
                      fontSize === 'large' ? 'bg-surface text-amber-500 shadow-xs' : 'text-text-muted hover:text-text'
                    }`}
                    title="Font Besar"
                  >
                    A
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFontSizeChange('xlarge')}
                    className={`px-2 py-1 rounded text-xs font-bold transition cursor-pointer ${
                      fontSize === 'xlarge' ? 'bg-surface text-amber-500 shadow-xs' : 'text-text-muted hover:text-text'
                    }`}
                    title="Font Ekstra Besar"
                  >
                    A+
                  </button>
                </div>

                {/* Portal Siswa */}
                <button
                  type="button"
                  onClick={() => setIsStudentPortalOpen(true)}
                  className="h-9 px-3.5 rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-slate-950" />
                  <span>Portal Siswa</span>
                </button>

                {/* Pin Protected Return to Mode Pustakawan */}
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(true)}
                  className="h-9 px-3 rounded-lg bg-surface-2 border border-border hover:bg-surface text-text text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  title="Masuk ke Meja Pustakawan"
                >
                  <Lock className="h-3.5 w-3.5 text-amber-400" />
                  <span>Mode Pustakawan</span>
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
            <KidsVisualOpac
              language={language}
              onSelectBookForLoan={(book) => {
                setActiveTab('CIRCULATION');
              }}
              onOpenScanIsbn={() => setIsScanIsbnOpen(true)}
              onOpenStudentPortal={() => setIsStudentPortalOpen(true)}
            />
          </main>

          <footer className="print:hidden border-t border-border bg-surface py-4 text-xs text-text-muted mt-auto text-center">
            <p className="font-bold text-text">
              © 2026 {schoolProfile.name} — Mode Kiosk Layar Penuh Anak
            </p>
          </footer>
        </div>
      )}

      {/* 6. MODALS */}
      <ScanIsbnModal
        isOpen={isScanIsbnOpen}
        onClose={() => setIsScanIsbnOpen(false)}
        initialIsbn={scannedIsbnToLookup}
        onBookAdded={() => handleRefreshData()}
        onOpenLabelPrinter={handleOpenLabelPrinterWithBarcodes}
      />

      <LabelPrintGenerator
        isOpen={isLabelPrinterOpen}
        onClose={() => setIsLabelPrinterOpen(false)}
        preSelectedBarcodes={preSelectedBarcodes}
      />

      <ExcelModuleModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onOpenLabelPrinter={handleOpenLabelPrinterWithBarcodes}
        onDataImported={() => handleRefreshData()}
      />

      <CameraScannerModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onScan={handleCameraScanResult}
        title={cameraTitle}
      />

      <FinanceAndFinesModal
        isOpen={isFinanceOpen}
        onClose={() => setIsFinanceOpen(false)}
        onDataChanged={() => handleRefreshData()}
      />

      <TelegramBackupModal
        isOpen={isTelegramOpen}
        onClose={() => setIsTelegramOpen(false)}
      />

      <WhatsAppCenterModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onProfileUpdated={() => handleRefreshData()}
      />

      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />

      <StudentPortalModal
        isOpen={isStudentPortalOpen}
        language={language}
        onClose={() => {
          setIsStudentPortalOpen(false);
          handleRefreshData();
        }}
      />

      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onSuccess={() => {
          setIsAdminAuthOpen(false);
          setIsSettingsOpen(true);
        }}
      />

      <ShortcutHelpModal
        isOpen={isShortcutHelpOpen}
        onClose={() => setIsShortcutHelpOpen(false)}
        onOpenSettings={() => {
          setIsShortcutHelpOpen(false);
          setIsAdminAuthOpen(true);
        }}
        onNavigate={(tab, subTab) => {
          setIsShortcutHelpOpen(false);
          setActiveTab(tab);
          if (subTab) setCirculationSubTab(subTab as any);
          soundFx.playSuccessChime();
        }}
      />

      <ActivityLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
      />

      <PinAuthModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={() => {
          setAppMode('PUSTAKAWAN');
          libraryStore.saveAppMode('PUSTAKAWAN');
          setIsPinModalOpen(false);
          soundFx.playSuccessChime();
        }}
      />

      {/* DEDICATED PROMOTIONAL & ARCHITECT PROFILE MODAL */}
      <DeveloperProfileModal
        isOpen={isDevCreditOpen}
        onClose={() => setIsDevCreditOpen(false)}
      />
    </div>
  );
}
