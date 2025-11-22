import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import nodemailer from "nodemailer";
import * as dotenv from "dotenv";

dotenv.config();

// -------- Firebase Admin --------
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore(); // 🔥 SADECE BİR KEZ TANIMLI

// -------- Mail Transport --------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
});

async function safeSendMail(opts: nodemailer.SendMailOptions) {
  try {
    const info = await transporter.sendMail(opts);
    functions.logger.info("📧 Mail sent", { messageId: info.messageId });
  } catch (err) {
    functions.logger.error("❌ Mail send error", err as any);
  }
}

/* ---------------------------------------------------
 * 1) Yeni ilan oluşturulunca ADMIN’e mail
 * --------------------------------------------------- */
export const onListingCreated = functions.firestore
  .document("ilanlar/{ilanId}")
  .onCreate(async (snap, context) => {
    const ilan = snap.data() || {};
    const ilanId = context.params.ilanId;

    const adminTo = process.env.ADMIN_EMAIL_TO;
    if (!adminTo) {
      functions.logger.warn("ADMIN_EMAIL_TO is not set");
      return null;
    }

    const subject = `🆕 Yeni İlan Geldi: ${ilan.baslik || ilan.ilanNo || ilanId}`;
    const html = `
      <h2>Yeni İlan</h2>
      <ul>
        <li><b>İlan No:</b> ${ilan.ilanNo || ilanId}</li>
        <li><b>Başlık:</b> ${ilan.baslik || "-"}</li>
        <li><b>Kategori:</b> ${ilan.kategori || "-"} / ${ilan.altKategori || "-"}</li>
        <li><b>Konum:</b> ${ilan.il || "-"} / ${ilan.ilce || "-"}</li>
        <li><b>Giriş:</b> ${ilan.girisTarihi || "-"}</li>
        <li><b>Çıkış:</b> ${ilan.cikisTarihi || "-"}</li>
        <li><b>Fiyat:</b> ${ilan.ucret ?? "-"}</li>
        <li><b>Durum:</b> ${ilan.status || "-"}</li>
        <li><b>Sahip:</b> ${ilan.sahipEmail || ilan.sahipUid || "-"}</li>
      </ul>
      <p>
        <a href="${process.env.ADMIN_URL || "http://localhost:3000/admin/ilanlar"}">
          Admin panelinde görüntüle
        </a>
      </p>
    `;

    await safeSendMail({
      from: process.env.MAIL_FROM,
      to: adminTo,
      subject,
      html,
    });

    return null;
  });

/* ---------------------------------------------------
 * 1.5) bitisTarihi alanına göre süresi dolan ilanları expire et
 *      (ELDEKİ KODUN AYNISI — korunuyor)
 * --------------------------------------------------- */
export const checkExpiredListings = functions.pubsub
  .schedule("every 12 hours") // istersen "every 1 hours"
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now();
    const ilanRef = db.collection("ilanlar");

    const snapshot = await ilanRef
      .where("status", "==", "approved")
      .where("bitisTarihi", "<=", now)
      .get();

    if (snapshot.empty) {
      console.log("⏳ Süresi dolan ilan yok.");
      return null;
    }

    const batch = db.batch();

    snapshot.docs.forEach((docSnap) => {
      batch.update(docSnap.ref, {
        status: "expired", // yayından kaldır
        expiredAt: now,
      });
    });

    await batch.commit();
    console.log(`⛔ ${snapshot.size} ilan süresi dolduğu için yayından kaldırıldı.`);

    return null;
  });

/* ---------------------------------------------------
 * 2) İlan status -> approved olunca İLAN SAHİBİ’ne mail
 * --------------------------------------------------- */
export const onListingApproved = functions.firestore
  .document("ilanlar/{ilanId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data() || {};
    const after = change.after.data() || {};

    // sadece status "approved"a geçişte tetikle
    if (before.status === "approved" || after.status !== "approved") {
      return null;
    }

    const to = after.sahipEmail;
    if (!to) {
      functions.logger.warn("Listing owner email missing; skip mail.", {
        ilanId: context.params.ilanId,
      });
      return null;
    }

    const subject = `✅ İlanınız Yayında: ${
      after.baslik || after.ilanNo || context.params.ilanId
    }`;
    const html = `
      <p>Merhaba,</p>
      <p><b>${after.baslik || "-"}</b> başlıklı ilanınız onaylandı ve yayına alındı.</p>
      <ul>
        <li><b>İlan No:</b> ${after.ilanNo || context.params.ilanId}</li>
        <li><b>Kategori:</b> ${after.kategori || "-"} / ${after.altKategori || "-"}</li>
        <li><b>Yayın Durumu:</b> ${after.status}</li>
      </ul>
      <p>
        <a href="${process.env.SITE_URL || "http://localhost:3000"}">
          Siteyi ziyaret et
        </a>
      </p>
      <p>Teşekkürler,<br/>TatiliniDevret Ekibi</p>
    `;

    await safeSendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      html,
    });

    return null;
  });

/* ---------------------------------------------------
 * 3) 15 günü dolan approved ilanları otomatik expire et
 *    + İLAN SAHİBİNE 350 TL / 30 GÜN UZATMA MAİLİ GÖNDER
 *    (her gün 1 kez çalışan CRON job)
 * --------------------------------------------------- */
export const autoExpireListings = functions.pubsub
  .schedule("every 24 hours") // her gün 1 kere
  .timeZone("Europe/Istanbul")
  .onRun(async () => {
    const now = Date.now();
    const FIFTEEN_DAYS = 15 * 24 * 60 * 60 * 1000;

    const snap = await db
      .collection("ilanlar")
      .where("status", "==", "approved")
      .get();

    let expiredCount = 0;
    const batch = db.batch();

    for (const docSnap of snap.docs) {
      const data = docSnap.data() as any;
      const ilanId = docSnap.id;

      if (!data.olusturmaTarihi) continue;

      const created =
        data.olusturmaTarihi.toDate?.() ??
        (typeof data.olusturmaTarihi === "number"
          ? new Date(data.olusturmaTarihi)
          : null);

      if (!created) continue;

      const diff = now - created.getTime();
      if (diff >= FIFTEEN_DAYS) {
        // Firestore tarafı: ilanı expired yap
        batch.update(docSnap.ref, {
          status: "expired",
          expiredAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        expiredCount++;

        // Mail tarafı: ilan sahibine paket satın alma maili
        const to = data.sahipEmail;
        if (to) {
          const adSoyad =
            data.sahipAdSoyad || data.adSoyad || data.displayName || "";
          const ilanBaslik = data.baslik || data.ilanNo || ilanId;
          const renewUrl = `${
            process.env.SITE_URL || "https://tatilinidevret.com"
          }/odeme/ilan-uzatma/${ilanId}`;

          const html = `
            Merhaba ${adSoyad || ""},<br/><br/>
            "<b>${ilanBaslik}</b>" başlıklı ilanınızın ücretsiz yayın süresi sona ermiştir.<br/>
            İlanınızı yayına almak için 30 günlük <b>350 TL</b> uzatma paketini satın alabilirsiniz.<br/><br/>
            <b>Yenileme Linki:</b><br/>
            <a href="${renewUrl}">${renewUrl}</a>
            <br/><br/>
            TatiliniDevret Ekibi
          `;

          await safeSendMail({
            from: process.env.MAIL_FROM,
            to,
            subject: `⏳ İlan Süreniz Doldu: ${ilanBaslik}`,
            html,
          });
        }
      }
    }

    if (expiredCount > 0) {
      await batch.commit();
      functions.logger.info(
        `⏳ Süresi dolan ilanlar expired yapıldı ve mail gönderildi: ${expiredCount}`
      );
    } else {
      functions.logger.info("⏳ Süresi dolan ilan bulunamadı.");
    }

    return null;
  });
