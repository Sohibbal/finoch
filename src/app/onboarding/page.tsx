"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import {
  Wallet,
  PiggyBank,
  Target,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
    { id: "saving", label: "Menabung Rutin", desc: "Membangun kebiasaan menabung konsisten" },
    { id: "debt_repayment", label: "Bebas Utang", desc: "Lunasi cicilan lebih cepat" },
    { id: "travel", label: "Traveling / Liburan", desc: "Rencana perjalanan masa depan" },
  ];

  // Cashflow calculation for preview
  const remainingCashflow = Math.max(0, formData.monthlyIncome - formData.monthlyFixedExpenses);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menyimpan profil finansial");
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan data";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-navy-950 text-navy-900 dark:text-cream-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center space-y-2">
        <div className="flex justify-center mb-1">
          <Link href="/" className="hover:opacity-90 transition-opacity" aria-label="Finoch.id Beranda">
            <BrandLogo variant="full" className="h-7 w-auto" />
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-navy-950 dark:text-cream-50 tracking-tight">
          Bangun Digital Twin Finansial Anda
        </h1>
        <p className="text-xs sm:text-sm text-navy-600 dark:text-cream-300/70">
          Langkah {step} dari 3: Sesuaikan data awal untuk proyeksi otomatis
        </p>

        {/* Progress Bar */}
        <div className="pt-2 max-w-xs mx-auto">
          <div className="w-full bg-cream-200 dark:bg-navy-900 h-2 rounded-full overflow-hidden">
            <div
              className="bg-navy-900 dark:bg-cream-100 h-full rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white dark:bg-[#070E1A] py-8 px-6 sm:px-10 rounded-3xl border border-cream-300 dark:border-navy-800 shadow-xl space-y-6 transition-colors">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-800 dark:text-rose-300">
              {errorMessage}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cream-100 dark:bg-navy-900 rounded-2xl text-navy-800 dark:text-cream-200">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-950 dark:text-cream-50">
                    Penghasilan Bulanan
                  </h3>
                  <p className="text-xs text-navy-500 dark:text-cream-400">
                    Berapa total pemasukan rutin Anda setiap bulan?
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-800 dark:text-cream-200 mb-1.5">
                  Nominal Penghasilan (IDR)
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
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50/50 dark:bg-navy-900/60 text-navy-950 dark:text-cream-50 font-bold text-base focus:outline-none focus:ring-2 focus:ring-navy-800 dark:focus:ring-cream-200"
                    placeholder="3500000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-800 dark:text-cream-200 mb-2">
                  Sumber Penghasilan Utama
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {incomeTypeOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, incomeType: opt.id })
                      }
                      className={`p-3 text-left rounded-xl border transition-all text-xs ${
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
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cream-100 dark:bg-navy-900 rounded-2xl text-navy-800 dark:text-cream-200">
                  <PiggyBank className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-950 dark:text-cream-50">
                    Tabungan & Komitmen Wajib
                  </h3>
                  <p className="text-xs text-navy-500 dark:text-cream-400">
                    Posisi cadangan dana saat ini dan komitmen biaya hidup
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-800 dark:text-cream-200 mb-1.5">
                  Total Tabungan Saat Ini (IDR)
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
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50/50 dark:bg-navy-900/60 text-navy-950 dark:text-cream-50 font-bold text-base focus:outline-none focus:ring-2 focus:ring-navy-800 dark:focus:ring-cream-200"
                    placeholder="1500000"
                  />
                </div>
                <p className="mt-1 text-[11px] text-navy-500 dark:text-cream-400">
                  Saldo rekening tabungan, dompet digital, atau uang tunai cadangan
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-800 dark:text-cream-200 mb-1.5">
                  Pengeluaran Wajib Bulanan (IDR)
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
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50/50 dark:bg-navy-900/60 text-navy-950 dark:text-cream-50 font-bold text-base focus:outline-none focus:ring-2 focus:ring-navy-800 dark:focus:ring-cream-200"
                    placeholder="1200000"
                  />
                </div>
                <p className="mt-1 text-[11px] text-navy-500 dark:text-cream-400">
                  Sewa kos/kontrakan, cicilan, listrik, pulsa data, dan kebutuhan pokok
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cream-100 dark:bg-navy-900 rounded-2xl text-navy-800 dark:text-cream-200">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-950 dark:text-cream-50">
                    Prioritas Finansial Utama
                  </h3>
                  <p className="text-xs text-navy-500 dark:text-cream-400">
                    Fokus apa yang ingin Anda capai bersama Finoch?
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {priorityOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, financialPriority: opt.id })
                    }
                    className={`w-full p-3.5 text-left rounded-xl border flex items-center justify-between transition-all text-xs ${
                      formData.financialPriority === opt.id
                        ? "border-navy-900 bg-navy-900 text-cream-50 dark:border-cream-100 dark:bg-cream-100 dark:text-navy-950 font-semibold shadow-sm"
                        : "border-cream-300 dark:border-navy-800 bg-cream-50/50 dark:bg-navy-900/30 text-navy-700 dark:text-cream-300 hover:border-navy-400"
                    }`}
                  >
                    <div>
                      <div className="font-bold">{opt.label}</div>
                      <div className="text-[10px] opacity-75 mt-0.5">
                        {opt.desc}
                      </div>
                    </div>
                    {formData.financialPriority === opt.id && (
                      <CheckCircle2 className="w-4 h-4 text-cream-100 dark:text-navy-950" />
                    )}
                  </button>
                ))}
              </div>

              {/* Digital Twin Baseline Preview */}
              <div className="p-4 rounded-2xl bg-cream-50/80 dark:bg-navy-900/60 border border-cream-200 dark:border-navy-800">
                <div className="flex items-center gap-2 mb-2 text-[11px] font-bold uppercase tracking-wider text-navy-500 dark:text-cream-400">
                  <TrendingUp className="w-3.5 h-3.5 text-navy-700 dark:text-cream-300" />
                  Ringkasan Estimasi Arus Kas
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#070E1A] border border-cream-200 dark:border-navy-800">
                    <div className="text-[10px] font-medium text-navy-500 dark:text-cream-400">
                      Penghasilan
                    </div>
                    <div className="text-xs sm:text-sm font-black text-navy-950 dark:text-cream-50 mt-0.5">
                      Rp {formData.monthlyIncome.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#070E1A] border border-cream-200 dark:border-navy-800">
                    <div className="text-[10px] font-medium text-navy-500 dark:text-cream-400">
                      Biaya Tetap
                    </div>
                    <div className="text-xs sm:text-sm font-black text-navy-950 dark:text-cream-50 mt-0.5">
                      Rp {formData.monthlyFixedExpenses.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#070E1A] border border-cream-200 dark:border-navy-800">
                    <div className="text-[10px] font-medium text-navy-500 dark:text-cream-400">
                      Sisa Kas
                    </div>
                    <div className="text-xs sm:text-sm font-black text-navy-950 dark:text-cream-50 mt-0.5">
                      Rp {remainingCashflow.toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between pt-4 border-t border-cream-200 dark:border-navy-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-cream-300 dark:border-navy-800 text-xs font-semibold text-navy-700 dark:text-cream-300 hover:bg-cream-100 dark:hover:bg-navy-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Kembali
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 text-xs font-bold text-cream-50 dark:text-navy-950 shadow-sm transition-all active:scale-[0.98]"
              >
                Lanjutkan
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 disabled:opacity-50 text-xs font-bold text-cream-50 dark:text-navy-950 shadow-sm transition-all active:scale-[0.98]"
              >
                {isSubmitting ? "Menyimpan..." : "Mulai Digital Twin"}
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
