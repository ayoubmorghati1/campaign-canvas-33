import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loadAiGatewayConfig } from "./config.ts";
import { AiGatewayError } from "./errors.ts";
import { createAiGateway, resetAiGatewayForTests } from "./gateway.ts";
import type { AiLogPayload } from "./logger.ts";
import type { AiProviderAdapter } from "./providers/types.ts";

function failingProvider(id: "openai" | "gemini", failUntilAttempt: number): AiProviderAdapter {
  let calls = 0;
  return {
    id,
    async generateText() {
      calls++;
      if (calls < failUntilAttempt) throw { status: 503, message: "Service unavailable" };
      return { text: `ok-from-${id}` };
    },
    async generateImage() {
      calls++;
      if (calls < failUntilAttempt) throw { status: 503, message: "Service unavailable" };
      return { b64: "abc", mime: "image/png" };
    },
  };
}

function authFailProvider(id: "openai" | "gemini"): AiProviderAdapter {
  return {
    id,
    async generateText() {
      throw new AiGatewayError({ code: "auth", retryable: false, statusCode: 401 });
    },
    async generateImage() {
      throw new AiGatewayError({ code: "auth", retryable: false, statusCode: 401 });
    },
  };
}

describe("createAiGateway", () => {
  it("retries a provider before succeeding", async () => {
    const logs: AiLogPayload[] = [];
    const config = loadAiGatewayConfig({ AI_GATEWAY_MOCK: "true", AI_GATEWAY_MAX_RETRIES: "3", AI_GATEWAY_RETRY_BASE_MS: "1" });
    const gateway = createAiGateway(config, {
      providers: [failingProvider("openai", 3)],
      logger: { log: (payload) => logs.push(payload) },
    });

    const result = await gateway.generateText({
      operation: "testRetry",
      messages: [{ role: "user", content: "hi" }],
    });

    assert.equal(result.text, "ok-from-openai");
    assert.equal(result.meta.finalProvider, "openai");
    assert.equal(result.meta.fallbackUsed, false);
    assert.ok(result.meta.totalAttempts >= 3);
    assert.ok(logs.some((l) => l.event === "ai.gateway.retry"));
    assert.ok(logs.some((l) => l.event === "ai.gateway.complete" && l.success === true));
  });

  it("falls back to the secondary provider after primary retries are exhausted", async () => {
    const logs: AiLogPayload[] = [];
    const config = loadAiGatewayConfig({ AI_GATEWAY_MOCK: "true", AI_GATEWAY_MAX_RETRIES: "2", AI_GATEWAY_RETRY_BASE_MS: "1" });
    const alwaysFail = failingProvider("openai", 999);
    const gemini = failingProvider("gemini", 1);

    const gateway = createAiGateway(config, {
      providers: [alwaysFail, gemini],
      logger: { log: (payload) => logs.push(payload) },
    });

    const result = await gateway.generateImage({ operation: "testFallback", prompt: "hero shot" });

    assert.equal(result.b64, "abc");
    assert.equal(result.meta.finalProvider, "gemini");
    assert.equal(result.meta.fallbackUsed, true);
    assert.ok(logs.some((l) => l.event === "ai.gateway.fallback" && l.fallbackFrom === "openai" && l.fallbackTo === "gemini"));
  });

  it("returns a user-safe configuration error when no providers are available", async () => {
    const config = loadAiGatewayConfig({});
    const gateway = createAiGateway(config, { providers: [] });

    await assert.rejects(
      () =>
        gateway.generateText({
          operation: "testMissing",
          messages: [{ role: "user", content: "hi" }],
        }),
      (error: unknown) => {
        assert.ok(error instanceof AiGatewayError);
        assert.equal(error.code, "configuration");
        return true;
      },
    );
  });

  it("does not retry non-retryable auth errors before failing over", async () => {
    let openAiCalls = 0;
    const openai: AiProviderAdapter = {
      id: "openai",
      async generateText() {
        openAiCalls++;
        throw new AiGatewayError({ code: "auth", retryable: false, statusCode: 401 });
      },
      async generateImage() {
        openAiCalls++;
        throw new AiGatewayError({ code: "auth", retryable: false, statusCode: 401 });
      },
    };

    const config = loadAiGatewayConfig({ AI_GATEWAY_MOCK: "true", AI_GATEWAY_MAX_RETRIES: "3" });
    const gateway = createAiGateway(config, {
      providers: [openai, failingProvider("gemini", 1)],
    });

    const result = await gateway.generateText({
      operation: "testAuthFailover",
      messages: [{ role: "user", content: "hi" }],
    });

    assert.equal(openAiCalls, 1);
    assert.equal(result.meta.finalProvider, "gemini");
  });

  it("throws a user-facing error when all providers fail", async () => {
    const config = loadAiGatewayConfig({ AI_GATEWAY_MOCK: "true", AI_GATEWAY_MAX_RETRIES: "1" });
    const gateway = createAiGateway(config, {
      providers: [authFailProvider("openai"), authFailProvider("gemini")],
    });

    await assert.rejects(
      () =>
        gateway.generateText({
          operation: "testAllFail",
          messages: [{ role: "user", content: "hi" }],
        }),
      (error: unknown) => {
        assert.ok(error instanceof AiGatewayError);
        assert.equal(error.code, "auth");
        return true;
      },
    );
  });

  it("resets singleton gateway for tests", () => {
    resetAiGatewayForTests();
    const gateway = createAiGateway(loadAiGatewayConfig({ AI_GATEWAY_MOCK: "true" }));
    assert.equal(typeof gateway.generateText, "function");
  });
});
