"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { invalidateFinancialProfile } from "@/hooks/use-financial-profile";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Note } from "@/components/press/note";
import { ReceiptLine } from "@/components/press/masuk-receipt-line";
import { rupiah } from "@/lib/format";

// Ids are the stored values; the order and words are for anak kost.
const INCOME_TYPE_OPTIONS = [
  { id: "allowance", label: "Uang Saku", desc: "Kiriman orang tua atau beasiswa" },
  { id: "salary", label: "Gaji / Part-time", desc: "Kerja sambil kuliah, dibayar rutin" },
  { id: "freelance", label: "Freelance", desc: "Dibayar per proyek" },
  { id: "business", label: "Jualan / Usaha", desc: "Untung dari dagangan" },
  { id: "other", label: "Lainnya", desc: "Sumber lain" },
];

const PRIORITY_OPTIONS = [
  { id: "emergency_fund", label: "Dana darurat", desc: "Cadangan buat hal tak terduga" },
  { id: "buy_item", label: "Beli barang impian", desc: "Laptop, HP, atau motor" },
  { id: "saving", label: "Nabung rutin", desc: "Sisihkan tiap bulan, sekecil apa pun" },
  { id: "debt_repayment", label: "Bebas utang", desc: "Lunasi kasbon dan cicilan" },
  { id: "travel", label: "Jalan-jalan", desc: "Mudik atau liburan semester" },
];

const STEPS = ["Uang masuk", "Tabungan & biaya wajib", "Tujuan"];

/** Amounts are typed as digits and shown with dots; empty stays empty. */
const digits = (value: string) => value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
const dotted = (value: string) => (value ? Number(value).toLocaleString("id-ID") : "");

function MoneyField({
  id,
  label,
  hint,
  value,
  onChange,
  placeholder,
  error,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string;
}) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-body font-semibold text-ink">
        {label}
      </label>
      <div className="flex items-baseline gap-2 border-b-2 border-ink/60 focus-within:border-ink">
        <span aria-hidden="true" className="font-display text-head font-bold text-ink-soft">
          Rp
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={dotted(value)}
          onChange={(e) => onChange(digits(e.target.value))}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="money w-full min-w-0 bg-transparent py-2 font-display text-head font-bold text-ink placeholder:text-ink-soft placeholder:font-normal focus:outline-none"
        />
      </div>
      {hint && (
        <p id={`${id}-hint`} className="text-meta text-ink-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-meta font-semibold text-habis-ink">
          {error}
        </p>
      )}
    </div>
  );
}

/** A printed tick box: one option of a choice, pressed or not. */
function TickOption({ label, desc, pressed, onClick }: { label: string; desc: string; pressed: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`w-full min-h-12 flex items-start gap-3 px-3 py-3 text-left border transition-colors ${
        pressed ? "border-ink border-2 bg-paper" : "border-ink/20 hover:border-ink/50"
      }`}
    >
      <span
        aria-hidden="true"
        className={`mt-0.5 w-5 h-5 shrink-0 border-2 border-ink flex items-center justify-center ${pressed ? "bg-ink text-paper-sheet dark:text-paper" : ""}`}
      >
        {pressed && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
      </span>
      <span className="min-w-0">
        <span className="block text-body font-semibold text-ink">{label}</span>
        <span className="block text-meta text-ink-soft">{desc}</span>
      </span>
    </button>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [incomeError, setIncomeError] = useState("");

  // Amounts as digit strings: nothing is pre-filled, the placeholders show the shape.
  const [formData, setFormData] = useState({
    monthlyIncome: "",
    incomeType: "allowance",
    currentSavings: "",
    monthlyFixedExpenses: "",
    financialPriority: "emergency_fund",
  });

  const income = Number(formData.monthlyIncome) || 0;
  const fixed = Number(formData.monthlyFixedExpenses) || 0;
  const remainingCashflow = Math.max(0, income - fixed);

  const next = () => {
    if (step === 1 && income <= 0) {
      setIncomeError("Isi dulu berapa uang yang masuk tiap bulan.");
      return;
    }
    setIncomeError("");
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          monthlyIncome: income,
          currentSavings: Number(formData.currentSavings) || 0,
          monthlyFixedExpenses: fixed,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        // The validator's own messages are Indonesian; prefer them over the generic error.
        throw new Error(data.details?.join(" ") || data.error || "Gagal menyimpan profil finansial");
      }

      invalidateFinancialProfile();
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan data";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink px-4 sm:px-6 py-6 sm:py-12">
      <div className="max-w-xl mx-auto space-y-6">
        <Link href="/" aria-label="Finoch.id Beranda" className="inline-block">
          <BrandLogo variant="full" className="h-7 w-auto" />
        </Link>

        <div className="space-y-2">
          <h1 className="font-display text-[clamp(1.875rem,7vw,2.5rem)] leading-tight font-bold text-ink text-balance">
            Isi uang bulananmu dulu
          </h1>
          <p className="text-body text-ink-soft">
            Tiga lembar, kurang dari semenit. Dari sini Finoch menghitung jatah aman jajanmu tiap hari.
          </p>
        </div>

        <ol className="flex gap-2" aria-label={`Lembar ${step} dari 3`}>
          {STEPS.map((name, i) => (
            <li
              key={name}
              aria-current={step === i + 1 ? "step" : undefined}
              className={`flex-1 border-t-4 pt-1.5 text-meta ${
                step > i ? "border-ink text-ink font-semibold" : "border-ink/20 text-ink-soft"
              }`}
            >
              {name}
            </li>
          ))}
        </ol>

        <Note as="section" aria-labelledby="lembar-title" className="px-5 sm:px-8 py-6 sm:py-8 space-y-6">
          {errorMessage && (
            <p role="alert" className="border border-habis px-3 py-2.5 text-body font-semibold text-habis-ink">
              {errorMessage}
            </p>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 id="lembar-title" className="font-display text-head font-bold text-ink">
                Uang yang masuk tiap bulan
              </h2>
              <MoneyField
                id="monthly-income"
                label="Jumlah per bulan"
                hint="Total kiriman, beasiswa, atau gaji dalam sebulan."
                value={formData.monthlyIncome}
                onChange={(v) => {
                  setFormData({ ...formData, monthlyIncome: v });
                  if (v) setIncomeError("");
                }}
                placeholder="contoh 1.500.000"
                error={incomeError}
              />
              <fieldset className="space-y-2">
                <legend className="text-body font-semibold text-ink mb-2">Dari mana uangnya?</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {INCOME_TYPE_OPTIONS.map((opt) => (
                    <TickOption
                      key={opt.id}
                      label={opt.label}
                      desc={opt.desc}
                      pressed={formData.incomeType === opt.id}
                      onClick={() => setFormData({ ...formData, incomeType: opt.id })}
                    />
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 id="lembar-title" className="font-display text-head font-bold text-ink">
                Tabungan dan biaya wajib
              </h2>
              <MoneyField
                id="current-savings"
                label="Tabungan yang ada sekarang"
                hint="Saldo tabungan, e-wallet, atau uang tunai cadangan. Boleh kosong."
                value={formData.currentSavings}
                onChange={(v) => setFormData({ ...formData, currentSavings: v })}
                placeholder="contoh 500.000"
              />
              <MoneyField
                id="fixed-expenses"
                label="Biaya wajib per bulan"
                hint="Sewa kos, listrik, WiFi, kuota, cicilan. Boleh kosong."
                value={formData.monthlyFixedExpenses}
                onChange={(v) => setFormData({ ...formData, monthlyFixedExpenses: v })}
                placeholder="contoh 650.000"
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 id="lembar-title" className="font-display text-head font-bold text-ink">
                Lagi ngejar apa?
              </h2>
              <fieldset className="space-y-2">
                <legend className="sr-only">Tujuan utama</legend>
                {PRIORITY_OPTIONS.map((opt) => (
                  <TickOption
                    key={opt.id}
                    label={opt.label}
                    desc={opt.desc}
                    pressed={formData.financialPriority === opt.id}
                    onClick={() => setFormData({ ...formData, financialPriority: opt.id })}
                  />
                ))}
              </fieldset>

              <figure className="border-y-2 border-dashed border-ink/40 py-4 space-y-3">
                <figcaption className="text-body font-semibold text-ink">Hitungan sebulanmu</figcaption>
                <dl className="space-y-2">
                  <ReceiptLine label="Uang masuk" amount={rupiah(income)} />
                  <ReceiptLine label="Biaya wajib" amount={rupiah(-fixed)} />
                  <ReceiptLine label="Sisa buat hidup" amount={rupiah(remainingCashflow)} strong />
                </dl>
                <p className="text-meta text-ink-soft">
                  Jatah harianmu adalah sisa ini dibagi hari yang tersisa di bulan berjalan. Bisa diubah kapan saja di Profil.
                </p>
              </figure>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-5 border-t border-ink/20">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-2 min-h-11 px-4 rounded-full border border-ink/30 text-body font-semibold text-ink hover:bg-ink/5"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                Kembali
              </button>
            ) : (
              <span />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={next}
                className="inline-flex items-center min-h-11 px-6 rounded-full bg-ink text-paper-sheet dark:text-paper text-body font-bold hover:bg-ink/90"
              >
                Lanjut
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="inline-flex items-center min-h-11 px-6 rounded-full bg-ink text-paper-sheet dark:text-paper text-body font-bold hover:bg-ink/90 disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan & mulai"}
              </button>
            )}
          </div>
        </Note>
      </div>
    </div>
  );
}
