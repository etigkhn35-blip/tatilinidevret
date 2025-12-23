"use client";

import { useEffect, useState } from "react";
import { auth, db, storage } from "@/lib/firebaseConfig";
import {
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Link from "next/link";
import { HeartOff, Camera } from "lucide-react";

export default function HesabimPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"favoriler" | "profil">("favoriler");
  const [favoriler, setFavoriler] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Profil alanları
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  // 🔹 Yeni eklenen: Bildirim durumları
  const [hasNewOffer, setHasNewOffer] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setDisplayName(currentUser.displayName || "");
        setEmail(currentUser.email || "");
        setPhoto(currentUser.photoURL || null);
        await fetchFavoriler(currentUser.uid);
        listenNotifications(currentUser.uid); // 🔸 Bildirim dinleme
      }
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Favorileri getir
  const fetchFavoriler = async (uid: string) => {
  try {
    // 🔸 Doğru referans: users/{uid}/favorites
    const favSnap = await getDocs(collection(db, "users", uid, "favorites"));

    const favs: any[] = [];
    for (const fav of favSnap.docs) {
      const data = fav.data();
      const ilanRef = doc(db, "ilanlar", data.ilanId);
      const ilanDoc = await getDoc(ilanRef);
      if (ilanDoc.exists()) {
        favs.push({
          favId: fav.id,
          ilanId: ilanDoc.id,
          ...ilanDoc.data(),
        });
      }
    }

    setFavoriler(favs);
  } catch (err) {
    console.error("Favoriler alınamadı:", err);
  } finally {
    setLoading(false);
  }
};

  // 🔹 Bildirimleri dinle (teklif ve mesajlar)
  const listenNotifications = (uid: string) => {
    const q = query(collection(db, "notifications"), where("toUserUid", "==", uid));
    return onSnapshot(q, (snap) => {
      let offer = false;
      let msg = false;
      snap.forEach((doc) => {
        const d = doc.data();
        if (!d.read) {
          if (d.type === "offer") offer = true;
          if (d.type === "message") msg = true;
        }


      });
      setHasNewOffer(offer);
      setHasNewMessage(msg);
    });
  };

  // 🔹 Favoriden kaldır
  const removeFavorite = async (favId: string) => {
  if (!confirm("Bu ilanı favorilerden kaldırmak istiyor musunuz?")) return;
  try {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "favorites", favId));
    setFavoriler((prev) => prev.filter((f) => f.favId !== favId));
  } catch (err) {
    console.error("Favori silme hatası:", err);
  }
};

  // 🔹 Profil fotoğrafı yükleme
  const handlePhotoChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const storageRef = ref(storage, `profile_photos/${user.uid}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    await updateProfile(user, { photoURL: url });
    setPhoto(url);
    alert("Profil fotoğrafı güncellendi!");
  };

  // 🔹 Bilgileri kaydet
  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      if (displayName !== user.displayName)
        await updateProfile(user, { displayName });
      if (email !== user.email) await updateEmail(user, email);
      alert("✅ Profil bilgileri güncellendi.");
    } catch (err: any) {
      console.error(err);
      alert("❌ Bilgiler güncellenemedi: " + err.message);
    }
  };

  // 🔹 Şifre sıfırla
  const handlePasswordReset = async () => {
    if (!user?.email) return alert("Geçerli e-posta adresi bulunamadı.");
    await sendPasswordResetEmail(auth, user.email);
    alert("📧 Şifre sıfırlama e-postası gönderildi!");
  };

  if (!user)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <p>Devam etmek için giriş yapmalısınız.</p>
        <Link href="/giris" className="mt-3 text-primary underline">
          Giriş Yap
        </Link>
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Hesabım</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sol Menü */}
          <aside className="bg-white border rounded-xl p-4 shadow-sm">
            <nav className="space-y-2">
              <h2 className="font-semibold text-gray-700 mb-2">İLAN YÖNETİMİ</h2>
              <Link href="/hesabim/yayinda" className="block text-sm text-gray-600 hover:text-primary">
                Yayında Olanlar
              </Link>
              <Link href="/hesabim/yayinda-olmayan" className="block text-sm text-gray-600 hover:text-primary">
                Yayında Olmayanlar
              </Link>
              <Link href="/hesabim/suresi-dolan"className="block text-sm text-gray-600 hover:text-primary">Süresi Dolan İlanlar</Link>

              <h2 className="font-semibold text-gray-700 mt-4 mb-2">
                MESAJLAR VE BİLDİRİMLER
              </h2>
              <Link href="/hesabim/mesajlar" className="relative block text-sm text-gray-600 hover:text-primary">
                Mesajlar
                {hasNewMessage && (
                  <span className="absolute -top-1 -right-3 h-2.5 w-2.5 bg-blue-500 rounded-full animate-pulse"></span>
                )}
              </Link>
              <Link href="/hesabim/bildirimler" className="block text-sm text-gray-600 hover:text-primary">
                Bildirimler
              </Link>
              

              <h2 className="font-semibold text-gray-700 mt-4 mb-2">HESABIM</h2>
              <Link href="/hesabim/profil" className="block text-sm text-gray-600 hover:text-primary">
                Hesap Bilgileri
              </Link>
              
              

              <h2 className="font-semibold text-gray-700 mt-4 mb-2">DİĞER</h2>
              <Link href="/hesabim/ayarlar" className="block text-sm text-gray-600 hover:text-primary">
                Ayarlar
              </Link>
              <Link href="/hesabim/yardim" className="block text-sm text-gray-600 hover:text-primary">
                Yardım ve İşlem Rehberi
              </Link>
              <Link href="/hesabim/geri-bildirim" className="block text-sm text-gray-600 hover:text-primary">
                Sorun / Öneri Bildirimi
              </Link>
              <Link href="/hesabim/hakkinda" className="block text-sm text-gray-600 hover:text-primary">
                Hakkında
              </Link>
              <Link href="/hesabim/kisisel-verilerin-korunmasi" className="block text-sm text-gray-600 hover:text-primary">
                Kişisel Verilerin Korunması
              </Link>
              <Link href="/hesabim/cerezler" className="block text-sm text-gray-600 hover:text-primary">
                Çerezler
              </Link>
            </nav>
          </aside>

          {/* Sağ İçerik */}
          <section className="md:col-span-3 bg-white border rounded-xl shadow-sm p-5">
  {activeTab === "favoriler" && (
    <>
      {/* 🔹 Başlıkta favori sayısı gösterimi */}
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        ❤️ Favorilerim{" "}
        <span className="text-sm text-gray-500">
          ({favoriler.length})
        </span>
      </h2>

      {loading ? (
        <p className="text-gray-500 animate-pulse">Yükleniyor...</p>
      ) : favoriler.length === 0 ? (
        <p className="text-gray-500 text-sm">
          Henüz favoriye eklediğiniz bir ilan yok.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriler.map((fav) => (
            <div
              key={fav.favId}
              className="border rounded-lg overflow-hidden bg-gray-50 shadow-sm hover:shadow-md transition"
            >
              <Link href={`/ilan/${fav.ilanId}`}>
                <img
                  src={fav.coverUrl || "/defaults/default.jpg"}
                  alt={fav.baslik}
                  className="w-full h-40 object-cover"
                />
              </Link>
              <div className="p-3">
                <h3 className="font-semibold text-gray-800 line-clamp-1">
                  {fav.baslik || "İlan başlığı yok"}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {fav.aciklama || "Açıklama bulunmuyor."}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-primary font-semibold text-sm">
                    {fav.ucret
                      ? `${fav.ucret.toLocaleString("tr-TR")} ₺`
                      : "Fiyat belirtilmedi"}
                  </span>
                  <button
                    onClick={() => removeFavorite(fav.favId)}
                    className="text-red-500 hover:text-red-700 transition"
                    title="Favoriden kaldır"
                  >
                    <HeartOff className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )}
</section>
        </div>
      </div>
    </main>
  );
}
