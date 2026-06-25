import { Link, createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, Plus, Sparkles } from "lucide-react";
import { Chip, GlassCard, StatusDot } from "@/components/studio/primitives";

export const Route = createFileRoute("/studio/")({
  head: () => ({
    meta: [
      { title: "Projects · Campaign Studio" },
      { name: "description", content: "All your brand's campaigns in one workspace." },
    ],
  }),
  component: StudioDashboard,
});

const inProgress = [
  { id: "morning-ritual", name: "Morning Ritual", progress: 80, platforms: ["IG", "LI", "Pin"], cover: "from-stone-200 via-stone-100 to-clay/30" },
  { id: "spring-edit", name: "Spring Edit · Vol. 2", progress: 45, platforms: ["IG", "X"], cover: "from-lime/40 via-emerald-100 to-stone-100" },
];

const projects = [
  { id: "winter-launch", name: "Winter Launch", brand: "NORDH", status: "Shipped", platforms: ["IG", "LI"], cover: "from-stone-300 to-stone-500", updated: "2 days ago", match: 94 },
  { id: "founder-letter", name: "Founder Letter", brand: "NORDH", status: "Draft", platforms: ["LI"], cover: "from-violet/30 to-clay/30", updated: "5 days ago", match: 88 },
  { id: "ritual-bundle", name: "The Ritual Bundle", brand: "NORDH", status: "Shipped", platforms: ["IG", "Pin", "X"], cover: "from-clay/30 to-stone-200", updated: "1 week ago", match: 96 },
  { id: "spf-drop", name: "SPF Drop · Teaser", brand: "NORDH", status: "Review", platforms: ["IG"], cover: "from-amber-100 to-clay/40", updated: "1 week ago", match: 91 },
  { id: "press-kit", name: "Press Kit · Q1", brand: "NORDH", status: "Shipped", platforms: ["LI"], cover: "from-stone-200 to-violet/20", updated: "2 weeks ago", match: 89 },
  { id: "field-notes", name: "Field Notes · 03", brand: "NORDH", status: "Draft", platforms: ["IG", "X"], cover: "from-emerald-100 to-lime/40", updated: "3 weeks ago", match: 84 },
];

function StudioDashboard() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Greeting */}
      <div className="mb-10">
        <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Thursday · June 25</div>
        <h1 className="mt-2 font-serif text-4xl tracking-tight md:text-5xl">
          Good afternoon, <span className="italic text-violet">Amelia</span>.
        </h1>
        <p className="mt-2 text-muted-foreground">You have <span className="text-ink">2 campaigns</span> in flight and <span className="text-ink">3 explorations</span> waiting on your review.</p>
      </div>

      {/* Continue working */}
      <section className="mb-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Continue working</h2>
          <Link to="/studio/archive" className="text-xs text-muted-foreground hover:text-ink">View all explorations →</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {inProgress.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link to="/studio/c/$id" params={{ id: p.id }} className="block">
                <GlassCard className="group overflow-hidden p-0 transition-all hover:-translate-y-1 hover:shadow-glow">
                  <div className="flex items-stretch gap-0">
                    <div className={`relative h-44 w-44 shrink-0 bg-gradient-to-br ${p.cover}`}>
                      <div className="absolute right-3 bottom-3 flex gap-1">
                        {p.platforms.map((pl) => (
                          <span key={pl} className="rounded-full bg-white/90 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-ink">{pl}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col justify-between p-5">
                      <div>
                        <Chip tone="lime" dot>in progress · {p.progress}%</Chip>
                        <h3 className="mt-3 font-serif text-2xl italic">{p.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Last edited 4 minutes ago — paused at brand voice.</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
                          <div className="h-full bg-violet" style={{ width: `${p.progress}%` }} />
                        </div>
                        <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">All campaigns</h2>
          <div className="flex items-center gap-2">
            <button className="rounded-full border border-border bg-white px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-ink">all</button>
            <button className="rounded-full bg-ink px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-paper">shipped</button>
            <button className="rounded-full border border-border bg-white px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-ink">draft</button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {/* new campaign tile */}
          <Link to="/studio/new" className="group">
            <div className="relative flex h-full min-h-[260px] flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border bg-white/40 p-6 text-center transition-all hover:border-ink/40 hover:bg-white">
              <div className="grid size-12 place-items-center rounded-2xl bg-ink text-paper transition-transform group-hover:rotate-12">
                <Plus className="size-5" />
              </div>
              <div>
                <div className="font-serif text-xl">Start a new campaign</div>
                <div className="mt-1 text-xs text-muted-foreground">Upload product · drop references · ship</div>
              </div>
              <div className="mt-2 flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-violet">
                <Sparkles className="size-3" /> 2 min average
              </div>
            </div>
          </Link>

          {projects.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + idx * 0.04 }}
            >
              <Link to="/studio/c/$id" params={{ id: p.id }} className="group block">
                <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-soft transition-all hover:-translate-y-1 hover:shadow-glow">
                  <div className={`relative h-44 w-full bg-gradient-to-br ${p.cover}`}>
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3">
                      <div className="flex gap-1">
                        {p.platforms.map((pl) => (
                          <span key={pl} className="rounded-full bg-white/90 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-ink">{pl}</span>
                        ))}
                      </div>
                      <Chip tone={p.status === "Shipped" ? "lime" : p.status === "Review" ? "violet" : "muted"} dot>{p.status}</Chip>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-serif text-lg leading-tight">{p.name}</h3>
                      <span className="font-mono text-[10px] text-violet">{p.match}%</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      <span>{p.brand}</span>
                      <span>{p.updated}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* footer note */}
      <div className="mt-16 flex items-center justify-between rounded-2xl border border-border bg-white p-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-2"><StatusDot /> All projects synced 12 seconds ago</span>
        <span className="font-mono text-[10px] uppercase tracking-widest">studio v0.9 · beta</span>
      </div>
    </div>
  );
}