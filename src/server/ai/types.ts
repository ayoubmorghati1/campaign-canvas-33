/** Provider identifiers supported by the AI gateway. */
export type AiProviderId = "openai" | "gemini";

/** Discriminated content parts for multimodal text requests. */
export type AiContentPart =
  | { type: "text"; text: string }
  /** Public URL or data URL of an image. */
  | { type: "image"; image: string };

export type AiMessageRole = "user" | "assistant" | "system";

export type AiMessage = {
  role: AiMessageRole;
  content: string | AiContentPart[];
};

/** Normalized text-generation request consumed by the gateway facade. */
export type AiTextRequest = {
  /** Stable label for structured logs, e.g. `analyzeCampaign`. */
  operation: string;
  system?: string;
  messages: AiMessage[];
};

/** Supported output aspect ratios for image generation. */
export type AiImageAspectRatio = "1:1" | "4:5" | "9:16" | "16:9" | "2:3";

/** Normalized image-generation request consumed by the gateway facade. */
export type AiImageRequest = {
  operation: string;
  prompt: string;
  /** Product / scene photo URLs or data URLs for image-edit APIs. */
  images?: string[];
  /** Target output aspect ratio — passed through to providers. */
  aspectRatio?: AiImageAspectRatio;
};

/** Internal metadata attached to every successful gateway response. */
export type AiResultMeta = {
  provider: AiProviderId;
  attempt: number;
  totalAttempts: number;
  latencyMs: number;
  fallbackUsed: boolean;
  finalProvider: AiProviderId;
};

export type AiTextResult = {
  text: string;
  meta: AiResultMeta;
};

export type AiImageResult = {
  b64: string;
  mime: string;
  meta: AiResultMeta;
};

export type AiGatewayConfig = {
  primary: AiProviderId;
  providerOrder: AiProviderId[];
  /** Failover order for image generation — defaults to OpenAI first, Gemini fallback. */
  imageProviderOrder: AiProviderId[];
  maxRetries: number;
  retryBaseMs: number;
  mock: boolean;
  openaiApiKey?: string;
  geminiApiKey?: string;
  models: {
    text: Record<AiProviderId, string>;
    image: Record<AiProviderId, string>;
  };
};
