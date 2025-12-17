import { db } from "@/lib/firebaseConfig";
import { collection, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";

export async function isFavorited(uid: string, ilanId: string) {
  try {
    const ref = doc(db, "favoriler", uid, "items", ilanId);
    const snap = await getDoc(ref);
    return snap.exists();
  } catch (error) {
    console.error("Favori durumu okunamadı:", error);
    return false;
  }
}

export async function addFavorite(uid: string, ilanId: string) {
  try {
    const ref = doc(db, "favoriler", uid, "items", ilanId);
    await setDoc(ref, { createdAt: new Date() });
    return true;
  } catch (error) {
    console.error("Favori ekleme hatası:", error);
    return false;
  }
}

export async function removeFavorite(uid: string, ilanId: string) {
  try {
    const ref = doc(db, "favoriler", uid, "items", ilanId);
    await deleteDoc(ref);
    return true;
  } catch (error) {
    console.error("Favori silme hatası:", error);
    return false;
  }
}
