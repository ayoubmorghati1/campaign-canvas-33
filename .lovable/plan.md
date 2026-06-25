## What I'll remove (nothing real behind it)

**Top nav (`SiteNav`)**
- "Sign in" link → no auth exists
- "Pricing" link → pricing page doesn't exist
- "Customers" link → removing the testimonial it points to

**Landing page sections (`src/routes/index.tsx`)**
- `PricingTeaser` — fake tiers/prices
- `LogoCloud` — invented brand names ("NORDH", "Atelier 9", "kinto"…)
- `Testimonial` — fabricated quote from "Amelia Marsh, NORDH"
- Hero stat strip ("2 min / 12+ / 96% avg DNA match") — invented numbers
- "See pricing" button in the `FinalCTA`

**Footer (`SiteFooter`)**
- "SOC 2 · in progress" + "v 0.9 · beta" pills — not true
- Resources column (Changelog / Playbook / Templates / API / Status) — none exist
- Company column (About / Customers / Careers / Press / Contact) — none exist
- Privacy / Terms / Security links — no pages
- Keep: logo, tagline, and a slim Product column (Studio, New campaign) that links to real routes

## What stays (everything works)

Hero · How it works · AI Creative Director · Campaign DNA · Explain this campaign · Inspiration Inspector · Multi-platform export · Inside the studio · Final CTA → "Open the studio"

## Files touched

- `src/routes/index.tsx` — delete `PricingTeaser`, `LogoCloud`, `Testimonial`, hero stat block, "See pricing" button, and their imports
- `src/components/studio/SiteNav.tsx` — remove Sign in / Pricing / Customers nav items; rewrite footer columns to real links only

No backend or studio-app changes — those already work.
