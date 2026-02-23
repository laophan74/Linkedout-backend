import express from 'express'
import { User } from '../models/User.js'
import { generateToken, comparePassword } from '../lib/auth.js'

const router = express.Router()

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' })
    }

    const user = await User.findOne({ username })
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = generateToken(user._id, user.email)
    res.json({
      token,
      user: user.toJSON(),
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, fullname } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password required' })
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    })

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' })
    }

    const user = new User({
      username,
      email,
      password,
      fullname: fullname || username,
    })

    await user.save()

    const token = generateToken(user._id, user.email)
    res.status(201).json({
      token,
      user: user.toJSON(),
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Logout (client-side, just return success)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' })
})

export default router
