import { z } from 'https://esm.sh/zod@3.24.2';
import { invalidRequest } from './errors.ts';

/**
 * Parse and validate a request body against a Zod schema.
 * Throws AppError with structured details on failure.
 */
export async function parseBody<T extends z.ZodType>(
  req: Request,
  schema: T,
): Promise<z.infer<T>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw invalidRequest('Request body must be valid JSON');
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    const issues = result.error.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
    }));
    throw invalidRequest('Validation failed', { issues });
  }

  return result.data;
}

/**
 * Extract idempotency key from request headers.
 * Returns null if not provided.
 */
export function getIdempotencyKey(req: Request): string | null {
  return req.headers.get('x-idempotency-key');
}
