import type { AiImageRequest, AiProviderId, AiTextRequest } from "../types";

/** Raw provider output before gateway attaches metadata. */
export type AiProviderTextResult = {
  text: string;
};

export type AiProviderImageResult = {
  b64: string;
  mime: string;
};

/** Contract each AI vendor adapter must implement. */
export interface AiProviderAdapter {
  readonly id: AiProviderId;
  generateText(request: AiTextRequest, model: string): Promise<AiProviderTextResult>;
  generateImage(request: AiImageRequest, model: string): Promise<AiProviderImageResult>;
}
