/**
 * Logger Utility
 * Centralized logging with different levels
 */

import { config } from '../config/environment.js'

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
}

const LEVEL_COLORS = {
  error: '\x1b[31m', // Red
  warn: '\x1b[33m', // Yellow
  info: '\x1b[36m', // Cyan
  debug: '\x1b[35m', // Magenta
  reset: '\x1b[0m',
}

const currentLogLevel = LOG_LEVELS[config.logLevel] || LOG_LEVELS.info

const formatTimestamp = () => new Date().toISOString()

const formatMessage = (level, message) => {
  const color = LEVEL_COLORS[level] || LEVEL_COLORS.reset
  return `${color}[${formatTimestamp()}] [${level.toUpperCase()}]${LEVEL_COLORS.reset} ${message}`
}

export const logger = {
  error: (message) => {
    if (LOG_LEVELS.error <= currentLogLevel) {
      console.error(formatMessage('error', message))
    }
  },
  
  warn: (message) => {
    if (LOG_LEVELS.warn <= currentLogLevel) {
      console.warn(formatMessage('warn', message))
    }
  },
  
  info: (message) => {
    if (LOG_LEVELS.info <= currentLogLevel) {
      console.log(formatMessage('info', message))
    }
  },
  
  debug: (message) => {
    if (LOG_LEVELS.debug <= currentLogLevel) {
      console.log(formatMessage('debug', message))
    }
  },
}
