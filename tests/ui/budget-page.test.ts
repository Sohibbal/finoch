import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { rupiah } from "@/lib/format";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/budget",
}));

vi.mock("@/components/layout/auth-provider", () => ({
  useAuthContext: () => ({
    user: { id: "test-student-123", email: "student@finoch.id" },
    logout: vi.fn(),
  }),
}));

const envelope = {
  id: "env-makan",
  name: "Makan",
  icon: "utensils",
  color: "emerald",
  allocatedAmount: 500_000,
  spentAmount: 650_000,
  categoryAliases: ["Food & Drinks", "Food", "Makan"],
  updatedAt: "2026-10-11T00:00:00.000Z",
};

describe("Amplop Anggaran page", () => {
  it("exports the page and every budget component", async () => {
    const page = await import("@/app/(app)/budget/page");
    const { BudgetAmplop } = await import("@/components/budget/budget-amplop");
    const { BudgetOverviewCard } = await import("@/components/budget/budget-overview-card");
    const { BudgetTransferModal } = await import("@/components/budget/budget-transfer-modal");
    const { BudgetFormModal } = await import("@/components/budget/budget-form-modal");
    const { BudgetTransferHistory } = await import("@/components/budget/budget-transfer-history");
    expect(typeof page.default).toBe("function");
    for (const c of [BudgetAmplop, BudgetOverviewCard, BudgetTransferModal, BudgetFormModal, BudgetTransferHistory]) {
      expect(c).toBeDefined();
    }
  });

  it("names linked categories in Indonesian, once each, without raw aliases", async () => {
    const { envelopeSources } = await import("@/components/budget/budget-amplop");
    expect(envelopeSources(["Food & Drinks", "Food", "Makan"])).toEqual(["Makan & Minum"]);
  });

  it("prints an overspent amplop as Jebol with the overspent amount in its ledger", async () => {
    const { BudgetAmplop } = await import("@/components/budget/budget-amplop");
    const noop = () => {};
    const html = renderToString(React.createElement(BudgetAmplop, { envelope, onTransfer: noop, onEdit: noop, onDelete: noop }));
    expect(html).toContain("Jebol");
    expect(html).toContain(rupiah(-150_000));
    expect(html).toContain("Paling rakus di tanggal muda");
    expect(html).toContain('aria-label="Ubah Makan"');
  });

  it("stamps Habis in a solid form, never dashed (dashed means Tertunda sinkron)", async () => {
    const { BudgetAmplop } = await import("@/components/budget/budget-amplop");
    const { Cap } = await import("@/components/press/denom");
    const noop = () => {};
    const amplop = renderToString(React.createElement(BudgetAmplop, { envelope, onTransfer: noop, onEdit: noop, onDelete: noop }));
    expect(amplop).toContain("border-paper-sheet bg-paper-sheet text-ink");
    const cap = renderToString(React.createElement(Cap, { tone: "habis" }, "Habis"));
    expect(cap).not.toContain("border-dashed");
    expect(cap).not.toBe(renderToString(React.createElement(Cap, { tone: "aman" }, "Habis")).replace(/aman/g, "habis"));
  });
});

