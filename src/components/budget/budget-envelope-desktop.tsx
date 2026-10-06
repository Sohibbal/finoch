"use client";

import React from "react";
import {
  Utensils,
  Home,
  Car,
  Coffee,
  Shield,
  BookOpen,
  ShoppingBag,
  Sparkles,
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Trash2,
  Tag,
  Repeat,
} from "lucide-react";
import { BudgetEnvelope } from "@/types/budget-types";
import { calculateEnvelopeProgress } from "@/lib/financial/budget-engine";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

interface BudgetEnvelopeDesktopProps {
  envelope: BudgetEnvelope;
  onTransfer: (envelope: BudgetEnvelope) => void;
  onEdit: (envelope: BudgetEnvelope) => void;
  onDelete: (id: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  utensils: Utensils,
  home: Home,
  car: Car,
  coffee: Coffee,
  shield: Shield,
  book: BookOpen,
  shopping: ShoppingBag,
  sparkles: Sparkles,
};

const COLOR_MAP: Record<string, { bg: string; text: string; bar: string; badge: string; border: string }> = {
  emerald: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-400",
    bar: "bg-emerald-500",
    badge: "border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10",
    border: "hover:border-emerald-500/40",
  },
  blue: {
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
    text: "text-blue-700 dark:text-blue-400",
    bar: "bg-blue-500",
    badge: "border-blue-500/30 text-blue-700 dark:text-blue-300 bg-blue-500/10",
    border: "hover:border-blue-500/40",
  },
  amber: {
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    text: "text-amber-700 dark:text-amber-400",
    bar: "bg-amber-500",
    badge: "border-amber-500/30 text-amber-700 dark:text-amber-300 bg-amber-500/10",
    border: "hover:border-amber-500/40",
  },
  purple: {
    bg: "bg-purple-500/10 dark:bg-purple-500/20",
    text: "text-purple-700 dark:text-purple-400",
    bar: "bg-purple-500",
    badge: "border-purple-500/30 text-purple-700 dark:text-purple-300 bg-purple-500/10",
    border: "hover:border-purple-500/40",
  },
  rose: {
    bg: "bg-rose-500/10 dark:bg-rose-500/20",
    text: "text-rose-700 dark:text-rose-400",
    bar: "bg-rose-500",
    badge: "border-rose-500/30 text-rose-700 dark:text-rose-300 bg-rose-500/10",
    border: "hover:border-rose-500/40",
  },
  cyan: {
    bg: "bg-cyan-500/10 dark:bg-cyan-500/20",
    text: "text-cyan-700 dark:text-cyan-400",
    bar: "bg-cyan-500",
    badge: "border-cyan-500/30 text-cyan-700 dark:text-cyan-300 bg-cyan-500/10",
    border: "hover:border-cyan-500/40",
  },
};

export function BudgetEnvelopeDesktop({
  envelope,
  onTransfer,
  onEdit,
  onDelete,
}: BudgetEnvelopeDesktopProps) {
  const { percentage, remaining, overspent, status } = calculateEnvelopeProgress(
    envelope.allocatedAmount,
    envelope.spentAmount
  );

  const IconComponent = ICON_MAP[envelope.icon] || Sparkles;
  const theme = COLOR_MAP[envelope.color] || COLOR_MAP.emerald;

  return (
    <div
      className={`rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800/90 p-5 shadow-sm transition-all duration-300 hover:shadow-md ${theme.border} flex flex-col justify-between group`}
    >
      <div>
        {/* Top bar */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${theme.bg} ${theme.text} group-hover:scale-105 transition-transform`}>
              <IconComponent className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-navy-950 dark:text-cream-50">
                  {envelope.name}
                </h3>
                {envelope.rollover && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-navy-500 dark:text-cream-400 bg-cream-200/50 dark:bg-navy-900 px-1.5 py-0.5 rounded-md">
                    <Repeat className="w-2.5 h-2.5" />
                    Rollover
                  </span>
                )}
              </div>
              <p className="text-xs text-navy-600 dark:text-cream-400 mt-0.5">
                {envelope.notes || "Amplop Anggaran Bulanan Mahasiswa"}
              </p>
            </div>
          </div>

          {/* Action icon buttons */}
          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(envelope)}
              className="p-1.5 rounded-lg text-navy-500 dark:text-cream-400 hover:bg-cream-200/60 dark:hover:bg-navy-800 transition-colors"
              title="Ubah Anggaran"
              aria-label="Ubah Anggaran"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (confirm(`Hapus amplop "${envelope.name}"?`)) {
                  onDelete(envelope.id);
                }
              }}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Hapus Amplop"
              aria-label="Hapus Amplop"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="mt-5 grid grid-cols-2 gap-3 py-3 px-3.5 rounded-xl bg-cream-100/60 dark:bg-navy-900/60 border border-cream-200 dark:border-navy-800/60">
          <div>
            <span className="text-[11px] font-medium text-navy-600 dark:text-cream-400 block">
              Jatah Bulanan
            </span>
            <span className="text-sm font-black text-navy-950 dark:text-cream-100">
              {formatRupiah(envelope.allocatedAmount)}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-navy-600 dark:text-cream-400 block">
              Realisasi Pengeluaran
            </span>
            <span className="text-sm font-black text-navy-950 dark:text-cream-100">
              {formatRupiah(envelope.spentAmount)}
            </span>
          </div>
        </div>

        {/* Progress Bar & Status Pill */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-navy-600 dark:text-cream-400">
              Penggunaan: {percentage}%
            </span>
            {status === "exceeded" ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
                <AlertTriangle className="w-3.5 h-3.5" />
                Defisit {formatRupiah(overspent)}
              </span>
            ) : status === "warning" ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                <AlertTriangle className="w-3.5 h-3.5" />
                Sisa {formatRupiah(remaining)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Sisa {formatRupiah(remaining)}
              </span>
            )}
          </div>

          <div className="w-full h-3 rounded-full bg-cream-200 dark:bg-navy-900 overflow-hidden relative">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                status === "exceeded"
                  ? "bg-rose-500"
                  : status === "warning"
                  ? "bg-amber-500"
                  : theme.bar
              }`}
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>
        </div>

        {/* Category Aliases Tags */}
        {envelope.categoryAliases.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5 items-center">
            <Tag className="w-3 h-3 text-navy-400 dark:text-cream-500" />
            {envelope.categoryAliases.slice(0, 3).map((alias, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-cream-200/50 dark:bg-navy-900 text-navy-600 dark:text-cream-300"
              >
                {alias}
              </span>
            ))}
            {envelope.categoryAliases.length > 3 && (
              <span className="text-[10px] text-navy-500 dark:text-cream-400">
                +{envelope.categoryAliases.length - 3} lainnya
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className="mt-5 pt-3.5 border-t border-cream-200 dark:border-navy-800">
        <button
          onClick={() => onTransfer(envelope)}
          className="w-full py-2.5 px-3 rounded-xl bg-cream-100 hover:bg-cream-200 dark:bg-navy-900 dark:hover:bg-navy-800 text-navy-800 dark:text-cream-200 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-navy-600 dark:text-cream-400" />
          <span>Transfer Dana Pos</span>
        </button>
      </div>
    </div>
  );
}
