import React from "react";

/**
 * Note denominations: each colour prints a field (solid band), a soft fill (progress, highlights)
 * and an ink for text on paper that keeps AA contrast.
 */
export const DENOMS = {
  blue: { field: "bg-denom-blue", soft: "bg-denom-blue/20", edge: "border-denom-blue", ink: "text-denom-blue" },
  violet: { field: "bg-denom-violet", soft: "bg-denom-violet/20", edge: "border-denom-violet", ink: "text-denom-violet" },
  green: { field: "bg-aman", soft: "bg-aman/20", edge: "border-aman", ink: "text-aman-ink" },
  ochre: { field: "bg-mepet", soft: "bg-mepet/20", edge: "border-mepet", ink: "text-mepet-ink" },
  red: { field: "bg-habis", soft: "bg-habis/20", edge: "border-habis", ink: "text-habis-ink" },
} as const;

export type Denom = keyof typeof DENOMS;

export type CapTone = "aman" | "mepet" | "habis" | "ink";

// Same outline grammar as StatusStamp: the form tells the state apart, not only the hue.
const CAP_TONE: Record<CapTone, string> = {
  aman: "border-2 border-aman-ink text-aman-ink",
  mepet: "border-[3px] border-double border-mepet-ink text-mepet-ink",
  habis: "border-2 border-habis-ink text-habis-ink",
  ink: "border-2 border-ink/70 text-ink",
};

interface CapProps {
  children: React.ReactNode;
  tone?: CapTone;
  /** Tilt in degrees; stamps never land straight. */
  tilt?: number;
  className?: string;
}

/** A rubber cap stamped on a sheet: LUNAS, TERCAPAI, NAIK. Rotated, outlined, never filled. */
export function Cap({ children, tone = "ink", tilt = -6, className = "" }: CapProps) {
  return (
    <span
      style={{ transform: `rotate(${tilt}deg)` }}
      className={`inline-block shrink-0 px-2 py-0.5 rounded-sm text-meta font-bold uppercase tracking-[0.12em] whitespace-nowrap ${CAP_TONE[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
