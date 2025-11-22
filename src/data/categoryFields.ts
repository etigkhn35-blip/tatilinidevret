// Kategori + Alt kategoriye göre metin alanları (free-text) — checkbox'lar ayrı yönetiliyor.
export const CATEGORY_FIELDS: Record<string, string[]> = {
  /* ----------------------------- KONAKLAMA ----------------------------- */
  "Konaklama – Otel": [
    "Otel Adı",
    "Oda Tipi",
    "Manzara Türü",
    "Kat/Blok",
    "Rezervasyon No",
    "Not"
  ],
  "Konaklama – Villa / Yazlık": [
    "Villa/Site Adı",
    "Oda Sayısı",
    "Banyo Sayısı",
    "Metrekare",
    "Konum Notu",
  ],
  "Konaklama – Bungalow / Tiny House": [
    "Tesis Adı",
    "Ev Tipi",
    "Kapasite",
    "Isıtma/Soğutma",
  ],
  "Konaklama – Airbnb & Booking Rezervasyonu": [
    "Tesis/İlan Adı",
    "Rezervasyon Platformu",
    "Rezervasyon No",
  ],
  "Konaklama – Dağ / Yayla Evi": [
    "Tesis/Ev Adı",
    "Rakım/Doğa Notu",
  ],
  "Konaklama – Tatil Köyü": [
    "Tesis Adı",
    "Blok/Alan",
  ],
  "Konaklama – Apart / Rezidans": [
    "Rezidans/Apart Adı",
    "Oda Sayısı",
    "Metrekare",
  ],

  /* ------------------------ DENEYİM TATİLLERİ ------------------------ */
  "Deneyim Tatilleri – Tekne / Yat Tatili": [
    "Tekne Adı",
    "Kalkış Limanı",
    "Varış Limanı",
    "Rota",
  ],
  "Deneyim Tatilleri – Cruise (Gemi Turu)": [
    "Gemi Adı",
    "Hat (Ege/Akdeniz vb.)",
    "Kabin Tipi",
    "Vize Durumu",
  ],
  "Deneyim Tatilleri – Kamp / Glamping": [
    "Kamp Adı",
    "Kamp Türü",
    "Ekipman Notu",
  ],
  "Deneyim Tatilleri – Wellness & Spa Tatili": [
    "Tesis/Program Adı",
    "Paket İçeriği",
  ],
  "Deneyim Tatilleri – Yoga / Retreat": [
    "Program Adı",
    "Eğitmen/Grup",
  ],
  "Deneyim Tatilleri – Gastronomi Tatili": [
    "Bölge/Lezzet Rotası",
    "Restoran/Şef Notu",
  ],

  /* ------------------------------- TUR ------------------------------- */
  "Turlar – Kültür Turları": [
    "Tur Adı",
    "Kalkış Noktası",
    "Tur Süresi (Gün)",
  ],
  "Turlar – Doğa & Trekking Turları": [
    "Rota",
    "Zorluk Seviyesi",
    "Tur Süresi (Gün)",
  ],
  "Turlar – Karadeniz / GAP Turları": [
    "Bölge/Rota",
    "Kalkış Noktası",
    "Tur Süresi (Gün)",
  ],
  "Turlar – Kayak Turları": [
    "Merkez/Dağ",
    "Ekipman Durumu",
  ],
  "Turlar – Günübirlik Turlar": [
    "Rota/İçerik",
    "Kalkış Saati",
  ],
  "Turlar – Balayı Turları": [
    "Paket Adı",
    "Özel Notlar",
  ],

  /* ------------------------ ETKİNLİK PAKETLERİ ----------------------- */
  "Etkinlik Paketleri – Festival + Konaklama": [
    "Etkinlik Adı",
    "Şehir/Alan",
    "Bilet Tipi",
  ],
  "Etkinlik Paketleri – Konser + Konaklama": [
    "Sanatçı/Grup",
    "Salon/Stadyum",
    "Bilet Tipi",
  ],
  "Etkinlik Paketleri – Spor Etkinliği + Otel": [
    "Etkinlik Adı",
    "Tribün/Kategori",
  ],
  "Etkinlik Paketleri – Kültür & Sanat + Otel": [
    "Etkinlik Adı",
    "Salon/Mekan",
  ],
  "Etkinlik Paketleri – Workshop + Tatil": [
    "Workshop Adı",
    "İçerik",
  ],
};
