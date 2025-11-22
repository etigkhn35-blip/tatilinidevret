import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import crypto from "crypto";
import nodemailer from "nodemailer";

// 📧 Nodemailer Mail Transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
});

// 🔐 Güvenli mail gönderici
async function sendMail(opts: any) {
  try {
    await transporter.sendMail(opts);
  } catch (err) {
    console.error("MAIL ERROR:", err);
  }
}

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const params = Object.fromEntries(new URLSearchParams(bodyText));

    const { merchant_oid, status, total_amount, hash } = params;

    if (!merchant_oid || !status || !hash) {
      return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
    }

    // 🔐 Hash doğrulama
    const key = process.env.PAYTR_MERCHANT_KEY!;
    const salt = process.env.PAYTR_MERCHANT_SALT!;
    const hashCheck = crypto.createHmac("sha256", key)
      .update(merchant_oid + salt + status + total_amount)
      .digest("base64");

    if (hashCheck !== hash) {
      return NextResponse.json({ error: "Hash Hatalı" }, { status: 403 });
    }

    const ref = doc(db, "orders", merchant_oid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return NextResponse.json({ error: "Order bulunamadı" }, { status: 404 });

    const order = snap.data() as any;

    // 🟢 ÖDEME BAŞARILI
    if (status === "success") {
      const amountPaid = Number(total_amount) / 100;

      await updateDoc(ref, {
        status: "paid",
        paidAt: new Date(),
        amountPaid,
      });

      // 📌 İlanı 30 gün uzat
      if (order.ilanId) {
        const ilanRef = doc(db, "ilanlar", order.ilanId);
        await updateDoc(ilanRef, {
          status: "approved",
          bitisTarihi: Date.now() + 30 * 24 * 60 * 60 * 1000,
        });
      }

      // 🔔 Bildirim Firestore’a kaydet
      await addDoc(collection(db, "notifications"), {
        toUserUid: order.userUid,
        ilanId: order.ilanId,
        type: "ilan-uzatma",
        title: "İlan Süresi Uzatıldı",
        message: `"${order.ilanBaslik}" başlıklı ilanınızın süresi 30 gün uzatıldı.`,
        createdAt: serverTimestamp(),
        read: false,
      });

      // 📩 Kullanıcıya mail gönder
      if (order.email) {
        await sendMail({
          from: process.env.MAIL_FROM,
          to: order.email,
          subject: "🟢 İlan Yenileme Başarılı – TatiliniDevret",
          html: `
          Merhaba ${order.adSoyad || ""},<br><br>
          <b>${order.ilanBaslik}</b> başlıklı ilanınızın yayın süresi başarıyla <b>30 gün</b> uzatıldı. 🎉<br><br>
          İlan linki:<br>
          <a href="https://tatilinidevret.com/ilan/${order.ilanId}">
            https://tatilinidevret.com/ilan/${order.ilanId}
          </a><br><br>
          Teşekkürler,<br>
          <b>TatiliniDevret Ekibi</b>
        `,
        });
      }

      // 📩 Admin’e bilgilendirme
      if (process.env.ADMIN_EMAIL_TO) {
        await sendMail({
          from: process.env.MAIL_FROM,
          to: process.env.ADMIN_EMAIL_TO,
          subject: "🔔 Bir ilan yenilendi",
          html: `
            <b>${order.ilanBaslik}</b> ilanı yenilendi.<br><br>
            Kullanıcı: ${order.email}<br>
            Tutar: ${amountPaid} TL<br>
          `,
        });
      }

      return new Response("OK", { status: 200 });
    }

    // 🔴 ÖDEME BAŞARISIZ
    await updateDoc(ref, {
      status: "failed",
      failedAt: new Date(),
    });

    return new Response("FAILED", { status: 200 });

  } catch (error) {
    console.error("PAYTR CALLBACK ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
