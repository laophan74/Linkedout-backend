/**
 * Middleware - CORS
 * Cross-Origin Resource Sharing configuration
 */

import { config } from '../config/environment.js'

function isAllowedOrigin(origin) {
  if (!origin) return false
  if (config.corsOrigins.includes(origin)) return true

  try {
    const requestedUrl = new URL(origin)
    if (
      requestedUrl.hostname.endsWith('.vercel.app') &&
      requestedUrl.hostname.toLowerCase().includes('linkedout')
    ) {
      return true
    }

    return config.corsOrigins.some((allowedOrigin) => {
      try {
        const allowedUrl = new URL(allowedOrigin)
        return requestedUrl.hostname === allowedUrl.hostname
      } catch (error) {
        return false
      }
    })
  } catch (error) {
    return false
  }
}

export function corsMiddleware(req, res, next) {
  const origin = req.headers.origin
  
  // Check if origin is in whitelist
  if (isAllowedOrigin(origin)) {
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
