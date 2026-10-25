import jwt from 'jsonwebtoken'

/**
 * Generate a signed JWT for the authenticated user ID.
 * Reads secret from JWT_SECRET and expires in JWT_EXPIRES_IN (default: 1h).
 * Fails safely if the JWT secret is missing.
 */
export const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('Server configuration error: JWT_SECRET environment variable is missing')
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '1h'

  return jwt.sign({ id: userId }, secret, {
    expiresIn,
    subject: String(userId),
  })
}

/**
 * Verify a JWT string using JWT_SECRET.
 * Throws on invalid or expired token.
 */
export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('Server configuration error: JWT_SECRET environment variable is missing')
  }

  return jwt.verify(token, secret)
}
