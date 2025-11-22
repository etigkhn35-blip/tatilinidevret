"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";

export default function IlanUzatmaOdemePage() {
  const { id } = useParams();
  const router = useRouter();

  const [ilan, setIlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchListing = async () => {
      try {
        const ref = doc(db, "ilanlar", id as string);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setIlan({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error("İlan bilgisi alınamadı", err);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

 const handlePay = async () => {
  const res = await fetch("/api/paytr-init", {
    method: "POST",
    body: JSON.stringify({
      ilanId: ilan.id,
      userId: ilan.sahipUid,
      email: ilan.sahipEmail,
      amount: 349.9
    })
  });

  const json = await res.json();
  if (!json.ok) return alert("Ödeme başlatılamadı!");

  const params = new URLSearchParams({
    data: JSON.stringify(json.postData),
    url: json.redirectUrl
  });

  router.push(`/odeme/paytr?${params.toString()}`);
};

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-6">
        ⏳ İlan Süresi Uzatma
      </h1>

      <div className="bg-white shadow-sm rounded-lg p-5 border mb-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{ilan.baslik}</h2>
        <p className="text-gray-600 text-sm mb-1">
          📍 {ilan.il || "-"} / {ilan.ilce || "-"}
        </p>
        <p className="text-red-600 text-sm font-medium">
          İlan süresi doldu. Yayın devamı için süre uzatmanız gerekiyor.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-700 mb-1">
          📌 Uzatma Paketi
        </h3>
        <p className="text-sm text-blue-800">
          30 gün boyunca yeniden yayında olsun.
        </p>
        <div className="text-3xl font-bold text-blue-700 mt-3">
          349,90 TL
        </div>
      </div>

      <button
        onClick={handlePay}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 transition text-white font-semibold text-lg rounded-lg shadow"
      >
        💳 Ödemeye Geç & Yenile
      </button>

      <p className="text-center text-xs text-gray-500 mt-4">
        Güvenli ödeme • SSL korumalı • Türkiye Finansal Lisans
      </p>

      <div className="text-center mt-6">
        <Link href={`/ilan/${id}`} className="text-sm text-gray-600 hover:underline">
          ← İlan sayfasına dön
        </Link>
      </div>
    </main>
  );
}
