'use client';

import React, { useState, useMemo } from 'react';
import { Book } from '@/types';
import { libraryStore } from '@/lib/storage';
import { soundFx } from '@/lib/sound';
import {
  CATEGORIES,
  getSbthSpineCode,
  deriveShelfCode,
  deriveCategoryDdc,
  deriveAuthorCode,
  deriveTitleCode,
} from '@/lib/constants';
import {
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Layers,
  RotateCcw,
  SlidersHorizontal,
  Zap,
} from 'lucide-react';

interface BulkSpineSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBookIds: string[];
  onSuccess: (updatedCount: number) => void;
}

export const BulkSpineSyncModal: React.FC<BulkSpineSyncModalProps> = ({
  isOpen,
  onClose,
  selectedBookIds,
  onSuccess,
}) => {
  const allBooks = libraryStore.getBooks();

  // Target scope: 'SELECTED' | 'ALL'
  const [targetScope, setTargetScope] = useState<'SELECTED' | 'ALL'>(
    selectedBookIds.length > 0 ? 'SELECTED' : 'ALL'
  );

  // Sync mode: 'AUTO' (standard algorithm) | 'CUSTOM' (custom override values like Screenshot 2)
  const [syncMode, setSyncMode] = useState<'AUTO' | 'CUSTOM'>('AUTO');

  // Custom 4-Baris inputs (matching Screenshot 2)
  const [customShelfCode, setCustomShelfCode] = useState<string>('');
  const [customClassification, setCustomClassification] = useState<string>('');
  const [customAuthorCode, setCustomAuthorCode] = useState<string>('');
  const [customTitleCode, setCustomTitleCode] = useState<string>('');

  if (!isOpen) return null;

  // Resolved list of target books
  const targetBooks: Book[] = targetScope === 'SELECTED' && selectedBookIds.length > 0
    ? allBooks.filter((b) => selectedBookIds.includes(b.id))
    : allBooks;

  // Reset custom codes to default standard
  const handleResetCustomToDefault = () => {
    setCustomShelfCode('');
    setCustomClassification('');
    setCustomAuthorCode('');
    setCustomTitleCode('');
    soundFx.playScanBeep();
  };

  // Compute preview for target books (show first 6 preview items)
  const previewItems = targetBooks.slice(0, 6).map((book) => {
    const spine = getSbthSpineCode(
      book.title,
      book.author,
      book.categoryId,
      customShelfCode || undefined,
      customClassification || undefined,
      customAuthorCode || undefined,
      customTitleCode || undefined
    );

    const b1 = syncMode === 'CUSTOM' && customShelfCode.trim()
      ? customShelfCode.trim().toUpperCase()
      : spine.shelfCode;

    const b2 = syncMode === 'CUSTOM' && customClassification.trim()
      ? customClassification.trim()
      : spine.ddc;

    const b3 = syncMode === 'CUSTOM' && customAuthorCode.trim()
      ? customAuthorCode.trim().toUpperCase()
      : spine.authorCode;

    const b4 = syncMode === 'CUSTOM' && customTitleCode.trim()
      ? customTitleCode.trim().toLowerCase()
      : spine.titleCode;

    const cat = CATEGORIES.find((c) => c.id === book.categoryId) || CATEGORIES[0];

    return {
      book,
      cat,
      baris1: b1,
      baris2: b2,
      baris3: b3,
      baris4: b4,
      callNumber: `${b2} ${b3} ${b4}`,
    };
  });

  // Execute bulk sync
  const handleExecuteSync = () => {
    if (targetBooks.length === 0) {
      alert('Tidak ada buku target yang dipilih.');
      return;
    }

    const bookIdsToUpdate = targetBooks.map((b) => b.id);

    const options = syncMode === 'CUSTOM'
      ? {
          customShelfCode: customShelfCode.trim() || undefined,
          customClassification: customClassification.trim() || undefined,
          customAuthorCode: customAuthorCode.trim() || undefined,
          customTitleCode: customTitleCode.trim() || undefined,
          forceRecalculate: true,
        }
      : {
          forceRecalculate: true,
        };

    const result = libraryStore.bulkSyncSpineCodes(bookIdsToUpdate, options);
    soundFx.playSuccessChime();

    alert(
      `✓ Berhasil menyinkronkan ${result.updatedCount} label punggung buku SBTH (4-baris vertikal)!`
    );

    onSuccess(result.updatedCount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-surface border border-border shadow-2xl my-6 flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-border p-5 bg-surface-2/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text flex items-center gap-2">
                <span>Sinkronisasi Massal Label Punggung Buku</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                  4 Baris Vertikal SBTH
                </span>
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Atur serentak dan sinkronkan label stiker samping buku agar cocok 100% dengan standar fisik rak
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-text-muted hover:bg-surface-3 hover:text-text transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-text">
          
          {/* 1. Target Scope Selector */}
          <div className="p-4 rounded-2xl bg-surface-2 border border-border space-y-2.5">
            <label className="font-bold text-text text-xs uppercase tracking-wider block flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-amber-500" />
              <span>1. Pilih Buku Target Sinkronisasi:</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={selectedBookIds.length === 0}
                onClick={() => setTargetScope('SELECTED')}
                className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                  targetScope === 'SELECTED' && selectedBookIds.length > 0
                    ? 'border-amber-500 bg-amber-500/10 text-text font-bold ring-1 ring-amber-500'
                    : 'border-border bg-surface text-text-muted hover:text-text'
                } ${selectedBookIds.length === 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div>
                  <div className="font-semibold text-xs text-text">
                    Buku Terpilih ({selectedBookIds.length} Judul)
                  </div>
                  <div className="text-[11px] text-text-muted mt-0.5">
                    Hanya buku yang dicentang di tabel koleksi
                  </div>
                </div>
                {targetScope === 'SELECTED' && selectedBookIds.length > 0 && (
                  <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setTargetScope('ALL')}
                className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                  targetScope === 'ALL'
                    ? 'border-amber-500 bg-amber-500/10 text-text font-bold ring-1 ring-amber-500'
                    : 'border-border bg-surface text-text-muted hover:text-text'
                } cursor-pointer`}
              >
                <div>
                  <div className="font-semibold text-xs text-text">
                    Seluruh Koleksi ({allBooks.length} Judul)
                  </div>
                  <div className="text-[11px] text-text-muted mt-0.5">
                    Terapkan rumus standar ke semua buku di sistem
                  </div>
                </div>
                {targetScope === 'ALL' && (
                  <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                )}
              </button>
            </div>
          </div>

          {/* 2. Sync Mode Toggle */}
          <div className="p-4 rounded-2xl bg-surface-2 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-text text-xs uppercase tracking-wider block flex items-center gap-1.5">
                <SlidersHorizontal className="h-4 w-4 text-amber-500" />
                <span>2. Metode Pengisian Kode:</span>
              </label>
              <div className="flex items-center gap-1.5 p-1 bg-surface rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setSyncMode('AUTO')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                    syncMode === 'AUTO'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  <Zap className="h-3 w-3" />
                  <span>Otomatis SBTH</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSyncMode('CUSTOM')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                    syncMode === 'CUSTOM'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  <SlidersHorizontal className="h-3 w-3" />
                  <span>Kustomisasi Nilai</span>
                </button>
              </div>
            </div>

            {/* Mode A: Auto Explanation */}
            {syncMode === 'AUTO' ? (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-text space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400">
                  <Sparkles className="h-4 w-4" />
                  <span>Formula Standar Otomatis Perpustakaan SBTH:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-text-muted">
                  <div className="p-2 rounded-lg bg-surface border border-border">
                    <strong className="text-text">Baris 1 (Kode Rak):</strong> Diambil dari kode singkatan kategori masing-masing buku (e.g. SR, AG, CR, AS).
                  </div>
                  <div className="p-2 rounded-lg bg-surface border border-border">
                    <strong className="text-text">Baris 2 (DDC):</strong> Diambil dari nomor klasifikasi standar buku (e.g. 813 Fiksi, 220 Agama, 398.2 Dongeng).
                  </div>
                  <div className="p-2 rounded-lg bg-surface border border-border">
                    <strong className="text-text">Baris 3 (Pengarang):</strong> 3 huruf kapital pertama nama belakang pengarang (Cutter code).
                  </div>
                  <div className="p-2 rounded-lg bg-surface border border-border">
                    <strong className="text-text">Baris 4 (Judul):</strong> 1 huruf depan judul buku (mengabaikan awalan seperti Seri, Mengenal, Si).
                  </div>
                </div>
              </div>
            ) : (
              /* Mode B: Custom Inputs Box (Exact match to Screenshot 2) */
              <div className="rounded-2xl p-4 bg-amber-500/10 border border-amber-500/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📏</span>
                    <div>
                      <span className="font-bold text-text text-xs uppercase tracking-wider block">
                        Standar Label Punggung Buku SBTH (4 Baris Vertikal)
                      </span>
                      <p className="text-[10px] text-text-muted">
                        Kustomisasi 4 baris stiker samping buku agar cocok 100% dengan buku lama di rak perpustakaan
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetCustomToDefault}
                    className="px-2.5 py-1 rounded-lg bg-surface border border-amber-500/40 hover:bg-amber-500/10 text-[10px] font-bold text-amber-500 flex items-center gap-1 shadow-xs transition self-start sm:self-auto cursor-pointer"
                    title="Kosongkan untuk menggunakan rumus otomatis per buku"
                  >
                    <RotateCcw className="h-3 w-3 text-amber-500" />
                    <span>Reset Kosong (Auto)</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-text block mb-1">
                      Baris 1: Kode Rak / Kategori
                    </label>
                    <input
                      type="text"
                      value={customShelfCode}
                      onChange={(e) => setCustomShelfCode(e.target.value.toUpperCase())}
                      placeholder="e.g. SR / AG"
                      className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-mono font-bold text-text text-center focus:border-amber-500 outline-hidden uppercase"
                    />
                    <span className="text-[9px] text-text-muted mt-0.5 block text-center">
                      {customShelfCode ? `Semua -> "${customShelfCode}"` : 'Bawaan Kategori (Auto)'}
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-text block mb-1">
                      Baris 2: Nomor DDC
                    </label>
                    <input
                      type="text"
                      value={customClassification}
                      onChange={(e) => setCustomClassification(e.target.value)}
                      placeholder="e.g. 813 / 220"
                      className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-mono font-bold text-text text-center focus:border-amber-500 outline-hidden"
                    />
                    <span className="text-[9px] text-text-muted mt-0.5 block text-center">
                      {customClassification ? `Semua -> "${customClassification}"` : 'e.g. 813, 220, 398.2 (Auto)'}
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-text block mb-1">
                      Baris 3: 3 Huruf Pengarang
                    </label>
                    <input
                      type="text"
                      value={customAuthorCode}
                      onChange={(e) => setCustomAuthorCode(e.target.value.toUpperCase().slice(0, 3))}
                      placeholder="Auto Pengarang"
                      className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-mono font-bold text-text text-center focus:border-amber-500 outline-hidden uppercase"
                    />
                    <span className="text-[9px] text-text-muted mt-0.5 block text-center">
                      {customAuthorCode ? `Semua -> "${customAuthorCode}"` : '3 Huruf Besar (Auto Cutter)'}
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-text block mb-1">
                      Baris 4: 1 Huruf Judul
                    </label>
                    <input
                      type="text"
                      value={customTitleCode}
                      onChange={(e) => setCustomTitleCode(e.target.value.toLowerCase().slice(0, 1))}
                      placeholder="Auto Judul"
                      className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-mono font-bold text-text text-center focus:border-amber-500 outline-hidden lowercase"
                    />
                    <span className="text-[9px] text-text-muted mt-0.5 block text-center">
                      {customTitleCode ? `Semua -> "${customTitleCode}"` : '1 Huruf Judul (Auto)'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Live Preview Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-text text-xs uppercase tracking-wider block flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-amber-500" />
                <span>3. Pratinjau Hasil Sinkronisasi ({targetBooks.length} Buku Target):</span>
              </label>
              <span className="text-[11px] text-text-muted">
                Menampilkan {Math.min(targetBooks.length, 6)} contoh stiker
              </span>
            </div>

            {targetBooks.length === 0 ? (
              <div className="p-6 text-center text-text-muted bg-surface-2 rounded-2xl border border-border">
                Tidak ada buku yang terpilih untuk pratinjau.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {previewItems.map((item, idx) => (
                  <div
                    key={item.book.id || idx}
                    className="p-2 rounded-2xl bg-surface border border-border flex flex-col items-center justify-between text-center shadow-2xs space-y-2 hover:border-amber-500/50 transition"
                  >
                    <div className="w-full">
                      <div className="text-[10px] font-bold text-text truncate max-w-full" title={item.book.title}>
                        {idx + 1}. {item.book.title}
                      </div>
                      <div className="text-[9px] text-text-muted truncate max-w-full" title={item.book.author}>
                        {item.book.author}
                      </div>
                    </div>

                    {/* Mini Spine Sticker Sticker Card */}
                    <div className="w-[68px] h-[96px] rounded-lg border-2 border-slate-900 bg-white text-slate-950 font-mono font-bold text-[11px] flex flex-col items-center justify-center py-1 shadow-xs divide-y divide-slate-300">
                      <div className="w-full text-center py-0.5 text-amber-700 font-extrabold uppercase text-[10px]">
                        {item.baris1}
                      </div>
                      <div className="w-full text-center py-0.5 text-slate-900 font-bold text-[11px]">
                        {item.baris2}
                      </div>
                      <div className="w-full text-center py-0.5 text-slate-900 uppercase text-[10px]">
                        {item.baris3}
                      </div>
                      <div className="w-full text-center py-0.5 text-slate-900 lowercase text-[10px]">
                        {item.baris4}
                      </div>
                    </div>

                    <div className="text-[9px] font-mono text-amber-600 dark:text-amber-400 truncate w-full">
                      {item.callNumber}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-5 border-t border-border bg-surface-2/70 shrink-0">
          <div className="text-xs text-text-muted">
            <span className="font-semibold text-text">{targetBooks.length} judul buku</span> akan disinkronkan langsung ke database perpustakaan.
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-surface hover:bg-surface-3 border border-border text-xs font-semibold text-text transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleExecuteSync}
              disabled={targetBooks.length === 0}
              className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>⚡ Sinkronkan {targetBooks.length} Judul Buku</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
