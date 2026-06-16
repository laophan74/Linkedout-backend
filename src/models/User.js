import mongoose from 'mongoose'
import { hashPassword } from '../utils/auth.js'

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /.+\@.+\..+/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    additionalName: {
      type: String,
      default: '',
      trim: true,
      maxlength: 50,
    },
    pronouns: {
      type: String,
      default: '',
      trim: true,
      maxlength: 30,
    },
    headline: {
      type: String,
      default: '',
      trim: true,
      maxlength: 220,
    },
    profession: {
      type: String,
      default: '',
      trim: true,
      maxlength: 220,
    },
    bio: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
      maxlength: 40,
    },
    address: {
      type: String,
      default: '',
      trim: true,
      maxlength: 120,
    },
    website: {
      type: String,
      default: '',
      trim: true,
      maxlength: 150,
    },
    bg: {
      type: String,
      default: '',
      trim: true,
      maxlength: 280,
    },
    imgUrl: {
      type: String,
      default: '',
    },
    connections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    joinedDate: {
      type: Date,
      default: Date.now,
    },
    lastSeenActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }

  try {
    this.password = await hashPassword(this.password)
    next()
  } catch (error) {
    next(error)
  }
})

userSchema.index({ fullname: 'text', username: 'text', headline: 'text', profession: 'text', bio: 'text' })
userSchema.index({ createdAt: -1 })

userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

export const User = mongoose.model('User', userSchema)
