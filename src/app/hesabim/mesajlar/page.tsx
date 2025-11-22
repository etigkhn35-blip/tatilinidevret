"use client";
import { getDocs } from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
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
} from "firebase/firestore";
import { ShieldCheck, User as UserIcon, Trash2 } from "lucide-react";

type Chat = {
  id: string;
  participants: string[];
  ilanBaslik?: string;
  lastMessage?: string;
  lastSenderId?: string;
  updatedAt?: any;
  email?: string;
};

type Msg = {
  id: string;
  senderId: string;
  text: string;
  createdAt?: any;
};

export default function HesabimMesajlarPage() {
  const [meUid, setMeUid] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingAuth, setLoadingAuth] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [lastSeenUpdatedAt, setLastSeenUpdatedAt] = useState<number>(0);
  const search = useSearchParams();
  const chatFromUrl = search.get("chat");

  /* ---------------- Ses ---------------- */
  useEffect(() => {
    audioRef.current = new Audio("/sounds/notify.mp3");
  }, []);

  /* ---------------- Kullanıcı ---------------- */
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) setMeUid(user.uid);
      else setMeUid(null);
      setLoadingAuth(false);
    });
    return () => unsub();
  }, []);

  /* ---------------- Sohbet listesi ---------------- */
  useEffect(() => {
    if (!meUid) return;

    const q = query(collection(db, "messages"), where("participants", "array-contains", meUid));

    const unsub = onSnapshot(q, async (snap) => {
      const list: Chat[] = [];

      for (const d of snap.docs) {
        const data = d.data() as any;
        const otherId: string =
          (data.participants || []).find((p: string) => p !== meUid) || "";
        let email = "Bilinmeyen Kullanıcı";

        try {
          if (otherId) {
            const uDoc = await getDoc(doc(db, "users", otherId));
            if (uDoc.exists()) {
              email = (uDoc.data() as any).email || email;
            }
          }
        } catch {}

        const chat: Chat = {
          id: d.id,
          email,
          ...data,
          updatedAt: data.updatedAt || data.createdAt,
        };
        list.push(chat);
      }

      // 🔽 Lokal sıralama
      list.sort((a, b) => {
        const at = a.updatedAt?.toMillis?.() || 0;
        const bt = b.updatedAt?.toMillis?.() || 0;
        return bt - at;
      });

      setChats(list);

      // 🔔 Yeni mesaj sesi
      const newestMs = list[0]?.updatedAt?.toMillis?.() || 0;
      const lastSender = list[0]?.lastSenderId || "";
      if (
        newestMs > lastSeenUpdatedAt &&
        lastSeenUpdatedAt !== 0 &&
        lastSender !== meUid &&
        audioRef.current
      ) {
        try {
          audioRef.current.currentTime = 0;
          await audioRef.current.play();
        } catch {}
      }
      setLastSeenUpdatedAt(newestMs);
    });

    return () => unsub();
  }, [meUid, lastSeenUpdatedAt]);

  /* ---------------- Chat ID'den doğrudan yükleme ---------------- */
  const openChatById = async (chatId: string, myUid: string) => {
    try {
      const c = await getDoc(doc(db, "messages", chatId));
      if (!c.exists()) return;
      const data = c.data() as any;
      if (!Array.isArray(data.participants) || !data.participants.includes(myUid)) return;

      const otherId = data.participants.find((p: string) => p !== myUid);
      let email = "Kullanıcı";
      if (otherId) {
        const uDoc = await getDoc(doc(db, "users", otherId));
        if (uDoc.exists()) {
          const u = uDoc.data() as any;
          email = u.adSoyad || u.email || email;
        }
      }
      const chat: Chat = { id: c.id, email, ...data };
      openChat(chat);
    } catch (e) {
      console.error("Chat yüklenemedi:", e);
    }
  };

  /* ---------------- URL'den otomatik aç ---------------- */
  useEffect(() => {
    if (!meUid || !chatFromUrl) return;

    const existing = chats.find((c) => c.id === chatFromUrl);
    if (existing) {
      openChat(existing);
    } else {
      openChatById(chatFromUrl, meUid);
    }
  }, [meUid, chatFromUrl, chats]);

  /* ---------------- Sohbet aç ---------------- */
  const openChat = (chat: Chat) => {
    setSelectedChat(chat);

    const q = query(collection(db, "messages", chat.id, "messages"), orderBy("createdAt", "asc"));

    const unsub = onSnapshot(q, (snap) => {
      const list: Msg[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
      setMessages(list);
    });

    return unsub;
  };

  /* ---------------- Mesaj gönder ---------------- */
  const sendMessage = async () => {
    if (!selectedChat || !newMessage.trim() || !meUid) return;

    const msgRef = collection(db, "messages", selectedChat.id, "messages");
    await addDoc(msgRef, {
      senderId: meUid,
      text: newMessage.trim(),
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, "messages", selectedChat.id), {
      lastMessage: newMessage.trim(),
      lastSenderId: meUid,
      updatedAt: serverTimestamp(),
    });

    const targetUid = selectedChat.participants.find((p) => p !== meUid) || null;
    if (targetUid) {
      await addDoc(collection(db, "notifications"), {
        toUserUid: targetUid,
        title: "Yeni mesajınız var 💬",
        message: newMessage.slice(0, 80),
        type: "message",
        read: false,
        createdAt: serverTimestamp(),
        chatId: selectedChat.id,
      });
    }

    setNewMessage("");
  };

  /* ---------------- Sohbet sil ---------------- */
  const deleteChat = async (chatId: string) => {
    if (!confirm("Bu sohbeti silmek istediğinize emin misiniz?")) return;

    try {
      // Alt mesajları sil
      const subQ = query(collection(db, "messages", chatId, "messages"));
      const subSnap = await getDocs(subQ);
      for (const m of subSnap.docs) {
        await deleteDoc(m.ref);
      }

      // Sohbeti sil
      await deleteDoc(doc(db, "messages", chatId));

      alert("🗑️ Sohbet silindi!");
      if (selectedChat?.id === chatId) setSelectedChat(null);
    } catch (err) {
      console.error("Silme hatası:", err);
      alert("❌ Sohbet silinirken bir hata oluştu.");
    }
  };

  /* ---------------- Seçili e-posta ---------------- */
  const selectedEmail = useMemo(() => {
    if (!selectedChat) return "—";
    if (selectedChat.participants.includes("admin")) return "Destek Ekibi";
    return selectedChat.email || "—";
  }, [selectedChat]);

  /* ---------------- Yükleniyor ekranı ---------------- */
  if (loadingAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-500">
        Yükleniyor...
      </main>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-[320px,1fr] gap-6">
        {/* SOL: Sohbet listesi */}
        <div className="bg-white rounded-2xl shadow p-4 overflow-y-auto max-h-[80vh]">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Mesajlarım</h2>

          {chats.length === 0 ? (
            <p className="text-gray-500 text-sm">Henüz sohbetiniz yok.</p>
          ) : (
            <ul className="space-y-2">
              {chats.map((c) => {
                const isAdmin = c.participants.includes("admin");
                const displayName = isAdmin ? "Destek Ekibi" : c.email || "Kullanıcı";

                return (
                  <li
                    key={c.id}
                    className={`p-3 rounded-xl border hover:bg-gray-50 transition ${
                      selectedChat?.id === c.id ? "bg-blue-50 border-blue-400" : "cursor-pointer"
                    }`}
                  >
                    <div
                      className="flex items-center justify-between"
                      onClick={() => openChat(c)}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {isAdmin ? (
                          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-gray-500 shrink-0" />
                        )}
                        <div>
                          <p className="font-semibold text-gray-800 line-clamp-1">
                            {c.ilanBaslik || "Sohbet"}
                          </p>
                          <p className="text-sm text-gray-500 line-clamp-1">{displayName}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {c.updatedAt?.toDate
                              ? new Date(c.updatedAt.toDate()).toLocaleString("tr-TR")
                              : ""}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(c.id);
                        }}
                        className="text-red-500 hover:text-red-700 transition"
                        title="Sohbeti Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* SAĞ: Mesaj alanı */}
        <div className="bg-white rounded-2xl shadow flex flex-col h-[80vh]">
          {selectedChat ? (
            <>
              <div className="p-4 border-b flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {selectedChat.ilanBaslik || "Sohbet"}
                  </h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    {selectedChat.participants.includes("admin") ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-blue-600" /> Karşı taraf: Destek Ekibi
                      </>
                    ) : (
                      <>
                        <UserIcon className="w-4 h-4 text-gray-500" /> Karşı taraf: {selectedEmail}
                      </>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => deleteChat(selectedChat.id)}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" /> Sil
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center mt-10">Henüz mesaj yok.</p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${
                        m.senderId === meUid ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm text-sm ${
                          m.senderId === meUid
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-gray-100 text-gray-800 rounded-bl-none"
                        }`}
                      >
                        <p>{m.text}</p>
                        <span className="block text-[10px] text-right mt-1 opacity-70">
                          {m.createdAt?.toDate
                            ? new Date(m.createdAt.toDate()).toLocaleTimeString("tr-TR", {
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
                  placeholder="Mesaj yaz…"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
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
