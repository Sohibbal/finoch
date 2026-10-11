"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  Bot,
  Plus,
  Sparkles,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { rupiah, shortDate } from "@/lib/format";
import { localDateKey } from "@/lib/date";
import { useAuthContext } from "@/components/layout/auth-provider";
import { getTransactions, type LocalTransaction } from "@/lib/storage/transaction-storage";
import { getWishlistItems, type LocalWishlist } from "@/lib/storage/wishlist-storage";
import { calculateStreakMetrics } from "@/lib/financial/streak-engine";
import { generateDailyGenZInsight } from "@/lib/financial/genz-insight-engine";
import { calculateWishlistProjection } from "@/lib/financial/wishlist-engine";
import { GenZInsightCard } from "@/components/dashboard/genz-insight-card";
import { StreakWidget } from "@/components/dashboard/streak-widget";

export default function DashboardPage() {
  const { user } = useAuthContext();
  const [nickname, setNickname] = useState("Kawan");
  const [transactions, setTransactions] = useState<LocalTransaction[]>([]);
  const [wishlists, setWishlists] = useState<LocalWishlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load nickname from local storage or profile
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("finoch_user_nickname");
      if (stored && stored.trim()) {
        setNickname(stored.trim());
      } else if (user?.email) {
        setNickname(user.email.split("@")[0]);
      }
    }
  }, [user]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [txData, wData] = await Promise.all([
        getTransactions(),
        getWishlistItems(),
      ]);
      setTransactions(txData);
      setWishlists(wData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute Financial Aggregates
  const financialData = useMemo(() => {
    let income = 0;
    let expense = 0;
    const todayKey = localDateKey(new Date());
    let todaySpent = 0;

    const streakCandidates = [];

    for (const tx of transactions) {
      if (tx.type === "income") {
        income += tx.amount;
      } else if (tx.type === "expense") {
        expense += tx.amount;
        streakCandidates.push({
          id: tx.id,
          itemName: tx.itemName,
          amount: tx.amount,
          category: tx.category,
          createdAt: tx.transactionDate,
        });

        if (tx.transactionDate.startsWith(todayKey)) {
          todaySpent += tx.amount;
        }
      }
    }

    const netBalance = income - expense;
    // Default standard allowance: Rp50.000 / day
    const dailyAllowance = 50000;

    const streakSummary = calculateStreakMetrics(streakCandidates, dailyAllowance);

    const activeWishlists = wishlists.filter((w) => !w.isAchieved);
    const topWishlist = activeWishlists[0] || null;

    const insight = generateDailyGenZInsight({
      nickname,
      todaySpent,
      dailyAllowance,
      topWishlistName: topWishlist?.name,
      streakDays: streakSummary.currentStreak,
    });

    const recentTx = transactions.slice(0, 5);

    return {
      income,
      expense,
      netBalance,
      todaySpent,
      dailyAllowance,
      streakDays: streakSummary.currentStreak,
      topWishlist,
      insight,
      recentTx,
    };
  }, [transactions, wishlists, nickname]);

  const topProjection = useMemo(() => {
    if (!financialData.topWishlist) return null;
    const net = Math.max(0, financialData.netBalance);
    const dailyRate = Math.max(0, Math.round(net / 30)) || 25000;
    return calculateWishlistProjection(
      financialData.topWishlist.targetPrice,
      net,
      dailyRate
    );
  }, [financialData.topWishlist, financialData.netBalance]);

  return (
    <>
      <PageHeader
        title={`Halo, ${nickname}! 👋`}
        subtitle="Dashboard finansial santai buat kawal masa depan lo."
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Gen-Z Daily Insight Card */}
        <GenZInsightCard nickname={nickname} insight={financialData.insight} />

        {/* Financial Metrics & Streak Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Financial Balance Card */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-paper-sheet dark:bg-navy-900 border border-ink/15 dark:border-navy-800 shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <p className="text-meta font-medium text-ink-soft dark:text-navy-400">
                Saldo Bersih Akumulasi
              </p>
              <h2 className="text-display font-extrabold text-ink dark:text-white money mt-1">
                {rupiah(financialData.netBalance)}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-ink/10 dark:border-navy-800">
              <div className="space-y-1">
                <span className="text-meta font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Total Pemasukan</span>
                </span>
                <p className="text-head font-bold text-ink dark:text-white money">
                  +{rupiah(financialData.income)}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-meta font-semibold text-rose-500 flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Total Pengeluaran</span>
                </span>
                <p className="text-head font-bold text-ink dark:text-white money">
                  -{rupiah(financialData.expense)}
                </p>
              </div>
            </div>
          </div>

          {/* Streak Widget */}
          <div className="lg:col-span-1">
            <StreakWidget
              streakDays={financialData.streakDays}
              dailyAllowance={financialData.dailyAllowance}
              todaySpent={financialData.todaySpent}
            />
          </div>
        </div>

        {/* Quick Actions & Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/pemasukan"
            className="p-5 rounded-2xl bg-paper-sheet dark:bg-navy-900 border border-ink/15 dark:border-navy-800 hover:border-emerald-500/50 shadow-sm hover:shadow transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <h4 className="text-body font-bold text-ink dark:text-white">Pemasukan</h4>
            <p className="text-meta text-ink-soft dark:text-navy-400 mt-0.5">Bicara, Scan, Manual</p>
          </Link>

          <Link
            href="/pengeluaran"
            className="p-5 rounded-2xl bg-paper-sheet dark:bg-navy-900 border border-ink/15 dark:border-navy-800 hover:border-rose-500/50 shadow-sm hover:shadow transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <h4 className="text-body font-bold text-ink dark:text-white">Pengeluaran</h4>
            <p className="text-meta text-ink-soft dark:text-navy-400 mt-0.5">Bicara, Scan, Manual</p>
          </Link>

          <Link
            href="/wishlist"
            className="p-5 rounded-2xl bg-paper-sheet dark:bg-navy-900 border border-ink/15 dark:border-navy-800 hover:border-amber-500/50 shadow-sm hover:shadow transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Gift className="w-5 h-5" />
            </div>
            <h4 className="text-body font-bold text-ink dark:text-white">Wishlist</h4>
            <p className="text-meta text-ink-soft dark:text-navy-400 mt-0.5">Target & Proyeksi</p>
          </Link>

          <Link
            href="/copilot"
            className="p-5 rounded-2xl bg-paper-sheet dark:bg-navy-900 border border-ink/15 dark:border-navy-800 hover:border-primary-500/50 shadow-sm hover:shadow transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Bot className="w-5 h-5" />
            </div>
            <h4 className="text-body font-bold text-ink dark:text-white">FinBot Copilot</h4>
            <p className="text-meta text-ink-soft dark:text-navy-400 mt-0.5">Tanya Finansial Lo</p>
          </Link>
        </div>

        {/* Bottom Split: Recent Transactions & Wishlist Spotlight */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity List */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-paper-sheet dark:bg-navy-900 border border-ink/15 dark:border-navy-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-head font-bold text-ink dark:text-white">
                Aktivitas Transaksi Terakhir
              </h3>
              <Link
                href="/pengeluaran"
                className="text-meta font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {financialData.recentTx.length === 0 ? (
              <div className="py-8 text-center text-ink-soft dark:text-navy-400">
                <p className="text-body font-medium">Belum ada transaksi tercatat</p>
                <p className="text-meta mt-1">
                  Mulai catat lewat tombol Pemasukan atau Pengeluaran di atas!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-ink/10 dark:divide-navy-800">
                {financialData.recentTx.map((tx) => {
                  const isInc = tx.type === "income";
                  return (
                    <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isInc
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {isInc ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-body font-semibold text-ink dark:text-white">
                            {tx.itemName}
                          </p>
                          <p className="text-meta text-ink-soft dark:text-navy-400">
                            {tx.category} • {shortDate(tx.transactionDate)}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-body font-bold money ${
                          isInc
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-ink dark:text-white"
                        }`}
                      >
                        {isInc ? "+" : "-"}
                        {rupiah(tx.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Wishlist Highlight Card */}
          <div className="lg:col-span-1 p-6 rounded-3xl bg-paper-sheet dark:bg-navy-900 border border-ink/15 dark:border-navy-800 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-5 h-5 text-amber-500" />
                <h3 className="text-body font-bold text-ink dark:text-white">
                  Wishlist Prioritas Utama
                </h3>
              </div>

              {financialData.topWishlist ? (
                <div className="space-y-3">
                  <div>
                    <h4 className="text-head font-bold text-ink dark:text-white">
                      {financialData.topWishlist.name}
                    </h4>
                    <p className="text-display font-extrabold text-ink dark:text-white money mt-1">
                      {rupiah(financialData.topWishlist.targetPrice)}
                    </p>
                  </div>

                  {topProjection && (
                    <div className="p-3 rounded-2xl bg-ink/5 dark:bg-navy-800 text-meta space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-ink dark:text-white">
                        <Calendar className="w-4 h-4 text-primary-500" />
                        <span>
                          {topProjection.status === "achievable_now"
                            ? "Tabungan Sudah Cukup! 🎉"
                            : topProjection.status === "delayed"
                            ? "Tertunda (Rem Belanja Dulu) ⏳"
                            : `Estimasi ~${topProjection.estimatedDays} hari lagi 🎯`}
                        </span>
                      </div>
                      <p className="text-ink-soft dark:text-navy-400">
                        {topProjection.status === "delayed"
                          ? "Pengeluaran melebihi laju tabungan"
                          : "Berdasarkan sisa saldo dan laju tabungan harian"}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-6 text-center text-ink-soft dark:text-navy-400 space-y-2">
                  <p className="text-body font-medium">Belum ada target wishlist</p>
                  <p className="text-meta">
                    Catat barang impian lo biar FinBot bantu hitung target ketercapaiannya!
                  </p>
                </div>
              )}
            </div>

            <Link
              href="/wishlist"
              className="w-full py-2.5 rounded-xl border border-ink/15 dark:border-navy-700 text-center text-meta font-semibold text-ink dark:text-white hover:bg-ink/5 dark:hover:bg-navy-800 transition-colors block"
            >
              Buka Wishlist
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
