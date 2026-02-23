/**
 * User Routes
 */

import express from 'express'
import mongoose from 'mongoose'
import { User } from '../models/User.js'
import { authMiddleware } from '../middleware/auth.js'
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js'
import { logger } from '../utils/logger.js'
import { validateUserUpdate } from '../validators/userValidator.js'

const router = express.Router()

/**
 * GET /api/user
 * Get all users with pagination
 */
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, parseInt(req.query.limit) || 10)
    const skip = (page - 1) * limit

    const users = await User.find()
      .select('-password')
      .populate('connections', 'fullname imgUrl')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    const total = await User.countDocuments()

    sendPaginated(res, users, total, page, limit)
  } catch (error) {
    logger.error(`Get users error: ${error.message}`)
    next(error)
  }
})

/**
 * GET /api/user/:id
 * Get user by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 'Invalid user ID', 400)
    }

    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('connections', 'fullname imgUrl')

    if (!user) {
      return sendError(res, 'User not found', 404)
    }

    sendSuccess(res, user)
  } catch (error) {
    logger.error(`Get user error: ${error.message}`)
    next(error)
  }
})

/**
 * GET /api/user/profile/me
 * Get logged-in user profile (protected)
 * ⚠️ MUST be before GET /:id to avoid route collision
 */
router.get('/profile/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('connections', 'fullname imgUrl')

    if (!user) {
      return sendError(res, 'User not found', 404)
    }

    sendSuccess(res, user)
  } catch (error) {
    logger.error(`Get profile error: ${error.message}`)
    next(error)
  }
})

/**
 * PUT /api/user/:id
 * Update user (protected)
 * Only allow users to update their own profile
 */
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    // Check authorization
    if (req.user._id.toString() !== req.params.id) {
      return sendError(res, 'Not authorized to update this profile', 403)
    }

    // Validate input
    const validation = validateUserUpdate(req.body)
    if (!validation.isValid) {
      return sendError(res, 'Validation failed', 400, { errors: validation.errors })
    }

    const updates = { ...req.body }
    // Prevent password/email updates through this endpoint
    delete updates.password
    delete updates.email

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password')

    if (!user) {
      return sendError(res, 'User not found', 404)
    }

    logger.info(`User updated: ${user.username}`)

    sendSuccess(res, user, 'User updated successfully')
  } catch (error) {
    logger.error(`Update user error: ${error.message}`)
    next(error)
  }
})

/**
 * DELETE /api/user/:id
 * Delete user (protected)
 */
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    // Check authorization
    if (req.user._id.toString() !== req.params.id) {
      return sendError(res, 'Not authorized to delete this profile', 403)
    }

    const user = await User.findByIdAndDelete(req.params.id)

    if (!user) {
      return sendError(res, 'User not found', 404)
    }

    logger.info(`User deleted: ${user.username}`)

    sendSuccess(res, null, 'User deleted successfully')
  } catch (error) {
    logger.error(`Delete user error: ${error.message}`)
    next(error)
  }
})

/**
 * GET /api/user/:id/connections
 * Get user's connections
 */
router.get('/:id/connections', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 'Invalid user ID', 400)
    }

    const user = await User.findById(req.params.id)
      .select('connections')
      .populate('connections', 'username fullname imgUrl bio')

    if (!user) {
      return sendError(res, 'User not found', 404)
    }

    sendSuccess(res, user.connections)
  } catch (error) {
    logger.error(`Get connections error: ${error.message}`)
    next(error)
  }
})

/**
 * POST /api/user/:id/connect
 * Add a connection (protected)
 */
router.post('/:id/connect', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user._id
    const targetId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return sendError(res, 'Invalid target user ID', 400)
    }

    if (userId.toString() === targetId) {
      return sendError(res, 'Cannot connect with yourself', 400)
    }

    const user = await User.findById(userId)
    const targetUser = await User.findById(targetId)

    if (!targetUser) {
      return sendError(res, 'Target user not found', 404)
    }

    // Check if already connected
    if (user.connections.includes(targetId)) {
      return sendError(res, 'Already connected with this user', 400)
    }

    // Add connection
    user.connections.push(targetId)
    await user.save()

    logger.info(`User ${userId} connected with ${targetId}`)

    sendSuccess(res, user.connections, 'Connection added successfully', 201)
  } catch (error) {
    logger.error(`Add connection error: ${error.message}`)
    next(error)
  }
})

/**
 * DELETE /api/user/:id/disconnect
 * Remove a connection (protected)
 */
router.delete('/:id/disconnect', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user._id
    const targetId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return sendError(res, 'Invalid target user ID', 400)
    }

    const user = await User.findById(userId)

    // Remove connection
    user.connections = user.connections.filter(
      (connId) => connId.toString() !== targetId
    )
    await user.save()

    logger.info(`User ${userId} disconnected from ${targetId}`)

    sendSuccess(res, user.connections, 'Connection removed successfully')
  } catch (error) {
    logger.error(`Remove connection error: ${error.message}`)
    next(error)
  }
})

export default router
