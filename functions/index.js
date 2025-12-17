const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Nodemailer SMTP config
const transporter = nodemailer.createTransport({
  host: "srvc232.trwww.com",
  port: 465,
  secure: true,
  auth: {
    user: "info@tatilinidevret.com",
    pass: "Sg254646sg**",
  },
});

// Email helper
async function sendMail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `"Tatilini Devret" <info@tatilinidevret.com>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Mail gönderme hatası:", error);
  }
}

// Otomatik kullanıcı rolü
exports.assignUserRole = functions.auth.user().onCreate(async (user) => {
  try {
    await admin.auth().setCustomUserClaims(user.uid, { role: "user" });
    await admin.firestore().collection("users").doc(user.uid).update({
      role: "user",
    });
    console.log("✔ Role set:", user.uid);
  } catch (err) {
    console.error("❌ Role set error:", err);
  }
});

// Yeni kullanıcı mail bildirimi
exports.sendNewUserMail = functions.auth
  .user()
  .onCreate(async (user) => {
    await sendMail(
      "info@tatilinidevret.com",
      "Yeni Kullanıcı Kaydı",
      `
        <h2>Yeni kullanıcı kaydı yapıldı</h2>
        <p><b>Email:</b> ${user.email}</p>
        <p><b>UID:</b> ${user.uid}</p>
      `
    );
  });

// İlan oluşturuldu
exports.notifyAdminNewListing = functions.firestore
  .document("listings/{id}")
  .onCreate(async (snap) => {
    const ilan = snap.data();
    await sendMail(
      "info@tatilinidevret.com",
      "Yeni İlan Oluşturuldu",
      `
        <h2>Yeni ilan geldi</h2>
        <p><b>Başlık:</b> ${ilan.title}</p>
        <p><b>Sahibi UID:</b> ${ilan.sellerUid}</p>
      `
    );
  });

// İlan onaylandı
exports.notifyListingApproved = functions.firestore
  .document("listings/{id}")
  .onUpdate(async (change) => {
    const before = change.before.data();
    const after = change.after.data();

    if (!before.approved && after.approved) {
      await sendMail(
        after.sellerEmail,
        "İlanınız Onaylandı!",
        `
          <h2>Tebrikler 🎉</h2>
          <p><b>Başlık:</b> ${after.title}</p>
        `
      );
    }
  });

// Mesaj bildirimi
exports.notifyNewMessage = functions.firestore
  .document("messages/{roomId}/messages/{msgId}")
  .onCreate(async (snap) => {
    const msg = snap.data();
    if (!msg.receiverEmail) return;
    await sendMail(
      msg.receiverEmail,
      "Yeni Mesajınız Var!",
      `
        <h2>Mesaj Geldi 📩</h2>
        <p><b>Gönderen:</b> ${msg.senderName}</p>
        <p><b>Mesaj:</b> ${msg.text}</p>
      `
    );
  });

// Yeni teklif bildirimi
exports.notifyNewOffer = functions.firestore
  .document("offers/{id}")
  .onCreate(async (snap) => {
    const offer = snap.data();
    await sendMail(
      offer.sellerEmail,
      "İlanınıza Yeni Teklif Geldi",
      `
        <h2>Yeni teklif!</h2>
        <p><b>İlan:</b> ${offer.listingTitle}</p>
        <p><b>Teklif veren:</b> ${offer.buyerEmail}</p>
        <p><b>Teklif:</b> ${offer.amount}</p>
      `
    );
  });

// Teklif kabul edildi
exports.notifyOfferAccepted = functions.firestore
  .document("offers/{id}")
  .onUpdate(async (change) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.status !== "accepted" && after.status === "accepted") {
      await sendMail(
        after.buyerEmail,
        "Teklifiniz Kabul Edildi",
        `
          <h2>Tebrikler 🎉</h2>
          <p>Teklifiniz kabul edildi.</p>
        `
      );
    }
  });

// Teklif reddedildi
exports.notifyOfferRejected = functions.firestore
  .document("offers/{id}")
  .onUpdate(async (change) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.status !== "rejected" && after.status === "rejected") {
      await sendMail(
        after.buyerEmail,
        "Teklifiniz Reddedildi",
        `
          <h2>Bilgilendirme</h2>
          <p>Teklifiniz reddedildi.</p>
        `
      );
    }
  });
