import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMsg: {
      type: String,
      default: '',
    },
    lastMsgTime: {
      type: Date,
      default: Date.now,
    },
    lastMsgSender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

export const Chat = mongoose.model('Chat', chatSchema)
