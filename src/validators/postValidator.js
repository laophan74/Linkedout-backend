/**
 * Post Validators
 */

export const validatePostCreate = (data) => {
  const errors = {}

  if (!data.txt || data.txt.trim().length === 0) {
    errors.txt = 'Post content is required'
  } else if (data.txt.length > 5000) {
    errors.txt = 'Post content must be less than 5000 characters'
  }

  if (data.imgUrl && data.imgUrl && !isValidUrl(data.imgUrl)) {
    errors.imgUrl = 'Invalid image URL'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export const validatePostUpdate = (data) => {
  const errors = {}

  if (data.txt !== undefined) {
    if (data.txt.trim().length === 0) {
      errors.txt = 'Post content cannot be empty'
    } else if (data.txt.length > 5000) {
      errors.txt = 'Post content must be less than 5000 characters'
    }
  }

  if (data.imgUrl && !isValidUrl(data.imgUrl)) {
    errors.imgUrl = 'Invalid image URL'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

const isValidUrl = (string) => {
  try {
    new URL(string)
    return true
  } catch (err) {
    return false
  }
}
