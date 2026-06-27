import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateImage, generateText } from "ai";

import type { AiImageRequest, AiTextRequest } from "../types";
import { imageDimensionsForAspect } from "../image-dimensions";
import type { AiProviderAdapter } from "./types";
import {
  parseGeneratedImageFile,
  rethrowProviderError,
  toGenerateImagePrompt,
  toSdkMessages,
} from "./utils";

export function createGeminiProvider(apiKey: string): AiProviderAdapter {
  const google = createGoogleGenerativeAI({ apiKey });

  return {
    id: "gemini",

    async generateText(request: AiTextRequest, model: string) {
      try {
        const { text } = await generateText({
          model: google(model),
          system: request.system,
          messages: toSdkMessages(request.messages),
          maxRetries: 0,
        });
        return { text };
      } catch (error) {
        rethrowProviderError(error);
      }
    },

    async generateImage(request: AiImageRequest, model: string) {
      try {
        const dimensions = request.aspectRatio
          ? imageDimensionsForAspect(request.aspectRatio)
          : undefined;
        const result = await generateImage({
          model: google.image(model),
          prompt: toGenerateImagePrompt(request),
          maxRetries: 0,
          aspectRatio: dimensions?.aspectRatio,
        });
        return parseGeneratedImageFile(result.image);
      } catch (error) {
        rethrowProviderError(error);
      }
    },
  };
}
