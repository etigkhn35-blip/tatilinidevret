import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

/**
 * 📨 Admin'e destek talebi veya yanıt maili gönderir
 * Gövde (body) JSON olmalı: { to, subject, text }
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, subject, text } = body;

    if (!to || !subject || !text) {
      return NextResponse.json(
        { error: "Eksik alan: to, subject veya text bulunamadı." },
        { status: 400 }
      );
    }

    // 🔑 Mail ayarları (kendi SMTP bilgini gir)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // Gmail kullanıyorsan bu satır kalsın
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER || "info@tatilinidevret.com", // e-posta adresin
        pass: process.env.MAIL_PASS || "gmail_uygulama_sifren_buraya", // Gmail app password
      },
    });

    await transporter.sendMail({
      from: `"Tatilini Devret" <info@tatilinidevret.com>`,
      to,
      subject,
      text,
    });

    console.log("✅ Mail başarıyla gönderildi:", subject);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Mail gönderilemedi:", err);
    return NextResponse.json(
      { error: "Mail gönderimi başarısız.", details: err.message },
      { status: 500 }
    );
  }
}
