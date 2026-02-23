import express from 'express'
import { Post } from '../models/Post.js'
import { authMiddleware } from '../lib/middleware.js'

const router = express.Router()

// Get all posts with user info
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('createdBy', '-password')
      .populate('comments')
      .populate('likes', '-password')
      .sort({ createdAt: -1 })
    res.json(posts)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('createdBy', '-password')
      .populate('comments')
      .populate('likes', '-password')

    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }
    res.json(post)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create post (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { txt, imgUrl } = req.body

    const post = new Post({
      createdBy: req.user._id,
      txt,
      imgUrl: imgUrl || '',
    })

    await post.save()
    await post.populate('createdBy', '-password')

    res.status(201).json(post)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update post (protected)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { txt, imgUrl } = req.body
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { txt, imgUrl },
      { new: true }
    ).populate('createdBy', '-password')

    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }
    res.json(post)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete post (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id)
    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }
    res.json({ message: 'Post deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Like post (protected)
router.put('/:id/like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    const userId = req.user._id.toString()
    const hasLiked = post.likes.some(like => like.toString() === userId)

    if (hasLiked) {
      post.likes = post.likes.filter(like => like.toString() !== userId)
    } else {
      post.likes.push(req.user._id)
    }

    await post.save()
    await post.populate('createdBy', '-password')

    res.json(post)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
