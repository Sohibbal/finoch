import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/wallets",
}));

vi.mock("@/components/layout/auth-provider", () => ({
  useAuthContext: () => ({
    user: { id: "test-user-123", email: "student@finoch.id" },
    logout: vi.fn(),
  }),
}));

const wallet = {
  id: "w-cash",
  name: "Dompet Tunai",
  type: "cash" as const,
  openingBalance: 0,
  color: "emerald",
  icon: "wallet",
  updatedAt: "2026-10-11T00:00:00.000Z",
};

describe("Dompet page", () => {
  it("exports the page, the wallet note and both modals", async () => {
    const page = await import("@/app/(app)/wallets/page");
    const { WalletNote } = await import("@/components/wallets/wallet-note");
    const { WalletFormModal } = await import("@/components/wallets/wallet-form-modal");
    const { WalletTransferModal } = await import("@/components/wallets/wallet-transfer-modal");
    expect(typeof page.default).toBe("function");
    expect(WalletNote).toBeDefined();
    expect(WalletFormModal).toBeDefined();
    expect(WalletTransferModal).toBeDefined();
  });

  it("sums real balances, so a wallet in minus lowers the total instead of counting as Rp 0", async () => {
    const { walletTotals } = await import("@/components/wallets/wallet-note");
    const totals = walletTotals([
      { type: "cash", balance: -1_000_000 },
      { type: "bank", balance: 1_500_000 },
      { type: "ewallet", balance: 50_000 },
    ]);
    expect(totals.total).toBe(550_000);
    expect(totals.byType.cash).toBe(-1_000_000);
  });

  it("prints a minus wallet as Minus and a low one as Mepet, with labelled actions", async () => {
    const { WalletNote } = await import("@/components/wallets/wallet-note");
    const noop = () => {};
    const minus = renderToString(
      React.createElement(WalletNote, { wallet: { ...wallet, balance: -5000 }, onTransfer: noop, onEdit: noop, onDelete: noop })
    );
    expect(minus).toContain("Minus");
    // Minus is a plain label; only Mepet (money status) is stamped.
    expect(minus).not.toContain("uppercase tracking-[0.08em]");
    expect(minus).toContain("−Rp");
    expect(minus).toContain('aria-label="Hapus Dompet Tunai"');

    const low = renderToString(
      React.createElement(WalletNote, { wallet: { ...wallet, balance: 15000 }, onTransfer: noop, onEdit: noop, onDelete: noop })
    );
    expect(low).toContain("Mepet");
    expect(low).toContain("uppercase tracking-[0.08em]");
    expect(low).toContain("Paling cepat habis di warteg");
  });

  it("prints the wallet balance in the head size, not a fourth size of its own", async () => {
    const { WalletNote } = await import("@/components/wallets/wallet-note");
    const html = renderToString(
      React.createElement(WalletNote, { wallet: { ...wallet, balance: 250_000 }, onTransfer: noopFn, onEdit: noopFn, onDelete: noopFn })
    );
    expect(html).not.toMatch(/text-\[[\d.]+rem\]/);
    expect(html).toContain("text-head");
  });

  it("leaves the empty transfer history without a count", async () => {
    const page = await import("@/app/(app)/wallets/page");
    const html = renderToString(React.createElement(page.default));
    expect(html).toContain("Riwayat pindah saldo");
    expect(html).not.toMatch(/>0(<!-- -->)? ?kali/);
  });
});

const noopFn = () => {};

