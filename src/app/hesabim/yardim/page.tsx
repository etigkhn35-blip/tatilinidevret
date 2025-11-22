"use client";

import { useState } from "react";
import Link from "next/link";

export default function YardimPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const toggleFAQ = (i: number) =>
    setFaqOpen((prev) => (prev === i ? null : i));

  const faqs = [
    {
      q: "tatilinidevret nedir?",
      a: "Planları değişen kişilerin, kullanamayacakları tatil rezervasyonlarını başka kişilere devredebildiği bir ilan platformudur.",
    },
    {
      q: "Hangi tatiller devredilebilir?",
      a: `• Otel rezervasyonları (isim değişikliğine izin veren)
• Villa ve yazlık kiralamalar
• Airbnb & Booking rezervasyonları
• Cruise turları
• Yurtiçi otobüs/ulaşım dahil olmayan tur paketleri
• Festival/konser gibi etkinlik+konaklama paketleri`,
    },
    {
      q: "Uçak bileti devredebilir miyim?",
      a: "Hayır. Şimdilik yalnızca uçaksız tatiller ve devredilebilir rezervasyonlar yayınlanabilmektedir.",
    },
    {
      q: "İlan vermek ücretli mi?",
      a: `İlk ilan 15 gün boyunca ücretsizdir.
Sonrasında aylık 350 TL karşılığında ilan verebilirsiniz.
İstersen ilanını öne çıkarabilir, vitrinde sergileyebilir veya özel rozetlerle dikkat çekebilirsiniz.`,
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

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-[900px] mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">💡 Yardım ve İşlem Rehberi</h1>

        {/* SSS Bölümü */}
        <section className="bg-white border rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Sıkça Sorulan Sorular (SSS)</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border rounded-lg">
                <button
                  onClick={() => toggleFAQ(i)}
                  className="w-full text-left px-4 py-3 font-semibold text-gray-800 hover:bg-gray-50 flex justify-between items-center"
                >
                  {faq.q}
                  <span className="text-gray-500 text-lg">
                    {faqOpen === i ? "−" : "+"}
                  </span>
                </button>
                {faqOpen === i && (
                  <div className="px-4 pb-3 text-gray-600 text-sm leading-relaxed border-t whitespace-pre-line">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Alt bilgi */}
        <div className="text-center text-sm text-gray-500 mt-8">
          Yardımcı olmadı mı?{" "}
          <Link
            href="/hesabim/geri-bildirim"
            className="text-primary hover:underline font-semibold"
          >
            Bizimle iletişime geçin
          </Link>
        </div>

        <div className="text-center text-sm text-gray-400 mt-4">
          <Link href="/hesabim" className="hover:underline">
            ← Hesabım Sayfasına Dön
          </Link>
        </div>
      </div>
    </main>
  );
}
