"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  limit as qlimit,
  serverTimestamp,
  doc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";

type Teklif = {
  id: string;
  ilanId: string;
  ilanBaslik: string;
  teklifTutar?: string;
  teklifTutarNumber?: number;
  teklifVerenUid: string;
  teklifVerenAd?: string;
  teklifVerenEmail?: string | null;
  teklifSahipUid?: string | null;
  durum?: "pending" | "accepted" | "rejected" | "canceled";
  olusturmaTarihi?: any;
};

export default function HesabimTekliflerPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const tabParam = params.get("tab") as "gelen" | "gonderilen" | null;
  const [activeTab, setActiveTab] = useState<"gelen" | "gonderilen">(tabParam || "gelen");
  const [gelen, setGelen] = useState<Teklif[]>([]);
  const [gonderilen, setGonderilen] = useState<Teklif[]>([]);

  /* -------------------- Auth -------------------- */
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (!u) router.push("/giris");
      else setUid(u.uid);
    });
    return () => unsub();
  }, [router]);

  /* -------------------- Teklifleri getir -------------------- */
  useEffect(() => {
    if (!uid) return;
    const load = async () => {
      setLoading(true);
      try {
        const q1 = query(collection(db, "teklifler"), where("teklifSahipUid", "==", uid), qlimit(100));
        const q2 = query(collection(db, "teklifler"), where("teklifVerenUid", "==", uid), qlimit(100));

        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        const gelenList = snap1.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Teklif[];
        const gonderilenList = snap2.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Teklif[];

        gelenList.sort((a, b) => (b.olusturmaTarihi?.seconds || 0) - (a.olusturmaTarihi?.seconds || 0));
        gonderilenList.sort((a, b) => (b.olusturmaTarihi?.seconds || 0) - (a.olusturmaTarihi?.seconds || 0));

        setGelen(gelenList);
        setGonderilen(gonderilenList);
      } catch (e) {
        console.error("Teklifler alınamadı:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [uid]);

  /* -------------------- Teklif Kabul / Red -------------------- */
  const handleTeklifDurum = async (t: Teklif, yeniDurum: "accepted" | "rejected") => {
    try {
      await updateDoc(doc(db, "teklifler", t.id), {
        durum: yeniDurum,
        updatedAt: serverTimestamp(),
      });

      // Bildirim gönder
      await addDoc(collection(db, "notifications"), {
        toUserUid: t.teklifVerenUid,
        title: yeniDurum === "accepted" ? "Teklifiniz kabul edildi 🎉" : "Teklifiniz reddedildi ❌",
        message:
          yeniDurum === "accepted"
            ? `${t.ilanBaslik} ilanına verdiğiniz teklif kabul edildi.`
            : `${t.ilanBaslik} ilanına verdiğiniz teklif reddedildi.`,
        type: "offer",
        read: false,
        createdAt: serverTimestamp(),
        ilanId: t.ilanId,
      });

      /* -------------------- Kabul durumunda sohbet oluştur -------------------- */
      if (yeniDurum === "accepted") {
        const chatRef = await addDoc(collection(db, "messages"), {
          participants: [t.teklifSahipUid, t.teklifVerenUid],
          ilanId: t.ilanId,
          ilanBaslik: t.ilanBaslik,
          lastMessage: "Teklifiniz kabul edildi 🎉",
          lastSenderId: t.teklifSahipUid,
          updatedAt: serverTimestamp(),
        });

        // İlk mesaj
        await addDoc(collection(db, "messages", chatRef.id, "messages"), {
          senderId: t.teklifSahipUid,
          text: "Merhaba 👋 Teklifinizi kabul ettim. Detayları burada konuşabiliriz.",
          createdAt: serverTimestamp(),
          read: false,
        });

        // Bildirimler
        await addDoc(collection(db, "notifications"), {
          toUserUid: t.teklifVerenUid,
          title: "Yeni sohbet oluşturuldu 💬",
          message: `${t.ilanBaslik} ilanı için mesajlaşmaya başlayabilirsiniz.`,
          type: "message",
          read: false,
          createdAt: serverTimestamp(),
          chatId: chatRef.id,
        });

        await addDoc(collection(db, "notifications"), {
          toUserUid: t.teklifSahipUid,
          title: "Sohbet oluşturuldu ✅",
          message: `${t.ilanBaslik} için teklif kabul edildi.`,
          type: "info",
          read: false,
          createdAt: serverTimestamp(),
          chatId: chatRef.id,
        });

        alert("✅ Teklif kabul edildi, sohbet oluşturuldu!");
        router.push(`/hesabim/mesajlar?chat=${chatRef.id}`);
      } else {
        alert("🚫 Teklif reddedildi.");
      }
    } catch (err) {
      console.error("Teklif güncelleme hatası:", err);
      alert("❌ Teklif güncellenirken hata oluştu.");
    }
  };

  /* -------------------- UI -------------------- */
  const aktifListe = activeTab === "gelen" ? gelen : gonderilen;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-[1000px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">👥 Tekliflerim</h1>

        {/* Sekmeler */}
        <div className="inline-flex mb-6 rounded-lg border overflow-hidden">
          <button
            onClick={() => setActiveTab("gelen")}
            className={`px-4 py-2 text-sm ${activeTab === "gelen" ? "bg-white" : "bg-gray-100"} border-r`}
          >
            📥 Gelen Teklifler
          </button>
          <button
            onClick={() => setActiveTab("gonderilen")}
            className={`px-4 py-2 text-sm ${activeTab === "gonderilen" ? "bg-white" : "bg-gray-100"}`}
          >
            📤 Gönderilen Teklifler
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Yükleniyor…</p>
        ) : aktifListe.length === 0 ? (
          <p className="text-gray-500">
            {activeTab === "gelen" ? "Gelen teklif yok." : "Gönderilen teklif yok."}
          </p>
        ) : (
          <div className="space-y-3">
            {aktifListe.map((t) => (
              <div key={t.id} className="border rounded-xl bg-white p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{t.ilanBaslik}</div>
                  <div className="text-sm text-gray-600">
                    Teklif: <b>{t.teklifTutar ?? (t.teklifTutarNumber?.toLocaleString("tr-TR") + " ₺")}</b>{" "}
                    | Durum:{" "}
                    <span
                      className={`${
                        t.durum === "accepted"
                          ? "text-green-600"
                          : t.durum === "rejected"
                          ? "text-red-600"
                          : "text-yellow-600"
                      } font-semibold`}
                    >
                      {t.durum || "Beklemede"}
                    </span>
                  </div>
                </div>

                {activeTab === "gelen" && t.durum === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTeklifDurum(t, "accepted")}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                    >
                      Kabul Et
                    </button>
                    <button
                      onClick={() => handleTeklifDurum(t, "rejected")}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                    >
                      Reddet
                    </button>
                  </div>
                )}

                <a
                  href={`/ilan/${t.ilanId}`}
                  className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 ml-2"
                >
                  İlanı Gör
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
