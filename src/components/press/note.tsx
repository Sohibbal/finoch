import React from "react";
import type { MoneyStatus } from "./status-stamp";

const THREAD: Record<MoneyStatus, string> = {
  aman: "border-aman",
  mepet: "border-mepet",
  habis: "border-habis",
};

interface NoteProps {
  children: React.ReactNode;
  /** Colors the vertical security thread; omit for a plain sheet. */
  thread?: MoneyStatus;
  /** Printed bottom-left, e.g. a <Serial/>. */
  serial?: React.ReactNode;
  /** Draws the wavy microtext rule above the serial line. */
  microtext?: boolean;
  as?: "section" | "div" | "article";
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

/** Corner registration mark: two hairlines meeting at the sheet corner. */
function Corner({ className }: { className: string }) {
  return <span aria-hidden="true" className={`absolute w-3 h-3 border-ink/50 ${className}`} />;
}

/**
 * Lembar: the banknote-like sheet every surface is printed on.
 * Cream paper, hairline border, registration marks; no shadows or gradients.
 */
export function Note({ children, thread, serial, microtext = false, as: Tag = "div", className = "", ...aria }: NoteProps) {
  return (
    <Tag className={`relative bg-paper-sheet border border-ink/20 ${className}`} {...aria}>
      <Corner className="-top-px -left-px border-t border-l" />
      <Corner className="-top-px -right-px border-t border-r" />
      <Corner className="-bottom-px -left-px border-b border-l" />
      <Corner className="-bottom-px -right-px border-b border-r" />
      {thread && (
        // Windowed security thread: a dashed stripe that changes color with the money status.
        <span
          aria-hidden="true"
          className={`absolute top-0 bottom-0 right-5 sm:right-8 border-l-[6px] border-dashed ${THREAD[thread]} motion-safe:transition-colors motion-safe:duration-500`}
        />
      )}
      {children}
      {(serial || microtext) && (
        <div className="px-5 sm:px-8 pb-4 space-y-2">
          {microtext && <div aria-hidden="true" className="microtext-rule" />}
          {serial}
        </div>
      )}
    </Tag>
  );
}
