"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  Plus,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { RecurringBill } from "@/types/bill-types";
import {
  getBills,
  addBill,
  updateBill,
  deleteBill,
  markBillAsPaid,
  getBillSummary,
} from "@/lib/storage/bill-storage";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { useAuth } from "@/hooks/use-auth";

import Link from "next/link";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BrandLogo } from "@/components/brand/brand-logo";

import { BillCardMobile } from "@/components/bills/bill-card-mobile";
import { BillTableDesktop } from "@/components/bills/bill-table-desktop";
import { BillCalendarMatrix } from "@/components/bills/bill-calendar-matrix";
import { BillShieldCard } from "@/components/bills/bill-shield-card";
import { BillFormModal } from "@/components/bills/bill-form-modal";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

export default function BillsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const today = useMemo(() => new Date(), []);
  const currentDay = today.getDate();

  const [bills, setBills] = useState<RecurringBill[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<RecurringBill | null>(null);
  const [mobileFilter, setMobileFilter] = useState<"all" | "unpaid" | "paid">("all");

  const refreshBills = () => {
    setBills(getBills());
  };

  useEffect(() => {
    refreshBills();
  }, []);

  const summary = useMemo(() => getBillSummary(today), [bills, today]);

  // Actions
  const handleAddOrEdit = (
    data: Omit<RecurringBill, "id" | "isPaidThisMonth" | "createdAt">
  ) => {
    if (editingBill) {
      updateBill(editingBill.id, data);
    } else {
      addBill(data);
    }
    refreshBills();
    setEditingBill(null);
  };

  const handleMarkPaid = async (id: string) => {
    const target = bills.find((b) => b.id === id);
    if (!target) return;

    markBillAsPaid(id);
    refreshBills();

    // Auto-record to Finoch local expenses
    try {
      await expenseStorage.saveExpense({
        itemName: `Bayar Tagihan: ${target.name}`,
        amount: target.amount,
        category: "Bills & Utilities",
        userId: user?.id || "guest",
      });
      alert(`Tagihan "${target.name}" (${formatRupiah(target.amount)}) berhasil ditandai lunas dan dicatat ke Pengeluaran!`);
    } catch (err) {
      console.error("Gagal auto-record tagihan ke expense:", err);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus tagihan rutin ini?")) {
      deleteBill(id);
      refreshBills();
    }
  };

  // Mobile filtered bills
  const mobileFilteredBills = bills.filter((b) => {
    if (mobileFilter === "unpaid") return !b.isPaidThisMonth;
    if (mobileFilter === "paid") return b.isPaidThisMonth;
    return true;
  });

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-navy-950 text-navy-900 dark:text-cream-100 flex flex-col md:flex-row transition-colors">
      {/* Desktop Left Sidebar */}
      <DashboardSidebar className="hidden md:flex" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 pb-28 md:pb-12">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-cream-50/90 dark:bg-navy-950/90 backdrop-blur-md border-b border-cream-300 dark:border-navy-800 px-4 sm:px-6 py-3.5 transition-colors">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Left Brand / Title */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="md:hidden p-1.5 rounded-xl border border-cream-300 dark:border-navy-800 text-navy-700 dark:text-cream-200 shrink-0"
                title="Kembali ke Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <Link href="/dashboard" className="md:hidden shrink-0" aria-label="Finoch Beranda">
                <BrandLogo variant="symbol" className="h-5 w-auto" />
              </Link>
              <div className="min-w-0">
                <Breadcrumbs className="hidden md:flex mb-1" />
                <h1 className="text-sm font-bold text-navy-950 dark:text-cream-50 flex items-center gap-1.5 truncate">
                  <CalendarClock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">Pengingat Tagihan &amp; Beban Kost</span>
                </h1>
                <p className="text-[11px] text-navy-600 dark:text-cream-300/70 hidden sm:block">
                  Proteksi jatah jajan harian dari uang kos, wifi, dan listrik
                </p>
              </div>
            </div>

            {/* Right Action */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingBill(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 text-cream-50 dark:text-navy-950 text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tambah Tagihan</span>
              </button>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-5 space-y-5">
          {/* ========================================================================= */}
          {/* 1. MOBILE VIEW (PWA Optimized: md:hidden) */}
          {/* ========================================================================= */}
          <div className="md:hidden space-y-4">
            {/* Top Shield Card */}
            <BillShieldCard summary={summary} />

            {/* Quick Filter Segmented Pills */}
            <div className="flex items-center justify-between gap-1 p-1 bg-cream-200/50 dark:bg-navy-900 rounded-xl border border-cream-300 dark:border-navy-800">
              <button
                type="button"
                onClick={() => setMobileFilter("all")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  mobileFilter === "all"
                    ? "bg-white dark:bg-navy-800 text-navy-950 dark:text-cream-50 shadow-sm"
                    : "text-navy-600 dark:text-cream-300/70"
                }`}
              >
                Semua ({bills.length})
              </button>
              <button
                type="button"
                onClick={() => setMobileFilter("unpaid")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  mobileFilter === "unpaid"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-navy-600 dark:text-cream-300/70"
                }`}
              >
                Belum ({summary.unpaidCount})
              </button>
              <button
                type="button"
                onClick={() => setMobileFilter("paid")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  mobileFilter === "paid"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-navy-600 dark:text-cream-300/70"
                }`}
              >
                Lunas ({summary.paidCount})
              </button>
            </div>

            {/* Mobile Touch Cards */}
            <div className="space-y-3">
              {mobileFilteredBills.length === 0 ? (
                <div className="text-center py-12 rounded-2xl border border-cream-200 dark:border-navy-800 bg-white/50 dark:bg-navy-900/50 p-6 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-60" />
                  <p className="text-xs font-bold text-navy-900 dark:text-cream-100">
                    Tidak ada tagihan pada filter ini
                  </p>
                  <p className="text-[11px] text-navy-500 dark:text-cream-300/60">
                    Semua tagihan wajib anak kost Anda dalam kendali aman.
                  </p>
                </div>
              ) : (
                mobileFilteredBills.map((bill) => (
                  <BillCardMobile
                    key={bill.id}
                    bill={bill}
                    currentDay={currentDay}
                    onMarkPaid={handleMarkPaid}
                    onEdit={(b) => {
                      setEditingBill(b);
                      setIsModalOpen(true);
                    }}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>

            {/* Calendar Matrix Compact for Mobile */}
            <BillCalendarMatrix bills={bills} currentDay={currentDay} />
          </div>

          {/* ========================================================================= */}
          {/* 2. DESKTOP VIEW (Wide Bento Grid: hidden md:block) */}
          {/* ========================================================================= */}
          <div className="hidden md:block space-y-5">
            {/* Bento Grid: Table on Left (8 cols), Right Sidebar on Right (4 cols) */}
            <div className="grid grid-cols-12 gap-5 items-start">
              {/* Left Column: Table of Bills */}
              <div className="col-span-8 space-y-5">
                <BillTableDesktop
                  bills={bills}
                  currentDay={currentDay}
                  onMarkPaid={handleMarkPaid}
                  onEdit={(b) => {
                    setEditingBill(b);
                    setIsModalOpen(true);
                  }}
                  onDelete={handleDelete}
                />
              </div>

              {/* Right Column: Shield Card & Calendar Due Matrix */}
              <div className="col-span-4 space-y-5">
                <BillShieldCard summary={summary} />
                <BillCalendarMatrix bills={bills} currentDay={currentDay} />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Bottom Dock for Mobile PWA (Sticky Summary) */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 px-4 py-2 pointer-events-none">
        <div className="pointer-events-auto max-w-md mx-auto bg-navy-950/90 text-white rounded-2xl p-3 shadow-xl backdrop-blur-md border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-cream-300/70 block uppercase font-bold tracking-wider">
              Sisa Tagihan Bulan Ini
            </span>
            <span className="text-sm font-black text-amber-400">
              {formatRupiah(summary.unpaidAmountThisMonth)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingBill(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
        </div>
      </div>

      {/* Add / Edit Bill Modal */}
      <BillFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBill(null);
        }}
        onSubmit={handleAddOrEdit}
        initialData={editingBill}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav onOpenVoice={() => router.push("/dashboard")} userEmail={user?.email} />
    </div>
  );
}
