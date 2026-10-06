"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Clock,
  Trash2,
  Edit2,
  Search,
  Filter,
} from "lucide-react";
import { RecurringBill, BillCategory } from "@/types/bill-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";
import { getCategoryBadge } from "./bill-card-mobile";

interface BillTableDesktopProps {
  bills: RecurringBill[];
  currentDay: number;
  onMarkPaid: (id: string) => void;
  onEdit: (bill: RecurringBill) => void;
  onDelete: (id: string) => void;
}

export function BillTableDesktop({
  bills,
  currentDay,
  onMarkPaid,
  onEdit,
  onDelete,
}: BillTableDesktopProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "unpaid" | "paid">("all");

  const filteredBills = bills.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.note || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || b.category === selectedCategory;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "paid" && b.isPaidThisMonth) ||
      (statusFilter === "unpaid" && !b.isPaidThisMonth);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="bg-white dark:bg-navy-900 border border-cream-300 dark:border-navy-800 rounded-2xl p-5 shadow-sm space-y-4 transition-colors">
      {/* Search & Filter Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 dark:text-cream-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari tagihan (kos, wifi, listrik)..."
            className="w-full pl-9 pr-3 py-2 bg-cream-50 dark:bg-navy-950 border border-cream-300 dark:border-navy-800 rounded-xl text-xs text-navy-950 dark:text-cream-100 placeholder:text-navy-400 dark:placeholder:text-cream-300/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              statusFilter === "all"
                ? "bg-navy-900 text-cream-50 dark:bg-cream-100 dark:text-navy-950 border-transparent shadow-sm"
                : "bg-cream-50 dark:bg-navy-950 text-navy-600 dark:text-cream-300 border-cream-300 dark:border-navy-800"
            }`}
          >
            Semua ({bills.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("unpaid")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              statusFilter === "unpaid"
                ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                : "bg-cream-50 dark:bg-navy-950 text-navy-600 dark:text-cream-300 border-cream-300 dark:border-navy-800"
            }`}
          >
            Belum Bayar ({bills.filter((b) => !b.isPaidThisMonth).length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("paid")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              statusFilter === "paid"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "bg-cream-50 dark:bg-navy-950 text-navy-600 dark:text-cream-300 border-cream-300 dark:border-navy-800"
            }`}
          >
            Lunas ({bills.filter((b) => b.isPaidThisMonth).length})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-cream-200 dark:border-navy-800">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-cream-100/70 dark:bg-navy-950/70 border-b border-cream-200 dark:border-navy-800 text-navy-600 dark:text-cream-300/80 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Nama Tagihan</th>
              <th className="py-3 px-3">Kategori</th>
              <th className="py-3 px-3">Jatuh Tempo</th>
              <th className="py-3 px-3 text-right">Nominal</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200 dark:divide-navy-800">
            {filteredBills.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-navy-400 dark:text-cream-300/40">
                  Tidak ada tagihan yang cocok dengan filter.
                </td>
              </tr>
            ) : (
              filteredBills.map((bill) => {
                const badge = getCategoryBadge(bill.category);
                const Icon = badge.icon;
                const daysDiff = bill.dueDay - currentDay;

                return (
                  <tr
                    key={bill.id}
                    className={`hover:bg-cream-50/80 dark:hover:bg-navy-800/40 transition-colors ${
                      bill.isPaidThisMonth
                        ? "opacity-60 bg-cream-50/20 dark:bg-navy-950/20"
                        : daysDiff <= 3
                        ? "bg-amber-500/5 dark:bg-amber-950/10"
                        : ""
                    }`}
                  >
                    {/* Name & Note */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-navy-950 dark:text-cream-50 text-xs sm:text-sm">
                        {bill.name}
                      </div>
                      {bill.note && (
                        <div className="text-[11px] text-navy-500 dark:text-cream-300/60 line-clamp-1">
                          {bill.note}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${badge.color}`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </span>
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-navy-400 dark:text-cream-400" />
                        <span className="font-semibold text-navy-950 dark:text-cream-50">
                          Tgl {bill.dueDay}
                        </span>
                      </div>
                      <div className="text-[10px] mt-0.5">
                        {bill.isPaidThisMonth ? (
                          <span className="text-emerald-600 font-medium">Selesai</span>
                        ) : daysDiff < 0 ? (
                          <span className="text-rose-600 font-bold">Telat {Math.abs(daysDiff)} hari</span>
                        ) : daysDiff === 0 ? (
                          <span className="text-rose-600 font-bold">Hari ini!</span>
                        ) : daysDiff <= 3 ? (
                          <span className="text-amber-600 font-bold">{daysDiff} hari lagi</span>
                        ) : (
                          <span className="text-navy-400 dark:text-cream-300/50">{daysDiff} hari lagi</span>
                        )}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-3 text-right">
                      <span className="font-black text-navy-950 dark:text-cream-50 text-xs sm:text-sm">
                        {formatRupiah(bill.amount)}
                      </span>
                      <span className="block text-[10px] text-navy-400 dark:text-cream-300/50">
                        /bulan
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-3 text-center">
                      {bill.isPaidThisMonth ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Lunas</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-500/20">
                          <Clock className="w-3 h-3" />
                          <span>Belum</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!bill.isPaidThisMonth && (
                          <button
                            type="button"
                            onClick={() => onMarkPaid(bill.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all shadow-sm active:scale-95"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Bayar</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onEdit(bill)}
                          className="p-1.5 text-navy-400 hover:text-navy-700 dark:hover:text-cream-200 rounded-lg hover:bg-cream-100 dark:hover:bg-navy-800 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(bill.id)}
                          className="p-1.5 text-navy-400 hover:text-rose-500 rounded-lg hover:bg-cream-100 dark:hover:bg-navy-800 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
