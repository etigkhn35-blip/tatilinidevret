"use client";

import { useEffect, useState } from "react";
import { auth, db, storage } from "@/lib/firebaseConfig";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Camera } from "lucide-react";

export default function HesapBilgileriPage() {
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        setDisplayName(u.displayName || "");
        setEmail(u.email || "");
        const docRef = doc(db, "users", u.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setPhone(data.phone || "");
          setPhoto(data.photoURL || u.photoURL || null);
        }
      }
    });
    return () => unsub();
  }, []);

  const handlePhotoUpload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `profilePhotos/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setPhoto(url);
      await updateProfile(user, { photoURL: url });
      await updateDoc(doc(db, "users", user.uid), { photoURL: url });
    } catch (err) {
      console.error("Fotoğraf yüklenemedi:", err);
      alert("Fotoğraf yüklenemedi.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(
        docRef,
        {
          displayName,
          phone,
          photoURL: photo,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      await updateProfile(user, { displayName });
      alert("✅ Bilgileriniz güncellendi.");
    } catch (err) {
      console.error(err);
      alert("❌ Güncelleme sırasında hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  if (!user)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <p>Devam etmek için giriş yapmalısınız.</p>
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-[800px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          👤 Hesap Bilgilerim
        </h1>

        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
          {/* Profil Fotoğrafı */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={photo || "/defaults/avatar.png"}
                alt="Profil Fotoğrafı"
                className="w-24 h-24 rounded-full border object-cover"
              />
              <label
                htmlFor="fileUpload"
                className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full cursor-pointer shadow hover:bg-accent transition"
              >
                <Camera className="w-4 h-4" />
              </label>
              <input
                type="file"
                id="fileUpload"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  e.target.files?.[0] && handlePhotoUpload(e.target.files[0])
                }
              />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">{displayName}</h2>
              <p className="text-sm text-gray-500">{email}</p>
            </div>
          </div>

          {/* Ad Soyad */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Ad Soyad
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          {/* Telefon */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Cep Telefonu
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+90 5XX XXX XX XX"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          {/* E-posta (readonly) */}
          <div>
            <label className="block text-sm font-medium mb-1">
              E-posta Adresi
            </label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-white px-5 py-2 rounded-lg font-semibold hover:bg-accent transition disabled:opacity-60"
            >
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
