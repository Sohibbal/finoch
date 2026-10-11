import React from "react";

/** FNV-1a: a stable 32-bit number from any id. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** "FNC·111026·0042": day of the note plus four digits derived from its id. */
export function formatSerial(id: string, date: Date | string): string {
  const d = typeof date === "string" ? new Date(`${date.slice(0, 10)}T00:00:00`) : date;
  const ok = !isNaN(d.getTime());
  const day = ok
    ? `${String(d.getDate()).padStart(2, "0")}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getFullYear() % 100).padStart(2, "0")}`
    : "000000";
  return `FNC·${day}·${String(hash(id) % 10000).padStart(4, "0")}`;
}

interface SerialProps {
  id: string;
  date: Date | string;
  className?: string;
}

/** Printed serial number; read out as plain text by screen readers. */
export function Serial({ id, date, className = "" }: SerialProps) {
  return (
    <span className={`money text-meta tracking-[0.12em] text-ink-soft ${className}`}>
      {formatSerial(id, date)}
    </span>
  );
}
