import { DailyCashflowPoint, StreakBadge, StreakSummary, DayStatus } from "@/types/streak-types";

export interface StreakExpenseCandidate {
  id?: string;
  itemName?: string;
  amount: number;
  category?: string;
  createdAt?: string;
}

const WANTS_CATEGORIES = [
  "shopping & lifestyle",
  "shopping",
  "entertainment & leisure",
  "entertainment",
  "social & family",
  "other",
];

const DAY_NAMES_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

/**
 * Evaluates monthly cashflow days and calculates no-spend / disciplined streaks.
 */
export function calculateStreakMetrics(
  expenses: StreakExpenseCandidate[],
  dailySafeLimit: number = 50000,
  referenceDate: Date = new Date()
): StreakSummary {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth(); // 0-indexed
  const todayDateNumber = referenceDate.getDate();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map expenses by day number (1 - 31)
  const dayMap: Record<number, { total: number; wants: number; count: number }> = {};
  for (let i = 1; i <= daysInMonth; i++) {
    dayMap[i] = { total: 0, wants: 0, count: 0 };
  }

  for (const exp of expenses) {
    if (!exp.createdAt) continue;
    const d = new Date(exp.createdAt);
    if (isNaN(d.getTime())) continue;

    if (d.getFullYear() === year && d.getMonth() === month) {
      const dayNum = d.getDate();
      if (dayMap[dayNum]) {
        dayMap[dayNum].total += exp.amount || 0;
        dayMap[dayNum].count += 1;

        const cat = (exp.category || "").toLowerCase();
        const isWant = WANTS_CATEGORIES.some((c) => cat.includes(c));
        if (isWant) {
          dayMap[dayNum].wants += exp.amount || 0;
        }
      }
    }
  }

  const monthlyPoints: DailyCashflowPoint[] = [];
  let greenDaysCount = 0;
  let yellowDaysCount = 0;
  let redDaysCount = 0;
  let evaluatedDays = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const dObj = new Date(year, month, day);
    const dayName = DAY_NAMES_ID[dObj.getDay()] || "Sen";
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const isToday = day === todayDateNumber;
    const isFuture = day > todayDateNumber;

    const data = dayMap[day];

    let status: DayStatus = "no_spend";

    if (isFuture) {
      status = "disciplined";
    } else {
      evaluatedDays += 1;
      if (data.total === 0 || data.wants === 0) {
        status = "no_spend"; // No-spend day / zero wants
        greenDaysCount += 1;
      } else if (data.total <= dailySafeLimit) {
        status = "disciplined"; // Within safe daily allowance
        yellowDaysCount += 1;
      } else {
        status = "overspent"; // Exceeded daily allowance
        redDaysCount += 1;
      }
    }

    monthlyPoints.push({
      date: dateStr,
      dayNumber: day,
      dayName,
      totalSpent: data.total,
      wantsSpent: data.wants,
      status,
      transactionsCount: data.count,
      isToday,
      isFuture,
    });
  }

  // Calculate current streak backwards from today
  let currentStreak = 0;
  for (let day = todayDateNumber; day >= 1; day--) {
    const pt = monthlyPoints[day - 1];
    if (pt && (pt.status === "no_spend" || pt.status === "disciplined")) {
      currentStreak += 1;
    } else {
      break;
    }
  }

  // Calculate longest streak in evaluated days
  let longestStreak = 0;
  let tempStreak = 0;
  for (let day = 1; day <= todayDateNumber; day++) {
    const pt = monthlyPoints[day - 1];
    if (pt && (pt.status === "no_spend" || pt.status === "disciplined")) {
      tempStreak += 1;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  }

  // Assign gamified badge
  let badge: StreakBadge = {
    title: "Pemula Disiplin",
    emoji: "🌱",
    level: "novice",
    description: "Mulai streak hematmu hari ini dengan membatasi jajan impulsif!",
  };

  if (currentStreak >= 7) {
    badge = {
      title: "Master Tahan Godaan",
      emoji: "🏆",
      level: "master",
      description: `Luar biasa! Kamu berhasil mempertahankan streak ${currentStreak} hari berturut-turut tanpa boros!`,
    };
  } else if (currentStreak >= 4) {
    badge = {
      title: "Pendekar Hemat",
      emoji: "🔥",
      level: "warrior",
      description: `Hebat! ${currentStreak} hari berturut-turut keuangan kamu sangat disiplin. Lanjutkan!`,
    };
  } else if (currentStreak >= 2) {
    badge = {
      title: "Pejuang Tanggal Muda",
      emoji: "⚡",
      level: "fighter",
      description: `Konsisten! ${currentStreak} hari bertahan di zona aman finansial.`,
    };
  }

  return {
    currentStreak,
    longestStreak,
    greenDaysCount,
    yellowDaysCount,
    redDaysCount,
    totalDaysEvaluated: evaluatedDays,
    badge,
    monthlyPoints,
  };
}
