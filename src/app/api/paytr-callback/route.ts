import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/firebaseConfig";
import { doc, updateDoc, addDoc, collection, Timestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      merchant_oid,
      status,
      total_amount,
      hash,
      test_mode
    } = body;

    // PAYTR HASH DOĞRULAMA
    const merchant_key = process.env.PAYTR_MERCHANT_KEY!;
    const merchant_salt = process.env.PAYTR_MERCHANT_SALT!;

    const hash_str = merchant_oid + merchant_salt + status + total_amount;
    const generated_hash = crypto
      .createHmac("sha256", merchant_key)
      .update(hash_str)
      .digest("base64");

    if (generated_hash !== hash) {
      console.log("❌ HASH UYUŞMUYOR");
      return NextResponse.json({ ok: false });
    }

    // --- ÖDEME BAŞARILI ---
    if (status === "success") {
      const ilanRef = doc(db, "ilanlar", merchant_oid);
      await updateDoc(ilanRef, {
        odemeDurumu: "başarılı",
        odemeTarihi: Timestamp.now(),
        status: "pending"   // admin onaylayacak
      });

      // Admin’e bildirim
      await addDoc(collection(db, "notifications"), {
        toUserUid: "admin",
        type: "payment",
        title: "Yeni Ödeme Geldi",
        message: `Bir ilan için ödeme başarıyla alındı.`,
        ilanId: merchant_oid,
        createdAt: Timestamp.now(),
        read: false
      });

      return NextResponse.json({ ok: true });
    }

    // --- ÖDEME BAŞARISIZ ---
    if (status === "failed") {
      const ilanRef = doc(db, "ilanlar", merchant_oid);
      await updateDoc(ilanRef, {
        odemeDurumu: "başarısız",
        status: "draft",
      });

      return NextResponse.json({ ok: false });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PAYTR CALLBACK ERROR:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
