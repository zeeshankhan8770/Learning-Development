const nodemailer = require('nodemailer');
const config = require('../config/env');

// One transporter, reused across requests (Nodemailer pools connections internally).
const transporter = nodemailer.createTransport({
  host: config.mail.smtpHost,
  port: config.mail.smtpPort,
  secure: config.mail.smtpSecure, // true = SSL (465), false = STARTTLS (587)
  auth: {
    user: config.mail.smtpUser,
    pass: config.mail.smtpPass,
  },
});

/**
 * Sends the "New Portfolio Message" notification email.
 * Mirrors the original contact.php template/behavior.
 */
async function sendContactEmail({ name, email, message }) {
  const html = `
    <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
      <h2>New Contact Inquiry</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <hr style="border: 0; border-top: 1px solid #eee;">
      <p><strong>Message:</strong></p>
      <p style="background: #f9f9f9; padding: 15px; border-radius: 5px;">${escapeHtml(message)}</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"${config.mail.senderName}" <${config.mail.smtpUser}>`,
    to: config.mail.recipient,
    replyTo: `"${name}" <${email}>`,
    subject: `New Portfolio Message from: ${name}`,
    html,
  });
}

// Minimal HTML escaping so user input can't break out of the email markup.
function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = { sendContactEmail };
