export interface GenZInsightParams {
  nickname: string;
  todaySpent: number;
  dailyAllowance: number;
  topWishlistName?: string;
  streakDays?: number;
  now?: Date;
}

export interface GenZInsightResult {
  headline: string;
  body: string;
  mood: "happy" | "warning" | "hype";
}

/**
 * Generates natural, dynamic daily financial insights using Indonesian Gen-Z phrasing.
 * Adapts to spending vs allowance and reflects impact on wishlist goals.
 */
export function generateDailyGenZInsight({
  nickname,
  todaySpent,
  dailyAllowance,
  topWishlistName,
  streakDays = 0,
  now = new Date(),
}: GenZInsightParams): GenZInsightResult {
  const safeName = nickname?.trim() || "Kawan";
  const isOverspent = todaySpent > dailyAllowance;
  const dayIndex = now.getDay(); // 0 is Sunday, 6 is Saturday
  const isWeekend = dayIndex === 0 || dayIndex === 6;

  if (isOverspent) {
    const diff = todaySpent - dailyAllowance;
    const wishlistNote = topWishlistName
      ? ` Kalo gini terus, jadwal dapetin "${topWishlistName}" bisa rada molor lho.`
      : " Kalo terus-terusan boncos, tabungan impian lo bisa seret.";

    if (diff > dailyAllowance * 0.5) {
      return {
        headline: `Aduh ${safeName}, Rem Dulu Belanjanya! 🛑`,
        body: `Waduh ${safeName}, hari ini pengeluaran lo udah tembus jatah harian nih.${wishlistNote} Tarik nafas dulu, yuk pasang rem darurat biar besok aman terkendali!`,
        mood: "warning",
      };
    }

    return {
      headline: `Tipis-tipis Lewat Batas Nih, ${safeName} ⚠️`,
      body: `Duh ${safeName}, pengeluaran hari ini sedikit ngelewatin jatah harian lo.${wishlistNote} Besok kita kompensasi jajan hemat ya biar keuangan lo langsung balance lagi.`,
      mood: "warning",
    };
  }

  // Under budget / disciplined
  if (todaySpent === 0) {
    const wishlistNote = topWishlistName
      ? ` Impian "${topWishlistName}" lo makin deket buat kecentang!`
      : " Dompet lo bener-bener terselamatkan hari ini!";

    return {
      headline: `No-Spend Day Juara, ${safeName}! 🔥`,
      body: `Gila sih ${safeName}, belum keluar duit sepeser pun hari ini! Streak hemat lo ${streakDays > 0 ? `udah ${streakDays} hari` : "langsung aktif"}.${wishlistNote} Gass pertahanin!`,
      mood: "hype",
    };
  }

  const wishlistNote = topWishlistName
    ? ` dan target "${topWishlistName}" lo makin deket tercapai.`
    : " dan tabungan lo makin tebel.";

  return {
    headline: `Gaya Finansial Lo On-Point, ${safeName}! 🚀`,
    body: `Keren banget ${safeName}! Pengeluaran hari ini aman terkendali di bawah jatah harian. Streak ${streakDays} hari jalan terus,${wishlistNote} Proud of you!`,
    mood: "hype",
  };
}
