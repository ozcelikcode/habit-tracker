## Active Context

### Current Focus
- Tam etkileşimli görev akışlarını stabilize etmek ve UI bileşenlerini (checkbox, dropdown vb.) tasarımla uyumlu hale getirmek; aynı zamanda tema/palet sistemi korunuyor.

### Recent Activity
- Express API üzerinden alışkanlık ekleme ve günlük giriş toggle akışı tamamlandı; UI checkbox’ları API’ya bağlı çalışıyor.
- Control Panel’de hem ana form hem de sidebar formu ile yeni alışkanlık ekleme, kategori seçimi ve öneri chip’leri tasarlandı.
- `npm run dev:all` komutu ile Vite + Express eş zamanlı çalışıyor.
- Tema sistemi (ThemeProvider + ThemeMenu) ile 3 palet + light/dark modu arasında geçiş yapılabiliyor.
- Mobil navigasyon/çekmece yapıları eklendi; checkbox ve dropdown’lar tekrar tasarım yönergelerine sadık hale getirildi.
- Silme akisi art��k backend `DELETE /api/habits/:id` ile arsivliyor; dashboard/heatmap istatistikleri arsivli aliskanliklari saymiyor ve `/deleted` sayfasinda localStorage arsivi ile birlikte restore butonu API uzerinden geri aliyor.

### Next Steps
1. Gorev duzenleme/metadata guncellemeleri ve gecmis tarih girisleri gibi gelismis CRUD senaryolari.
2. React Query veya benzeri cache yonetimiyle optimistik guncellemeler (su an her islemde refetch ediliyor).
3. Gorev filtreleri ve heatmap tarih araliklari icin gercek veri filtreleme mantiklari + oturum bazli state senkronizasyonu.


### Considerations
- Silinen gorevler hem localStorage arsivinde hem backend is_archived bayraginda tutuluyor; dashboard/heatmap arsivli aliskanliklari zaten gizliyor, localStorage yalnizca geri alma listesini besliyor.
- API hâlen tek kullanıcı ve kimlik doğrulamasız; ileride auth + migration ele alınmalı.
- Tema sistemi CSS değişkenleri üzerinden çalışıyor; yeni bileşenlerde `text-foreground`, `bg-card`, `border-border` gibi token sınıfları kullanılmalı.
- Form/doğrulama ve toast/modal bildirimleri ekleyerek UX güçlendirilmeli.

