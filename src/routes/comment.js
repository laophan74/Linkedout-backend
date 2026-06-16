/**
 * Comment Routes
 */

import express from 'express'
import mongoose from 'mongoose'
import { Comment } from '../models/Comment.js'
import { Post } from '../models/Post.js'
import { authMiddleware } from '../middleware/auth.js'
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js'
import { logger } from '../utils/logger.js'
import { createActivity } from '../utils/activity.js'
import { validateCommentCreate, validateCommentUpdate } from '../validators/commentValidator.js'

const router = express.Router()

/**
 * GET /api/comment
 * Get all comments with pagination
 */
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, parseInt(req.query.limit) || 10)
    const skip = (page - 1) * limit

    const comments = await Comment.find()
      .populate('createdBy', 'username fullname imgUrl')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    const total = await Comment.countDocuments()

    sendPaginated(res, comments, total, page, limit)
  } catch (error) {
    logger.error(`Get comments error: ${error.message}`)
    next(error)
  }
})

/**
 * GET /api/comment/post/:postId
 * Get comments for a specific post
 */
router.get('/post/:postId', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.postId)) {
      return sendError(res, 'Invalid post ID', 400)
    }

    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, parseInt(req.query.limit) || 10)
    const skip = (page - 1) * limit

    const comments = await Comment.find({ postId: req.params.postId })
      .populate('createdBy', 'username fullname imgUrl')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    const total = await Comment.countDocuments({ postId: req.params.postId })

    sendPaginated(res, comments, total, page, limit)
  } catch (error) {
    logger.error(`Get post comments error: ${error.message}`)
    next(error)
  }
})

/**
 * GET /api/comment/:id
 * Get comment by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 'Invalid comment ID', 400)
    }

    const comment = await Comment.findById(req.params.id)
      .populate('createdBy', 'username fullname imgUrl')

    if (!comment) {
      return sendError(res, 'Comment not found', 404)
    }

    sendSuccess(res, comment)
  } catch (error) {
    logger.error(`Get comment error: ${error.message}`)
    next(error)
  }
})

/**
 * POST /api/comment
 * Create comment (protected)
 */
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { postId, txt } = req.body

    // Validate input
    const validation = validateCommentCreate({ postId, txt })
    if (!validation.isValid) {
      return sendError(res, 'Validation failed', 400, { errors: validation.errors })
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return sendError(res, 'Invalid post ID', 400)
    }

    const comment = new Comment({
      postId,
      createdBy: req.user._id,
      txt,
    })

    await comment.save()
    await comment.populate('createdBy', 'username fullname imgUrl')

    const post = await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment._id },
    })

    await createActivity({
      type: 'comment',
      createdBy: req.user._id,
      createdTo: post?.createdBy,
      postId,
    })

    logger.info(`Comment created on post ${postId}`)

    sendSuccess(res, comment, 'Comment created', 201)
  } catch (error) {
    logger.error(`Create comment error: ${error.message}`)
    next(error)
  }
})

/**
 * PUT /api/comment/:id
 * Edit comment (protected)
 */
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 'Invalid comment ID', 400)
    }

    const { txt, replies } = req.body

    const comment = await Comment.findById(req.params.id)

    if (!comment) {
      return sendError(res, 'Comment not found', 404)
    }

    // Check authorization for text updates
    if (txt && comment.createdBy.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not authorized to update this comment', 403)
    }

    if (txt) {
      // Validate input
      const validation = validateCommentUpdate({ txt })
      if (!validation.isValid) {
        return sendError(res, 'Validation failed', 400, { errors: validation.errors })
      }
      comment.txt = txt
    }

    if (replies) {
      comment.replies = replies
    }

    await comment.save()
    await comment.populate('createdBy', 'username fullname imgUrl')

    logger.info(`Comment updated: ${req.params.id}`)

    sendSuccess(res, comment, 'Comment updated successfully')
  } catch (error) {
    logger.error(`Update comment error: ${error.message}`)
    next(error)
  }
})

/**
 * PUT /api/comment/:id/like
 * Like/Unlike comment (protected)
 */
router.put('/:id/like', authMiddleware, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 'Invalid comment ID', 400)
    }

    const comment = await Comment.findById(req.params.id)

    if (!comment) {
      return sendError(res, 'Comment not found', 404)
    }

    const userId = req.user._id
    const likeIndex = comment.likes.findIndex((like) => like.toString() === userId.toString())

    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1)
    } else {
      comment.likes.push(userId)
    }

    await comment.save()

    sendSuccess(res, comment, 'Comment like updated')
  } catch (error) {
    logger.error(`Like comment error: ${error.message}`)
    next(error)
  }
})

/**
 * DELETE /api/comment/:id
 * Delete comment (protected)
 */
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 'Invalid comment ID', 400)
    }

    const comment = await Comment.findById(req.params.id)

    if (!comment) {
      return sendError(res, 'Comment not found', 404)
    }

    if (comment.createdBy.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not authorized to delete this comment', 403)
    }

    await Comment.findByIdAndDelete(req.params.id)

    // Remove comment from post
    await Post.findByIdAndUpdate(comment.postId, {
      $pull: { comments: req.params.id },
    })

    logger.info(`Comment deleted: ${req.params.id}`)

    sendSuccess(res, null, 'Comment deleted')
  } catch (error) {
    logger.error(`Delete comment error: ${error.message}`)
    next(error)
  }
})

export default router
