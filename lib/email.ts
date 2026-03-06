import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(
  toEmail: string,
  username: string,
  token: string
) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

  const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>E-posta Doğrulama</title>
</head>
<body style="margin:0;padding:0;background:#0A0C10;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0C10;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#14171C;border-radius:16px;border:1px solid rgba(200,246,63,0.2);overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:#14171C;padding:36px 40px 28px;text-align:center;border-bottom:1px solid rgba(200,246,63,0.15);">
              <div style="display:inline-block;background:#C8F63F;border-radius:10px;padding:6px 14px;margin-bottom:16px;">
                <span style="color:#0A0C10;font-size:12px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;">Beyaz Yaka</span>
              </div>
              <h1 style="margin:0;color:#FFFFFF;font-size:22px;font-weight:700;letter-spacing:-0.3px;">
                E-posta Doğrulama
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 14px;color:#8E95A2;font-size:15px;">Merhaba <strong style="color:#FFFFFF;">${username}</strong>,</p>
              <p style="margin:0 0 28px;color:#8E95A2;font-size:15px;line-height:1.7;">
                Beyaz Yaka'ya hoş geldin! Hesabını aktifleştirmek için aşağıdaki butona tıkla.
                Bu bağlantı <strong style="color:#C8F63F;">5 dakika</strong> geçerlidir.
              </p>
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <a href="${verifyUrl}"
                       style="display:inline-block;background:#C8F63F;color:#0A0C10;font-size:15px;font-weight:800;text-decoration:none;padding:14px 40px;border-radius:10px;letter-spacing:0.3px;">
                      E-postamı Doğrula →
                    </a>
                  </td>
                </tr>
              </table>
              <!-- Fallback link box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#0A0C10;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:16px;">
                    <p style="margin:0 0 6px;color:#5D636F;font-size:12px;letter-spacing:0.5px;text-transform:uppercase;">Butona tıklayamıyor musun?</p>
                    <p style="margin:0;word-break:break-all;">
                      <a href="${verifyUrl}" style="color:#C8F63F;font-size:12px;text-decoration:none;">${verifyUrl}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
              <p style="margin:0;color:#5D636F;font-size:12px;line-height:1.6;">
                Bu maili sen talep etmediysen güvenle görmezden gelebilirsin.<br/>
                &copy; ${new Date().getFullYear()} Beyaz Yaka – Tüm hakları saklıdır.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "Beyaz Yaka <noreply@example.com>",
      to: toEmail,
      subject: "Beyaz Yaka – E-postanı Doğrula",
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error };
  }
}
