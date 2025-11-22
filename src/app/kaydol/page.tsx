"use client";

import { useState } from "react";
import { auth } from "@/lib/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import ReCaptcha from "@/components/ReCaptcha";

export default function Kaydol() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [adSoyad, setAdSoyad] = useState("");
  const [sozlesme, setSozlesme] = useState(false);
  const [kvkk, setKvkk] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal görünürlüğü
  const [showSozlesme, setShowSozlesme] = useState(false);
  const [showKvkk, setShowKvkk] = useState(false);

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
  };

  const handleKaydol = async (e: any) => {
    e.preventDefault();

    if (!sozlesme) {
      alert("Lütfen üyelik sözleşmesini kabul edin.");
      return;
    }

    if (!captchaToken) {
      alert("Lütfen güvenlik doğrulamasını tamamlayın.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, sifre);
      await updateProfile(userCredential.user, { displayName: adSoyad });
      alert("Kayıt başarılı! Hoş geldiniz.");
      router.push("/");
    } catch (error: any) {
      alert("Kayıt hatası: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleKaydol = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      alert("Google ile kayıt başarılı!");
      router.push("/");
    } catch (error: any) {
      alert("Google ile kayıt hatası: " + error.message);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md bg-gray-50 shadow-lg border border-gray-200 rounded-2xl p-8 relative">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Hesap aç
        </h1>

        <form onSubmit={handleKaydol} className="space-y-4">
          <input
            type="email"
            placeholder="E-posta adresi"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ad"
              className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
              value={adSoyad.split(" ")[0] || ""}
              onChange={(e) =>
                setAdSoyad(e.target.value + " " + (adSoyad.split(" ")[1] || ""))
              }
              required
            />
            <input
              type="text"
              placeholder="Soyad"
              className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
              value={adSoyad.split(" ")[1] || ""}
              onChange={(e) =>
                setAdSoyad((adSoyad.split(" ")[0] || "") + " " + e.target.value)
              }
              required
            />
          </div>

          <input
            type="password"
            placeholder="Şifre"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
            value={sifre}
            onChange={(e) => setSifre(e.target.value)}
            required
          />

          {/* ✅ Onay Kutuları */}
          <div className="space-y-2 text-sm text-gray-700">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={sozlesme}
                onChange={(e) => setSozlesme(e.target.checked)}
                className="mt-1"
              />
              <span>
                <button
                  type="button"
                  onClick={() => setShowSozlesme(true)}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Bireysel Hesap Sözleşmesi ve Ekleri
                </button>
                'ni kabul ediyorum.
              </span>
            </label>

            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={kvkk}
                onChange={(e) => setKvkk(e.target.checked)}
                className="mt-1"
              />
              <span>
                <button
                  type="button"
                  onClick={() => setShowKvkk(true)}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Kişisel Verilerin İşlenmesi (KVKK)
                </button>{" "}
                metnini okudum, anladım.
              </span>
            </label>
          </div>

          {/* 🔹 reCAPTCHA */}
          <ReCaptcha onVerify={handleCaptchaVerify} />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
            disabled={loading}
          >
            {loading ? "Kaydediliyor..." : "Kaydol"}
          </button>
        </form>

        <div className="text-center my-4 text-gray-600">veya</div>

        <button
          onClick={handleGoogleKaydol}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg"
        >
          Google ile Kaydol
        </button>

        <p className="text-center text-sm mt-4 text-gray-600">
          Zaten hesabınız var mı?{" "}
          <a href="/giris" className="text-blue-600 hover:underline">
            Giriş Yap
          </a>
        </p>

        {/* ✅ MODALLAR */}
        {showSozlesme && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white w-[90%] max-w-2xl rounded-xl shadow-lg p-6 relative">
              <h2 className="text-lg font-semibold mb-2">
                Bireysel Hesap Sözleşmesi
              </h2>
              <p className="text-sm text-gray-700 overflow-y-auto max-h-[60vh]">
                Bu sözleşme, tatilinidevret.com platformunda üyelik oluştururken
                kullanıcı ile site yönetimi arasında geçerli olan genel
                kullanım şartlarını içerir. Üyelik işlemleri sırasında doğru
                bilgi verilmesi ve hesap bilgilerinin gizliliğinden kullanıcı
                sorumludur...
              </p>
              <button
                onClick={() => setShowSozlesme(false)}
                className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-xl"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {showKvkk && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white w-[90%] max-w-2xl rounded-xl shadow-lg p-6 relative">
              <h2 className="text-lg font-semibold mb-2">
                Kişisel Verilerin Korunması Kanunu (KVKK)
              </h2>
              <p className="text-sm text-gray-700 overflow-y-auto max-h-[60vh]">
                Kişisel verileriniz, 6698 sayılı Kişisel Verilerin Korunması
                Kanunu kapsamında işlenmekte olup yalnızca üyelik işlemleri,
                iletişim faaliyetleri ve platform hizmetlerinin
                yürütülmesi amacıyla kullanılmaktadır. Verileriniz, açık rızanız
                olmadan üçüncü kişilerle paylaşılmaz.
              </p>
              <button
                onClick={() => setShowKvkk(false)}
                className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-xl"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
