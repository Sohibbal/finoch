import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { categoryLabel, shortDate, rupiah } from "@/lib/format";
import { formatSerial } from "@/components/press/serial";
import { rosetteFamilies } from "@/components/press/guilloche";
import { Stub, stubStateLabel } from "@/components/press/stub";
import { StatusStamp } from "@/components/press/status-stamp";
import { printDate } from "@/components/press/print-date";
import { DENOM, DENOMS, DENOM_FIELD, DENOM_CHOICES, denomOf, type Denom } from "@/components/press/denom";

describe("format helpers", () => {
  it("shows the five stored categories in Indonesian", () => {
    expect(["Food & Drinks", "Transportation", "Bills & Utilities", "Shopping & Lifestyle", "Other"].map(categoryLabel)).toEqual([
      "Makan & Minum",
      "Transportasi",
      "Tagihan",
      "Belanja & Gaya Hidup",
      "Lainnya",
    ]);
    expect(categoryLabel(undefined)).toBe("Lainnya");
  });

  it("formats local day keys as short Indonesian dates", () => {
    expect(shortDate("2026-10-10")).toBe("Sab, 10 Okt");
    expect(shortDate(new Date(2026, 0, 5))).toBe("Sen, 5 Jan");
    expect(shortDate("bukan tanggal")).toBe("");
  });

  it("formats rupiah with dots and a sign", () => {
    expect(rupiah(1_250_000)).toBe("Rp 1.250.000");
    expect(rupiah(-5000)).toBe("−Rp 5.000");
  });
});

describe("press primitives", () => {
  it("prints deterministic FNC·DDMMYY·NNNN serials", () => {
    const s = formatSerial("tx-42", "2026-10-11");
    expect(s).toMatch(/^FNC·111026·\d{4}$/);
    expect(formatSerial("tx-42", new Date(2026, 9, 11))).toBe(s);
    expect(formatSerial("tx-43", "2026-10-11")).not.toBe(s);
  });

  it("draws the same rosette for the same seed", () => {
    expect(rosetteFamilies(7)).toEqual(rosetteFamilies(7));
    expect(rosetteFamilies(7)).not.toEqual(rosetteFamilies(8));
    expect(rosetteFamilies(7, 3)).toHaveLength(3);
  });

  it("names stub states in text, not only by edge style", () => {
    expect(stubStateLabel({ unsynced: true, overJatah: true })).toBe("belum sinkron · melewati jatah");
    const html = renderToString(
      React.createElement(Stub, { data: { id: "a", item: "Es teh", amount: 5000, date: "2026-10-11", category: "Food & Drinks", deleted: true } })
    );
    expect(html).toContain("dihapus");
    expect(html).toContain("line-through");
    expect(html).toContain("Makan &amp; Minum");
  });

  it("stamps every status with a word, not color alone", () => {
    for (const [status, word] of [["aman", "Aman"], ["mepet", "Mepet"], ["habis", "Habis"], ["tertunda", "Tertunda sinkron"]] as const) {
      expect(renderToString(React.createElement(StatusStamp, { status }))).toContain(word);
    }
  });
});

describe("denominations", () => {
  const STATUS_HUE = /aman|mepet|habis/;

  it("never prints a wallet, envelope or goal in a status hue", () => {
    for (const d of Object.keys(DENOM) as Denom[]) {
      expect(DENOM_FIELD[d]).not.toMatch(STATUS_HUE);
      expect(DENOMS[d].soft).not.toMatch(STATUS_HUE);
    }
    expect(DENOM_CHOICES.map((c) => c.denom)).toEqual(["blue", "violet", "teal", "slate"]);
  });

  it("reads legacy stored colors as non-status notes", () => {
    expect(["emerald", "amber", "rose", "cyan", "purple", "blue"].map(denomOf)).toEqual(["teal", "slate", "violet", "blue", "violet", "blue"]);
    expect(denomOf(undefined)).toBe("slate");
    expect(denomOf("green")).toBe("slate");
    for (const c of DENOM_CHOICES) expect(denomOf(c.id)).toBe(c.denom);
  });
});

describe("dates in print", () => {
  it("never breaks inside a date", () => {
    expect(printDate("2026-10-08")).toBe("Kam, 8 Okt");
    const html = renderToString(
      React.createElement(Stub, { data: { id: "a", item: "Es teh", amount: 5000, date: "2026-10-08", wallet: "Dompet Tunai", time: "Kam, 8 Okt" } })
    );
    expect(html).toContain("Kam, 8 Okt");
    expect(html).toContain("Dompet Tunai");
  });
});
