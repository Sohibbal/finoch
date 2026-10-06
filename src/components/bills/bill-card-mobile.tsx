"use client";

import React from "react";
import {
  Home,
  Zap,
  Tv,
  GraduationCap,
  Package,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Clock,
  Trash2,
  Edit2,
} from "lucide-react";
import { RecurringBill, BillCategory } from "@/types/bill-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

interface BillCardMobileProps {
  bill: RecurringBill;
  currentDay: number;
  onMarkPaid: (id: string) => void;
  onEdit: (bill: RecurringBill) => void;
  onDelete: (id: string) => void;
}

export function getCategoryBadge(category: BillCategory) {
  switch (category) {
    case "kos":
      return {
        label: "Kamar Kos",
        icon: Home,
        color: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
      };
    case "utilities":
      return {
        label: "WiFi & Listrik",
        icon: Zap,
        color: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
      };
    case "subscription":
      return {
        label: "Langganan",
        icon: Tv,
        color: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
      };
    case "education":
      return {
        label: "Kuliah & Buku",
        icon: GraduationCap,
        color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
      };
    default:
      return {
        label: "Lainnya",
        icon: Package,
        color: "bg-cream-200 dark:bg-navy-800 text-navy-700 dark:text-cream-300 border-cream-300 dark:border-navy-700",
      };
  }
}

export function BillCardMobile({
  bill,
  currentDay,
  onMarkPaid,
  onEdit,
  onDelete,
}: BillCardMobileProps) {
  const badge = getCategoryBadge(bill.category);
  const Icon = badge.icon;
  const daysDiff = bill.dueDay - currentDay;

  // Determine urgency
  let dueStatus: { text: string; color: string; icon: React.ComponentType<{ className?: string }> };
  if (bill.isPaidThisMonth) {
    dueStatus = {
      text: "Lunas Bulan Ini",
      color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
      icon: CheckCircle2,
    };
  } else if (daysDiff < 0) {
    dueStatus = {
      text: `Telat ${Math.abs(daysDiff)} hari!`,
      color: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20 font-bold",
      icon: AlertTriangle,
    };
  } else if (daysDiff === 0) {
    dueStatus = {
      text: "Jatuh Tempo HARI INI!",
      color: "bg-rose-500 text-white font-bold animate-pulse",
      icon: AlertTriangle,
    };
  } else if (daysDiff <= 3) {
    dueStatus = {
      text: `${daysDiff} hari lagi`,
      color: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold",
      icon: Clock,
    };
  } else {
    dueStatus = {
      text: `Tgl ${bill.dueDay} (${daysDiff} hari lagi)`,
      color: "bg-cream-100 dark:bg-navy-800 text-navy-600 dark:text-cream-300/70 border-cream-200 dark:border-navy-700",
      icon: Calendar,
    };
  }

  const StatusIcon = dueStatus.icon;

  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        bill.isPaidThisMonth
          ? "bg-white/60 dark:bg-navy-900/40 border-cream-200/80 dark:border-navy-800/60 opacity-80"
          : daysDiff <= 3
          ? "bg-white dark:bg-navy-900 border-amber-500/30 shadow-sm"
          : "bg-white dark:bg-navy-900 border-cream-300 dark:border-navy-800 shadow-sm"
      }`}
    >
      {/* Top Meta: Category & Due Badge */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${badge.color}`}
        >
          <Icon className="w-3 h-3" />
          <span>{badge.label}</span>
        </span>

        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${dueStatus.color}`}
        >
          <StatusIcon className="w-3 h-3" />
          <span>{dueStatus.text}</span>
        </span>
      </div>

      {/* Title & Amount */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <h3 className="font-bold text-sm text-navy-950 dark:text-cream-50 truncate">
            {bill.name}
          </h3>
          {bill.note && (
            <p className="text-[11px] text-navy-500 dark:text-cream-300/60 line-clamp-1 mt-0.5">
              {bill.note}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <span className="font-black text-sm text-navy-950 dark:text-cream-50">
            {formatRupiah(bill.amount)}
          </span>
          <span className="block text-[10px] text-navy-400 dark:text-cream-300/50">
            /bulan
          </span>
        </div>
      </div>

      {/* Action Row - Mobile Thumb Friendly */}
      <div className="flex items-center justify-between pt-2 border-t border-cream-200/70 dark:border-navy-800/70 gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(bill)}
            className="p-2 text-navy-400 hover:text-navy-700 dark:hover:text-cream-200 rounded-xl transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            title="Edit tagihan"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(bill.id)}
            className="p-2 text-navy-400 hover:text-rose-500 rounded-xl transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            title="Hapus tagihan"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {bill.isPaidThisMonth ? (
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Terbayar</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onMarkPaid(bill.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all min-h-[40px]"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Bayar Sekarang</span>
          </button>
        )}
      </div>
    </div>
  );
}
