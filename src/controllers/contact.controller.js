const mailerService = require('../services/mailer.service');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/contact
 * Body: { user_name, user_email, user_message } (matches the frontend's FormData keys)
 * Response shape matches the old contact.php: { status: 'success' | 'error', message }
 */
exports.sendMessage = async (req, res) => {
  const name = (req.body.user_name || 'Anonymous').toString().trim();
  const email = (req.body.user_email || '').toString().trim();
  const message = (req.body.user_message || '').toString().trim();

  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide a valid email address.',
    });
  }

  if (!message) {
    return res.status(400).json({
      status: 'error',
      message: 'Please include a message.',
    });
  }

  try {
    await mailerService.sendContactEmail({ name, email, message });
    return res.json({ status: 'success', message: 'Message sent!' });
  } catch (err) {
    console.error('Contact form mail error:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong sending your message. Please try again later.',
    });
  }
};
