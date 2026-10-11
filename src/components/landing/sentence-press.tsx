"use client";

import React, { useEffect, useState } from "react";
import { Mic } from "lucide-react";
import { Guilloche } from "@/components/press/guilloche";
import { Note } from "@/components/press/note";
import { Serial } from "@/components/press/serial";
import { StatusStamp, type MoneyStatus } from "@/components/press/status-stamp";
import { Stub, type StubData } from "@/components/press/stub";
import { useRolledNumber } from "@/components/press/rolling-numeral";
import { parseIndonesianExpense } from "@/lib/nlp/indonesian-expense-parser";
import { localDateKey } from "@/lib/date";
import { rupiah } from "@/lib/format";

/** The worked example the landing explains: uang saku minus kos & tagihan, over the days left. */
export const EXAMPLE = { uangSaku: 1_500_000, tetap: 650_000, hariLagi: 20 };
export const EXAMPLE_JATAH = (EXAMPLE.uangSaku - EXAMPLE.tetap) / EXAMPLE.hariLagi;

export const SAMPLE_SENTENCES = [
  "makan warteg delapan belas ribu sama es teh lima ribu",
  "bensin dua puluh ribu terus parkir dua ribu",
  "nasi padang ceban, kopi susu 15rb, fotokopi 3 ribu",
];

// Same rule as dailyJatah on the dashboard, so the demo stamps what the app would.
export function demoStatus(spent: number, jatah = EXAMPLE_JATAH): MoneyStatus {
  const left = jatah - spent;
  return left <= 0 ? "habis" : spent >= jatah * 0.8 ? "mepet" : "aman";
}

/** A sentence through the real parser, as stubs. `run` keeps serials distinct per print. */
export function pressSentence(sentence: string, today: string, run: number): StubData[] {
  return parseIndonesianExpense(sentence).map((item, i) => ({
    id: `contoh-${run}-${i}-${item.itemName}`,
    item: item.itemName,
    amount: item.amount,
    date: today,
    category: item.category,
    time: "barusan",
  }));
}

/**
 * The landing's proof: type or pick a sentence, the on-device parser prints it into
 * serial-numbered stubs and the example jatah note re-prints with what is left.
 */
export function SentencePress({ onTryMic }: { onTryMic: () => void }) {
  const [sentence, setSentence] = useState(SAMPLE_SENTENCES[0]);
  const [stubs, setStubs] = useState<StubData[]>([]);
  const [run, setRun] = useState(0);
  // Local day is only known in the browser; the first print happens after mount.
  const [today, setToday] = useState<string | null>(null);

  const print = (text: string, day: string) => {
    setStubs(pressSentence(text, day, run + 1));
    setRun((r) => r + 1);
  };

  useEffect(() => {
    const day = localDateKey(new Date());
    setToday(day);
    setStubs(pressSentence(SAMPLE_SENTENCES[0], day, 1));
    setRun(1);
  }, []);

  const spent = stubs.reduce((s, x) => s + x.amount, 0);
  const left = EXAMPLE_JATAH - spent;
  const status = demoStatus(spent);
  const rolled = useRolledNumber(Math.max(0, left));

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (today) print(sentence, today);
  };

  return (
    <Note
      as="section"
      aria-labelledby="press-title"
      thread={status}
      microtext
      serial={today ? <Serial id={`contoh-${run}`} date={today} /> : null}
      className="overflow-hidden"
    >
      <div className="px-5 sm:px-8 pt-6 pb-5 pr-12 sm:pr-16 space-y-5">
        <form onSubmit={submit} className="space-y-3">
          <h2 id="press-title" className="font-display text-head font-bold text-ink">
            Coba sendiri, bilang apa yang barusan kamu beli
          </h2>
          <label htmlFor="press-sentence" className="block text-body text-ink-soft">
            Ketik seperti ngomong. Angka boleh pakai kata, &ldquo;goceng&rdquo;, atau &ldquo;15rb&rdquo;.
          </label>
          <textarea
            id="press-sentence"
            rows={2}
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) submit(e);
            }}
            className="w-full resize-none bg-paper border border-ink/30 px-3 py-2.5 text-body text-ink placeholder:text-ink-soft focus:outline-none focus-visible:border-ink"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              className="inline-flex items-center min-h-11 px-5 rounded-full border-2 border-ink text-ink text-body font-bold hover:bg-ink hover:text-paper-sheet dark:hover:text-paper transition-colors"
            >
              Cetak catatan
            </button>
            <button
              type="button"
              onClick={onTryMic}
              className="inline-flex items-center gap-2 min-h-11 px-4 rounded-full text-ink text-body font-semibold underline underline-offset-4 decoration-ink/40 hover:decoration-ink"
            >
              <Mic className="w-4 h-4" aria-hidden="true" />
              Pakai mic asli
            </button>
          </div>
          <div className="space-y-1">
            <p className="text-meta text-ink-soft">Atau ambil contoh:</p>
            <ul className="flex flex-col items-start gap-1">
              {SAMPLE_SENTENCES.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => {
                      setSentence(s);
                      if (today) print(s, today);
                    }}
                    className="text-left min-h-11 py-2 text-body text-ink underline decoration-dotted underline-offset-4 decoration-ink/50 hover:decoration-ink"
                  >
                    &ldquo;{s}&rdquo;
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </form>

        <div aria-live="polite" className="border-t border-ink/20 pt-5 space-y-4">
          <div className="relative flex items-center gap-5">
            <Guilloche seed={0xc4a3} turn={run * 9} size={96} className="hidden sm:block shrink-0" />
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="text-body font-semibold text-ink-soft">Sisa jatah hari ini</p>
                <StatusStamp status={status} />
              </div>
              <p className="font-display font-bold text-ink money flex items-baseline gap-2">
                <span className="text-head">Rp</span>
                <span className="text-[clamp(2.75rem,13vw,4rem)] leading-none tracking-[-0.03em]" aria-hidden="true">
                  {rolled.toLocaleString("id-ID")}
                </span>
                <span className="sr-only">{Math.max(0, left).toLocaleString("id-ID")}</span>
              </p>
              <p className="text-body text-ink">
                dari jatah <span className="money font-semibold">{rupiah(EXAMPLE_JATAH)}</span> · terpakai{" "}
                <span className="money font-semibold">{rupiah(spent)}</span>
                {left < 0 && (
                  <>
                    {" "}· lewat <span className="money font-semibold">{rupiah(-left)}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {today && stubs.length === 0 ? (
            <p className="text-body text-ink">
              Belum ketemu nominalnya. Sebut harganya juga, misal &ldquo;kopi goceng&rdquo;.
            </p>
          ) : (
            <ol className="space-y-2 min-h-[4.5rem]" aria-label="Catatan yang tercetak">
              {stubs.map((stub) => (
                <Stub key={stub.id} data={stub} className="animate-stub-in" />
              ))}
            </ol>
          )}
        </div>
      </div>
    </Note>
  );
}
