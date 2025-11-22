type Ilan = {
  kategori?: string;
  baslik: string;
  lokasyon?: string;
  fiyat: number | string;
  coverUrl?: string;       // varsa öncelikli kullan
};

const categoryImages: Record<string, string> = {
  konaklama: "/images/konaklama.jpg",
  deneyim: "/images/deneyim.jpg",
  turlar: "/images/turlar.jpg",
  etkinlik: "/images/etkinlik.jpg",
};

export default function ListingCard({ ilan }: { ilan: Ilan }) {
  const key = (ilan.kategori || "").toLowerCase();
  const img = ilan.coverUrl || categoryImages[key] || "/images/default.jpg";

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition bg-white">
      <img src={img} alt={ilan.kategori || "kategori"} className="h-48 w-full object-cover" />
      <div className="p-4">
        <h3 className="font-semibold text-gray-900">{ilan.baslik}</h3>
        <p className="text-gray-600 text-sm">{ilan.lokasyon}</p>
        <p className="text-[#FF6B00] font-bold mt-2">{ilan.fiyat}</p>
      </div>
    </div>
  );
}