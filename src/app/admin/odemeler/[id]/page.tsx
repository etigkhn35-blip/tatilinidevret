"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import Link from "next/link";
import { doc, getDoc, updateDoc } from "firebase/firestore";

type Order = {
  id: string;
  ilanId: string;
  ilanBaslik: string;
  aliciUid: string;
  saticiUid: string;
  fiyat: number;
  base?: number;
  one?: number;
  vit?: number;
  bold?: number;
  kdv?: number;
  total?: number;
  createdAt?: any;
  durum: string;
};

const tsToString = (ts: any) => {
  if (!ts) return "";
  try {
    return ts.toDate().toLocaleString("tr-TR");
  } catch {
    return "";
  }
};

export default function AdminPaymentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const ref = doc(db, "orders", String(id));
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setOrder({ id: snap.id, ...(snap.data() as any) });
        }
      } catch (e) {
        console.error("Ödeme yüklenemedi:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <p className="text-center p-6">Yükleniyor...</p>;
  if (!order) return <p className="text-center p-6">Ödeme bulunamadı.</p>;

  return (
    <main className="max-w-3xl mx-auto bg-white border rounded-xl shadow p-6 mt-6">
      <h1 className="text-2xl font-bold mb-4">🧾 Ödeme Detayı</h1>

      {/* Genel bilgiler */}
      <div className="space-y-2 text-sm mb-6">
        <p><b>Ödeme ID:</b> {order.id}</p>
        <p><b>Durum:</b> {order.durum}</p>
        <p><b>Tarih:</b> {tsToString(order.createdAt)}</p>
      </div>

      {/* İlan */}
      <div className="border rounded-lg p-4 mb-6 bg-gray-50">
        <p className="font-semibold">{order.ilanBaslik}</p>
        <p className="text-xs text-gray-500">İlan ID: {order.ilanId}</p>

        <Link
          href={`/admin/ilanlar/${order.ilanId}`}
          className="inline-block text-blue-600 text-sm underline mt-1"
        >
          İlanı İncele
        </Link>
      </div>
      {/* Durum Güncelleme */}
<div className="mb-6">
  <label className="font-semibold text-sm">Ödeme Durumu</label>
  <select
    className="border rounded px-3 py-2 text-sm w-full mt-1"
    value={order.durum}
    onChange={async (e) => {
      const yeni = e.target.value;
      await updateDoc(doc(db, "orders", order.id), {
        durum: yeni,
        updatedAt: new Date(),
      });
      setOrder({ ...order, durum: yeni });
      alert("✔️ Ödeme durumu güncellendi!");
    }}
  >
    <option value="ödeme başarılı">Ödeme Başarılı</option>
    <option value="iptal edildi">İptal Edildi</option>
    <option value="iade bekliyor">İade Bekliyor</option>
    <option value="iade tamamlandı">İade Tamamlandı</option>
  </select>
</div>

      {/* Ödeme Kalemleri */}
      <h2 className="font-semibold mb-2">💳 Ödeme Özeti</h2>
      <table className="w-full text-sm mb-6">
        <tbody>
          <tr><td>Standart İlan Ücreti:</td><td className="text-right">{order.base ?? 0} ₺</td></tr>
          {order.one ? <tr><td>Öne Çıkar:</td><td className="text-right">{order.one} ₺</td></tr> : null}
          {order.vit ? <tr><td>Vitrin:</td><td className="text-right">{order.vit} ₺</td></tr> : null}
          {order.bold ? <tr><td>Koyu Başlık:</td><td className="text-right">{order.bold} ₺</td></tr> : null}
          <tr><td>KDV (%20):</td><td className="text-right">{order.kdv ?? 0} ₺</td></tr>
          <tr className="font-bold text-blue-700 border-t">
            <td className="py-2">TOPLAM:</td>
            <td className="py-2 text-right">{order.total ?? order.fiyat} ₺</td>
          </tr>
        </tbody>
      </table>

      {/* Linkler */}
      <div className="flex justify-between pt-4 border-t">
        <Link href="/admin/odemeler" className="text-sm text-gray-600 hover:underline">
          ← Ödemelere Dön
        </Link>

        <button
          onClick={() => alert("PDF sistemine hazır. PayTR ile birlikte aktif edilecek.")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          📄 PDF Fatura İndir
        </button>
      </div>
    </main>
  );
}
