"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function SuresiDolanIlanlarPage() {
  const [user, setUser] = useState<any>(null);
  const [ilanlar, setIlanlar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchIlanlar(currentUser.uid);
      }
    });
    return () => unsub();
  }, []);

  const fetchIlanlar = async (uid: string) => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "ilanlar"),
        where("sahipUid", "==", uid),
        where("status", "in", ["expired", "sold"])
      );

      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setIlanlar(data);
    } catch (err) {
      console.error("Süresi dolan ilanlar alınamadı:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user)
    return (
      <div className="flex items-center justify-center h-64 text-gray-600">
        Giriş yapmalısınız.
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Süresi Dolan / Devredilen İlanlarım
        </h1>

        {loading ? (
          <p className="text-gray-500 animate-pulse">
            Süresi dolan ilanlar yükleniyor...
          </p>
        ) : ilanlar.length === 0 ? (
          <p className="text-gray-500">
            Süresi dolan veya devredilmiş ilan bulunmuyor.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ilanlar.map((ilan) => (
              <div
                key={ilan.id}
                className="border rounded-xl bg-white shadow-sm overflow-hidden hover:shadow-md transition"
              >
                <Link href={`/ilan/${ilan.id}`}>
                  <img
                    src={ilan.coverUrl || "/defaults/default.jpg"}
                    alt={ilan.baslik}
                    className="w-full h-44 object-cover"
                  />
                </Link>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">
                    {ilan.baslik}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {ilan.aciklama}
                  </p>

                  <div className="mt-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded-md text-white ${
                        ilan.status === "sold" ? "bg-green-600" : "bg-red-600"
                      }`}
                    >
                      {ilan.status === "sold"
                        ? "DEVREDİLDİ"
                        : "SÜRESİ DOLDU"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-primary font-bold">
                      {ilan.ucret
                        ? `${ilan.ucret.toLocaleString("tr-TR")} ₺`
                        : "Belirtilmedi"}
                    </span>

                    <Link
                      href={`/ilan/${ilan.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Görüntüle
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
