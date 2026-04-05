/**
 * Structured error codes for LEVEL Edge Functions.
 */
export const ErrorCode = {
  // Auth
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // Validation
  INVALID_REQUEST: 'INVALID_REQUEST',
  MISSING_FIELD: 'MISSING_FIELD',

  // State
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INVALID_STATE: 'INVALID_STATE',

  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  IDEMPOTENT_REPLAY: 'IDEMPOTENT_REPLAY',
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCodeType,
    message: string,
    public readonly status: number = 400,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function unauthorized(message = 'Authentication required'): AppError {
  return new AppError(ErrorCode.UNAUTHORIZED, message, 401);
}

export function forbidden(message = 'Access denied'): AppError {
  return new AppError(ErrorCode.FORBIDDEN, message, 403);
}

export function notFound(resource: string): AppError {
  return new AppError(ErrorCode.NOT_FOUND, `${resource} not found`, 404);
}

export function conflict(message: string): AppError {
  return new AppError(ErrorCode.CONFLICT, message, 409);
}

export function invalidState(message: string): AppError {
  return new AppError(ErrorCode.INVALID_STATE, message, 422);
}

export function invalidRequest(message: string, details?: Record<string, unknown>): AppError {
  return new AppError(ErrorCode.INVALID_REQUEST, message, 400, details);
}
