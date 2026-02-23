/**
 * Database Connection
 * Handles MongoDB connection with connection pooling
 */

import mongoose from 'mongoose'
import { config } from './environment.js'
import { logger } from '../utils/logger.js'

let mongoConnection = null

export async function connectDatabase() {
  if (mongoConnection) {
    logger.info('Using existing MongoDB connection')
    return mongoConnection
  }

  try {
    logger.info('Connecting to MongoDB...')
    
    const connection = await mongoose.connect(config.mongodbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      w: 'majority',
    })

    mongoConnection = connection
    logger.info('MongoDB connected successfully')
    
    // Handle disconnection
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected')
      mongoConnection = null
    })

    return connection
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`)
    throw error
  }
}

export async function disconnectDatabase() {
  try {
    if (mongoConnection) {
      await mongoose.disconnect()
      mongoConnection = null
      logger.info('MongoDB disconnected')
    }
  } catch (error) {
    logger.error(`MongoDB disconnection failed: ${error.message}`)
    throw error
  }
}

export function getConnection() {
  if (!mongoConnection) {
    throw new Error('Database connection not initialized. Call connectDatabase() first.')
  }
  return mongoConnection
}
