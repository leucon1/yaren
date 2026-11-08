import React, { useEffect } from 'react';
import Header from './components/Header.jsx';
import CoffeeJourney from './story/CoffeeJourney.jsx';
import Contact from './components/Contact.jsx';
import { Arrow, Logo } from './components/Brand.jsx';
import { jumpToSection } from './navigation.mjs';
import CoffeeRecommender from './recommender/CoffeeRecommender.jsx';

const coffees = [
  {
    id: '01',
    name: 'Türk Kahvesi',
    note: 'BİR FİNCAN GELENEK',
    image: 'turkish',
    alt: 'Bakır cezve yanında köpüklü Türk kahvesi ve seramik fincan',
    description:
      'Geleneksel cezvede ağır ağır hazırlanır. Köpüklü, sıcak ve sohbetin tam yerinde.',
    taste: 'Kakao · Fındık · Yumuşak bitiş',
    price: '120',
    size: '1 fincan',
  },
  {
    id: '02',
    name: 'Espresso',
    note: 'KÜÇÜK BİR MOLA, YOĞUN BİR TAT',
    image: 'espresso',
    alt: 'Kahverengi seramik fincanda altın renkli kremasıyla espresso',
    description:
      'Yoğun gövde, kadifemsi krema. Taze hazırlanan tek shot ile kısa ve dolu bir mola.',
    taste: 'Bitter çikolata · Karamel · Dengeli',
    price: '100',
    size: '1 shot',
  },
  {
    id: '03',
    name: 'Filtre Kahve',
    note: 'ZAMANI BİRAZ YAVAŞLAT',
    image: 'filter',
    alt: 'Cam karaf ve seramik demleyici ile taze filtre kahve',
    description:
      'Her siparişte taze demlenir. Narenciye ve bal notalarıyla sade, berrak bir fincan.',
    taste: 'Narenciye · Bal · Hafif gövde',
    price: '140',
    size: '1 fincan',
  },
];

function Hero() {
  return (
    <CoffeeJourney>
      <div className="hero-copy">
        <p className="eyebrow">
          <span className="small-line" /> KAHVENİN BİRLEŞTİREN HÂLİ
        </p>
        <h1 id="hero-title">
          Her fincanda
          <br />
          ortak bir
          <br />
          <em>hikâye.</em>
        </h1>
        <p className="hero-description">
          Gelenekten ilham alan, bugüne eşlik eden kahveler.
          <br className="desktop-break" /> Biraz durmak, biraz paylaşmak için.
        </p>
        <a href="#kahveler" className="button primary" onClick={jumpToSection}>
          Kahveleri Keşfet <Arrow />
        </a>
      </div>
    </CoffeeJourney>
  );
}

function Coffees() {
  return (
    <section
      id="kahveler"
      className="coffees section wrap"
      aria-labelledby="coffee-title"
      tabIndex={-1}
    >
      <div className="section-top">
        <p className="eyebrow">01 / KAHVELERİMİZ</p>
        <span className="section-aside">ÜÇ YORUM. AYNI ÖZEN.</span>
      </div>
      <div className="section-intro">
        <h2 id="coffee-title">
          Her anın bir <em>kahvesi var.</em>
        </h2>
        <p>
          Kimi zaman alıştığın bir tat, kimi zaman yeni bir keşif.
          <br />
          Sana eşlik edecek fincanı bul.
        </p>
      </div>
      <div className="coffee-grid">
        {coffees.map((coffee) => (
          <article
            className="coffee-card"
            key={coffee.id}
            id={`kahve-${coffee.image}`}
            tabIndex={-1}
            aria-labelledby={`coffee-name-${coffee.image}`}
          >
            <div className="product-image">
              <span className="product-number">{coffee.id}</span>
              <img
                src={`/images/${coffee.image}.webp`}
                alt={coffee.alt}
                width="768"
                height="768"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="product-heading">
              <h3 id={`coffee-name-${coffee.image}`}>{coffee.name}</h3>
              <span className="product-size">{coffee.size}</span>
            </div>
            <p className="product-note">{coffee.note}</p>
            <p className="product-description">{coffee.description}</p>
            <div className="product-bottom">
              <span>{coffee.taste}</span>
              <p>
                ₺{coffee.price}
                <small>örnek servis fiyatı</small>
              </p>
            </div>
          </article>
        ))}
      </div>
      <p className="collection-note">
        Özenle hazırlanan kahveler. Kendine has karakterler. Paylaşılacak yeni hikâyeler.
      </p>
    </section>
  );
}

function Story() {
  return (
    <section
      id="hikayemiz"
      className="story section"
      aria-labelledby="story-title"
      tabIndex={-1}
    >
      <div className="wrap story-grid">
        <div className="story-image">
          <img
            src="/images/story-sharing.webp"
            alt="Ahşap masa üzerinde yan yana iki kahve fincanı; paylaşılacak bir sohbet"
            width="900"
            height="1100"
            loading="lazy"
            decoding="async"
          />
          <span className="story-image-note">HATIRI KALAN BİR FİNCAN.</span>
        </div>
        <div className="story-copy">
          <p className="eyebrow">02 / HİKÂYEMİZ</p>
          <h2 id="story-title">
            Adımızda dostluk,
            <br />
            fincanımızda
            <br />
            <em>birliktelik.</em>
          </h2>
          <p>
            Yâren; dost demek, yol arkadaşı demek. Aynı masanın etrafında buluşmak, sözü
            ve sessizliği paylaşmak demek.
          </p>
          <p>
            Bizim hikâyemiz de bu fikirle başladı. Kahvenin yalnızca bir içecek değil,
            insanlar arasında kurulan küçük ama kıymetli bir bağ olduğuna inanıyoruz.
          </p>
          <p>
            Geçmişin misafirperverliğini bugünün kahve anlayışıyla buluşturuyor; her
            fincanda yeni bir sohbete yer açıyoruz.
          </p>
          <div className="story-signoff">
            <svg
              className="story-signoff-icon"
              width="43"
              height="43"
              viewBox="0 0 48 48"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M24 7v34M7 24h34M12 12l24 24M12 36l24-24" />
            </svg>
            <span>
              Bir kahvenin hatırı var.
              <br />
              <strong>Birlikte içilenin, hikâyesi.</strong>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-main">
        <a
          className="logo-link"
          href="#baslangic"
          aria-label="Yâren, sayfanın başına dön"
        >
          <Logo />
        </a>
        <p>Her fincanda ortak bir hikâye.</p>
        <a className="back-top" href="#baslangic">
          Başa dön <span aria-hidden="true">↑</span>
        </a>
      </div>
      <div className="wrap footer-bottom">
        <span>© {new Date().getFullYear()} Yâren · Hayali bir kahve markası.</span>
        <span>İŞE ALIM DENEME PROJESİ</span>
      </div>
    </footer>
  );
}

export default function App() {
  useEffect(() => {
    // React creates these anchors after the browser's initial fragment lookup.
    // Honor shared section/product links once the document is mounted.
    const target = document.getElementById(window.location.hash.slice(1));
    if (!target) return;
    target.scrollIntoView({ behavior: 'instant', block: 'start' });
    target.focus({ preventScroll: true });
  }, []);

  return (
    <>
      <a className="skip-link" href="#icerik">
        İçeriğe geç
      </a>
      <div id="baslangic" />
      <Header />
      <main id="icerik" tabIndex={-1}>
        <Hero />
        <Coffees />
        <Story />
        <Contact />
      </main>
      <Footer />
      <CoffeeRecommender />
    </>
  );
}
