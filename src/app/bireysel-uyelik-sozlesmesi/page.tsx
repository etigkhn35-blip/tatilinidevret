"use client";

import Link from "next/link";

export default function BireyselUyelikSozlesmesiPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Bireysel Üyelik Sözleşmesi
        </h1>

        <p className="text-sm text-gray-500 mb-6">
          (Güncel Versiyon – 2025)
        </p>

        <p className="text-gray-700 mb-6">
          İşbu Bireysel Üyelik Sözleşmesi (“Sözleşme”), www.tatilinidevret.com alan
          adlı internet sitesi ve/veya mobil uygulama (“TatiliniDevret” veya
          “Site”) üzerinden sunulan hizmetlerden yararlanmak amacıyla Site’ye
          üye olan gerçek kişi kullanıcı (“Üye”) ile M&amp;G Digital Agency
          bünyesinde faaliyet gösteren Tatilini Devret markası (“Şirket”)
          arasında elektronik ortamda akdedilmiştir.
        </p>

        <p className="text-gray-700 mb-8">
          Üye, işbu Sözleşme’yi elektronik olarak onaylayarak aşağıdaki şartları
          tamamen okuduğunu, anladığını ve tüm maddeleri kayıtsız şartsız kabul
          ettiğini beyan eder.
        </p>

        {/* 1 */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          1. Tanımlar
        </h2>
        <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
          <li><b>Site:</b> TatiliniDevret.com adresli internet sitesi ve tüm mobil uygulamaları.</li>
          <li><b>Üye:</b> Site’ye kayıt olan gerçek kişi.</li>
          <li><b>Ziyaretçi:</b> Site’ye üye olmadan erişen kişi.</li>
          <li>
            <b>Hizmet:</b> Üyelerin tatil, otel rezervasyonu, uçak bileti,
            kampanyalı tatil paketi ve benzeri haklarını ilana koyması; diğer
            kullanıcıların bu ilanlara erişebilmesi, arama, filtreleme,
            mesajlaşma veya iletişim kurma hizmetleri.
          </li>
          <li><b>İlan Sahibi:</b> Kendi adına ilan yayınlayan Üye.</li>
          <li><b>Alıcı:</b> İlanı satın almak veya devralmak isteyen Üye.</li>
          <li><b>İçerik:</b> Site’ye yüklenen her türlü ilan, açıklama, görsel, belge ve mesaj.</li>
        </ul>

        {/* 2 */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          2. Sözleşmenin Konusu ve Kapsamı
        </h2>
        <p className="text-gray-700 mb-2">
          Bu Sözleşme, Site üzerinden sunulan hizmetlerin kullanım koşullarını
          düzenler.
        </p>
        <p className="text-gray-700 mb-2">
          TatiliniDevret.com yalnızca ilan yayınlama platformudur.
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
          <li>Aracı, komisyoncu, seyahat acentesi, tur operatörü, satıcı veya garantör değildir.</li>
          <li>Üyeler arasındaki hiçbir işlemde taraf değildir.</li>
          <li>Alım–satımın doğruluğunu, geçerliliğini veya iptalini garanti etmez.</li>
          <li>Üyeler arasındaki anlaşmazlıklarda sorumluluk kabul etmez.</li>
        </ul>

        {/* 3 */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          3. Üyelik Koşulları
        </h2>
        <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
          <li>Üye, verdiği bilgilerin doğru ve güncel olduğunu beyan eder.</li>
          <li>Üye yalnızca kendisi adına işlem yapabilir.</li>
          <li>Aynı kişinin birden fazla hesap oluşturması yasaktır.</li>
          <li>Hesap ve şifre güvenliği tamamen Üyenin sorumluluğundadır.</li>
        </ul>

        {/* 4 */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          4. TatiliniDevret.com’un Rolü ve Sorumluluk Sınırı
        </h2>
        <p className="text-gray-700 mb-4">
          Site yalnızca ilan sergileme hizmeti sunar. İlanların tüm içeriği,
          doğruluğu ve hukuka uygunluğu İlan Sahibinin sorumluluğundadır.
        </p>
        <p className="text-gray-700 mb-6">
          Alıcı ve Satıcı, aralarındaki tüm mali ve hukuki sorumlulukların
          yalnızca kendilerine ait olduğunu kabul eder.
        </p>

        {/* 5 */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          5. İlan Yayınlama Kuralları
        </h2>
        <p className="text-gray-700 mb-6">
          Üye, ilan verirken doğru belge yüklemekle, yanıltıcı veya sahte içerik
          paylaşmamakla yükümlüdür. Şirket, gerekli gördüğü ilanları gerekçe
          göstermeksizin kaldırma veya Üyeliği sonlandırma hakkına sahiptir.
        </p>

        {/* 6 */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          6. Ücretlendirme ve Hizmet Bedeli
        </h2>
        <p className="text-gray-700 mb-6">
          TatiliniDevret, hizmetlerini ücretsiz veya ücretli sunma hakkını saklı
          tutar. Üyeler arasındaki işlemlerden Site komisyon almaz.
        </p>

        {/* 7 */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          7. Kullanıcı Davranış Kuralları
        </h2>
        <p className="text-gray-700 mb-6">
          Üye, Site’yi hukuka aykırı, yanıltıcı veya dolandırıcılık amacıyla
          kullanmayacağını kabul eder.
        </p>

        {/* 8 */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          8. Kişisel Verilerin Korunması (KVKK)
        </h2>
        <p className="text-gray-700 mb-6">
          Üyenin kişisel verileri 6698 sayılı KVKK kapsamında işlenir. Aydınlatma
          Metni ve Çerez Politikası bu Sözleşme’nin ayrılmaz parçasıdır.
        </p>

        {/* 9–14 özet */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          9–14. Diğer Hükümler
        </h2>
        <p className="text-gray-700 mb-8">
          Fikri mülkiyet hakları, sorumluluğun sınırlandırılması, hesabın sona
          ermesi, sözleşme değişiklikleri, uygulanacak hukuk ve yürürlük
          hükümleri işbu Sözleşme kapsamında düzenlenmiştir.
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
