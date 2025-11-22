"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseConfig";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Button } from "@/components/ui/button";

export default function TeklifVerPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [ilan, setIlan] = useState<any>(null);
  const [teklif, setTeklif] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Kullanıcıyı dinle
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  // İlan bilgilerini getir
  useEffect(() => {
    const fetchIlan = async () => {
      if (!id) return;
      const ilanRef = doc(db, "ilanlar", id as string);
      const ilanSnap = await getDoc(ilanRef);
      if (ilanSnap.exists()) {
        setIlan({ id: ilanSnap.id, ...ilanSnap.data() });
      }
    };
    fetchIlan();
  }, [id]);

  // Teklif gönder
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Teklif vermek için giriş yapmalısınız.");
      return;
    }
    if (!teklif) {
      alert("Lütfen teklif tutarını girin.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "offers"), {
        ilanId: id,
        ilanBaslik: ilan?.baslik || "",
        fromUserUid: user.uid, // Teklifi gönderen
        toUserUid: ilan?.kullaniciId || "", // İlan sahibi
        amount: Number(teklif),
        message: mesaj || "",
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setTeklif("");
      setMesaj("");
      setTimeout(() => router.push("/hesabim"), 2000); // 2 saniye sonra yönlendirme
    } catch (error) {
      console.error("Teklif gönderilemedi:", error);
      alert("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  if (!ilan) return <div className="p-10 text-center">İlan yükleniyor...</div>;

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Teklif Ver</h1>
      <p className="text-gray-500 mb-6">
        İlan: <span className="font-semibold">{ilan.baslik}</span>
      </p>

      {success && (
        <div className="bg-green-100 border border-green-300 text-green-700 p-3 rounded-lg mb-4 text-center">
          Teklifiniz başarıyla gönderildi 🎉
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="number"
          placeholder="Teklif Tutarı (TL)"
          className="border rounded-lg p-2 w-full"
          value={teklif}
          onChange={(e) => setTeklif(e.target.value)}
        />
        <textarea
          placeholder="Mesajınız (isteğe bağlı)"
          className="border rounded-lg p-2 w-full min-h-[100px]"
          value={mesaj}
          onChange={(e) => setMesaj(e.target.value)}
        />

        <Button
          type="submit"
          disabled={loading}
          variant="default"
          className="w-full"
        >
          {loading ? "Gönderiliyor..." : "Teklif Gönder"}
        </Button>
      </form>
    </div>
  );
}
