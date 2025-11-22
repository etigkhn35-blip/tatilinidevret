"use client";

export default function CerezlerPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-[900px] mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-4">🍪 Çerez Politikası</h1>
        <div className="bg-white p-6 rounded-xl border shadow-sm leading-relaxed text-gray-700 text-sm space-y-3">
          <p>
            tatilinidevret.com, kullanıcı deneyimini geliştirmek ve site
            performansını ölçmek amacıyla çerezler (cookies) kullanır.
          </p>

          <p>
            Bu çerezler; oturum yönetimi, güvenlik, istatistik ve tercihlerin
            hatırlanması için kullanılmaktadır. Tarayıcı ayarlarınızdan çerez
            kullanımını kısıtlayabilir veya silebilirsiniz.
          </p>

          <p>
            Çerezlerin devre dışı bırakılması, web sitesinin bazı
            özelliklerinin kısıtlanmasına neden olabilir.
          </p>

          <p>
            Detaylı bilgi için{" "}
            <a
              href="mailto:info@tatilinidevret.com"
              className="text-primary hover:underline"
            >
              info@tatilinidevret.com
            </a>{" "}
            adresine yazabilirsiniz.
          </p>
        </div>
      </div>
    </main>
  );
}
