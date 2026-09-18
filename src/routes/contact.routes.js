const express = require('express');
const rateLimit = require('express-rate-limit');
const contactController = require('../controllers/contact.controller');

const router = express.Router();

// Basic anti-spam throttle: 5 submissions per IP every 15 minutes.
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many messages sent. Please try again later.' },
});

router.post('/contact', contactLimiter, contactController.sendMessage);

module.exports = router;
