"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { X, type LucideIcon } from "lucide-react";

/**
 * Shared pieces for the kampus pages (Tabungan UKT, Wishlist Tunda, Split Bill,
 * Masak vs Warteg, Streak Hemat): denomination fields, custom-label stamps,
 * option buttons, form fields and the paper dialog.
 */

export type Denom = "blue" | "violet" | "green" | "ochre";

// Ink on each field passes AA in both themes: cream on blue/violet, fixed navy on green/ochre.
export const DENOM: Record<Denom, { field: string; ink: string; soft: string; border: string }> = {
  blue: { field: "bg-denom-blue", ink: "text-paper-sheet", soft: "text-paper-sheet/85", border: "border-denom-blue" },
  violet: { field: "bg-denom-violet", ink: "text-paper-sheet", soft: "text-paper-sheet/85", border: "border-denom-violet" },
  green: { field: "bg-aman", ink: "text-navy-900", soft: "text-navy-900/80", border: "border-aman" },
  ochre: { field: "bg-mepet", ink: "text-navy-900", soft: "text-navy-900/80", border: "border-mepet" },
};

export type StampTone = "aman" | "mepet" | "habis" | "ink";

// Tones differ by outline form as well as hue, like the dashboard's status stamps.
const STAMP_TONE: Record<StampTone, string> = {
  aman: "border-2 border-aman-ink text-aman-ink",
  mepet: "border-[3px] border-double border-mepet-ink text-mepet-ink",
  habis: "border-2 border-dashed border-habis-ink text-habis-ink",
  ink: "border-2 border-ink text-ink",
};

interface StampProps {
  label: React.ReactNode;
  tone?: StampTone;
  icon?: LucideIcon;
  /** Filled stamp (ink pressed hard): reserved for final states like Lunas. */
  solid?: boolean;
  /** Presses the stamp in when it first appears; never on the first paint of a page. */
  fresh?: boolean;
  className?: string;
}

/** A rubber stamp with any label, slightly rotated: Lunas, Tunda 3 hari, Diselamatkan. */
export function Stamp({ label, tone = "ink", icon: Icon, solid = false, fresh = false, className = "" }: StampProps) {
  const [pressed, setPressed] = useState(!fresh);
  useEffect(() => {
    if (!fresh) return;
    const frame = requestAnimationFrame(() => setPressed(true));
    return () => cancelAnimationFrame(frame);
  }, [fresh]);

  const form = solid
    ? tone === "ink"
      ? "border-2 border-ink bg-ink text-paper-sheet"
      : tone === "aman"
        ? "border-2 border-aman-ink bg-aman-ink text-paper-sheet"
        : tone === "mepet"
          ? "border-2 border-mepet-ink bg-mepet-ink text-paper-sheet"
          : "border-2 border-habis-ink bg-habis-ink text-paper-sheet"
    : STAMP_TONE[tone];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm -rotate-3 text-meta font-bold uppercase tracking-[0.08em] whitespace-nowrap motion-safe:transition-[transform,opacity] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] ${
        pressed ? "" : "motion-safe:scale-150 motion-safe:opacity-0"
      } ${form} ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} aria-hidden="true" />}
      {label}
    </span>
  );
}

/** Torn edge across a sheet: a dashed perforation with a half-moon notch at each end. */
export function Perforation({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`relative h-0 border-t border-dashed border-ink/40 ${className}`}>
      <span className="absolute -left-2 -top-2 w-4 h-4 rounded-full bg-paper border border-ink/20" />
      <span className="absolute -right-2 -top-2 w-4 h-4 rounded-full bg-paper border border-ink/20" />
    </div>
  );
}

export const FIELD_CLASS =
  "w-full min-h-11 px-3 bg-paper-sheet border border-ink/30 text-body text-ink placeholder:text-ink-soft focus:outline-none focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/30";

export const LABEL_CLASS = "block text-meta font-semibold text-ink-soft mb-1";

export const SECONDARY_CLASS =
  "inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-full border border-ink/30 text-ink text-body font-semibold hover:bg-ink/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export const PRIMARY_CLASS =
  "inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-full bg-ink hover:bg-ink/90 text-paper-sheet font-semibold text-body transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

interface OptionButtonProps {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
}

/** One choice in a set (mode, PB1 %, porsi): pressed reads as ink-filled. */
export function OptionButton({ pressed, onClick, children, className = "", ...aria }: OptionButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`min-h-11 px-3 border text-body font-semibold transition-colors ${
        pressed ? "bg-ink text-paper-sheet border-ink" : "bg-paper-sheet text-ink border-ink/30 hover:bg-ink/5"
      } ${className}`}
      {...aria}
    >
      {children}
    </button>
  );
}

interface PaperDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

/** A form sheet over the page: slides up from the bottom on phones, centred on desktop. */
export function PaperDialog({ isOpen, onClose, title, subtitle, children }: PaperDialogProps) {
  const titleId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    sheetRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-navy-950/50" onClick={onClose}>
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-lg max-h-[92dvh] flex flex-col bg-paper-sheet border border-ink/20 focus:outline-none"
      >
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-ink/15">
          <div className="min-w-0">
            <h2 id={titleId} className="font-display text-head font-bold text-ink">
              {title}
            </h2>
            {subtitle && <p className="text-meta text-ink-soft mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="-mr-2 w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-ink hover:bg-ink/5 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">{children}</div>
      </div>
    </div>
  );
}
