"use client";

import Link from "next/link";

export default function GizlilikPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Gizlilik Politikası
        </h1>

        <p className="text-gray-700 mb-4">
          tatilinidevret.com olarak kullanıcılarımızın gizliliğine önem veriyoruz.
        </p>

        <p className="text-gray-700 mb-4">
          Kayıt sırasında ad, soyad, e-posta, telefon gibi temel bilgiler toplanır.
        </p>

        <p className="text-gray-700 mb-4">
          Bu bilgiler yalnızca üyelik doğrulama, ilan yayınlama ve iletişim için
          kullanılır.
        </p>

        <p className="text-gray-700 mb-4">
          Kullanıcı verileri üçüncü kişilerle paylaşılmaz, satılmaz.
        </p>

        <p className="text-gray-700 mb-4">
          Yasal zorunluluk hallerinde resmi kurumlarla paylaşılabilir.
        </p>

        <p className="text-gray-700 mb-4">
          Çerezler, site kullanım deneyimini geliştirmek ve istatistik tutmak
          amacıyla kullanılmaktadır.
        </p>

        <p className="text-gray-700 mb-4">
          Kullanıcı dilediği zaman hesabını silebilir, verilerinin silinmesini
          talep edebilir.
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
