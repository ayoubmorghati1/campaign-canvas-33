## Why

Server logs prove the "0 variants · ready" state is caused by every image generation call failing with a 429 rate-limit from your OpenAI/Gemini providers. The current code fires variants back-to-back with no pacing, swallows each error in a `catch`, and still flips the campaign to `ready` — so the UI shows an empty "Generate" state instead of telling you anything blew up.

This plan keeps your existing gateway (`src/server/ai/*` with OpenAI + Gemini SDKs) and fixes the three real bugs.

## Change

1. **Pace + retry per variant** — `src/lib/campaigns.functions.ts → generateVariants`
   - Keep the loop sequential (already is) but add `await sleep(1200ms)` between variants.
   - Wrap each `generateImage(...)` call in `withRetry` (already exists in `src/server/ai/retry.ts`) with `maxAttempts: 4`, `baseDelayMs: 2000`. It already classifies 429/5xx/timeout as retryable and backs off exponentially with jitter.
   - Same treatment for `reframeVariant` and `regenerateVariant` so single-image actions stop dying on transient 429s.

2. **Stop hiding failures** — same function
   - Track `failures[]` next to `created[]`.
   - If `created.length === 0`: set `status = "draft"` (not `"ready"`) and `throw toUserFacingError(lastError)` so the client receives a real error.
   - If partial success: set `status = "ready"` and return `{ count, failed, sample_error }` so the UI can show "5 of 9 variants generated — rate limited, try again".

3. **Surface the error in the UI** — `src/routes/studio.c.$id.index.tsx` (and the wizard call site if it lives elsewhere)
   - Replace the silent success with a `toast.error(err.message)` on throw, and `toast.warning(...)` when `failed > 0`.
   - Leave the "Generate" button enabled for retry.

4. **Raise the gateway's own retry budget** — `src/server/ai/config.ts`
   - Default `AI_GATEWAY_MAX_RETRIES` from `3` to `5` and `AI_GATEWAY_RETRY_BASE_MS` to `1500`. (Env vars still win.) This makes the existing in-provider retry loop survive normal Gemini/OpenAI throttling without app-level changes.

## Out of scope

- Anything about mock mode, `AI_GATEWAY_MOCK`, or switching to Lovable AI Gateway.
- Touching the provider adapters (`openai.ts` / `gemini.ts`) or the multimodal prompt shape.
- DB migrations, UI redesign, or queueing/background jobs.

## Technical notes

- `withRetry` in `src/server/ai/retry.ts` already uses `classifyAiError` which marks 429 as `retryable: true` — no new classification needed.
- `aspectForPlatform`, `imageContext`, and `uploadOutput` stay unchanged.
- `sleep` helper is a 3-line `new Promise(r => setTimeout(r, ms))` colocated in `campaigns.functions.ts`.
- No type changes leak to the client beyond the `{ count, failed?, sample_error? }` return shape.
