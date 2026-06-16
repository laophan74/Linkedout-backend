/**
 * Activity Model
 * Represents user activities and notifications
 */

import mongoose from 'mongoose'

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['like', 'comment', 'connection', 'message'],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
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

activitySchema.index({ createdTo: 1, isRead: 1, createdAt: -1 })
activitySchema.index({ createdBy: 1, createdAt: -1 })

export const Activity = mongoose.model('Activity', activitySchema)
