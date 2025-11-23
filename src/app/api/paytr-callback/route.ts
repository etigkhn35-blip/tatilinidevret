import { NextResponse } from "next/server";
<<<<<<< HEAD

// Nodemailer’ın Next.js bundle içine girmemesi için require kullanıyoruz
const nodemailer = require("nodemailer");

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();

    // PAYTR doğrulama işlemin burada yapılacak (şimdilik direkt OK)
    console.log("PAYTR Callback Body:", rawBody);

    // ---- MAIL ----
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.ADMIN_EMAIL_TO,
      subject: "PAYTR Ödeme Bildirimi",
      html: `
        <h2>Yeni PAYTR ödeme bildirimi alındı</h2>
        <pre>${rawBody}</pre>
      `,
    });

    return new NextResponse("OK", { status: 200 });
  } catch (err) {
    console.error("PAYTR CALLBACK ERROR:", err);
    return new NextResponse("ERR", { status: 500 });
=======
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
>>>>>>> c8b9a6f0e2683cb041606b110145c34e46dffd13
  }
}
