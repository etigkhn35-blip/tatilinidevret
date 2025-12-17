"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

export default function AdminMessageDetail() {
  const { id } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [userEmail, setUserEmail] = useState<string>("");
  const [ilanBaslik, setIlanBaslik] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);

  /* 🎯 1) Ana sohbet dokümanını getir */
  useEffect(() => {
    if (!id) return;

    const chatRef = doc(db, "messages", String(id));

    getDoc(chatRef).then(async (snap) => {
      if (!snap.exists()) return;

      const data = snap.data();

      setParticipants(data.participants || []);
      setIlanBaslik(data.ilanBaslik || "Kullanıcı Mesajı");

      const userId = data.participants?.find((p: string) => p !== "admin");

      if (userId) {
        const u = await getDoc(doc(db, "users", userId));
        if (u.exists()) setUserEmail(u.data().email || "");
      }
    });
  }, [id]);

  /* 🎯 2) Mesajları dinle */
  useEffect(() => {
    if (!id) return;

    const q = query(
      collection(db, "messages", String(id), "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(msgs);

      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    });

    return () => unsub();
  }, [id]);

  /* 🎯 3) Mesaj Gönder — Çift bildirimi bitiren doğru versiyon */
  const sendMessage = async () => {
    if (!newMsg.trim()) return;

    setLoading(true);

    const chatRef = doc(db, "messages", String(id));

    // admin dışındaki kullanıcı id'si
    const toUserUid = participants.find((p) => p !== "admin") || null;

    // Mesajı kaydet
    await addDoc(collection(db, "messages", String(id), "messages"), {
      senderId: "admin",
      text: newMsg.trim(),
      createdAt: serverTimestamp(),
      read: false,
    });

    // Ana sohbet dökümanını güncelle
    await updateDoc(chatRef, {
      lastMessage: newMsg.trim(),
      updatedAt: serverTimestamp(),
      lastSenderId: "admin",
    });

    // ✔ Kullanıcıya sadece TEK bildirim gönder
    if (toUserUid) {
      await addDoc(collection(db, "notifications"), {
        toUserUid,
        title: "Yeni mesajınız var 💬",
        message: newMsg.slice(0, 120),
        type: "message",
        read: false,
        createdAt: serverTimestamp(),
        chatId: id,
      });
    }

    setNewMsg("");
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      {/* ÜST BAR */}
      <div className="bg-white p-4 rounded-xl shadow mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">{ilanBaslik}</h1>
          <p className="text-sm text-gray-500">{userEmail}</p>
        </div>
      </div>

      {/* MESAJLAR */}
      <div className="bg-white p-4 rounded-xl shadow flex flex-col h-[70vh]">
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[65%] p-3 rounded-xl text-sm shadow-sm ${
                m.senderId === "admin"
                  ? "ml-auto bg-blue-600 text-white rounded-br-none"
                  : "mr-auto bg-gray-200 text-gray-800 rounded-bl-none"
              }`}
            >
              {m.text}
              <div className="text-[10px] opacity-60 text-right mt-1">
                {m.createdAt?.toDate
                  ? new Date(m.createdAt.toDate()).toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </div>
            </div>
          ))}

          <div ref={bottomRef}></div>
        </div>

        {/* MESAJ YAZMA ALANI */}
        <div className="mt-3 flex gap-2">
          <input
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 border px-4 py-3 rounded-lg outline-none"
            placeholder="Mesaj yazın..."
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-blue-600 text-white px-6 rounded-lg hover:bg-blue-700"
          >
            {loading ? "..." : "Gönder"}
          </button>
        </div>
      </div>
    </main>
  );
}
