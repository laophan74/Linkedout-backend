/**
 * Authentication Utilities
 * Handles password hashing, JWT token generation and verification
 */

import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from '../config/environment.js'
import { logger } from './logger.js'

const SALT_ROUNDS = 10

/**
 * Hash a password
 */
export async function hashPassword(password) {
  try {
    const salt = await bcryptjs.genSalt(SALT_ROUNDS)
    return await bcryptjs.hash(password, salt)
  } catch (error) {
    logger.error(`Password hashing failed: ${error.message}`)
    throw error
  }
}

/**
 * Compare password with hash
 */
export async function comparePassword(password, hash) {
  try {
    return await bcryptjs.compare(password, hash)
  } catch (error) {
    logger.error(`Password comparison failed: ${error.message}`)
    throw error
  }
}

/**
 * Generate JWT token
 */
export function generateToken(payload, expiresIn = config.jwtExpiration) {
  try {
    return jwt.sign(payload, config.jwtSecret, { expiresIn })
  } catch (error) {
    logger.error(`Token generation failed: ${error.message}`)
    throw error
  }
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwtSecret)
  } catch (error) {
    logger.debug(`Token verification failed: ${error.message}`)
    return null
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}
