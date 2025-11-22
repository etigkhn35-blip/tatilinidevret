"use client";

import Header from "../components/Header";
import CookiePopup from "../components/CookiePopup";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion"; // ✅ animasyon
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
  "Otel": "/defaults/konaklama-otel.jpg",
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

  "Genel": "/defaults/default.jpg",
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

/* -------------------------- KART KOMPONENTİ ------------------------- */
function VitrinCard({ item }: { item: Card }) {
  const imageSrc = item.cover || DEFAULT_IMAGES[item.category || "Genel"] || DEFAULT_IMAGES["Genel"];

  return (
    <a
      href={`/ilan/${item.id}`}
      className="group border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-lg transition cursor-pointer block"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100 relative">
        <img
          src={imageSrc}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition"
        />

        {/* 🔥 İndirim etiketi */}
        {(item as any).indirim && (
          <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md">
            %{(item as any).indirim} İndirim
          </div>
        )}

        {/* 🔹 Devredildi ibaresi SADECE fake ilanlarda */}
        {item.isFake && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-md">
            Devredildi
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="text-sm text-gray-500">{item.location}</div>
        <div className="font-semibold text-gray-900 mt-0.5 line-clamp-1">{item.title}</div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-primary font-bold">{item.price?.toLocaleString("tr-TR")} ₺</span>

          {/* İncele butonunu kaldırdık! */}
        </div>
      </div>
    </a>
  );
}


/* ----------------------------- KATEGORİ MENÜ ----------------------------- */
function CategoryAccordion() {
  const [open, setOpen] = useState<string | null>(CATEGORIES[0].title);
  const toggle = (t: string) => setOpen((prev) => (prev === t ? null : t));

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="sticky top-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Kategoriler</h2>
        <div className="space-y-2">
          {CATEGORIES.map((c) => (
            <div key={c.title} className="border border-gray-200 rounded-xl bg-white">
              <button
                onClick={() => toggle(c.title)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3"
              >
                <span className="font-semibold text-gray-900">
                  <span className="mr-2">{c.icon}</span>
                  {c.title}
                </span>
                <span className="text-gray-500">{open === c.title ? "−" : "+"}</span>
              </button>

              {open === c.title && (
                <ul className="px-4 pb-3 space-y-2">
                  {c.subs.map((s) => (
                    <li key={s}>
                      <a
                        href={`/kategori/${encodeURIComponent(s)}`}
                        className="block text-sm text-gray-700 hover:text-primary"
                      >
                        {s}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
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
      title: `${sub} – Tatil Fırsatı`, // "Örnek İlan" yazmıyoruz
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

/* ----------------------------- ANA SAYFA ----------------------------- */
export default function HomePage() {
  const [vitrin, setVitrin] = useState<Card[]>([]);
  const [latest, setLatest] = useState<Card[]>([]);
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
        const indirim = orjinal > 0 ? Math.round(((orjinal - ucret) / orjinal) * 100) : 0;

        return {
          id: d.id,
          title: doc.baslik,
          location: `${doc.il || ""} ${doc.ilce || ""}`.trim(),
          price: ucret,
          original: orjinal,
          indirim,
          category: doc.kategori,
          subcategory: doc.altKategori,
          cover: doc.coverUrl || DEFAULT_IMAGES[doc.altKategori || doc.kategori || "Genel"],
          isFake: false,
        };
      });
      
      
      

      // ⭐ EFSANE (%40+) & MUHTEŞEM (%30–39)
      const efsaneList = data.filter((i) => i.indirim >= 40);
      const muhtesemList = data.filter((i) => i.indirim >= 30 && i.indirim < 40);

      setEfsane(efsaneList.slice(0, 6));
      setMuhteşem(muhtesemList.slice(0, 6));

      // ----- FAKE LİSTELER -----
      const fakeListings = buildFakeListings().filter(
        (f) => !data.some((r) =>
          r.category === f.category || r.subcategory === f.category
        )
      );

      // ⭐ ANA VİTRİN → en yüksek indirimli olanlar üstte
      const sorted = [...data].sort((a, b) => b.indirim - a.indirim);

      setVitrin([...sorted, ...fakeListings]);

      // ⭐ Sağ sütun → sadece gerçek ilanlar (en son 6 tane)
      setLatest(
        data
          .sort(
            (a, b) =>
              (b as any).olusturmaTarihi?.seconds -
              (a as any).olusturmaTarihi?.seconds
          )
          .slice(0, 6)
      );
    } catch (err) {
      console.error("❌ Firestore veri çekme hatası:", err);
      setVitrin(buildFakeListings());
      setLatest(buildFakeListings().slice(0, 6));
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  return (
    <>
      <Header />

      {/* Banner */}
      <section className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-4 py-4">
          <img
            src="/images/banner.jpg"
            alt="Banner"
            className="w-full h-[320px] md:h-[380px] lg:h-[400px] rounded-lg object-cover"
          />
        </div>
      </section>

      {/* Geniş Sponsor Reklam */}
      <section className="max-w-[800px] mx-auto px-6 py-8">
        <div className="rounded-xl overflow-hidden border border-gray-200">
          <img
            src="/images/ad-wide.jpg"
            alt="Sponsorlu Reklam"
            className="w-full h-[100px] object-cover"
          />
        </div>
      </section>

      {/* İçerik */}
      <main className="min-h-screen bg-white">
        <section className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[256px_1fr_300px] gap-6">
            <CategoryAccordion />
            

            {/* Orta Alan */}
            <section>
              {/* 🔥 EFSANE FIRSATLAR (%40+) */}
{efsane.length > 0 && (
  <div className="mb-8">
    <h2 className="text-lg font-semibold text-gray-900 mb-3">🔥 Efsane Fırsatlar (%40+ İndirim)</h2>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {efsane.map((v) => (
        <VitrinCard key={v.id} item={v} />
      ))}
    </div>
  </div>
)}

{/* ✨ MUHTEŞEM İLANLAR (%30–40) */}
{muhteşem.length > 0 && (
  <div className="mb-8">
    <h2 className="text-lg font-semibold text-gray-900 mb-3">✨ Muhteşem İlanlar (%30–40 İndirim)</h2>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {muhteşem.map((v) => (
        <VitrinCard key={v.id} item={v} />
      ))}
    </div>
  </div>
)}

              {/* Ana Vitrin */}
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
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                    {vitrin.map((v) => (
                      <VitrinCard key={v.id} item={v} />
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </section>

            {/* Sağ Sütun */}
            <aside className="w-full lg:w-[300px]">
              <div className="sticky top-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  🆕 En Son Paylaşılan İlanlar
                </h2>
                {latest.length === 0 ? (
                  <p className="text-center text-gray-500">Henüz ilan yok.</p>
                ) : (
                  <div className="space-y-3">
                    {latest.map((a) => (
                      <a
                        key={a.id}
                        href={`/ilan/${a.id}`}
                        className="flex gap-3 p-2 border border-gray-200 rounded-xl bg-white hover:shadow-sm transition"
                      >
                        <div className="h-16 w-20 overflow-hidden rounded-lg bg-gray-100 shrink-0 relative">
                          <img
                            src={a.cover || DEFAULT_IMAGES[a.category || "Genel"]}
                            alt={a.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        
                        <div className="min-w-0">
                          <div className="text-xs text-gray-500 line-clamp-1">{a.location}</div>
                          <div className="text-sm font-semibold text-gray-900 line-clamp-1">
                            {a.title}
                          </div>
                          <div className="text-primary font-bold text-sm mt-0.5">
                            {a.price?.toLocaleString("tr-TR")} ₺
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
                {/* Sağ sütun altı - reklam kutusu */}
<div className="mt-6">
  <div className="border border-gray-200 rounded-xl overflow-hidden">
    <img
      src="/images/ad-square.jpg"
      alt="Sponsorlu Reklam"
      className="w-full h-40 object-cover"
    />
  </div>
</div>

              </div>
            </aside>
            {/* KATEGORİLERİN ALTINDAN SONRA - SPONSORLU REKLAM */}
<div className="mt-4 w-full lg:w-64">
  <div className="border border-gray-200 rounded-xl overflow-hidden">
    <img
      src="/images/ad-square.jpg"
      alt="Sponsorlu Reklam"
      className="w-full h-40 object-cover"
    />
  </div>
</div>

          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 mt-12 border-t border-gray-800">
        <div className="max-w-[1200px] mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-sm">
          <div>
            <h3 className="font-semibold text-white mb-3 text-lg">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li><a href="/" className="hover:text-primary transition">Ana Sayfa</a></li>
              <li><a href="/ilan-ver" className="hover:text-primary transition">İlan Ver</a></li>
              <li><a href="/ilanlar" className="hover:text-primary transition">İlanlar</a></li>
              <li><a href="/nasil-calisir" className="hover:text-primary transition">Nasıl Çalışır?</a></li>
              <li><a href="/sss" className="hover:text-primary transition">SSS</a></li>
              <li><a href="/iletisim" className="hover:text-primary transition">İletişim</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3 text-lg">Yasal Linkler</h3>
            <ul className="space-y-2">
              <li><a href="/kullanim-kosullari" className="hover:text-primary transition">Kullanım Koşulları</a></li>
              <li><a href="/gizlilik-politikasi" className="hover:text-primary transition">Gizlilik Politikası</a></li>
              <li><a href="/kvkk" className="hover:text-primary transition">KVKK Aydınlatma Metni</a></li>
              <li><a href="/cerez-politikasi" className="hover:text-primary transition">Çerez Politikası</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3 text-lg">İletişim</h3>
            <p className="text-gray-700">Adres: Türkiye, İstanbul</p>
            <p className="text-gray-700">Telefon: +90 (555) 555 55 55</p>
            <p className="text-gray-700">E-posta: info@tatilinidevret.com</p>
            <div className="flex justify-center gap-4 mt-3 text-gray-600">
              <a href="https://www.instagram.com/" className="hover:text-primary">Instagram</a>
              <a href="https://tr.linkedin.com/" className="hover:text-primary">LinkedIn</a>
              <a href="https://x.com/?lang=tr" className="hover:text-primary">X</a>
              <a href="https://www.facebook.com/?locale=tr_TR" className="hover:text-primary">Facebook</a>
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
