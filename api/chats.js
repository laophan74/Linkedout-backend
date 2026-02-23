import express from 'express'
import { Chat } from '../models/Chat.js'
import { Message } from '../models/Message.js'
import { authMiddleware } from '../lib/middleware.js'

const router = express.Router()

// Get all chats for logged in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const chats = await Chat.find({ users: req.user._id })
      .populate('users', '-password')
      .populate('lastMsgSender', '-password')
      .sort({ lastMsgTime: -1 })
    res.json(chats)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get chat by ID with messages
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('users', '-password')
      .populate('lastMsgSender', '-password')

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' })
    }

    const messages = await Message.find({ chatId: req.params.id })
      .populate('from', '-password')
      .populate('to', '-password')
      .sort({ createdAt: 1 })

    res.json({ chat, messages })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create or get chat (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { otherUserId } = req.body
    const userId = req.user._id

    let chat = await Chat.findOne({
      users: { $all: [userId, otherUserId] },
    })
      .populate('users', '-password')
      .populate('lastMsgSender', '-password')

    if (!chat) {
      chat = new Chat({
        users: [userId, otherUserId],
      })
      await chat.save()
      await chat.populate('users', '-password')
    }

    res.status(201).json(chat)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get messages for chat
router.get('/:chatId/messages', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId })
      .populate('from', '-password')
      .populate('to', '-password')
      .sort({ createdAt: 1 })

    res.json(messages)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Save message (protected)
router.post('/:chatId/messages', authMiddleware, async (req, res) => {
  try {
    const { to, txt } = req.body

    const message = new Message({
      chatId: req.params.chatId,
      from: req.user._id,
      to,
      txt,
    })

    await message.save()
    await message.populate('from', '-password')
    await message.populate('to', '-password')

    // Update chat's last message
    await Chat.findByIdAndUpdate(req.params.chatId, {
      lastMsg: txt,
      lastMsgTime: new Date(),
      lastMsgSender: req.user._id,
    })

    res.status(201).json(message)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
