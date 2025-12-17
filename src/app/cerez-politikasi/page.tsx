"use client";

import Link from "next/link";

export default function CerezPolitikasiPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">

        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          ÇEREZ POLİTİKASI
        </h1>

        <p className="text-gray-700 mb-4 font-semibold">
          TatiliniDevret.com Çerez Politikası
        </p>

        <p className="text-gray-700 mb-6">
          Bu Çerez Politikası, Site’nin çerez kullanımını ve kullanıcıların
          çerez tercihlerini açıklamak amacıyla hazırlanmıştır.
        </p>

        {/* 1 */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          1. Çerez Nedir?
        </h2>

        <p className="text-gray-700 mb-2">
          Çerez, bir web sitesi ziyaret edildiğinde cihazınıza kayıt edilen
          küçük metin dosyalarıdır.
        </p>
        <p className="text-gray-700 mb-6">
          Site’nin çalışması ve kullanıcı deneyiminin gelişmesi için kullanılır.
        </p>

        {/* 2 */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          2. Kullanılan Çerez Türleri
        </h2>

        <p className="font-semibold text-gray-700 mt-4">Zorunlu Çerezler</p>
        <ul className="list-disc list-inside text-gray-700 mb-3">
          <li>Üyelik girişinin sağlanması</li>
          <li>Güvenlik kontrolü</li>
          <li>Sayfa dolaşımı</li>
        </ul>

        <p className="font-semibold text-gray-700 mt-4">Performans Çerezleri</p>
        <ul className="list-disc list-inside text-gray-700 mb-3">
          <li>Hangi sayfaların ziyaret edildiğini tespit eder</li>
          <li>Hataları analiz eder</li>
        </ul>

        <p className="font-semibold text-gray-700 mt-4">Fonksiyonel Çerezler</p>
        <ul className="list-disc list-inside text-gray-700 mb-3">
          <li>Dil tercihi</li>
          <li>Kullanıcı oturum bilgileri</li>
        </ul>

        <p className="font-semibold text-gray-700 mt-4">
          Reklam / Pazarlama Çerezleri
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-6">
          <li>Kullanıcı davranışına göre gösterilen içerikler</li>
          <li>Kampanya optimizasyonu</li>
        </ul>

        {/* 3 */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          3. Çerezlerin Kullanım Amaçları
        </h2>

        <ul className="list-disc list-inside text-gray-700 mb-6">
          <li>Site’nin doğru çalışması</li>
          <li>Kullanıcı deneyiminin iyileştirilmesi</li>
          <li>Güvenlik ve dolandırıcılık tespiti</li>
          <li>Analiz ve performans ölçümü</li>
          <li>Reklam ve yeniden hedefleme kampanyaları</li>
          <li>Trafik ölçümleme</li>
        </ul>

        {/* 4 */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          4. Çerezleri Yönetme
        </h2>

        <p className="text-gray-700 mb-2">
          Tarayıcı ayarlarınızdan çerezleri:
        </p>

        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li>Engelleyebilir</li>
          <li>Silebilir</li>
          <li>Bazılarını kapatabilir</li>
          <li>Hepsini devre dışı bırakabilirsiniz</li>
        </ul>

        <p className="text-gray-700 mb-8">
          Çerezleri kapatmanız durumunda Site’nin bazı özellikleri çalışmayabilir.
        </p>

        <div className="text-sm text-gray-500 text-center">
          Geri dön →{" "}
          <Link href="/" className="text-primary hover:underline">
            Anasayfa
          </Link>
        </div>

      </div>
    </main>
  );
}
