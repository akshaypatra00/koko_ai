import { ZodError } from 'zod';

/**
 * Zod validation middleware generator.
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body' | 'query' | 'params'} source - Property on req to validate
 */
export function validate(schema, source = 'body') {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const firstIssue = err.issues[0];
        const errorMessage = firstIssue
          ? `${firstIssue.path.join('.') || 'input'}: ${firstIssue.message}`
          : 'Validation failed';

        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: errorMessage,
            details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
          },
        });
      }
      next(err);
    }
  };
}
