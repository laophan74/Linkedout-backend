/**
 * Middleware - Error Handler
 * Global error handling middleware
 */

import { sendError } from '../utils/response.js'
import { logger } from '../utils/logger.js'

/**
 * Error handling middleware
 * Should be registered last
 */
export function errorHandler(err, req, res, next) {
  logger.error(`Error: ${err.message}`)

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    return sendError(res, 'Validation failed', 400, err)
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    return sendError(res, 'Duplicate field value', 400, err)
  }

  // MongoDB cast error
  if (err.name === 'CastError') {
    return sendError(res, 'Invalid ID format', 400, err)
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token', 401, err)
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token expired', 401, err)
  }

  // Default error
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal server error'
  
  sendError(res, message, statusCode, err)
}

/**
 * 404 Not Found handler
 * Should be registered after all other routes
 */
export function notFoundHandler(req, res) {
  sendError(res, `Cannot find ${req.method} ${req.url}`, 404)
}
