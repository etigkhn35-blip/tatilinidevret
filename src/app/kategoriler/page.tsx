// src/app/kategoriler/page.tsx
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Kategoriler | tatilinidevret.com",
  description:
    "Konaklama, Deneyim Tatilleri, Turlar ve Etkinlik paketlerinde fırsatları keşfedin.",
};

// ---- Tipler ----
type SubCategory = {
  slug: string;
  title: string;
};

type Category = {
  slug: string;
  title: string;
  icon?: string; // public/ altında svg/png olabilir (opsiyonel)
  children?: SubCategory[];
};

// ---- Güvenli veri yükleyici ----
// @/lib/categories mevcutsa onu kullanır; bulunamazsa yerel yedek veri döner.
async function loadCategories(): Promise<Category[]> {
  try {
    // dinamik import: derleme anında zorunlu bağımlılık yaratmaz
    const mod: any = await import("@/lib/categories");
    // destek: export const kategoriler = [...] veya export default [...]
    const list: Category[] = (mod?.kategoriler || mod?.default || []) as Category[];
    if (Array.isArray(list) && list.length > 0) return list;
  } catch {
    // yoksay: fallback'e düş
  }

  // ---- Yerel yedek veri (senin verdiğin yapı) ----
  const fallback: Category[] = [
    {
      slug: "konaklama",
      title: "🏨 Konaklama",
      children: [
        { slug: "otel", title: "Otel" },
        { slug: "villa-yazlik", title: "Villa / Yazlık" },
        { slug: "airbnb-booking", title: "Airbnb & Booking Rezervasyonları" },
        { slug: "bungalow-tiny-house", title: "Bungalow / Tiny House" },
        { slug: "dag-yayla-evi", title: "Dağ / Yayla Evi" },
      ],
    },
    {
      slug: "deneyim-tatilleri",
      title: "🌿 Deneyim Tatilleri",
      children: [
        { slug: "tekne-yat", title: "Tekne / Yat" },
        { slug: "cruise-gemi-turlari", title: "Cruise (Gemi Turları)" },
        { slug: "kamp-glamping", title: "Kamp / Glamping" },
        { slug: "wellness-spa", title: "Wellness & Spa" },
        { slug: "yoga-retreat", title: "Yoga / Retreat" },
      ],
    },
    {
      slug: "turlar",
      title: "🚌 Turlar",
      children: [
        { slug: "kultur-turlari", title: "Kültür Turları" },
        { slug: "doga-trekking", title: "Doğa & Trekking" },
        { slug: "karadeniz-gap", title: "Karadeniz / GAP Turları" },
        { slug: "kayak-turlari", title: "Kayak Turları" },
      ],
    },
    {
      slug: "etkinlik-paketleri",
      title: "🎟️ Etkinlik Paketleri",
      children: [
        { slug: "festival-konaklama", title: "Festival + Konaklama" },
        { slug: "konser-konaklama", title: "Konser + Konaklama" },
        { slug: "spor-otel", title: "Spor Etkinliği + Otel" },
        { slug: "kultur-sanat-otel", title: "Kültür & Sanat + Otel" },
      ],
    },
  ];

  return fallback;
}

// ---- Yardımcı: kategori/alt kategori yolu ----
function buildCategoryHref(categorySlug: string, subSlug?: string) {
  // /kategori/[kategoriAdi]/[slug?] yapısı varsa:
  return subSlug
    ? `/kategori/${encodeURIComponent(categorySlug)}/${encodeURIComponent(subSlug)}`
    : `/kategori/${encodeURIComponent(categorySlug)}`;
}

// ---- Sayfa (Server Component) ----
export default async function KategorilerPage() {
  const categories = await loadCategories();

  return (
    <main className="min-h-screen bg-white">
      {/* Üst başlık / Hero */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Kategoriler
          </h1>
          <p className="mt-2 text-gray-600">
            Tatilini devret fırsatlarını kategorilere göre keşfet.
          </p>
        </div>
      </section>

      {/* İki sütun: sol kategori listesi, sağ vitrin (placeholder) */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* SOL: Kategoriler */}
          <aside className="lg:col-span-4">
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="px-5 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Tüm Kategoriler</h2>
              </div>

              <nav className="divide-y divide-gray-100">
                {categories.map((cat) => (
                  <div key={cat.slug} className="p-5">
                    <div className="mb-2 flex items-center gap-2">
                      {cat.icon ? (
                        <Image
                          src={cat.icon}
                          alt={cat.title}
                          width={20}
                          height={20}
                          className="h-5 w-5"
                        />
                      ) : (
                        <span aria-hidden className="text-lg">•</span>
                      )}
                      <Link
                        href={buildCategoryHref(cat.slug)}
                        className="text-base font-semibold text-gray-900 hover:text-primary"
                      >
                        {cat.title}
                      </Link>
                    </div>

                    {Array.isArray(cat.children) && cat.children.length > 0 && (
                      <ul className="ml-6 mt-2 space-y-2">
                        {cat.children.map((sub) => (
                          <li key={`${cat.slug}-${sub.slug}`}>
                            <Link
                              href={buildCategoryHref(cat.slug, sub.slug)}
                              className="inline-block text-gray-700 hover:text-primary"
                            >
                              {sub.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          {/* SAĞ: Vitrin / Son eklenenler (şimdilik placeholder) */}
          <section className="lg:col-span-8">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Son Eklenenler / Vitrin
                </h3>
                <Link
                  href="/ilanlar"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Tümünü Gör
                </Link>
              </div>

              {/* Buraya gerçek vitrini bağlayacağız (ilan kartları vs.) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {/* Placeholder kart */}
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="aspect-[16/9] w-full rounded-md bg-gray-100" />
                  <div className="mt-3">
                    <div className="text-sm text-gray-500">Örnek Kategori</div>
                    <div className="text-base font-semibold text-gray-900">
                      Örnek İlan Başlığı
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <Link
                        href="/ilan/ornek"
                        className="text-sm text-primary hover:underline"
                      >
                        İncele
                      </Link>
                      <div className="text-sm font-medium text-gray-900">₺9.999</div>
                    </div>
                  </div>
                </div>

                {/* 2. placeholder */}
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="aspect-[16/9] w-full rounded-md bg-gray-100" />
                  <div className="mt-3">
                    <div className="text-sm text-gray-500">Örnek Kategori</div>
                    <div className="text-base font-semibold text-gray-900">
                      Başlık / Otel / Villa
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <Link
                        href="/ilan/ornek-2"
                        className="text-sm text-primary hover:underline"
                      >
                        İncele
                      </Link>
                      <div className="text-sm font-medium text-gray-900">₺7.450</div>
                    </div>
                  </div>
                </div>

                {/* 3. placeholder */}
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="aspect-[16/9] w-full rounded-md bg-gray-100" />
                  <div className="mt-3">
                    <div className="text-sm text-gray-500">Örnek Kategori</div>
                    <div className="text-base font-semibold text-gray-900">
                      Yazlık / 5 Gece
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <Link
                        href="/ilan/ornek-3"
                        className="text-sm text-primary hover:underline"
                      >
                        İncele
                      </Link>
                      <div className="text-sm font-medium text-gray-900">₺5.900</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Not: Buradaki placeholder kısmını, Firestore’dan
                  gerçek “approved” ilanlarla dolduracağız. */}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
