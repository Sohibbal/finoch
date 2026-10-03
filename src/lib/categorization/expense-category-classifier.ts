import type { ExpenseCategory } from "../types/expense";

const CATEGORY_RULES: Array<{
  category: ExpenseCategory;
  keywords: string[];
}> = [
  {
    category: "Food & Drinks",
    keywords: [
      "makan", "nasi", "beras", "lauk", "sayur", "ayam", "telur", "tempe", "tahu",
      "daging", "ikan", "warteg", "mie", "indomie", "sarapan", "siang", "malam",
      "galon", "air", "minum", "sembako", "roti", "gacoan", "bakso", "sate",
      "kopi", "coffee", "cafe", "kafe", "starbucks", "janji jiwa", "point coffee",
      "kopi kenangan", "fore", "boba", "chatime", "mixue", "es teh", "jus",
      "minuman", "snack", "ciki", "cemilan", "keripik", "es krim", "biskuit",
      "martabak", "donat", "cilok", "seblak", "gorengan", "baso aci", "croissant"
    ],
  },
  {
    category: "Transportation",
    keywords: [
      "bensin", "pertalite", "pertamax", "spbu", "ojol", "gojek", "grab", "maxim",
      "angkot", "bus", "transjakarta", "krl", "kereta", "mrt", "lrt", "parkir",
      "tambal ban", "tol", "tiket kereta", "tiket pesawat"
    ],
  },
  {
    category: "Housing & Bills",
    keywords: [
      "kos", "kost", "kontrakan", "listrik", "token", "pdam", "laundry",
      "pulsa", "kuota", "paket data", "internet", "wifi", "indihome"
    ],
  },
  {
    category: "Shopping & Clothing",
    keywords: [
      "checkout", "shopee", "tokopedia", "tiktok shop", "olshop", "baju",
      "sepatu", "skincare", "parfum", "makeup", "celana", "kaos", "jaket",
      "tas", "sandal", "sabun", "odol", "shampoo", "deterjen", "tisu"
    ],
  },
  {
    category: "Entertainment & Leisure",
    keywords: [
      "game", "top up", "diamond", "mobile legends", "ml", "steam", "valorant",
      "genshin", "netflix", "spotify", "youtube premium", "bioskop", "nonton",
      "cinema", "xxi", "karaoke", "wisata", "liburan"
    ],
  },
  {
    category: "Education & Career",
    keywords: [
      "kuliah", "fotokopi", "print", "jilid", "buku", "pulpen", "alat tulis",
      "kertas", "modul", "praktikum", "ukt", "spp", "almamater", "kursus"
    ],
  },
  {
    category: "Health & Personal Care",
    keywords: [
      "obat", "apotek", "dokter", "vitamin", "klinik", "rumah sakit",
      "perban", "minyak kayu putih", "salon", "barbershop", "cukur"
    ],
  },
  {
    category: "Social & Family",
    keywords: [
      "kirim uang", "ortu", "keluarga", "kado", "hadiah", "sedekah",
      "infaq", "zakat", "donasi", "traktir", "kondangan", "sumbangan"
    ],
  },
];

/**
 * Classifies an expense item name into one of 9 natural categories.
 */
export function classifyExpenseCategory(itemName: string): ExpenseCategory {
  if (!itemName) return "Other";

  const lower = itemName.toLowerCase();

  for (const rule of CATEGORY_RULES) {
    for (const keyword of rule.keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, "i");
      if (regex.test(lower)) {
        return rule.category;
      }
    }
  }

  return "Other";
}
