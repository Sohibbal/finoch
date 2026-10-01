/**
 * Calculates a deterministic confidence score (0.0 to 1.0) based on
 * structural quality of the parsed expense.
 *
 * NOTE: This is a deterministic rule-matching heuristic, not an ML probability.
 */
export function calculateConfidence(
  itemName: string,
  amount: number,
  hasExactCategoryMatch: boolean
): number {
  if (!itemName || itemName === "Pengeluaran" || amount <= 0) {
    return 0.3;
  }

  let score = 0.75;

  if (itemName.length >= 3) {
    score += 0.1;
  }

  if (amount >= 500 && amount <= 50000000) {
    score += 0.05;
  }

  if (hasExactCategoryMatch) {
    score += 0.05;
  }

  return Math.min(0.98, parseFloat(score.toFixed(2)));
}
