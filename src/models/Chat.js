/**
 * Chat Model
 * Represents a chat/conversation between users
 */

import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
  },
  {
    timestamps: true,
  }
)

chatSchema.index({ participants: 1, updatedAt: -1 })

export const Chat = mongoose.model('Chat', chatSchema)
