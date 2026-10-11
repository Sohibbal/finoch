import React from "react";
import { rupiah } from "@/lib/format";
import { Serial } from "./serial";
import { Perforation, PRIMARY_CLASS, SECONDARY_CLASS } from "./kampus-press";

export interface ReceiptItem {
  name: string;
  amount: number;
}

/** "Tercatat Rp 20.000" and "2 item · jatah hari ini sisa Rp 35.000": the save receipt's two lines. */
export function receiptLines(items: ReceiptItem[], sisaHariIni?: number): [string, string] {
  const total = items.reduce((sum, i) => sum + i.amount, 0);
  const detail = [`${items.length} item`];
  if (sisaHariIni !== undefined) {
    detail.push(sisaHariIni >= 0 ? `jatah hari ini sisa ${rupiah(sisaHariIni)}` : `lewat ${rupiah(-sisaHariIni)} dari jatah hari ini`);
  }
  return [`Tercatat ${rupiah(total)}`, detail.join(" · ")];
}

interface SaveReceiptProps {
  items: ReceiptItem[];
  /** First saved id + its day print the receipt's serial. */
  serialId: string;
  date: string;
  /** Today's jatah left after this save; omitted where no jatah is known. */
  sisaHariIni?: number;
  onUndo: () => void;
  onDone: () => void;
  undoing?: boolean;
  error?: string | null;
}

/** What a save prints: an itemised slip with its serial, plus Batalkan (undo) and Selesai. */
export function SaveReceipt({ items, serialId, date, sisaHariIni, onUndo, onDone, undoing = false, error }: SaveReceiptProps) {
  const [head, detail] = receiptLines(items, sisaHariIni);
  return (
    <section aria-live="polite" className="space-y-4">
      <div className="animate-stub-in bg-paper-sheet border border-ink/20 pt-4">
        <Perforation className="mx-2 mb-4" />
        <div className="px-4 pb-4 space-y-3">
          <div>
            <p className="font-display text-head font-bold text-ink money">{head}</p>
            <p className="text-body text-ink">{detail}</p>
          </div>
          <ul className="border-t border-dotted border-ink/40 pt-2 space-y-1">
            {items.map((item, i) => (
              <li key={i} className="flex items-baseline gap-2 text-body text-ink">
                <span className="min-w-0 break-words">{item.name}</span>
                <span aria-hidden="true" className="flex-1 border-b border-dotted border-ink/30" />
                <span className="money font-semibold whitespace-nowrap">{rupiah(item.amount)}</span>
              </li>
            ))}
          </ul>
          <Serial id={serialId} date={date} className="block" />
        </div>
      </div>
      {error && <p role="alert" className="text-body text-habis-ink">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={onUndo} disabled={undoing} className={SECONDARY_CLASS}>
          {undoing ? "Membatalkan..." : "Batalkan"}
        </button>
        <button type="button" onClick={onDone} disabled={undoing} className={`${PRIMARY_CLASS} flex-1`}>
          Selesai
        </button>
      </div>
    </section>
  );
}
