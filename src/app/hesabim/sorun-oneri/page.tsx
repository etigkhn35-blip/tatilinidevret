"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function DestekTalebiPage() {
  const [user, setUser] = useState<any>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSending(true);

    const user = auth.currentUser;
    const email = user?.email || "";
    const adSoyad =
      user?.displayName || email.split("@")[0] || "Kullanıcı";

    const baslik = subject.trim();      // ✅ DÜZELTİLDİ
    const mesaj = message.trim();

    if (!baslik || !mesaj) {
      alert("Lütfen başlık ve mesaj girin!");
      setSending(false);
      return;
    }

    // 1️⃣ Destek talebini kaydet
    const talepRef = await addDoc(collection(db, "destek_talepleri"), {
      baslik,
      mesaj,
      email,
      adSoyad,
      userUid: user?.uid || null,
      durum: "beklemede",
      olusturmaTarihi: serverTimestamp(),
    });

    // 2️⃣ Admin'e bildirim gönder (fallback)
    await addDoc(collection(db, "notifications"), {
      type: "destek",
      title: "Yeni Destek Talebi",
      message: baslik,
      refCollection: "destek_talepleri",
      refId: talepRef.id,
      chatId: talepRef.id,

      // ⭐ Admin panelde doğru açılacak URL
      path: `/admin/destek-talepleri?open=${talepRef.id}`,

      read: false,
      createdAt: serverTimestamp(),

      // ⭐ Admin UID
      toUserUid: "Presmt66LxdgLJQZareFD0Os7kL2",
    });

    alert("Talebin başarıyla gönderildi ✅");
    setSending(false);
    setSubject("");
    setMessage("");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <p>Destek talebi göndermek için giriş yapmalısınız.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-[700px] mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">🎫 Destek Talebi Gönder</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white border rounded-xl shadow p-6 space-y-4"
        >
          <div>
            <label className="block font-semibold mb-1">Konu</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Örn: İlanım onaylanmadı"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Mesajınız</label>
            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Yaşadığınız sorunu buraya yazın..."
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sending}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-accent transition disabled:opacity-60"
            >
              {sending ? "Gönderiliyor..." : "Gönder"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
