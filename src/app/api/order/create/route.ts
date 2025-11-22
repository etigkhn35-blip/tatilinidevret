import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseConfig";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ilanId, userUid, amount } = body;

    if (!ilanId || !userUid || !amount) {
      return NextResponse.json(
        { error: "Eksik parametreler: ilanId, userUid, amount zorunlu." },
        { status: 400 }
      );
    }

    // Benzersiz sipariş ID (PayTR merchant_oid olarak kullanılacak)
    const orderId = `ORD_${Date.now()}_${nanoid(6)}`;

    const ref = doc(collection(db, "orders"), orderId);
    await setDoc(ref, {
      orderId,
      ilanId,
      userUid,
      amount,
      status: "pending",
      type: "ilan-uzatma", // ileride farklı paketler eklenebilir
      createdAt: serverTimestamp(),
      paidAt: null,
    });

    return NextResponse.json({
      success: true,
      orderId,
    });
  } catch (error) {
    console.error("❌ Sipariş oluşturulamadı:", error);
    return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
  }
}
