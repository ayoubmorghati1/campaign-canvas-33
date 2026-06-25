import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ImagePlus, Sparkles, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Chip, GlassCard, SectionLabel, StatusDot } from "@/components/studio/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/studio/new")({
  head: () => ({
    meta: [
      { title: "New campaign · Campaign Studio" },
      { name: "description", content: "Start a new campaign: upload your product, drop your inspiration, and let the AI Creative Director do the rest." },
    ],
  }),
  component: NewCampaignWizard,
});

const steps = ["Products", "Inspiration", "Brief", "Generate"] as const;
type Step = (typeof steps)[number];

function NewCampaignWizard() {
  const [step, setStep] = useState<Step>("Products");
  const navigate = useNavigate();
  const idx = steps.indexOf(step);

  const next = () => {
    if (idx < steps.length - 1) setStep(steps[idx + 1]);
    else navigate({ to: "/studio/c/$id", params: { id: "morning-ritual" } });
  };
  const back = () => idx > 0 && setStep(steps[idx - 1]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Stepper */}
      <div className="mb-10 flex items-center gap-3">
        {steps.map((s, i) => {
          const active = s === step;
          const done = i < idx;
          return (
            <button
              key={s}
              onClick={() => i <= idx && setStep(s)}
              className={cn(
                "group flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-all",
                active && "border-ink bg-ink text-paper",
                !active && done && "border-violet/30 bg-violet/10 text-violet",
                !active && !done && "border-border bg-white text-muted-foreground",
              )}
            >
              <span className="grid size-4 place-items-center rounded-full bg-current/10 text-[10px]">
                {done ? <Check className="size-3" /> : i + 1}
              </span>
              {s}
            </button>
          );
        })}
        <div className="ml-auto font-mono text-[10px] uppercase tracking-widest text-muted-foreground">step {idx + 1} of {steps.length}</div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
        >
          {step === "Products" && <StepProducts />}
          {step === "Inspiration" && <StepInspiration />}
          {step === "Brief" && <StepBrief />}
          {step === "Generate" && <StepGenerate />}
        </motion.div>
      </AnimatePresence>

      <div className="mt-10 flex items-center justify-between">
        <button
          onClick={back}
          disabled={idx === 0}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2.5 text-sm text-ink transition-all hover:border-ink/30 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft className="size-4" /> Back
        </button>
        <button
          onClick={next}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-all hover:bg-ink/90"
        >
          {idx === steps.length - 1 ? <><Sparkles className="size-4 text-lime" /> Generate campaign</> : <>Continue <ArrowRight className="size-4" /></>}
        </button>
      </div>
    </div>
  );
}

function StepHeader({ kicker, title, copy }: { kicker: string; title: string; copy: string }) {
  return (
    <div className="mb-8 max-w-2xl">
      <SectionLabel>{kicker}</SectionLabel>
      <h1 className="mt-3 font-serif text-4xl tracking-tight md:text-5xl">{title}</h1>
      <p className="mt-2 text-muted-foreground">{copy}</p>
    </div>
  );
}

function StepProducts() {
  return (
    <div>
      <StepHeader
        kicker="Step 01 · Products"
        title="Drop your product photos."
        copy="Bottles, packaging, hero shots, lifestyle stills — anything that shows what we're launching."
      />
      <GlassCard className="p-6">
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border-2 border-dashed border-border bg-paper p-10 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-ink text-paper">
              <ImagePlus className="size-6" />
            </div>
            <div className="mt-4 font-serif text-2xl italic">Drop your product</div>
            <div className="mt-1 text-sm text-muted-foreground">PNG, JPG up to 20MB · 8 max</div>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button className="rounded-full bg-ink px-4 py-2 text-xs font-medium text-paper">Browse files</button>
              <button className="rounded-full border border-border bg-white px-4 py-2 text-xs">Paste URL</button>
            </div>
          </div>
          <div>
            <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Recently uploaded</div>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`aspect-square rounded-lg bg-gradient-to-br ${i % 3 === 0 ? "from-stone-200 to-stone-300" : i % 3 === 1 ? "from-violet/20 to-clay/30" : "from-emerald-100 to-lime/40"}`} />
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-paper p-3 text-xs text-muted-foreground">
              <span className="text-ink">Tip:</span> include a clean cutout plus one lifestyle shot — that combo unlocks better composition.
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function StepInspiration() {
  const refs = ["from-stone-200 to-stone-400", "from-violet/30 to-clay/20", "from-emerald-100 to-lime/40", "from-clay/30 to-amber-100", "from-stone-100 to-stone-300", "from-paper to-violet/10"];
  return (
    <div>
      <StepHeader
        kicker="Step 02 · Inspiration"
        title="Show us the vibe."
        copy="Pinterest boards, editorial spreads, brand campaigns you love. The AI extracts the creative language behind every reference."
      />
      <div className="grid gap-4 md:grid-cols-[1.1fr_1fr]">
        <GlassCard className="p-6">
          <div className="rounded-2xl border-2 border-dashed border-border bg-paper p-8 text-center">
            <div className="font-serif text-xl italic">Drop references here</div>
            <div className="mt-1 text-xs text-muted-foreground">Drag, paste, or pull from a URL · 12 max</div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {refs.map((g, i) => (
              <div key={i} className={`aspect-square rounded-xl bg-gradient-to-br ${g} shadow-soft`} />
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <span className="flex items-center gap-2"><StatusDot /> AI learning your taste</span>
            <span>6 refs</span>
          </div>
          <div className="space-y-3 text-sm">
            {[
              { l: "Composition", v: "Centered, generous negative space" },
              { l: "Lighting", v: "Soft side-light, low contrast shadows" },
              { l: "Palette", v: "Warm stone, cream, olive" },
              { l: "Typography", v: "Editorial serif + small-caps" },
              { l: "Positioning", v: "Quiet luxury, ritualistic" },
            ].map((row, i) => (
              <motion.div
                key={row.l}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start justify-between border-b border-dashed border-border pb-3 last:border-0"
              >
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{row.l}</span>
                <span className="text-right font-serif text-base italic">{row.v}</span>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function StepBrief() {
  return (
    <div>
      <StepHeader
        kicker="Step 03 · Creative Brief"
        title="Approve the AI's reading."
        copy="Edit anything that feels off. This becomes the source of truth for every generated asset."
      />
      <GlassCard className="p-8">
        <div className="grid gap-6 md:grid-cols-2">
          {[
            { l: "Campaign goal", v: "Luxury product launch" },
            { l: "Audience", v: "Women, 25–40, premium buyers" },
            { l: "Brand position", v: "Premium ritual-led skincare" },
            { l: "Mood", v: "Calm confidence · quiet luxury" },
            { l: "Color strategy", v: "Warm neutrals · stone · cream" },
            { l: "Visual direction", v: "Editorial minimalism" },
          ].map((row) => (
            <div key={row.l} className="rounded-2xl border border-border bg-paper p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{row.l}</div>
              <div className="mt-1 font-serif text-xl italic">{row.v}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl bg-ink p-5 text-paper">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-paper/60">Creative notes</div>
          <p className="font-serif text-lg italic">
            Keep the product centered. Avoid clutter. Preserve the premium
            feel — warmth over saturation, restraint over noise.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}

function StepGenerate() {
  const [voice, setVoice] = useState("Editorial");
  const [freedom, setFreedom] = useState(60);
  const [platforms, setPlatforms] = useState<Record<string, boolean>>({ "IG Feed": true, "IG Story": true, LinkedIn: true, X: false, Pinterest: true });

  return (
    <div>
      <StepHeader
        kicker="Step 04 · Generate"
        title="Pick your voice. Set your freedom. Ship."
        copy="The Director will produce three directions per platform, each scored against the brief."
      />
      <div className="grid gap-5 md:grid-cols-[1.1fr_1fr]">
        <GlassCard className="p-6">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Brand voice</div>
          <div className="flex flex-wrap gap-2">
            {["Minimal", "Luxury", "Founder-led", "Editorial", "Playful", "Bold"].map((v) => (
              <button
                key={v}
                onClick={() => setVoice(v)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-all",
                  voice === v ? "border-ink bg-ink text-paper" : "border-border bg-white text-foreground hover:border-ink/30",
                )}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>Creative freedom</span>
              <span>{freedom < 40 ? "Safe" : freedom < 75 ? "Creative" : "Wild"}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={freedom}
              onChange={(e) => setFreedom(Number(e.target.value))}
              className="w-full accent-violet"
            />
            <div className="mt-1 flex justify-between font-mono text-[9px] uppercase text-muted-foreground"><span>safe</span><span>creative</span><span>wild</span></div>
          </div>

          <div className="mt-6">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Platforms</div>
            <div className="flex flex-wrap gap-2">
              {Object.keys(platforms).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatforms((s) => ({ ...s, [p]: !s[p] }))}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-all",
                    platforms[p] ? "border-violet bg-violet/10 text-violet" : "border-border bg-white text-muted-foreground hover:border-ink/30",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="bg-ink/95 p-6 text-paper">
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-paper/60">
            <StatusDot tone="lime" /> Director preview
          </div>
          <div className="font-serif text-2xl leading-snug italic">
            "I'll produce 3 directions for {Object.values(platforms).filter(Boolean).length} platforms — leading with the
            warm editorial system from your references, dialed {freedom < 40 ? "close to reference" : freedom < 75 ? "with confident reinterpretation" : "into unexpected territory"}. {voice} voice throughout."
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Chip tone="lime" dot>est. 38s</Chip>
            <Chip tone="violet">3 directions × {Object.values(platforms).filter(Boolean).length} variants</Chip>
            <Chip tone="muted">~1 credit</Chip>
          </div>
          <button className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-lime py-3 text-sm font-medium text-ink hover:opacity-90">
            <Wand2 className="size-4" /> Generate campaign
          </button>
        </GlassCard>
      </div>

      <FakeStream />
    </div>
  );
}

function FakeStream() {
  const lines = [
    "› Loading reference set …",
    "› Detected editorial composition · soft side-light",
    "› Palette locked · stone / cream / olive",
    "› Voice profile · editorial luxury",
    "› Producing 3 directions per platform …",
  ];
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setShown((s) => (s < lines.length ? s + 1 : s)), 700);
    return () => clearInterval(t);
  }, [lines.length]);

  return (
    <div className="mt-6 rounded-2xl border border-border bg-paper p-5">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Director stream · live</div>
      <div className="space-y-1 font-mono text-[12px] text-ink">
        {lines.slice(0, shown).map((l) => (
          <div key={l} className="flex items-center gap-2"><span className="text-violet">✓</span>{l}</div>
        ))}
      </div>
    </div>
  );
}