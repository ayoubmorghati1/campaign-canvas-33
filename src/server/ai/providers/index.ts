import type { AiGatewayConfig, AiProviderId } from "../types";
import { isProviderConfigured } from "../config";
import { createGeminiProvider } from "./gemini";
import { createMockProvider } from "./mock";
import { createOpenAiProvider } from "./openai";
import type { AiProviderAdapter } from "./types";

export type { AiProviderAdapter, AiProviderImageResult, AiProviderTextResult } from "./types";
export { createGeminiProvider } from "./gemini";
export { createMockProvider } from "./mock";
export { createOpenAiProvider } from "./openai";
export { normalizeProviderError, parseGeneratedImageFile, toSdkMessages } from "./utils";

function instantiateProvider(config: AiGatewayConfig, id: AiProviderId): AiProviderAdapter | undefined {
  if (config.mock) return createMockProvider(id);
  if (id === "openai" && config.openaiApiKey) return createOpenAiProvider(config.openaiApiKey);
  if (id === "gemini" && config.geminiApiKey) return createGeminiProvider(config.geminiApiKey);
  return undefined;
}

/** Build a registry of configured provider adapters keyed by provider id. */
export function createProviderRegistry(config: AiGatewayConfig): Map<AiProviderId, AiProviderAdapter> {
  const registry = new Map<AiProviderId, AiProviderAdapter>();

  for (const id of ["openai", "gemini"] as const) {
    if (!isProviderConfigured(id, config)) continue;
    const provider = instantiateProvider(config, id);
    if (provider) registry.set(id, provider);
  }

  return registry;
}

/** Ordered list of providers for text generation. */
export function listAvailableProviders(config: AiGatewayConfig): AiProviderAdapter[] {
  const registry = createProviderRegistry(config);
  return config.providerOrder
    .map((id) => registry.get(id))
    .filter((provider): provider is AiProviderAdapter => provider !== undefined);
}

/** Ordered list of providers for image generation (Gemini-first by default). */
export function listAvailableImageProviders(config: AiGatewayConfig): AiProviderAdapter[] {
  const registry = createProviderRegistry(config);
  return config.imageProviderOrder
    .map((id) => registry.get(id))
    .filter((provider): provider is AiProviderAdapter => provider !== undefined);
}
