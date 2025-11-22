type Card = { id: string; title: string; img: string; price?: string; location?: string };

const demo: Card[] = Array.from({ length: 12 }).map((_, i) => ({
  id: String(i + 1),
  title: ["Bodrum Villa 2+1", "Ayvalık Bungalow", "Karadeniz Tour", "Cruise Akdeniz", "Wellness & Spa", "Tekne Tatili"][i % 6],
  img: `https://picsum.photos/seed/tid-${i}/480/360`,
  price: `${(i + 3) * 1000}₺`,
  location: ["Bodrum", "Ayvalık", "Rize", "Mersin", "Sapanca", "Göcek"][i % 6]
}));

export default function Showcase() {
  return (
    <section className="bg-white rounded-xl border shadow-card">
      <div className="p-4 flex items-center justify-between border-b">
        <h3 className="font-semibold text-ink">Anasayfa Vitrini</h3>
        <a href="/ilanlar" className="text-primary hover:underline">Tüm vitrin ilanlarını göster</a>
      </div>

      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {demo.map((c) => (
          <a key={c.id} href={`/ilan/${c.id}`} className="group rounded-lg overflow-hidden border hover:shadow-card transition-shadow">
            <div className="aspect-[4/3] bg-gray-100">
              <img src={c.img} alt={c.title} className="h-full w-full object-cover group-hover:scale-[1.02] transition" />
            </div>
            <div className="p-3">
              <div className="line-clamp-1 font-semibold">{c.title}</div>
              <div className="text-sm text-ink/60">{c.location}</div>
              <div className="text-accent font-semibold mt-1">{c.price}</div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
