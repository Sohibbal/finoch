import React from "react";
import { Check, CloudOff, TriangleAlert, X } from "lucide-react";

export type MoneyStatus = "aman" | "mepet" | "habis";
export type StampStatus = MoneyStatus | "tertunda";

// Each status differs by outline form and glyph, not only by hue.
const STAMPS: Record<StampStatus, { label: string; icon: typeof Check; className: string }> = {
  aman: { label: "Aman", icon: Check, className: "border border-aman-ink text-aman-ink" },
  mepet: { label: "Mepet", icon: TriangleAlert, className: "border-[3px] border-double border-mepet-ink text-mepet-ink" },
  habis: { label: "Habis", icon: X, className: "border border-habis bg-habis text-paper-sheet dark:text-paper" },
  tertunda: { label: "Tertunda sinkron", icon: CloudOff, className: "border border-dashed border-ink-soft text-ink-soft" },
};

interface StatusStampProps {
  status: StampStatus;
  className?: string;
}

/** Rubber-stamp status mark: Aman · Mepet · Habis · Tertunda sinkron. */
export function StatusStamp({ status, className = "" }: StatusStampProps) {
  const { label, icon: Icon, className: form } = STAMPS[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm -rotate-2 text-meta font-semibold uppercase tracking-[0.08em] ${form} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} aria-hidden="true" />
      {label}
    </span>
  );
}
