"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";

export default function GirisPage() {
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    const userCred = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      sifre
    );

    const user = userCred.user;

    // 🔐 ADMIN KONTROLÜ
    if (user.email === "info@tatilinidevret.com") {
      router.push("/admin");
    } else {
      router.push("/");
    }
  } catch (err: any) {
    setError("E-posta veya şifre hatalı.");
  } finally {
    setLoading(false);
  }
};

  // ⭐ Geliştirilmiş Google Login ⭐
  const handleGoogleLogin = async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);

    const userEmail = auth.currentUser?.email;

    if (userEmail === "info@tatilinidevret.com") {
      router.push("/admin");
    } else {
      router.push("/");
    }
  } catch (err: any) {
    if (err?.code === "auth/popup-closed-by-user") return;
    if (err?.code === "auth/cancelled-popup-request") return;
    console.error("Google giriş hatası:", err);
  }
};

  
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center mb-6">
        <Link href="/" className="text-3xl font-bold">
          <span className="text-primary">tatilini</span>
          <span className="text-accent">devret</span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <h1 className="text-center text-2xl font-semibold text-gray-900 mb-6">
          Giriş yap
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="E-posta adresi"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary outline-none text-sm"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Şifre"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary outline-none text-sm"
            />
            <div className="flex justify-between items-center mt-2">
              <label className="text-sm text-gray-600 flex items-center gap-1">
                <input type="checkbox" className="h-3 w-3" /> Oturumum açık kalsın
              </label>
              <Link
                href="/sifremi-unuttum"
                className="text-sm text-blue-600 hover:underline"
              >
                Şifremi unuttum
              </Link>
            </div>
          </div>

          {error && <p className="text-center text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold text-sm"
          >
            {loading ? "Giriş yapılıyor..." : "E-posta ile giriş yap"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-700 mt-4">
          Henüz hesabın yok mu?{" "}
          <Link href="/kayit" className="text-blue-600 hover:underline">
            Hesap aç
          </Link>
        </p>

        <div className="flex items-center my-5">
          <hr className="flex-1 border-gray-300" />
          <span className="px-3 text-sm text-gray-500">VEYA</span>
          <hr className="flex-1 border-gray-300" />
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2 hover:bg-gray-50 transition text-sm"
          >
            <img src="/icons/google.svg" alt="Google" className="w-5 h-5" />
            Google ile giriş yap
          </button>

      
        </div>
      </div>
    </main>
  );
}
