"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  ArrowLeft,
  ArrowRightLeft,
  Plus,
  Landmark,
  Smartphone,
  CreditCard,
  AlertTriangle,
  Layers,
} from "lucide-react";
import {
  StudentWallet,
  WalletSummary,
  WalletTransferRecord,
  WalletType,
} from "@/types/wallet-types";
import {
  getWallets,
  addWallet,
  updateWallet,
  deleteWallet,
  transferWalletFunds,
  getWalletTransferHistory,
  getWalletSummary,
} from "@/lib/storage/wallet-storage";
import { detectCriticalBalances } from "@/lib/financial/wallet-engine";
import { formatRupiah } from "@/lib/financial/split-bill-engine";
import { useAuth } from "@/hooks/use-auth";

import Link from "next/link";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BrandLogo } from "@/components/brand/brand-logo";

import { WalletCardMobile } from "@/components/wallets/wallet-card-mobile";
import { WalletBentoDesktop } from "@/components/wallets/wallet-bento-desktop";
import { WalletFormModal } from "@/components/wallets/wallet-form-modal";
import { WalletTransferModal } from "@/components/wallets/wallet-transfer-modal";

export default function WalletsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [wallets, setWallets] = useState<StudentWallet[]>([]);
  const [transfers, setTransfers] = useState<WalletTransferRecord[]>([]);
  const [filterType, setFilterType] = useState<"all" | WalletType>("all");

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<StudentWallet | null>(null);

  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferSourceWallet, setTransferSourceWallet] = useState<StudentWallet | null>(null);

  const loadData = useCallback(() => {
    const loadedWallets = getWallets();
    const loadedTransfers = getWalletTransferHistory();
    setWallets(loadedWallets);
    setTransfers(loadedTransfers);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const summary: WalletSummary = useMemo(() => {
    return getWalletSummary();
  }, [wallets]);

  const filteredWallets = useMemo(() => {
    if (filterType === "all") return wallets;
    return wallets.filter((w) => w.type === filterType);
  }, [wallets, filterType]);

  const warnings = useMemo(() => {
    return detectCriticalBalances(wallets);
  }, [wallets]);

  // Handlers
  const handleSaveWallet = (data: Omit<StudentWallet, "id" | "updatedAt">) => {
    if (editingWallet) {
      updateWallet(editingWallet.id, data);
    } else {
      addWallet(data);
    }
    loadData();
  };

  const handleDeleteWallet = (id: string) => {
    deleteWallet(id);
    loadData();
  };

  const handleTransfer = (
    fromId: string,
    toId: string,
    amount: number,
    adminFee: number,
    reason: string
  ) => {
    transferWalletFunds(fromId, toId, amount, adminFee, reason);
    loadData();
  };

  const handleOpenAdd = () => {
    setEditingWallet(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (wallet: StudentWallet) => {
    setEditingWallet(wallet);
    setIsFormOpen(true);
  };

  const handleOpenTransfer = (source?: StudentWallet) => {
    setTransferSourceWallet(source || null);
    setIsTransferOpen(true);
  };

  return (
    <div className="min-h-[100dvh] bg-cream-50 dark:bg-[#030712] text-navy-900 dark:text-cream-100 flex flex-col md:flex-row transition-colors selection:bg-navy-900 selection:text-white">
      {/* Desktop Left Sidebar */}
      <DashboardSidebar className="hidden md:flex" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-32 md:pb-12 h-screen overflow-y-auto custom-scrollbar">
        {/* Top Header */}
        <header className="sticky top-0 z-40 px-4 sm:px-6 pt-4 pb-2">
          <div className="max-w-6xl mx-auto rounded-full bg-white/70 dark:bg-black/50 backdrop-blur-2xl border border-white/20 dark:border-white/10 px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex items-center justify-between transition-all">
            {/* Left: Back Button & Title */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => router.push("/dashboard")}
                className="w-8 h-8 rounded-full flex items-center justify-center text-navy-700 dark:text-cream-200 hover:bg-cream-200/60 dark:hover:bg-white/10 transition-colors shrink-0"
                aria-label="Kembali ke Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <Link href="/dashboard" className="md:hidden shrink-0 flex items-center" aria-label="Finoch Beranda">
                <BrandLogo variant="symbol" className="w-5 h-5 shrink-0" />
              </Link>
              <div className="min-w-0">
                <Breadcrumbs className="hidden md:flex mb-0.5" />
                <h1 className="text-sm font-bold text-navy-950 dark:text-white tracking-wide truncate">
                  Dompet &amp; Rekening Mahasiswa
                </h1>
                <p className="text-[10px] text-navy-500 dark:text-cream-400 hidden sm:block">
                  Kelola uang tunai, saldo bank, dan dompet digital dalam satu pintu
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Page Main Body */}
        <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-3 space-y-5">
          {/* MOBILE PWA VIEW (md:hidden) */}
          <div className="md:hidden space-y-4">
            {/* Mobile Summary Balance Strip */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                  Total Likuiditas Mahasiswa
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-cream-200 font-semibold">
                  {wallets.length} Akun
                </span>
              </div>
              <div className="text-3xl font-black tracking-tight text-white mb-3">
                {formatRupiah(summary.totalBalance)}
              </div>

              {/* Quick 3-Pill Breakdown */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/15 text-center">
                <div className="p-1.5 rounded-xl bg-white/10">
                  <span className="text-[9px] text-white/70 block uppercase">Tunai</span>
                  <span className="text-xs font-bold text-white">
                    {formatRupiah(summary.cashBalance)}
                  </span>
                </div>
                <div className="p-1.5 rounded-xl bg-white/10">
                  <span className="text-[9px] text-white/70 block uppercase">Bank</span>
                  <span className="text-xs font-bold text-white">
                    {formatRupiah(summary.bankBalance)}
                  </span>
                </div>
                <div className="p-1.5 rounded-xl bg-white/10">
                  <span className="text-[9px] text-white/70 block uppercase">E-Wallet</span>
                  <span className="text-xs font-bold text-white">
                    {formatRupiah(summary.ewalletBalance)}
                  </span>
                </div>
              </div>
            </div>

            {/* Critical Alert Warning Strip */}
            {warnings.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300 block">
                    Peringatan Saldo Kritis:
                  </span>
                  <p className="text-[11px] text-amber-800 dark:text-amber-200 leading-snug">
                    {warnings[0]}
                  </p>
                </div>
              </div>
            )}

            {/* Category Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: "all", label: "Semua", icon: Layers },
                { id: "cash", label: "Tunai", icon: Wallet },
                { id: "bank", label: "Bank", icon: Landmark },
                { id: "ewallet", label: "E-Wallet", icon: Smartphone },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = filterType === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setFilterType(tab.id as "all" | WalletType)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                      isActive
                        ? "bg-navy-900 text-white dark:bg-cream-100 dark:text-navy-950 shadow-sm"
                        : "bg-white dark:bg-[#070E1A] text-navy-700 dark:text-cream-300 border border-cream-200 dark:border-navy-800"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Wallet Cards List */}
            <div className="space-y-3">
              {filteredWallets.map((wallet) => (
                <WalletCardMobile
                  key={wallet.id}
                  wallet={wallet}
                  onTransfer={(w) => handleOpenTransfer(w)}
                  onEdit={(w) => handleOpenEdit(w)}
                  onDelete={handleDeleteWallet}
                />
              ))}

              {filteredWallets.length === 0 && (
                <div className="text-center py-10 px-4 bg-white dark:bg-[#070E1A] rounded-3xl border border-cream-200 dark:border-navy-800">
                  <CreditCard className="w-8 h-8 text-navy-400 dark:text-cream-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-navy-800 dark:text-cream-200">
                    Belum ada dompet kategori ini
                  </p>
                  <button
                    onClick={handleOpenAdd}
                    className="mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    + Tambah Akun Baru
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Floating Action Dock (Input-First Ergonomics) */}
            <div className="fixed bottom-20 left-4 right-4 z-30 flex items-center gap-2">
              <button
                onClick={() => handleOpenTransfer()}
                className="flex-1 min-h-[50px] px-4 rounded-2xl bg-white dark:bg-navy-800 border border-cream-300 dark:border-navy-700 shadow-xl text-navy-900 dark:text-cream-100 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <ArrowRightLeft className="w-4 h-4 text-emerald-500" />
                <span>Pindah Saldo</span>
              </button>

              <button
                onClick={handleOpenAdd}
                className="flex-1 min-h-[50px] px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Akun</span>
              </button>
            </div>
          </div>

          {/* DESKTOP VIEW (hidden md:block) */}
          <div className="hidden md:block">
            <WalletBentoDesktop
              wallets={wallets}
              summary={summary}
              transfers={transfers}
              onOpenAddModal={handleOpenAdd}
              onOpenTransferModal={handleOpenTransfer}
              onEditWallet={handleOpenEdit}
              onDeleteWallet={handleDeleteWallet}
            />
          </div>
        </main>
      </div>

      {/* Modals */}
      <WalletFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveWallet}
        initialWallet={editingWallet}
      />

      <WalletTransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        wallets={wallets}
        sourceWallet={transferSourceWallet}
        onTransfer={handleTransfer}
      />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav onOpenVoice={() => router.push("/dashboard")} userEmail={user?.email} />
    </div>
  );
}
