import { APICallError } from "@ai-sdk/provider";

/** Structured error categories used for retry decisions and logging. */
export type AiErrorClass =
  | "rate_limit"
  | "timeout"
  | "network"
  | "auth"
  | "content_policy"
  | "invalid_request"
  | "configuration"
  | "provider"
  | "unknown";

export type ClassifiedAiError = {
  retryable: boolean;
  errorClass: AiErrorClass;
  statusCode?: number;
  message: string;
};

const USER_MESSAGES: Record<AiErrorClass, string> = {
  rate_limit: "The AI service is busy. Please wait a moment and try again.",
  timeout: "The AI request timed out. Please try again.",
  network: "Could not reach the AI service. Please check your connection and try again.",
  auth: "AI service authentication failed. Check your API key configuration.",
  content_policy: "The request was rejected by the AI content policy. Try adjusting your inputs.",
  invalid_request: "The AI request was invalid. Please try again with different inputs.",
  configuration: "AI service is not configured. Add your API keys to the environment.",
  provider: "The AI service encountered an error. Please try again.",
  unknown: "Something went wrong with the AI service. Please try again.",
};

/** User-safe gateway error — never expose raw provider payloads to the frontend. */
export class AiGatewayError extends Error {
  readonly code: AiErrorClass;
  readonly retryable: boolean;
  readonly statusCode?: number;
  readonly cause?: unknown;

  constructor(options: {
    code: AiErrorClass;
    retryable: boolean;
    statusCode?: number;
    cause?: unknown;
    message?: string;
  }) {
    super(options.message ?? USER_MESSAGES[options.code]);
    this.name = "AiGatewayError";
    this.code = options.code;
    this.retryable = options.retryable;
    this.statusCode = options.statusCode;
    this.cause = options.cause;
  }
}

function messageOf(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error && typeof (error as { message: unknown }).message === "string") {
    return (error as { message: string }).message;
  }
  return "Unknown error";
}

function statusFromUnknown(error: unknown): number | undefined {
  if (error instanceof AiGatewayError) return error.statusCode;
  if (error && typeof error === "object") {
    const e = error as Record<string, unknown>;
    if (typeof e.statusCode === "number") return e.statusCode;
    if (typeof e.status === "number") return e.status;
  }
  return undefined;
}

/** Classify an arbitrary provider error for retry policy and logging. */
export function classifyAiError(error: unknown): ClassifiedAiError {
  if (error instanceof AiGatewayError) {
    return {
      retryable: error.retryable,
      errorClass: error.code,
      statusCode: error.statusCode,
      message: error.message,
    };
  }

  if (APICallError.isInstance(error)) {
    return classifyAiError({ status: error.statusCode, message: error.message, cause: error });
  }

  const status = statusFromUnknown(error);
  const message = messageOf(error).toLowerCase();

  if (status === 401 || status === 403 || message.includes("invalid api key") || message.includes("incorrect api key")) {
    return { retryable: false, errorClass: "auth", statusCode: status, message: messageOf(error) };
  }

  if (status === 400 || message.includes("invalid request") || message.includes("bad request")) {
    return { retryable: false, errorClass: "invalid_request", statusCode: status, message: messageOf(error) };
  }

  if (
    status === 422 ||
    message.includes("content policy") ||
    message.includes("safety") ||
    message.includes("moderation") ||
    message.includes("blocked")
  ) {
    return { retryable: false, errorClass: "content_policy", statusCode: status, message: messageOf(error) };
  }

  if (status === 429 || message.includes("rate limit") || message.includes("too many requests")) {
    return { retryable: true, errorClass: "rate_limit", statusCode: status, message: messageOf(error) };
  }

  if (
    status === 408 ||
    message.includes("timeout") ||
    message.includes("timed out") ||
    message.includes("etimedout")
  ) {
    return { retryable: true, errorClass: "timeout", statusCode: status, message: messageOf(error) };
  }

  if (
    message.includes("econnreset") ||
    message.includes("enotfound") ||
    message.includes("network") ||
    message.includes("fetch failed") ||
    message.includes("socket")
  ) {
    return { retryable: true, errorClass: "network", statusCode: status, message: messageOf(error) };
  }

  if (status !== undefined && status >= 500) {
    return { retryable: true, errorClass: "provider", statusCode: status, message: messageOf(error) };
  }

  if (message.includes("not configured") || message.includes("missing") && message.includes("api key")) {
    return { retryable: false, errorClass: "configuration", statusCode: status, message: messageOf(error) };
  }

  return { retryable: false, errorClass: "unknown", statusCode: status, message: messageOf(error) };
}

/** Map a classified error to a user-safe `AiGatewayError`. */
export function toUserFacingError(error: unknown): AiGatewayError {
  if (error instanceof AiGatewayError) return error;
  const classified = classifyAiError(error);
  return new AiGatewayError({
    code: classified.errorClass,
    retryable: classified.retryable,
    statusCode: classified.statusCode,
    cause: error,
  });
}
