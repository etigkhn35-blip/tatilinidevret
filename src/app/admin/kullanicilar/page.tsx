"use client";

import { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  updateDoc,
  doc,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

type UserData = {
  id: string;
  adSoyad?: string;
  email?: string;
  createdAt?: any;
  isActive?: boolean;
  ilanCount?: number;
  mesajCount?: number;
};

export default function AdminKullanicilarPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "banned">("all");
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, "users"));
      const list: UserData[] = [];

      for (const d of snap.docs) {
        const data = d.data() as any;
        const user: UserData = {
          id: d.id,
          adSoyad: data.adSoyad || "-",
          email: data.email || "-",
          createdAt: data.createdAt,
          isActive: data.isActive ?? true,
        };

        list.push(user);
      }

      setUsers(list);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const toggleActive = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "users", id), { isActive: !current });
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isActive: !current } : u))
    );
  };

  // ✅ CHAT BAŞLAT (EN ÖNEMLİ KISIM)
  const startChatWithUser = async (userId: string) => {
    // 1️⃣ var mı bak
    const q = query(
      collection(db, "messages"),
      where("participants", "array-contains", userId)
    );

    const snap = await getDocs(q);
    let chatId = "";

    snap.forEach((d) => {
      const p = (d.data() as any).participants || [];
      if (p.includes("admin")) {
        chatId = d.id;
      }
    });

    // 2️⃣ yoksa oluştur
    if (!chatId) {
      const ref = await addDoc(collection(db, "messages"), {
        participants: ["admin", userId],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: "",
        lastSenderId: "admin",
      });
      chatId = ref.id;
    }

    // 3️⃣ mesaj sayfasına git
    router.push(`/admin/mesajlar?chat=${chatId}`);
  };

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.adSoyad?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "active"
          ? u.isActive
          : !u.isActive;
      return matchesSearch && matchesFilter;
    });
  }, [users, search, filter]);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">👥 Kullanıcılar</h1>

      {loading ? (
        <p>Yükleniyor…</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Ad Soyad</th>
                <th className="px-4 py-2 text-left">E-posta</th>
                <th className="px-4 py-2 text-left">Durum</th>
                <th className="px-4 py-2 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="px-4 py-2">{u.adSoyad}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">
                    {u.isActive ? "Aktif" : "Engelli"}
                  </td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <button
                      onClick={() => toggleActive(u.id, u.isActive ?? true)}
                      className="px-3 py-1 rounded bg-gray-600 text-white"
                    >
                      {u.isActive ? "Engelle" : "Aktifleştir"}
                    </button>

                    <button
                      onClick={() => startChatWithUser(u.id)}
                      className="px-3 py-1 rounded border"
                    >
                      Mesaj Yaz
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
