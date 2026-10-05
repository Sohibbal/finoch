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
vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { id: "test_user", name: "Diki", email: "diki@finoch.id" },
    logout: vi.fn(),
  }),
}));

describe("Split Bill Page Components", () => {
  it("exports SplitBillPage component successfully", async () => {
    const mod = await import("@/app/split-bill/page");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });

  it("exports all modular split bill components", async () => {
    const { ParticipantManager } = await import("@/components/split-bill/participant-manager");
    const { BillItemEditor } = await import("@/components/split-bill/bill-item-editor");
    const { TaxDiscountConfig } = await import("@/components/split-bill/tax-discount-config");
    const { SplitSummaryCard } = await import("@/components/split-bill/split-summary-card");
    const { TalanganHistoryModal } = await import("@/components/split-bill/talangan-history-modal");
    const { ReceiptOcrButton } = await import("@/components/split-bill/receipt-ocr-button");

    expect(ParticipantManager).toBeDefined();
    expect(BillItemEditor).toBeDefined();
    expect(TaxDiscountConfig).toBeDefined();
    expect(SplitSummaryCard).toBeDefined();
    expect(TalanganHistoryModal).toBeDefined();
    expect(ReceiptOcrButton).toBeDefined();
  });
});
