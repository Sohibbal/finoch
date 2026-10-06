"use client";

import React from "react";
import { ArrowRightLeft, Calendar, History } from "lucide-react";
import { EnvelopeTransferRecord } from "@/types/budget-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

interface BudgetTransferHistoryProps {
  transfers: EnvelopeTransferRecord[];
}

export function BudgetTransferHistory({ transfers }: BudgetTransferHistoryProps) {
  if (transfers.length === 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 p-6 text-center shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-cream-100 dark:bg-navy-900 text-navy-400 dark:text-cream-400 mx-auto flex items-center justify-center mb-2">
          <History className="w-5 h-5" />
        </div>
        <h4 className="text-xs font-bold text-navy-900 dark:text-cream-100">
          Belum Ada Riwayat Transfer Antar Pos
        </h4>
        <p className="text-[11px] text-navy-500 dark:text-cream-400 mt-1 max-w-xs mx-auto">
          Setiap kali kamu memindahkan alokasi dana antar amplop (misal dari Nongkrong ke Makan), catatannya akan muncul di sini.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-cream-200 dark:border-navy-800">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h4 className="font-bold text-xs uppercase tracking-wider text-navy-950 dark:text-cream-50">
            Riwayat Penyeimbangan Dana Pos
          </h4>
        </div>
        <span className="text-[11px] text-navy-500 dark:text-cream-400 font-semibold">
          {transfers.length} Transaksi
        </span>
      </div>

      <div className="divide-y divide-cream-200 dark:divide-navy-800/80">
        {transfers.map((item) => (
          <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-navy-950 dark:text-cream-100">
                <span>{item.fromEnvelopeName}</span>
                <ArrowRightLeft className="w-3 h-3 text-navy-400" />
                <span>{item.toEnvelopeName}</span>
              </div>
              <p className="text-[11px] text-navy-600 dark:text-cream-400 mt-0.5">
                {item.reason || "Penyeimbangan anggaran"}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-navy-500 dark:text-cream-400 mt-0.5">
                <Calendar className="w-2.5 h-2.5" />
                <span>
                  {new Date(item.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold text-xs text-navy-900 dark:text-cream-100">
                {formatRupiah(item.amount)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
