"use client";

import Link from "next/link";

export default function KullanimKosullariPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Kullanım Koşulları
        </h1>

        <p className="text-gray-700 mb-4">
          tatilinidevret.com’a hoş geldiniz. Sitemizi kullanarak aşağıdaki
          koşulları kabul etmiş sayılırsınız:
        </p>

        <ul className="list-disc list-inside text-gray-700 space-y-3">
          <li>
            tatilinidevret yalnızca kullanıcıların ilanlarını yayınlayan bir
            platformdur.
          </li>
          <li>
            Yayınlanan ilanların doğruluğu ve güncelliği tamamen ilan sahibinin
            sorumluluğundadır.
          </li>
          <li>
            Sitede yayınlanan tatil devri, villa kiralama, otel rezervasyonu,
            cruise, tur veya etkinlik paketleri, tatilinidevret’in aracılığı
            olmaksızın taraflarca yürütülür.
          </li>
          <li>
            Kullanıcı, yanlış veya yanıltıcı bilgi paylaşması halinde tüm hukuki
            ve cezai sorumluluğun kendisine ait olduğunu kabul eder.
          </li>
          <li>Ödeme yapılan ilan ücretleri iade edilmez.</li>
          <li>
            tatilinidevret, ilanların yayından kaldırılması veya reddedilmesi
            hakkını saklı tutar.
          </li>
        </ul>

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
