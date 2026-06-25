import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, Loader2, Plus, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { Chip, GlassCard, StatusDot } from "@/components/studio/primitives";
import { createCampaign, listCampaigns } from "@/lib/campaigns.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/studio/")({
  head: () => ({
    meta: [
      { title: "Projects · Campaign Studio" },
      { name: "description", content: "All your brand's campaigns in one workspace." },
    ],
  }),
  component: StudioDashboard,
});

const COVERS = [
  "from-stone-200 via-stone-100 to-clay/30",
  "from-lime/40 via-emerald-100 to-stone-100",
  "from-violet/30 to-clay/30",
  "from-amber-100 to-clay/40",
  "from-stone-200 to-violet/20",
  "from-emerald-100 to-lime/40",
];

function fallbackCover(idx: number) {
  return COVERS[idx % COVERS.length];
}

function relTime(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

function StudioDashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => listCampaigns(),
    refetchInterval: (q) => {
      const list = q.state.data as Array<{ status: string }> | undefined;
      return list?.some((c) => c.status === "analyzing" || c.status === "generating") ? 4000 : false;
    },
  });

  const inFlight = useMemo(
    () => (campaigns ?? []).filter((c) => c.status !== "ready").slice(0, 2),
    [campaigns],
  );
  const all = campaigns ?? [];

  const startNew = async () => {
    try {
      const { id } = await createCampaign({ data: {} });
      await qc.invalidateQueries({ queryKey: ["campaigns"] });
      navigate({ to: "/studio/new", search: { c: id } });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to start campaign";
      toast.error(msg);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Greeting */}
      <div className="mb-10">
        <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Your workspace</div>
        <h1 className="mt-2 font-serif text-4xl tracking-tight md:text-5xl">
          Welcome back to <span className="italic text-violet">the studio</span>.
        </h1>
        <p className="mt-2 text-muted-foreground">
          {isLoading
            ? "Loading your campaigns…"
            : all.length === 0
            ? "No campaigns yet. Drop in your first product and let the Director do its thing."
            : `You have ${inFlight.length} campaign${inFlight.length === 1 ? "" : "s"} in flight and ${all.length} total.`}
        </p>
      </div>

      {inFlight.length > 0 && (
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Continue working</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {inFlight.map((p, idx) => {
              const isBusy = p.status === "analyzing" || p.status === "generating";
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    to={isBusy ? "/studio/c/$id" : "/studio/new"}
                    params={isBusy ? { id: p.id } : undefined}
                    search={isBusy ? undefined : { c: p.id }}
                    className="block"
                  >
                    <GlassCard className="group overflow-hidden p-0 transition-all hover:-translate-y-1 hover:shadow-glow">
                      <div className="flex items-stretch gap-0">
                        <div
                          className={cn(
                            "relative h-44 w-44 shrink-0 bg-cover bg-center",
                            !p.cover_path && `bg-gradient-to-br ${fallbackCover(idx)}`,
                          )}
                          style={p.cover_path ? { backgroundImage: `url(${p.cover_path})` } : undefined}
                        >
                          <div className="absolute right-3 bottom-3 flex gap-1">
                            {(p.platforms ?? []).slice(0, 3).map((pl: string) => (
                              <span
                                key={pl}
                                className="rounded-full bg-white/90 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-ink"
                              >
                                {pl}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-1 flex-col justify-between p-5">
                          <div>
                            <Chip tone={isBusy ? "violet" : "lime"} dot>
                              {isBusy ? (
                                <span className="flex items-center gap-1.5">
                                  <Loader2 className="size-3 animate-spin" /> {p.status}
                                </span>
                              ) : (
                                p.status
                              )}
                            </Chip>
                            <h3 className="mt-3 font-serif text-2xl italic">{p.name}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {p.brand ?? "Untitled brand"} · updated {relTime(p.updated_at)}
                            </p>
                          </div>
                          <div className="mt-4 flex items-center justify-end">
                            <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Projects */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">All campaigns</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <button onClick={startNew} className="group text-left">
            <div className="relative flex h-full min-h-[260px] flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border bg-white/40 p-6 text-center transition-all hover:border-ink/40 hover:bg-white">
              <div className="grid size-12 place-items-center rounded-2xl bg-ink text-paper transition-transform group-hover:rotate-12">
                <Plus className="size-5" />
              </div>
              <div>
                <div className="font-serif text-xl">Start a new campaign</div>
                <div className="mt-1 text-xs text-muted-foreground">Upload product · drop references · ship</div>
              </div>
              <div className="mt-2 flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-violet">
                <Sparkles className="size-3" /> guided by AI Director
              </div>
            </div>
          </button>

          {all.map((p, idx) => {
            const tone = p.status === "ready" ? "lime" : p.status === "draft" ? "muted" : "violet";
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + idx * 0.04 }}
              >
                <Link to="/studio/c/$id" params={{ id: p.id }} className="group block">
                  <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-soft transition-all hover:-translate-y-1 hover:shadow-glow">
                    <div
                      className={cn(
                        "relative h-44 w-full bg-cover bg-center",
                        !p.cover_path && `bg-gradient-to-br ${fallbackCover(idx)}`,
                      )}
                      style={p.cover_path ? { backgroundImage: `url(${p.cover_path})` } : undefined}
                    >
                      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3">
                        <div className="flex gap-1">
                          {(p.platforms ?? []).slice(0, 3).map((pl: string) => (
                            <span
                              key={pl}
                              className="rounded-full bg-white/90 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-ink"
                            >
                              {pl}
                            </span>
                          ))}
                        </div>
                        <Chip tone={tone} dot>
                          {p.status}
                        </Chip>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-baseline justify-between">
                        <h3 className="font-serif text-lg leading-tight">{p.name}</h3>
                      </div>
                      <div className="mt-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        <span>{p.brand ?? "—"}</span>
                        <span>{relTime(p.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      <div className="mt-16 flex items-center justify-between rounded-2xl border border-border bg-white p-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <StatusDot /> {isLoading ? "Loading…" : "All projects synced"}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest">studio v1.0</span>
      </div>
    </div>
  );
}
