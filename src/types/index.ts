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
  timezone?: string; // e.g., "Europe/Istanbul"
  [key: string]: string | undefined;
}

// Saat dilimi seçenekleri
export const TIMEZONE_OPTIONS = [
  { value: 'Etc/GMT+12', label: 'GMT-12 (Baker Adası)' },
  { value: 'Etc/GMT+11', label: 'GMT-11 (Amerikan Samoası)' },
  { value: 'Etc/GMT+10', label: 'GMT-10 (Hawaii)' },
  { value: 'Etc/GMT+9', label: 'GMT-9 (Alaska)' },
  { value: 'Etc/GMT+8', label: 'GMT-8 (Los Angeles, Vancouver)' },
  { value: 'Etc/GMT+7', label: 'GMT-7 (Denver, Edmonton)' },
  { value: 'Etc/GMT+6', label: 'GMT-6 (Mexico City, Chicago)' },
  { value: 'Etc/GMT+5', label: 'GMT-5 (New York, Toronto)' },
  { value: 'Etc/GMT+4', label: 'GMT-4 (Santiago, Santo Domingo)' },
  { value: 'Etc/GMT+3', label: 'GMT-3 (Buenos Aires, Sao Paulo)' },
  { value: 'Etc/GMT+2', label: 'GMT-2 (Güney Georgia)' },
  { value: 'Etc/GMT+1', label: 'GMT-1 (Azorlar)' },
  { value: 'Etc/GMT', label: 'GMT+0 (Londra, Dublin, Lizbon)' },
  { value: 'Etc/GMT-1', label: 'GMT+1 (Berlin, Roma, Paris)' },
  { value: 'Etc/GMT-2', label: 'GMT+2 (Kahire, Atina, İstanbul)' }, // Turkey is GMT+3 now but historically +2. Actually Turkey is GMT+3 fixed (Etc/GMT-3).
  { value: 'Etc/GMT-3', label: 'GMT+3 (İstanbul, Moskova, Riyad)' },
  { value: 'Etc/GMT-4', label: 'GMT+4 (Dubai, Bakü)' },
  { value: 'Etc/GMT-5', label: 'GMT+5 (Karaçi, Taşkent)' },
  { value: 'Etc/GMT-6', label: 'GMT+6 (Dakka, Almatı)' },
  { value: 'Etc/GMT-7', label: 'GMT+7 (Bangkok, Cakarta)' },
  { value: 'Etc/GMT-8', label: 'GMT+8 (Pekin, Singapur)' },
  { value: 'Etc/GMT-9', label: 'GMT+9 (Tokyo, Seul)' },
  { value: 'Etc/GMT-10', label: 'GMT+10 (Sidney, Melbourne)' },
  { value: 'Etc/GMT-11', label: 'GMT+11 (Solomon Adaları)' },
  { value: 'Etc/GMT-12', label: 'GMT+12 (Wellington, Auckland)' },
];

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
