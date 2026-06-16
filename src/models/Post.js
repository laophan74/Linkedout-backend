/**
 * Post Model
 * Represents a user post/status update
 */

import mongoose from 'mongoose'

const postSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    txt: {
      type: String,
      default: '',
    },
    imgUrl: {
      type: String,
      default: '',
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    shares: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

postSchema.index({ createdAt: -1 })
postSchema.index({ createdBy: 1, createdAt: -1 })
postSchema.index({ txt: 'text' })

export const Post = mongoose.model('Post', postSchema)
