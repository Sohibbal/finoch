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
  Gift,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { useAuthContext } from "@/components/layout/auth-provider";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import {
  getWishlistSavingsPercentage,
  setWishlistSavingsPercentage,
  WISHLIST_SETTINGS_CHANGED_EVENT,
} from "@/lib/storage/wishlist-settings";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthContext();
  const [nickname, setNickname] = useState("");
  const [savingsPercentage, setSavingsPercentage] = useState<number>(() => getWishlistSavingsPercentage());
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

  useEffect(() => {
    const handleSettingsChanged = (e: Event) => {
      const customEvent = e as CustomEvent<{ percentage: number }>;
      if (customEvent.detail?.percentage) {
        setSavingsPercentage(customEvent.detail.percentage);
      } else {
        setSavingsPercentage(getWishlistSavingsPercentage());
      }
    };

    window.addEventListener(WISHLIST_SETTINGS_CHANGED_EVENT, handleSettingsChanged);
    return () => {
      window.removeEventListener(WISHLIST_SETTINGS_CHANGED_EVENT, handleSettingsChanged);
    };
  }, []);

  const handleSavingsPercentageChange = (pct: number) => {
    setSavingsPercentage(pct);
    setWishlistSavingsPercentage(pct);
  };

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

      <div className="w-full max-w-[1440px] mx-auto p-3 sm:p-5 lg:p-6">
        <div className="rounded-[2.25rem] bg-[#eaf0fd] dark:bg-[#0B101D] border border-blue-200/60 dark:border-slate-800/80 shadow-2xl p-4 sm:p-6 lg:p-7 space-y-6 animate-content-in">
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

          {/* 2-Column Responsive Card Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column 1: Personal Identity & Wishlist Allocation */}
            <div className="space-y-6">
              {/* Card 1: Nickname Setting with Glass Sheen */}
              <section className="rounded-[2rem] p-5 sm:p-6 backdrop-blur-xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-xs glass-sheen relative overflow-hidden group space-y-4">
                {/* Transparent Watermark Icon */}
                <User
                  className="absolute -right-3 -bottom-3 w-28 h-28 text-blue-500/10 dark:text-blue-400/10 pointer-events-none select-none transition-transform group-hover:scale-105"
                  strokeWidth={1.5}
                />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Nama Panggilan (Nickname)
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Sapaan FinBot dan Dashboard
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveNickname} className="space-y-3.5 pt-1">
                    <div>
                      <label
                        htmlFor="nickname"
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Panggilan Akrab
                      </label>
                      <input
                        id="nickname"
                        type="text"
                        required
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Contoh: Alex, Budi, Salsa"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSaving || !nickname.trim()}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold text-xs hover:opacity-90 disabled:opacity-50 transition-all shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSaving ? "Menyimpan..." : "Simpan Panggilan"}</span>
                    </button>
                  </form>
                </div>
              </section>

              {/* Card 2: Wishlist Savings Allocation (Moved from Wishlist) with Glass Sheen */}
              <section className="rounded-[2rem] p-5 sm:p-6 backdrop-blur-xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-xs glass-sheen relative overflow-hidden group space-y-4">
                {/* Transparent Watermark Icon */}
                <Gift
                  className="absolute -right-3 -bottom-3 w-28 h-28 text-purple-500/10 dark:text-purple-400/10 pointer-events-none select-none transition-transform group-hover:scale-105"
                  strokeWidth={1.5}
                />
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        <Gift className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          Alokasi Tabungan Wishlist
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Komitmen tabungan dari jatah harian
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-full">
                      {savingsPercentage}% dari Jatah
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Setiap hari, persentase ini akan dialokasikan otomatis dari jatah harian lo untuk mempercepat pencapaian barang impian di Wishlist.
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <span>Pilihan Cepat Persentase:</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{savingsPercentage}%</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[10, 20, 30, 50].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => handleSavingsPercentageChange(pct)}
                          className={`py-2 text-xs font-bold rounded-xl transition-all ${
                            savingsPercentage === pct
                              ? "bg-blue-600 text-white shadow-xs"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>

                    <div className="pt-1">
                      <input
                        type="range"
                        min={5}
                        max={80}
                        step={5}
                        value={savingsPercentage}
                        onChange={(e) => handleSavingsPercentageChange(Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                        <span>5% (Santai)</span>
                        <span>80% (Gasspol)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Column 2: Display Preferences & Account Management */}
            <div className="space-y-6">
              {/* Card 3: Display Settings with Glass Sheen */}
              <section className="rounded-[2rem] p-5 sm:p-6 backdrop-blur-xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-xs glass-sheen relative overflow-hidden group space-y-4">
                {/* Transparent Watermark Icon */}
                <Moon
                  className="absolute -right-3 -bottom-3 w-28 h-28 text-indigo-500/10 dark:text-indigo-400/10 pointer-events-none select-none transition-transform group-hover:scale-105"
                  strokeWidth={1.5}
                />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <Moon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tema Tampilan</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Pilih tema terang atau gelap</p>
                      </div>
                    </div>

                    <ThemeToggle />
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-500 dark:text-slate-400">Arsitektur Aplikasi</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Local-First PWA</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Data tersimpan otomatis di perangkat lo dan tersinkron saat terhubung ke internet.
                    </p>
                  </div>
                </div>
              </section>

              {/* Card 4: Account Details & Actions with Glass Sheen */}
              <section className="rounded-[2rem] p-5 sm:p-6 backdrop-blur-xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 shadow-xs glass-sheen relative overflow-hidden group space-y-4">
                {/* Transparent Watermark Icon */}
                <Shield
                  className="absolute -right-3 -bottom-3 w-28 h-28 text-rose-500/10 dark:text-rose-400/10 pointer-events-none select-none transition-transform group-hover:scale-105"
                  strokeWidth={1.5}
                />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Informasi Akun</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Status login & arsitektur data
                      </p>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Email Akun</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {user?.email || "Tamu / Offline"}
                      </span>
                    </div>
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
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
