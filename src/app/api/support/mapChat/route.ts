import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseConfig";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { notifId, userUid, destekId, message } = await req.json();

    if (!notifId || !userUid || !destekId) {
      return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
    }

    let chatId = null;

    // 1) Kullanıcı ile admin arasında mevcut chat var mı kontrol et
    const chatsQ = query(
      collection(db, "messages"),
      where("participants", "array-contains", userUid)
    );

    const chatsSnap = await getDocs(chatsQ);

    if (!chatsSnap.empty) {
      chatId = chatsSnap.docs[0].id;
    } else {
      // 2) Yeni chat oluştur
      const newChat = await addDoc(collection(db, "messages"), {
        participants: ["admin", userUid],
        ilanBaslik: "Destek Talebi",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: message || "Yanıtlandı",
        lastSenderId: "admin",
        destekRef: destekId,
      });

      chatId = newChat.id;
    }

    // 3) Bildirimi güncelle
    await updateDoc(doc(db, "notifications", notifId), {
      path: `/mesajlar?chat=${chatId}`,
      chatId,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ ok: true, chatId });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
