## Fix the crash, then make cards hug the image

### 1. Stop the hooks crash (the real reason clicks "do nothing")

In `src/routes/studio.c.$id.tsx`, `CampaignWorkspace` declares `useMutation` after an early `if (!data) return …`. That breaks React's hook order on the second render and throws `Rendered more hooks than during the previous render`, which kicks the page into the error boundary — that's why the variant cards stop responding and the layout looks half-broken.

Fix: move every hook (`useMutation`, any `useMemo`/`useState` currently below the early return) **above** the `if (!data)` guard. Same audit pass on `Inspector` and `VariantWorkspace` so we don't regress the same bug elsewhere.

### 2. Make the variant card hug its image

Today `VariantCard` wraps the image in a container with a forced `aspectClass(reframed)` (default `aspect-[4/5]` when there's no reframe). When the underlying generated image is 9:16 or 1:1, the box doesn't match — hence the blank space below the photo.

Switch the card to image-driven sizing:

- Drop the forced `aspect-[…]` wrapper for root variants.
- Render `<img>` as a normal block element (`w-full h-auto`) so the card height equals the image's natural height.
- Keep the badges (`% on brief`, platform, `+N formats`) and the caption block absolutely positioned over the image, as today.
- For **reframed** derivatives (which have an explicit target aspect like 9:16), keep the forced aspect ratio — that's intentional, because the source pixels may not yet match and we want the card to preview the target frame.

Net effect: in the grid, IG Story variants render tall, IG Feed renders square, Pinterest renders 2:3 — every card hugs its image, no dead space.

### 3. Verify

- Reload `/studio/c/$id` and confirm no error-boundary, cards are clickable, navigation to `/studio/c/$id/v/$variantId` works.
- Confirm the grid no longer shows blank vertical space under shorter images.
- Confirm reframed derivatives on the subpage still render in their target aspect.

### Out of scope

No changes to data model, server functions, inspector contents, or the variant subpage layout — only the two issues above.
