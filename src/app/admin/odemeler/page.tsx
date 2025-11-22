"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  DocumentData,
} from "firebase/firestore";
import Link from "next/link";

type Order = {
  id: string;
  ilanBaslik?: string;
  ilanId?: string;
  aliciUid?: string;
  saticiUid?: string;
  fiyat?: number;
  durum?: string;
  createdAt?: any;
};

export default function AdminOdemelerPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filtered, setFiltered] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterEmail, setFilterEmail] = useState("");
  const [filterIlan, setFilterIlan] = useState("");
  const [filterDurum, setFilterDurum] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // CSV Export
  function exportCSV(rows: any[], fileName = "odemeler.csv") {
    if (!rows.length) return;

    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(";"),
      ...rows.map((r) => headers.map((h) => (r[h] ?? "")).join(";")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Ödemeleri çek
  useEffect(() => {
    const qOrders = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(qOrders, (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as DocumentData),
      }));
      setOrders(list);
      setFiltered(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Filtre uygula
  const applyFilter = () => {
    let list = [...orders];

    if (filterEmail.trim()) {
      list = list.filter(
        (o) =>
          o.aliciUid?.includes(filterEmail.trim()) ||
          o.saticiUid?.includes(filterEmail.trim())
      );
    }

    if (filterIlan.trim()) {
      list = list.filter(
        (o) =>
          o.ilanBaslik?.toLowerCase().includes(filterIlan.toLowerCase()) ||
          o.ilanId?.includes(filterIlan.trim())
      );
    }

    if (filterDurum) {
      list = list.filter((o) => o.durum === filterDurum);
    }

    if (startDate) {
      list = list.filter((o) => {
        if (!o.createdAt?.toDate) return false;
        return o.createdAt.toDate() >= new Date(startDate);
      });
    }

    if (endDate) {
      list = list.filter((o) => {
        if (!o.createdAt?.toDate) return false;
        return o.createdAt.toDate() <= new Date(endDate + " 23:59:59");
      });
    }

    setFiltered(list);
  };

  const resetFilters = () => {
    setFilterEmail("");
    setFilterIlan("");
    setFilterDurum("");
    setStartDate("");
    setEndDate("");
    setFiltered(orders);
  };

  if (loading) return <p className="p-6">Yükleniyor...</p>;

  return (
    <main className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">💳 Ödemeler</h1>

      {/* CSV Export Button */}
      <button
        onClick={() => exportCSV(filtered, "odemeler.csv")}
        className="mb-3 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700"
      >
        📥 CSV Olarak İndir
      </button>

      {/* Filtreler */}
      <div className="bg-white border rounded-lg p-4 mb-5 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
        <input
          placeholder="Kullanıcı UID / Email"
          className="border rounded px-2 py-1"
          value={filterEmail}
          onChange={(e) => setFilterEmail(e.target.value)}
        />
        <input
          placeholder="İlan ID / Başlık"
          className="border rounded px-2 py-1"
          value={filterIlan}
          onChange={(e) => setFilterIlan(e.target.value)}
        />

        <select
          className="border rounded px-2 py-1"
          value={filterDurum}
          onChange={(e) => setFilterDurum(e.target.value)}
        >
          <option value="">Durum (Tümü)</option>
          <option value="ödeme başarılı">Ödeme Başarılı</option>
          <option value="iptal edildi">İptal Edildi</option>
          <option value="iade bekliyor">İade Bekliyor</option>
        </select>

        <div className="flex gap-2">
          <input
            type="date"
            className="border rounded px-2 py-1 flex-1"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="border rounded px-2 py-1 flex-1"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <button
          onClick={applyFilter}
          className="bg-blue-600 text-white rounded px-3 py-2 mt-2 md:mt-0"
        >
          Filtre Uygula
        </button>
        <button
          onClick={resetFilters}
          className="border rounded px-3 py-2 mt-2 md:mt-0"
        >
          Temizle
        </button>
      </div>

      {/* Ödeme Tablosu */}
      <div className="bg-white border rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-3 py-2">İlan</th>
              <th className="text-left px-3 py-2">Tutar</th>
              <th className="text-left px-3 py-2">Durum</th>
              <th className="text-left px-3 py-2">Tarih</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">
                  <Link
                    href={`/ilan/${o.ilanId}`}
                    className="text-blue-600 underline"
                  >
                    {o.ilanBaslik}
                  </Link>
                </td>
                <td className="px-3 py-2">
                  {o.fiyat?.toLocaleString("tr-TR")} ₺
                </td>
                <td className="px-3 py-2">{o.durum}</td>
                <td className="px-3 py-2">
                  {o.createdAt?.toDate?.().toLocaleString("tr-TR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="text-center py-6 text-gray-500">Kayıt bulunamadı.</p>
        )}
      </div>
    </main>
  );
}
