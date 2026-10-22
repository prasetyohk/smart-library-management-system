'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  X,
  Plus,
  CheckCircle,
  Clock,
  Ban,
  HeartHandshake,
  AlertTriangle,
  QrCode,
  Settings,
  BookOpen,
  Save,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Check,
  FileDown,
  Printer,
  Search,
  Award,
  RotateCcw,
  History,
  Sparkles,
  TrendingUp,
  BarChart3,
  Layers,
  Tag,
  ChevronRight,
  ClipboardCheck,
} from 'lucide-react';
import { FineAndDonation, FineType, FinePaymentStatus, LoanRules, BookItem, Book } from '@/types';
import { CATEGORIES } from '@/lib/constants';
import { libraryStore } from '@/lib/storage';
import { soundFx } from '@/lib/sound';

interface FinanceAndFinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged?: () => void;
}

export const FinanceAndFinesModal: React.FC<FinanceAndFinesModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
}) => {
  const [activeTab, setActiveTab] = useState<'TRANSACTIONS' | 'RULES' | 'QRIS' | 'RECAP'>('TRANSACTIONS');
  const [filterType, setFilterType] = useState<FineType | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<FinePaymentStatus | 'ALL'>('ALL');
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);

  // New fine/donation state
  const [memberId, setMemberId] = useState<string>('m-01');
  const [type, setType] = useState<FineType>('DENDA_TERLAMBAT');
  const [amount, setAmount] = useState<number>(10000);
  const [notes, setNotes] = useState<string>('');
  const [paidStatus, setPaidStatus] = useState<FinePaymentStatus>('PAID');

  // Rules state
  const [rules, setRules] = useState<LoanRules>(libraryStore.getLoanRules());
  const [isRulesSaved, setIsRulesSaved] = useState<boolean>(false);

  // QRIS Payment Calculator state
  const [selectedStudentForQris, setSelectedStudentForQris] = useState<string>('m-01');
  const [qrisCustomAmount, setQrisCustomAmount] = useState<number>(5000);
  const [qrisSuccessMsg, setQrisSuccessMsg] = useState<string>('');

  // Tab 4 (Rekap Inventaris) state
  const [inventoryTab, setInventoryTab] = useState<'ALL' | 'NEW' | 'DAMAGED' | 'DONORS'>('ALL');
  const [inventorySearch, setInventorySearch] = useState<string>('');
  const [isStockOpnameOpen, setIsStockOpnameOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [selectedDonorForCert, setSelectedDonorForCert] = useState<{
    donorName: string;
    bookTitle: string;
    date: string;
    estimatedValue: number;
    barcode: string;
  } | null>(null);

  // Replace Damaged Copy modal state
  const [damagedItemToReplace, setDamagedItemToReplace] = useState<{
    item: BookItem;
    bookTitle: string;
  } | null>(null);
  const [replacementNoteInput, setReplacementNoteInput] = useState<string>('');

  // Stock Opname temporary check states
  const [checkedBarcodeList, setCheckedBarcodeList] = useState<Record<string, boolean>>({});
  const [opnameBarcodeScan, setOpnameBarcodeScan] = useState<string>('');

  const members = libraryStore.getMembers();
  const fines = libraryStore.getFines();
  const summary = libraryStore.getFinancialSummary();
  const books = libraryStore.getBooks();
  const allBookItems = libraryStore.getBookItems();
  const schoolProfile = libraryStore.getSchoolProfile();

  useEffect(() => {
    if (isOpen) {
      setRules(libraryStore.getLoanRules());
      setIsRulesSaved(false);
      setQrisSuccessMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Transactions filter
  const filteredFines = fines.filter((f) => {
    if (filterType !== 'ALL' && f.type !== filterType) return false;
    if (filterStatus !== 'ALL' && f.paidStatus !== filterStatus) return false;
    return true;
  });

  // Calculate Asset Metrics
  const totalCopiesCount = allBookItems.length;
  
  // 1. Total Nilai Aset Aktif (Sehat: AVAILABLE + BORROWED + IN_REPAIR)
  const activeHealthyItems = allBookItems.filter(
    (i) => i.status === 'AVAILABLE' || i.status === 'BORROWED' || i.status === 'IN_REPAIR'
  );
  const activeHealthyValue = activeHealthyItems.reduce(
    (acc, i) => acc + (typeof i.priceValue === 'number' ? i.priceValue : 45000),
    0
  );

  // 2. Aset Pembelian Sekolah (Anggaran/BOS)
  const schoolPurchaseItems = allBookItems.filter((i) => i.source === 'BELI_SEKOLAH');
  const schoolPurchaseValue = schoolPurchaseItems.reduce(
    (acc, i) => acc + (typeof i.priceValue === 'number' ? i.priceValue : 45000),
    0
  );

  // 3. Aset Hibah / Sumbangan Ortu (strictly supports 0 value)
  const donorGrantItems = allBookItems.filter((i) => i.source === 'SUMBANGAN');
  const donorGrantValue = donorGrantItems.reduce(
    (acc, i) => acc + (typeof i.priceValue === 'number' ? i.priceValue : 0),
    0
  );

  // 4. Nilai Penyusutan (Buku Rusak & Hilang)
  const damagedLostItems = allBookItems.filter(
    (i) => i.status === 'DAMAGED' || i.status === 'LOST' || i.status === 'DISPOSED'
  );
  const damagedLostValue = damagedLostItems.reduce(
    (acc, i) => acc + (typeof i.priceValue === 'number' ? i.priceValue : 45000),
    0
  );
  const replacedCount = allBookItems.filter((i) => i.isReplaced).length;

  // Real-time physical distribution
  const inShelfItems = allBookItems.filter((i) => i.status === 'AVAILABLE');
  const inShelfValue = inShelfItems.reduce(
    (acc, i) => acc + (typeof i.priceValue === 'number' ? i.priceValue : 45000),
    0
  );

  const borrowedItems = allBookItems.filter((i) => i.status === 'BORROWED');
  const borrowedValue = borrowedItems.reduce(
    (acc, i) => acc + (typeof i.priceValue === 'number' ? i.priceValue : 45000),
    0
  );

  const inRepairItems = allBookItems.filter((i) => i.status === 'IN_REPAIR');
  const inRepairValue = inRepairItems.reduce(
    (acc, i) => acc + (typeof i.priceValue === 'number' ? i.priceValue : 45000),
    0
  );

  // Categories breakdown
  const categoryBreakdown = CATEGORIES.map((cat) => {
    const catItems = allBookItems.filter((item) => {
      const b = books.find((bk) => bk.id === item.bookId);
      return b?.categoryId === cat.id;
    });
    const val = catItems.reduce(
      (acc, i) => acc + (typeof i.priceValue === 'number' ? i.priceValue : 45000),
      0
    );
    const count = catItems.length;
    const percentage = totalCopiesCount > 0 ? Math.round((count / totalCopiesCount) * 100) : 0;
    const isLowStock = count < 5;

    return {
      cat,
      count,
      val,
      percentage,
      isLowStock,
    };
  });

  // Inventory Table Filtered Items
  const inventoryFilteredItems = allBookItems
    .map((item) => {
      const parentBook = books.find((b) => b.id === item.bookId);
      return {
        item,
        book: parentBook,
      };
    })
    .filter(({ item, book }) => {
      if (!book) return false;

      if (inventoryTab === 'NEW') {
        // Books added recently (e.g. 2026 or last 30 days)
        const isNew = item.createdAt?.startsWith('2026') || book.createdAt?.startsWith('2026');
        if (!isNew) return false;
      } else if (inventoryTab === 'DAMAGED') {
        // Damaged, lost, disposed or replaced
        const isDamaged =
          item.status === 'DAMAGED' ||
          item.status === 'LOST' ||
          item.status === 'DISPOSED' ||
          item.isReplaced;
        if (!isDamaged) return false;
      } else if (inventoryTab === 'DONORS') {
        // Books from donors
        if (item.source !== 'SUMBANGAN' && !item.donorName && !book.donorName) return false;
      }

      if (inventorySearch.trim()) {
        const q = inventorySearch.toLowerCase();
        const matchesTitle = book.title.toLowerCase().includes(q);
        const matchesBarcode = item.itemBarcode.toLowerCase().includes(q);
        const matchesDonor = (item.donorName || book.donorName || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesBarcode && !matchesDonor) return false;
      }

      return true;
    });

  const handleCreateFine = (e: React.FormEvent) => {
    e.preventDefault();
    libraryStore.addFine({
      memberId,
      type,
      amount: Math.max(0, amount),
      paidStatus,
      paidAt: paidStatus === 'PAID' ? new Date().toISOString().split('T')[0] : undefined,
      notes: notes.trim(),
    });

    soundFx.playSuccessChime();
    setIsAddOpen(false);
    setNotes('');
    if (onDataChanged) onDataChanged();
  };

  const handleUpdateStatus = (id: string, nextStatus: FinePaymentStatus) => {
    libraryStore.updateFineStatus(id, nextStatus);
    soundFx.playSuccessChime();
    if (onDataChanged) onDataChanged();
  };

  const handleSaveRules = (e: React.FormEvent) => {
    e.preventDefault();
    libraryStore.saveLoanRules(rules);
    setIsRulesSaved(true);
    soundFx.playSuccessChime();
    setTimeout(() => setIsRulesSaved(false), 3000);
    if (onDataChanged) onDataChanged();
  };

  const handleSimulateQrisPayment = () => {
    const student = members.find((m) => m.id === selectedStudentForQris);
    libraryStore.addFine({
      memberId: selectedStudentForQris,
      type: 'DENDA_TERLAMBAT',
      amount: qrisCustomAmount,
      paidStatus: 'PAID',
      paidAt: new Date().toISOString().split('T')[0],
      notes: `Pembayaran Lunas via QRIS Perpustakaan SBTH (${student?.name || 'Siswa'})`,
    });
    soundFx.playSuccessChime();
    setQrisSuccessMsg(
      `✓ Pembayaran QRIS Rp ${qrisCustomAmount.toLocaleString('id-ID')} untuk ${student?.name} berhasil diverifikasi & tercatat lunas!`
    );
    if (onDataChanged) onDataChanged();
  };

  // Replace damaged item action
  const handleConfirmReplaceDamaged = (e: React.FormEvent) => {
    e.preventDefault();
    if (!damagedItemToReplace) return;

    libraryStore.replaceDamagedItemWithNew(
      damagedItemToReplace.item.id,
      replacementNoteInput.trim() || 'Buku fisik baru telah diterima dan menggantikan buku rusak.'
    );
    soundFx.playSuccessChime();
    setDamagedItemToReplace(null);
    setReplacementNoteInput('');
    if (onDataChanged) onDataChanged();
  };

  // Stock Opname logic
  const handleOpenStockOpname = () => {
    const initialMap: Record<string, boolean> = {};
    // By default mark available items as checked or ready for audit
    allBookItems.forEach((item) => {
      initialMap[item.itemBarcode] = item.status === 'AVAILABLE';
    });
    setCheckedBarcodeList(initialMap);
    setIsStockOpnameOpen(true);
  };

  const handleToggleOpnameBarcode = (barcode: string) => {
    setCheckedBarcodeList((prev) => ({
      ...prev,
      [barcode]: !prev[barcode],
    }));
    soundFx.playScanBeep();
  };

  const handleScanOpnameInput = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = opnameBarcodeScan.trim().toUpperCase();
    if (!clean) return;

    const found = allBookItems.find((i) => i.itemBarcode.toUpperCase() === clean);
    if (found) {
      setCheckedBarcodeList((prev) => ({
        ...prev,
        [found.itemBarcode]: true,
      }));
      soundFx.playSuccessChime();
      setOpnameBarcodeScan('');
    } else {
      soundFx.playErrorBeep();
      alert(`Barcode "${clean}" tidak ditemukan dalam sistem koleksi SBTH.`);
    }
  };

  const handleFinishStockOpname = () => {
    const total = allBookItems.length;
    const verified = Object.values(checkedBarcodeList).filter(Boolean).length;
    const matchPercentage = total > 0 ? Math.round((verified / total) * 100) : 100;
    const today = new Date().toISOString().split('T')[0];

    const summaryText = `Audit Fisik: ${verified}/${total} Eksemplar Sesuai (${matchPercentage}%)`;
    libraryStore.saveStockOpnameRecord({
      id: `opname-${Date.now().toString(36)}`,
      date: today,
      totalBooksAudited: total,
      matchedCount: verified,
      missingCount: total - verified,
      auditedBy: `${schoolProfile.librarianName || 'Pustakawan'} (Perpustakaan SBTH)`,
      notes: `Stock opname berkala aset perpustakaan KB-TK SBTH. Status kesesuaian fisik ${matchPercentage}%.`,
    });

    soundFx.playSuccessChime();
    setRules((prev) => ({
      ...prev,
      lastStockOpnameDate: today,
      lastStockOpnameSummary: summaryText,
    }));
    setIsStockOpnameOpen(false);
    if (onDataChanged) onDataChanged();
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'No',
      'Kode Barcode SBTH',
      'Judul Buku',
      'Kategori',
      'Sumber Perolehan',
      'Pemberi Sumbangan',
      'Nilai Buku (Rp)',
      'Status Fisik',
      'Posisi Rak',
    ];
    const rows = allBookItems.map((item, idx) => {
      const b = books.find((bk) => bk.id === item.bookId);
      const cat = CATEGORIES.find((c) => c.id === b?.categoryId);
      const val = typeof item.priceValue === 'number' ? item.priceValue : 45000;
      return [
        idx + 1,
        `"${item.itemBarcode}"`,
        `"${b?.title || ''}"`,
        `"${cat?.name || ''}"`,
        `"${item.source === 'BELI_SEKOLAH' ? 'Pembelian Kas/BOS' : 'Sumbangan/Hibah'}"`,
        `"${item.donorName || b?.donorName || '-'}"`,
        val,
        `"${item.status}"`,
        `"${item.shelfLocation || b?.shelfLocation || cat?.shelfLocation || '-'}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Laporan_Aset_Inventaris_Perpus_SBTH_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-surface border-l border-border h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* 1. Neutral Header (No religious terms) */}
        <div className="flex items-center justify-between border-b border-border p-5 bg-surface shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 border border-border shrink-0 shadow-2xs">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-display text-text">
                  Keuangan, Kas Perpustakaan & Aturan Denda
                </h2>
                <span className="bg-amber-500/15 text-amber-500 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Akuntabilitas Sekolah
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Pengelolaan kas keterlambatan, ganti buku rusak/hilang, serta pembayaran QRIS
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

        {/* 2. Underline Tab Navigation */}
        <div className="flex border-b border-border bg-surface px-5 gap-6 text-xs font-semibold shrink-0 overflow-x-auto no-scrollbar">
          {[
            { id: 'TRANSACTIONS', label: 'Transaksi Kas & Denda', icon: Wallet },
            { id: 'RULES', label: 'Aturan Denda & Pinjam', icon: Settings },
            { id: 'QRIS', label: 'Sistem Pembayaran QRIS', icon: QrCode },
            { id: 'RECAP', label: 'Rekap Nilai Inventaris', icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as any);
                  soundFx.playScanBeep();
                }}
                className={`py-3.5 flex items-center gap-2 whitespace-nowrap border-b-2 transition ${
                  isActive
                    ? 'border-amber-500 text-amber-500 font-bold'
                    : 'border-transparent text-text-muted hover:text-text'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3. Drawer Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-text">
          
          {/* TAB 1: TRANSAKSI KAS & DENDA */}
          {activeTab === 'TRANSACTIONS' && (
            <div className="space-y-6">
              {/* Financial KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="rounded-2xl p-4 bg-surface-2 border border-border shadow-xs">
                  <span className="text-[11px] font-semibold text-text-muted block">
                    Kas Denda Masuk
                  </span>
                  <p className="text-xl sm:text-2xl font-bold font-display text-emerald-500 mt-1 tabular-nums">
                    Rp {summary.dendaTerlambat.toLocaleString('id-ID')}
                  </p>
                  <span className="text-[10px] text-text-muted mt-0.5 block">Telah masuk kas</span>
                </div>

                <div className="rounded-2xl p-4 bg-surface-2 border border-border shadow-xs">
                  <span className="text-[11px] font-semibold text-text-muted block">
                    Ganti Rusak / Hilang
                  </span>
                  <p className="text-xl sm:text-2xl font-bold font-display text-text mt-1 tabular-nums">
                    Rp {summary.gantiRusakHilang.toLocaleString('id-ID')}
                  </p>
                  <span className="text-[10px] text-text-muted mt-0.5 block">Telah dibayar ortu</span>
                </div>

                <div className="rounded-2xl p-4 bg-surface-2 border border-border shadow-xs">
                  <span className="text-[11px] font-semibold text-text-muted block">
                    Sumbangan Tunai
                  </span>
                  <p className="text-xl sm:text-2xl font-bold font-display text-text mt-1 tabular-nums">
                    Rp {summary.sumbanganTunai.toLocaleString('id-ID')}
                  </p>
                  <span className="text-[10px] text-text-muted mt-0.5 block">Donasi kas sukarela</span>
                </div>

                <div className="rounded-2xl p-4 bg-surface-2 border border-border shadow-xs">
                  <span className="text-[11px] font-semibold text-text-muted block">
                    Tunggakan Belum Lunas
                  </span>
                  <p className="text-xl sm:text-2xl font-bold font-display text-rose-500 mt-1 tabular-nums">
                    Rp {summary.tunggakanBelumLunas.toLocaleString('id-ID')}
                  </p>
                  <span className="text-[10px] text-rose-500/80 mt-0.5 block">
                    {summary.unpaidCount} transaksi belum lunas
                  </span>
                </div>
              </div>

              {/* Filter & Add Transaction Action */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                  <span className="text-text-muted text-[11px] mr-1">Tipe:</span>
                  {(['ALL', 'DENDA_TERLAMBAT', 'GANTI_RUSAK', 'SUMBANGAN_TUNAI'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFilterType(t)}
                      className={`px-3 py-1.5 rounded-xl transition ${
                        filterType === t
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                          : 'bg-surface-2 text-text-muted hover:text-text'
                      }`}
                    >
                      {t === 'ALL'
                        ? 'Semua'
                        : t === 'DENDA_TERLAMBAT'
                        ? 'Denda'
                        : t === 'GANTI_RUSAK'
                        ? 'Ganti Buku'
                        : 'Donasi Tunai'}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>Catat Transaksi Manual</span>
                </button>
              </div>

              {/* Transactions Table */}
              <div className="rounded-2xl border border-border overflow-hidden bg-surface shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-2 text-text-muted border-b border-border sticky top-0 font-semibold">
                      <tr>
                        <th className="py-3 px-4">Tanggal</th>
                        <th className="py-3 px-4 min-w-[180px]">Siswa / Donatur</th>
                        <th className="py-3 px-4">Jenis Kas</th>
                        <th className="py-3 px-4 text-right">Nominal</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4">Catatan</th>
                        <th className="py-3 px-4 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y border-border">
                      {filteredFines.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-text-muted">
                            Tidak ada catatan transaksi keuangan yang sesuai filter.
                          </td>
                        </tr>
                      ) : (
                        filteredFines.map((item) => {
                          const member = members.find((m) => m.id === item.memberId);
                          return (
                            <tr key={item.id} className="hover:bg-surface-2/60 transition">
                              <td className="py-3 px-4 font-mono text-text-muted whitespace-nowrap">
                                {item.createdAt}
                              </td>
                              <td className="py-3 px-4 min-w-[180px]">
                                <p className="font-semibold text-text truncate">
                                  {member?.name || 'Siswa SBTH'}
                                </p>
                                <span className="text-[10px] text-text-muted">
                                  {member?.classGroup || ''}
                                </span>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-surface-2 text-text-muted border border-border">
                                  {item.type.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-semibold text-text whitespace-nowrap tabular-nums">
                                Rp {item.amount.toLocaleString('id-ID')}
                              </td>
                              <td className="py-3 px-4 text-center whitespace-nowrap">
                                {item.paidStatus === 'PAID' ? (
                                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 text-[10px] font-bold border border-emerald-500/30">
                                    LUNAS
                                  </span>
                                ) : item.paidStatus === 'UNPAID' ? (
                                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-500 text-[10px] font-bold border border-rose-500/30">
                                    BELUM LUNAS
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full bg-surface-2 text-text-muted text-[10px] font-semibold border border-border">
                                    DIBEBASKAN
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-text-muted text-[11px] max-w-xs truncate" title={item.notes}>
                                {item.notes || '-'}
                              </td>
                              <td className="py-3 px-4 text-center whitespace-nowrap">
                                {item.paidStatus === 'UNPAID' && (
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStatus(item.id, 'PAID')}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white font-semibold text-[10px] transition"
                                    >
                                      Tandai Lunas
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateStatus(item.id, 'WAIVED')}
                                      className="px-2 py-1 rounded-lg border border-border text-text-muted hover:text-text text-[10px] transition"
                                    >
                                      Bebaskan
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ATURAN DENDA & LAMA PINJAM */}
          {activeTab === 'RULES' && (
            <form onSubmit={handleSaveRules} className="space-y-5 max-w-2xl">
              <div className="p-4 rounded-2xl bg-surface-2 border border-border space-y-1">
                <h4 className="text-sm font-bold text-text flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-amber-500" />
                  <span>Kebijakan Sirkulasi & Tertib Buku</span>
                </h4>
                <p className="text-xs text-text-muted">
                  Seluruh penerimaan kas denda dialokasikan 100% untuk pembelian buku cerita baru demi kemajuan literasi ananda.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Tarif Kas Denda per Hari (Rp):
                  </label>
                  <input
                    type="number"
                    step={100}
                    min={0}
                    required
                    value={rules.finePerDay}
                    onChange={(e) => setRules({ ...rules, finePerDay: Number(e.target.value) })}
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-text outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                  <p className="text-[11px] text-text-muted mt-1">Default standar: Rp 500 per hari</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Lama Peminjaman Standar (Hari):
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    required
                    value={rules.loanDurationDays}
                    onChange={(e) => setRules({ ...rules, loanDurationDays: Number(e.target.value) })}
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-text outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                  <p className="text-[11px] text-text-muted mt-1">Standar TK: 7 hari (1 minggu)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Jadwal Pengingat Otomatis:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={rules.loanDurationDays}
                      required
                      value={rules.loanDurationDays - rules.reminderDayBefore}
                      onChange={(e) => {
                        const day = Number(e.target.value);
                        setRules({
                          ...rules,
                          reminderDayBefore: Math.max(1, rules.loanDurationDays - day),
                        });
                      }}
                      className="w-20 rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-bold text-center text-text outline-hidden"
                    />
                    <span className="text-xs text-text-muted">Hari ke- (H-1 sebelum jatuh tempo)</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Jam Pengiriman Pengingat:
                  </label>
                  <input
                    type="time"
                    required
                    value={rules.reminderTimeStr}
                    onChange={(e) => setRules({ ...rules, reminderTimeStr: e.target.value })}
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-bold text-text outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1">
                  Catatan Edukasi & Tujuan Kas:
                </label>
                <textarea
                  rows={2}
                  value={rules.finesPurpose}
                  onChange={(e) => setRules({ ...rules, finesPurpose: e.target.value })}
                  className="w-full rounded-xl border border-border bg-surface-2 p-3 text-xs text-text outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {isRulesSaved && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-500 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Pengaturan aturan pinjam berhasil disimpan!</span>
                </div>
              )}

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs flex items-center gap-2 transition active:scale-95"
              >
                <Save className="h-4 w-4" />
                <span>Simpan Aturan Denda</span>
              </button>
            </form>
          )}

          {/* TAB 3: SISTEM PEMBAYARAN QRIS */}
          {activeTab === 'QRIS' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="bg-surface-2 p-6 rounded-2xl border border-border text-center space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="text-left">
                      <span className="text-[10px] tracking-wider uppercase text-text-muted block">
                        QRIS STANDAR NASIONAL
                      </span>
                      <h4 className="text-xs font-bold text-text">{rules.qrisMerchantName}</h4>
                    </div>
                    <span className="text-[10px] font-mono bg-surface px-2 py-0.5 rounded-md border border-border text-text-muted">
                      NMID: {rules.qrisNmid}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl mx-auto w-48 h-48 shadow-xs border border-border flex items-center justify-center">
                    {rules.qrisImageUrl ? (
                      <img
                        src={rules.qrisImageUrl}
                        alt="QRIS Perpustakaan SBTH"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center p-3 text-slate-400">
                        <QrCode className="h-12 w-12 mx-auto mb-1 opacity-40" />
                        <span className="text-[11px]">QRIS belum diunggah</span>
                      </div>
                    )}
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-[11px] font-semibold text-text">
                      BCA • Mandiri • BRI • BNI • GoPay • OVO • ShopeePay • Bank Jateng
                    </p>
                    {rules.bankAccountNumber && (
                      <p className="text-[11px] font-mono font-bold text-amber-500 bg-surface py-1 px-2.5 rounded-lg border border-border inline-block mt-1">
                        🏦 Rekening {rules.bankName || 'Bank'}: {rules.bankAccountNumber} (a.n. {rules.bankAccountHolder || 'Perpustakaan SBTH'})
                      </p>
                    )}
                    <p className="text-[10px] text-text-muted">
                      Scan via Mobile Banking untuk pembayaran denda atau dana kas perpustakaan
                    </p>
                  </div>
                </div>

                <div className="space-y-4 bg-surface-2 p-5 rounded-2xl border border-border">
                  <h4 className="text-sm font-bold text-text flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-amber-500" />
                    <span>Verifikasi Pembayaran QRIS</span>
                  </h4>

                  <div>
                    <label className="text-xs font-semibold text-text block mb-1">
                      Pilih Siswa yang Membayar:
                    </label>
                    <select
                      value={selectedStudentForQris}
                      onChange={(e) => {
                        setSelectedStudentForQris(e.target.value);
                        const calculated = libraryStore.calculateStudentFineAmount(e.target.value);
                        setQrisCustomAmount(calculated > 0 ? calculated : 5000);
                      }}
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text outline-hidden"
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.classGroup}) - {m.memberCode}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text block mb-1">
                      Nominal Denda / Kas QRIS (Rp):
                    </label>
                    <input
                      type="number"
                      step={500}
                      min={500}
                      value={qrisCustomAmount}
                      onChange={(e) => setQrisCustomAmount(Number(e.target.value))}
                      className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs font-bold text-text outline-hidden"
                    />
                  </div>

                  {qrisSuccessMsg && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-500 font-semibold">
                      {qrisSuccessMsg}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSimulateQrisPayment}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition active:scale-95"
                  >
                    Verifikasi Pembayaran QRIS Lunas
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REKAP NILAI INVENTARIS (Full Accountability Dashboard) */}
          {activeTab === 'RECAP' && (
            <div className="space-y-6">
              
              {/* Top Action Bar with Export & Stock Opname */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface-2 border border-border">
                <div>
                  <h3 className="text-sm font-bold text-text flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-amber-500" />
                    <span>Valuasi Aset Koleksi Fisik Sekolah</span>
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-emerald-500" />
                    <span>
                      {rules.lastStockOpnameSummary || 'Audit Fisik Terakhir: 15 Okt 2026 — Sesuai 100%'}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(true)}
                    className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-2 border border-border text-xs font-semibold text-text flex items-center justify-center gap-1.5 transition"
                    title="Cetak Berita Acara / Laporan Resmi Yayasan"
                  >
                    <Printer className="h-3.5 w-3.5 text-text-muted" />
                    <span>Export Laporan</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenStockOpname}
                    className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    <span>Stock Opname / Audit Rak</span>
                  </button>
                </div>
              </div>

              {/* 1. 4 Core Valuation Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Total Aset Aktif (Sehat) */}
                <div className="p-4 rounded-2xl bg-surface-2 border border-border shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-text-muted">
                      Total Nilai Aset Aktif
                    </span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold font-display text-emerald-500 tabular-nums">
                    Rp {activeHealthyValue.toLocaleString('id-ID')}
                  </p>
                  <span className="text-[10px] text-text-muted block">
                    {activeHealthyItems.length} Eksemplar Kondisi Sehat
                  </span>
                </div>

                {/* Aset Pembelian Sekolah */}
                <div className="p-4 rounded-2xl bg-surface-2 border border-border shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-text-muted">
                      Aset Pembelian Sekolah
                    </span>
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold font-display text-text tabular-nums">
                    Rp {schoolPurchaseValue.toLocaleString('id-ID')}
                  </p>
                  <span className="text-[10px] text-text-muted block">
                    {schoolPurchaseItems.length} Eks (Anggaran/BOS/Yayasan)
                  </span>
                </div>

                {/* Aset Hibah / Sumbangan Ortu (Strictly supports 0) */}
                <div className="p-4 rounded-2xl bg-surface-2 border border-border shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-text-muted">
                      Aset Hibah / Sumbangan
                    </span>
                    <span className="h-2 w-2 rounded-full bg-purple-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold font-display text-text tabular-nums">
                    Rp {donorGrantValue.toLocaleString('id-ID')}
                  </p>
                  <span className="text-[10px] text-text-muted block">
                    {donorGrantItems.length} Eks (Donasi Orang Tua / Sukarela)
                  </span>
                </div>

                {/* Nilai Penyusutan (Rusak/Hilang) */}
                <div className="p-4 rounded-2xl bg-surface-2 border border-border shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-text-muted">
                      Nilai Penyusutan
                    </span>
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold font-display text-rose-500 tabular-nums">
                    Rp {damagedLostValue.toLocaleString('id-ID')}
                  </p>
                  <span className="text-[10px] text-rose-500/80 block">
                    {damagedLostItems.length} Eks ({damagedLostItems.length > 0 ? '1 Belum Ganti' : 'Semua Lunas'})
                  </span>
                </div>
              </div>

              {/* 2 & 3. Real-Time Physical Distribution & Category Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 2. Rincian Status Fisik Buku Saat Ini */}
                <div className="p-5 rounded-2xl bg-surface-2 border border-border space-y-3">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <h4 className="text-xs font-bold text-text flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-amber-500" />
                      <span>Posisi & Kondisi Fisik Saat Ini</span>
                    </h4>
                    <span className="text-[10px] text-text-muted font-mono">
                      Total: {totalCopiesCount} Eks
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-surface border border-border/60">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <span className="text-text font-medium">Tersedia di Rak</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-text">{inShelfItems.length} Buku</span>
                        <span className="text-[10px] text-text-muted ml-1.5">
                          (Rp {inShelfValue.toLocaleString('id-ID')})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-surface border border-border/60">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        <span className="text-text font-medium">Sedang Dipinjam (Sirkulasi)</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-text">{borrowedItems.length} Buku</span>
                        <span className="text-[10px] text-text-muted ml-1.5">
                          (Rp {borrowedValue.toLocaleString('id-ID')})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-surface border border-border/60">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                        <span className="text-text font-medium">Sedang Diperbaiki (Dilem Guru)</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-text">{inRepairItems.length} Buku</span>
                        <span className="text-[10px] text-text-muted ml-1.5">
                          (Rp {inRepairValue.toLocaleString('id-ID')})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-surface border border-border/60">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                        <span className="text-text font-medium">Rusak Berat / Hilang</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-rose-500">{damagedLostItems.length} Buku</span>
                        <span className="text-[10px] text-rose-500/80 ml-1.5">
                          (Rp {damagedLostValue.toLocaleString('id-ID')})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Distribusi Aset per Kategori Rak (Rencana Belanja) */}
                <div className="p-5 rounded-2xl bg-surface-2 border border-border space-y-3">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <h4 className="text-xs font-bold text-text flex items-center gap-1.5">
                      <BarChart3 className="h-4 w-4 text-amber-500" />
                      <span>Distribusi Aset per Kategori Rak</span>
                    </h4>
                    <span className="text-[10px] text-text-muted">Untuk Rencana Belanja</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {categoryBreakdown.map(({ cat, count, val, percentage, isLowStock }) => (
                      <div key={cat.id} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-medium text-text flex items-center gap-1.5">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: cat.colorHex }}
                            />
                            {cat.name}
                          </span>
                          <div className="flex items-center gap-2">
                            {isLowStock && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-amber-500/15 text-amber-500 border border-amber-500/30">
                                Perlu Tambah Stok
                              </span>
                            )}
                            <span className="font-mono text-text">
                              {count} Eks ({percentage}%) • Rp {val.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden border border-border/40">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: cat.colorHex,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Tabel Log Mutasi & Riwayat Inventaris (4 Filter Tabs) */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {/* Filter Tabs */}
                  <div className="flex flex-wrap items-center gap-1 text-xs font-semibold">
                    {[
                      { id: 'ALL', label: `Semua Aset (${allBookItems.length})` },
                      {
                        id: 'NEW',
                        label: `Buku Baru Masuk (${
                          allBookItems.filter((i) => i.createdAt?.startsWith('2026')).length
                        })`,
                      },
                      {
                        id: 'DAMAGED',
                        label: `Buku Rusak & Hilang (${damagedLostItems.length})`,
                      },
                      {
                        id: 'DONORS',
                        label: `Penyumbang Buku (${donorGrantItems.length})`,
                      },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setInventoryTab(tab.id as any)}
                        className={`px-3 py-1.5 rounded-xl transition ${
                          inventoryTab === tab.id
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                            : 'bg-surface-2 text-text-muted hover:text-text'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Search bar inside recap */}
                  <div className="relative w-full sm:w-60">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-muted" />
                    <input
                      type="text"
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                      placeholder="Cari barcode, judul, donatur..."
                      className="w-full rounded-xl border border-border bg-surface-2 pl-8 pr-3 py-1.5 text-xs text-text placeholder-text-muted outline-hidden"
                    />
                  </div>
                </div>

                {/* Inventory Table */}
                <div className="rounded-2xl border border-border overflow-hidden bg-surface shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-surface-2 text-text-muted border-b border-border sticky top-0 font-semibold">
                        <tr>
                          <th className="py-3 px-4">Kode SBTH</th>
                          <th className="py-3 px-4 min-w-[200px]">Judul Buku</th>
                          <th className="py-3 px-4">Sumber & Tgl</th>
                          <th className="py-3 px-4 text-right">Nilai Aset</th>
                          <th className="py-3 px-4 text-center">Status Fisik</th>
                          <th className="py-3 px-4 text-center">Aksi / Keterangan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {inventoryFilteredItems.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-text-muted">
                              Tidak ada data inventaris yang sesuai dengan filter atau pencarian.
                            </td>
                          </tr>
                        ) : (
                          inventoryFilteredItems.map(({ item, book }) => {
                            const val =
                              typeof item.priceValue === 'number' ? item.priceValue : 45000;
                            const donorDisplay = item.donorName || book?.donorName;

                            let statusBadge = (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 text-[10px] font-bold border border-emerald-500/30">
                                TERSEDIA
                              </span>
                            );

                            if (item.status === 'BORROWED') {
                              statusBadge = (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 text-[10px] font-bold border border-amber-500/30">
                                  DIPINJAM
                                </span>
                              );
                            } else if (item.status === 'IN_REPAIR') {
                              statusBadge = (
                                <span className="px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-500 text-[10px] font-bold border border-sky-500/30">
                                  PERBAIKAN
                                </span>
                              );
                            } else if (item.status === 'DAMAGED') {
                              statusBadge = (
                                <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-500 text-[10px] font-bold border border-rose-500/30">
                                  RUSAK
                                </span>
                              );
                            } else if (item.status === 'LOST') {
                              statusBadge = (
                                <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-500 text-[10px] font-bold border border-purple-500/30">
                                  HILANG
                                </span>
                              );
                            }

                            return (
                              <tr key={item.id} className="hover:bg-surface-2/60 transition">
                                <td className="py-3 px-4 font-mono font-semibold text-text whitespace-nowrap">
                                  {item.itemBarcode}
                                  {item.isReplaced && (
                                    <span className="ml-1 text-[9px] px-1 py-0.2 rounded-sm bg-emerald-500/20 text-emerald-500 font-bold">
                                      Baru
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 min-w-[200px]">
                                  <p className="font-semibold text-text truncate">
                                    {book?.title || 'Judul Buku'}
                                  </p>
                                  <span className="text-[10px] text-text-muted">
                                    {book?.author || '-'} • Copy #{item.copyNumber}
                                  </span>
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap">
                                  <p className="font-semibold text-text text-[11px]">
                                    {item.source === 'BELI_SEKOLAH'
                                      ? 'Beli (Sekolah)'
                                      : donorDisplay
                                      ? `Ortu: ${donorDisplay}`
                                      : 'Sumbangan Ortu'}
                                  </p>
                                  <span className="text-[10px] text-text-muted font-mono">
                                    {item.createdAt || '2026-10-15'}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right font-mono font-semibold text-text whitespace-nowrap tabular-nums">
                                  Rp {val.toLocaleString('id-ID')}
                                </td>
                                <td className="py-3 px-4 text-center whitespace-nowrap">
                                  {statusBadge}
                                </td>
                                <td className="py-3 px-4 text-center whitespace-nowrap">
                                  {/* Actions depending on filter tab or item status */}
                                  {item.status === 'DAMAGED' || item.status === 'LOST' ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setDamagedItemToReplace({
                                          item,
                                          bookTitle: book?.title || 'Buku',
                                        })
                                      }
                                      className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[10px] shadow-xs transition"
                                      title="Input ganti buku baru fisik dengan barcode yang sama"
                                    >
                                      Ganti Buku Baru
                                    </button>
                                  ) : item.source === 'SUMBANGAN' ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setSelectedDonorForCert({
                                          donorName: donorDisplay || 'Orang Tua Murid SBTH',
                                          bookTitle: book?.title || 'Buku Cerita Bergambar',
                                          date: item.createdAt || '15 Oktober 2026',
                                          estimatedValue: val,
                                          barcode: item.itemBarcode,
                                        })
                                      }
                                      className="px-2.5 py-1 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-semibold text-[10px] transition flex items-center gap-1 mx-auto"
                                    >
                                      <Award className="h-3 w-3" />
                                      <span>Cetak Piagam</span>
                                    </button>
                                  ) : item.isReplaced ? (
                                    <span
                                      className="text-[10px] text-emerald-500 font-medium"
                                      title={item.replacementNote}
                                    >
                                      ✓ Sudah Diganti Baru ({item.replacementDate})
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-text-muted">
                                      {item.conditionNote || '-'}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Sticky Footer */}
        <div className="p-4 border-t border-border bg-surface flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-2 transition"
          >
            Tutup Panel
          </button>

          <span className="text-[11px] text-text-muted">
            Data inventaris tersinkron otomatis ke pencatatan aset Yayasan Bhakti Tunas Harapan
          </span>
        </div>
      </div>

      {/* MODAL 1: GANTI BUKU BARU UNTUK BUKU RUSAK / HILANG */}
      {damagedItemToReplace && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-surface border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-text flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-emerald-500" />
                <span>Ganti Buku Baru Fisik</span>
              </h3>
              <button
                onClick={() => setDamagedItemToReplace(null)}
                className="p-1 rounded-lg text-text-muted hover:text-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-1.5 text-xs">
              <p className="font-semibold text-text">
                {damagedItemToReplace.bookTitle}
              </p>
              <div className="flex items-center justify-between text-text-muted font-mono">
                <span>Barcode: {damagedItemToReplace.item.itemBarcode}</span>
                <span>Copy #{damagedItemToReplace.item.copyNumber}</span>
              </div>
              <p className="text-[11px] text-emerald-500 font-medium">
                💡 Buku rusak ini akan diaktifkan kembali menjadi status <strong>TERSEDIA (AVAILABLE)</strong> di rak dengan barcode yang sama, dan tercatat di riwayat mutasi aset.
              </p>
            </div>

            <form onSubmit={handleConfirmReplaceDamaged} className="space-y-3 text-xs">
              <div>
                <label className="text-xs font-semibold text-text block mb-1">
                  Catatan Penggantian Buku Baru:
                </label>
                <textarea
                  rows={2}
                  required
                  value={replacementNoteInput}
                  onChange={(e) => setReplacementNoteInput(e.target.value)}
                  placeholder="Contoh: Diganti buku fisik baru oleh wali murid ananda Budi (TK-A) karena sampul robek."
                  className="w-full rounded-xl border border-border bg-surface-2 p-3 text-xs text-text outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setDamagedItemToReplace(null)}
                  className="px-4 py-2 text-xs font-semibold text-text-muted hover:bg-surface-2 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs"
                >
                  Simpan & Jadikan Tersedia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: STOCK OPNAME / AUDIT RAK INTERAKTIF */}
      {isStockOpnameOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl bg-surface border border-border p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
              <div>
                <h3 className="text-base font-bold text-text flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-amber-500" />
                  <span>Stock Opname & Audit Fisik Buku di Rak</span>
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Centang atau scan barcode setiap eksemplar fisik yang ditemukan di rak perpustakaan.
                </p>
              </div>
              <button
                onClick={() => setIsStockOpnameOpen(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scan input */}
            <form onSubmit={handleScanOpnameInput} className="flex gap-2 shrink-0">
              <input
                type="text"
                value={opnameBarcodeScan}
                onChange={(e) => setOpnameBarcodeScan(e.target.value)}
                placeholder="Scan / ketik Barcode SBTH (misal: SBTH-B-00101)..."
                className="flex-1 rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-mono text-text outline-hidden"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition"
              >
                Scan Cek
              </button>
            </form>

            {/* Checklist items */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {allBookItems.map((item) => {
                  const b = books.find((bk) => bk.id === item.bookId);
                  const isChecked = !!checkedBarcodeList[item.itemBarcode];

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleOpnameBarcode(item.itemBarcode)}
                      className={`p-2.5 rounded-xl border cursor-pointer select-none transition flex items-center justify-between ${
                        isChecked
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500'
                          : 'bg-surface-2 border-border text-text-muted hover:text-text'
                      }`}
                    >
                      <div className="truncate mr-2">
                        <span className="font-mono font-bold block">{item.itemBarcode}</span>
                        <span className="text-[11px] truncate block text-text">
                          {b?.title || 'Judul Buku'}
                        </span>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 border ${
                          isChecked
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-border bg-surface'
                        }`}
                      >
                        {isChecked && <Check className="h-3.5 w-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Summary & Complete Button */}
            <div className="pt-3 border-t border-border flex items-center justify-between shrink-0">
              <span className="text-xs text-text-muted">
                Terverifikasi:{' '}
                <strong className="text-emerald-500 font-mono">
                  {Object.values(checkedBarcodeList).filter(Boolean).length}
                </strong>{' '}
                / {allBookItems.length} Buku
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsStockOpnameOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-text-muted hover:bg-surface-2 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleFinishStockOpname}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs"
                >
                  Selesaikan Stock Opname
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EXPORT LAPORAN RESMI DENGAN TANDA TANGAN */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-3xl rounded-2xl bg-surface border border-border p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
              <div>
                <h3 className="text-base font-bold text-text">
                  Laporan Valuasi Aset & Inventaris Perpustakaan KB-TK SBTH
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Format Berita Acara Akuntabilitas Aset untuk Yayasan & Kepala Sekolah
                </p>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Printable Document Preview */}
            <div className="flex-1 overflow-y-auto bg-white text-slate-900 p-6 rounded-xl border border-slate-200 text-xs space-y-4 font-sans">
              {/* Letterhead */}
              <div className="text-center border-b-2 border-slate-900 pb-3">
                <h2 className="text-base font-bold uppercase tracking-wider">
                  KB - TK BHAKTI TUNAS HARAPAN (SBTH) MAGELANG
                </h2>
                <p className="text-[11px] text-slate-600">
                  Jl. Pahlawan No. 12, Magelang, Jawa Tengah • Telp: (0293) 362xxx
                </p>
                <h3 className="text-sm font-bold mt-2 uppercase underline">
                  BERITA ACARA & LAPORAN REKAPITULASI ASET KOLEKSI PERPUSTAKAAN
                </h3>
                <p className="text-[10px] text-slate-500">
                  Tahun Ajaran 2026/2027 • Tanggal Cetak: 15 Oktober 2026
                </p>
              </div>

              {/* Summary table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] border border-slate-300 p-3 rounded-lg bg-slate-50">
                <div>
                  <span className="text-slate-500 block">Total Eksemplar:</span>
                  <strong>{totalCopiesCount} Buku</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Nilai Aset Aktif:</span>
                  <strong className="text-emerald-700">Rp {activeHealthyValue.toLocaleString('id-ID')}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Pembelian BOS/Kas:</span>
                  <strong>Rp {schoolPurchaseValue.toLocaleString('id-ID')}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Hibah / Sumbangan Ortu:</span>
                  <strong>Rp {donorGrantValue.toLocaleString('id-ID')}</strong>
                </div>
              </div>

              {/* Items List preview */}
              <table className="w-full text-left text-[10px] border border-slate-300">
                <thead className="bg-slate-100 border-b border-slate-300">
                  <tr>
                    <th className="p-1.5 border-r border-slate-300">No</th>
                    <th className="p-1.5 border-r border-slate-300">Barcode</th>
                    <th className="p-1.5 border-r border-slate-300">Judul Buku</th>
                    <th className="p-1.5 border-r border-slate-300">Sumber</th>
                    <th className="p-1.5 border-r border-slate-300 text-right">Nilai</th>
                    <th className="p-1.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {allBookItems.slice(0, 10).map((item, idx) => {
                    const b = books.find((bk) => bk.id === item.bookId);
                    return (
                      <tr key={item.id}>
                        <td className="p-1 border-r border-slate-300">{idx + 1}</td>
                        <td className="p-1 font-mono border-r border-slate-300">{item.itemBarcode}</td>
                        <td className="p-1 font-semibold border-r border-slate-300">{b?.title || ''}</td>
                        <td className="p-1 border-r border-slate-300">
                          {item.source === 'BELI_SEKOLAH' ? 'Sekolah' : 'Sumbangan'}
                        </td>
                        <td className="p-1 text-right font-mono border-r border-slate-300">
                          Rp {(item.priceValue || 45000).toLocaleString('id-ID')}
                        </td>
                        <td className="p-1 text-center">{item.status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {allBookItems.length > 10 && (
                <p className="text-[10px] text-slate-500 italic text-center">
                  ... dan {allBookItems.length - 10} eksemplar fisik buku lainnya.
                </p>
              )}

              {/* Signatures */}
              <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <p className="text-slate-600">Mengetahui,</p>
                  <p className="font-bold text-slate-900 mt-0.5">Kepala Sekolah KB-TK SBTH</p>
                  <div className="h-16" />
                  <p className="font-bold underline text-slate-900">( {schoolProfile.headmasterName || 'Kepala Sekolah KB-TK SBTH'} )</p>
                  <p className="text-[10px] text-slate-500">{schoolProfile.headmasterNip ? `NIP. ${schoolProfile.headmasterNip}` : 'NIP. -'}</p>
                </div>

                <div>
                  <p className="text-slate-600">Dibuat oleh,</p>
                  <p className="font-bold text-slate-900 mt-0.5">Penanggung Jawab Perpustakaan</p>
                  <div className="h-16" />
                  <p className="font-bold underline text-slate-900">( {schoolProfile.librarianName || 'Pustakawan SBTH'} )</p>
                  <p className="text-[10px] text-slate-500">{schoolProfile.librarianNip || 'Perpustakaan SBTH Magelang'}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-border flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-text-muted hover:bg-surface-2 rounded-xl"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs flex items-center gap-1.5"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak Dokumen Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: PIAGAM PENGHARGAAN PENYUMBANG BUKU (WALL OF DONORS) */}
      {selectedDonorForCert && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-text flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                <span>Piagam Terima Kasih Donatur Buku</span>
              </h3>
              <button
                onClick={() => setSelectedDonorForCert(null)}
                className="p-1 rounded-lg text-text-muted hover:text-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Certificate Preview Card */}
            <div className="bg-gradient-to-br from-amber-50 via-white to-amber-50/60 text-slate-900 p-6 rounded-2xl border-2 border-amber-300 shadow-md text-center space-y-3 font-serif">
              <div className="flex items-center justify-center gap-2 text-amber-600 font-bold text-xs tracking-wider uppercase">
                <Award className="h-4 w-4" />
                <span>KB-TK BHAKTI TUNAS HARAPAN MAGELANG</span>
              </div>

              <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide">
                PIAGAM PENGHARGAAN
              </h2>
              <p className="text-xs text-slate-600 italic">
                Diberikan dengan penuh hormat dan apresiasi mendalam kepada:
              </p>

              <p className="text-lg font-bold text-amber-700 underline decoration-amber-400">
                {selectedDonorForCert.donorName}
              </p>

              <p className="text-xs text-slate-700 leading-relaxed font-sans">
                Atas partisipasi dan kontribusi mulia dalam mendonasikan buku bacaan:{' '}
                <strong className="block text-slate-900 mt-1">"{selectedDonorForCert.bookTitle}"</strong>
                {selectedDonorForCert.estimatedValue > 0 && (
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    (Taksiran Nilai: Rp {selectedDonorForCert.estimatedValue.toLocaleString('id-ID')})
                  </span>
                )}
              </p>

              <p className="text-[11px] text-slate-500 pt-2 font-sans">
                Magelang, {selectedDonorForCert.date}
              </p>

              <div className="pt-4 flex justify-between px-6 text-[11px] font-sans text-slate-700">
                <div>
                  <p>Kepala Sekolah,</p>
                  <div className="h-10" />
                  <p className="font-bold">{schoolProfile.headmasterName || 'Kepala Sekolah'}</p>
                </div>
                <div>
                  <p>Pustakawan,</p>
                  <div className="h-10" />
                  <p className="font-bold">{schoolProfile.librarianName || 'Pustakawan'}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
              <button
                type="button"
                onClick={() => setSelectedDonorForCert(null)}
                className="px-4 py-2 text-xs font-semibold text-text-muted hover:bg-surface-2 rounded-xl"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs flex items-center gap-1.5"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak Piagam (Ctrl+P)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Transaction Creation Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-surface border border-border p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-text">Catat Transaksi Kas Manual</h3>
            <form onSubmit={handleCreateFine} className="space-y-3 text-xs">
              <div>
                <label className="text-xs font-semibold text-text block mb-1">Pilih Siswa / Donatur:</label>
                <select
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs text-text outline-hidden"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.classGroup})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1">Jenis Transaksi:</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs text-text outline-hidden"
                >
                  <option value="DENDA_TERLAMBAT">Denda Keterlambatan</option>
                  <option value="GANTI_RUSAK">Ganti Buku Rusak</option>
                  <option value="GANTI_HILANG">Ganti Buku Hilang</option>
                  <option value="SUMBANGAN_TUNAI">Donasi Kas Tunai</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1">Nominal (Rp):</label>
                <input
                  type="number"
                  step={500}
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-text outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1">Status Pembayaran:</label>
                <select
                  value={paidStatus}
                  onChange={(e) => setPaidStatus(e.target.value as any)}
                  className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs text-text outline-hidden"
                >
                  <option value="PAID">Lunas Sekarang</option>
                  <option value="UNPAID">Belum Lunas (Tunggakan)</option>
                  <option value="WAIVED">Dibebaskan (Keringanan)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1">Catatan Tambahan:</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Keterangan..."
                  className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs text-text outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-text-muted hover:bg-surface-2 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
