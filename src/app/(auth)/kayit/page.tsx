"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { auth, db } from "@/lib/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export default function RegisterPage() {
  const [form, setForm] = useState({ adSoyad: "", email: "", sifre: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Kullanıcı oluştur
      const { user } = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.sifre
      );

      // Profil güncelleme (Ad Soyad)
      await updateProfile(user, { displayName: form.adSoyad });

      // Firestore'a kullanıcı kaydı
      await setDoc(doc(db, "users", user.uid), {
        adSoyad: form.adSoyad,
        email: form.email,
        createdAt: new Date(),
        role: "user",
        verified: false,
      });

      // Email doğrulama gönder
      await sendEmailVerification(user);

      setMessage(
        "📩 Kayıt başarılı! Lütfen e-posta adresinizi doğrulamak için gelen kutunuzu kontrol edin."
      );

      // Formu temizle
      setForm({ adSoyad: "", email: "", sifre: "" });

      // 2 saniye sonra giriş sayfasına yönlendir
      setTimeout(() => {
        router.push("/giris");
      }, 2000);
    } catch (err: any) {
      console.error("❌ Kayıt hatası:", err);

      let errorMsg = "Bir hata oluştu.";

      if (err.code === "auth/email-already-in-use") {
        errorMsg = "Bu e-posta adresi zaten kullanılıyor.";
      } else if (err.code === "auth/invalid-email") {
        errorMsg = "Geçersiz e-posta formatı.";
      } else if (err.code === "auth/weak-password") {
        errorMsg = "Şifre en az 6 karakter olmalıdır.";
      }

      setMessage("⚠️ " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-center text-2xl font-bold mb-6">
          <span className="text-primary">tatilini</span>
          <span className="text-accent">devret</span>
        </h1>
        <h2 className="text-xl font-semibold text-center mb-6 text-gray-800">
          Hesap Aç
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ad Soyad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ad Soyad
            </label>
            <input
              name="adSoyad"
              required
              value={form.adSoyad}
              onChange={handleChange}
              placeholder="Ad Soyad"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-posta
            </label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="ornek@email.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          {/* Şifre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Şifre
            </label>
            <input
              type="password"
              name="sifre"
              required
              value={form.sifre}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-accent transition"
          >
            {loading ? "Kayıt Yapılıyor..." : "Kayıt Ol"}
          </button>
        </form>

        {/* Mesaj */}
        {message && (
          <p className="text-center mt-4 text-sm text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-200">
            {message}
          </p>
        )}

        <p className="text-center text-sm text-gray-600 mt-6">
          Zaten hesabın var mı?{" "}
          <Link href="/giris" className="text-primary hover:underline">
            Giriş Yap
          </Link>
        </p>
      </div>
    </main>
  );
}
