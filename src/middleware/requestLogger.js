/**
 * Middleware - Request Logger
 * Logs incoming requests and responses
 */

import { logger } from '../utils/logger.js'

export function requestLogger(req, res, next) {
  const start = Date.now()
  
  // Log request
  logger.debug(`${req.method} ${req.path}`)

  // Log response when finished
  const originalSend = res.send

  res.send = function (data) {
    const duration = Date.now() - start
    const statusCode = res.statusCode

    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info'
    logger[level](`${req.method} ${req.path} - ${statusCode} (${duration}ms)`)

    return originalSend.call(this, data)
  }

  next()
}
