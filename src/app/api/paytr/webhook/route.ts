import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseConfig";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

/**
 * PAYTR Webhook - Ödeme Sonucu
 * PayTR paneline callback URL olarak şunu ekle:
 * https://tatilinidevret.com/api/paytr/webhook
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const status = body.get("status") as string;
    const merchant_oid = body.get("merchant_oid") as string;

    if (!merchant_oid) {
      return NextResponse.json({ error: "merchant_oid missing" }, { status: 400 });
    }

    console.log("🔔 PAYTR Webhook:", { status, merchant_oid });

    // Order bul
  const ordersRef = admin.firestore().collection("orders");  
    const snap = await ordersRef
      .where("paytrMerchantOid", "==", merchant_oid)
      .limit(1)
      .get();

    if (snap.empty) {
      console.log("❌ Order not found");
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderRef = snap.docs[0].ref;
    const orderData = snap.docs[0].data() as any;

    // Ödeme Başarısız
    if (status !== "success") {
      await orderRef.update({ paymentStatus: "failed" });
      console.log("❌ Payment failed:", merchant_oid);
      return NextResponse.json({ ok: true });
    }

    // Ödeme Başarılı → İlan süresi uzat
    const totalAmountRaw = body.get("total_amount");
const paidAmount = totalAmountRaw ? Number(totalAmountRaw) / 100 : null;

const ilanRef = admin.firestore().collection("ilanlar").doc(orderData.ilanId);

await ilanRef.update({
  status: "approved",
  bitisTarihi: admin.firestore.Timestamp.fromDate(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  ),
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
});

await orderRef.update({
  paymentStatus: "success",
  paidAt: admin.firestore.FieldValue.serverTimestamp(),
  paidAmount: paidAmount,   // <-- EKLENDİ
});

    console.log("✅ İlan süresi uzatıldı:", orderData.ilanId);

    return new NextResponse("OK");
  } catch (err) {
    console.error("🚨 PAYTR webhook error:", err);
    return NextResponse.json({ error: "Webhook internal error" }, { status: 500 });
  }
}

// PAYTR Webhook sadece POST kabul eder
export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
