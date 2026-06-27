import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isProviderConfigured, loadAiGatewayConfig } from "./config.ts";
import { AiGatewayError, classifyAiError } from "./errors.ts";
import { computeBackoffDelayMs, defaultIsRetryable, withRetry } from "./retry.ts";

describe("loadAiGatewayConfig", () => {
  it("defaults to openai primary with fallback order", () => {
    const config = loadAiGatewayConfig({});
    assert.equal(config.primary, "openai");
    assert.deepEqual(config.providerOrder, ["openai", "gemini"]);
    assert.equal(config.maxRetries, 3);
    assert.equal(config.retryBaseMs, 500);
    assert.equal(config.mock, false);
  });

  it("respects gemini primary and env overrides", () => {
    const config = loadAiGatewayConfig({
      AI_GATEWAY_PRIMARY: "gemini",
      AI_GATEWAY_MAX_RETRIES: "5",
      AI_GATEWAY_RETRY_BASE_MS: "1000",
      AI_GATEWAY_MOCK: "true",
      OPENAI_API_KEY: "sk-test",
      GOOGLE_GENERATIVE_AI_API_KEY: "gem-test",
    });
    assert.equal(config.primary, "gemini");
    assert.deepEqual(config.providerOrder, ["gemini", "openai"]);
    assert.equal(config.maxRetries, 5);
    assert.equal(config.retryBaseMs, 1000);
    assert.equal(config.mock, true);
    assert.equal(config.openaiApiKey, "sk-test");
  });
});

describe("isProviderConfigured", () => {
  it("returns true in mock mode without keys", () => {
    const config = loadAiGatewayConfig({ AI_GATEWAY_MOCK: "true" });
    assert.equal(isProviderConfigured("openai", config), true);
    assert.equal(isProviderConfigured("gemini", config), true);
  });

  it("requires keys when not mocking", () => {
    const config = loadAiGatewayConfig({ OPENAI_API_KEY: "sk-test" });
    assert.equal(isProviderConfigured("openai", config), true);
    assert.equal(isProviderConfigured("gemini", config), false);
  });
});

describe("classifyAiError", () => {
  it("marks rate limits as retryable", () => {
    const result = classifyAiError({ status: 429, message: "Rate limit exceeded" });
    assert.equal(result.retryable, true);
    assert.equal(result.errorClass, "rate_limit");
  });

  it("marks auth errors as non-retryable", () => {
    const result = classifyAiError(new AiGatewayError({ code: "auth", retryable: false, statusCode: 401 }));
    assert.equal(result.retryable, false);
    assert.equal(result.errorClass, "auth");
  });

  it("marks 5xx as retryable provider errors", () => {
    const result = classifyAiError({ status: 503, message: "Service unavailable" });
    assert.equal(result.retryable, true);
    assert.equal(result.errorClass, "provider");
  });

  it("marks content policy as non-retryable", () => {
    const result = classifyAiError({ message: "Request blocked by safety filter" });
    assert.equal(result.retryable, false);
    assert.equal(result.errorClass, "content_policy");
  });
});

describe("computeBackoffDelayMs", () => {
  it("grows exponentially with attempt", () => {
    const first = computeBackoffDelayMs(500, 1);
    const second = computeBackoffDelayMs(500, 2);
    assert.ok(first >= 500 && first < 1000);
    assert.ok(second >= 1000 && second < 1500);
  });
});

describe("withRetry", () => {
  it("retries retryable errors then succeeds", async () => {
    let calls = 0;
    const sleeps: number[] = [];

    const result = await withRetry({
      maxAttempts: 3,
      baseDelayMs: 10,
      sleep: async (ms) => {
        sleeps.push(ms);
      },
      fn: async () => {
        calls++;
        if (calls < 3) throw { status: 503, message: "Service unavailable" };
        return "ok";
      },
    });

    assert.equal(result, "ok");
    assert.equal(calls, 3);
    assert.equal(sleeps.length, 2);
  });

  it("does not retry non-retryable errors", async () => {
    let calls = 0;

    await assert.rejects(
      () =>
        withRetry({
          maxAttempts: 3,
          baseDelayMs: 10,
          sleep: async () => {},
          fn: async () => {
            calls++;
            throw new AiGatewayError({ code: "auth", retryable: false, statusCode: 401 });
          },
        }),
    );

    assert.equal(calls, 1);
  });
});

describe("defaultIsRetryable", () => {
  it("stops at maxAttempts", () => {
    assert.equal(defaultIsRetryable({ status: 503 }, 3, 3), false);
    assert.equal(defaultIsRetryable({ status: 503 }, 2, 3), true);
  });
});
