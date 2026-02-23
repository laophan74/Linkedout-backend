import express from 'express'
import { Activity } from '../models/Activity.js'
import { authMiddleware } from '../lib/middleware.js'

const router = express.Router()

// Get activities for logged in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const activities = await Activity.find({ targetUser: req.user._id })
      .populate('actor', '-password')
      .populate('targetUser', '-password')
      .sort({ createdAt: -1 })
    res.json(activities)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get activities count
router.get('/count', authMiddleware, async (req, res) => {
  try {
    const count = await Activity.countDocuments({
      targetUser: req.user._id,
      isRead: false,
    })
    res.json({ count })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create activity (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type, targetUser, targetId, targetType } = req.body

    const activity = new Activity({
      type,
      actor: req.user._id,
      targetUser,
      targetId: targetId || '',
      targetType: targetType || '',
    })

    await activity.save()
    await activity.populate('actor', '-password')
    await activity.populate('targetUser', '-password')

    res.status(201).json(activity)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Mark activity as read (protected)
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    )
      .populate('actor', '-password')
      .populate('targetUser', '-password')

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' })
    }
    res.json(activity)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Mark all activities as read (protected)
router.put('/all/read', authMiddleware, async (req, res) => {
  try {
    await Activity.updateMany(
      { targetUser: req.user._id, isRead: false },
      { isRead: true }
    )
    res.json({ message: 'All activities marked as read' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
