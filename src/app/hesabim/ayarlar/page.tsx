"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function AyarlarPage() {
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    darkMode: false,
    soundAlerts: true,
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔹 Kullanıcı kontrolü
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        await loadSettings(u.uid);
      } else setUser(null);
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Firestore'dan ayarları getir
  const loadSettings = async (uid: string) => {
    try {
      const ref = doc(db, "userSettings", uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setSettings(snap.data() as any);
      }
    } catch (err) {
      console.error("Ayarlar yüklenemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Ayarları kaydet
  const saveSettings = async () => {
    if (!user) return;
    try {
      setSaving(true);
      await setDoc(doc(db, "userSettings", user.uid), settings, { merge: true });
      alert("✅ Ayarlar başarıyla kaydedildi.");
    } catch (err) {
      console.error("Ayarlar kaydedilemedi:", err);
      alert("❌ Ayarlar kaydedilirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Giriş yapmanız gerekiyor.
      </div>
    );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Yükleniyor...
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-[700px] mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">⚙️ Ayarlar</h1>

        <div className="bg-white border rounded-xl shadow-sm p-6 space-y-5">
          {/* Bildirim Ayarları */}
          <section>
            <h2 className="font-semibold text-gray-800 mb-3">🔔 Bildirimler</h2>

            <label className="flex items-center justify-between border-b py-2">
              <span className="text-gray-700">E-posta Bildirimleri</span>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    emailNotifications: e.target.checked,
                  }))
                }
              />
            </label>

            <label className="flex items-center justify-between border-b py-2">
              <span className="text-gray-700">Site İçi Bildirimler</span>
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    pushNotifications: e.target.checked,
                  }))
                }
              />
            </label>

            <label className="flex items-center justify-between py-2">
              <span className="text-gray-700">Sesli Uyarılar</span>
              <input
                type="checkbox"
                checked={settings.soundAlerts}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    soundAlerts: e.target.checked,
                  }))
                }
              />
            </label>
          </section>

          {/* Tema */}
          <section>
            <h2 className="font-semibold text-gray-800 mb-3">🎨 Tema</h2>

            <label className="flex items-center justify-between py-2">
              <span className="text-gray-700">Koyu Mod</span>
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    darkMode: e.target.checked,
                  }))
                }
              />
            </label>
          </section>

          {/* Kaydet Butonu */}
          <div className="pt-4 flex justify-end">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="bg-primary text-white px-5 py-2 rounded-lg font-semibold hover:bg-accent transition disabled:opacity-60"
            >
              {saving ? "Kaydediliyor..." : "Ayarları Kaydet"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
