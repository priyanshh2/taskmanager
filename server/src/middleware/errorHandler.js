/**
 * Middleware to handle requests for routes that do not exist.
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`)
  res.status(404)
  next(error)
}

/**
 * Centralized error handler middleware.
 * Ensures consistent, client-safe error responses across all API routes.
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500
  let message = err.message || 'Internal Server Error'

  if (err.status && typeof err.status === 'number') {
    statusCode = err.status
  }

  // Handle CORS blocked origin errors
  if (err.message && err.message.startsWith('CORS blocked')) {
    statusCode = 403
  }

  // Handle SyntaxError from malformed JSON payloads in request body
  if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400
    message = 'Malformed JSON in request body'
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId format)
  if (err.name === 'CastError') {
    statusCode = 400
    message = 'Invalid resource identifier format'
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ')
  }

  // Handle MongoDB duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409
    message = 'An account with this email address already exists'
  }

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  })
}
