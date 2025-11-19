## Progress Log

- **2025-11-19**: Captured core requirements and contexts. Planning stage underway; no code scaffold yet.
- **2025-11-19 (later)**: Vite + React + Tailwind proje iskeleti kuruldu. Tasarımdaki `home` ve `control panel` ekranları React bileşenleriyle uygulanıp mock verilerle beslendi. README ve Tailwind temaları güncellendi.
- **2025-11-19 (night)**: Express + SQLite backend kuruldu (`/api/dashboard`), seed verileri üretildi. Frontend `useDashboardData` kancasıyla gerçek API'dan heatmap/istatistik/görevleri çekiyor. Vite proxy, README ve komutlar backend'e göre güncellendi.
- **2025-11-20**: API genişletilerek `/api/habits` ve `/api/habit-entries/toggle` uçları eklendi; yeni alışkanlık ekleme, görev tamamlama/geri alma işlemleri artık DB'ye yazılıyor. Home & Control Panel checkbox'ları backend'e bağlı hale geldi, Control Panel'de iki farklı form üzerinden alışkanlık oluşturma akışı sağlandı.
- **2025-11-20 (later)**: Geliştirme sürecinde API’nin mutlaka çalışması için `npm run dev:all` komutu tanımlandı; `concurrently` ile Express + Vite aynı anda başlatılıyor ve README güncellendi.
