import { getDatabase } from "./indexed-db";
import { expenseStorage, type CreateExpenseParams } from "./expense-storage";
import { LEGACY_FEATURE_KEYS, getDataScope, getStorage, isDemoMode } from "./local-storage";
import { getWallets, saveWallets } from "./wallet-storage";

/** Every feature key a demo store may seed; reset removes them so each store reseeds on next read. */
const DEMO_FEATURE_KEYS = [...LEGACY_FEATURE_KEYS, "finoch_savings_goals_v1", "finoch_budget_allowance_v1"];

type Item = [name: string, category: string, min: number, max: number];

const MEALS: Item[] = [
  ["Makan warteg", "Food & Drinks", 12000, 20000],
  ["Nasi padang", "Food & Drinks", 18000, 25000],
  ["Indomie telur", "Food & Drinks", 8000, 12000],
  ["Nasi goreng", "Food & Drinks", 15000, 20000],
];

// "Bocor halus" micro items (es teh, gorengan, parkir, admin, biaya layanan) are what Audit picks up.
const EXTRAS: Item[] = [
  ["Es teh jumbo", "Food & Drinks", 3000, 5000],
  ["Gorengan", "Food & Drinks", 2000, 5000],
  ["Kopi susu", "Food & Drinks", 15000, 22000],
  ["Parkir minimarket", "Transportation", 2000, 2000],
  ["Ojek online ke kampus", "Transportation", 10000, 18000],
  ["Bensin pertalite", "Transportation", 20000, 30000],
  ["Fotokopi materi kuliah", "Other", 3000, 8000],
  ["Admin transfer", "Bills & Utilities", 2500, 2500],
  ["Biaya layanan GoFood", "Other", 3000, 5000],
  ["Snack minimarket", "Shopping & Lifestyle", 8000, 12000],
];

/** Small deterministic PRNG (mulberry32), so the same month always yields the same sample data. */
function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Sample expenses for a student on a ~Rp2.000.000 allowance, from the 1st of last month up to `now`. */
export function generateDemoExpenses(now: Date = new Date()): CreateExpenseParams[] {
  const rand = prng(now.getFullYear() * 12 + now.getMonth());
  const pick = <T>(list: T[]) => list[Math.floor(rand() * list.length)];
  const result: CreateExpenseParams[] = [];

  for (let d = new Date(now.getFullYear(), now.getMonth() - 1, 1); d <= now; d.setDate(d.getDate() + 1)) {
    const day = d.getDate();
    const fixed: Item[] = [];
    if (day === 2) fixed.push(["Kuota internet bulanan", "Bills & Utilities", 50000, 75000]);
    if (day === 3) fixed.push(["Top up GoPay", "Other", 50000, 50000], ["Admin top up e-wallet", "Bills & Utilities", 1500, 1500]);
    if (day === 15) fixed.push(["Pulsa", "Bills & Utilities", 25000, 25000]);
    if (day % 7 === 1) fixed.push(["Laundry kiloan", "Bills & Utilities", 20000, 30000]);
    if (day % 8 === 4) fixed.push(["Isi ulang galon", "Bills & Utilities", 6000, 7000]);

    // About one day in three has no spending at all, so Streak Hemat has green days.
    if (!fixed.length && rand() < 0.3) continue;

    const items = [pick(MEALS), ...fixed];
    const extras = Math.floor(rand() * 2);
    for (let i = 0; i < extras; i++) items.push(pick(EXTRAS));

    let hour = 7 + Math.floor(rand() * 4);
    for (const [itemName, category, min, max] of items) {
      const amount = min + Math.round((rand() * (max - min)) / 500) * 500;
      const at = new Date(d.getFullYear(), d.getMonth(), day, hour, Math.floor(rand() * 60));
      hour = Math.min(hour + 2 + Math.floor(rand() * 3), 22);
      // Today's items never land later than now.
      result.push({ itemName, amount, category, createdAt: new Date(Math.min(at.getTime(), now.getTime())).toISOString() });
    }
  }
  return result;
}

async function demoExpenseCount(): Promise<number> {
  const db = await getDatabase();
  // Soft-deleted rows count too: a demo user deleting every sample must not get them back.
  return db.countFromIndex("expenses", "by-user", getDataScope());
}

// Where a student actually pays from: small cash buys, bills and top-ups from the bank,
// food delivery and app fees from the e-wallet.
function walletTypeFor(itemName: string, category: string): "cash" | "bank" | "ewallet" {
  if (/gofood|grabfood|shopeefood|layanan/i.test(itemName)) return "ewallet";
  if (category === "Bills & Utilities" || category === "Other") return "bank";
  return "cash";
}

async function seed(now: Date): Promise<number> {
  if ((await demoExpenseCount()) > 0) return 0;
  // Seeds the demo wallets first, so each expense is charged to a real wallet.
  const wallets = getWallets();
  const byType = new Map(wallets.map((w) => [w.type, w.id]));
  const items = generateDemoExpenses(now).map((e) => ({
    ...e,
    walletId: byType.get(walletTypeFor(e.itemName, e.category)) ?? null,
  }));
  const saved = await expenseStorage.saveExpenses(items);

  // Balances are derived (opening − spending), so lift each demo wallet's opening balance by what
  // the samples spent from it: the wallet still shows its designed balance instead of going minus.
  const spent = new Map<string, number>();
  for (const e of saved) if (e.walletId) spent.set(e.walletId, (spent.get(e.walletId) ?? 0) + e.amount);
  saveWallets(wallets.map((w) => ({ ...w, openingBalance: (w.openingBalance || 0) + (spent.get(w.id) ?? 0) })));
  return saved.length;
}

let inFlight: Promise<number> | null = null;

/**
 * Fills an empty demo scope with sample expenses. No-op outside demo mode or once the scope has
 * any expense, and concurrent calls (Strict Mode effects, several headers) share one run.
 * Returns how many expenses were added.
 */
export function seedDemoExpenses(now: Date = new Date()): Promise<number> {
  if (!isDemoMode()) return Promise.resolve(0);
  inFlight ??= seed(now).finally(() => {
    inFlight = null;
  });
  return inFlight;
}

/** Wipes demo expenses and demo feature data, then reseeds. Real data is never touched. */
export async function resetDemoData(now: Date = new Date()): Promise<number> {
  if (!isDemoMode()) return 0;
  const db = await getDatabase();
  const tx = db.transaction("expenses", "readwrite");
  const ids = await tx.store.index("by-user").getAllKeys(getDataScope());
  await Promise.all(ids.map((id) => tx.store.delete(id)));
  await tx.done;

  const storage = getStorage();
  for (const key of DEMO_FEATURE_KEYS) storage?.removeItem(key);
  return seedDemoExpenses(now);
}
