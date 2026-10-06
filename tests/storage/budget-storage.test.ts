import { describe, it, expect, beforeEach } from "vitest";
import {
  getEnvelopes,
  addEnvelope,
  updateEnvelope,
  deleteEnvelope,
  transferFunds,
  getTransferHistory,
  resetEnvelopesToDefault,
} from "@/lib/storage/budget-storage";

describe("Budget Storage Module", () => {
  let mockStore: Record<string, string> = {};

  beforeEach(() => {
    mockStore = {};
    const mockStorage = {
      getItem: (key: string) => mockStore[key] || null,
      setItem: (key: string, val: string) => {
        mockStore[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStore[key];
      },
      clear: () => {
        mockStore = {};
      },
      key: (i: number) => Object.keys(mockStore)[i] || null,
      get length() {
        return Object.keys(mockStore).length;
      },
    };

    Object.defineProperty(globalThis, "localStorage", {
      value: mockStorage,
      writable: true,
      configurable: true,
    });

    if (typeof window !== "undefined") {
      Object.defineProperty(window, "localStorage", {
        value: mockStorage,
        writable: true,
        configurable: true,
      });
    }
  });

  it("initializes with default student envelopes when empty", () => {
    const list = getEnvelopes(2000000);
    expect(list.length).toBeGreaterThanOrEqual(5);
    expect(list.some((e) => e.name.includes("Makan"))).toBe(true);
  });

  it("can add a custom envelope", () => {
    const created = addEnvelope({
      name: "Skripsi & Fotokopi",
      icon: "book",
      color: "cyan",
      allocatedAmount: 150000,
      spentAmount: 0,
      categoryAliases: ["Education"],
    });

    expect(created.id).toBeDefined();
    expect(created.name).toBe("Skripsi & Fotokopi");

    const all = getEnvelopes();
    expect(all.some((e) => e.id === created.id)).toBe(true);
  });

  it("can update an existing envelope", () => {
    const list = getEnvelopes();
    const first = list[0];

    const updated = updateEnvelope(first.id, {
      allocatedAmount: 950000,
      notes: "Diubah untuk ujian akhir semester",
    });

    expect(updated).not.toBeNull();
    expect(updated?.allocatedAmount).toBe(950000);
  });

  it("can delete an envelope", () => {
    const created = addEnvelope({
      name: "Hobi Keyboard",
      icon: "sparkles",
      color: "purple",
      allocatedAmount: 100000,
      spentAmount: 0,
      categoryAliases: ["Shopping"],
    });

    deleteEnvelope(created.id);
    const after = getEnvelopes();
    expect(after.some((e) => e.id === created.id)).toBe(false);
  });

  it("executes transfer between envelopes and creates transfer log", () => {
    const list = resetEnvelopesToDefault(2000000);
    const donor = list[0]; // e.g. Makan (800,000)
    const recipient = list[1]; // e.g. Kost (600,000)

    const initialDonorAlloc = donor.allocatedAmount;
    const initialRecipientAlloc = recipient.allocatedAmount;

    const record = transferFunds(donor.id, recipient.id, 50000, "Tambah jatah sewa");

    expect(record.id).toBeDefined();
    expect(record.amount).toBe(50000);
    expect(record.reason).toBe("Tambah jatah sewa");

    const afterList = getEnvelopes();
    const afterDonor = afterList.find((e) => e.id === donor.id);
    const afterRecipient = afterList.find((e) => e.id === recipient.id);

    expect(afterDonor?.allocatedAmount).toBe(initialDonorAlloc - 50000);
    expect(afterRecipient?.allocatedAmount).toBe(initialRecipientAlloc + 50000);

    const history = getTransferHistory();
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].id).toBe(record.id);
  });
});
