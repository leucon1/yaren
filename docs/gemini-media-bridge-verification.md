# Gemini medya geçişi — doğrulama kaydı

8 Kasım 2026. Yayın yapılmadı. Kahve önericisi kapsam dışında bırakıldı.

## Koruma

Yeni çalışma kopyası ve dal: work/yaren-gemini-bridge, experiment/gemini-media-bridge.
Başlangıç commit'i 3688b3f; backup/blender-scroll-20261108 dalı bunu korur.
Önceki work/yaren-storylab ve outputs/yaren-site değiştirilmedi. Eski kaynak ZIP'leri yerinde.
Blender kaynakları, kareler ve üretim betiği silinmedi veya yeniden çalıştırılmadı.

## Uygulama

- CoffeeJourney, sticky/pinned yapı, mevcut scrollProgress ve rAF/passive olay düzeni yeniden kullanıldı.
- Scroll fonksiyonları ve genel SequencePlayer aynı kaldı; ayrı bir scroll motoru yazılmadı.
- Yalnız medya yükleme/çizme bölümü JourneyMedia içine taşındı.
- Varsayılan medya poster; onaylı hero.webp ve hero-mobile.webp. Aktif ağ yolunda eski /story/ varlıkları yok.
- Çekirdek → Cezve → Fincan → Paylaşım metinleri ve alt metinleri aynı ilerlemeye bağlı.
- Fotoğraf sabittir; kamera hareketi, el, ikinci fincan veya fincan üstü logo taklidi yapılmadı.
- Menü ve hero CTA doğrudan hedef bölüme atlar; ara sahneler oynatılmaz. Mobil menü kapanır, odak hedefe gider.
- Reduced-motion, Escape, odak/konum dönüşü, serbest scroll ve normal sayfaya devam korunur.
- MP4 katmanı metadata gecikmesini ve devam eden seek sırasında en yeni hedefi saklar. Gerçek video henüz olmadığı için codec/telefon akıcılığı doğrulanmadı.
- Fotoğraf oranı 3:2'ye uyarlandı; eski portre Blender kadrajı kullanılmadı. Dijital yakınlaştırma eklenmedi.
- Dört eşik 0 / 0,27 / 0,54 / 0,80 olarak korundu; final video geldiğinde hareketin zamanına göre yeniden kontrol edilmeli.

## Son doğrulama

| Kontrol                             | Sonuç                       |
| ----------------------------------- | --------------------------- |
| Birim/varlık testleri               | 16/16                       |
| Tarayıcı testleri                   | 44/44                       |
| Lint                                | Geçti, uyarı yok            |
| Format kontrolü                     | Geçti                       |
| Üretim derlemesi                    | Geçti                       |
| Bağımsız salt okunur kod incelemesi | Önemli somut hata bulunmadı |
| Korunan üç bölüm, üç ekran boyutu   | 9/9 aynı görüntü            |

Yeni tarayıcı senaryoları: eski Blender isteklerinin yokluğu; otomatik ilerlememe; yeni dört metin/alt metnin ileri–geri takibi; masaüstü ve mobil menüden doğrudan üç bölüme atlama; MP4 yükleme hatasında fotoğraf/anlatı/çıkış; reduced-motion. Önceki form, logo, ürün/fiyat, kontrast, responsive, klavye, dokunmatik ve asenkron kare oynatıcı testleri korundu. Kare oynatıcı tarayıcı girdisi artık onaylı fotoğraf kullanır; eski Blender görselleriyle yeni sahne üretilmez.

Görsel karşılaştırma: 1440×1000, 768×1024, 390×844. Ürün, hikâye ve iletişim bölümleri geçici test sayfalarında aynı başlangıç konumunda izole edildi. Böylece farklı hero yüksekliğinin alt bölümlerin kesirli piksel konumuna etkisi ayrıştırıldı. Tüm dokuz karşılaştırmada boyut ve piksel farkı sıfır. Bu, sayfa bütünü aynı demek değildir: hero görseli/oranı ve deneyim metinleri bilinçli değişti. Tam sayfa ve dört aşamalı görüntüler de incelendi.

## Entegrasyon ve sınırlar

public/journey-media.json şu anda yalnız kind=poster seçer. MP4 geldiğinde kind=video ve src=/video/yaren-gemini.mp4 seçilir; eşleme progress × duration. Akıcı seek için gerçek iPhone/Safari ve Android/Chrome doğrulaması gerekir. Gerekirse kind=sequence + yeni Gemini manifest'i seçilir; mevcut kare oynatıcı ve aynı scroll motoru kullanılır. Detaylı adımlar README.md içinde.

Bu aşama statik fotoğrafla çalışan altyapı geçişidir; tamamlanmış bir sinematik film iddiası yoktur. Final Gemini dosyası, el hareketi, video içi logo ve kamera hareketi eklenmedi. Lighthouse bu geçiş için yeniden ölçülmedi; önceki 100/100 sonucu yeni ölçüm gibi kullanılmamalıdır.
