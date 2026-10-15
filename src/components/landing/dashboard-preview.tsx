"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
  Coins,
  Gift,
  Bot,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { rupiah } from "@/lib/format";
import { CategoryPieChart, type CategoryDataPoint } from "@/components/dashboard/category-pie-chart";
import { TransactionBarChart } from "@/components/dashboard/transaction-bar-chart";
import type { LocalTransaction } from "@/lib/storage/transaction-storage";

const DEMO_INCOME_CATEGORIES: CategoryDataPoint[] = [
  { category: "Gaji Pokok", amount: 3500000, count: 1 },
  { category: "Uang Saku", amount: 1500000, count: 1 },
  { category: "Freelance", amount: 500000, count: 1 },
];

const DEMO_EXPENSE_CATEGORIES: CategoryDataPoint[] = [
  { category: "Makanan & Minuman", amount: 850000, count: 8 },
  { category: "Transportasi", amount: 350000, count: 4 },
  { category: "Belanja Kebutuhan", amount: 250000, count: 2 },
  { category: "Tagihan & Wifi", amount: 200000, count: 1 },
];

const DEMO_TX = [
  {
    id: "tx-demo-1",
    itemName: "Ayam Geprek + Es Teh",
    date: "Hari Ini",
    source: "Input Suara",
    category: "Makanan & Minuman",
    amount: 22000,
    type: "expense" as const,
  },
  {
    id: "tx-demo-2",
    itemName: "Kopi Susu Gula Aren",
    date: "Hari Ini",
    source: "Scan Struk",
    category: "Makanan & Minuman",
    amount: 18000,
    type: "expense" as const,
  },
  {
    id: "tx-demo-3",
    itemName: "Buku Catatan Keuangan",
    date: "Kemarin",
    source: "Manual",
    category: "Pendidikan",
    amount: 35000,
    type: "expense" as const,
  },
  {
    id: "tx-demo-4",
    itemName: "Transfer Uang Saku Bulanan",
    date: "01 Okt",
    source: "Transfer Bank",
    category: "Gaji Pokok",
    amount: 5500000,
    type: "income" as const,
  },
  {
    id: "tx-demo-5",
    itemName: "Wifi & Paket Internet",
    date: "02 Okt",
    source: "Manual",
    category: "Tagihan & Wifi",
    amount: 200000,
    type: "expense" as const,
  },
  {
    id: "tx-demo-6",
    itemName: "Belanja Kebutuhan Harian",
    date: "03 Okt",
    source: "Scan Struk",
    category: "Belanja Kebutuhan",
    amount: 250000,
    type: "expense" as const,
  },
  {
    id: "tx-demo-7",
    itemName: "Bensin Motor & Parkir",
    date: "05 Okt",
    source: "Input Suara",
    category: "Transportasi",
    amount: 35000,
    type: "expense" as const,
  },
  {
    id: "tx-demo-8",
    itemName: "Makan Siang Nasi Padang",
    date: "06 Okt",
    source: "Manual",
    category: "Makanan & Minuman",
    amount: 24000,
    type: "expense" as const,
  },
  {
    id: "tx-demo-9",
    itemName: "Reward Freelance Desain",
    date: "08 Okt",
    source: "Transfer Bank",
    category: "Freelance",
    amount: 500000,
    type: "income" as const,
  },
  {
    id: "tx-demo-10",
    itemName: "Ojek Online ke Kampus",
    date: "09 Okt",
    source: "Input Suara",
    category: "Transportasi",
    amount: 14000,
    type: "expense" as const,
  },
];

const DEMO_TRANSACTIONS: LocalTransaction[] = [
  // Current month (Okt 2026)
  {
    id: "tx-demo-1",
    userId: "demo@finoch.id",
    type: "expense",
    itemName: "Ayam Geprek + Es Teh",
    amount: 22000,
    category: "Makanan & Minuman",
    source: "voice",
    transactionDate: "2026-10-14T12:30:00.000Z",
    isDeleted: false,
    createdAt: "2026-10-14T12:30:00.000Z",
    updatedAt: "2026-10-14T12:30:00.000Z",
  },
  {
    id: "tx-demo-2",
    userId: "demo@finoch.id",
    type: "expense",
    itemName: "Kopi Susu Gula Aren",
    amount: 18000,
    category: "Makanan & Minuman",
    source: "ocr",
    transactionDate: "2026-10-14T09:15:00.000Z",
    isDeleted: false,
    createdAt: "2026-10-14T09:15:00.000Z",
    updatedAt: "2026-10-14T09:15:00.000Z",
  },
  {
    id: "tx-demo-3",
    userId: "demo@finoch.id",
    type: "expense",
    itemName: "Buku Catatan Keuangan",
    amount: 35000,
    category: "Pendidikan",
    source: "manual",
    transactionDate: "2026-10-13T15:00:00.000Z",
    isDeleted: false,
    createdAt: "2026-10-13T15:00:00.000Z",
    updatedAt: "2026-10-13T15:00:00.000Z",
  },
  {
    id: "tx-demo-4",
    userId: "demo@finoch.id",
    type: "income",
    itemName: "Transfer Uang Saku Bulanan",
    amount: 5500000,
    category: "Gaji Pokok",
    source: "manual",
    transactionDate: "2026-10-01T08:00:00.000Z",
    isDeleted: false,
    createdAt: "2026-10-01T08:00:00.000Z",
    updatedAt: "2026-10-01T08:00:00.000Z",
  },
  {
    id: "tx-demo-5",
    userId: "demo@finoch.id",
    type: "expense",
    itemName: "Wifi & Paket Internet",
    amount: 200000,
    category: "Tagihan & Wifi",
    source: "manual",
    transactionDate: "2026-10-05T10:00:00.000Z",
    isDeleted: false,
    createdAt: "2026-10-05T10:00:00.000Z",
    updatedAt: "2026-10-05T10:00:00.000Z",
  },
  {
    id: "tx-demo-6",
    userId: "demo@finoch.id",
    type: "expense",
    itemName: "Belanja Kebutuhan Harian",
    amount: 250000,
    category: "Belanja Kebutuhan",
    source: "ocr",
    transactionDate: "2026-10-08T16:20:00.000Z",
    isDeleted: false,
    createdAt: "2026-10-08T16:20:00.000Z",
    updatedAt: "2026-10-08T16:20:00.000Z",
  },
  {
    id: "tx-demo-7",
    userId: "demo@finoch.id",
    type: "expense",
    itemName: "Bensin Motor & Parkir",
    amount: 350000,
    category: "Transportasi",
    source: "voice",
    transactionDate: "2026-10-10T11:00:00.000Z",
    isDeleted: false,
    createdAt: "2026-10-10T11:00:00.000Z",
    updatedAt: "2026-10-10T11:00:00.000Z",
  },
  {
    id: "tx-demo-8",
    userId: "demo@finoch.id",
    type: "expense",
    itemName: "Makan Siang & Jajan Mingguan",
    amount: 775000,
    category: "Makanan & Minuman",
    source: "manual",
    transactionDate: "2026-10-11T19:00:00.000Z",
    isDeleted: false,
    createdAt: "2026-10-11T19:00:00.000Z",
    updatedAt: "2026-10-11T19:00:00.000Z",
  },
  // Historical 2026 months for 12-Month Bar Chart
  {
    id: "tx-demo-m1",
    userId: "demo@finoch.id",
    type: "expense",
    itemName: "Pengeluaran Januari",
    amount: 1450000,
    category: "Makanan & Minuman",
    source: "manual",
    transactionDate: "2026-01-15T12:00:00.000Z",
    isDeleted: false,
    createdAt: "2026-01-15T12:00:00.000Z",
    updatedAt: "2026-01-15T12:00:00.000Z",
  },
  {
    id: "tx-demo-m2",
    userId: "demo@finoch.id",
    type: "expense",
    itemName: "Pengeluaran Februari",
    amount: 1620000,
    category: "Makanan & Minuman",
    source: "manual",
    transactionDate: "2026-02-15T12:00:00.000Z",
    isDeleted: false,
    createdAt: "2026-02-15T12:00:00.000Z",
    updatedAt: "2026-02-15T12:00:00.000Z",
  },
  {
    id: "tx-demo-m3",
    userId: "demo@finoch.id",
    type: "expense",
    itemName: "Pengeluaran Maret",
    amount: 1380000,
    category: "Makanan & Minuman",
    source: "manual",
    transactionDate: "2026-03-15T12:00:00.000Z",
    isDeleted: false,
    createdAt: "2026-03-15T12:00:00.000Z",
    updatedAt: "2026-03-15T12:00:00.000Z",
  },
  {
    id: "tx-demo-m4",
    userId: "demo@finoch.id",
    type: "expense",
    itemName: "Pengeluaran April",
    amount: 1850000,
    category: "Belanja Kebutuhan",
    source: "manual",
    transactionDate: "2026-04-15T12:00:00.000Z",
    isDeleted: false,
    createdAt: "2026-04-15T12:00:00.000Z",
    updatedAt: "2026-04-15T12:00:00.000Z",
  },
  {
    id: "tx-demo-m5",
    userId: "demo@finoch.id",
    type: "expense",
    itemName: "Pengeluaran Mei",
    amount: 1540000,
    category: "Makanan & Minuman",
    source: "manual",
    transactionDate: "2026-05-15T12:00:00.000Z",
    isDeleted: false,
    createdAt: "2026-05-15T12:00:00.000Z",
    updatedAt: "2026-05-15T12:00:00.000Z",
  },
  {
    id: "tx-demo-m6",
    userId: "demo@finoch.id",
    type: "expense",
    itemName: "Pengeluaran Juni",
    amount: 1720000,
    category: "Transportasi",
    source: "manual",
    transactionDate: "2026-06-15T12:00:00.000Z",
    isDeleted: false,
    createdAt: "2026-06-15T12:00:00.000Z",
    updatedAt: "2026-06-15T12:00:00.000Z",
  },
  {
    id: "tx-demo-m7",
    userId: "demo@finoch.id",
    type: "expense",
    itemName: "Pengeluaran Juli",
    amount: 1490000,
    category: "Makanan & Minuman",
    source: "manual",
    transactionDate: "2026-07-15T12:00:00.000Z",
    isDeleted: false,
    createdAt: "2026-07-15T12:00:00.000Z",
    updatedAt: "2026-07-15T12:00:00.000Z",
  },
  {
    id: "tx-demo-m8",
    userId: "demo@finoch.id",
    type: "expense",
    itemName: "Pengeluaran Agustus",
    amount: 1680000,
    category: "Makanan & Minuman",
    source: "manual",
    transactionDate: "2026-08-15T12:00:00.000Z",
    isDeleted: false,
    createdAt: "2026-08-15T12:00:00.000Z",
    updatedAt: "2026-08-15T12:00:00.000Z",
  },
  {
    id: "tx-demo-m9",
    userId: "demo@finoch.id",
    type: "expense",
    itemName: "Pengeluaran September",
    amount: 1590000,
    category: "Makanan & Minuman",
    source: "manual",
    transactionDate: "2026-09-15T12:00:00.000Z",
    isDeleted: false,
    createdAt: "2026-09-15T12:00:00.000Z",
    updatedAt: "2026-09-15T12:00:00.000Z",
  },
];

export function DashboardPreview() {
  const [saldoFilter, setSaldoFilter] = useState<"all" | "month">("all");

  const displayBalance = 3850000;
  const displayIncome = 5500000;
  const displayExpense = 1650000;
  const dailyAllowance = 150000;
  const todaySpent = 45000;
  const remainingAllowance = dailyAllowance - todaySpent;

  return (
    <section id="demo" className="scroll-mt-28 space-y-6 sm:space-y-8">
      {/* Section Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Simulasi Data Akun Demo (demo@finoch.id)</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
            Preview Dashboard Finansial Finoch
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Lihat bagaimana seluruh arus kas, kontrol plafon jatah harian, evaluasi FinBot, dan tabungan wishlist menyatu rapi dalam satu layar interaktif.
          </p>
        </div>
      </div>

      {/* Outer ambient container matching real Dashboard floating canvas */}
      <div className="w-full rounded-2xl bg-[#eaf0fd] dark:bg-[#0B101D] border border-blue-200/60 dark:border-slate-800/80 shadow-2xl p-4 sm:p-6 lg:p-7 space-y-6">
        
        {/* ROW 1: FinBot Daily Insight (Matches GenZInsightCard in Dashboard) */}
        <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl border shadow-xs transition-all glass-sheen min-h-[160px] flex flex-row items-stretch bg-emerald-500/[0.04] dark:bg-emerald-950/20 border-emerald-300/70 dark:border-emerald-800/60">
          {/* SISI KIRI: FinBot Logo Emblem */}
          <div className="w-24 sm:w-32 shrink-0 self-stretch flex items-center justify-center border-r border-emerald-200/70 dark:border-emerald-800/70 bg-emerald-50/50 dark:bg-slate-800/30 relative z-10 p-3 sm:p-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center finbot-fade-loop select-none">
              <div className="absolute inset-0 rounded-2xl blur-lg opacity-40 dark:opacity-50 transition-colors bg-[#059669]" />
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-700/80 shadow-md flex items-center justify-center">
                <Bot className="w-8 h-8 sm:w-9 sm:h-9 text-[#059669]" strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* SISI KANAN: Konten Insight */}
          <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between min-w-0 relative z-10 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-slate-900/5 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>FinBot Daily Insight</span>
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                Kondisi Terkendali
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 font-medium leading-relaxed">
              &ldquo;Gokil Kawan! Pengeluaran hari ini masih aman banget, baru kepake <strong className="font-bold text-slate-900 dark:text-white">Rp45.000</strong> dari jatah <strong className="font-bold text-slate-900 dark:text-white">Rp150.000</strong>. Sisa Rp105.000 aman buat ditabung ke Wishlist Mechanical Keyboard!&rdquo;
            </p>

            <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1">
              <span>Status: 100% Berdasarkan fakta riil akun demo</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Streak: 7 Hari</span>
            </div>
          </div>
        </div>

        {/* Main 2-Column Split: Sisi Kiri (8 cols) & Sisi Kanan (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* SISI KIRI (lg:col-span-8 space-y-6) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* BARIS METRIK: Saldo Bersih & Total Pemasukan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* CARD 1: Saldo Bersih */}
              <div className="rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 glass-sheen relative overflow-hidden group min-h-[178px]">
                <Wallet
                  className="absolute -right-3 -bottom-3 w-28 h-28 text-blue-500/5 dark:text-blue-400/5 pointer-events-none select-none transition-transform group-hover:scale-105"
                  strokeWidth={1.5}
                />

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Saldo Bersih
                    </h3>
                  </div>

                  <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setSaldoFilter("all")}
                      className={`px-2.5 py-0.5 rounded-lg transition-colors ${
                        saldoFilter === "all"
                          ? "bg-white dark:bg-[#1E293B] text-blue-600 dark:text-blue-400 shadow-xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      Semua
                    </button>
                    <button
                      type="button"
                      onClick={() => setSaldoFilter("month")}
                      className={`px-2.5 py-0.5 rounded-lg transition-colors ${
                        saldoFilter === "month"
                          ? "bg-white dark:bg-[#1E293B] text-blue-600 dark:text-blue-400 shadow-xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      Bulan Ini
                    </button>
                  </div>
                </div>

                <div className="space-y-1 relative z-10">
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight money text-slate-900 dark:text-white text-numeral">
                    {rupiah(displayBalance)}
                  </h2>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <span className="text-emerald-600 dark:text-emerald-400">+{rupiah(displayIncome)}</span>
                    <span>·</span>
                    <span className="text-rose-500">-{rupiah(displayExpense)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
                  <span>Status Cashflow:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Surplus Sehat
                  </span>
                </div>
              </div>

              {/* CARD 2: Total Pemasukan */}
              <div className="rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 glass-sheen relative overflow-hidden group min-h-[178px]">
                <ArrowDownLeft
                  className="absolute -right-3 -bottom-3 w-28 h-28 text-emerald-500/5 dark:text-emerald-400/5 pointer-events-none select-none transition-transform group-hover:scale-105"
                  strokeWidth={1.5}
                />

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Total Pemasukan
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Bulan Ini
                  </span>
                </div>

                <div className="space-y-1 relative z-10">
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight money text-emerald-600 dark:text-emerald-400 text-numeral">
                    +{rupiah(displayIncome)}
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Gaji &amp; Uang Saku Bulanan
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
                  <span>Frekuensi:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    2 Transaksi Terverifikasi
                  </span>
                </div>
              </div>
            </div>

            {/* CARD 3: Tren Transaksi Bulanan & Tahunan (TransactionBarChart - Di Atas Riwayat Transaksi) */}
            <TransactionBarChart transactions={DEMO_TRANSACTIONS} />

            {/* CARD 4: Riwayat Transaksi Terbaru (Matches Dashboard Transactions List) */}
            <div className="rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4 glass-sheen relative overflow-hidden">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Riwayat Transaksi Terbaru (Akun Demo)
                  </h3>
                </div>
                <Link
                  href="/pengeluaran"
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Lihat Seluruh Riwayat</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Transactions List */}
              <div className="space-y-2.5 relative z-10">
                {DEMO_TX.map((tx) => {
                  const isInc = tx.type === "income";
                  return (
                    <div
                      key={tx.id}
                      className="rounded-2xl border border-slate-100 dark:border-slate-800/80 p-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 sm:max-w-[45%]">
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
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                            {tx.itemName}
                          </p>
                          <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500">
                            {tx.date} · {tx.source}
                          </p>
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center justify-center flex-1">
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium inline-flex items-center gap-1.5 ${
                            isInc
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isInc ? "bg-emerald-500" : "bg-rose-500"}`} />
                          <span>{tx.category}</span>
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-xs sm:text-sm font-bold money ${
                            isInc
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {isInc ? "+" : "-"}
                          {rupiah(tx.amount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 relative z-10">
                <span className="text-[11px] text-slate-400">
                  Menampilkan 10 transaksi akun demo tersinkron lokal
                </span>
              </div>
            </div>
          </div>

          {/* SISI KANAN (lg:col-span-4 space-y-6) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* CARD 5: Total Pengeluaran */}
            <div className="rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 glass-sheen relative overflow-hidden group min-h-[178px]">
              <ArrowDownRight
                className="absolute -right-3 -bottom-3 w-28 h-28 text-rose-500/10 dark:text-rose-400/10 pointer-events-none select-none transition-transform group-hover:scale-105"
                strokeWidth={1.5}
              />

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Total Pengeluaran
                  </h3>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  Bulan Ini
                </span>
              </div>

              <div className="space-y-1 relative z-10">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight money text-rose-600 dark:text-rose-400 text-numeral">
                  -{rupiah(displayExpense)}
                </h2>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">
                    Hari Ini
                  </span>
                  <span className="text-slate-400 font-normal">
                    {rupiah(todaySpent)} terpakai
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
                <span>Efisiensi:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Terkendali Aman
                </span>
              </div>
            </div>

            {/* CARD 6: Status Jatah Harian (Daily Allowance Donut Ring) */}
            <div className="rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 glass-sheen relative overflow-hidden group">
              <Coins
                className="absolute -right-3 -bottom-3 w-28 h-28 text-teal-500/5 dark:text-teal-400/5 pointer-events-none select-none transition-transform group-hover:scale-105"
                strokeWidth={1.5}
              />

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Status Jatah Harian
                  </h3>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                  70% Aman
                </span>
              </div>

              {/* Donut Chart SVG */}
              <div className="flex flex-col items-center justify-center relative py-1 z-10">
                <div className="relative w-40 h-40 sm:w-44 sm:h-44 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                    <circle
                      cx="80"
                      cy="80"
                      r="64"
                      stroke="currentColor"
                      strokeWidth="11"
                      fill="transparent"
                      className="text-slate-100 dark:text-slate-800"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="64"
                      stroke="#14B8A6"
                      strokeWidth="11"
                      strokeDasharray="402.12"
                      strokeDashoffset="120.6"
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight money text-slate-900 dark:text-white">
                      {rupiah(remainingAllowance)}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      Tersisa dari {rupiah(dailyAllowance)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
                <span>Plafon: {rupiah(dailyAllowance)}/hari</span>
                <span className="font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Disiplin
                </span>
              </div>
            </div>

            {/* CARD 7: Top 3 Wishlist Impian */}
            <div className="rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-3.5 glass-sheen relative overflow-hidden group">
              <Gift
                className="absolute -right-3 -bottom-3 w-28 h-28 text-amber-500/5 dark:text-amber-400/5 pointer-events-none select-none transition-transform group-hover:scale-105"
                strokeWidth={1.5}
              />

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Top 3 Wishlist Impian
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                  Alokasi: 20% Jatah
                </span>
              </div>

              <div className="space-y-2.5 relative z-10">
                {/* Wishlist Item 1 */}
                <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] flex items-center justify-center shrink-0">
                        #1
                      </span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        Mechanical Keyboard
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 whitespace-nowrap bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                      ~9 hari
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="money font-semibold text-slate-700 dark:text-slate-300">
                      Rp450.000
                    </span>
                    <span className="text-[10px]">
                      Rp315.000 (70%)
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-700/80 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-blue-500"
                      style={{ width: "70%" }}
                    />
                  </div>
                </div>

                {/* Wishlist Item 2 */}
                <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] flex items-center justify-center shrink-0">
                        #2
                      </span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        TWS Noise Cancelling
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 whitespace-nowrap bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                      ~15 hari
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="money font-semibold text-slate-700 dark:text-slate-300">
                      Rp350.000
                    </span>
                    <span className="text-[10px]">
                      Rp140.000 (40%)
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-700/80 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-blue-500"
                      style={{ width: "40%" }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
                <span>Tabungan Otomatis:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  +Rp30.000/hari
                </span>
              </div>
            </div>

            {/* CARD 8: Pemasukan per Kategori (Di bawah Wishlist) */}
            <CategoryPieChart
              title="Pemasukan per Kategori"
              subtitle="Distribusi sumber pendapatan"
              data={DEMO_INCOME_CATEGORIES}
              type="income"
              compact={true}
            />

            {/* CARD 9: Pengeluaran per Kategori (Di bawah Wishlist & Pemasukan) */}
            <CategoryPieChart
              title="Pengeluaran per Kategori"
              subtitle="Distribusi pos belanja bulanan"
              data={DEMO_EXPENSE_CATEGORIES}
              type="expense"
              compact={true}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
