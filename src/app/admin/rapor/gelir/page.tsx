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

import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, BarElement, Tooltip, Legend,
} from "chart.js";

import { Line, Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, BarElement, Tooltip, Legend
);

type Order = {
  id: string;
  total?: number;
  base?: number;
  one?: number;
  vit?: number;
  bold?: number;
  createdAt?: any;
};

const tsToMonth = (ts: any) => {
  try {
    const d = ts.toDate();
    return `${d.getMonth() + 1}.${d.getFullYear()}`;
  } catch {
    return "";
  }
};

export default function AdminGelirRaporuPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) return <p className="p-6">Yükleniyor...</p>;

  // ---------------- Aylık Gelir ----------------
  const monthly: Record<string, number> = {};
  orders.forEach((o) => {
    if (!o.createdAt) return;
    const m = tsToMonth(o.createdAt);
    monthly[m] = (monthly[m] || 0) + (o.total ?? 0);
  });

  const labels = Object.keys(monthly).reverse();
  const values = Object.values(monthly).reverse();

  const lineData = {
    labels,
    datasets: [
      {
        label: "Aylık Gelir (₺)",
        data: values,
        borderColor: "rgb(37,99,235)",
        backgroundColor: "rgba(37,99,235,0.4)",
      },
    ],
  };

  // ---------------- Paket Türleri ----------------
  let baseSum = 0, oneSum = 0, vitSum = 0, boldSum = 0;
  let baseCount = 0, oneCount = 0, vitCount = 0, boldCount = 0;

  orders.forEach(o => {
    if (o.base) { baseSum += o.base; baseCount++; }
    if (o.one)  { oneSum  += o.one;  oneCount++;  }
    if (o.vit)  { vitSum  += o.vit;  vitCount++;  }
    if (o.bold) { boldSum += o.bold; boldCount++; }
  });

  const pieData = {
    labels: ["Standart İlan", "Öne Çıkar", "Vitrin", "Koyu Başlık"],
    datasets: [
      {
        data: [baseSum, oneSum, vitSum, boldSum],
        backgroundColor: [
          "#2563eb", "#16a34a", "#d97706", "#b91c1c"
        ],
      },
    ],
  };

  const barData = {
    labels: ["Standart", "Öne Çıkar", "Vitrin", "Koyu Başlık"],
    datasets: [
      {
        label: "Satış Adedi",
        data: [baseCount, oneCount, vitCount, boldCount],
        backgroundColor: [
          "#2563eb", "#16a34a", "#d97706", "#b91c1c"
        ],
      },
    ],
  };

  return (
    <main className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">📊 Gelir Analizi</h1>

      {/* ------- Grafikler -------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 border rounded-lg shadow">
          <h2 className="font-semibold mb-3">📈 Aylık Gelir Grafiği</h2>
          <Line data={lineData} />
        </div>

        <div className="bg-white p-4 border rounded-lg shadow">
          <h2 className="font-semibold mb-3">🍩 Gelir Dağılımı</h2>
          <Pie data={pieData} />
        </div>
      </div>

      <div className="bg-white p-4 border rounded-lg shadow mb-6">
        <h2 className="font-semibold mb-3">📦 Paket Satış Adeti</h2>
        <Bar data={barData} />
      </div>

      {/* ------- Aylık Gelir Tablosu ------- */}
      <div className="bg-white p-4 border rounded-lg shadow overflow-x-auto">
        <h2 className="font-semibold mb-3">📅 Aylık Gelir Tablosu</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-3 py-2">Ay</th>
              <th className="text-left px-3 py-2">Toplam Gelir (₺)</th>
            </tr>
          </thead>
          <tbody>
            {labels.map((m, i) => (
              <tr key={m} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{m}</td>
                <td className="px-3 py-2 text-blue-600 font-semibold">
                  {values[i].toLocaleString("tr-TR")} ₺
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
