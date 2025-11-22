"use client";

export default function HakkindaPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-[900px] mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-4">ℹ️ Hakkında</h1>
        <div className="bg-white p-6 rounded-xl border shadow-sm leading-relaxed text-gray-700 text-sm">
          <p>
            <b>tatilinidevret.com</b>, kullanılmayacak tatil rezervasyonlarını
            güvenli şekilde devretmeyi sağlayan ilan platformudur.  
            Tatil planı değişen kişiler, otel, villa veya etkinlik
            rezervasyonlarını başka üyelere kolayca devredebilirler.
          </p>

          <p className="mt-4">
            Amacımız; hem rezervasyonunu iptal edemeyen misafirlere çözüm
            sunmak, hem de uygun fiyatlı tatil arayanlara fırsat yaratmaktır.
          </p>

          <p className="mt-4">
            tatilinidevret.com herhangi bir acente ya da otel işletmesi değildir;
            yalnızca tarafları buluşturan bir aracı platformdur.
          </p>

          <p className="mt-4 font-semibold">
            Tatil planlarını paylaş, devret, fırsata dönüştür! 🌴
          </p>
        </div>
      </div>
    </main>
  );
}
