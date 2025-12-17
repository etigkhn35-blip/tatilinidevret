"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  addDoc,
  collection,
} from "firebase/firestore";

/* ------------------ Alt kategoriye göre görsel eşleştirme ------------------ */
const getDefaultCover = (kategori: string, altKategori?: string) => {
  const normalize = (str: string) =>
    (str || "")
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .trim();

  const k = normalize(kategori);
  const a = normalize(altKategori || "");

  // 🔹 Konaklama
  if (k.includes("konaklama")) {
    if (a.includes("villa")) return "/defaults/konaklama-villa.jpg";
    if (a.includes("otel")) return "/defaults/konaklama-otel.jpg";
    if (a.includes("bungalow")) return "/defaults/konaklama-bungalow.jpg";
    if (a.includes("tatil") && a.includes("koyu"))
      return "/defaults/konaklama-tatilkoyu.jpg";
    if (a.includes("yayla") || a.includes("dag"))
      return "/defaults/konaklama-yayla.jpg";
    return "/defaults/konaklama-apart.jpg";
  }

  // 🔹 Deneyim Tatilleri
  if (k.includes("deneyim")) {
    if (a.includes("spa")) return "/defaults/deneyim-spa.jpg";
    if (a.includes("kamp")) return "/defaults/deneyim-kamp.jpg";
    if (a.includes("tekne") || a.includes("yat"))
      return "/defaults/deneyim-tekne.jpg";
    if (a.includes("yoga")) return "/defaults/deneyim-yoga.jpg";
    if (a.includes("gastro")) return "/defaults/deneyim-gastronomi.jpg";
    return "/defaults/deneyim-genel.jpg";
  }

  // 🔹 Turlar
  if (k.includes("tur")) {
    if (a.includes("doga")) return "/defaults/tur-doga.jpg";
    if (a.includes("balayi")) return "/defaults/tur-balayi.jpg";
    if (a.includes("gunubirlik")) return "/defaults/tur-gunubirlik.jpg";
    if (a.includes("karadeniz") || a.includes("gap"))
      return "/defaults/tur-karadeniz-gap.jpg";
    return "/defaults/tur-genel.jpg";
  }

  // 🔹 Etkinlik Paketleri
  if (k.includes("etkinlik")) {
    if (a.includes("konser")) return "/defaults/etkinlik-konser.jpg";
    if (a.includes("festival")) return "/defaults/etkinlik-festival.jpg";
    if (a.includes("spor")) return "/defaults/etkinlik-spor.jpg";
    if (a.includes("kultur") || a.includes("sanat"))
      return "/defaults/etkinlik-kultur.jpg";
    return "/defaults/etkinlik-workshop.jpg";
  }

  // 🔹 Fallback
  return "/defaults/default.jpg";
};

export default function AdminIlanDetayPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ilan, setIlan] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [evrakOk, setEvrakOk] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [showEvrakModal, setShowEvrakModal] = useState(false);

  /* ------------------------------- Veriyi çek ------------------------------- */
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const ilanRef = doc(db, "ilanlar", id as string);
      const snap = await getDoc(ilanRef);
      if (!snap.exists()) {
        setLoading(false);
        return;
      }

      const data = snap.data();
      // Eğer coverUrl yanlışsa veya eksikse otomatik düzelt
      if (!data.coverUrl || data.coverUrl.includes("defaults/defaults.jpg")) {
        data.coverUrl = getDefaultCover(data.kategori, data.altKategori);
      }

      setIlan(data);

      // Satıcı bilgisi
      if (data?.sahipUid) {
        const userRef = doc(db, "users", data.sahipUid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) setUser(userSnap.data());
      }

      setEvrakOk(Boolean(data?.evrakOk));
      setAdminNote(data?.adminNote || "");
      setLoading(false);
    };
    fetchData();
  }, [id]);

  /* ------------------------ Onay / Red işlemleri ------------------------ */
  const handleStatusChange = async (status: "approved" | "rejected") => {
    if (!ilan) return;

    await updateDoc(doc(db, "ilanlar", id as string), {
      status,
      evrakOk,
      adminNote: adminNote || null,
      updatedAt: serverTimestamp(),
    });

    await addDoc(collection(db, "notifications"), {
      toUserUid: ilan.sahipUid,
      title: status === "approved" ? "İlanınız onaylandı" : "İlanınız reddedildi",
      message:
        status === "approved"
          ? `“${ilan.baslik}” ilanınız onaylandı.`
          : `“${ilan.baslik}” ilanınız reddedildi.`,
      type: "listing",
      read: false,
      createdAt: serverTimestamp(),
      ilanId: id,
    });

    alert(`✅ İlan ${status === "approved" ? "onaylandı" : "reddedildi"}.`);
    router.push("/admin/ilanlar");
  };

  if (loading) return <p className="p-6 text-gray-500">Yükleniyor…</p>;
  if (!ilan) return <p className="p-6 text-red-500">İlan bulunamadı.</p>;

  const kapak = ilan.coverUrl || getDefaultCover(ilan.kategori, ilan.altKategori);
  const evrak = ilan.pdfUrl || null;

  /* ---------------------------------- UI ---------------------------------- */
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6 space-y-6">
        {/* Başlık + Görsel */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{ilan.baslik}</h1>
            <p>
              <b>İlan No:</b> {ilan.ilanNo || "—"}
            </p>
            <p>
              <b>Durum:</b>{" "}
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  ilan.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : ilan.status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {ilan.status || "pending"}
              </span>
            </p>
            <p>
              <b>Oluşturulma:</b>{" "}
              {ilan.olusturmaTarihi?.toDate
                ? new Date(ilan.olusturmaTarihi.toDate()).toLocaleString("tr-TR")
                : "—"}
            </p>
          </div>

          {/* 🔹 Görsel Alanı */}
          <div className="w-full md:w-64 h-44 rounded-lg overflow-hidden border relative bg-gray-100">
            {kapak && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={kapak}
                src={kapak}
                alt="Kapak"
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/defaults/default.jpg";
                }}
              />
            )}
          </div>
        </div>

        {/* İlan Bilgileri */}
        <div className="bg-gray-50 border rounded-lg p-4">
          <h3 className="font-semibold mb-2">📋 İlan Bilgileri</h3>
          <p>
            <b>Kategori:</b> {ilan.kategori} / {ilan.altKategori}
          </p>
          <p>
            <b>Konum:</b> {ilan.il} / {ilan.ilce} / {ilan.mahalle}
          </p>
          <p>
            <b>Fiyat:</b> {Number(ilan.ucret || 0).toLocaleString("tr-TR")} ₺
          </p>
          <p>
            <b>Tarih:</b> {ilan.girisTarihi} - {ilan.cikisTarihi}
          </p>
          <p>
            <b>Kişi Sayısı:</b> {ilan.yetiskinSayisi} yetişkin, {ilan.cocukSayisi} çocuk
          </p>
          <p className="mt-2 text-gray-700">
            <b>Açıklama:</b> {ilan.aciklama}
          </p>
        </div>

        {/* Evrak Kontrolü */}
        <div className="bg-gray-50 border rounded-lg p-4">
          <h3 className="font-semibold mb-2">📑 Evrak Kontrolü</h3>
          {evrak ? (
            <div className="flex gap-3 items-center">
              <button
                onClick={() => setShowEvrakModal(true)}
                className="text-blue-600 underline"
              >
                Görüntüle
              </button>
              <a
                href={evrak}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 underline"
              >
                İndir
              </a>
            </div>
          ) : (
            <p className="text-gray-500">Evrak yüklenmemiş.</p>
          )}
          <label className="flex items-center gap-2 mt-3">
            <input
              type="checkbox"
              checked={evrakOk}
              onChange={(e) => setEvrakOk(e.target.checked)}
            />
            <span>Evrak kontrol edildi ve geçerli</span>
          </label>
        </div>

        {/* Satıcı Bilgileri */}
        <div className="bg-gray-50 border rounded-lg p-4">
          <h3 className="font-semibold mb-2">🧾 Satıcı Bilgileri</h3>
          {user ? (
            <>
              <p>
                <b>Ad Soyad:</b> {user.adSoyad}
              </p>
              <p>
                <b>E-posta:</b> {user.email}
              </p>
              <p>
                <b>Telefon:</b> {user.telefon || "—"}
              </p>
            </>
          ) : (
            <p className="text-gray-500">Satıcı bilgisi bulunamadı.</p>
          )}
        </div>

        {/* Admin Notu ve İşlemler */}
        <div className="border-t pt-4 space-y-3">
          <label className="font-semibold text-sm">Admin Notu</label>
          <textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="Not yazın…"
            className="w-full border rounded-lg p-3 min-h-[100px]"
          />
          <div className="flex gap-3">
            <button
              onClick={() => handleStatusChange("approved")}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg"
            >
              Onayla
            </button>
            <button
              onClick={() => handleStatusChange("rejected")}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg"
            >
              Reddet
            </button>
          </div>
        </div>

        <div className="pt-3 text-right">
          <button
            onClick={() => router.push("/admin/ilanlar")}
            className="text-blue-600 underline text-sm"
          >
            ← Listeye Dön
          </button>
        </div>
      </div>

      {/* Evrak Modal */}
      {showEvrakModal && evrak && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-lg w-full max-w-4xl p-4 relative">
            <button
              onClick={() => setShowEvrakModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-red-600 text-lg"
            >
              ✕
            </button>
            <iframe
              src={evrak}
              className="w-full h-[80vh] rounded-lg border"
            ></iframe>
          </div>
        </div>
      )}
    </main>
  );
}
