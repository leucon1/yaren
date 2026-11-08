# Yâren — kişisel kahve önericisi teslimi

8 Kasım 2026. Yalnız ikinci özellik geliştirildi; yayın yapılmadı.

## Tamamlanan özellik

Sağ alttaki küçük kahve simgesi ve “Bugün nasıl hissediyorsun?” daveti yalnız hero sonrasında görünür. Panel kendiliğinden açılmaz. Hero isteğe bağlı olduğundan, doğrudan menüyle Kahvelerimiz'e geçen kullanıcı da önericiye erişebilir. Hero'ya geri dönüldüğünde gizlenir.

| Ruh hâli                  | Kahve        | Açıklama                                |
| ------------------------- | ------------ | --------------------------------------- |
| Biraz yorgunum.           | Espresso     | Kısa bir mola, güçlü bir başlangıç.     |
| Sakin ve huzurluyum.      | Filtre Kahve | Anın tadını yavaşça çıkar.              |
| Biraz nostalji istiyorum. | Türk Kahvesi | Tanıdık bir tat, unutulmayan hikâyeler. |
| Sohbet etmek istiyorum.   | Türk Kahvesi | Güzel sohbetler bir fincanla başlar.    |

Eşleştirmeler tek okunabilir veri dosyasındadır. Sonuçta kahve adı, açıklama, “Kahveyi Gör” ve “Başka Bir Ruh Hâli Seç” bulunur. Ürüne geçiş mevcut doğrudan navigasyon yardımcısıyla yapılır; panel kapanır, mevcut kart odağı alır, 2,2 saniyelik zarif vurgu gösterilir. Yeni seçim önceki vurguyu temizler. Ürünlerin görselleri/metinleri/fiyatları değişmedi.

## Erişilebilirlik ve mobil

Panel non-modal bir dialogdur; kullanıcı sayfadan koparılmaz ve body scroll kilitlenmez. İlk seçeneğe, sonuçta eyleme odak geçer. Sonuç canlı bölgede duyurulur. Escape, kapatma ve dışarı tıklama desteklenir. Normal kapatmada odak davete; ürün geçişinde karta gider. Escape açık önericiyi kapatırken mevcut hero'yu kapatmaz.

Mobilde dinamik ekran yüksekliğinin yaklaşık yarısıyla sınırlı, iç kaydırması olan panel ve güvenli alt boşluk kullanılır. Sonuçta değiştir seçeneğinin görünürlüğü ayrıca test edildi. İletişim alanı düzenlenirken önerici kapanır/gizlenir; form odağı korunur. Reduced-motion tercihinde geçişler kaldırılır; ürün vurgusu hareketsiz görünür ve sonra biter.

## Korunan kapsam

Temel commit: 98fc0f853e41e12dc10db6b772c969aaf2b32fdb.
Çalışma dalı: feature/mood-recommender.
Yedek dal: backup/gemini-bridge-20261108. Önceki kaynak ZIP korundu.

src/story/*, dört aşama metinleri, medya konfigürasyonu, navigation.mjs, Header, Contact, logo, görseller, ana tasarım CSS'i ve index.html değişmedi. App.jsx değişiklikleri önericiyi bağlamak ve mevcut kartlara hedef kimliği/odak etiketi eklemekle sınırlı. Yeni Gemini videosu, kamera hareketi, ok veya Blender çalışması yok. Yeni bağımlılık, API, backend, veritabanı, saklama veya ücretli servis yok.

## Gerçek test sonuçları

| Kontrol                                               | Sonuç            |
| ----------------------------------------------------- | ---------------- |
| Mevcut birim/varlık testleri                          | 16/16 geçti      |
| Tam tarayıcı koşusu                                   | 60/60 geçti      |
| Son küçük yerleşim düzeltmesi sonrası hedefli kontrol | 2/2 geçti        |
| Lint                                                  | Geçti, uyarı yok |
| Biçim kontrolü                                        | Geçti            |
| Üretim derlemesi                                      | Geçti            |
| Salt okunur bağımsız kod incelemesi                   | Önemli bulgu yok |
| Korunan üç bölüm / üç ekran boyutu                    | 9/9 aynı görüntü |

Yeni 16 tarayıcı kontrolü (15 davranış + 1 teslim görseli) mevcut 44 kontrolün üzerine eklendi. Dört eşleştirme, doğru kart odağı ve hash'i, vurgu süresi, eski vurgunun temizlenmesi, tekrar seçim, klavye/Escape/dış tıklama, sonuç duyurusu, hero sırasında gizlilik ve geriye dönüş, form odağı, reduced-motion ve harici servis isteği olmaması sınandı.

Önerici 1440×1000, 768×1024, 390×844, 320×568 ve 844×390 görünüm boyutlarında kontrol edildi. Teslim görüntüleri masaüstü/tablet/mobil için davet, seçenekler, sonuç ve kart vurgusunu içerir.

Görsel karşılaştırmada ürün, hikâye ve iletişim bölümleri eski üretim önizlemesi ile yeni geliştirme sürümünden aynı başlangıç konumunda izole edilerek alındı. Dokuz çiftin boyutu ve piksel verisi aynı çıktı. Bu karşılaştırma yeni, isteğe bağlı yüzer paneli içermez; panel ayrıca görsel olarak incelendi.

İlk fotoğraf/hero ve form/scroll/navigasyon testleri de tam koşuda geçti. Derlenmiş üretim önizlemesinde menüden Kahvelerimiz'e geçiş, paneli açma, nostalji → Türk Kahvesi sonucu ve ilgili karta odaklanma ayrıca arayüzden doğrulandı. Üretim JS gzip 77,72 KB; CSS gzip 5,29 KB. Yeni runtime bağımlılığı yok.

Ek tarihî görüntü kontrolü: önceki teslimde saklanan hero PNG'siyle ham piksel eşitliği denemesi tam eşleşmedi; aynı 1440×1000 boyutta küçük düşey render farkı gözlendi (12 renk seviyesi üzerindeki değişen piksel oranı %2,67; ortalama renk farkı 1,20/255). Bu nedenle hero için birebir piksel eşitliği iddiası yoktur. Hero kaynaklarının değişmediği Git ile doğrulandı; görünür tasarım ve yerleşim ayrıca incelendi. Yukarıdaki 9/9 sonucu yalnız izole ürün/hikâye/iletişim karşılaştırmalarına aittir.

## Doğrulama sınırı

Kontroller Chromium ve ekran/dokunmatik emülasyonuyla yapıldı. Fiziksel telefon, gerçek sanal klavye, Safari, VoiceOver ve TalkBack testleri yapılmadı. Bu sonuçlar o cihaz testlerinin yerine geçmez.

## Kaynak düzeni

- src/recommender/recommendations.mjs: dört eşleştirme.
- src/recommender/CoffeeRecommender.jsx: panel, seçim, erişilebilirlik ve geçici vurgu.
- src/recommender/useRecommenderVisibility.js: hero/form görünürlüğü; mevcut scroll motorunu değiştirmez.
- src/recommender/recommender.css: mevcut marka sistemini kullanan küçük stiller.
- tests/browser/recommender.spec.mjs: davranış testleri.
- tests/browser/recommender-delivery.spec.mjs: ekran görüntüleri.

npm run test:screenshots yeni önerici görsellerini de üretir. Çalıştırma ve mevcut Gemini entegrasyon notları README.md içinde korunur.
