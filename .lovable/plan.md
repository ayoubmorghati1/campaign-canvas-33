# Campaign Studio — Full Product Plan

You're right: a one-page "upload your photo" screen is not a product. We're building this as a real SaaS — a marketing site that sells it, and an actual studio app behind it that a team would use every day. Light mode, vibrant, alive.

## Design direction (committed)

No more "minimal monochrome editorial." We're going **Premium Creative Tool** — think Linear/Framer/Runway energy:

- **Palette:** warm off-white base (#FAF8F4), deep ink (#0F0F12), with three saturated accents working together:
  - **Electric Violet** #6E56FF (primary CTAs, brand)
  - **Acid Lime** #D4FF3F (highlight chips, "live" states, AI thinking)
  - **Warm Clay** #F26A4B (secondary accent, hover, Campaign DNA chips)
  - Soft glass surfaces (frosted blurs over gradient blooms)
- **Typography:** Instrument Serif (italic display) + Geist Sans (body) + Geist Mono (AI readouts, codes, chips). Distinctive, not Inter-default.
- **Surfaces:** large rounded cards (24–32px radius), soft layered shadows, animated gradient blobs in hero, glassmorphic floating panels, colored status dots, tactile chips.
- **Motion:** Framer Motion. Hero product preview auto-cycles upload → analyze → campaign. Cards lift on hover. Chips pulse. Numbers count up. Background blobs drift.

## Architecture

```text
/                  Landing (marketing)
/studio            App shell (sidebar + canvas)
  /studio          Projects dashboard (default)
  /studio/new      New campaign wizard (upload → analyze → brief → generate)
  /studio/c/$id    Campaign workspace (canvas + right inspector)
  /studio/brand    Brand kits
  /studio/archive  Previous explorations
/pricing           Pricing page (also linked from landing)
/sign-in           Auth placeholder
```

TanStack Start file-based routes under `src/routes/`. Layout route `studio.tsx` renders the sidebar + Outlet for all `/studio/*` children. No auth wired yet — visual product only — but routes are real, navigable, and shareable.

## Landing page (`/`) sections

A real, long, scrollable marketing page — not a single hero:

1. **Sticky nav** — logo, Product / Features / Pricing / Customers, Sign in, "Start free" pill CTA.
2. **Hero** — oversized headline "Build your next campaign in minutes, not weeks." Subhead. Dual CTA ("Start free" + "Watch the studio"). Right side: animated product preview card cycling Upload → AI Analysis stream → Campaign output. Soft violet/lime gradient bloom behind it.
3. **Logo cloud** — "Trusted by teams shipping fast" with 6 muted brand wordmarks.
4. **How it works** — 3 tactile steps (Upload → Analyze → Generate) each with its own colored card, icon, mini UI snippet.
5. **Feature: AI Creative Director** — left copy, right mini UI of the live AI thinking stream with lime status dots.
6. **Feature: Campaign DNA** — colored chip row (Mood / Palette / Typography / Voice / Confidence%) on a tactile card.
7. **Feature: Explain This Campaign** — floating bubble UI with the reasoning text.
8. **Feature: Inspiration Inspector** — annotated reference image with hotspot callouts (lighting, composition, palette).
9. **Feature: Multi-platform export** — strip of platform variants (IG Feed/Story, LinkedIn, X, Pinterest) with correct aspect ratios.
10. **"Inside the studio" preview band** — wide screenshot-style render of the actual studio dashboard (sidebar + canvas + inspector) to prove this is a real product, not a demo.
11. **Testimonial** — pull quote with photo, name, role.
12. **Pricing** — 3 tiers (Free / Studio $29 / Agency $99), feature checklist, monthly/yearly toggle. Highlighted middle tier.
13. **Final CTA band** — full-width gradient, big headline, single CTA.
14. **Footer** — 4 columns (Product, Resources, Company, Legal) + wordmark + socials.

## Studio app (`/studio/*`) — the actual product

This is what users open after signing up. It looks and behaves like a real workspace:

- **Left sidebar (collapsible):** brand workspace switcher at top, then nav (Projects, New Campaign, Brand Kits, Explorations, Exports, Settings), user pill at bottom.
- **Top bar:** breadcrumb (Project › Campaign), share button, export button, avatar stack.
- **`/studio` dashboard:** greeting, "Continue working" row of in-progress campaigns, project grid (Campaign Cards with cover image, name, platform chips, DNA color strip, last-edited timestamp), empty-state CTA card to start a new campaign.
- **`/studio/new` wizard:** 4-step horizontal stepper (Products → Inspiration → Brief → Generate). Each step is a full screen with progress bar, back/next, real upload zones with thumbnails, then the AI analysis stream playing live, then the editable Creative Brief card, then platform/voice/freedom controls + Generate.
- **`/studio/c/$id` campaign workspace:** three-pane layout — left nav sidebar, center canvas with the generated Campaign Card grid (each platform variant as its own card with caption, CTA, hashtags, Remix / Export / Copy), right inspector rail with Creative Brief summary, Brand Voice picker (chip group), Creative Freedom slider, platform multi-select, Campaign DNA chip strip, and "Explain This Campaign" expandable panel.

## Tech & implementation order

Stack already in place: TanStack Start, Tailwind v4, shadcn. Adding `framer-motion` for animation, `lucide-react` already available for icons (used sparingly — domain-specific custom SVGs for hero/feature illustrations).

Build order in one pass:

1. **Tokens & fonts** — wire palette, fonts (Instrument Serif + Geist via Google Fonts `<link>` in `__root.tsx`), shadow scale, motion defaults in `src/styles.css`.
2. **Shared primitives** — `GradientBloom`, `GlassCard`, `Chip`, `StatusDot`, `SectionLabel`, `PrimaryButton`, `SecondaryButton`.
3. **Landing route** (`src/routes/index.tsx`) — all 14 sections, with the animated hero product preview as a self-contained component cycling through 3 states.
4. **Studio layout** (`src/routes/studio.tsx`) — sidebar + topbar + Outlet, with a `StudioSidebar` component and active-route highlighting.
5. **Studio dashboard** (`src/routes/studio.index.tsx`) — populated with mocked project data so it looks real (~8 campaigns across 2 brands).
6. **New campaign wizard** (`src/routes/studio.new.tsx`) — stepper with all 4 steps, mocked AI stream animation.
7. **Campaign workspace** (`src/routes/studio.c.$id.tsx`) — canvas + inspector, mocked campaign data, working Remix/Export buttons (UI only).
8. **Pricing route**, sign-in stub, footer pages.
9. **Real imagery** — generate hero product mockup, 3 reference inspiration images, 6 campaign cover images via image generation, save to `src/assets/`.
10. **Polish pass** — motion timing, hover states, focus rings, mobile responsive (sidebar collapses to bottom tab bar on mobile, landing stacks).

## What I'm explicitly NOT doing (per your reaction)

- No single-page upload screen as the home page.
- No all-white minimalism. Real color, used with intention.
- No editorial-magazine restraint. This is a tool, not a Kinfolk issue.
- No generic purple gradient on white — the palette is violet + lime + clay, used together.
- No mock "Lorem ipsum" — every label, caption, brand voice option, pricing feature, and testimonial is written in the Campaign Studio voice from your PRD.

## UX improvements I'm pushing on top of your PRD

- **Wizard, not a wall.** Upload, inspiration, brief, and generate are 4 steps, not one giant page. Reduces overwhelm, lets the AI analysis feel earned.
- **Persistent Creative Brief rail** in the workspace — the user can edit it mid-flow and re-remix, not just see it once.
- **Brand Kits** as a first-class object — upload product/logo/palette once, reuse across campaigns. This is the difference between a toy and a tool.
- **"Continue working" row** on the dashboard — campaigns are never lost, picks up exactly where you left off. Real-product behavior.
- **Confidence % on every campaign** — surfaces the AI's certainty, builds trust, justifies the Remix button.
- **Mobile:** landing fully responsive; studio is desktop-first with a graceful tablet layout (mobile shows a "Studio works best on desktop" prompt with a deep link). Honest about the product's nature.

After approval I'll build this end-to-end in one pass, then we iterate from a real product, not a placeholder.