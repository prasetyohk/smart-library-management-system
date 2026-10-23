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

// Helper membagi array stiker ke dalam lembaran fisik A4 (N-up Grid Imposition)
function chunkArray<T>(arr: T[], size: number): T[][] {
  if (!arr || arr.length === 0) return [];
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

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
  const [spineSize, setSpineSize] = useState<'68x38' | '74x40'>('74x40'); // Default 74x40 mm (12 stiker/lembar A4 - 2x6 Lanskap / 4x3 Potret)
  const [spineBoxWidth, setSpineBoxWidth] = useState<'CENTERED' | 'FULL'>('CENTERED');
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

  // Selected items to print
  const itemsToPrint = useMemo(() => {
    return enrichedItems.filter((ei) =>
      selectedBarcodes.includes(ei.item.itemBarcode)
    );
  }, [enrichedItems, selectedBarcodes]);

  // For Tom & Jerry 103 (12 stickers per sheet: 3 columns x 4 rows)
  const tj103Slots = useMemo(() => {
    const slots: Array<{ itemInfo?: (typeof enrichedItems)[0]; isSpacer?: boolean; slotIndex: number }> = [];
    if (template === 'TJ_103') {
      for (let i = 0; i < startOffsetIndex; i++) {
        slots.push({ isSpacer: true, slotIndex: i + 1 });
      }
      itemsToPrint.forEach((ei, idx) => {
        slots.push({ itemInfo: ei, slotIndex: startOffsetIndex + idx + 1 });
      });
    }
    return slots;
  }, [template, startOffsetIndex, itemsToPrint]);

  // Pembagian lembaran A4 (N-up Grid Imposition):
  // 1. Slip Dalam Buku: 3 kolom x 10 baris = 30 label per lembar A4 (60x25 mm)
  const slipSheets = useMemo(() => chunkArray(itemsToPrint, 30), [itemsToPrint]);

  // 2. Punggung Buku SBTH:
  // - 68x38 mm (Hemat HVS): 3 kolom x 7 baris = 21 label (Lanskap) atau 5 kolom x 4 baris = 20 label (Potret)
  // - 74x40 mm (Klasik): 2 kolom x 6 baris = 12 label (Lanskap) atau 4 kolom x 3 baris = 12 label (Potret)
  const spineItemsPerSheet = useMemo(() => {
    if (spineSize === '68x38') {
      return spineOrientation === 'LANDSCAPE' ? 21 : 20;
    }
    return 12;
  }, [spineSize, spineOrientation]);

  const spineSheets = useMemo(
    () => chunkArray(itemsToPrint, spineItemsPerSheet),
    [itemsToPrint, spineItemsPerSheet]
  );

  // 3. Tom & Jerry 103: 3 kolom x 4 baris = 12 label per lembar A4 (64x32 mm)
  const tj103Sheets = useMemo(() => chunkArray(tj103Slots, 12), [tj103Slots]);

  // Total lembar A4 yang akan dicetak
  const totalSheets = useMemo(() => {
    if (template === 'SLIP_DALAM_SBTH') return slipSheets.length;
    if (template === 'SPINE_SBTH') return spineSheets.length;
    if (template === 'TJ_103') return tj103Sheets.length;
    return itemsToPrint.length;
  }, [template, slipSheets.length, spineSheets.length, tj103Sheets.length, itemsToPrint.length]);

  if (!isOpen) return null;

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
                  {spineSize === '68x38'
                    ? spineOrientation === 'LANDSCAPE'
                      ? '68×38 mm • 3×7 (21/Lbr Hemat)'
                      : '38×68 mm • 5×4 (20/Lbr Hemat)'
                    : spineOrientation === 'LANDSCAPE'
                    ? '74×40 mm • 2×6 (12/Lbr)'
                    : '40×74 mm • 4×3 (12/Lbr)'}
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
                  6x2.5 cm • Grid 3x10 (30/Lbr)
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
                  6.4x3.2 cm • Grid 3x4 (12/Lbr)
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
            <div className="space-y-2 flex flex-col justify-center">
              {/* Opsi Ukuran Stiker: 68x38 (21/Lbr Hemat) vs 74x40 (12/Lbr) */}
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1">
                  <span>Ukuran Label:</span>
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSpineSize('68x38')}
                    className={`px-2 py-1 rounded-none text-[11px] font-bold transition cursor-pointer ${
                      spineSize === '68x38'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                    title="Ukuran 68x38 mm: Pas 3 Kolom x 7 Baris = 21 Stiker/Lembar A4 (100% Efisiensi HVS A4)"
                  >
                    68 × 38 mm (21 / Lbr) ⭐
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpineSize('74x40')}
                    className={`px-2 py-1 rounded-none text-[11px] font-bold transition cursor-pointer ${
                      spineSize === '74x40'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                    title="Ukuran 74x40 mm: 2 Kolom x 6 Baris = 12 Stiker/Lembar A4"
                  >
                    74 × 40 mm (12 / Lbr)
                  </button>
                </div>
              </div>

              {/* Opsi Orientasi Stiker */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
                <label className="font-bold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1">
                  <span>Orientasi:</span>
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSpineOrientation('LANDSCAPE')}
                    className={`px-2 py-1 rounded-none text-[11px] font-bold transition cursor-pointer ${
                      spineOrientation === 'LANDSCAPE'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {spineSize === '68x38' ? 'Lanskap (68×38 mm)' : 'Lanskap (74×40 mm)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpineOrientation('PORTRAIT')}
                    className={`px-2 py-1 rounded-none text-[11px] font-bold transition cursor-pointer ${
                      spineOrientation === 'PORTRAIT'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {spineSize === '68x38' ? 'Potret (38×68 mm)' : 'Potret (40×74 mm)'}
                  </button>
                </div>
              </div>

              {/* Mode Lanskap: Opsi Lebar Kotak Nomor Panggil */}
              {spineOrientation === 'LANDSCAPE' && (
                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Posisi Kotak:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSpineBoxWidth('CENTERED')}
                      className={`px-2 py-0.5 rounded-none text-[10px] font-semibold transition cursor-pointer ${
                        spineBoxWidth === 'CENTERED'
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                      title={spineSize === '68x38' ? 'Kotak 34mm di tengah pas pada punggung buku' : 'Kotak 38mm di tengah pas pada punggung buku'}
                    >
                      {spineSize === '68x38' ? 'Tengah (34mm)' : 'Tengah (38mm)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpineBoxWidth('FULL')}
                      className={`px-2 py-0.5 rounded-none text-[10px] font-semibold transition cursor-pointer ${
                        spineBoxWidth === 'FULL'
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                      title={spineSize === '68x38' ? 'Kotak selebar stiker penuh (68mm)' : 'Kotak selebar stiker penuh (74mm)'}
                    >
                      {spineSize === '68x38' ? 'Penuh (68mm)' : 'Penuh (74mm)'}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
                <input
                  type="text"
                  value={customShelfCode}
                  onChange={(e) => setCustomShelfCode(e.target.value.toUpperCase())}
                  placeholder="SR"
                  maxLength={6}
                  className="w-14 h-7 rounded-none border border-black bg-white dark:bg-slate-900 px-1.5 text-center text-xs font-mono font-bold text-black dark:text-amber-400 outline-none focus:ring-1 focus:ring-amber-500"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  Rak: <strong>[{customShelfCode || 'SR'}]</strong> • Grid A4: <strong>{spineOrientation === 'LANDSCAPE' ? '2 Kolom × 6 Baris (12 Label/Lbr)' : '4 Kolom × 3 Baris (12 Label/Lbr)'}</strong> • Format 4 Baris: [Rak / DDC / Pengarang / 1 Huruf Judul]. Tanpa barcode & tanpa judul buku.
                </p>
              </div>
            </div>
          ) : template === 'SLIP_DALAM_SBTH' ? (
            <div className="flex items-center p-2.5 text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 gap-2">
              <span className="text-xl">📑</span>
              <p className="leading-tight text-[11px]">
                <strong>Slip Dalam 6 × 2.5 cm (Grid 3×10 = 30 Label/Lembar A4):</strong> Dilengkapi KOP resmi SBTH (Logo di kiri, Teks tengah), No. Daftar 4 Digit (contoh: <code>0101</code>), Tanggal, & <strong>Barcode Scanner 4-Digit</strong> untuk sirkulasi buku. Presisi siku 90° siap potong manual.
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
              <div>
                <span className="text-slate-600 dark:text-slate-400">
                  Siap Cetak:{' '}
                  <strong className="text-emerald-600 font-bold">
                    {itemsToPrint.length} Stiker
                  </strong>
                </span>
                {template !== 'THERMAL_40x30' && itemsToPrint.length > 0 && (
                  <span className="ml-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    {totalSheets} Lembar A4
                  </span>
                )}
              </div>
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
              className="w-full mt-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
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
            <div className="print:hidden mb-5 p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <strong>Petunjuk Cetak Presisi Kertas A4 (N-up Grid Imposition):</strong> Di jendela dialog print browser (Ctrl + P),
                pastikan pilih <strong>Ukuran Kertas: A4 (210 × 297 mm)</strong>, <strong>Margin: None / Kosong (0)</strong>, dan <strong>Skala: 100% (Default)</strong>{' '}
                agar susunan grid (3×10 untuk slip dan 2×6 untuk punggung) tercetak pas sesuai ukuran fisik tanpa tergeser margin browser!
              </div>
            </div>

            {/* TEMPLATE A: TOM & JERRY 103 (3 COLS x 4 ROWS PER A4 SHEET = 12 STIKER / LEMBAR) */}
            {template === 'TJ_103' && (
              <div className="space-y-6 print:space-y-0">
                {itemsToPrint.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 text-xs">
                    Belum ada eksemplar buku yang dipilih. Silakan centang eksemplar di daftar bawah.
                  </div>
                ) : (
                  tj103Sheets.map((sheetSlots, sheetIdx) => (
                    <div
                      key={`tj103-sheet-${sheetIdx}`}
                      className="a4-print-sheet tj103-sheet bg-white text-black p-4 rounded-xl shadow-lg border border-slate-300 mx-auto print:mb-0 print:p-0 print:border-none print:shadow-none print:rounded-none"
                    >
                      {/* Sheet Header Badge (Screen only) */}
                      <div className="print:hidden w-full mb-3 pb-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
                        <span className="font-semibold flex items-center gap-1.5 text-emerald-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          📄 Lembar {sheetIdx + 1} dari {tj103Sheets.length} ({sheetSlots.filter(s => !s.isSpacer).length} Stiker • Grid 3 Kolom × 4 Baris)
                        </span>
                        <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          Tom & Jerry No. 103 • Kertas A4 (210 × 297 mm)
                        </span>
                      </div>

                      <div className="tj103-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 print:gap-x-[3mm] print:gap-y-[2.5mm] justify-center w-full">
                        {sheetSlots.map((slot, idx) => {
                          if (slot.isSpacer) {
                            return (
                              <div
                                key={`spacer-${sheetIdx}-${idx}`}
                                className="tj103-label border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-none flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 text-[10px] p-2 min-h-[120px] print:border-none print:opacity-0"
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
                              className="tj103-label relative border border-slate-300 rounded-none overflow-hidden bg-white text-black shadow-xs flex flex-col justify-between min-h-[128px] print:min-h-[32mm] print:h-[32mm] print:w-[64mm] print:shadow-none print:border-slate-400"
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
                                  <span className="text-[8px] font-bold text-slate-500 bg-slate-100 px-1 rounded-none">
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
                  ))
                )}
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
                      className="thermal-label border border-slate-300 rounded-none overflow-hidden bg-white text-black p-2 w-[160px] h-[120px] print:w-[40mm] print:h-[30mm] flex flex-col justify-between text-center shadow-md print:shadow-none print:break-after-page"
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

            {/* TEMPLATE C: LABEL PUNGGUNG RAK SBTH (7.4 x 4 CM LANSKAP [2x6] / 4 x 7.4 CM POTRET [4x3] - KOTAK SIKU 90 DERAJAT) */}
            {template === 'SPINE_SBTH' && (
              <div className="space-y-6 print:space-y-0">
                <div className="print:hidden mb-4 p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">📏</span>
                    <div>
                      <div className="font-bold flex items-center gap-2 flex-wrap">
                        <span>Standar Label Punggung Buku Fisik SBTH (Presisi Siku 90° - Tanpa Barcode)</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 font-mono text-[10px]">
                          {spineSize === '68x38'
                            ? spineOrientation === 'LANDSCAPE'
                              ? 'Grid A4: 3 Kolom × 7 Baris (21 Label / Lembar Hemat ⭐)'
                              : 'Grid A4: 5 Kolom × 4 Baris (20 Label / Lembar Hemat ⭐)'
                            : spineOrientation === 'LANDSCAPE'
                            ? 'Grid A4: 2 Kolom × 6 Baris (12 Label / Lembar)'
                            : 'Grid A4: 4 Kolom × 3 Baris (12 Label / Lembar)'}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                        Format resmi 4 baris: <strong>SR</strong> (Kode Rak), <strong>DDC</strong>, <strong>Pengarang</strong> (3 huruf), <strong>Judul Depan</strong> (1 huruf).
                        {spineSize === '68x38' ? ' Ukuran efisien 68×38 mm memaksimalkan kertas A4 hingga 21 label per lembar.' : ' Ukuran 74×40 mm standar 12 label per lembar.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSpineSize(s => s === '68x38' ? '74x40' : '68x38')}
                      className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-amber-300 font-semibold text-[11px] hover:bg-amber-100 transition cursor-pointer"
                      title="Klik untuk mengubah ukuran fisik label"
                    >
                      Ukuran: <strong>{spineSize === '68x38' ? '68 × 38 mm ⭐' : '74 × 40 mm'}</strong>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpineOrientation(o => o === 'LANDSCAPE' ? 'PORTRAIT' : 'LANDSCAPE')}
                      className="px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 font-bold text-[11px] hover:bg-amber-400 transition cursor-pointer shadow-xs"
                    >
                      {spineOrientation === 'LANDSCAPE' ? '🔄 Ganti ke Potret' : '🔄 Ganti ke Lanskap'}
                    </button>
                  </div>
                </div>

                {itemsToPrint.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 text-xs">
                    Belum ada eksemplar buku yang dipilih. Silakan centang eksemplar di daftar bawah.
                  </div>
                ) : (
                  spineSheets.map((sheetItems, sheetIdx) => (
                    <div
                      key={`spine-sheet-${sheetIdx}`}
                      className={`a4-print-sheet sbth-spine-sheet ${spineSize === '68x38' ? 'size-68x38' : ''} ${spineOrientation === 'PORTRAIT' ? 'portrait' : ''} bg-white text-black p-4 rounded-xl shadow-lg border border-slate-300 mx-auto print:mb-0 print:p-0 print:border-none print:shadow-none print:rounded-none`}
                    >
                      {/* Sheet Header Badge (Screen only) */}
                      <div className="print:hidden w-full mb-3 pb-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
                        <span className="font-semibold flex items-center gap-1.5 text-amber-700">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          📄 Lembar {sheetIdx + 1} dari {spineSheets.length} ({sheetItems.length} Label • Grid{' '}
                          {spineSize === '68x38'
                            ? spineOrientation === 'LANDSCAPE'
                              ? '3 Kolom × 7 Baris (21 Label)'
                              : '5 Kolom × 4 Baris (20 Label)'
                            : spineOrientation === 'LANDSCAPE'
                            ? '2 Kolom × 6 Baris (12 Label)'
                            : '4 Kolom × 3 Baris (12 Label)'})
                        </span>
                        <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {spineSize === '68x38' ? '68 × 38 mm' : '74 × 40 mm'} • Kertas A4 (210 × 297 mm)
                        </span>
                      </div>

                      {/* Grid Container */}
                      <div
                        className={`sbth-spine-grid ${spineSize === '68x38' ? 'size-68x38' : ''} ${spineOrientation === 'PORTRAIT' ? 'portrait' : ''} grid ${
                          spineSize === '68x38'
                            ? spineOrientation === 'LANDSCAPE'
                              ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 print:gap-x-[2.5mm] print:gap-y-[3.5mm] max-w-[700px]'
                              : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 print:gap-x-[3.5mm] print:gap-y-[4.5mm] max-w-[700px]'
                            : spineOrientation === 'LANDSCAPE'
                            ? 'grid-cols-1 sm:grid-cols-2 gap-3 print:gap-x-[6mm] print:gap-y-[5mm] max-w-[620px] sm:max-w-[660px]'
                            : 'grid-cols-2 sm:grid-cols-4 gap-3 print:gap-x-[6mm] print:gap-y-[8mm] max-w-[620px] sm:max-w-[660px]'
                        } justify-center w-full mx-auto`}
                      >
                        {sheetItems.map((ei) => {
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

                          return (
                            <div
                              key={ei.item.id}
                              className={`sbth-spine-label ${spineSize === '68x38' ? 'size-68x38' : ''} ${spineOrientation === 'PORTRAIT' ? 'portrait' : ''} border-2 border-black rounded-none overflow-hidden bg-white text-black flex flex-col justify-between shadow-xs mx-auto ${
                                spineSize === '68x38'
                                  ? spineOrientation === 'LANDSCAPE'
                                    ? 'w-full max-w-[240px] h-[145px] print:w-[68mm] print:h-[38mm] print:max-h-[38mm]'
                                    : 'w-full max-w-[140px] h-[255px] print:w-[38mm] print:h-[68mm] print:max-h-[68mm]'
                                  : spineOrientation === 'LANDSCAPE'
                                  ? 'w-full max-w-[280px] h-[155px] print:w-[74mm] print:h-[40mm] print:max-h-[40mm]'
                                  : 'w-full max-w-[160px] h-[280px] print:w-[40mm] print:h-[74mm] print:max-h-[74mm]'
                              }`}
                            >
                              {/* 1. KOP RESMI SBTH (Logo di kiri, Teks di tengah) */}
                              <div className="flex items-center gap-1.5 border-b border-black pb-0.5 px-1 shrink-0 bg-white">
                                <img
                                  src="/logo_sbth.png"
                                  alt="Logo SBTH"
                                  className="h-5 w-5 print:h-[6mm] print:w-[6mm] object-contain shrink-0"
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

                              {/* 3. KONTEN LABEL PUNGGUNG: FORMAT 4 BARIS (SR, DDC, PENGARANG, JUDUL DEPAN) SIKU 90° - TANPA BARCODE & TANPA JUDUL BUKU */}
                              {spineOrientation === 'LANDSCAPE' ? (
                                <div className="flex-1 flex items-center justify-center p-1 min-h-0 bg-white">
                                  {/* Kotak Call Number 4-Baris Presisi Siku 90 Derajat */}
                                  <div
                                    className={`${
                                      spineBoxWidth === 'FULL'
                                        ? 'w-full'
                                        : spineSize === '68x38'
                                        ? 'w-[34mm]'
                                        : 'w-[38mm]'
                                    } h-full max-h-[25mm] border-2 border-black rounded-none flex flex-col justify-stretch divide-y-2 divide-black font-mono text-center bg-white`}
                                  >
                                    <div className="flex-1 flex items-center justify-center font-black text-xs print:text-[9.5pt] text-black tracking-widest leading-none">
                                      {customShelfCode || spine.shelfCode}
                                    </div>
                                    <div className="flex-1 flex items-center justify-center font-black text-xs print:text-[9.5pt] text-black tracking-wider leading-none">
                                      {spine.ddc}
                                    </div>
                                    <div className="flex-1 flex items-center justify-center font-black text-xs print:text-[9.5pt] text-black tracking-widest uppercase leading-none">
                                      {spine.authorCode}
                                    </div>
                                    <div className="flex-1 flex items-center justify-center font-bold text-xs print:text-[9.5pt] text-black lowercase leading-none">
                                      {spine.titleCode}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                // Mode Potret: Kotak Call Number 4-Baris Vertikal Siku 90°
                                <div className="flex-1 flex flex-col justify-center p-1.5 min-h-0 bg-white">
                                  <div
                                    className={`w-full h-full ${
                                      spineSize === '68x38' ? 'min-h-[46mm]' : 'min-h-[52mm]'
                                    } border-2 border-black rounded-none flex flex-col justify-stretch divide-y-2 divide-black font-mono text-center bg-white`}
                                  >
                                    <div className="flex-1 flex items-center justify-center font-black text-base print:text-[13pt] text-black tracking-widest leading-none">
                                      {customShelfCode || spine.shelfCode}
                                    </div>
                                    <div className="flex-1 flex items-center justify-center font-black text-base print:text-[13pt] text-black tracking-wider leading-none">
                                      {spine.ddc}
                                    </div>
                                    <div className="flex-1 flex items-center justify-center font-black text-base print:text-[13pt] text-black tracking-widest uppercase leading-none">
                                      {spine.authorCode}
                                    </div>
                                    <div className="flex-1 flex items-center justify-center font-bold text-base print:text-[13pt] text-black lowercase leading-none">
                                      {spine.titleCode}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TEMPLATE D: SLIP CAP BAGIAN DALAM BUKU SBTH (6 x 2.5 CM KOTAK SIKU 90 DERAJAT [3x10 = 30 LABEL / LEMBAR A4]) */}
            {template === 'SLIP_DALAM_SBTH' && (
              <div className="space-y-6 print:space-y-0">
                <div className="print:hidden mb-4 p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">📑</span>
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        <span>Slip Cap Bagian Dalam Buku Fisik SBTH (Presisi Siku 90°)</span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-800 dark:text-blue-200 font-mono text-[10px]">
                          Grid A4: 3 Kolom × 10 Baris (30 Label / Lembar)
                        </span>
                      </div>
                      <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80 mt-0.5">
                        Dilengkapi KOP resmi SBTH (Logo di kiri, Tulisan di tengah), No. Daftar 4 Digit (contoh: <code>0101</code>) dan Tanggal (<code>DD/MM/TTTT</code>) dengan garis potong siku 90° efisien A4.
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs bg-white dark:bg-slate-900 px-3 py-1 rounded-md border border-blue-300 shrink-0">
                    Ukuran: <strong>6 × 2.5 cm</strong>
                  </span>
                </div>

                {itemsToPrint.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 text-xs">
                    Belum ada eksemplar buku yang dipilih. Silakan centang eksemplar di daftar bawah.
                  </div>
                ) : (
                  slipSheets.map((sheetItems, sheetIdx) => (
                    <div
                      key={`slip-sheet-${sheetIdx}`}
                      className="a4-print-sheet sbth-slip-sheet bg-white text-black p-4 rounded-xl shadow-lg border border-slate-300 mx-auto print:mb-0 print:p-0 print:border-none print:shadow-none print:rounded-none"
                    >
                      {/* Sheet Header Badge (Screen only) */}
                      <div className="print:hidden w-full mb-3 pb-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
                        <span className="font-semibold flex items-center gap-1.5 text-blue-700">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          📄 Lembar {sheetIdx + 1} dari {slipSheets.length} ({sheetItems.length} Label • Grid 3 Kolom × 10 Baris)
                        </span>
                        <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          Kertas A4 (210 × 297 mm)
                        </span>
                      </div>

                      <div className="sbth-slip-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 print:gap-x-[3mm] print:gap-y-[2mm] justify-center w-full max-w-[820px] mx-auto">
                        {sheetItems.map((ei) => {
                          const book = ei.book;
                          const slip = getSbthInsideSlipData(ei.item.itemBarcode, ei.item.copyNumber, book?.createdAt || ei.item.acquisitionDate);

                          return (
                            <div
                              key={ei.item.id}
                              className="sbth-slip-label border border-black print:border-[1pt] print:border-black rounded-none overflow-hidden bg-white text-black p-1.5 w-full max-w-[260px] h-[120px] print:w-[60mm] print:h-[25mm] print:max-h-[25mm] print:shadow-none shadow-xs mx-auto flex flex-col justify-between"
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
                                  <div className="flex items-center justify-between border border-black/80 px-1 py-0.5 rounded-none bg-slate-50">
                                    <span className="font-semibold text-slate-800 text-[7.5px] print:text-[5pt]">No. Daftar :</span>
                                    <span className="font-black text-[9.5px] print:text-[7pt] text-black tracking-wider">{slip.accessionNumber}</span>
                                  </div>
                                  <div className="flex items-center justify-between border border-black/80 px-1 py-0.5 rounded-none bg-slate-50">
                                    <span className="font-semibold text-slate-800 text-[7.5px] print:text-[5pt]">Tanggal :</span>
                                    <span className="font-bold text-[8.5px] print:text-[6pt] text-black">{slip.dateStr}</span>
                                  </div>
                                </div>

                                {/* Kolom Kanan: Barcode Scanner Code-128 dari Nomor Daftar 4 Digit */}
                                <div className="flex-1 flex flex-col items-center justify-center overflow-hidden border border-slate-300 rounded-none py-0.5 bg-white">
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
                  ))
                )}
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
