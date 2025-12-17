import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "orderId eksik" }, { status: 400 });
    }

    const snap = await getDoc(doc(db, "orders", orderId));
    if (!snap.exists()) {
      return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
    }

    const order = snap.data() as any;

    if (order.status !== "pending") {
      return NextResponse.json({ error: "Bu sipariş zaten işlenmiş." }, { status: 400 });
    }

    const merchant_id = process.env.PAYTR_MERCHANT_ID!;
    const merchant_key = process.env.PAYTR_MERCHANT_KEY!;
    const merchant_salt = process.env.PAYTR_MERCHANT_SALT!;

    const email = order.userUid + "@mail-proxy.tatilinidevret.com"; // Email zorunlu
    const payment_amount = order.amount * 100; // PayTR kuruş formatında ister
    const user_ip = "127.0.0.1"; // gerekirse gerçekte header'dan alınabilir

    const user_basket = Buffer.from(
      JSON.stringify([
        [order.type.toUpperCase(), order.amount, 1],
      ])
    ).toString("base64");

    const merchant_oid = order.orderId;

    const no_installment = 1;
    const max_installment = 1;
    const currency = "TL";

    const success_url = process.env.PAYTR_SUCCESS_URL!;
    const fail_url = process.env.PAYTR_FAIL_URL!;

    const hash_str =
      merchant_id +
      user_ip +
      merchant_oid +
      email +
      payment_amount +
      user_basket +
      no_installment +
      max_installment +
      currency +
      success_url +
      fail_url +
      merchant_salt;

    const paytr_token = crypto
      .createHmac("sha256", merchant_key)
      .update(hash_str)
      .digest("base64");

    return NextResponse.json({
      success: true,
      token: paytr_token,
      merchant_id,
      merchant_oid,
      amount: order.amount,
      iframeUrl: `https://www.paytr.com/odeme/guvenli/${paytr_token}`,
    });
  } catch (error) {
    console.error("PAYTR TOKEN HATASI:", error);
    return NextResponse.json({ error: "TOKEN üretilemedi" }, { status: 500 });
  }
}
