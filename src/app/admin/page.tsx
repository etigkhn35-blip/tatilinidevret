"use client";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore"; 
import Link from "next/link";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import {
  Users,
  FileText,
  CheckCircle2,
  Clock,
  MessageSquareText,
  LifeBuoy,
  ChevronRight,
} from "lucide-react";

/* ----------------------- Tipler ----------------------- */
type Ilan = {
  id: string;
  baslik?: string;
  kategori?: string;
  il?: string;
  ilce?: string;
  ucret?: number;
  status?: "pending" | "approved" | "rejected" | string;
  ownerUid?: string;
  olusturmaTarihi?: any;
};

type Chat = {
  id: string;
  participants?: string[];
  lastMessage?: string;
  updatedAt?: any;
};

type Destek = {
  id: string;
  baslik?: string;
  email?: string;
  durum?: "beklemede" | "yanıtlandı" | string;
  olusturmaTarihi?: any;
};

type Rapor = {
  id: string;
  ilanId?: string;
  ilanBaslik?: string;
  userUid?: string;
  userName?: string;
  reason?: string;
  createdAt?: any;
  reviewed?: boolean;
};

type Kullanici = {
  id: string;
  email?: string;
  displayName?: string;
  adSoyad?: string;
  createdAt?: any;
};

/* --------------------- Yardımcılar --------------------- */
const tsToDate = (t: any): Date | null => {
  if (!t) return null;
  if (t instanceof Timestamp || (typeof t === "object" && t.toDate)) {
    try {
      return t.toDate();
    } catch {
      return null;
    }
  }
  if (typeof t === "number") return new Date(t);
  if (typeof t === "string") {
    const d = new Date(t);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
};

const fmtDateTime = (t: any) => {
  const d = tsToDate(t);
  return d ? d.toLocaleString("tr-TR") : "";
};

/* ---------------------- Bileşen ------------------------ */
export default function AdminDashboardPage() {
  const router = useRouter();
const [authChecked, setAuthChecked] = useState(false);


  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [sonSohbetler, setSonSohbetler] = useState<Chat[]>([]);
  const [destekler, setDestekler] = useState<Destek[]>([]);
  const [kullanicilar, setKullanicilar] = useState<Kullanici[]>([]);
  const [raporlar, setRaporlar] = useState<Rapor[]>([]);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(0);
  const [odemeler, setOdemeler] = useState<any[]>([]);

 

useEffect(() => {
  const unsubAuth = onAuthStateChanged(auth, (user) => {
    if (!user) {
  router.replace("/admin/admin-login");
  return;
}
    setAuthChecked(true);
  });

  const qIlan = query(collection(db, "ilanlar"), orderBy("olusturmaTarihi", "desc"), limit(5));
  const unsubIlan = onSnapshot(qIlan, (snap) => {
    setIlanlar(snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) })));
  });

  const qChat = query(collection(db, "messages"), orderBy("updatedAt", "desc"), limit(5));
  const unsubChat = onSnapshot(qChat, (snap) => {
    setSonSohbetler(snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) })));
  });

  const qDestek = query(collection(db, "destek_talepleri"), orderBy("olusturmaTarihi", "desc"), limit(5));
  const unsubDestek = onSnapshot(qDestek, (snap) => {
    setDestekler(snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) })));
  });

  const qUsers = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(5));
  const unsubUsers = onSnapshot(qUsers, (snap) => {
    setKullanicilar(snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) })));
  });

  const qOrders = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(5));
  const unsubOrders = onSnapshot(qOrders, (snap) => {
    setOdemeler(snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) })));
  });

  const unsubRaporlar = onSnapshot(
    query(collection(db, "reports"), orderBy("createdAt", "desc"), limit(10)),
    async (snap) => {
      const list: Rapor[] = [];
      for (const docSnap of snap.docs) {
        const rapor = docSnap.data() as any;
        let userName = "—";
        if (rapor.userUid) {
          const userSnap = await getDoc(doc(db, "users", rapor.userUid));
          if (userSnap.exists()) {
            const u = userSnap.data();
            userName = u.adSoyad || u.displayName || "—";
          }
        }
        list.push({ id: docSnap.id, ...rapor, userName });
      }
      setRaporlar(list);
    }
  );

  setLoading(false);

  return () => {
    unsubAuth();
    unsubIlan();
    unsubChat();
    unsubDestek();
    unsubUsers();
    unsubOrders();
    unsubRaporlar();
  };
}, [router]);
    if (!authChecked) {
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      Yetkilendirme kontrol ediliyor...
    </div>
  );
}
  

  /* ---------------- Özetler ---------------- */
  const toplamIlan = ilanlar.length;
  const onayliIlan = ilanlar.filter((i) => i.status === "approved").length;
  const bekleyenIlan = ilanlar.filter((i) => (i.status || "pending") === "pending").length;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">📊 Admin Dashboard</h1>
        <p className="text-gray-500 text-sm">Sistem özeti, son aktiviteler ve hızlı erişimler.</p>
      </div>

      {/* --- Özet Kartlar --- */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-xl shadow p-4 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600" />
          <div className="flex-1">
            <div className="text-sm text-gray-500">Toplam (son 5 listede)</div>
            <div className="text-xl font-semibold">{toplamIlan}</div>
          </div>
          <Link href="/admin/ilanlar" className="text-blue-600 text-sm hover:underline flex items-center gap-1">
            İlanlar <ChevronRight size={14} />
          </Link>
        </div>

        <div className="bg-white border rounded-xl shadow p-4 flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
          <div className="flex-1">
            <div className="text-sm text-gray-500">Onaylı (liste içi)</div>
            <div className="text-xl font-semibold">{onayliIlan}</div>
          </div>
          <Link href="/admin/ilanlar" className="text-green-700 text-sm hover:underline flex items-center gap-1">
            Yönet <ChevronRight size={14} />
          </Link>
        </div>

        <div className="bg-white border rounded-xl shadow p-4 flex items-center gap-3">
          <Clock className="w-8 h-8 text-amber-600" />
          <div className="flex-1">
            <div className="text-sm text-gray-500">Bekleyen (liste içi)</div>
            <div className="text-xl font-semibold">{bekleyenIlan}</div>
          </div>
          <Link href="/admin/ilanlar" className="text-amber-700 text-sm hover:underline flex items-center gap-1">
            İncele <ChevronRight size={14} />
          </Link>
        </div>
        <div className="bg-white border rounded-xl shadow p-4 flex items-center gap-3">
  <FileText className="w-8 h-8 text-pink-600" />
  <div className="flex-1">
    <div className="text-sm text-gray-500">Ödemeler (son 5)</div>
    <div className="text-xl font-semibold">{odemeler.length}</div>
  </div>
  <Link href="/admin/odemeler" className="text-pink-700 text-sm hover:underline flex items-center gap-1">
    İncele <ChevronRight size={14} />
  </Link>
</div>
{/* GELİR ANALİZİ */}
<div className="bg-white border rounded-xl shadow p-4 flex items-center gap-3">
  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2"
    viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3 3v18h18M7 16l4-4 4 4 5-10" />
  </svg>

  <div className="flex-1">
    <div className="text-sm text-gray-500">Gelir Raporu</div>
    <div className="text-xl font-semibold">Analiz</div>
  </div>

  <Link href="/admin/rapor/gelir"
    className="text-emerald-700 text-sm hover:underline flex items-center gap-1">
    Görüntüle →
  </Link>
</div>


        
      <div className="bg-white border rounded-xl shadow p-4 flex items-center gap-3">
  <Clock className="w-8 h-8 text-red-600" />

  <div className="flex-1">
    <div className="text-sm text-gray-500">Süresi Dolan</div>
    <div className="text-xl font-semibold text-red-600">{expired}</div>
  </div>

  <Link
    href="/admin/suresi-dolan"
    className="text-red-700 text-sm hover:underline flex items-center gap-1"
  >
    İncele <ChevronRight size={14} />
  </Link>
</div>




        <div className="bg-white border rounded-xl shadow p-4 flex items-center gap-3">
          <Users className="w-8 h-8 text-purple-600" />
          <div className="flex-1">
            <div className="text-sm text-gray-500">Yeni Kullanıcılar</div>
            <div className="text-xl font-semibold">{kullanicilar.length}</div>
          </div>
          <Link href="/admin/kullanicilar" className="text-purple-700 text-sm hover:underline flex items-center gap-1">
            Kullanıcılar <ChevronRight size={14} />
          </Link>
        </div>
      </section>
      {/* Son İlanlar */}
<section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 mt-6">
  <div className="bg-white border rounded-xl shadow">
    <div className="p-4 border-b flex items-center justify-between">
      <h2 className="text-lg font-semibold">🧾 Son İlanlar</h2>
      <Link href="/admin/ilanlar" className="text-blue-600 text-sm hover:underline flex items-center gap-1">
        Tümü <ChevronRight size={14} />
      </Link>
    </div>

    <div className="p-4 overflow-x-auto">
      {ilanlar.length === 0 ? (
        <p className="text-gray-500 text-sm">Henüz ilan bulunamadı.</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-3 py-2">Başlık</th>
              <th className="text-left px-3 py-2">Konum</th>
              <th className="text-left px-3 py-2">Durum</th>
              <th className="text-left px-3 py-2">Tarih</th>
              <th className="text-right px-3 py-2">Detay</th>
            </tr>
          </thead>
          <tbody>
            {ilanlar.map((i) => (
              <tr key={i.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2 font-medium">{i.baslik || "—"}</td>
                <td className="px-3 py-2">
                  {(i.il || "—") + (i.ilce ? ` / ${i.ilce}` : "")}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      i.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : i.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {i.status || "pending"}
                  </span>
                </td>
                <td className="px-3 py-2">{fmtDateTime(i.olusturmaTarihi)}</td>
                <td className="px-3 py-2 text-right">
                  <Link href={`/admin/ilanlar/${i.id}`} className="text-blue-600 hover:underline">
                    İncele
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
    <div className="bg-white border rounded-xl shadow">
    <div className="p-4 border-b flex items-center justify-between">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <MessageSquareText className="w-5 h-5 text-blue-600" />
        Son Mesajlar
      </h2>

      <Link href="/admin/mesajlar" className="text-blue-600 text-sm hover:underline flex items-center gap-1">
        Mesajlara Git <ChevronRight size={14} />
      </Link>
    </div>
    

    <div className="p-4">
      {sonSohbetler.length === 0 ? (
        <p className="text-gray-500 text-sm">Henüz mesaj yok.</p>
      ) : (
        <ul className="divide-y">
          {sonSohbetler.map((c) => (
            <li key={c.id} className="py-3 flex items-start justify-between">
              <div className="pr-3">
                <p className="font-medium text-gray-800 line-clamp-1">
                  {c.lastMessage || "—"}
                </p>
                <p className="text-xs text-gray-500">{fmtDateTime(c.updatedAt)}</p>
              </div>

              <Link href={`/admin/mesajlar`} className="text-blue-600 text-sm hover:underline">
                Aç
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
  <section className="bg-white border rounded-xl shadow mt-6">
  <div className="p-4 border-b flex items-center justify-between">
    <h2 className="text-lg font-semibold">💳 Son Ödemeler</h2>
    <Link href="/admin/odemeler" className="text-blue-600 text-sm hover:underline flex items-center gap-1">
      Tümü <ChevronRight size={14} />
    </Link>
  </div>

  <div className="p-4 overflow-x-auto">
    {odemeler.length === 0 ? (
      <p className="text-gray-500 text-sm">Henüz ödeme yok.</p>
    ) : (
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
          {odemeler.map((o) => (
            <tr key={o.id} className="border-b hover:bg-gray-50">
              <td className="px-3 py-2">
                <Link href={`/ilan/${o.ilanId}`} target="_blank" className="text-blue-600 underline">
                  {o.ilanBaslik}
                </Link>
              </td>
              <td className="px-3 py-2">{o.fiyat?.toLocaleString("tr-TR")} ₺</td>
              <td className="px-3 py-2">{o.durum || "—"}</td>
              <td className="px-3 py-2">
                {o.createdAt?.toDate?.().toLocaleString("tr-TR") || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
</section>

</section>


<div className="bg-white border rounded-xl shadow p-4 flex items-center gap-3">
  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2"
    viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3 3v18h18M7 16l4-4 4 4 5-10" />
  </svg>

  <div className="flex-1">
    <div className="text-sm text-gray-500">Gelir Raporu</div>
    <div className="text-xl font-semibold">Analiz</div>
  </div>

  <Link href="/admin/rapor/gelir"
    className="text-emerald-700 text-sm hover:underline flex items-center gap-1">
    Görüntüle →
  </Link>
</div>




      {/* ------------------ Raporlar ------------------ */}
      <section className="bg-white border rounded-xl shadow mt-6">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">🚩 İlan Bildirimleri (Raporlar)</h2>
          <span className="text-sm text-gray-500">Son {raporlar.length} rapor</span>
        </div>

        <div className="p-4 overflow-x-auto">
          {raporlar.length === 0 ? (
            <p className="text-gray-500 text-sm">Henüz rapor yok.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-3 py-2">İlan</th>
                  <th className="text-left px-3 py-2">Neden</th>
                  <th className="text-left px-3 py-2">Kullanıcı</th>
                  <th className="text-left px-3 py-2">Tarih</th>
                  <th className="text-right px-3 py-2">İşlem</th>
                </tr>
              </thead>

              <tbody>
                {raporlar.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <div className="font-medium">{r.ilanBaslik || "—"}</div>
                      <div className="text-xs text-gray-500">{r.ilanId}</div>
                    </td>

                    <td className="px-3 py-2">
                      {r.reason === "spam" && "Spam / Sahte ilan"}
                      {r.reason === "price" && "Fiyat yanlış"}
                      {r.reason === "misleading" && "Yanıltıcı bilgi"}
                      {r.reason === "other" && "Diğer"}
                      {!["spam", "price", "misleading", "other"].includes(String(r.reason)) &&
                        (r.reason || "—")}
                    </td>

                    <td className="px-3 py-2">{r.userName || "—"}</td>

                    <td className="px-3 py-2">
                      {(() => {
                        const v = r.createdAt;
                        const d =
                          v?.toDate ? v.toDate() :
                          typeof v === "number" ? new Date(v) :
                          typeof v === "string" ? new Date(v) :
                          null;
                        return d ? d.toLocaleString("tr-TR") : "";
                      })()}
                    </td>

                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {r.ilanId ? (
                          <Link href={`/admin/ilanlar/${r.ilanId}`} className="text-blue-600 hover:underline">
                            İncele
                          </Link>
                        ) : (
                          <span className="text-gray-400 text-xs">İlan ID yok</span>
                        )}

                        <button
                          onClick={async () => {
                            await updateDoc(doc(db, "reports", r.id), { reviewed: true });
                          }}
                          className={`px-2 py-1 rounded text-xs border ${
                            r.reviewed
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                          title="İncelendi olarak işaretle"
                        >
                          {r.reviewed ? "İncelendi" : "İşaretle"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* ------------------ Destek Talepleri ------------------ */}
      <section className="bg-white border rounded-xl shadow mt-6">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-sky-600" /> Son Destek Talepleri
          </h2>
          <Link href="/admin/destek-talepleri" className="text-blue-600 text-sm hover:underline flex items-center gap-1">
            Destek Merkezi <ChevronRight size={14} />
          </Link>
        </div>

        <div className="p-4 overflow-x-auto">
          {destekler.length === 0 ? (
            <p className="text-gray-500 text-sm">Henüz destek talebi yok.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-3 py-2">Başlık</th>
                  <th className="text-left px-3 py-2">E-posta</th>
                  <th className="text-left px-3 py-2">Durum</th>
                  <th className="text-left px-3 py-2">Tarih</th>
                </tr>
              </thead>

              <tbody>
                {destekler.map((d) => (
  <tr
    key={d.id}
    onClick={() => (window.location.href = `/admin/destek-talepleri`)}
    className="border-b hover:bg-gray-100 cursor-pointer transition"
  >
    <td className="px-3 py-2 font-medium">{d.baslik || "—"}</td>
    <td className="px-3 py-2">{d.email || "—"}</td>
    <td className="px-3 py-2">
      <span
        className={`px-2 py-1 rounded text-xs font-semibold ${
          d.durum === "yanıtlandı"
            ? "bg-green-100 text-green-700"
            : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {d.durum || "beklemede"}
      </span>
    </td>
    <td className="px-3 py-2">
      {d.olusturmaTarihi?.toDate?.().toLocaleString("tr-TR") || "—"}
    </td>
  </tr>
))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}
