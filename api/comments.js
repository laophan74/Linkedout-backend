import express from 'express'
import { Comment } from '../models/Comment.js'
import { Post } from '../models/Post.js'
import { authMiddleware } from '../lib/middleware.js'

const router = express.Router()

// Get all comments
router.get('/', async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate('createdBy', '-password')
      .populate('likes', '-password')
      .sort({ createdAt: -1 })
    res.json(comments)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get comment by ID
router.get('/:id', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate('createdBy', '-password')
      .populate('likes', '-password')

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' })
    }
    res.json(comment)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create comment (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { postId, txt } = req.body

    const comment = new Comment({
      postId,
      createdBy: req.user._id,
      txt,
    })

    await comment.save()
    await comment.populate('createdBy', '-password')

    // Add comment to post
    await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment._id },
    })

    res.status(201).json(comment)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update comment (protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { txt } = req.body
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { txt },
      { new: true }
    ).populate('createdBy', '-password')

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' })
    }
    res.json(comment)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete comment (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id)
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' })
    }

    // Remove comment from post
    await Post.findByIdAndUpdate(comment.postId, {
      $pull: { comments: comment._id },
    })

    res.json({ message: 'Comment deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Like comment (protected)
router.put('/:id/like', authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' })
    }

    const userId = req.user._id.toString()
    const hasLiked = comment.likes.some(like => like.toString() === userId)

    if (hasLiked) {
      comment.likes = comment.likes.filter(like => like.toString() !== userId)
    } else {
      comment.likes.push(req.user._id)
    }

    await comment.save()
    await comment.populate('createdBy', '-password')

    res.json(comment)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
