import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Wand2, Layers3, Compass, Check } from "lucide-react";
import { HeroPreview } from "@/components/studio/HeroPreview";
import { SiteFooter, SiteNav } from "@/components/studio/SiteNav";
import {
  Chip,
  GlassCard,
  MotionFadeUp,
  PrimaryButton,
  SecondaryButton,
  SectionLabel,
  StatusDot,
} from "@/components/studio/primitives";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Campaign Studio — Your AI Creative Director" },
      { name: "description", content: "Upload your product. Show us the vibe. Ship a launch-ready marketing campaign in minutes — visuals, captions, and platform variants, all on-brand." },
      { property: "og:title", content: "Campaign Studio — Your AI Creative Director" },
      { property: "og:description", content: "Not an image generator. A creative director. From product photo to complete campaign in under 2 minutes." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-paper text-ink">
      <SiteNav />
      <Hero />
      <HowItWorks />
      <FeatureDirector />
      <FeatureDNA />
      <FeatureExplain />
      <FeatureInspector />
      <FeatureExport />
      <InsideStudio />
      <FinalCTA />
      <SiteFooter />
    </div>
  );
}

/* ---------- HERO ---------- */
function Hero() {
  return (
    <section className="relative">
      <div aria-hidden className="bloom-violet pointer-events-none absolute -top-32 -left-40 size-[640px] rounded-full opacity-50" />
      <div aria-hidden className="bloom-lime pointer-events-none absolute top-20 -right-32 size-[480px] rounded-full opacity-40" />
      <div aria-hidden className="bloom-clay pointer-events-none absolute top-[420px] left-1/3 size-[420px] rounded-full opacity-30" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 pt-20 pb-24 lg:grid-cols-[1.05fr_1.1fr] lg:gap-16">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground backdrop-blur"
          >
            <StatusDot tone="lime" /> Now shipping · Director v2
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-serif text-[64px] leading-[0.95] tracking-tight text-balance md:text-[88px]"
          >
            Build your next <span className="italic text-violet">campaign</span><br />
            in minutes, not weeks.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
          >
            Campaign Studio is your <em className="font-serif text-ink not-italic">AI Creative Director</em>.
            Upload your product, show us the vibe, and ship a complete launch —
            visuals, captions, and every platform variant — on-brand and on-time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <PrimaryButton to="/studio">
              Open the studio <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </PrimaryButton>
            <SecondaryButton to="/studio/new">
              <Sparkles className="size-4 text-violet" /> Try the wizard
            </SecondaryButton>
          </motion.div>

        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <HeroPreview />
        </motion.div>
      </div>
    </section>
  );
}


/* ---------- HOW IT WORKS ---------- */
function HowItWorks() {
  const steps = [
    {
      n: "01",
      label: "Upload",
      title: "Drop your product and the vibe.",
      copy: "Hand the AI your product shots and the references you wish your campaign looked like.",
      tone: "violet",
      icon: <Layers3 className="size-5" />,
    },
    {
      n: "02",
      label: "Analyze",
      title: "It studies your taste.",
      copy: "Composition, lighting, palette, typography, positioning — extracted into a Creative Brief you can edit.",
      tone: "lime",
      icon: <Compass className="size-5" />,
    },
    {
      n: "03",
      label: "Generate",
      title: "Ship a full campaign.",
      copy: "Visuals, captions, CTAs, and platform variants — all on-brand, all ready to export.",
      tone: "clay",
      icon: <Wand2 className="size-5" />,
    },
  ] as const;

  return (
    <section id="how" className="mx-auto max-w-7xl px-6 py-24">
      <MotionFadeUp className="max-w-3xl">
        <SectionLabel>How it works</SectionLabel>
        <h2 className="mt-4 font-serif text-5xl leading-[1.02] tracking-tight md:text-6xl">
          Three steps. <span className="italic text-clay">Zero blank pages.</span>
        </h2>
      </MotionFadeUp>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {steps.map((s, i) => (
          <MotionFadeUp key={s.n} delay={i * 0.1}>
            <div className="group relative h-full overflow-hidden rounded-3xl border border-border bg-white p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-glow">
              <div className="mb-6 flex items-center justify-between">
                <div className={`grid size-10 place-items-center rounded-xl ${s.tone === "violet" ? "bg-violet/10 text-violet" : s.tone === "lime" ? "bg-lime/40 text-ink" : "bg-clay/15 text-clay"}`}>
                  {s.icon}
                </div>
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{s.n} · {s.label}</span>
              </div>
              <h3 className="font-serif text-2xl leading-snug">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.copy}</p>
              <div aria-hidden className={`pointer-events-none absolute -bottom-14 -right-10 size-40 rounded-full opacity-50 ${s.tone === "violet" ? "bloom-violet" : s.tone === "lime" ? "bloom-lime" : "bloom-clay"}`} />
            </div>
          </MotionFadeUp>
        ))}
      </div>
    </section>
  );
}

/* ---------- FEATURE: DIRECTOR ---------- */
function FeatureDirector() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <MotionFadeUp>
          <SectionLabel>AI Creative Director</SectionLabel>
          <h2 className="mt-4 font-serif text-5xl leading-[1.02] tracking-tight">
            It doesn't <span className="line-through opacity-40">generate</span>. <br />
            It <span className="italic text-violet">decides</span>.
          </h2>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">
            Every prompt-based tool produces "Image #1." Campaign Studio thinks
            in brand systems — it reads your references, names what it sees,
            and explains why it made every choice.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              "Names the mood, palette, and visual hierarchy in plain English",
              "Edits its own brief — you stay in the driver's seat",
              "Confidence score on every direction it recommends",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <Check className="mt-0.5 size-4 text-violet" /> {t}
              </li>
            ))}
          </ul>
        </MotionFadeUp>

        <MotionFadeUp delay={0.15}>
          <GlassCard className="p-5">
            <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <span className="flex items-center gap-2"><StatusDot /> director · thinking</span>
              <span>96% conf</span>
            </div>
            <div className="space-y-3 rounded-2xl bg-ink p-5 font-mono text-[12.5px] text-paper/90">
              {[
                "› Reading reference set (6 images)",
                "› Detected: editorial composition, soft side-light",
                "› Palette: warm stone · olive · cream",
                "› Type: serif display + small caps caption",
                "› Position: premium ritual / quiet confidence",
                "› Brief assembled. Awaiting your approval ✦",
              ].map((l) => (
                <motion.div key={l} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="flex gap-2">
                  <span className="text-lime">✓</span>
                  <span>{l}</span>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </MotionFadeUp>
      </div>
    </section>
  );
}

/* ---------- FEATURE: CAMPAIGN DNA ---------- */
function FeatureDNA() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <MotionFadeUp delay={0.1} className="order-2 lg:order-1">
          <div className="relative rounded-[32px] border border-border bg-white p-6 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Campaign DNA</span>
              <Chip tone="violet" dot>fingerprint · v1</Chip>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { l: "Mood", v: "Calm Confidence", tone: "muted" },
                { l: "Emotion", v: "Quiet Luxury", tone: "violet" },
                { l: "Audience", v: "Premium Buyers", tone: "muted" },
                { l: "Voice", v: "Editorial", tone: "lime" },
              ].map((d) => (
                <div key={d.l} className="rounded-2xl bg-paper p-4">
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{d.l}</div>
                  <div className="font-serif text-xl italic">{d.v}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-ink p-4 text-paper">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest opacity-60">palette</div>
                <div className="mt-2 flex gap-1.5">
                  {["#E8E1D6", "#C9B99A", "#4F6D58", "#1C1C1C", "#F2E3D5", "#B87352"].map((c) => (
                    <span key={c} className="size-7 rounded-full ring-2 ring-paper/20" style={{ background: c }} />
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px] uppercase tracking-widest opacity-60">match</div>
                <div className="font-serif text-4xl">96%</div>
              </div>
            </div>
          </div>
        </MotionFadeUp>

        <MotionFadeUp className="order-1 lg:order-2">
          <SectionLabel>Campaign DNA</SectionLabel>
          <h2 className="mt-4 font-serif text-5xl leading-[1.02] tracking-tight">
            Every campaign gets a <span className="italic text-clay">fingerprint</span>.
          </h2>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">
            Mood, palette, typography, audience, voice, confidence — captured
            as tactile tokens you can hand to a designer, a developer, or your
            agency.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["Stone", "Cream", "Olive", "Editorial", "Organic Luxury", "Quiet"].map((c) => (
              <Chip key={c} tone={c === "Olive" ? "lime" : c === "Editorial" ? "violet" : c === "Stone" ? "clay" : "muted"}>{c}</Chip>
            ))}
          </div>
        </MotionFadeUp>
      </div>
    </section>
  );
}

/* ---------- FEATURE: EXPLAIN ---------- */
function FeatureExplain() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="relative overflow-hidden rounded-[40px] border border-border bg-ink p-12 text-paper md:p-16">
        <div aria-hidden className="bloom-violet pointer-events-none absolute -top-32 -right-20 size-[480px] rounded-full opacity-60" />
        <div aria-hidden className="bloom-lime pointer-events-none absolute -bottom-40 -left-10 size-[440px] rounded-full opacity-50" />
        <div className="relative grid items-center gap-12 lg:grid-cols-2">
          <MotionFadeUp>
            <SectionLabel className="text-paper/70">Explain this campaign</SectionLabel>
            <h2 className="mt-4 font-serif text-5xl leading-[1.02] tracking-tight">
              Trust the AI <span className="italic text-lime">because it shows its work</span>.
            </h2>
            <p className="mt-5 max-w-md text-lg text-paper/70">
              Tap any campaign and Campaign Studio narrates the creative
              decisions out loud — why this lighting, why this caption length,
              why LinkedIn gets a longer hook than Instagram.
            </p>
          </MotionFadeUp>

          <MotionFadeUp delay={0.15}>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-paper/60">
                <span className="grid size-6 place-items-center rounded-full bg-lime text-ink">✦</span>
                Director's note
              </div>
              <p className="font-serif text-2xl leading-snug italic text-paper">
                "We preserved the warm editorial lighting from your references
                while simplifying the composition to maximize product focus.
                Instagram uses a shorter CTA; LinkedIn expands the
                storytelling because that audience reads more before clicking."
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Chip tone="lime" dot>96% confidence</Chip>
                <Chip tone="violet">3 alt directions saved</Chip>
              </div>
            </div>
          </MotionFadeUp>
        </div>
      </div>
    </section>
  );
}

/* ---------- FEATURE: INSPECTOR ---------- */
function FeatureInspector() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
        <MotionFadeUp>
          <SectionLabel>Inspiration Inspector</SectionLabel>
          <h2 className="mt-4 font-serif text-5xl leading-[1.02] tracking-tight">
            See what the AI <span className="italic text-violet">saw</span>.
          </h2>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">
            Hover any reference image to surface the lighting, composition,
            palette, and product placement Campaign Studio learned from it.
            Inspection turns "the AI did something" into "the AI did this,
            here's why."
          </p>
        </MotionFadeUp>

        <MotionFadeUp delay={0.15}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] border border-border bg-gradient-to-br from-stone-200 via-stone-100 to-clay/20 shadow-soft">
            <div className="absolute inset-0 bg-[radial-gradient(120%_60%_at_50%_0%,oklch(0.95_0.05_85)_0%,transparent_60%)]" />
            {/* fake product silhouette */}
            <div className="absolute left-1/2 top-1/2 h-2/3 w-[24%] -translate-x-1/2 -translate-y-1/2 rounded-[40%] bg-gradient-to-b from-stone-50 via-stone-200 to-stone-400 shadow-2xl" />
            {/* hotspots */}
            {[
              { top: "18%", left: "20%", label: "Soft side-light", tone: "violet" },
              { top: "62%", left: "70%", label: "Stone surface", tone: "clay" },
              { top: "38%", left: "55%", label: "Rule of thirds", tone: "lime" },
            ].map((h) => (
              <div key={h.label} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ top: h.top, left: h.left }}>
                <div className="relative">
                  <span className={`absolute inset-0 animate-ping rounded-full opacity-50 ${h.tone === "violet" ? "bg-violet" : h.tone === "lime" ? "bg-lime" : "bg-clay"}`} />
                  <span className={`relative grid size-6 place-items-center rounded-full text-[10px] font-bold text-white ring-4 ring-white/40 ${h.tone === "violet" ? "bg-violet" : h.tone === "lime" ? "bg-lime text-ink" : "bg-clay"}`}>+</span>
                </div>
                <div className="mt-1.5 whitespace-nowrap rounded-md bg-ink px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-paper">
                  {h.label}
                </div>
              </div>
            ))}
            <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 font-mono text-[10px] uppercase tracking-widest backdrop-blur">
              reference · pinterest/ritual-12
            </div>
          </div>
        </MotionFadeUp>
      </div>
    </section>
  );
}

/* ---------- FEATURE: EXPORT ---------- */
function FeatureExport() {
  const variants = [
    { name: "IG Feed", w: "aspect-square" },
    { name: "IG Story", w: "aspect-[9/16]" },
    { name: "LinkedIn", w: "aspect-[1.91/1]" },
    { name: "X", w: "aspect-[16/9]" },
    { name: "Pinterest", w: "aspect-[2/3]" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <MotionFadeUp className="mx-auto max-w-3xl text-center">
        <SectionLabel className="justify-center">Multi-platform export</SectionLabel>
        <h2 className="mt-4 font-serif text-5xl leading-[1.02] tracking-tight md:text-6xl">
          One campaign. <span className="italic text-violet">Every surface.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
          The AI rewrites the caption, retunes the CTA, and recrops the visual
          for every platform — so your brand stays consistent and your work
          stays light.
        </p>
      </MotionFadeUp>

      <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-5">
        {variants.map((v, i) => (
          <MotionFadeUp key={v.name} delay={i * 0.06}>
            <div className="group rounded-2xl border border-border bg-white p-3 shadow-soft transition-all hover:-translate-y-1 hover:shadow-glow">
              <div className={`relative w-full overflow-hidden rounded-xl bg-gradient-to-br ${i % 3 === 0 ? "from-stone-200 to-stone-300" : i % 3 === 1 ? "from-violet/15 via-violet/10 to-lime/30" : "from-clay/20 to-stone-200"} ${v.w}`}>
                <div className="absolute right-2 bottom-2 rounded-full bg-white/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest">{v.name}</div>
              </div>
            </div>
          </MotionFadeUp>
        ))}
      </div>
    </section>
  );
}

/* ---------- INSIDE THE STUDIO ---------- */
function InsideStudio() {
  return (
    <section id="inside" className="mx-auto max-w-7xl px-6 py-24">
      <MotionFadeUp className="max-w-3xl">
        <SectionLabel>Inside the studio</SectionLabel>
        <h2 className="mt-4 font-serif text-5xl leading-[1.02] tracking-tight md:text-6xl">
          A real workspace, not a <span className="italic text-clay">prompt box</span>.
        </h2>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">
          Brand Kits, project history, side-by-side variants, and an inspector
          that explains every decision. Built for teams that ship every week.
        </p>
      </MotionFadeUp>

      <MotionFadeUp delay={0.15} className="mt-12">
        <div className="relative overflow-hidden rounded-[32px] border border-border bg-white shadow-soft">
          <div aria-hidden className="bloom-violet pointer-events-none absolute -top-10 right-0 size-72 rounded-full opacity-30" />
          {/* mini chrome */}
          <div className="flex items-center gap-3 border-b border-border bg-paper px-5 py-3">
            <div className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-clay/70" />
              <span className="size-2.5 rounded-full bg-lime/70" />
              <span className="size-2.5 rounded-full bg-violet/70" />
            </div>
            <div className="ml-2 rounded-full bg-white px-3 py-1 font-mono text-[11px] text-muted-foreground">
              studio.campaign-studio.app / nordh / morning-ritual
            </div>
          </div>
          {/* fake app grid */}
          <div className="grid min-h-[480px] grid-cols-[200px_1fr_280px]">
            {/* sidebar */}
            <div className="border-r border-border bg-paper/60 p-4">
              <div className="mb-4 flex items-center justify-between rounded-lg bg-white p-2 shadow-soft">
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-md bg-gradient-to-br from-violet to-clay" />
                  <div className="text-xs font-medium">NORDH</div>
                </div>
                <span className="font-mono text-[9px] text-muted-foreground">brand</span>
              </div>
              <div className="space-y-1 text-xs">
                {[
                  { l: "Projects", a: true },
                  { l: "New campaign", a: false },
                  { l: "Brand Kits", a: false },
                  { l: "Explorations", a: false },
                  { l: "Exports", a: false },
                ].map((i) => (
                  <div key={i.l} className={`flex items-center justify-between rounded-md px-2 py-1.5 ${i.a ? "bg-ink text-paper" : "text-muted-foreground hover:bg-white"}`}>
                    <span>{i.l}</span>
                    {i.a && <span className="font-mono text-[9px] opacity-70">·</span>}
                  </div>
                ))}
              </div>
            </div>
            {/* canvas */}
            <div className="bg-paper p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">project</div>
                  <div className="font-serif text-2xl italic">Morning Ritual</div>
                </div>
                <div className="flex gap-2">
                  <Chip tone="muted">3 directions</Chip>
                  <Chip tone="violet" dot>auto-saving</Chip>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="rounded-xl bg-white p-2 shadow-soft">
                    <div className={`aspect-square w-full rounded-lg bg-gradient-to-br ${i % 3 === 0 ? "from-stone-200 to-stone-300" : i % 3 === 1 ? "from-violet/20 to-lime/30" : "from-clay/20 to-stone-200"}`} />
                    <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                      <span>v{i + 1}</span>
                      <span>9{6 - i}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* inspector */}
            <div className="border-l border-border bg-white/80 p-5 backdrop-blur">
              <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Creative Brief</div>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">mood</div>
                  <div className="font-serif text-lg italic">Calm Confidence</div>
                </div>
                <div>
                  <div className="mb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">brand voice</div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Minimal", "Luxury", "Editorial", "Bold"].map((v, i) => (
                      <Chip key={v} tone={i === 2 ? "violet" : "muted"}>{v}</Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">creative freedom</div>
                  <div className="relative h-1.5 w-full rounded-full bg-muted">
                    <div className="absolute inset-y-0 left-0 w-2/3 rounded-full bg-gradient-to-r from-violet to-clay" />
                    <div className="absolute left-2/3 top-1/2 size-3.5 -translate-y-1/2 rounded-full border-2 border-violet bg-white shadow" />
                  </div>
                  <div className="mt-1 flex justify-between font-mono text-[9px] uppercase text-muted-foreground"><span>safe</span><span>wild</span></div>
                </div>
                <button className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink py-2 text-xs font-medium text-paper">✦ Remix campaign</button>
              </div>
            </div>
          </div>
        </div>
      </MotionFadeUp>
    </section>
  );
}



/* ---------- FINAL CTA ---------- */
function FinalCTA() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="relative overflow-hidden rounded-[40px] bg-ink p-16 text-paper md:p-24">
        <div aria-hidden className="bloom-violet pointer-events-none absolute -top-20 -left-10 size-[520px] rounded-full opacity-70" />
        <div aria-hidden className="bloom-lime pointer-events-none absolute -bottom-20 right-10 size-[420px] rounded-full opacity-60" />
        <div className="relative max-w-3xl">
          <h2 className="font-serif text-5xl leading-[0.98] tracking-tight md:text-7xl">
            Your next campaign is <span className="italic text-lime">waiting</span>.
          </h2>
          <p className="mt-6 max-w-xl text-lg text-paper/70">
            Open the studio. Drop a product photo. Show us the vibe. We'll
            handle the rest — and you'll know exactly why every decision was
            made.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/studio" className="inline-flex items-center gap-2 rounded-full bg-lime px-6 py-3.5 text-sm font-medium text-ink shadow-glow transition-all hover:opacity-90">
              Open the studio <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
