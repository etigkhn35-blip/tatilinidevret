"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebaseConfig";
import { updateProfile, updateEmail, updatePassword, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function ProfilPage() {
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || "");
        setEmail(currentUser.email || "");

        // ⭐ Firestore'dan telefon bilgisi çek
        const userRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          setPhone(data.phone || "");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setMessage("Kaydediliyor...");

      // Firebase Auth güncellemeleri
      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName });
      }
      if (email !== user.email) {
        await updateEmail(user, email);
      }
      if (password.length >= 6) {
        await updatePassword(user, password);
      }

      // Firestore güncelle
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        adSoyad: displayName,
        email,
        phone, // 📌 Telefon Firestore'a yazılıyor
      });

      setMessage("✅ Bilgiler başarıyla güncellendi.");
      setPassword("");
    } catch (err: any) {
      console.error(err);
      setMessage(`❌ Hata: ${err.message}`);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Yükleniyor...
      </div>
    );

  if (!user)
    return (
      <div className="text-center py-20 text-gray-600">
        Devam etmek için giriş yapmalısınız.
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-[800px] mx-auto px-4 py-10 bg-white rounded-xl shadow-sm border">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">👤 Profil Bilgilerim</h1>

        <form onSubmit={handleSave} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
              placeholder="Ad Soyad giriniz"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
              placeholder="E-posta adresiniz"
            />
          </div>

          {/* 📌 Telefon Alanı */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon Numarası</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
              placeholder="+90 5xx xxx xx xx"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
              placeholder="Yeni şifre (isteğe bağlı)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Şifre en az 6 karakter olmalıdır.
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-accent transition"
            >
              Kaydet
            </button>
          </div>
        </form>

        {message && (
          <p className="mt-4 text-sm text-center text-gray-700">{message}</p>
        )}
      </div>
    </main>
  );
}
