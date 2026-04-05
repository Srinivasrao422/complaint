const nodemailer = require('nodemailer');

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const gmailUser = process.env.EMAIL_USER;
  const gmailPass = process.env.EMAIL_PASS;

  if (host && smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === 'true' || port === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });
  }

  if (gmailUser && gmailPass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
    });
  }

  return null;
}

/**
 * @param {{ to: string; subject: string; text?: string; html?: string }} opts
 * @returns {Promise<{ ok: true } | { ok: false; skipped?: boolean; reason?: string }>}
 */
async function sendEmail(opts) {
  const to = String(opts.to || '').trim();
  if (!to) return { ok: false, skipped: true };

  const transporter = createTransporter();
  if (!transporter) return { ok: false, skipped: true };

  const from =
    process.env.MAIL_FROM ||
    process.env.EMAIL_FROM ||
    process.env.EMAIL_USER ||
    process.env.SMTP_USER;

  try {
    await transporter.sendMail({
      from: from || to,
      to,
      subject: String(opts.subject || '').slice(0, 500),
      text: opts.text != null ? String(opts.text) : '',
      html: opts.html != null ? String(opts.html) : undefined,
    });
    return { ok: true };
  } catch (err) {
    console.warn('[email] send failed:', err.message);
    return { ok: false, reason: err.message };
  }
}

module.exports = { sendEmail, createTransporter };
