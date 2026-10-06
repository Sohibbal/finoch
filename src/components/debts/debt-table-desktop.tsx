"use client";

import React, { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Trash2,
  Check,
  RotateCcw,
  Wallet,
} from "lucide-react";
import { DebtItem, DebtSummary, DebtType } from "@/types/debt-types";
import { generateWhatsAppDebtReminder } from "@/lib/financial/debt-engine";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

interface DebtTableDesktopProps {
  debts: DebtItem[];
  summary: DebtSummary;
  onTogglePaid: (id: string) => void;
  onDelete: (id: string) => void;
}

export function DebtTableDesktop({
  debts,
  summary,
  onTogglePaid,
  onDelete,
}: DebtTableDesktopProps) {
  const [filterType, setFilterType] = useState<string>("all");

  const filtered = debts.filter((d) => {
    if (filterType === "receivable") return d.type === "receivable";
    if (filterType === "payable") return d.type === "payable";
    if (filterType === "unpaid") return d.status === "unpaid";
    if (filterType === "paid") return d.status === "paid";
    return true;
  });

  const handleNudgeWhatsApp = (debt: DebtItem) => {
    const text = generateWhatsAppDebtReminder(debt);
    const phoneClean = debt.phone ? debt.phone.replace(/[^0-9]/g, "") : "";
    const waUrl = phoneClean
      ? `https://wa.me/${phoneClean.startsWith("0") ? "62" + phoneClean.slice(1) : phoneClean}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* 3-Box Top Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Box 1: Total Piutang Saya */}
        <div className="rounded-3xl bg-white dark:bg-[#070E1A] border border-emerald-500/30 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Total Piutang Saya
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatRupiah(summary.totalReceivable)}
            </div>
            <p className="text-xs text-navy-500 dark:text-cream-400 mt-1">
              {summary.unpaidReceivablesCount} teman belum melunasi talangan
            </p>
          </div>
        </div>

        {/* Box 2: Total Hutang Saya */}
        <div className="rounded-3xl bg-white dark:bg-[#070E1A] border border-amber-500/30 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Total Hutang Saya
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {formatRupiah(summary.totalPayable)}
            </div>
            <p className="text-xs text-navy-500 dark:text-cream-400 mt-1">
              {summary.unpaidPayablesCount} kewajiban bayar yang belum lunas
            </p>
          </div>
        </div>

        {/* Box 3: Saldo Bersih */}
        <div className="rounded-3xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-navy-500 dark:text-cream-400">
              Posisi Saldo Bersih
            </span>
            <div className="w-9 h-9 rounded-xl bg-navy-100 dark:bg-navy-900 text-navy-800 dark:text-cream-200 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div
              className={`text-2xl font-black ${
                summary.netBalance >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {formatRupiah(summary.netBalance)}
            </div>
            <p className="text-xs text-navy-500 dark:text-cream-400 mt-1">
              {summary.netBalance >= 0 ? "Surplus piutang bersih" : "Beban hutang melebihi piutang"}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Table Container */}
      <div className="rounded-3xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-cream-200 dark:border-navy-800">
          <div className="flex gap-2">
            {[
              { id: "all", label: "Semua Catatan" },
              { id: "receivable", label: "Piutang Saya" },
              { id: "payable", label: "Hutang Saya" },
              { id: "unpaid", label: "Belum Lunas" },
              { id: "paid", label: "Sudah Lunas" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterType === tab.id
                    ? "bg-navy-900 text-white dark:bg-cream-100 dark:text-navy-950 shadow-sm"
                    : "bg-cream-100 dark:bg-navy-900 text-navy-700 dark:text-cream-300 hover:bg-cream-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs font-semibold text-navy-500 dark:text-cream-400">
            {filtered.length} catatan
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-cream-100 dark:bg-navy-900 text-navy-700 dark:text-cream-300 font-bold border-b border-cream-200 dark:border-navy-800">
              <tr>
                <th className="py-2.5 px-3">Nama Pihak / Teman</th>
                <th className="py-2.5 px-3">Jenis</th>
                <th className="py-2.5 px-3">Keterangan</th>
                <th className="py-2.5 px-3">Jatuh Tempo</th>
                <th className="py-2.5 px-3 text-right">Nominal</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 dark:divide-navy-900">
              {filtered.map((item) => {
                const isRec = item.type === "receivable";
                const isPaid = item.status === "paid";
                return (
                  <tr key={item.id} className={isPaid ? "opacity-60" : ""}>
                    <td className="py-3 px-3 font-bold text-navy-950 dark:text-cream-50">
                      {item.personName}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isRec
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                        }`}
                      >
                        {isRec ? "Piutang (Teman Pinjam)" : "Hutang (Saya Pinjam)"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-navy-600 dark:text-cream-400">
                      {item.description}
                    </td>
                    <td className="py-3 px-3 text-navy-500 dark:text-cream-400">
                      {item.dueDate || "-"}
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-black ${
                        isRec
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {formatRupiah(item.amount)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPaid
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {isPaid ? "Lunas" : "Belum Lunas"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isPaid && (
                          <button
                            onClick={() => handleNudgeWhatsApp(item)}
                            className="p-1.5 rounded-lg border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            title="Ingatkan via WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onTogglePaid(item.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isPaid
                              ? "text-navy-500 hover:bg-cream-200"
                              : "bg-navy-950 text-white dark:bg-cream-100 dark:text-navy-950 hover:opacity-90"
                          }`}
                          title={isPaid ? "Tandai Belum Lunas" : "Tandai Lunas"}
                        >
                          {isPaid ? <RotateCcw className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus catatan kasbon "${item.personName}"?`)) onDelete(item.id);
                          }}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
