"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import defaultImages from "@/data/defaultImages";

/* --------------------------- Types --------------------------- */
type Ilan = {
  id: string;
  baslik: string;
  aciklama?: string;
  kategori: string;
  altKategori?: string;
  il?: string;
  ilce?: string;
  ucret?: number;
  coverUrl?: string | null;
  girisTarihi?: string;
  cikisTarihi?: string;
  status?: "approved" | "pending" | "rejected";
  oneCikar?: boolean;
  vitrin?: boolean;
  kalinYazi?: boolean;
};

/* ------------------------ Helpers ------------------------ */
const formatTRY = (v?: number) =>
  typeof v === "number" ? v.toLocaleString("tr-TR") + " ₺" : "—";

function pickDefaultImage(kategori?: string, altKategori?: string) {
  if (!kategori) return "/defaults/fallback.jpg";
  const catMap: any = (defaultImages as any)[kategori] || {};
  return (
    (altKategori && catMap[altKategori]) ||
    catMap.__default ||
    "/defaults/fallback.jpg"
  );
}

function dateRange(g?: string, c?: string) {
  if (!g || !c) return "";
  try {
    const gi = new Date(g);
    const ci = new Date(c);
    const fmt = (d: Date) =>
      d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
    return `${fmt(gi)} – ${fmt(ci)}`;
  } catch {
    return "";
  }
}

/* ------------------------ CLIENT PAGE CONTENT ------------------------ */
export default function SearchResultsContent() {
  const sp = useSearchParams();
  const router = useRouter();

  // URL’den filtreler
  const keyword = (sp.get("q") || sp.get("keyword") || "").trim();
  const kategori = sp.get("kategori") || sp.get("category") || "";
  const altKategori = sp.get("altKategori") || sp.get("subCategory") || "";
  const il = sp.get("il") || "";
  const ilce = sp.get("ilce") || "";
  const minPrice = sp.get("minPrice") ? Number(sp.get("minPrice")) : undefined;
  const maxPrice = sp.get("maxPrice") ? Number(sp.get("maxPrice")) : undefined;
  const checkIn = sp.get("girisTarihi") || sp.get("checkIn") || "";
  const checkOut = sp.get("cikisTarihi") || sp.get("checkOut") || "";

  const [items, setItems] = useState<Ilan[]>([]);
  const [loading, setLoading] = useState(true);

  // Firestore’dan çekme
  useEffect(() => {
    let qRef: any = query(
      collection(db, "ilanlar"),
      where("status", "==", "approved"),
      orderBy("olusturmaTarihi", "desc"),
      limit(60)
    );

    const run = async () => {
      setLoading(true);
      const snap = await getDocs(qRef);
      const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Ilan[];
      setItems(all);
      setLoading(false);
    };

    run().catch(() => setLoading(false));
  }, []);

  // İleri seviye filtreler
  const filtered = useMemo(() => {
    return items
      .filter((it) => (kategori ? it.kategori === kategori : true))
      .filter((it) => (altKategori ? it.altKategori === altKategori : true))
      .filter((it) => (il ? it.il === il : true))
      .filter((it) => (ilce ? it.ilce === ilce : true))
      .filter((it) =>
        typeof minPrice === "number" ? (it.ucret || 0) >= minPrice : true
      )
      .filter((it) =>
        typeof maxPrice === "number" ? (it.ucret || 0) <= maxPrice : true
      )
      .filter((it) => {
  if (!keyword) return true;

  const k = keyword.toLowerCase();

  return (
    (it.baslik || "").toLowerCase().includes(k) ||
    (it.aciklama || "").toLowerCase().includes(k) ||
    (it.kategori || "").toLowerCase().includes(k) ||
    (it.altKategori || "").toLowerCase().includes(k) ||
    (it.il || "").toLowerCase().includes(k) ||
    (it.ilce || "").toLowerCase().includes(k)
  );
})
      .filter((it) => {
        if (!checkIn || !checkOut) return true;
        if (!it.girisTarihi || !it.cikisTarihi) return true;
        const gi = new Date(it.girisTarihi).getTime();
        const ci = new Date(it.cikisTarihi).getTime();
        const f1 = new Date(checkIn).getTime();
        const f2 = new Date(checkOut).getTime();
        return gi <= f2 && ci >= f1;
      });
  }, [
    items,
    kategori,
    altKategori,
    il,
    ilce,
    minPrice,
    maxPrice,
    keyword,
    checkIn,
    checkOut,
  ]);

  const headerTitle = useMemo(() => {
    const parts: string[] = [];
    if (kategori) parts.push(kategori);
    if (altKategori) parts.push(altKategori);
    if (il) parts.push(il);
    if (ilce) parts.push(ilce);
    if (keyword) parts.push(`“${keyword}”`);
    return parts.length ? parts.join(" • ") : "Tüm İlanlar";
  }, [kategori, altKategori, il, ilce, keyword]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {/* Üst kısım */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{headerTitle}</h1>
            <p className="text-sm text-gray-500">
              {loading
                ? "İlanlar yükleniyor…"
                : `${filtered.length} sonuç listeleniyor`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/detayli-arama")}
              className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50"
            >
              Filtreleri Düzenle
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
            >
              Yeni Arama
            </button>
          </div>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="border rounded-xl overflow-hidden bg-white animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border rounded-xl p-8 text-center text-gray-600">
            Kriterlere uygun ilan bulunamadı.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((it) => {
              const img = it.coverUrl || pickDefaultImage(it.kategori, it.altKategori);

              return (
                <div
                  key={it.id}
                  className="group border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition"
                >
                  <Link href={`/ilan/${it.id}`}>
                    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                      <img
                        src={img}
                        alt={it.baslik}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      {it.oneCikar && (
                        <span className="absolute top-2 left-2 text-[11px] px-2 py-1 rounded-full bg-amber-500 text-white shadow">
                          Öne Çıkan
                        </span>
                      )}
                      {it.vitrin && (
                        <span className="absolute top-2 right-2 text-[11px] px-2 py-1 rounded-full bg-indigo-600 text-white shadow">
                          Vitrin
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="p-4">
                    <div className="text-xs text-gray-500 flex items-center justify-between">
                      <span>
                        {it.il || "—"} {it.ilce ? `• ${it.ilce}` : ""}
                      </span>
                      <span className="text-gray-400">
                        {dateRange(it.girisTarihi, it.cikisTarihi)}
                      </span>
                    </div>

                    <Link href={`/ilan/${it.id}`}>
                      <div
                        className={`mt-1 line-clamp-1 ${
                          it.kalinYazi ? "font-extrabold" : "font-semibold"
                        } text-gray-900`}
                        title={it.baslik}
                      >
                        {it.baslik}
                      </div>
                    </Link>

                    <div className="mt-1 text-primary font-bold">
                      {formatTRY(it.ucret)}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <Link
                        href={`/mesajlar/yeni?ilanId=${it.id}`}
                        className="flex-1 text-center px-3 py-2 rounded-lg border hover:bg-gray-50 text-sm"
                      >
                        Mesaj Gönder
                      </Link>
                      
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
