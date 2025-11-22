"use client";

import { useEffect, useMemo, useState } from "react";
import { auth, db, storage } from "@/lib/firebaseConfig";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useRouter } from "next/navigation";
import { CATEGORY_FIELDS } from "@/data/categoryFields";

/* ------------------------------ Helpers ------------------------------ */
const todayStr = () => new Date().toISOString().slice(0, 10);
const formatIlanNo = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TD-${y}${m}${dd}-${rand}`;
};

/* ------------------ Alt kategoriye göre görsel eşleştirme ------------------ */
const getDefaultCover = (kategori: string, altKategori?: string) => {
  const normalize = (str: string) =>
    (str || "")
      .toLowerCase()
      .replace(/\+/g, " ")
      .replace(/\//g, " ")
      .replace(/\(/g, " ")
      .replace(/\)/g, " ")
      .replace(/&/g, " ")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/\s+/g, " ")
      .trim();

  const k = normalize(kategori);
  const a = normalize(altKategori || "");

  // 🔹 Konaklama
  if (k.includes("konaklama")) {
    if (a.includes("villa") || a.includes("yazlik")) return "/defaults/konaklama-villa.jpg";
    if (a.includes("otel")) return "/defaults/konaklama-otel.jpg";
    if (a.includes("airbnb") || a.includes("booking")) return "/defaults/konaklama-apart.jpg";
    if (a.includes("bungalow") || a.includes("tiny")) return "/defaults/konaklama-bungalow.jpg";
    if (a.includes("dag") || a.includes("yayla")) return "/defaults/konaklama-yayla.jpg";
    if (a.includes("tatil") && a.includes("koyu")) return "/defaults/konaklama-tatilkoyu.jpg";
    if (a.includes("apart") || a.includes("rezidans")) return "/defaults/konaklama-apart.jpg";
    return "/defaults/konaklama-otel.jpg";
  }

  // 🔹 Deneyim Tatilleri
  if (k.includes("deneyim")) {
    if (a.includes("spa") || a.includes("wellness")) return "/defaults/deneyim-spa.jpg";
    if (a.includes("kamp") || a.includes("glamping")) return "/defaults/deneyim-kamp.jpg";
    if (a.includes("tekne") || a.includes("yat")) return "/defaults/deneyim-tekne.jpg";
    if (a.includes("cruise") || a.includes("gemi")) return "/defaults/deneyim-gemi.jpg";
    if (a.includes("yoga") || a.includes("retreat")) return "/defaults/deneyim-yoga.jpg";
    if (a.includes("gastro") || a.includes("gastronomi")) return "/defaults/deneyim-gastronomi.jpg";
    return "/defaults/deneyim-genel.jpg";
  }

  // 🔹 Turlar
  if (k.includes("tur")) {
    if (a.includes("kultur")) return "/defaults/tur-kultur.jpg";
    if (a.includes("doga") || a.includes("trek")) return "/defaults/tur-doga.jpg";
    if (a.includes("karadeniz") || a.includes("gap")) return "/defaults/tur-karadeniz-gap.jpg";
    if (a.includes("kayak")) return "/defaults/tur-kayak.jpg";
    if (a.includes("gunubirlik")) return "/defaults/tur-gunubirlik.jpg";
    if (a.includes("balayi")) return "/defaults/tur-balayi.jpg";
    return "/defaults/tur-genel.jpg";
  }

  // 🔹 Etkinlik Paketleri
  if (k.includes("etkinlik")) {
    if (a.includes("festival")) return "/defaults/etkinlik-festival.jpg";
    if (a.includes("konser")) return "/defaults/etkinlik-konser.jpg";
    if (a.includes("spor")) return "/defaults/etkinlik-spor.jpg";
    if (a.includes("kultur") || a.includes("sanat")) return "/defaults/etkinlik-kultur.jpg";
    if (a.includes("workshop")) return "/defaults/etkinlik-workshop.jpg";
    return "/defaults/etkinlik-festival.jpg";
  }

  // 🔹 Fallback
  return "/defaults/default.jpg";
};

/* --------------------------- Kategori Yapısı -------------------------- */
const CATEGORIES: Record<string, string[]> = {
  Konaklama: [
    "Otel",
    "Villa / Yazlık",
    "Airbnb & Booking Rezervasyonu",
    "Bungalow / Tiny House",
    "Dağ / Yayla Evi",
    "Tatil Köyü",
    "Apart / Rezidans",
  ],
  "Deneyim Tatilleri": [
    "Tekne / Yat Tatili",
    "Cruise (Gemi Turu)",
    "Kamp / Glamping",
    "Wellness & Spa Tatili",
    "Yoga / Retreat",
    "Gastronomi Tatili",
  ],
  Turlar: [
    "Kültür Turları",
    "Doğa & Trekking Turları",
    "Karadeniz / GAP Turları",
    "Kayak Turları",
    "Günübirlik Turlar",
    "Balayı Turları",
  ],
  "Etkinlik Paketleri": [
    "Festival + Konaklama",
    "Konser + Konaklama",
    "Spor Etkinliği + Otel",
    "Kültür & Sanat + Otel",
    "Workshop + Tatil",
  ],
};

export default function IlanVerPage() {
  const router = useRouter();

  /* ---------- UI: uyarı popup (ekran ortası) ---------- */
  const [popup, setPopup] = useState<{ show: boolean; message: string }>(
    { show: false, message: "" }
  );
  const showPopup = (message: string) => {
    setPopup({ show: true, message });
    setTimeout(() => setPopup({ show: false, message: "" }), 3000);
  };

  const [showPricing, setShowPricing] = useState(false);
  const [isFirstListing, setIsFirstListing] = useState(true);

  /* ------------------------------- State ------------------------------- */
  const [user, setUser] = useState<any>(auth.currentUser);

  // Kategoriler
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [subOptions, setSubOptions] = useState<string[]>([]);

  // Genel alanlar
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [orjinalFiyat, setOrjinalFiyat] = useState("");

  // Tarih & kişi
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [price, setPrice] = useState("");

  // Oda tipi (tek seçimli açılır menü) → kategoriye özel alana taşındı
  const [odaTipi, setOdaTipi] = useState<string>("");
  const ODA_TIPLERI = [
    "Standart Oda",
    "Deluxe Oda",
    "Aile Odası",
    "Suit",
    "King Suit",
    "Bungalow",
    "Villa",
    "Tiny House",
  ];

  // Dosyalar + önizleme
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [reservationFile, setReservationFile] = useState<File | null>(null);
  const [reservationPreview, setReservationPreview] = useState<string | null>(null);

  // Dinamik alanlar
  const [ozelAlanlar, setOzelAlanlar] = useState<Record<string, string>>({});

  // Konaklama: pansiyon + donanımlar
  const [pansiyonTipi, setPansiyonTipi] = useState<
    | "Tam Pansiyon"
    | "Yarım Pansiyon"
    | "Oda Kahvaltı"
    | "Her Şey Dahil"
    | "Ultra Her Şey Dahil"
    | "Sadece Oda"
    | ""
  >("");

  const [donanimlar, setDonanimlar] = useState<Record<string, boolean>>({
    tv: false,
    minibar: false,
    klima: false,
    havuz: false,
    spa: false,
    kahvaltiDahil: false,
    denizManzarasi: false,
    balkon: false,
    wifi: false,
    otopark: false,
    resepsiyon24: false,
    odaServisi: false,
    fitness: false,
    hamam: false,
    sauna: false,
    plajaYakin: false,
    engelliErisimi: false,
    sicakSu: false,
    mutfak: false,
    camasirMakinesi: false,
    klimaMerkezi: false,
  });

  // Upsell + KVKK
  const [oneCikar, setOneCikar] = useState(false);
  const [vitrin, setVitrin] = useState(false);
  const [kalinYazi, setKalinYazi] = useState(false);
  const [kvkkOnay, setKvkkOnay] = useState(false);

  // KVKK / Koşullar modal
  const [policyOpen, setPolicyOpen] = useState(false);
  const [policyTab, setPolicyTab] = useState<"terms" | "kvkk">("terms");

  const [submitting, setSubmitting] = useState(false);

  /* ------------------------------ Effects ------------------------------ */
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (u) {
        setUser(u);
      } else {
        router.push("/giris");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    setSubOptions(category ? CATEGORIES[category] : []);
    setSubCategory("");
    // kategori değişince özel alanlar korunur
  }, [category]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const a = new Date(checkIn).getTime();
    const b = new Date(checkOut).getTime();
    return Math.max(0, Math.ceil((b - a) / (1000 * 60 * 60 * 24)));
  }, [checkIn, checkOut]);

  /* ----------------------------- Handlers ----------------------------- */
  const onCoverChange = (f: File | null) => {
    setCoverFile(f);
    if (!f) return setCoverPreview(null);
    const r = new FileReader();
    r.onload = () => setCoverPreview(String(r.result));
    r.readAsDataURL(f);
  };

  const onReservationChange = (f: File | null) => {
    setReservationFile(f);
    if (!f) return setReservationPreview(null);
    const isImage = f.type.startsWith("image/");
    if (!isImage) {
      setReservationPreview("PDF_SELECTED");
    } else {
      const r = new FileReader();
      r.onload = () => setReservationPreview(String(r.result));
      r.readAsDataURL(f);
    }
  };

  const toggleDonanim = (key: string) =>
    setDonanimlar((prev) => ({ ...prev, [key]: !prev[key] }));

  /* ----------------------------- Validation ---------------------------- */
  const validateFields = (): string => {
    if (title.trim().length < 6) return "⚠️ Başlık en az 6 karakter olmalı.";
    if (desc.trim().length < 10) return "⚠️ Açıklama en az 10 karakter olmalı.";
    if (!category) return "⚠️ Ana kategori seçilmedi.";
    if (!subCategory) return "⚠️ Alt kategori seçilmedi.";
    if (!checkIn || !checkOut) return "⚠️ Giriş/Çıkış tarihleri seçilmedi.";
    if (Number(price) <= 0) return "⚠️ Satış fiyatı girilmedi.";
    if (!orjinalFiyat || Number(orjinalFiyat) <= 0) return "⚠️ Orijinal fiyat zorunludur.";
    if (category === "Konaklama" && !pansiyonTipi) return "⚠️ Pansiyon tipi seçilmedi.";
    if (category === "Konaklama" && !odaTipi) return "⚠️ Oda tipi seçilmedi.";
    if (!kvkkOnay) return "⚠️ KVKK onayı verilmedi.";
    if (!reservationFile) return "⚠️ Ödeme/rezervasyon belgesi (PDF/JPG) yükleyin.";
    return "";
  };

  const canSubmit =
    title.trim().length >= 6 &&
    desc.trim().length >= 10 &&
    category &&
    subCategory &&
    checkIn &&
    checkOut &&
    Number(price) > 0 &&
    kvkkOnay &&
    reservationFile &&
    (category !== "Konaklama" || !!pansiyonTipi) &&
    (category !== "Konaklama" || !!odaTipi);

  /* ------------------------------- Submit ------------------------------ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const msg = validateFields();
    if (msg) {
      showPopup(msg);
      return;
    }

    // Ücretli özellik seçildiyse önce ödeme akışına yönlendir
    if (oneCikar || vitrin || kalinYazi || !isFirstListing) {
  // İlanı hemen veritabanına kaydediyoruz, sonra ödeme adımına yönlendiriyoruz.
  const ilanNo = formatIlanNo();

  // Kapak (opsiyonel)
  let coverUrl: string | null = null;
  if (coverFile) {
    const uid = user?.uid || "anon";
    const timestamp = Date.now();
    const refC = ref(storage, `covers/${uid}_${ilanNo}_${timestamp}_${coverFile.name}`);
    await uploadBytes(refC, coverFile);
    coverUrl = await getDownloadURL(refC);
  }

  // Rezervasyon belgesi (zorunlu)
  let reservationUrl: string | null = null;
  if (reservationFile) {
    const uid = user?.uid || "anon";
    const timestamp = Date.now();
    const refV = ref(storage, `docs/${uid}_${ilanNo}_${timestamp}_${reservationFile.name}`);
    await uploadBytes(refV, reservationFile);
    reservationUrl = await getDownloadURL(refV);
  }

  const autoCoverUrl = coverUrl ?? getDefaultCover(category, subCategory);

  const docRef = await addDoc(collection(db, "ilanlar"), {
    ilanNo,
    adSoyad: user?.displayName || "Bilinmiyor",
    sahipUid: user?.uid || null,
    sahipEmail: user?.email || null,
    baslik: title.trim(),
    aciklama: desc.trim(),
    kategori: category,
    altKategori: subCategory,
    girisTarihi: checkIn,
    cikisTarihi: checkOut,
    geceSayisi: nights,
    yetiskinSayisi: adults,
    cocukSayisi: children,
    ucret: Number(price),
    coverUrl: autoCoverUrl,
    pdfUrl: reservationUrl,
    orjinalFiyat: Number(orjinalFiyat) || null,
    ozelAlanlar,
    pansiyonTipi: category === "Konaklama" ? pansiyonTipi : "",
    odaTipi: category === "Konaklama" ? odaTipi : "",
    donanimlar: category === "Konaklama" ? donanimlar : {},
    oneCikar,
    vitrin,
    kalinYazi,
    kvkkOnay: Boolean(kvkkOnay),
    status: "pending",
    olusturmaTarihi: serverTimestamp(),
  });

  const base = isFirstListing ? 0 : 350;
  const url = `/odeme?ilanId=${docRef.id}&mode=publish&base=${base}&one=${oneCikar ? 40 : 0}&vit=${vitrin ? 60 : 0}&bold=${kalinYazi ? 20 : 0}`;

  router.push(url);
  return;
}

    setSubmitting(true);
    try {
      const ilanNo = formatIlanNo();

      // Kapak (benzersiz ad) — opsiyonel
      let coverUrl: string | null = null;
      if (coverFile) {
        const uid = user?.uid || "anon";
        const timestamp = Date.now();
        const refC = ref(storage, `covers/${uid}_${ilanNo}_${timestamp}_${coverFile.name}`);
        await uploadBytes(refC, coverFile);
        coverUrl = await getDownloadURL(refC);
      }

      // Belge (benzersiz ad) — zorunlu
      let reservationUrl: string | null = null;
      if (reservationFile) {
        const uid = user?.uid || "anon";
        const timestamp = Date.now();
        const refV = ref(storage, `docs/${uid}_${ilanNo}_${timestamp}_${reservationFile.name}`);
        await uploadBytes(refV, reservationFile);
        reservationUrl = await getDownloadURL(refV);
      }

      // 🔹 KAPAK: Dosya yüklenmediyse kategoriden otomatik seç
      const autoCoverUrl = coverUrl ?? getDefaultCover(category, subCategory);

      await addDoc(collection(db, "ilanlar"), {
        ilanNo,
        adSoyad: user?.displayName || "Bilinmiyor",
        sahipUid: user?.uid || null,
        sahipEmail: user?.email || null,

        baslik: title.trim(),
        aciklama: desc.trim(),

        kategori: category,
        altKategori: subCategory,

        // ⚠️ Konum alanları kullanıcı isteğiyle kaldırıldı:
        // il, ilce, mahalle YOK

        girisTarihi: checkIn,
        cikisTarihi: checkOut,
        geceSayisi: nights,

        yetiskinSayisi: adults,
        cocukSayisi: children,

        ucret: Number(price),
        coverUrl: autoCoverUrl,
        pdfUrl: reservationUrl,
        orjinalFiyat: Number(orjinalFiyat) || null,

        // Dinamik alanlar
        ozelAlanlar,
        pansiyonTipi: category === "Konaklama" ? pansiyonTipi : "",
        odaTipi: category === "Konaklama" ? odaTipi : "",
        donanimlar: category === "Konaklama" ? donanimlar : {},

        // Görünürlük
        oneCikar,
        vitrin,
        kalinYazi,

        kvkkOnay: Boolean(kvkkOnay),
        status: "pending",
        olusturmaTarihi: serverTimestamp(),
      });

      showPopup("✅ İlan başarıyla kaydedildi. Onay bekliyor.");
      setTimeout(() => router.push("/"), 600);
    } catch (err) {
      console.error(err);
      showPopup("❌ Hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ----------------------- Kategoriye Özel Alanlar ---------------------- */
  const key = `${category} – ${subCategory}`;
  // “Not” ve “Kat/Blok” alanlarını burada filtreliyoruz
  const metaFieldsRaw = CATEGORY_FIELDS[key] || [];
  const metaFields = metaFieldsRaw.filter((label: string) => {
    const normalized = label.trim().toLowerCase();
    return normalized !== "not" && normalized !== "kat/blok" && normalized !== "kat" && normalized !== "blok";
  });

  // Oda Tipi → kategoriye özel bilgiler içine taşındı (sadece Konaklama)
  const OdaTipiFieldInMeta =
    category === "Konaklama" ? (
      <div>
        <label className="block text-sm font-semibold mb-1">
          Oda Tipi <span className="text-red-600">*</span>
        </label>
        <select
          value={odaTipi}
          onChange={(e) => setOdaTipi(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="">Seçiniz</option>
          {ODA_TIPLERI.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>
    ) : null;

  const KonaklamaEkleri =
    category === "Konaklama" ? (
      <section className="space-y-4">
        {/* Pansiyon Tipi (konaklama için zorunlu) */}
        <div>
          <label className="block text-sm font-semibold mb-1">
            Pansiyon Tipi <span className="text-red-600">*</span>
          </label>
          <select
            value={pansiyonTipi}
            onChange={(e) => setPansiyonTipi(e.target.value as any)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Seçiniz</option>
            <option value="Tam Pansiyon">Tam Pansiyon</option>
            <option value="Yarım Pansiyon">Yarım Pansiyon</option>
            <option value="Oda Kahvaltı">Oda Kahvaltı</option>
            <option value="Her Şey Dahil">Her Şey Dahil</option>
            <option value="Ultra Her Şey Dahil">Ultra Her Şey Dahil</option>
            <option value="Sadece Oda">Sadece Oda</option>
          </select>
        </div>

        {/* Donanımlar */}
        <div>
          <label className="block text-sm font-semibold mb-2">Oda/Tesis Donanımları</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {[
              ["tv", "TV"],
              ["minibar", "Mini Buzdolabı"],
              ["klima", "Klima"],
              ["havuz", "Havuz"],
              ["spa", "SPA"],
              ["kahvaltiDahil", "Kahvaltı Dahil"],
              ["denizManzarasi", "Deniz Manzarası"],
              ["balkon", "Balkon"],
              ["wifi", "WiFi"],
              ["otopark", "Otopark"],
              ["resepsiyon24", "7/24 Resepsiyon"],
              ["odaServisi", "Oda Servisi"],
              ["fitness", "Fitness"],
              ["hamam", "Türk Hamamı"],
              ["sauna", "Sauna"],
              ["plajaYakin", "Plaja Yakın"],
              ["engelliErisimi", "Engelli Erişimi"],
              ["sicakSu", "Sürekli Sıcak Su"],
              ["mutfak", "Mutfak"],
              ["camasirMakinesi", "Çamaşır Makinesi"],
              ["klimaMerkezi", "Merkezi Klima"],
            ].map(([k, label]) => (
              <label key={String(k)} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!donanimlar[String(k)]}
                  onChange={() =>
                    setDonanimlar((p) => ({ ...p, [String(k)]: !p[String(k)] }))
                  }
                />
                {label as string}
              </label>
            ))}
          </div>
        </div>
      </section>
    ) : null;

  /* --------------------------- KVKK / TERMS MODAL --------------------------- */
  const PolicyModal = () =>
    !policyOpen ? null : (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={() => setPolicyOpen(false)} />
        <div className="relative bg-white w-[min(92vw,800px)] max-h-[80vh] rounded-2xl shadow-xl border overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50">
            <div className="flex gap-2">
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-semibold ${
                  policyTab === "terms" ? "bg-gray-900 text-white" : "bg-white border"
                }`}
                onClick={() => setPolicyTab("terms")}
              >
                Kullanım Koşulları
              </button>
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-semibold ${
                  policyTab === "kvkk" ? "bg-gray-900 text-white" : "bg-white border"
                }`}
                onClick={() => setPolicyTab("kvkk")}
              >
                KVKK Aydınlatma
              </button>
            </div>
            <button
              className="text-gray-600 hover:text-gray-900 text-xl leading-none px-2"
              onClick={() => setPolicyOpen(false)}
              aria-label="Kapat"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-5 overflow-auto text-sm leading-6 space-y-4">
            {policyTab === "terms" ? (
              <div>
                <h3 className="text-lg font-semibold mb-2">Kullanım Koşulları</h3>
                <p>
                  Bu platformu kullanarak <b>Kullanım Koşulları</b>’nı kabul etmiş olursunuz. İlan içerikleri
                  kullanıcılar tarafından oluşturulur; ilan doğrulaması yapılana kadar yayımlanmaz. Yanıltıcı veya
                  yasa dışı içerikler kaldırılır. Hizmetin kesintisizliği garanti edilmez.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>İlan veren; bilgilerin doğruluğundan ve güncelliğinden sorumludur.</li>
                  <li>Hakaret, nefret söylemi ve yasa dışı içerik yasaktır.</li>
                  <li>Ödeme ve iade süreçleri ilan açıklamasında belirtilir.</li>
                </ul>
                <p>
                  Detaylar için{" "}
                  <a href="/kullanim-kosullari" className="text-primary underline">
                    Kullanım Koşulları
                  </a>{" "}
                  sayfasını ziyaret edebilirsiniz.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold mb-2">KVKK Aydınlatma Metni</h3>
                <p>
                  6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında; kimlik, iletişim, rezervasyon belgesi gibi
                  verileriniz hizmetin sunulması, doğrulama, güvenlik ve mevzuat yükümlülüklerinin yerine getirilmesi
                  amaçlarıyla işlenebilir, saklanabilir.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Veri sorumlusu: tatilinidevret.com</li>
                  <li>İşleme amaçları: üyelik, ilan doğrulama, müşteri desteği, güvenlik</li>
                  <li>Haklarınız: başvuru, düzeltme, silme, itiraz</li>
                </ul>
                <p>
                  Detaylar için{" "}
                  <a href="/kvkk" className="text-primary underline">
                    KVKK Aydınlatma
                  </a>{" "}
                  sayfasını ziyaret edebilirsiniz.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t bg-gray-50">
            <button className="px-4 py-2 rounded-lg border hover:bg-gray-50" onClick={() => setPolicyOpen(false)}>
              Kapat
            </button>
          </div>
        </div>
      </div>
    );

  /* --------------------------------- UI -------------------------------- */
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">📝 Yeni İlan Ver</h1>

        <form onSubmit={handleSubmit} className="bg-white border rounded-2xl shadow-sm p-6 space-y-6">
          {/* Kullanıcı */}
          <div>
            <label className="block font-semibold mb-1">Ad Soyad / Firma Adı</label>
            <input
              value={user?.displayName || ""}
              readOnly
              className="w-full border rounded-lg px-3 py-2 bg-gray-100"
            />
          </div>

          {/* Kategoriler */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">
                Ana Kategori <span className="text-red-600">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Seçiniz</option>
                {Object.keys(CATEGORIES).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">
                Alt Kategori <span className="text-red-600">*</span>
              </label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                disabled={!subOptions.length}
                className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
              >
                <option value="">Seçiniz</option>
                {subOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Başlık & Açıklama */}
          <div>
            <label className="block font-semibold mb-1">
              İlan Başlığı <span className="text-red-600">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Bodrum Vogue Hotel 5 Gece 2 Kişilik Tatil"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">
              Açıklama <span className="text-red-600">*</span>
            </label>
            <textarea
              rows={5}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Konaklama/tur detayları, rezervasyon, avantajlar..."
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Tarih & Kişi */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block font-semibold mb-1">
                Giriş Tarihi <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={checkIn}
                min={todayStr()}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">
                Çıkış Tarihi <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={checkOut}
                min={checkIn || todayStr()}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Toplam Gece</label>
              <input readOnly value={nights || ""} className="w-full border rounded-lg px-3 py-2 bg-gray-100" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-1">👤 Yetişkin</label>
                <input
                  type="number"
                  min={1}
                  value={adults}
                  onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">👶 Çocuk</label>
                <input
                  type="number"
                  min={0}
                  value={children}
                  onChange={(e) => setChildren(Math.max(0, Number(e.target.value)))}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Kategoriye Özel Bilgiler */}
          {(metaFields.length > 0 || category === "Konaklama") && (
            <section>
              <h2 className="text-lg font-semibold mb-2">Kategoriye Özel Bilgiler</h2>

              {/* Oda Tipi — sadece Konaklama */}
              {OdaTipiFieldInMeta}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
               {metaFields
  .filter((label) => label !== "Oda Tipi") // “Oda Tipi” alanını çıkar
  .map((label) => (
    <div key={label}>
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <input
        value={ozelAlanlar[label] || ""}
        onChange={(e) =>
          setOzelAlanlar((prev) => ({ ...prev, [label]: e.target.value }))
        }
        className="w-full border rounded-lg px-3 py-2"
      />
    </div>
  ))}
              </div>
            </section>
          )}

          {/* Konaklama Ekleri: Pansiyon + Donanımlar */}
          {KonaklamaEkleri}

          {/* Dosyalar + Önizleme */}
          <section className="grid grid-cols-1 md-grid-cols-2 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold mb-1">Kapak Görseli (opsiyonel)</label>
              <input type="file" accept="image/*" onChange={(e) => onCoverChange(e.target.files?.[0] || null)} />
              {coverPreview && (
                <div className="mt-2 border rounded-lg overflow-hidden w-48 h-32 bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverPreview} alt="Önizleme" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-1">
                Ödeme Belgesi (PDF/JPG) — <span className="text-red-600">Zorunlu</span>
              </label>
              <input type="file" accept=".pdf,image/*" onChange={(e) => onReservationChange(e.target.files?.[0] || null)} />
              <p className="text-xs text-gray-500 mt-1">
                Belgede sağlayıcı, rezervasyon onayı ve toplam ödediğiniz tutar net görünmelidir.
              </p>

              {reservationPreview && (
                <div className="mt-2 flex items-center gap-3 p-2 border rounded-lg bg-gray-50">
                  {reservationPreview === "PDF_SELECTED" ? (
                    <div className="text-sm">📄 {reservationFile?.name}</div>
                  ) : (
                    <div className="w-48 h-32 overflow-hidden rounded bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={reservationPreview} alt="Belge Önizleme" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
          {/* ORİJİNAL FİYAT */}
<div>
  <label className="block font-semibold mb-1">
  Orijinal Fiyat (₺) <span className="text-red-600">*</span>
</label>

  <input
    type="number"
    min={0}
    value={orjinalFiyat}
    onChange={(e) => setOrjinalFiyat(e.target.value)}
    className="w-full border rounded-lg px-3 py-2"
    placeholder="Örn: 10000"
  />
  <p className="text-xs text-gray-500 mt-1">
    Bu alan satın aldığın gerçek fiyat içindir. İndirimi otomatik hesaplamak için kullanılır.
  </p>
</div>

          {/* Fiyat */}
          <div>
            <label className="block font-semibold mb-1">
              Satış Fiyatı (₺) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
            <p className="text-xs text-gray-500 mt-1">Satış fiyatı, ödediğiniz tutarın üzerinde olamaz.</p>
          </div>

          {/* Ücretli Özellikler */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="inline-flex items-center justify-between gap-2 border rounded-lg px-3 py-2 bg-gray-50">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={oneCikar} onChange={(e) => setOneCikar(e.target.checked)} />
                <span>Öne Çıkar</span>
              </div>
              <span className="text-sm text-gray-600 font-medium">+40 ₺</span>
            </label>

            <label className="inline-flex items-center justify-between gap-2 border rounded-lg px-3 py-2 bg-gray-50">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={vitrin} onChange={(e) => setVitrin(e.target.checked)} />
                <span>Vitrinde Göster</span>
              </div>
              <span className="text-sm text-gray-600 font-medium">+60 ₺</span>
            </label>

            <label className="inline-flex items-center justify-between gap-2 border rounded-lg px-3 py-2 bg-gray-50">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={kalinYazi} onChange={(e) => setKalinYazi(e.target.checked)} />
                <span>Başlık Kalın Göster</span>
              </div>
              <span className="text-sm text-gray-600 font-medium">+20 ₺</span>
            </label>
          </section>

          {/* 🔹 Fiyatlandırma Bilgileri Paneli */}
          <div className="mt-6 border-t pt-4">
            <button
              type="button"
              onClick={() => setShowPricing((prev) => !prev)}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition"
            >
              {showPricing ? "▲ Fiyatlandırmayı Gizle" : "💰 Fiyatlandırmayı Gör"}
            </button>

            {showPricing && (
              <div className="mt-4 bg-white border rounded-lg shadow-inner p-4 space-y-2 text-sm text-gray-700">
                <p className="font-semibold text-lg text-blue-700">💡 İlan Yayın Paketleri</p>

                <p className="mt-2 font-semibold">⭐ Yeni Üyeye Özel: İlk İlan Kampanyası</p>
                <ul className="list-disc ml-5">
                  <li>Fiyat: Ücretsiz</li>
                  <li>Süre: 15 gün</li>
                  <li>Not: Yeni üyeler için yalnızca bir defaya mahsus kullanılabilir.</li>
                </ul>

                <p className="mt-3 font-semibold">📦 Standart İlan</p>
                <ul className="list-disc ml-5">
                  <li>Fiyat: 350 TL</li>
                  <li>Süre: 30 gün</li>
                  <li>Normal sıralama, otomatik süresi doldu uyarısı, manuel yenileme hakkı.</li>
                </ul>

                <p className="mt-3 font-semibold">🏆 Ekstra Özellikler</p>
                <ul className="list-disc ml-5">
                  <li>Öne Çıkar: +40 TL</li>
                  <li>Vitrinde Göster: +60 TL</li>
                  <li>Başlık Kalın Göster: +20 TL</li>
                </ul>

                <p className="mt-3">🧾 <b>KDV Oranı:</b> %20</p>
                <p>💳 Toplam tutar ilan sırasında otomatik hesaplanır.</p>

                <p className="mt-3 text-xs text-gray-600">
                  💬 %30–%40 arası indirimli ilanlar “Muhteşem İlanlar”; %40 ve üzeri indirimli ilanlar “Efsane İlanlar”
                  bölümünde ücretsiz öne çıkarılır.
                </p>
              </div>
            )}
          </div>

          {/* 🔹 Ücretli Özellikler Sepet Özeti */}
          {(oneCikar || vitrin || kalinYazi || !isFirstListing) && (
            <div className="mt-6 border rounded-xl bg-amber-50 p-4 shadow-md">
              <h3 className="font-bold text-lg text-gray-800 mb-2">🧾 Sepet Özeti</h3>

              <p className="text-sm text-blue-700 font-medium mb-3">
                {isFirstListing
                  ? "🎉 İlk ilanınız ücretsizdir. Ek özellik seçerseniz sadece onların ücretini ödersiniz."
                  : "ℹ️ Bu ikinci veya sonraki ilanınız. Standart ilan ücreti (350 ₺) + seçtiğiniz ek özellikler uygulanır."}
              </p>

              <ul className="text-sm text-gray-700 space-y-1">
                {!isFirstListing && <li>• Standart İlan Ücreti: 350 ₺</li>}
                {oneCikar && <li>• Öne Çıkar: +40 ₺</li>}
                {vitrin && <li>• Vitrinde Göster: +60 ₺</li>}
                {kalinYazi && <li>• Başlık Kalın Göster: +20 ₺</li>}
              </ul>

              {(() => {
                const base = isFirstListing ? 0 : 350;
                const extra = (oneCikar ? 40 : 0) + (vitrin ? 60 : 0) + (kalinYazi ? 20 : 0);
                const subtotal = base + extra;
                const kdv = subtotal * 0.2;
                const total = subtotal + kdv;

                return (
                  <div className="mt-3 border-t pt-2 text-right text-sm text-gray-800">
                    <p>KDV (%20): <b>{kdv.toFixed(2)} ₺</b></p>
                    <p className="text-lg font-semibold text-blue-700">Toplam: {total.toFixed(2)} ₺</p>

                
                  </div>
                );
              })()}
            </div>
          )}

          {/* KVKK */}
          <div>
            <label className="text-sm inline-flex items-center gap-2">
              <input type="checkbox" checked={kvkkOnay} onChange={(e) => setKvkkOnay(e.target.checked)} />
              <span>
                {" "}
                <button
                  type="button"
                  className="underline text-primary"
                  onClick={() => {
                    setPolicyTab("terms");
                    setPolicyOpen(true);
                  }}
                >
                  Kullanım Koşulları
                </button>{" "}
                ve{" "}
                <button
                  type="button"
                  className="underline text-primary"
                  onClick={() => {
                    setPolicyTab("kvkk");
                    setPolicyOpen(true);
                  }}
                >
                  KVKK metinlerini
                </button>{" "}
                okudum, kabul ediyorum. <span className="text-red-600">*</span>
              </span>
            </label>
          </div>

          {/* Aksiyon */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => router.push("/")} className="px-5 py-2 border rounded-lg">
              Vazgeç
            </button>

            {/* Eğer ücretli özellik varsa ödeme, yoksa kaydet */}
            {oneCikar || vitrin || kalinYazi || !isFirstListing ? (
  <button
    type="submit"
    className="px-6 py-2 bg-green-600 text-white rounded-lg"
  >
    💳 Ödeme Adımına Geç
  </button>
            ) : (
              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-60"
              >
                {submitting ? "Kaydediliyor..." : "İlanı Kaydet"}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Ekran ortası popup */}
      {popup.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative max-w-md w-[92%] bg-red-600 text-white px-5 py-4 rounded-2xl shadow-2xl border border-red-700 text-center">
            <div className="text-base whitespace-pre-line font-medium">{popup.message}</div>
          </div>
        </div>
      )}

      {/* KVKK / Terms Modal */}
      <PolicyModal />
    </main>
  );
}
