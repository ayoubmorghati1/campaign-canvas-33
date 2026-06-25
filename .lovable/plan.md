## Add "How It Was Built" section to the landing page

Insert a new section in `src/routes/index.tsx` between `InsideStudio` and `FinalCTA`, matching the existing premium editorial aesthetic (warm paper background, ink type, violet/lime/clay accents, GlassCard, Chip, SectionLabel, MotionFadeUp primitives).

### Structure

```text
<HowItWasBuilt />
  ├── Section header (SectionLabel + serif title + muted subtitle)
  ├── 2×2 grid of GlassCard
  │   ├── Card 1 — Product Thinking (violet accent chip)
  │   ├── Card 2 — AI Workflow (two-column list, footer note bar)
  │   ├── Card 3 — One Decision I Overrode (clay accent chip)
  │   └── Card 4 — Time Breakdown (3 stat tiles + caption)
  ├── Tools Used (3 elegant cards: ChatGPT, Lovable, GitHub)
  └── Explore the Code (GitHub repo CTA card → ayoubmorghati1/campaign-canvas-33)
```

### Visual rules

- Reuse existing primitives from `src/components/studio/primitives.tsx`: `GlassCard`, `Chip`, `SectionLabel`, `MotionFadeUp`, `PrimaryButton`. No new color tokens.
- Typography: serif headings (`font-serif`), mono for labels/stats accent, sans body — same scale as `InsideStudio`/`FeatureExport`.
- Cards: rounded-3xl, white/70 glass, soft shadow, subtle border, gentle hover lift (`hover:-translate-y-0.5 transition`).
- Stat tiles in Card 4: large serif number, mono uppercase label below.
- Two-column list in Card 2 uses a thin vertical divider on `md:` and stacks on mobile; footer note is a `bg-ink/[0.04]` pill strip.
- Tools row: 3 equal cards with brand-style monogram square, role bullet list, muted border.
- Repo CTA: full-width GlassCard, GitHub `lucide-react` icon in an ink square, title + subtitle left, `PrimaryButton` right opening the GitHub URL in a new tab (`target="_blank" rel="noreferrer"`).
- Grid responsive: `grid-cols-1 md:grid-cols-2` for the 2×2; `grid-cols-1 sm:grid-cols-3` for tools and stats.
- All entrance animations via `MotionFadeUp` with staggered delays, matching neighboring sections.

### Files

- `src/routes/index.tsx` — add `HowItWasBuilt` function component and render it between `<InsideStudio />` and `<FinalCTA />`. Add `Github` import from `lucide-react`. No other files change.

No business logic, no new routes, no backend work.
