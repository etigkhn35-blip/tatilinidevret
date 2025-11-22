import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { orderId, userUid, email, name, amount } = JSON.parse(req.body);

    const merchant_id = process.env.NEXT_PUBLIC_PAYTR_MERCHANT_ID!;
    const merchant_key = process.env.NEXT_PUBLIC_PAYTR_MERCHANT_KEY!;
    const merchant_salt = process.env.NEXT_PUBLIC_PAYTR_MERCHANT_SALT!;

    const user_ip = "127.0.0.1"; // Opsiyonel: client IP alınabilir
    const merchant_oid = orderId;
    const payment_amount = amount * 100; // PayTR kuruş formatı
    const emailStr = email;
    const user_name = name;

    const basket = Buffer.from(
      JSON.stringify([[`İlan Yenileme (${orderId})`, amount, 1]])
    ).toString("base64");

    const data = `${merchant_id}${user_ip}${merchant_oid}${emailStr}${payment_amount}${basket}1${merchant_salt}`;

    const token = crypto
      .createHmac("sha256", merchant_key)
      .update(data)
      .digest("base64");

    const params = new URLSearchParams({
      merchant_id,
      user_ip,
      merchant_oid,
      email: emailStr,
      payment_amount: String(payment_amount),
      user_name,
      basket,
      paytr_token: token,
      no_installment: "1",
      max_installment: "1",
      currency: "TL",
      test_mode: "1",
      merchant_ok_url: `${process.env.NEXT_PUBLIC_SITE_URL}/odeme/basarili`,
      merchant_fail_url: `${process.env.NEXT_PUBLIC_SITE_URL}/odeme/hatali`,
    });

    return res.status(200).json({
      payment_url: `https://www.paytr.com/odeme/guvenli?${params.toString()}`,
    });
  } catch (err) {
    console.error("PAYTR API Error:", err);
    return res.status(500).json({ error: "PAYTR initialize error" });
  }
}
