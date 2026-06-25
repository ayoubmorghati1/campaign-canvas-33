
# Make Campaign Studio Actually Work — No Auth

Skip login entirely. Everything runs against a single shared workspace so dropping files actually triggers AI and produces real campaign assets you can keep across sessions.

## What "working" means after this plan

1. Open `/studio` — see your real campaigns (or empty state on a fresh project).
2. `/studio/new`: drop product photos + inspiration images → they upload to storage.
3. AI **actually looks at the images** (Gemini multimodal) and writes a real creative brief: positioning, palette, mood, composition notes — streamed live into the wizard.
4. Confirm the brief, pick voice + freedom + platforms, hit Generate.
5. AI **actually generates images** (one per direction × platform), captions, and a real match score; stored to the campaign.
6. `/studio/c/$id` shows the real variants with the inspector reading real metadata. Regenerate + "Talk to the Director" both call AI for real.

No fake gradients, no fake "Morning Ritual" — everything is data.

## Architecture

```text
Browser ──► TanStack server fns / routes ──► Lovable AI Gateway (Gemini)
   │                  │                       └─ vision analysis (structured brief)
   │                  │                       └─ image generation (variants)
   │                  ├─► Cloud Storage  (PUBLIC buckets, simpler with no auth)
   │                  └─► Cloud Postgres (campaigns, assets, briefs, variants)
```

No auth, no `_authenticated` gate, no `/auth` route. Server functions are `createServerFn` without `requireSupabaseAuth`.

## Data model (Postgres)

Single shared workspace. RLS enabled but policies are open (`USING (true)` for select/insert/update/delete to `anon`+`authenticated`) — explicit, so we can lock it down later without a migration on every table.

- `campaigns` — id, name, status (`draft|analyzing|generating|ready`), voice, freedom (0–100), platforms `text[]`, created_at, updated_at.
- `campaign_assets` — campaign_id, kind (`product|reference`), storage_path, mime, width, height.
- `creative_briefs` — campaign_id (1:1), goal, audience, position, mood, palette JSON, visual_direction, notes — written by AI, editable inline.
- `variants` — campaign_id, platform, direction_label, title, mood_caption, caption_body, storage_path, match_score, reasoning JSON (why-this-works + DNA breakdown), created_at.
- `director_messages` — campaign_id, role, content, created_at.

Every table: explicit `GRANT` to `anon`, `authenticated`, `service_role`. RLS on with open policies.

## Storage

Two **public** buckets: `campaign-inputs` and `campaign-outputs`. Public read avoids signed-URL plumbing while we have no users. Server fns write via service role; the browser reads via the public URL.

## Server functions / routes

In `src/lib/*.functions.ts` unless noted:

- `listCampaigns()` — dashboard.
- `createCampaign({ name })` → new row.
- `getCampaign({ id })` → campaign + assets + brief + variants for the workspace.
- `recordAsset({ campaignId, kind, storagePath, mime, width, height })` — called after browser uploads directly to the bucket.
- `analyzeCampaign({ campaignId })` — loads asset URLs, calls `google/gemini-3-flash-preview` with `image_url` parts + `Output.object` schema for the brief, persists `creative_briefs`. Returns the brief; the wizard streams progress lines via a small companion route `src/routes/api/analyze-stream.ts` (SSE) for the live "Director stream" panel.
- `updateBrief({ campaignId, patch })` — when you edit the brief step.
- `generateVariants({ campaignId })` — for each selected platform × 3 directions: image gen via the streaming route below; in parallel, one text call returns `{ title, mood, caption, match_score, reasoning }` per variant; persist row + image. Image generation must use a server **route** (not server fn) because typed RPC can't stream — `src/routes/api/generate-variant-image.ts` per the TanStack image streaming pattern.
- `regenerateVariant({ variantId, instruction })` — re-runs one cell with optional natural-language tweak.
- `src/routes/api/director.ts` — streaming chat (`streamText` + `useChat`) for the inspector's "Talk to the Director" panel, with a small tool set: `adjust_variant`, `add_reference_note`.

All AI uses `createLovableAiGatewayProvider`. Default model `google/gemini-3-flash-preview` for text/vision; `google/gemini-3-flash-preview-image` for images. Agent loops use `stepCountIs(50)`.

## Frontend changes

- **Dashboard (`/studio`)**: replace hardcoded `projects` / `inProgress` arrays with `useSuspenseQuery(listCampaigns)`. Empty state CTA when none.
- **Wizard (`/studio/new`)**:
  - Step 1 (Products): real drag-and-drop + file picker, upload directly to the public bucket, then `recordAsset`. Real thumbnails from the public URL.
  - Step 2 (Inspiration): same upload mechanic. "AI learning your taste" panel reads the streamed brief fields as they arrive.
  - Step 3 (Brief): real editable fields persisted via `updateBrief`.
  - Step 4 (Generate): submits, shows the real progress stream, redirects to `/studio/c/$id` when ready.
- **Workspace (`/studio/c/$id`)**:
  - Variant grid renders real generated images.
  - Inspector reads real `reasoning` + `match_score` + DNA breakdown from the variant row.
  - Regenerate + the quick-action chips ("More like this", "Make it warmer", etc.) call `regenerateVariant` with the right instruction.
  - "Talk to the Director" wired to `/api/director`.
- **Errors**: surface 402 (credits) and 429 (rate limit) as clear toasts that match the existing aesthetic.
- **Hydration fix** (quietly, while I'm in here): the "Thursday · June 25" greeting in the dashboard renders `new Date()` during SSR vs client and is the current hydration warning — move it behind `useHydrated()` or compute on the server.

## What gets removed

- All mock arrays (`projects`, `variants`, `inProgress`, fake "Morning Ritual" breadcrumbs).
- Decorative `FakeStream` — replaced by real streamed analysis lines.
- Hard-coded gradients used as fake cover art (real generated images instead).

## Out of scope

- Multi-user / per-account isolation (single shared workspace until you add auth).
- Export-to-Figma / scheduled publishing.
- Billing UI (the "Upgrade" link stays a link).

## Privacy note (worth flagging once)

No auth means every visitor sees every campaign in this project. Fine for solo/demo use, not for sharing the URL publicly with real client work in it. When you want isolation, add Lovable Cloud auth + tighten RLS — small follow-up, not a rewrite.

## Order of build

1. Enable Lovable Cloud → migrations for tables + open RLS + GRANTs; create the two public buckets.
2. Server fns: `listCampaigns`, `createCampaign`, `recordAsset`, `getCampaign`. Wire dashboard + wizard step 1 (real upload + thumbnails).
3. `analyzeCampaign` + SSE progress route. Wire wizard steps 2–3 with real streamed brief.
4. `generateVariants` + image streaming route. Wire wizard step 4 → workspace.
5. Workspace inspector + `regenerateVariant` + director chat route.
6. Polish: error toasts, empty states, loading skeletons matching the existing aesthetic; quiet hydration fix.
