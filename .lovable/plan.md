# Variant detail subpage with grouped children

Yes — the drawer is the wrong container for what this needs to do. Promote each variant to its own route, and group reframes/regenerations as children of the original. That's the Apple Photos / Linear sub-issue model and it scales as the user spins more derivatives.

## New route

`src/routes/studio.c.$id.v.$variantId.tsx` — full-page variant workspace.

Layout (single column, generous canvas — no cramped 380px rail):

```text
[ ← back to all variants ]                          [ Share ] [ Download ]

  PARENT VARIANT                                              ── 92% on brief
  Title in editorial serif · IG Feed · 4:5
  ┌────────────────────────────────────┐
  │                                    │     Caption
  │   large hero image, true aspect    │     Why it works
  │                                    │     Inspiration DNA
  │                                    │     Quick actions
  └────────────────────────────────────┘     Reframe / regenerate panel

  ─────────────────────────────────────────────
  DERIVATIVES · 4
  [ IG Story 9:16 ] [ TikTok 9:16 ] [ Pinterest 2:3 ] [ + new format ]
   thumbnail strip — clicking promotes that child to the hero
```

Selection of which derivative is "in focus" lives in the URL: `?focus=<childId>`. Default is the parent. The hero swap is instant (just changes which image fills the hero slot); the surrounding controls update to match.

## Parent / child grouping

Add a `parent_variant_id UUID REFERENCES public.variants(id) ON DELETE CASCADE` column (nullable; null = top-level variant on the campaign).

- `reframeVariant` writes `parent_variant_id = sourceVariant.parent_variant_id ?? sourceVariant.id` so all reframes of the same image share one root, regardless of which sibling the user clicked from.
- `regenerateVariant` keeps `parent_variant_id` as-is (regenerate replaces the same slot conceptually).
- `getCampaign` returns variants as before; the UI groups by `parent_variant_id || id` to build the tree.

Campaign grid (`?tab=variants`) shows only roots (variants with no parent). Each card gets a small "+N formats" badge when it has children. Clicking the card navigates to the subpage instead of opening a drawer.

## What goes away

- The `Sheet` inspector and the variant-selection URL param (`?v=`) on the campaign page — replaced by the subroute.
- Reframe inside a drawer next to unrelated context — now lives in the variant's own page where it belongs.

## What stays

- Floating Director button (works from any tab and from the subpage).
- Brief and Activity tabs unchanged.
- `cropToAspect` download helper unchanged.

## Files

- `supabase/migrations/<new>.sql` — `ALTER TABLE public.variants ADD COLUMN parent_variant_id UUID REFERENCES public.variants(id) ON DELETE CASCADE;` + index on `parent_variant_id`.
- `src/lib/campaigns.functions.ts` — set `parent_variant_id` in `reframeVariant`; add a `getVariant(id)` server fn that returns the variant + its siblings/children for the subpage.
- `src/routes/studio.c.$id.v.$variantId.tsx` — new subpage (hero + side controls + derivative strip).
- `src/routes/studio.c.$id.tsx` — campaign grid shows only roots with a child-count badge; cards link to the subpage; remove the inspector Sheet.

## Out of scope

- Renaming/reordering derivatives.
- Deleting individual derivatives (can add later — easy with the new schema).
- Comparing two derivatives side-by-side.
