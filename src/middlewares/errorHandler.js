// 404 handler for unmatched routes (mainly /api/* ones)
function notFound(req, res, next) {
  res.status(404).json({ status: 'error', message: 'Not found' });
}

// Catch-all error handler. Keep this registered LAST in app.js.
function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
  });
}

module.exports = { notFound, errorHandler };
