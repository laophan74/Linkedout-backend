/**
 * Comment Validators
 */

export const validateCommentCreate = (data) => {
  const errors = {}

  if (!data.postId) {
    errors.postId = 'Post ID is required'
  }

  if (!data.txt || data.txt.trim().length === 0) {
    errors.txt = 'Comment text is required'
  } else if (data.txt.length > 1000) {
    errors.txt = 'Comment must be less than 1000 characters'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export const validateCommentUpdate = (data) => {
  const errors = {}

  if (!data.txt || data.txt.trim().length === 0) {
    errors.txt = 'Comment text cannot be empty'
  } else if (data.txt.length > 1000) {
    errors.txt = 'Comment must be less than 1000 characters'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
