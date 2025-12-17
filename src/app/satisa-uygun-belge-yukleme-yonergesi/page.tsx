"use client";

import Link from "next/link";

export default function SatisaUygunBelgeYuklemeYonergesiPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">

        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Satışa Uygun Belge Yükleme Yönergesi
        </h1>

        <p className="text-gray-700 mb-4 font-semibold">
          TatiliniDevret.com Satışa Uygun Belge Yükleme Yönergesi
        </p>

        <p className="text-gray-700 mb-6">
          TatiliniDevret.com’da ilan verirken yüklenen belge ve görüntülerin
          kurallara uygun, anlaşılır ve doğrulanabilir olması zorunludur.
          Aşağıdaki yönerge tüm ilan sahipleri için geçerlidir.
        </p>

        {/* 1 */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          1. Zorunlu Yüklenmesi Gereken Belgeler
        </h2>
        <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
          <li>Voucher veya Rezervasyon Onayı</li>
          <li>Ödeme Dekontu (ödenen tutarın net görünmesi gerekir)</li>
          <li>Tesis / otel tarafından gönderilen resmi onay</li>
          <li>
            Kişi bilgileri gizlenmiş olsa bile rezervasyon detaylarını içeren belge
          </li>
        </ul>

        {/* 2 */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          2. Belge Yükleme Kuralları
        </h2>
        <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
          <li>Görseller net ve okunabilir olmalıdır.</li>
          <li>Belge üzerinde oynama yapılmamış olmalıdır.</li>
          <li>PDF veya fotoğraf (.jpeg, .png) formatı kullanılabilir.</li>
          <li>
            Belgede tarih, fiyat, tesis adı ve rezervasyon bilgileri açıkça
            görünmelidir.
          </li>
          <li>Karşı tarafı yanıltacak manipülatif düzenlemeler yasaktır.</li>
          <li>
            Belgelerdeki özel bilgiler (TC kimlik no, adres vb.) kullanıcı
            tarafından gizlenebilir.
          </li>
        </ul>

        {/* 3 */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          3. Yasaklanmış Belge Türleri
        </h2>
        <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
          <li>Sahte, manipüle edilmiş veya üzerinde değişiklik yapılmış belgeler</li>
          <li>Başka kişilere ait belgenin izinsiz yüklenmesi</li>
          <li>Bulanık veya okunamaz belgeler</li>
          <li>
            Belge niteliği taşımayan ekran görüntüleri
            (WhatsApp yazışması, not defteri ekranı vb.)
          </li>
        </ul>

        {/* 4 */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          4. Belge İnceleme Süreci
        </h2>
        <p className="text-gray-700 mb-3">
          TatiliniDevret.com gerekli gördüğü durumlarda:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
          <li>Belgeleri doğrulamak için tesis / otel ile iletişime geçebilir</li>
          <li>Belgeleri yetersiz bulduğunda ilanı askıya alabilir</li>
          <li>Kullanıcı hesabını kapatabilir</li>
        </ul>

        <p className="text-gray-700 mb-8">
          Bu işlemler tamamen Site takdirindedir.
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


