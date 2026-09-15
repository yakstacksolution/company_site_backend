import { ZodError } from 'zod';

/**
 * Validates `req[source]` against a zod schema and replaces it with the parsed
 * result, so controllers receive coerced, whitelisted data. Unknown keys are
 * stripped, which keeps clients from writing fields they shouldn't own.
 */
export const validate = (schema, source = 'body') => (req, res, next) => {
  try {
    req[source] = schema.parse(req[source]);
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.issues.map((issue) => ({
        field: issue.path.join('.') || source,
        message: issue.message
      }));
      return res.status(422).json({ success: false, message: 'Validation failed', errors });
    }
    return next(error);
  }
};
