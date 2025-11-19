## Active Context

### Current Focus
- Tam etkileşimli akışların yanında, kullanıcıya temayı tamamen değiştirme imkânı sunmak (birden fazla renk paleti + light/dark mod).

### Recent Activity
- Express API genişletilerek alışkanlık ekleme ve günlük girişleri toggle etme desteklendi; UI’daki checkbox’lar API’ye bağlı çalışıyor.
- Control Panel’de ana form + sidebar formu ile yeni alışkanlık ekleme, kategori seçimi ve öneri chip’leri uygulandı.
- Geliştirme sırasında `npm run dev:all` komutuyla Vite ve Express aynı anda çalıştırılabiliyor (proxy hatası yok).
- Tema sistemi yeniden kuruldu: CSS değişkenleri üzerinden Tailwind renk token’ları tanımlandı; ThemeProvider + ThemeMenu ile 3 palet ve light/dark modu arasında geçiş yapılabiliyor.

### Next Steps
1. Alışkanlık silme/düzenleme, miktar girme ve geçmiş tarih işlemleri gibi gelişmiş CRUD özellikleri.
2. React Query vb. ile optimistik güncellemeler ve caching (şu an her işlemde refetch).
3. Görev filtreleri (Tümü/Aktif/Tamamlanan) ve heatmap tarih aralığı için gerçek filtreleme mantıkları.

### Considerations
- API hâlen tek kullanıcı/kimlik doğrulamasız; ileride auth + migration planlanmalı.
- Yeni bileşenler eklenirken `text-foreground`, `bg-card`, `border-border` gibi CSS-değişken tabanlı sınıflar kullanılmalı ki tema değişikliğinde bozulma olmasın.
- Form doğrulamaları ve geri bildirim (toast/modal) akışları eklenerek UX güçlendirilmeli.
