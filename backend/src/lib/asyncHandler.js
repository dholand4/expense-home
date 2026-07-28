/**
 * Wraps an async route handler so thrown errors are forwarded to next().
 * Needed because Express 4 does not catch promise rejections automatically.
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
