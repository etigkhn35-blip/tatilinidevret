"use client";

import Link from "next/link";

export default function KvkkPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">

        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          KVKK AYDINLATMA METNİ
        </h1>

        <p className="text-gray-700 mb-6 font-medium">
          Tatilini Devret – 6698 Sayılı KVKK Kapsamında Aydınlatma Metni
        </p>

        <p className="text-gray-700 mb-6">
          TatiliniDevret.com olarak kişisel verilerin korunmasını ve gizliliğini
          önemsiyoruz. İşbu Aydınlatma Metni, 6698 sayılı Kişisel Verilerin
          Korunması Kanunu (“KVKK”) gereğince kişisel verilerinizin hangi
          amaçlarla, hangi yöntemlerle işlendiği, kimlere aktarıldığı ve sahip
          olduğunuz hakları açıklamak amacıyla hazırlanmıştır.
        </p>

        {/* 1. Veri Sorumlusu */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          1. Veri Sorumlusu
        </h2>
        <p className="text-gray-700">Veri Sorumlusu: M&G Digital Agency – Tatilini Devret</p>
        <p className="text-gray-700">Adres: Bodrum, Türkiye</p>
        <p className="text-gray-700">E-posta: info@tatilinidevret.com</p>
        <p className="text-gray-700 mb-6">Telefon: +90 XXX XXX XX XX</p>

        {/* 2. Hangi Kişisel Veriler İşlenmektedir */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          2. Hangi Kişisel Veriler İşlenmektedir?
        </h2>
        <p className="text-gray-700 mb-3">
          TatiliniDevret.com kullanımınız sırasında aşağıda yer alan veriler
          işlenir:
        </p>

        <p className="font-semibold text-gray-700">Kimlik Bilgileri</p>
        <ul className="list-disc list-inside text-gray-700 mb-3">
          <li>Ad, soyad</li>
          <li>Doğum tarihi</li>
        </ul>

        <p className="font-semibold text-gray-700">İletişim Bilgileri</p>
        <ul className="list-disc list-inside text-gray-700 mb-3">
          <li>Telefon numarası</li>
          <li>E-posta adresi</li>
          <li>IP bilgisi, cihaz bilgisi</li>
        </ul>

        <p className="font-semibold text-gray-700">Hesap ve İşlem Bilgileri</p>
        <ul className="list-disc list-inside text-gray-700 mb-3">
          <li>Üyelik bilgileri</li>
          <li>Giriş–çıkış saatleri</li>
          <li>İlan verme geçmişi</li>
          <li>Mesajlaşma içerikleri</li>
          <li>
            Belgeler: Rezervasyon onayı, voucher, ödeme dekontu (kullanıcının
            yüklemesi halinde)
          </li>
        </ul>

        <p className="font-semibold text-gray-700">İşlem Güvenliği Verileri</p>
        <ul className="list-disc list-inside text-gray-700 mb-3">
          <li>IP log kayıtları</li>
          <li>Çerez kayıtları</li>
          <li>Tarayıcı bilgileri</li>
          <li>Cihaz bilgileri</li>
        </ul>

        <p className="font-semibold text-gray-700">Finansal Veriler</p>
        <ul className="list-disc list-inside text-gray-700 mb-6">
          <li>Kullanıcının kendi ilanında belirttiği fiyat bilgisi</li>
          <li>İşleme dair platform içi hareketler (Site ödeme almamaktadır.)</li>
        </ul>

        {/* 3. Kişisel Verilerin İşlenme Amaçları */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          3. Kişisel Verilerin İşlenme Amaçları
        </h2>
        <p className="text-gray-700 mb-2">Kişisel verileriniz;</p>
        <ul className="list-disc list-inside text-gray-700 mb-6">
          <li>Üyelik oluşturma, giriş yapma, doğrulama</li>
          <li>İlan yayınlama ve düzenleme işlemlerinin yürütülmesi</li>
          <li>Dolandırıcılık, sahtecilik ve kötüye kullanımın önlenmesi</li>
          <li>Site güvenliğinin sağlanması</li>
          <li>Yasal yükümlülüklerin yerine getirilmesi</li>
          <li>Hizmet kalitesinin artırılması</li>
          <li>Müşteri destek süreçleri</li>
          <li>Hukuki uyuşmazlıklarda delil niteliği taşıması</li>
          <li>Üyelere bilgilendirme yapılması (e-posta, SMS, bildirim)</li>
          <li>Reklam, pazarlama ve kullanıcı deneyimi iyileştirme</li>
        </ul>

        {/* 4. Kişisel Verilerin Aktarılması */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          4. Kişisel Verilerin Aktarılması
        </h2>
        <p className="text-gray-700 mb-3">
          Kişisel verileriniz aşağıdaki kişi ve kurumlara aktarılabilir:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li>Yasal merciler (mahkemeler, savcılıklar, BTK vb.)</li>
          <li>Alıcı–Satıcı taraf (sadece kullanıcı kendi ilanında paylaştıysa)</li>
          <li>Yetkili kurum ve kuruluşlar</li>
        </ul>

        <p className="text-gray-700 mb-6 font-semibold">
          TatiliniDevret.com kişisel verilerinizi kesinlikle satmaz, pazarlamaz
          veya izinsiz paylaşmaz.
        </p>

        {/* 5. Kişisel Veri Toplama Yöntemi ve Hukuki Sebepler */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          5. Kişisel Veri Toplama Yöntemi ve Hukuki Sebepler
        </h2>
        <p className="text-gray-700 mb-2">Kişisel verileriniz;</p>
        <ul className="list-disc list-inside text-gray-700 mb-3">
          <li>Üyelik formu</li>
          <li>İlan verme adımları</li>
          <li>Belgelerin yüklenmesi</li>
          <li>Çerezler</li>
          <li>
            Site üzerinde yapılan her hareket aracılığıyla otomatik veya manuel
            yollarla elde edilir.
          </li>
        </ul>

        <p className="text-gray-700 mb-2">Hukuki sebepler:</p>
        <ul className="list-disc list-inside text-gray-700 mb-6">
          <li>KVKK md. 5/2 (Sözleşmenin kurulması ve ifası)</li>
          <li>Meşru menfaat</li>
          <li>Kanuni yükümlülük</li>
          <li>Açık rıza (gerekli durumlarda)</li>
        </ul>

        {/* 6. KVKK Hakları */}
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          6. KVKK Kapsamındaki Haklarınız
        </h2>
        <p className="text-gray-700 mb-2">
          KVKK md.11 kapsamında kişisel verilerinizle ilgili şu haklara sahipsiniz:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-6">
          <li>İşlenip işlenmediğini öğrenme</li>
          <li>İşlenmişse bilgi talep etme</li>
          <li>Amacına uygun kullanılıp kullanılmadığını öğrenme</li>
          <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
          <li>Eksik veya yanlış işlenen verinin düzeltilmesini isteme</li>
          <li>Silinmesini veya yok edilmesini talep etme</li>
          <li>İşlemenin kısıtlanmasını isteme</li>
          <li>
            Otomatik sistemlerce analiz edilmesi sonucu aleyhinize bir durum
            oluşursa itiraz etme
          </li>
        </ul>

        <p className="text-gray-700 mb-8">
          Talepleriniz için: <b>kvkk@tatilinidevret.com</b>
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
