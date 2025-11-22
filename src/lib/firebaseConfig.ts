// src/lib/firebaseConfig.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  connectAuthEmulator 
} from "firebase/auth";
import { 
  getFirestore, 
  connectFirestoreEmulator 
} from "firebase/firestore";
import { 
  getStorage, 
  connectStorageEmulator 
} from "firebase/storage";

/* ---------------------------- Firebase Config ---------------------------- */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "localhost",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "tatilinidevret",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "tatilinidevret.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1234567890:web:demo123",
};

/* ------------------------------ Initialize ------------------------------- */
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/* ---------------------------- Emulator Binding --------------------------- */
// 🚀 Emülatör bağlantısı: sadece development ortamında
if (typeof window !== "undefined") {
  console.log("🔌 Bağlantı: Firebase emülatörleri devreye alınıyor...");
  try {
    connectAuthEmulator(auth, "http://127.0.0.1:9100", { disableWarnings: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8081);
    connectStorageEmulator(storage, "127.0.0.1", 9199);
    console.log("✅ Firebase Emulators Connected: Auth(9100), Firestore(8081), Storage(9199)");
  } catch (err) {
    console.error("⚠️ Emulator bağlantı hatası:", err);
  }
}

export { app };
