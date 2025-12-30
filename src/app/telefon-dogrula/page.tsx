"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseConfig";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import Link from "next/link";

export default function TelefonDogrulaPage() {
  const router = useRouter();

  const [telefon, setTelefon] = useState("");
  const [kod, setKod] = useState("");
  const [confirmation, setConfirmation] =
    useState<ConfirmationResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔒 Login olmadan girilmesin + reCAPTCHA kur
  useEffect(() => {
    if (!auth.currentUser) {
      router.push("/giris");
      return;
    }

    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
        }
      );
    }
  }, [router]);

  // 📞 SMS GÖNDER
  const handleSendSMS = async () => {
    setError(null);
    setLoading(true);

    try {
     if (!/^05\d{9}$/.test(telefon)) {
  throw new Error("Telefon 05xx ile başlamalı ve 11 haneli olmalıdır.");
}

const phoneE164 = "+90" + telefon.substring(1);

const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
  size: "invisible",
});

const result = await signInWithPhoneNumber(
  auth,
  phoneE164,
  verifier
);

setConfirmation(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "SMS gönderilemedi.");
    } finally {
      setLoading(false);
    }
  };

  // 🔑 KOD DOĞRULA
  const handleVerifyCode = async () => {
    if (!confirmation) return;

    setLoading(true);
    setError(null);

    try {
      await confirmation.confirm(kod);

      const user = auth.currentUser!;
      await updateDoc(doc(db, "users", user.uid), {
        phoneVerified: true,
      });

      router.push("/");
    } catch (err) {
      console.error(err);
      setError("Kod hatalı veya süresi dolmuş.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      {/* LOGO */}
      <div className="mb-6 text-center">
        <Link href="/" className="text-3xl font-bold">
          <span className="text-primary">tatilini</span>
          <span className="text-accent">devret</span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-semibold text-center mb-4">
          Telefon Doğrulama
        </h1>

        {!confirmation ? (
          <>
            <input
              type="tel"
              placeholder="05xx xxx xx xx"
              value={telefon}
              onChange={(e) => setTelefon(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
            />

            <button
              onClick={handleSendSMS}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded font-semibold"
            >
              {loading ? "Gönderiliyor..." : "SMS Gönder"}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="SMS kodu"
              value={kod}
              onChange={(e) => setKod(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
            />

            <button
              onClick={handleVerifyCode}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded font-semibold"
            >
              {loading ? "Doğrulanıyor..." : "Doğrula"}
            </button>
          </>
        )}

        {error && (
          <p className="text-center text-red-500 text-sm mt-4">{error}</p>
        )}
      </div>

      {/* Firebase reCAPTCHA */}
      <div id="recaptcha-container"></div>
    </main>
  );
}
