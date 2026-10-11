"use client";

import React from "react";
import { Check, type LucideIcon } from "lucide-react";
import { Guilloche } from "./guilloche";

/**
 * Note denominations, the one table every page prints from. Green, ochre and red belong to
 * status (Aman, Mepet, Habis) only, so notes print in blue, violet, teal or slate. Each passes
 * AA with paper-colored type in both themes.
 */
export type Denom = "blue" | "violet" | "teal" | "slate";

const TABLE: Record<Denom, { field: string; border: string; tint: string; onPaper: string; label: string }> = {
  blue: { field: "bg-denom-blue", border: "border-denom-blue", tint: "bg-denom-blue/20", onPaper: "text-denom-blue", label: "Biru" },
  violet: { field: "bg-denom-violet", border: "border-denom-violet", tint: "bg-denom-violet/20", onPaper: "text-denom-violet", label: "Ungu" },
  teal: {
    field: "bg-denom-teal dark:bg-denom-teal-dark",
    border: "border-denom-teal dark:border-denom-teal-dark",
    tint: "bg-denom-teal/20 dark:bg-denom-teal-dark/20",
    onPaper: "text-denom-teal dark:text-denom-teal-dark",
    label: "Toska",
  },
  slate: {
    field: "bg-denom-slate dark:bg-denom-slate-dark",
    border: "border-denom-slate dark:border-denom-slate-dark",
    tint: "bg-denom-slate/20 dark:bg-denom-slate-dark/20",
    onPaper: "text-denom-slate dark:text-denom-slate-dark",
    label: "Abu",
  },
};

const DENOM_KEYS = Object.keys(TABLE) as Denom[];
const mapDenoms = <T,>(fn: (d: (typeof TABLE)[Denom]) => T) =>
  Object.fromEntries(DENOM_KEYS.map((k) => [k, fn(TABLE[k])])) as Record<Denom, T>;

/** Color field plus paper-colored type: a whole printed note. */
export const DENOM_FIELD = mapDenoms((d) => `${d.field} text-paper-sheet`);
/** The denomination as ink on paper (rules, plates, swatches). */
export const DENOM_INK = mapDenoms((d) => `${d.onPaper} ${d.border}`);
export const DENOM_LABEL = mapDenoms((d) => d.label);
/** Pieces of a note for layouts that compose them: field, type on the field, edge. */
export const DENOM = mapDenoms((d) => ({ field: d.field, ink: "text-paper-sheet", soft: "text-paper-sheet/85", border: d.border }));
/** Pieces for ink-on-paper layouts: field band, soft fill (progress), edge, ink. */
export const DENOMS = mapDenoms((d) => ({ field: d.field, soft: d.tint, edge: d.border, ink: d.onPaper }));

// Stored color names predate the press palette; they keep working and print as a non-status note.
const LEGACY: Record<string, Denom> = {
  blue: "blue",
  cyan: "blue",
  purple: "violet",
  violet: "violet",
  emerald: "teal",
  teal: "teal",
  amber: "slate",
  rose: "violet",
  slate: "slate",
};

/** The note color for a stored wallet/envelope color name; unknown names print slate. */
export function denomOf(color?: string | null): Denom {
  return (color && LEGACY[color]) || "slate";
}

/** Stable rosette seed per item, so every note carries its own pattern. */
export function seedOf(id: string): number {
  let h = 7;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

export type CapTone = "aman" | "mepet" | "habis" | "ink" | "paper";
export type StampTone = CapTone;

// Tones differ by outline form as well as hue (single, double, heavy), like StatusStamp. Dashed is
// reserved for Tertunda sinkron, so habis never prints dashed.
const CAP_TONE: Record<CapTone, string> = {
  aman: "border-2 border-aman-ink text-aman-ink",
  mepet: "border-[3px] border-double border-mepet-ink text-mepet-ink",
  habis: "border-4 border-habis-ink text-habis-ink",
  ink: "border-2 border-ink text-ink",
  paper: "border-2 border-paper-sheet text-paper-sheet",
};

// Ink pressed hard: reserved for final states like LUNAS.
const CAP_SOLID: Record<CapTone, string> = {
  aman: "border-2 border-aman-ink bg-aman-ink text-paper-sheet",
  mepet: "border-2 border-mepet-ink bg-mepet-ink text-paper-sheet",
  habis: "border-2 border-habis-ink bg-habis-ink text-paper-sheet",
  ink: "border-2 border-ink bg-ink text-paper-sheet",
  paper: "border-2 border-paper-sheet bg-paper-sheet text-ink",
};

interface CapProps {
  children: React.ReactNode;
  tone?: CapTone;
  /** Degrees; stamps never land straight. */
  tilt?: number;
  solid?: boolean;
  icon?: LucideIcon;
  /** Thump the stamp down when it first appears (e.g. right after Tandai lunas). */
  press?: boolean;
  className?: string;
}

/** A rubber stamp (cap) with a word on it: LUNAS, TELAT, MEPET, Tunda 3 hari... */
export function Cap({ children, tone = "ink", tilt = -6, solid = false, icon: Icon, press = false, className = "" }: CapProps) {
  const [down, setDown] = React.useState(!press);
  React.useEffect(() => {
    if (!press) return;
    const frame = requestAnimationFrame(() => setDown(true));
    return () => cancelAnimationFrame(frame);
  }, [press]);
  return (
    <span
      style={{ transform: `rotate(${tilt}deg) scale(${down ? 1 : 1.6})`, opacity: down ? 1 : 0 }}
      className={`inline-flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-sm text-meta font-bold uppercase tracking-[0.08em] whitespace-nowrap motion-safe:transition-[transform,opacity] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] ${
        solid ? CAP_SOLID[tone] : CAP_TONE[tone]
      } ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} aria-hidden="true" />}
      {children}
    </span>
  );
}

/** Label-prop form of Cap used by the kampus pages; same stamp, slightly less tilt. */
export function Stamp({ label, fresh = false, tilt = -3, ...rest }: Omit<CapProps, "children" | "press"> & { label: React.ReactNode; fresh?: boolean }) {
  return (
    <Cap {...rest} tilt={tilt} press={fresh}>
      {label}
    </Cap>
  );
}

interface DenomSheetProps {
  denom: Denom;
  seed: number;
  children: React.ReactNode;
  as?: "article" | "div" | "li";
  className?: string;
  "aria-labelledby"?: string;
  /** Slips whose heading spans the full width print without the rosette, so it never sits in text. */
  rosette?: boolean;
}

/**
 * A note printed in its denomination color: a flat color field, a paper-toned rosette
 * and corner registration marks. No gradients, no shadows.
 */
export function DenomSheet({ denom, seed, children, as: Tag = "article", className = "", rosette = true, ...aria }: DenomSheetProps) {
  return (
    <Tag className={`relative overflow-hidden ${DENOM_FIELD[denom]} ${className}`} {...aria}>
      {rosette && (
        <Guilloche
          seed={seed}
          size={200}
          families={3}
          className="absolute -right-14 -top-12 !text-paper-sheet opacity-35 pointer-events-none"
        />
      )}
      <span aria-hidden="true" className="absolute top-1.5 left-1.5 w-3 h-3 border-t border-l border-current opacity-70" />
      <span aria-hidden="true" className="absolute top-1.5 right-1.5 w-3 h-3 border-t border-r border-current opacity-70" />
      <span aria-hidden="true" className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b border-l border-current opacity-70" />
      <span aria-hidden="true" className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b border-r border-current opacity-70" />
      <div className="relative">{children}</div>
    </Tag>
  );
}

/** The colors a wallet or envelope can be printed in, by stored name. */
export const DENOM_CHOICES: { id: string; denom: Denom }[] = [
  { id: "blue", denom: "blue" },
  { id: "purple", denom: "violet" },
  { id: "teal", denom: "teal" },
  { id: "slate", denom: "slate" },
];

/** The note colors as a labelled swatch row; the chosen one is pressed and ticked. */
export function DenomPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const current = denomOf(value);
  return (
    <div role="group" aria-label="Warna lembar" className="flex flex-wrap gap-2">
      {DENOM_CHOICES.map((c) => {
        const on = c.denom === current;
        return (
          <button
            key={c.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(c.id)}
            className={`min-h-11 px-3 inline-flex items-center gap-1.5 text-meta font-semibold ${DENOM_FIELD[c.denom]} ${
              on ? "outline outline-2 outline-offset-2 outline-ink" : ""
            }`}
          >
            {on && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
            {DENOM_LABEL[c.denom]}
          </button>
        );
      })}
    </div>
  );
}
