import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function main() {
  try {
    const info = await transporter.sendMail({
      from: `"TatiliniDevret" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // kendine test gönder
      subject: "SMTP Test - TatiliniDevret",
      text: "Bu bir test mailidir. Sistem başarıyla çalışıyor.",
    });
    console.log("✅ Mail gönderildi:", info.messageId);
  } catch (err) {
    console.error("❌ Mail gönderilemedi:", err);
  }
}

main();
