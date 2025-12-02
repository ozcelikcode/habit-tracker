import type { LucideIcon } from 'lucide-react';
import {
  Dumbbell,
  HeartPulse,
  Footprints,
  Bike,
  Flower2,
  GlassWater,
  Apple,
  UtensilsCrossed,
  CigaretteOff,
  BedDouble,
  Sun,
  Moon,
  AlarmClock,
  Coffee,
  Droplets,
  Smile,
  Briefcase,
  Brain,
  BookOpen,
  PenSquare,
  Code2,
  Target,
  CheckSquare,
  CalendarDays,
  ShieldCheck,
  Wallet,
  PiggyBank,
  DollarSign,
  ShoppingBag,
  Gamepad2,
  Music,
  Tv,
  Camera,
  Palette,
  Guitar,
  Plane,
  Globe,
  Smartphone,
  Laptop,
  Wifi,
  Battery,
  Home,
  Car,
  Leaf,
  Flame,
  Award,
  Star,
} from 'lucide-react';

export type HabitIconId = string;

export interface HabitIconOption {
  id: HabitIconId;
  label: string;
  Icon: LucideIcon;
}

export const HABIT_ICONS: HabitIconOption[] = [
  // Sağlık & Spor
  { id: 'Dumbbell', label: 'Spor / Egzersiz', Icon: Dumbbell },
  { id: 'HeartPulse', label: 'Kardiyo', Icon: HeartPulse },
  { id: 'Footprints', label: 'Yürüyüş', Icon: Footprints },
  { id: 'Bike', label: 'Bisiklet', Icon: Bike },
  { id: 'Flower2', label: 'Meditasyon / Yoga', Icon: Flower2 },
  { id: 'GlassWater', label: 'Su İçme', Icon: GlassWater },
  { id: 'Apple', label: 'Sağlıklı Beslenme', Icon: Apple },
  { id: 'UtensilsCrossed', label: 'Diyet', Icon: UtensilsCrossed },
  { id: 'CigaretteOff', label: 'Sigarayı Bırakma', Icon: CigaretteOff },
  { id: 'BedDouble', label: 'Uyku Düzeni', Icon: BedDouble },
  
  // Günlük Rutin
  { id: 'Sun', label: 'Sabah Rutini', Icon: Sun },
  { id: 'Moon', label: 'Akşam Rutini', Icon: Moon },
  { id: 'AlarmClock', label: 'Erken Kalkma', Icon: AlarmClock },
  { id: 'Coffee', label: 'Kahve Molası', Icon: Coffee },
  { id: 'ShowerHead', label: 'Duş / Bakım', Icon: Droplets }, // Droplets as shower alternative
  { id: 'Tooth', label: 'Diş Fırçalama', Icon: Smile }, // Smile as placeholder if Tooth not avail, or just generic hygiene

  // İş & Üretkenlik
  { id: 'Briefcase', label: 'İş', Icon: Briefcase },
  { id: 'Brain', label: 'Odaklanma', Icon: Brain },
  { id: 'BookOpen', label: 'Okuma', Icon: BookOpen },
  { id: 'PenSquare', label: 'Yazma / Günlük', Icon: PenSquare },
  { id: 'Code2', label: 'Kodlama', Icon: Code2 },
  { id: 'Target', label: 'Hedefler', Icon: Target },
  { id: 'CheckSquare', label: 'Görevler', Icon: CheckSquare },
  { id: 'CalendarDays', label: 'Planlama', Icon: CalendarDays },
  { id: 'ShieldCheck', label: 'Disiplin', Icon: ShieldCheck },
  
  // Finans
  { id: 'Wallet', label: 'Bütçe', Icon: Wallet },
  { id: 'PiggyBank', label: 'Tasarruf', Icon: PiggyBank },
  { id: 'DollarSign', label: 'Kazanç', Icon: DollarSign },
  { id: 'ShoppingBag', label: 'Alışveriş', Icon: ShoppingBag },

  // Hobi & Eğlence
  { id: 'Gamepad2', label: 'Oyun', Icon: Gamepad2 },
  { id: 'Music', label: 'Müzik', Icon: Music },
  { id: 'Tv', label: 'Dizi / Film', Icon: Tv },
  { id: 'Camera', label: 'Fotoğraf', Icon: Camera },
  { id: 'Palette', label: 'Sanat / Çizim', Icon: Palette },
  { id: 'Guitar', label: 'Enstrüman', Icon: Guitar },
  { id: 'Plane', label: 'Seyahat', Icon: Plane },
  { id: 'Globe', label: 'Dil Öğrenme', Icon: Globe },
  
  // Teknoloji
  { id: 'Smartphone', label: 'Ekran Süresi', Icon: Smartphone },
  { id: 'Laptop', label: 'Bilgisayar', Icon: Laptop },
  { id: 'Wifi', label: 'İnternet', Icon: Wifi },
  { id: 'Battery', label: 'Enerji', Icon: Battery },

  // Diğer
  { id: 'Home', label: 'Ev İşleri', Icon: Home },
  { id: 'Car', label: 'Araba / Sürüş', Icon: Car },
  { id: 'Leaf', label: 'Bahçe / Doğa', Icon: Leaf },
  { id: 'Flame', label: 'Seri', Icon: Flame },
  { id: 'Award', label: 'Ödül', Icon: Award },
  { id: 'Star', label: 'Favori', Icon: Star },
];

export const HABIT_ICON_MAP: Record<string, LucideIcon> = HABIT_ICONS.reduce(
  (acc, item) => {
    acc[item.id] = item.Icon;
    return acc;
  },
  {} as Record<string, LucideIcon>,
);
