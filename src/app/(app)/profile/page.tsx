"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useAuthContext } from "@/components/layout/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
import { invalidateFinancialProfile } from "@/hooks/use-financial-profile";
import { isDemoMode, setDemoMode } from "@/lib/storage/local-storage";
import { resetDemoData, seedDemoExpenses } from "@/lib/storage/demo-seed";
import { Note } from "@/components/press/note";
import { Guilloche } from "@/components/press/guilloche";
import { formatSerial } from "@/components/press/serial";
import { rupiah } from "@/lib/format";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuthContext();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Without a saved profile the form starts empty rather than with made-up amounts.
  const [formData, setFormData] = useState({
    monthlyIncome: 0,
    incomeType: "salary",
    currentSavings: 0,
    monthlyFixedExpenses: 0,
    financialPriority: "emergency_fund",
  });

  // Read after mount: storage is client-only.
  const [demoMode, setDemoModeState] = useState(false);
  const [demoBusy, setDemoBusy] = useState(false);
  useEffect(() => setDemoModeState(isDemoMode()), []);



  // Pages read storage on mount, so a full reload switches every store to the other namespace.
  // Turning demo off keeps its data (scoped and never synced), so turning it back on shows the same samples.
  const handleToggleDemo = async () => {
    setDemoBusy(true);
    setDemoMode(!demoMode);
    if (!demoMode) await seedDemoExpenses().catch((err) => console.error("Gagal mengisi data demo:", err));
    window.location.reload();
  };

  const handleResetDemo = async () => {
    setDemoBusy(true);
    await resetDemoData().catch((err) => console.error("Gagal mereset data demo:", err));
    window.location.reload();
  };

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

      invalidateFinancialProfile();
      setFeedback({
        type: "success",
        message: "Tersimpan. Jatah harianmu dihitung ulang dari angka baru.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const optionClass = (on: boolean) =>
    `min-h-11 px-3 py-2 text-left border transition-colors ${
      on ? "border-ink bg-ink text-paper-sheet dark:text-paper" : "border-ink/30 text-ink hover:bg-ink/5"
    }`;

  return (
    <>
      <PageHeader title="Profil" subtitle="Uang saku, Mode Demo, akun" />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-10 grid grid-cols-1 lg:grid-cols-[minmax(0,26rem)_1fr] gap-x-12 gap-y-10 items-start">
        <div className="space-y-8 lg:sticky lg:top-24">
          {user && (
            <Note as="section" aria-label="Kartu anggota" className="overflow-hidden">
              {/* KTM-style colour field across the top of the card. */}
              <div className="bg-denom-blue text-paper-sheet dark:text-paper px-5 py-2.5 flex items-baseline justify-between gap-3">
                <span className="text-body font-semibold">Kartu Anak Kost</span>
                <span className="text-meta font-semibold">finoch.id</span>
              </div>
              <div className="relative px-5 pt-5 pb-4 flex gap-4">
                <Guilloche seed={0x1d0c} size={180} families={3} className="absolute -right-12 -bottom-16 opacity-30" />
                <div
                  aria-hidden="true"
                  className="relative w-20 h-24 shrink-0 border border-ink/40 bg-paper-deep flex items-center justify-center font-display text-numeral font-bold text-ink"
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <dl className="relative min-w-0 space-y-1.5">
                  <dt className="sr-only">Nama</dt>
                  <dd className="font-display text-head font-bold text-ink break-words">{user.name}</dd>
                  <dt className="sr-only">Email</dt>
                  <dd className="text-body text-ink break-all">{user.email}</dd>
                  <dt className="text-meta text-ink-soft">No. anggota</dt>
                  <dd className="money text-body text-ink tracking-[0.08em]">{formatSerial(user.id, new Date()).replace(/·\d{6}·/, "·KOST·")}</dd>
                </dl>
              </div>
              <div className="px-5 pb-4 flex flex-wrap items-center gap-3">
                <span className="text-meta font-semibold text-aman-ink">Akun aktif</span>
                {demoMode && <span className="text-meta font-semibold text-ink">Mode Demo</span>}
              </div>
            </Note>
          )}

          <section aria-labelledby="demo-mode-label" className="border-y border-ink/20 py-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 id="demo-mode-label" className="text-body font-semibold text-ink">
                  Mode Demo (data contoh)
                </h2>
                <p className="text-meta text-ink-soft">
                  Isi aplikasi dengan data contoh untuk presentasi. Data asli aman dan data demo tidak disinkron ke server.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={demoMode}
                aria-labelledby="demo-mode-label"
                onClick={handleToggleDemo}
                disabled={demoBusy}
                className={`relative w-14 h-11 shrink-0 disabled:opacity-50 before:absolute before:inset-x-0 before:top-2.5 before:h-6 before:rounded-full before:border-2 before:transition-colors ${
                  demoMode ? "before:border-ink before:bg-ink/15" : "before:border-ink/50 before:bg-transparent"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute top-3.5 left-1 w-4 h-4 rounded-full motion-safe:transition-transform ${
                    demoMode ? "translate-x-7 bg-ink" : "bg-ink/60"
                  }`}
                />
              </button>
            </div>
            {demoMode && (
              <button
                type="button"
                onClick={handleResetDemo}
                disabled={demoBusy}
                className="min-h-11 px-4 rounded-full border border-ink text-ink text-body font-semibold hover:bg-ink/5 transition-colors disabled:opacity-50"
              >
                Reset data demo
              </button>
            )}
          </section>
        </div>

        <section aria-labelledby="money-title" className="space-y-4 min-w-0">
          <h2 id="money-title" className="font-display text-head font-bold text-ink border-b border-ink/20 pb-2">
            Uang saku & komitmen
          </h2>

          {feedback && (
            <p
              role="status"
              className={`flex items-center gap-2 text-body font-semibold ${feedback.type === "success" ? "text-aman-ink" : "text-habis-ink"}`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              )}
              {feedback.message}
            </p>
          )}

          {isLoading ? (
            <div className="space-y-3" aria-busy="true" aria-label="Memuat profil">
              <div className="h-16 bg-paper-deep motion-safe:animate-pulse" />
              <div className="h-16 bg-paper-deep motion-safe:animate-pulse" />
              <div className="h-16 bg-paper-deep motion-safe:animate-pulse" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="divide-y divide-ink/15">
              <MoneyField
                label="Uang saku / pemasukan per bulan"
                value={formData.monthlyIncome}
                onChange={(v) => setFormData({ ...formData, monthlyIncome: v })}
              />

              <div className="py-4">
              <fieldset>
                <legend className="text-body font-semibold text-ink mb-2">Sumber pemasukan utama</legend>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {incomeTypeOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      aria-pressed={formData.incomeType === opt.id}
                      onClick={() => setFormData({ ...formData, incomeType: opt.id })}
                      className={optionClass(formData.incomeType === opt.id)}
                    >
                      <span className="block text-body font-semibold">{opt.label}</span>
                      <span className="block text-meta opacity-80">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              </div>

              <MoneyField
                label="Tabungan cadangan saat ini"
                hint="Saldo rekening atau dompet digital cadangan"
                value={formData.currentSavings}
                onChange={(v) => setFormData({ ...formData, currentSavings: v })}
              />

              <MoneyField
                label="Pengeluaran tetap per bulan"
                hint="Sewa kos, listrik, pulsa data, dan kebutuhan pokok bulanan."
                value={formData.monthlyFixedExpenses}
                onChange={(v) => setFormData({ ...formData, monthlyFixedExpenses: v })}
              />

              <div className="py-4">
              <fieldset>
                <legend className="text-body font-semibold text-ink mb-2">Prioritas finansial utama</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {priorityOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      aria-pressed={formData.financialPriority === opt.id}
                      onClick={() => setFormData({ ...formData, financialPriority: opt.id })}
                      className={optionClass(formData.financialPriority === opt.id)}
                    >
                      <span className="block text-body font-semibold">{opt.label}</span>
                      <span className="block text-meta opacity-80">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              </div>

              <div className="pt-5">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 min-h-11 px-6 rounded-full bg-ink hover:bg-ink/90 text-paper-sheet dark:text-paper text-body font-semibold transition-colors disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-4 h-4 motion-safe:animate-spin" aria-hidden="true" />}
                  Simpan perubahan
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
    </>
  );
}

/** One amount on the settings list: label, optional hint, a Rp-prefixed number field. */
function MoneyField({ label, hint, value, onChange }: { label: string; hint?: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block py-4 space-y-1.5">
      <span className="block text-body font-semibold text-ink">{label}</span>
      {hint && <span className="block text-meta text-ink-soft">{hint}</span>}
      <span className="relative block max-w-xs">
        <span className="absolute inset-y-0 left-3 flex items-center text-body font-semibold text-ink-soft">Rp</span>
        {/* Grouped like every other amount (1.500.000), edited as digits. */}
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={value ? value.toLocaleString("id-ID") : ""}
          onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, "")) || 0)}
          className="money w-full min-h-11 pl-10 pr-3 bg-paper-sheet border border-ink/30 text-base font-semibold text-ink focus-visible:outline-offset-0"
          required
        />
      </span>
    </label>
  );
}
