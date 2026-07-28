import { ZodError } from 'zod';
import { BadRequestError } from '../lib/errors.js';

/**
 * Returns an Express middleware that validates req.body against a Zod schema.
 * On success, replaces req.body with the parsed (coerced) value.
 */
export function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      return next(new BadRequestError(message));
    }
    req.body = result.data;
    next();
  };
}
