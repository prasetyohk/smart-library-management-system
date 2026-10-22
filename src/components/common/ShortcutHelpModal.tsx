'use client';

import React from 'react';
import { Keyboard, X, Sparkles, Command, ArrowRight } from 'lucide-react';
import { KeyboardShortcutConfig } from '@/types';
import { soundFx } from '@/lib/sound';

interface ShortcutHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts?: KeyboardShortcutConfig;
  onOpenSettings?: () => void;
  onNavigate?: (tab: 'CIRCULATION' | 'BOOKS' | 'MEMBERS' | 'OPAC', subTab?: string) => void;
}

export const ShortcutHelpModal: React.FC<ShortcutHelpModalProps> = ({
  isOpen,
  onClose,
  shortcuts = {
    newLoan: 'Alt+1',
    returnBook: 'Alt+2',
    renewLoan: 'Alt+3',
    overdueTab: 'Alt+4',
    booksTab: 'Alt+5',
    membersTab: 'Alt+6',
    opacTab: 'Alt+7',
    settingsModal: 'Alt+8',
    helpModal: 'F1',
  },
  onOpenSettings,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const formatKey = (k: string) => {
    return k
      .replace('Control', 'Ctrl')
      .replace('+', ' + ')
      .toUpperCase();
  };

  const shortcutList = [
    {
      title: 'Peminjaman Baru',
      desc: 'Buka Meja Sirkulasi tab Peminjaman Baru',
      key: formatKey(shortcuts.newLoan || 'Alt+1'),
      category: 'Sirkulasi',
      color: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
      action: () => {
        onClose();
        if (onNavigate) onNavigate('CIRCULATION', 'BORROW');
      },
    },
    {
      title: 'Pengembalian Kilat',
      desc: 'Buka Meja Sirkulasi tab Pengembalian 4-Langkah (Klik untuk langsung buka)',
      key: formatKey(shortcuts.returnBook || 'Alt+2'),
      category: 'Sirkulasi',
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
      action: () => {
        onClose();
        if (onNavigate) onNavigate('CIRCULATION', 'RETURN');
      },
    },
    {
      title: 'Perpanjangan Pinjam',
      desc: 'Buka Meja Sirkulasi tab Perpanjangan Buku Siswa/Guru',
      key: formatKey(shortcuts.renewLoan || 'Alt+3'),
      category: 'Sirkulasi',
      color: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
      action: () => {
        onClose();
        if (onNavigate) onNavigate('CIRCULATION', 'RENEW');
      },
    },
    {
      title: 'Tagihan & Terlambat',
      desc: 'Buka daftar buku jatuh tempo & salin rekap WA',
      key: formatKey(shortcuts.overdueTab || 'Alt+4'),
      category: 'Sirkulasi',
      color: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
      action: () => {
        onClose();
        if (onNavigate) onNavigate('CIRCULATION', 'OVERDUE');
      },
    },
    {
      title: 'Koleksi Buku & Eksemplar',
      desc: 'Buka Meja Katalog Buku, Eksemplar & Barcode SLiMS',
      key: formatKey(shortcuts.booksTab || 'Alt+5'),
      category: 'Katalog',
      color: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
      action: () => {
        onClose();
        if (onNavigate) onNavigate('BOOKS');
      },
    },
    {
      title: 'Data Anggota Siswa',
      desc: 'Buka Manajemen Anggota, Akun Siswa & Kartu',
      key: formatKey(shortcuts.membersTab || 'Alt+6'),
      category: 'Anggota',
      color: 'bg-teal-500/10 text-teal-500 border-teal-500/30',
      action: () => {
        onClose();
        if (onNavigate) onNavigate('MEMBERS');
      },
    },
    {
      title: 'Katalog Visual Anak (OPAC)',
      desc: 'Buka rak buku visual sentuh anak & siswa',
      key: formatKey(shortcuts.opacTab || 'Alt+7'),
      category: 'Navigasi',
      color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
      action: () => {
        onClose();
        if (onNavigate) onNavigate('OPAC');
      },
    },
    {
      title: 'Pengaturan Sistem',
      desc: 'Buka konfigurasi SLiMS, aturan pinjam, & akun pustakawan',
      key: formatKey(shortcuts.settingsModal || 'Alt+8'),
      category: 'Admin',
      color: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
      action: () => {
        onClose();
        if (onOpenSettings) onOpenSettings();
      },
    },
    {
      title: 'Panduan Shortcut (Menu Ini)',
      desc: 'Tampilkan jendela daftar tombol pintas keyboard',
      key: 'F1',
      category: 'Bantuan',
      color: 'bg-sky-500/10 text-sky-500 border-sky-500/30',
      action: () => {},
    },
  ];

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-surface border border-border shadow-2xl p-6 space-y-5 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-xs">
              <Keyboard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-text flex items-center gap-2">
                <span>Panduan Tombol Pintas Keyboard (Shortcuts)</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-bold text-[10px]">
                  Klik untuk Langsung Buka Menu
                </span>
              </h3>
              <p className="text-xs text-text-muted">
                Tekan tombol shortcut atau klik kartu pintasan di bawah untuk berpindah menu dengan cepat.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-text-muted hover:bg-surface-2 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="space-y-2 overflow-y-auto pr-1 flex-1">
          {shortcutList.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                soundFx.playScanBeep();
                item.action();
              }}
              className="p-3.5 rounded-2xl border border-border bg-surface-2/60 hover:bg-surface-2 hover:border-amber-500/40 transition flex items-center justify-between gap-4 cursor-pointer group shadow-2xs"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-xs text-text group-hover:text-amber-500 transition flex items-center gap-1.5">
                    <span>{item.title}</span>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition text-amber-500" />
                  </h4>
                  <span className={`px-2 py-0.5 rounded-md border text-[9px] font-bold ${item.color}`}>
                    {item.category}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted mt-0.5 truncate">{item.desc}</p>
              </div>

              <kbd className="px-3 py-1.5 rounded-xl border border-border bg-surface text-text font-mono font-bold text-xs shadow-xs shrink-0 flex items-center gap-1 group-hover:border-amber-500/40">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border flex items-center justify-between text-xs shrink-0">
          <p className="text-[11px] text-text-muted">
            💡 <em>Pintasan menggunakan <strong>ALT + Angka (1-8)</strong> & <strong>F1</strong> agar bebas bentrok dengan Google Chrome (tidak menutup tab). Kustomisasi di Pengaturan Sistem ➔ Tab Shortcut.</em>
          </p>
          <div className="flex gap-2">
            {onOpenSettings && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-bold text-xs transition cursor-pointer"
              >
                Kustomisasi Shortcut
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
