import type { AiImageRequest, AiProviderId, AiTextRequest } from "../types";
import type { AiProviderAdapter } from "./types";

/** 1×1 transparent PNG — valid image bytes for upload-path testing. */
const MOCK_PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const MOCK_BRIEF = {
  goal: "Launch awareness",
  audience: "Design-forward founders",
  position: "Premium creative studio",
  mood: "editorial, warm, confident",
  color_strategy: "Muted neutrals with violet accents",
  visual_direction: "Clean product hero with soft natural light",
  palette: ["#1A1A1A", "#F5F0EB", "#7C3AED", "#E8D5C4"],
  references_dna: [{ label: "Editorial still life", weight: 60 }, { label: "Warm lifestyle", weight: 40 }],
  notes: "Mock brief generated without external API keys.",
};

function mockTextForOperation(operation: string): string {
  if (operation.includes("analyze") || operation.includes("brief")) {
    return JSON.stringify(MOCK_BRIEF);
  }

  if (operation.includes("variant") || operation.includes("generate")) {
    return JSON.stringify({
      variants: [
        {
          platform: "IG Feed",
          direction_label: "Soft Editorial",
          title: "Morning Light",
          mood_caption: "Quiet confidence in natural light",
          caption_body: "Built for founders who care about the details.",
          match_score: 88,
          why: ["Strong product focus", "On-brief palette"],
          prompt: "Mock campaign image prompt for testing.",
        },
      ],
    });
  }

  if (operation.includes("director") || operation.includes("chat")) {
    return "Mock director reply: push the palette warmer and regenerate the hero with more negative space.";
  }

  return "Mock AI text response.";
}

export function createMockProvider(id: AiProviderId = "openai"): AiProviderAdapter {
  return {
    id,

    async generateText(request: AiTextRequest) {
      return { text: mockTextForOperation(request.operation) };
    },

    async generateImage(_request: AiImageRequest) {
      return { b64: MOCK_PNG_B64, mime: "image/png" };
    },
  };
}
