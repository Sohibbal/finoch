import { StudentWallet, WalletTransferRecord } from "@/types/wallet-types";
import type { Expense } from "@/lib/types/expense";
import { computeWalletBalances } from "@/lib/financial/wallet-engine";
import { getStorage, isDemoMode, readArray } from "@/lib/storage/local-storage";

const WALLETS_STORAGE_KEY = "finoch_student_wallets_v1";
const WALLET_TRANSFERS_STORAGE_KEY = "finoch_student_wallet_transfers_v1";

// Built per call so callers mutating the result never corrupt the defaults.
const createDefaultWallets = (): StudentWallet[] => [
  {
    id: "wallet-cash-1",
    name: "Dompet Tunai Fisik",
    type: "cash",
    openingBalance: 120000,
    color: "emerald",
    icon: "wallet",
    isPrimary: false,
    notes: "Uang kertas di dompet untuk warteg, galon & parkir",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "wallet-bank-1",
    name: "Rekening BCA Utama",
    type: "bank",
    openingBalance: 1450000,
    color: "blue",
    icon: "landmark",
    accountNumber: "1234-5678-90",
    isPrimary: true,
    notes: "Rekening penerima uang saku bulanan dari orang tua",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "wallet-ewallet-1",
    name: "GoPay & ShopeePay",
    type: "ewallet",
    openingBalance: 85000,
    color: "purple",
    icon: "smartphone",
    isPrimary: false,
    notes: "Saldo ojek online, jajan diskon & pesan makanan",
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Wallets stored before balances were derived kept a mutable `balance` that already included every
 * transfer. That balance minus the transfer history becomes the saldo awal, so the derived balance
 * re-applies each transfer exactly once. Returns null when nothing needs migrating.
 */
function migrateStoredBalances(wallets: StudentWallet[]): StudentWallet[] | null {
  if (wallets.every((w) => typeof w.openingBalance === "number")) return null;
  const transferDelta = computeWalletBalances(
    wallets.map((w) => ({ ...w, openingBalance: 0 })),
    getWalletTransferHistory(),
    []
  );
  return wallets.map((w, i) => {
    if (typeof w.openingBalance === "number") return w;
    const { balance, ...rest } = w as StudentWallet & { balance?: number };
    return { ...rest, openingBalance: (Number(balance) || 0) - transferDelta[i].balance };
  });
}

/**
 * Loads wallets from localStorage; sample wallets are seeded in demo mode only.
 */
export function getWallets(): StudentWallet[] {
  // Defaults only when nothing was ever stored; an emptied list stays empty.
  const stored = readArray<StudentWallet>(WALLETS_STORAGE_KEY);
  if (stored) {
    const migrated = migrateStoredBalances(stored);
    if (migrated) saveWallets(migrated);
    return migrated ?? stored;
  }
  if (!isDemoMode()) return [];
  const defaults = createDefaultWallets();
  saveWallets(defaults);
  return defaults;
}

/**
 * Saves wallets to localStorage.
 */
export function saveWallets(wallets: StudentWallet[]): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(WALLETS_STORAGE_KEY, JSON.stringify(wallets));
  } catch (err) {
    console.error("Error saving wallets:", err);
  }
}

/**
 * Adds a new wallet.
 */
export function addWallet(
  data: Omit<StudentWallet, "id" | "updatedAt">
): StudentWallet {
  if (!Number.isFinite(data.openingBalance) || data.openingBalance < 0) {
    throw new Error("Saldo awal dompet tidak valid");
  }
  const wallets = data.isDefault ? clearDefault(getWallets()) : getWallets();
  const newWallet: StudentWallet = {
    ...data,
    id: `wallet-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    updatedAt: new Date().toISOString(),
  };

  const updated = [newWallet, ...wallets];
  saveWallets(updated);
  return newWallet;
}

/**
 * Updates an existing wallet.
 */
export function updateWallet(
  id: string,
  updates: Partial<Omit<StudentWallet, "id">>
): StudentWallet | null {
  const wallets = updates.isDefault ? clearDefault(getWallets()) : getWallets();
  const index = wallets.findIndex((w) => w.id === id);
  if (index === -1) return null;

  wallets[index] = {
    ...wallets[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveWallets(wallets);
  return wallets[index];
}

/** Only one wallet can be the default. */
function clearDefault(wallets: StudentWallet[]): StudentWallet[] {
  return wallets.map((w) => (w.isDefault ? { ...w, isDefault: false } : w));
}

/**
 * Deletes a wallet.
 */
export function deleteWallet(id: string): void {
  const wallets = getWallets();
  const filtered = wallets.filter((w) => w.id !== id);
  saveWallets(filtered);
}

/**
 * Transfers funds between wallets (e.g. Tarik Tunai atau Top-up e-wallet) by recording it in the
 * transfer log; balances are derived from that log. `expenses` are the user's current expenses,
 * needed to check the source wallet's live balance.
 */
export function transferWalletFunds(
  fromId: string,
  toId: string,
  amount: number,
  adminFee: number = 0,
  reason: string = "Pindah saldo dompet",
  expenses: Expense[] = []
): WalletTransferRecord {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Nominal transfer harus lebih dari Rp 0");
  }
  if (!Number.isFinite(adminFee) || adminFee < 0) {
    throw new Error("Biaya admin tidak boleh negatif");
  }
  if (fromId === toId) {
    throw new Error("Tidak bisa transfer ke dompet yang sama");
  }

  const transfers = getWalletTransferHistory();
  const wallets = computeWalletBalances(getWallets(), transfers, expenses);
  const from = wallets.find((w) => w.id === fromId);
  const to = wallets.find((w) => w.id === toId);

  if (!from || !to) {
    throw new Error("Dompet asal atau tujuan tidak ditemukan");
  }

  if (from.balance < amount + adminFee) {
    throw new Error(`Saldo ${from.name} tidak mencukupi untuk transfer nominal + biaya admin`);
  }

  const record: WalletTransferRecord = {
    id: `wtr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    fromWalletId: fromId,
    fromWalletName: from.name,
    toWalletId: toId,
    toWalletName: to.name,
    amount,
    adminFee,
    reason,
    createdAt: new Date().toISOString(),
  };

  const storage = getStorage();
  if (storage) {
    storage.setItem(WALLET_TRANSFERS_STORAGE_KEY, JSON.stringify([record, ...transfers]));
  }

  return record;
}

/**
 * Retrieves transfer history log.
 */
export function getWalletTransferHistory(): WalletTransferRecord[] {
  return readArray<WalletTransferRecord>(WALLET_TRANSFERS_STORAGE_KEY) ?? [];
}
