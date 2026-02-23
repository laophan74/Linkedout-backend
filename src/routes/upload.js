/**
 * Upload Routes
 * Handle file uploads
 */

import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { logger } from '../utils/logger.js'

const router = express.Router()

/**
 * POST /api/upload/image
 * Upload image (protected)
 * Accepts base64 data or file buffer
 */
router.post('/image', authMiddleware, async (req, res, next) => {
  try {
    const { imageData, fileName } = req.body

    if (!imageData) {
      return sendError(res, 'Image data is required', 400)
    }

    // For now, we'll generate a placeholder URL using DiceBear API or similar
    // In production, integrate with Cloudinary or another image service
    const imageUrl = `data:image/png;base64,${imageData.split(',')[1] || imageData}`

    logger.info(`Image uploaded by user ${req.user._id}`)

    sendSuccess(
      res,
      { imageUrl, fileName: fileName || 'image' },
      'Image uploaded successfully',
      201
    )
  } catch (error) {
    logger.error(`Upload image error: ${error.message}`)
    next(error)
  }
})

export default router
