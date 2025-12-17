"use client";

import Link from "next/link";

export default function IlanVermeKurallariPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">

        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          İlan Verme Kuralları
        </h1>

        <p className="text-gray-700 mb-6">
          TatiliniDevret.com’da verilen tüm ilanlar aşağıdaki kurallara tabidir.
        </p>

        {/* 1 */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          1. İlan İçeriği Doğru ve Gerçek Olmalıdır
        </h2>
        <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
          <li>Kullanıcı, girdiği tüm bilgilerin doğru olduğunu taahhüt eder.</li>
          <li>Yanlış bilgi ile ilan oluşturulması yasaktır.</li>
          <li>
            Yapılamayacak veya geçersiz bir rezervasyonun ilan edilmesi kabul
            edilemez.
          </li>
        </ul>

        {/* 2 */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          2. Satış Fiyatı Kuralları
        </h2>
        <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
          <li>Satış fiyatı kullanıcının ödemiş olduğu tutarı geçemez.</li>
          <li>
            Fazla fiyata satış yapmak sistem tarafından tespit edildiğinde ilan
            kaldırılır.
          </li>
          <li>
            Kullanıcı, ödenen tutarı gösteren belge yüklemek zorundadır.
          </li>
        </ul>

        {/* 3 */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          3. İlan Görselleri
        </h2>
        <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
          <li>Özgün olmalıdır.</li>
          <li>
            Rezervasyon belgesi, odanın türü ve tarih bilgilerini içerebilir.
          </li>
          <li>Telif hakkı ihlal eden görseller kullanılamaz.</li>
        </ul>

        {/* 4 */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          4. Mesajlaşma Kuralları
        </h2>
        <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
          <li>Hakaret, taciz ve tehdit yasaktır.</li>
          <li>
            Satıcı, alıcıyla şeffaf ve doğru bilgi paylaşmakla yükümlüdür.
          </li>
          <li>
            Mesaj geçmişi gerektiğinde delil olarak kullanılabilir.
          </li>
        </ul>

        {/* 5 */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          5. Dolandırıcılık ve Şüpheli İşlemler
        </h2>
        <p className="text-gray-700 mb-2">
          Aşağıdaki durumlarda ilan hemen askıya alınır:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
          <li>Yanlış bilgi verme</li>
          <li>Eksik veya sahte belge</li>
          <li>Şüpheli fiyat</li>
          <li>Tesisle uyuşmayan rezervasyon</li>
          <li>Çoklu hesap açma</li>
          <li>Farklı kişiler adına ilan verme</li>
        </ul>

        {/* 6 */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          6. Site’nin Yetkileri
        </h2>
        <p className="text-gray-700 mb-3">
          TatiliniDevret.com gerekli gördüğü her durumda:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
          <li>İlanı yayından kaldırabilir</li>
          <li>Üyeliği askıya alabilir veya kapatabilir</li>
          <li>Belgeleri inceleyebilir</li>
          <li>Resmi makamlara bilgi verebilir</li>
        </ul>

        <p className="text-gray-700 mb-8">
          Bu yetkiler tamamen Site’nin tek taraflı hakkıdır.
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
