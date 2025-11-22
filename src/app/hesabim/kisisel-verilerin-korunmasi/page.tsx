"use client";

export default function KVKPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-[900px] mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-4">
          🔒 Kişisel Verilerin Korunması
        </h1>
        <div className="bg-white p-6 rounded-xl border shadow-sm leading-relaxed text-gray-700 text-sm space-y-3">
          <p>
            tatilinidevret.com olarak, 6698 sayılı Kişisel Verilerin Korunması
            Kanunu (“KVKK”) kapsamında kişisel verilerinizin güvenliğini
            önemsiyoruz.
          </p>

          <p>
            Üyelik işlemleri, ilan yayınlama ve iletişim süreçlerinde
            paylaştığınız bilgiler yalnızca bu amaçlarla kullanılmakta olup,
            üçüncü kişilerle paylaşılmaz.
          </p>

          <p>
            Kullanıcı verileri, gerekli güvenlik önlemleri alınarak bulut
            sistemlerde (Firebase) saklanır. Dilediğiniz zaman hesabınızı
            silerek kişisel verilerinizin de silinmesini talep edebilirsiniz.
          </p>

          <p>
            Detaylı bilgi için bizimle{" "}
            <a
              href="mailto:info@tatilinidevret.com"
              className="text-primary hover:underline"
            >
              info@tatilinidevret.com
            </a>{" "}
            adresinden iletişime geçebilirsiniz.
          </p>
        </div>
      </div>
    </main>
  );
}
