/**
 * User Model
 * Represents a user in the system
 */

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
      select: false, // Don't return password by default
    },
    fullname: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
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

// Hash password before saving (only if modified)
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

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

export const User = mongoose.model('User', userSchema)
