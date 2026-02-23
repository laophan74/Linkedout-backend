/**
 * Authentication Routes
 */

import express from 'express'
import { User } from '../models/User.js'
import { generateToken, comparePassword } from '../utils/auth.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { logger } from '../utils/logger.js'
import { validateSignup, validateLogin } from '../validators/userValidator.js'

const router = express.Router()

/**
 * POST /api/auth/signup
 * Create a new user account
 */
router.post('/signup', async (req, res, next) => {
  try {
    const { username, email, password, fullname } = req.body

    // Validate input
    const validation = validateSignup({ username, email, password, fullname })
    if (!validation.isValid) {
      return sendError(res, 'Validation failed', 400, { errors: validation.errors })
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    })

    if (existingUser) {
      return sendError(res, 'Username or email already exists', 409)
    }

    // Create new user
    const user = new User({
      username,
      email: email.toLowerCase(),
      password, // Will be hashed by pre-save hook
      fullname,
    })

    await user.save()

    // Generate token
    const token = generateToken({
      _id: user._id,
      email: user.email,
    })

    logger.info(`New user registered: ${username}`)

    sendSuccess(res, { user: user.toJSON(), token }, 'User registered successfully', 201)
  } catch (error) {
    logger.error(`Signup error: ${error.message}`)
    next(error)
  }
})

/**
 * POST /api/auth/login
 * Authenticate user and return token
 */
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body

    // Validate required fields
    const validation = validateLogin({ username, password })
    if (!validation.isValid) {
      return sendError(res, 'Validation failed', 400, { errors: validation.errors })
    }

    // Find user (include password field for comparison)
    const user = await User.findOne({ username }).select('+password')

    if (!user) {
      return sendError(res, 'Invalid credentials', 401)
    }

    // Compare passwords
    const isPasswordValid = await comparePassword(password, user.password)

    if (!isPasswordValid) {
      return sendError(res, 'Invalid credentials', 401)
    }

    // Generate token
    const token = generateToken({
      _id: user._id,
      email: user.email,
    })

    logger.info(`User logged in: ${username}`)

    sendSuccess(res, { user: user.toJSON(), token }, 'Login successful')
  } catch (error) {
    logger.error(`Login error: ${error.message}`)
    next(error)
  }
})

/**
 * POST /api/auth/logout
 * Logout user (client-side operation, server just confirms)
 */
router.post('/logout', (req, res) => {
  // Token is managed on client-side, server just confirms
  sendSuccess(res, null, 'Logout successful')
})

export default router
