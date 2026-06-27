import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { APICallError } from "@ai-sdk/provider";

import { classifyAiError } from "./errors.ts";
import { createMockProvider } from "./providers/mock.ts";
import { createProviderRegistry, listAvailableImageProviders, listAvailableProviders } from "./providers/index.ts";
import { toSdkMessages, toGenerateImagePrompt } from "./providers/utils.ts";
import { loadAiGatewayConfig } from "./config.ts";

describe("toSdkMessages", () => {
  it("passes through string content", () => {
    const messages = toSdkMessages([{ role: "user", content: "hello" }]);
    assert.deepEqual(messages, [{ role: "user", content: "hello" }]);
  });

  it("maps multimodal parts for vision requests", () => {
    const messages = toSdkMessages([
      {
        role: "user",
        content: [
          { type: "text", text: "describe this" },
          { type: "image", image: "https://example.com/photo.jpg" },
        ],
      },
    ]);
    assert.equal(messages.length, 1);
    assert.deepEqual(messages[0].content, [
      { type: "text", text: "describe this" },
      { type: "image", image: "https://example.com/photo.jpg" },
    ]);
  });

  it("maps image requests with reference URLs to multimodal prompts", () => {
    const prompt = toGenerateImagePrompt({
      operation: "generateVariants.image",
      prompt: "hero shot on rocks",
      images: ["https://example.com/product.jpg", "https://example.com/ref.jpg"],
    });
    assert.deepEqual(prompt, {
      images: ["https://example.com/product.jpg", "https://example.com/ref.jpg"],
      text: "hero shot on rocks",
    });
  });
});

describe("createMockProvider", () => {
  it("returns JSON brief for analyze operations", async () => {
    const provider = createMockProvider("openai");
    const result = await provider.generateText(
      { operation: "analyzeCampaign", messages: [{ role: "user", content: "go" }] },
      "mock-model",
    );
    const parsed = JSON.parse(result.text);
    assert.equal(typeof parsed.goal, "string");
    assert.ok(Array.isArray(parsed.palette));
  });

  it("returns a valid png for image operations", async () => {
    const provider = createMockProvider("gemini");
    const result = await provider.generateImage({ operation: "generateVariants", prompt: "test" }, "mock-image");
    assert.equal(result.mime, "image/png");
    assert.ok(result.b64.length > 20);
  });
});

describe("createProviderRegistry", () => {
  it("registers both providers in mock mode", () => {
    const config = loadAiGatewayConfig({ AI_GATEWAY_MOCK: "true" });
    const registry = createProviderRegistry(config);
    assert.equal(registry.size, 2);
    assert.ok(registry.has("openai"));
    assert.ok(registry.has("gemini"));
  });

  it("only registers providers with credentials", () => {
    const config = loadAiGatewayConfig({ OPENAI_API_KEY: "sk-test" });
    const registry = createProviderRegistry(config);
    assert.equal(registry.size, 1);
    assert.ok(registry.has("openai"));
    assert.equal(registry.has("gemini"), false);
  });

  it("lists providers in configured failover order", () => {
    const config = loadAiGatewayConfig({
      AI_GATEWAY_MOCK: "true",
      AI_GATEWAY_PRIMARY: "gemini",
    });
    const providers = listAvailableProviders(config);
    assert.deepEqual(
      providers.map((p) => p.id),
      ["gemini", "openai"],
    );
  });

  it("lists image providers gemini-first by default", () => {
    const config = loadAiGatewayConfig({ AI_GATEWAY_MOCK: "true" });
    const providers = listAvailableImageProviders(config);
    assert.deepEqual(
      providers.map((p) => p.id),
      ["gemini", "openai"],
    );
  });
});

describe("classifyAiError APICallError", () => {
  it("classifies SDK rate limit errors as retryable", () => {
    const error = new APICallError({
      message: "Rate limit exceeded",
      url: "https://api.openai.com/v1/chat/completions",
      requestBodyValues: {},
      statusCode: 429,
      responseHeaders: {},
      responseBody: "",
      isRetryable: true,
    });
    const classified = classifyAiError(error);
    assert.equal(classified.errorClass, "rate_limit");
    assert.equal(classified.retryable, true);
  });
});
