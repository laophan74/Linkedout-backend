/**
 * Post Routes
 */

import express from 'express'
import mongoose from 'mongoose'
import { Post } from '../models/Post.js'
import { authMiddleware } from '../middleware/auth.js'
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js'
import { logger } from '../utils/logger.js'
import { validatePostCreate, validatePostUpdate } from '../validators/postValidator.js'

const router = express.Router()

/**
 * GET /api/post
 * Get all posts with pagination
 */
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, parseInt(req.query.limit) || 10)
    const skip = (page - 1) * limit

    const posts = await Post.find()
      .populate('createdBy', 'username fullname imgUrl')
      .populate({
        path: 'comments',
        populate: { path: 'createdBy', select: 'username fullname imgUrl' },
      })
      .populate('likes', 'username fullname imgUrl')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    const total = await Post.countDocuments()

    sendPaginated(res, posts, total, page, limit)
  } catch (error) {
    logger.error(`Get posts error: ${error.message}`)
    next(error)
  }
})

/**
 * GET /api/post/:id
 * Get post by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 'Invalid post ID', 400)
    }

    const post = await Post.findById(req.params.id)
      .populate('createdBy', 'username fullname imgUrl')
      .populate({
        path: 'comments',
        populate: { path: 'createdBy', select: 'username fullname imgUrl' },
      })
      .populate('likes', 'username fullname imgUrl')

    if (!post) {
      return sendError(res, 'Post not found', 404)
    }

    sendSuccess(res, post)
  } catch (error) {
    logger.error(`Get post error: ${error.message}`)
    next(error)
  }
})

/**
 * POST /api/post
 * Create new post (protected)
 */
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { txt, imgUrl } = req.body

    // Validate input
    const validation = validatePostCreate({ txt, imgUrl })
    if (!validation.isValid) {
      return sendError(res, 'Validation failed', 400, { errors: validation.errors })
    }

    const post = new Post({
      createdBy: req.user._id,
      txt,
      imgUrl: imgUrl || '',
    })

    await post.save()
    await post.populate('createdBy', 'username fullname imgUrl')

    logger.info(`Post created by user ${req.user._id}`)

    sendSuccess(res, post, 'Post created successfully', 201)
  } catch (error) {
    logger.error(`Create post error: ${error.message}`)
    next(error)
  }
})

/**
 * PUT /api/post/:id
 * Update post (protected)
 */
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 'Invalid post ID', 400)
    }

    // Validate input
    const validation = validatePostUpdate(req.body)
    if (!validation.isValid) {
      return sendError(res, 'Validation failed', 400, { errors: validation.errors })
    }

    const post = await Post.findById(req.params.id)

    if (!post) {
      return sendError(res, 'Post not found', 404)
    }

    // Check authorization
    if (post.createdBy.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not authorized to update this post', 403)
    }

    const { txt, imgUrl } = req.body
    if (txt) post.txt = txt
    if (imgUrl !== undefined) post.imgUrl = imgUrl

    await post.save()

    logger.info(`Post updated: ${req.params.id}`)

    sendSuccess(res, post, 'Post updated successfully')
  } catch (error) {
    logger.error(`Update post error: ${error.message}`)
    next(error)
  }
})

/**
 * DELETE /api/post/:id
 * Delete post (protected)
 */
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 'Invalid post ID', 400)
    }

    const post = await Post.findById(req.params.id)

    if (!post) {
      return sendError(res, 'Post not found', 404)
    }

    // Check authorization
    if (post.createdBy.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not authorized to delete this post', 403)
    }

    await Post.findByIdAndDelete(req.params.id)

    logger.info(`Post deleted: ${req.params.id}`)

    sendSuccess(res, null, 'Post deleted successfully')
  } catch (error) {
    logger.error(`Delete post error: ${error.message}`)
    next(error)
  }
})

/**
 * PUT /api/post/:id/like
 * Like/Unlike post (protected)
 */
router.put('/:id/like', authMiddleware, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 'Invalid post ID', 400)
    }

    const post = await Post.findById(req.params.id)

    if (!post) {
      return sendError(res, 'Post not found', 404)
    }

    const userId = req.user._id
    const likeIndex = post.likes.findIndex((like) => like.toString() === userId.toString())

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1)
    } else {
      // Like
      post.likes.push(userId)
    }

    await post.save()

    sendSuccess(res, post, 'Post like updated')
  } catch (error) {
    logger.error(`Like post error: ${error.message}`)
    next(error)
  }
})

export default router
