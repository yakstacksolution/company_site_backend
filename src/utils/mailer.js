import nodemailer from 'nodemailer';

let transporter;

const isConfigured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  }
  return transporter;
};

/**
 * Best-effort notification. SMTP is optional: with no credentials configured we
 * log instead, and a delivery failure must never fail the visitor's request —
 * the message is already persisted by the time we get here.
 */
export const sendMail = async ({ to, subject, text, replyTo }) => {
  if (!isConfigured()) {
    // eslint-disable-next-line no-console
    console.log(`[mail skipped — SMTP not configured] to=${to} subject=${subject}`);
    return { delivered: false, reason: 'smtp_not_configured' };
  }

  try {
    await getTransporter().sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      replyTo
    });
    return { delivered: true };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[mail failed]', error.message);
    return { delivered: false, reason: error.message };
  }
};
