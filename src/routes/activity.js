/**
 * Activity Routes
 */

import express from 'express'
import { Activity } from '../models/Activity.js'
import { authMiddleware } from '../middleware/auth.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { logger } from '../utils/logger.js'

const router = express.Router()

/**
 * GET /api/activity/count
 * Get unread activities count (protected)
 * ⚠️ MUST be before GET /:id to avoid route collision
 */
router.get('/count', authMiddleware, async (req, res, next) => {
  try {
    const count = await Activity.countDocuments({
      createdTo: req.user._id,
      isRead: false,
    })

    sendSuccess(res, { unreadCount: count })
  } catch (error) {
    logger.error(`Get activities count error: ${error.message}`)
    next(error)
  }
})

/**
 * GET /api/activity
 * Get activities for logged-in user (protected)
 */
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const activities = await Activity.find({ createdTo: req.user._id })
      .populate('createdBy', 'username fullname imgUrl')
      .sort({ createdAt: -1 })

    sendSuccess(res, activities)
  } catch (error) {
    logger.error(`Get activities error: ${error.message}`)
    next(error)
  }
})

/**
 * POST /api/activity
 * Create activity (protected)
 */
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { type, createdTo, postId, chatId } = req.body

    const activity = new Activity({
      type,
      createdBy: req.user._id,
      createdTo,
      postId,
      chatId,
    })

    await activity.save()
    await activity.populate('createdBy', 'username fullname imgUrl')

    logger.info(`Activity created: ${type}`)

    sendSuccess(res, activity, 'Activity created', 201)
  } catch (error) {
    logger.error(`Create activity error: ${error.message}`)
    next(error)
  }
})

/**
 * PUT /api/activity/read-all
 * Mark all activities as read (protected)
 * ⚠️ MUST be before PUT /:id to avoid route collision
 */
router.put('/read-all', authMiddleware, async (req, res, next) => {
  try {
    await Activity.updateMany(
      { createdTo: req.user._id, isRead: false },
      { isRead: true }
    )

    sendSuccess(res, null, 'All activities marked as read')
  } catch (error) {
    logger.error(`Mark all activities as read error: ${error.message}`)
    next(error)
  }
})

/**
 * PUT /api/activity/:id/read
 * Mark activity as read (protected)
 */
router.put('/:id/read', authMiddleware, async (req, res, next) => {
  try {
    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    ).populate('createdBy', 'username fullname imgUrl')

    if (!activity) {
      return sendError(res, 'Activity not found', 404)
    }

    sendSuccess(res, activity, 'Activity marked as read')
  } catch (error) {
    logger.error(`Mark activity as read error: ${error.message}`)
    next(error)
  }
})

export default router
