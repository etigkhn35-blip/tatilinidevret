"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import Link from "next/link";

/**
 * 🔍 Arama Sayfası
 * /arama?q=otel  → Firestore'daki ilanlarda başlık / açıklama eşleşmelerini arar
 */

export default function AramaPage() {
  const searchParams = useSearchParams();
  const searchTerm = (searchParams.get("q") || "").trim().toLowerCase();

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!searchTerm) return;

    const fetchResults = async () => {
      setLoading(true);

      try {
        // 🔹 "ilanlar" koleksiyonunda başlık, açıklama veya kategoriye göre ara
        const q = query(collection(db, "ilanlar"), orderBy("createdAt", "desc"), limit(50));
        const snap = await getDocs(q);

        const list: any[] = [];
        snap.forEach((d) => {
          const data = d.data();
          const title = data.baslik?.toLowerCase() || "";
          const desc = data.aciklama?.toLowerCase() || "";
          const kategori = data.kategori?.toLowerCase() || "";

          if (
            title.includes(searchTerm) ||
            desc.includes(searchTerm) ||
            kategori.includes(searchTerm)
          ) {
            list.push({ id: d.id, ...data });
          }
        });

        setResults(list);
      } catch (e) {
        console.error("Arama hatası:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchTerm]);

  if (!searchTerm)
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-500">
        Arama terimi bulunamadı.
      </main>
    );

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">
          🔍 “{searchTerm}” için arama sonuçları
        </h1>

        {loading ? (
          <p className="text-gray-500 animate-pulse">Sonuçlar yükleniyor...</p>
        ) : results.length === 0 ? (
          <p className="text-gray-500">
            “{searchTerm}” terimiyle eşleşen sonuç bulunamadı.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {results.map((ilan) => (
              <Link
                key={ilan.id}
                href={`/ilan/${ilan.id}`}
                className="bg-white rounded-xl border shadow hover:shadow-md transition p-3 flex flex-col"
              >
                <img
                  src={
                    ilan.kapakFoto ||
                    `/images/defaults/${ilan.kategori || "tatil"}.jpg`
                  }
                  alt={ilan.baslik}
                  className="rounded-lg w-full h-40 object-cover mb-3"
                />
                <h2 className="text-base font-semibold line-clamp-2">
                  {ilan.baslik}
                </h2>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {ilan.aciklama}
                </p>
                <p className="text-sm text-gray-800 font-medium mt-auto">
                  {ilan.fiyat
                    ? `${ilan.fiyat} ₺`
                    : "Fiyat bilgisi bulunmuyor"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
