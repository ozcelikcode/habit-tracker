# HabitTracker - Aktif Bağlam

## Mevcut Çalışma Durumu
Proje temel özellikleriyle tamamlandı ve çalışır durumda. Site genelinde dinamik renk sistemi uygulandı.

## Son Yapılan Değişiklikler

### Pomodoro Sayfası (1 Aralık 2025)
- Yeni sayfa: `/pomodoro`
- İkili flex yapı: Sol (Timer), Sağ (Zamanlı Görevler)
- **Timer Özellikleri**:
  - 5-60 dk arası 5'er dakikalık hazır süreler
  - Başlat/Duraklat/Sıfırla kontrolleri
  - Dairesel ilerleme göstergesi (SVG)
  - Site accent rengi ile uyumlu
- **Görev Entegrasyonu**:
  - Sadece bugünün ve *saati olan* görevleri listelenir
  - Görev seçimi ve görsel vurgulama (border)
  - **Günlük İlerleme Takibi (V3)**:
    - Süre düşümü artık alışkanlığın kalıcı süresinden değil, o güne özel `habit_daily_progress` tablosundan yapılır.
    - Timer duraklatıldığında, durdurulduğunda veya görev değiştirildiğinde süre *anında* düşülür.
    - Optimistik UI güncellemeleri ile anlık geri bildirim.
    - **Detaylı Görev Kartları**: Görev listesinde "X dk yapıldı", "Y dk kaldı" bilgileri ve görsel progress bar eklendi.
  - Görev tamamlama/geri alma özelliği
  - Tamamlanan görevler listede kalır (üzeri çizili)

### Dinamik Tema Renk Sistemi (1 Aralık 2025)
- Site genelinde accent renk değişimi tam entegrasyon:
  - Arka plan rengi seçilen renge göre otomatik koyu ton oluşturuyor (HSL dönüşümü)
  - Border renkleri dinamik CSS değişkeni ile
  - Contribution Calendar tamamen dinamik renklerle
  - Tüm butonlar ve vurgular `var(--color-primary)` kullanıyor
- `Layout.tsx`'e `generateThemeColors()` fonksiyonu eklendi
- `index.css`'e calendar-level-1/2/3/4 CSS sınıfları eklendi
- CSS değişkenleri: `--color-primary`, `--color-bg-dark`, `--color-border-dark`

### Custom Delete Modal (1 Aralık 2025)
- `ConfirmModal.tsx` bileşeni oluşturuldu
- Browser `window.confirm()` yerine Tailwind-styled modal
- ESC tuşu ile kapatma, backdrop blur efekti
- `danger`, `warning`, `info` varyantları

### Notlar Sistemi İyileştirmeleri (1 Aralık 2025)
- **Varsayılan tema rengi**: Site accent rengine bağlı "default" seçeneği
- **Validasyon**: Boş başlık ve içerik için Tailwind hata mesajları
- **Kategori dropdown**: Renk uyumsuzluğu düzeltildi, `dark:bg-zinc-900` kullanılıyor
- **ViewNote.tsx**: Dinamik tema desteği, `color-mix()` ile şeffaf renkler
- **Notes.tsx**: `SortableNoteCard` dinamik tema stilleri

### Notlar Sistemi Yeniden Yapılandırması (30 Kasım 2025)
- Notlar sayfası ikiye ayrıldı: `Notes.tsx` (liste) ve `NewNote.tsx` (ekleme)
- Editor.js artık sadece `NewNote.tsx` içinde (tek instance)
- Native `<select>` yerine custom dropdown bileşeni eklendi
- "İçerik yok" hatası düzeltildi - `extractPlainText` fonksiyonu iyileştirildi
- Not silme özelliği ve ViewNote detay sayfası eklendi

## Aktif Kararlar

### Dinamik Renk Sistemi
- CSS değişkenleri ile runtime renk değişimi
- `generateThemeColors()` hex→HSL dönüşümü yapıyor
- Her accent renk için uyumlu koyu arka plan ve border
- `color-mix()` CSS fonksiyonu ile opaklık

### Notlar Sistemi
- `Notes.tsx`: Not listesi (DnD sıralama, silme, modal onay)
- `NewNote.tsx`: Not ekleme (Editor.js, validasyon)
- `ViewNote.tsx`: Not detay görünümü
- `NoteTheme`: 'default' | 'emerald' | 'blue' | 'amber' | 'rose' | 'slate'
- Default tema site accent rengini kullanır

### Tema Sistemi
- Tailwind `dark:` prefix kullanılıyor
- `document.documentElement.style.setProperty()` ile CSS değişkeni
- Accent renk değişiminde `accentColorChange` event dispatch

## Dikkat Edilecek Noktalar

### CSS Değişkenleri
- `--color-primary`: Ana vurgu rengi
- `--color-bg-dark`: Koyu tema arka plan
- `--color-border-dark`: Koyu tema border
- `index.css`'te override sınıfları tanımlı

### Tailwind v3 Uyumluluğu
- `@tailwind` direktifleri kullanılıyor
- `@theme` direktifi KULLANILMAMALI (v4 özelliği)
- `color-mix()` CSS fonksiyonu Tailwind dışında

### Editor.js Dikkat Noktaları
- Tek instance kullanılmalı
- `editorInitialized` ref ile çoklu başlatma engelleniyor

## Sonraki Adımlar (Potansiyel)
1. Not düzenleme özelliği
2. Not arama/filtreleme
3. Haftalık/aylık görünüm
4. Veri export/import
5. PWA desteği
