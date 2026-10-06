export type DayStatus = "no_spend" | "disciplined" | "overspent";

export interface DailyCashflowPoint {
  date: string; // YYYY-MM-DD
  dayNumber: number; // 1-31
  dayName: string; // Sen, Sel, Rab, Kam, Jum, Sab, Min
  totalSpent: number;
  wantsSpent: number;
  status: DayStatus;
  transactionsCount: number;
  isToday: boolean;
  isFuture: boolean;
}

export interface StreakBadge {
  title: string;
  emoji: string;
  level: "master" | "warrior" | "fighter" | "novice";
  description: string;
}

export interface StreakSummary {
  currentStreak: number;
  longestStreak: number;
  greenDaysCount: number; // No-spend days
  yellowDaysCount: number; // Disciplined days
  redDaysCount: number; // Overspent days
  totalDaysEvaluated: number;
  badge: StreakBadge;
  monthlyPoints: DailyCashflowPoint[];
}
