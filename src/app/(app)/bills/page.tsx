"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  CalendarClock,
  Plus,
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
import { useAuthContext } from "@/components/layout/auth-provider";

import { BillCardMobile } from "@/components/bills/bill-card-mobile";
import { BillTableDesktop } from "@/components/bills/bill-table-desktop";
import { BillCalendarMatrix } from "@/components/bills/bill-calendar-matrix";
import { BillShieldCard } from "@/components/bills/bill-shield-card";
import { BillFormModal } from "@/components/bills/bill-form-modal";
import { formatRupiah } from "@/lib/financial/split-bill-engine";
import { PageHeader } from "@/components/layout/page-header";
import { ACTION_BAR_BOTTOM } from "@/components/layout/insets";

export default function BillsPage() {
  const { user } = useAuthContext();
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
    <>
      <PageHeader
        title="Pengingat Tagihan & Beban Kost"
        subtitle="Proteksi jatah jajan harian dari uang kos, wifi, dan listrik"
        actions={
          <>
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
          </>
        }
      />

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

      {/* Floating Bottom Dock for Mobile PWA (Sticky Summary) */}
      <div className={`md:hidden fixed ${ACTION_BAR_BOTTOM} left-0 right-0 z-30 px-4 py-2 pointer-events-none`}>
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
    </>
  );
}
