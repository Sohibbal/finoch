import React from "react";
import { categoryLabel, rupiah } from "@/lib/format";
import { formatSerial } from "./serial";
import { unbreakable } from "./print-date";

export interface StubData {
  id: string;
  item: string;
  amount: number;
  /** Local YYYY-MM-DD the money left the wallet. */
  date: string;
  category?: string;
  wallet?: string;
  /** "08.15" or a short date; whatever fits the list. */
  time?: string;
  /** Not on the server yet (syncStatus pending/failed). */
  unsynced?: boolean;
  deleted?: boolean;
  /** Pushed today past the daily jatah. */
  overJatah?: boolean;
}

/** Text form of a stub's states, so they never rely on the edge style alone. */
export function stubStateLabel({ unsynced, deleted, overJatah }: Pick<StubData, "unsynced" | "deleted" | "overJatah">): string {
  return [deleted && "dihapus", unsynced && "belum sinkron", overJatah && "melewati jatah"].filter(Boolean).join(" · ");
}

/**
 * A transaction as a torn note stub. States by form:
 * dashed edge = belum sinkron, struck = dihapus, doubled rule = melewati jatah.
 */
export function Stub({ data, className = "" }: { data: StubData; className?: string }) {
  const { id, item, amount, date, category, wallet, time, unsynced, deleted, overJatah } = data;
  const state = stubStateLabel(data);
  // The time is often a date ("Kam, 8 Okt"): it never breaks inside.
  const meta = [wallet, categoryLabel(category), time && unbreakable(time)].filter(Boolean).join(" · ");
  return (
    <li
      className={`relative flex items-start gap-3 pl-4 pr-3 py-3 bg-paper-sheet ${
        unsynced ? "border border-dashed border-ink/50" : "border border-ink/15"
      } ${overJatah ? "border-b-4 border-b-ink/60 [border-bottom-style:double]" : ""} ${className}`}
    >
      {/* Perforation where the stub was torn off the note. */}
      <span aria-hidden="true" className="absolute left-1.5 top-2 bottom-2 border-l border-dotted border-ink/40" />
      <div className="min-w-0 flex-1">
        <p className={`text-body font-semibold text-ink break-words ${deleted ? "line-through decoration-2" : ""}`}>{item}</p>
        <p className="text-meta text-ink-soft break-words">{meta}</p>
        <p className="text-meta text-ink-soft">
          <span className="money tracking-[0.08em]">{formatSerial(id, date)}</span>
          {state && <span className="font-semibold text-ink"> · {state}</span>}
        </p>
      </div>
      <p className={`money text-body font-bold text-ink whitespace-nowrap ${deleted ? "line-through" : ""}`}>{rupiah(amount)}</p>
    </li>
  );
}
