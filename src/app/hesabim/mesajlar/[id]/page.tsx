"use client";

import { useEffect, useRef, useState } from "react";
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
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

type Chat = {
  id: string;
  ilanBaslik?: string;
  participants?: string[];        
  participantEmails?: string[];   
  updatedAt?: any;
  lastMessage?: string;
};

type Msg = {
  id: string;
  senderId: string;
  receiverId?: string;
  text: string;
  createdAt?: any;
  read?: boolean;
};

export default function MesajlarPage() {
  const [user, setUser] = useState<any>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const selectedChatUnsubRef = useRef<null | (() => void)>(null);

  // aktif kullanıcı
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
    });
    return () => unsub();
  }, []);

  // sohbet listesini dinle
  useEffect(() => {
    if (!user) return;

    const qChats = query(
      collection(db, "messages"),
      where("participants", "array-contains", user.uid),
      orderBy("updatedAt", "desc")
    );

    const unsub = onSnapshot(qChats, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Chat[];
      setChats(list);
    });

    return () => unsub();
  }, [user]);

  // sohbeti aç
  const openChat = (chat: Chat) => {
    setSelectedChat(chat);

    const qMsgs = query(
      collection(db, "messages", chat.id, "messages"),
      orderBy("createdAt", "asc")
    );

    return onSnapshot(qMsgs, async (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Msg[];

      // yeni gelen mesaj sesi
      if (messages.length && list.length > messages.length) {
        const last = list[list.length - 1];
        if (last.receiverId === user?.uid && audioRef.current) {
          try {
            audioRef.current.currentTime = 0;
            await audioRef.current.play();
          } catch {}
        }
      }

      setMessages(list);

      // kullanıcıya gelen okunmamışları okundu işaretle
      const toMark = list.filter((m) => m.receiverId === user?.uid && !m.read);
      if (toMark.length) {
        await Promise.all(
          toMark.map((m) =>
            updateDoc(doc(db, "messages", chat.id, "messages", m.id), { read: true })
          )
        );
      }
    });
  };

  // seçilen sohbet değiştiğinde eski dinleyiciyi kapat
  useEffect(() => {
    if (!selectedChat) return;
    if (selectedChatUnsubRef.current) {
      selectedChatUnsubRef.current();
    }
    selectedChatUnsubRef.current = openChat(selectedChat);
    return () => {
      if (selectedChatUnsubRef.current) {
        selectedChatUnsubRef.current();
        selectedChatUnsubRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat?.id]);

  // mesaj gönder
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user) return;

    const receiverId =
      selectedChat.participants?.find((p) => p !== user.uid) || "admin";

    await addDoc(collection(db, "messages", selectedChat.id, "messages"), {
      senderId: user.uid,
      receiverId,
      text: newMessage.trim(),
      createdAt: serverTimestamp(),
      read: false,
    });

    await updateDoc(doc(db, "messages", selectedChat.id), {
      lastMessage: newMessage.trim(),
      lastSenderId: user.uid,
      updatedAt: serverTimestamp(),
    });

    await addDoc(collection(db, "notifications"), {
      toUserUid: receiverId,
      title: "Yeni mesaj",
      message: newMessage.trim().slice(0, 80),
      type: "message",
      read: false,
      createdAt: serverTimestamp(),
      chatId: selectedChat.id,
    });

    

    setNewMessage("");
  };

  const labelForChat = (c: Chat) => {
    const adminMail =
      c.participantEmails?.find((e) => e === "info@tatilinidevret.com") ||
      c.participantEmails?.[0];
    return adminMail || "Yönetici";
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <audio ref={audioRef} src="/sounds/new-message.mp3" preload="auto" />
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-[350px,1fr] gap-6">
        {/* SOL: Sohbet listesi */}
        <div className="bg-white rounded-2xl shadow p-4 overflow-y-auto max-h-[80vh]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">💬 Mesajlarım</h2>
            {!!unreadCount && (
              <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 text-[11px] px-1.5 rounded-full bg-amber-500 text-white">
                {unreadCount}
              </span>
            )}
          </div>

          {!user || chats.length === 0 ? (
            <p className="text-gray-500 text-sm">Henüz sohbetiniz yok.</p>
          ) : (
            <ul className="space-y-2">
              {chats.map((c) => (
                <li
                  key={c.id}
                  onClick={() => setSelectedChat(c)}
                  className={`p-3 rounded-xl border cursor-pointer hover:bg-gray-50 transition ${
                    selectedChat?.id === c.id ? "bg-blue-50 border-blue-400" : ""
                  }`}
                >
                  <p className="font-semibold text-gray-800 line-clamp-1">
                    {c.ilanBaslik || "Sohbet"}
                  </p>
                  <p className="text-xs text-gray-500">{labelForChat(c)}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {c.updatedAt?.toDate
                      ? new Date(c.updatedAt.toDate()).toLocaleString("tr-TR")
                      : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* SAĞ: Mesaj kutusu */}
        <div className="bg-white rounded-2xl shadow flex flex-col h-[80vh]">
          {!selectedChat ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Sohbet seçiniz.
            </div>
          ) : (
            <>
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-800">
                  {selectedChat.ilanBaslik || "Sohbet"}
                </h3>
                <p className="text-xs text-gray-500">{labelForChat(selectedChat)}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center mt-10">
                    Henüz mesaj yok.
                  </p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${
                        m.senderId === user?.uid ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm text-sm ${
                          m.senderId === user?.uid
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-gray-100 text-gray-800 rounded-bl-none"
                        }`}
                      >
                        <p>{m.text}</p>
                        <div className="flex items-center gap-2 justify-end">
                          <span className="block text-[10px] opacity-70">
                            {m.createdAt?.toDate
                              ? new Date(m.createdAt.toDate()).toLocaleTimeString("tr-TR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </span>
                          {m.senderId === user?.uid && (
                            <span className={`text-[10px] ${m.read ? "opacity-90" : "opacity-40"}`}>
                              {m.read ? "✓✓" : "✓"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 border-t flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Mesajınızı yazın..."
                  className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  className="px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                >
                  Gönder
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
