"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import Link from "next/link";
import { Search } from "lucide-react";
import { cityDistricts } from "@/data/cityDistricts";

type Listing = {
  id: string;
  baslik: string;
  kategori: string;
  altKategori: string;
  il: string;
  ilce: string;
  girisTarihi: string;
  cikisTarihi: string;
  ucret: number;
  coverUrl?: string;
};

export default function DetayliAramaPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filtered, setFiltered] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);

  // Filtre alanları
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const categories = {
    Konaklama: [
      "Otel",
      "Villa / Yazlık",
      "Airbnb & Booking Rezervasyonu",
      "Bungalow / Tiny House",
      "Dağ / Yayla Evi",
      "Tatil Köyü",
      "Apart / Rezidans",
    ],
    "Deneyim Tatilleri": [
      "Tekne / Yat Tatili",
      "Cruise (Gemi Turu)",
      "Kamp / Glamping",
      "Wellness & Spa Tatili",
      "Yoga / Retreat",
      "Gastronomi Tatili",
    ],
    Turlar: [
      "Kültür Turları",
      "Doğa & Trekking Turları",
      "Karadeniz / GAP Turları",
      "Kayak Turları",
      "Günübirlik Turlar",
    ],
    "Etkinlik Paketleri": [
      "Festival + Konaklama",
      "Konser + Konaklama",
      "Spor Etkinliği + Otel",
      "Kültür & Sanat + Otel",
      "Workshop + Tatil",
    ],
  };

  // 🔹 Firestore'dan tüm ilanları çek
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "ilanlar"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Listing[];
        setListings(data);
        setFiltered(data);
      } catch (err) {
        console.error("İlanlar alınamadı:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  // 🔹 Arama Filtresi
  const handleSearch = () => {
    let result = listings;

    if (category) result = result.filter((i) => i.kategori === category);
    if (subCategory)
      result = result.filter((i) => i.altKategori === subCategory);
    if (city) result = result.filter((i) => i.il === city);
    if (district) result = result.filter((i) => i.ilce === district);
    if (minPrice) result = result.filter((i) => i.ucret >= Number(minPrice));
    if (maxPrice) result = result.filter((i) => i.ucret <= Number(maxPrice));

    setFiltered(result);
  };

  const resetFilters = () => {
    setCategory("");
    setSubCategory("");
    setCity("");
    setDistrict("");
    setCheckIn("");
    setCheckOut("");
    setMinPrice("");
    setMaxPrice("");
    setFiltered(listings);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-[1100px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Search className="w-6 h-6 text-primary" />
          Detaylı Arama
        </h1>
        <p className="text-gray-600 mb-6">
          Kategori, tarih, fiyat ve konum kriterlerine göre dilediğin tatili
          kolayca bul.
        </p>

        {/* Arama Formu */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Ana Kategori</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSubCategory("");
                }}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Seçiniz</option>
                {Object.keys(categories).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Alt Kategori</label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                disabled={!category}
                className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
              >
                <option value="">Seçiniz</option>
                {category &&
                  categories[category as keyof typeof categories].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">İl</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Seçiniz</option>
                {Object.keys(cityDistricts).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">İlçe</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                disabled={!city}
                className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
              >
                <option value="">Seçiniz</option>
                {city &&
                  cityDistricts[city]?.map((d: string) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Min Fiyat (₺)</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Max Fiyat (₺)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={resetFilters}
              className="px-5 py-2 border rounded-lg hover:bg-gray-100 transition"
            >
              Filtreleri Temizle
            </button>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-sky-500 text-white rounded-lg font-semibold hover:bg-sky-600 transition"
            >
              Ara
            </button>
          </div>
        </div>

        {/* Sonuçlar */}
        <div>
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <Search className="w-5 h-5 text-sky-500" />
            Arama Sonuçları
          </h2>

          {loading ? (
            <p className="text-gray-500 animate-pulse">İlanlar yükleniyor...</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-500">Sonuç bulunamadı.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filtered.map((item) => (
                <Link
                  key={item.id}
                  href={`/ilan/${item.id}`}
                  className="border rounded-xl bg-white overflow-hidden hover:shadow-md transition"
                >
                  <img
                    src={item.coverUrl || "/defaults/fallback.jpg"}
                    alt={item.baslik}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-800 line-clamp-1">
                      {item.baslik}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {item.il} {item.ilce ? `- ${item.ilce}` : ""}
                    </p>
                    <p className="text-primary font-bold mt-1">
                      {item.ucret
                        ? `${item.ucret.toLocaleString("tr-TR")} ₺`
                        : "Fiyat belirtilmedi"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
