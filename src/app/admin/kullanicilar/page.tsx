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
} from "firebase/firestore";
import Link from "next/link";

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

        // ilan sayısı
        const ilanQ = query(
          collection(db, "ilanlar"),
          where("sahipUid", "==", d.id)
        );
        const ilanSnap = await getDocs(ilanQ);
        user.ilanCount = ilanSnap.size;

        // mesaj sayısı
        const msgQ = query(
          collection(db, "messages"),
          where("participants", "array-contains", d.id)
        );
        const msgSnap = await getDocs(msgQ);
        user.mesajCount = msgSnap.size;

        list.push(user);
      }

      setUsers(list);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const toggleActive = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "users", id), { isActive: !current });
    alert(`Kullanıcı ${current ? "engellendi" : "aktif hale getirildi"}.`);
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isActive: !current } : u))
    );
  };

  // 🔎 filtre + arama uygulanmış liste
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
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl font-bold">👥 Kullanıcılar</h1>

        {/* 🔍 Arama ve Filtre */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ad, e-posta ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-400 w-[200px]"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">Tümü</option>
            <option value="active">Aktif</option>
            <option value="banned">Engelli</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Yükleniyor…</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">Sonuç bulunamadı.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-2 text-left">Ad Soyad</th>
                <th className="px-4 py-2 text-left">E-posta</th>
                <th className="px-4 py-2 text-left">Kayıt Tarihi</th>
                <th className="px-4 py-2 text-left">İlan</th>
                <th className="px-4 py-2 text-left">Mesaj</th>
                <th className="px-4 py-2 text-left">Durum</th>
                <th className="px-4 py-2 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className={`border-b ${
                    !u.isActive ? "bg-red-50" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-2 font-medium">{u.adSoyad}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">
                    {u.createdAt?.toDate
                      ? new Date(u.createdAt.toDate()).toLocaleDateString("tr-TR")
                      : "—"}
                  </td>
                  <td className="px-4 py-2">{u.ilanCount}</td>
                  <td className="px-4 py-2">{u.mesajCount}</td>
                  <td className="px-4 py-2">
                    {u.isActive ? (
                      <span className="text-green-600 font-semibold">
                        Aktif
                      </span>
                    ) : (
                      <span className="text-red-600 font-semibold">
                        Engelli
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <button
                      onClick={() => toggleActive(u.id, u.isActive ?? true)}
                      className={`px-3 py-1 rounded text-white ${
                        u.isActive
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {u.isActive ? "Engelle" : "Aktifleştir"}
                    </button>
                    <a
                      href={`mailto:${u.email}`}
                      className="border px-3 py-1 rounded hover:bg-gray-50"
                    >
                      E-posta
                    </a>
                    <Link
                      href={`/admin/mesajlar?chat=${u.id}`}
                      className="border px-3 py-1 rounded hover:bg-gray-50"
                    >
                      Mesaj
                    </Link>
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
