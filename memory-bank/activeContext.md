## Active Context

### Current Focus
- Tam etkileşimli akışlar: alışkanlık oluşturma, görev tamamlama/toggle işlemleri ve gerçek verinin heatmap/todo listesine yansıması.

### Recent Activity
- Express API genişletildi (`/api/habits`, `/api/habit-entries/toggle`); yeni kayıt ekleme, günlük girişleri oluşturma/silme destekleniyor.
- Home ve Control Panel sayfalarındaki checkbox'lar API'ye bağlandı; hata/pending durumları gösteriliyor.
- Control Panel’de ana form + sidebar formu üzerinden yeni alışkanlık ekleme, kategori seçimi ve öneri chip’leri uygulanıyor.
- Tüm işlemler sonrası data `useDashboardData` üzerinden refetch edilerek heatmap/stats eş zamanlı güncelleniyor.
- Geliştirme ortamında API ve Vite’in birlikte çalışması için `npm run dev:all` komutu eklendi; proxy hatalarını önlemek adına her iki servis aynı anda ayağa kalkıyor.

### Next Steps
1. Alışkanlık silme/düzenleme, birden fazla tamamlanma (amount) ve geçmiş tarih seçimi gibi gelişmiş CRUD özellikleri.
2. React Query veya benzeri cache yönetimi ile optimistik güncellemeler (şu an her işlemde refetch).
3. Görev filtreleri (Tümü/Aktif/Tamamlanan) ve heatmap tarih aralığı için gerçek filtreleme mantığı eklemek.

### Considerations
- API şu an temel CRUD’larla sınırlı; kimlik doğrulama veya kullanıcı çoklama henüz yok.
- SQLite dosyası `server/habit-tracker.db` tek kullanıcıya göre seed’leniyor; migration stratejisi ileride gerekiyor.
- Form doğrulamalarını güçlendirmek (ör. renk seçimi, hedefer) ve UI/UX açısından modal veya toast bildirimleri eklemek planlanmalı.
