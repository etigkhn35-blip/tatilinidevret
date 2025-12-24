"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, db } from "../lib/firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  doc,
  updateDoc,
  DocumentData,
} from "firebase/firestore";
import Link from "next/link";
import { Bell, Mail, Menu, X, Search } from "lucide-react";

interface NotificationDoc extends DocumentData {
  id: string;
  read?: boolean;
  title?: string;
  message?: string;
  createdAt?: any;
  type?: string;
  toUserUid?: string;
  ilanId?: string;
}

export default function Header() {
  const pathname = usePathname();

  // 🔒 Admin sayfalarında header render edilmez
  if (pathname.startsWith("/admin")) {
    return null;
  }
  const [user, setUser] = useState<User | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const [notifCount, setNotifCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [openNotif, setOpenNotif] = useState<boolean>(false);

  const [mobileMenu, setMobileMenu] = useState(false);

  // 🔍 Arama
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTerm.trim();
    if (!q) return;
    window.location.href = `/arama?q=${encodeURIComponent(q)}`;
  };

  // 👤 Auth
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubAuth();
  }, []);

  // 💬 Mesaj bildirim sayısı
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "notifications"),
      where("toUserUid", "==", user.uid),
      where("type", "==", "message"),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: NotificationDoc[] = snap.docs.map((d) => ({
        ...(d.data() as NotificationDoc),
        id: d.id,
      }));
      setUnreadCount(list.filter((n) => !n.read).length);
    });
    return () => unsub();
  }, [user]);

  // 🔔 Genel bildirim listesi
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "notifications"),
      where("toUserUid", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(10)
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: NotificationDoc[] = snap.docs.map((d) => ({
        ...(d.data() as NotificationDoc),
        id: d.id,
      }));
      setNotifications(list);
      setNotifCount(list.filter((n) => !n.read).length);
    });
    return () => unsub();
  }, [user]);

  const handleNotificationClick = async (n: NotificationDoc) => {
    try {
      if (!n.id) return;
      await updateDoc(doc(db, "notifications", n.id), { read: true });

      if (n.type === "message") {
        window.location.href = "/hesabim/mesajlar";
        return;
      }

      if (n.type === "destek") {
        window.location.href = "/hesabim/mesajlar";
        return;
      }

      if (n.type === "ilan" || n.type?.startsWith("ilan_")) {
        window.location.href = n.ilanId ? `/ilan/${encodeURIComponent(n.ilanId)}` : "/hesabim";
        return;
      }

      window.location.href = "/hesabim";
    } catch (e) {
      console.error("Bildirim tıklama hatası:", e);
    } finally {
      setOpenNotif(false);
      setMobileMenu(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  const displayName = useMemo(() => {
    if (!user) return "";
    return user.displayName || user.email?.split("@")[0] || "Kullanıcı";
  }, [user]);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* ÜST SATIR */}
        <div className="flex items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/" className="text-2xl font-semibold whitespace-nowrap">
            <span style={{ color: "#00AEEF" }}>tatilini</span>
            <span style={{ color: "#FF6B00" }}>devret</span>
          </Link>
           {/* 🔍 Arama (logo ile yan yana) */}
  <form
    onSubmit={handleSearch}
    className="hidden md:flex items-center max-w-md w-full"
  >
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Tatil, otel, villa ara..."
      className="w-full border border-gray-300 rounded-l-lg px-3 py-2 text-[13px] focus:ring-2 focus:ring-[color:#00AEEF] outline-none"
    />
    <button
      type="submit"
      className="bg-[color:#00AEEF] text-white px-3 py-2 rounded-r-lg hover:opacity-90 transition"
      aria-label="Ara"
    >
      <Search className="w-4 h-4" />
    </button>
  </form>


          {/* Mobil hamburger */}
          <button
            onClick={() => setMobileMenu((v) => !v)}
            className="md:hidden inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-gray-700"
            aria-label="Menü"
          >
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Desktop kullanıcı aksiyonları */}
          <div className="hidden md:flex items-center gap-4 text-[13.5px]">
            {!user ? (
              <>
                <Link href="/giris" className="hover:text-[color:#00AEEF]">Giriş Yap</Link>
                <Link
                  href="/kayit"
                  className="bg-[color:#00AEEF] text-white px-3 py-2 rounded-lg hover:opacity-90 transition"
                >
                  Hesap Aç
                </Link>
              </>
            ) : (
              <>
                <span className="text-gray-700 hidden lg:inline">
                  Hoş geldin, <strong>{displayName}</strong>
                </span>

                <Link href="/hesabim" className="hover:text-[color:#00AEEF]">
                  Hesabım
                </Link>

                <Link href="/hesabim/mesajlar" className="relative hover:text-[color:#00AEEF]">
                  <Mail className="inline w-5 h-5 mr-1" />
                  Mesajlarım
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-semibold rounded-full px-1.5 py-0.5 shadow">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* Bildirim */}
                <div className="relative">
                  <button
                    onClick={() => setOpenNotif((v) => !v)}
                    className="relative text-gray-800 hover:text-[color:#00AEEF]"
                    aria-label="Bildirimler"
                  >
                    <Bell className="w-5 h-5" />
                    {notifCount > 0 && (
                      <span className="absolute -top-2 -right-1 bg-red-500 text-white text-[10px] font-semibold rounded-full px-1.5 py-0.5 shadow">
                        {notifCount}
                      </span>
                    )}
                  </button>

                  {openNotif && (
                    <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                      <div className="p-3 border-b font-medium text-gray-700 text-[13px]">
                        Bildirimler
                      </div>
                      {notifications.length === 0 ? (
                        <p className="p-4 text-[12.5px] text-gray-500 text-center">
                          Henüz bildiriminiz yok.
                        </p>
                      ) : (
                        <ul className="max-h-60 overflow-y-auto">
                          {notifications.map((n) => (
                            <li
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className={`px-4 py-2 text-[12.5px] border-b cursor-pointer transition ${
                                !n.read ? "bg-gray-100 hover:bg-gray-50" : "hover:bg-gray-50"
                              }`}
                            >
                              <p className="font-medium text-gray-800">
                                {n.title || "Yeni bildirim"}
                              </p>
                              <p className="text-gray-600 text-sm">{n.message || ""}</p>
                              <span className="text-[11px] text-gray-400 block mt-1">
                                {n.createdAt?.toDate
                                  ? new Date(n.createdAt.toDate()).toLocaleString("tr-TR")
                                  : ""}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                <button onClick={handleLogout} className="text-red-600 hover:underline">
                  Çıkış
                </button>

                <Link
                  href="/ilan-ver"
                  className="bg-[color:#FF6B00] text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
                >
                  İlan Ver
                </Link>
              </>
            )}
          </div>
        </div>


        <div className="mt-3 flex flex-col md:flex-row md:items-center gap-2">
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full">
            <div className="flex items-center w-full">
              <input
                //type="text"
                //value={searchTerm}
                //onChange={(e) => setSearchTerm(e.target.value)}
                //placeholder="Tatil, otel, villa, etkinlik ara..."
               // className="w-full border border-gray-300 rounded-l-lg px-4 py-2 text-[13px] focus:ring-2 focus:ring-[color:#00AEEF] outline-none"
              />
              <button
                //type="submit"
                //className="bg-[color:#00AEEF] text-white px-3 py-2 text-[13px] rounded-r-lg hover:opacity-90 transition"
                //aria-label="Ara"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Desktop Detaylı Arama butonu */}
            <Link
              href="/detayli-arama"
              className="hidden md:inline-flex border border-gray-300 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition text-[12.5px] text-gray-700 whitespace-nowrap"
            >
              Detaylı Arama
            </Link>
          </form>

          {/* Mobilde hızlı aksiyon (giriş/kayıt) - menü kapalıyken de görünsün istersen burada bırak */}
          {!user && (
            <div className="md:hidden flex gap-2">
              <Link href="/giris" className="flex-1 text-center border border-gray-300 px-3 py-2 rounded-lg">
                Giriş Yap
              </Link>
              <Link
                href="/kayit"
                className="flex-1 text-center bg-[color:#00AEEF] text-white px-3 py-2 rounded-lg"
              >
                Hesap Aç
              </Link>
            </div>
          )}
        </div>

        {/* MOBİL MENÜ (hamburger) */}
        {mobileMenu && (
          <div className="md:hidden mt-3 border border-gray-200 rounded-xl overflow-hidden bg-white">
            <div className="p-3 flex flex-col gap-2 text-sm">
              <Link href="/detayli-arama" className="px-3 py-2 rounded-lg hover:bg-gray-50">
                Detaylı Arama
              </Link>

              {!user ? (
                <>
                  <Link href="/giris" className="px-3 py-2 rounded-lg hover:bg-gray-50">
                    Giriş Yap
                  </Link>
                  <Link
                    href="/kayit"
                    className="px-3 py-2 rounded-lg bg-[color:#00AEEF] text-white text-center"
                  >
                    Hesap Aç
                  </Link>
                </>
              ) : (
                <>
                  <div className="px-3 py-2 text-gray-700">
                    Hoş geldin, <strong>{displayName}</strong>
                  </div>

                  <Link href="/hesabim" className="px-3 py-2 rounded-lg hover:bg-gray-50">
                    Hesabım
                  </Link>

                  <Link href="/hesabim/mesajlar" className="px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Mesajlarım
                    </span>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-[11px] font-semibold rounded-full px-2 py-0.5">
                        {unreadCount}
                      </span>
                    )}
                  </Link>

                  <button
                    onClick={() => setOpenNotif((v) => !v)}
                    className="px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-between text-left"
                  >
                    <span className="flex items-center gap-2">
                      <Bell className="w-4 h-4" /> Bildirimler
                    </span>
                    {notifCount > 0 && (
                      <span className="bg-red-500 text-white text-[11px] font-semibold rounded-full px-2 py-0.5">
                        {notifCount}
                      </span>
                    )}
                  </button>

                  {openNotif && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden mt-1">
                      {notifications.length === 0 ? (
                        <div className="p-3 text-gray-500 text-[12.5px] text-center">
                          Henüz bildiriminiz yok.
                        </div>
                      ) : (
                        <ul className="max-h-56 overflow-y-auto">
                          {notifications.map((n) => (
                            <li
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className={`px-3 py-2 text-[12.5px] border-b cursor-pointer ${
                                !n.read ? "bg-gray-100" : ""
                              }`}
                            >
                              <div className="font-medium text-gray-900">
                                {n.title || "Yeni bildirim"}
                              </div>
                              <div className="text-gray-600">{n.message || ""}</div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  <Link
                    href="/ilan-ver"
                    className="px-3 py-2 rounded-lg bg-[color:#FF6B00] text-white text-center"
                    onClick={() => setMobileMenu(false)}
                  >
                    İlan Ver
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-lg border border-red-200 text-red-600"
                  >
                    Çıkış
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
