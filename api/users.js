import express from 'express'
import { User } from '../models/User.js'
import { authMiddleware } from '../lib/middleware.js'

const router = express.Router()

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password')
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update user (protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { fullname, bio, phone, address, website, imgUrl } = req.body
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        fullname,
        bio,
        phone,
        address,
        website,
        imgUrl,
      },
      { new: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update last seen activity (protected)
router.put('/:id/last-seen', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { lastSeenActivity: new Date() },
      { new: true }
    ).select('-password')

    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get logged in user profile (protected)
router.get('/profile/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete user (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json({ message: 'User deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
