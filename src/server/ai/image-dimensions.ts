import type { AiImageAspectRatio } from "./types";

const ASPECT_SIZES: Record<AiImageAspectRatio, `${number}x${number}`> = {
  "1:1": "1024x1024",
  "9:16": "1024x1792",
  "16:9": "1792x1024",
  "4:5": "1024x1280",
  "2:3": "1024x1536",
};

/** Map aspect ratio to provider-friendly dimensions (Gemini aspectRatio + OpenAI size). */
export function imageDimensionsForAspect(aspect: AiImageAspectRatio): {
  aspectRatio: AiImageAspectRatio;
  size: `${number}x${number}`;
} {
  return { aspectRatio: aspect, size: ASPECT_SIZES[aspect] };
}

export type { AiImageAspectRatio };
