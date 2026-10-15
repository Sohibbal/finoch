"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  ArrowRight,
  ArrowLeft,
  Gift,
  Coins,
  CheckCircle2,
  Sparkles,
  Loader2,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { TypewriterCard } from "@/components/onboarding/typewriter-card";
import { invalidateFinancialProfile } from "@/hooks/use-financial-profile";
import {
  getWishlistSavingsPercentage,
  setWishlistSavingsPercentage,
} from "@/lib/storage/wishlist-settings";
import {
  getDailyAllowanceSetting,
  setDailyAllowanceSetting,
} from "@/lib/storage/daily-allowance-settings";
import { rupiah } from "@/lib/format";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [nickname, setNickname] = useState("");
  const [savingsPercentage, setSavingsPercentage] = useState<number>(() =>
    getWishlistSavingsPercentage()
  );
  const [dailyAllowance, setDailyAllowance] = useState<number>(() =>
    getDailyAllowanceSetting()
  );
  const [allowanceInput, setAllowanceInput] = useState<string>(() =>
    String(getDailyAllowanceSetting())
  );
  const [allowanceError, setAllowanceError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Handle nickname submitted from TypewriterCard
  const handleNicknameComplete = (enteredNickname: string) => {
    setNickname(enteredNickname);
    if (typeof window !== "undefined") {
      localStorage.setItem("finoch_user_nickname", enteredNickname);
    }
    setStep(2);
  };

  // Step 2: Handle wishlist percentage selection
  const handleSelectSavingsPreset = (pct: number) => {
    setSavingsPercentage(pct);
  };

  // Step 3: Handle daily allowance selection & input
  const handleSelectAllowancePreset = (val: number) => {
    setDailyAllowance(val);
    setAllowanceInput(String(val));
    setAllowanceError(null);
  };

  const handleAllowanceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, "");
    setAllowanceInput(cleaned);
    const parsed = parseInt(cleaned, 10);
    if (!Number.isNaN(parsed) && parsed >= 1000) {
      setDailyAllowance(parsed);
      setAllowanceError(null);
    }
  };

  // Final submit after completing all 3 steps
  const handleFinalSubmit = async () => {
    const parsed = parseInt(allowanceInput.replace(/\D/g, ""), 10);
    if (Number.isNaN(parsed) || parsed < 1000) {
      setAllowanceError("Nominal jatah harian minimal Rp 1.000.");
      return;
    }

    setIsLoading(true);

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("finoch_user_nickname", nickname.trim());
      }

      setWishlistSavingsPercentage(savingsPercentage);
      setDailyAllowanceSetting(parsed);

      // Save profile nickname to database
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nickname.trim() }),
      }).catch(() => {});

      invalidateFinancialProfile();
      router.push("/dashboard");
    } catch (err) {
      console.error("Onboarding setup error:", err);
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-paper dark:bg-navy-950 px-4 py-8 sm:py-12">
      {/* Top Header & Step Progress Bar */}
      <header className="flex flex-col items-center gap-3">
        <BrandLogo />
        <div className="flex items-center gap-2 mt-1">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? "w-8 bg-amber-500 dark:bg-amber-400"
                  : s < step
                  ? "w-4 bg-emerald-500 dark:bg-emerald-400"
                  : "w-4 bg-ink/15 dark:bg-navy-700"
              }`}
            />
          ))}
        </div>
        <p className="text-[11px] font-semibold text-ink-soft dark:text-navy-300 tracking-wide uppercase">
          Langkah {step} dari 3:{" "}
          {step === 1
            ? "Nama Panggilan"
            : step === 2
            ? "Alokasi Wishlist"
            : "Target Jajan Harian"}
        </p>
      </header>

      {/* Main Interactive Onboarding Card Area */}
      <main className="w-full flex justify-center my-auto py-6">
        {step === 1 && (
          <TypewriterCard
            onComplete={handleNicknameComplete}
            isLoading={isLoading}
            initialNickname={nickname}
          />
        )}

        {step === 2 && (
          <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-paper-sheet dark:bg-navy-900 border border-ink/20 dark:border-navy-700 rounded-2xl shadow-xl transition-all animate-fade-in space-y-6">
            {/* FinBot Avatar Greeting */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 dark:bg-purple-400/10 border border-purple-500/30 text-purple-600 dark:text-purple-400">
                <Gift className="w-8 h-8 animate-bounce" strokeWidth={2} />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-meta font-semibold text-purple-600 dark:text-purple-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Rencana Nabung Wishlist</span>
              </div>
            </div>

            {/* FinBot Speech Bubble */}
            <div className="p-4 rounded-xl bg-paper-deep dark:bg-navy-950/60 border border-ink/10 dark:border-navy-800">
              <p className="text-body font-medium text-ink dark:text-navy-100 leading-relaxed">
                Keren, <strong className="text-purple-600 dark:text-purple-400">{nickname}</strong>! Sekarang tentukan berapa persen jatah harian lo yang mau disisihkan otomatis buat Wishlist impian.
              </p>
            </div>

            {/* Wishlist Savings Allocation Box */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink dark:text-white">
                      Alokasi Tabungan Wishlist
                    </h3>
                    <p className="text-[11px] text-ink-soft dark:text-navy-300">
                      Komitmen tabungan dari jatah harian
                    </p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-900">
                  {savingsPercentage}% dari Jatah
                </span>
              </div>

              {/* Preset buttons */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-ink-soft dark:text-navy-300">
                  <span>Pilihan Cepat Persentase:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">{savingsPercentage}%</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 30, 50].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleSelectSavingsPreset(pct)}
                      className={`py-2 text-xs font-bold rounded-xl transition-all ${
                        savingsPercentage === pct
                          ? "bg-blue-600 text-white shadow-xs scale-102"
                          : "bg-paper-deep dark:bg-navy-800 text-ink dark:text-navy-200 hover:bg-ink/5 dark:hover:bg-navy-700"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Range slider */}
              <div className="pt-2">
                <input
                  type="range"
                  min={5}
                  max={80}
                  step={5}
                  value={savingsPercentage}
                  onChange={(e) => setSavingsPercentage(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-ink-soft dark:text-navy-400 mt-1 font-medium">
                  <span>5% (Santai)</span>
                  <span>50% (Rekomendasi)</span>
                  <span>80% (Gasspol)</span>
                </div>
              </div>

              <p className="text-[11px] text-ink-soft dark:text-navy-400 leading-relaxed">
                Setiap hari, persentase ini otomatis dialokasikan untuk mempercepat pencapaian barang impian di Wishlist lo.
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl border border-ink/20 dark:border-navy-700 text-ink dark:text-navy-200 font-semibold text-xs hover:bg-ink/5 dark:hover:bg-navy-800 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-ink dark:bg-white text-paper-sheet dark:text-navy-950 font-semibold text-xs hover:opacity-90 active:scale-[0.99] transition-all shadow-xs"
              >
                <span>Lanjut ke Jatah Harian</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-paper-sheet dark:bg-navy-900 border border-ink/20 dark:border-navy-700 rounded-2xl shadow-xl transition-all animate-fade-in space-y-6">
            {/* FinBot Avatar Greeting */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-500/10 dark:bg-teal-400/10 border border-teal-500/30 text-teal-600 dark:text-teal-400">
                <Coins className="w-8 h-8 animate-bounce" strokeWidth={2} />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-meta font-semibold text-teal-600 dark:text-teal-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Target Jatah Belanja</span>
              </div>
            </div>

            {/* FinBot Speech Bubble */}
            <div className="p-4 rounded-xl bg-paper-deep dark:bg-navy-950/60 border border-ink/10 dark:border-navy-800">
              <p className="text-body font-medium text-ink dark:text-navy-100 leading-relaxed">
                Satu langkah terakhir, <strong className="text-teal-600 dark:text-teal-400">{nickname}</strong>! Berapa batas target jajan / belanja harian lo? FinBot bakal jagain biar pengeluaran lo selalu aman terkendali.
              </p>
            </div>

            {/* Daily Allowance Setting Form */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink dark:text-white">
                      Target Jatah Harian
                    </h3>
                    <p className="text-[11px] text-ink-soft dark:text-navy-300">
                      Batas pengeluaran belanja per hari
                    </p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-900">
                  {rupiah(dailyAllowance)} / hari
                </span>
              </div>

              {/* Nominal Input with Rp Prefix */}
              <div>
                <label
                  htmlFor="allowance-input"
                  className="block text-xs font-semibold text-ink-soft dark:text-navy-300 mb-1"
                >
                  Nominal Jatah Per Hari (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-soft dark:text-navy-400">
                    Rp
                  </span>
                  <input
                    id="allowance-input"
                    type="text"
                    inputMode="numeric"
                    value={allowanceInput}
                    onChange={handleAllowanceInputChange}
                    placeholder="Contoh: 50000"
                    disabled={isLoading}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-ink/30 dark:border-navy-600 bg-paper-sheet dark:bg-navy-800 text-xs font-bold text-ink dark:text-white placeholder:text-ink-soft/60 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-xs"
                  />
                </div>
                {allowanceError && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">{allowanceError}</p>
                )}
              </div>

              {/* Preset buttons */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-ink-soft dark:text-navy-400">
                  Pilihan Cepat Jatah:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {[30000, 50000, 75000, 100000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSelectAllowancePreset(amt)}
                      className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
                        dailyAllowance === amt
                          ? "bg-teal-600 text-white shadow-xs scale-102"
                          : "bg-paper-deep dark:bg-navy-800 text-ink dark:text-navy-200 hover:bg-ink/5 dark:hover:bg-navy-700"
                      }`}
                    >
                      {amt >= 1000 ? `${amt / 1000}rb` : rupiah(amt)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Simulation Helper Box */}
              {(() => {
                const savingsAmount = Math.round((dailyAllowance * savingsPercentage) / 100);
                const jajanRemaining = dailyAllowance - savingsAmount;
                return (
                  <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/50 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-300">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>Simulasi Finansial Lo:</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                      Dari jatah <strong className="text-slate-900 dark:text-white">{rupiah(dailyAllowance)}</strong>/hari, lo nabung <strong className="text-purple-600 dark:text-purple-400">{rupiah(savingsAmount)}</strong> ({savingsPercentage}%) ke Wishlist, dan sisa jajan <strong className="text-emerald-600 dark:text-emerald-400">{rupiah(jajanRemaining)}</strong>/hari.
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isLoading}
                className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl border border-ink/20 dark:border-navy-700 text-ink dark:text-navy-200 font-semibold text-xs hover:bg-ink/5 dark:hover:bg-navy-800 transition-all disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs hover:opacity-95 active:scale-[0.99] transition-all shadow-md shadow-teal-600/20 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyiapkan Akun...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Selesai & Masuk Beranda</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-meta text-ink-soft dark:text-navy-400">
        <p>Finoch · Teman Finansial Cerdas Mahasiswa</p>
      </footer>
    </div>
  );
}
