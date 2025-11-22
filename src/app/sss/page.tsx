// app/sss/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular | tatilinidevret",
  description:
    "tatilinidevret hakkında en sık sorulan sorular ve yanıtları: ilan verme, onay süreci, ücretler, güvenlik, kurumsal üyelik ve daha fazlası.",
};

const faqs = [
  {
    q: "tatilinidevret nedir?",
    a: "Planları değişen kişilerin, kullanamayacakları tatil rezervasyonlarını başka kişilere devredebildiği bir ilan platformudur.",
  },
  {
    q: "Hangi tatiller devredilebilir?",
    a: "Otel rezervasyonları (isim değişikliğine izin veren), villa ve yazlık kiralamalar, Airbnb & Booking rezervasyonları, cruise turları, yurtiçi otobüs/ulaşım dahil olmayan tur paketleri, festival/konser gibi etkinlik+konaklama paketleri.",
  },
  {
    q: "Uçak bileti devredebilir miyim?",
    a: "Hayır. Şimdilik yalnızca uçaksız tatiller ve devredilebilir rezervasyonlar yayınlanabilmektedir.",
  },
  {
    q: "İlan vermek ücretli mi?",
    a: "İlk ilan 15 gün boyunca ücretsizdir. Sonrasında aylık 350 TL karşılığında ilan verebilirsiniz. İstersen ilanını öne çıkarabilir, vitrinde sergileyebilir veya özel rozetlerle dikkat çekebilirsiniz.",
  },
  {
    q: "İlanım nasıl onaylanıyor?",
    a: "Her ilan, yüklediğiniz voucher/rezervasyon belgesi kontrol edildikten sonra onaylanır ve yayına alınır.",
  },
  {
    q: "Ödemeyi tatilinidevret üzerinden mi alıyorum?",
    a: "Hayır. tatilinidevret sadece ilan platformudur. Devir işlemleri ve ödemeler tamamen tarafların sorumluluğundadır.",
  },
  {
    q: "Yanıltıcı veya sahte ilan görürsem ne yapmalıyım?",
    a: "İlan sayfasındaki “Rapor Et” butonunu kullanabilirsiniz. İnceleme sonrası sahte ilanlar yayından kaldırılır.",
  },
  {
    q: "İlanımın süresi dolunca ne olur?",
    a: "İlanınız yayından kalkar. Dilersen tekrar yenileyebilir ve ücret ödeyerek yeniden yayımlayabilirsiniz.",
  },
  {
    q: "Kurumsal üyelik var mı?",
    a: "Evet, villa sahipleri veya acenteler için özel paketler sunuyoruz. Detaylar için bizimle iletişime geçebilirsiniz.",
  },
  {
    q: "Üyelik bilgilerim güvende mi?",
    a: "Evet. KVKK kapsamında bilgileriniz gizli tutulur ve üçüncü kişilerle paylaşılmaz.",
  },
];

export default function SSSPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900">Sıkça Sorulan Sorular</h1>
        <p className="mt-2 text-gray-600">
          tatilinidevret hakkında aklına takılanları burada hızlıca bulabilirsin.
        </p>

        <div className="mt-8 space-y-3">
          {faqs.map((item, i) => (
            <details
              key={i}
              className="group rounded-2xl border border-gray-200 bg-white p-4 open:shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <span className="text-lg font-semibold text-gray-900">{item.q}</span>
                <span className="select-none rounded-full border px-2 py-0.5 text-sm text-gray-500 group-open:hidden">
                  +
                </span>
                <span className="select-none rounded-full border px-2 py-0.5 text-sm text-gray-500 hidden group-open:inline">
                  –
                </span>
              </summary>
              <div className="mt-3 text-gray-700 leading-relaxed">{item.a}</div>
            </details>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
          İhtiyacın olan yanıtı bulamadın mı?{" "}
          <a href="/iletisim" className="underline underline-offset-4">
            Bizimle iletişime geç
          </a>
          .
        </div>
      </section>
    </main>
  );
}
