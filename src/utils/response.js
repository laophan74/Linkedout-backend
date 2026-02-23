/**
 * Response Formatter
 * Standardized API response format
 */

export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

export const sendError = (res, message = 'Error', statusCode = 400, error = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' && error ? error.message : undefined,
  })
}

export const sendPaginated = (res, items, total, page = 1, limit = 10, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data: items,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  })
}
