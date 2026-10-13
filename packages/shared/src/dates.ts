const IST = 'Asia/Kolkata';

/** YYYY-MM-DD in Asia/Kolkata for a UTC instant. */
export function toISTDateString(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: IST,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** Parse YYYY-MM-DD as start of that calendar day in IST (stored as UTC Date). */
export function parseISTDate(dateStr: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new Error('Invalid date format, expected YYYY-MM-DD');
  }
  const d = new Date(`${dateStr}T00:00:00+05:30`);
  if (Number.isNaN(d.getTime())) throw new Error('Invalid date');
  return d;
}

export function addDaysIST(dateStr: string, days: number): string {
  const d = parseISTDate(dateStr);
  d.setUTCDate(d.getUTCDate() + days);
  return toISTDateString(d);
}

export function compareDateStrings(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export function isWeekdayIST(dateStr: string): boolean {
  const d = parseISTDate(dateStr);
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: IST,
    weekday: 'short',
  }).format(d);
  return weekday !== 'Sun';
}
