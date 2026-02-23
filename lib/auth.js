import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key'
const SALT_ROUNDS = 10

// Hash password
export async function hashPassword(password) {
  return await bcryptjs.hash(password, SALT_ROUNDS)
}

// Compare password
export async function comparePassword(password, hashedPassword) {
  return await bcryptjs.compare(password, hashedPassword)
}

// Generate JWT token
export function generateToken(userId, email) {
  return jwt.sign(
    {
      _id: userId,
      email: email,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Extract token from Authorization header
export function extractToken(authHeader) {
  if (!authHeader) return null
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null
  return parts[1]
}
