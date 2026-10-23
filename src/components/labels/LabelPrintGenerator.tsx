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
import { CATEGORIES, getSbthSpineCode, getSbthInsideSlipData, formatDateDDMMYYYY, findCategory } from '@/lib/constants';
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
  const [spineOrientation, setSpineOrientation] = useState<'LANDSCAPE' | 'PORTRAIT'>('LANDSCAPE');
  const [customShelfCode, setCustomShelfCode] = useState<string>('SR');
  const [startOffsetIndex, setStartOffsetIndex] = useState<number>(0); // 0 to 11 (position 1 to 12)
  const [selectedBarcodes, setSelectedBarcodes] = useState<string[]>(preSelectedBarcodes);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNPRINTED' | 'PRINTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const books = useMemo(() => libraryStore.getBooks(), [isOpen, refreshKey]);
  const allItems = useMemo(() => libraryStore.getBookItems(), [isOpen, refreshKey]);
  const categories = useMemo(() => libraryStore.getCategories(), [isOpen, refreshKey]);

  // Combine items with their parent book metadata
  const enrichedItems = useMemo(() => {
    return allItems.map((item) => {
      const book = books.find((b) => b.id === item.bookId);
      const cat = findCategory(categories, book?.categoryId);
      return {
        item,
        book,
        category: cat,
      };
    });
  }, [allItems, books, categories, refreshKey]);

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

  // Edit / Toggle label printed status manually without printing (e.g. jika dicap manual)
  const handleMarkPrintedStatus = (printed: boolean, method: 'PRINT' | 'MANUAL_STAMP' = 'MANUAL_STAMP') => {
    if (selectedBarcodes.length === 0) return;
    libraryStore.markLabelsPrinted(selectedBarcodes, printed, method);
    setRefreshKey((k) => k + 1);
  };

  // Trigger browser print dialog & update label tracking
  const handlePrint = () => {
    if (selectedBarcodes.length > 0) {
      libraryStore.markLabelsPrinted(selectedBarcodes, true, 'PRINT');
      setRefreshKey((k) => k + 1);
    }
    window.print();
  };

  // Bersihkan awalan huruf lama (misal: SBTH-B-0176 -> 0176) langsung dari modal cetak
  const handleCleanPrefixesInPrinter = () => {
    const res = libraryStore.convertOldPrefixBarcodesTo4Digit();
    if (res.count > 0) {
      alert(
        `✅ Berhasil Membersihkan ${res.count} Kode Barcode!\n\n` +
        res.convertedList.map(c => `• ${c.old} ➔ ${c.new}`).join('\n') +
        `\n\nStiker label sekarang siap dicetak dengan nomor 4-digit bersih sesuai standar SBTH.`
      );
      setSelectedBarcodes((prev) =>
        prev.map((oldB) => {
          const match = res.convertedList.find((c) => c.old === oldB);
          return match ? match.new : oldB;
        })
      );
      setRefreshKey((r) => r + 1);
    } else {
      alert('Informasi: Seluruh kode barcode eksemplar sudah berformat 4-digit bersih (tidak ada awalan huruf lama).');
    }
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
                <span className="block text-[9px] font-normal text-slate-500 mt-0.5">
                  7.4 x 4 cm Kotak • KOP & Call No
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
                <span className="block text-[9px] font-normal text-slate-500 mt-0.5">
                  6 x 2.5 cm Kotak • KOP, No. & Barcode
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
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <span>Ukuran 7.4 x 4 cm:</span>
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSpineOrientation('LANDSCAPE')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                      spineOrientation === 'LANDSCAPE'
                        ? 'bg-amber-500 text-white font-bold'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Lanskap (7.4x4cm)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpineOrientation('PORTRAIT')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                      spineOrientation === 'PORTRAIT'
                        ? 'bg-amber-500 text-white font-bold'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Potret (4x7.4cm)
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customShelfCode}
                  onChange={(e) => setCustomShelfCode(e.target.value.toUpperCase())}
                  placeholder="SR"
                  maxLength={6}
                  className="w-16 h-8 rounded-lg border border-amber-500/60 bg-white dark:bg-slate-900 px-2 text-center text-xs font-mono font-bold text-amber-500 outline-hidden focus:ring-1 focus:ring-amber-500"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  Kode Rak: <strong>[{customShelfCode || 'SR'}]</strong> • KOP resmi SBTH & Nomor Panggil 4-Baris (Tanpa Barcode).
                </p>
              </div>
            </div>
          ) : template === 'SLIP_DALAM_SBTH' ? (
            <div className="flex items-center p-2.5 text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 gap-2">
              <span className="text-xl">📑</span>
              <p className="leading-tight text-[11px]">
                <strong>Slip Dalam 6 x 2.5 cm Kotak:</strong> Dilengkapi KOP resmi SBTH (Logo di kiri, Teks di tengah), No. Daftar 4 Digit (contoh: <code>0101</code>), Tanggal, & <strong>Barcode Scanner 4-Digit</strong> untuk sirkulasi buku.
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

                          {/* Judul Buku & Rak & ISBN + Tanggal Input */}
                          <div className="w-full mt-0.5">
                            <p className="text-[9px] font-bold text-slate-900 leading-tight line-clamp-1">
                              {book?.title || 'Buku Cerita SBTH'}
                            </p>
                            <p className="text-[8px] text-slate-500 leading-none mt-0.5 truncate">
                              {book?.author || 'SBTH TK'} • {book?.publisher || ''}
                            </p>
                            <p className="text-[7.5px] font-mono text-slate-600 leading-tight mt-0.5">
                              ISBN: {book?.isbn || '-'} • Input: {formatDateDDMMYYYY(book?.createdAt || ei.item.acquisitionDate)}
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

                      <div className="w-full">
                        <p className="text-[8px] font-bold text-slate-900 leading-none truncate">
                          {book?.title}
                        </p>
                        <p className="text-[7px] font-mono text-slate-600 leading-none mt-0.5 truncate">
                          ISBN: {book?.isbn || '-'} • Input: {formatDateDDMMYYYY(book?.createdAt || ei.item.acquisitionDate)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TEMPLATE C: LABEL PUNGGUNG RAK SBTH (7.4 x 4 CM KOTAK POTONG MANUAL) */}
            {template === 'SPINE_SBTH' && (
              <div className="sbth-spine-sheet bg-white text-black p-4 rounded-xl shadow-lg border border-slate-300 mx-auto">
                <div className="print:hidden mb-4 p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📏</span>
                    <div>
                      <strong>Standar Label Punggung Buku Fisik SBTH (7.4 x 4 cm Kotak Potong Manual):</strong>
                      <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                        Dilengkapi KOP resmi SBTH (Logo kiri, teks tengah), strip warna DDC, & kotak 4 baris nomor panggil untuk dipotong manual (Tanpa Barcode di Punggung).
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-amber-300">
                      Ukuran: <strong>7.4 x 4 cm</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSpineOrientation(o => o === 'LANDSCAPE' ? 'PORTRAIT' : 'LANDSCAPE')}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 font-semibold text-[11px] hover:bg-amber-500/30 transition cursor-pointer"
                    >
                      {spineOrientation === 'LANDSCAPE' ? '🔄 Ganti ke Potret (4 x 7.4 cm)' : '🔄 Ganti ke Lanskap (7.4 x 4 cm)'}
                    </button>
                  </div>
                </div>

                <div className={`sbth-spine-grid ${spineOrientation === 'PORTRAIT' ? 'portrait' : ''} grid gap-3 print:gap-[5mm] justify-center`}>
                  {itemsToPrint.map((ei) => {
                    const book = ei.book;
                    const cat = ei.category;
                    const spine = getSbthSpineCode(
                      book?.title || '',
                      book?.author || '',
                      book?.categoryId,
                      customShelfCode || book?.shelfCode || cat.shelfCode || 'SR',
                      book?.classification,
                      book?.authorCode,
                      book?.titleCode
                    );
                    const slip = getSbthInsideSlipData(ei.item.itemBarcode, ei.item.copyNumber, book?.createdAt || ei.item.acquisitionDate);

                    return (
                      <div
                        key={ei.item.id}
                        className={`sbth-spine-label ${spineOrientation === 'PORTRAIT' ? 'portrait' : ''} border-2 border-black rounded-lg print:rounded-none overflow-hidden bg-white text-black flex flex-col justify-between shadow-xs mx-auto ${
                          spineOrientation === 'LANDSCAPE'
                            ? 'w-[280px] h-[155px] print:w-[74mm] print:h-[40mm] print:max-h-[40mm]'
                            : 'w-[160px] h-[280px] print:w-[40mm] print:h-[74mm] print:max-h-[74mm]'
                        }`}
                      >
                        {/* 1. KOP RESMI SBTH (Logo di kiri, Teks di tengah) */}
                        <div className="flex items-center gap-1.5 border-b border-black pb-0.5 px-1 shrink-0 bg-white">
                          <img
                            src="/logo_sbth.png"
                            alt="Logo SBTH"
                            className="h-5 w-5 print:h-[6.5mm] print:w-[6.5mm] object-contain shrink-0"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                          <div className="flex-1 text-center min-w-0">
                            <div className="text-[8.5px] print:text-[6.5pt] font-black uppercase tracking-tight text-black leading-tight">
                              PERPUSTAKAAN KB-TK BHAKTI TUNAS HARAPAN
                            </div>
                            <div className="text-[7px] print:text-[5pt] text-slate-700 leading-tight">
                              Jl. Jendral Sudirman No 68 A Magelang
                            </div>
                          </div>
                        </div>

                        {/* 2. STRIP WARNA KATEGORI DDC */}
                        <div
                          className="h-3.5 print:h-[3.2mm] px-1.5 flex items-center justify-between text-white font-bold text-[8px] print:text-[5.5pt] uppercase tracking-wider shrink-0"
                          style={{ backgroundColor: cat.colorHex }}
                        >
                          <span className="truncate max-w-[80%]">[{cat.ddcCode || spine.ddc}] {cat.shortName}</span>
                          <span className="font-mono text-[7px] print:text-[5pt] opacity-90 shrink-0">#{ei.item.copyNumber}</span>
                        </div>

                        {/* 3. KONTEN LABEL PUNGGUNG (TANPA BARCODE) */}
                        {spineOrientation === 'LANDSCAPE' ? (
                          <div className="flex-1 flex items-stretch gap-2 p-1.5 min-h-0">
                            {/* Kotak Call Number 4-Baris Vertikal (Tegas & Jelas di Rak) */}
                            <div className="w-[28mm] shrink-0 border-2 border-black rounded-xs flex flex-col justify-center divide-y-2 divide-black font-mono text-center bg-slate-50 shadow-2xs">
                              <div className="py-0.5 font-black text-[11px] print:text-[8.5pt] text-black tracking-widest leading-none">{customShelfCode || spine.shelfCode}</div>
                              <div className="py-0.5 font-black text-[11px] print:text-[8.5pt] text-black tracking-wider leading-none">{spine.ddc}</div>
                              <div className="py-0.5 font-black text-[11px] print:text-[8.5pt] text-black tracking-widest uppercase leading-none">{spine.authorCode}</div>
                              <div className="py-0.5 font-bold text-[11px] print:text-[8.5pt] text-black lowercase leading-none">{spine.titleCode}</div>
                            </div>

                            {/* Info Buku & Lokasi Rak Fisik (Tanpa Barcode) */}
                            <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0 text-left">
                              <div>
                                <p className="text-[9.5px] print:text-[7pt] font-black text-black leading-tight line-clamp-2">
                                  {book?.title || 'Buku Cerita SBTH'}
                                </p>
                                <p className="text-[8px] print:text-[5.5pt] text-slate-700 leading-tight mt-0.5 truncate">
                                  {book?.author || 'Penulis SBTH'} • {book?.publisher || ''} {book?.publicationYear ? `(${book.publicationYear})` : ''}
                                </p>
                              </div>

                              <div className="space-y-0.5 pt-0.5 border-t border-slate-300">
                                <div className="flex items-center justify-between text-[7.5px] print:text-[5pt] font-mono text-slate-700">
                                  <span className="font-bold">No. Panggil: ({spine.ddc} {spine.authorCode} {spine.titleCode})</span>
                                  <span>Copy #{ei.item.copyNumber}</span>
                                </div>
                                <div className="flex items-center justify-between text-[7px] print:text-[4.5pt] text-slate-600 font-mono">
                                  <span className="truncate max-w-[110px]">📍 {book?.shelfLocation || cat.shelfLocation || 'Rak Buku'}</span>
                                  <span className="font-bold text-black">No: {slip.accessionNumber}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Mode Potret (4 x 7.4 cm)
                          <div className="flex-1 flex flex-col justify-between p-1.5 min-h-0 text-center">
                            {/* Kotak Call Number 4-Baris Vertikal */}
                            <div className="border-2 border-black rounded-xs flex flex-col justify-center divide-y-2 divide-black font-mono text-center bg-slate-50 my-1 shadow-2xs">
                              <div className="py-1 font-black text-xs print:text-[9.5pt] text-black tracking-widest leading-none">{customShelfCode || spine.shelfCode}</div>
                              <div className="py-1 font-black text-xs print:text-[9.5pt] text-black tracking-wider leading-none">{spine.ddc}</div>
                              <div className="py-1 font-black text-xs print:text-[9.5pt] text-black tracking-widest uppercase leading-none">{spine.authorCode}</div>
                              <div className="py-1 font-bold text-xs print:text-[9.5pt] text-black lowercase leading-none">{spine.titleCode}</div>
                            </div>

                            {/* Info Buku di bawah kotak (Tanpa Barcode) */}
                            <div className="w-full space-y-0.5 pt-1 border-t border-slate-300">
                              <p className="text-[8.5px] print:text-[6.5pt] font-black text-black line-clamp-2 leading-tight">
                                {book?.title}
                              </p>
                              <p className="text-[7.5px] print:text-[5pt] text-slate-700 truncate leading-none">
                                {book?.author}
                              </p>
                              <p className="text-[7px] print:text-[4.5pt] font-mono text-slate-600 leading-none">
                                ({spine.ddc} {spine.authorCode} {spine.titleCode}) • Copy #{ei.item.copyNumber}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TEMPLATE D: SLIP CAP BAGIAN DALAM BUKU SBTH (6 x 2.5 CM KOTAK POTONG MANUAL) */}
            {template === 'SLIP_DALAM_SBTH' && (
              <div className="sbth-slip-sheet bg-white text-black p-4 rounded-xl shadow-lg border border-slate-300 mx-auto">
                <div className="print:hidden mb-4 p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📑</span>
                    <div>
                      <strong>Slip Cap Bagian Dalam Buku Fisik SBTH (Ukuran 6 x 2.5 cm Kotak Potong Manual):</strong>
                      <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80">
                        Dilengkapi KOP resmi SBTH (Logo di kiri, Tulisan di tengah), No. Daftar 4 Digit (contoh: <code>0101</code>) dan Tanggal (<code>DD/MM/TTTT</code>) dengan garis kotak potong manual.
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-blue-300 shrink-0">
                    Ukuran: <strong>6 x 2.5 cm</strong>
                  </span>
                </div>

                <div className="sbth-slip-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 print:gap-[4mm] justify-center">
                  {itemsToPrint.map((ei) => {
                    const book = ei.book;
                    const slip = getSbthInsideSlipData(ei.item.itemBarcode, ei.item.copyNumber, book?.createdAt || ei.item.acquisitionDate);

                    return (
                      <div
                        key={ei.item.id}
                        className="sbth-slip-label border border-black print:border-[1pt] print:border-black rounded-lg print:rounded-none overflow-hidden bg-white text-black p-1.5 w-full sm:w-[250px] h-[125px] print:w-[60mm] print:h-[25mm] print:max-h-[25mm] print:shadow-none shadow-xs mx-auto flex flex-col justify-between"
                      >
                        {/* 1. KOP Resmi SBTH (Logo di kiri, Teks di tengah) */}
                        <div className="flex items-center gap-1.5 border-b border-black pb-0.5 px-0.5 shrink-0 bg-white">
                          <img
                            src="/logo_sbth.png"
                            alt="Logo SBTH"
                            className="h-4 w-4 print:h-[5mm] print:w-[5mm] object-contain shrink-0"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                          <div className="flex-1 text-center min-w-0">
                            <span className="text-[8px] print:text-[6pt] font-black uppercase tracking-tight block leading-tight text-black">
                              PERPUSTAKAAN KB-TK BHAKTI TUNAS HARAPAN
                            </span>
                            <span className="text-[6.5px] print:text-[4.5pt] text-slate-700 block leading-none mt-0.5">
                              Jl. Jendral Sudirman No 68 A Magelang
                            </span>
                          </div>
                        </div>

                        {/* 2. Isi No Daftar 4 Digit, Tanggal & Barcode Scanner 4 Digit */}
                        <div className="my-0.5 flex items-stretch gap-1.5 min-h-0">
                          {/* Kolom Kiri: Kotak No. Daftar & Tanggal */}
                          <div className="w-[52%] flex flex-col justify-center space-y-0.5 font-mono text-[8.5px] print:text-[6pt]">
                            <div className="flex items-center justify-between border border-black/80 px-1 py-0.5 rounded-xs bg-slate-50">
                              <span className="font-semibold text-slate-800 text-[7.5px] print:text-[5pt]">No. Daftar :</span>
                              <span className="font-black text-[9.5px] print:text-[7pt] text-black tracking-wider">{slip.accessionNumber}</span>
                            </div>
                            <div className="flex items-center justify-between border border-black/80 px-1 py-0.5 rounded-xs bg-slate-50">
                              <span className="font-semibold text-slate-800 text-[7.5px] print:text-[5pt]">Tanggal :</span>
                              <span className="font-bold text-[8.5px] print:text-[6pt] text-black">{slip.dateStr}</span>
                            </div>
                          </div>

                          {/* Kolom Kanan: Barcode Scanner Code-128 dari Nomor Daftar 4 Digit */}
                          <div className="flex-1 flex flex-col items-center justify-center overflow-hidden border border-slate-300 rounded-xs py-0.5 bg-white">
                            <BarcodeSvg
                              value={slip.accessionNumber}
                              width={1.15}
                              height={18}
                              fontSize={8}
                              textMargin={0}
                              className="max-h-[14mm] w-auto"
                            />
                          </div>
                        </div>

                        {/* 3. Info Judul & Eksemplar */}
                        <div className="border-t border-slate-300 pt-0.5 flex items-center justify-between text-[7.5px] print:text-[5pt] text-slate-600 font-sans leading-none shrink-0">
                          <span className="truncate max-w-[125px] font-medium text-slate-900">{book?.title || 'Buku Cerita SBTH'}</span>
                          <span className="font-mono text-[7px] print:text-[4.5pt]">ISBN: {book?.isbn || '-'}</span>
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
                  onClick={handleCleanPrefixesInPrinter}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                  title="Bersihkan awalan huruf seperti SBTH-B-0176 menjadi 0176 dan B0175 menjadi 0175 sesuai format 4-digit fisik SBTH"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>⚡ Ubah ke 4-Digit (0176)</span>
                </button>
                <button
                  type="button"
                  onClick={selectAll}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium hover:bg-slate-200 cursor-pointer"
                >
                  Pilih Semua Sesuai Filter ({filteredItems.length})
                </button>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="px-2.5 py-1 rounded-lg text-slate-500 text-[11px] hover:underline cursor-pointer"
                >
                  Batal Pilih
                </button>
              </div>
            </div>

            {/* Batch Status Edit (Tandai Sudah/Belum Dicetak) */}
            {selectedBarcodes.length > 0 && (
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Tandai Status Fisik ({selectedBarcodes.length} eksemplar dipilih):
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleMarkPrintedStatus(true, 'MANUAL_STAMP')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-600 dark:text-emerald-400 border border-emerald-600/30 font-semibold text-[11px] flex items-center gap-1 transition cursor-pointer"
                    title="Tandai buku sudah selesai dicap manual / ditempel label fisik tanpa harus cetak printer sekarang"
                  >
                    <Check className="h-3 w-3" />
                    Tandai Sudah Dicap / Dicetak
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarkPrintedStatus(false)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-semibold text-[11px] flex items-center gap-1 transition cursor-pointer"
                    title="Ubah tanda kembali menjadi 'Belum Dicetak / Belum Dicap'"
                  >
                    <AlertCircle className="h-3 w-3" />
                    Tandai Belum
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
