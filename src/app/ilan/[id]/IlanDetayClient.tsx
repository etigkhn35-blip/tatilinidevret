"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";

type Props = { id: string };

export default function IlanDetayClient({ id }: Props) {
  const [ilan, setIlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Kategori/alt kategoriye göre otomatik kapak
  const gorselHaritasi: Record<string, string> = {
    // KONAKLAMA
    Otel: "/defaults/konaklama-otel.jpg",
    Villa: "/defaults/konaklama-villa.jpg",
    "Airbnb & Bungalow": "/defaults/konaklama-bungalow.jpg",
    Apart: "/defaults/konaklama-apart.jpg",
    "Tatil Köyü": "/defaults/konaklama-tatilkoyu.jpg",
    "Dağ & Yayla": "/defaults/konaklama-yayla.jpg",

    // DENEYİM
    Kamp: "/defaults/deneyim-kamp.jpg",
    Yoga: "/defaults/deneyim-yoga.jpg",
    Spa: "/defaults/deneyim-spa.jpg",
    Tekne: "/defaults/deneyim-tekne.jpg",
    Yat: "/defaults/deneyim-tekne.jpg",
    Gemi: "/defaults/deneyim-gemi.jpg",
    Gastronomi: "/defaults/deneyim-gastronomi.jpg",

    // TURLAR
    Kültür: "/defaults/tur-kultur.jpg",
    Doğa: "/defaults/tur-doga.jpg",
    Kayak: "/defaults/tur-kayak.jpg",
    Balayı: "/defaults/tur-balayi.jpg",
    Karadeniz: "/defaults/tur-karadeniz-gap.jpg",
    GAP: "/defaults/tur-karadeniz-gap.jpg",
    Günübirlik: "/defaults/tur-gunubirlik.jpg",

    // ETKİNLİKLER
    Konser: "/defaults/etkinlik-konser.jpg",
    Festival: "/defaults/etkinlik-festival.jpg",
    Spor: "/defaults/etkinlik-spor.jpg",
    "Kültür & Sanat": "/defaults/etkinlik-kultur.jpg",
    Workshop: "/defaults/etkinlik-workshop.jpg",

    Varsayilan: "/defaults/konaklama-otel.jpg",
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const ref = doc(db, "ilanlar", id);
        const snap = await getDoc(ref);
        if (snap.exists()) setIlan({ id: snap.id, ...snap.data() });
      } catch (e) {
        console.error("İlan detay hatası:", e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Yükleniyor...</div>;
  if (!ilan) return <div className="p-10 text-center">İlan bulunamadı.</div>;

  const kapak =
    ilan.gorselURL ||
    gorselHaritasi[ilan.altKategori] ||
    gorselHaritasi[ilan.kategori] ||
    gorselHaritasi["Varsayilan"];

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Kapak görseli */}
      <div className="relative w-full h-[400px] mb-6">
        <Image
          src={kapak}
          alt={ilan.baslik || "Tatil İlanı"}
          fill
          className="object-cover rounded-2xl shadow-md"
          priority
        />
      </div>

      {/* Başlık ve açıklamalar */}
      <h1 className="text-3xl font-bold mb-2">{ilan.baslik}</h1>
      <p className="text-gray-500 mb-4">Kod: {ilan.kod || id}</p>
      <p className="text-lg mb-4">{ilan.aciklama}</p>

      {/* Fiyat ve aksiyonlar */}
      <div className="flex justify-between items-center border-t border-gray-200 pt-4 mt-4">
        <div>
          <p className="font-semibold text-xl text-blue-600">
            {ilan.fiyat} TL
          </p>
          <p className="text-sm text-gray-400">
            {ilan.kategori} • {ilan.altKategori} • {ilan.konum}
          </p>
        </div>

        <div className="flex gap-2">
          <Link href={`/mesaj/${ilan.id}`}>
            <Button variant="default">Mesaj Gönder</Button>
          </Link>
          
        </div>
      </div>
    </div>
  );
}
