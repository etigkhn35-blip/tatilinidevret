"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  onSnapshot,
  query,
  getDocs,
  where,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import Link from "next/link";

/* ------------------------------ Tipler ------------------------------ */
type UserData = {
  id: string;
  displayName?: string;
  email: string;
  phone?: string;
  photoURL?: string;
  createdAt?: Timestamp;
  role?: string;
  status?: string;
  lastLogin?: string;
};

type ListingData = {
  id: string;
  title: string;
  price?: number;
  status?: string;
  endDate?: Timestamp;
  location?: string;
};

/* ------------------------------ Bileşen ------------------------------ */
export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userListings, setUserListings] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(true);

  /* ------------------------------ Firestore Dinleme ------------------------------ */
  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as UserData[];
      setUsers(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  /* ------------------------------ Kullanıcı Detayı ------------------------------ */
  const openUserDetails = async (user: UserData) => {
    setSelectedUser(user);
    const q = query(collection(db, "listings"), where("userId", "==", user.id));
    const snap = await getDocs(q);
    setUserListings(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ListingData[]);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setUserListings([]);
  };

  /* ------------------------------ Yönetim İşlemleri ------------------------------ */
  const updateUserRole = async (id: string, newRole: string) => {
    await updateDoc(doc(db, "users", id), { role: newRole });
    alert(`Kullanıcı rolü "${newRole}" olarak güncellendi ✅`);
  };

  const updateUserStatus = async (id: string, newStatus: string) => {
    await updateDoc(doc(db, "users", id), { status: newStatus });
    alert(`Kullanıcı ${newStatus === "suspended" ? "askıya alındı" : "aktifleştirildi"} ✅`);
  };

  const deleteUser = async (id: string) => {
    if (confirm("Bu kullanıcıyı kalıcı olarak silmek istiyor musun?")) {
      await deleteDoc(doc(db, "users", id));
      alert("Kullanıcı silindi ✅");
    }
  };

  /* ------------------------------ Görsel ------------------------------ */
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Yükleniyor...
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-4 py-8 space-y-8">
        {/* Üst Başlık */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-gray-900">👤 Kullanıcı Yönetimi</h1>
          <Link href="/admin" className="text-sm text-primary hover:underline font-semibold">
            ← Admin Paneline Dön
          </Link>
        </div>

        {/* Kullanıcı Tablosu */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Tüm Kullanıcılar ({users.length})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-left">
                  <th className="p-3 border-b">Ad Soyad</th>
                  <th className="p-3 border-b">E-posta</th>
                  <th className="p-3 border-b">Durum</th>
                  <th className="p-3 border-b">Rol</th>
                  <th className="p-3 border-b">Kayıt Tarihi</th>
                  <th className="p-3 border-b text-center">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="p-3 border-b font-medium text-gray-800">{u.displayName || "—"}</td>
                    <td className="p-3 border-b text-gray-700">{u.email}</td>
                    <td className="p-3 border-b">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-semibold ${
                          u.status === "suspended"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {u.status === "suspended" ? "Askıda" : "Aktif"}
                      </span>
                    </td>
                    <td className="p-3 border-b text-gray-700">{u.role || "user"}</td>
                    <td className="p-3 border-b text-gray-600">
                      {u.createdAt
                        ? new Date(u.createdAt.toDate()).toLocaleDateString("tr-TR")
                        : "—"}
                    </td>
                    <td className="p-3 border-b text-center">
                      <div className="flex flex-wrap justify-center gap-2">
                        <button
                          onClick={() => openUserDetails(u)}
                          className="text-primary hover:underline text-sm"
                        >
                          Detay
                        </button>
                        <button
                          onClick={() =>
                            updateUserStatus(u.id, u.status === "suspended" ? "active" : "suspended")
                          }
                          className="text-yellow-600 hover:underline text-sm"
                        >
                          {u.status === "suspended" ? "Aktifleştir" : "Askıya Al"}
                        </button>
                        <button
                          onClick={() =>
                            updateUserRole(u.id, u.role === "admin" ? "user" : "admin")
                          }
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {u.role === "admin" ? "Kullanıcı Yap" : "Admin Yap"}
                        </button>
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Kullanıcı Detay Modalı */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4 text-gray-900">
              {selectedUser.displayName || "Kullanıcı Detayı"}
            </h2>

            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>E-posta:</strong> {selectedUser.email}</p>
              <p><strong>Telefon:</strong> {selectedUser.phone || "—"}</p>
              <p><strong>Rol:</strong> {selectedUser.role || "user"}</p>
              <p><strong>Durum:</strong> {selectedUser.status || "active"}</p>
              <p><strong>Son Giriş:</strong> {selectedUser.lastLogin || "—"}</p>
            </div>

            <hr className="my-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Kullanıcının İlanları</h3>
            {userListings.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {userListings.map((l) => (
                  <li key={l.id} className="py-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">
                          {l.title || "İlan Başlığı Yok"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {l.location || "Konum Yok"} — {l.price?.toLocaleString("tr-TR")} ₺
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-semibold ${
                          l.status === "active"
                            ? "bg-green-100 text-green-700"
                            : l.status === "expired"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {l.status || "Bilinmiyor"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">İlan bulunmuyor.</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
