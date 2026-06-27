import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Github } from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/studio/SiteNav";
import { GlassCard, PrimaryButton, SectionLabel } from "@/components/studio/primitives";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Campaign Studio — Engineering Submission" },
      {
        name: "description",
        content:
          "Campaign Studio: an AI Creative Director for product marketing. Custom AI gateway with retry, failover, and structured logging.",
      },
    ],
  }),
  component: SubmissionPage,
});

const ENGINEERING_ITEMS = [
  "Custom AI Gateway",
  "OpenAI + Gemini Providers",
  "Retry + Exponential Backoff",
  "Provider Failover",
  "Normalized Responses",
  "Structured Logging",
  "User-safe Errors",
  "30 Gateway Tests Passing",
] as const;

const GATEWAY_TOPICS = [
  {
    title: "AI Gateway",
    copy: "Single abstraction layer for all AI requests — text, vision, and image generation.",
  },
  {
    title: "Retry Logic",
    copy: "Automatic retries using exponential backoff on transient provider failures.",
  },
  {
    title: "Provider Failover",
    copy: "Primary provider exhaustion triggers fallback (OpenAI ↔ Gemini) without frontend changes.",
  },
  {
    title: "Normalized Responses",
    copy: "The frontend receives one consistent response shape regardless of which provider served the request.",
  },
  {
    title: "Structured Logging",
    copy: "JSON logs for retries, latency, provider selection, and failures — one line per event.",
  },
  {
    title: "User-safe Errors",
    copy: "Internal provider errors are converted into safe, actionable messages for the UI.",
  },
  {
    title: "Configuration",
    copy: "Models, primary provider, retry limits, and mock mode — all via environment variables.",
  },
] as const;

function SubmissionPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-6 pt-16 pb-8 md:pt-24">
        <header className="mb-20 border-b border-border pb-12">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Engineering submission
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-[1.02] tracking-tight md:text-6xl">
            Campaign <span className="italic text-violet">Studio</span>
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Product demo and backend engineering overview for review.
          </p>
          <div className="mt-6">
            <PrimaryButton to="/studio">
              Open the studio <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </PrimaryButton>
          </div>
        </header>

        <SectionProduct />
        <SectionHowBuilt />
        <SectionCode />
      </main>
      <SiteFooter />
    </div>
  );
}

function SectionProduct() {
  return (
    <section id="product" className="scroll-mt-24 pb-20">
      <SectionLabel>Product</SectionLabel>
      <h2 className="mt-4 font-serif text-4xl leading-tight tracking-tight md:text-5xl">
        An AI Creative Director — not an image generator.
      </h2>

      <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground">
        <p>
          Campaign Studio is a product marketing workspace built around creative direction. Founders
          upload a product photo and reference images; the AI studies the shared visual language and
          writes a real creative brief — goal, audience, palette, mood, and visual direction — that
          becomes the source of truth for every asset downstream.
        </p>
        <p>
          From that brief, the Director generates campaign directions: platform-specific variants
          with editorial titles, mood captions, match scores, and reasoning. Director chat lets you
          steer the campaign in plain language. Reframe adapts any variant to another platform aspect
          — IG Feed, Story, LinkedIn, and more — while preserving the product and palette.
        </p>
        <p>
          The product is intentionally workflow-first: campaigns, workspaces, explainability, and
          variants — not isolated generations. Every decision is narrated so teams trust the output
          before they ship.
        </p>
      </div>

      <GlassCard className="mt-8 p-6 md:p-8">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Core workflow
        </div>
        <ul className="mt-4 space-y-2.5 text-sm text-ink">
          {[
            "Upload product + reference images",
            "AI analyzes references → Creative Brief",
            "Generate campaign directions + platform variants",
            "Director chat for iterative steering",
            "Reframe for different platforms",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <Check className="mt-0.5 size-4 shrink-0 text-violet" />
              {item}
            </li>
          ))}
        </ul>
      </GlassCard>
    </section>
  );
}

function SectionHowBuilt() {
  return (
    <section id="how-built" className="scroll-mt-24 border-t border-border py-20">
      <SectionLabel>How it was built</SectionLabel>
      <h2 className="mt-4 font-serif text-4xl leading-tight tracking-tight md:text-5xl">
        Custom backend replacing the managed AI layer.
      </h2>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
        The original prototype routed AI through Lovable&apos;s managed gateway. For this engineering
        review, that layer was replaced with a code-first implementation: provider adapters, retries,
        failover, normalized responses, and structured logging — without changing the Campaign Studio
        frontend or UX.
      </p>

      <GlassCard className="mt-10 overflow-hidden p-6 font-mono text-[13px] leading-relaxed md:p-8">
        <div className="text-muted-foreground">Architecture</div>
        <div className="mt-4 space-y-1 text-ink">
          <div>Frontend</div>
          <div className="text-muted-foreground">↓</div>
          <div>Server Functions</div>
          <div className="text-muted-foreground">↓</div>
          <div className="font-medium text-violet">Custom AI Gateway</div>
          <div className="text-muted-foreground">↓</div>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <span>OpenAI</span>
            <span>Gemini</span>
          </div>
          <div className="text-muted-foreground">↓</div>
          <div className="text-muted-foreground">
            Retry · Failover · Normalization · Structured Logging
          </div>
        </div>
      </GlassCard>

      <blockquote className="mt-6 border-l-2 border-violet/40 pl-5 text-sm leading-relaxed text-muted-foreground">
        <span className="font-medium text-ink">Engineering update:</span> The original prototype used
        Lovable&apos;s managed AI gateway. For the engineering review, that layer was replaced with a
        custom gateway implementing provider abstraction, retries, failover, and structured logging.
      </blockquote>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {GATEWAY_TOPICS.map((topic) => (
          <GlassCard key={topic.title} className="p-5">
            <h3 className="font-serif text-lg text-ink">{topic.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{topic.copy}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="mt-10 bg-ink p-6 text-paper md:p-8">
        <div className="font-mono text-[10px] uppercase tracking-widest text-paper/60">
          Engineering summary
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {ENGINEERING_ITEMS.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm">
              <Check className="size-4 shrink-0 text-lime" />
              {item}
            </li>
          ))}
        </ul>
      </GlassCard>
    </section>
  );
}

function SectionCode() {
  return (
    <section id="code" className="scroll-mt-24 border-t border-border py-20">
      <SectionLabel>Code</SectionLabel>
      <h2 className="mt-4 font-serif text-4xl leading-tight tracking-tight md:text-5xl">
        Public repository
      </h2>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
        The complete source is on GitHub — gateway implementation, provider adapters, retry layer,
        structured logging, and tests. Campaign Studio UX and server function contracts are unchanged;
        only the AI transport layer was rebuilt.
      </p>

      <GlassCard className="mt-8 p-6 md:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-ink text-paper">
              <Github className="size-6" />
            </div>
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                GitHub
              </div>
              <div className="mt-1 font-serif text-2xl tracking-tight">campaign-canvas-33</div>
              <div className="mt-1 truncate font-mono text-xs text-muted-foreground">
                github.com/ayoubmorghati1/campaign-canvas-33
              </div>
            </div>
          </div>
          <a
            href="https://github.com/ayoubmorghati1/campaign-canvas-33"
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-ink/90"
          >
            View on GitHub
            <ArrowRight className="size-4" />
          </a>
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Repository includes
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              "Gateway implementation (`src/server/ai/`)",
              "OpenAI + Gemini provider adapters",
              "Retry + exponential backoff",
              "Structured JSON logging",
              "30 passing gateway tests",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-ink">
                <Check className="mt-0.5 size-4 shrink-0 text-violet" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </GlassCard>

      <p className="mt-8 text-sm text-muted-foreground">
        Live demo:{" "}
        <Link to="/studio" className="text-ink underline decoration-border underline-offset-4 hover:text-violet">
          open Campaign Studio
        </Link>{" "}
        to run the full upload → brief → variant flow.
      </p>
    </section>
  );
}
