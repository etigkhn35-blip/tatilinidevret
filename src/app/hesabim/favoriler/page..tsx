"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebaseConfig";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

type Fav = {
  id: string;
  ilanId: string;
  baslik?: string;
  coverUrl?: string;
  ucret?: number;
  createdAt?: any;
};

export default function HesabimFavorilerPage() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [favoriler, setFavoriler] = useState<Fav[]>([]);
  const [loading, setLoading] = useState(true);

  /* -------------------- Giriş kontrolü -------------------- */
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/giris");
      } else {
        setUid(user.uid);
      }
    });
    return () => unsub();
  }, [router]);

  /* -------------------- Favorileri getir -------------------- */
  useEffect(() => {
    if (!uid) return;
    const load = async () => {
      setLoading(true);
      try {
        const favRef = collection(db, "users", uid, "favorites");
        const q = query(favRef, orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({
          id: d.id,
          ilanId: d.id,
          ...(d.data() as any),
        }));
        setFavoriler(list);
      } catch (err) {
        console.error("Favoriler alınamadı:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [uid]);

  /* -------------------- Favori kaldır -------------------- */
  const removeFavorite = async (ilanId: string) => {
    if (!uid) return;
    if (!confirm("Bu ilanı favorilerden kaldırmak istiyor musunuz?")) return;
    try {
      await deleteDoc(doc(db, "users", uid, "favorites", ilanId));
      setFavoriler((prev) => prev.filter((f) => f.ilanId !== ilanId));
    } catch (err) {
      console.error("Favori silme hatası:", err);
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1000px] mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">⭐ Favorilerim</h1>

        {loading ? (
          <p className="text-gray-500">Yükleniyor...</p>
        ) : favoriler.length === 0 ? (
          <p className="text-gray-500">Henüz favoriniz yok.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {favoriler.map((f) => (
              <div
                key={f.ilanId}
                className="border rounded-xl bg-white shadow-sm overflow-hidden flex flex-col"
              >
                <img
                  src={f.coverUrl || "/defaults/default.jpg"}
                  alt={f.baslik}
                  className="h-40 w-full object-cover"
                />
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-800 line-clamp-2 mb-1">
                      {f.baslik}
                    </h2>
                    <p className="text-sm text-blue-600 font-semibold">
                      {f.ucret?.toLocaleString("tr-TR")} ₺
                    </p>
                  </div>
                  <div className="flex justify-between mt-3">
                    <button
                      onClick={() => router.push(`/ilan/${f.ilanId}`)}
                      className="text-sm px-3 py-1.5 border rounded-lg hover:bg-gray-50"
                    >
                      Görüntüle
                    </button>
                    <button
                      onClick={() => removeFavorite(f.ilanId)}
                      className="text-sm px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Kaldır
                    </button>
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
