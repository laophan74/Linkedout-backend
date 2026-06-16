import express from 'express'
import mongoose from 'mongoose'
import { User } from '../models/User.js'
import { authMiddleware } from '../middleware/auth.js'
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js'
import { logger } from '../utils/logger.js'
import { createActivity } from '../utils/activity.js'
import { validateUserUpdate } from '../validators/userValidator.js'

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, parseInt(req.query.limit) || 10)
    const skip = (page - 1) * limit

    const users = await User.find()
      .select('-password')
      .populate('connections', 'fullname imgUrl headline profession bio')
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

router.get('/profile/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('connections', 'fullname imgUrl headline profession bio')

    if (!user) {
      return sendError(res, 'User not found', 404)
    }

    sendSuccess(res, user)
  } catch (error) {
    logger.error(`Get profile error: ${error.message}`)
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 'Invalid user ID', 400)
    }

    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('connections', 'fullname imgUrl headline profession bio')

    if (!user) {
      return sendError(res, 'User not found', 404)
    }

    sendSuccess(res, user)
  } catch (error) {
    logger.error(`Get user error: ${error.message}`)
    next(error)
  }
})

router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return sendError(res, 'Not authorized to update this profile', 403)
    }

    const validation = validateUserUpdate(req.body)
    if (!validation.isValid) {
      return sendError(res, 'Validation failed', 400, { errors: validation.errors })
    }

    const updates = { ...req.body }
    delete updates.password
    delete updates.email
    delete updates.connections
    delete updates.username

    if (typeof updates.headline === 'string' && !updates.profession) {
      updates.profession = updates.headline
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .select('-password')
      .populate('connections', 'fullname imgUrl headline profession bio')

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

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
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

router.get('/:id/connections', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 'Invalid user ID', 400)
    }

    const user = await User.findById(req.params.id)
      .select('connections')
      .populate('connections', 'username fullname imgUrl headline profession bio')

    if (!user) {
      return sendError(res, 'User not found', 404)
    }

    sendSuccess(res, user.connections)
  } catch (error) {
    logger.error(`Get connections error: ${error.message}`)
    next(error)
  }
})

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

    if (user.connections.includes(targetId)) {
      return sendError(res, 'Already connected with this user', 400)
    }

    user.connections.push(targetId)
    await user.save()
    await createActivity({
      type: 'connection',
      createdBy: userId,
      createdTo: targetId,
    })

    logger.info(`User ${userId} connected with ${targetId}`)

    sendSuccess(res, user.connections, 'Connection added successfully', 201)
  } catch (error) {
    logger.error(`Add connection error: ${error.message}`)
    next(error)
  }
})

router.delete('/:id/disconnect', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user._id
    const targetId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return sendError(res, 'Invalid target user ID', 400)
    }

    const user = await User.findById(userId)

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
