import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Copy, Download, Heart, Layers, MessageCircle, MoreHorizontal, RotateCw, Send, Share2, Sparkles, Wand2, Zap } from "lucide-react";
import { useState } from "react";
import { Chip, GlassCard, SectionLabel, StatusDot } from "@/components/studio/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/studio/c/$id")({
  head: () => ({
    meta: [
      { title: "Morning Ritual · Campaign Studio" },
      { name: "description", content: "Inside a campaign workspace — variants, brief, and creative inspector." },
    ],
  }),
  component: CampaignWorkspace,
});

const variants = [
  { id: "v1", title: "Quiet ritual", platform: "IG Feed", match: 96, mood: "Calm · editorial", cover: "from-stone-200 via-stone-100 to-clay/30" },
  { id: "v2", title: "Morning amber", platform: "IG Feed", match: 92, mood: "Warm · cinematic", cover: "from-amber-100 via-clay/30 to-stone-200" },
  { id: "v3", title: "Olive whisper", platform: "IG Feed", match: 88, mood: "Soft · botanical", cover: "from-emerald-100 via-stone-100 to-lime/30" },
  { id: "v4", title: "Stone study", platform: "IG Story", match: 94, mood: "Architectural", cover: "from-stone-300 via-stone-200 to-stone-400" },
  { id: "v5", title: "Founder voice", platform: "LinkedIn", match: 91, mood: "Personal · honest", cover: "from-violet/20 via-stone-100 to-paper" },
  { id: "v6", title: "Pinned moment", platform: "Pinterest", match: 89, mood: "Editorial pin", cover: "from-clay/30 via-stone-100 to-amber-100" },
];

function CampaignWorkspace() {
  const [selected, setSelected] = useState(variants[0].id);
  const variant = variants.find((v) => v.id === selected)!;

  return (
    <div className="grid grid-cols-[1fr_360px] gap-0">
      <section className="min-h-[calc(100vh-57px)] border-r border-border">
        <div className="px-8 pt-8">
          <SectionLabel>Campaign · NORDH</SectionLabel>
          <div className="mt-2 flex items-end justify-between gap-6">
            <h1 className="font-serif text-5xl tracking-tight">Morning Ritual <span className="italic text-violet">·</span></h1>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-xs"><Share2 className="size-3.5" /> Share</button>
              <button className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-xs"><RotateCw className="size-3.5" /> Regenerate</button>
              <button className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-medium text-paper"><Download className="size-3.5" /> Export all</button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Chip tone="lime" dot>shipped to draft</Chip>
            <Chip tone="violet">3 directions · 6 variants</Chip>
            <Chip tone="muted">freedom · creative</Chip>
            <span className="ml-2">Last regenerated 4 minutes ago by Amelia</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex items-center gap-1 border-b border-border px-8">
          {["Variants", "Brief", "Captions", "Assets", "Activity"].map((t, i) => (
            <button key={t} className={cn("relative px-4 py-3 text-sm transition-colors", i === 0 ? "text-ink" : "text-muted-foreground hover:text-ink")}>
              {t}
              {i === 0 && <span className="absolute inset-x-3 -bottom-px h-px bg-ink" />}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <button className="rounded-full border border-border bg-white px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink">all platforms</button>
            <button className="rounded-full border border-border bg-white px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">grid</button>
          </div>
        </div>

        {/* Variant grid */}
        <div className="grid grid-cols-2 gap-5 p-8 xl:grid-cols-3">
          {variants.map((v, idx) => {
            const active = v.id === selected;
            return (
              <motion.button
                key={v.id}
                onClick={() => setSelected(v.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  "group relative overflow-hidden rounded-3xl border bg-white text-left shadow-soft transition-all hover:-translate-y-1",
                  active ? "border-ink shadow-glow" : "border-border",
                )}
              >
                <div className={`relative aspect-[4/5] w-full bg-gradient-to-br ${v.cover}`}>
                  {/* mock product silhouette */}
                  <div className="absolute inset-x-0 bottom-8 mx-auto h-1/2 w-1/3 rounded-[40%] bg-white/40 blur-2xl" />
                  <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-ink">
                    <StatusDot tone={v.match > 93 ? "lime" : "violet"} /> {v.match}% on brief
                  </div>
                  <div className="absolute right-4 top-4 rounded-full bg-ink/80 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-paper">{v.platform}</div>

                  <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-2xl bg-white/85 p-3 backdrop-blur">
                    <div>
                      <div className="font-serif text-lg italic leading-tight">{v.title}</div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{v.mood}</div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button className="grid size-7 place-items-center rounded-full bg-paper text-ink hover:bg-lime"><Heart className="size-3.5" /></button>
                      <button className="grid size-7 place-items-center rounded-full bg-paper text-ink hover:bg-lime"><Copy className="size-3.5" /></button>
                      <button className="grid size-7 place-items-center rounded-full bg-paper text-ink hover:bg-lime"><MoreHorizontal className="size-3.5" /></button>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Inspector */}
      <aside className="sticky top-[57px] flex h-[calc(100vh-57px)] flex-col overflow-y-auto bg-paper">
        <div className="border-b border-border p-5">
          <SectionLabel>Inspector · {variant.title}</SectionLabel>
          <div className="mt-3 overflow-hidden rounded-2xl border border-border">
            <div className={`aspect-square w-full bg-gradient-to-br ${variant.cover}`} />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Match score</div>
            <div className="font-mono text-lg text-violet">{variant.match}%</div>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-gradient-to-r from-violet via-clay to-lime" style={{ width: `${variant.match}%` }} />
          </div>
        </div>

        <div className="border-b border-border p-5">
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"><Sparkles className="size-3 text-violet" /> Why this works</div>
          <ul className="space-y-2 text-sm">
            {[
              "Soft side-light echoes your ARKET reference",
              "Composition leaves room for editorial caption",
              "Stone palette matches Brand Kit primary",
              "Crop reads cleanly at 1:1 and 9:16",
            ].map((l) => (
              <li key={l} className="flex gap-2"><span className="mt-1.5 size-1.5 rounded-full bg-violet" />{l}</li>
            ))}
          </ul>
        </div>

        <div className="border-b border-border p-5">
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"><Layers className="size-3" /> Inspiration DNA</div>
          <div className="space-y-2">
            {[
              { l: "ARKET FW24", v: 42 },
              { l: "Aesop quarterly", v: 28 },
              { l: "Cereal Vol. 21", v: 18 },
              { l: "Your past work", v: 12 },
            ].map((row) => (
              <div key={row.l} className="text-xs">
                <div className="flex items-center justify-between">
                  <span>{row.l}</span>
                  <span className="font-mono text-muted-foreground">{row.v}%</span>
                </div>
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-ink" style={{ width: `${row.v}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-b border-border p-5">
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"><Zap className="size-3" /> Quick actions</div>
          <div className="grid grid-cols-2 gap-2">
            {["More like this", "Make it warmer", "Different crop", "Try editorial"].map((a) => (
              <button key={a} className="rounded-xl border border-border bg-white px-3 py-2 text-xs hover:border-ink/30">{a}</button>
            ))}
          </div>
        </div>

        <div className="p-5">
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"><MessageCircle className="size-3" /> Talk to the Director</div>
          <div className="rounded-2xl bg-ink p-3 text-paper">
            <div className="text-xs text-paper/70">Try: "Make the lighting feel like 6am, not noon"</div>
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-paper/10 p-2">
              <Wand2 className="size-4 text-lime" />
              <input className="flex-1 bg-transparent text-sm placeholder:text-paper/40 focus:outline-none" placeholder="Describe the change…" />
              <button className="grid size-7 place-items-center rounded-lg bg-lime text-ink"><Send className="size-3.5" /></button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}