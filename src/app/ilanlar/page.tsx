"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

function IlanlarContent() {
  const params = useSearchParams();
  const [ilanlar, setIlanlar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const kategori = params.get("kategori");
        const altKategori = params.get("altKategori");
        const il = params.get("il");
        const min = params.get("min");
        const max = params.get("max");

        let q = query(collection(db, "ilanlar"));

        const allDocs = await getDocs(q);
        let results: any[] = [];

        allDocs.forEach((doc) => {
          const data = doc.data();
          let match = true;

          if (kategori && data.kategori !== kategori) match = false;
          if (altKategori && data.altKategori !== altKategori) match = false;
          if (il && data.il !== il) match = false;
          if (min && data.ucret < Number(min)) match = false;
          if (max && data.ucret > Number(max)) match = false;

          if (match) results.push({ id: doc.id, ...data });
        });

        setIlanlar(results);
      } catch (err) {
        console.error("Arama hatası:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🔍 Arama Sonuçları</h1>

      {loading ? (
        <p>Yükleniyor...</p>
      ) : ilanlar.length === 0 ? (
        <p>Sonuç bulunamadı.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ilanlar.map((ilan) => (
            <div
              key={ilan.id}
              className="border rounded-lg shadow-sm bg-white p-4 hover:shadow-md transition"
            >
              <img
                src={
                  ilan.coverUrl ||
                  `/defaults/${ilan.altKategori?.toLowerCase()?.replace(/\s+/g, "-")}.jpg` ||
                  "/defaults/fallback.jpg"
                }
                alt={ilan.baslik}
                className="w-full h-48 object-cover rounded-lg mb-3"
              />

              <h2 className="font-semibold text-lg mb-1">{ilan.baslik}</h2>

              <p className="text-gray-600 text-sm mb-1">
                {ilan.il} / {ilan.ilce}
              </p>

              <p className="text-primary font-bold text-lg mb-2">
                {ilan.ucret?.toLocaleString("tr-TR")} ₺
              </p>

              <p className="text-gray-500 text-sm">
                {ilan.girisTarihi} → {ilan.cikisTarihi}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p>Yükleniyor...</p>}>
      <IlanlarContent />
    </Suspense>
  );
}
