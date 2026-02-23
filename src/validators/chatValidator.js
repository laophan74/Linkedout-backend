/**
 * Chat & Message Validators
 */

export const validateMessageCreate = (data) => {
  const errors = {}

  if (!data.txt || data.txt.trim().length === 0) {
    errors.txt = 'Message text is required'
  } else if (data.txt.length > 2000) {
    errors.txt = 'Message must be less than 2000 characters'
  }

  if (!data.recipientId) {
    errors.recipientId = 'Recipient ID is required'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export const validateMessageUpdate = (data) => {
  const errors = {}

  if (!data.txt || data.txt.trim().length === 0) {
    errors.txt = 'Message text cannot be empty'
  } else if (data.txt.length > 2000) {
    errors.txt = 'Message must be less than 2000 characters'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export const validateChatCreate = (data) => {
  const errors = {}

  if (!data.recipientId) {
    errors.recipientId = 'Recipient ID is required'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
