"use client";

import { auth, db, storage } from "@/lib/firebaseConfig";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

export default function TestFirebasePage() {
  const [status, setStatus] = useState("Kontrol ediliyor...");

  useEffect(() => {
    async function test() {
      try {
        // Firestore test
        const testRef = doc(db, "testCollection", "testDoc");
        const snap = await getDoc(testRef);

        setStatus("🔥 Firebase bağlantısı başarılı!");

      } catch (err) {
        console.error(err);
        setStatus("❌ Firebase bağlantısı başarısız: " + err);
      }
    }

    test();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Firebase Test Sayfası</h1>
      <p>{status}</p>
    </div>
  );
}
