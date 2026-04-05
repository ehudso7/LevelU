import { corsHeaders } from './cors.ts';
import { AppError, ErrorCode } from './errors.ts';

/**
 * Build a successful JSON response.
 */
export function ok<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * Build an error JSON response from an AppError or unknown error.
 */
export function errorResponse(err: unknown): Response {
  if (err instanceof AppError) {
    return new Response(
      JSON.stringify({
        error: {
          code: err.code,
          message: err.message,
          ...(err.details ? { details: err.details } : {}),
        },
      }),
      {
        status: err.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }

  console.error('[LEVEL] Unhandled error:', err);
  return new Response(
    JSON.stringify({
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'An unexpected error occurred',
      },
    }),
    {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  );
}
