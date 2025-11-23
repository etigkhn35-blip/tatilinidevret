import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/firebaseAdmin"; // Admin SDK bağlantısı

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const status = form.get("status")?.toString() || "";
    const merchant_oid = form.get("merchant_oid")?.toString() || "";
    const total_amount = form.get("total_amount")?.toString() || "";
    const hash = form.get("hash")?.toString() || "";

    if (!merchant_oid) {
      return NextResponse.json({ ok: false, error: "merchant_oid boş" });
    }

    // PAYTR doğrulama
    const paytrKey = process.env.PAYTR_MERCHANT_KEY!;
    const paytrSalt = process.env.PAYTR_MERCHANT_SALT!;
    const generatedHash = crypto
      .createHash("sha256")
      .update(merchant_oid + paytrSalt + status + total_amount + paytrKey)
      .digest("hex");

    if (generatedHash !== hash) {
      console.error("❌ HASH UYUŞMUYOR!");
      return NextResponse.json({ ok: false, error: "hash mismatch" });
    }

    // 🔥 Ödeme başarılıysa Firestore'a kayıt
    if (status === "success") {
      await db
        .collection("odeme_bildirimleri")
        .doc(merchant_oid)
        .set(
          {
            status,
            total_amount,
            updatedAt: new Date(),
          },
          { merge: true }
        );

      console.log("✔ Ödeme kaydedildi:", merchant_oid);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ PAYTR CALLBACK ERROR:", err);
    return NextResponse.json({ ok: false, error: "server error" });
  }
}
