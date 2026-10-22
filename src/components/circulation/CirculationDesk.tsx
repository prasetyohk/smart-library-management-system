'use client';

import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  BookCheck,
  CheckCircle,
  AlertTriangle,
  Clock,
  Trash2,
  Users,
  Search,
  Phone,
  Barcode,
  Sparkles,
  ArrowRight,
  User,
  Copy,
  MessageSquare,
  Check,
  History,
  Eye,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Member, BookItem, Book, Loan } from '@/types';
import { CATEGORIES } from '@/lib/constants';
import { libraryStore } from '@/lib/storage';
import { soundFx } from '@/lib/sound';
import { PageHeader } from '@/components/common/PageHeader';
import { Avatar } from '@/components/common/Avatar';
import { SmartBookCover } from '@/components/common/SmartBookCover';

interface CirculationDeskProps {
  onOpenScannerCamera?: (title: string) => void;
  scannedCode?: string;
  onClearScannedCode?: () => void;
  initialSubTab?: 'BORROW' | 'RETURN' | 'RENEW' | 'OVERDUE' | 'INSPECT';
}

export const CirculationDesk: React.FC<CirculationDeskProps> = ({
  onOpenScannerCamera,
  scannedCode,
  onClearScannedCode,
  initialSubTab,
}) => {
  const [isFinanceEnabled, setIsFinanceEnabled] = useState<boolean>(() => libraryStore.getFinanceModuleEnabled());
  const [activeTab, setActiveTab] = useState<'BORROW' | 'RETURN' | 'RENEW' | 'OVERDUE' | 'INSPECT'>('BORROW');

  useEffect(() => {
    const handleSettingsUpdated = () => {
      const enabled = libraryStore.getFinanceModuleEnabled();
      setIsFinanceEnabled(enabled);
      if (!enabled && activeTab === 'OVERDUE') {
        setActiveTab('BORROW');
      }
    };
    window.addEventListener('sbth_settings_updated', handleSettingsUpdated);
    window.addEventListener('storage', handleSettingsUpdated);
    return () => {
      window.removeEventListener('sbth_settings_updated', handleSettingsUpdated);
      window.removeEventListener('storage', handleSettingsUpdated);
    };
  }, [activeTab]);

  useEffect(() => {
    if (initialSubTab) {
      if (initialSubTab === 'OVERDUE' && !libraryStore.getFinanceModuleEnabled()) {
        setActiveTab('BORROW');
      } else {
        setActiveTab(initialSubTab);
      }
    }
  }, [initialSubTab]);

  useEffect(() => {
    if (!isFinanceEnabled && activeTab === 'OVERDUE') {
      setActiveTab('BORROW');
    }
  }, [activeTab, isFinanceEnabled]);

  const [inspectBarcode, setInspectBarcode] = useState<string>('SBTH-B-00101');

  // Borrow Flow State
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberSearch, setMemberSearch] = useState<string>('');
  const [cartBarcodes, setCartBarcodes] = useState<string[]>([]);
  const [loanDurationDays, setLoanDurationDays] = useState<number>(7);

  // Manual input state
  const [manualCodeInput, setManualCodeInput] = useState<string>('');

  // Return Flow State
  const [returnBarcode, setReturnBarcode] = useState<string>('');
  const [returnSelectedMember, setReturnSelectedMember] = useState<Member | null>(null);
  const [returnMemberSearch, setReturnMemberSearch] = useState<string>('');
  const [lastReturnedInfo, setLastReturnedInfo] = useState<{
    item: BookItem;
    book?: Book;
    member?: Member;
    loanDate?: string;
    returnDate?: string;
    condition?: 'GOOD' | 'DAMAGED' | 'LOST';
  } | null>(null);
  const [returnCondition, setReturnCondition] = useState<'GOOD' | 'DAMAGED' | 'LOST'>('GOOD');
  const [todayStr, setTodayStr] = useState<string>('2026-10-15');
  const [selectedOverdueClass, setSelectedOverdueClass] = useState<string>('ALL');
  const [copiedClass, setCopiedClass] = useState<string | null>(null);

  // 🔄 Perpanjangan Pinjaman (Renewal) State
  const [renewSearch, setRenewSearch] = useState<string>('');
  const [renewSelectedMember, setRenewSelectedMember] = useState<Member | null>(null);
  const [renewExtensionDays, setRenewExtensionDays] = useState<number>(7);
  const [lastRenewedResult, setLastRenewedResult] = useState<{
    loanId: string;
    bookTitle: string;
    newDueDate: string;
    renewalCount: number;
  } | null>(null);

  // 🔔 Reservation Hold Alert on Book Return
  const [reservedHoldNotice, setReservedHoldNotice] = useState<{
    reservation: any;
    bookTitle: string;
  } | null>(null);

  useEffect(() => {
    setTodayStr(new Date().toISOString().split('T')[0]);
  }, []);

  const members = libraryStore.getMembers();
  const allItems = libraryStore.getBookItems();
  const allBooks = libraryStore.getBooks();
  const loans = libraryStore.getLoans();

  // Watch scannedCode from global USB scanner / camera router
  useEffect(() => {
    if (!scannedCode) return;

    const clean = scannedCode.trim().toUpperCase();

    // If it's a member code
    if (/^SBTH-[MCT]-/i.test(clean)) {
      const member = members.find((m) => m.memberCode.toUpperCase() === clean);
      if (member) {
        setSelectedMember(member);
        soundFx.playScanBeep();
      } else {
        soundFx.playErrorBeep();
      }
      if (onClearScannedCode) onClearScannedCode();
      return;
    }

    // If it's a book item barcode
    if (/^SBTH-B-/i.test(clean)) {
      if (activeTab === 'RETURN') {
        handleQuickReturn(clean);
      } else if (activeTab === 'INSPECT') {
        setInspectBarcode(clean);
        soundFx.playScanBeep();
      } else {
        handleScanBookToCart(clean);
      }
      if (onClearScannedCode) onClearScannedCode();
      return;
    }
  }, [scannedCode, activeTab, members]);

  // Add book to borrow cart
  const handleScanBookToCart = (barcode: string) => {
    const clean = barcode.trim().toUpperCase();
    const item = allItems.find((i) => i.itemBarcode.toUpperCase() === clean);

    if (!item) {
      alert(`Buku dengan barcode "${clean}" tidak ditemukan di database SBTH.`);
      soundFx.playErrorBeep();
      return;
    }

    if (item.status === 'BORROWED') {
      alert(`Buku ${clean} sedang dipinjam oleh siswa lain! Silakan proses pengembalian terlebih dahulu.`);
      soundFx.playErrorBeep();
      return;
    }

    if (item.status === 'DAMAGED' || item.status === 'LOST') {
      alert(`Buku ${clean} sedang berstatus "${item.status}" (${item.conditionNote}).`);
      soundFx.playErrorBeep();
      return;
    }

    if (cartBarcodes.includes(clean)) {
      soundFx.playScanBeep();
      return;
    }

    const currentLimit = selectedMember?.maxLoanLimit || 2;
    if (cartBarcodes.length >= currentLimit) {
      alert(`Maksimal peminjaman untuk ${selectedMember?.name || 'siswa'} adalah ${currentLimit} buku.`);
      soundFx.playErrorBeep();
      return;
    }

    setCartBarcodes((prev) => [...prev, clean]);
    soundFx.playScanBeep();
  };

  const removeFromCart = (barcode: string) => {
    setCartBarcodes((prev) => prev.filter((b) => b !== barcode));
  };

  // Process loan checkout
  const handleCheckoutLoan = () => {
    if (!selectedMember) {
      alert('Pilih siswa atau scan kartu siswa terlebih dahulu.');
      return;
    }

    if (cartBarcodes.length === 0) {
      alert('Keranjang buku masih kosong. Scan setidaknya 1 buku fisik.');
      return;
    }

    try {
      const activeLibrarian = libraryStore.getCurrentLibrarian();
      const librarianName = activeLibrarian?.name || 'Pustakawan SBTH';

      libraryStore.createLoan(
        selectedMember.id,
        cartBarcodes,
        loanDurationDays,
        'Peminjaman via Sirkulasi Cepat Meja Pustakawan',
        librarianName
      );

      soundFx.playSuccessChime();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      alert(
        `🎉 Sukses! Peminjaman ${cartBarcodes.length} buku untuk "${selectedMember.name}" berhasil dicatat oleh ${librarianName}.\nJatuh tempo dalam ${loanDurationDays} hari.`
      );

      // Reset flow
      setSelectedMember(null);
      setCartBarcodes([]);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan peminjaman.');
      soundFx.playErrorBeep();
    }
  };

  // Process fast book return
  const handleQuickReturn = (barcodeToReturn: string) => {
    const clean = barcodeToReturn.trim().toUpperCase();
    if (!clean) return;

    const activeLibrarian = libraryStore.getCurrentLibrarian();
    const librarianName = activeLibrarian?.name || 'Pustakawan SBTH';

    const result = libraryStore.returnLoanItem(clean, returnCondition, '', librarianName);

    if (!result.success) {
      alert(result.message);
      soundFx.playErrorBeep();
      return;
    }

    const item = allItems.find((i) => i.itemBarcode.toUpperCase() === clean);
    if (!item) return;

    const returningMember = (result.member || returnSelectedMember) || undefined;
    const loanDate = result.loan?.loanDate;
    const returnedBook = libraryStore.getBooks().find((b) => b.id === item.bookId);

    setLastReturnedInfo({
      item,
      book: returnedBook,
      member: returningMember,
      loanDate: loanDate || todayStr,
      returnDate: todayStr,
      condition: returnCondition,
    });

    // Check if there is an active reservation for this book
    const resCheck = libraryStore.checkBookReservationsOnReturn(item.bookId);
    if (resCheck) {
      setReservedHoldNotice({
        reservation: resCheck,
        bookTitle: resCheck.bookTitle || returnedBook?.title || 'Buku SBTH',
      });
      alert(`🔔 PERHATIAN: BUKU TELAH DI-RESERVASI!\nBuku "${returnedBook?.title || 'Buku Cerita'}" sedang dibooking oleh ${resCheck.memberName} (${resCheck.memberClass}).\nMohon simpan di rak reservasi khusus (Masa tunggu 24 jam).`);
    }

    setReturnBarcode('');
    soundFx.playSuccessChime();
  };

  // Process loan extension / renewal
  const handleRenewLoan = (loanId: string, bookTitle: string) => {
    const activeLibrarian = libraryStore.getCurrentLibrarian();
    const librarianName = activeLibrarian?.name || 'Pustakawan SBTH';
    const result = libraryStore.renewLoan(loanId, renewExtensionDays, librarianName);
    if (!result.success) {
      alert(`❌ Perpanjangan Gagal: ${result.message}`);
      soundFx.playErrorBeep();
      return;
    }

    setLastRenewedResult({
      loanId,
      bookTitle,
      newDueDate: result.newDueDate || '',
      renewalCount: 1,
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
    soundFx.playSuccessChime();
    alert(`🎉 Berhasil diperpanjang!\nBuku "${bookTitle}" berhasil diperpanjang +${renewExtensionDays} hari hingga ${result.newDueDate || 'tanggal yang ditentukan'}.`);
  };

  // Overdue loans calculation
  const activeLoans = loans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE');
  const overdueLoans = activeLoans.filter((l) => l.dueDate < todayStr);

  const handleCopyClassOverdueMessage = (targetClass: string) => {
    const targetLoans = overdueLoans.filter((l) => {
      const m = members.find((mem) => mem.id === l.memberId);
      return targetClass === 'ALL' || m?.classGroup === targetClass;
    });

    if (targetLoans.length === 0) {
      alert(`Tidak ada buku terlambat untuk kelas ${targetClass}`);
      return;
    }

    const className = targetClass === 'ALL' ? 'Semua Kelas' : targetClass;
    let msg = `📢 *PENGINGAT PERPUSTAKAAN SBTH TK - KELAS ${className.toUpperCase()}*\n\n`;
    msg += `Halo Papa, Mama, dan Orang Tua/Wali Murid Kelas ${className},\n`;
    msg += `Semoga selalu dalam keadaan sehat dan bahagia sekeluarga. 😊✨\n\n`;
    msg += `Sekadar mengingatkan dari tim perpustakaan sekolah, berikut daftar buku yang saat ini masih dipinjam dan telah melewati jadwal pengembalian:\n\n`;

    targetLoans.forEach((l, idx) => {
      const m = members.find((mem) => mem.id === l.memberId);
      const bookTitles = l.items.map((i) => i.bookTitle).join(', ');
      msg += `${idx + 1}. *${m?.name || 'Siswa'}* (${m?.classGroup || '-'})\n`;
      msg += `   📖 Buku: ${bookTitles}\n`;
      msg += `   ⏳ Jatuh Tempo: ${l.dueDate}\n\n`;
    });

    msg += `Mohon bantuan Papa/Mama untuk mengecek di rumah dan memasukkan buku tersebut ke dalam tas anak untuk dikembalikan ke sekolah besok ya, agar ananda bisa meminjam dan membaca buku cerita seru yang baru lagi. 🎒📚\n\n`;
    msg += `Terima kasih banyak atas kerja sama dan dukungannya! 🙏✨\n\n`;
    msg += `Salam hangat,\n*Perpustakaan SBTH TK*`;

    navigator.clipboard.writeText(msg);
    soundFx.playScanBeep();
    setCopiedClass(targetClass);
    setTimeout(() => setCopiedClass(null), 3000);
    alert(`📋 Pesan tagihan kelas ${className} BERHASIL disalin!\nSilakan buka WhatsApp dan Paste (Ctrl+V) langsung ke Grup WA Orang Tua Kelas.`);
  };

  const filteredMembers = members.filter((m) => {
    if (m.status === 'GRADUATED') return false;
    if (!memberSearch.trim()) return true;
    const q = memberSearch.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      (m.username || '').toLowerCase().includes(q) ||
      m.memberCode.toLowerCase().includes(q) ||
      m.classGroup.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* 1. Page Header: Uniform Pattern */}
      <PageHeader
        icon={<RotateCcw className="h-5 w-5" />}
        title="Sirkulasi & Pinjam-Kembali"
        subtitle="Alur cepat scan barcode untuk peminjaman, pengembalian kilat, dan tagihan buku terlambat"
      />

      {/* 2. Segmented Control Tabs (Underline/Pill Style, Rose badge for overdue) */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-surface border border-border shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('BORROW')}
          className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
            activeTab === 'BORROW'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
              : 'text-text-muted hover:text-text'
          }`}
        >
          <BookCheck className="h-4 w-4" />
          <span>Peminjaman Baru</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('RETURN')}
          className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
            activeTab === 'RETURN'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
              : 'text-text-muted hover:text-text'
          }`}
        >
          <RotateCcw className="h-4 w-4" />
          <span>Pengembalian Kilat</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('RENEW')}
          className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
            activeTab === 'RENEW'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
              : 'text-text-muted hover:text-text'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Perpanjangan Pinjam</span>
        </button>

        {isFinanceEnabled && (
          <button
            type="button"
            onClick={() => setActiveTab('OVERDUE')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
              activeTab === 'OVERDUE'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Buku Terlambat & Denda</span>
            {overdueLoans.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[10px]">
                {overdueLoans.length}
              </span>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('INSPECT')}
          className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
            activeTab === 'INSPECT'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
              : 'text-text-muted hover:text-text'
          }`}
        >
          <History className="h-4 w-4" />
          <span>Cek Riwayat Buku</span>
        </button>
      </div>

      {/* TAB 1: PEMINJAMAN BARU (2-STEP STEPPER WORKFLOW) */}
      {activeTab === 'BORROW' && (
        <div className="space-y-6">
          {/* Stepper Indicator */}
          <div className="flex items-center justify-center max-w-md mx-auto gap-4 py-1">
            <div className="flex items-center gap-2">
              <span
                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                  selectedMember
                    ? 'bg-emerald-500 text-white'
                    : 'bg-amber-500 text-slate-950'
                }`}
              >
                {selectedMember ? '✓' : '1'}
              </span>
              <span className={`text-xs font-semibold ${selectedMember ? 'text-emerald-500' : 'text-text'}`}>
                Pilih Siswa
              </span>
            </div>

            <div
              className={`flex-1 h-0.5 transition ${
                selectedMember ? 'bg-amber-500' : 'bg-border'
              }`}
            />

            <div className="flex items-center gap-2">
              <span
                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                  selectedMember
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-surface-2 text-text-muted border border-border'
                }`}
              >
                2
              </span>
              <span className={`text-xs font-semibold ${selectedMember ? 'text-text' : 'text-text-muted'}`}>
                Scan Buku
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: STEP 1 - PILIH SISWA */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl bg-surface border border-border p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-text flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-xs font-bold">
                      1
                    </span>
                    <span>Pilih Siswa / Anggota</span>
                  </h3>
                  <span className="text-[11px] text-text-muted">Scan kartu / cari nama</span>
                </div>

                {/* Selected Student Card */}
                {selectedMember ? (
                  <div className="rounded-2xl border border-amber-500/50 bg-amber-500/10 p-4 space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => setSelectedMember(null)}
                      className="absolute top-3 right-3 text-xs text-text-muted hover:text-amber-500 font-semibold transition"
                    >
                      Ganti Siswa
                    </button>

                    <div className="flex items-center gap-3.5">
                      <Avatar
                        name={selectedMember.name}
                        src={selectedMember.photoUrl}
                        size="lg"
                        shape="rounded"
                      />
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-500 font-mono text-[10px] font-bold">
                          {selectedMember.memberCode}
                        </span>
                        <h4 className="text-base font-bold text-text mt-0.5">
                          {selectedMember.name}
                        </h4>
                        <p className="text-xs text-text-muted">
                          {selectedMember.classGroup} • Kuota: {selectedMember.maxLoanLimit} Buku
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-text-muted">
                      <span>
                        Wali / Kontak: <strong className="text-text">{selectedMember.parentName}</strong>
                      </span>
                      {selectedMember.parentPhone && (
                        <span className="text-[11px] text-emerald-500 font-mono flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {selectedMember.parentPhone}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Student Search + Visual Grid */
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-muted" />
                      <input
                        type="text"
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        placeholder="Cari nama siswa, username, atau kelas..."
                        className="w-full rounded-xl border border-border bg-surface-2 pl-9 pr-3 py-1.5 text-xs text-text placeholder-text-muted focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                      {filteredMembers.map((member) => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => {
                            setSelectedMember(member);
                            soundFx.playScanBeep();
                          }}
                          className="p-2.5 rounded-xl border border-border hover:border-amber-500/60 bg-surface-2 hover:bg-surface text-left flex items-center gap-2.5 transition group"
                        >
                          <Avatar
                            name={member.name}
                            src={member.photoUrl}
                            size="sm"
                            shape="circle"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-text truncate group-hover:text-amber-500 transition">
                              {member.name}
                            </p>
                            <p className="text-[10px] text-text-muted truncate">
                              {member.username ? `@${member.username} • ` : ''}
                              {member.type === 'TEACHER' ? 'Guru' : member.classGroup}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: STEP 2 - SCAN BUKU KE KERANJANG */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-2xl bg-surface border border-border p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-text flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-xs font-bold">
                      2
                    </span>
                    <span>Scan Barcode Buku</span>
                  </h3>
                  <span className="text-xs font-semibold text-text-muted">
                    Keranjang ({cartBarcodes.length} / {selectedMember?.maxLoanLimit || 2} Buku)
                  </span>
                </div>

                {/* Barcode Input Bar */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Barcode className="absolute left-3.5 top-3 h-4 w-4 text-text-muted animate-pulse" />
                    <input
                      type="text"
                      value={manualCodeInput}
                      onChange={(e) => setManualCodeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (manualCodeInput) {
                            handleScanBookToCart(manualCodeInput);
                            setManualCodeInput('');
                          }
                        }
                      }}
                      placeholder="Scan atau ketik barcode buku fisik (misal: SBTH-B-00101)..."
                      className="w-full rounded-xl border border-border bg-surface-2 pl-10 pr-3 py-2 text-xs font-mono text-text placeholder-text-muted focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (manualCodeInput) {
                        handleScanBookToCart(manualCodeInput);
                        setManualCodeInput('');
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-surface-2 border border-border hover:bg-surface text-text text-xs font-semibold transition"
                  >
                    Tambah
                  </button>
                </div>

                {/* Cart Items List */}
                {cartBarcodes.length === 0 ? (
                  <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center text-text-muted space-y-2 bg-surface-2/40">
                    <Barcode className="h-10 w-10 mx-auto text-text-muted opacity-40 animate-pulse" />
                    <p className="text-xs font-semibold text-text">
                      Belum ada buku di keranjang peminjaman
                    </p>
                    <p className="text-[11px] text-text-muted">
                      Arahkan USB Barcode Scanner ke stiker barcode di sampul belakang buku
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cartBarcodes.map((barcode) => {
                      const item = allItems.find((i) => i.itemBarcode === barcode);
                      const book = item ? allBooks.find((b) => b.id === item.bookId) : undefined;
                      const cat = CATEGORIES.find((c) => c.id === book?.categoryId);

                      return (
                        <div
                          key={barcode}
                          className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface-2"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="h-3 w-3 rounded-full shrink-0"
                              style={{ backgroundColor: cat?.colorHex || '#10B981' }}
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs text-text">
                                  {barcode}
                                </span>
                                <span className="text-[10px] text-text-muted">
                                  Copy #{item?.copyNumber}
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-text mt-0.5">
                                {book?.title}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(barcode)}
                            className="p-1.5 text-text-muted hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition"
                            title="Hapus dari keranjang"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Duration and Confirm Checkout */}
                <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-text-muted font-medium">Durasi Pinjam:</span>
                    <select
                      value={loanDurationDays}
                      onChange={(e) => setLoanDurationDays(parseInt(e.target.value, 10))}
                      className="rounded-xl border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-text outline-hidden cursor-pointer"
                    >
                      <option value={3}>⚡ 3 Hari (Pinjaman Kilat)</option>
                      <option value={7}>📅 1 Minggu (7 Hari - Siswa Standar)</option>
                      <option value={14}>📚 2 Minggu (14 Hari - Guru / Tugas)</option>
                      <option value={30}>🏫 1 Bulan (30 Hari - Pojok Baca Kelas)</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckoutLoan}
                    disabled={!selectedMember || cartBarcodes.length === 0}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition active:scale-95"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Konfirmasi Peminjaman ({cartBarcodes.length} Buku)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PENGEMBALIAN BUKU (4 LANGKAH LENGKAP & KILAT) */}
      {activeTab === 'RETURN' && (() => {
        const memberActiveLoans = returnSelectedMember
          ? loans.filter((l) => l.memberId === returnSelectedMember.id && (l.status === 'ACTIVE' || l.status === 'OVERDUE'))
          : [];
        const memberBorrowedItems = memberActiveLoans.flatMap((l) =>
          l.items
            .filter((it) => !it.returnDate)
            .map((it) => ({
              ...it,
              loanDate: l.loanDate,
              dueDate: l.dueDate,
              loanId: l.id,
            }))
        );

        return (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
            {/* Header / Guide */}
            <div className="rounded-2xl bg-surface border border-border p-6 shadow-xs space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
                  <RotateCcw className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-display text-text">
                    Pengembalian Buku Perpustakaan
                  </h3>
                  <p className="text-xs text-text-muted">
                    Ikuti 4 langkah: Pilih Siswa (opsional/otomatis), tentukan kondisi fisik buku, scan barcode, dan cek ringkasan pengembalian.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* LEFT COLUMN: LANGKAH 1 - PILIH SISWA / ANGGOTA */}
              <div className="md:col-span-5 space-y-4">
                <div className="rounded-2xl bg-surface border border-border p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-text flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
                        1
                      </span>
                      <span>Pilih Siswa / Anggota / Username</span>
                    </h4>
                    {returnSelectedMember && (
                      <button
                        type="button"
                        onClick={() => {
                          setReturnSelectedMember(null);
                          setReturnMemberSearch('');
                        }}
                        className="text-[10px] text-amber-500 hover:underline font-bold"
                      >
                        Ganti Siswa
                      </button>
                    )}
                  </div>

                  {returnSelectedMember ? (
                    <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={returnSelectedMember.name} src={returnSelectedMember.photoUrl} size="md" shape="rounded" />
                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-xs text-text truncate">{returnSelectedMember.name}</h5>
                          <p className="text-[11px] text-text-muted truncate">
                            {returnSelectedMember.username ? `@${returnSelectedMember.username} • ` : ''}
                            {returnSelectedMember.classGroup}
                          </p>
                          <span className="inline-block mt-0.5 font-mono text-[9px] font-bold text-amber-500 bg-amber-500/20 px-1.5 py-0.5 rounded">
                            {returnSelectedMember.memberCode}
                          </span>
                        </div>
                      </div>

                      {/* Member's currently borrowed books */}
                      <div className="pt-2 border-t border-amber-500/20 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-text">Buku Sedang Dipinjam:</span>
                          <span className="font-bold text-amber-500">{memberBorrowedItems.length} Buku</span>
                        </div>

                        {memberBorrowedItems.length === 0 ? (
                          <p className="text-[11px] text-emerald-500 italic bg-emerald-500/10 p-2 rounded-lg text-center">
                            ✅ Siswa ini tidak memiliki pinjaman aktif saat ini.
                          </p>
                        ) : (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {memberBorrowedItems.map((bi) => (
                              <div
                                key={bi.id}
                                className="p-2 rounded-lg bg-surface border border-border flex items-center justify-between gap-2 text-xs"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-text truncate text-[11px]">{bi.bookTitle}</p>
                                  <span className="font-mono text-[10px] text-amber-500 font-semibold">{bi.itemBarcode}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleQuickReturn(bi.itemBarcode)}
                                  className="px-2 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] shrink-0 cursor-pointer shadow-xs"
                                >
                                  Kembalikan
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-muted" />
                        <input
                          type="text"
                          value={returnMemberSearch}
                          onChange={(e) => setReturnMemberSearch(e.target.value)}
                          placeholder="Cari nama siswa, @username, atau kode..."
                          className="w-full rounded-xl border border-border bg-surface-2 pl-9 pr-3 py-1.5 text-xs text-text placeholder-text-muted focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto pr-1">
                        {members
                          .filter((m) => {
                            if (m.status === 'GRADUATED') return false;
                            if (!returnMemberSearch.trim()) return true;
                            const q = returnMemberSearch.toLowerCase();
                            return (
                              m.name.toLowerCase().includes(q) ||
                              (m.username && m.username.toLowerCase().includes(q)) ||
                              m.memberCode.toLowerCase().includes(q) ||
                              m.classGroup.toLowerCase().includes(q)
                            );
                          })
                          .slice(0, 8)
                          .map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                setReturnSelectedMember(m);
                                soundFx.playScanBeep();
                              }}
                              className="p-2 rounded-xl border border-border bg-surface-2 hover:border-amber-500/50 hover:bg-surface text-left transition flex items-center justify-between gap-2 cursor-pointer"
                            >
                              <div className="min-w-0">
                                <h5 className="font-bold text-xs text-text truncate">{m.name}</h5>
                                <p className="text-[10px] text-text-muted truncate">
                                  {m.username ? `@${m.username} • ` : ''}
                                  {m.classGroup}
                                </p>
                              </div>
                              <span className="font-mono text-[9px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0">
                                {m.memberCode}
                              </span>
                            </button>
                          ))}
                      </div>
                      <p className="text-[10px] text-text-muted italic text-center">
                        *Tips: Atau bisa langsung scan barcode buku di Langkah 3 (sistem otomatis mengenali siswa).
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: LANGKAH 2 & 3 - KONDISI DAN SCAN */}
              <div className="md:col-span-7 space-y-4">
                {/* LANGKAH 2: PILIH KONDISI */}
                <div className="rounded-2xl bg-surface border border-border p-5 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-text flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
                      2
                    </span>
                    <span>Pilih Kondisi Fisik Buku Saat Kembali</span>
                  </h4>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setReturnCondition('GOOD');
                        soundFx.playScanBeep();
                      }}
                      className={`p-2.5 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 border cursor-pointer ${
                        returnCondition === 'GOOD'
                          ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm'
                          : 'bg-surface-2 text-text-muted border-border hover:text-text'
                      }`}
                    >
                      <span className="text-base">✨</span>
                      <span>Bagus / Mulus</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setReturnCondition('DAMAGED');
                        soundFx.playScanBeep();
                      }}
                      className={`p-2.5 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 border cursor-pointer ${
                        returnCondition === 'DAMAGED'
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                          : 'bg-surface-2 text-text-muted border-border hover:text-text'
                      }`}
                    >
                      <span className="text-base">⚠️</span>
                      <span>Robek / Rusak</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setReturnCondition('LOST');
                        soundFx.playScanBeep();
                      }}
                      className={`p-2.5 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 border cursor-pointer ${
                        returnCondition === 'LOST'
                          ? 'bg-rose-500 text-white border-rose-400 shadow-sm'
                          : 'bg-surface-2 text-text-muted border-border hover:text-text'
                      }`}
                    >
                      <span className="text-base">❌</span>
                      <span>Hilang</span>
                    </button>
                  </div>
                </div>

                {/* LANGKAH 3: SCAN & KEMBALIKAN */}
                <div className="rounded-2xl bg-surface border border-border p-5 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-text flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
                      3
                    </span>
                    <span>Scan Barcode & Klik Kembalikan</span>
                  </h4>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Barcode className="absolute left-3.5 top-3 h-4 w-4 text-text-muted animate-pulse" />
                      <input
                        type="text"
                        value={returnBarcode}
                        onChange={(e) => setReturnBarcode(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleQuickReturn(returnBarcode);
                          }
                        }}
                        placeholder="Scan atau ketik barcode buku (misal: SBTH-B-00101)..."
                        className="w-full rounded-xl border border-border bg-surface-2 pl-10 pr-3 py-2.5 text-xs font-mono font-bold text-text placeholder-text-muted focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuickReturn(returnBarcode)}
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer shrink-0"
                    >
                      Kembalikan Buku
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 🔔 Alert Banner: Reservation Hold Alert */}
            {reservedHoldNotice && (
              <div className="rounded-2xl border-2 border-amber-500 bg-amber-500/15 p-5 shadow-md space-y-3 animate-in zoom-in-95">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-amber-500 font-bold text-sm">
                    <span className="text-xl">🔔</span>
                    <span>PERHATIAN: BUKU TELAH DI-RESERVASI (BOOKING)!</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReservedHoldNotice(null)}
                    className="p-1 text-text-muted hover:text-text rounded-lg hover:bg-surface-2 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-3.5 rounded-xl bg-surface border border-amber-500/40 space-y-1 text-xs">
                  <p className="text-text font-bold">
                    Buku &ldquo;{reservedHoldNotice.bookTitle}&rdquo; telah dipesan oleh:
                  </p>
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <span>👤 {reservedHoldNotice.reservation.memberName}</span>
                    <span>({reservedHoldNotice.reservation.memberClass || 'Siswa'})</span>
                  </div>
                  <p className="text-[11px] text-text-muted pt-1">
                    📦 <strong>Instruksi Pustakawan:</strong> Jangan langsung letakkan di rak umum! Simpan di <em>Rak Reservasi Khusus</em> selama <strong>1x24 Jam</strong> (hingga {reservedHoldNotice.reservation.expiryDate}).
                  </p>
                </div>
              </div>
            )}

            {/* LANGKAH 4: OUTPUT RINGKASAN PENGEMBALIAN LENGKAP */}
            {lastReturnedInfo && (
              <div className="rounded-2xl border-2 border-emerald-500/50 bg-emerald-500/10 p-5 shadow-md space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
                    <CheckCircle className="h-5 w-5" />
                    <span>Langkah 4: Buku Berhasil Dikembalikan! Stok Otomatis Tersedia di Rak.</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-xs font-extrabold shadow-xs">
                    ✓ TERSEDIA DI RAK
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-border grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Info Peminjam */}
                  <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-border pb-3 md:pb-0 md:pr-4">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
                      Data Peminjam / Siswa:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-text">
                        {lastReturnedInfo.member?.name || 'Siswa SBTH'}
                      </span>
                      {lastReturnedInfo.member?.username && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 font-bold text-[10px]">
                          @{lastReturnedInfo.member.username}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-muted">
                      Kelas: <strong className="text-text">{lastReturnedInfo.member?.classGroup || '-'}</strong> • Kode: <span className="font-mono">{lastReturnedInfo.member?.memberCode || '-'}</span>
                    </p>
                  </div>

                  {/* Info Buku & Tanggal */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">
                      Detail Buku & Transaksi:
                    </span>
                    <h5 className="font-bold text-xs text-text line-clamp-1">
                      {lastReturnedInfo.book?.title}
                    </h5>
                    <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                      <span className="text-amber-500 font-bold">
                        {lastReturnedInfo.item.itemBarcode}
                      </span>
                      {lastReturnedInfo.book?.shelfLocation && (
                        <span className="text-text-muted font-sans text-[10px]">
                          📍 {lastReturnedInfo.book.shelfLocation}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div className="p-1.5 rounded-lg bg-surface-2 border border-border">
                        <span className="text-text-muted block text-[9px]">📅 Tanggal Pinjam:</span>
                        <strong className="text-text">{lastReturnedInfo.loanDate}</strong>
                      </div>
                      <div className="p-1.5 rounded-lg bg-surface-2 border border-border">
                        <span className="text-text-muted block text-[9px]">📅 Tanggal Kembali:</span>
                        <strong className="text-emerald-500">{lastReturnedInfo.returnDate}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* TAB: PERPANJANGAN PINJAMAN (RENEWAL WORKFLOW) */}
      {activeTab === 'RENEW' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Pilih Siswa / Guru yang ingin perpanjang */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl bg-surface border border-border p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-text flex items-center gap-2">
                    <Users className="h-4 w-4 text-amber-500" />
                    <span>Pilih Peminjam</span>
                  </h3>
                  <span className="text-[11px] text-text-muted">Cari nama / kelas</span>
                </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-muted" />
                    <input
                      type="text"
                      value={renewSearch}
                      onChange={(e) => setRenewSearch(e.target.value)}
                      placeholder="Ketik nama siswa, username, atau kelas..."
                      className="w-full rounded-xl border border-border bg-surface-2 pl-9 pr-3 py-1.5 text-xs text-text placeholder-text-muted focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {/* Member Search Grid / Selection */}
                  {renewSelectedMember ? (
                    <div className="rounded-2xl border border-amber-500/50 bg-amber-500/10 p-4 space-y-3 relative">
                      <button
                        type="button"
                        onClick={() => setRenewSelectedMember(null)}
                        className="absolute top-3 right-3 text-xs text-text-muted hover:text-amber-500 font-semibold"
                      >
                        Ganti Anggota
                      </button>
                      <div className="flex items-center gap-3">
                        <Avatar name={renewSelectedMember.name} src={renewSelectedMember.photoUrl} size="md" shape="rounded" />
                        <div>
                          <span className="font-mono text-[10px] font-bold text-amber-500 bg-amber-500/15 px-1.5 py-0.5 rounded">
                            {renewSelectedMember.memberCode}
                          </span>
                          <h4 className="text-sm font-bold text-text mt-0.5">{renewSelectedMember.name}</h4>
                          <p className="text-xs text-text-muted">
                            {renewSelectedMember.username ? `@${renewSelectedMember.username} • ` : ''}
                            {renewSelectedMember.type === 'TEACHER' ? 'Guru' : renewSelectedMember.classGroup}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                      {members
                        .filter((m) => {
                          if (m.status === 'GRADUATED') return false;
                          if (!renewSearch.trim()) return true;
                          const q = renewSearch.toLowerCase();
                          return (
                            m.name.toLowerCase().includes(q) ||
                            (m.username || '').toLowerCase().includes(q) ||
                            m.classGroup.toLowerCase().includes(q) ||
                            m.memberCode.toLowerCase().includes(q)
                          );
                        })
                        .map((m) => {
                          const hasActive = loans.some((l) => l.memberId === m.id && (l.status === 'ACTIVE' || l.status === 'OVERDUE'));
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                setRenewSelectedMember(m);
                                soundFx.playScanBeep();
                              }}
                              className={`p-2 rounded-xl border text-left flex items-center gap-2 transition ${
                                hasActive
                                  ? 'border-amber-500/40 bg-surface-2 hover:bg-surface'
                                  : 'border-border bg-surface-2/60 opacity-60 hover:opacity-100'
                              }`}
                            >
                              <Avatar name={m.name} src={m.photoUrl} size="sm" shape="circle" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-text truncate">{m.name}</p>
                                <p className="text-[10px] text-text-muted truncate">
                                  {m.username ? `@${m.username}` : m.classGroup}
                                </p>
                                <span className={`text-[10px] font-bold ${hasActive ? 'text-amber-500' : 'text-text-muted'}`}>
                                  {hasActive ? 'Ada Pinjaman' : '0 Pinjaman'}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  )}
              </div>
            </div>

            {/* RIGHT COLUMN: Active loans and Renewal controls */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-2xl bg-surface border border-border p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-text flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-500" />
                      <span>Daftar Pinjaman Aktif</span>
                    </h3>
                    <p className="text-[11px] text-text-muted">
                      Pilih buku yang ingin diperpanjang masa pinjamnya
                    </p>
                  </div>

                  {/* Extension Duration selector */}
                  <div className="flex items-center gap-1.5 bg-surface-2 p-1 rounded-xl border border-border">
                    <span className="text-[11px] font-medium text-text-muted px-2">Tambah Durasi:</span>
                    {[
                      { days: 3, label: '+3 Hari' },
                      { days: 7, label: '+7 Hari (1 Mgg)' },
                      { days: 14, label: '+14 Hari (2 Mgg)' },
                    ].map((opt) => (
                      <button
                        key={opt.days}
                        type="button"
                        onClick={() => setRenewExtensionDays(opt.days)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                          renewExtensionDays === opt.days
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                            : 'text-text-muted hover:text-text'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Loans listing */}
                {(() => {
                  if (!renewSelectedMember) {
                    return (
                      <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center text-text-muted space-y-2 bg-surface-2/30">
                        <Users className="h-8 w-8 mx-auto text-text-muted opacity-40" />
                        <p className="text-xs font-semibold text-text">Pilih siswa atau guru di sebelah kiri</p>
                        <p className="text-[11px] text-text-muted">Riwayat buku yang sedang dipinjam akan otomatis muncul di sini</p>
                      </div>
                    );
                  }

                  const memberActiveLoans = loans.filter(
                    (l) => l.memberId === renewSelectedMember.id && (l.status === 'ACTIVE' || l.status === 'OVERDUE')
                  );

                  if (memberActiveLoans.length === 0) {
                    return (
                      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center text-emerald-400 space-y-1">
                        <CheckCircle className="h-8 w-8 mx-auto" />
                        <p className="text-xs font-bold text-text">Tidak Ada Buku yang Sedang Dipinjam</p>
                        <p className="text-[11px] text-text-muted">Seluruh pinjaman siswa ini sudah dikembalikan atau belum ada peminjaman baru.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {memberActiveLoans.map((loan) => (
                        <div key={loan.id} className="p-4 rounded-2xl border border-border bg-surface-2 space-y-3">
                          <div className="flex items-center justify-between text-xs text-text-muted pb-2 border-b border-border">
                            <span>No. Peminjaman: <strong className="font-mono text-text">{loan.id}</strong></span>
                            <span>Tgl Pinjam: <strong className="text-text">{loan.loanDate}</strong></span>
                          </div>

                          <div className="space-y-2">
                            {loan.items.map((li) => {
                              const isOverdue = loan.dueDate < todayStr;
                              const renewCount = loan.renewalCount || 0;
                              const maxRenew = renewSelectedMember.type === 'TEACHER' ? 2 : 1;
                              const canRenew = renewCount < maxRenew;

                              return (
                                <div key={li.bookItemId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-surface border border-border">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-[10px] font-bold text-amber-500 bg-amber-500/15 px-1.5 py-0.5 rounded">
                                        {li.itemBarcode}
                                      </span>
                                      <h4 className="text-xs font-bold text-text truncate">{li.bookTitle}</h4>
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px] text-text-muted mt-1">
                                      <span>Jatuh Tempo: <strong className={isOverdue ? 'text-rose-500' : 'text-emerald-500'}>{loan.dueDate}</strong></span>
                                      <span>•</span>
                                      <span>Diperpanjang: <strong>{renewCount}/{maxRenew}x</strong></span>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleRenewLoan(loan.id, li.bookTitle)}
                                    disabled={!canRenew}
                                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 shrink-0"
                                  >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    <span>{canRenew ? `Perpanjang (+${renewExtensionDays} Hari)` : 'Batas Habis'}</span>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OVERDUE MONITOR */}
      {activeTab === 'OVERDUE' && (
        <div className="rounded-2xl bg-surface border border-border p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <h3 className="text-base font-bold font-display text-text flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-500" />
                <span>Daftar Buku Terlambat Dikembalikan</span>
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Peringatan otomatis untuk mengingatkan orang tua murid via WhatsApp
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-rose-500/15 text-rose-500 font-bold text-xs border border-rose-500/30 self-start sm:self-auto">
              {overdueLoans.length} Transaksi Telat
            </span>
          </div>

          {overdueLoans.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-text-muted space-y-2">
              <CheckCircle className="h-10 w-10 mx-auto text-emerald-500 opacity-80" />
              <p className="text-sm font-bold text-text">Hebat! Tidak Ada Buku yang Terlambat</p>
              <p className="text-xs text-text-muted">
                Seluruh peminjaman buku aktif masih dalam batas jadwal pengembalian.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Filter by Class to copy class reminder message */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-surface-2 border border-border text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-text-muted font-medium">Kirim Pengingat per Kelas:</span>
                  <select
                    value={selectedOverdueClass}
                    onChange={(e) => setSelectedOverdueClass(e.target.value)}
                    className="rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-text outline-hidden"
                  >
                    <option value="ALL">Semua Kelas Terlambat</option>
                    {Array.from(
                      new Set(
                        overdueLoans.map(
                          (l) => members.find((m) => m.id === l.memberId)?.classGroup || ''
                        ).filter(Boolean)
                      )
                    ).map((cls) => (
                      <option key={cls} value={cls}>
                        Kelas {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyClassOverdueMessage(selectedOverdueClass)}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>
                    {copiedClass === selectedOverdueClass
                      ? '✓ Tersalin ke Clipboard'
                      : 'Salin Teks Pengingat WA Kelas'}
                  </span>
                </button>
              </div>

              {/* Overdue Items List */}
              <div className="divide-y divide-border">
                {overdueLoans.map((loan) => {
                  const member = members.find((m) => m.id === loan.memberId);
                  const bookTitles = loan.items.map((i) => i.bookTitle).join(', ');

                  return (
                    <div
                      key={loan.id}
                      className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={member?.name || 'Siswa'}
                          src={member?.photoUrl}
                          size="sm"
                          shape="circle"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-text">
                              {member?.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-text-muted font-mono">
                              {member?.classGroup}
                            </span>
                          </div>
                          <p className="text-xs text-text-muted mt-0.5">
                            Buku: <strong className="text-text">{bookTitles}</strong>
                          </p>
                          <p className="text-[11px] text-rose-500 font-semibold mt-0.5">
                            Jatuh tempo: {loan.dueDate} (Lewat batas)
                          </p>
                        </div>
                      </div>

                      {member?.parentPhone && (
                        <a
                          href={`https://wa.me/${member.parentPhone.replace(/[^0-9]/g, '')}?text=Halo%20Bunda%2FAyah%20dari%20${encodeURIComponent(
                            member.name
                          )}%2C%20sekadar%20mengingatkan%20buku%20perpustakaan%20SBTH%20TK%20("${encodeURIComponent(
                            bookTitles
                          )}")%20telah%20melewati%20jadwal%20kembali.%20Bisa%20dibawa%20besok%20ya%20Bunda.%20Terima%20kasih!`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg border border-border bg-surface-2 hover:bg-surface text-emerald-500 font-semibold text-xs flex items-center gap-1.5 transition self-end sm:self-auto"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>WhatsApp Ortu</span>
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: INSPEKSI BARCODE & RIWAYAT BUKU */}
      {activeTab === 'INSPECT' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Search/Scanner Dropzone Box */}
          <div className="rounded-2xl bg-surface border border-border p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
                <input
                  type="text"
                  value={inspectBarcode}
                  onChange={(e) => setInspectBarcode(e.target.value)}
                  placeholder="Ketik judul buku, nama penulis, atau scan barcode buku (contoh: Dongeng, SBTH-B-00101)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-2 text-xs text-text placeholder-text-muted focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onOpenScannerCamera) onOpenScannerCamera('Scan Barcode Buku untuk Cek Riwayat');
                }}
                className="px-4 py-2.5 rounded-xl border border-border bg-surface-2 hover:bg-surface text-text font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Barcode className="h-4 w-4 text-amber-500" />
                <span>Buka Kamera</span>
              </button>
            </div>

            {/* Quick Sample Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-text-muted">Coba Cepat:</span>
              {allItems.slice(0, 7).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setInspectBarcode(item.itemBarcode);
                    soundFx.playScanBeep();
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono transition border cursor-pointer ${
                    inspectBarcode.trim().toUpperCase() === item.itemBarcode
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-2xs'
                      : 'bg-surface-2 text-text-muted border-border hover:text-text'
                  }`}
                >
                  {item.itemBarcode} ({item.status === 'AVAILABLE' ? 'Ada di Rak' : item.status === 'BORROWED' ? 'Dipinjam' : item.status})
                </button>
              ))}
            </div>
          </div>

          {/* Inspection Result */}
          {(() => {
            const cleanQuery = inspectBarcode.trim();
            // 1. Direct item barcode match
            const info = libraryStore.getItemCirculationInfo(cleanQuery);
            if (info.item) {
              const item = info.item;
              const book = info.book;
              const current = info.currentLoan;
              const cat = CATEGORIES.find((c) => c.id === book?.categoryId);
              return (
                <div className="space-y-4">
                {/* Book & Item Profile Card */}
                <div className="rounded-2xl bg-surface border border-border p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-24 w-18 rounded-xl overflow-hidden shrink-0 border border-border bg-surface-2 shadow-xs">
                        <SmartBookCover
                          title={book?.title || 'Judul Buku'}
                          author={book?.author}
                          coverUrl={book?.coverImage}
                          categoryId={book?.categoryId}
                          aspectRatio="h-full w-full"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-500">
                          {cat?.name || 'Koleksi Umum'}
                        </span>
                        <h3 className="text-base font-bold text-text leading-snug">
                          {book?.title || 'Judul Buku'}
                        </h3>
                        <p className="text-xs text-text-muted">
                          {book?.author} • {book?.publisher} ({book?.publicationYear})
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className="text-xs font-mono font-bold text-text bg-surface-2 px-2 py-0.5 rounded-md border border-border">
                            {item.itemBarcode} (Copy #{item.copyNumber})
                          </span>
                          <span className="text-xs text-text-muted">
                            Lokasi: <strong className="text-text">{cat?.shelfLocation || 'Rak Utama'}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="self-start sm:self-auto">
                      {item.status === 'AVAILABLE' && (
                        <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 font-bold text-xs flex items-center gap-1.5 shadow-2xs">
                          <CheckCircle className="h-4 w-4" />
                          <span>Tersedia di Rak</span>
                        </div>
                      )}
                      {item.status === 'BORROWED' && (
                        <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 font-bold text-xs flex items-center gap-1.5 shadow-2xs">
                          <Clock className="h-4 w-4" />
                          <span>Sedang Dipinjam</span>
                        </div>
                      )}
                      {item.status === 'IN_REPAIR' && (
                        <div className="px-3.5 py-1.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-500 font-bold text-xs flex items-center gap-1.5 shadow-2xs">
                          <RotateCcw className="h-4 w-4" />
                          <span>Dalam Perbaikan</span>
                        </div>
                      )}
                      {item.status === 'DAMAGED' && (
                        <div className="px-3.5 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-500 font-bold text-xs flex items-center gap-1.5 shadow-2xs">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Rusak</span>
                        </div>
                      )}
                      {item.status === 'LOST' && (
                        <div className="px-3.5 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-500 font-bold text-xs flex items-center gap-1.5 shadow-2xs">
                          <Clock className="h-4 w-4" />
                          <span>Hilang</span>
                        </div>
                      )}
                      {item.status === 'DISPOSED' && (
                        <div className="px-3.5 py-1.5 rounded-xl bg-slate-500/15 border border-slate-500/30 text-slate-400 font-bold text-xs flex items-center gap-1.5 shadow-2xs">
                          <Trash2 className="h-4 w-4" />
                          <span>Dimusnahkan</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* If Currently Borrowed: Detail Peminjam */}
                  {current && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={current.member.name} src={current.member.photoUrl} size="md" shape="circle" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-text">{current.member.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-text-muted font-mono">
                              {current.member.classGroup}
                            </span>
                          </div>
                          <p className="text-xs text-text-muted mt-0.5">
                            Dipinjam sejak: <strong className="text-text">{current.loan.loanDate}</strong> • Jatuh Tempo:{' '}
                            <strong className={current.loan.dueDate < todayStr ? 'text-rose-500' : 'text-text'}>
                              {current.loan.dueDate}
                            </strong>
                            {current.loan.dueDate < todayStr && (
                              <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500 text-white">
                                Terlambat
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {current.member.parentPhone && (
                          <a
                            href={`https://wa.me/${current.member.parentPhone.replace(/[^0-9]/g, '')}?text=Halo%20Bunda%2FAyah%20dari%20${encodeURIComponent(current.member.name)}%2C%20menanyakan%20status%20buku%20perpustakaan%20SBTH%20TK%20("${encodeURIComponent(book?.title || '')}").`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg border border-border bg-surface-2 hover:bg-surface text-emerald-500 font-semibold text-xs flex items-center gap-1.5 transition"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>WA Wali</span>
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Kembalikan eksemplar ${item.itemBarcode} sekarang?`)) {
                              libraryStore.returnBookItem(item.itemBarcode, 'GOOD');
                              soundFx.playSuccessChime();
                              setInspectBarcode(item.itemBarcode);
                            }
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Kembalikan Buku</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* If Lost or Damaged: Quick Found Button */}
                  {(item.status === 'LOST' || item.status === 'DAMAGED' || item.status === 'IN_REPAIR') && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                          <CheckCircle className="h-4 w-4" />
                          <span>Buku Ketemu Lagi / Sudah Selesai Diperbaiki?</span>
                        </div>
                        <p className="text-[11px] text-text-muted mt-0.5">
                          Tandai buku ini kembali normal agar siap dipinjam oleh siswa lain di rak.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          libraryStore.updateItemStatus(item.id, 'AVAILABLE', 'Buku ditemukan kembali / selesai diperbaiki');
                          soundFx.playSuccessChime();
                          setInspectBarcode(item.itemBarcode);
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition shrink-0 cursor-pointer"
                      >
                        Tandai Ada di Rak
                      </button>
                    </div>
                  )}
                </div>

                {/* History Table */}
                <div className="rounded-2xl bg-surface border border-border p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-2">
                      <History className="h-4 w-4 text-amber-500" />
                      <span>Riwayat Peminjaman Buku Ini ({info.history.length} Transaksi)</span>
                    </h4>
                  </div>

                  {info.history.length === 0 ? (
                    <p className="text-xs text-text-muted py-4 text-center italic">
                      Eksemplar fisik ini belum pernah dipinjam siswa.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-border text-text-muted font-semibold">
                            <th className="py-2.5 px-3">Tanggal Pinjam</th>
                            <th className="py-2.5 px-3">Peminjam</th>
                            <th className="py-2.5 px-3">Kelas</th>
                            <th className="py-2.5 px-3">Tanggal Kembali</th>
                            <th className="py-2.5 px-3">Kondisi / Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {info.history.map((h, idx) => (
                            <tr key={idx} className="hover:bg-surface-2 transition">
                              <td className="py-2.5 px-3 font-mono text-text">{h.loan.loanDate}</td>
                              <td className="py-2.5 px-3 font-semibold text-text">{h.member.name}</td>
                              <td className="py-2.5 px-3 text-text-muted">{h.member.classGroup}</td>
                              <td className="py-2.5 px-3 font-mono text-text">
                                {h.loanItem.returnDate || <span className="text-amber-500 font-bold">Sedang Dipinjam</span>}
                              </td>
                              <td className="py-2.5 px-3">
                                {h.loanItem.returnDate ? (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-bold text-[10px]">
                                    Kembali ({h.loanItem.returnCondition || 'Baik'})
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 font-bold text-[10px]">
                                    Belum Kembali
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // 2. Search by Book Title, Author, or ISBN
          if (cleanQuery.length >= 2) {
            const q = cleanQuery.toLowerCase();
            const matchingBooks = allBooks.filter(
              (b) =>
                b.title.toLowerCase().includes(q) ||
                b.author.toLowerCase().includes(q) ||
                b.isbn.replace(/[-\s]/g, '').includes(q.replace(/[-\s]/g, '')) ||
                (b.publisher && b.publisher.toLowerCase().includes(q))
            );

            if (matchingBooks.length > 0) {
              return (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-text">
                      Ditemukan {matchingBooks.length} judul buku yang cocok dengan &ldquo;{cleanQuery}&rdquo;:
                    </h4>
                    <span className="text-[11px] text-text-muted">
                      Klik salah satu eksemplar fisik di bawah untuk cek riwayat lengkap
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matchingBooks.map((b) => {
                      const bookCopies = allItems.filter((i) => i.bookId === b.id);
                      const cat = CATEGORIES.find((c) => c.id === b.categoryId);

                      return (
                        <div
                          key={b.id}
                          className="rounded-2xl bg-surface border border-border p-4 shadow-xs space-y-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-20 w-14 rounded-lg overflow-hidden shrink-0 border border-border bg-surface-2 shadow-xs">
                              <SmartBookCover
                                title={b.title}
                                author={b.author}
                                coverUrl={b.coverImage}
                                categoryId={b.categoryId}
                                aspectRatio="h-full w-full"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-bold text-amber-500 block">
                                {cat?.name || 'Koleksi'} • {cat?.shelfLocation || 'Rak'}
                              </span>
                              <h5 className="text-xs font-bold text-text truncate mt-0.5">
                                {b.title}
                              </h5>
                              <p className="text-[11px] text-text-muted truncate">
                                {b.author} • {b.publisher} ({b.publicationYear})
                              </p>
                              <span className="text-[10px] text-text-muted font-mono block mt-1">
                                ISBN: {b.isbn}
                              </span>
                            </div>
                          </div>

                          {/* Physical copies with live status chips */}
                          <div className="space-y-1.5 pt-2 border-t border-border">
                            <span className="text-[11px] font-semibold text-text-muted block">
                              Eksemplar Fisik ({bookCopies.length} Salinan di Sekolah):
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {bookCopies.map((copy) => {
                                const copyLoan = loans.find(
                                  (l) =>
                                    l.items.some(
                                      (li) => li.itemBarcode === copy.itemBarcode && !li.returnDate
                                    ) &&
                                    (l.status === 'ACTIVE' || l.status === 'OVERDUE')
                                );
                                const borrower = copyLoan
                                  ? members.find((m) => m.id === copyLoan.memberId)
                                  : null;

                                return (
                                  <button
                                    key={copy.id}
                                    type="button"
                                    onClick={() => {
                                      setInspectBarcode(copy.itemBarcode);
                                      soundFx.playScanBeep();
                                    }}
                                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-mono flex items-center gap-1.5 transition cursor-pointer ${
                                      copy.status === 'AVAILABLE'
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20'
                                        : copy.status === 'BORROWED'
                                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20'
                                        : 'bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20'
                                    }`}
                                    title={
                                      borrower
                                        ? `Dipinjam oleh ${borrower.name} (${borrower.classGroup})`
                                        : 'Tersedia di rak'
                                    }
                                  >
                                    <span className="font-bold">{copy.itemBarcode}</span>
                                    <span className="text-[10px] font-sans">
                                      ({copy.status === 'AVAILABLE'
                                        ? 'Ada di Rak'
                                        : copy.status === 'BORROWED'
                                        ? `Dipinjam ${borrower?.name.split(' ')[0] || ''}`
                                        : copy.status === 'LOST'
                                        ? 'Hilang'
                                        : copy.status === 'DAMAGED'
                                        ? 'Rusak'
                                        : copy.status})
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
          }

          // 3. Fallback not found
          return (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center space-y-2 bg-surface">
              <Search className="h-10 w-10 text-text-muted mx-auto opacity-40" />
              <h4 className="text-sm font-bold text-text">Buku atau Barcode Tidak Ditemukan</h4>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                Pencarian &ldquo;{cleanQuery || '-'}&rdquo; tidak cocok dengan barcode maupun judul buku cerita anak SBTH. Silakan coba judul lain (contoh: Dongeng, Panda, Stroberi) atau scan barcode fisik.
              </p>
            </div>
          );
        })()}
        </div>
      )}
    </div>
  );
};
