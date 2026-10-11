"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Camera, Mic, PenLine } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Guilloche } from "@/components/press/guilloche";
import { SentencePress, EXAMPLE, EXAMPLE_JATAH } from "@/components/landing/sentence-press";
import { VoiceExpenseSheet } from "@/components/expense/voice-expense-sheet";
import { ReceiptScannerModal } from "@/components/transaction/receipt-scanner-modal";
import { UnifiedConfirmationModal } from "@/components/transaction/unified-confirmation-modal";
import { PrivacyDialog } from "@/components/layout/privacy-dialog";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NAV_GROUPS } from "@/components/layout/nav-items";
import { ReceiptLine } from "@/components/press/masuk-receipt-line";
import { rupiah } from "@/lib/format";
import type { TransactionCandidate } from "@/types/financial-types";

const PRIMARY =
  "inline-flex items-center justify-center min-h-12 px-6 rounded-full bg-ink text-paper-sheet dark:text-paper text-body font-bold hover:bg-ink/90 transition-colors";
const TEXT_LINK = "font-semibold text-ink underline underline-offset-4 decoration-ink/40 hover:decoration-ink";

// What happens after the first sentence; only what the app actually does.
const HERO_FACTS: [string, string][] = [
  ["Satu kalimat, beberapa catatan", "Tiap barang jadi catatan sendiri, lengkap dengan kategorinya."],
  ["Jatah dicetak ulang", "Setiap kamu catat, jatah hari ini langsung dihitung lagi."],
  ["Tanpa sinyal tetap jalan", "Catatan disimpan di HP dulu, dikirim begitu online lagi."],
];

// Each feature group printed under its own denomination color.
const GROUP_RULE: Record<string, string> = {
  main: "border-ink",
  student: "border-aman",
  finances: "border-denom-blue",
  planning: "border-denom-violet",
  account: "border-mepet",
};

const FAQ = [
  {
    q: "Beneran gratis?",
    a: "Gratis untuk mahasiswa. Tidak ada paket berbayar dan tidak ada iklan.",
  },
  {
    q: "Kalau lagi nggak ada sinyal?",
    a: "Catatan tetap tersimpan di HP dan dikirim ke akunmu begitu online lagi. Mic tanpa sinyal memakai model Whisper yang jalan di perangkat; modelnya diunduh sekali selagi ada internet.",
  },
  {
    q: "Suaraku dikirim ke mana?",
    a: "Saat online, mic memakai pengenal suara bawaan browser (di Chrome diproses oleh layanan Google). Saat offline, suara diproses Whisper di HP-mu sendiri. Finoch tidak menyimpan rekaman suara, hanya teks catatannya, dan kamu selalu melihat hasilnya sebelum disimpan.",
  },
  {
    q: "Salah kategori atau salah angka?",
    a: "Setiap hasil bisa kamu koreksi sebelum disimpan. Pengeluaran masuk ke lima kategori: Makan & Minum, Transportasi, Tagihan, Belanja & Gaya Hidup, Lainnya.",
  },
];

const WAYS = [
  {
    icon: Mic,
    title: "Ngomong",
    text: "Tekan Catat, sebut belanjaanmu. Beberapa barang dalam satu kalimat juga bisa.",
  },
  {
    icon: Camera,
    title: "Scan struk",
    text: "Foto nota minimarket atau warung, totalnya dibaca dari gambar.",
  },
  {
    icon: PenLine,
    title: "Ketik manual",
    text: "Kalau lagi di kelas dan nggak bisa ngomong, ketik saja.",
  },
];

export default function LandingPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState<TransactionCandidate | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.email) setUserEmail(data.user.email);
      })
      .catch(() => {});
  }, []);

  const handleOcrSuccess = (candidate: TransactionCandidate) => {
    setCurrentCandidate(candidate);
    setIsConfirmModalOpen(true);
  };

  const sisa = EXAMPLE.uangSaku - EXAMPLE.tetap;

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-40 bg-paper border-b border-ink/15 pt-[env(safe-area-inset-top)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-4">
          <Link href="/" aria-label="Finoch.id Beranda" className="shrink-0 mr-auto">
            <BrandLogo variant="full" className="h-7 w-auto" />
          </Link>
          <nav aria-label="Bagian halaman" className="hidden md:flex items-center gap-6 text-body text-ink-soft">
            <a href="#jatah" className="hover:text-ink">Jatah harian</a>
            <a href="#fitur" className="hover:text-ink">Isi Finoch</a>
            <a href="#tanya" className="hover:text-ink">Tanya jawab</a>
          </nav>
          <ThemeToggle className="hidden md:inline-flex" />
          {userEmail ? (
            <Link href="/dashboard" className="inline-flex items-center min-h-11 px-4 rounded-full border border-ink/30 text-body font-semibold hover:bg-ink/5">
              Buka Finoch
            </Link>
          ) : (
            <Link href="/login" className="inline-flex items-center min-h-11 px-4 rounded-full border border-ink/30 text-body font-semibold hover:bg-ink/5">
              Masuk
            </Link>
          )}
        </div>
      </header>

      <main>
        {/* Hero: what Finoch is, what to do, and the proof right beside it. */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-16 pb-14 sm:pb-24 grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,34rem)] gap-x-14 gap-y-10 items-start">
          <div className="space-y-6 lg:pt-10">
            <h1 className="font-display font-bold text-ink text-numeral leading-[1.05] text-balance">
              Ngomong aja, Finoch yang nyatat.
            </h1>
            <p className="text-body text-ink max-w-[34rem]">
              Bilang &ldquo;makan warteg delapan belas ribu sama es teh lima ribu&rdquo;, langsung jadi dua catatan. Dari situ
              Finoch menghitung <strong>jatah aman jajanmu hari ini</strong>, biar uang saku awet sampai akhir bulan.
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              {userEmail ? (
                <Link href="/dashboard" className={PRIMARY}>
                  Buka Finoch
                </Link>
              ) : (
                <>
                  <Link href="/register" className={PRIMARY}>
                    Daftar gratis
                  </Link>
                  <p className="text-body text-ink-soft">
                    Sudah punya akun?{" "}
                    <Link href="/login" className={TEXT_LINK}>
                      Masuk
                    </Link>
                  </p>
                </>
              )}
            </div>
            {/* Desktop: the press beside this runs long, so the column says what happens after the first sentence. */}
            <dl className="hidden lg:block max-w-[34rem] pt-6 border-b border-ink/20">
              {HERO_FACTS.map(([term, detail]) => (
                <div key={term} className="py-3 border-t border-ink/20 grid grid-cols-[11rem_1fr] gap-x-6">
                  <dt className="text-body font-semibold text-ink">{term}</dt>
                  <dd className="text-body text-ink-soft">{detail}</dd>
                </div>
              ))}
            </dl>
          </div>

          <SentencePress onTryMic={() => setIsVoiceOpen(true)} />
        </section>

        {/* How the one number is made, printed as a receipt. */}
        <section id="jatah" aria-labelledby="jatah-title" className="scroll-mt-20 border-t border-ink/15">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-24 grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-8 items-center">
            <div className="space-y-4 max-w-prose">
              <h2 id="jatah-title" className="font-display text-head font-bold text-ink text-balance">
                Satu angka buat hari ini, bukan sepuluh grafik.
              </h2>
              <p className="text-body text-ink">
                Uang saku dikurangi kos dan tagihan, dibagi hari yang tersisa. Itu jatahmu hari ini. Setiap kali kamu catat,
                angkanya dicetak ulang.
              </p>
              <p className="text-body text-ink">
                Kelewatan? Tidak ada alarm panik. Besok jatahnya dihitung ulang dari sisa uang bulan ini, jadi kamu tahu persis
                harus ngerem berapa.
              </p>
            </div>
            <figure className="w-full max-w-md md:justify-self-end bg-paper-sheet border-y-2 border-dashed border-ink/40 px-5 sm:px-7 py-6 space-y-4">
              <figcaption className="text-meta text-ink-soft">Contoh, tanggal 11 dengan sisa {EXAMPLE.hariLagi} hari</figcaption>
              <dl className="space-y-2">
                <ReceiptLine label="Uang saku bulan ini" amount={rupiah(EXAMPLE.uangSaku)} />
                <ReceiptLine label="Kos, listrik, kuota" amount={rupiah(-EXAMPLE.tetap)} />
                <ReceiptLine label="Sisa buat hidup" amount={rupiah(sisa)} />
                <ReceiptLine label={`Dibagi ${EXAMPLE.hariLagi} hari`} amount={`${rupiah(EXAMPLE_JATAH)} / hari`} strong />
              </dl>
              <div aria-hidden="true" className="microtext-rule" />
            </figure>
          </div>
        </section>

        {/* Three ways in; the scanner works right here too. */}
        <section aria-labelledby="cara-title" className="border-t border-ink/15">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-24 space-y-8">
            <h2 id="cara-title" className="font-display text-head font-bold text-ink max-w-2xl text-balance">
              Nyatat pas lagi bayar, pakai satu tangan.
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-3 border-t border-ink/20">
              {WAYS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="py-5 md:py-6 md:pr-8 border-b md:border-b-0 border-ink/20 md:[&:not(:first-child)]:border-l md:[&:not(:first-child)]:pl-8 space-y-2">
                  <h3 className="flex items-center gap-2 text-body font-bold text-ink">
                    <Icon className="w-5 h-5" strokeWidth={1.8} aria-hidden="true" />
                    {title}
                  </h3>
                  <p className="text-body text-ink-soft">{text}</p>
                </li>
              ))}
            </ul>
            <p className="text-body text-ink-soft">
              Mau lihat scan struk bekerja?{" "}
              <button type="button" onClick={() => setIsScannerOpen(true)} className={`${TEXT_LINK} min-h-11`}>
                Coba scan struk
              </button>
            </p>
          </div>
        </section>

        {/* Every feature, by the names the app uses. */}
        <section id="fitur" aria-labelledby="fitur-title" className="scroll-mt-20 border-t border-ink/15">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-24 space-y-10">
            <div className="space-y-3 max-w-2xl">
              <h2 id="fitur-title" className="font-display text-head font-bold text-ink text-balance">
                Dibuat buat hidup anak kost.
              </h2>
              <p className="text-body text-ink">
                Kos dan UKT, patungan sehabis makan bareng, kasbon teman, sampai godaan checkout jam dua pagi. Semuanya dicetak
                dari mesin yang sama.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-10">
              {NAV_GROUPS.filter((g) => g.id !== "account").map((group) => (
                <section key={group.id} aria-labelledby={`grup-${group.id}`} className="space-y-3">
                  <h3 id={`grup-${group.id}`} className={`text-body font-bold text-ink pb-2 border-b-[3px] ${GROUP_RULE[group.id]}`}>
                    {group.label}
                  </h3>
                  <ul className="space-y-3">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <p className="text-body font-semibold text-ink">{item.label}</p>
                        <p className="text-meta text-ink-soft">{item.desc}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </section>

        <section id="tanya" aria-labelledby="tanya-title" className="scroll-mt-20 border-t border-ink/15">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-24 space-y-6">
            <h2 id="tanya-title" className="font-display text-head font-bold text-ink">
              Yang sering ditanya
            </h2>
            <div className="border-t border-ink/20">
              {FAQ.map(({ q, a }, i) => (
                <details key={q} open={i === 0} className="group border-b border-ink/20">
                  <summary className="flex items-center justify-between gap-4 min-h-12 py-3 cursor-pointer list-none text-body font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    {q}
                    <span aria-hidden="true" className="money text-head leading-none text-ink-soft group-open:rotate-45 motion-safe:transition-transform">
                      +
                    </span>
                  </summary>
                  <p className="pb-4 text-body text-ink max-w-prose">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* The close: a blue-denomination note with the one thing to do. */}
        <section aria-labelledby="tutup-title" className="px-4 sm:px-6 pb-14 sm:pb-24">
          <div className="relative overflow-hidden max-w-6xl mx-auto bg-denom-blue text-paper-sheet dark:text-paper px-6 sm:px-12 py-12 sm:py-16">
            <Guilloche
              seed={0x2f6f}
              size={360}
              className="absolute -right-24 -top-16 sm:-right-10 !text-paper-sheet dark:!text-paper opacity-40"
            />
            <div className="relative max-w-xl space-y-5">
              <h2 id="tutup-title" className="font-display text-numeral leading-[1.05] font-bold text-balance">
                Uang saku awet sampai tanggal tua.
              </h2>
              <p className="text-body max-w-md">
                Daftar pakai email kampus atau email biasa, isi uang saku sebulan, lalu catat jajan pertamamu hari ini.
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <Link
                  href={userEmail ? "/dashboard" : "/register"}
                  className="inline-flex items-center justify-center min-h-12 px-6 rounded-full bg-paper-sheet text-ink dark:bg-paper dark:text-ink text-body font-bold hover:opacity-90 transition-opacity"
                >
                  {userEmail ? "Buka Finoch" : "Daftar gratis"}
                </Link>
                {!userEmail && (
                  <Link href="/login" className="text-body font-semibold underline underline-offset-4 hover:decoration-2">
                    Masuk
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom padding keeps the landing install banner off the last line of content. */}
      <footer className="border-t border-ink/15 pb-[calc(7rem+env(safe-area-inset-bottom))] md:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 text-body text-ink-soft">
          <div className="space-y-1 sm:mr-auto">
            <BrandLogo variant="full" className="h-6 w-auto" />
            <p className="text-meta">Finansial Anak Kost Rapi Sekali Bicara · &copy; {new Date().getFullYear()} Finoch</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <button type="button" onClick={() => setIsPrivacyOpen(true)} className="min-h-11 hover:text-ink underline-offset-4 hover:underline">
              Kebijakan privasi
            </button>
            <Link href="/login" className="inline-flex items-center min-h-11 hover:text-ink underline-offset-4 hover:underline">
              Masuk
            </Link>
            <ThemeToggle showLabel />
          </div>
        </div>
      </footer>

      <VoiceExpenseSheet isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} onExpenseSaved={() => setIsVoiceOpen(false)} />
      <ReceiptScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScanSuccess={handleOcrSuccess} />
      <UnifiedConfirmationModal
        isOpen={isConfirmModalOpen}
        candidate={currentCandidate}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => setIsConfirmModalOpen(false)}
      />
      <PrivacyDialog isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </div>
  );
}
