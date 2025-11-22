"use client";

import { useEffect, useState } from "react";

export default function CookiePopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (value: string) => {
    localStorage.setItem("cookie-consent", value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1000] bg-black/90 text-white backdrop-blur-sm border-t border-gray-700">
      <div className="max-w-[1000px] mx-auto px-5 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <p className="text-sm leading-relaxed md:w-3/4">
          İnternet sitemizin çalışması, analitik çalışmaların yürütülmesi ve tercihleriniz
          doğrultusunda sitenin kişiselleştirilmesi için çerezler kullanmaktayız. Ayrıca açık rıza
          vermeniz halinde size yönelik reklam/pazarlama faaliyetlerinin gerçekleştirilmesi kapsamında
          birinci ve üçüncü taraf çerezler kullanılacaktır.
          <br />
          Çerezlere dair tercihlerinizi yönetebilir veya detaylı bilgi için{" "}
          <a
            href="/cerez-politikasi"
            className="underline text-blue-300 hover:text-blue-400"
          >
            Çerez Aydınlatma Metni
          </a>{" "}
          sayfamızı inceleyebilirsiniz.
        </p>

        <div className="flex flex-col md:flex-row gap-2 shrink-0">
          <button
            onClick={() => handleConsent("reject_all")}
            className="px-4 py-2 border border-gray-400 rounded-md hover:bg-gray-800 transition text-sm"
          >
            Tüm Çerezleri Reddet
          </button>
          <button
            onClick={() => handleConsent("manage")}
            className="px-4 py-2 border border-gray-400 rounded-md hover:bg-gray-800 transition text-sm"
          >
            Çerez Tercihlerimi Yönet
          </button>
          <button
            onClick={() => handleConsent("accept_all")}
            className="px-4 py-2 bg-white text-black font-semibold rounded-md hover:bg-gray-200 transition text-sm"
          >
            Tüm Çerezleri Kabul Et
          </button>
        </div>
      </div>
    </div>
  );
}
