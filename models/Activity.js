import mongoose from 'mongoose'

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['like', 'comment', 'connection-request', 'message'],
      required: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetId: {
      type: String,
      default: '',
    },
    targetType: {
      type: String,
      enum: ['post', 'comment', 'chat'],
      default: '',
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

export const Activity = mongoose.model('Activity', activitySchema)
