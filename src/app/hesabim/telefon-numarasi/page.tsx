"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebaseConfig";
import {
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updatePhoneNumber,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

export default function TelefonNumaramPage() {
  const [user, setUser] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [step, setStep] = useState<"enter" | "verify" | "done">("enter");

  // 🔹 Kullanıcıyı al
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // 🔹 reCAPTCHA başlat
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
  };

  // 🔹 SMS gönder
  const sendVerification = async () => {
    if (!phone.startsWith("+90")) {
      alert("Lütfen telefon numarasını +90 ile başlayacak şekilde girin.");
      return;
    }

    setupRecaptcha();
    const appVerifier = window.recaptchaVerifier;

    try {
      setVerifying(true);
      const confirmation = await signInWithPhoneNumber(auth, phone, appVerifier);
      setVerificationId(confirmation.verificationId);
      alert("📱 Doğrulama kodu gönderildi, SMS'inizi kontrol edin.");
      setStep("verify");
    } catch (err: any) {
      console.error("SMS gönderme hatası:", err);
      alert("❌ Kod gönderilemedi: " + err.message);
    } finally {
      setVerifying(false);
    }
  };

  // 🔹 Kodu doğrula
  const verifyCode = async () => {
    try {
      const credential = window.firebase.auth.PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      );
      await updatePhoneNumber(user, credential);
      await updateDoc(doc(db, "users", user.uid), { phone });
      setStep("done");
      alert("✅ Telefon numaranız başarıyla doğrulandı.");
    } catch (err: any) {
      console.error("Doğrulama hatası:", err);
      alert("❌ Kod doğrulanamadı: " + err.message);
    }
  };

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Giriş yapmanız gerekiyor.
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-[600px] mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">📱 Cep Telefonu Numaram</h1>

        <div className="bg-white border rounded-xl shadow-sm p-6 space-y-5">
          {step === "enter" && (
            <>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Telefon Numaranız (+90 ile başlayarak)
              </label>
              <input
                type="tel"
                placeholder="+90 5xx xxx xx xx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />

              <button
                onClick={sendVerification}
                disabled={verifying || !phone}
                className="bg-primary text-white px-5 py-2 rounded-lg font-semibold hover:bg-accent transition disabled:opacity-60"
              >
                {verifying ? "Gönderiliyor..." : "Doğrulama Kodu Gönder"}
              </button>
              <div id="recaptcha-container"></div>
            </>
          )}

          {step === "verify" && (
            <>
              <p className="text-gray-700">
                SMS ile gelen 6 haneli doğrulama kodunu girin.
              </p>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="XXXXXX"
                className="w-full border rounded-lg px-3 py-2 text-center text-lg tracking-widest"
                maxLength={6}
              />
              <button
                onClick={verifyCode}
                className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Kodu Doğrula
              </button>
            </>
          )}

          {step === "done" && (
            <div className="text-center text-green-600 font-semibold">
              ✅ Numaranız doğrulandı: {phone}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// 🔹 Firebase reCAPTCHA tanımı
declare global {
  interface Window {
    recaptchaVerifier: any;
    firebase: any;
  }
}
