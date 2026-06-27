## Why

`AI_GATEWAY_MOCK=true` only lives in the local `.env`. The deployed Lovable Worker doesn't read that file, so it falls through to the real provider keys configured for the project and generates real images. Setting it as a runtime secret makes the Worker honor mock mode.

## Change

1. Call `set_secret` with `AI_GATEWAY_MOCK=true`. This makes `process.env.AI_GATEWAY_MOCK` available in every server function on the deployed app.
2. No code changes needed — `src/server/ai/config.ts` already reads `env.AI_GATEWAY_MOCK === "true"` and short-circuits the gateway to the mock provider (1×1 PNG + canned brief JSON).

## How to flip it back later

When you want real generation again, either delete the secret (`delete_secret AI_GATEWAY_MOCK`) or update it to `false`. No code change required either way.

## Out of scope

- No edits to `src/server/ai/*`, campaign functions, or UI.
- Not touching the local `.env`.
- Not adding a per-campaign demo toggle (separate feature).
