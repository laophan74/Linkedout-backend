/**
 * Post Validators
 */

export const validatePostCreate = (data) => {
  const errors = {}
  const txt = typeof data.txt === 'string' ? data.txt.trim() : ''
  const imgUrl = typeof data.imgUrl === 'string' ? data.imgUrl.trim() : ''

  if (!txt && !imgUrl) {
    errors.txt = 'Post content or image is required'
  } else if (txt.length > 5000) {
    errors.txt = 'Post content must be less than 5000 characters'
  }

  if (imgUrl && !isValidUrl(imgUrl)) {
    errors.imgUrl = 'Invalid image URL'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export const validatePostUpdate = (data) => {
  const errors = {}
  const txt = typeof data.txt === 'string' ? data.txt.trim() : data.txt
  const imgUrl = typeof data.imgUrl === 'string' ? data.imgUrl.trim() : data.imgUrl

  if (data.txt !== undefined) {
    if (typeof txt !== 'string') {
      errors.txt = 'Post content must be text'
    } else if (txt.length > 5000) {
      errors.txt = 'Post content must be less than 5000 characters'
    }
  }

  if (imgUrl && !isValidUrl(imgUrl)) {
    errors.imgUrl = 'Invalid image URL'
  }

  if (data.txt !== undefined || data.imgUrl !== undefined) {
    const hasTxt = typeof txt === 'string' && txt.length > 0
    const hasImg = typeof imgUrl === 'string' && imgUrl.length > 0
    if (!hasTxt && !hasImg) {
      errors.txt = 'Post content or image is required'
    }
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
