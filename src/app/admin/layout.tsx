"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { Bell, MessageCircle } from "lucide-react";
import { auth, db } from "@/lib/firebaseConfig";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  limit,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

type Talep = {
  id: string;
  baslik?: string;
  durum?: string;
  olusturmaTarihi?: any;
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [count, setCount] = useState<number>(0);
  const [latest, setLatest] = useState<Talep[]>([]);
  const [open, setOpen] = useState(false);

  const [unread, setUnread] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);

  /* 🔐 Yönetici kontrolü */
  useEffect(() => {
    let isMounted = true;

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;

      if (!user) {
        window.location.href = "/giris";
        return;
      }

      if (user.email === "info@tatilinidevret.com") {
        setAuthorized(true);
      } else {
        alert("Bu sayfaya yalnızca info@tatilinidevret.com erişebilir.");
        window.location.href = "/";
      }

      setChecking(false);
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  /* 🖱️ Kullanıcı etkileşimi sonrası sesi etkinleştir */
  useEffect(() => {
    const enableAudio = () => {
      if (audioRef.current) {
        audioRef.current.muted = false;
        setAudioEnabled(true);
        console.log("🔊 Ses etkinleştirildi");
      }
      window.removeEventListener("click", enableAudio);
    };

    window.addEventListener("click", enableAudio);
    return () => window.removeEventListener("click", enableAudio);
  }, []);

  /* 🔔 Yeni destek talepleri */
  useEffect(() => {
    if (!authorized) return;
    let mounted = true;

    const qCount = query(
      collection(db, "destek_talepleri"),
      where("durum", "==", "beklemede")
    );
    const unsubCount = onSnapshot(qCount, (snap) => {
      if (mounted) setCount(snap.size);
    });

    const qLatest = query(
      collection(db, "destek_talepleri"),
      orderBy("olusturmaTarihi", "desc"),
      limit(5)
    );
    const unsubLatest = onSnapshot(qLatest, (snap) => {
      if (!mounted) return;
      const items: Talep[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setLatest(items);
    });

    return () => {
      mounted = false;
      unsubCount();
      unsubLatest();
    };
  }, [authorized]);

  /* 🔴 Yeni bildirim sesi */
  useEffect(() => {
  if (!authorized || !audioEnabled) return;
  let mounted = true;

  const q = query(
  collection(db, "notifications"),
  where("toUserUid", "==", "admin"),
  orderBy("createdAt", "desc")
);

  const unsub = onSnapshot(q, (snap) => {
    if (!mounted) return;

    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
    const unreadList = list.filter((n) => !n.read);

    // Yeni bildirim varsa zil sesi çalsın
    if (unreadList.length > unread && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }

    setUnread(unreadList.length);
  });

  return () => {
    mounted = false;
    unsub();
  };
}, [authorized, audioEnabled, unread]);

/* 🔘 Bildirimleri okundu yap */
const handleNotificationsRead = async () => {
  const q = query(
    collection(db, "notifications"),
    where("toUserUid", "==", "admin"),
    where("read", "==", false)
  );

  const snap = await getDocs(q);

  for (const d of snap.docs) {
    await updateDoc(doc(db, "notifications", d.id), {
      read: true,
    });
  }

  setUnread(0);
};

  /* 🧭 Yükleniyor / Yetkisiz durumları */
  if (checking)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Yönetici doğrulanıyor...
      </div>
    );

  if (!authorized)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Erişim reddedildi.
      </div>
    );

  /* ------------------- UI ------------------- */
  return (
    <div className="min-h-screen flex flex-col">
      <audio ref={audioRef} src="/sounds/notify.mp3" preload="auto" muted />

      <header className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between p-4">
          <Link href="/admin" className="text-2xl font-bold">
            <span className="text-primary">tatilini</span>
            <span className="text-accent">devret</span> Admin
          </Link>

          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/admin" className="hover:text-primary">
              Dashboard
            </Link>
            <Link href="/admin/kullanicilar" className="hover:text-primary">
              Kullanıcılar
              {unread > 0 && (
                <span className="ml-1 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5">
                  {unread}
                </span>
              )}
            </Link>
            <Link href="/admin/ilanlar" className="hover:text-primary">
              İlanlar
            </Link>
            <Link href="/admin/destek-talepleri" className="hover:text-primary">
              Destek
            </Link>
            <Link href="/admin/mesajlar" className="flex items-center gap-1 hover:text-primary">
              <MessageCircle className="w-5 h-5" />
              Mesajlar
            </Link>

            {/* 🔔 Bildirim Zili */}
            <button
              onClick={handleNotificationsRead}
              className="relative p-2 rounded-md hover:bg-gray-100"
            >
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 text-[11px] font-bold bg-red-500 text-white rounded-full px-1.5">
                  {unread}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  );
}
