"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebaseConfig";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function BildirimlerPage() {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🔹 Giriş kontrolü
  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  // 🔹 Bildirimleri getir
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("toUserUid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setNotifications(list);
      setLoading(false);
    });
  }, [user]);

  // 🔹 Bildirime tıklanınca yönlendirme
  const handleClick = async (notif: any) => {
    // önce okundu yap
    await updateDoc(doc(db, "notifications", notif.id), { read: true });

    // 🔸 Bildirim türüne göre yönlendirme
    if (notif.type === "destek") {
      router.push("/hesabim/mesajlar"); 
      return;
    }

    if (notif.type === "message") {
      router.push("/hesabim/mesajlar");
      return;
    }

    if (notif.type === "ilan" && notif.ilanId) {
      router.push(`/ilan/${notif.ilanId}`);
      return;
    }

    if (notif.type === "offer") {
      router.push("/hesabim/mesajlar");
      return;
    }

    // tanımsız ise bir yere yönlendirme
  };

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Devam etmek için giriş yapmalısınız.
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-[900px] mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">🔔 Bildirimlerim</h1>

        <div className="bg-white border rounded-xl shadow-sm">
          {loading ? (
            <p className="text-center py-6 text-gray-500 animate-pulse">
              Bildirimler yükleniyor...
            </p>
          ) : notifications.length === 0 ? (
            <p className="text-center py-6 text-gray-500">
              Henüz bir bildiriminiz yok.
            </p>
          ) : (
            <ul className="divide-y">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`p-4 cursor-pointer transition ${
                    n.read
                      ? "bg-white hover:bg-gray-50"
                      : "bg-blue-50 hover:bg-blue-100"
                  }`}
                >
                  <h3 className="font-semibold text-gray-800">{n.title}</h3>
                  <p className="text-sm text-gray-600">{n.message}</p>
                  <span className="text-xs text-gray-400 mt-1 block">
                    {n.createdAt?.toDate
                      ? new Date(n.createdAt.toDate()).toLocaleString("tr-TR")
                      : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
