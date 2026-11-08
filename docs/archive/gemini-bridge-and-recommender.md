# Yâren — kişisel kahve önericisi ve korunan scroll altyapısı

## Bugün nasıl hissediyorsun?

Tamamen istemci tarafında çalışan kompakt bir kahve önericisi eklendi. API, backend, veritabanı, kayıt veya yeni bağımlılık yoktur. Panel kendiliğinden açılmaz. Hero sırasında gizlidir; Kahvelerimiz bölümüne normal kaydırmayla veya doğrudan navigasyonla gelindiğinde erişilebilir olur. Hero'ya dönülürse gizlenir. İletişim alanına yazarken de kapanıp gizlenir; form odağı korunur.

Dört eşleştirme `src/recommender/recommendations.mjs` içindedir: yorgun → Espresso; sakin → Filtre Kahve; nostalji ve sohbet → Türk Kahvesi. Her seçim kendi açıklamasını gösterir. “Kahveyi Gör”, mevcut `jumpToSection` yardımcısıyla doğru mevcut karta doğrudan gider, odağı karta taşır ve 2,2 saniyelik zeytin tonlu vurgu ekler. Yeni seçim önceki vurguyu temizler.

Panel non-modal bir dialog olarak etiketlenir. İlk seçeneğe/sonuç eylemine odak geçer; sonuç canlı bölgede duyurulur. Escape, kapatma ve dışarı tıklama desteklenir. Escape açık önericiyi kapatırken mevcut hero'yu kapatmaz. Kapatma odağı davete döndürür; ürün geçişinde odak kartta kalır. Reduced-motion tercihinde giriş ve vurgu geçişleri kaldırılır. Mobil panel dinamik ekran yüksekliğinin yaklaşık yarısıyla sınırlıdır; küçük ekranlarda içeriği kaydırılabilir ve güvenli alt boşluğu kullanır.

Yeni dosyalar: `src/recommender/CoffeeRecommender.jsx`, `recommendations.mjs`, `useRecommenderVisibility.js`, `recommender.css`. Ürünlere yalnız hedef kimlikleri ve erişilebilir odak etiketleri eklendi; içerik/görseller değişmedi. Önerici, scroll motoruna dokunmadan Kahvelerimiz sınırını gözler.

Çalışma dalı `feature/mood-recommender`; önceki sürüm `backup/gemini-bridge-20261108` dalında (98fc0f8) ve önceki ZIP paketinde korunur. Yayın yapılmadı.

## Korunan Gemini medya geçişi

Bu dal mevcut scroll motorunu korur; aktif Blender görüntülerini onaylı fotoğrafla değiştirir. Nihai Gemini MP4 henüz eklenmedi. Bu sürüm kamera hareketi tamamlanmış gibi sunulmaz.

## Korunan sürümler

- Yayımlanmış kaynak: outputs/yaren-site, commit `21fe304`. Değiştirilmedi.
- Önceki deneysel kaynak: work/yaren-storylab, commit `3688b3f`. Değiştirilmedi.
- Gemini temel sürümü: `experiment/gemini-media-bridge`; önceki Blender durumu ayrıca `backup/blender-scroll-20261108` dalında.
- Önceki kaynak ZIP'leri ve Blender dosyaları korunur. Bu kopyanın uzak Git deposu veya üretim hosting bağlantısı yoktur. Yayın yapılmadı.

## Ne yeniden kullanıldı?

`CoffeeJourney` açma/kapama, odak ve konum dönüşüyle aynen korunur. Küçük kahve görseline tıklanarak açılan mevcut giriş davranışı sürer. `PinnedScene` sticky alanı, 720 ms orantılı açılmayı, Escape davranışını ve pasif scroll/resize + requestAnimationFrame düzenini korur.

`timeline.mjs` içindeki scroll mesafesini 0–1'e çeviren fonksiyonlar değiştirilmedi. Aynı değer ileri ve geri çalışır. Yeni motor yazılmadı. Dört anlatı eşiği yine 0 / 0,27 / 0,54 / 0,80; yalnız metinleri güncellendi:

| Aşama    | Başlık                         | Alt metin                      |
| -------- | ------------------------------ | ------------------------------ |
| Çekirdek | Her şey bir çekirdekle başlar. | Özenle seçilen çekirdekler.    |
| Cezve    | Bir geleneğin izinde.          | Gelenekten gelen ustalık.      |
| Fincan   | Bugünün ritmine uyum sağlar.   | Her detayında özen.            |
| Paylaşım | Her fincanda ortak bir hikâye. | Paylaşıldığında anlam kazanır. |

Fotoğraf üzerinde dijital kamera hareketi, el veya ikinci fincan efekti yapılmaz. Aynı fotoğraf sabit kalırken anlatı kaydırmayla değişir. Bu dört aşamanın kamera hareketi final video ile gelecek.

Kahvelerimiz, Hikâyemiz, İletişim ve hero CTA bağlantıları doğrudan hedefe atlar. Ara aşamalar oynatılmaz; hedef bölüm klavye odağını alır. Href ve değiştirme tuşlarıyla yeni sekmede açma davranışı korunur.

## Neden medya kodu ayrıldı?

Önceden anlatı güncellenmesi Blender karelerinin yüklenmesine bağlıydı. Final video yokken dört aşamanın çalışabilmesi için anlatı mevcut scroll değerine bağlandı; medya yükleme kısmı `JourneyMedia` bileşenine taşındı. Böylece bir medya hatası anlatıyı veya çıkışı durdurmaz.

`JourneyMedia` aynı `seek(progress)` arayüzünü kullanır. Genel `SequencePlayer` değişmeden korunur; Blender'a bağlı değildir. Yeni küçük `VideoScrubber` yalnız scroll değerini video zamanına çevirir. Gerçek MP4 gelmeden codec veya fiziksel mobil tarayıcı akıcılığı doğrulanmış değildir.

## Varsayılan: onaylı fotoğraf

`public/journey-media.json`:

```json
{ "kind": "poster" }
```

Başlangıç ve genişleyen sahne `public/images/hero.webp` / `hero-mobile.webp` kullanır. Oran 3:2 korunur; fotoğraf döndürülmez, kırpılarak aşırı büyütülmez. Kare dizisi veya MP4 indirilmez. Konfigürasyon yalnız deneyim açıldığında okunur. Yükleme hatasında fotoğraf, anlatı ve Kapat/Escape çalışır.

Azaltılmış hareket tercihinde uzun pin alanı ve medya oynatıcısı açılmaz; dört başlık ve aynı onaylı fotoğraf normal akışta okunur. Video/manifest isteği yapılmaz.

## Final Gemini MP4 entegrasyonu

1. Kesintisiz ve onaylanmış videoyu örneğin `public/video/yaren-gemini.mp4` konumuna koyun. Önceki 6. saniye kamera sıçraması olan video eklenmedi.
2. Konfigürasyonu değiştirin:

```json
{ "kind": "video", "src": "/video/yaren-gemini.mp4" }
```

3. Derleyin ve yerel önizlemeyi test edin. Otomatik oynatma veya döngü yoktur. Video sessiz ve satır içidir. Eşleme `video zamanı = scroll ilerlemesi × video süresi`. Metadata gecikirse en son scroll hedefi saklanır; devam eden seek bitince en güncel hedef uygulanır. Kapatmada olaylar ve kaynak temizlenir.
4. Gerçek iPhone/Safari ve Android/Chrome üzerinde yavaş/hızlı ileri–geri kaydırma, yön değişimi, ilk kare, son kare, menüden atlama ve azaltılmış hareket kontrol edilmelidir. Nihai kadraj/aspect ratio ve dört anlatı eşiği videonun gerçek hareketine göre gözden geçirilmelidir.

Yeni dosyanın sıkıştırması ve keyframe düzeni doğrudan seek akıcılığını etkileyebilir. Sonuç yeterli değilse scroll motorunu değiştirmeden aynı videodan üretilmiş optimize kare dizisine geçilir:

```json
{ "kind": "sequence", "manifest": "/gemini-frames/manifest.json" }
```

Manifest örneği:

```json
{
  "desktop": {
    "count": 180,
    "width": 960,
    "height": 600,
    "pattern": "/gemini-frames/desktop/frame-{index}.webp"
  },
  "mobile": {
    "count": 180,
    "width": 540,
    "height": 960,
    "pattern": "/gemini-frames/mobile/frame-{index}.webp"
  }
}
```

İndeksler sıfırdan başlar ve üç haneye tamamlanır. Mevcut oynatıcı 9 çözülmüş kare / en fazla 5 bekleyen istek sınırını korur. Bu örnek konfigürasyonlar final medya dosyalarının üretildiği anlamına gelmez. Varsayılan aktif dosya yalnız poster seçer.

## Blender arşivi

`scene-source/`, `public/story/` ve `scripts/prepare-story.mjs` önceki denemeden korunur. Aktif hero bunları referans almaz; ağ testleri eski kare/poster/manifest isteklerinin yapılmadığını doğrular. Önceki prototip açıklaması `docs/archive/blender-prototype.md` içindedir. Yeni Blender sahnesi/renderı üretilmedi.

## Korunan marka ve işlevler

Logo dosyası ve kayıpsız web türevleri değişmedi. Renkler #F4F1EA / #382D26 / #5E6848; Cormorant Garamond ve Manrope yerel OFL fontlarıdır. Türk kahvesi 1 fincan / ₺120, espresso 1 shot / ₺100, filtre 1 fincan / ₺140; örnek servis fiyatlarıdır. Ürün fotoğrafları, ayrı hikâye fotoğrafı ve form doğrulaması korundu. Hikâye metninin minimum kontrastı 4,69:1.

Form yalnız yerel demo mesajı gösterir; veri göndermez veya saklamaz. Önerici bu forma veya medya yapılandırmasına müdahale etmez.

## Çalıştırma ve kontroller

Node.js 20.19+ veya 22.12+:

```sh
npm ci
npm run dev -- --port 5180
npm test
npm run lint
npm run format:check
npx playwright install chromium
npm run test:e2e
npm run build
npm run preview
```

Playwright bu kopyanın 5180 portunu kullanır. `PLAYWRIGHT_CHROMIUM_EXECUTABLE` ile mevcut Chromium yolu verilebilir. `DELIVERY_SCREENSHOTS_DIR` ekran görüntülerinin çıktı klasörünü seçer. `npm run test:screenshots` altı genişlikte kapalı sayfa ve üç boyutta dört anlatı aşamasını kaydeder.

`scripts/compare-sections.mjs <önceki-yerel-URL> <yeni-yerel-URL> <çıktı>`, ürün/hikâye/iletişim bölümlerini üç ekran boyutunda karşılaştırır. Kahve görseli değiştiğinden hero karşılaştırmaya dahil değildir. Bölümler aynı sayfa başlangıcında izole edilerek farklı hero yüksekliğinin kesirli piksel rasterizasyonu ayrıştırılır. Tam sayfa görüntüleri ayrıca görsel olarak incelenir.

## Dosyalar

- `src/story/PinnedScene.jsx`: korunan scroll/sticky/anlatı düzeni.
- `src/story/JourneyMedia.jsx`: değiştirilebilir medya ve poster fallback.
- `src/story/video-scrubber.mjs`: MP4 metadata ve seek yönetimi.
- `src/story/sequence-player.mjs`: korunan genel kare oynatıcısı.
- `src/navigation.mjs`: animasyonu atlayan doğrudan bağlantılar.
- `tests/video-scrubber.test.mjs`: MP4 sınırının birim testleri.
- `tests/browser/media-bridge.spec.mjs`: yeni anlatı, atlama ve fallback testleri.
- `tests/browser/journey-fixture.mjs`: eski kare oynatıcısını onaylı fotoğrafla sınayan test girdisi; Blender görseli kullanmaz.
