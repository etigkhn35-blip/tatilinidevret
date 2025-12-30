"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
   collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";


/* ---------------------------------------------------------
   TİP TANIMI
--------------------------------------------------------- */
type Listing = {
  id: string;
  title: string;
  location: string;
  price: number;
  category?: string;
  subcategory?: string;
  cover?: string;
};

/* ---------------------------------------------------------
   TEK İLAN KARTI
--------------------------------------------------------- */
function ListingCard({ item, currentUser }: { item: Listing; currentUser: any }) {
  
  
 
  return (
    <div className="group border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-lg transition relative">
      
      <Link href={`/ilan/${item.id}`}>
        <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
          <img
            src={item.cover || "/defaults/default.jpg"}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition"
          />
        </div>

        <div className="p-3">
          <div className="text-sm text-gray-500 line-clamp-1">
            {item.location}
          </div>

          <div className="font-semibold text-gray-900 mt-0.5 line-clamp-1">
            {item.title}
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-primary font-bold">
              {item.price.toLocaleString("tr-TR")} ₺
            </span>

            <span className="text-[13px] px-2.5 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50">
              İncele
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

/* ---------------------------------------------------------
   ANA SAYFA – TÜM İLANLAR
--------------------------------------------------------- */
export default function TumIlanlarPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [sortOrder, setSortOrder] = useState<
    "artan" | "azalan" | "varsayılan"
  >("varsayılan");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const categories = [
    "Tümü",
    "Konaklama",
    "Deneyim Tatilleri",
    "Turlar",
    "Etkinlik Paketleri",
  ];

  // KULLANICI KONTROLÜ
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) =>
      setCurrentUser(user)
    );
    return () => unsubscribe();
  }, []);

  // 🔥 FIRESTORE’DAN DOĞRU ŞEKİLDE İLAN ÇEKME
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const snapshot = await getDocs(
          query(collection(db, "ilanlar"), orderBy("olusturmaTarihi", "desc"))
        );

        const data = snapshot.docs.map((d) => {
          const x = d.data() as any;
          return {
            id: d.id,
            title: x.baslik || "İsimsiz İlan",
            location: `${x.il || ""} ${x.ilce || ""}`.trim(),
            price: x.ucret || 0,
            category: x.kategori || "Genel",
            subcategory: x.altKategori || "",
            cover: x.coverUrl || "/defaults/default.jpg",
          } as Listing;
        });

        setListings(data);
      } catch (error) {
        console.error("İlanlar alınamadı:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  // FİLTRE + SIRALAMA
  const filteredAndSorted = useMemo(() => {
    const filtered = listings.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "Tümü" || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    return filtered.sort((a, b) => {
      if (sortOrder === "artan") return a.price - b.price;
      if (sortOrder === "azalan") return b.price - a.price;
      return 0;
    });
  }, [listings, searchTerm, selectedCategory, sortOrder]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ÜST BAŞLIK + ARAMA */}
      <section className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-md py-5 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Tüm İlanlar</h1>

          <input
            type="text"
            placeholder="İlan ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        {/* KATEGORİ BUTONLARI */}
        <div className="max-w-[1200px] mx-auto px-4 mt-4 flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* İLAN LİSTESİ */}
      <section className="max-w-[1200px] mx-auto px-4 py-8">
        {loading ? (
          <p className="text-center text-gray-500 animate-pulse">
            İlanlar yükleniyor...
          </p>
        ) : filteredAndSorted.length === 0 ? (
          <p className="text-center text-gray-500">Hiç ilan bulunamadı.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredAndSorted.map((item) => (
              <ListingCard
                key={item.id}
                item={item}
                currentUser={currentUser}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
