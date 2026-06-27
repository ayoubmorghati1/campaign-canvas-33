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

/** Normalized image-generation request consumed by the gateway facade. */
export type AiImageRequest = {
  operation: string;
  prompt: string;
  /** Product photo URLs first, then reference/style URLs — passed to image-edit APIs. */
  images?: string[];
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
