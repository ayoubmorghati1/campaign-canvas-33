import { classifyAiError } from "./errors";

export type RetryContext = {
  attempt: number;
  maxAttempts: number;
  delayMs: number;
  error: unknown;
};

export type WithRetryOptions<T> = {
  maxAttempts: number;
  baseDelayMs: number;
  fn: (attempt: number) => Promise<T>;
  isRetryable?: (error: unknown, attempt: number) => boolean;
  onRetry?: (context: RetryContext) => void;
  sleep?: (ms: number) => Promise<void>;
};

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Exponential backoff with jitter: base * 2^(attempt-1) + random(0..base). */
export function computeBackoffDelayMs(baseDelayMs: number, attempt: number): number {
  const exponential = baseDelayMs * 2 ** Math.max(0, attempt - 1);
  const jitter = Math.floor(Math.random() * baseDelayMs);
  return exponential + jitter;
}

export function defaultIsRetryable(error: unknown, attempt: number, maxAttempts: number): boolean {
  if (attempt >= maxAttempts) return false;
  return classifyAiError(error).retryable;
}

/** Execute `fn` with exponential backoff on retryable failures. */
export async function withRetry<T>(options: WithRetryOptions<T>): Promise<T> {
  const {
    maxAttempts,
    baseDelayMs,
    fn,
    isRetryable = (error, attempt) => defaultIsRetryable(error, attempt, maxAttempts),
    onRetry,
    sleep = defaultSleep,
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      if (!isRetryable(error, attempt)) break;

      const delayMs = computeBackoffDelayMs(baseDelayMs, attempt);
      onRetry?.({ attempt, maxAttempts, delayMs, error });
      await sleep(delayMs);
    }
  }

  throw lastError;
}
