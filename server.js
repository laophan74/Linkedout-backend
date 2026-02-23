import 'dotenv/config'
import express from 'express'
import { connectDB } from './lib/db.js'
import { corsMiddleware } from './lib/middleware.js'

import authRoutes from './api/auth.js'
import usersRoutes from './api/users.js'
import postsRoutes from './api/posts.js'
import commentsRoutes from './api/comments.js'
import chatsRoutes from './api/chats.js'
import activitiesRoutes from './api/activities.js'

const app = express()
const PORT = process.env.PORT || 3030

// Middleware
app.use(corsMiddleware)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/user', usersRoutes)
app.use('/api/post', postsRoutes)
app.use('/api/comment', commentsRoutes)
app.use('/api/chat', chatsRoutes)
app.use('/api/activity', activitiesRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Linkedout Backend is running' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

// Start server
async function start() {
  try {
    await connectDB()
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`)
      console.log(`📝 API: http://localhost:${PORT}/api`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()
