import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";

const noop = () => {};
const wallets = [
  { id: "w1", name: "Dompet", type: "cash" as const, openingBalance: 0, balance: 50_000, color: "teal", icon: "wallet", updatedAt: "2026-10-11T00:00:00.000Z" },
  { id: "w2", name: "BCA", type: "bank" as const, openingBalance: 0, balance: 900_000, color: "blue", icon: "landmark", updatedAt: "2026-10-11T00:00:00.000Z" },
];
const envelopes = [
  { id: "e1", name: "Makan", allocatedAmount: 600_000, icon: "utensils", color: "teal", categoryAliases: ["Food"] },
  { id: "e2", name: "Kopi", allocatedAmount: 100_000, icon: "coffee", color: "blue", categoryAliases: ["Coffee"] },
];

async function modals(): Promise<[string, string][]> {
  const { WalletFormModal } = await import("@/components/wallets/wallet-form-modal");
  const { WalletTransferModal } = await import("@/components/wallets/wallet-transfer-modal");
  const { BillFormModal } = await import("@/components/bills/bill-form-modal");
  const { BudgetFormModal } = await import("@/components/budget/budget-form-modal");
  const { BudgetTransferModal } = await import("@/components/budget/budget-transfer-modal");
  const { DebtFormModal } = await import("@/components/debts/debt-form-modal");
  const open = { isOpen: true, onClose: noop };
  const el = React.createElement;
  return [
    ["wallet form", renderToString(el(WalletFormModal, { ...open, onSave: noop }))],
    ["wallet transfer", renderToString(el(WalletTransferModal, { ...open, wallets, onTransfer: noop }))],
    ["bill form", renderToString(el(BillFormModal, { ...open, onSubmit: noop }))],
    ["budget form", renderToString(el(BudgetFormModal, { ...open, onSave: noop } as any))],
    ["budget transfer", renderToString(el(BudgetTransferModal, { ...open, envelopes, onConfirmTransfer: noop } as any))],
    ["debt form", renderToString(el(DebtFormModal, { ...open, onSave: noop }))],
  ];
}

describe("legacy forms printed in the press world", () => {
  it("open as a labelled modal paper dialog with no old chrome", async () => {
    for (const [name, html] of await modals()) {
      expect(html, name).toContain('role="dialog"');
      expect(html, name).toContain('aria-modal="true"');
      expect(html, name).not.toMatch(/rounded-(xl|2xl|3xl)|backdrop-blur|shadow-|text-(xs|sm|lg)\b|(rose|slate|emerald|amber)-\d/);
    }
  });

  it("tie every text field and select to its label, and press every choice", async () => {
    for (const [name, html] of await modals()) {
      const fields = [...html.matchAll(/<(input|select)\b[^>]*>/g)].map((m) => m[0]).filter((t) => !t.includes('type="checkbox"'));
      expect(fields.length, name).toBeGreaterThan(0);
      for (const field of fields) {
        const id = field.match(/\bid="([^"]+)"/)?.[1];
        expect(id, `${name}: ${field}`).toBeTruthy();
        expect(html, `${name}: label for ${id}`).toContain(`for="${id}"`);
      }
    }
    const [, wallet] = (await modals())[0];
    expect(wallet).toContain('aria-pressed="true"');
  });
});
