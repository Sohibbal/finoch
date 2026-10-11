"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import { DebtItem, DebtSummary, DebtType } from "@/types/debt-types";
import { getDebts, addDebt, markDebtAsPaid, deleteDebt, getDebtSummary } from "@/lib/storage/debt-storage";
import { rupiah } from "@/lib/format";

import { DebtSlip, sortSlips } from "@/components/debts/debt-slip";
import { DebtFormModal } from "@/components/debts/debt-form-modal";
import { PageHeader } from "@/components/layout/page-header";

const PRIMARY_ACTION =
  "inline-flex items-center gap-2 min-h-11 px-4 rounded-full bg-ink hover:bg-ink/90 text-paper-sheet text-body font-semibold transition-colors";

const FILTERS = [
  { id: "all", label: "Semua" },
  { id: "receivable", label: "Piutang" },
  { id: "payable", label: "Utang" },
  { id: "unpaid", label: "Belum lunas" },
  { id: "paid", label: "Lunas" },
] as const;

type Filter = (typeof FILTERS)[number]["id"];

export default function DebtsPage() {
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [justPaidId, setJustPaidId] = useState<string | null>(null);

  const refreshDebts = () => {
    setDebts(getDebts());
  };

  useEffect(() => {
    refreshDebts();
  }, []);

  const summary: DebtSummary = useMemo(() => {
    return getDebtSummary();
  }, [debts]);

  const slips = useMemo(
    () =>
      sortSlips(debts).filter((d) => {
        if (filter === "receivable" || filter === "payable") return d.type === filter;
        if (filter === "unpaid" || filter === "paid") return d.status === filter;
        return true;
      }),
    [debts, filter]
  );

  const handleAddDebt = (data: {
    type: DebtType;
    personName: string;
    amount: number;
    description: string;
    dueDate?: string;
    phone?: string;
  }) => {
    addDebt(data);
    refreshDebts();
  };

  const handleTogglePaid = (id: string) => {
    const settled = markDebtAsPaid(id);
    setJustPaidId(settled?.status === "paid" ? id : null);
    refreshDebts();
  };

  const handleDeleteDebt = (id: string) => {
    deleteDebt(id);
    refreshDebts();
  };

  return (
    <>
      <PageHeader
        title="Buku Kasbon"
        subtitle="Utang dan piutang sama teman kos, dengan pengingat yang nggak bikin canggung"
        actions={
          <button type="button" onClick={() => setIsModalOpen(true)} className={PRIMARY_ACTION}>
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span className="sm:hidden">Tambah</span>
            <span className="hidden sm:inline">Catat kasbon</span>
          </button>
        }
      />

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-5 space-y-6">
        {/* Both directions side by side, then the net, so who owes whom reads at a glance. */}
        <section aria-labelledby="kasbon-total-title" className="border-y border-ink/20 py-4 space-y-3">
          <h2 id="kasbon-total-title" className="sr-only">
            Ringkasan kasbon
          </h2>
          <dl className="grid grid-cols-2 gap-4">
            <div className="min-w-0">
              <dt className="text-body text-ink-soft">Teman utang ke kamu</dt>
              <dd className="font-display text-head font-bold text-aman-ink money break-words">{rupiah(summary.totalReceivable)}</dd>
              <dd className="text-meta text-ink-soft">{summary.unpaidReceivablesCount} orang belum bayar</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-body text-ink-soft">Kamu utang ke teman</dt>
              <dd className="font-display text-head font-bold text-mepet-ink money break-words">{rupiah(summary.totalPayable)}</dd>
              <dd className="text-meta text-ink-soft">{summary.unpaidPayablesCount} belum kamu lunasi</dd>
            </div>
          </dl>
          <p className="text-body text-ink border-t border-ink/10 pt-3">
            {summary.netBalance > 0
              ? "Bersihnya kamu masih akan terima "
              : summary.netBalance < 0
                ? "Bersihnya kamu masih harus bayar "
                : "Impas, nggak ada yang nunggak. "}
            {summary.netBalance !== 0 && <span className="money font-semibold">{rupiah(Math.abs(summary.netBalance))}</span>}
          </p>
        </section>

        <div role="group" aria-label="Saring kasbon" className="flex flex-wrap gap-2">
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
              {f.label}
            </button>
          ))}
        </div>

        {slips.length === 0 ? (
          <div className="py-4 space-y-2">
            <p className="text-body font-semibold text-ink">
              {debts.length === 0 ? "Buku kasbon masih bersih." : "Tidak ada kasbon di saringan ini."}
            </p>
            <p className="text-body text-ink-soft max-w-prose">
              {debts.length === 0
                ? "Talangin makan teman atau pinjam duit buat bayar kos? Catat di sini, lalu ingatkan lewat WhatsApp kalau sudah waktunya."
                : "Coba saringan lain."}
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {slips.map((debt) => (
              <DebtSlip
                key={debt.id}
                debt={debt}
                justPaid={debt.id === justPaidId}
                onTogglePaid={handleTogglePaid}
                onDelete={handleDeleteDebt}
              />
            ))}
          </ul>
        )}
      </main>

      {/* Form Modal */}
      <DebtFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddDebt} />
    </>
  );
}
