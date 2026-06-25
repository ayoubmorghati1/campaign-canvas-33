import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Chip, GlassCard, StatusDot } from "./primitives";

const stages = ["upload", "analyze", "campaign"] as const;
type Stage = (typeof stages)[number];

const analysisLines = [
  "Product isolated · depth mapped",
  "Editorial composition detected",
  "Soft side-lighting recognized",
  "Warm neutral palette extracted",
  "Luxury positioning identified",
  "Translating to campaign hierarchy…",
];

export function HeroPreview() {
  const [stage, setStage] = useState<Stage>("upload");

  useEffect(() => {
    const delays: Record<Stage, number> = { upload: 2200, analyze: 3800, campaign: 4400 };
    const t = setTimeout(() => {
      setStage((s) => stages[(stages.indexOf(s) + 1) % stages.length]);
    }, delays[stage]);
    return () => clearTimeout(t);
  }, [stage]);

  return (
    <div className="relative">
      {/* Glow */}
      <div aria-hidden className="bloom-violet absolute -inset-10 -z-10 opacity-60" />
      <div aria-hidden className="bloom-lime absolute -right-10 -bottom-10 -z-10 size-64 rounded-full opacity-50" />

      <GlassCard className="relative overflow-hidden p-5">
        {/* tab bar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-clay/70" />
            <span className="size-2.5 rounded-full bg-lime/70" />
            <span className="size-2.5 rounded-full bg-violet/70" />
          </div>
          <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 font-mono text-[11px] text-muted-foreground">
            <StatusDot tone="lime" /> studio.campaign / morning-ritual
          </div>
          <div className="font-mono text-[11px] text-muted-foreground">v1.2</div>
        </div>

        {/* stage indicator */}
        <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {stages.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 transition-colors ${stage === s ? "bg-ink text-paper" : "bg-muted"}`}
              >
                {String(i + 1).padStart(2, "0")} · {s}
              </span>
              {i < stages.length - 1 && <span className="h-px w-4 bg-border" />}
            </div>
          ))}
        </div>

        <div className="relative h-[360px] overflow-hidden rounded-2xl bg-paper">
          <AnimatePresence mode="wait">
            {stage === "upload" && <UploadStage key="upload" />}
            {stage === "analyze" && <AnalyzeStage key="analyze" />}
            {stage === "campaign" && <CampaignStage key="campaign" />}
          </AnimatePresence>
        </div>

        {/* footer chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Chip tone="violet" dot>brand · NORDH</Chip>
          <Chip tone="lime" dot>auto-saving</Chip>
          <Chip tone="muted">⌘K to invoke director</Chip>
        </div>
      </GlassCard>
    </div>
  );
}

function UploadStage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
      className="grid h-full grid-cols-2 gap-4 p-5"
    >
      <div className="relative rounded-xl border border-dashed border-border bg-white/70 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">[01] Product</span>
          <span className="font-mono text-[10px] text-violet">3 files</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.15 }}
              className="aspect-square rounded-md bg-gradient-to-br from-stone-200 to-stone-300"
            />
          ))}
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
          <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.6 }} className="h-full bg-violet" />
        </div>
      </div>
      <div className="relative rounded-xl border border-dashed border-border bg-white/70 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">[02] Inspiration</span>
          <span className="font-mono text-[10px] text-clay">6 refs</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {["#E8E1D6", "#C9B99A", "#4F6D58", "#F2E3D5", "#B87352", "#2C2C2A"].map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="aspect-square rounded-md"
              style={{ background: c }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function AnalyzeStage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
      className="grid h-full grid-cols-[1.1fr_1fr] gap-4 p-5"
    >
      <div className="relative overflow-hidden rounded-xl bg-ink p-4 text-paper">
        <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest opacity-60">
          <StatusDot tone="lime" /> creative director · analyzing
        </div>
        <div className="space-y-2 font-mono text-[12px]">
          {analysisLines.map((line, i) => (
            <motion.div
              key={line}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.28 }}
              className="flex items-start gap-2"
            >
              <span className="text-lime">✓</span>
              <span className="opacity-90">{line}</span>
            </motion.div>
          ))}
        </div>
        <div className="absolute right-3 bottom-3 font-mono text-[10px] opacity-50">conf · 96%</div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="rounded-xl bg-white p-3 shadow-soft">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">mood</div>
          <div className="font-serif text-lg italic">Calm Confidence</div>
        </div>
        <div className="rounded-xl bg-white p-3 shadow-soft">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">palette</div>
          <div className="flex gap-1">
            {["#E8E1D6", "#C9B99A", "#4F6D58", "#1C1C1C", "#F2E3D5"].map((c) => (
              <span key={c} className="size-6 rounded-full border border-white shadow" style={{ background: c }} />
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-lime p-3">
          <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-ink/70">brand voice</div>
          <div className="font-serif text-lg italic text-ink">Editorial Luxury</div>
        </div>
      </div>
    </motion.div>
  );
}

function CampaignStage() {
  const cards = [
    { label: "IG Feed", ratio: "aspect-square", grad: "from-stone-100 to-stone-300" },
    { label: "IG Story", ratio: "aspect-[9/16]", grad: "from-violet/20 to-clay/30" },
    { label: "LinkedIn", ratio: "aspect-[1.91/1]", grad: "from-lime/40 to-emerald-200" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
      className="grid h-full grid-cols-[1.4fr_1fr] gap-4 p-5"
    >
      <div className="grid grid-cols-3 gap-3">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12 }}
            className="flex flex-col gap-2"
          >
            <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${c.grad} ${c.ratio} w-full shadow-soft`}>
              <div className="absolute right-2 bottom-2 rounded-full bg-white/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest">
                {c.label}
              </div>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted">
              <div className="h-full w-3/4 rounded-full bg-violet" />
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <div className="rounded-xl bg-white p-3 shadow-soft">
          <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">caption · IG Feed</div>
          <p className="font-serif text-sm leading-snug italic">
            "Start your morning with pure intention. The Ritual launches Tuesday."
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Chip tone="violet" dot>96% match</Chip>
          <Chip tone="lime">ready to export</Chip>
        </div>
        <button className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-ink py-2 text-xs font-medium text-paper">
          ✦ Export campaign
        </button>
      </div>
    </motion.div>
  );
}