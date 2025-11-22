"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import Link from "next/link";

export default function GeriBildirimPage() {
  const [user, setUser] = useState<any>(null);
  const [baslik, setBaslik] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  

  // 🔹 Kullanıcı oturumu kontrolü
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Form gönderme işlemi
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user) {
    alert("Giriş yapmadan bildirim gönderemezsiniz.");
    return;
  }

  if (!baslik.trim() || !mesaj.trim()) {
    alert("Lütfen başlık ve mesaj alanlarını doldurun.");
    return;
  }

  setLoading(true);
  setSuccess(null);

  try {
    // Destek kaydı
    const destekRef = await addDoc(collection(db, "destek_talepleri"), {
      userUid: user.uid,
      adSoyad: user.displayName || "Anonim Kullanıcı",
      email: user.email,
      baslik: baslik.trim(),
      mesaj: mesaj.trim(),
      durum: "beklemede",
      okundu: false,
      olusturmaTarihi: serverTimestamp(),
    });

    // ⭐ ADMIN BİLDİRİMİ (zil buradan tetikleniyor)
    await addDoc(collection(db, "notifications"), {
  type: "destek",
  title: baslik.trim(),
  message: mesaj.trim(),
  userUid: user.uid,
  toUserUid: "admin",   // ⭐ ADMIN için ZORUNLU
  read: false,
  createdAt: serverTimestamp(),
});

    setSuccess("✅ Bildiriminiz başarıyla gönderildi. En kısa sürede incelenecektir.");
    setBaslik("");
    setMesaj("");

  } catch (err) {
    console.error("❌ Bildirim gönderim hatası:", err);
    setSuccess("❌ Bildiriminiz gönderilemedi, lütfen tekrar deneyin.");
  } finally {
    setLoading(false);
  }
};


  // 🔹 Giriş yapılmamışsa yönlendirme
  if (!user)
    return (
      <main className="min-h-screen flex flex-col items-center justify-center text-gray-700">
        <p className="text-center mb-3">Bu sayfayı kullanmak için giriş yapmalısınız.</p>
        <Link
          href="/giris"
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition"
        >
          Giriş Yap
        </Link>
      </main>
    );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-[800px] mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          💬 Sorun / Öneri Bildirimi
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white border rounded-2xl shadow-sm p-6 space-y-5"
        >
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Başlık
            </label>
            <input
              type="text"
              value={baslik}
              onChange={(e) => setBaslik(e.target.value)}
              placeholder="Kısa bir başlık yazın (ör. Ödeme sorunu)"
              className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Mesajınız
            </label>
            <textarea
              rows={6}
              value={mesaj}
              onChange={(e) => setMesaj(e.target.value)}
              placeholder="Yaşadığınız sorunu veya önerinizi detaylıca yazın..."
              className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-semibold py-2 rounded-lg transition ${
              loading ? "bg-gray-400" : "bg-primary hover:bg-accent"
            }`}
          >
            {loading ? "Gönderiliyor..." : "Gönder"}
          </button>

          {success && (
            <p
              className={`mt-4 text-sm font-medium ${
                success.startsWith("✅") ? "text-green-600" : "text-red-600"
              }`}
            >
              {success}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
