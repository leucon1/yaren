# Yâren

React ve Vite ile geliştirilmiş, premium bir kahve markası deneyimi. Yâren, geleneksel Türk kahvesi kültürünü sade ve çağdaş bir arayüzle buluşturur. Markanın ana sloganı: **“Her fincanda ortak bir hikâye.”**

**[Canlı siteyi görüntüle](https://yaren-kahve-atelier.erentur1905.chatgpt.site)**

Bu hayali marka sitesi, işe alım değerlendirmesi kapsamında bir deneme projesi olarak hazırlanmıştır. Arayüzün ve teslimin dili Türkçedir.

## Özellikler

- Onaylı logo, sıcak tonlu fotoğraflar, yerel fontlar ve krem, koyu kahve, zeytin yeşili paletiyle responsive, tek sayfalık tasarım.
- **Çekirdek → Cezve → Fincan → Paylaşım** aşamalarından oluşan, tam ekran ve kaydırmayla kontrol edilen sinematik hikâye.
- Ekran yönüne göre seçilen, onaylı 16:9 ve 9:16 videolar. Kare ve yatay ekranlarda yatay kaynak, dikey ekranlarda portre kaynak kullanılır.
- İleri ve geri video sarma, kaydırma durduğunda karenin sabit kalması ve ekran yönü değişirken izlenen ilerlemenin korunması.
- Seçilen video indirilirken dört sabit görselle kullanılabilen hikâye ve video hazır olduğunda mevcut kaydırma konumundan devam etme.
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

Testler; form doğrulamasını, navigasyon ve klavye etkileşimlerini, responsive yerleşimleri, video seçimini, ileri/geri sarmayı, ekran yönü değişimlerini, logo ve metin zamanlamasını, yükleme sırasında alternatif görselleri, hareket azaltmayı ve kahve önerilerini kapsar. Teslim ekran görüntüsü testleri `npm run test:screenshots` komutuyla çalıştırılabilir.

Windows WebKit ortamında onaylı MP4'leri çözmek için gereken H.264 desteği bulunmayabilir. İlgili test bu ortamda erişilebilir alternatif görünümü kontrol eder; gerçek iPhone Safari video uyumluluğunu kanıtlamaz. Fiziksel cihaz testi, tarayıcı emülasyonundan ayrı değerlendirilir.

**Gerçek cihaz testleri:** Yâren'in canlı sürümü **iPhone 13** ve **Samsung Galaxy Tab S8** üzerinde manuel olarak kontrol edilmiştir. Responsive görünüm, sayfa navigasyonu ve temel kullanıcı etkileşimleri değerlendirilmiş; iPhone 13 üzerinde 9:16 sinematik deneyimi ayrıca test edilmiştir. Bu kontroller, Playwright ile gerçekleştirilen otomatik tarayıcı testlerinden bağımsızdır.

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

Hikâye bölümüne girildiğinde yalnızca seçilen sinematik video indirilir. Mevcut Sites sunucusu güvenilir yerel video araması için gereken byte-range yanıtlarını sağlamadığından, uygulama dosyayı belleğe alır ve mevcut video sarma motoruna zaman içinde arama yapılabilen bir Blob URL sunar. Yükleme sırasında küçük hikâye görsellerine öncelik verilir. Daha önce seçilmiş varyantlar, bileşen bağlı kaldığı sürece önbellekte tutulur; artık kullanılmayan medya kaynakları temizlenir.

Onaylı videolar, orijinal master'lar, logo, hero ve anlatı zamanlamaları korunur. Hedef sunucuda video sarma ve alternatif görseller test edilmeden videoları değiştirmeyin, test girdilerini kaldırmayın veya yükleme modunu değiştirmeyin. Kodlama bilgileri için `source-media/README.md` dosyasına bakın. Eski uygulama notları önceki davranışları anlatabilir; güncel ekran yönü kuralı `src/story/timeline.mjs` dosyasında tanımlıdır.

## Kaynak doğrulaması

Bu depo, **nihai v10 kaynak arşivi** olan `yaren-final-v10-github-source.zip` üzerinden hazırlanmış ve **`d9c96dc4c5f5a2e27bf039c39546ee3dc7acb9c8`** kaynak commit'iyle doğrulanmıştır. V10 header'ında yalnızca onaylı logo ve navigasyon bulunur; ikinci slogan kaldırılmıştır.

Depo hazırlığı yalnızca belgeleri, hariç tutma kurallarını ve satır sonu yapılandırmasını günceller. Onaylı uygulama kodu, medyalar, stiller ve testler Git'in standart dosya biçiminde v10 teslimiyle aynıdır. Bağımlılıklar, üretilen derlemeler, yerel test çıktıları, yedek arşivleri ve kimlik doğrulama bilgileri depo dışında tutulur.

Bu depo için açık kaynak lisansı tanımlanmamıştır. Üçüncü taraf fontların sağlanan lisans bildirimlerini ilgili dosyalarla birlikte koruyun; yeniden dağıtımdan önce marka ve medya kullanım izinlerini değerlendirin.
