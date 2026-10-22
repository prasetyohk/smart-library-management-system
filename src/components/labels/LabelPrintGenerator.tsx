'use client';

import React, { useState, useMemo } from 'react';
import {
  Printer,
  X,
  Settings2,
  CheckSquare,
  Square,
  Sparkles,
  FileSpreadsheet,
  Info,
  Search,
  Filter,
  Tag,
  Check,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { Book, BookItem, Category, PrintTemplateType } from '@/types';
import { CATEGORIES, getSbthSpineCode, getSbthInsideSlipData } from '@/lib/constants';
import { libraryStore } from '@/lib/storage';
import { BarcodeSvg } from '@/components/common/BarcodeSvg';

interface LabelPrintGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedBarcodes?: string[];
}

export const LabelPrintGenerator: React.FC<LabelPrintGeneratorProps> = ({
  isOpen,
  onClose,
  preSelectedBarcodes = [],
}) => {
  const [template, setTemplate] = useState<PrintTemplateType>('SPINE_SBTH');
  const [customShelfCode, setCustomShelfCode] = useState<string>('SR');
  const [startOffsetIndex, setStartOffsetIndex] = useState<number>(0); // 0 to 11 (position 1 to 12)
  const [selectedBarcodes, setSelectedBarcodes] = useState<string[]>(preSelectedBarcodes);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNPRINTED' | 'PRINTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const books = useMemo(() => libraryStore.getBooks(), [isOpen, refreshKey]);
  const allItems = useMemo(() => libraryStore.getBookItems(), [isOpen, refreshKey]);

  // Combine items with their parent book metadata
  const enrichedItems = useMemo(() => {
    return allItems.map((item) => {
      const book = books.find((b) => b.id === item.bookId);
      const cat = CATEGORIES.find((c) => c.id === book?.categoryId) || CATEGORIES[0];
      return {
        item,
        book,
        category: cat,
      };
    });
  }, [allItems, books, refreshKey]);

  const unprintedCount = useMemo(
    () => enrichedItems.filter((ei) => !ei.item.labelPrinted).length,
    [enrichedItems]
  );
  const printedCount = useMemo(
    () => enrichedItems.filter((ei) => ei.item.labelPrinted).length,
    [enrichedItems]
  );

  const filteredItems = useMemo(() => {
    return enrichedItems.filter((ei) => {
      if (statusFilter === 'UNPRINTED' && ei.item.labelPrinted) return false;
      if (statusFilter === 'PRINTED' && !ei.item.labelPrinted) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const barcodeMatch = ei.item.itemBarcode.toLowerCase().includes(q);
        const titleMatch = (ei.book?.title || '').toLowerCase().includes(q);
        if (!barcodeMatch && !titleMatch) return false;
      }
      return true;
    });
  }, [enrichedItems, statusFilter, searchQuery]);

  // Synchronize selection ONLY when modal opens or when preSelectedBarcodes prop actually changes
  const prevOpenRef = React.useRef(false);
  const prevBarcodesKeyRef = React.useRef<string>('');

  React.useEffect(() => {
    if (!isOpen) {
      prevOpenRef.current = false;
      return;
    }

    const currentKey = (preSelectedBarcodes || []).join(',');
    const isFirstOpen = !prevOpenRef.current;
    const barcodesChanged = currentKey !== prevBarcodesKeyRef.current;

    prevOpenRef.current = true;

    if (isFirstOpen || barcodesChanged) {
      prevBarcodesKeyRef.current = currentKey;

      if (preSelectedBarcodes && preSelectedBarcodes.length > 0) {
        setSelectedBarcodes(preSelectedBarcodes);
        const hasUnprinted = enrichedItems.some(
          (ei) => preSelectedBarcodes.includes(ei.item.itemBarcode) && !ei.item.labelPrinted
        );
        if (hasUnprinted) {
          setStatusFilter('UNPRINTED');
        } else {
          setStatusFilter('ALL');
        }
      } else {
        const unprinted = enrichedItems
          .filter((ei) => !ei.item.labelPrinted)
          .map((ei) => ei.item.itemBarcode);
        if (unprinted.length > 0) {
          setSelectedBarcodes(unprinted.slice(0, 12));
          setStatusFilter('UNPRINTED');
        } else {
          setSelectedBarcodes(enrichedItems.slice(-12).map((ei) => ei.item.itemBarcode));
          setStatusFilter('ALL');
        }
      }
    }
  }, [isOpen, preSelectedBarcodes, enrichedItems]);

  const toggleSelectBarcode = (barcode: string) => {
    setSelectedBarcodes((prev) =>
      prev.includes(barcode) ? prev.filter((b) => b !== barcode) : [...prev, barcode]
    );
  };

  const selectAll = () => {
    if (filteredItems.length > 0) {
      setSelectedBarcodes(filteredItems.map((ei) => ei.item.itemBarcode));
    } else {
      setSelectedBarcodes(enrichedItems.map((ei) => ei.item.itemBarcode));
    }
  };

  const selectUnprintedOnly = () => {
    const unprinted = enrichedItems
      .filter((ei) => !ei.item.labelPrinted)
      .map((ei) => ei.item.itemBarcode);
    setSelectedBarcodes(unprinted);
    setStatusFilter('UNPRINTED');
  };

  const deselectAll = () => {
    setSelectedBarcodes([]);
  };

  // Edit / Toggle label printed status manually without printing
  const handleMarkPrintedStatus = (printed: boolean) => {
    if (selectedBarcodes.length === 0) return;
    libraryStore.markLabelsPrinted(selectedBarcodes, printed);
    setRefreshKey((k) => k + 1);
  };

  // Trigger browser print dialog & update label tracking
  const handlePrint = () => {
    if (selectedBarcodes.length > 0) {
      libraryStore.markLabelsPrinted(selectedBarcodes, true);
      setRefreshKey((k) => k + 1);
    }
    window.print();
  };

  if (!isOpen) return null;

  // Selected items to print
  const itemsToPrint = enrichedItems.filter((ei) =>
    selectedBarcodes.includes(ei.item.itemBarcode)
  );

  // For Tom & Jerry 103 (12 stickers per sheet: 3 columns x 4 rows)
  // We can insert blank spacers before the first sticker according to startOffsetIndex
  const tj103Slots: Array<{ itemInfo?: (typeof enrichedItems)[0]; isSpacer?: boolean; slotIndex: number }> = [];

  if (template === 'TJ_103') {
    // Fill spacers
    for (let i = 0; i < startOffsetIndex; i++) {
      tj103Slots.push({ isSpacer: true, slotIndex: i + 1 });
    }
    // Fill actual items
    itemsToPrint.forEach((ei, idx) => {
      tj103Slots.push({ itemInfo: ei, slotIndex: startOffsetIndex + idx + 1 });
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 my-6 flex flex-col max-h-[92vh]">
        {/* Header - Screen only */}
        <div className="print:hidden flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-5 bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-blue-500/10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
              <Printer className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Generator Cetak Label Presisi (CSS @media print)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mode Penamaan SBTH (Punggung 4-Baris & Slip Dalam 4-Digit) • Tom & Jerry 103 • Thermal Roll
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Configuration Bar - Screen only */}
        <div className="print:hidden p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
          {/* 1. Template Chooser */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Settings2 className="h-3.5 w-3.5 text-emerald-600" />
              Pilih Format / Model Stiker:
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setTemplate('SPINE_SBTH')}
                className={`p-2 rounded-xl border text-center font-semibold transition cursor-pointer ${
                  template === 'SPINE_SBTH'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 shadow-xs ring-1 ring-amber-500/40'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                📏 Punggung SBTH
                <span className="block text-[9px] font-normal text-slate-400 mt-0.5">
                  4 Baris (SR / DDC / Pengarang / Judul)
                </span>
              </button>
              <button
                type="button"
                onClick={() => setTemplate('SLIP_DALAM_SBTH')}
                className={`p-2 rounded-xl border text-center font-semibold transition cursor-pointer ${
                  template === 'SLIP_DALAM_SBTH'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 shadow-xs ring-1 ring-blue-500/40'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                📑 Slip Dalam Buku
                <span className="block text-[9px] font-normal text-slate-400 mt-0.5">
                  No. 4 Digit & Tanggal
                </span>
              </button>
              <button
                type="button"
                onClick={() => setTemplate('TJ_103')}
                className={`p-2 rounded-xl border text-center font-semibold transition cursor-pointer ${
                  template === 'TJ_103'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shadow-xs ring-1 ring-emerald-500/40'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                🏷️ T&J No. 103
                <span className="block text-[9px] font-normal text-slate-400 mt-0.5">
                  Sampul Depan (A4 12 Stiker)
                </span>
              </button>
              <button
                type="button"
                onClick={() => setTemplate('THERMAL_40x30')}
                className={`p-2 rounded-xl border text-center font-semibold transition cursor-pointer ${
                  template === 'THERMAL_40x30'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 shadow-xs ring-1 ring-purple-500/40'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                🖨️ Thermal Roll
                <span className="block text-[9px] font-normal text-slate-400 mt-0.5">
                  Label 40 x 30 mm
                </span>
              </button>
            </div>
          </div>

          {/* 2. Interactive Start Position or SBTH Shelf Customization */}
          {template === 'TJ_103' ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  Posisi Mulai Cetak:
                  <span className="text-[10px] text-amber-600 font-normal">
                    (Stiker #{startOffsetIndex + 1})
                  </span>
                </label>
                <span className="text-[10px] text-slate-400">Pilih stiker kosong:</span>
              </div>
              {/* 3 cols x 4 rows visual picker */}
              <div className="grid grid-cols-6 gap-1 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setStartOffsetIndex(idx)}
                    className={`h-6 rounded-md text-[10px] font-bold transition cursor-pointer ${
                      idx === startOffsetIndex
                        ? 'bg-amber-500 text-white shadow-xs'
                        : idx < startOffsetIndex
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 line-through'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 hover:bg-emerald-100'
                    }`}
                    title={`Mulai cetak dari posisi stiker nomor ${idx + 1}`}
                  >
                    #{idx + 1}
                  </button>
                ))}
              </div>
            </div>
          ) : template === 'SPINE_SBTH' ? (
            <div className="space-y-1.5 flex flex-col justify-center">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Kode Rak Punggung (Baris 1):</span>
                <span className="text-[10px] text-amber-600 font-semibold">Bawaan SBTH: &quot;SR&quot;</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customShelfCode}
                  onChange={(e) => setCustomShelfCode(e.target.value.toUpperCase())}
                  placeholder="SR"
                  maxLength={6}
                  className="w-20 h-9 rounded-xl border border-amber-500/60 bg-white dark:bg-slate-900 px-3 text-center text-xs font-mono font-bold text-amber-500 outline-hidden focus:ring-1 focus:ring-amber-500"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  Format vertikal 4 baris: <strong>[Rak: {customShelfCode || 'SR'}]</strong> ➔ <strong>[DDC]</strong> ➔ <strong>[Pengarang]</strong> ➔ <strong>[Judul]</strong>
                </p>
              </div>
            </div>
          ) : template === 'SLIP_DALAM_SBTH' ? (
            <div className="flex items-center p-3 text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 gap-2.5">
              <span className="text-xl">📑</span>
              <p className="leading-tight">
                <strong>Format Slip Dalam SBTH:</strong> Mencetak cap No. Daftar (4 digit angka, e.g. <code>0101</code>) dan Tanggal (<code>DD/MM/TTTT</code>) persis seperti fisik buku sekolah.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center p-3 text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              Printer thermal mencetak 1 stiker per tarikan secara berurutan.
            </div>
          )}

          {/* 3. Action & Summary */}
          <div className="flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">
                Siap Cetak:{' '}
                <strong className="text-emerald-600 font-bold">
                  {itemsToPrint.length} Stiker
                </strong>
              </span>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-[11px] text-blue-600 hover:underline font-semibold"
                >
                  Pilih Semua ({statusFilter !== 'ALL' ? filteredItems.length : enrichedItems.length})
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="text-[11px] text-slate-500 hover:underline"
                >
                  Reset
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              disabled={itemsToPrint.length === 0}
              className="w-full mt-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
            >
              <Printer className="h-4 w-4" />
              Cetak Sekarang (Ctrl + P)
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-slate-950">
          {/* Printable Layout Container */}
          <div className="max-w-4xl mx-auto">
            {/* INSTRUCTION TIP (Screen only) */}
            <div className="print:hidden mb-4 p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <strong>Petunjuk Cetak Presisi:</strong> Di jendela dialog print browser Chrome/Edge,
                pastikan pilih <strong>Margin: None / Kosong</strong> dan <strong>Scale: 100%</strong>{' '}
                agar posisi stiker Tom & Jerry No. 103 pas dengan pisau potong kertas pabrik!
              </div>
            </div>

            {/* TEMPLATE A: TOM & JERRY 103 (3 COLS x 4 ROWS PER A4 SHEET) */}
            {template === 'TJ_103' && (
              <div className="tj103-sheet bg-white text-black p-4 rounded-xl shadow-lg border border-slate-300 mx-auto">
                <div className="tj103-grid grid grid-cols-3 gap-3 print:gap-[4mm]">
                  {tj103Slots.map((slot, idx) => {
                    if (slot.isSpacer) {
                      return (
                        <div
                          key={`spacer-${idx}`}
                          className="tj103-label border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 text-[10px] p-2 min-h-[120px] print:border-none print:opacity-0"
                        >
                          <span>(Slot #{slot.slotIndex} Kosong)</span>
                        </div>
                      );
                    }

                    const ei = slot.itemInfo!;
                    const book = ei.book;
                    const cat = ei.category;

                    return (
                      <div
                        key={ei.item.id}
                        className="tj103-label relative border border-slate-300 rounded-lg overflow-hidden bg-white text-black shadow-xs flex flex-col justify-between min-h-[128px] print:min-h-[32mm] print:h-[32mm] print:w-[64mm] print:shadow-none print:border-slate-400"
                      >
                        {/* 1. Header Warna Kategori (5mm solid color band) */}
                        <div
                          className="h-5 px-2 flex items-center justify-between text-white font-bold text-[9px] uppercase tracking-wider shrink-0"
                          style={{ backgroundColor: cat.colorHex }}
                        >
                          <span>{cat.shortName}</span>
                          <span className="text-[8px] font-mono tracking-normal">
                            {cat.shelfLocation.split(' ')[0]}
                          </span>
                        </div>

                        {/* 2. Body Stiker */}
                        <div className="p-2 flex-1 flex flex-col items-center justify-between text-center">
                          {/* Nama Perpustakaan */}
                          <div className="w-full flex items-center justify-between border-b border-slate-200 pb-0.5 mb-1">
                            <span className="text-[9px] font-extrabold text-slate-800 tracking-tight">
                              PERPUS SBTH TK
                            </span>
                            <span className="text-[8px] font-bold text-slate-500 bg-slate-100 px-1 rounded">
                              Copy #{ei.item.copyNumber}
                            </span>
                          </div>

                          {/* Barcode Vector Code-128 */}
                          <div className="my-0.5 flex items-center justify-center">
                            <BarcodeSvg
                              value={ei.item.itemBarcode}
                              width={1.3}
                              height={34}
                              fontSize={9}
                              textMargin={1}
                            />
                          </div>

                          {/* Judul Buku & Rak */}
                          <div className="w-full mt-0.5">
                            <p className="text-[9px] font-bold text-slate-900 leading-tight line-clamp-1">
                              {book?.title || 'Buku Cerita SBTH'}
                            </p>
                            <p className="text-[8px] text-slate-500 leading-none mt-0.5 truncate">
                              {book?.author || 'SBTH TK'} • {book?.publisher || ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TEMPLATE B: THERMAL ROLL (40 x 30 mm) */}
            {template === 'THERMAL_40x30' && (
              <div className="thermal-roll-container space-y-4 print:space-y-0 flex flex-wrap gap-4 items-center justify-center">
                {itemsToPrint.map((ei) => {
                  const book = ei.book;
                  const cat = ei.category;
                  return (
                    <div
                      key={ei.item.id}
                      className="thermal-label border border-slate-300 rounded-md overflow-hidden bg-white text-black p-2 w-[160px] h-[120px] print:w-[40mm] print:h-[30mm] flex flex-col justify-between text-center shadow-md print:shadow-none print:break-after-page"
                    >
                      <div
                        className="h-3.5 px-1.5 flex items-center justify-between text-white font-bold text-[8px] uppercase tracking-wider shrink-0"
                        style={{ backgroundColor: cat.colorHex }}
                      >
                        <span>{cat.shortName}</span>
                        <span>Copy #{ei.item.copyNumber}</span>
                      </div>

                      <div className="my-1 flex items-center justify-center">
                        <BarcodeSvg
                          value={ei.item.itemBarcode}
                          width={1.1}
                          height={28}
                          fontSize={8}
                          textMargin={1}
                        />
                      </div>

                      <p className="text-[8px] font-bold text-slate-900 leading-none truncate">
                        {book?.title}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TEMPLATE C: LABEL PUNGGUNG RAK SBTH (4 BARIS VERTIKAL) */}
            {template === 'SPINE_SBTH' && (
              <div className="sbth-spine-sheet bg-white text-black p-4 rounded-xl shadow-lg border border-slate-300 mx-auto">
                <div className="print:hidden mb-4 p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📏</span>
                    <div>
                      <strong>Standar Label Punggung Buku Fisik SBTH (4 Baris Vertikal):</strong>
                      <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                        Format stiker samping punggung buku pas dengan buku yang sudah ada di rak perpustakaan sekolah.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs shrink-0 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-amber-300">
                    <span className="text-slate-600 dark:text-slate-400">Kode Rak:</span>
                    <strong className="text-amber-600 dark:text-amber-400 text-sm">{customShelfCode || 'SR'}</strong>
                  </div>
                </div>

                <div className="sbth-spine-grid grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 print:gap-[4mm] justify-center">
                  {itemsToPrint.map((ei) => {
                    const book = ei.book;
                    const cat = ei.category;
                    const spine = getSbthSpineCode(
                      book?.title || '',
                      book?.author || '',
                      book?.categoryId,
                      customShelfCode || cat.shelfCode || 'SR',
                      book?.classification
                    );

                    return (
                      <div
                        key={ei.item.id}
                        className="sbth-spine-label border-2 border-slate-900 rounded-lg overflow-hidden bg-white text-black flex flex-col justify-between p-1 w-[120px] h-[180px] print:w-[28mm] print:h-[44mm] print:shadow-none shadow-xs mx-auto text-center"
                      >
                        {/* Header Mini Warna Rak */}
                        <div
                          className="h-3 rounded-xs text-[8px] font-bold text-white flex items-center justify-center uppercase tracking-wider shrink-0"
                          style={{ backgroundColor: cat.colorHex }}
                        >
                          {cat.shortName}
                        </div>

                        {/* Kotak 4 Baris Fisik SBTH */}
                        <div className="flex-1 flex flex-col justify-center divide-y divide-black/80 my-1 font-mono">
                          {/* Baris 1: Kode Rak (e.g. SR) */}
                          <div className="py-1 flex items-center justify-center font-extrabold text-sm sm:text-base tracking-widest text-slate-950">
                            {spine.shelfCode}
                          </div>

                          {/* Baris 2: Nomor DDC (e.g. 813 / 220) */}
                          <div className="py-1 flex items-center justify-center font-extrabold text-sm sm:text-base tracking-wider text-slate-950">
                            {spine.ddc}
                          </div>

                          {/* Baris 3: 3 Huruf Pengarang (e.g. KID / JUL) */}
                          <div className="py-1 flex items-center justify-center font-extrabold text-sm sm:text-base tracking-widest text-slate-950 uppercase">
                            {spine.authorCode}
                          </div>

                          {/* Baris 4: 1 Huruf Kecil Judul (e.g. m / t) */}
                          <div className="py-1 flex items-center justify-center font-bold text-sm sm:text-base text-slate-950 lowercase">
                            {spine.titleCode}
                          </div>
                        </div>

                        {/* Footer Eksemplar */}
                        <div className="border-t border-slate-300 pt-0.5 text-[8px] text-slate-600 flex items-center justify-between px-0.5 shrink-0 font-sans">
                          <span>SBTH</span>
                          <span>#{ei.item.copyNumber}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TEMPLATE D: SLIP CAP BAGIAN DALAM BUKU SBTH (NO. DAFTAR 4 DIGIT & TANGGAL) */}
            {template === 'SLIP_DALAM_SBTH' && (
              <div className="sbth-slip-sheet bg-white text-black p-4 rounded-xl shadow-lg border border-slate-300 mx-auto">
                <div className="print:hidden mb-4 p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-center gap-2.5">
                  <span className="text-xl">📑</span>
                  <div>
                    <strong>Slip Cap Bagian Dalam Buku Fisik SBTH:</strong>
                    <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80">
                      Berisi No. Daftar 4 Digit (contoh: <code>0101</code>) dan Tanggal (<code>DD/MM/TTTT</code>) untuk ditempel pada halaman dalam buku sesuai buku fisik SBTH yang sudah ada.
                    </p>
                  </div>
                </div>

                <div className="sbth-slip-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 print:gap-[4mm] justify-center">
                  {itemsToPrint.map((ei) => {
                    const book = ei.book;
                    const slip = getSbthInsideSlipData(ei.item.itemBarcode, ei.item.copyNumber, ei.item.acquisitionDate);

                    return (
                      <div
                        key={ei.item.id}
                        className="sbth-slip-label border border-slate-400 rounded-lg overflow-hidden bg-white text-black p-3 w-full sm:w-[240px] h-[140px] print:w-[64mm] print:h-[36mm] print:shadow-none shadow-xs mx-auto flex flex-col justify-between"
                      >
                        {/* Kop Cap Perpustakaan */}
                        <div className="text-center border-b border-black pb-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-tight block leading-tight">
                            PERPUSTAKAAN KB-TK SBTH
                          </span>
                          <span className="text-[8px] text-slate-600 block leading-none">
                            Bhakti Tunas Harapan Magelang
                          </span>
                        </div>

                        {/* Isi No Daftar 4 Digit & Tanggal */}
                        <div className="my-1.5 space-y-1 font-mono text-xs">
                          <div className="flex items-center justify-between border border-black/40 px-2 py-0.5 rounded bg-slate-50">
                            <span className="font-semibold text-slate-700 text-[10px]">No. Daftar :</span>
                            <span className="font-black text-sm text-slate-950 tracking-widest">{slip.accessionNumber}</span>
                          </div>
                          <div className="flex items-center justify-between border border-black/40 px-2 py-0.5 rounded bg-slate-50">
                            <span className="font-semibold text-slate-700 text-[10px]">Tanggal    :</span>
                            <span className="font-bold text-xs text-slate-950">{slip.dateStr}</span>
                          </div>
                        </div>

                        {/* Info Judul & Eksemplar */}
                        <div className="border-t border-slate-200 pt-0.5 flex items-center justify-between text-[8px] text-slate-500 font-sans">
                          <span className="truncate max-w-[150px] font-medium text-slate-700">{book?.title}</span>
                          <span>Copy #{ei.item.copyNumber}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ITEM SELECTOR DRAWER (Screen only) with Status Filter & Edit Status */}
          <div className="print:hidden mt-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <CheckSquare className="h-4 w-4 text-emerald-600" />
                  Filter & Pilih Eksemplar Fisik yang Mau Dicetak:
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Terpilih <strong>{selectedBarcodes.length}</strong> dari {enrichedItems.length} eksemplar
                </p>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    statusFilter === 'ALL'
                      ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Semua ({enrichedItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('UNPRINTED')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                    statusFilter === 'UNPRINTED'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                  }`}
                >
                  <span>⚠️ Belum Dicetak</span>
                  <span className="font-mono text-[10px]">({unprintedCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('PRINTED')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                    statusFilter === 'PRINTED'
                      ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                  }`}
                >
                  <span>✅ Sudah Dicetak</span>
                  <span className="font-mono text-[10px]">({printedCount})</span>
                </button>
              </div>
            </div>

            {/* Quick Actions & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari barcode / judul..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Selection Controls */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                {unprintedCount > 0 && (
                  <button
                    type="button"
                    onClick={selectUnprintedOnly}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-semibold text-[11px] flex items-center gap-1 transition"
                  >
                    <Zap className="h-3 w-3" />
                    Pilih Belum Dicetak ({unprintedCount})
                  </button>
                )}
                <button
                  type="button"
                  onClick={selectAll}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium hover:bg-slate-200"
                >
                  Pilih Semua Sesuai Filter ({filteredItems.length})
                </button>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="px-2.5 py-1 rounded-lg text-slate-500 text-[11px] hover:underline"
                >
                  Batal Pilih
                </button>
              </div>
            </div>

            {/* Batch Status Edit (Tandai Sudah/Belum Dicetak) */}
            {selectedBarcodes.length > 0 && (
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Edit Status Langsung ({selectedBarcodes.length} barcode dipilih):
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleMarkPrintedStatus(true)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-600 dark:text-emerald-400 border border-emerald-600/30 font-semibold text-[11px] flex items-center gap-1 transition"
                    title="Ubah tanda eksemplar terpilih menjadi 'Sudah Dicetak / Ditempel'"
                  >
                    <Check className="h-3 w-3" />
                    Tandai Sudah Dicetak
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarkPrintedStatus(false)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-semibold text-[11px] flex items-center gap-1 transition"
                    title="Ubah tanda eksemplar terpilih menjadi 'Belum Dicetak'"
                  >
                    <AlertCircle className="h-3 w-3" />
                    Tandai Belum Dicetak
                  </button>
                </div>
              </div>
            )}

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto">
              {filteredItems.map((ei) => {
                const isSelected = selectedBarcodes.includes(ei.item.itemBarcode);
                return (
                  <button
                    key={ei.item.id}
                    type="button"
                    onClick={() => toggleSelectBarcode(ei.item.itemBarcode)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-left text-xs transition ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500/30'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Square className="h-4 w-4 text-slate-400 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[11px]">
                          {ei.item.itemBarcode}
                        </span>
                        <div className="flex items-center gap-1">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: ei.category.colorHex }}
                            title={ei.category.name}
                          />
                          <span className="text-[10px] text-slate-400">
                            #{ei.item.copyNumber}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] truncate font-medium text-slate-800 dark:text-slate-200">
                        {ei.book?.title}
                      </p>
                      <div className="mt-0.5 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 truncate max-w-[120px]">
                          📍 {ei.category.shelfLocation}
                        </span>
                        {ei.item.labelPrinted ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            ✅ Ditempel
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-bold">
                            ⚠️ Belum
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
