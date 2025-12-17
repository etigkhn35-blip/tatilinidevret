"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

type Chat = {
  id: string;
  participants: string[];
  lastMessage?: string;
  updatedAt?: any;
};

export default function MesajlarPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, "messages"),
      where("participants", "array-contains", userId),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Chat[];
      setChats(data);
    });

    return () => unsubscribe();
  }, [userId]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-[800px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mesajlarım</h1>

        {chats.length === 0 ? (
          <p className="text-gray-500 text-sm">Henüz hiç mesajınız yok.</p>
        ) : (
          <div className="space-y-3">
            {chats.map((chat) => {
              const otherUser = chat.participants.find((p) => p !== userId);
              return (
                <Link
                  key={chat.id}
                  href={`/mesajlar/${chat.id}`}
                  className="block bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition"
                >
                  <div className="font-semibold text-gray-900">
                    {otherUser || "Kullanıcı"}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {chat.lastMessage || "Yeni sohbet başlatıldı."}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
