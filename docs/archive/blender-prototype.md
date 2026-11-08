# Yâren — yerel sinematik deney prototipi

React 19 + Vite 7, özel responsive CSS ve yerel fontlar. Bu sürüm yayımlanmadı. Üretimdeki proje ve onaylı logo değiştirilmedi. Bağımsız çalışma kopyasının uzak Git deposu ve üretim hosting bağlantısı kaldırıldı.

## İki ayrı aşama

- `fix/cup-service-base` (`d703e11`): mevcut fotoğraflı tasarım üzerinde yalnız fincan/shot içerikleri ve hikâye kontrastı düzeltildi. 4 birim/varlık ve 20 tarayıcı testi geçti.
- `experiment/scroll-story`: güvenli temel üzerine isteğe bağlı kamera yolculuğu eklendi. Kaynak paketi bu dalın içeriğidir. Yayın veya üretim dalına birleştirme yapılmadı.

Türk kahvesi 1 fincan / ₺120, espresso 1 shot / ₺100, filtre kahve 1 fincan / ₺140 olarak sunulur. Tüm fiyatlar hayali örnek servis fiyatlarıdır. Hikâye bölümünün en düşük metin kontrastı 4,69:1 oldu; zeytin arka plan ve marka paleti korundu.

## Çalıştırma ve doğrulama

Node.js 20.19+ veya 22.12+ gerekir.

```sh
npm ci
npm run dev -- --port 5174
```

```sh
npm test
npm run lint
npm run format:check
npx playwright install chromium
npm run test:e2e
npm run build
npm run preview
```

Playwright yerel 5174 sunucusunu başlatır; geliştirmede aynı portta çalışan sunucuyu kullanabilir. `PLAYWRIGHT_CHROMIUM_EXECUTABLE` ile var olan Chromium'un mutlak yolu verilebilir. `npm run test:screenshots` kapalı sayfayı altı genişlikte ve açılmış yolculuğun dört aşamasını masaüstü/tablet/mobil boyutlarında kaydeder. Fontların, görsellerin, açılış animasyonunun ve istenen karenin hazır olmasını bekler. Varsayılan çıktı `test-results/delivery/`; `DELIVERY_SCREENSHOTS_DIR` ile değiştirilebilir.

Son kontrol: 12 birim/varlık testi, 32 tarayıcı testi, lint, biçim kontrolü ve üretim derlemesi başarılı. Testler otomatik yerleşim ve etkileşim kontrolleridir; gerçek telefonlarda cihaz testinin yerini almaz.

## Deneyim

Hero metni yanında küçük kahve kompozisyonunun bütünü bir düğmedir. Altında yalnız `Keşfet ↓` ipucu bulunur. Kullanıcı bunu açmadan diğer bölümleri gezebilir.

Tıklama aynı kompozisyonu tek oranda büyütür. Normal belge kaydırması sticky alan içindeki tek 0–1 ilerlemeyi yönetir. Wheel/touch engellemesi, scroll kilidi, snap veya zamanla kendi kendine ilerleyen kamera yoktur. Kamera aynı yolu ileri/geri izler; dört metin yalnız bu yolun anlatı işaretleridir. Sonrasında normal akış Kahvelerimiz bölümüne devam eder. Kapat veya Escape başlangıç konumunu ve görselin klavye odağını geri getirir.

Azaltılmış hareket tercihinde büyüme ve pinned kamera dizisi yerine aynı dört başlık ve statik kareler normal belge akışında sunulur. Yükleme başarısızsa hata açıkça bildirilir; kullanıcı sahneden çıkabilir veya sayfayı gezmeye devam edebilir.

## Gerçek sahne, sınırlı görsel kalite

Tek sabit Blender sahnesi, aynı nesneler/malzemeler/ışık/gölgeler ve tek sanal kamera kullanıldı. İkinci fincan baştan beri sahnede, ilk kadrajın dışındadır. Görünürlük değiştirme, fotoğraf döndürme, nesne deformasyonu veya crossfade yoktur. Konum, bakış hedefi ve lens için ortak ara teğetli C1 Hermite yolu kullanılır; anlatı eşiklerinde kamera durmaz.

Her ekran türü için 180 gerçek render vardır: masaüstü 960 × 600, portre 540 × 960. Tablet/telefon yatay çevrildiğinde uygun sahneye geçilir; önceki istekler iptal edilir. `scene-source/` içinde düzenlenebilir Blender dosyası, üretim betikleri ve kamera/geometri doğrulama kayıtları bulunur.

Bu, fiziksel sürekliliği doğrulanmış bir etkileşim prototipidir. Mevcut marka fotoğrafı yüzey doğallığı ve sanat yönetimi bakımından daha güçlüdür. 960 px kareler büyük masaüstü ekranlarında yumuşar; 180 örnekli dizide çok hızlı veya yavaş kaydırmada örnekleme fark edilebilir. Yavaş ağda yeni hedef kare gelene kadar son hazır kare korunur. Kusursuz fotoğraf kalitesi veya her cihazda sabit 60 fps iddiası yoktur. Nihai marka yayını için görsel kalite ve gerçek cihaz akıcılığı ayrıca onaylanmalıdır.

## Performans

Kullanıcı açmadan yalnız responsive poster yüklenir; kare motoru ve manifest etkileşimden sonra gelir. Bütün dizi peşinen indirilmez. En fazla 9 çözülmüş kare saklanır; uzaklaşan bekleyen istekler iptal edilir ve aynı anda en fazla 5 istek tutulur. Her iki dizinin WebP, poster ve statik türevlerinin toplamı yaklaşık 7,10 MB'dır; normal ziyaretçi iki diziyi birlikte indirmez. Tarayıcıda WebGL, 3D motoru veya ağır animasyon kütüphanesi yoktur.

Lighthouse 13.6.0 ile aynı bilgisayarda, aynı yerel üretim sunucusu ve cihaz ayarlarıyla tek ölçüm:

| Sürüm                                | Mobil performans | Masaüstü performans | Erişilebilirlik |
| ------------------------------------ | ---------------: | ------------------: | --------------: |
| Kullanıcının bildirdiği önceki sonuç |               93 |                  99 |               — |
| Bu oturumda güvenli temel            |               93 |                  99 |       100 / 100 |
| Deneysel, henüz açılmamış sayfa      |              100 |                 100 |       100 / 100 |

Deneysel mobil LCP 0,75 sn, masaüstü 0,32 sn; TBT iki ölçümde de 0 ms. Bunlar yerel laboratuvar sonuçlarıdır. Lighthouse ilk açılışı ölçer; aktif kamera yolculuğunun akıcılık ölçümü değildir. Tekrar ölçmek için: `node scripts/audit-performance.mjs http://127.0.0.1:<port>/ <çıktı-klasörü> <etiket>`.

## Kaynak düzeni

- `src/App.jsx`: korunan sayfa akışı, fincan ürünleri ve marka hikâyesi.
- `src/components/`: logo, menü ve form. Eski `HeroMedia.jsx` gelecekteki video denemesi için korunmuş, bu dalda kullanılmıyor.
- `src/story/CoffeeJourney.jsx`: isteğe bağlı açma/kapama ve odak dönüşü.
- `src/story/PinnedScene.jsx`: büyüme, sticky sahne, doğal kaydırma ve anlatı.
- `src/story/sequence-player.mjs`: kare yükleme/iptal/çizim ve sınırlı bellek.
- `src/story/timeline.mjs`: saf ilerleme ve anlatı eşikleri.
- `src/story/ReducedStory.jsx`: azaltılmış hareket akışı.
- `src/story/journey.css`: sahne ve responsive düzen.
- `scripts/prepare-story.mjs`: Blender çıktılarından WebP, poster ve manifest üretimi.
- `tests/`: korunan form/logo testleri, kamera kaynağı doğrulaması, asenkron yarış regresyonları ve tarayıcı senaryoları.
- `docs/`: önceki revizyon kayıtları ve bu aşamanın tasarım planı.

Renkler `#F4F1EA`, `#382D26`, `#5E6848`; Cormorant Garamond ve Manrope yerel OFL fontlarıdır. Orijinal `public/images/yaren-logo.png` aynen korunur; kayıpsız WebP türevleri kullanılır. Ürün ve ayrı hikâye fotoğrafları korunmuştur.

Form ad/e-posta/mesaj doğrular, hataları geçerli olana kadar gösterir ve yalnız yerel demo başarı mesajı üretir. Mesaj gönderilmez veya saklanmaz. Alışveriş/ödeme altyapısı yoktur. Gemini videosu veya GIF eklenmedi.
