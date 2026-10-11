const attempts = new Map<string, { count: number; expiresAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;

// ponytail: Per-instance memory; use Redis for shared limits across instances.
export function isAuthRateLimited(req: Request, email: string): boolean {
  const now = Date.now();
  for (const [key, value] of attempts) {
    if (value.expiresAt <= now) attempts.delete(key);
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim()
    || req.headers.get("x-real-ip") || "unknown";
  const key = JSON.stringify([ip, email]);
  const entry = attempts.get(key) ?? { count: 0, expiresAt: now + WINDOW_MS };
  entry.count += 1;
  attempts.set(key, entry);
  return entry.count > 10;
}
