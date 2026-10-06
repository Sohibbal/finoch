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
  MoreVertical,
  Edit3,
  Trash2,
} from "lucide-react";
import { BudgetEnvelope } from "@/types/budget-types";
import { calculateEnvelopeProgress } from "@/lib/financial/budget-engine";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

interface BudgetEnvelopeMobileProps {
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

const COLOR_MAP: Record<string, { bg: string; text: string; bar: string; badge: string }> = {
  emerald: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-400",
    bar: "bg-emerald-500",
    badge: "border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10",
  },
  blue: {
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
    text: "text-blue-700 dark:text-blue-400",
    bar: "bg-blue-500",
    badge: "border-blue-500/30 text-blue-700 dark:text-blue-300 bg-blue-500/10",
  },
  amber: {
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    text: "text-amber-700 dark:text-amber-400",
    bar: "bg-amber-500",
    badge: "border-amber-500/30 text-amber-700 dark:text-amber-300 bg-amber-500/10",
  },
  purple: {
    bg: "bg-purple-500/10 dark:bg-purple-500/20",
    text: "text-purple-700 dark:text-purple-400",
    bar: "bg-purple-500",
    badge: "border-purple-500/30 text-purple-700 dark:text-purple-300 bg-purple-500/10",
  },
  rose: {
    bg: "bg-rose-500/10 dark:bg-rose-500/20",
    text: "text-rose-700 dark:text-rose-400",
    bar: "bg-rose-500",
    badge: "border-rose-500/30 text-rose-700 dark:text-rose-300 bg-rose-500/10",
  },
  cyan: {
    bg: "bg-cyan-500/10 dark:bg-cyan-500/20",
    text: "text-cyan-700 dark:text-cyan-400",
    bar: "bg-cyan-500",
    badge: "border-cyan-500/30 text-cyan-700 dark:text-cyan-300 bg-cyan-500/10",
  },
};

export function BudgetEnvelopeMobile({
  envelope,
  onTransfer,
  onEdit,
  onDelete,
}: BudgetEnvelopeMobileProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  const { percentage, remaining, overspent, status } = calculateEnvelopeProgress(
    envelope.allocatedAmount,
    envelope.spentAmount
  );

  const IconComponent = ICON_MAP[envelope.icon] || Sparkles;
  const theme = COLOR_MAP[envelope.color] || COLOR_MAP.emerald;

  return (
    <div className="relative rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 shadow-sm p-4 transition-all">
      {/* Top Envelope Fold Accent */}
      <div className={`absolute top-0 left-4 right-4 h-1 rounded-b-md ${theme.bar}`} />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 pt-1">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${theme.bg} ${theme.text}`}>
            <IconComponent className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-navy-950 dark:text-cream-50 leading-snug">
              {envelope.name}
            </h3>
            <p className="text-[11px] text-navy-600 dark:text-cream-400 line-clamp-1">
              {envelope.notes || "Pos Anggaran Mahasiswa"}
            </p>
          </div>
        </div>

        {/* Options dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-navy-500 dark:text-cream-400 hover:bg-cream-100 dark:hover:bg-navy-900"
            aria-label="Menu Amplop"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-9 z-20 w-36 bg-white dark:bg-navy-900 rounded-xl shadow-lg border border-cream-300 dark:border-navy-800 py-1 text-xs">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onEdit(envelope);
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-cream-100 dark:hover:bg-navy-800 text-navy-800 dark:text-cream-200"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Ubah Anggaran</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  if (confirm(`Hapus amplop "${envelope.name}"?`)) {
                    onDelete(envelope.id);
                  }
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Pos</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress & Numbers */}
      <div className="mt-3.5 space-y-1.5">
        <div className="flex justify-between items-baseline text-xs">
          <span className="text-navy-600 dark:text-cream-400 font-medium">Terpakai:</span>
          <span className="font-bold text-navy-950 dark:text-cream-100">
            {formatRupiah(envelope.spentAmount)}{" "}
            <span className="text-[11px] font-normal text-navy-500 dark:text-cream-400">
              / {formatRupiah(envelope.allocatedAmount)}
            </span>
          </span>
        </div>

        {/* Tactile progress bar */}
        <div className="w-full h-2.5 rounded-full bg-cream-200 dark:bg-navy-900 overflow-hidden relative">
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

        {/* Status pill & remaining */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] font-semibold text-navy-600 dark:text-cream-400">
            {percentage}% terpakai
          </span>

          {status === "exceeded" ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              <AlertTriangle className="w-3 h-3" />
              Over {formatRupiah(overspent)}
            </span>
          ) : status === "warning" ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              <AlertTriangle className="w-3 h-3" />
              Sisa {formatRupiah(remaining)}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" />
              Sisa {formatRupiah(remaining)}
            </span>
          )}
        </div>
      </div>

      {/* Action Button: Touch Target >= 48px */}
      <div className="mt-3 pt-3 border-t border-cream-200 dark:border-navy-800/80">
        <button
          onClick={() => onTransfer(envelope)}
          className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-cream-100 hover:bg-cream-200 dark:bg-navy-900 dark:hover:bg-navy-800 text-navy-800 dark:text-cream-200 text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-navy-600 dark:text-cream-400" />
          <span>Pindahkan Dana</span>
        </button>
      </div>
    </div>
  );
}
