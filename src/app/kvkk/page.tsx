"use client";

import Link from "next/link";

export default function KvkkPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          KVKK Aydınlatma Metni
        </h1>

        {/* --- 1. VERİ SORUMLUSU --- */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          1. Veri Sorumlusu
        </h2>
        <p className="text-gray-700 mb-2">
          Veri Sorumlusu: <b>M&G Digital Agency – Tatilini Devret</b>
        </p>
        <p className="text-gray-700 mb-2">Adres: Bodrum, Türkiye</p>
        <p className="text-gray-700 mb-2">E-posta: info@tatilinidevret.com</p>
        <p className="text-gray-700 mb-4">Telefon: +90 XXX XXX XX XX</p>

        {/* --- 2. HANGİ KİŞİSEL VERİLER İŞLENİR --- */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          2. Hangi Kişisel Veriler İşlenmektedir?
        </h2>

        <p className="text-gray-700 mb-1 font-semibold">Kimlik Bilgileri</p>
        <ul className="list-disc list-inside text-gray-700 mb-3">
          <li>Ad, soyad</li>
          <li>Doğum tarihi</li>
        </ul>

        <p className="text-gray-700 mb-1 font-semibold">İletişim Bilgileri</p>
        <ul className="list-disc list-inside text-gray-700 mb-3">
          <li>Telefon numarası</li>
          <li>E-posta adresi</li>
          <li>IP bilgisi, cihaz bilgisi</li>
        </ul>

        <p className="text-gray-700 mb-1 font-semibold">Hesap ve İşlem Bilgileri</p>
        <ul className="list-disc list-inside text-gray-700 mb-3">
          <li>Üyelik bilgileri</li>
          <li>Giriş–çıkış saatleri</li>
          <li>İlan verme geçmişi</li>
          <li>Mesajlaşma içerikleri</li>
          <li>
            Belgeler (kullanıcı yüklediği takdirde): rezervasyon onayı, voucher, ödeme
            dekontu
          </li>
        </ul>

        <p className="text-gray-700 mb-1 font-semibold">İşlem Güvenliği Verileri</p>
        <ul className="list-disc list-inside text-gray-700 mb-3">
          <li>IP log kayıtları</li>
          <li>Çerez kayıtları</li>
          <li>Tarayıcı bilgileri</li>
          <li>Cihaz bilgileri</li>
        </ul>

        <p className="text-gray-700 mb-1 font-semibold">Finansal Veriler</p>
        <ul className="list-disc list-inside text-gray-700 mb-6">
          <li>Kullanıcının kendi ilanında belirttiği fiyat bilgisi</li>
          <li>Platform içi hareketler (Site ödeme almamaktadır.)</li>
        </ul>

        {/* --- 3. İŞLEME AMAÇLARI --- */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          3. Kişisel Verilerin İşlenme Amaçları
        </h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
          <li>Üyelik oluşturma, giriş yapma, doğrulama</li>
          <li>İlan yayınlama ve düzenleme</li>
          <li>Dolandırıcılık ve kötüye kullanımın önlenmesi</li>
          <li>Site güvenliğinin sağlanması</li>
          <li>Yasal yükümlülüklerin yerine getirilmesi</li>
          <li>Hizmet kalitesinin artırılması</li>
          <li>Müşteri destek süreçleri</li>
          <li>Hukuki uyuşmazlıklarda delil olarak kullanılabilmesi</li>
          <li>Üyelere bilgilendirme yapılması (e-posta, SMS vb.)</li>
          <li>Reklam, pazarlama ve kullanıcı deneyimi geliştirme</li>
        </ul>

        {/* --- 4. VERİ AKTARIMI --- */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          4. Kişisel Verilerin Aktarılması
        </h2>
        <p className="text-gray-700 mb-3">
          Kişisel verileriniz aşağıdaki kişi ve kurumlara aktarılabilir:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
          <li>Yasal merciler (mahkemeler, savcılıklar, BTK vb.)</li>
          <li>Teknik hizmet sağlayıcılar (hosting, yazılım firmaları, SMS/e-posta hizmetleri)</li>
          <li>Alıcı–Satıcı taraf (kullanıcının kendi ilanında paylaştığı bilgiler)**</li>
          <li>Yetkili kamu kurumları</li>
        </ul>

        <p className="text-gray-700 mb-4">
          <b>TatiliniDevret.com kişisel verilerinizi kesinlikle satmaz, pazarlamaz veya izinsiz paylaşmaz.</b>
        </p>

        {/* --- 5. HUKUKİ SEBEPLER --- */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          5. Kişisel Veri Toplama Yöntemi ve Hukuki Sebepler
        </h2>

        <p className="text-gray-700">Kişisel verileriniz;</p>
        <ul className="list-disc list-inside text-gray-700 mb-3">
          <li>Üyelik formu</li>
          <li>İlan verme süreci</li>
          <li>Belgelerin yüklenmesi</li>
          <li>Çerezler</li>
          <li>Site üzerindeki tüm hareketler</li>
        </ul>

        <p className="text-gray-700">Hukuki sebepler:</p>
        <ul className="list-disc list-inside text-gray-700 mb-6">
          <li>KVKK md. 5/2 – Sözleşmenin kurulması/ifası</li>
          <li>Meşru menfaat</li>
          <li>Kanuni yükümlülük</li>
          <li>Açık rıza (gerekli durumlarda)</li>
        </ul>

        {/* --- 6. KVKK HAKLARI --- */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          6. KVKK Kapsamındaki Haklarınız
        </h2>

        <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
          <li>İşlenip işlenmediğini öğrenme</li>
          <li>İşlenmişse bilgi talep etme</li>
          <li>Amacına uygun kullanılıp kullanılmadığını öğrenme</li>
          <li>Aktarıldığı üçüncü kişileri bilme</li>
          <li>Düzeltme talep etme</li>
          <li>Silinmesini veya yok edilmesini isteme</li>
          <li>İşlemenin kısıtlanmasını talep etme</li>
          <li>Otomatik analiz sonucu aleyhinize bir durum oluşursa itiraz etme</li>
        </ul>

        <p className="text-gray-700 mb-10">
          KVKK talepleriniz için: <b>kvkk@tatilinidevret.com</b>
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
