import { APICallError } from "@ai-sdk/provider";
import type { ModelMessage } from "ai";

import { AiGatewayError } from "../errors";
import type { AiContentPart, AiImageRequest, AiMessage } from "../types";

/** Normalize SDK / fetch errors so `classifyAiError` can read status codes. */
export function normalizeProviderError(error: unknown): unknown {
  if (APICallError.isInstance(error)) {
    return {
      status: error.statusCode,
      message: error.message,
      cause: error,
    };
  }
  return error;
}

/** Re-throw with normalized shape for upstream classification. */
export function rethrowProviderError(error: unknown): never {
  throw normalizeProviderError(error);
}

export function toSdkMessages(messages: AiMessage[]): ModelMessage[] {
  return messages.map((message) => {
    if (typeof message.content === "string") {
      return { role: message.role, content: message.content } as ModelMessage;
    }

    const content = message.content.map((part: AiContentPart) => {
      if (part.type === "text") return { type: "text" as const, text: part.text };
      return { type: "image" as const, image: part.image };
    });

    return { role: message.role, content } as ModelMessage;
  });
}

type GeneratedImageFile = {
  base64: string;
  mediaType: string;
};

/** Map gateway image requests to AI SDK prompt shape (text-only or multimodal edit). */
export function toGenerateImagePrompt(
  request: AiImageRequest,
): string | { images: string[]; text: string } {
  const urls = request.images?.filter((url) => url.trim().length > 0) ?? [];
  if (urls.length === 0) return request.prompt;
  return { images: urls, text: request.prompt };
}

/** Extract base64 + mime from Vercel AI SDK `generateImage` output. */
export function parseGeneratedImageFile(file: GeneratedImageFile): { b64: string; mime: string } {
  const b64 = file.base64?.trim();
  if (!b64) {
    throw new AiGatewayError({
      code: "provider",
      retryable: false,
      message: "Image generation returned no image data.",
    });
  }
  return { b64, mime: file.mediaType || "image/png" };
}
