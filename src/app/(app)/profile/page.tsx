"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Save,
  Moon,
  Trash2,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Shield,
  Smartphone,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { useAuthContext } from "@/components/layout/auth-provider";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const PROFILE_CARD_CLASS =
  "relative overflow-hidden rounded-3xl p-5 sm:p-6 backdrop-blur-xl bg-white/80 dark:bg-[#111C2E]/80 border border-slate-200/80 dark:border-slate-800 shadow-sm before:absolute before:inset-0 before:bg-gradient-to-tr before:from-transparent before:via-white/[0.08] dark:before:via-white/[0.03] before:to-transparent before:pointer-events-none after:absolute after:top-0 after:left-7 after:w-10 after:h-1 after:rounded-b-md after:bg-slate-300/80 dark:after:bg-slate-700/80 after:shadow-sm";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthContext();
  const [nickname, setNickname] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("finoch_user_nickname");
      if (stored) {
        setNickname(stored);
      } else if (user?.email) {
        setNickname(user.email.split("@")[0]);
      }
    }
  }, [user]);

  const handleSaveNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    setIsSaving(true);
    setFeedback(null);

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("finoch_user_nickname", nickname.trim());
      }

      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nickname.trim() }),
      }).catch(() => {});

      setFeedback({ type: "success", message: "Nama panggilan berhasil disimpan!" });
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback({ type: "error", message: "Gagal menyimpan nickname ke server." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout().catch(() => {});
    router.replace("/login");
  };

  const handleResetLocalData = async () => {
    if (
      confirm(
        "Peringatan: Ini akan menghapus semua data transaksi lokal, wishlist, nickname, dan cache browser. Lanjutkan?"
      )
    ) {
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
        indexedDB.deleteDatabase("finoch_db");
        indexedDB.deleteDatabase("voicash_db");
      }
      await logout().catch(() => {});
      window.location.href = "/onboarding";
    }
  };

  return (
    <>
      <PageHeader
        title="Profil"
        subtitle="Kelola nama panggilan lo, akun, dan tampilan aplikasi"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-5">
        {feedback && (
          <div
            className={`p-3.5 rounded-2xl flex items-center gap-2.5 border ${
              feedback.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                : "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            )}
            <p className="text-xs sm:text-sm font-medium">{feedback.message}</p>
          </div>
        )}

        {/* 2-Column Compact Professional Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Column 1: Identity & Account */}
          <div className="space-y-5">
            {/* Personal Nickname Setting */}
            <section className={`${PROFILE_CARD_CLASS} space-y-4`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Nama Panggilan (Nickname)</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sapaan FinBot dan Dashboard
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveNickname} className="space-y-3.5 pt-1">
                <div>
                  <label htmlFor="nickname" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Panggilan Akrab
                  </label>
                  <input
                    id="nickname"
                    type="text"
                    required
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Contoh: Alex, Budi, Salsa"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSaving || !nickname.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold text-xs hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? "Menyimpan..." : "Simpan Panggilan"}</span>
                </button>
              </form>
            </section>

            {/* Account Details */}
            <section className={`${PROFILE_CARD_CLASS} space-y-3`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Informasi Akun</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Status login & arsitektur data</p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Email Akun</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{user?.email || "Tamu / Offline"}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Arsitektur</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Local-First PWA</span>
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Column 2: Display & Actions */}
          <div className="space-y-5">
            {/* Display Settings */}
            <section className={`${PROFILE_CARD_CLASS} space-y-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tema Tampilan</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Pilih tema terang atau gelap</p>
                  </div>
                </div>

                <ThemeToggle />
              </div>
            </section>

            {/* Reset Data & Logout Actions */}
            <section className={`${PROFILE_CARD_CLASS} space-y-3`}>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Aksi & Data Lokal</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Kelola sesi dan penyimpanan lokal</p>
              </div>

              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleResetLocalData}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-semibold text-xs transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset Semua Data Browser (Mulai dari Nol)</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-semibold text-xs transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar dari Akun</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
