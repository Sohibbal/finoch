import type { ExpenseCategory } from "../types/expense";

const PRIMER_KEYWORDS = [
  // Food & Groceries
  "makan", "nasi", "beras", "lauk", "sayur", "ayam", "telur", "tempe", "tahu",
  "daging", "ikan", "warteg", "mie", "indomie", "sarapan", "siang", "malam",
  "galon", "air", "minum", "sembako", "roti",

  // Transportation
  "bensin", "pertalite", "pertamax", "spbu", "ojol", "gojek", "grab", "maxim",
  "angkot", "bus", "transjakarta", "krl", "kereta", "mrt", "lrt", "parkir",
  "tambal ban", "tol",

  // Academic & Campus
  "kuliah", "fotokopi", "print", "jilid", "buku", "pulpen", "alat tulis",
  "kertas", "modul", "praktikum", "ukt", "spp", "almamater",

  // Living & Daily Needs
  "kos", "kost", "kontrakan", "listrik", "token", "pdam", "laundry", "sabun",
  "odol", "shampoo", "deterjen", "tisu", "obat", "apotek", "dokter", "vitamin",

  // Connectivity
  "pulsa", "kuota", "paket data", "internet", "wifi", "indihome"
];

const BOCOR_HALUS_KEYWORDS = [
  // Cafe & Drinks & Hangout
  "kopi", "coffee", "cafe", "kafe", "starbucks", "janji jiwa", "point coffee",
  "kopi kenangan", "fore", "boba", "chatime", "mixue", "es teh", "jus",
  "minuman", "nongkrong", "nongki", "hangout",

  // Snacks & Impulse Food
  "snack", "ciki", "cemilan", "keripik", "es krim", "biskuit", "martabak",
  "donat", "cilok", "seblak", "gorengan", "baso aci", "croissant", "boba",

  // Entertainment, Gaming & Subscriptions
  "game", "top up", "diamond", "mobile legends", "ml", "steam", "valorant",
  "genshin", "netflix", "spotify", "youtube premium", "bioskop", "nonton",
  "cinema", "xxi", "karaoke",

  // Vices & Shopping
  "rokok", "marlboro", "surya", "sampoerna", "vape", "pods", "liquid",
  "checkout", "shopee", "tokopedia", "tiktok shop", "olshop", "baju",
  "sepatu", "skincare", "parfum", "makeup"
];

/**
 * Classifies an expense into "primer" (essential) or "bocor_halus" (lifestyle/impulse).
 * Uses deterministic keyword matching based on Indonesian university student spending habits.
 */
export function classifyExpenseCategory(itemName: string): ExpenseCategory {
  if (!itemName) return "primer";

  const lower = itemName.toLowerCase();

  // Check primer first or check word boundaries strictly
  for (const keyword of PRIMER_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, "i");
    if (regex.test(lower)) {
      return "primer";
    }
  }

  // Check bocor_halus with strict word boundaries
  for (const keyword of BOCOR_HALUS_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, "i");
    if (regex.test(lower)) {
      return "bocor_halus";
    }
  }

  // Default to primer if unmatched (basic needs default)
  return "primer";
}
