export interface Habit {
  id: number;
  title: string;
  subtitle: string | null;
  color: string;
  icon: string | null;
  frequency: 'daily' | 'weekdays' | 'custom';
  custom_days: string | null; // JSON string of number array
  scheduled_time: string | null; // "HH:MM" format - ne zaman çalışacak
  duration_minutes: number | null; // kaç dakika sürecek
  created_at: string;
  updated_at: string;
  archived: number;
}

export interface Completion {
  id: number;
  habit_id: number;
  completed_date: string;
  created_at: string;
}

export interface Stats {
  totalCompleted: number;
  currentStreak: number;
  longestStreak: number;
}

export interface CalendarData {
  data: { completed_date: string; completed_count: number }[];
  totalHabits: number;
}

export interface Settings {
  username: string;
  theme: 'dark' | 'light';
  accentColor?: string;
  [key: string]: string | undefined;
}

export interface DailyNote {
  id?: number;
  note_date: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

// Alışkanlık renkleri - Açık ve koyu temaya uyumlu zarif renkler
export const HABIT_COLORS = [
  { name: 'Turkuaz', value: '#14B8A6' },     // Teal - Site accent
  { name: 'Turuncu', value: '#FB923C' },     // Orange - Site accent
  { name: 'Gül', value: '#F43F5E' },         // Rose - Site accent
  { name: 'Zümrüt', value: '#10B981' },      // Emerald
  { name: 'Okyanus', value: '#0EA5E9' },     // Sky blue
  { name: 'Ametist', value: '#8B5CF6' },     // Violet
  { name: 'Amber', value: '#F59E0B' },       // Amber
  { name: 'Çivit', value: '#6366F1' },       // Indigo
  { name: 'Mercan', value: '#FB7185' },      // Pink coral
  { name: 'Lavanta', value: '#A78BFA' },     // Purple light
];

// Tekrar sıklığı seçenekleri
export const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Her gün' },
  { value: 'weekdays', label: 'Hafta içi' },
  { value: 'custom', label: 'Özel' },
];

// Haftanın günleri
export const WEEKDAYS = [
  { value: 0, label: 'Paz' },
  { value: 1, label: 'Pzt' },
  { value: 2, label: 'Sal' },
  { value: 3, label: 'Çar' },
  { value: 4, label: 'Per' },
  { value: 5, label: 'Cum' },
  { value: 6, label: 'Cmt' },
];
