"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Lock,
  Mail,
  Loader2,
  LogOut,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/layout/theme-toggle";

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
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          if (data?.profile) {
            router.push("/dashboard");
            return;
          }
        }
      } catch {
        // Fallback to onboarding if profile check fails
      }
      router.push("/onboarding");
    }
  };

  // If user is already logged in
  if (user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#080c16] text-slate-900 dark:text-slate-100 flex flex-col justify-center px-4 sm:px-6 py-10 transition-colors">
        <div className="max-w-md w-full mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800/80 shadow-lg space-y-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center mx-auto font-black text-xl border border-blue-200 dark:border-blue-900">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {user.name}
          </h2>
          <p className="text-xs text-slate-500">{user.email}</p>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            Akun Anda terhubung dan pengeluaran tersinkronkan otomatis.
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/dashboard"
              className="w-full py-3 rounded-xl bg-[#0f274a] hover:bg-[#183664] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm"
            >
              Buka Dashboard
            </Link>
            <button
              type="button"
              onClick={async () => {
                await logout();
              }}
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-900/60 flex items-center justify-center gap-1.5 transition"
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#080c16] text-slate-900 dark:text-slate-100 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-10 transition-colors">
      <div className="max-w-4xl w-full mx-auto space-y-4">
        {/* Top Bar with Back and Theme Toggle */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
          <ThemeToggle />
        </div>

        {/* 2-Column Responsive Card on Desktop */}
        <div className="rounded-3xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800/80 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 transition-colors">
          {/* Left Column: Branding & Value Props */}
          <div className="md:col-span-5 bg-[#0a1124] p-6 sm:p-8 text-white flex flex-col justify-between space-y-6 border-b md:border-b-0 md:border-r border-slate-800">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight">FINRA</h3>
                  <span className="text-[10px] text-blue-300 font-medium">
                    Smart Financial Assistant
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold">Sinkronkan Pengeluaran Anda</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Catat pengeluaran di ponsel atau laptop, semua otomatis sinkron tanpa kehilangan catatan lokal.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Otomatis migrasi transaksi tamu saat masuk</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>100% aman dengan enkripsi JWT httpOnly</span>
              </div>
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Analisis kategori pengeluaran cerdas berbasis LLM</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              FINRA • Asisten Keuangan Personal Anda
            </p>
          </div>

          {/* Right Column: Login Form */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Masuk ke Akun
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Masukkan email dan password untuk melanjutkan ke dashboard
              </p>
            </div>

            {(localError || authError) && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                {localError || authError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Alamat Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full py-3 rounded-xl bg-[#0f274a] hover:bg-[#183664] dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition"
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
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
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
