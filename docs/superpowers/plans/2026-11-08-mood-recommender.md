# Kahve önericisi uygulama planı

**Amaç:** Yalnız “Bugün nasıl hissediyorsun?” mini deneyimini eklemek.
**Temel:** 98fc0f8, backup/gemini-bridge-20261108; yeni dal feature/mood-recommender.
**Sınır:** Hero, timeline, medya, navigasyon modülü, logo, ürün içerikleri ve form değişmez. Yeni servis/bağımlılık yok.

## Uygulama

- [x] Önce gerçek davranış testleri: dört seçenek, doğru kart, vurgu süresi, tekrar seçim, Escape/odak, responsive, hero'da gizlilik, form kullanımında engel olmaması.
- [x] recommendations.mjs içinde okunabilir dört eşleştirme.
- [x] CoffeeRecommender.jsx içinde kompakt, kendiliğinden açılmayan, non-modal panel. Mevcut Arrow ve jumpToSection yeniden kullanılır.
- [x] useRecommenderVisibility.js: mevcut scroll motoruna dokunmadan Kahvelerimiz sınırını izler; hero'da ve form alanı düzenlenirken gizler.
- [x] App ürün kartlarına yalnız sabit hedef kimlikleri/odak etiketi eklenir.
- [x] Geçici ürün vurgusu iptal/tekrar/unmount durumunda temizlenir. Reduced-motion desteklenir.
- [x] Lint/format/birim/tüm tarayıcı/build; üç boyutta ekran görüntüsü ve korunan bölümlerin görsel karşılaştırması.
- [x] Son salt okunur inceleme, commit, yeni kaynak paketi ve yerel önizleme.

## Yerleşim kararı

Mevcut deneyim isteğe bağlıdır. Kullanıcı hikâyeyi açmadan menüyle Kahvelerimiz'e geçerse önerici o bölümde erişilebilir; hero'ya dönerse gizlenir. Açık panel kullanıcı form alanına odaklandığında kapanıp gizlenir, form odağı korunur. Bu, mobil klavye ve formu engellememek içindir. Video veya kamera geliştirmesi bu aşamada yapılmaz.
