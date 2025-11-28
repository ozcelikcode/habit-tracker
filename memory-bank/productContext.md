# HabitTracker - Ürün Bağlamı

## Neden Bu Proje?
Kullanıcıların günlük alışkanlıklarını görsel olarak takip edebilmeleri ve motivasyonlarını artırmaları için tasarlandı. GitHub'ın contribution graph'ından ilham alınarak, kullanıcılar yıl boyunca ilerlemelerini tek bakışta görebilir.

## Çözdüğü Problemler
1. **Alışkanlık Takibi**: Hangi günlerde ne yaptığını unutma
2. **Motivasyon**: Görsel ilerleme ile motivasyon artışı
3. **Planlama**: Saat ve süre ile günlük planlama
4. **Analiz**: İstatistiklerle performans değerlendirme

## Kullanıcı Deneyimi Hedefleri

### Ana Sayfa (Home)
- Hoş geldin mesajı
- Bugünün görevleri listesi (checkbox ile)
- Contribution takvimi
- İstatistik kartları

### Alışkanlıklar Sayfası
- Tüm alışkanlıkların kart görünümü
- Düzenleme ve silme butonları
- Saat, süre, tekrar bilgileri

### Yeni/Düzenleme Formu
- Başlık ve alt başlık
- Renk seçimi (10 renk)
- Tekrar sıklığı (günlük, hafta içi, özel)
- Planlanan saat (TimePicker)
- Süre (DurationPicker)

### Ayarlar
- Kullanıcı adı
- Tema modu (koyu/açık)
- Vurgu rengi seçimi (8 renk)

## Görsel Tasarım İlkeleri

### Renk Paleti
- **Ana Renk**: Zümrüt yeşili (#2EAC8A)
- **Koyu Arka Plan**: #10221d
- **Açık Arka Plan**: #f6f8f8
- **Vurgu Renkleri**: Turkuaz, Turuncu, Gül

### Tipografi
- Font: Inter (Google Fonts)
- Başlıklar: Bold, tracking-tight
- Gövde: Normal weight

### Bileşen Stilleri
- Yuvarlak kenarlar (rounded-lg, rounded-xl, rounded-full)
- Yumuşak gölgeler
- Hover efektleri
- Geçiş animasyonları

## Kullanıcı Akışları

### Alışkanlık Oluşturma
1. "Yeni Alışkanlık Ekle" butonuna tıkla
2. Formu doldur (başlık zorunlu)
3. Renk ve sıklık seç
4. İsteğe bağlı saat/süre ekle
5. "Oluştur" ile kaydet

### Günlük Kullanım
1. Ana sayfada bugünün görevlerini gör
2. Tamamladıklarını işaretle
3. Takvimde ilerlemeyi izle
4. İstatistikleri kontrol et

### Tema Değiştirme
1. Ayarlar'a git
2. Koyu/Açık tema seç
3. Vurgu rengi seç
4. "Değişiklikleri Kaydet"

## Mobil Deneyim
- Responsive navbar (hamburger menü)
- Yatay kaydırmalı takvim
- Dokunmatik uyumlu picker'lar
- Kompakt kart tasarımları
