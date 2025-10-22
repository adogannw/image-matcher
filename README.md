# 🔍 Görüntü Eşleştirici

Gizlilik odaklı, istemci tarafı görüntü eşleştirme uygulaması. Tüm işlemler tarayıcınızda gerçekleşir, görselleriniz hiçbir sunucuya gönderilmez.

## ✨ Özellikler

### 🎯 Temel Özellikler
- **İstemci Tarafı İşleme**: Tüm görsel işleme tarayıcınızda gerçekleşir
- **Çoklu Ölçek Eşleştirme**: 4 farklı ölçekte arama yaparak en iyi sonucu bulur
- **Mobil Uyumlu**: Dokunmatik ekranlarda rahat kullanım
- **PWA Desteği**: Ana ekrana eklenebilir, çevrimdışı çalışır
- **Erişilebilirlik**: Klavye navigasyonu, screen reader desteği

### 🔒 Gizlilik ve Güvenlik
- **Veri Gizliliği**: Görselleriniz hiçbir sunucuya gönderilmez
- **Çevrimdışı Çalışma**: İnternet bağlantısı olmadan da kullanılabilir
- **Yerel İşleme**: Tüm hesaplamalar cihazınızda yapılır

### 🎨 Kullanıcı Deneyimi
- **Sezgisel Arayüz**: Basit ve anlaşılır kullanım
- **Gerçek Zamanlı Önizleme**: Seçim ve sonuçlar anında görünür
- **Ayarlanabilir Parametreler**: Eşik değeri, ölçek sayısı vb.
- **Sonuç İndirme**: Eşleştirme sonuçlarını PNG olarak indirebilirsiniz

## 🚀 Hızlı Başlangıç

### 1. Uygulamayı Açın
- Web tarayıcınızda `index.html` dosyasını açın
- Veya GitHub Pages üzerinden erişin

### 2. Görselleri Yükleyin
- **Referans Görsel**: Eşleştirilecek bölgeyi seçeceğiniz görsel
- **Hedef Görsel**: Referans bölgenin aranacağı görsel

### 3. Bölge Seçin
- Referans görselde fare veya dokunmatik ile dikdörtgen çizin
- Klavye modu ile ok tuşları kullanabilirsiniz

### 4. Eşleştirmeyi Başlatın
- "Eşleştirmeyi Başlat" butonuna tıklayın
- Sonuçları görüntüleyin ve indirin

## 📱 PWA Kurulumu

### Masaüstü
1. Tarayıcı adres çubuğundaki yükleme simgesine tıklayın
2. "Yükle" seçeneğini seçin

### Mobil
1. Tarayıcı menüsünden "Ana ekrana ekle" seçin
2. Uygulama ana ekranınıza eklenecektir

## ⚙️ Ayarlar

### Görsel İşleme
- **Hedef Boyut**: Görsellerin işleneceği maksimum boyut (800-2000px)
- **Ölçek Sayısı**: Denenecek ölçek sayısı (2-8)
- **Eşik Değeri**: Minimum benzerlik yüzdesi (30-95%)

### Gelişmiş
- **Döndürme Desteği**: Küçük açısal farkları dikkate alır (deneysel)
- **API Modu**: İsteğe bağlı sunucu API kullanımı

## 🧪 Test Senaryoları

### Temel Testler
1. **Aynı Görsel**: Aynı görselin farklı boyutları
2. **Benzer İçerik**: Benzer objeler içeren görseller
3. **Farklı Açılar**: Farklı perspektiflerden çekilmiş görseller

### Zorlu Senaryolar
1. **Düşük Kontrast**: Az ışıklı ortamlar
2. **Gürültülü Görseller**: Kalitesiz veya bulanık görseller
3. **Kısmi Örtüşme**: Sadece bir kısmı görünen objeler

### Performans Testleri
1. **Büyük Görseller**: Yüksek çözünürlüklü fotoğraflar
2. **Çoklu Ölçek**: Farklı ölçek kombinasyonları
3. **Hız Testi**: İşlem süresi ölçümü

## 🔧 Geliştirici Notları

### Mimari
- **Modüler Yapı**: Her özellik ayrı modülde
- **Soyutlama Katmanları**: Gelecekteki genişletmeler için
- **Performans Optimizasyonu**: Web Worker desteği

### Teknolojiler
- **Vanilla JavaScript**: Framework bağımlılığı yok
- **Canvas API**: Görsel işleme
- **Service Worker**: Çevrimdışı çalışma
- **Web App Manifest**: PWA özellikleri

### Genişletme Noktaları
- **Farklı Eşleştirme Algoritmaları**: SIFT, ORB vb.
- **Makine Öğrenmesi**: TensorFlow.js entegrasyonu
- **3D Eşleştirme**: Derinlik bilgisi kullanımı

## 📊 Performans

### Hedefler
- **İlk Eşleştirme**: < 1 saniye (mobil cihazlarda)
- **Bellek Kullanımı**: < 100MB
- **Dosya Boyutu**: < 500KB (sıkıştırılmış)

### Optimizasyonlar
- **Görsel Küçültme**: Otomatik boyut optimizasyonu
- **Gri Ton Dönüşümü**: Hızlı işleme
- **Çoklu Ölçek**: Paralel işleme

## 🐛 Bilinen Sınırlamalar

### Algoritma Sınırları
- **Döndürme**: Büyük açısal farklar (>15°) zor
- **Perspektif**: 3D dönüşümler desteklenmiyor
- **Renk Değişimi**: Aşırı renk farklılıkları zor

### Teknik Sınırlar
- **Bellek**: Çok büyük görseller sorun yaratabilir
- **Tarayıcı**: Eski tarayıcılarda sınırlı destek
- **Mobil**: Düşük performanslı cihazlarda yavaş

## 🤝 Katkıda Bulunma

### Geliştirme
1. Projeyi fork edin
2. Feature branch oluşturun
3. Değişikliklerinizi commit edin
4. Pull request gönderin

### Test
1. Test senaryolarını çalıştırın
2. Farklı cihazlarda test edin
3. Hata raporları gönderin

### Dokümantasyon
1. README güncellemeleri
2. Kod yorumları
3. Kullanım örnekleri

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## 🔗 Bağlantılar

- **GitHub**: [Proje Sayfası](https://github.com/username/image-matcher)
- **Demo**: [Canlı Demo](https://username.github.io/image-matcher)
- **Issues**: [Hata Bildirimi](https://github.com/username/image-matcher/issues)

## 📞 Destek

### Sık Sorulan Sorular
- **Görsel yüklenmiyor**: Desteklenen formatları kontrol edin (JPG, PNG, WebP)
- **Eşleştirme başarısız**: Eşik değerini düşürün veya ölçek sayısını artırın
- **Yavaş çalışıyor**: Görsel boyutunu küçültün

### İletişim
- **GitHub Issues**: Teknik sorunlar için
- **Email**: Genel sorular için
- **Discussions**: Topluluk desteği için

---

**Not**: Bu uygulama tamamen istemci tarafında çalışır. Görselleriniz hiçbir sunucuya gönderilmez ve gizliliğiniz korunur.
