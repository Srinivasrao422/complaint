function errorHandler(err, _req, res, _next) {
  console.error(err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: err.message || 'Validation failed',
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid identifier',
    });
  }

  const status = err.statusCode || err.status || 500;
  const message =
    status === 500 ? 'Internal server error' : err.message || 'Something went wrong';
  res.status(status).json({
    success: false,
    message,
  });
}

module.exports = errorHandler;
