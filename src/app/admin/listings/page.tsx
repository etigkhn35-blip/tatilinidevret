"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  query,
  Timestamp,
} from "firebase/firestore";
import Link from "next/link";

/* ------------------------------- Tipler ------------------------------- */
type Listing = {
  id: string;
  title: string;
  location?: string;
  price?: number;
  status?: string; // "active" | "pending" | "expired"
  startDate?: Timestamp;
  endDate?: Timestamp;
  userId?: string;
  category?: string;
};

/* ----------------------------- Yardımcı Fonksiyon ----------------------------- */
function kalanGun(baslangic?: Timestamp, bitis?: Timestamp) {
  if (!bitis) return "—";
  const now = new Date().getTime();
  const end = bitis.toDate().getTime();
  const diff = end - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days > 0 ? `${days} gün kaldı` : "Süresi doldu";
}

/* ------------------------------ Ana Sayfa ------------------------------ */
export default function AdminListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(true);

  /* ------------------------------ Firestore Dinleme ------------------------------ */
  useEffect(() => {
    const q = query(collection(db, "listings"));
    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Listing[];
      setListings(all);
      setFilteredListings(all);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  /* ------------------------------ Arama ve Filtreleme ------------------------------ */
  useEffect(() => {
    let results = [...listings];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        (l) =>
          l.title?.toLowerCase().includes(term) ||
          l.location?.toLowerCase().includes(term) ||
          l.category?.toLowerCase().includes(term)
      );
    }

    if (filterType !== "all") {
      results = results.filter((l) => l.status === filterType);
    }

    setFilteredListings(results);
  }, [searchTerm, filterType, listings]);

  /* ------------------------------ İlan Durum Güncelle ------------------------------ */
  const updateListingStatus = async (id: string, newStatus: string) => {
    await updateDoc(doc(db, "listings", id), { status: newStatus });
    alert(`İlan ${newStatus === "active" ? "yayına alındı" : "güncellendi"} ✅`);
  };

  /* ------------------------------ İlan Sil ------------------------------ */
  const deleteListing = async (id: string) => {
    if (confirm("Bu ilanı silmek istediğine emin misin?")) {
      await deleteDoc(doc(db, "listings", id));
      alert("İlan silindi ✅");
    }
  };

  /* ------------------------------ Render ------------------------------ */
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Yükleniyor...
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-4 py-8 space-y-8">
        {/* Üst Başlık */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-3xl font-bold text-gray-900">🏖️ İlan Yönetimi</h1>
          <Link
            href="/admin"
            className="text-sm text-primary hover:underline font-semibold"
          >
            ← Admin Paneline Dön
          </Link>
        </div>

        {/* 🔍 Arama & Filtreleme */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <input
            type="text"
            placeholder="Başlık, konum veya kategori ara..."
            className="w-full sm:w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="all">Tüm İlanlar</option>
            <option value="active">Aktif İlanlar</option>
            <option value="pending">Onay Bekleyen</option>
            <option value="expired">Süresi Dolmuş</option>
          </select>
        </div>

        {/* 📋 İlan Tablosu */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Toplam {filteredListings.length} ilan bulundu
          </h2>

          {filteredListings.length === 0 ? (
            <p className="text-gray-500 text-sm">Hiç ilan bulunamadı.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-left">
                    <th className="p-3 border-b">Başlık</th>
                    <th className="p-3 border-b">Konum</th>
                    <th className="p-3 border-b">Fiyat</th>
                    <th className="p-3 border-b">Durum</th>
                    <th className="p-3 border-b">Kalan Süre</th>
                    <th className="p-3 border-b text-center">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredListings.map((l) => (
                    <tr key={l.id} className="hover:bg-gray-50">
                      <td className="p-3 border-b font-medium text-gray-800">
                        {l.title || "—"}
                      </td>
                      <td className="p-3 border-b text-gray-700">{l.location || "—"}</td>
                      <td className="p-3 border-b text-gray-700">
                        {l.price?.toLocaleString("tr-TR")} ₺
                      </td>
                      <td className="p-3 border-b">
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-semibold ${
                            l.status === "active"
                              ? "bg-green-100 text-green-700"
                              : l.status === "expired"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {l.status || "Bilinmiyor"}
                        </span>
                      </td>
                      <td className="p-3 border-b text-gray-600">
                        {kalanGun(l.startDate, l.endDate)}
                      </td>
                      <td className="p-3 border-b text-center">
                        <div className="flex items-center justify-center gap-2">
                          {l.status !== "active" && (
                            <button
                              onClick={() => updateListingStatus(l.id, "active")}
                              className="text-green-600 hover:underline text-sm"
                            >
                              Onayla
                            </button>
                          )}
                          {l.status !== "pending" && (
                            <button
                              onClick={() => updateListingStatus(l.id, "pending")}
                              className="text-yellow-600 hover:underline text-sm"
                            >
                              Pasife Al
                            </button>
                          )}
                          <button
                            onClick={() => deleteListing(l.id)}
                            className="text-red-600 hover:underline text-sm"
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
