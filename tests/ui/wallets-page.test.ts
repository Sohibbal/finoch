import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/wallets",
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { id: "test-user-123", email: "student@finoch.id" },
    logout: vi.fn(),
  }),
}));

describe("Student Wallets & Multi-Account Components", () => {
  it("exports WalletsPage component successfully", async () => {
    const WalletsPageModule = await import("@/app/wallets/page");
    expect(WalletsPageModule.default).toBeDefined();
    expect(typeof WalletsPageModule.default).toBe("function");
  });

  it("exports WalletCardMobile, WalletBentoDesktop, WalletFormModal, and WalletTransferModal", async () => {
    const CardMobile = await import("@/components/wallets/wallet-card-mobile");
    const BentoDesktop = await import("@/components/wallets/wallet-bento-desktop");
    const FormModal = await import("@/components/wallets/wallet-form-modal");
    const TransferModal = await import("@/components/wallets/wallet-transfer-modal");

    expect(CardMobile.WalletCardMobile).toBeDefined();
    expect(BentoDesktop.WalletBentoDesktop).toBeDefined();
    expect(FormModal.WalletFormModal).toBeDefined();
    expect(TransferModal.WalletTransferModal).toBeDefined();
  });
});
