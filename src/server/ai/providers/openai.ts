import { createOpenAI } from "@ai-sdk/openai";
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

export function createOpenAiProvider(apiKey: string): AiProviderAdapter {
  const openai = createOpenAI({ apiKey });

  return {
    id: "openai",

    async generateText(request: AiTextRequest, model: string) {
      try {
        const { text } = await generateText({
          model: openai(model),
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
        const prompt = toGenerateImagePrompt(request);
        const dimensions = request.aspectRatio
          ? imageDimensionsForAspect(request.aspectRatio)
          : undefined;
        const result = await generateImage({
          model: openai.image(model),
          prompt,
          maxRetries: 0,
          size: dimensions?.size,
        });
        return parseGeneratedImageFile(result.image);
      } catch (error) {
        rethrowProviderError(error);
      }
    },
  };
}
