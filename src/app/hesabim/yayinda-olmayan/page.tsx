"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import Link from "next/link";
import { CheckCircle, Trash2, PlayCircle } from "lucide-react";

export default function YayindaOlmayanlarPage() {
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

    const fetchStatus = async (status: string) => {
      const q = query(
        collection(db, "ilanlar"),
        where("sahipUid", "==", uid),
        where("status", "==", status)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    };

    const paused = await fetchStatus("paused");
    const rejected = await fetchStatus("rejected");
    const draft = await fetchStatus("draft");
    const sold = await fetchStatus("sold"); // devredilen ilanlar (varsa)

    const all = [...paused, ...rejected, ...draft, ...sold];
    setIlanlar(all);
  } catch (err) {
    console.error("İlanlar alınamadı:", err);
  } finally {
    setLoading(false);
  }
};


  // 🔹 Tekrar yayına alma
  const handleActivate = async (id: string) => {
    if (!confirm("Bu ilanı tekrar yayına almak istiyor musunuz?")) return;
    try {
      await updateDoc(doc(db, "ilanlar", id), { status: "approved" });
      setIlanlar((prev) => prev.filter((x) => x.id !== id));
      alert("İlan tekrar yayına alındı.");
    } catch (err) {
      console.error(err);
      alert("Hata oluştu.");
    }
  };

  // 🔹 Silme işlemi
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
          Yayında Olmayan İlanlarım
        </h1>

        {loading ? (
          <p className="text-gray-500 animate-pulse">İlanlar yükleniyor...</p>
        ) : ilanlar.length === 0 ? (
          <p className="text-gray-500">
            Şu anda yayında olmayan bir ilanınız bulunmuyor.
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

                  <p className="text-xs mt-1 text-gray-500">
                    Durum:{" "}
                    {ilan.status === "paused"
                      ? "⛔ Yayından Kaldırıldı"
                      : ilan.status === "rejected"
                      ? "❌ Reddedildi"
                      : "📝 Taslak"}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-primary font-bold">
                      {ilan.ucret
                        ? `${ilan.ucret.toLocaleString("tr-TR")} ₺`
                        : "Belirtilmedi"}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Tekrar Yayına Al */}
                      <button
                        onClick={() => handleActivate(ilan.id)}
                        className="text-green-600 hover:text-green-800"
                        title="Tekrar Yayına Al"
                      >
                        <PlayCircle className="w-5 h-5" />
                      </button>

                      {/* Düzenleme */}
                      <Link href={`/ilan-duzenle/${ilan.id}`}>
                        <CheckCircle className="w-5 h-5 text-blue-600 hover:text-blue-800" />
                      </Link>

                      {/* Silme */}
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
