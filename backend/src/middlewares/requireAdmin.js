import { ForbiddenError } from '../lib/errors.js';

export function requireAdmin(req, _res, next) {
  if (req.user?.role !== 'admin') throw new ForbiddenError('Admin access required');
  next();
}
