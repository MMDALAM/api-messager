/**
 * Standard HTTP status codes
 */
const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER: 500,
};

/**
 * Creates a standard success response object
 * @param {Object} data - Data to be sent in response
 * @param {string} message - Success message
 * @returns {Object} Formatted success response object
 */
const createSuccessResponse = (data = null, message = 'Success') => ({
  success: true,
  message,
  ...(data && { data }),
});

/**
 * Creates a standard error response object
 * @param {string} message - Error message
 * @param {Object} errors - Detailed error information
 * @returns {Object} Formatted error response object
 */
const createErrorResponse = (message = 'Error occurred', errors = null) => ({
  success: false,
  message,
  ...(errors && { errors }),
});

/**
 * Sends a success response
 * @param {Object} res - Express response object
 * @param {number} status - HTTP status code
 * @param {string} message - Success message
 * @param {Object} data - Optional data to send
 * @returns {Object} Express response
 */
const httpResSuccess = (res, status = HttpStatus.OK, message = 'Success', data = null) => {
  return res.status(status).json(createSuccessResponse(data, message));
};

/**
 * Sends an error response
 * @param {Object} res - Express response object
 * @param {number} status - HTTP status code
 * @param {string} message - Error message
 * @param {Object} errors - Optional detailed error information
 * @returns {Object} Express response
 */
const httpResError = (res, status = HttpStatus.INTERNAL_SERVER, message = 'Error occurred', errors = null) => {
  return res.status(status).json(createErrorResponse(message, errors));
};

module.exports = {
  HttpStatus,
  httpResSuccess,
  httpResError,
  // Helper functions for common responses
  ok: (res, data, message) => httpResSuccess(res, HttpStatus.OK, message, data),
  created: (res, data, message) => httpResSuccess(res, HttpStatus.CREATED, message, data),
  badRequest: (res, message, errors) => httpResError(res, HttpStatus.BAD_REQUEST, message, errors),
  unauthorized: (res, message = 'Unauthorized access', errors) => httpResError(res, HttpStatus.UNAUTHORIZED, message, errors),
  forbidden: (res, message = 'Forbidden access', errors) => httpResError(res, HttpStatus.FORBIDDEN, message, errors),
  notFound: (res, message = 'Resource not found', errors) => httpResError(res, HttpStatus.NOT_FOUND, message, errors),
};
