"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Wallet,
  PiggyBank,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Save,
} from "lucide-react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useAuth } from "@/hooks/use-auth";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    monthlyIncome: 3500000,
    incomeType: "salary",
    currentSavings: 1500000,
    monthlyFixedExpenses: 1200000,
    financialPriority: "emergency_fund",
  });

  const incomeTypeOptions = [
    { id: "salary", label: "Gaji Tetap", desc: "Penghasilan rutin per bulan" },
    { id: "freelance", label: "Freelance", desc: "Penghasilan berbasis proyek" },
    { id: "business", label: "Usaha / Dagang", desc: "Laba operasional bisnis" },
    { id: "allowance", label: "Uang Saku", desc: "Dari orang tua / beasiswa" },
    { id: "other", label: "Lainnya", desc: "Sumber pendapatan lainnya" },
  ];

  const priorityOptions = [
    { id: "emergency_fund", label: "Dana Darurat", desc: "Amankan 3 - 6 bulan biaya hidup" },
    { id: "buy_item", label: "Beli Barang Impian", desc: "Laptop, gadget, atau kendaraan" },
    { id: "saving", label: "Menabung Rutin", desc: "Membangun kebiasaan tabungan" },
    { id: "debt_repayment", label: "Bebas Utang", desc: "Lunasi cicilan lebih cepat" },
    { id: "travel", label: "Traveling / Liburan", desc: "Rencana perjalanan masa depan" },
  ];

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (res.ok) {
          const data = await res.json();
          if (data?.profile) {
            setFormData({
              monthlyIncome: data.profile.monthlyIncome || 0,
              incomeType: data.profile.incomeType || "salary",
              currentSavings: data.profile.currentSavings || 0,
              monthlyFixedExpenses: data.profile.monthlyFixedExpenses || 0,
              financialPriority: data.profile.financialPriority || "saving",
            });
          }
        }
      } catch (err) {
        console.warn("Gagal memuat profil finansial:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal memperbarui profil.");
      }

      setFeedback({
        type: "success",
        message: "Profil finansial Anda berhasil disimpan dan diperbarui.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080c16] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors">
      {/* Desktop Left Sidebar */}
      <DashboardSidebar className="hidden md:flex min-h-screen sticky top-0" />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-12">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0c1322]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 py-3.5 transition-colors">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="md:hidden flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#0f274a] dark:bg-blue-600 flex items-center justify-center text-white font-bold">
                  <Sparkles className="w-4 h-4 text-blue-300 dark:text-white" />
                </div>
                <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                  FINRA
                </span>
              </div>
              <div className="hidden md:block">
                <h1 className="text-sm font-bold text-slate-900 dark:text-white">
                  Profil & Pengaturan Finansial
                </h1>
                <p className="text-[11px] text-slate-500">
                  Ubah data penghasilan, komitmen wajib, dan target yang diinputkan saat onboarding
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Identity Box */}
          {user && (
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-4 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {user.name}
                </h2>
                <p className="text-xs text-slate-500">{user.email}</p>
                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold">
                  Akun Terverifikasi
                </span>
              </div>
            </div>
          )}

          {/* Feedback Alert */}
          {feedback && (
            <div
              className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                feedback.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {isLoading ? (
            <div className="p-12 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
              <p className="text-xs mt-2 font-medium">Memuat profil finansial Anda...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Penghasilan */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800/80 space-y-4 transition-colors">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800/60">
                  <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Pemasukan Bulanan
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Nominal Penghasilan Rutin per Bulan (IDR)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-slate-400">
                        Rp
                      </span>
                      <input
                        type="number"
                        value={formData.monthlyIncome || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            monthlyIncome: Number(e.target.value),
                          })
                        }
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Sumber Pemasukan Utama
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {incomeTypeOptions.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, incomeType: opt.id })
                          }
                          className={`p-3 text-left rounded-xl border text-xs transition-colors ${
                            formData.incomeType === opt.id
                              ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-semibold"
                              : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                          }`}
                        >
                          <div className="font-bold">{opt.label}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {opt.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Tabungan & Pengeluaran Wajib */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800/80 space-y-4 transition-colors">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800/60">
                  <PiggyBank className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Tabungan & Komitmen Wajib
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Total Cadangan Tabungan Saat Ini (IDR)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-slate-400">
                        Rp
                      </span>
                      <input
                        type="number"
                        value={formData.currentSavings || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            currentSavings: Number(e.target.value),
                          })
                        }
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Saldo rekening atau dompet digital cadangan
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Pengeluaran Tetap per Bulan (IDR)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-slate-400">
                        Rp
                      </span>
                      <input
                        type="number"
                        value={formData.monthlyFixedExpenses || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            monthlyFixedExpenses: Number(e.target.value),
                          })
                        }
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Sewa kos, listrik, pulsa data, dan kebutuhan pokok
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 3: Prioritas Finansial */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800/80 space-y-4 transition-colors">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800/60">
                  <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Prioritas Finansial Utama
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {priorityOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, financialPriority: opt.id })
                      }
                      className={`p-3 text-left rounded-xl border text-xs transition-colors ${
                        formData.financialPriority === opt.id
                          ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-semibold"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                      }`}
                    >
                      <div className="font-bold">{opt.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {opt.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 rounded-xl bg-[#0f274a] hover:bg-[#183664] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Simpan Perubahan Profil</span>
                </button>
              </div>
            </form>
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav onOpenVoice={() => router.push("/dashboard")} />
      </div>
    </div>
  );
}
