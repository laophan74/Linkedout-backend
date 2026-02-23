/**
 * Middleware - CORS
 * Cross-Origin Resource Sharing configuration
 */

import { config } from '../config/environment.js'

export function corsMiddleware(req, res, next) {
  const origin = req.headers.origin
  
  // Check if origin is in whitelist
  if (config.corsOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
  } else if (config.isDevelopment()) {
    // In development, allow any localhost origin
    res.header('Access-Control-Allow-Origin', origin)
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.header('Access-Control-Allow-Credentials', 'true')

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }

  next()
}
