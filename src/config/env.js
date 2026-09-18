require('dotenv').config();

/**
 * Centralized config so the rest of the app never reads
 * process.env directly. Add new settings here.
 */
module.exports = {
  port: process.env.PORT || 3000,

  mail: {
    recipient: process.env.RECIPIENT_EMAIL,
    senderName: process.env.SENDER_NAME || 'Portfolio Website',
    smtpHost: process.env.SMTP_HOST,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    smtpPort: Number(process.env.SMTP_PORT) || 587,
    smtpSecure: process.env.SMTP_SECURE === 'true', // true for port 465, false for 587 (STARTTLS)
  },
};
