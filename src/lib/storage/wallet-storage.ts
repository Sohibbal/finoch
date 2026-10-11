import { StudentWallet, WalletTransferRecord, WalletSummary } from "@/types/wallet-types";
import { calculateWalletSummary } from "@/lib/financial/wallet-engine";
import { getStorage, readArray } from "@/lib/storage/local-storage";

const WALLETS_STORAGE_KEY = "finoch_student_wallets_v1";
const WALLET_TRANSFERS_STORAGE_KEY = "finoch_student_wallet_transfers_v1";

// Built per call so callers mutating the result never corrupt the defaults.
const createDefaultWallets = (): StudentWallet[] => [
  {
    id: "wallet-cash-1",
    name: "Dompet Tunai Fisik",
    type: "cash",
    balance: 120000,
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
    balance: 1450000,
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
    balance: 85000,
    color: "purple",
    icon: "smartphone",
    isPrimary: false,
    notes: "Saldo ojek online, jajan diskon & pesan makanan",
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Loads wallets from localStorage or defaults.
 */
export function getWallets(): StudentWallet[] {
  // Defaults only when nothing was ever stored; an emptied list stays empty.
  const stored = readArray<StudentWallet>(WALLETS_STORAGE_KEY);
  if (stored) return stored;
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
  if (!Number.isFinite(data.balance) || data.balance < 0) {
    throw new Error("Saldo awal dompet tidak valid");
  }
  const wallets = getWallets();
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
  const wallets = getWallets();
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

/**
 * Deletes a wallet.
 */
export function deleteWallet(id: string): void {
  const wallets = getWallets();
  const filtered = wallets.filter((w) => w.id !== id);
  saveWallets(filtered);
}

/**
 * Transfers funds between wallets (e.g. Tarik Tunai atau Top-up e-wallet) and records transfer log.
 */
export function transferWalletFunds(
  fromId: string,
  toId: string,
  amount: number,
  adminFee: number = 0,
  reason: string = "Pindah saldo dompet"
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

  const wallets = getWallets();
  const fromIndex = wallets.findIndex((w) => w.id === fromId);
  const toIndex = wallets.findIndex((w) => w.id === toId);

  if (fromIndex === -1 || toIndex === -1) {
    throw new Error("Dompet asal atau tujuan tidak ditemukan");
  }

  const totalDeduction = amount + adminFee;
  if (wallets[fromIndex].balance < totalDeduction) {
    throw new Error(`Saldo ${wallets[fromIndex].name} tidak mencukupi untuk transfer nominal + biaya admin`);
  }

  wallets[fromIndex].balance -= totalDeduction;
  wallets[toIndex].balance += amount;
  wallets[fromIndex].updatedAt = new Date().toISOString();
  wallets[toIndex].updatedAt = new Date().toISOString();

  saveWallets(wallets);

  const record: WalletTransferRecord = {
    id: `wtr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    fromWalletId: fromId,
    fromWalletName: wallets[fromIndex].name,
    toWalletId: toId,
    toWalletName: wallets[toIndex].name,
    amount,
    adminFee,
    reason,
    createdAt: new Date().toISOString(),
  };

  const transfers = getWalletTransferHistory();
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

/**
 * Gets aggregated summary.
 */
export function getWalletSummary(): WalletSummary {
  return calculateWalletSummary(getWallets());
}
