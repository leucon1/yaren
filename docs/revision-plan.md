# Teslim öncesi teknik düzenleme

Görsel kimlik korunacak: onaylı logo, renk paleti, hero fotoğrafı ve üç satırlı başlık, serif/sans hiyerarşisi, geniş boşluklar ve sakin hareketler. Gemini videosu eklenmeyecek.

1. Kaynakları Prettier ile biçimlendir; form, gezinme, hero medyasını kendi bileşenlerine taşı. Basit sunum bölümleri App.jsx içinde kalabilir. ESLint ve format kontrolü kur.
2. Playwright ile mevcut form hatasının düzenleme sırasında kaybolmasını, 768px hero satırlarını, düşük metin boylarını ve ilk karede hero görünürlüğünü testle tekrar et.
3. Formu gönderim sonrasında alan bazlı yeniden doğrula; blur ile de güncelle, ilk hatalı alana odağı koru. Placeholder/alan çizgileri için kontrastı yükselt.
4. Metin alt sınırı: ikincil etiketler 12px, ana açıklamalar 15–16px, form girişi 16px. Masaüstü hiyerarşisini koru.
5. Tek kolon hero/menü eşiği 899px; 900–1100 arası başlığı konteynere uygun ölçekle. Tablet ürünleri rahat iki kolon, dar mobilde tek kolon, geniş ekranda üç kolon; üçüncü kart tablet satırında dengeli konumlanır. Mobil ve tablet görsel oranlarını açıkça belirle.
6. Orijinal PNG değişmez; alfa korunarak kayıpsız web logo türevleri üret. Hikâyede yeni paylaşım fotoğrafı kullan, hero görseli aynı kalır.
7. Menü klavyesi, hata durumu, demo gönderimi, responsive geometri, boyut/kontrast, animasyon ve medya için tarayıcı testleri; mevcut üç doğrulama testi korunur.
8. Lint, format, tüm testler ve üretim derlemesi; masaüstü/tablet/mobil görsel inceleme; animasyon tamamlandıktan sonra teslim ekran görüntüleri. Aynı Sites projesini ve erişim kitlesini koruyarak yayımla; kaynak ZIP ve notları yenile.

Ürünler paket gramajı ve paket fiyatı olarak açıkça etiketlenecek. Fiyatlar kurmaca örneklerdir; önceden belirlenen 100g/285₺ ve 250g/420₺,395₺ değerleri korunur. Açıklamalar hazırlanmış servis ile paketi karıştırmayacak biçimde düzenlenir.
