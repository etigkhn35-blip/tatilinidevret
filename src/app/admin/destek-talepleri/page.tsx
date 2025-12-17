"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
  addDoc,
} from "firebase/firestore";

/* ------------ Tipler ------------ */
type DestekTalebi = {
  id: string;
  baslik: string;
  mesaj: string;
  email: string;
  adSoyad?: string;
  userUid?: string | null;   // 👈 EKLENMESİ GEREKEN ALAN
  durum?: "beklemede" | "yanıtlandı";
  olusturmaTarihi?: Timestamp | Date | number | null;
  yanit?: string;
  yanitTarihi?: Timestamp | Date | number | null;
};


/* ------------ Yardımcı ------------ */
const toMillis = (t: unknown): number => {
  if (!t) return 0;
  if (t instanceof Date) return t.getTime();
  if (typeof t === "object" && t !== null && (t as any).toMillis) {
    return (t as any).toMillis();
  }
  const n = Number(t);
  return Number.isFinite(n) ? n : 0;
};

export default function AdminDestekTalepleriPage() {
  const [talepList, setTalepList] = useState<DestekTalebi[]>([]);
  const [selected, setSelected] = useState<DestekTalebi | null>(null);
  const [yanit, setYanit] = useState("");
  const [loading, setLoading] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const firstLoadRef = useRef(true);

  useEffect(() => {
    audioRef.current = new Audio("/sounds/notification.mp3");
  }, []);

  /* ------------ Veri akışı + Bildirim ------------ */
    useEffect(() => {
    const unsub = onSnapshot(collection(db, "destek_talepleri"), async (snap) => {
      const data: DestekTalebi[] = snap.docs.map((d) => {
  const raw = d.data() as any;
  return {
    id: d.id,
    baslik: raw?.baslik ?? "",
    mesaj: raw?.mesaj ?? "",
    email: raw?.email ?? "",
    adSoyad: raw?.adSoyad ?? "",
    userUid: raw?.userUid ?? null,   // ✅ EKLENECEK SATIR
    durum: raw?.durum ?? "beklemede",
    olusturmaTarihi:
      raw?.olusturmaTarihi ?? raw?.createdAt ?? raw?.timestamp ?? null,
    yanit: raw?.yanit ?? "",
    yanitTarihi: raw?.yanitTarihi ?? null,
  };
});

      data.sort(
        (a, b) => toMillis(b.olusturmaTarihi) - toMillis(a.olusturmaTarihi)
      );
      setTalepList(data);
      setLoading(false);

      // 🔔 Yeni destek talebi kontrolü
      if (!firstLoadRef.current) {
  const latest = data[0];

  const isUserMessage =
    latest &&
    latest.durum === "beklemede" &&          // hâlâ bekliyor
    !latest.yanit &&                         // admin daha yanıt vermemiş
    latest.email !== "info@tatilinidevret.com"; // mesaj ADMİN’den gelmemiş

  if (isUserMessage && audioRef.current) {
    audioRef.current.currentTime = 0;
   
          
         
        }
      } else {
        firstLoadRef.current = false;
      }
    });

    return () => unsub();
  }, []);


  /* ------------ Yanıt gönder ------------ */
 const handleYanitla = async (talep: DestekTalebi) => {
  if (!yanit.trim()) return alert("Yanıt boş olamaz!");

  if (!talep.userUid) {
    alert("Bu destek talebinin userUid alanı yok — kullanıcıya gönderilemez!");
    return;
  }

  try {
    // 1️⃣ Talebi güncelle
    await updateDoc(doc(db, "destek_talepleri", talep.id), {
      yanit,
      durum: "yanıtlandı",
      yanitTarihi: serverTimestamp(),
    });

    // 2️⃣ Kullanıcının NOTIFICATIONS altına kaydet ⬅️ DOĞRU YER
    const notifRef = await addDoc(
      collection(db, "users", talep.userUid, "notifications"),
      {
        type: "support_reply",
        title: "Destek talebiniz yanıtlandı",
        message: yanit.slice(0, 80),
        read: false,
        createdAt: serverTimestamp(),
        destekId: talep.id,
        path: `/mesajlar?destek=${talep.id}`
      }
    );

    // 3️⃣ Kullanıcının unread counter'ını artırmak istersen buraya koyabilirim

    alert("Yanıt gönderildi ve kullanıcı bilgilendirildi ✅");

    setSelected(null);
    setYanit("");

  } catch (e) {
    console.error("Destek yanıt hata:", e);
    alert("Yanıt gönderilemedi.");
  }
};


  /* ------------ UI ------------ */
  if (loading)
    return (
      <div className="p-10 text-center text-gray-500 animate-pulse">
        Destek talepleri yükleniyor...
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <audio ref={audioRef} src="/sounds/notification.mp3" preload="auto" />
      <h1 className="text-2xl font-bold mb-6">📬 Destek Talepleri</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sol liste */}
        <aside className="bg-white border rounded-xl shadow p-4 overflow-y-auto max-h-[80vh]">
          <h2 className="font-semibold mb-3 text-gray-700">Tüm Talepler</h2>
          {talepList.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t)}
              className={`w-full text-left p-3 mb-2 rounded-lg border transition ${
                selected?.id === t.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <p className="font-semibold text-gray-800 line-clamp-1">
                {t.baslik || "(başlıksız)"}
              </p>
              <p className="text-xs text-gray-500">
                {t.email} ·{" "}
                {t.durum === "yanıtlandı" ? "✅ Yanıtlandı" : "⏳ Bekliyor"}
              </p>
            </button>
          ))}
        </aside>

        {/* Sağ panel */}
        <section className="md:col-span-2 bg-white border rounded-xl shadow p-6">
          {!selected ? (
            <p className="text-gray-500 text-center">
              Görüntülemek için bir talep seçin.
            </p>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-2">{selected.baslik}</h2>
              <p className="text-sm text-gray-600 mb-4 whitespace-pre-line">
                {selected.mesaj}
              </p>

              <div className="mb-4 text-sm text-gray-500">
                Gönderen: <b>{selected.adSoyad || "Kullanıcı"}</b> (
                {selected.email})
              </div>

              <textarea
                value={yanit}
                onChange={(e) => setYanit(e.target.value)}
                placeholder="Yanıtınızı yazın…"
                className="w-full border rounded-lg p-3 mb-4 h-32 focus:ring-2 focus:ring-blue-400 outline-none"
              />

              <button
                onClick={() => handleYanitla(selected)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Yanıt Gönder
              </button>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
