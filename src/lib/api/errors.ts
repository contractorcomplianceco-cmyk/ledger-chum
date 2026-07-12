/**
 * Normalized error classes. The Express adapter maps HTTP responses to
 * these; the mock adapter throws them directly. UI code should catch
 * ApiError and inspect .kind — never inspect raw fetch responses.
 */

export type ApiErrorKind =
  | "unauthorized" // 401
  | "forbidden" // 403
  | "not_found" // 404
  | "conflict" // 409
  | "validation" // 422
  | "server" // 500
  | "network"
  | "not_configured"
  | "unknown";

export interface FieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly fields?: FieldError[];
  readonly correlationId?: string;

  constructor(
    kind: ApiErrorKind,
    message: string,
    opts: { status?: number; fields?: FieldError[]; correlationId?: string } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = opts.status;
    this.fields = opts.fields;
    this.correlationId = opts.correlationId;
  }
}

export class PermissionDeniedError extends ApiError {
  constructor(permission: string) {
    super("forbidden", `Permission denied: ${permission}`, { status: 403 });
    this.name = "PermissionDeniedError";
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, fields: FieldError[] = []) {
    super("validation", message, { status: 422, fields });
    this.name = "ValidationError";
  }
}

export class NotConfiguredError extends ApiError {
  constructor(message = "Production API base URL is not configured") {
    super("not_configured", message);
    this.name = "NotConfiguredError";
  }
}

/** Extract a user-friendly message from any thrown value. */
export function toErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred";
}
