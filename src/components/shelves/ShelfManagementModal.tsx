'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  Check,
  Info,
  Layers,
  Save,
  HelpCircle,
} from 'lucide-react';
import { ShelfLocationItem } from '@/types';
import { DEFAULT_SHELVES } from '@/lib/constants';
import { libraryStore } from '@/lib/storage';
import { soundFx } from '@/lib/sound';

interface ShelfManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShelvesUpdated?: () => void;
}

export const ShelfManagementModal: React.FC<ShelfManagementModalProps> = ({
  isOpen,
  onClose,
  onShelvesUpdated,
}) => {
  const [shelves, setShelves] = useState<ShelfLocationItem[]>([]);
  const [editingShelfId, setEditingShelfId] = useState<string | null>(null);
  const [isRowFeatureEnabled, setIsRowFeatureEnabled] = useState<boolean>(true);

  // Form states for adding or editing
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [colorHex, setColorHex] = useState('#F59E0B');
  const [colorName, setColorName] = useState('Kuning');
  const [rowStructure, setRowStructure] = useState('Baris 1 s/d Baris 4');
  const [capacity, setCapacity] = useState<number>(50);
  const [description, setDescription] = useState('');

  // Guide texts
  const [guideWhySystem, setGuideWhySystem] = useState(
    'Di perpustakaan KB-TK SBTH, buku cerita anak sering dirotasi atau dipindah sesuai tema belajar mingguan. Dengan menyimpan posisi rak di sistem (bukan permanen di stiker fisik), pustakawan dan guru dapat mengubah lokasi rak kapan saja melalui tombol Edit Buku tanpa perlu repot mencetak ulang label stiker pada buku!'
  );
  const [guideFormat, setGuideFormat] = useState(
    'Gunakan format: Rak [Huruf] - Baris [Nomor]. Contoh: Rak A - Baris 2 atau Rak B - Baris 1.'
  );
  const [isEditingGuide, setIsEditingGuide] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShelves(libraryStore.getShelves());
      setIsRowFeatureEnabled(libraryStore.isShelfRowFeatureEnabled());
      setEditingShelfId(null);
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setCode('');
    setName('');
    setColorHex('#F59E0B');
    setColorName('Kuning');
    setRowStructure('Baris 1 s/d Baris 4');
    setCapacity(50);
    setDescription('');
    setEditingShelfId(null);
  };

  const handleStartEdit = (shelf: ShelfLocationItem) => {
    setEditingShelfId(shelf.id);
    setCode(shelf.code);
    setName(shelf.name);
    setColorHex(shelf.colorHex || '#F59E0B');
    setColorName(shelf.colorName || 'Kuning');
    setRowStructure(shelf.rowStructure);
    setCapacity(shelf.capacity || 50);
    setDescription(shelf.description || '');
    soundFx.playScanBeep();
  };

  const handleSaveShelf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      alert('Kode Rak dan Nama Kategori Rak wajib diisi.');
      return;
    }

    if (editingShelfId) {
      // Update
      libraryStore.updateShelf(editingShelfId, {
        code: code.trim(),
        name: name.trim(),
        colorHex,
        colorName,
        rowStructure: rowStructure.trim(),
        capacity: Number(capacity) || 50,
        description: description.trim(),
      });
      soundFx.playSuccessChime();
    } else {
      // Add new
      libraryStore.addShelf({
        code: code.trim(),
        name: name.trim(),
        colorHex,
        colorName,
        rowStructure: rowStructure.trim(),
        capacity: Number(capacity) || 50,
        description: description.trim(),
      });
      soundFx.playSuccessChime();
    }

    setShelves(libraryStore.getShelves());
    resetForm();
    if (onShelvesUpdated) onShelvesUpdated();
  };

  const handleDeleteShelf = (id: string, shelfName: string) => {
    if (confirm(`Yakin ingin menghapus ${shelfName}?`)) {
      const ok = libraryStore.deleteShelf(id);
      if (ok) {
        setShelves(libraryStore.getShelves());
        soundFx.playScanBeep();
        if (onShelvesUpdated) onShelvesUpdated();
      } else {
        alert('Minimal harus ada 1 rak di dalam perpustakaan.');
      }
    }
  };

  const handleResetToDefault = () => {
    if (confirm('Kembalikan semua template penamaan rak ke format standar bawaan KB-TK SBTH?')) {
      libraryStore.saveShelves(DEFAULT_SHELVES);
      setShelves(DEFAULT_SHELVES);
      resetForm();
      soundFx.playSuccessChime();
      if (onShelvesUpdated) onShelvesUpdated();
    }
  };

  const PRESET_COLORS = [
    { hex: '#F59E0B', label: '🟡 Kuning (Dongeng)' },
    { hex: '#10B981', label: '🟢 Hijau (Sains & Alam)' },
    { hex: '#3B82F6', label: '🔵 Biru (Aktivitas & Fonik)' },
    { hex: '#EF4444', label: '🔴 Merah (Karakter & Budi Pekerti)' },
    { hex: '#EC4899', label: '🌸 Pink (Mandarin & Bahasa)' },
    { hex: '#8B5CF6', label: '🟣 Ungu (Ensiklopedia & Guru)' },
  ];

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-4xl rounded-3xl bg-surface border border-border p-6 shadow-2xl space-y-5 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-xs">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display text-text">
                Kelola Penamaan & Template Struktur Rak SBTH
              </h3>
              <p className="text-xs text-text-muted">
                Kustomisasi kode rak, penamaan baris, warna stiker, dan panduan penataan buku
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-3 py-1.5 rounded-xl border border-border bg-surface-2 hover:bg-surface text-text-muted hover:text-amber-500 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Reset ke Template Standar"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset Standar</span>
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1 text-xs">
          {/* Editable Guide Explanation Banner */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 space-y-2 leading-relaxed">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-2">
                <Info className="h-4 w-4 shrink-0" />
                <span>Mengapa Posisi Rak Disimpan di Sistem (Bukan Dicetak pada Label)?</span>
              </span>
              <button
                type="button"
                onClick={() => setIsEditingGuide(!isEditingGuide)}
                className="text-[11px] font-semibold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="h-3 w-3" />
                <span>{isEditingGuide ? 'Tutup Edit Panduan' : 'Edit Teks Panduan'}</span>
              </button>
            </div>

            {isEditingGuide ? (
              <div className="space-y-2 pt-2 text-text">
                <textarea
                  rows={3}
                  value={guideWhySystem}
                  onChange={(e) => setGuideWhySystem(e.target.value)}
                  className="w-full rounded-xl border border-amber-500/30 bg-surface p-3 text-xs text-text outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setIsEditingGuide(false)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  Simpan Teks Panduan
                </button>
              </div>
            ) : (
              <p className="text-text">{guideWhySystem}</p>
            )}
          </div>

          {/* Toggle Switch Fitur Baris Rak (ON / OFF) */}
          <div className="p-3.5 rounded-2xl bg-surface-2 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl transition ${
                  isRowFeatureEnabled
                    ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                    : 'bg-surface-3 text-text-muted border border-border'
                }`}
              >
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-text text-xs flex items-center gap-2">
                  <span>Fitur Pembagian Baris Rak (Row/Sap)</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                      isRowFeatureEnabled
                        ? 'bg-amber-500 text-slate-950 shadow-2xs'
                        : 'bg-surface-3 text-text-muted border border-border'
                    }`}
                  >
                    {isRowFeatureEnabled ? 'AKTIF (ON)' : 'NONAKTIF (OFF)'}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted mt-0.5">
                  {isRowFeatureEnabled
                    ? 'Mode Baris Aktif: Formulir input rak & tabel koleksi buku menampilkan kolom Baris.'
                    : 'Mode Tanpa Baris: Fitur baris disembunyikan waktu input rak & kolom baris di koleksi buku hilang.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const next = !isRowFeatureEnabled;
                setIsRowFeatureEnabled(next);
                libraryStore.setShelfRowFeatureEnabled(next);
                soundFx.playScanBeep();
                if (onShelvesUpdated) onShelvesUpdated();
              }}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-xs shrink-0 ${
                isRowFeatureEnabled
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                  : 'bg-surface hover:bg-surface-3 text-text border border-border'
              }`}
              title="Klik untuk ON / OFF fitur pembagian baris rak"
            >
              <Layers className="h-4 w-4" />
              <span>{isRowFeatureEnabled ? 'Matikan Baris (OFF)' : 'Aktifkan Baris (ON)'}</span>
            </button>
          </div>

          {/* Form: Tambah / Edit Rak */}
          <form
            onSubmit={handleSaveShelf}
            className="p-4 rounded-2xl bg-surface-2 border border-border space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-text text-sm flex items-center gap-2">
                <Layers className="h-4 w-4 text-amber-500" />
                <span>{editingShelfId ? 'Edit Rak Buku' : 'Tambah Rak Buku Baru'}</span>
              </h4>
              {editingShelfId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-rose-500 hover:underline font-semibold"
                >
                  Batal Edit
                </button>
              )}
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 ${isRowFeatureEnabled ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-3`}>
              <div>
                <label className="text-[11px] font-semibold text-text-muted block mb-1">
                  Kode Rak <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Contoh: Rak A"
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text font-bold outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-text-muted block mb-1">
                  Kategori Buku <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Dongeng & Fabel"
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text outline-hidden focus:border-amber-500"
                />
              </div>

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
                  <select
                    value={colorHex}
                    onChange={(e) => {
                      setColorHex(e.target.value);
                      const found = PRESET_COLORS.find((p) => p.hex === e.target.value);
                      if (found) setColorName(found.label.split(' ')[1]);
                    }}
                    className="flex-1 rounded-xl border border-border bg-surface px-2 py-2 text-xs text-text outline-hidden"
                  >
                    {PRESET_COLORS.map((p) => (
                      <option key={p.hex} value={p.hex}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isRowFeatureEnabled && (
                <div>
                  <label className="text-[11px] font-semibold text-text-muted block mb-1">
                    Struktur Baris (Row):
                  </label>
                  <input
                    type="text"
                    required={isRowFeatureEnabled}
                    value={rowStructure}
                    onChange={(e) => setRowStructure(e.target.value)}
                    placeholder="Contoh: Baris 1 s/d Baris 4"
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text outline-hidden focus:border-amber-500"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex-1">
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi singkat rak / panduan buku apa yang diletakkan di rak ini..."
                  className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-text outline-hidden"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 shrink-0"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{editingShelfId ? 'Perbarui Rak' : 'Simpan Rak Baru'}</span>
              </button>
            </div>
          </form>

          {/* Table: Template Struktur Rak Resmi */}
          <div className="space-y-2">
            <h4 className="font-bold text-text text-sm">
              Daftar Rak Aktif di Perpustakaan ({shelves.length} Rak):
            </h4>
            <div className="rounded-2xl border border-border overflow-hidden bg-surface shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-2 text-text-muted border-b border-border font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Kode Rak</th>
                    <th className="py-2.5 px-3">Kategori Buku</th>
                    <th className="py-2.5 px-3">Warna Stiker</th>
                    {isRowFeatureEnabled && <th className="py-2.5 px-3">Struktur Baris (Row)</th>}
                    <th className="py-2.5 px-3">Keterangan</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {shelves.map((shelf) => (
                    <tr key={shelf.id} className="hover:bg-surface-2/60 transition">
                      <td className="py-2.5 px-3 font-bold text-text font-mono">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full shrink-0"
                            style={{ backgroundColor: shelf.colorHex }}
                          />
                          <span>{shelf.code}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-text">{shelf.name}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className="px-2 py-0.5 rounded-md font-semibold text-[11px]"
                          style={{
                            backgroundColor: `${shelf.colorHex}20`,
                            color: shelf.colorHex,
                          }}
                        >
                          {shelf.colorName || 'Pilihan'}
                        </span>
                      </td>
                      {isRowFeatureEnabled && (
                        <td className="py-2.5 px-3 text-text-muted">{shelf.rowStructure}</td>
                      )}
                      <td className="py-2.5 px-3 text-text-muted truncate max-w-[200px]">
                        {shelf.description || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(shelf)}
                            className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-500/10 transition"
                            title="Edit Rak Ini"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteShelf(shelf.id, shelf.code)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition"
                            title="Hapus Rak Ini"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Format Rekomendasi Input */}
          <div className="p-3.5 rounded-2xl bg-surface-2 border border-border flex items-start gap-2.5">
            <HelpCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-text">Format Rekomendasi Input di Database:</span>
              <p className="text-text-muted">{guideFormat}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border flex items-center justify-end gap-2 shrink-0">
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
  );
};
