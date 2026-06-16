/**
 * Main Server
 * Entry point for the application
 */

import express from 'express'
import { config } from './config/environment.js'
import { connectDatabase } from './config/database.js'
import { corsMiddleware } from './middleware/cors.js'
import { requestLogger } from './middleware/requestLogger.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { logger } from './utils/logger.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'
import postRoutes from './routes/post.js'
import commentRoutes from './routes/comment.js'
import chatRoutes from './routes/chat.js'
import activityRoutes from './routes/activity.js'
import uploadRoutes from './routes/upload.js'

const app = express()

/**
 * Middleware - Body Parser & CORS
 */
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(corsMiddleware)
app.use(requestLogger)

app.use('/api', async (req, res, next) => {
  try {
    await connectDatabase()
    next()
  } catch (error) {
    next(error)
  }
})

/**
 * Health Check Endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Linkedout Backend is running',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  })
})

/**
 * Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/post', postRoutes)
app.use('/api/comment', commentRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/activity', activityRoutes)
app.use('/api/upload', uploadRoutes)

/**
 * Error Handling
 */
app.use(notFoundHandler)
app.use(errorHandler)

/**
 * Server Initialization
 */
async function startServer() {
  try {
    // Connect to database
    await connectDatabase()

    // Start server
    app.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`)
      logger.info(`📝 Environment: ${config.nodeEnv}`)
    })
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server')
  process.exit(0)
})

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server')
  process.exit(0)
})

if (process.env.VERCEL !== '1') {
  startServer()
}

export default app
