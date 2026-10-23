'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Tag,
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  Check,
  BookOpen,
  Star,
  Leaf,
  Heart,
  Sparkles,
  Save,
  Download,
  Palette,
  RefreshCw,
  FileSpreadsheet,
  Layers,
  Search,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { Category } from '@/types';
import { CATEGORIES } from '@/lib/constants';
import { libraryStore } from '@/lib/storage';
import { soundFx } from '@/lib/sound';
import {
  exportEddcToExcel,
  PRESET_LIBRARY_COLORS,
  OFFICIAL_DDC_CATEGORIES,
  EDDC_DETAILED_SUBDIVISIONS,
} from '@/lib/eddc';

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoriesUpdated?: () => void;
}

export const CategoryManagementModal: React.FC<CategoryManagementModalProps> = ({
  isOpen,
  onClose,
  onCategoriesUpdated,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'COLORS' | 'SUBDIVISIONS' | 'FORM'>('COLORS');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchSubdivision, setSearchSubdivision] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [ddcCode, setDdcCode] = useState('800');
  const [shortName, setShortName] = useState('');
  const [shelfCode, setShelfCode] = useState('SR');
  const [colorHex, setColorHex] = useState('#EF4444');
  const [iconName, setIconName] = useState('BookOpen');
  const [shelfLocation, setShelfLocation] = useState('Rak Utama');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCategories(libraryStore.getCategories());
      resetForm();
      setStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setDdcCode('800');
    setShortName('');
    setShelfCode('SR');
    setColorHex('#EF4444');
    setIconName('BookOpen');
    setShelfLocation('Rak Utama');
    setDescription('');
    setEditingId(null);
  };

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDdcCode(cat.ddcCode || '800');
    setShortName(cat.shortName || cat.name.slice(0, 10).toUpperCase());
    setShelfCode(cat.shelfCode || 'SR');
    setColorHex(cat.colorHex || '#EF4444');
    setIconName(cat.iconName || 'BookOpen');
    setShelfLocation(cat.shelfLocation || 'Rak Utama');
    setDescription(cat.description || '');
    setActiveTab('FORM');
    soundFx.playScanBeep();
  };

  // Ubah warna kategori secara langsung & instan
  const handleQuickColorChange = (catId: string, newHex: string) => {
    libraryStore.updateCategory(catId, { colorHex: newHex });
    setCategories(libraryStore.getCategories());
    soundFx.playSuccessChime();
    setStatusMessage({
      type: 'success',
      text: `Warna kategori berhasil diubah menjadi ${newHex}. Perubahan langsung diterapkan pada stiker punggung buku.`,
    });
    if (onCategoriesUpdated) onCategoriesUpdated();
  };

  // Unduh Skema Resmi e-DDC ke Excel
  const handleDownloadExcel = () => {
    try {
      exportEddcToExcel(categories);
      soundFx.playSuccessChime();
      setStatusMessage({
        type: 'success',
        text: 'File "Skema_Resmi_eDDC_Perpustakaan_SBTH.xlsx" berhasil diunduh! Berisi 10 Kelas DDC, Subdivisi PAUD/TK, dan Panduan Cetak Presisi.',
      });
    } catch (err: any) {
      console.error('Export Excel failed:', err);
      alert('Gagal mengunduh Excel: ' + (err.message || err));
    }
  };

  // Sinkronkan seluruh buku lama di localStorage ke format DDC resmi
  const handleSyncBooksToDdc = () => {
    const result = libraryStore.syncAllBooksToDdc();
    const total = libraryStore.getBooks().length;
    soundFx.playSuccessChime();
    setStatusMessage({
      type: 'success',
      text: `Sinkronisasi Selesai: ${result.updatedCount} dari ${total} buku di perpustakaan kini seragam menggunakan kode klasifikasi DDC!`,
    });
    if (onCategoriesUpdated) onCategoriesUpdated();
  };

  // Reset ke 10 DDC Bawaan
  const handleResetDefaults = () => {
    if (confirm('Kembalikan seluruh kategori dan palet warna ke 10 Format Resmi DDC Bawaan SBTH (000 s/d 900)?')) {
      libraryStore.resetToDdcCategories();
      setCategories(libraryStore.getCategories());
      resetForm();
      soundFx.playSuccessChime();
      setStatusMessage({
        type: 'success',
        text: 'Kategori berhasil di-reset ke 10 format resmi DDC (000-900) dengan warna stiker kontras.',
      });
      if (onCategoriesUpdated) onCategoriesUpdated();
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama Kategori wajib diisi.');
      return;
    }

    const badgeBg = 'bg-surface-2';
    const badgeBorder = 'border-border';
    const badgeText = 'text-text';

    if (editingId) {
      libraryStore.updateCategory(editingId, {
        name: name.trim(),
        ddcCode: ddcCode.trim(),
        shortName: (shortName.trim() || name.trim().slice(0, 10)).toUpperCase(),
        shelfCode: (shelfCode.trim() || 'SR').toUpperCase(),
        colorHex,
        iconName,
        shelfLocation: shelfLocation.trim(),
        description: description.trim(),
      });
      soundFx.playSuccessChime();
    } else {
      libraryStore.addCategory({
        name: name.trim(),
        ddcCode: ddcCode.trim(),
        shortName: (shortName.trim() || name.trim().slice(0, 10)).toUpperCase(),
        shelfCode: (shelfCode.trim() || 'SR').toUpperCase(),
        colorHex,
        badgeBg,
        badgeBorder,
        badgeText,
        iconName,
        shelfLocation: shelfLocation.trim(),
        description: description.trim(),
      });
      soundFx.playSuccessChime();
    }

    setCategories(libraryStore.getCategories());
    resetForm();
    setActiveTab('COLORS');
    setStatusMessage({
      type: 'success',
      text: editingId ? 'Perubahan kategori berhasil disimpan.' : 'Kategori baru berhasil ditambahkan.',
    });
    if (onCategoriesUpdated) onCategoriesUpdated();
  };

  const handleDelete = (id: string, catName: string) => {
    if (confirm(`Yakin ingin menghapus kategori "${catName}"?`)) {
      const ok = libraryStore.deleteCategory(id);
      if (ok) {
        setCategories(libraryStore.getCategories());
        soundFx.playScanBeep();
        if (onCategoriesUpdated) onCategoriesUpdated();
      } else {
        alert('Minimal harus ada 1 kategori di sistem.');
      }
    }
  };

  const AVAILABLE_ICONS = [
    { id: 'BookOpen', label: 'Buku Terbuka', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'Star', label: 'Bintang / Fabel', icon: <Star className="h-4 w-4" /> },
    { id: 'Leaf', label: 'Daun / Sains Alam', icon: <Leaf className="h-4 w-4" /> },
    { id: 'Heart', label: 'Hati / Karakter', icon: <Heart className="h-4 w-4" /> },
    { id: 'Sparkles', label: 'Kilau / Spesial', icon: <Sparkles className="h-4 w-4" /> },
  ];

  // Filter Subdivisi
  const filteredSubdivisions = EDDC_DETAILED_SUBDIVISIONS.filter(
    (s) =>
      s.code.includes(searchSubdivision) ||
      s.subject.toLowerCase().includes(searchSubdivision.toLowerCase()) ||
      s.examples.toLowerCase().includes(searchSubdivision.toLowerCase()) ||
      s.mainClass.toLowerCase().includes(searchSubdivision.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-5xl rounded-3xl bg-surface border border-border p-6 shadow-2xl space-y-4 max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-xs shrink-0">
              <Palette className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display text-text flex items-center gap-2">
                <span>Klasifikasi e-DDC & Pengaturan Warna Label Buku</span>
                <span className="text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  DDC 000-900
                </span>
              </h3>
              <p className="text-xs text-text-muted">
                Standar Dewey Decimal Classification resmi Perpusnas & kustomisasi warna stiker punggung buku KB-TK SBTH
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Tombol Download Excel */}
            <button
              type="button"
              onClick={handleDownloadExcel}
              className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              title="Unduh Tabel Format e-DDC Lengkap ke File Excel (.xlsx)"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Unduh e-DDC (Excel)</span>
            </button>

            {/* Tombol Sinkronkan Buku */}
            <button
              type="button"
              onClick={handleSyncBooksToDdc}
              className="px-3 py-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              title="Seragamkan seluruh buku di koleksi ke format kategori DDC"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Sinkronkan Buku ke DDC</span>
            </button>

            {/* Tombol Reset Bawaan */}
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-1.5 rounded-xl border border-border bg-surface-2 hover:bg-surface text-text-muted hover:text-amber-500 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Reset ke 10 Kategori DDC Bawaan"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-text-muted hover:text-text hover:bg-surface-2 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {statusMessage && (
          <div className="p-3 rounded-2xl text-xs flex items-center justify-between gap-2 border bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 animate-in fade-in shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              <span className="font-medium">{statusMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="p-1 text-emerald-600 hover:text-emerald-800 rounded-lg cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-border pb-2 shrink-0 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('COLORS')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'COLORS'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-text-muted hover:text-text hover:bg-surface-2'
            }`}
          >
            <Palette className="h-4 w-4" />
            <span>Pengaturan Warna Stiker DDC ({categories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SUBDIVISIONS')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'SUBDIVISIONS'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-text-muted hover:text-text hover:bg-surface-2'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Katalog Subdivisi e-DDC PAUD/TK (40+)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('FORM')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'FORM'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-text-muted hover:text-text hover:bg-surface-2'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>{editingId ? 'Edit Detail Kategori' : 'Tambah Kategori Khusus'}</span>
          </button>
        </div>

        {/* TAB CONTENT 1: QUICK COLOR ASSIGNMENT */}
        {activeTab === 'COLORS' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-text">
                <span className="text-base">💡</span>
                <div>
                  <span className="font-bold block">Ubah Warna Kategori Langsung Sekali Klik:</span>
                  <p className="text-[11px] text-text-muted">
                    Pilih bulatan warna dari palet di setiap baris atau klik kotak warna untuk memilih warna kustom. Warna ini otomatis dipakai pada strip stiker punggung buku (7.4 x 4 cm).
                  </p>
                </div>
              </div>
            </div>

            {/* List / Cards Kategori DDC */}
            <div className="grid grid-cols-1 gap-2.5">
              {categories.map((cat) => {
                const currentHex = cat.colorHex || '#EF4444';
                return (
                  <div
                    key={cat.id}
                    className="p-3 rounded-2xl border border-border bg-surface-2/60 hover:bg-surface-2 transition flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-xs"
                  >
                    {/* Info Utama Kategori */}
                    <div className="flex items-start sm:items-center gap-3 min-w-[280px]">
                      {/* Strip Warna & Badge DDC */}
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <span
                          className="h-8 w-8 rounded-xl shrink-0 shadow-md flex items-center justify-center text-white font-mono font-bold text-xs border border-white/20"
                          style={{ backgroundColor: currentHex }}
                        >
                          {cat.ddcCode || cat.id.replace('ddc-', '')}
                        </span>
                        <span className="text-[9px] font-mono text-text-muted">
                          {cat.shelfCode || 'SR'}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-text text-sm">
                            {cat.name}
                          </h4>
                          <span
                            className="px-2 py-0.5 rounded-md font-mono font-bold text-[10px]"
                            style={{
                              backgroundColor: `${currentHex}20`,
                              color: currentHex,
                            }}
                          >
                            {cat.shortName || cat.name.slice(0, 10).toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1">
                          {cat.description || cat.shelfLocation || '-'}
                        </p>
                      </div>
                    </div>

                    {/* Palet Warna Cepat (16 Pilihan Preset + Native Color Picker) */}
                    <div className="flex items-center flex-wrap gap-1.5 lg:justify-end">
                      <div className="flex items-center gap-1 flex-wrap bg-surface p-1 rounded-xl border border-border">
                        {PRESET_LIBRARY_COLORS.slice(0, 12).map((preset) => {
                          const isActive = currentHex.toUpperCase() === preset.hex.toUpperCase();
                          return (
                            <button
                              key={preset.hex}
                              type="button"
                              onClick={() => handleQuickColorChange(cat.id, preset.hex)}
                              className={`h-5 w-5 rounded-full transition transform hover:scale-125 flex items-center justify-center cursor-pointer ${
                                isActive ? 'ring-2 ring-amber-500 scale-110 shadow-sm' : 'opacity-80 hover:opacity-100'
                              }`}
                              style={{ backgroundColor: preset.hex }}
                              title={`${preset.name} (${preset.hex})`}
                            >
                              {isActive && <Check className="h-3 w-3 text-white drop-shadow" />}
                            </button>
                          );
                        })}

                        {/* Native Color Picker untuk warna bebas */}
                        <div className="relative flex items-center ml-1 pl-1 border-l border-border" title="Pilih Warna Kustom">
                          <input
                            type="color"
                            value={currentHex}
                            onChange={(e) => handleQuickColorChange(cat.id, e.target.value)}
                            className="h-6 w-7 rounded-md cursor-pointer border border-border bg-transparent p-0.5"
                          />
                        </div>
                      </div>

                      {/* Tombol Edit Rincian */}
                      <button
                        type="button"
                        onClick={() => handleStartEdit(cat)}
                        className="p-1.5 rounded-xl text-amber-500 hover:bg-amber-500/10 transition cursor-pointer"
                        title="Edit rincian teks & nama kategori ini"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>

                      {/* Tombol Hapus */}
                      <button
                        type="button"
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Hapus kategori ini"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB CONTENT 2: SUBDIVISI RESMI e-DDC PERPUSNAS (40+ SUBJEK ANAK) */}
        {activeTab === 'SUBDIVISIONS' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-text-muted" />
                <input
                  type="text"
                  value={searchSubdivision}
                  onChange={(e) => setSearchSubdivision(e.target.value)}
                  placeholder="Cari nomor DDC (misal: 398.2, 590), subjek (fabel, hewan, salat), atau contoh judul..."
                  className="w-full rounded-xl border border-border bg-surface pl-8 pr-3 py-2 text-xs text-text outline-hidden focus:border-amber-500"
                />
              </div>
              <button
                type="button"
                onClick={handleDownloadExcel}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Semua Subdivisi (.xlsx)</span>
              </button>
            </div>

            <div className="rounded-2xl border border-border overflow-hidden bg-surface shadow-xs">
              <div className="overflow-x-auto max-h-[50vh]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-2 text-text-muted border-b border-border font-semibold sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Kode DDC</th>
                      <th className="py-2.5 px-3">Kelas Utama</th>
                      <th className="py-2.5 px-3">Subjek / Bidang</th>
                      <th className="py-2.5 px-3">Contoh Judul Buku PAUD & TK</th>
                      <th className="py-2.5 px-3">Rekomendasi Rak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredSubdivisions.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-surface-2/60 transition">
                        <td className="py-2 px-3">
                          <span className="font-mono font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            {sub.code}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-semibold text-text">{sub.mainClass}</td>
                        <td className="py-2 px-3 font-medium text-text">{sub.subject}</td>
                        <td className="py-2 px-3 text-text-muted">{sub.examples}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-surface-2 border border-border text-[10px] font-mono text-text-muted">
                            {sub.shelfSuggestion}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT 3: TAMBAH / EDIT KATEGORI LENGKAP */}
        {activeTab === 'FORM' && (
          <div className="flex-1 overflow-y-auto pr-1 text-xs">
            <form
              onSubmit={handleSaveForm}
              className="p-5 rounded-2xl bg-surface-2 border border-border space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h4 className="font-bold text-text text-sm flex items-center gap-2">
                  <Tag className="h-4 w-4 text-amber-500" />
                  <span>{editingId ? 'Edit Detail Kategori Buku' : 'Tambah Kategori Buku Baru'}</span>
                </h4>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setActiveTab('COLORS');
                    }}
                    className="text-xs text-rose-500 hover:underline font-semibold cursor-pointer"
                  >
                    Batal Edit
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-text-muted block mb-1">
                    Nama Kategori <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: 800 - Kesusastraan & Fabel"
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text font-bold outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-text-muted block mb-1">
                    Kode DDC (000 - 900):
                  </label>
                  <input
                    type="text"
                    value={ddcCode}
                    onChange={(e) => setDdcCode(e.target.value)}
                    placeholder="Contoh: 800 atau 398.2"
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text font-mono font-bold outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-text-muted block mb-1">
                    Singkatan Stiker Punggung:
                  </label>
                  <input
                    type="text"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value.toUpperCase())}
                    placeholder="Contoh: 800 SASTRA"
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text font-mono font-bold outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-text-muted block mb-1">
                    Kode Rak Fisik (2-3 Huruf):
                  </label>
                  <input
                    type="text"
                    value={shelfCode}
                    onChange={(e) => setShelfCode(e.target.value.toUpperCase())}
                    placeholder="Contoh: SR (Sastra)"
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text font-mono font-bold outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-text-muted block mb-1">
                    Warna Stiker Punggung:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colorHex}
                      onChange={(e) => setColorHex(e.target.value)}
                      className="h-8 w-10 rounded-lg cursor-pointer border border-border bg-transparent p-0.5"
                    />
                    <input
                      type="text"
                      value={colorHex}
                      onChange={(e) => setColorHex(e.target.value)}
                      className="flex-1 rounded-xl border border-border bg-surface px-2.5 py-2 text-xs font-mono font-bold text-text outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-text-muted block mb-1">
                    Posisi Rak Fisik Default:
                  </label>
                  <input
                    type="text"
                    value={shelfLocation}
                    onChange={(e) => setShelfLocation(e.target.value)}
                    placeholder="Contoh: Rak 800 (Fiksi Anak)"
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-text-muted block mb-1">
                    Ikon Visual:
                  </label>
                  <select
                    value={iconName}
                    onChange={(e) => setIconName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text outline-hidden"
                  >
                    {AVAILABLE_ICONS.map((ic) => (
                      <option key={ic.id} value={ic.id}>
                        {ic.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-text-muted block mb-1">
                  Deskripsi / Keterangan Koleksi:
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Keterangan jenis buku yang masuk kategori ini..."
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text outline-hidden"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingId ? 'Simpan Perubahan' : 'Tambahkan Kategori'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-text-muted flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
            <span>
              Format KOP Cetak Presisi: <strong>Punggung 7.4 x 4 cm</strong> & <strong>Slip Dalam 6 x 2.5 cm</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
            >
              Selesai & Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
