## Active Context

### Current Focus
- Tam etkileşimli görev akışlarını stabilize etmek ve UI bileşenlerini (checkbox, dropdown vb.) tasarımla uyumlu hale getirmek; aynı zamanda tema/palet sistemi korunuyor.

### Recent Activity
- Express API üzerinden alışkanlık ekleme ve günlük giriş toggle akışı tamamlandı; UI checkbox’ları API’ya bağlı çalışıyor.
- Control Panel’de hem ana form hem de sidebar formu ile yeni alışkanlık ekleme, kategori seçimi ve öneri chip’leri tasarlandı.
- `npm run dev:all` komutu ile Vite + Express eş zamanlı çalışıyor.
- Tema sistemi (ThemeProvider + ThemeMenu) ile 3 palet + light/dark modu arasında geçiş yapılabiliyor.
- Mobil navigasyon/çekmece yapıları eklendi; checkbox ve dropdown’lar tekrar tasarım yönergelerine sadık hale getirildi.

### Next Steps
1. Alışkanlık/görev silme-düzenleme ve geçmiş tarih girişleri gibi gelişmiş CRUD senaryoları.
2. React Query veya benzeri cache yönetimiyle optimistik güncellemeler (şu an her işlemde refetch ediliyor).
3. Görev filtreleri ve heatmap tarih aralıkları için gerçek veri filtreleme mantıkları + oturum bazlı state senkronizasyonu.

### Considerations
- API hâlen tek kullanıcı ve kimlik doğrulamasız; ileride auth + migration ele alınmalı.
- Tema sistemi CSS değişkenleri üzerinden çalışıyor; yeni bileşenlerde `text-foreground`, `bg-card`, `border-border` gibi token sınıfları kullanılmalı.
- Form/doğrulama ve toast/modal bildirimleri ekleyerek UX güçlendirilmeli.
