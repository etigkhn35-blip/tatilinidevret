"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import Link from "next/link";
import { Trash2, Edit3, Pause } from "lucide-react";

export default function YayindaOlanlarPage() {
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
        where("status", "==", "approved")
      );
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setIlanlar(data);
    } catch (err) {
      console.error("İlanlar alınamadı:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async (id: string) => {
    if (!confirm("Bu ilanı yayından kaldırmak istiyor musunuz?")) return;
    try {
      await updateDoc(doc(db, "ilanlar", id), { status: "paused" });
      setIlanlar((prev) => prev.filter((x) => x.id !== id));
      alert("İlan yayından kaldırıldı.");
    } catch (err) {
      console.error(err);
      alert("Hata oluştu.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu ilanı kalıcı olarak silmek istiyor musunuz?")) return;
    try {
      await deleteDoc(doc(db, "ilanlar", id));
      setIlanlar((prev) => prev.filter((x) => x.id !== id));
      alert("İlan silindi.");
    } catch (err) {
      console.error(err);
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
          Yayındaki İlanlarım
        </h1>

        {loading ? (
          <p className="text-gray-500 animate-pulse">İlanlar yükleniyor...</p>
        ) : ilanlar.length === 0 ? (
          <p className="text-gray-500">
            Şu anda yayında olan bir ilanınız bulunmuyor.
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
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-primary font-bold">
                      {ilan.ucret
                        ? `${ilan.ucret.toLocaleString("tr-TR")} ₺`
                        : "Belirtilmedi"}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePause(ilan.id)}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Yayından Kaldır"
                      >
                        <Pause className="w-5 h-5" />
                      </button>
                      <Link href={`/ilan-duzenle/${ilan.id}`}>
                        <Edit3 className="w-5 h-5 text-blue-600 hover:text-blue-800" />
                      </Link>
                      <button
                        onClick={() => handleDelete(ilan.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Sil"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
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
