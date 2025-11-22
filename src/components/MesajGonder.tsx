"use client";

import { useState } from "react";
import { db, auth } from "../lib/firebaseConfig";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function MesajGonder({ receiverId }: { receiverId: string }) {
  const [text, setText] = useState("");
  const router = useRouter();

  const handleSend = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Mesaj göndermek için giriş yapmalısınız.");
      router.push("/giris");
      return;
    }

    if (text.trim() === "") return;

    try {
      await addDoc(collection(db, "messages"), {
        senderId: user.uid,
        receiverId,
        text,
        createdAt: serverTimestamp(),
        read: false,
      });
      setText("");
      alert("Mesaj gönderildi!");
    } catch (err) {
      console.error(err);
      alert("Mesaj gönderilirken hata oluştu!");
    }
  };

  return (
    <div className="flex items-center gap-2 mt-4">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Mesajınızı yazın..."
        className="flex-1 border border-gray-300 rounded-lg p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleSend}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Gönder
      </button>
    </div>
  );
}
