const express = require('express');
const path = require('path');
const morgan = require('morgan');

const contactRoutes = require('./routes/contact.routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // parses the contact form's FormData

// Serve the whole static portfolio (html/css/js/webfonts/img) from /public.
// Visiting "/" automatically serves public/index.html.
app.use(express.static(path.join(__dirname, '..', 'public')));

// API routes
app.use('/api', contactRoutes);

// 404 + error handlers (must be last)
app.use('/api', notFound);
app.use(errorHandler);

module.exports = app;
