# HabitTracker - Sistem Desenleri

## Mimari Yapı

### Frontend Mimarisi
- **Component-based**: Her UI parçası ayrı bileşen
- **Pages**: Route'lara karşılık gelen sayfa bileşenleri
- **Layout**: Header + içerik wrapper pattern

### State Yönetimi
- **useState**: Lokal component state
- **useEffect**: Side effects ve data fetching
- **Props drilling**: Tema bilgisi Layout → Header

## Tasarım Desenleri

### Tema Sistemi
```tsx
// Layout.tsx - Tema yönetimi
const [theme, setTheme] = useState<'dark' | 'light'>('dark');

useEffect(() => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}, [theme]);
```

### Tailwind Dark Mode Pattern
```tsx
// Her element için dark: prefix kullanımı
className="bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-white"
```

### Modal Pattern (TimePicker, DurationPicker)
```tsx
// Overlay + centered content
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div onClick={(e) => e.stopPropagation()}>
    {/* Modal içeriği */}
  </div>
</div>
```

## UI Bileşen Desenleri

### Navbar (Header.tsx)
- Yuvarlak kenarlar (`rounded-full`)
- Aktif sayfa yeşil arka plan
- Mobil menü toggle
- Logo + navigasyon + mobil buton

### Contribution Calendar
- 53 hafta grid yapısı
- İç halka (12-23) + dış halka (0-11) saat seçimi
- Renk seviyeleri: gray → emerald (5 seviye)
- Hover tooltip ile detay

### Form Elemanları
```tsx
// Input pattern
className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 
  border border-gray-300 dark:border-[#32675a] rounded-lg 
  text-gray-800 dark:text-white placeholder-gray-400 
  dark:placeholder-white/30 focus:ring-2 focus:ring-primary"

// Button pattern
className="px-4 py-2 rounded-lg border transition-colors
  bg-primary text-white border-primary font-medium"
```

### Kart Tasarımı
```tsx
// Görev kartı (Home)
// Alışkanlık rengi tüm karta uygulanır (background %5, border %20 opaklık)
style={{
  backgroundColor: `color-mix(in srgb, ${habit.color} 5%, transparent)`,
  borderColor: `color-mix(in srgb, ${habit.color} 20%, transparent)`
}}
```

### Etiket (Badge) Pattern
```tsx
// Saat etiketi
<span className="flex items-center gap-1 px-2 py-1 rounded-full 
  bg-primary/10 text-primary text-xs">
  <span className="material-symbols-outlined">schedule</span>
  09:00
</span>
```

## Renk Sistemi

### Tailwind Config Renkleri
```js
colors: {
  "primary": "#2EAC8A",
  "primary-dark": "#0E7C5D",
  "background-light": "#f6f8f8",
  "background-dark": "#10221d",
  "border-light": "#e5e7eb",
  "border-dark": "#23483f",
  "accent-teal": "#14B8A6",
  "accent-orange": "#FB923C",
  "accent-rose": "#F43F5E",
}
```

### Takvim Renk Seviyeleri
```tsx
const getLevelClass = (level: number) => {
  const classes = [
    'bg-gray-300 dark:bg-white/10',           // level 0
    'bg-emerald-200 dark:bg-emerald-900/60',  // level 1
    'bg-emerald-400 dark:bg-emerald-600/80',  // level 2
    'bg-emerald-500 dark:bg-emerald-500',     // level 3
    'bg-emerald-700 dark:bg-emerald-400',     // level 4
  ];
  return classes[level];
};
```

## Responsive Tasarım

### Breakpoints
- `sm`: 640px
- `md`: 768px (navbar mobile/desktop geçişi)
- `lg`: 1024px (sidebar layout)

### Mobile-First Patterns
```tsx
// Takvim mobil scroll
className="overflow-x-auto min-w-[600px]"

// Grid responsive
className="grid grid-cols-1 sm:grid-cols-2 gap-4"

// Navbar responsive
className="hidden md:flex" // Desktop nav
className="md:hidden"      // Mobile menu button
```

### Veri Akışı

### Seri Hesaplama (Streak Logic)
- Seri, ardışık günlerde en az bir görevin tamamlanmasıyla artar.
- **Tolerans**: Kullanıcı 3 gün boyunca hiçbir görev yapmazsa seri sıfırlanır (`diffDays <= 3`).
- Bu hesaplama backend tarafında (`server/index.ts`) yapılır.

### Habit Toggle Flow
1. Kullanıcı checkbox'a tıklar
2. `toggleHabit(habitId)` çağrılır
3. API'ye POST/DELETE isteği
4. Local state güncellenir
5. Stats ve Calendar yeniden fetch edilir

### Tema Değişikliği Flow
1. Settings'te tema seçilir
2. `handleSave()` çağrılır
3. API'ye PUT isteği
4. `document.documentElement.classList.toggle('dark')`
5. `themeChange` event dispatch edilir
