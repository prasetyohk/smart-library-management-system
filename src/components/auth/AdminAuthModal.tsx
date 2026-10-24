'use client';

import React, { useState } from 'react';
import { ShieldCheck, X, KeyRound, AlertCircle, Loader2 } from 'lucide-react';
import { libraryStore } from '@/lib/storage';
import { soundFx } from '@/lib/sound';
import { AdminPasswordRecoveryModal } from './AdminPasswordRecoveryModal';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [username, setUsername] = useState<string>('ms_kriss');
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMsg('Username dan Password wajib diisi.');
      return;
    }

    setIsLoading(true);

    try {
      // Otentikasi aman ke Server Next.js
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUser,
          pin: cleanPass,
        }),
      });

      const data = await res.json();

      if (data.success && data.librarian) {
        if (data.librarian.role !== 'ADMIN') {
          soundFx.playErrorBeep();
          setErrorMsg('Akses ditolak. Akun Anda bukan berstatus Administrator.');
          setPassword('');
          setIsLoading(false);
          return;
        }

        libraryStore.setCurrentLibrarian(data.librarian);
        soundFx.playSuccessChime();
        setPassword('');
        setIsLoading(false);
        onSuccess();
        return;
      }

      soundFx.playErrorBeep();
      setErrorMsg(data.error || 'Akses ditolak. Username atau Password Administrator belum sesuai.');
      setPassword('');
      setIsLoading(false);
    } catch {
      soundFx.playErrorBeep();
      setErrorMsg('Gagal terhubung ke server otentikasi lokal.');
      setPassword('');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-surface border-2 border-amber-500/40 shadow-2xl p-6 space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-text-muted hover:bg-surface-2 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-text">
              Verifikasi Administrator Perpustakaan
            </h3>
            <p className="text-xs text-text-muted">
              Pengaturan Sistem berisi konfigurasi kritis (Aturan Pinjam, Format SLiMS, Reset Database).
            </p>
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-3 pt-2">
          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-text">
              Username Administrator:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@ms_kriss"
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-medium text-text placeholder-text-muted outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-text">
              Password / PIN Admin:
            </label>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password admin..."
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-medium text-text placeholder-text-muted outline-hidden focus:ring-1 focus:ring-amber-500 font-mono tracking-wider"
            />
          </div>

          {errorMsg && (
            <div className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border bg-surface-2 hover:bg-surface text-text text-xs font-semibold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 text-xs font-bold shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  Buka Pengaturan
                </>
              )}
            </button>
          </div>

          {/* Link Lupa Password Administrator */}
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => setIsRecoveryOpen(true)}
              className="text-[11px] font-semibold text-amber-500 hover:text-amber-400 hover:underline inline-flex items-center gap-1 cursor-pointer transition"
            >
              <KeyRound className="h-3 w-3" />
              Lupa Password Admin? Reset via WhatsApp atau Email
            </button>
          </div>
        </form>

        <div className="p-3 rounded-xl bg-surface-2 border border-border text-[11px] text-text-muted space-y-1 text-left">
          <p className="font-semibold text-text">🛡️ Keamanan Tingkat Server:</p>
          <p>
            Otentikasi divalidasi langsung oleh backend server lokal menggunakan enkripsi cryptographic salted hash. Kredensial tidak pernah terekspos di browser F12.
          </p>
        </div>

        {/* Modal Pemulihan Akses Admin */}
        <AdminPasswordRecoveryModal
          isOpen={isRecoveryOpen}
          onClose={() => setIsRecoveryOpen(false)}
          defaultUsername={username}
          onSuccess={(recoveredUser) => {
            if (recoveredUser) setUsername(recoveredUser);
            setIsRecoveryOpen(false);
          }}
        />
      </div>
    </div>
  );
};
