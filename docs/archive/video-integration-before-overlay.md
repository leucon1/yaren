# Yâren — onaylı Gemini videosu ile sinematik scroll

React + Vite ile hazırlanmış tek sayfalık premium kahve deneyimi. Bu sürüm yalnız yerel önizleme içindir; yayımlanmış site değiştirilmedi.

## Çalıştırma

Node.js 20.19+ veya 22.12+ kullanın.

```sh
npm ci
npm run dev -- --port 5180
npm test
npm run lint
npm run format:check
npx playwright install chromium
npm run test:e2e
npm run build
npm run preview -- --port 5182
```

Playwright 5180 portunu kullanır. `PLAYWRIGHT_CHROMIUM_EXECUTABLE` mevcut Chromium yolunu, `DELIVERY_SCREENSHOTS_DIR` teslim görüntülerinin klasörünü seçer. Yeni runtime bağımlılığı eklenmedi.

## Video ve scroll

Açılış sloganı, onaylı logo, renkler ve ilk kahve fotoğrafı korunur. Aşağı kaydırınca ayrı sinematik bölüm normal akışta başlar. Fotoğrafa tıklamak da aynı bölüme doğrudan gider. Mevcut sticky yapı, `scrollProgress`, pasif scroll/resize ve requestAnimationFrame döngüsü yeniden kullanılır; yeni scroll motoru yazılmadı. Önceki tıklamayla bileşen açma ve FLIP yaşam döngüsü, yeni doğal giriş talebi nedeniyle kaldırıldı.

`JourneyMedia.seek(progress)` aynı sözleşmeyle `VideoScrubber` üzerinden video zamanını kontrol eder. Video sessiz, inline ve sürekli duraklatılmıştır; autoplay/loop yoktur. Aynı zaman çizelgesi ileri ve geri çalışır. Bir seek sürerken yeni hedef birikir; bittiğinde yalnız son hedef uygulanır. Tam ilerlemede 239/24 saniyedeki son kare tutulur. Metin sınırlarında opaklık en az %75 kalır; kullanıcı durunca metin kaybolmaz.

Video 10 saniye / 24 fps / 1280×720 / 240 karedir. Gerçek kare incelemesine göre anlatı eşikleri:

| Zaman      | Aşama    | Başlık                         |
| ---------- | -------- | ------------------------------ |
| 0–3,0 s    | Çekirdek | Her şey bir çekirdekle başlar. |
| 3,0–5,0 s  | Cezve    | Bir geleneğin izinde.          |
| 5,0–7,5 s  | Fincan   | Bugünün ritmine uyum sağlar.   |
| 7,5–10,0 s | Paylaşım | Her fincanda ortak bir hikâye. |

İlk aşama videonun geniş masa açılışını ve çekirdeklere yaklaşmayı içerir. Son aşamada el ikinci fincanı bırakır ve çıkar. Kaynak kameranın kabul edilmiş hızlı hareketi aynen korunur. Video üzerinde çizgiler, nesne işaretleri, gradient mask veya yeni görüntü üretimi yoktur.

Bölüm yüksekliği masaüstünde 480svh, tablette 440svh, telefonda 420svh; gerçek pin yolculuğu bir viewport daha kısadır. Dört aşama süreye değil kaydırılan mesafeye yayılır. Scroll kilidi, wheel/touch engelleme veya zamanla ilerleyen oynatma yoktur. Ekran genişliği değişirken aktif hikâye konumu korunur; normal kaydırma ve tarayıcı çubuğu yüksekliği değişimleri ele geçirilmez.

Tüm cihazlarda 16:9 kadraj `contain` ile korunur; telefonda yatay video çevresinde boş alan bilinçli olarak bırakılır. Metinler ayrı bir alandadır; kahve nesnelerini kapatmaz. Kısa yatay ekranda metin görüntünün yanında yer alır. Reduced-motion tercihinde pin/video yerine aynı videodan alınan dört statik kare ve dört anlatı başlığı normal akışta sunulur.

## Yükleme ve hata davranışı

MP4 ilk açılışta veya menüden alt bölüme atlanırken indirilmez. İlk kare küçük poster olarak hazırdır; gerçek video ancak kaydırmayla sinematik alan görünür olduğunda bağlanır. Yükleme hatasında ilk kare, anlatı ve atlama bağlantısı çalışır. Medya olayları, istekler ve oynatıcı bileşen kaldırıldığında temizlenir.

`public/journey-media.json` aktif MP4 ve 24 fps bilgisini seçer. Genel `SequencePlayer` alternatif medya yolu ve testleri korunur; aktif sahne onu veya Blender arşivini yüklemez.

`source-media/yarenvideo-original.mp4` kullanıcının onaylı dosyasının değiştirilmemiş kopyasıdır. Yeniden kodlama komutu, hash ve poster kaynakları [source-media/README.md](source-media/README.md) içindedir. Web sürümünde 0,25 saniyede bir keyframe ve faststart kullanılır; kamera/kadraj/kare sırası değişmez. MP4 sunucusu `video/mp4` ve byte-range/206 desteği vermelidir. Kaynak orijinal, `public/` dışında tutulduğu için üretim derlemesine girmez.

## Navigasyon, marka ve önerici

Kahvelerimiz, Hikâyemiz, İletişim, hero CTA ve önerici ürün bağlantıları doğrudan hedefe gider. Hikâyeyi atla veya aktif hikâyede Escape odağı Kahvelerimiz'e taşır. Bölüm kaldırılmaz; yukarı dönünce aynı zaman çizelgesine ulaşılır. Sayfa doğrudan bölüm/ürün hash'iyle açıldığında da React monte olduktan sonra hedefe gider.

Logo dosyası ve optimize web türevleri değiştirilmedi. Palet #F4F1EA / #382D26 / #5E6848; yerel Cormorant Garamond ve Manrope fontları korunur. Türk kahvesi 1 fincan / ₺120, espresso 1 shot / ₺100, filtre 1 fincan / ₺140; örnek servis fiyatlarıdır. Ürün fotoğrafları, ayrı hikâye fotoğrafı ve form doğrulaması korunur. Form yalnız yerel demo mesajı gösterir; veri göndermez veya saklamaz.

Kahve önericisi değişmedi: yorgun → Espresso; sakin → Filtre Kahve; nostalji/sohbet → Türk Kahvesi. Panel kullanıcı açınca görünür, hero/video sırasında gizlidir; form yazımı, klavye, Escape, dış tıklama ve ürün odağı korunur. API veya kayıt yoktur.

## Korunan sürümler

- Bu çalışma dalı: `feature/gemini-video-scroll`.
- Önceki çalışan önerici sürümü: `backup/mood-recommender-20261108`, d3a09cf.
- Önceki Gemini geçişi: `backup/gemini-bridge-20261108`, 98fc0f8.
- Önceki Blender prototipi: `backup/blender-scroll-20261108`, 3688b3f. Kaynakları/arşivleri silinmedi; yeni Blender işi yapılmadı.
- Yayımlanmış kaynak: outputs/yaren-site, 21fe304; değiştirilmedi.

Önceki README [docs/archive/gemini-bridge-and-recommender.md](docs/archive/gemini-bridge-and-recommender.md) içinde tarihsel kayıt olarak saklanır. Eski poster/Blender açıklamaları mevcut aktif video davranışını tarif etmez.

## İncelenebilir kod ve kontroller

- `src/story/PinnedScene.jsx`: korunan scroll motoru, anlatı ve pin alanı.
- `src/story/JourneyMedia.jsx`: MP4, poster ve korunan genel kare dizisi sınırı.
- `src/story/video-scrubber.mjs`: tek seek, son hedef, son kare ve temizleme.
- `src/story/ReducedStory.jsx`: erişilebilir statik anlatı.
- `src/navigation.mjs`: mevcut doğrudan bölüm geçişleri.
- `tests/browser/video-integration.spec.mjs`: gerçek MP4 ile ileri/geri, durma, lazy yükleme, kadraj, yön değişimi, aşama sınırı ve ilk hash navigasyonu.
- `scripts/measure-scroll-video.mjs <json-çıktı>`: üretim önizlemesinde kesintisiz ileri/geri scroll ölçümü.
- `scripts/audit-performance.mjs <yerel-url> <çıktı-klasörü> [etiket]`: üretim Lighthouse raporları.
- `docs/video-integration-plan.md`: uygulama kaydı ve kararlar.

Gerçek iPhone Safari, fiziksel Android, VoiceOver/TalkBack ve üretim hosting sunucusu bu yerel ortamda doğrulanmadı. Chromium ekran/CPU emülasyonu bu cihaz testlerinin yerine geçmez.
