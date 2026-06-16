/**
 * Chat Routes
 */

import express from 'express'
import mongoose from 'mongoose'
import { Chat } from '../models/Chat.js'
import { Message } from '../models/Message.js'
import { Activity } from '../models/Activity.js'
import { authMiddleware } from '../middleware/auth.js'
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js'
import { logger } from '../utils/logger.js'
import { createActivity } from '../utils/activity.js'
import { validateChatCreate, validateMessageCreate, validateMessageUpdate } from '../validators/chatValidator.js'

const router = express.Router()

const isParticipant = (chat, userId) => {
  const normalizedUserId = userId?.toString()
  if (!normalizedUserId) return false

  return chat?.participants?.some((participant) => {
    const participantId = participant?._id || participant
    return participantId?.toString() === normalizedUserId
  })
}

/**
 * GET /api/chat
 * Get all chats for logged-in user (protected)
 */
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const includeMessages = req.query.includeMessages === 'true'
    const messageLimit = Math.min(50, Math.max(1, parseInt(req.query.messageLimit) || 20))

    const chats = await Chat.find({
      participants: req.user._id,
    })
      .populate('participants', 'username fullname imgUrl')
      .populate('lastMessage')
      .sort({ updatedAt: -1 })

    if (includeMessages) {
      await Chat.populate(chats, {
        path: 'messages',
        options: { sort: { createdAt: -1 }, perDocumentLimit: messageLimit },
        populate: { path: 'senderId recipientId', select: 'username fullname imgUrl' },
      })

      chats.forEach((chat) => {
        chat.messages = [...(chat.messages || [])].reverse()
      })
    }

    sendSuccess(res, chats)
  } catch (error) {
    logger.error(`Get chats error: ${error.message}`)
    next(error)
  }
})

/**
 * GET /api/chat/:id
 * Get chat with messages (protected)
 */
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 'Invalid chat ID', 400)
    }

    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'username fullname imgUrl')
      .populate({
        path: 'messages',
        populate: { path: 'senderId', select: 'username fullname imgUrl' },
      })

    if (!chat) {
      return sendError(res, 'Chat not found', 404)
    }

    if (!isParticipant(chat, req.user._id)) {
      return sendError(res, 'Not authorized to access this chat', 403)
    }

    sendSuccess(res, chat)
  } catch (error) {
    logger.error(`Get chat error: ${error.message}`)
    next(error)
  }
})

/**
 * POST /api/chat
 * Create or get chat (protected)
 */
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { recipientId } = req.body

    // Validate input
    const validation = validateChatCreate({ recipientId })
    if (!validation.isValid) {
      return sendError(res, 'Validation failed', 400, { errors: validation.errors })
    }

    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      return sendError(res, 'Invalid recipient ID', 400)
    }

    if (recipientId === req.user._id.toString()) {
      return sendError(res, 'Cannot create a chat with yourself', 400)
    }

    // Find existing chat
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, recipientId] },
    })

    if (!chat) {
      // Create new chat
      chat = new Chat({
        participants: [req.user._id, recipientId],
      })
      await chat.save()

      logger.info(`Chat created between ${req.user._id} and ${recipientId}`)
    }

    await chat.populate('participants', 'username fullname imgUrl')

    sendSuccess(res, chat, 'Chat retrieved or created', 201)
  } catch (error) {
    logger.error(`Create chat error: ${error.message}`)
    next(error)
  }
})

/**
 * POST /api/chat/:id/message
 * Send message (protected)
 */
router.post('/:id/message', authMiddleware, async (req, res, next) => {
  try {
    const { txt, recipientId } = req.body

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 'Invalid chat ID', 400)
    }

    // Validate input
    const validation = validateMessageCreate({ txt, recipientId })
    if (!validation.isValid) {
      return sendError(res, 'Validation failed', 400, { errors: validation.errors })
    }

    const chat = await Chat.findById(req.params.id)
    if (!chat) {
      return sendError(res, 'Chat not found', 404)
    }

    if (!isParticipant(chat, req.user._id)) {
      return sendError(res, 'Not authorized to send messages in this chat', 403)
    }

    if (!isParticipant(chat, recipientId)) {
      return sendError(res, 'Recipient is not a participant in this chat', 400)
    }

    const message = new Message({
      chatId: req.params.id,
      senderId: req.user._id,
      recipientId,
      txt: txt.trim(),
    })

    await message.save()

    // Update chat's last message
    await Chat.findByIdAndUpdate(req.params.id, {
      lastMessage: message._id,
      $addToSet: { messages: message._id },
    })

    await createActivity({
      type: 'message',
      createdBy: req.user._id,
      createdTo: recipientId,
      chatId: req.params.id,
    })

    logger.info(`Message sent in chat ${req.params.id}`)

    sendSuccess(res, message, 'Message sent', 201)
  } catch (error) {
    logger.error(`Send message error: ${error.message}`)
    next(error)
  }
})

/**
 * GET /api/chat/:id/messages
 * Get chat messages with pagination (protected)
 */
router.get('/:id/messages', authMiddleware, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 'Invalid chat ID', 400)
    }

    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, parseInt(req.query.limit) || 20)
    const skip = (page - 1) * limit

    const chat = await Chat.findById(req.params.id).select('participants')
    if (!chat) {
      return sendError(res, 'Chat not found', 404)
    }

    if (!isParticipant(chat, req.user._id)) {
      return sendError(res, 'Not authorized to access this chat', 403)
    }

    const messages = await Message.find({ chatId: req.params.id })
      .populate('senderId', 'username fullname imgUrl')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    const total = await Message.countDocuments({ chatId: req.params.id })

    // Reverse to show in correct chronological order
    sendPaginated(res, messages.reverse(), total, page, limit)
  } catch (error) {
    logger.error(`Get messages error: ${error.message}`)
    next(error)
  }
})

/**
 * PUT /api/chat/read-all
 * Mark all current user's received messages and message activities as read (protected)
 */
router.put('/read-all/messages', authMiddleware, async (req, res, next) => {
  try {
    await Message.updateMany(
      { recipientId: req.user._id, isRead: false },
      { isRead: true }
    )

    await Activity.updateMany(
      { createdTo: req.user._id, type: 'message', isRead: false },
      { isRead: true }
    )

    sendSuccess(res, null, 'Messages marked as read')
  } catch (error) {
    logger.error(`Mark messages read error: ${error.message}`)
    next(error)
  }
})

/**
 * PUT /api/chat/:id/message/:msgId
 * Edit message (protected)
 */
router.put('/:id/message/:msgId', authMiddleware, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id) || !mongoose.Types.ObjectId.isValid(req.params.msgId)) {
      return sendError(res, 'Invalid chat or message ID', 400)
    }

    const { txt } = req.body

    // Validate input
    const validation = validateMessageUpdate({ txt })
    if (!validation.isValid) {
      return sendError(res, 'Validation failed', 400, { errors: validation.errors })
    }

    const message = await Message.findById(req.params.msgId)

    if (!message) {
      return sendError(res, 'Message not found', 404)
    }

    // Verify message belongs to this chat
    if (message.chatId.toString() !== req.params.id) {
      return sendError(res, 'Message does not belong to this chat', 400)
    }

    const chat = await Chat.findById(req.params.id).select('participants')
    if (!isParticipant(chat, req.user._id)) {
      return sendError(res, 'Not authorized to access this chat', 403)
    }

    // Check authorization
    if (message.senderId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not authorized to update this message', 403)
    }

    message.txt = txt.trim()
    await message.save()

    logger.info(`Message updated: ${req.params.msgId}`)

    sendSuccess(res, message, 'Message updated successfully')
  } catch (error) {
    logger.error(`Update message error: ${error.message}`)
    next(error)
  }
})

/**
 * DELETE /api/chat/:id/message/:msgId
 * Delete message (protected)
 */
router.delete('/:id/message/:msgId', authMiddleware, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id) || !mongoose.Types.ObjectId.isValid(req.params.msgId)) {
      return sendError(res, 'Invalid chat or message ID', 400)
    }

    const message = await Message.findById(req.params.msgId)

    if (!message) {
      return sendError(res, 'Message not found', 404)
    }

    // Verify message belongs to this chat
    if (message.chatId.toString() !== req.params.id) {
      return sendError(res, 'Message does not belong to this chat', 400)
    }

    const chat = await Chat.findById(req.params.id).select('participants lastMessage')
    if (!isParticipant(chat, req.user._id)) {
      return sendError(res, 'Not authorized to access this chat', 403)
    }

    // Check authorization
    if (message.senderId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not authorized to delete this message', 403)
    }

    await Message.findByIdAndDelete(req.params.msgId)
    await Chat.findByIdAndUpdate(req.params.id, {
      $pull: { messages: req.params.msgId },
    })

    // If this was the last message, update chat
    if (chat?.lastMessage?.toString() === req.params.msgId) {
      const lastMessage = await Message.findOne({ chatId: req.params.id }).sort({ createdAt: -1 })
      await Chat.findByIdAndUpdate(req.params.id, {
        lastMessage: lastMessage?._id || null,
      })
    }

    logger.info(`Message deleted: ${req.params.msgId}`)

    sendSuccess(res, null, 'Message deleted successfully')
  } catch (error) {
    logger.error(`Delete message error: ${error.message}`)
    next(error)
  }
})

/**
 * DELETE /api/chat/:id
 * Delete entire chat (protected)
 */
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendError(res, 'Invalid chat ID', 400)
    }

    const chat = await Chat.findById(req.params.id)

    if (!chat) {
      return sendError(res, 'Chat not found', 404)
    }

    // Check authorization - user must be participant
    if (!isParticipant(chat, req.user._id)) {
      return sendError(res, 'Not authorized to delete this chat', 403)
    }

    // Delete all messages in this chat
    await Message.deleteMany({ chatId: req.params.id })

    // Delete the chat
    await Chat.findByIdAndDelete(req.params.id)

    logger.info(`Chat deleted: ${req.params.id}`)

    sendSuccess(res, null, 'Chat deleted successfully')
  } catch (error) {
    logger.error(`Delete chat error: ${error.message}`)
    next(error)
  }
})

export default router
