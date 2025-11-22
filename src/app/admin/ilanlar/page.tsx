"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  query,
  onSnapshot,
  updateDoc,
  doc,
  orderBy,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";

type Ilan = {
  id: string;
  baslik: string;
  il: string;
  ilce: string;
  kategori: string;
  altKategori?: string;
  status: "pending" | "approved" | "rejected" | string;
  ucret: number;
  olusturmaTarihi?: any;
  coverUrl?: string;
  ownerUid?: string;
  adminNote?: string;
  ilanNo?: string;
};

export default function AdminIlanlarPage() {
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Firestore'dan ilanları çek
  useEffect(() => {
    const q = query(collection(db, "ilanlar"), orderBy("olusturmaTarihi", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list: Ilan[] = snap.docs.map((d) => {
        const data = d.data() as Ilan;
        return { ...data, id: d.id };
      });
      setIlanlar(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 🔹 Görsel seçici
  const getDefaultCover = (kategori: string, altKategori?: string) => {
    const alt = (altKategori || "").toLowerCase();
    if (kategori.toLowerCase().includes("konaklama")) {
      if (alt.includes("villa")) return "/defaults/konaklama-villa.jpg";
      if (alt.includes("otel")) return "/defaults/konaklama-otel.jpg";
      if (alt.includes("bungalow")) return "/defaults/konaklama-bungalow.jpg";
      if (alt.includes("dağ") || alt.includes("yayla")) return "/defaults/konaklama-yayla.jpg";
      return "/defaults/konaklama-otel.jpg";
    }
    if (kategori.toLowerCase().includes("deneyim")) {
      if (alt.includes("tekne")) return "/defaults/deneyim-tekne.jpg";
      if (alt.includes("kamp")) return "/defaults/deneyim-kamp.jpg";
      if (alt.includes("yoga")) return "/defaults/deneyim-yoga.jpg";
      return "/defaults/deneyim-tekne.jpg";
    }
    if (kategori.toLowerCase().includes("tur")) {
      if (alt.includes("doğa")) return "/defaults/tur-doga.jpg";
      if (alt.includes("kültür")) return "/defaults/tur-kultur.jpg";
      return "/defaults/tur-kultur.jpg";
    }
    if (kategori.toLowerCase().includes("etkinlik")) {
      if (alt.includes("konser")) return "/defaults/etkinlik-konser.jpg";
      if (alt.includes("festival")) return "/defaults/etkinlik-festival.jpg";
      return "/defaults/etkinlik-festival.jpg";
    }
    return "/defaults/default.jpg";
  };

  // 🔹 Bildirim gönderici
  const notifyOwner = async (ownerUid: string | undefined, title: string, message: string) => {
    if (!ownerUid) return;
    await addDoc(collection(db, "notifications"), {
      toUserUid: ownerUid,
      title,
      message,
      type: "listing",
      read: false,
      createdAt: serverTimestamp(),
    });
  };

  // 🔹 Hızlı onay/red
  const handleQuickStatus = async (id: string, newStatus: "approved" | "rejected") => {
    try {
      const ref = doc(db, "ilanlar", id);
      const target = ilanlar.find((i) => i.id === id);
      await updateDoc(ref, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      await notifyOwner(
        target?.ownerUid,
        newStatus === "approved" ? "İlanınız onaylandı" : "İlanınız reddedildi",
        `${target?.baslik || "İlan"} ${
          newStatus === "approved" ? "onaylandı" : "reddedildi"
        }.`
      );
      alert(`✅ ${newStatus === "approved" ? "Onaylandı" : "Reddedildi"}`);
    } catch (e) {
      console.error(e);
      alert("❌ İşlem başarısız.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">📢 Tüm İlanlar</h1>
      </div>

      {loading ? (
        <p>Yükleniyor...</p>
      ) : ilanlar.length === 0 ? (
        <p>Henüz ilan bulunamadı.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl border shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left">Görsel</th>
                <th className="px-3 py-2 text-left">Başlık</th>
                <th className="px-3 py-2 text-left">Konum</th>
                <th className="px-3 py-2 text-left">Kategori</th>
                <th className="px-3 py-2 text-left">Durum</th>
                <th className="px-3 py-2 text-left">Fiyat</th>
                <th className="px-3 py-2 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {ilanlar.map((i) => {
                const thumb = i.coverUrl || getDefaultCover(i.kategori, i.altKategori);
                return (
                  <tr key={i.id} className="border-b hover:bg-gray-50 transition">
                    {/* Görsel */}
                    <td className="px-3 py-2">
                      <div className="w-20 h-14 rounded-lg overflow-hidden border bg-gray-100">
                        <Image
                          src={thumb}
                          alt="Kapak"
                          width={80}
                          height={56}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </td>

                    {/* Başlık */}
                    <td className="px-3 py-2 font-medium">
                      <Link
                        href={`/admin/ilanlar/${i.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {i.baslik}
                      </Link>
                    </td>

                    {/* Konum */}
                    <td className="px-3 py-2">
                      {i.il} / {i.ilce}
                    </td>

                    {/* Kategori */}
                    <td className="px-3 py-2">
                      {i.kategori} / {i.altKategori}
                    </td>

                    {/* Durum */}
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          i.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : i.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {i.status}
                      </span>
                    </td>

                    {/* Fiyat */}
                    <td className="px-3 py-2 text-blue-600 font-semibold">
                      {Number(i.ucret || 0).toLocaleString("tr-TR")} ₺
                    </td>

                    {/* İşlemler */}
                    <td className="px-3 py-2 text-right space-x-2">
                      <button
                        onClick={() => handleQuickStatus(i.id, "approved")}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Onayla
                      </button>
                      <button
                        onClick={() => handleQuickStatus(i.id, "rejected")}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Reddet
                      </button>
                      <Link
                        href={`/admin/ilanlar/${i.id}`}
                        className="border px-3 py-1 rounded hover:bg-gray-50"
                      >
                        İncele
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
