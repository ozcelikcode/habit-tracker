# HabitTracker - Aktif Bağlam

## Mevcut Çalışma Durumu
Proje temel özellikleriyle tamamlandı ve çalışır durumda.

## Son Yapılan Değişiklikler

### TimePicker Bileşeni
- 24 saat formatına geçildi
- İç halka (12-23) ve dış halka (0-11) ile çift kadran
- Saat seçince otomatik dakika seçimine geçiş

### DurationPicker Bileşeni
- Hızlı seçim butonları (15dk, 30dk, 45dk, 1sa, 1.5sa, 2sa)
- Slider ile ince ayar
- Saat + dakika gösterimi

### Habits Sayfası
- Kart tasarımında saat/süre etiketleri eklendi
- Tekrar sıklığı badge'i eklendi

### Settings Sayfası
- Vurgu rengi seçimi eklendi (8 renk)
- Renk CSS değişkeni olarak kaydediliyor

### Navbar
- Tamamen yuvarlak tasarım
- Mobil menü toggle
- Aktif sayfa yeşil arka plan

## Aktif Kararlar

### Tema Sistemi
- Tailwind `dark:` prefix kullanılıyor
- `document.documentElement.classList` ile toggle
- Accent renk CSS değişkeni ile

### Veritabanı
- SQLite dosya tabanlı
- Migration ile yeni sütun ekleme
- Soft delete (archived flag)

## Dikkat Edilecek Noktalar

### Tailwind v3 Uyumluluğu
- `@tailwind` direktifleri kullanılıyor
- `@theme` direktifi KULLANILMAMALI (v4 özelliği)
- PostCSS ile işleniyor

### Responsive Tasarım
- `md:` breakpoint navbar için kritik
- Takvim `overflow-x-auto` ile mobil scroll
- Grid'ler responsive (`grid-cols-1 sm:grid-cols-2`)

## Sonraki Adımlar (Potansiyel)
1. Bildirim sistemi
2. Haftalık/aylık görünüm
3. Veri export/import
4. PWA desteği
5. Çoklu dil desteği
