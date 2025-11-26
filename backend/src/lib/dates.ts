import { startOfDay, differenceInCalendarDays } from 'date-fns';

export function parseDateOrFail(value: string): Date | null {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export function isTodayOrFuture(date: Date): boolean {
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  return differenceInCalendarDays(target, today) >= 0;
}

export function isToday(date: Date): boolean {
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  return differenceInCalendarDays(target, today) === 0;
}

export function startOfDayUTC(date: Date): Date {
  return startOfDay(date);
}

export function differenceInDays(a: Date, b: Date): number {
  return differenceInCalendarDays(startOfDay(a), startOfDay(b));
}
