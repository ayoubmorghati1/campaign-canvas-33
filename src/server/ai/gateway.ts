import type { AiGatewayConfig, AiImageRequest, AiImageResult, AiProviderId, AiResultMeta, AiTextRequest, AiTextResult } from "./types";
import { loadAiGatewayConfig } from "./config";
import { listAvailableProviders } from "./providers";
import type { AiProviderAdapter } from "./providers/types";
import { AiGatewayError, classifyAiError, toUserFacingError } from "./errors";
import { createOperationLogger, type AiLogger } from "./logger";
import { withRetry } from "./retry";

export type AiGateway = {
  generateText(request: AiTextRequest): Promise<AiTextResult>;
  generateImage(request: AiImageRequest): Promise<AiImageResult>;
};

export type CreateAiGatewayOptions = {
  /** Override provider list (used in tests). Defaults to configured providers. */
  providers?: AiProviderAdapter[];
  logger?: AiLogger;
};

type Capability = "text" | "image";

type AttemptRecord = {
  provider: AiProviderId;
  attempt: number;
  latencyMs: number;
};

async function invokeWithRetries<T>(options: {
  capability: Capability;
  operation: string;
  provider: AiProviderAdapter;
  model: string;
  config: AiGatewayConfig;
  logger: AiLogger;
  attemptCounter: { total: number };
  invoke: (provider: AiProviderAdapter, model: string) => Promise<T>;
}): Promise<{ value: T; record: AttemptRecord }> {
  const { provider, model, config, logger, attemptCounter, invoke } = options;
  let lastAttempt = 0;
  let lastLatencyMs = 0;

  const value = await withRetry({
    maxAttempts: config.maxRetries,
    baseDelayMs: config.retryBaseMs,
    fn: async (attempt) => {
      attemptCounter.total++;
      lastAttempt = attempt;
      const started = Date.now();

      logger.log({
        event: "ai.gateway.request",
        provider: provider.id,
        attempt,
        success: undefined,
      });

      try {
        const result = await invoke(provider, model);
        lastLatencyMs = Date.now() - started;
        logger.log({
          event: "ai.gateway.request",
          provider: provider.id,
          attempt,
          success: true,
          latencyMs: lastLatencyMs,
        });
        return result;
      } catch (error) {
        const classified = classifyAiError(error);
        logger.log({
          event: "ai.gateway.request",
          provider: provider.id,
          attempt,
          success: false,
          latencyMs: Date.now() - started,
          errorClass: classified.errorClass,
          message: classified.message,
        });
        throw error;
      }
    },
    onRetry: ({ attempt, delayMs, error }) => {
      const classified = classifyAiError(error);
      logger.log({
        event: "ai.gateway.retry",
        provider: provider.id,
        attempt: attempt + 1,
        errorClass: classified.errorClass,
        message: `Retrying in ${delayMs}ms`,
      });
    },
  });

  return {
    value,
    record: { provider: provider.id, attempt: lastAttempt, latencyMs: lastLatencyMs },
  };
}

function buildMeta(options: {
  record: AttemptRecord;
  totalAttempts: number;
  fallbackUsed: boolean;
}): AiResultMeta {
  const { record, totalAttempts, fallbackUsed } = options;
  return {
    provider: record.provider,
    attempt: record.attempt,
    totalAttempts,
    latencyMs: record.latencyMs,
    fallbackUsed,
    finalProvider: record.provider,
  };
}

async function executeWithFailover<T>(options: {
  capability: Capability;
  request: AiTextRequest | AiImageRequest;
  config: AiGatewayConfig;
  providers: AiProviderAdapter[];
  logger: AiLogger;
  modelFor: (provider: AiProviderId) => string;
  invoke: (provider: AiProviderAdapter, model: string) => Promise<T>;
  mapResult: (value: T, meta: AiResultMeta) => AiTextResult | AiImageResult;
}): Promise<AiTextResult | AiImageResult> {
  const { capability, request, config, providers, logger, modelFor, invoke, mapResult } = options;

  if (providers.length === 0) {
    throw new AiGatewayError({
      code: "configuration",
      retryable: false,
      message: "AI service is not configured. Add OPENAI_API_KEY and/or GOOGLE_GENERATIVE_AI_API_KEY.",
    });
  }

  let totalAttempts = 0;
  const errors: unknown[] = [];

  for (let index = 0; index < providers.length; index++) {
    const provider = providers[index]!;
    const previous = providers[index - 1];

    if (previous) {
      logger.log({
        event: "ai.gateway.fallback",
        fallbackFrom: previous.id,
        fallbackTo: provider.id,
        message: `Primary provider ${previous.id} exhausted retries`,
      });
    }

    const attemptCounter = { total: 0 };

    try {
      const { value, record } = await invokeWithRetries({
        capability,
        operation: request.operation,
        provider,
        model: modelFor(provider.id),
        config,
        logger,
        attemptCounter,
        invoke,
      });

      totalAttempts += attemptCounter.total;
      const meta = buildMeta({
        record,
        totalAttempts,
        fallbackUsed: index > 0,
      });

      logger.log({
        event: "ai.gateway.complete",
        provider: meta.finalProvider,
        finalProvider: meta.finalProvider,
        attempt: meta.attempt,
        totalAttempts: meta.totalAttempts,
        success: true,
        latencyMs: meta.latencyMs,
        fallbackUsed: meta.fallbackUsed,
      });

      return mapResult(value, meta);
    } catch (error) {
      totalAttempts += attemptCounter.total;
      errors.push(error);
      if (index === providers.length - 1) break;
    }
  }

  const finalError = toUserFacingError(errors[errors.length - 1]);
  logger.log({
    event: "ai.gateway.failure",
    success: false,
    totalAttempts,
    errorClass: finalError.code,
    message: finalError.message,
  });
  throw finalError;
}

/** Create the AI gateway facade — retry, failover, logging, and normalized responses. */
export function createAiGateway(
  config: AiGatewayConfig,
  options: CreateAiGatewayOptions = {},
): AiGateway {
  const providers = options.providers ?? listAvailableProviders(config);

  return {
    async generateText(request: AiTextRequest): Promise<AiTextResult> {
      const logger = options.logger ?? createOperationLogger(request.operation, "text");

      const result = await executeWithFailover({
        capability: "text",
        request,
        config,
        providers,
        logger,
        modelFor: (providerId) => config.models.text[providerId],
        invoke: (provider, model) => provider.generateText(request, model),
        mapResult: (value, meta) => ({ text: value.text, meta }),
      });

      return result as AiTextResult;
    },

    async generateImage(request: AiImageRequest): Promise<AiImageResult> {
      const logger = options.logger ?? createOperationLogger(request.operation, "image");

      const result = await executeWithFailover({
        capability: "image",
        request,
        config,
        providers,
        logger,
        modelFor: (providerId) => config.models.image[providerId],
        invoke: (provider, model) => provider.generateImage(request, model),
        mapResult: (value, meta) => ({ b64: value.b64, mime: value.mime, meta }),
      });

      return result as AiImageResult;
    },
  };
}

/** Singleton gateway using environment configuration. */
let defaultGateway: AiGateway | undefined;

export function getAiGateway(config?: AiGatewayConfig): AiGateway {
  if (config) return createAiGateway(config);
  if (!defaultGateway) {
    defaultGateway = createAiGateway(loadAiGatewayConfig());
  }
  return defaultGateway;
}

export function resetAiGatewayForTests() {
  defaultGateway = undefined;
}
