# Yâren — yerel deneysel geliştirme

## Koruma ve aşamalar

Üretimdeki kaynak `outputs/yaren-site` ve yayımlanmış site değişmez. Bu bağımsız kopyanın uzak deposu kaldırıldı. `fix/cup-service-base` dalında önce fincan servisi ve hikâye kontrastı düzeltilecek, test edilip commit edilecek. Yaratıcı prototip `experiment/scroll-story` dalında bunun üzerine kurulacak. Hiçbir aşamada Sites yayını yapılmayacak.

## Somut yaklaşım

Dört anlatı noktasını tek kamera hareketinde karşılamak için gerçek, sabit geometrili Blender sahnesinden önceden render edilmiş kare dizisi deneniyor. Tarayıcıda WebGL veya ağır animasyon kütüphanesi gerekmiyor. Ayrı fotoğraflar/crossfade süreklilik garantisi vermediğinden kullanılmayacak. İlk dört örnek kare görsel kalite kapısıdır; başarısızsa sınırlama açıkça raporlanır.

Başlangıçta mevcut hero metni yanında küçük, sade, bütünü tıklanabilir kahve kompozisyonu ve yalnızca `Keşfet ↓` ipucu bulunacak. Tıklanınca aynı kare yerleşimden geniş, sticky sahneye büyüyecek. Doğal sayfa kaydırması tek normalize ilerlemeyi kontrol edecek; wheel/touch engellemesi, body scroll kilidi veya zorunlu snap yok. Sabit geometrili sahnede tek sanal kamera yaklaşır, küçük bir yörünge izler ve ikinci fincanı ortaya çıkaracak şekilde uzaklaşır.

Anlatı eşikleri: başlangıç, özen, ritüel, paylaşım. Metinler bu yolun işaretleridir; görselde bağımsız sahne değiştirme yok. Scroll durunca kare de durur; geriye kaydırma aynı diziyi ters yönde oynatır. Son doğal kaydırma Kahvelerimiz bölümüne geçer.

Kapatma kontrolü ve Escape her zaman erişilebilir. Odak tetikleyiciye geri döner; kapanırken ekranın aniden ürünler/altbilgiye atlamasını önlemek için hero konumu korunur. Kullanıcı tıklamadan siteyi normal gezebilir. Klavye doğal PageDown/Space/ok kaydırmasını kullanır. Azaltılmış hareket tercihinde uzun pin alanı ve kamera hareketi kaldırılır, aynı dört aşama sade statik akışla okunabilir.

## Hafiflik ve erişilebilirlik

Kare motoru kullanıcı etkileşimine kadar yüklenmez. Başlangıç posteri optimize yerel bir görseldir. Tam kare dizisi etkileşimden sonra kontrollü yüklenir; bütün kareleri tam çözünürlükte bellekte tutmak yerine küçük pencere önbelleği kullanılır. Mobil için daha küçük çözünürlük ve sınırlı scroll mesafesi seçilir. Ağ veya canvas başarısızlığında sahte geçişe dönülmez; statik deneyim ve açık bildirim kalır.

## Kabul ve teslim

Mevcut testlerin kullanıcı tarafından düzeltilen paket varsayımları fincan/shot semantiğine çevrilir. Yeni testler ürünler, hikâye kontrastı, aç/kapa, odak, ileri/geri ilerleme, dört metin, normal akışa dönüş, azaltılmış hareket, görsel yükleme ve mobil/tablet geometrisini kapsar. Kaydırmanın doğal olduğu klavye/dokunmatik testleri yapılır. Kare dizisi varsa keyframe/süreklilik kontrolleri ve görsel inceleme eklenir.

Üretim derlemesi üzerinde Lighthouse mobil/masaüstü ölçülür; kullanıcının bildirdiği 93/99 önceki sonuçlar ayrı kaynak olarak gösterilir. Ayrıca aynı ölçüm koşullarında korunmuş temel sürüm ölçülerek karşılaştırma yapılır. Önizleme, ekran görüntüleri, test raporları ve kaynak paketi sunulur; yayın/merge yapılmaz.
