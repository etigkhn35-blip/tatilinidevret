// functions/src/emailTemplates.ts

export const ilanYayindaEmailHTML = (userName: string, ilanBaslik: string, ilanNo: string) => `
  <div style="font-family: Arial, sans-serif; background-color:#f4f6f8; padding:20px;">
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
      
      <!-- HEADER -->
      <div style="background:#0057b7; padding:20px; text-align:center;">
        <img src="https://firebasestorage.googleapis.com/v0/b/tatilinidevret.appspot.com/o/logo.png?alt=media" 
             alt="Tatilini Devret" style="height:60px; margin-bottom:10px;" />
        <h1 style="color:#fff; font-size:22px; margin:0;">İlanınız Artık Yayında 🎉</h1>
      </div>

      <!-- BODY -->
      <div style="padding:25px;">
        <p style="font-size:16px; color:#333;">Merhaba <b>${userName}</b>,</p>
        <p style="font-size:15px; color:#555; line-height:1.6;">
          Tebrikler! <b>${ilanBaslik}</b> başlıklı ilanınız başarıyla onaylandı ve artık yayında.
        </p>
        <p style="font-size:15px; color:#555;">
          İlan Numaranız: <b style="color:#0057b7;">${ilanNo}</b>
        </p>

        <div style="text-align:center; margin:30px 0;">
          <a href="https://www.tatilinidevret.com/ilan/${ilanNo}" 
             style="display:inline-block; background:#0057b7; color:#fff; padding:12px 24px; border-radius:8px; 
             text-decoration:none; font-weight:bold;">
             İlanı Görüntüle
          </a>
        </div>

        <p style="font-size:14px; color:#777;">
          İlanınız artık tüm ziyaretçiler tarafından görüntülenebilir. Dilerseniz ilan detay sayfasından fiyat, açıklama ve görselleri güncelleyebilirsiniz.
        </p>
      </div>

      <!-- FOOTER -->
      <div style="background:#f0f3f8; padding:20px; text-align:center; border-top:1px solid #ddd;">
        <p style="margin:0 0 10px 0; font-size:13px; color:#777;">Bizi Takip Edin</p>
        
        <div style="margin-bottom:15px;">
          <a href="https://www.instagram.com/tatilinidevret" style="margin:0 6px;">
            <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="24" alt="Instagram" />
          </a>
          <a href="https://x.com/tatilinidevret" style="margin:0 6px;">
            <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" width="24" alt="X (Twitter)" />
          </a>
          <a href="https://www.facebook.com/tatilinidevret" style="margin:0 6px;">
            <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="24" alt="Facebook" />
          </a>
        </div>

        <p style="font-size:12px; color:#999; margin:0;">
          © 2025 Tatilini Devret. Tüm hakları saklıdır.<br />
          <a href="mailto:destek@tatilinidevret.com" style="color:#0057b7; text-decoration:none;">destek@tatilinidevret.com</a>
        </p>
      </div>
    </div>
  </div>
`;
