"use client";

import { auth } from "@/lib/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function TestFirebasePage() {
  const testRegister = async () => {
    try {
      const user = await createUserWithEmailAndPassword(
        auth,
        "test@test.com",
        "123456"
      );
      console.log("Kayıt başarılı:", user);
      alert("Firebase bağlantısı OK!");
    } catch (err) {
      console.error("Kayıt hatası:", err);
      alert("Firebase hata - konsolu kontrol et!");
    }
  };

  return (
    <div style={{ padding: 50 }}>
      <h1>Firebase Test Sayfası</h1>
      <button
        onClick={testRegister}
        style={{ padding: "12px 20px", fontSize: 18 }}
      >
        Test Kayıt
      </button>
    </div>
  );
}
