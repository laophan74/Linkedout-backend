/**
 * Upload Routes
 * Handle file uploads
 */

import express from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { authMiddleware } from '../middleware/auth.js'
import { sendSuccess, sendError } from '../utils/response.js'
import { logger } from '../utils/logger.js'
import config from '../config/environment.js'

const router = express.Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype?.startsWith('image/')) return cb(null, true)
    cb(new Error('Only image uploads are supported'))
  },
})

cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
})

function uploadBufferToCloudinary(file) {
  const base64 = file.buffer.toString('base64')
  const dataUri = `data:${file.mimetype};base64,${base64}`

  return cloudinary.uploader.upload(dataUri, {
    folder: 'linkedout/posts',
    resource_type: 'image',
  })
}

/**
 * POST /api/upload/image
 * Upload image (protected)
 */
router.post('/image', authMiddleware, upload.single('image'), async (req, res, next) => {
  try {
    if (
      !config.cloudinaryCloudName ||
      !config.cloudinaryApiKey ||
      !config.cloudinaryApiSecret
    ) {
      return sendError(res, 'Cloudinary is not configured', 500)
    }

    if (!req.file) {
      return sendError(res, 'Image file is required', 400)
    }

    const result = await uploadBufferToCloudinary(req.file)

    logger.info(`Image uploaded by user ${req.user._id}`)

    sendSuccess(
      res,
      {
        imageUrl: result.secure_url,
        publicId: result.public_id,
        fileName: req.file.originalname,
      },
      'Image uploaded successfully',
      201
    )
  } catch (error) {
    logger.error(`Upload image error: ${error.message}`)
    next(error)
  }
})

export default router
