"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  limit,
  where,
} from "firebase/firestore";
import { Bell } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";

type Notif = {
  id: string;
  title?: string;
  message?: string;
  read?: boolean;
  createdAt?: any;
  type?: string;
  chatId?: string;
  path?: string;
  toUserUid?: string;
};


export default function AdminNotifications() {
  const [newMsgCount, setNewMsgCount] = useState(0);
  const [newNotifCount, setNewNotifCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/sounds/notify.mp3");
  }, []);

  // 💬 Yeni mesaj dinleme (kullanıcıdan gelen)
  useEffect(() => {
    const q = query(collection(db, "messages"), where("lastSenderId", "!=", "admin"));
    const unsub = onSnapshot(q, (snap) => {
      const count = snap.docs.length;
      setNewMsgCount(count);

      if (count > 0) {
        toast.info("📩 Yeni mesaj geldi!", { position: "top-right", autoClose: 4000 });
        if (audioRef.current) audioRef.current.play().catch(() => {});
      }
    });
    return () => unsub();
  }, []);

  // 🔔 Bildirimleri dinle
  useEffect(() => {
  const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"), limit(10));
  const unsub = onSnapshot(q, (snap) => {
    
    const notifs: Notif[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    }));

    const unread = notifs.filter((n) => !n.read).length;
    setNewNotifCount(unread);

    if (unread > 0) {
      toast("🔔 Yeni bildirim!", { position: "top-right", autoClose: 3000 });
      audioRef.current?.play().catch(() => {});
    }
  });

  return () => unsub();
}, []);
  return (
    <div className="relative flex items-center gap-5">
      {/* 💬 Mesajlar */}
      <Link href="/hesabim/mesajlar" className="relative p-2 rounded-full hover:bg-gray-100 transition">
        <Bell className="w-6 h-6 text-gray-700" />
        {newMsgCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-semibold rounded-full px-1.5">
            {newMsgCount}
          </span>
        )}
      </Link>

      {/* 🔔 Bildirim Çanı */}
      <div className="relative">
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
          <Bell className="w-6 h-6 text-gray-700" />
          {newNotifCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-semibold rounded-full px-1.5">
              {newNotifCount}
            </span>
          )}
        </button>
      </div>

      <audio ref={audioRef} src="/sounds/notify.mp3" preload="auto" />
    </div>
  );
}
