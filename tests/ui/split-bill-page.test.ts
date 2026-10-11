import { describe, it, expect, vi } from "vitest";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/split-bill",
}));

// Mock hooks
vi.mock("@/components/layout/auth-provider", () => ({
  useAuthContext: () => ({
    user: { id: "test_user", name: "Diki", email: "diki@finoch.id" },
    logout: vi.fn(),
  }),
}));

describe("Split Bill Page Components", () => {
  it("exports SplitBillPage component successfully", async () => {
    const mod = await import("@/app/(app)/split-bill/page");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });

  it("exports all modular split bill components", async () => {
    const { ParticipantManager } = await import("@/components/split-bill/participant-manager");
    const { BillItemEditor } = await import("@/components/split-bill/bill-item-editor");
    const { TaxDiscountConfig } = await import("@/components/split-bill/tax-discount-config");
    const { SplitSummaryCard } = await import("@/components/split-bill/split-summary-card");
    const { ReceiptOcrButton } = await import("@/components/split-bill/receipt-ocr-button");

    expect(ParticipantManager).toBeDefined();
    expect(BillItemEditor).toBeDefined();
    expect(TaxDiscountConfig).toBeDefined();
    expect(SplitSummaryCard).toBeDefined();
    expect(ReceiptOcrButton).toBeDefined();
  });
});

describe("initialSplitBill", () => {
  it("opens an empty nota for a real account: only Saya, no made-up menu or resto", async () => {
    const { initialSplitBill } = await import("@/components/split-bill/initial-bill");
    const bill = initialSplitBill(false, new Date(2026, 9, 11));
    expect(bill.items).toEqual([]);
    expect(bill.participants).toEqual([{ id: "p_user", name: "Saya", isUser: true }]);
    expect(bill.config.restaurantName).toBe("");
    expect(bill.config.paymentNote).toBe("");
    // Local day, not the UTC date from toISOString.
    expect(bill.config.date).toBe("2026-10-11");
  });

  it("gives Mode Demo the sample bill to present with", async () => {
    const { initialSplitBill } = await import("@/components/split-bill/initial-bill");
    const bill = initialSplitBill(true);
    expect(bill.items.length).toBeGreaterThan(0);
    expect(bill.participants.length).toBeGreaterThan(1);
    expect(bill.config.restaurantName).not.toBe("");
  });

  it("shows a friend not sharing a menu line as unselected, never struck through", async () => {
    const React = await import("react");
    const { renderToString } = await import("react-dom/server");
    const { BillItemEditor } = await import("@/components/split-bill/bill-item-editor");
    const noop = () => {};
    const html = renderToString(
      React.createElement(BillItemEditor, {
        items: [{ id: "i1", name: "Es teh", price: 5000, quantity: 1, assignedParticipantIds: ["a"] }],
        participants: [
          { id: "a", name: "Saya", isUser: true },
          { id: "b", name: "Raka", isUser: false },
        ],
        mode: "itemized",
        onAddItem: noop,
        onUpdateItem: noop,
        onDeleteItem: noop,
      })
    );
    expect(html).toContain('aria-pressed="false"');
    expect(html).not.toContain("line-through");
  });
});
