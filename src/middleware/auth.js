/**
 * Middleware - Authentication
 * JWT token verification for protected routes
 */

import { extractToken, verifyToken } from '../utils/auth.js'
import { sendError } from '../utils/response.js'
import { logger } from '../utils/logger.js'

/**
 * Middleware to verify JWT token
 */
export function authMiddleware(req, res, next) {
  try {
    const token = extractToken(req.headers.authorization)

    if (!token) {
      return sendError(res, 'No token provided', 401)
    }

    const payload = verifyToken(token)

    if (!payload) {
      return sendError(res, 'Invalid or expired token', 401)
    }

    req.user = payload
    next()
  } catch (error) {
    logger.error(`Authentication failed: ${error.message}`)
    sendError(res, 'Authentication failed', 401, error)
  }
}

/**
 * Middleware to optionally verify JWT token (doesn't fail if no token)
 */
export function optionalAuthMiddleware(req, res, next) {
  try {
    const token = extractToken(req.headers.authorization)

    if (token) {
      const payload = verifyToken(token)
      if (payload) {
        req.user = payload
      }
    }

    next()
  } catch (error) {
    logger.debug(`Optional authentication skipped: ${error.message}`)
    next()
  }
}
