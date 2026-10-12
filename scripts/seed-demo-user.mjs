import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@finoch.id";
const DEMO_PASSWORD = "demo123456";
const DEMO_NAME = "Demo Mahasiswa";
const DEMO_NICKNAME = "Demo";

// Sample items by category for generating natural student transactions
const EXPENSE_TEMPLATES = {
  "Makanan & Minuman": [
    { name: "Makan Siang Warteg Bahari", min: 14000, max: 20000 },
    { name: "Nasi Padang Ayam Bakar", min: 20000, max: 26000 },
    { name: "Kopi Susu Gula Aren", min: 15000, max: 22000 },
    { name: "Ayam Geprek Sambal Bawang", min: 16000, max: 23000 },
    { name: "Indomie Rebus Telur Kornet", min: 12000, max: 16000 },
    { name: "Sarapan Bubur Ayam Lengkap", min: 10000, max: 15000 },
    { name: "Makan Malam Nasi Goreng Gila", min: 18000, max: 24000 },
    { name: "Es Teh Jumbo Melati", min: 3000, max: 5000 },
    { name: "Mie Dok-Dok Kuah Kental", min: 13000, max: 18000 },
    { name: "Nasi Pecel Lele Crispy", min: 17000, max: 22000 },
    { name: "Gorengan Tempe & Bakwan", min: 4000, max: 8000 },
  ],
  "Transportasi": [
    { name: "Bensin Motor Pertalite", min: 25000, max: 35000 },
    { name: "Ojek Online ke Kampus", min: 12000, max: 18000 },
    { name: "Tiket KRL Commuter Line", min: 4000, max: 8000 },
    { name: "Parkir Motor Kampus", min: 2000, max: 4000 },
    { name: "Ojek Online Pulang Kuliah", min: 14000, max: 20000 },
    { name: "Isi Saldo Kartu Flazz", min: 50000, max: 50000 },
  ],
  "Kebutuhan Kost": [
    { name: "Laundry Kiloan Bersih Wangi", min: 20000, max: 35000 },
    { name: "Isi Ulang Air Galon Mineral", min: 6000, max: 8000 },
    { name: "Token Listrik Kost Bulanan", min: 50000, max: 75000 },
    { name: "Sabun Mandi & Shampo", min: 25000, max: 42000 },
    { name: "Deterjen & Pewangi Pakaian", min: 15000, max: 28000 },
    { name: "Sapu & Kantong Sampah", min: 12000, max: 18000 },
  ],
  "Hiburan & Jajan": [
    { name: "Tiket Nonton Bioskop XXI", min: 40000, max: 50000 },
    { name: "Popcorn & Minuman Bioskop", min: 25000, max: 40000 },
    { name: "Nongkrong Cafe Bareng Teman", min: 30000, max: 55000 },
    { name: "Snack & Minuman Minimarket", min: 12000, max: 25000 },
    { name: "Langganan Spotify Family", min: 19000, max: 19000 },
  ],
  "Belanja": [
    { name: "Kaos Polos Cotton Combed", min: 55000, max: 85000 },
    { name: "Kemeja Kuliah Casual", min: 85000, max: 145000 },
    { name: "Flashdisk Sandisk 32GB", min: 45000, max: 65000 },
    { name: "Sandal Slop Rumah Kost", min: 25000, max: 45000 },
  ],
  "Pendidikan": [
    { name: "Fotokopi Diktat & Jurnal", min: 5000, max: 15000 },
    { name: "Buku Catatan Spiral B5", min: 14000, max: 22000 },
    { name: "Modul Praktikum Laboratorium", min: 35000, max: 60000 },
    { name: "Alat Tulis & Pulpen Gel", min: 8000, max: 15000 },
  ],
  "Kesehatan": [
    { name: "Vitamin C & Suplemen Imun", min: 18000, max: 32000 },
    { name: "Minyak Kayu Putih & Paracetamol", min: 15000, max: 26000 },
    { name: "Masker Medis 1 Box", min: 15000, max: 25000 },
  ],
  "Lainnya": [
    { name: "Admin Transfer Antar Bank", min: 2500, max: 2500 },
    { name: "Admin Top Up E-Wallet", min: 1500, max: 1500 },
    { name: "Donasi Kotak Amal Jumat", min: 5000, max: 15000 },
    { name: "Tambal Ban Motor Bocor", min: 15000, max: 20000 },
  ],
};

function roundMoney(num) {
  return Math.round(num / 500) * 500;
}

function randomBetween(min, max) {
  return roundMoney(min + Math.random() * (max - min));
}

function pad(n) {
  return String(n).padStart(2, "0");
}

async function main() {
  console.log("=== SEEDING DEMO USER ACCOUNT (JAN - SEP 2026) ===");

  // 1. Check or Create User
  let user = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
  });

  const hashedPassword = bcrypt.hashSync(DEMO_PASSWORD, 10);

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: DEMO_EMAIL,
        password: hashedPassword,
        name: DEMO_NAME,
      },
    });
    console.log(`User created: ${user.email} (ID: ${user.id})`);
  } else {
    // Update password to ensure it matches DEMO_PASSWORD
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        name: DEMO_NAME,
      },
    });
    console.log(`User exists, updated credentials: ${user.email} (ID: ${user.id})`);
  }

  // 2. Upsert Profile
  await prisma.profile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      nickname: DEMO_NICKNAME,
    },
    update: {
      nickname: DEMO_NICKNAME,
    },
  });
  console.log(`Profile synced: nickname '${DEMO_NICKNAME}'`);

  // 3. Clear existing transactions & wishlists for clean seeding
  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.wishlist.deleteMany({ where: { userId: user.id } });
  console.log("Cleared existing demo transactions & wishlists.");

  // 4. Generate transactions for January 2026 - September 2026 (Month 1 to 9)
  const transactionsToCreate = [];

  for (let month = 1; month <= 9; month++) {
    const monthStr = pad(month);

    // --- PEMASUKAN BULAN INI ---
    // Pemasukan 1: Uang saku bulanan dari orang tua
    const allowanceDate = new Date(`2026-${monthStr}-01T08:00:00.000Z`);
    const monthlyAllowance = month === 1 ? 2800000 : month === 7 ? 3200000 : 2600000;
    transactionsToCreate.push({
      id: randomUUID(),
      userId: user.id,
      type: "income",
      itemName: "Uang Saku Bulanan Orang Tua",
      amount: monthlyAllowance,
      category: "Uang Saku",
      source: "manual",
      transactionDate: allowanceDate,
      isDeleted: false,
      createdAt: allowanceDate,
      updatedAt: allowanceDate,
    });

    // Pemasukan 2: Freelance / Hadiah / Project (di bulan-bulan tertentu)
    if ([2, 4, 6, 8, 9].includes(month)) {
      const freelanceDate = new Date(`2026-${monthStr}-15T14:30:00.000Z`);
      const freelanceAmount = month === 4 ? 1200000 : month === 8 ? 850000 : 600000;
      transactionsToCreate.push({
        id: randomUUID(),
        userId: user.id,
        type: "income",
        itemName: month === 4 ? "Project Website UMKM" : "Freelance Desain Banner",
        amount: freelanceAmount,
        category: "Freelance",
        source: "voice",
        transactionDate: freelanceDate,
        isDeleted: false,
        createdAt: freelanceDate,
        updatedAt: freelanceDate,
      });
    }

    if ([3, 7].includes(month)) {
      const bonusDate = new Date(`2026-${monthStr}-20T10:15:00.000Z`);
      transactionsToCreate.push({
        id: randomUUID(),
        userId: user.id,
        type: "income",
        itemName: month === 3 ? "Hadiah Juara Lomba Esai Kampus" : "Insentif Asisten Lab",
        amount: month === 3 ? 500000 : 400000,
        category: "Hadiah & Bonus",
        source: "manual",
        transactionDate: bonusDate,
        isDeleted: false,
        createdAt: bonusDate,
        updatedAt: bonusDate,
      });
    }

    // --- PENGELUARAN BULAN INI ---
    // Generate 16-24 expense transactions per month across all categories
    const daysInMonth = [1, 3, 5, 7, 8].includes(month) ? 31 : month === 2 ? 28 : 30;

    // Fixed bills per month
    // Listrik Kost (tgl 2)
    const electricDate = new Date(`2026-${monthStr}-02T09:00:00.000Z`);
    transactionsToCreate.push({
      id: randomUUID(),
      userId: user.id,
      type: "expense",
      itemName: "Token Listrik Kost",
      amount: 75000,
      category: "Kebutuhan Kost",
      source: "manual",
      transactionDate: electricDate,
      isDeleted: false,
      createdAt: electricDate,
      updatedAt: electricDate,
    });

    // Internet / Paket Data (tgl 3)
    const netDate = new Date(`2026-${monthStr}-03T11:00:00.000Z`);
    transactionsToCreate.push({
      id: randomUUID(),
      userId: user.id,
      type: "expense",
      itemName: "Paket Data Internet 50GB",
      amount: 65000,
      category: "Kebutuhan Kost",
      source: "manual",
      transactionDate: netDate,
      isDeleted: false,
      createdAt: netDate,
      updatedAt: netDate,
    });

    // Generate varied daily expenses
    const categories = Object.keys(EXPENSE_TEMPLATES);

    for (let day = 1; day <= daysInMonth; day += 2) {
      // Pick a primary meal
      const mealTpl = EXPENSE_TEMPLATES["Makanan & Minuman"][day % EXPENSE_TEMPLATES["Makanan & Minuman"].length];
      const mealAmount = randomBetween(mealTpl.min, mealTpl.max);
      const mealHour = 11 + (day % 4);
      const mealDate = new Date(`2026-${monthStr}-${pad(day)}T${pad(mealHour)}:20:00.000Z`);

      transactionsToCreate.push({
        id: randomUUID(),
        userId: user.id,
        type: "expense",
        itemName: mealTpl.name,
        amount: mealAmount,
        category: "Makanan & Minuman",
        source: day % 3 === 0 ? "voice" : day % 5 === 0 ? "ocr" : "manual",
        transactionDate: mealDate,
        isDeleted: false,
        createdAt: mealDate,
        updatedAt: mealDate,
      });

      // Occasional second item (Transport / Kost / Hiburan / Belanja / Pendidikan / Kesehatan / Lainnya)
      if (day % 3 === 1) {
        const cat = categories[(day + month) % categories.length];
        const tplList = EXPENSE_TEMPLATES[cat];
        const tpl = tplList[day % tplList.length];
        const amount = randomBetween(tpl.min, tpl.max);
        const hour = 16 + (day % 4);
        const itemDate = new Date(`2026-${monthStr}-${pad(day)}T${pad(hour)}:45:00.000Z`);

        transactionsToCreate.push({
          id: randomUUID(),
          userId: user.id,
          type: "expense",
          itemName: tpl.name,
          amount,
          category: cat,
          source: day % 4 === 0 ? "voice" : "manual",
          transactionDate: itemDate,
          isDeleted: false,
          createdAt: itemDate,
          updatedAt: itemDate,
        });
      }
    }
  }

  // Batch insert transactions
  console.log(`Inserting ${transactionsToCreate.length} transactions across Jan - Sep 2026...`);
  await prisma.transaction.createMany({
    data: transactionsToCreate,
  });
  console.log(`Successfully created ${transactionsToCreate.length} transactions!`);

  // 5. Create Wishlists
  const wishlistsToCreate = [
    {
      id: randomUUID(),
      userId: user.id,
      name: "iPad Air M2 untuk Kuliah & Desain",
      targetPrice: 9500000,
      savedAmount: 4800000,
      priority: 1,
      isAchieved: false,
      isDeleted: false,
      createdAt: new Date("2026-01-10T10:00:00.000Z"),
      updatedAt: new Date("2026-09-01T10:00:00.000Z"),
    },
    {
      id: randomUUID(),
      userId: user.id,
      name: "Sepatu Lari Road Running 5K",
      targetPrice: 1200000,
      savedAmount: 850000,
      priority: 2,
      isAchieved: false,
      isDeleted: false,
      createdAt: new Date("2026-02-15T10:00:00.000Z"),
      updatedAt: new Date("2026-09-15T10:00:00.000Z"),
    },
    {
      id: randomUUID(),
      userId: user.id,
      name: "Headphone ANC Wireless",
      targetPrice: 850000,
      savedAmount: 850000,
      priority: 3,
      isAchieved: true,
      isDeleted: false,
      createdAt: new Date("2026-01-05T10:00:00.000Z"),
      updatedAt: new Date("2026-06-20T10:00:00.000Z"),
    },
    {
      id: randomUUID(),
      userId: user.id,
      name: "Keyboard Mekanikal Bluetooth",
      targetPrice: 650000,
      savedAmount: 250000,
      priority: 4,
      isAchieved: false,
      isDeleted: false,
      createdAt: new Date("2026-04-01T10:00:00.000Z"),
      updatedAt: new Date("2026-09-20T10:00:00.000Z"),
    },
  ];

  await prisma.wishlist.createMany({
    data: wishlistsToCreate,
  });
  console.log(`Successfully created ${wishlistsToCreate.length} wishlist items!`);

  console.log("\n=== DEMO ACCOUNT READY ===");
  console.log(`Email    : ${DEMO_EMAIL}`);
  console.log(`Password : ${DEMO_PASSWORD}`);
  console.log(`Periode  : Januari 2026 - September 2026`);
  console.log("==========================\n");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
