// src/lib/firebaseConfig.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

/* ---------------------------- Firebase Config ---------------------------- */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/* ------------------------------ Initialize ------------------------------- */
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/* ---------------------- LOCALHOST EMULATOR CHECK ------------------------ */
const LOCAL_HOSTNAMES = ["localhost", "127.0.0.1", "::1"];

if (
  typeof window !== "undefined" &&
  LOCAL_HOSTNAMES.includes(window.location.hostname)
) {
  console.log("🔌 LOCALHOST tespit edildi → Firebase Emulator aktif.");

  connectAuthEmulator(auth, "http://127.0.0.1:9100", {
    disableWarnings: true,
  });
  connectFirestoreEmulator(db, "127.0.0.1", 8081);
  connectStorageEmulator(storage, "127.0.0.1", 9199);

} else {
  console.log("🌍 Production ortamı → Firebase gerçek sunucular aktif.");
}

export { app };
