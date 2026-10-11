"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Camera, PenLine } from "lucide-react";
import { UnifiedConfirmationModal } from "@/components/transaction/unified-confirmation-modal";
import { ReceiptScannerModal } from "@/components/transaction/receipt-scanner-modal";
import { VoiceExpenseSheet } from "@/components/expense/voice-expense-sheet";
import { OPEN_VOICE_EVENT } from "@/components/layout/app-shell";
import { mergeExpenses, toTransaction, currentMonthTransactions, dailyJatah } from "@/components/dashboard/dashboard-data";
import { JatahNote } from "@/components/dashboard/jatah-note";
import { MonthLedger } from "@/components/dashboard/month-ledger";
import { Stub, type StubData } from "@/components/press/stub";
import { StatusStamp } from "@/components/press/status-stamp";
import { localDateKey, parseDate } from "@/lib/date";
import { rupiah, shortDate } from "@/lib/format";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { getWallets } from "@/lib/storage/wallet-storage";
import { syncManager } from "@/lib/sync/sync-manager";
import type { TransactionCandidate } from "@/types/financial-types";
import { PageHeader } from "@/components/layout/page-header";
import { isDemoMode } from "@/lib/storage/local-storage";
import { loadFinancialProfile } from "@/hooks/use-financial-profile";

interface FinancialProfileSummary {
  monthlyIncome: number;
  currentSavings: number;
  monthlyFixedExpenses: number;
}

// The full history lives in Laporan; the dashboard only shows the latest few.
const RECENT_TX_LIMIT = 8;

// Used only when the profile can't be fetched (offline): never show made-up numbers.
const EMPTY_PROFILE: FinancialProfileSummary = { monthlyIncome: 0, currentSavings: 0, monthlyFixedExpenses: 0 };

/** A transaction plus what its stub prints: clock time and whether the server has it yet. */
type DashTx = TransactionCandidate & { at?: number; unsynced?: boolean };

const clock = (d: Date) => `${String(d.getHours()).padStart(2, "0")}.${String(d.getMinutes()).padStart(2, "0")}`;

const SECONDARY_ACTION =
  "inline-flex items-center gap-2 min-h-11 px-4 rounded-full border border-ink/30 text-ink text-body font-semibold hover:bg-ink/5 transition-colors";

export default function DashboardPage() {
  const router = useRouter();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState<TransactionCandidate | null>(null);
  const [isProfileChecking, setIsProfileChecking] = useState(true);

  const [loadedProfile, setLoadedProfile] = useState<FinancialProfileSummary | null>(null);
  const profile = loadedProfile ?? EMPTY_PROFILE;

  const [transactions, setTransactions] = useState<DashTx[]>([]);
  const [txLoaded, setTxLoaded] = useState(false);

  // Server rows plus local ones not synced yet, so a just-saved expense doesn't vanish until sync.
  const loadTransactions = useCallback(async () => {
    const [server, local] = await Promise.all([
      // Demo mode shows only sample data: the server holds the user's real expenses.
      isDemoMode()
        ? []
        : fetch("/api/expenses")
            .then(async (res) => (res.ok ? (await res.json()).expenses : []))
            .catch(() => []),
      expenseStorage.getExpenses().catch((err) => {
        console.warn("Could not load local expenses:", err);
        return [];
      }),
    ]);
    const merged = mergeExpenses(
      (Array.isArray(server) ? server : []).map((e) => ({ ...e, source: "manual" as const })),
      local.map((e) => ({ ...e, source: "voice" as const }))
    );
    const walletNames = new Map(getWallets().map((w) => [w.id, w.name]));
    // Demo rows never sync by design, so they are never "tertunda".
    const demo = isDemoMode();
    setTransactions(
      merged.map((e) => ({
        ...toTransaction(e, e.source),
        paymentMethod: (e.walletId && walletNames.get(e.walletId)) || undefined,
        at: parseDate(e.createdAt)?.getTime(),
        unsynced: !demo && (e.syncStatus === "pending" || e.syncStatus === "failed"),
      }))
    );
    setTxLoaded(true);
  }, []);

  // Check authentication & load profile from API
  useEffect(() => {
    let isMounted = true;

    async function initDashboard() {
      // Shared loader: one request per load, and the last good profile when offline.
      // Signed-out users never get here (middleware + app shell redirect them).
      try {
        const loaded = await loadFinancialProfile();
        if (!loaded) {
          router.push("/onboarding");
          return;
        }
        if (isMounted) {
          setLoadedProfile({
            monthlyIncome: loaded.monthlyIncome,
            currentSavings: loaded.savings,
            monthlyFixedExpenses: loaded.fixedExpenses,
          });
        }
      } catch (err) {
        console.warn("Profile fetch error:", err);
      }
      // Not reached on a redirect, so the skeleton stays up instead of flashing empty numbers.
      if (isMounted) {
        setIsProfileChecking(false);
      }

      await loadTransactions();
    }

    initDashboard();

    const unsubscribe = syncManager.subscribe((status) => {
      if (status === "synced") {
        loadTransactions();
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [router, loadTransactions]);

  useEffect(() => {
    const openVoice = () => setIsVoiceOpen(true);
    window.addEventListener(OPEN_VOICE_EVENT, openVoice);
    return () => window.removeEventListener(OPEN_VOICE_EVENT, openVoice);
  }, []);

  const todayDateStr = useMemo(() => localDateKey(new Date()), []);

  // Everything below is this local month only; undated expenses never count.
  const monthTransactions = useMemo(() => currentMonthTransactions(transactions), [transactions]);

  // The one daily number: the note, the header stamp and the stubs all read it.
  const jatah = useMemo(
    () =>
      dailyJatah({
        monthlyIncome: profile.monthlyIncome,
        monthlyFixedExpenses: profile.monthlyFixedExpenses,
        transactions,
      }),
    [profile.monthlyIncome, profile.monthlyFixedExpenses, transactions]
  );

  // Today's stubs from the one that pushed spending past the jatah onwards.
  const overJatahIds = useMemo(() => {
    const ids = new Set<string>();
    if (jatah.jatah <= 0) return ids;
    let running = 0;
    const today = transactions.filter((t) => t.date === todayDateStr).sort((x, y) => (x.at ?? 0) - (y.at ?? 0));
    for (const t of today) {
      running += t.amount;
      if (running > jatah.jatah && t.id) ids.add(t.id);
    }
    return ids;
  }, [transactions, todayDateStr, jatah.jatah]);

  // Stubs that appear after the first load slide in; the first paint never animates.
  const seenIds = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (txLoaded) seenIds.current = new Set(transactions.map((t) => t.id ?? ""));
  }, [transactions, txLoaded]);

  const recent: StubData[] = transactions.slice(0, RECENT_TX_LIMIT).map((t) => ({
    id: t.id ?? `${t.date}-${t.merchant}`,
    item: t.merchant || "Pengeluaran",
    amount: t.amount,
    date: t.date,
    category: t.category,
    wallet: t.paymentMethod,
    time: t.date === todayDateStr && t.at ? clock(new Date(t.at)) : shortDate(t.date),
    unsynced: t.unsynced,
    overJatah: Boolean(t.id && overJatahIds.has(t.id)),
  }));
  const hasUnsynced = transactions.some((t) => t.unsynced);
  const isLoading = isProfileChecking || !txLoaded;

  const handleOpenManualEntry = () => {
    setCurrentCandidate({
      merchant: "",
      amount: 0,
      category: "Food & Drinks",
      spendingType: "wants",
      date: localDateKey(new Date()),
      source: "manual",
    });
    setIsConfirmModalOpen(true);
  };

  const handleOcrCandidateReceived = (candidate: TransactionCandidate) => {
    setCurrentCandidate(candidate);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmTransaction = async (candidate: TransactionCandidate, walletId?: string) => {
    const newTx: DashTx = {
      ...candidate,
      id: candidate.id || `tx-${Date.now()}`,
      at: Date.now(),
      unsynced: true,
    };
    setTransactions((prev) => [newTx, ...prev]);
    setIsConfirmModalOpen(false);

    try {
      await expenseStorage.saveExpense({
        itemName: candidate.merchant || candidate.description || "Pengeluaran",
        amount: candidate.amount,
        category: candidate.category || "Other",
        walletId,
        createdAt: candidate.date
          ? new Date(candidate.date).toISOString()
          : new Date().toISOString(),
      });
      syncManager.triggerSync();
      await loadTransactions();
    } catch (err) {
      console.warn("Could not persist transaction:", err);
    }
  };

  return (
    <>
      <PageHeader
        title={
          <>
            <span className="sr-only">Beranda, </span>
            {shortDate(todayDateStr)}
          </>
        }
        actions={isLoading ? null : <StatusStamp status={jatah.status} />}
      />

      {/* Skeleton until the profile and expenses are known: never flash placeholder numbers */}
      {isLoading ? (
        <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6" aria-busy="true" aria-label="Memuat dashboard">
          <div className="h-[46svh] md:h-72 bg-paper-deep motion-safe:animate-pulse" />
          <div className="h-16 bg-paper-deep motion-safe:animate-pulse" />
        </main>
      ) : (
        <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-10 grid grid-cols-1 lg:grid-cols-3 gap-x-10 gap-y-8">
          <div className="lg:col-span-2 space-y-4 md:space-y-14">
            <JatahNote
              jatah={jatah}
              today={todayDateStr}
              turn={transactions.length * 7}
              onCatat={() => setIsVoiceOpen(true)}
            />
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setIsScannerOpen(true)} className={SECONDARY_ACTION}>
                <Camera className="w-4 h-4" aria-hidden="true" />
                Scan struk
              </button>
              <button type="button" onClick={handleOpenManualEntry} className={SECONDARY_ACTION}>
                <PenLine className="w-4 h-4" aria-hidden="true" />
                Ketik manual
              </button>
            </div>
            <div className="hidden lg:block">
              <MonthLedger monthTransactions={monthTransactions} />
            </div>
          </div>

          <section aria-labelledby="stubs-title" className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-ink/20 pb-2">
              <h2 id="stubs-title" className="font-display text-head font-bold text-ink">
                Catatan terbaru
              </h2>
              <p className="text-meta text-ink-soft">
                Terpakai hari ini <span className="money text-body font-bold text-ink">{rupiah(jatah.spentToday)}</span>
              </p>
            </div>
            {hasUnsynced && <StatusStamp status="tertunda" />}

            {recent.length === 0 ? (
              <div className="py-4 space-y-2">
                <p className="text-body font-semibold text-ink">Belum ada catatan.</p>
                <p className="text-body text-ink-soft max-w-prose">
                  Tekan <span className="font-semibold text-ink">Catat</span>, lalu bilang &ldquo;warteg 15 ribu&rdquo;. Bisa juga
                  scan struk atau ketik manual.
                </p>
              </div>
            ) : (
              <>
                <ol className="space-y-2">
                  {recent.map((stub) => (
                    <Stub
                      key={stub.id}
                      data={stub}
                      className={seenIds.current && !seenIds.current.has(stub.id) ? "animate-stub-in" : ""}
                    />
                  ))}
                </ol>
                <Link
                  href="/reports"
                  className="inline-flex items-center min-h-11 text-body font-semibold text-ink underline underline-offset-4 decoration-ink/40 hover:decoration-ink"
                >
                  {transactions.length > RECENT_TX_LIMIT
                    ? `Lihat semua ${transactions.length} catatan di Laporan`
                    : "Riwayat lengkap di Laporan"}
                </Link>
              </>
            )}
          </section>

          {/* Phones read the ledger after the stubs; desktop keeps it under the note. */}
          <div className="lg:hidden">
            <MonthLedger monthTransactions={monthTransactions} />
          </div>
        </main>
      )}

      {/* Voice Expense Sheet */}
      <VoiceExpenseSheet
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onExpenseSaved={() => {
          setIsVoiceOpen(false);
          loadTransactions();
        }}
      />

      {/* Hybrid Receipt Scanner Modal */}
      <ReceiptScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleOcrCandidateReceived}
      />

      {/* Unified Confirmation Modal */}
      <UnifiedConfirmationModal
        isOpen={isConfirmModalOpen}
        candidate={currentCandidate}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmTransaction}
      />
    </>
  );
}
