"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebaseConfig";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function OdemePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const ilanId = searchParams.get("ilanId");
  const mode = searchParams.get("mode") || "publish";

  const base = Number(searchParams.get("base") || 0);
  const one = Number(searchParams.get("one") || 0);
  const vit = Number(searchParams.get("vit") || 0);
  const bold = Number(searchParams.get("bold") || 0);

  const subtotal = base + one + vit + bold;
  const kdv = subtotal * 0.2;
  const total = subtotal + kdv;

  const [ilan, setIlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  // İlanı çek
  useEffect(() => {
    if (!ilanId) return;

    const fetchIlan = async () => {
      try {
        const ref = doc(db, "ilanlar", ilanId);
        const snap = await getDoc(ref);
        if (snap.exists()) setIlan({ id: snap.id, ...snap.data() });
      } finally {
        setLoading(false);
      }
    };

    fetchIlan();
  }, [ilanId]);

  const handleOdeme = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Lütfen önce giriş yapın.");
      router.push("/giris");
      return;
    }
    if (!ilan) return;

    try {
      setPaying(true);

      // ⭐ Burada şimdilik MOCK (test) ödeme var.
      // Gerçek PayTR entegre edildiğinde, başarılı callback’te bu alanlar güncellenecek.

      if (mode === "publish") {
        await updateDoc(doc(db, "ilanlar", ilan.id), {
          // Ödeme alındı
          paymentStatus: "paid",
          paymentTotal: total,
          paymentBase: base,
          paymentOneCikar: one,
          paymentVitrin: vit,
          paymentBold: bold,
          paymentAt: serverTimestamp(),

          // Moderasyon beklemede
          status: "pending_review",
        });
      }

      if (mode === "extend") {
        // İlan süresi uzatma işlemlerini de ayrı düşünebiliriz.
        await updateDoc(doc(db, "ilanlar", ilan.id), {
          paymentStatus: "paid",
          paymentExtendAt: serverTimestamp(),
          // İstersek buraya ayrı "extend_pending_review" gibi status de koyabiliriz.
        });
      }

      alert(
        "✅ Ödeme başarıyla tamamlandı. İlanınız yönetici onayına gönderildi, kısa süre içinde incelenecek."
      );
      router.push("/hesabim");
    } catch (err) {
      console.error(err);
      alert("❌ Ödeme işlemi başarısız oldu!");
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <p className="text-center py-10">Yükleniyor...</p>;
  if (!ilan) return <p className="text-center py-10">İlan bulunamadı.</p>;

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white w-[420px] p-6 rounded-xl shadow-lg">
        <h1 className="text-xl font-bold mb-4 text-center">🧾 Ödeme Sayfası</h1>

        <div className="border rounded-lg p-4 bg-gray-50 mb-4">
          <p className="font-semibold">{ilan.baslik}</p>
          <p className="text-sm text-gray-600 mb-2">
            {ilan.kategori} / {ilan.altKategori}
          </p>

          <div className="text-sm text-gray-700 space-y-1 mb-2">
            {!base ? (
              <p>📦 İlk ilan kampanyası: <b>0 ₺</b></p>
            ) : (
              <p>📦 Standart ilan: <b>{base.toFixed(2)} ₺</b></p>
            )}
            {one > 0 && <p>⭐ Öne Çıkar: +{one.toFixed(2)} ₺</p>}
            {vit > 0 && <p>🏆 Vitrinde Göster: +{vit.toFixed(2)} ₺</p>}
            {bold > 0 && <p>📝 Başlık Kalın: +{bold.toFixed(2)} ₺</p>}
            <p className="mt-1">
              KDV (%20): <b>{kdv.toFixed(2)} ₺</b>
            </p>
          </div>

          <p className="text-lg font-bold text-blue-600">
            Toplam Ödenecek: {total.toFixed(2)} ₺
          </p>
        </div>

        <button
          onClick={handleOdeme}
          disabled={paying}
          className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
        >
          {paying ? "Ödeme İşleniyor..." : "💳 Ödemeyi Tamamla"}
        </button>

        <p className="text-xs text-center text-gray-500 mt-3">
          Bu test ekranıdır. Gerçek ödeme PayTR ile entegre edildiğinde otomatik
          çalışacaktır.
        </p>
      </div>
    </main>
  );
}
