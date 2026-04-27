/**
 * Whole-day delta between an ISO date/timestamp and a reference Date,
 * floored to the day. Both points are interpreted in UTC to avoid TZ
 * surprises in scheduled jobs.
 */
export function daysBetween(iso: string, now: Date): number {
  const then = new Date(iso)
  if (Number.isNaN(then.getTime())) return 0
  const ms = now.getTime() - then.getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}
