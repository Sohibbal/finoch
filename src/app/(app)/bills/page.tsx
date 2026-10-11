"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { RecurringBill } from "@/types/bill-types";
import { getBills, addBill, updateBill, deleteBill, markBillAsPaid, getBillSummary } from "@/lib/storage/bill-storage";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { useAuthContext } from "@/components/layout/auth-provider";
import { useFinancialProfile } from "@/hooks/use-financial-profile";

import { BillScheduleRow, billSchedule } from "@/components/bills/bill-schedule";
import { BillCalendarMatrix } from "@/components/bills/bill-calendar-matrix";
import { BillShieldCard } from "@/components/bills/bill-shield-card";
import { BillFormModal } from "@/components/bills/bill-form-modal";
import { rupiah } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";

const PRIMARY_ACTION =
  "inline-flex items-center gap-2 min-h-11 px-4 rounded-full bg-ink hover:bg-ink/90 text-paper-sheet text-body font-semibold transition-colors";

const FILTERS = [
  { id: "all", label: "Semua" },
  { id: "unpaid", label: "Belum dibayar" },
  { id: "paid", label: "Lunas" },
] as const;

export default function BillsPage() {
  const { user } = useAuthContext();
  const profile = useFinancialProfile();
  const today = useMemo(() => new Date(), []);

  const [bills, setBills] = useState<RecurringBill[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<RecurringBill | null>(null);
  const [filter, setFilter] = useState<"all" | "unpaid" | "paid">("all");
  const [search, setSearch] = useState("");
  const [justPaidId, setJustPaidId] = useState<string | null>(null);

  const refreshBills = () => {
    setBills(getBills());
  };

  useEffect(() => {
    refreshBills();
  }, []);

  const summary = useMemo(() => getBillSummary(today), [bills, today]);
  const schedule = useMemo(() => billSchedule(bills, today), [bills, today]);

  const query = search.trim().toLowerCase();
  const rows = schedule.filter(({ bill }) => {
    if (filter === "unpaid" && bill.isPaidThisMonth) return false;
    if (filter === "paid" && !bill.isPaidThisMonth) return false;
    return !query || bill.name.toLowerCase().includes(query) || (bill.note || "").toLowerCase().includes(query);
  });

  const openNew = () => {
    setEditingBill(null);
    setIsModalOpen(true);
  };

  const openEdit = (bill: RecurringBill) => {
    setEditingBill(bill);
    setIsModalOpen(true);
  };

  // Actions
  const handleAddOrEdit = (data: Omit<RecurringBill, "id" | "isPaidThisMonth" | "createdAt">) => {
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
    setJustPaidId(id);
    refreshBills();

    // Auto-record to Finoch local expenses
    try {
      await expenseStorage.saveExpense({
        itemName: `Bayar Tagihan: ${target.name}`,
        amount: target.amount,
        category: "Bills & Utilities",
        userId: user?.id || "guest",
      });
      alert(`Tagihan "${target.name}" (${rupiah(target.amount)}) berhasil ditandai lunas dan dicatat ke Pengeluaran!`);
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

  const counts = { all: bills.length, unpaid: summary.unpaidCount, paid: summary.paidCount };

  return (
    <>
      <PageHeader
        title="Tagihan Kost"
        subtitle="Sewa, WiFi, listrik, dan langganan rutin"
        actions={
          <button type="button" onClick={openNew} className={PRIMARY_ACTION}>
            <Plus className="w-4 h-4" aria-hidden="true" />
            Tambah
            <span className="sr-only sm:not-sr-only -ml-1">tagihan</span>
          </button>
        }
      />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-5 grid grid-cols-1 lg:grid-cols-3 gap-x-10 gap-y-8 items-start">
        <div className="lg:col-span-2 space-y-5">
          <BillShieldCard summary={summary} monthlyIncome={profile.monthlyIncome ?? undefined} />

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div role="group" aria-label="Saring status tagihan" className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={`min-h-11 px-4 rounded-full border text-body font-semibold transition-colors ${
                    filter === f.id ? "bg-ink text-paper-sheet border-ink" : "border-ink/30 text-ink hover:bg-ink/5"
                  }`}
                >
                  {f.label} <span className="money">{counts[f.id]}</span>
                </button>
              ))}
            </div>
            <label className="relative flex-1 min-w-0 sm:max-w-xs sm:ml-auto">
              <span className="sr-only">Cari tagihan</span>
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kos, wifi, listrik"
                className="w-full min-h-11 pl-9 pr-3 bg-paper-sheet border border-ink/30 rounded-full text-body text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-ink"
              />
            </label>
          </div>

          <section aria-labelledby="jadwal-title">
            <h2 id="jadwal-title" className="font-display text-head font-bold text-ink border-b border-ink/20 pb-2">
              Jadwal bayar
            </h2>
            {rows.length === 0 ? (
              <div className="py-6 space-y-2">
                <p className="text-body font-semibold text-ink">
                  {bills.length === 0 ? "Belum ada tagihan rutin." : "Tidak ada tagihan yang cocok."}
                </p>
                <p className="text-body text-ink-soft max-w-prose">
                  {bills.length === 0
                    ? "Catat sewa kos, WiFi, token listrik, atau langganan. Finoch mengingatkan sebelum jatuh tempo."
                    : "Coba saringan lain atau kosongkan pencarian."}
                </p>
              </div>
            ) : (
              <ol>
                {rows.map((row) => (
                  <BillScheduleRow
                    key={row.bill.id}
                    row={row}
                    month={today.getMonth()}
                    justPaid={row.bill.id === justPaidId}
                    onMarkPaid={handleMarkPaid}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </ol>
            )}
          </section>
        </div>

        <BillCalendarMatrix bills={bills} today={today} />
      </main>

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
