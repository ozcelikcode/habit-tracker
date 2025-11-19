# Habit Tracker

Vite + React + TailwindCSS ile hazırlanmış alışkanlık takip paneli. Uygulamada iki temel ekran bulunur:

- **Ana sayfa** (`/`): GitHub katkı haritası benzeri ısı haritalı takvim, istatistik kartları ve bugünkü görev listesi.
- **Kontrol paneli** (`/control-panel`): Yan menü, görev oluşturma formu, filtreler ve detaylı görev listesi.

Tasarım referansları `design/home.html` ve `design/control-panel.html` dosyalarında bulunur.

## Çalıştırma

```bash
npm install          # bağımlılıkları indir
npm run dev:all      # API (4000) + Vite (5173) aynı anda ayağa kalkar
```

Ya da servisleri ayrı ayrı başlatmak istersen:

```bash
npm run dev:server   # Express + SQLite API
npm run dev          # Vite dev server
```

Frontend `/api` isteklerini Vite proxy aracılığıyla Express sunucusuna yönlendirir. Üretim derlemesi için:

```bash
npm run build
npm run preview
```

## Notlar

- Tailwind teması `tailwind.config.js` dosyasında tanımlı; Inter fontu ve Material Symbols ikonları `index.html` içinde yüklenir.
- Backend mantığı `server/` klasöründe bulunur (`database.js`, `dashboardService.js`, `index.js`). SQLite dosyası ilk çalıştırmada aynı klasörde oluşturulur ve örnek verilerle doldurulur.
- Frontend sayfaları (`src/pages`) API’den gerçek veriyi `useDashboardData` kancası ile çeker; yüklenme/hata durumları kullanıcıya bildirilir.
