'use client';

import React, { useState } from 'react';
import {
  X,
  KeyRound,
  ShieldAlert,
  Send,
  MessageSquare,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Eye,
  EyeOff,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { soundFx } from '@/lib/sound';

interface AdminPasswordRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newUsername?: string) => void;
  defaultUsername?: string;
}

export const AdminPasswordRecoveryModal: React.FC<AdminPasswordRecoveryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultUsername = 'ms_kriss',
}) => {
  const [step, setStep] = useState<'REQUEST' | 'VERIFY' | 'SUCCESS'>('REQUEST');
  const [username, setUsername] = useState<string>(defaultUsername);
  const [method, setMethod] = useState<'WHATSAPP' | 'EMAIL'>('WHATSAPP');
  const [otpCode, setOtpCode] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successInfo, setSuccessInfo] = useState<{
    targetMasked: string;
    waUrl?: string;
    mailtoUrl?: string;
    otpCode?: string;
    librarianName?: string;
  } | null>(null);

  if (!isOpen) return null;

  // 1. Minta Kode OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = username.trim().toLowerCase().replace(/^@/, '');
    if (!cleanUser) {
      setErrorMsg('Silakan masukkan username akun.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REQUEST_OTP',
          username: cleanUser,
          method,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setSuccessInfo(data.data);
        setStep('VERIFY');
        soundFx.playSuccessChime();
        setErrorMsg('');
      } else {
        soundFx.playErrorBeep();
        setErrorMsg(data.error || 'Gagal membuat kode OTP pemulihan.');
      }
    } catch {
      soundFx.playErrorBeep();
      setErrorMsg('Gagal terhubung ke server pemulihan.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Verifikasi OTP & Simpan Password Baru
  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = username.trim().toLowerCase().replace(/^@/, '');
    const cleanOtp = otpCode.trim();
    const cleanPass = newPin.trim();

    if (!cleanOtp) {
      setErrorMsg('Silakan masukkan kode OTP 6-digit.');
      return;
    }
    if (cleanPass.length < 4) {
      setErrorMsg('Password baru minimal 4 karakter.');
      return;
    }
    if (cleanPass !== confirmPin.trim()) {
      setErrorMsg('Konfirmasi password tidak cocok.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'VERIFY_AND_RESET',
          username: cleanUser,
          otpCode: cleanOtp,
          newPin: cleanPass,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStep('SUCCESS');
        soundFx.playSuccessChime();
      } else {
        soundFx.playErrorBeep();
        setErrorMsg(data.error || 'Kode OTP salah atau sudah kedaluwarsa.');
      }
    } catch {
      soundFx.playErrorBeep();
      setErrorMsg('Terjadi kesalahan saat memproses reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    onSuccess(username);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-2xl p-6 space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 shrink-0">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Pemulihan Password Pustakawan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Reset akses aman melalui verifikasi WhatsApp atau Email resmi
            </p>
          </div>
        </div>

        {/* STEP 1: PILIH AKUN & METODE */}
        {step === 'REQUEST' && (
          <form onSubmit={handleRequestOtp} className="space-y-4 pt-1">
            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Username Pustakawan / Admin:
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="misal: ms_kriss"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 outline-hidden focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Pilih Saluran Pengiriman Kode OTP:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('WHATSAPP')}
                  className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition cursor-pointer ${
                    method === 'WHATSAPP'
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    WhatsApp
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Kirim kode OTP via chat WhatsApp resmi
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('EMAIL')}
                  className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition cursor-pointer ${
                    method === 'EMAIL'
                      ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Email
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Kirim kode OTP via Email terdaftar
                  </span>
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Membuat Kode OTP...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Kirim Kode Verifikasi OTP
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: VERIFIKASI OTP & INPUT PASSWORD BARU */}
        {step === 'VERIFY' && (
          <form onSubmit={handleVerifyAndReset} className="space-y-3.5 pt-1">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-left space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                  Kode OTP dikirimkan ke:
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
                  {successInfo?.targetMasked}
                </span>
              </div>

              {/* Action Button to Open WA or Email directly */}
              {method === 'WHATSAPP' && successInfo?.waUrl && (
                <a
                  href={successInfo.waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
                >
                  <MessageSquare className="h-4 w-4" />
                  Buka WhatsApp (Kirim & Terima Kode)
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}

              {method === 'EMAIL' && successInfo?.mailtoUrl && (
                <a
                  href={successInfo.mailtoUrl}
                  className="mt-1 w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
                >
                  <Mail className="h-4 w-4" />
                  Buka Aplikasi Email
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            {/* OTP Input */}
            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Kode Verifikasi OTP (6 Digit):
              </label>
              <input
                type="text"
                autoFocus
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="Contoh: 749215"
                className="w-full text-center tracking-[0.3em] font-mono text-xl font-bold rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 outline-hidden focus:border-emerald-500 text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* New Password */}
            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password / PIN Baru:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Minimal 4 karakter..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 outline-hidden focus:border-emerald-500 pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Konfirmasi Password Baru:
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Ulangi password baru..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 outline-hidden focus:border-emerald-500"
              />
            </div>

            {errorMsg && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setStep('REQUEST')}
                className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Simpan Password Baru
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SUKSES */}
        {step === 'SUCCESS' && (
          <div className="py-4 space-y-4 text-center animate-in zoom-in-95">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Password Berhasil Diperbarui!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Kredensial baru untuk akun <strong>@{username}</strong> telah diamankan dengan enkripsi server. Silakan masuk kembali.
              </p>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition cursor-pointer"
            >
              Kembali ke Halaman Masuk
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
