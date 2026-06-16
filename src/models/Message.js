/**
 * Message Model
 * Represents a message in a chat
 */

import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    txt: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

messageSchema.index({ chatId: 1, createdAt: -1 })
messageSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 })

export const Message = mongoose.model('Message', messageSchema)
