# HabitTracker - Aktif Bağlam

## Mevcut Çalışma Durumu
Proje temel özellikleriyle tamamlandı ve çalışır durumda. Site genelinde dinamik renk sistemi uygulandı. Kullanıcı geri bildirimlerine dayalı UI/UX iyileştirmeleri ve hata düzeltmeleri yapıldı.

## Son Yapılan Değişiklikler

### Pomodoro Sayfası Yenilemesi (Modern UI)
- **Tasarım**: Eski dijital saat görünümü yerine modern, dairesel (circular) SVG tabanlı bir zamanlayıcıya geçildi.
- **Görsellik**:
  - `var(--color-primary)` ile tema uyumlu renkler ve "glow" efektleri eklendi.
  - İlerleme durumu dairesel barın dolmasıyla görselleştirildi.
- **İşlevsellik**:
  - Süreye tıklayarak düzenleme (inline edit) özelliği korundu ve iyileştirildi.
  - Hızlı süre seçim butonları (Preset) eski stiline (büyük butonlar, "dk" etiketi) döndürüldü.
- **Detaylar**:
  - "Toplam Odak" ve "Tamamlanan" istatistik kartları eklendi.
  - Görev listesi daha detaylı hale getirildi; her görev için ilerleme çubuğu ve kalan süre bilgisi eklendi.
  - UI Düzenlemesi: Saat ve durum metni arasındaki çakışma giderildi.

### Seçili Gün Detay Görünümü (Timeline)
- **Home Sayfası**: Contribution Calendar'da bir güne tıklandığında açılan detay bölümü tamamen yenilendi.
- **Dikey Timeline**: Seçilen günün görevleri dikey bir zaman çizelgesi (stepper) şeklinde listeleniyor.
- **Durum Göstergeleri**:
  - Tamamlanan görevler yeşil tik ve tamamlanma saati ile gösteriliyor.
  - Geçmiş günlerde tamamlanmayan görevler gri, gelecek/bugün bekleyenler mavi renkle işaretleniyor.
  - Planlanan saat bilgisi gösteriliyor.
- **Görsel Tasarım**: "Kargo takip" tarzı dikey çizgi ve noktalarla modern bir görünüm sağlandı.

### Hata Düzeltmeleri
- **Yeni Alışkanlık Görünürlüğü**: Yeni eklenen alışkanlıkların "Bugünün Görevleri" listesinde görünmemesi sorunu düzeltildi.
  - `shouldShowHabit` fonksiyonuna `start_date` kontrolü eklendi.
  - `today` değişkeni artık yerel saat dilimine göre hesaplanıyor (UTC yerine), böylece tarih kayması önlendi.
  - `start_date` boşsa `created_at` kullanılarak eski alışkanlıkların geçmiş tarihlerde görünmesi engellendi.

### UI/UX İyileştirmeleri (Önceki)
- **Habits Sayfası**: Animasyonlar azaltıldı, tarih başlığı eklendi.
- **Home Sayfası**: Tarih başlığı eklendi.
- **Pomodoro Sayfası**: Dijital saat tasarımı, özel süre girişi.

### Notlar Sistemi Görsel ve UX İyileştirmeleri
- **Birleşik Tema Sistemi**: `src/utils/noteThemes.ts` oluşturuldu.
- **Görsel İyileştirmeler**: Opak arka planlar, tema uyumlu metin renkleri.
- **Kategori Yönetimi**: Düzenle/Sil seçenekleri, lazy initialization.

### Pomodoro Veri Bütünlüğü (Data Integrity)
- **Sorun**: Sayfa yenilendiğinde süre kaybı.
- **Çözüm**: `PomodoroContext` ile localStorage tabanlı "kaydedilmemiş çalışma" takibi.

### Pomodoro Arka Plan Zamanlayıcısı
- **Global State**: `PomodoroContext`.
- **Persistent Footer**: Site genelinde çalışan mini player.

### Home Sayfası İyileştirmeleri (3 Aralık 2025)
- **Layout Revizyonu**: İstatistikler üstte, Takvim/Not solda, Görevler sağda.
- **Süre Senkronizasyonu**: `habit_daily_progress` entegrasyonu.
- **Seri Mantığı**: 3 gün tolerans.

## Aktif Kararlar

### Timeline Görünümü
- Seçili gün detaylarında sadece liste yerine zaman akışını gösteren bir yapı tercih edildi.
- Tamamlanma saati (`created_at`) varsa o, yoksa planlanan saat (`scheduled_time`) baz alınıyor.

### Pomodoro Veri Bütünlüğü
- Sayfa yenilendiğinde veri kaybını önlemek için "unsaved work" (kaydedilmemiş çalışma) hesaplaması yapılıyor.

### Dinamik Renk Sistemi
- CSS değişkenleri ile runtime renk değişimi.

## Dikkat Edilecek Noktalar

### Tarih ve Saat İşlemleri
- `start_date` veritabanında `YYYY-MM-DD` formatında tutuluyor. Karşılaştırmalar string bazlı yapılıyor.
- Zaman dilimi ayarları (`settings.timezone`) formatlama fonksiyonlarında kullanılıyor.

### Tailwind v3 Uyumluluğu
- `@tailwind` direktifleri kullanılıyor.

## Sonraki Adımlar (Potansiyel)
1. Not düzenleme özelliği
2. Not arama/filtreleme
3. Haftalık/aylık görünüm
4. Veri export/import
5. PWA desteği
