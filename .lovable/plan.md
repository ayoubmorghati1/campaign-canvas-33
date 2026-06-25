# Cleanup + working Brief/Activity + per-variant reframe

Fixing the gaps you called out. Scope is UI + a small server addition for reframing; no schema changes.

## 1. Sidebar cleanup (`src/routes/studio.tsx`)

- Remove **Sign in** link in `SiteNav` is not relevant here — but you mean the studio sidebar. Remove:
  - **Brand Kits** (`/studio/brand`) — not built, returns Not Found.
  - **Explorations** (`/studio/archive`) — not built.
  - **Exports** (`/studio/exports`) — not built.
- That collapses the sidebar to a single section: **Projects** and **New campaign**. Drop the now-empty "Library" group.
- Also remove the matching footer/nav links pointing at those routes in `SiteNav.tsx` ("Brand Kits", "Exports") so nothing dead-ends.
- Keep the brand switcher and free-plan card.

(If you'd rather keep Brand Kits as a placeholder "coming soon" page instead of removing it, say the word — default is remove.)

## 2. Campaign tabs: Brief + Activity become real (`src/routes/studio.c.$id.tsx`)

The three buttons (Variants / Brief / Activity) are currently decorative. Make them stateful:

- Lift a `tab` state. URL-sync via search param `?tab=brief` so refresh keeps you on the same tab.
- **Variants** — current grid (no change).
- **Brief** — render the real `creative_briefs` row: goal, audience, position, mood, palette swatches, visual direction, notes. Fields are editable inline and persist through the existing `updateBrief` server fn (already used in the wizard). Read-only "Regenerate brief" button calls `analyzeCampaign` again.
- **Activity** — chronological feed built from existing data:
  - Campaign created / status transitions (from `campaigns.created_at`, `updated_at`, `status`).
  - Each asset upload (`campaign_assets.created_at` + thumbnail).
  - Each variant generation (`variants.created_at` + title + match score).
  - Each director message (`director_messages`).
  Merge, sort desc, render as a timeline. No new tables — pure read from what's already in `getCampaign` plus `listDirectorMessages`.

## 3. Per-variant reframe (different aspect ratio / platform)

What you want: take an existing variant image and produce the same creative re-fit for, say, a Story (9:16) or a Pinterest pin (2:3), without re-rolling the whole campaign.

### UX
On the inspector (right rail) for the selected variant, add a **Reframe** block under Quick actions:

- Aspect ratio chips: **1:1**, **4:5**, **9:16**, **16:9**, **2:3**.
- Platform chip (optional, prefills aspect): IG Feed (4:5), IG Story / Reels (9:16), TikTok (9:16), Pinterest (2:3), LinkedIn (1:1), X (16:9).
- "Reframe" button → creates a **new sibling variant** in the same campaign with the chosen platform + aspect, image regenerated from the same brief + the original variant's image as a visual reference so composition, palette and subject carry over. Original variant stays untouched.
- New variant appears in the grid with a small "↳ reframed from {title}" chip.

### Server (`src/lib/campaigns.functions.ts`)
Add one server fn:

```ts
reframeVariant({ variantId, platform, aspect })
```

- Loads the source variant + its campaign brief.
- Calls the image model with: the source variant's `public_url` as a reference image, the brief's visual_direction, and an instruction like *"Recompose for {platform} at {aspect}; preserve subject, palette, mood, and lighting; reframe composition for the new ratio."*
- Maps aspect → `size` understood by the image route (e.g. `1024x1024`, `832x1280`, `720x1280`, `1280x720`, `832x1216`).
- Inserts a new `variants` row (same `campaign_id`, new `platform`, `direction_label = "Reframe · {aspect}"`, `reasoning.parent_variant_id = sourceId`).
- Returns the new variant id; the workspace invalidates and renders it.

No DB migration: `reasoning` is already `jsonb`, so the parent pointer rides along there.

## 4. Brand Kits route

Delete `studio.brand` references from the nav. If the route file exists, leave it for now (not in the build) or remove it — small follow-up, doesn't matter for the user-facing app once nav links are gone.

## Out of scope

- Multi-page Brief editor with versioning (the inline edit is enough for MVP).
- A separate Activity table — derived from existing rows is sufficient until volume justifies persistence.
- Bulk reframe ("make all of these 9:16") — easy follow-up once the single-variant path works.

## Order of build

1. Sidebar/nav cleanup.
2. Tabs wired up: Variants / Brief / Activity components + URL param.
3. `reframeVariant` server fn + inspector UI block.
4. Verify with a typecheck and a quick run through the wizard → workspace → reframe.
