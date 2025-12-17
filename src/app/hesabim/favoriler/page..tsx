"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebaseConfig";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import Link from "next/link";

type Favori = {
  id: string;          // fav doküman id
  ilanId: string;      // asıl ilan id
  baslik: string;
  coverUrl?: string;
  fiyat?: number;
};

export default function FavorilerPage() {
  const [user, loadingUser] = useAuthState(auth);
  const [items, setItems] = useState<Favori[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavs = async () => {
      if (!user) {
        setItems([]);
        setLoading(false);
        return;
      }

      try {
        const favCol = collection(db, "users", user.uid, "favorites");
        const q = query(favCol, orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const data: Favori[] = snap.docs.map((d) => ({
          id: d.id,
          ilanId: String(d.data().ilanId),
          baslik: d.data().baslik || "-",
          coverUrl: d.data().coverUrl || "/defaults/default.jpg",
          fiyat: d.data().fiyat || 0,
        }));
        setItems(data);
      } catch (err) {
        console.error("Favoriler alınamadı:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!loadingUser) fetchFavs();
  }, [user, loadingUser]);

  if (loading || loadingUser)
    return <p className="text-center py-10">Yükleniyor...</p>;

  if (!user)
    return (
      <p className="text-center py-10">
        Favorilerinizi görmek için lütfen giriş yapın.
      </p>
    );

  if (items.length === 0)
    return (
      <p className="text-center py-10">
        Henüz favori eklemediniz. İlan detay sayfasından ⭐ butonuna
        tıklayarak ekleyebilirsiniz.
      </p>
    );

  return (
    <main className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-6">⭐ Favorilerim</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {items.map((fav) => (
          <Link
            key={fav.id}
            href={`/ilan/${fav.ilanId}`}
            className="border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition"
          >
            <img
              src={fav.coverUrl}
              alt={fav.baslik}
              className="w-full h-40 object-cover"
            />
            <div className="p-3">
              <h2 className="font-medium text-sm line-clamp-2">
                {fav.baslik}
              </h2>
              <p className="text-blue-600 font-semibold mt-1">
                {fav.fiyat?.toLocaleString("tr-TR")} ₺
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
