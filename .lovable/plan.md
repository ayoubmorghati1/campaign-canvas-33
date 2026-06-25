## Plan

### 1. Fix the broken variant navigation
- Convert the campaign route into a real parent route by rendering an `<Outlet />` when the URL matches `/studio/c/:id/v/:variantId`.
- This is why clicking appears to do nothing: the link targets the child route, but the parent campaign component keeps rendering the grid instead of letting the variant page mount.

### 2. Make variant cards clearly openable
- Keep the whole image/card as a proper TanStack `<Link>` so the browser status bar, cmd-click, hover, and navigation all work.
- Add a subtle hover treatment and explicit “Open” affordance on the card so it feels clickable, not like a static image tile.

### 3. Fix masonry sizing without dead blank space
- Root variant cards will continue to hug the real image height.
- Reframed derivatives will keep their intended frame ratio only where needed.
- Avoid forced empty boxes that make tiles look broken.

### 4. Verify the flow
- Open the campaign grid.
- Click a variant.
- Confirm the URL changes to `/studio/c/.../v/...` and the dedicated variant workspace renders.
- Confirm returning to “All variants” works.