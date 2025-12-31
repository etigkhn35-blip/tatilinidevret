"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth, db } from "@/lib/firebaseConfig";

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function GirisPage() {
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  /* ---------------- EMAIL + ŞİFRE ---------------- */
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

      // ❌ Email doğrulanmamışsa giriş yok
      if (!user.emailVerified) {
        await auth.signOut();
        setError("Lütfen e-posta adresinizi doğrulayın.");
        return;
      }

      // 🔑 Admin kontrol
      if (user.email === "info@tatilinidevret.com") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      console.error("Login hatası:", err);
      setError("E-posta veya şifre hatalı.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- GOOGLE LOGIN ---------------- */
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const user = result.user;

      console.log("🟢 Google user:", user.uid, user.email);

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        await setDoc(userRef, {
          adSoyad: user.displayName || "",
          email: user.email,
          role: user.email === "info@tatilinidevret.com" ? "admin" : "user",
          provider: "google",
          emailVerified: true, // Google otomatik doğrular
          phoneVerified: false,
          createdAt: serverTimestamp(),
        });

        console.log("✅ Firestore user oluşturuldu");
      }

      if (user.email === "info@tatilinidevret.com") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      console.error("Google login hatası:", err);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        <div className="text-center mb-6">
          <Link href="/" className="text-3xl font-bold">
            <span className="text-primary">tatilini</span>
            <span className="text-accent">devret</span>
          </Link>
        </div>

        <h1 className="text-center text-2xl font-semibold mb-6">
          Giriş yap
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />

          <input
            type="password"
            placeholder="Şifre"
            value={sifre}
            onChange={(e) => setSifre(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />

          {error && (
            <p className="text-center text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded font-semibold"
          >
            {loading ? "Giriş yapılıyor..." : "E-posta ile giriş yap"}
          </button>
        </form>

        <div className="text-center my-5 text-sm text-gray-500">VEYA</div>

        <button
          onClick={handleGoogleLogin}
          className="w-full border py-2 rounded flex items-center justify-center gap-2"
        >
          <img src="/icons/google.svg" className="w-5 h-5" />
          Google ile giriş yap
        </button>

        <p className="text-center text-sm mt-4">
          Hesabın yok mu?{" "}
          <Link href="/kayit" className="text-blue-600">
            Hesap aç
          </Link>
        </p>
      </div>
    </main>
  );
}
