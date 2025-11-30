# HabitTracker - Aktif Bağlam

## Mevcut Çalışma Durumu
Proje temel özellikleriyle tamamlandı ve çalışır durumda. Notlar sistemi yeniden yapılandırıldı.

## Son Yapılan Değişiklikler

### Notlar Sistemi Yeniden Yapılandırması (30 Kasım 2025)
- Notlar sayfası ikiye ayrıldı: `Notes.tsx` (liste) ve `NewNote.tsx` (ekleme)
- Editor.js artık sadece `NewNote.tsx` içinde (tek instance)
- Native `<select>` yerine custom dropdown bileşeni eklendi (site UI'ına uyumlu)
- "İçerik yok" hatası düzeltildi - `extractPlainText` fonksiyonu iyileştirildi:
  - HTML etiketlerini temizleme
  - Liste itemlarını doğru okuma
  - Quote/caption desteği eklendi
- Not silme özelliği eklendi
- Boş durum için güzel bir UI eklendi

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

### Ikon Sistemi
- Google Material Symbols yerine Lucide React ikon kütüphanesi kullanılıyor
- Daha modern ve tutarlı ikon seti

### Günlük Notlar
- Sadece bugün için not eklenebilir
- Home sayfasında görevlerin altında yer alır
- Takvimde not olan günler işaretlenir
- Otomatik kaydetme özelliği

### Navbar
- Tamamen yuvarlak tasarım
- Mobil menü toggle
- Aktif sayfa yeşil arka plan

## Aktif Kararlar

### Notlar Sistemi Mimarisi
- `Notes.tsx`: Not listesi (DnD sıralama, silme)
- `NewNote.tsx`: Not ekleme formu (Editor.js)
- LocalStorage tabanlı depolama
- Tema rengi seçimi (5 renk)
- Kategoriler dinamik olarak eklenebilir

### Tema Sistemi
- Tailwind `dark:` prefix kullanılıyor
- `document.documentElement.classList` ile toggle
- Accent renk CSS değişkeni ile

### Veritabanı
- SQLite dosya tabanlı
- Migration ile yeni sütun ekleme
- Yeni tablolar: `daily_notes`
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

### Editor.js Dikkat Noktaları
- Tek instance kullanılmalı (çift editor sorunu çözüldü)
- `editorInitialized` ref ile çoklu başlatma engelleniyor
- `extractPlainText` HTML temizliği yapıyor

## Sonraki Adımlar (Potansiyel)
1. Not düzenleme özelliği
2. Not arama/filtreleme
3. Haftalık/aylık görünüm
4. Veri export/import
5. PWA desteği
6. Çoklu dil desteği
