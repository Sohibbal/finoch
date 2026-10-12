export interface GenZInsightParams {
  nickname: string;
  todaySpent: number;
  dailyAllowance: number;
  topWishlistName?: string;
  streakDays?: number;
  now?: Date;
  variantIndex?: number;
}

export interface GenZInsightResult {
  headline: string;
  body: string;
  mood: "happy" | "warning" | "hype";
}

/**
 * Generates natural, dynamic daily financial insights using Indonesian Gen-Z phrasing.
 * Adapts to spending vs allowance and reflects impact on wishlist goals.
 * Provides multiple dynamic phrasing variations for each scenario so each visit feels fresh.
 */
export function generateDailyGenZInsight({
  nickname,
  todaySpent,
  dailyAllowance,
  topWishlistName,
  streakDays = 0,
  now = new Date(),
  variantIndex,
}: GenZInsightParams): GenZInsightResult {
  const safeName = nickname?.trim() || "Kawan";
  const isOverspent = todaySpent > dailyAllowance;

  if (isOverspent) {
    const diff = todaySpent - dailyAllowance;
    const wishlistNote = topWishlistName
      ? ` Kalo gini terus, jadwal dapetin "${topWishlistName}" bisa rada molor lho.`
      : " Kalo terus-terusan boncos, tabungan impian lo bisa seret.";

    if (diff > dailyAllowance * 0.5) {
      const headlines = [
        `Aduh ${safeName}, Rem Dulu Belanjanya! 🛑`,
        `Alarm Boncos Bunyi Nih, ${safeName}! 🚨`,
        `Tahan Dulu Checkout-nya, ${safeName}! 🛑`,
        `Waduh ${safeName}, Dompet Lagi Menjerit! ⚠️`,
        `Overbudget Lumayan Jauh Nih, ${safeName}! 💥`,
      ];
      const bodies = [
        `Waduh ${safeName}, hari ini pengeluaran lo udah tembus jatah harian nih.${wishlistNote} Tarik nafas dulu, yuk pasang rem darurat biar besok aman terkendali!`,
        `Pengeluaran hari ini udah melompat jauh di atas limit harian lo, ${safeName}.${wishlistNote} Jangan kalap dulu ya, besok saatnya mode super hemat diaktifkan!`,
        `Gawat nih ${safeName}, jatah belanja harian lo udah jebol lumayan berasa.${wishlistNote} Tenang, besok kita balik ke jalur disiplin lagi biar gak keterusan!`,
        `Hari ini jajan lo agak kelewatan batas nih ${safeName}.${wishlistNote} Tahan dulu nafsu hedon lo besok biar saldo tabungan gak makin tiris!`,
        `Catatan belanja hari ini merah tebal, ${safeName}!${wishlistNote} Yuk besok kita puasa belanja impulsif biar kondisi keuangan lo cepat pulih!`,
      ];

      const idx =
        typeof variantIndex === "number" && !isNaN(variantIndex)
          ? Math.abs(variantIndex) % headlines.length
          : Math.floor(Math.random() * headlines.length);

      return {
        headline: headlines[idx],
        body: bodies[idx],
        mood: "warning",
      };
    }

    const headlines = [
      `Tipis-tipis Lewat Batas Nih, ${safeName} ⚠️`,
      `Sedikit Kelewat Limit, ${safeName} 👀`,
      `Hati-hati Geser Tipis, ${safeName} ⚠️`,
      `Jaga Ritme Belanja Lo, ${safeName} 💡`,
      `Tipis Aja Over-nya, ${safeName} 🛑`,
    ];
    const bodies = [
      `Duh ${safeName}, pengeluaran hari ini sedikit ngelewatin jatah harian lo.${wishlistNote} Besok kita kompensasi jajan hemat ya biar keuangan lo langsung balance lagi.`,
      `Hari ini kepeleset dikit aja ngelewatin batas harian, ${safeName}.${wishlistNote} Besok tinggal potong dikit budget kopi biar kembali seimbang!`,
      `Pengeluaran hari ini rada mepet dan lewat tipis dari jatah harian lo, ${safeName}.${wishlistNote} Santai tapi tetap waspada, besok gas hemat lagi!`,
      `Masih bisa dikejar kok ${safeName}, cuma lewat tipis dari target harian.${wishlistNote} Besok kita atur ulang strategi biar tabungan tetap aman!`,
      `Dikit lagi sebenarnya pas target ${safeName}, tapi kepeleset dikit.${wishlistNote} Besok tahan jajan receh biar dompet lo kembali fit!`,
    ];

    const idx =
      typeof variantIndex === "number" && !isNaN(variantIndex)
        ? Math.abs(variantIndex) % headlines.length
        : Math.floor(Math.random() * headlines.length);

    return {
      headline: headlines[idx],
      body: bodies[idx],
      mood: "warning",
    };
  }

  // Under budget / disciplined
  if (todaySpent === 0) {
    const wishlistNote = topWishlistName
      ? ` Impian "${topWishlistName}" lo makin deket buat kecentang!`
      : " Dompet lo bener-bener terselamatkan hari ini!";

    const streakText = streakDays > 0 ? `udah ${streakDays} hari berturut-turut` : "langsung aktif";

    const headlines = [
      `No-Spend Day Juara, ${safeName}! 🔥`,
      `Disiplin Tingkat Dewa, ${safeName}! 🏆`,
      `Dompet Adem Ayem, ${safeName}! 💎`,
      `Zero Rupee Champion, ${safeName}! ⚡`,
      `Hemat Totalitas Banget, ${safeName}! 🎯`,
    ];
    const bodies = [
      `Gila sih ${safeName}, belum keluar duit sepeser pun hari ini! Streak hemat lo ${streakText}.${wishlistNote} Gass pertahanin!`,
      `Mantap abis ${safeName}, seharian ini nol pengeluaran tercatat! Rekor hemat lo ${streakText}.${wishlistNote} Pertahankan vibe juara ini!`,
      `Dompet lo istirahat total hari ini, ${safeName}! Streak lo ${streakText}.${wishlistNote} Mindset finansial lo bener-bener panutan!`,
      `Gak ada rupiah yang lepas hari ini, top markotop ${safeName}! Streak hemat lo ${streakText}.${wishlistNote} Lanjut terus besok!`,
      `Super disiplin ${safeName}, hari ini sukses no-spend day tanpa godaan! Rekor ${streakText}.${wishlistNote} Bangga banget sama konsistensi lo!`,
    ];

    const idx =
      typeof variantIndex === "number" && !isNaN(variantIndex)
        ? Math.abs(variantIndex) % headlines.length
        : Math.floor(Math.random() * headlines.length);

    return {
      headline: headlines[idx],
      body: bodies[idx],
      mood: "hype",
    };
  }

  const wishlistNote = topWishlistName
    ? ` dan target "${topWishlistName}" lo makin deket tercapai.`
    : " dan tabungan lo makin tebel.";

  const headlines = [
    `Gaya Finansial Lo On-Point, ${safeName}! 🚀`,
    `Pengeluaran Terkendali Rapih, ${safeName}! ✨`,
    `Mode Hemat On Track, ${safeName}! 🎯`,
    `Keuangan Lo Solid Banget, ${safeName}! 🌟`,
    `Disiplin Finansial Juara, ${safeName}! 👏`,
  ];
  const bodies = [
    `Keren banget ${safeName}! Pengeluaran hari ini aman terkendali di bawah jatah harian. Streak ${streakDays} hari jalan terus,${wishlistNote} Proud of you!`,
    `Ritme belanja lo hari ini pas banget di bawah jatah, ${safeName}! Streak hemat ${streakDays} hari terjaga rapi,${wishlistNote} Tetap konsisten begini ya!`,
    `Disiplin lo patut diacungi jempol ${safeName}! Duit keluar masih di bawah batas aman, streak ${streakDays} hari aman tentram,${wishlistNote} Gaspol terus!`,
    `Kondisi aman sentosa hari ini, ${safeName}! Pengeluaran gak bablas dan streak ${streakDays} hari lo tetap membara,${wishlistNote} Keren parah!`,
    `Keuangan terkelola apik ${safeName}, pengeluaran terjaga rapi sesuai jatah. Streak ${streakDays} hari makin kokoh,${wishlistNote} Lanjutkan sampai akhir bulan!`,
  ];

  const idx =
    typeof variantIndex === "number" && !isNaN(variantIndex)
      ? Math.abs(variantIndex) % headlines.length
      : Math.floor(Math.random() * headlines.length);

  return {
    headline: headlines[idx],
    body: bodies[idx],
    mood: "hype",
  };
}
