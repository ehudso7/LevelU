import { supabase } from '../supabase';
import { trackEdgeFunctionFailed } from '../analytics';
import type { ApiError } from '../../types/api';

/**
 * Call a Supabase Edge Function with typed request/response.
 * Automatically attaches the current session JWT.
 */
export async function callFunction<TResponse, TBody = Record<string, unknown>>(
  functionName: string,
  body?: TBody,
  options?: { idempotencyKey?: string },
): Promise<TResponse> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new FunctionError('UNAUTHORIZED', 'No active session');
  }

  const headers: Record<string, string> = {};
  if (options?.idempotencyKey) {
    headers['x-idempotency-key'] = options.idempotencyKey;
  }

  const { data, error } = await supabase.functions.invoke(functionName, {
    body: body ?? {},
    headers,
  });

  if (error) {
    trackEdgeFunctionFailed({
      functionName,
      errorCode: 'INTERNAL_ERROR',
      errorMessage: error.message ?? 'Function call failed',
    });
    throw new FunctionError(
      'INTERNAL_ERROR',
      error.message ?? 'Function call failed',
    );
  }

  // Edge Functions return JSON — check for error shape
  if (data && typeof data === 'object' && 'error' in data) {
    const apiErr = data as ApiError;
    trackEdgeFunctionFailed({
      functionName,
      errorCode: apiErr.error.code,
      errorMessage: apiErr.error.message,
    });
    throw new FunctionError(
      apiErr.error.code,
      apiErr.error.message,
      apiErr.error.details,
    );
  }

  return data as TResponse;
}

/**
 * Typed error for function call failures.
 */
export class FunctionError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'FunctionError';
  }
}
