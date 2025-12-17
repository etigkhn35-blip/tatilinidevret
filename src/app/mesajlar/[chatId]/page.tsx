"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";

type Message = {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
};

export default function ChatPage() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 🔹 Kullanıcı kimliği al
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) setUserId(user.uid);
    });
    return () => unsub();
  }, []);

  // 🔹 Gerçek zamanlı mesaj dinleme
  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, "messages", chatId as string, "messages"),
      orderBy("createdAt", "asc")
    );

    let initialLoad = true;
    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];

      // 🔔 Yeni mesaj sesi (ilk yüklemeden sonra)
      if (!initialLoad && msgs.length > messages.length) {
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg.senderId !== userId && audioRef.current) {
          audioRef.current.play().catch(() => {});
        }
      }

      setMessages(msgs);
      initialLoad = false;
    });

    return () => unsub();
  }, [chatId, userId, messages.length]);

  // 🔹 Mesaj gönder
  const handleSend = async () => {
    if (!newMessage.trim() || !userId) return;

    const msgRef = collection(db, "messages", chatId as string, "messages");
    await addDoc(msgRef, {
      senderId: userId,
      text: newMessage.trim(),
      createdAt: serverTimestamp(),
    });

    // 🔹 Ana chat dokümanını güncelle
    await updateDoc(doc(db, "messages", chatId as string), {
      lastMessage: newMessage.trim(),
      lastSenderId: userId,
      updatedAt: serverTimestamp(),
    });

    setNewMessage("");
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* 🔊 Ses dosyası (görünmez) */}
      <audio ref={audioRef} src="/sounds/new-message.mp3" preload="auto" />

      <div className="max-w-[800px] mx-auto w-full flex-1 flex flex-col border-x border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200 font-bold text-gray-800">
          Sohbet
        </div>

        {/* Mesaj listesi */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[70%] px-4 py-2 rounded-lg ${
                msg.senderId === userId
                  ? "bg-primary text-white ml-auto"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Mesaj yazma alanı */}
        <div className="border-t border-gray-200 p-3 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Mesaj yaz..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
          />
          <button
            onClick={handleSend}
            className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-accent transition"
          >
            Gönder
          </button>
        </div>
      </div>
    </main>
  );
}
