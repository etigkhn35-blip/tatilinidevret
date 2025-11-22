async function sendMail({ to, subject, html }) {
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
    to,
    subject,
    html,
  });

  console.log("📧 Mail gönderildi →", to);
}
/**
 * TatiliniDevret - Cloud Functions (Bildirim + Mail + Derin Link Güncel)
 */
require("dotenv").config();
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const { Timestamp } = require("firebase-admin/firestore");


admin.initializeApp();
const db = admin.firestore();

/* -------------------------------------------------------------------------- */
/*  1️⃣ DESTEK TALEBİ YANITLANDIĞINDA                                          */
/* -------------------------------------------------------------------------- */
exports.notifyUserOnSupportReply = functions.firestore
  .document("destek_talepleri/{talepId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.durum === after.durum) return;
    if (after.durum !== "yanıtlandı") return;

    const talepId = context.params.talepId;
    const { userUid, adSoyad, baslik, yanit } = after;

    try {
      await db.collection("notifications").add({
        toUserUid: userUid,
        type: "destek",
        title: "Destek Talebinize Yanıt Geldi",
        message: `“${baslik}” başlıklı talebinize yönetici yanıt verdi.`,
       
        createdAt: Timestamp.now(),
        read: false,
      });

      const chatId = `support_${userUid}`;
      const chatRef = db.collection("messages").doc(chatId);
      const chatDoc = await chatRef.get();

      if (!chatDoc.exists) {
        await chatRef.set({
          participants: ["admin", userUid],
          lastMessage: "Destek yanıtı gönderildi",
          updatedAt: Timestamp.now(),
        });
      }

      await chatRef.collection("messages").add({
        senderId: "admin",
        text: `🔔 Merhaba ${adSoyad || ""}, “${baslik}” başlıklı talebinize yanıt verildi:\n\n${yanit}`,
        createdAt: Timestamp.now(),
      });
    } catch (err) {
      console.error("❌ notifyUserOnSupportReply hatası:", err);
    }
  });
 exports.userCreated = functions.auth.user().onCreate(async (user) => {
  try {
    const adminEmail = "info@tatilinidevret.com";

    // Firestore bildirimi
    await db.collection("notifications").add({
      toUserUid: "admin",
      type: "new-user",
      title: "Yeni Kullanıcı Kaydı",
      message: `${user.email} adresi ile yeni bir kullanıcı kayıt oldu.`,
      createdAt: Timestamp.now(),
      read: false,
    });

    // Mail gönder
    await sendMail({
      to: adminEmail,
      subject: "TatiliniDevret - Yeni Kullanıcı Kaydı",
      html: `
        <h2>Yeni Kullanıcı Kaydı</h2>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>UID:</strong> ${user.uid}</p>
      `,
    });

    console.log("✅ Yeni kullanıcı bildirimi işleme alındı:", user.email);
  } catch (err) {
    console.error("❌ userCreated hata:", err);
  }
});

/* -------------------------------------------------------------------------- */
/*  2️⃣ İLAN ONAYLANDIĞINDA                                                    */
/* -------------------------------------------------------------------------- */
exports.notifyUserOnApproval = functions.firestore
  .document("ilanlar/{ilanId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.status === after.status) return;
    if (after.status !== "approved") return;

    const ilanId = context.params.ilanId;

    try {
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
        to: after.sahipEmail,
        subject: "🎉 İlanınız Onaylandı!",
        html: `
          <h2>Merhaba,</h2>
          <p>İlanınız <b>${after.baslik}</b> başarıyla onaylanmıştır.</p>
          <a href="${process.env.SITE_URL}/ilan/${ilanId}">İlanı Görüntüle</a>
        `,
      });

      await db.collection("notifications").add({
        toUserUid: after.sahipUid,
        type: "ilan",
        title: "İlanınız Onaylandı 🎉",
        message: `“${after.baslik}” adlı ilanınız yayına alındı.`,
        ilanId,
        createdAt: Timestamp.now(),
        read: false,
      });
    } catch (err) {
      console.error("❌ notifyUserOnApproval hatası:", err);
    }
  });

/* -------------------------------------------------------------------------- */
/*  3️⃣ MESAJ GÖNDERİLDİĞİNDE (Mail + Bildirim)                                */
/* -------------------------------------------------------------------------- */
exports.notifyUserOnNewMessage = functions.firestore
  .document("messages/{chatId}/messages/{msgId}")
  .onCreate(async (snap, context) => {
    const msg = snap.data();
    const { chatId } = context.params;
      const isAdmin = msg.senderId === "admin";
    

    try {
      // Chat verisini çek
      const chatRef = db.collection("messages").doc(chatId);
      const chatDoc = await chatRef.get();
      const chatData = chatDoc.data();

      if (!chatData || !chatData.participants) return;
      const participants = chatData.participants;

      // Gönderici / Alıcı tespiti
      const senderId = msg.senderId;
      const receiverId = participants.find((uid) => uid !== senderId);
      if (!receiverId) return;

      // Kullanıcı bilgilerini çek
      const senderDoc = await db.collection("users").doc(senderId).get();
      const receiverDoc = await db.collection("users").doc(receiverId).get();

      const senderData = senderDoc.exists ? senderDoc.data() : null;
      const receiverData = receiverDoc.exists ? receiverDoc.data() : null;

      // Firestore Bildirim kaydı
       if (!isAdmin) {
        await db.collection("notifications").add({
          toUserUid: receiverId,
          type: "message",
          title: "Yeni Mesaj 💬",
          message: msg.text?.slice(0, 80),
          chatId,
          createdAt: Timestamp.now(),
          read: false,
        });
      }


      // 📧 Mail bildirimi
      if (receiverData?.email) {
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

        const mailBody = `
          <h3>Merhaba ${receiverData.adSoyad || ""},</h3>
          <p><b>${senderData?.adSoyad || "Bir kullanıcı"}</b> size yeni bir mesaj gönderdi:</p>
          <blockquote>${msg.text}</blockquote>
          <p><a href="${process.env.SITE_URL}/mesajlar?chat=${chatId}">Mesajı Görüntüle</a></p>
        `;

        await transporter.sendMail({
          from: process.env.MAIL_FROM || "no-reply@tatilinidevret.com",
          to: receiverData.email,
          subject: "Yeni mesajınız var 💬",
          html: mailBody,
        });

        console.log(`✅ Mail gönderildi: ${receiverData.email}`);
      }
    } catch (err) {
      console.error("❌ notifyUserOnNewMessage hatası:", err);
    }
  });
