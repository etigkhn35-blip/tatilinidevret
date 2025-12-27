"use client";

import Header from "../components/Header";
import CookiePopup from "../components/CookiePopup";
import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";

/* ----------------------------- TİP TANIMLARI ---------------------------- */
type Card = {
  id: string;
  title: string;
  location: string;
  price: number;
  cover?: string;
  category?: string;
  isFake?: boolean; // ✅ fake/gerçek ayrımı
};

/* ----------------------------- DEFAULT GÖRSELLER ---------------------------- */
const DEFAULT_IMAGES: Record<string, string> = {
  Otel: "/defaults/konaklama-otel.jpg",
  "Villa / Yazlık": "/defaults/konaklama-villa.jpg",
  "Airbnb & Booking Rezervasyonu": "/defaults/konaklama-airbnb.jpg",
  "Bungalow / Tiny House": "/defaults/konaklama-bungalow.jpg",
  "Dağ / Yayla Evi": "/defaults/konaklama-yayla.jpg",
  "Tatil Köyü": "/defaults/konaklama-tatilkoyu.jpg",
  "Apart / Rezidans": "/defaults/konaklama-apart.jpg",

  "Tekne / Yat Tatili": "/defaults/deneyim-tekne.jpg",
  "Cruise (Gemi Turu)": "/defaults/deneyim-gemi.jpg",
  "Kamp / Glamping": "/defaults/deneyim-kamp.jpg",
  "Wellness & Spa Tatili": "/defaults/deneyim-spa.jpg",
  "Yoga / Retreat": "/defaults/deneyim-yoga.jpg",
  "Gastronomi Tatili 🍷": "/defaults/deneyim-gastronomi.jpg",

  "Kültür Turları": "/defaults/tur-kultur.jpg",
  "Doğa & Trekking Turları": "/defaults/tur-doga.jpg",
  "Karadeniz / GAP Turları": "/defaults/tur-karadeniz-gap.jpg",
  "Kayak Turları": "/defaults/tur-kayak.jpg",
  "Günübirlik Turlar": "/defaults/tur-gunubirlik.jpg",
  "Balayı Turları": "/defaults/tur-balay.jpg",

  "Festival + Konaklama": "/defaults/etkinlik-festival.jpg",
  "Konser + Konaklama": "/defaults/etkinlik-konser.jpg",
  "Spor Etkinliği + Otel": "/defaults/etkinlik-spor.jpg",
  "Kültür & Sanat + Otel": "/defaults/etkinlik-kultur.jpg",
  "Workshop + Tatil": "/defaults/etkinlik-workshop.jpg",

  Genel: "/defaults/default.jpg",
};

/* ----------------------------- KATEGORİLER ------------------------------ */
const CATEGORIES = [
  {
    title: "Konaklama",
    icon: "🏨",
    subs: [
      "Otel",
      "Villa / Yazlık",
      "Airbnb & Booking Rezervasyonu",
      "Bungalow / Tiny House",
      "Dağ / Yayla Evi",
      "Tatil Köyü",
      "Apart / Rezidans",
    ],
  },
  {
    title: "Deneyim Tatilleri",
    icon: "🌿",
    subs: [
      "Tekne / Yat Tatili",
      "Cruise (Gemi Turu)",
      "Kamp / Glamping",
      "Wellness & Spa Tatili",
      "Yoga / Retreat",
      "Gastronomi Tatili 🍷",
    ],
  },
  {
    title: "Turlar",
    icon: "🚌",
    subs: [
      "Kültür Turları",
      "Doğa & Trekking Turları",
      "Karadeniz / GAP Turları",
      "Kayak Turları",
      "Günübirlik Turlar",
      "Balayı Turları",
    ],
  },
  {
    title: "Etkinlik Paketleri",
    icon: "🎟️",
    subs: [
      "Festival + Konaklama",
      "Konser + Konaklama",
      "Spor Etkinliği + Otel",
      "Kültür & Sanat + Otel",
      "Workshop + Tatil",
    ],
  },
];

/* -------------------------- ROZET BİLEŞENİ ------------------------- */
function DiscountBadge({ indirim }: { indirim: number }) {
  // Altın: %40+
  if (indirim >= 40) {
    return (
      <div className="absolute top-2 left-2 z-10">
        <div className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold shadow-md border border-yellow-300 bg-gradient-to-r from-yellow-200 to-yellow-500 text-yellow-900">
          <span className="text-[12px]">🏅</span>
          
        </div>
      </div>
    );
  }

  // Gümüş: %30–39
  if (indirim >= 30) {
    return (
      <div className="absolute top-2 left-2 z-10">
        <div className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold shadow-md border border-gray-200 bg-gradient-to-r from-gray-100 to-gray-300 text-gray-800">
          <span className="text-[12px]">🥈</span>
          
        </div>
      </div>
    );
  }

  return null;
}

/* -------------------------- KART KOMPONENTİ ------------------------- */
function VitrinCard({ item }: { item: Card }) {
  const imageSrc =
    item.cover || DEFAULT_IMAGES[item.category || "Genel"] || DEFAULT_IMAGES["Genel"];

  const indirim = Number((item as any).indirim || 0);

  return (
    <a
      href={`/ilan/${item.id}`}
      className="group border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition cursor-pointer block"
    >
      {/* Kartlar daha küçük olsun diye oranı biraz genişlettik */}
      <div className="aspect-[16/11] w-full overflow-hidden bg-gray-100 relative">
        <img
          src={imageSrc}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition"
        />

        {/* 🔹 Rozetler (SADECE gerçek ilanlarda) */}
        {!item.isFake && indirim > 0 && <DiscountBadge indirim={indirim} />}

        {/* 🔥 İndirim etiketi */}
        {(item as any).indirim ? (
          <div className="absolute top-2 right-2 bg-green-600 text-white text-[10.5px] font-bold px-2 py-1 rounded-md shadow-md">
            %{(item as any).indirim} İndirim
          </div>
        ) : null}

        {/* 🔹 Devredildi ibaresi SADECE fake ilanlarda */}
        {item.isFake && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[10.5px] font-semibold px-2 py-1 rounded-md shadow-md">
            Devredildi
          </div>
        )}
      </div>

      {/* Daha kompakt */}
      <div className="p-2">
        <div className="text-[11px] text-gray-500 line-clamp-1">{item.location}</div>
        <div className="font-semibold text-gray-900 mt-0.5 line-clamp-1 text-[12.5px]">
          {item.title}
        </div>

        <div className="mt-1 flex items-center justify-between">
          <span className="text-primary font-bold text-[12.5px]">
            {item.price?.toLocaleString("tr-TR")} ₺
          </span>
        </div>
      </div>
    </a>
  );
}

/* ----------------------------- KATEGORİ MENÜ (HEPSİ AÇIK) ----------------------------- */
function CategoryAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="sticky top-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Kategoriler</h2>

        <div className="space-y-2">
          {CATEGORIES.map((c, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={c.title}
                className="border border-gray-200 rounded-xl bg-white overflow-hidden"
              >
                {/* BAŞLIK */}
                <button
                  onClick={() =>
                    setOpenIndex(isOpen ? null : idx)
                  }
                  className="
                    w-full flex items-center justify-between gap-3
                    px-4 py-3
                    font-semibold text-gray-900
                    lg:cursor-default
                  "
                >
                  <span>
                    <span className="mr-2">{c.icon}</span>
                    {c.title}
                  </span>

                  {/* Mobil ok */}
                  <span className="lg:hidden">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {/* ALT KATEGORİLER */}
                <ul
                  className={`
                    px-4 pb-3 space-y-2 text-sm
                    ${isOpen ? "block" : "hidden"}
                    lg:block
                  `}
                >
                  {c.subs.map((s) => (
                    <li key={s}>
                      <a
                        href={`/kategori/${encodeURIComponent(s)}`}
                        className="block text-gray-700 hover:text-primary"
                      >
                        {s}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}


/* ----------------------------- FAKE İLANLAR ----------------------------- */
const SUBCAT_TO_MAIN: Record<string, string> = CATEGORIES.reduce((acc, cat) => {
  cat.subs.forEach((sub) => (acc[sub] = cat.title));
  return acc;
}, {} as Record<string, string>);

function buildFakeListings(): Card[] {
  const cities = [
    "İstanbul / Beşiktaş",
    "İzmir / Konak",
    "Antalya / Muratpaşa",
    "Muğla / Bodrum",
    "Ankara / Çankaya",
    "Nevşehir / Göreme",
    "Rize / Çamlıhemşin",
    "Sakarya / Sapanca",
  ];

  const listings: Card[] = [];
  let i = 0;

  Object.keys(SUBCAT_TO_MAIN).forEach((sub) => {
    const main = SUBCAT_TO_MAIN[sub] || "Genel";
    const city = cities[i % cities.length];
    const price = 3000 + (i % 9) * 450;

    listings.push({
      id: `fake-${i}`,
      title: `${sub} – Tatil Fırsatı`,
      location: city,
      price,
      category: sub,
      cover: DEFAULT_IMAGES[sub] || DEFAULT_IMAGES[main] || DEFAULT_IMAGES["Genel"],
      isFake: true,
    });

    i++;
  });

  return listings;
}

/* ----------------------------- BLOG SLIDER (6 ADET, 3'ER 3'ER, 10sn) ----------------------------- */
type BlogPost = { title: string; desc: string; href: string; img: string };

function BlogSection() {
  const posts: BlogPost[] = [
  {
    title: "Tatilini Devretmek Güvenli mi? 7 İpucu",
    desc: "Devir sürecinde dikkat etmen gereken kritik noktalar.",
    href: "/blog",
    img: "/images/blog-1.jpg",
  },
  {
    title: "Erken Rezervasyon İptalinde Para Nasıl Kurtarılır?",
    desc: "İptal koşulları + alternatif çözümler.",
    href: "/blog",
    img: "/images/blog-2.jpg",
  },
  {
    title: "Villa, Otel, Bungalow: Hangisi Daha Avantajlı?",
    desc: "Bütçe ve deneyime göre doğru seçimi yap.",
    href: "/blog",
    img: "/images/blog-3.jpg",
  },
  {
    title: "Tatil Devrinde Sözleşme Şartları",
    desc: "Alıcı & satıcı için kritik maddeler.",
    href: "/blog",
    img: "/images/blog-4.jpg",
  },
  {
    title: "Bütçe Dostu Tatil Tüyoları",
    desc: "İndirimli ilanları doğru zamanda yakala.",
    href: "/blog",
    img: "/images/blog-5.jpg",
  },
  {
    title: "Dolandırıcılığa Karşı 9 Güvenlik Kontrolü",
    desc: "Ödeme ve kimlik süreçlerinde dikkat.",
    href: "/blog",
    img: "/images/blog-6.jpg",
  },
  {
    title: "Tatil Devri Nedir? Yeni Nesil Tatil",
    desc: "Kullanılmayan rezervasyonları değerlendirme rehberi.",
    href: "/blog",
    img: "/images/blog-7.jpg",
  },
  {
    title: "Konaklama Devirlerinde Sık Yapılan Hatalar",
    desc: "Bu hatalardan kaçın, paran boşa gitmesin.",
    href: "/blog",
    img: "/images/blog-8.jpg",
  },
  {
    title: "Tatilini Devretmenin Avantajları",
    desc: "Hem alıcı hem satıcı için kazan-kazan modeli.",
    href: "/blog",
    img: "/images/blog-9.jpg",
  },
];

  // 6 post => 2 sayfa (3'erli)
  const pages = useMemo(() => {
    const chunked: BlogPost[][] = [];
    for (let i = 0; i < posts.length; i += 3) chunked.push(posts.slice(i, i + 3));
    return chunked;
  }, [posts]);

  const [page, setPage] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setPage((p) => (p + 1) % pages.length);
    }, 10000);
    return () => clearInterval(t);
  }, [pages.length]);

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">📰 Blog</h2>
        <Link href="/blog" className="text-sm text-primary hover:underline">
          Tüm yazıları gör
        </Link>
      </div>

      <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden">
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${page * 100}%)` }}
          >
            {pages.map((group, idx) => (
              <div key={idx} className="min-w-full p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {group.map((p) => (
                    <Link
                      key={p.title}
                      href={p.href}
                      className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition block"
                    >
                      <div className="h-36 w-full bg-gray-100 overflow-hidden">
                        <img src={p.img} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-3">
                        <div className="font-semibold text-gray-900 line-clamp-2 text-sm">
                          {p.title}
                        </div>
                        <div className="text-xs text-gray-600 mt-1 line-clamp-2">{p.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* basit nokta göstergesi */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {pages.map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`h-2.5 w-2.5 rounded-full border ${
                  i === page ? "bg-gray-900 border-gray-900" : "bg-white border-gray-300"
                }`}
                aria-label={`Blog sayfa ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- ANA SAYFA ----------------------------- */
export default function HomePage() {
  const [vitrin, setVitrin] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [efsane, setEfsane] = useState<Card[]>([]);
  const [muhteşem, setMuhteşem] = useState<Card[]>([]);
  

  useEffect(() => {
  const fetchData = async () => {
    try {
      const q = query(
        collection(db, "ilanlar"),
        where("status", "==", "approved"),
        orderBy("olusturmaTarihi", "desc")
      );

      const snap = await getDocs(q);

      const data = snap.docs.map((d) => {
        const doc = d.data() as any;

        const ucret = doc.ucret || 0;
        const orjinal = doc.orjinalFiyat || doc.originalPrice || ucret;
        const indirim =
          orjinal > 0 ? Math.round(((orjinal - ucret) / orjinal) * 100) : 0;

        return {
          id: d.id,
          title: doc.baslik,
          location: `${doc.il || ""} ${doc.ilce || ""}`.trim(),
          price: ucret,
          cover:
            doc.coverUrl ||
            DEFAULT_IMAGES[doc.altKategori || doc.kategori || "Genel"],
          category: doc.kategori,
          isFake: false,
          indirim,
          anasayfaVitrin: Boolean(doc.anasayfaVitrin),
        };
      });

      /* 🔥 EFSANE (%40+) */
      setEfsane(data.filter((i) => i.indirim >= 40).slice(0, 12));

      /* ✨ HARİKA (%30–39) */
      setMuhteşem(
        data.filter((i) => i.indirim >= 30 && i.indirim < 40).slice(0, 12)
      );

      /* 🧠 ANASAYFA VİTRİN KURALI */
      const vitrineGirecekGercekIlanlar = data.filter((i) => {
        if (i.indirim < 30) return true;
        if (i.indirim >= 30 && i.anasayfaVitrin) return true;
        return false;
      });

      /* 🔽 İndirimine göre sırala */
      const sorted = [...vitrineGirecekGercekIlanlar].sort(
        (a, b) => (b.indirim || 0) - (a.indirim || 0)
      );

      /* 🧱 FAKE İLANLAR */
      const fakeListings: Card[] = buildFakeListings();

      /* 🎯 HER ZAMAN 36 KART */
      const VITRIN_TARGET = 24;
      let vitrinFinal: Card[] = [...sorted];

      if (vitrinFinal.length < VITRIN_TARGET) {
        const need = VITRIN_TARGET - vitrinFinal.length;
        vitrinFinal = [
          ...vitrinFinal,
          ...fakeListings.slice(0, need),
        ];
      }

      setVitrin(vitrinFinal.slice(0, VITRIN_TARGET));
    } catch (err) {
      console.error("❌ Firestore veri çekme hatası:", err);
      setVitrin(buildFakeListings().slice(0, 36));
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);


  // Desktop 6 kolon (6x6 gibi büyür), ilk etapta 36 gösterelim
  const VITRIN_LIMIT = 24;
const vitrinView: Card[] = vitrin.slice(0, VITRIN_LIMIT);
  return (
    <>
      <Header />

     {/* BANNER */}
<section className="bg-gray-100 border-b border-gray-00">
  <div className="max-w-[1200px] mx-auto px-4 py-4">
    <div className="relative">

      <img
        src="/images/banner.jpg"
        alt="Planlar Değişir – Tatilini Devret"
        className="w-full h-auto rounded-lg"
      />

      {/* ✅ SADECE BEYAZ BUTON */}
    <a
  href="/ilan-ver"
  className="
    absolute
    bg-white
    text-orange-500
    font-semibold
    shadow-lg
    hover:bg-orange-50
    transition

    /* DESKTOP */
    px-6 py-3 text-base rounded-full

    /* MOBİL */
    max-md:px-3
    max-md:py-1
    max-md:text-[11px]
    max-md:rounded-xl
  "
  style={{
    top: '76.4%',
    left: '62.5%',
    transform: 'translate(-50%, 0)',
  }}
>
  Ücretsiz İlan Ver
</a>



    </div>
  </div>
</section>



      {/* İçerik */}
      <main className="min-h-screen bg-white">
        <section className="max-w-[1200px] mx-auto px-4 py-6">
          {/* ✅ 2 kolon */}
          <div className="grid grid-cols-1 lg:grid-cols-[256px_1fr] gap-6">
            <CategoryAccordion />

            {/* Orta Alan */}
            <section>
              {/* ✅ Anasayfa vitrini en üstte */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">Anasayfa Vitrini</h2>
                <a href="/tum-ilanlar" className="text-sm text-primary hover:underline">
                  Tüm ilanları görüntüle
                </a>
              </div>

              {loading ? (
                <p className="text-center text-gray-500 py-6">İlanlar yükleniyor...</p>
              ) : (
                <AnimatePresence mode="popLayout">
                  {/* ✅ Kartlar küçüldü + desktop 6 kolon */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {vitrinView.map((v) => (
                      <VitrinCard key={v.id} item={v} />
                    ))}
                  </div>
                </AnimatePresence>
              )}

              {/* ✅ Sponsor Reklam vitrinden SONRA */}
              <section className="max-w-[800px] mx-auto px-0 py-6">
                <img
                  src="/images/ad-wide.jpg"
                  alt="Sponsorlu Reklam"
                  className="w-full h-auto rounded-xl border border-gray-200"
                />
              </section>

              {/* ✅ Efsane & Harika vitrin altına taşındı, başlık yanında extra yazı yok */}
              {efsane.length > 0 && (
                <div className="mt-2 mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">🔥 Efsane Fırsatlar</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {efsane.map((v) => (
                      <VitrinCard key={v.id} item={v} />
                    ))}
                  </div>
                </div>
              )}

              {muhteşem.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">✨ Harika Fırsatlar</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {muhteşem.map((v) => (
                      <VitrinCard key={v.id} item={v} />
                    ))}
                  </div>
                </div>
              )}

              {/* ✅ Blog slider (6 adet, 3'er 3'er, 10sn) */}
              <BlogSection />

              {/* Not: Arama çubuğu genişlik/hiza Header component içinde; bunu page.tsx’ten değiştiremeyiz */}
            </section>
          </div>
        </section>
      </main>

      {/* FOOTER (AYNEN) */}
      <footer className="bg-gray-900 text-gray-300 mt-12 border-t border-gray-800">
        <div className="max-w-[1200px] mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-sm">
          <div>
            <h3 className="font-semibold text-white mb-3 text-lg">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="hover:text-primary transition">
                  Ana Sayfa
                </a>
              </li>
              <li>
                <a href="/ilan-ver" className="hover:text-primary transition">
                  İlan Ver
                </a>
              </li>
              <li>
                <a href="/tum-ilanlar" className="hover:text-primary transition">
                  İlanlar
                </a>
              </li>
              <li>
                <a href="/nasil-calisir" className="hover:text-primary transition">
                  Nasıl Çalışır?
                </a>
              </li>
              <li>
                <a href="/sss" className="hover:text-primary transition">
                  SSS
                </a>
              </li>
              <li>
                <a href="/iletisim" className="hover:text-primary transition">
                  İletişim
                </a>
              </li>
            </ul>
          </div>

          {/* Yasal Linkler */}
          <div>
             <h3 className="font-semibold text-white mb-3 text-lg">Yasal Bilgilendirme</h3>
            <ul className="space-y-2">
              <li>
                <a href="/bireysel-uyelik-sozlesmesi" className="hover:text-primary transition">
                  Bireysel Üyelik Sözleşmesi
                </a>
              </li>
              <li>
                <a href="/ilan-verme-kurallari" className="hover:text-primary transition">
                  İlan Verme Kuralları
                </a>
              </li>
              <li>
                <a
                  href="/satisa-uygun-belge-yukleme-yonergesi"
                  className="hover:text-primary transition"
                >
                  Satışa Uygun Belge Yükleme Yönergesi
                </a>
              </li>
              <li>
                <a href="/kvkk" className="hover:text-primary transition">
                  KVKK Aydınlatma Metni
                </a>
              </li>
              <li>
                <a href="/acik-riza-metni" className="hover:text-primary transition">
                  Açık Rıza Metni
                </a>
              </li>
              <li>
                <a href="/cerez-politikasi" className="hover:text-primary transition">
                  Çerez Politikası
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3 text-lg">İletişim</h3>
            <p className="text-gray-700">Adres: Türkiye, İstanbul</p>
            <p className="text-gray-700">Telefon: +90 (850) 304 84 01</p>
            <p className="text-gray-700">E-posta: info@tatilinidevret.com</p>
            <div className="flex justify-center gap-4 mt-3 text-gray-600">
              <a href="https://www.instagram.com/" className="hover:text-primary">
                Instagram
              </a>
              <a href="https://tr.linkedin.com/" className="hover:text-primary">
                LinkedIn
              </a>
              <a href="https://x.com/?lang=tr" className="hover:text-primary">
                X
              </a>
              <a href="https://www.facebook.com/?locale=tr_TR" className="hover:text-primary">
                Facebook
              </a>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-gray-600 pb-6">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold">
            <span className="text-primary">tatilini</span>
            <span className="text-accent">devret</span>
            <span className="text-gray-900">.com</span>
          </span>{" "}
          – Tüm hakları saklıdır.
        </div>
      </footer>

      <CookiePopup />
    </>
  );
}
