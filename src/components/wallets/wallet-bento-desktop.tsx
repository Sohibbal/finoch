"use client";

import React from "react";
import {
  Wallet,
  Landmark,
  Smartphone,
  ArrowRightLeft,
  Plus,
  Edit3,
  Trash2,
  AlertTriangle,
  History,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import {
  StudentWallet,
  WalletTransferRecord,
  WalletSummary,
  WalletType,
} from "@/types/wallet-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";
import { detectCriticalBalances } from "@/lib/financial/wallet-engine";

interface WalletBentoDesktopProps {
  wallets: StudentWallet[];
  summary: WalletSummary;
  transfers: WalletTransferRecord[];
  onOpenAddModal: () => void;
  onOpenTransferModal: (source?: StudentWallet) => void;
  onEditWallet: (wallet: StudentWallet) => void;
  onDeleteWallet: (id: string) => void;
}

const TYPE_ICONS: Record<WalletType, React.ElementType> = {
  cash: Wallet,
  bank: Landmark,
  ewallet: Smartphone,
};

const COLOR_GRADIENTS: Record<string, string> = {
  emerald: "from-emerald-700 via-emerald-600 to-teal-800 text-white",
  blue: "from-blue-700 via-blue-600 to-indigo-800 text-white",
  purple: "from-purple-700 via-purple-600 to-pink-800 text-white",
  amber: "from-amber-700 via-orange-600 to-amber-900 text-white",
  cyan: "from-cyan-700 via-blue-600 to-cyan-900 text-white",
};

export function WalletBentoDesktop({
  wallets,
  summary,
  transfers,
  onOpenAddModal,
  onOpenTransferModal,
  onEditWallet,
  onDeleteWallet,
}: WalletBentoDesktopProps) {
  const warnings = detectCriticalBalances(wallets);

  return (
    <div className="space-y-6">
      {/* 1. Top Summary Banner (Total Net Worth & Type Breakdown) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Net Balance */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 text-white shadow-lg border border-navy-700/60 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
              Total Likuiditas
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black tracking-tight text-white mb-1">
              {formatRupiah(summary.totalBalance)}
            </div>
            <p className="text-xs text-cream-200/70">
              Total gabungan dari {wallets.length} akun aktif
            </p>
          </div>
        </div>

        {/* Cash Balance */}
        <div className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-cream-200 dark:border-navy-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-navy-500 dark:text-cream-400 uppercase tracking-wider">
              Uang Tunai Fisik
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-navy-950 dark:text-cream-50">
              {formatRupiah(summary.cashBalance)}
            </div>
            <p className="text-[11px] text-navy-500 dark:text-cream-400 mt-1">
              Untuk warteg, parkir, dan laundry
            </p>
          </div>
        </div>

        {/* Bank Balance */}
        <div className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-cream-200 dark:border-navy-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-navy-500 dark:text-cream-400 uppercase tracking-wider">
              Rekening Bank
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-navy-950 dark:text-cream-50">
              {formatRupiah(summary.bankBalance)}
            </div>
            <p className="text-[11px] text-navy-500 dark:text-cream-400 mt-1">
              Simpanan utama & penerimaan beasiswa
            </p>
          </div>
        </div>

        {/* E-Wallet Balance */}
        <div className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-cream-200 dark:border-navy-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-navy-500 dark:text-cream-400 uppercase tracking-wider">
              Dompet Digital
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-navy-950 dark:text-cream-50">
              {formatRupiah(summary.ewalletBalance)}
            </div>
            <p className="text-[11px] text-navy-500 dark:text-cream-400 mt-1">
              GoPay, ShopeePay, DANA & OVO
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Wallet Cards Grid (Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy-950 dark:text-cream-50">
              Daftar Dompet & Rekening ({wallets.length})
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenTransferModal()}
                className="px-4 py-2 rounded-xl border border-cream-300 dark:border-navy-700 bg-white dark:bg-navy-800 text-xs font-bold text-navy-800 dark:text-cream-100 hover:bg-cream-100 dark:hover:bg-navy-700 flex items-center gap-2 shadow-sm transition-all"
              >
                <ArrowRightLeft className="w-4 h-4 text-emerald-500" />
                <span>Pindah Saldo</span>
              </button>
              <button
                onClick={onOpenAddModal}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Akun</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wallets.map((wallet) => {
              const Icon = TYPE_ICONS[wallet.type] || Wallet;
              const gradient = COLOR_GRADIENTS[wallet.color] || COLOR_GRADIENTS.emerald;
              const isCritical = wallet.balance < 20000;

              return (
                <div
                  key={wallet.id}
                  className={`rounded-3xl p-5 bg-gradient-to-br ${gradient} shadow-md relative overflow-hidden flex flex-col justify-between min-h-[190px] transition-all hover:scale-[1.01]`}
                >
                  {/* Decorative card chip & rings */}
                  <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

                  {/* Header */}
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-white">{wallet.name}</h3>
                          {wallet.isPrimary && (
                            <span className="px-2 py-0.5 rounded-full bg-white/25 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-sm">
                              Utama
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-white/75 font-medium">
                          {wallet.type === "cash"
                            ? "Uang Tunai Fisik"
                            : wallet.type === "bank"
                            ? "Rekening Bank"
                            : "E-Wallet Digital"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditWallet(wallet)}
                        className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                        title="Ubah Dompet"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus dompet "${wallet.name}"?`)) {
                            onDeleteWallet(wallet.id);
                          }
                        }}
                        className="w-8 h-8 rounded-full bg-white/15 hover:bg-rose-500/80 text-white flex items-center justify-center transition-colors"
                        title="Hapus Dompet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Saldo */}
                  <div className="my-3 relative z-10">
                    <span className="text-[10px] uppercase tracking-wider text-white/70 block">
                      Saldo Tersedia
                    </span>
                    <div className="text-2xl font-black tracking-tight text-white">
                      {formatRupiah(wallet.balance)}
                    </div>
                    {wallet.accountNumber && (
                      <span className="text-xs font-mono text-white/70 mt-0.5 block">
                        {wallet.accountNumber}
                      </span>
                    )}
                  </div>

                  {/* Footer status / quick transfer */}
                  <div className="pt-3 border-t border-white/15 flex items-center justify-between relative z-10">
                    <div className="text-[11px] text-white/80 truncate max-w-[180px]">
                      {isCritical ? (
                        <span className="text-amber-200 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-300 inline" /> Saldo Kritis (&lt; 20k)
                        </span>
                      ) : (
                        wallet.notes || "Siap digunakan"
                      )}
                    </div>
                    <button
                      onClick={() => onOpenTransferModal(wallet)}
                      className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/35 text-white text-xs font-bold flex items-center gap-1.5 transition-colors backdrop-blur-sm"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Pindah</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Warnings & Transfer History (Span 1) */}
        <div className="space-y-6">
          {/* Critical Warnings Card */}
          {warnings.length > 0 ? (
            <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>Peringatan Saldo Kritis</span>
              </div>
              <ul className="space-y-2">
                {warnings.map((warn, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-amber-900 dark:text-amber-200 bg-amber-100/50 dark:bg-amber-900/30 p-2.5 rounded-xl leading-relaxed"
                  >
                    {warn}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  Likuiditas Sehat & Aman
                </h4>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400/80">
                  Semua akun memiliki saldo di atas batas aman Rp 20.000.
                </p>
              </div>
            </div>
          )}

          {/* Transfer History Log */}
          <div className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-cream-200 dark:border-navy-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-navy-600 dark:text-cream-400" />
                <h3 className="font-bold text-sm text-navy-950 dark:text-cream-50">
                  Riwayat Pindah Saldo
                </h3>
              </div>
              <span className="text-[11px] text-navy-500 dark:text-cream-400 font-medium">
                {transfers.length} transaksi
              </span>
            </div>

            {transfers.length === 0 ? (
              <p className="text-xs text-navy-500 dark:text-cream-400 py-4 text-center">
                Belum ada mutasi perpindahan saldo.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {transfers.map((record) => (
                  <div
                    key={record.id}
                    className="p-3 rounded-2xl bg-cream-50 dark:bg-navy-800/60 border border-cream-200 dark:border-navy-700 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-navy-900 dark:text-cream-100">
                        <span>{record.fromWalletName}</span>
                        <ArrowRightLeft className="w-3 h-3 text-navy-400" />
                        <span>{record.toWalletName}</span>
                      </div>
                      <span className="font-black text-emerald-600 dark:text-emerald-400">
                        {formatRupiah(record.amount)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-navy-500 dark:text-cream-400">
                      <span>{record.reason}</span>
                      {record.adminFee > 0 && (
                        <span>Admin: {formatRupiah(record.adminFee)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
