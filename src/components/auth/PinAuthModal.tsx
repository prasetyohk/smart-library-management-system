'use client';

import React, { useState, useEffect } from 'react';
import { Lock, X, KeyRound, AlertCircle, User, Loader2, ShieldCheck } from 'lucide-react';
import { libraryStore } from '@/lib/storage';
import { soundFx } from '@/lib/sound';
import { Librarian } from '@/types';

interface PinAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PinAuthModal: React.FC<PinAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [librarians, setLibrarians] = useState<Librarian[]>([]);
  const [authMode, setAuthMode] = useState<'PIN_QUICK' | 'USERNAME_PASS'>('USERNAME_PASS');
  const [selectedUsername, setSelectedUsername] = useState<string>('ms_kriss');
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const list = libraryStore.getLibrarians();
      setLibrarians(list);
      if (list.length > 0) {
        setSelectedUsername(list[0].username);
      }
      setPin('');
      setErrorMsg('');
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanPin = pin.trim();
    if (!cleanPin) {
      setErrorMsg('Silakan masukkan PIN atau Password.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Otentikasi Aman Sisi Server (Next.js Server API + Salted Hash di SQLite)
      const targetUsername = authMode === 'USERNAME_PASS' ? selectedUsername : (librarians[0]?.username || 'ms_kriss');
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: targetUsername,
          pin: cleanPin,
        }),
      });

      const data = await res.json();

      if (data.success && data.librarian) {
        // Simpan sesi terotentikasi (tanpa plaintext PIN di localStorage)
        libraryStore.setCurrentLibrarian(data.librarian);
        libraryStore.addActivityLog({
          category: 'AUTH',
          action: 'LOGIN_PUSTAKAWAN',
          actor: data.librarian.name,
          details: `Pustakawan ${data.librarian.name} (@${data.librarian.username}) berhasil masuk melalui otentikasi server aman.`,
        });

        soundFx.playSuccessChime();
        setPin('');
        setIsLoading(false);
        onSuccess();
        return;
      }

      // Jika gagal verifikasi di server
      soundFx.playErrorBeep();
      setErrorMsg(data.error || 'Password atau PIN salah. Silakan periksa kembali.');
      setPin('');
      setIsLoading(false);
    } catch {
      soundFx.playErrorBeep();
      setErrorMsg('Gagal menghubungi server otentikasi.');
      setIsLoading(false);
    }
  };

  const handleNumberClick = (num: string) => {
    if (pin.length < 16) {
      setPin((prev) => prev + num);
      soundFx.playScanBeep();
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30">
          <Lock className="h-7 w-7" />
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Akses Meja Pustakawan
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Dilindungi otentikasi server terenkripsi (Server-Side Salted Hash)
          </p>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('USERNAME_PASS');
              setErrorMsg('');
              setPin('');
            }}
            className={`py-2 rounded-xl transition cursor-pointer ${
              authMode === 'USERNAME_PASS'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Username & Password
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('PIN_QUICK');
              setErrorMsg('');
              setPin('');
            }}
            className={`py-2 rounded-xl transition cursor-pointer ${
              authMode === 'PIN_QUICK'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            PIN Layar Sentuh
          </button>
        </div>

        <form onSubmit={handleVerify} className="space-y-3 pt-1">
          {authMode === 'USERNAME_PASS' ? (
            <div className="space-y-2 text-left">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                  <User className="h-3.5 w-3.5" /> Pilih Akun Pustakawan:
                </label>
                <select
                  value={selectedUsername}
                  onChange={(e) => setSelectedUsername(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-hidden focus:border-blue-600"
                >
                  {librarians.map((lib) => (
                    <option key={lib.id} value={lib.username}>
                      {lib.name} (@{lib.username}) - {lib.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                  <KeyRound className="h-3.5 w-3.5" /> Password / PIN:
                </label>
                <input
                  type="password"
                  autoFocus
                  maxLength={32}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Masukkan Password atau PIN..."
                  className="w-full text-center tracking-[0.2em] text-base font-bold rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 outline-hidden focus:border-blue-600"
                />
              </div>
            </div>
          ) : (
            <div className="relative">
              <input
                type="password"
                autoFocus
                maxLength={24}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full text-center tracking-[0.3em] text-xl font-bold rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 outline-hidden focus:border-blue-600"
              />
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-rose-600 font-semibold animate-shake">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Numpad for Touchscreen */}
          {authMode === 'PIN_QUICK' && (
            <div className="grid grid-cols-3 gap-2 pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    if (k === 'C') setPin('');
                    else if (k === '⌫') handleBackspace();
                    else handleNumberClick(k);
                  }}
                  className="py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-sm text-slate-700 dark:text-slate-200 transition active:scale-95 cursor-pointer"
                >
                  {k}
                </button>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Memverifikasi Keamanan Server...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                Verifikasi & Buka Akses
              </>
            )}
          </button>
        </form>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 text-left">
          <p className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Keamanan Terproteksi:
          </p>
          <p>• Kredensial tidak tersimpan dalam bentuk teks di browser (bebas dari intipan F12).</p>
          <p>• Otentikasi divalidasi langsung oleh server lokal menggunakan enkripsi PBKDF2 + Salt.</p>
        </div>
      </div>
    </div>
  );
};
