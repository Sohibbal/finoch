"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Mail, Loader2, LogOut, CheckCircle2, Sparkles, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const router = useRouter();
  const { user, login, logout, isLoading, error: authError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError("Email dan password wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    const success = await login(email, password);
    setIsSubmitting(false);

    if (success) {
      router.push("/");
    }
  };

  // If user is already logged in
  if (user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-md w-full mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto font-black text-xl border border-emerald-200/60 dark:border-emerald-800">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {user.name}
          </h2>
          <p className="text-xs text-slate-500">{user.email}</p>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400">
            Akun Anda terhubung dan pengeluaran tersinkronkan otomatis.
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/"
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm shadow-emerald-600/20"
            >
              Kembali ke Dashboard
            </Link>
            <button
              type="button"
              onClick={async () => {
                await logout();
              }}
              className="w-full py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Keluar Akun
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-4xl w-full mx-auto space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>

        {/* 2-Column Responsive Card on Desktop */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: Branding & Value Props (5 cols on md+) */}
          <div className="md:col-span-5 bg-gradient-to-br from-indigo-900 via-slate-900 to-emerald-950 p-6 sm:p-8 text-white flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-sm">
                  VC
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight">VoiCash</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                    Akun Mahasiswa
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-bold">Sinkronkan Pengeluaran Anda</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Catat pengeluaran di HP atau laptop, semua otomatis sinkron tanpa kehilangan catatan lokal.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-200">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Otomatis migrasi transaksi tamu saat masuk</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>100% aman dengan enkripsi JWT httpOnly</span>
              </div>
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Analisis Primer vs Bocor Halus real-time</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              VoiCash • Progressive Web App Mahasiswa
            </p>
          </div>

          {/* Right Column: Login Form (7 cols on md+) */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                Masuk ke Akun
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Masukkan email dan password untuk melanjutkan
              </p>
            </div>

            {(localError || authError) && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {localError || authError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Alamat Email Mahasiswa
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@kampus.id"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition active:scale-98"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Masuk Sekarang"
                )}
              </button>
            </form>

            <p className="text-center text-xs text-slate-500">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                Daftar akun baru di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
