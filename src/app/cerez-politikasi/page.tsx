"use client";

import Link from "next/link";

export default function CerezPolitikasiPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Çerez Politikası</h1>

        <p className="text-gray-700 mb-4">
          tatilinidevret.com, kullanıcı deneyimini geliştirmek için çerez (cookie)
          kullanmaktadır.
        </p>
        <p className="text-gray-700 mb-4">
          Çerezler, kullanıcı tercihlerini hatırlamak, oturum açma işlemlerini
          kolaylaştırmak, site istatistiklerini tutmak için kullanılır.
        </p>

        <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
          <li>
            <b>Zorunlu çerezler:</b> Sitenin çalışması için gerekli.
          </li>
          <li>
            <b>Analitik çerezler:</b> Kullanıcı deneyimini iyileştirmek için ziyaret
            istatistikleri.
          </li>
          <li>
            <b>Reklam çerezleri:</b> (Şimdilik kullanılmıyor) gelecekte hedefli reklamlar
            için olabilir.
          </li>
        </ul>

        <p className="text-gray-700">
          Kullanıcı, tarayıcı ayarlarından çerezleri dilediği zaman silebilir veya
          engelleyebilir.
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
