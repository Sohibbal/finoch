import { DailyCashflowPoint, StreakBadge, StreakSummary, DayStatus } from "@/types/streak-types";
import { localDateKey, parseDate } from "@/lib/date";

export const WANTS_CATEGORIES = ["shopping", "entertainment", "hiburan", "jajan", "leisure", "lifestyle"];

export interface StreakExpenseCandidate {
  id?: string;
  itemName?: string;
  amount: number;
  category?: string;
  createdAt?: string;
}

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

  // Map expenses by local day key (YYYY-MM-DD), across all months so streaks can span them
  const dayMap: Record<string, { total: number; wants: number; count: number }> = {};
  let earliestDay: string | null = null;

  for (const exp of expenses) {
    const d = parseDate(exp.createdAt);
    if (!d) continue;

    const key = localDateKey(d);
    if (!dayMap[key]) dayMap[key] = { total: 0, wants: 0, count: 0 };
    if (!earliestDay || key < earliestDay) earliestDay = key;

    dayMap[key].total += exp.amount || 0;
    dayMap[key].count += 1;

    const cat = (exp.category || "").toLowerCase();
    const isWant = WANTS_CATEGORIES.some((c) => cat.includes(c));
    if (isWant) {
      dayMap[key].wants += exp.amount || 0;
    }
  }

  const emptyDay = { total: 0, wants: 0, count: 0 };
  // Green only for a true no-spend day; any spending is judged against the daily limit
  const statusOf = (total: number): DayStatus =>
    total === 0 ? "no_spend" : total <= dailySafeLimit ? "disciplined" : "overspent";

  const monthlyPoints: DailyCashflowPoint[] = [];
  let greenDaysCount = 0;
  let yellowDaysCount = 0;
  let redDaysCount = 0;
  let evaluatedDays = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const dObj = new Date(year, month, day);
    const dayName = DAY_NAMES_ID[dObj.getDay()] || "Sen";
    const dateStr = localDateKey(dObj);

    const isToday = day === todayDateNumber;
    const isFuture = day > todayDateNumber;

    const data = dayMap[dateStr] || emptyDay;

    let status: DayStatus = "no_spend";

    if (isFuture) {
      status = "disciplined";
    } else {
      evaluatedDays += 1;
      status = statusOf(data.total);
      if (status === "no_spend") greenDaysCount += 1;
      else if (status === "disciplined") yellowDaysCount += 1;
      else redDaysCount += 1;
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

  // Calculate current streak backwards from today. It continues into previous months
  // (so it doesn't reset on the 1st) but stops before the first recorded expense.
  let currentStreak = 0;
  const monthStartKey = localDateKey(new Date(year, month, 1));
  for (let offset = 0; offset < 3660; offset++) {
    const key = localDateKey(new Date(year, month, todayDateNumber - offset));
    if (key < monthStartKey && (!earliestDay || key < earliestDay)) break;
    if (statusOf((dayMap[key] || emptyDay).total) === "overspent") break;
    currentStreak += 1;
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
  longestStreak = Math.max(longestStreak, currentStreak);

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
