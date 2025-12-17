export default function HeroBanner() {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="relative w-full h-[260px] rounded-xl overflow-hidden border shadow-card">
          {/* İstersen gerçek reklam yerleştireceksin. Şimdilik placeholder: */}
          <div className="absolute inset-0 bg-[url('/banner-demo.jpg')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-black/10" />
          <div className="absolute left-6 bottom-6 text-white">
            <div className="text-2xl font-bold">Reklam Alanı / Banner</div>
            <div className="opacity-90">1200×260 önerilir</div>
          </div>
        </div>
      </div>
    </section>
  );
}
