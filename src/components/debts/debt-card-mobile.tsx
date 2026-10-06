"use client";

import React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Trash2,
  Check,
  RotateCcw,
} from "lucide-react";
import { DebtItem } from "@/types/debt-types";
import { generateWhatsAppDebtReminder } from "@/lib/financial/debt-engine";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

interface DebtCardMobileProps {
  debt: DebtItem;
  onTogglePaid: (id: string) => void;
  onDelete: (id: string) => void;
}

export function DebtCardMobile({ debt, onTogglePaid, onDelete }: DebtCardMobileProps) {
  const isReceivable = debt.type === "receivable";
  const isPaid = debt.status === "paid";

  const handleNudgeWhatsApp = () => {
    const text = generateWhatsAppDebtReminder(debt);
    const phoneClean = debt.phone ? debt.phone.replace(/[^0-9]/g, "") : "";
    const waUrl = phoneClean
      ? `https://wa.me/${phoneClean.startsWith("0") ? "62" + phoneClean.slice(1) : phoneClean}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: "Pengingat Kasbon", text }).catch(() => {
        window.open(waUrl, "_blank");
      });
    } else {
      window.open(waUrl, "_blank");
    }
  };

  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm transition-all ${
        isPaid
          ? "bg-cream-100/60 dark:bg-navy-950/40 border-cream-300 dark:border-navy-900 opacity-70"
          : isReceivable
          ? "bg-white dark:bg-[#070E1A] border-emerald-500/30"
          : "bg-white dark:bg-[#070E1A] border-amber-500/30"
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isReceivable
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            }`}
          >
            {isReceivable ? (
              <ArrowDownLeft className="w-4 h-4 stroke-[2.2]" />
            ) : (
              <ArrowUpRight className="w-4 h-4 stroke-[2.2]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-xs text-navy-950 dark:text-cream-50 leading-snug">
                {debt.personName}
              </h3>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                  isReceivable
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                }`}
              >
                {isReceivable ? "Piutang Saya" : "Hutang Saya"}
              </span>
            </div>
            <p className="text-[11px] text-navy-600 dark:text-cream-400 line-clamp-1 mt-0.5">
              {debt.description}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div
            className={`font-black text-xs ${
              isReceivable
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400"
            }`}
          >
            {formatRupiah(debt.amount)}
          </div>
          {debt.dueDate && (
            <span className="text-[10px] text-navy-500 dark:text-cream-400 flex items-center gap-0.5 justify-end mt-0.5">
              <Calendar className="w-2.5 h-2.5" />
              <span>{debt.dueDate}</span>
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons: Touch Target >= 48px */}
      <div className="mt-3 pt-3 border-t border-cream-200 dark:border-navy-800/80 flex items-center gap-2">
        {!isPaid ? (
          <>
            <button
              onClick={handleNudgeWhatsApp}
              className="flex-1 min-h-[44px] py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ingatkan WA</span>
            </button>

            <button
              onClick={() => onTogglePaid(debt.id)}
              className="flex-1 min-h-[44px] py-2 px-3 rounded-xl bg-navy-950 dark:bg-cream-100 text-white dark:text-navy-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Tandai Lunas</span>
            </button>
          </>
        ) : (
          <div className="w-full flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Lunas
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => onTogglePaid(debt.id)}
                className="text-[11px] font-semibold text-navy-500 hover:text-navy-700 dark:text-cream-400 flex items-center gap-1 p-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Batal Lunas</span>
              </button>
              <button
                onClick={() => {
                  if (confirm("Hapus catatan ini?")) onDelete(debt.id);
                }}
                className="text-rose-500 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
