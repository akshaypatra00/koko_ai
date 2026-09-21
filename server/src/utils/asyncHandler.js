/**
 * Wraps async route handlers to catch uncaught rejections and pass to error middleware.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
