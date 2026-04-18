const errorHandler = (err, req, res, next) => {
  console.error(`[${req.method} ${req.path}]`, err.message)

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({ message: messages.join('. ') })
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate entry. This resource already exists.' })
  }

  // JSON parse error (malformed request body)
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON in request body.' })
  }

  // Request entity too large
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body too large. Maximum size is 1MB.' })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token.' })
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired. Please log in again.' })
  }

  // Default server error
  res.status(err.status || 500).json({
    message: err.expose ? err.message : 'Something went wrong. Please try again.',
  })
}

module.exports = errorHandler
