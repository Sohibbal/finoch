"use client";

import React from "react";
import { Check } from "lucide-react";
import { Guilloche } from "./guilloche";

export type Denom = "blue" | "violet" | "green" | "ochre" | "red";

/**
 * Denomination fields. Each pairs a printed color with paper-colored type that passes AA
 * in both themes (green, ochre and red use their darker ink shade so cream text stays legible).
 */
export const DENOM_FIELD: Record<Denom, string> = {
  blue: "bg-denom-blue text-paper-sheet",
  violet: "bg-denom-violet text-paper-sheet",
  green: "bg-aman-ink text-paper-sheet",
  ochre: "bg-mepet-ink text-paper-sheet",
  red: "bg-habis-ink text-paper-sheet",
};

/** Ink-on-paper accents for the same denominations (rules, plates, swatches). */
export const DENOM_INK: Record<Denom, string> = {
  blue: "text-denom-blue border-denom-blue",
  violet: "text-denom-violet border-denom-violet",
  green: "text-aman-ink border-aman-ink",
  ochre: "text-mepet-ink border-mepet-ink",
  red: "text-habis-ink border-habis-ink",
};

export const DENOM_LABEL: Record<Denom, string> = {
  blue: "Biru",
  violet: "Ungu",
  green: "Hijau",
  ochre: "Cokelat",
  red: "Merah",
};

// Stored color names predate the press palette; they keep working and print as the nearest note.
const LEGACY: Record<string, Denom> = {
  emerald: "green",
  blue: "blue",
  cyan: "blue",
  purple: "violet",
  amber: "ochre",
  rose: "red",
};

/** The note color for a stored wallet/envelope color name. */
export function denomOf(color?: string | null): Denom {
  return (color && LEGACY[color]) || "green";
}

/** Stable rosette seed per item, so every note carries its own pattern. */
export function seedOf(id: string): number {
  let h = 7;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

export type CapTone = "aman" | "mepet" | "habis" | "ink" | "paper";

// Like StatusStamp, tones differ by outline form too: single, double, filled.
const CAP_TONE: Record<CapTone, string> = {
  aman: "border-2 border-aman-ink text-aman-ink",
  mepet: "border-[3px] border-double border-mepet-ink text-mepet-ink",
  habis: "border-2 border-habis-ink bg-habis-ink text-paper-sheet",
  ink: "border-2 border-ink text-ink",
  paper: "border-2 border-paper-sheet text-paper-sheet",
};

interface CapProps {
  children: React.ReactNode;
  tone: CapTone;
  /** Degrees; stamps never land straight. */
  tilt?: number;
  /** Thump the stamp down when it first appears (e.g. right after Tandai lunas). */
  press?: boolean;
  className?: string;
}

/** A rubber stamp (cap) with a word on it: LUNAS, TELAT, MEPET... */
export function Cap({ children, tone, tilt = -6, press = false, className = "" }: CapProps) {
  const [down, setDown] = React.useState(!press);
  React.useEffect(() => {
    if (!press) return;
    const frame = requestAnimationFrame(() => setDown(true));
    return () => cancelAnimationFrame(frame);
  }, [press]);
  return (
    <span
      style={{ transform: `rotate(${tilt}deg) scale(${down ? 1 : 1.6})`, opacity: down ? 1 : 0 }}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-meta font-bold uppercase tracking-[0.08em] whitespace-nowrap motion-safe:transition-[transform,opacity] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] ${CAP_TONE[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

interface DenomSheetProps {
  denom: Denom;
  seed: number;
  children: React.ReactNode;
  as?: "article" | "div" | "li";
  className?: string;
  "aria-labelledby"?: string;
}

/**
 * A note printed in its denomination color: a flat color field, a paper-toned rosette
 * and corner registration marks. No gradients, no shadows.
 */
export function DenomSheet({ denom, seed, children, as: Tag = "article", className = "", ...aria }: DenomSheetProps) {
  return (
    <Tag className={`relative overflow-hidden ${DENOM_FIELD[denom]} ${className}`} {...aria}>
      <Guilloche
        seed={seed}
        size={200}
        families={3}
        className="absolute -right-14 -top-12 !text-paper-sheet opacity-35 pointer-events-none"
      />
      <span aria-hidden="true" className="absolute top-1.5 left-1.5 w-3 h-3 border-t border-l border-current opacity-70" />
      <span aria-hidden="true" className="absolute top-1.5 right-1.5 w-3 h-3 border-t border-r border-current opacity-70" />
      <span aria-hidden="true" className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b border-l border-current opacity-70" />
      <span aria-hidden="true" className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b border-r border-current opacity-70" />
      <div className="relative">{children}</div>
    </Tag>
  );
}

/** The colors a wallet or envelope can be printed in, by stored name (cyan is read as blue). */
export const DENOM_CHOICES: { id: string; denom: Denom }[] = [
  { id: "blue", denom: "blue" },
  { id: "purple", denom: "violet" },
  { id: "emerald", denom: "green" },
  { id: "amber", denom: "ochre" },
  { id: "rose", denom: "red" },
];

/** Five note colors as a labelled swatch row; the chosen one is pressed and ticked. */
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
