"use client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = false;

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { auth, db } from "@/lib/firebaseConfig";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";

export default function MessagesClient() {
  const [meUid, setMeUid] = useState<string | null>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingAuth, setLoadingAuth] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [lastSeenUpdatedAt, setLastSeenUpdatedAt] = useState<number>(0);

  const search = useSearchParams();
  const chatFromUrl = search.get("chat");

  /* -------- Ses -------- */
  useEffect(() => {
    audioRef.current = new Audio("/sounds/notify.mp3");
  }, []);

  /* -------- Kullanıcı -------- */
  useEffect(() => {
    return auth.onAuthStateChanged((user) => {
      setMeUid(user ? user.uid : null);
      setLoadingAuth(false);
    });
  }, []);

  /* -------- Sohbet Listesi -------- */
  useEffect(() => {
    if (!meUid) return;

    const q = query(collection(db, "messages"), where("participants", "array-contains", meUid));

    const unsub = onSnapshot(q, async (snap) => {
      const list: any[] = [];

      for (const d of snap.docs) {
        const data = d.data();
        const otherUser = (data.participants || []).find((p: string) => p !== meUid);

        let email = "Bilinmeyen Kullanıcı";
        if (otherUser) {
          const userDoc = await getDoc(doc(db, "users", otherUser));
          if (userDoc.exists()) {
            email = userDoc.data()?.email || email;
          }
        }

        list.push({
          id: d.id,
          email,
          ...data,
          updatedAt: data.updatedAt || data.createdAt,
        });
      }

      list.sort((a, b) => {
        const at = a.updatedAt?.toMillis?.() || 0;
        const bt = b.updatedAt?.toMillis?.() || 0;
        return bt - at;
      });

      setChats(list);

      const newest = list[0]?.updatedAt?.toMillis?.() || 0;
      const lastSender = list[0]?.lastSenderId;
      if (
        newest > lastSeenUpdatedAt &&
        lastSeenUpdatedAt !== 0 &&
        lastSender !== meUid &&
        audioRef.current
      ) {
        try {
          audioRef.current.currentTime = 0;
          await audioRef.current.play();
        } catch {}
      }
      setLastSeenUpdatedAt(newest);
    });

    return () => unsub();
  }, [meUid, lastSeenUpdatedAt]);

  /* -------- Chat aç -------- */
  const openChat = (chat: any) => {
    setSelectedChat(chat);

    const q = query(
      collection(db, "messages", chat.id, "messages"),
      orderBy("createdAt", "asc")
    );

    return onSnapshot(q, (snap) => {
      const list: any[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      setMessages(list);
    });
  };

  /* -------- Mesaj gönder -------- */
  const sendMessage = async () => {
    if (!selectedChat || !newMessage.trim() || !meUid) return;

    await addDoc(collection(db, "messages", selectedChat.id, "messages"), {
      senderId: meUid,
      text: newMessage.trim(),
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, "messages", selectedChat.id), {
      lastMessage: newMessage.trim(),
      lastSenderId: meUid,
      updatedAt: serverTimestamp(),
    });

    const other = selectedChat.participants.find((p: string) => p !== meUid);

    if (other) {
      await addDoc(collection(db, "notifications"), {
        toUserUid: other,
        title: "Yeni mesaj 💬",
        message: newMessage.slice(0, 80),
        type: "message",
        read: false,
        createdAt: serverTimestamp(),
        chatId: selectedChat.id,
      });
    }

    setNewMessage("");
  };

  if (loadingAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Yükleniyor...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-[320px,1fr] gap-6">
        {/* Sol liste */}
        <div className="bg-white rounded-2xl shadow p-4 overflow-y-auto max-h-[80vh]">
          <h2 className="text-lg font-semibold mb-3">Mesajlarım</h2>

          {chats.length === 0 ? (
            <p className="text-gray-500 text-sm">Henüz sohbet yok.</p>
          ) : (
            <ul className="space-y-2">
              {chats.map((c) => (
                <li
                  key={c.id}
                  className={`p-3 rounded-xl border hover:bg-gray-50 transition ${
                    selectedChat?.id === c.id ? "bg-blue-50 border-blue-400" : ""
                  }`}
                  onClick={() => openChat(c)}
                >
                  <p className="font-semibold">{c.ilanBaslik || "Sohbet"}</p>
                  <p className="text-sm text-gray-500">{c.email}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Sağ mesaj alanı */}
        <div className="bg-white rounded-2xl shadow flex flex-col h-[80vh]">
          {selectedChat ? (
            <>
              <div className="p-4 border-b">
                <h3 className="font-semibold">{selectedChat.ilanBaslik || "Sohabet"}</h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${
                      m.senderId === meUid ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 rounded-2xl text-sm ${
                        m.senderId === meUid
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t flex gap-3">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Mesaj..."
                  className="flex-1 border rounded-full px-4 py-2"
                />
                <button
                  onClick={sendMessage}
                  className="px-5 py-2 bg-blue-600 text-white rounded-full"
                >
                  Gönder
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Sohbet seçin
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
