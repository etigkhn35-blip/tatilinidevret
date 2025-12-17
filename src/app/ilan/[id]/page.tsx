"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { addFavorite, removeFavorite, isFavorited } from "@/lib/favorites";
import { db, auth } from "@/lib/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";


type Ilan = {
  id: string;
  ilanNo?: string;
  baslik?: string;
  aciklama?: string;
  kategori?: string;
  altKategori?: string;
  il?: string;
  ilce?: string;
  mahalle?: string;
  girisTarihi?: string;
  cikisTarihi?: string;
  geceSayisi?: number;
  yetiskinSayisi?: number;
  cocukSayisi?: number;
  ucret?: number;
  adSoyad?: string;
  sahipUid?: string;
  sahipEmail?: string;
  sahipTel?: string;
  status?: string;
  coverUrl?: string;
  pdfUrl?: string;
  odaTipi?: string;
  pansiyonTipi?: string;
  donanimlar?: Record<string, boolean>;
  kvkkOnay?: boolean;
  ozelAlanlar?: Record<string, string | number | boolean | null | undefined>;
};

const defaultImage = "/defaults/default.jpg";

export default function IlanDetayPage() {
  const { id } = useParams();
  const router = useRouter();

  const [user] = useAuthState(auth);
  const [ilan, setIlan] = useState<Ilan | null>(null);
  const [loading, setLoading] = useState(true);

  const [isFav, setIsFav] = useState(false);
  const [favCount, setFavCount] = useState(0);
  const [favLoading, setFavLoading] = useState(false);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const [ilanSahibi, setIlanSahibi] = useState<any>(null);
  const isAdmin =
  user?.email === "info@tatilinidevret.com" ||
  ilanSahibi?.role === "admin";

  /* 🔹 İlan verisini çek */
  useEffect(() => {
    const fetchIlan = async () => {
      if (!id) return;
      try {
        const ref = doc(db, "ilanlar", String(id));
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setIlan(null);
          return;
        }

        const data = snap.data() as Ilan;

        // kapak yoksa default yaz
        if (!data.coverUrl) {
          await setDoc(ref, { coverUrl: defaultImage }, { merge: true });
          data.coverUrl = defaultImage;
        }

        setIlan({ ...data, id: snap.id });
      } catch (err) {
        console.error("İlan alınamadı:", err);
        setIlan(null);
      } finally {
        setLoading(false);
      }
    };

    fetchIlan();
  }, [id]);

  /* 🔹 İlan sahibini çek */
  useEffect(() => {
    const fetchOwner = async () => {
      if (!ilan?.sahipUid) return;

      try {
        const userRef = doc(db, "users", ilan.sahipUid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) setIlanSahibi(userSnap.data());
      } catch (err) {
        console.error("Kullanıcı bilgisi alınamadı:", err);
      }
    };

    fetchOwner();
  }, [ilan?.sahipUid]);

  /* 🔹 Favori kontrolü */
  useEffect(() => {
  const checkFavorite = async () => {
    if (!user || !id) {
      setIsFav(false);
      setFavCount(0);
      return;
    }

    try {
      const favRef = doc(db, "favoriler", user.uid, "items", String(id));
      const favSnap = await getDoc(favRef);
      setIsFav(favSnap.exists());

      const favsSnap = await getDocs(
        collection(db, "favoriler", user.uid, "items")
      );
      setFavCount(favsSnap.size);
    } catch (err) {
      console.error("Favori durumu okunamadı:", err);
    }
  };

  checkFavorite();
}, [id, user]);

  /* 🔹 Favoriye ekle / çıkar */
  const toggleFavorite = async () => {
  if (!user) {
    alert("Favorilere eklemek için giriş yapın.");
    return router.push("/giris");
  }

  if (!id || !ilan) return;

  setFavLoading(true);

  const favRef = doc(db, "favoriler", user.uid, "items", String(id));

  try {
    if (isFav) {
      await deleteDoc(favRef);
      setIsFav(false);
      setFavCount((c) => Math.max(0, c - 1));
    } else {
      await setDoc(favRef, {
        ilanId: id,
        baslik: ilan.baslik || "-",
        coverUrl: ilan.coverUrl || defaultImage,
        fiyat: ilan.ucret || 0,
        createdAt: serverTimestamp(),
      });
      setIsFav(true);
      setFavCount((c) => c + 1);
    }
  } catch (err) {
    console.error("Favori hatası:", err);
    alert("Favori işlemi sırasında bir hata oluştu.");
  } finally {
    setFavLoading(false);
  }
};


  /* 🔹 İlan bildir */
const handleReport = async () => {
  if (!user) {
    alert("⚠️ Bildirmek için giriş yapın.");
    return router.push("/giris");
  }

  if (!reportReason.trim()) {
    alert("⚠️ Bir neden seçin.");
    return;
  }

  try {
    // 1️⃣ raporu kaydet
    await addDoc(collection(db, "reports"), {
      ilanId: id,
      ilanBaslik: ilan?.baslik,
      userUid: user.uid,
      userEmail: user.email,
      reason: reportReason,
      createdAt: serverTimestamp(),
      status: "beklemede",
    });

    // 2️⃣ adminleri çek (doğru yöntem)
    const adminQuery = query(collection(db, "users"), where("role", "==", "admin"));
    const adminSnap = await getDocs(adminQuery);

    // 3️⃣ adminlere bildirim gönder
    
    for (const admin of adminSnap.docs) {
      await addDoc(collection(db, "users", admin.id, "notifications"), { 
        type: "report",
        title: "🚨 Yeni İlan Bildirimi",
        text: `Bir kullanıcı "${ilan?.baslik}" ilanını bildirdi.`,
        link: `/admin/reports/${id}`,
        seen: false,
        createdAt: serverTimestamp(),
      });
    }

    alert("✔️ Bildiriminiz alındı, yönetim ekibine iletildi.");
    setShowReportModal(false);
    setReportReason("");

  } catch (err) {
    console.error("🔥 İlan bildir hatası:", err);
    alert("❌ Bildirim gönderilemedi. Tekrar deneyin.");
  }
};

  if (loading) return <p className="text-center py-10">Yükleniyor...</p>;
  if (!ilan) return <p className="text-center py-10">İlan bulunamadı.</p>;

  const aktifDonanimlar = ilan.donanimlar
    ? Object.keys(ilan.donanimlar).filter((k) => ilan.donanimlar?.[k])
    : [];

  return (
    <main className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-[1100px] mx-auto bg-white rounded-xl shadow">
        {/* Üst Başlık */}
        <div className="p-5 border-b flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-1">
              {ilan.baslik}
            </h1>
            <p className="text-sm text-gray-500">
              {ilan.il} / {ilan.ilce} / {ilan.mahalle}
            </p>
          </div>

          <div className="flex gap-3 mt-3 md:mt-0">
            <button
              onClick={toggleFavorite}
              disabled={favLoading}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                isFav
                  ? "bg-red-100 text-red-600 border border-red-300"
                  : "bg-yellow-100 text-yellow-700 border border-yellow-300"
              }`}
            >
              {isFav ? "💔 Favorilerden Çıkar" : "⭐ Favorilere Ekle"} (
              {favCount})
            </button>

            <button
              onClick={() => setShowReportModal(true)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border hover:bg-gray-200 text-sm"
            >
              🚩 İlanı Bildir
            </button>
          </div>
        </div>

        {/* İçerik */}
        <div className="grid lg:grid-cols-[2fr_1fr] gap-6 p-6">
          {/* Sol Alan */}
          <div>
            <div className="rounded-xl overflow-hidden border mb-5">
              <img
                src={ilan.coverUrl || defaultImage}
                alt="İlan görseli"
                className="w-full h-[420px] object-cover"
              />
            </div>

            {/* İlan Bilgileri */}
            <div className="border rounded-xl bg-gray-50 p-4 mb-4">
              <h2 className="font-semibold text-gray-700 mb-2">
                📋 İlan Bilgileri
              </h2>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  <b>İlan No:</b> {ilan.ilanNo}
                </li>
                <li>
                  <b>Kategori:</b> {ilan.kategori} / {ilan.altKategori}
                </li>
                <li>
                  <b>Durum:</b> {ilan.status}
                </li>
                <li>
                  <b>Tarih:</b> {ilan.girisTarihi} - {ilan.cikisTarihi}
                </li>
                <li>
                  <b>Gece Sayısı:</b> {ilan.geceSayisi}
                </li>
                <li>
                  <b>Kişi Sayısı:</b> {ilan.yetiskinSayisi} Yetişkin,{" "}
                  {ilan.cocukSayisi} Çocuk
                </li>
                <li>
                  <b>Konum:</b> {ilan.il}, {ilan.ilce}, {ilan.mahalle}
                </li>
                {isAdmin && ilan.pdfUrl && (
                  <li>
                    <b>Rezervasyon Belgesi:</b>{" "}
                    <a
                      href={ilan.pdfUrl}
                      target="_blank"
                      className="text-blue-600 underline"
                    >
                      Görüntüle
                    </a>
                  </li>
                )}
              </ul>
            </div>

            {/* Kategoriye Özel Bilgiler */}
            {ilan.ozelAlanlar &&
              Object.keys(ilan.ozelAlanlar || {}).length > 0 && (
                <section className="mt-6 p-4 border rounded-xl bg-gray-50">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">
                    Kategoriye Özel Bilgiler
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(ilan.ozelAlanlar).map(([label, value]) => (
                      <div key={label} className="text-sm">
                        <span className="font-medium text-gray-700">
                          {label}:{" "}
                        </span>
                        <span className="text-gray-900">
                          {value?.toString() || "-"}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            {/* İlan Detayları */}
            {(ilan.pansiyonTipi ||
              ilan.odaTipi ||
              aktifDonanimlar.length > 0) && (
              <div className="border rounded-xl bg-gray-50 p-4 mt-4">
                <h2 className="font-semibold text-gray-700 mb-3">
                  🏨 İlan Detayları
                </h2>
                {ilan.pansiyonTipi && (
                  <p className="text-sm mb-1">
                    <b>Pansiyon Tipi:</b> {ilan.pansiyonTipi}
                  </p>
                )}
                {ilan.odaTipi && (
                  <p className="text-sm mb-1">
                    <b>Oda Tipi:</b> {ilan.odaTipi}
                  </p>
                )}
                {aktifDonanimlar.length > 0 && (
                  <div className="mt-2">
                    <b>Donanımlar:</b>
                    <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                      {aktifDonanimlar.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Açıklama */}
            {ilan.aciklama && (
              <div className="border rounded-xl p-4 mt-4">
                <h2 className="font-semibold text-gray-700 mb-2">📝 Açıklama</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {ilan.aciklama}
                </p>
              </div>
            )}
          </div>

          {/* Sağ Alan */}
          <aside className="border rounded-xl p-4 bg-gray-50 shadow-sm">
            <div className="text-center mb-3">
              <h3 className="font-bold text-2xl text-blue-600 mb-1">
                {ilan.ucret?.toLocaleString("tr-TR")} ₺
              </h3>
              <p className="text-sm text-gray-500">
                İlan Sahibi:{" "}
                <b>{ilan.adSoyad || ilan.sahipEmail?.split("@")[0]}</b>
              </p>
            </div>

            {ilanSahibi?.phone ? (
              <p className="text-sm text-gray-700 text-center mb-3">
                📞 Telefon: <b>{ilanSahibi.phone}</b>
              </p>
            ) : (
              <p className="text-xs text-center text-red-600 mb-3">
                📵 İlan sahibine ait telefon bilgisi bulunamadı.
              </p>
            )}

            <button
              onClick={async () => {
                if (!user) {
                  alert("Mesaj göndermek için giriş yapın.");
                  router.push("/giris");
                  return;
                }
                if (!ilan?.sahipUid) {
                  alert("İlan sahibine ulaşılamadı.");
                  return;
                }

                const msgRef = collection(db, "messages");
                const allChats = await getDocs(msgRef);
                let existingChatId: string | null = null;

                allChats.forEach((d) => {
                  const data = d.data();
                  if (
                    Array.isArray(data.participants) &&
                    data.participants.includes(user.uid) &&
                    data.participants.includes(ilan.sahipUid!)
                  ) {
                    existingChatId = d.id;
                  }
                });

                let chatId: string | undefined = existingChatId || undefined;
                if (!chatId) {
                  const newChat = await addDoc(collection(db, "messages"), {
                    participants: [user.uid, ilan.sahipUid],
                    ilanBaslik: ilan.baslik,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                  });
                  chatId = newChat.id as string;
                }

                router.push(`/hesabim/mesajlar?chat=${chatId}`);
              }}
              className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              💬 Mesaj Gönder
            </button>
          </aside>
        </div>
      </div>

      {/* 🚩 İlan Bildir Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-lg">
            <h2 className="text-lg font-semibold mb-3">İlanı Bildir</h2>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-4"
            >
              <option value="">Bir neden seçin</option>
              <option value="spam">Spam / Sahte ilan</option>
              <option value="price">Fiyat yanlış</option>
              <option value="misleading">Yanıltıcı bilgi</option>
              <option value="other">Diğer</option>
            </select>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-600"
              >
                İptal
              </button>
              <button
                onClick={handleReport}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Gönder
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
