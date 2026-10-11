import { describe, it, expect } from "vitest";

describe("Income and Expense Pages Architecture", () => {
  it("exports Pemasukan and Pengeluaran page components cleanly", async () => {
    const pemasukanModule = await import("@/app/(app)/pemasukan/page");
    const pengeluaranModule = await import("@/app/(app)/pengeluaran/page");
    expect(pemasukanModule.default).toBeDefined();
    expect(pengeluaranModule.default).toBeDefined();
  });
});
