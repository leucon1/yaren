# Yâren

React ve Vite ile geliştirilmiş, premium bir kahve markası deneyimi. Yâren, geleneksel Türk kahvesi kültürünü sade ve çağdaş bir arayüzle buluşturur. Markanın ana sloganı: **“Her fincanda ortak bir hikâye.”**

**[Canlı siteyi görüntüle](https://yaren-kahve-atelier.erentur1905.chatgpt.site)**

Bu hayali marka sitesi, işe alım değerlendirmesi kapsamında bir deneme projesi olarak hazırlanmıştır. Arayüzün ve teslimin dili Türkçedir.

## Özellikler

- Onaylı logo, sıcak tonlu fotoğraflar, yerel fontlar ve krem, koyu kahve, zeytin yeşili paletiyle responsive, tek sayfalık tasarım.
- **Çekirdek → Cezve → Fincan → Paylaşım** aşamalarından oluşan, tam ekran ve kaydırmayla kontrol edilen sinematik hikâye.
- Ekran yönüne göre seçilen, onaylı 16:9 ve 9:16 videolar. Kare ve yatay ekranlarda yatay kaynak, dikey ekranlarda portre kaynak kullanılır.
- V10'daki doğal, serbest ve çift yönlü video sarma; kaydırma durduğunda bulunulan karede kalma ve ekran yönü değişirken izlenen ilerlemenin korunması.
- Yatay ve dikey yerleşimlerde ana video kırpılmadan, aktif karenin ince kenar şeritlerinden üretilen yumuşak arka plan dolgusu.
- Hero görseli ve fontlar hazır olduktan sonra yalnızca seçilen videonun arka planda hazırlanması; yükleme sürerken dört sabit görselle kullanılabilen hikâye ve video hazır olduğunda mevcut kaydırma konumundan devam etme.
- Hareket azaltma tercihinde, sinematik video indirilmeden normal sayfa akışında gösterilen sabit görseller.
- Türk kahvesi, espresso ve filtre kahve için fincan veya shot bazında örnek fiyatlar içeren ürün kartları.
- Ruh hâline göre kahve önerisi; ilgili ürüne odaklanma, kontrollü yumuşak kaydırma ve hareket azaltma desteği.
- Klavyeyle kullanılabilen navigasyon, mobil menü, görünür odak göstergeleri ve iletişim formu doğrulaması.

İletişim formu **tarayıcı tarafında çalışan bir demodur**: alanları doğrular ve mesajı göndermeden veya saklamadan başarı bildirimi gösterir. Ürün fiyatları örnektir; projede ödeme veya çevrim içi sipariş altyapısı bulunmaz.

## Kullanılan teknolojiler

- React 19 ve JavaScript / JSX
- Vite 7
- Responsive yerleşimler ve hareket azaltma desteği için yalın CSS
- Tarayıcının yerel HTML video ve medya API'leri; kaynak değişiminde kullanılan küçük bir canvas geçiş katmanı
- ESLint ve Prettier
- Node.js'in yerleşik test çalıştırıcısı ve Playwright
- Medya türevlerini hazırlamak için Sharp ve FFmpeg tabanlı betikler; yerel performans denetimleri için Lighthouse

Uygulama sunucu tarafı hizmeti veya API anahtarı gerektirmez. FFmpeg yalnızca medya hazırlama betikleri özellikle çalıştırılacaksa gereklidir; normal geliştirme veya derleme için gerekmez.

## Geliştirme süreci ve kullanılan araçlar

Yâren; yapay zekâ destekli planlama, geliştirme ve içerik üretim araçlarından yararlanılarak hazırlanmıştır. Marka kimliği, yaratıcı kararlar, video seçimleri, manuel düzenlemeler ve nihai onaylar kullanıcı tarafından yönetilmiştir.

| Araç / Model                   | Projedeki görevi                                                                                                                        |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| **GPT-6**                      | Genel planlama, marka kimliğinin oluşturulması, tasarım kararları, yaratıcı yönlendirme ve ara değerlendirmeler.                        |
| **GPT-6.1 Sol**                | React/Vite geliştirme, responsive uygulama, sinematik video entegrasyonu, teknik düzeltmeler, testler ve ChatGPT Sites yayın süreçleri. |
| **Gemini Omni 1.2 Flash**      | Onaylı orijinal 16:9 sinematik videonun yapay zekâ ile üretilmesi.                                                                      |
| **ChatGPT ImageGen**           | Ana sayfadaki hero görselinin üretilmesi.                                                                                               |
| **CapCut**                     | Orijinal 16:9 sinematik videonun manuel keyframe ve kadraj ayarlamalarıyla nihai 9:16 dikey sürüme dönüştürülmesi.                      |
| **GPT-6 Astra**                | Bağımsız kalite kontrol; erişilebilirlik, performans, responsive davranış, sinematik scroll ve kullanıcı deneyiminin denetlenmesi.      |
| **Claude Sonnet 5.5 (Medium)** | Ek kaynak kod incelemesi, kod kalitesinin değerlendirilmesi ve teknik iyileştirme önerileri.                                            |

Yapay zekâ araçları planlama, geliştirme, içerik üretimi ve kalite kontrol aşamalarında kullanılmıştır. Çalışan uygulama herhangi bir yapay zekâ API'sine bağlı değildir; kahve önericisi önceden tanımlanmış eşleştirmelerle çalışır.

## Kurulum ve geliştirme

npm ile birlikte Node.js **20.19+ veya 22.12+** kullanın. Depo kök dizininde:

```sh
npm ci
npm run dev
```

Vite'ın terminalde gösterdiği yerel adresi açın. Bağımlılıkların aynı sürümlerle kurulabilmesi için sağlanan `package-lock.json` dosyasını koruyun.

## Üretim derlemesi

```sh
npm run build
npm run preview
```

Derleme çıktısı `dist/` klasörüne yazılır. Görseller, fontlar, medya yapılandırması ve videolar, `public/` klasöründen site köküne göre yollarla sunulur. Mevcut yapılandırma sitenin alan adı kökünde yayımlanmasını bekler; bir URL alt dizininde barındırma için dosya yollarının ayrıca değerlendirilmesi gerekir.

Mevcut ChatGPT Sites yayını yukarıdaki canlı adreste kalır. Yayın yapılandırması `.openai/hosting.json` dosyasında korunur; yayımlama ayrı bir işlemdir ve bu GitHub kaynak tesliminin kapsamı dışındadır.

## Kontroller ve testler

```sh
npm run lint
npm run format:check
npm test
npx playwright install chromium webkit
npm run test:e2e
npm run build
```

Playwright, geliştirme sunucusunu `127.0.0.1:5180` adresinde başlatır. Bu portu boş bırakın veya yeniden kullanılan sunucunun bu çalışma kopyasını çalıştırdığından emin olun. Desteklenen Linux ortamlarında tarayıcıların sistem bağımlılıkları da gerekebilir. `PLAYWRIGHT_CHROMIUM_EXECUTABLE`, mevcut ve uyumlu bir Chromium çalıştırılabilir dosyasının yolunu belirlemek için kullanılabilir.

Testler; form doğrulamasını, navigasyon ve klavye etkileşimlerini, responsive yerleşimleri, video seçimini, ileri/geri sarmayı, hafif ve hızlı kaydırma sonrasında karenin kendiliğinden değişmemesini, dokunma hareketlerini, ekran yönü değişimlerini, logo ve metin zamanlamasını, kenar dolgusunun kareyle eşleşmesini ve beklerken çizilmemesini, hero sonrasında tek kaynak hazırlığını, yükleme sırasında alternatif görselleri, hareket azaltmayı ve kahve önerilerini kapsar. Teslim ekran görüntüsü testleri `npm run test:screenshots` komutuyla çalıştırılabilir.

Windows WebKit ortamında onaylı MP4'leri çözmek için gereken H.264 desteği bulunmayabilir. İlgili test bu ortamda erişilebilir alternatif görünümü kontrol eder; gerçek iPhone Safari video uyumluluğunu kanıtlamaz. Fiziksel cihaz testi, tarayıcı emülasyonundan ayrı değerlendirilir.

**Gerçek cihaz testleri:** Yâren'in **v10 canlı sürümü**, kullanıcı tarafından **iPhone 13** ve **Samsung Galaxy Tab S8** üzerinde manuel olarak kontrol edilmiştir. Responsive görünüm, sayfa navigasyonu ve temel kullanıcı etkileşimleri değerlendirilmiş; iPhone 13 üzerinde 9:16 sinematik deneyimi ayrıca test edilmiştir. Bu kontroller, Playwright ile gerçekleştirilen otomatik tarayıcı testlerinden bağımsızdır. V11'in bu fiziksel cihazlarda tekrar doğrulandığı iddia edilmez; yeni sürümün cihaz kontrolü ayrıca yapılmalıdır.

## Proje yapısı

```text
src/
  components/       Header, ürün kartları, iletişim formu ve ortak marka bileşenleri
  story/            Sticky hikâye, medya katmanı, video sarma ve anlatı zaman çizelgesi
  recommender/      Kahve önericisi arayüzü ve ürüne yönlendirme
  navigation.mjs    Sayfa bölümleri arasında gezinme
  styles.css        Ortak site stilleri
public/
  images/           Onaylı marka, hero, ürün ve hikâye görselleri
  video/            Optimize yatay/dikey videolar ve sabit hikâye görselleri
  fonts/            Yerel fontlar ve lisans bildirimleri
  story/            Otomatik testlerin kullandığı korunmuş kare dizisi girdileri
source-media/       Onaylı orijinal medya master'ları ve kodlama notları
scripts/            Medya hazırlama ve yerel denetim araçları
tests/              Birim ve tarayıcı testleri
scene-source/       Medya testlerinin kullandığı korunmuş doğrulama girdisi
docs/               Uygulama notları ve tarihsel kayıtlar
```

## Medya ve yükleme davranışı

İlk açılışta hero görselinin çözülmesi ve yerel fontların hazır olması beklenir. İki çizim karesi ve boşta çalışma fırsatından sonra yalnızca ekran oranına uygun sinematik video düşük ağ önceliğiyle hazırlanır. Kullanıcı daha önce hikâyeye yaklaşırsa hazırlık erkene alınır. Video otomatik oynatılmaz; hareket azaltma tercihinde video indirilmez. Ekran yönü değiştiğinde yalnızca gereken varyanta geçilir; artık geçerli olmayan indirme iptal edilir.

Mevcut Sites sunucusu güvenilir yerel video araması için gereken byte-range yanıtlarını sağlamadığından, uygulama dosyayı belleğe alır ve mevcut video sarma motoruna zaman içinde arama yapılabilen bir Blob URL sunar. Yükleme sırasında küçük hikâye görsellerine öncelik verilir. Normal hazırlık bilgisi yalnız ekran okuyuculara iletilir; gerçek yükleme hatası görünür kalır. Daha önce seçilmiş varyantlar, bileşen bağlı kaldığı sürece önbellekte tutulur; artık kullanılmayan medya kaynakları temizlenir.

`PinnedScene.jsx`, v10'daki kaydırma geometrisini kullanarak iki videoyu aynı normalize ilerlemeyle kontrol eder. Video, kaydırma bırakıldığında bulunulan karede sabit kalır; otomatik yerleşme veya noktalı gösterge yoktur. Dört aşama yalnızca anlatı metinlerinin kilometre taşlarıdır. Başlangıç logosu, doğal çıkış, doğrudan bölüm bağlantıları, Escape ve “Hikâyeyi atla” korunur.

Yatay ve dikey ana videolar `contain` olarak gösterilir. Oran farkından oluşan boşluklar, mevcut kare ya da bekleme görselinin 8 px kenar şeritleri uzatılarak tek, en uzun kenarı 320 px olan küçük canvas üzerinde doldurulur ve CSS ile yumuşatılır. Tam görüntü boşluklarda tekrar edilmez. İkinci video çözücüsü veya sürekli çalışan çizim döngüsü kullanılmaz; dolgu yalnızca yeni kare, görsel veya boyut değişiminde güncellenir. Geçiş sırasında tutulan kare de aynı yaklaşımı kullanır.

Onaylı C tasarımında, portre çerçevenin kenarları dolguya yumuşak bir alfa geçişiyle birleşir. Gerçek alanda 8 px'ten fazla boşluk bulunan eksende, en fazla 28 px ve çerçeve boyutunun %5'i kadar geçiş uygulanır. Tam oturan 9:16 alanlarda maske kullanılmaz; yatay kaynağın mevcut görünümü korunur. Bu hesap yalnız boyut veya kaynak biçimi değiştiğinde, mevcut `ResizeObserver` üzerinden yapılır. Ana video büyütülmez veya kırpılmaz; sabit görseller ve yön değişiminde tutulan kare de aynı çerçeve geçişini kullanır.

Onaylı videolar, orijinal master'lar, logo, hero ve anlatı zamanlamaları korunur. Hedef sunucuda video sarma ve alternatif görseller test edilmeden videoları değiştirmeyin, test girdilerini kaldırmayın veya yükleme modunu değiştirmeyin. Kodlama bilgileri için `source-media/README.md` dosyasına bakın. Eski uygulama notları önceki davranışları anlatabilir; güncel ekran yönü kuralı `src/story/timeline.mjs` dosyasında tanımlıdır.

## Kaynak doğrulaması

Bu depo, **nihai v10 kaynak arşivi** olan `yaren-final-v10-github-source.zip` üzerinden hazırlanmış ve **`d9c96dc4c5f5a2e27bf039c39546ee3dc7acb9c8`** kaynak commit'iyle doğrulanmıştır. V10 header'ında yalnızca onaylı logo ve navigasyon bulunur; ikinci slogan kaldırılmıştır.

V11, bu doğrulanmış v10 tabanının GitHub `main` dalındaki `e0215334e03abc0a0fc90418e48ae7c3f817fa34` commit'i üzerinden geliştirilmiştir. İlk v11 commit'i `e18486a774d23b715198e37d07f66edef5167bf7` geçmişte korunur. Son revizyon, kullanıcı kararıyla otomatik durakları ve göstergesini kaldırır; doğal kaydırmayı, v11 yükleme/görsel iyileştirmelerini ve yeni dikey kenar dolgusunu içerir. Onaylı yatay/dikey MP4'ler, master'lar, logo, hero ve hikâye metinleri değiştirilmemiştir. Canlı Sites yayını kullanıcı onayına kadar v10 olarak kalır; GitHub'a gönderim Sites yayını değildir. Bağımlılıklar, üretilen derlemeler, yerel test çıktıları, yedek arşivleri ve kimlik doğrulama bilgileri depo dışında tutulur.

Bu depo için açık kaynak lisansı tanımlanmamıştır. Üçüncü taraf fontların sağlanan lisans bildirimlerini ilgili dosyalarla birlikte koruyun; yeniden dağıtımdan önce marka ve medya kullanım izinlerini değerlendirin.
