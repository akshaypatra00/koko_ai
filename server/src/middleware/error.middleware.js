import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

/**
 * Centralized Error Handling Middleware
 */
export function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected internal server error occurred';
  let details = null;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err.status || err.statusCode) {
    statusCode = err.status || err.statusCode;
    message = err.message || message;
    if (statusCode === 400) code = 'BAD_REQUEST';
    else if (statusCode === 401) code = 'UNAUTHORIZED';
    else if (statusCode === 403) code = 'FORBIDDEN';
    else if (statusCode === 404) code = 'NOT_FOUND';
    else if (statusCode === 429) code = 'RATE_LIMITED';
  } else if (err.name === 'SyntaxError' && 'body' in err) {
    statusCode = 400;
    code = 'INVALID_JSON';
    message = 'Malformed JSON in request payload';
  }

  // Log error without leaking tokens or private user keys
  logger.error(`[${req.method} ${req.url}] ${statusCode} - ${code}: ${message}`, err);

  const response = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details && process.env.NODE_ENV === 'development') {
    response.error.details = details;
  }

  res.status(statusCode).json(response);
}
