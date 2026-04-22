export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

export const validatePassword = (password) => {
  return password && password.length >= 6
}

export const validateSignup = (data) => {
  const errors = {}

  if (!data.username) {
    errors.username = 'Username is required'
  } else if (!validateUsername(data.username)) {
    errors.username = 'Username must be 3-20 characters (alphanumeric + underscore)'
  }

  if (!data.email) {
    errors.email = 'Email is required'
  } else if (!validateEmail(data.email)) {
    errors.email = 'Invalid email format'
  }

  if (!data.password) {
    errors.password = 'Password is required'
  } else if (!validatePassword(data.password)) {
    errors.password = 'Password must be at least 6 characters'
  }

  if (!data.fullname) {
    errors.fullname = 'Full name is required'
  } else if (data.fullname.trim().length === 0) {
    errors.fullname = 'Full name cannot be empty'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export const validateLogin = (data) => {
  const errors = {}

  if (!data.username) {
    errors.username = 'Username is required'
  }

  if (!data.password) {
    errors.password = 'Password is required'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export const validateUserUpdate = (data) => {
  const errors = {}

  if (data.fullname !== undefined && data.fullname.trim().length === 0) {
    errors.fullname = 'Full name cannot be empty'
  }

  if (data.additionalName !== undefined && data.additionalName.length > 50) {
    errors.additionalName = 'Additional name must be less than 50 characters'
  }

  if (data.pronouns !== undefined && data.pronouns.length > 30) {
    errors.pronouns = 'Pronouns must be less than 30 characters'
  }

  if (data.headline !== undefined && data.headline.length > 220) {
    errors.headline = 'Headline must be less than 220 characters'
  }

  if (data.profession !== undefined && data.profession.length > 220) {
    errors.profession = 'Profession must be less than 220 characters'
  }

  if (data.bio !== undefined && data.bio && data.bio.length > 500) {
    errors.bio = 'Bio must be less than 500 characters'
  }

  if (data.address !== undefined && data.address.length > 120) {
    errors.address = 'Location must be less than 120 characters'
  }

  if (data.phone !== undefined && data.phone.length > 40) {
    errors.phone = 'Phone must be less than 40 characters'
  }

  if (data.bg !== undefined && data.bg.length > 280) {
    errors.bg = 'Background image URL must be less than 280 characters'
  }

  if (data.website !== undefined && data.website && !isValidUrl(data.website)) {
    errors.website = 'Invalid website URL'
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
