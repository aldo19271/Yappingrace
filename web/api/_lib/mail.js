import nodemailer from 'nodemailer';

let transporter;

function getTransporter() {
  if (!transporter) {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    if (!user || !pass) throw new Error('GMAIL_USER / GMAIL_APP_PASSWORD belum diisi di Vercel.');
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass: pass.replace(/\s+/g, '') },
    });
  }
  return transporter;
}

/** Kirim kode verifikasi lupa password lewat Gmail SMTP. */
export async function sendResetCode(to, code) {
  const user = process.env.GMAIL_USER;
  await getTransporter().sendMail({
    from: `"AduYapping" <${user}>`,
    to,
    subject: `Kode AduYapping: ${code}`,
    text: `Kode verifikasi kamu: ${code}\n\nKode berlaku 10 menit. Kalau kamu tidak merasa meminta kode ini, abaikan saja email ini.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;padding:24px;background:#111;color:#fff;border-radius:16px">
      <h2 style="margin:0 0 12px;color:#ff6a00">AduYapping</h2>
      <p style="margin:0 0 12px">Kode verifikasi kamu:</p>
      <p style="font-size:34px;letter-spacing:8px;font-weight:700;margin:0 0 16px;color:#ff6a00">${code}</p>
      <p style="margin:0;color:#aaa;font-size:13px">Berlaku 10 menit. Kalau kamu tidak merasa meminta kode ini, abaikan saja email ini.</p>
    </div>`,
  });
}
