"use client";

import Link from "next/link";

export default function NasilCalisirPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Tatilini Devretmek Çok Kolay!
        </h1>
        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          3 adımda ilanını ver, paranı geri al.
        </h2>

        <div className="space-y-6 text-gray-700">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">1️⃣ İlanını Ver</h3>
            <p>
              Planların değişti, tatile gidemiyorsun? Hemen ilanını oluştur. Otel,
              villa, cruise, tur veya etkinlik paketi seç. Rezervasyon bilgilerini gir,
              voucher belgeni yükle ve ilanını kolayca yayımla.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-1">2️⃣ İlanını Öne Çıkar</h3>
            <p>
              İstersen ilanını daha görünür yapabilirsin: “Öne Çıkar” → Üst sıralarda
              listelenir. “Vitrin” → Ana sayfada sergilenir. “Kalın Punto” →
              Dikkat çekici görünür. %40–50 üzeri indirimlerde otomatik rozet al
              (Muhteşem / Eşsiz Fırsat).
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-1">3️⃣ Alıcıyla Anlaş</h3>
            <p>
              İlanın yayına alındıktan sonra ilgilenen kullanıcılar seninle iletişime
              geçer. Devir detaylarını konuş, anlaşmayı yap. Sen kazan, tatilin
              yanmasın!
            </p>
          </div>
        </div>

        <p className="mt-6 text-sm text-gray-600 italic">
          📌 Not: tatilinidevret yalnızca ilan yayımlar. Devir işlemleri tamamen
          tarafların sorumluluğundadır.
        </p>

        <div className="text-sm text-gray-500 mt-8 text-center">
          Geri dön →{" "}
          <Link href="/" className="text-primary hover:underline">
            Anasayfa
          </Link>
        </div>
      </div>
    </main>
  );
}
