"use client";

import { useEffect, useState } from "react";
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
import { Bell, Mail } from "lucide-react";

interface NotificationDoc extends DocumentData {
  id: string;
  read?: boolean;
  title?: string;
  message?: string;
  createdAt?: any;
  type?: string;
  toUserUid?: string;
  chatId?: string;
  destekId?: string;
  ilanId?: string;
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState(""); // ✅ Arama alanı
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifCount, setNotifCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [openNotif, setOpenNotif] = useState<boolean>(false);

  // 🔍 Arama
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    window.location.href = `/arama?q=${encodeURIComponent(searchTerm.trim())}`;
  };

  // 👤 Kullanıcı giriş kontrolü
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubAuth();
  }, []);

  // 💬 Mesaj bildirimi sayısı
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
        id: d.id, // 🔄 senin orijinal sıralamanla
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

  // 🔘 Bildirim tıklama yönlendirmesi
  const handleNotificationClick = async (n: NotificationDoc) => {
    try {
      if (!n.id) return;
      await updateDoc(doc(db, "notifications", n.id), { read: true });

      // 💬 Mesaj
      if (n.type === "message") {
  window.location.href = `/hesabim/mesajlar`;
  return;
}

      // 🧾 Destek
      if (n.type === "destek") {
  window.location.href = "/hesabim/mesajlar";
  return;
}

      // 🏖️ İlan
      if (n.type === "ilan" || n.type?.startsWith("ilan_")) {
        const url = n.ilanId
          ? `/ilan/${encodeURIComponent(n.ilanId)}`
          : `/hesabim`;
        window.location.href = url;
        return;
      }

      // ❓Bilinmeyen tip
      window.location.href = `/hesabim`;
    } catch (e) {
      console.error("Bildirim tıklama hatası:", e);
    }
  };

  // 🚪 Çıkış
  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 p-4">
        {/* 🔹 Logo */}
        <Link href="/" className="text-2xl font-semibold whitespace-nowrap">
          <span className="text-primary">tatilini</span>
          <span className="text-accent">devret</span>
        </Link>

        {/* 🔍 Arama */}
        <form
          onSubmit={handleSearch}
          className="flex-1 flex items-center justify-start gap-2 w-full md:w-auto"
        >
          <div className="flex items-center w-full md:w-[70%] lg:w-[60%]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tatil, otel, villa, etkinlik ara..."
              className="w-full border border-gray-300 rounded-l-lg px-4 py-2 text-[13px] focus:ring-2 focus:ring-primary outline-none"
            />
            <button
              type="submit"
              className="bg-primary text-white px-3 py-2 text-[13px] rounded-r-lg hover:bg-accent transition"
            >
              🔍
            </button>
          </div>

          <Link
            href="/detayli-arama"
            className="ml-2 border border-gray-300 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition text-[12.5px] font-normal text-gray-700"
          >
            Detaylı Arama
          </Link>
        </form>

        {/* 👤 Kullanıcı Menü */}
        <div className="flex items-center gap-4 relative text-[13.5px]">
          {!user ? (
            <>
              <Link href="/giris" className="hover:text-primary">Giriş Yap</Link>
              <Link
                href="/kayit"
                className="bg-primary text-white px-3 py-2 rounded-lg hover:bg-accent transition"
              >
                Hesap Aç
              </Link>
            </>
          ) : (
            <>
              <span className="text-gray-700 hidden sm:inline">
                Hoş geldin,{" "}
                <strong>{user.displayName || user.email?.split("@")[0]}</strong>
              </span>

              <Link href="/hesabim" className="hover:text-primary">
                Hesabım
              </Link>

              {/* 💬 Mesaj */}
              <Link href="/hesabim/mesajlar" className="relative hover:text-primary">
                <Mail className="inline w-5 h-5 mr-1" />
                Mesajlarım
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-semibold rounded-full px-1.5 py-0.5 shadow">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* 🔔 Bildirimler */}
              <div className="relative">
                <button
                  onClick={() => setOpenNotif((v) => !v)}
                  className="relative text-gray-800 hover:text-primary"
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
                              !n.read
                                ? "bg-gray-100 hover:bg-gray-50"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <p className="font-medium text-gray-800">
                              {n.title || "Yeni bildirim"}
                            </p>
                            <p className="text-gray-600 text-sm">
                              {n.message || ""}
                            </p>
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
                className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-orange-500 transition ml-2"
              >
                İlan Ver
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
