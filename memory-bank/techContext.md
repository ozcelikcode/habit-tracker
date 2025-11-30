# HabitTracker - Teknik Bağlam

## Teknoloji Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Build tool ve dev server
- **React Router DOM** - Sayfa yönlendirme
- **Tailwind CSS v3.4.0** - Styling

### Backend
- **Express.js** - API server
- **better-sqlite3** - SQLite veritabanı
- **tsx** - TypeScript çalıştırma

### Geliştirme Araçları
- **ESLint** - Kod kalitesi
- **PostCSS** - CSS işleme
- **Autoprefixer** - CSS uyumluluk

## Proje Yapısı
```
habit-tracker/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx      # Navbar bileşeni
│   │   │   └── Layout.tsx      # Ana layout wrapper
│   │   ├── ContributionCalendar.tsx  # GitHub tarzı takvim
│   │   ├── TimePicker.tsx      # Saat seçici (24 saat)
│   │   └── DurationPicker.tsx  # Süre seçici
│   ├── pages/
│   │   ├── Home.tsx            # Ana sayfa + görevler
│   │   ├── Habits.tsx          # Alışkanlık listesi
│   │   ├── NewHabit.tsx        # Yeni alışkanlık formu
│   │   ├── EditHabit.tsx       # Düzenleme formu
│   │   ├── Settings.tsx        # Ayarlar sayfası
│   │   ├── Notes.tsx           # Notlar listesi (DnD sıralama)
│   │   └── NewNote.tsx         # Not ekleme (Editor.js)
│   ├── api/
│   │   └── index.ts            # API fonksiyonları
│   ├── types/
│   │   └── index.ts            # TypeScript tipleri
│   ├── App.tsx                 # Router yapısı
│   ├── main.tsx                # Entry point
│   └── index.css               # Global stiller
├── server/
│   ├── index.ts                # Express API server
│   ├── db.ts                   # SQLite bağlantısı
│   └── habits.db               # Veritabanı dosyası
├── tailwind.config.js          # Tailwind ayarları
├── vite.config.ts              # Vite ayarları
└── package.json
```

## Veritabanı Şeması

### habits tablosu
```sql
CREATE TABLE habits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  subtitle TEXT,
  color TEXT DEFAULT '#2EAC8A',
  frequency TEXT DEFAULT 'daily',
  custom_days TEXT,
  scheduled_time TEXT,        -- HH:MM format
  duration_minutes INTEGER,   -- dakika cinsinden
  created_at DATETIME,
  updated_at DATETIME,
  archived INTEGER DEFAULT 0
);
```

### completions tablosu
```sql
CREATE TABLE completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_id INTEGER NOT NULL,
  completed_date DATE NOT NULL,
  created_at DATETIME,
  UNIQUE(habit_id, completed_date)
);
```

### settings tablosu
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

## API Endpoints

### Habits
- `GET /api/habits` - Tüm alışkanlıkları getir
- `GET /api/habits/:id` - Tek alışkanlık
- `POST /api/habits` - Yeni oluştur
- `PUT /api/habits/:id` - Güncelle
- `DELETE /api/habits/:id` - Sil (arşivle)

### Completions
- `GET /api/completions` - Tamamlamaları getir
- `POST /api/completions` - Tamamla
- `DELETE /api/completions` - Tamamlamayı kaldır

### Stats & Calendar
- `GET /api/stats` - İstatistikler
- `GET /api/calendar/:year` - Yıllık takvim verisi

### Settings
- `GET /api/settings` - Ayarları getir
- `PUT /api/settings/:key` - Ayar güncelle

## Portlar
- **Frontend**: http://localhost:5175
- **Backend**: http://localhost:3001
- Vite proxy ile `/api` istekleri backend'e yönlendirilir

## Çalıştırma
```bash
# Backend
npx tsx server/index.ts

# Frontend
npm run dev
```
