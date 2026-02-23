import { verifyToken, extractToken } from './auth.js'

export function authMiddleware(req, res, next) {
  try {
    const token = extractToken(req.headers.authorization)
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' })
  }
}

export function corsMiddleware(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }

  next()
}
