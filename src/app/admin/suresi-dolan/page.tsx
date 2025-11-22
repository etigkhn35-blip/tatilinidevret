"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import Link from "next/link";

export default function ExpiredListingsPage() {
  const [user, setUser] = useState<any>(null);
  const [ilanlar, setIlanlar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const PRICE = 350; // TL

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchIlanlar(currentUser.uid);
      }
    });
    return () => unsub();
  }, []);

  const fetchIlanlar = async (uid: string) => {
    try {
      const q = query(
        collection(db, "ilanlar"),
        where("sahipUid", "==", uid),
        where("status", "==", "expired")
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

  const startRenewOrder = async (ilan: any) => {
    if (!user) return;

    try {
      const orderRef = await addDoc(collection(db, "orders"), {
        userUid: user.uid,
        email: user.email,
        adSoyad: user.displayName || "",
        ilanId: ilan.id,
        ilanBaslik: ilan.baslik || "",
        amount: PRICE,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      window.location.href = `/odeme/ilan-uzatma?orderId=${orderRef.id}`;
    } catch (err) {
      console.error("Sipariş oluşturulamadı:", err);
      alert("Bir hata oluştu!");
    }
  };

  if (!user)
    return (
      <div className="flex items-center justify-center h-64 text-gray-600">
        Görüntülemek için giriş yapmalısınız.
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-[1000px] mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">⛔ Süresi Dolan İlanlarım</h1>

        {loading ? (
          <p className="text-gray-500">Yükleniyor...</p>
        ) : ilanlar.length === 0 ? (
          <p className="text-gray-500">Süresi dolan ilan bulunmuyor.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ilanlar.map((ilan) => (
              <div
                key={ilan.id}
                className="border bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <Link href={`/ilan/${ilan.id}`}>
                  <img
                    src={ilan.coverUrl || "/defaults/default.jpg"}
                    className="w-full h-40 object-cover"
                  />
                </Link>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{ilan.baslik}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{ilan.aciklama}</p>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-red-600 font-semibold text-sm">SÜRESİ DOLDU</span>

                    <button
                      onClick={() => startRenewOrder(ilan)}
                      className="bg-primary text-white text-sm px-3 py-1.5 rounded-md hover:bg-accent transition"
                    >
                      30 Gün / {PRICE} TL Yenile
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
