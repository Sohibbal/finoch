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
  Save,
} from "lucide-react";
import Link from "next/link";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BrandLogo } from "@/components/brand/brand-logo";
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
    <div className="min-h-screen bg-cream-50 dark:bg-navy-950 text-navy-900 dark:text-cream-100 flex flex-col md:flex-row transition-colors">
      {/* Desktop Left Sidebar */}
      <DashboardSidebar className="hidden md:flex" />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-12">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-cream-50/90 dark:bg-navy-950/90 backdrop-blur-md border-b border-cream-300 dark:border-navy-800 px-4 sm:px-6 py-3.5 transition-colors">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="md:hidden flex items-center">
                <Link href="/dashboard" aria-label="Finoch Beranda">
                  <BrandLogo variant="full" className="h-5 sm:h-6 w-auto" />
                </Link>
              </div>
              <div className="hidden md:block">
                <Breadcrumbs className="mb-1" />
                <h1 className="text-sm font-bold text-navy-950 dark:text-cream-50">
                  Profil & Pengaturan Finansial
                </h1>
                <p className="text-[11px] text-navy-600 dark:text-cream-300/70">
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
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 flex items-center gap-4 transition-colors shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-cream-200 dark:bg-navy-900 text-navy-950 dark:text-cream-100 flex items-center justify-center font-black text-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-sm font-bold text-navy-950 dark:text-cream-50">
                  {user.name}
                </h2>
                <p className="text-xs text-navy-600 dark:text-cream-300/70">{user.email}</p>
                <span className="inline-block mt-1 text-[10px] px-2.5 py-0.5 rounded-full bg-cream-100 dark:bg-navy-900 text-navy-800 dark:text-cream-200 font-semibold border border-cream-200 dark:border-navy-800">
                  Akun Aktif
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
            <div className="p-12 text-center text-navy-400 dark:text-cream-400/60">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-navy-800 dark:text-cream-200" />
              <p className="text-xs mt-2 font-medium">Memuat profil finansial Anda...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Penghasilan */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 space-y-4 transition-colors shadow-sm">
                <div className="flex items-center gap-2.5 pb-2 border-b border-cream-200 dark:border-navy-800/80">
                  <Wallet className="w-4 h-4 text-navy-800 dark:text-cream-200" />
                  <h3 className="text-sm font-bold text-navy-950 dark:text-cream-50">
                    Pemasukan Bulanan
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-navy-800 dark:text-cream-200 mb-1.5">
                      Nominal Penghasilan Rutin per Bulan (IDR)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-navy-400 dark:text-cream-400">
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
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50/50 dark:bg-navy-900/60 text-navy-950 dark:text-cream-50 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-navy-800 dark:focus:ring-cream-200"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-800 dark:text-cream-200 mb-2">
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
                              ? "border-navy-900 bg-navy-900 text-cream-50 dark:border-cream-100 dark:bg-cream-100 dark:text-navy-950 font-semibold shadow-sm"
                              : "border-cream-300 dark:border-navy-800 bg-cream-50/50 dark:bg-navy-900/30 text-navy-700 dark:text-cream-300 hover:border-navy-400"
                          }`}
                        >
                          <div className="font-bold">{opt.label}</div>
                          <div className="text-[10px] opacity-75 mt-0.5">
                            {opt.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Tabungan & Pengeluaran Wajib */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 space-y-4 transition-colors shadow-sm">
                <div className="flex items-center gap-2.5 pb-2 border-b border-cream-200 dark:border-navy-800/80">
                  <PiggyBank className="w-4 h-4 text-navy-800 dark:text-cream-200" />
                  <h3 className="text-sm font-bold text-navy-950 dark:text-cream-50">
                    Tabungan & Komitmen Wajib
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-800 dark:text-cream-200 mb-1.5">
                      Total Cadangan Tabungan Saat Ini (IDR)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-navy-400 dark:text-cream-400">
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
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50/50 dark:bg-navy-900/60 text-navy-950 dark:text-cream-50 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-navy-800 dark:focus:ring-cream-200"
                        required
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-navy-500 dark:text-cream-400">
                      Saldo rekening atau dompet digital cadangan
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-800 dark:text-cream-200 mb-1.5">
                      Pengeluaran Tetap per Bulan (IDR)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-navy-400 dark:text-cream-400">
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
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50/50 dark:bg-navy-900/60 text-navy-950 dark:text-cream-50 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-navy-800 dark:focus:ring-cream-200"
                        required
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-navy-500 dark:text-cream-400">
                      Sewa kos, listrik, pulsa data, dan kebutuhan pokok
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 3: Prioritas Finansial */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 space-y-4 transition-colors shadow-sm">
                <div className="flex items-center gap-2.5 pb-2 border-b border-cream-200 dark:border-navy-800/80">
                  <User className="w-4 h-4 text-navy-800 dark:text-cream-200" />
                  <h3 className="text-sm font-bold text-navy-950 dark:text-cream-50">
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
                          ? "border-navy-900 bg-navy-900 text-cream-50 dark:border-cream-100 dark:bg-cream-100 dark:text-navy-950 font-semibold shadow-sm"
                          : "border-cream-300 dark:border-navy-800 bg-cream-50/50 dark:bg-navy-900/30 text-navy-700 dark:text-cream-300 hover:border-navy-400"
                      }`}
                    >
                      <div className="font-bold">{opt.label}</div>
                      <div className="text-[10px] opacity-75 mt-0.5">
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
                  className="px-6 py-3 rounded-full bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 text-cream-50 dark:text-navy-950 font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
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
