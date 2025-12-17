"use client";

import Link from "next/link";

export default function AcikRizaMetniPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">

        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Açık Rıza Metni
        </h1>

        <p className="text-gray-700 mb-4 font-semibold">
          Tatilini Devret Açık Rıza Beyanı
        </p>

        <p className="text-gray-700 mb-6">
          KVKK kapsamında, aşağıdaki hususlarda açık rıza vermeniz gereken
          durumlar bulunmaktadır. Üye olarak aşağıdaki koşulları kabul etmiş
          sayılırsınız.
        </p>

        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          Açık Rızanın Kapsamı
        </h2>

        <ul className="list-decimal list-inside text-gray-700 mb-6 space-y-1">
          <li>Kişisel verilerimin hizmet sunulması amacıyla işlenmesine</li>
          <li>
            Yüklediğim belge ve görsellerde yer alan kişisel verilerin
            kaydedilmesine ve saklanmasına
          </li>
          <li>IP ve çerez bilgilerimin analiz edilmesine</li>
          <li>
            Reklam, kampanya, bildirim ve pazarlama iletişimlerinde
            kullanılmasına
          </li>
          <li>
            Hizmet sağlayıcı firmalara aktarılmasına
            (hosting, bulut, SMS servisleri vb.)
          </li>
          <li>
            Hukuki yükümlülükler kapsamında resmi kurumlarla paylaşılmasına
          </li>
        </ul>

        <p className="text-gray-700 mb-6">
          açık rıza veriyorum.
        </p>

        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          Rızanın Geri Alınması
        </h2>

        <p className="text-gray-700 mb-4">
          Dilediğiniz zaman{" "}
          <b>kvkk@tatilinidevret.com</b> adresine yazarak açık rızanızı geri
          çekebilirsiniz.
        </p>

        <p className="text-gray-700 mb-8">
          Geri çekme işlemi geçmişteki işlemleri etkilemez; sadece ileriye
          dönük etkili olur.
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
