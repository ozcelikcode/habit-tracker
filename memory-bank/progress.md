## Progress Log

- **2025-11-19**: Proje gereksinimleri ve temel dokümantasyon oluşturuldu; henüz kod iskeleti yok.
- **2025-11-19 (later)**: Vite + React + Tailwind kurulup tasarımlardaki home/control ekranları mock verilerle uyarlandı, README ve Tailwind temaları güncellendi.
- **2025-11-19 (night)**: Express + SQLite backend (`/api/dashboard`) yazıldı, seed verileri üretildi; frontend `useDashboardData` ile gerçek API’dan heatmap/istatistik/görev çekiyor.
- **2025-11-20**: `/api/habits` ve `/api/habit-entries/toggle` uçlarıyla alışkanlık ekleme ve görev tamamlama DB’ye yazılıyor; Control Panel formları tamamlandı.
- **2025-11-20 (later)**: `npm run dev:all` komutu eklendi (concurrently ile API + Vite birlikte çalışıyor), README güncellendi.
- **2025-11-21**: Tema sistemi (ThemeProvider + ThemeMenu) eklendi; CSS değişkenleri/ Tailwind token’ları ile 3 palet ve light/dark mod arayüz genelinde uygulanabiliyor.
