import React from "react";

/** One receipt line, label and amount joined by a dotted leader. Use inside a <dl>. */
export function ReceiptLine({ label, amount, strong = false }: { label: React.ReactNode; amount: string; strong?: boolean }) {
  return (
    <div className={`flex items-baseline gap-2 text-ink ${strong ? "font-bold" : ""}`}>
      <dt className="text-body">{label}</dt>
      <span aria-hidden="true" className="flex-1 min-w-4 border-b border-dotted border-ink/40 -translate-y-1" />
      <dd className="money text-body whitespace-nowrap">{amount}</dd>
    </div>
  );
}
