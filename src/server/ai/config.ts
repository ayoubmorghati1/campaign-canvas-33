import type { AiGatewayConfig, AiProviderId } from "./types";

const DEFAULT_TEXT_MODELS: Record<AiProviderId, string> = {
  openai: "gpt-4o-mini",
  gemini: "gemini-2.0-flash",
};

const DEFAULT_IMAGE_MODELS: Record<AiProviderId, string> = {
  openai: "gpt-image-1",
  gemini: "gemini-2.5-flash-image",
};

function parsePrimary(value: string | undefined): AiProviderId {
  if (value === "gemini") return "gemini";
  return "openai";
}

function providerOrder(primary: AiProviderId): AiProviderId[] {
  return primary === "openai" ? ["openai", "gemini"] : ["gemini", "openai"];
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

/** Load gateway configuration from environment variables. */
export function loadAiGatewayConfig(env: NodeJS.ProcessEnv = process.env): AiGatewayConfig {
  const primary = parsePrimary(env.AI_GATEWAY_PRIMARY);
  const imagePrimary = parsePrimary(env.AI_GATEWAY_IMAGE_PRIMARY ?? "gemini");
  const mock = env.AI_GATEWAY_MOCK === "true" || env.AI_GATEWAY_MOCK === "1";

  return {
    primary,
    providerOrder: providerOrder(primary),
    imageProviderOrder: providerOrder(imagePrimary),
    maxRetries: parsePositiveInt(env.AI_GATEWAY_MAX_RETRIES, 3),
    retryBaseMs: parsePositiveInt(env.AI_GATEWAY_RETRY_BASE_MS, 500),
    mock,
    openaiApiKey: env.OPENAI_API_KEY?.trim() || undefined,
    geminiApiKey: env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() || undefined,
    models: {
      text: {
        openai: env.AI_GATEWAY_TEXT_MODEL_OPENAI?.trim() || DEFAULT_TEXT_MODELS.openai,
        gemini: env.AI_GATEWAY_TEXT_MODEL_GEMINI?.trim() || DEFAULT_TEXT_MODELS.gemini,
      },
      image: {
        openai: env.AI_GATEWAY_IMAGE_MODEL_OPENAI?.trim() || DEFAULT_IMAGE_MODELS.openai,
        gemini: env.AI_GATEWAY_IMAGE_MODEL_GEMINI?.trim() || DEFAULT_IMAGE_MODELS.gemini,
      },
    },
  };
}

/** Returns true when a provider has credentials available (or mock mode is on). */
export function isProviderConfigured(
  provider: AiProviderId,
  config: AiGatewayConfig,
): boolean {
  if (config.mock) return true;
  if (provider === "openai") return !!config.openaiApiKey;
  return !!config.geminiApiKey;
}
