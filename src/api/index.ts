import type { Habit, Completion, Stats, CalendarData, Settings, DailyNote } from '../types';

const API_BASE = '/api';

// ============ HABITS ============

export async function getHabits(): Promise<Habit[]> {
  const res = await fetch(`${API_BASE}/habits`);
  if (!res.ok) throw new Error('Alışkanlıklar getirilemedi');
  return res.json();
}

export async function getHabit(id: number): Promise<Habit> {
  const res = await fetch(`${API_BASE}/habits/${id}`);
  if (!res.ok) throw new Error('Alışkanlık bulunamadı');
  return res.json();
}

export async function createHabit(habit: Partial<Habit>): Promise<Habit> {
  const res = await fetch(`${API_BASE}/habits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(habit),
  });
  if (!res.ok) throw new Error('Alışkanlık oluşturulamadı');
  return res.json();
}

export async function updateHabit(id: number, habit: Partial<Habit>): Promise<Habit> {
  const res = await fetch(`${API_BASE}/habits/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(habit),
  });
  if (!res.ok) throw new Error('Alışkanlık güncellenemedi');
  return res.json();
}

export async function deleteHabit(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/habits/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Alışkanlık silinemedi');
}

// ============ COMPLETIONS ============

export async function getCompletions(params?: {
  start_date?: string;
  end_date?: string;
  habit_id?: number;
}): Promise<Completion[]> {
  const searchParams = new URLSearchParams();
  if (params?.start_date) searchParams.set('start_date', params.start_date);
  if (params?.end_date) searchParams.set('end_date', params.end_date);
  if (params?.habit_id) searchParams.set('habit_id', String(params.habit_id));

  const res = await fetch(`${API_BASE}/completions?${searchParams}`);
  if (!res.ok) throw new Error('Tamamlamalar getirilemedi');
  return res.json();
}

export async function completeHabit(habit_id: number, completed_date: string): Promise<void> {
  const res = await fetch(`${API_BASE}/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ habit_id, completed_date }),
  });
  if (!res.ok) throw new Error('Tamamlama kaydedilemedi');
}

export async function uncompleteHabit(habit_id: number, completed_date: string): Promise<void> {
  const res = await fetch(`${API_BASE}/completions`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ habit_id, completed_date }),
  });
  if (!res.ok) throw new Error('Tamamlama kaldırılamadı');
}

// ============ STATS ============

export async function getStats(): Promise<Stats> {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('İstatistikler getirilemedi');
  return res.json();
}

export async function getCalendarData(year: number): Promise<CalendarData> {
  const res = await fetch(`${API_BASE}/calendar/${year}`);
  if (!res.ok) throw new Error('Takvim verisi getirilemedi');
  return res.json();
}

// ============ SETTINGS ============

export async function getSettings(): Promise<Settings> {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Ayarlar getirilemedi');
  return res.json();
}

export async function updateSetting(key: string, value: string): Promise<void> {
  const res = await fetch(`${API_BASE}/settings/${key}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  });
  if (!res.ok) throw new Error('Ayar güncellenemedi');
}

// ============ NOTES ============

export async function getTodayNote(): Promise<DailyNote> {
  const res = await fetch(`${API_BASE}/notes/today`);
  if (!res.ok) throw new Error('Not getirilemedi');
  return res.json();
}

export async function getNoteDates(year: number): Promise<{ note_date: string }[]> {
  const res = await fetch(`${API_BASE}/notes?year=${year}`);
  if (!res.ok) throw new Error('Not tarihleri getirilemedi');
  return res.json();
}

export async function saveTodayNote(content: string): Promise<DailyNote> {
  const res = await fetch(`${API_BASE}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error('Not kaydedilemedi');
  return res.json();
}
