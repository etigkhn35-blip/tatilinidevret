import { NextResponse } from "next/server";
import * as crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { ilanId, userId, email, amount } = await req.json();

    if (!ilanId || !userId || !email || !amount) {
      return NextResponse.json({ ok: false, error: "Eksik parametre" }, { status: 400 });
    }

    const merchant_id = process.env.PAYTR_MERCHANT_ID!;
    const merchant_key = process.env.PAYTR_MERCHANT_KEY!;
    const merchant_salt = process.env.PAYTR_MERCHANT_SALT!;

    const no_installment = "0";
    const max_installment = "0";
    const currency = "TL";

    const user_ip = "127.0.0.1"; // zorunlu ama backendde sabit verilebilir
    const merchant_oid = `UZATMA_${ilanId}_${Date.now()}`;
    const success_url = `${process.env.SITE_URL}/odeme/basarili?ilanId=${ilanId}`;
    const fail_url = `${process.env.SITE_URL}/odeme/hata?ilanId=${ilanId}`;

    const basket = Buffer.from(
      JSON.stringify([[`İlan Süre Uzatma #${ilanId}`, amount, 1]])
    ).toString("base64");

    const hash_str = `${merchant_id}${user_ip}${merchant_oid}${email}${amount}${currency}${basket}${no_installment}${max_installment}${merchant_salt}`;
    const paytr_token = crypto
      .createHmac("sha256", merchant_key)
      .update(hash_str)
      .digest("base64");

    return NextResponse.json({
      ok: true,
      redirectUrl: "https://www.paytr.com/odeme",
      postData: {
        merchant_id,
        user_ip,
        merchant_oid,
        email,
        payment_amount: amount * 100, // PayTR kuruş ister
        currency,
        test_mode: process.env.PAYTR_TEST === "1" ? "1" : "0",
        no_installment,
        max_installment,
        basket,
        paytr_token,
        success_url,
        fail_url
      }
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
  }
}
