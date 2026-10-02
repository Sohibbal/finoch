"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  PiggyBank,
  Target,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
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
    { id: "saving", label: "Menabung Rutin", desc: "Membangun kebiasaan 20% tabungan" },
    { id: "debt_repayment", label: "Bebas Utang", desc: "Lunasi cicilan lebih cepat" },
    { id: "travel", label: "Traveling / Liburan", desc: "Rencana perjalanan masa depan" },
  ];

  // Baseline 50/30/20 calculation for preview
  const needs50 = Math.round(formData.monthlyIncome * 0.5);
  const wants30 = Math.round(formData.monthlyIncome * 0.3);
  const savings20 = Math.round(formData.monthlyIncome * 0.2);

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="flex justify-center items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            FINRA
          </span>
        </div>
        <h2 className="text-center text-2xl font-bold text-slate-900 dark:text-white">
          Bangun Digital Twin Finansial Anda
        </h2>
        <p className="mt-1 text-center text-sm text-slate-600 dark:text-slate-400">
          Langkah {step} dari 3: Sesuaikan data awal untuk proyeksi otomatis
        </p>

        {/* Progress Bar */}
        <div className="mt-4 w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-800 sm:px-10">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-sm text-red-700 dark:text-red-400">
              {errorMessage}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-950 rounded-xl text-emerald-600">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Penghasilan Bulanan
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Berapa total pemasukan rutin Anda setiap bulan?
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nominal Penghasilan (IDR)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-medium">
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
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="3500000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
                      className={`p-3 text-left rounded-xl border transition-all ${
                        formData.incomeType === opt.id
                          ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <div className="text-sm font-semibold">{opt.label}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
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
                <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-xl text-blue-600">
                  <PiggyBank className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Tabungan & Komitmen Wajib
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Posisi cadangan dana saat ini dan biaya hidup primer
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Total Tabungan Saat Ini (IDR)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-medium">
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
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="1500000"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Saldo rekening tabungan, dompet digital, atau uang tunai cadangan
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Pengeluaran Wajib Bulanan (IDR)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-medium">
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
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="1200000"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Sewa kos/kontrakan, cicilan, listrik, pulsa data, dan kebutuhan pokok
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-950 rounded-xl text-purple-600">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Prioritas Finansial Utama
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Fokus apa yang ingin Anda capai bersama FINRA?
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
                    className={`w-full p-3.5 text-left rounded-xl border flex items-center justify-between transition-all ${
                      formData.financialPriority === opt.id
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <div>
                      <div className="text-sm font-semibold">{opt.label}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {opt.desc}
                      </div>
                    </div>
                    {formData.financialPriority === opt.id && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </button>
                ))}
              </div>

              {/* Digital Twin Baseline Preview */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Alokasi Digital Twin Rekomendasi (50/30/20)
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-emerald-100/50 dark:bg-emerald-950/40">
                    <div className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                      Kebutuhan (50%)
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      Rp {needs50.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-100/50 dark:bg-amber-950/40">
                    <div className="text-xs font-medium text-amber-800 dark:text-amber-300">
                      Keinginan (30%)
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      Rp {wants30.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-100/50 dark:bg-blue-950/40">
                    <div className="text-xs font-medium text-blue-800 dark:text-blue-300">
                      Tabungan (20%)
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      Rp {savings20.toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-colors"
              >
                Lanjutkan
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-colors"
              >
                {isSubmitting ? "Menyimpan..." : "Mulai Digital Twin"}
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
