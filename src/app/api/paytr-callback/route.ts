import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/firebaseAdmin"; // 🔥 ADMIN FIRESTORE DOĞRU İMPORT

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const status = form.get("status")?.toString() || "";
    const merchant_oid = form.get("merchant_oid")?.toString() || "";
    const total_amount = form.get("total_amount")?.toString() || "";
    const hash = form.get("hash")?.toString() || "";

    // PAYTR SECRET KEY
    const paytrKey = process.env.PAYTR_MERCHANT_KEY!;
    const paytrSalt = process.env.PAYTR_MERCHANT_SALT!;

    // 🔐 HASH DOĞRULAMA
    const hashStr =
      merchant_oid + paytrSalt + status + total_amount;
    const calculatedHash = crypto
      .createHmac("sha256", paytrKey)
      .update(hashStr)
      .digest("hex");

    if (calculatedHash !== hash) {
      return NextResponse.json(
        { error: "INVALID HASH" },
        { status: 400 }
      );
    }

    // 🟢 ÖDEME BAŞARILI – FIRESTORE’A KAYDET
    await db
      .collection("odeme_bildirimleri")
      .doc(merchant_oid)
      .set(
        {
          status,
          total_amount,
          createdAt: new Date(),
        },
        { merge: true }
      );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PAYTR CALLBACK ERROR:", err);
    return NextResponse.json(
      { error: "SERVER ERROR" },
      { status: 500 }
    );
  }
}
