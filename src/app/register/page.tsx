"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Mail, User, Loader2, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error: authError } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!name.trim() || !email.trim() || !password) {
      setLocalError("Semua kolom pendaftaran wajib diisi.");
      return;
    }

    if (password.length < 6) {
      setLocalError("Password minimal terdiri dari 6 karakter.");
      return;
    }

    setIsSubmitting(true);
    const success = await register(email, password, name);
    setIsSubmitting(false);

    if (success) {
      router.push("/");
    }
  };

  return (
    <div className="min-h-[100dvh] ambient-glow-bg flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-10 text-slate-100">
      <div className="max-w-4xl w-full mx-auto space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-blue-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        {/* 2-Column Responsive Card on Desktop */}
        <div className="rounded-3xl bg-[#0e1526]/90 border border-blue-500/20 shadow-2xl shadow-blue-950/50 backdrop-blur-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: Benefits & Value Props */}
          <div className="md:col-span-5 bg-gradient-to-br from-[#0a1124] via-[#0e172e] to-[#080d1a] p-6 sm:p-8 text-white flex flex-col justify-between space-y-6 border-b md:border-b-0 md:border-r border-white/[0.08]">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/30">
                  VC
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight">VoiCash</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-400/30">
                    Akun Mahasiswa
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-bold">Mulai Hemat Uang Saku</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Gabung dengan mahasiswa lainnya yang mencatat pengeluaran lebih cepat cukup dengan bicara.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Otomatis simpan riwayat pengeluaran ke cloud</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Audio tetap 100% lokal di perangkat Anda</span>
              </div>
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Rasio Primer vs Bocor Halus otomatis terhitung</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              VoiCash • Progressive Web App Mahasiswa
            </p>
          </div>

          {/* Right Column: Register Form */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Buat Akun Baru
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Catatan sesi tamu Anda akan langsung tersinkronkan
              </p>
            </div>

            {(localError || authError) && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                {localError || authError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nama Lengkap Mahasiswa
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Budi Santoso"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.05] text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Alamat Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="budi@kampus.id"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.05] text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password (minimal 6 karakter)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.05] text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition active:scale-98"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Daftar Akun Sekarang"
                )}
              </button>
            </form>

            <p className="text-center text-xs text-slate-400">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="text-blue-400 font-bold hover:underline"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
