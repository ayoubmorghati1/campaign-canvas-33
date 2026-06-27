import type { AiErrorClass, AiProviderId } from "./types";

export type AiLogEvent =
  | "ai.gateway.request"
  | "ai.gateway.retry"
  | "ai.gateway.fallback"
  | "ai.gateway.complete"
  | "ai.gateway.failure";

export type AiLogPayload = {
  event: AiLogEvent;
  operation: string;
  capability: "text" | "image";
  provider?: AiProviderId;
  attempt?: number;
  success?: boolean;
  latencyMs?: number;
  errorClass?: AiErrorClass;
  fallbackFrom?: AiProviderId;
  fallbackTo?: AiProviderId;
  finalProvider?: AiProviderId;
  totalAttempts?: number;
  message?: string;
};

type AiLogger = {
  log: (payload: AiLogPayload) => void;
};

function write(payload: AiLogPayload) {
  console.info(JSON.stringify({ ...payload, ts: new Date().toISOString() }));
}

/** Default structured logger — one JSON line per event for easy grep/parsing. */
export const aiLogger: AiLogger = {
  log: write,
};

/** Create a logger that prefixes every event with a shared operation label. */
export function createOperationLogger(operation: string, capability: "text" | "image"): AiLogger {
  return {
    log(payload) {
      write({ operation, capability, ...payload });
    },
  };
}

export function createAiLogger(customLog?: (payload: AiLogPayload) => void): AiLogger {
  if (!customLog) return aiLogger;
  return { log: customLog };
}
