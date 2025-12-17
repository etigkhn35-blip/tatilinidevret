"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import Link from "next/link";

export default function SifremiUnuttumPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await sendPasswordResetEmail(auth, email);

      setMessage(
        "📩 Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Gelen kutunuzu ve spam klasörünü kontrol edin."
      );

      setEmail("");
    } catch (err: any) {
      console.error("Şifre sıfırlama hatası:", err);

      if (err.code === "auth/user-not-found") {
        setMessage("❌ Bu e-posta ile kayıtlı kullanıcı bulunamadı.");
      } else if (err.code === "auth/invalid-email") {
        setMessage("❌ Geçersiz e-posta adresi.");
      } else {
        setMessage("❌ Şifre sıfırlama maili gönderilemedi. Lütfen tekrar deneyin.");
      }
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
          Şifremi Unuttum
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-posta adresi
          </label>

          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@mail.com"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
          >
            {loading ? "Gönderiliyor..." : "Şifre Sıfırlama Maili Gönder"}
          </button>
        </form>

        {message && (
          <p className="text-center mt-4 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
            {message}
          </p>
        )}

        <p className="text-center text-sm text-gray-600 mt-6">
          <Link href="/giris" className="text-primary hover:underline">
            ← Giriş Sayfasına Dön
          </Link>
        </p>
      </div>
    </main>
  );
}
