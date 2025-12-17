"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { auth, db } from "@/lib/firebaseConfig";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Shield } from "lucide-react";

type Chat = {
  id: string;
  participants: string[];
  lastMessage?: string;
  updatedAt?: any;
  otherEmail?: string;
  ilanBaslik?: string;
};

type Msg = {
  id: string;
  senderId: string;
  text: string;
  createdAt?: any;
  read?: boolean;
};

export default function AdminMesajlarPage() {
  const [user, setUser] = useState<any>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const firstSnapSeenRef = useRef<Record<string, boolean>>({});
  const searchParams = useSearchParams();
  const chatFromUrl = searchParams.get("chat");

  // 🔹 Her sohbet için aktif messages listener'ını saklayalım
  const messagesUnsubRef = useRef<null | (() => void)>(null);

  /* -------------------- Ses -------------------- */
  useEffect(() => {
    audioRef.current = new Audio("/sounds/new-message.mp3");
  }, []);

  /* -------------------- Giriş kontrolü -------------------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) window.location.href = "/giris";
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  /* -------------------- Sohbetleri getir -------------------- */
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "messages"));

    const unsub = onSnapshot(q, async (snap) => {
      const list: Chat[] = [];

      for (const d of snap.docs) {
        const raw = d.data() as any;
        const chat: Chat = {
          id: d.id,
          participants: raw.participants || [],
          lastMessage: raw.lastMessage || "",
          updatedAt: raw.updatedAt,
          ilanBaslik: raw.ilanBaslik || "",
        };

        // sadece admin'in dahil olduğu sohbetler ilgilendiriyorsa burada filtreleyebilirsin:
        // if (!chat.participants.includes("admin")) continue;

        const otherId = chat.participants?.find((p) => p !== "admin");
        if (otherId) {
          const uDoc = await getDoc(doc(db, "users", otherId));
          if (uDoc.exists()) {
            const data = uDoc.data() as any;
            chat.otherEmail = data.email || data.adSoyad || "Kullanıcı";
          } else {
            chat.otherEmail = "Kullanıcı";
          }
        }
        list.push(chat);
      }

      list.sort((a, b) => {
        const at = a.updatedAt?.toMillis?.() || 0;
        const bt = b.updatedAt?.toMillis?.() || 0;
        return bt - at;
      });

      setChats(list);
    });

    return () => unsub();
  }, [user]);

  /* -------------------- URL'den direkt yükleme -------------------- */
  const loadChatDirect = async (chatId: string) => {
    try {
      const cDoc = await getDoc(doc(db, "messages", chatId));
      if (!cDoc.exists()) return;
      const raw = cDoc.data() as any;
      const chat: Chat = {
        id: cDoc.id,
        participants: raw.participants || [],
        lastMessage: raw.lastMessage || "",
        updatedAt: raw.updatedAt,
        ilanBaslik: raw.ilanBaslik || "",
      };
      const otherId = chat.participants?.find((p) => p !== "admin");
      if (otherId) {
        const uDoc = await getDoc(doc(db, "users", otherId));
        if (uDoc.exists()) {
          chat.otherEmail = (uDoc.data() as any).email || "Kullanıcı";
        }
      }
      openChat(chat);
    } catch (err) {
      console.error("Chat yüklenemedi:", err);
    }
  };

  /* -------------------- Sohbet aç -------------------- */
  const openChat = (chat: Chat) => {
    // Eski listener'ı kapat
    if (messagesUnsubRef.current) {
      messagesUnsubRef.current();
      messagesUnsubRef.current = null;
    }

    setSelectedChat(chat);

    const q = query(
      collection(db, "messages", chat.id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list: Msg[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setMessages(list);

      // 🔔 sadece kullanıcı mesaj attıysa çalsın
      if (firstSnapSeenRef.current[chat.id]) {
        const last = list[list.length - 1];
        if (last && last.senderId !== "admin" && audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }
      } else {
        firstSnapSeenRef.current[chat.id] = true;
      }

      // okundu güncelle (kullanıcıdan gelenler için)
      snap.docs.forEach(async (d0) => {
        const data = d0.data() as any;
        if (data.senderId !== "admin" && !data.read) {
          await updateDoc(d0.ref, { read: true });
        }
      });
    });

    // aktif listener'ı sakla
    messagesUnsubRef.current = unsub;
  };

  /* -------------------- Mesaj gönder -------------------- */
  const sendMessage = async () => {
    if (!selectedChat || !newMessage.trim() || !user) return;
    const msgText = newMessage.trim();

    // alt koleksiyona mesaj ekle
    await addDoc(collection(db, "messages", selectedChat.id, "messages"), {
      senderId: "admin",
      text: msgText,
      createdAt: serverTimestamp(),
      read: false,
    });

    // ana sohbet dokümanını güncelle
    await updateDoc(doc(db, "messages", selectedChat.id), {
      lastMessage: msgText,
      updatedAt: serverTimestamp(),
      lastSenderId: "admin", // 🔹 EKLENDİ
    });

    // 🔹 Kullanıcıya bildirim gönder (kullanıcı uid'si)
    const targetUid = selectedChat.participants.find((p) => p !== "admin");
    if (targetUid) {
      await addDoc(collection(db, "notifications"), {
        toUserUid: targetUid,
        title: "Yeni mesajınız var 💬",
        message: msgText.slice(0, 80),
        type: "message",
        read: false,
        createdAt: serverTimestamp(),
        chatId: selectedChat.id,
      });
    }

    setNewMessage("");
  };

  /* -------------------- Sohbet sil -------------------- */
  const deleteChat = async (chatId: string) => {
    if (confirm("Bu sohbeti silmek istediğinize emin misiniz?")) {
      const subQ = query(
        collection(db, "messages", chatId, "messages"),
        orderBy("createdAt", "asc")
      );
      const subUnsub = onSnapshot(subQ, (snap) => {
        snap.docs.forEach(async (d0) => {
          await deleteDoc(doc(db, "messages", chatId, "messages", d0.id));
        });
      });
      await deleteDoc(doc(db, "messages", chatId));
      subUnsub();

      // Eğer silinen sohbet açık ise UI'dan temizle
      if (selectedChat?.id === chatId) {
        setSelectedChat(null);
        setMessages([]);
      }
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <audio ref={audioRef} src="/sounds/new-message.mp3" preload="auto" />
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-[350px,1fr] gap-6">
        {/* SOL TARAF */}
        <div className="bg-white rounded-2xl shadow p-4 overflow-y-auto max-h-[80vh]">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Shield size={18} className="text-blue-600" />
            Mesajlarım
          </h2>

          {chats.length === 0 ? (
            <p className="text-gray-500 text-sm">Henüz mesaj bulunamadı.</p>
          ) : (
            <ul className="space-y-2">
              {chats.map((c) => (
                <li
                  key={c.id}
                  onClick={() => {
                    openChat(c);
                  }}
                  className={`p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition ${
                    selectedChat?.id === c.id
                      ? "bg-blue-50 border-blue-400"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800 line-clamp-1">
                        {c.ilanBaslik || "Kullanıcı Sohbeti"}
                      </p>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {c.otherEmail || "—"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {c.updatedAt?.toDate
                          ? new Date(
                              c.updatedAt.toDate()
                            ).toLocaleTimeString("tr-TR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(c.id);
                      }}
                      className="text-red-500 text-xs hover:underline"
                    >
                      Sil
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* SAĞ TARAF */}
        <div className="bg-white rounded-2xl shadow flex flex-col h-[80vh]">
          {selectedChat ? (
            <>
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-800">
                  {selectedChat.ilanBaslik || "Sohbet"}
                </h3>
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
                        m.senderId === "admin"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                          m.senderId === "admin"
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-gray-100 text-gray-800 rounded-bl-none"
                        }`}
                      >
                        <p>{m.text}</p>
                        <span className="block text-[10px] text-right mt-1 opacity-70">
                          {m.createdAt?.toDate
                            ? new Date(
                                m.createdAt.toDate()
                              ).toLocaleTimeString("tr-TR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 border-t flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Mesaj yazın..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1 border rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-400"
                />
                <button
                  onClick={sendMessage}
                  className="px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                >
                  Gönder
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Görüntülemek için bir sohbet seçin.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
