# Campaign workspace: inspector UX + real reframe downloads

Three problems, one pass. Frontend-only.

## 1. Inspector becomes a contextual drawer, not a sticky rail

Today the right rail is always mounted, even on Brief/Activity, and the inspector is jammed into a 380px column that scrolls awkwardly next to a totally unrelated tab. That's the cramped feeling.

New behavior (Linear / Apple Photos energy):

- The right column is removed from the page grid. Variants tab becomes full-width — a roomier 3-up / 4-up grid with more air.
- Clicking a variant opens an **Inspector sheet** sliding in from the right (shadcn `Sheet`, width ~560px on desktop, full-width on mobile, with a soft backdrop and ESC/click-outside to close).
- The sheet has proper padding (p-8), a large hero preview that respects the variant's true aspect ratio, and clear sections: Caption · Why it works · Inspiration DNA · Quick actions · Reframe.
- Brief and Activity tabs no longer carry a phantom right rail — they get the full canvas width they need.
- Selection state is URL-synced (`?tab=variants&v=<id>`) so the sheet survives refresh and back/forward.

## 2. Director chat moves out of the rail

The Director was glued to the bottom of the inspector, so it disappeared whenever the inspector wasn't relevant and shared scroll with it.

- Director becomes a persistent floating pill at the bottom-right of the workspace ("Talk to Director", with unread dot).
- Clicking opens a dedicated chat panel (popover/sheet, ~420px) that's available from any tab.
- Conversation history and the existing `directorChat` server function are unchanged.

## 3. Reframe actually produces the right aspect ratio

Today the model returns a near-square PNG no matter what aspect we ask for, so the downloaded file is wrong. Cloudflare Workers can't run sharp, so we crop in the browser.

- New helper `cropToAspect(url, aspect)` loads the variant image into a canvas, center-crops to the target aspect (1:1 / 4:5 / 9:16 / 16:9 / 2:3), exports a Blob, and triggers download with a sensible filename (`<campaign>-<platform>-<aspect>.png`).
- Variant cards and the inspector preview render reframed variants in their `reframed_aspect` ratio container (using the existing `reframed_aspect` column), so what you see matches what you download.
- The "Download" affordance on every variant (card hover + inspector) routes through this crop helper instead of a raw `<a href>`. Originals download at their native aspect.
- Server `reframeVariant` is unchanged — we already store `reframed_aspect`; the fix is purely on the client render + download path.

## Files touched

- `src/routes/studio.c.$id.tsx` — drop the 2-col grid; add `Sheet` for inspector; add floating Director launcher + panel; sync `?v=` in search; pass aspect to cards.
- `src/components/studio/primitives.tsx` — small `AspectFrame` helper if useful.
- New `src/lib/download-image.ts` — `cropToAspect` + `downloadVariant` utilities.
- `VariantCard` and `Inspector` — use `AspectFrame` and the new download helper.

## Out of scope

- Aspect ratio presets in Reframe stay as-is (you said that's fine).
- No backend / schema changes.
- Director streaming, export-all behavior unchanged.
