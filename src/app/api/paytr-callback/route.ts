import { NextResponse } from "next/server";

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
  }
}
