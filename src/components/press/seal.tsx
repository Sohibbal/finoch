import React from "react";
import { Mic } from "lucide-react";
import { Guilloche } from "./guilloche";

interface SealProps {
  onClick: () => void;
  /** Accessible name; the visible word stays "Catat". */
  label?: string;
  /** Diameter in px, never below the 72px thumb target. */
  size?: number;
  className?: string;
}

/** The round "Catat" seal: the primary action, a stamped rosette with a mic. */
export function Seal({ onClick, label = "Catat pengeluaran dengan suara", size = 76, className = "" }: SealProps) {
  const d = Math.max(72, size);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{ width: d, height: d }}
      className={`group relative shrink-0 rounded-full bg-ink text-paper-sheet dark:text-paper flex flex-col items-center justify-center gap-0.5 ring-4 ring-paper motion-safe:transition-transform motion-safe:duration-200 active:scale-95 focus-visible:outline-offset-4 ${className}`}
    >
      <Guilloche
        seed={0x5ea1}
        size={d - 8}
        families={2}
        className="absolute inset-1 !text-paper-sheet dark:!text-paper opacity-40"
      />
      <Mic className="relative w-6 h-6" strokeWidth={2.2} aria-hidden="true" />
      <span className="relative text-meta font-bold uppercase tracking-[0.1em]">Catat</span>
    </button>
  );
}
