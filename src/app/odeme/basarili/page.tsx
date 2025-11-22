"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { CheckCircle } from "lucide-react";

export default function OdemeBasariliPage() {
  const searchParams = useSearchParams();
  const ilanId = searchParams.get("ilanId");

  const [loading, setLoading] = useState(true);
  const [ilan, setIlan] = useState<any>(null);

  useEffect(() => {
    const fetchIlan = async () => {
      if (!ilanId) return;
      const ref = doc(db, "ilanlar", ilanId);
      const snap = await getDoc(ref);
      if (snap.exists()) setIlan(snap.data());
      setLoading(false);
    };
    fetchIlan();
  }, [ilanId]);

  if (!ilanId)
    return (
      <main className="min-h-screen flex items-center justify-center text-center p-8">
        <p className="text-red-600 text-lg font-semibold">
          Geçersiz işlem: ilanId bulunamadı.
        </p>
      </main>
    );

  if (loading)
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-500">
        Bilgiler yükleniyor...
      </main>
    );

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
        <h1 className="text-2xl font-bold text-gray-900 mt-4">
          Ödeme Başarılı 🎉
        </h1>

        <p className="text-gray-600 mt-3">
          <b>{ilan.baslik}</b> başlıklı ilanınızın süresi başarıyla uzatıldı.
        </p>

        {ilan.bitisTarihi && (
          <p className="text-sm text-gray-500 mt-2">
            Yeni bitiş tarihi:{" "}
            <b>{new Date(ilan.bitisTarihi.toDate()).toLocaleDateString("tr-TR")}</b>
          </p>
        )}

        <div className="mt-6 space-y-3">
          <Link
            href={`/ilan/${ilanId}`}
            className="block w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary/90 transition"
          >
            İlanı Görüntüle
          </Link>

          <Link
            href="/hesabim/ilanlarim"
            className="block w-full border py-2 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            Diğer İlanlarım
          </Link>

          <Link
            href="/ilan-ver"
            className="block w-full border py-2 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            Yeni İlan Ver
          </Link>

          <Link
            href="/"
            className="block w-full text-gray-600 text-sm hover:underline"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </main>
  );
}
