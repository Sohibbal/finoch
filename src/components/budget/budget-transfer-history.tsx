"use client";

import React from "react";
import { EnvelopeTransferRecord } from "@/types/budget-types";
import { rupiah, shortDate } from "@/lib/format";
import { formatSerial } from "@/components/press/serial";

interface BudgetTransferHistoryProps {
  transfers: EnvelopeTransferRecord[];
}

/** Every move between envelopes, as serial-numbered stubs. */
export function BudgetTransferHistory({ transfers }: BudgetTransferHistoryProps) {
  return (
    <section aria-labelledby="pindah-amplop-title" className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-ink/20 pb-2">
        <h2 id="pindah-amplop-title" className="font-display text-head font-bold text-ink">
          Riwayat pindah isi
        </h2>
        <p className="text-meta text-ink-soft">{transfers.length} kali</p>
      </div>

      {transfers.length === 0 ? (
        <p className="text-body text-ink-soft py-2">
          Belum ada. Kalau amplop nongkrong habis duluan, pindahkan isi dari amplop lain, catatannya muncul di sini.
        </p>
      ) : (
        <ol className="space-y-2">
          {transfers.map((item) => (
            <li key={item.id} className="relative pl-4 pr-3 py-3 bg-paper-sheet border border-ink/15">
              <span aria-hidden="true" className="absolute left-1.5 top-2 bottom-2 border-l border-dotted border-ink/40" />
              <div className="flex items-start justify-between gap-3">
                <p className="text-body font-semibold text-ink break-words min-w-0">
                  {item.fromEnvelopeName} <span aria-hidden="true">→</span>
                  <span className="sr-only">ke</span> {item.toEnvelopeName}
                </p>
                <p className="money text-body font-bold text-ink whitespace-nowrap">{rupiah(item.amount)}</p>
              </div>
              <p className="text-meta text-ink-soft break-words">
                {item.reason || "Penyeimbangan anggaran"} · {shortDate(new Date(item.createdAt))}
              </p>
              <p className="text-meta text-ink-soft money tracking-[0.08em]">{formatSerial(item.id, new Date(item.createdAt))}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
