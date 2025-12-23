{/* FOOTER */}
<footer className="border-t border-gray-200 bg-white mt-12">
  <div className="max-w-[1200px] mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-sm">
    
    {/* Hızlı Linkler */}
    <div>
      <h3 className="font-semibold text-gray-900 mb-3">Hızlı Linkler</h3>
      <ul className="space-y-2">
        <li><a href="/" className="hover:text-primary transition">Ana Sayfa</a></li>
        <li><a href="/ilan-ver" className="hover:text-primary transition">İlan Ver</a></li>
        <li><a href="/ilanlar" className="hover:text-primary transition">İlanlar</a></li>
        <li><a href="/nasil-calisir" className="hover:text-primary transition">Nasıl Çalışır?</a></li>
        <li><a href="/yardim" className="hover:text-primary transition">SSS</a></li>
        <li><a href="/iletisim" className="hover:text-primary transition">İletişim</a></li>
      </ul>
    </div>

    {/* Yasal Linkler */}
    <div>
 <h3 className="font-semibold text-gray-100 mb-3">Yasal Bilgilendirme</h3>
  <ul className="space-y-2">
    <li>
      <a href="/bireysel-uyelik-sozlesmesi" className="hover:text-primary transition">
        Bireysel Üyelik Sözleşmesi
      </a>
    </li>
    <li>
      <a href="/ilan-verme-kurallari" className="hover:text-primary transition">
        İlan Verme Kuralları
      </a>
    </li>
    <li>
      <a
        href="/satisa-uygun-belge-yukleme-yonergesi"
        className="hover:text-primary transition"
      >
        Satışa Uygun Belge Yükleme Yönergesi
      </a>
    </li>
    <li>
      <a href="/kvkk" className="hover:text-primary transition">
        KVKK Aydınlatma Metni
      </a>
    </li>
    <li>
      <a href="/acik-riza-metni" className="hover:text-primary transition">
        Açık Rıza Metni
      </a>
    </li>
    <li>
      <a href="/cerez-politikasi" className="hover:text-primary transition">
        Çerez Politikası
      </a>
    </li>
  </ul>
</div>


    {/* İletişim */}
    <div>
      <h3 className="font-semibold text-gray-900 mb-3">İletişim</h3>
      <p className="text-gray-700">Adres: Şirket adresi buraya</p>
      <p className="text-gray-700">Telefon: +90 (555) 555 55 55</p>
      <p className="text-gray-700">E-posta: info@tatilinidevret.com</p>
      <div className="flex justify-center gap-4 mt-3 text-gray-600">
        <a href="#" className="hover:text-primary">Instagram</a>
        <a href="#" className="hover:text-primary">LinkedIn</a>
        <a href="#" className="hover:text-primary">X</a>
        <a href="#" className="hover:text-primary">Facebook</a>
      </div>
    </div>
  </div>

  {/* Alt Telif Alanı */}
  <div className="text-center text-xs text-gray-600 pb-6">
    © {new Date().getFullYear()}{" "}
    <span className="font-semibold">
      <span className="text-primary">tatilini</span>
      <span className="text-accent">devret</span>
      <span className="text-gray-900">.com</span>
    </span>{" "}
    – Tüm hakları saklıdır.
  </div>
</footer>
