"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";
import { auth } from "@/lib/firebaseConfig";
import { Bell } from "lucide-react";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const user = auth.currentUser;

  /* 🔔 Bildirimleri Dinle */
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("toUserUid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const newOnes = list.filter((i: any) => !i.read);
      const oldUnread = notifications.filter((i: any) => !i.read).length;

      if (newOnes.length > oldUnread) {
        audioRef.current?.play().catch(() => {});
      }

      setNotifications(list);
    });

    return () => unsub();
  }, [user]);

  const unread = notifications.filter((n) => !n.read).length;

  /* 📌 Bildirime tıklayınca yönlendirme */
  const handleClick = (n: any) => {
    // 🔗 Eğer bildirimde path varsa → direkt oraya git
    if (n.path) {
      window.location.href = n.path;
      return;
    }

    // 🔗 Chat mesajı
    if (n.type === "message" && n.chatId) {
      window.location.href = `/mesajlar?chat=${n.chatId}`;
      return;
    }

    // 🔗 Teklif bildirimi
    if (n.type === "teklif" && n.ilanId) {
      window.location.href = `/ilan/${n.ilanId}`;
      return;
    }

    // 🔗 İlan bildirimi
    if (n.type === "ilan") {
      window.location.href = "/hesabim/bildirimler";
      return;
    }

    // fallback
    return;
  };

  /* 🔵 Okundu işaretle */
  const markAsRead = () => {
    notifications.forEach((n) => {
      if (!n.read) {
        updateDoc(doc(db, "notifications", n.id), { read: true });
      }
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) markAsRead();
        }}
        className="relative"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white border rounded-xl shadow-xl z-50 max-h-96 overflow-auto">
          <div className="p-3 font-semibold border-b flex justify-between">
            <span>Bildirimler</span>
            <span className="text-xs text-gray-500">{unread} yeni</span>
          </div>

          {notifications.length === 0 ? (
            <p className="p-4 text-center text-gray-500 text-sm">
              Henüz bildiriminiz yok.
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                className={`px-4 py-2 border-b cursor-pointer hover:bg-gray-50 ${
                  !n.read ? "bg-blue-50" : ""
                }`}
              >
                <p className="font-semibold">{n.title}</p>
                <p className="text-xs text-gray-600">{n.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">
                  {n.createdAt?.toDate
                    ? new Date(n.createdAt.toDate()).toLocaleString("tr-TR")
                    : ""}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      <audio ref={audioRef} src="/sounds/notify.mp3" preload="auto" />
    </div>
  );
}
