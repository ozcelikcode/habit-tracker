import type { LucideIcon } from 'lucide-react';
import {
  AlarmClock,
  Dumbbell,
  HeartPulse,
  BookOpen,
  Brain,
  Briefcase,
  UtensilsCrossed,
  Activity,
  Coffee,
  Sun,
  Moon,
  Target,
  CheckSquare,
  Music,
  Award,
  CalendarDays,
  Flame,
  Apple,
  PenSquare,
  ShieldCheck,
} from 'lucide-react';

export type HabitIconId =
  | 'AlarmClock'
  | 'Dumbbell'
  | 'HeartPulse'
  | 'BookOpen'
  | 'Brain'
  | 'Briefcase'
  | 'UtensilsCrossed'
  | 'Activity'
  | 'Coffee'
  | 'Sun'
  | 'Moon'
  | 'Target'
  | 'CheckSquare'
  | 'Music'
  | 'Award'
  | 'CalendarDays'
  | 'Flame'
  | 'Apple'
  | 'PenSquare'
  | 'ShieldCheck';

export interface HabitIconOption {
  id: HabitIconId;
  label: string;
  Icon: LucideIcon;
}

export const HABIT_ICONS: HabitIconOption[] = [
  { id: 'AlarmClock', label: 'Erken uyanma', Icon: AlarmClock },
  { id: 'Dumbbell', label: 'Spor / egzersiz', Icon: Dumbbell },
  { id: 'HeartPulse', label: 'Sağlık / kardiyo', Icon: HeartPulse },
  { id: 'BookOpen', label: 'Okuma / öğrenme', Icon: BookOpen },
  { id: 'Brain', label: 'Odak / zihinsel çalışma', Icon: Brain },
  { id: 'Briefcase', label: 'İş / kariyer', Icon: Briefcase },
  { id: 'UtensilsCrossed', label: 'Beslenme / diyet', Icon: UtensilsCrossed },
  { id: 'Activity', label: 'Genel aktivite', Icon: Activity },
  { id: 'Coffee', label: 'Kahve / mola', Icon: Coffee },
  { id: 'Sun', label: 'Güne başlama / sabah rutini', Icon: Sun },
  { id: 'Moon', label: 'Akşam rutini / uyku', Icon: Moon },
  { id: 'Target', label: 'Hedef odaklı çalışma', Icon: Target },
  { id: 'CheckSquare', label: 'Görev tamamlama', Icon: CheckSquare },
  { id: 'Music', label: 'Müzik / enstrüman', Icon: Music },
  { id: 'Award', label: 'Başarı / ödül', Icon: Award },
  { id: 'CalendarDays', label: 'Planlama / takvim', Icon: CalendarDays },
  { id: 'Flame', label: 'Streak / seri', Icon: Flame },
  { id: 'Apple', label: 'Sağlıklı yaşam', Icon: Apple },
  { id: 'PenSquare', label: 'Yazma / günlük', Icon: PenSquare },
  { id: 'ShieldCheck', label: 'Disiplin / güven', Icon: ShieldCheck },
];

export const HABIT_ICON_MAP: Record<string, LucideIcon> = HABIT_ICONS.reduce(
  (acc, item) => {
    acc[item.id] = item.Icon;
    return acc;
  },
  {} as Record<string, LucideIcon>,
);
