import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Activity,
  Crop,
  Copy,
  Download,
  FileText,
  ImageIcon,
  Layers,
  Loader2,
  MessageCircle,
  RefreshCcw,
  RotateCw,
  Send,
  Share2,
  Sparkles,
  Upload,
  Wand2,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Chip, GlassCard, SectionLabel, StatusDot } from "@/components/studio/primitives";
import {
  analyzeCampaign,
  directorChat,
  generateVariants,
  getCampaign,
  listDirectorMessages,
  reframeVariant,
  regenerateVariant,
  updateBrief,
} from "@/lib/campaigns.functions";
import { cn } from "@/lib/utils";

const tabSchema = z.object({ tab: z.enum(["variants", "brief", "activity"]).optional() });
type Tab = "variants" | "brief" | "activity";

export const Route = createFileRoute("/studio/c/$id")({
  validateSearch: (s) => tabSchema.parse(s),
  head: ({ params }) => ({
    meta: [
      { title: `Campaign · Campaign Studio` },
      { name: "description", content: "Campaign workspace — variants, brief, and creative inspector." },
    ],
  }),
  component: CampaignWorkspace,
});

type CampaignData = Awaited<ReturnType<typeof getCampaign>>;
type Variant = CampaignData["variants"][number];
type Asset = CampaignData["assets"][number];
type Brief = NonNullable<CampaignData["brief"]>;

function CampaignWorkspace() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const tab: Tab = search.tab ?? "variants";
  const setTab = (t: Tab) =>
    navigate({ to: "/studio/c/$id", params: { id }, search: { tab: t }, replace: true });

  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => getCampaign({ data: { id } }),
    refetchInterval: (q) => {
      const d = q.state.data as CampaignData | undefined;
      const s = d?.campaign?.status;
      return s === "analyzing" || s === "generating" ? 3000 : false;
    },
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    if (!selectedId && data?.variants?.length) setSelectedId(data.variants[0].id);
  }, [data, selectedId]);

  if (!data) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-muted-foreground">
        <div className="flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> Loading campaign…</div>
      </div>
    );
  }

  const { campaign, brief, variants, assets } = data;
  const variant = variants.find((v) => v.id === selectedId) ?? variants[0] ?? null;
  const busy = campaign.status === "generating" || campaign.status === "analyzing";

  const regen = useMutation({
    mutationFn: () => generateVariants({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaign", id] }),
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="grid grid-cols-[1fr_380px] gap-0">
      <section className="min-h-[calc(100vh-57px)] border-r border-border">
        <div className="px-8 pt-8">
          <SectionLabel>Campaign · {campaign.brand}</SectionLabel>
          <div className="mt-2 flex items-end justify-between gap-6">
            <h1 className="font-serif text-5xl tracking-tight">
              {campaign.name} <span className="italic text-violet">·</span>
            </h1>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-xs">
                <Share2 className="size-3.5" /> Share
              </button>
              <button
                disabled={regen.isPending || busy}
                onClick={() => regen.mutate()}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-xs disabled:opacity-50"
              >
                {regen.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCw className="size-3.5" />}
                Regenerate all
              </button>
              <button className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-medium text-paper">
                <Download className="size-3.5" /> Export all
              </button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Chip tone={campaign.status === "ready" ? "lime" : "violet"} dot>
              {busy ? (
                <span className="flex items-center gap-1.5"><Loader2 className="size-3 animate-spin" /> {campaign.status}</span>
              ) : (
                campaign.status
              )}
            </Chip>
            <Chip tone="violet">{variants.length} variants</Chip>
            <Chip tone="muted">
              freedom · {campaign.freedom < 40 ? "safe" : campaign.freedom < 75 ? "creative" : "wild"}
            </Chip>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex items-center gap-1 border-b border-border px-8">
          {([
            { id: "variants", label: "Variants", icon: <ImageIcon className="size-3.5" /> },
            { id: "brief", label: "Brief", icon: <FileText className="size-3.5" /> },
            { id: "activity", label: "Activity", icon: <Activity className="size-3.5" /> },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-3 text-sm transition-colors",
                tab === t.id ? "text-ink" : "text-muted-foreground hover:text-ink",
              )}
            >
              {t.icon}
              {t.label}
              {tab === t.id && <span className="absolute inset-x-3 -bottom-px h-px bg-ink" />}
            </button>
          ))}
        </div>

        {tab === "variants" && (
          busy && variants.length === 0 ? (
            <GeneratingPlaceholder count={(campaign.platforms?.length ?? 1) * 3} />
          ) : variants.length === 0 ? (
            <div className="grid place-items-center px-8 py-20 text-center">
              <div>
                <div className="font-serif text-2xl italic text-muted-foreground">No variants yet.</div>
                <button
                  onClick={() => regen.mutate()}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm text-paper"
                >
                  <Wand2 className="size-4 text-lime" /> Generate
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 p-8 xl:grid-cols-3">
              {variants.map((v, idx) => (
                <VariantCard key={v.id} v={v} idx={idx} active={v.id === variant?.id} onSelect={() => setSelectedId(v.id)} />
              ))}
            </div>
          )
        )}

        {tab === "brief" && (
          <BriefTab campaignId={id} brief={brief} onSaved={() => qc.invalidateQueries({ queryKey: ["campaign", id] })} />
        )}

        {tab === "activity" && (
          <ActivityTab campaignId={id} campaign={campaign} assets={assets} variants={variants} />
        )}
      </section>

      {/* Inspector */}
      <aside className="sticky top-[57px] flex h-[calc(100vh-57px)] flex-col overflow-y-auto bg-paper">
        {variant ? (
          <Inspector
            campaignId={id}
            variant={variant}
            dna={(brief?.references_dna as Array<{ label: string; weight: number }> | null) ?? []}
            onRefresh={() => qc.invalidateQueries({ queryKey: ["campaign", id] })}
          />
        ) : (
          <div className="p-6 text-sm text-muted-foreground">Select a variant to inspect.</div>
        )}

        <DirectorPanel campaignId={id} />
      </aside>
    </div>
  );
}

function VariantCard({
  v,
  idx,
  active,
  onSelect,
}: {
  v: Variant;
  idx: number;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      onClick={onSelect}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04 }}
      className={cn(
        "group relative overflow-hidden rounded-3xl border bg-white text-left shadow-soft transition-all hover:-translate-y-1",
        active ? "border-ink shadow-glow" : "border-border",
      )}
    >
      <div className="relative aspect-[4/5] w-full bg-stone-100">
        {v.public_url && (
          <img src={v.public_url} alt={v.title} className="absolute inset-0 size-full object-cover" loading="lazy" />
        )}
        <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-ink">
          <StatusDot tone={(v.match_score ?? 0) > 93 ? "lime" : "violet"} /> {v.match_score ?? 0}% on brief
        </div>
        <div className="absolute right-4 top-4 rounded-full bg-ink/80 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-paper">
          {v.platform}
        </div>

        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-2xl bg-white/85 p-3 backdrop-blur">
          <div className="min-w-0">
            <div className="truncate font-serif text-lg italic leading-tight">{v.title}</div>
            <div className="truncate font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {v.mood_caption ?? v.direction_label}
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (v.caption_body) navigator.clipboard.writeText(v.caption_body);
                toast.success("Caption copied");
              }}
              className="grid size-7 place-items-center rounded-full bg-paper text-ink hover:bg-lime"
            >
              <Copy className="size-3.5" />
            </button>
            <a
              href={v.public_url ?? "#"}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="grid size-7 place-items-center rounded-full bg-paper text-ink hover:bg-lime"
            >
              <Download className="size-3.5" />
            </a>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function GeneratingPlaceholder({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-2 gap-5 p-8 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="aspect-[4/5] overflow-hidden rounded-3xl border border-border bg-stone-100">
          <div className="relative size-full animate-pulse bg-gradient-to-br from-stone-100 via-stone-200 to-violet/10">
            <div className="absolute inset-x-4 bottom-4 h-12 rounded-2xl bg-white/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Inspector({
  campaignId,
  variant,
  dna,
  onRefresh,
}: {
  campaignId: string;
  variant: Variant;
  dna: Array<{ label: string; weight: number }>;
  onRefresh: () => void;
}) {
  const reasoning = (variant.reasoning as { why?: string[] } | null) ?? {};
  const why = reasoning.why ?? [];

  const regen = useMutation({
    mutationFn: (instruction?: string) =>
      regenerateVariant({ data: { variantId: variant.id, instruction } }),
    onSuccess: () => {
      toast.success("Variant regenerated");
      onRefresh();
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const quickActions = ["More like this", "Make it warmer", "Different crop", "Try editorial"];

  return (
    <>
      <div className="border-b border-border p-5">
        <SectionLabel>Inspector · {variant.title}</SectionLabel>
        <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-stone-100">
          {variant.public_url ? (
            <img src={variant.public_url} alt={variant.title} className="aspect-square w-full object-cover" />
          ) : (
            <div className="aspect-square w-full bg-stone-200" />
          )}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Match score</div>
          <div className="font-mono text-lg text-violet">{variant.match_score ?? 0}%</div>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gradient-to-r from-violet via-clay to-lime"
            style={{ width: `${variant.match_score ?? 0}%` }}
          />
        </div>
      </div>

      {variant.caption_body && (
        <div className="border-b border-border p-5">
          <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <span>Caption</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(variant.caption_body!);
                toast.success("Caption copied");
              }}
              className="text-ink hover:underline"
            >
              copy
            </button>
          </div>
          <p className="text-sm leading-relaxed">{variant.caption_body}</p>
        </div>
      )}

      {why.length > 0 && (
        <div className="border-b border-border p-5">
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <Sparkles className="size-3 text-violet" /> Why this works
          </div>
          <ul className="space-y-2 text-sm">
            {why.map((l, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 size-1.5 rounded-full bg-violet" />
                {l}
              </li>
            ))}
          </ul>
        </div>
      )}

      {dna.length > 0 && (
        <div className="border-b border-border p-5">
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <Layers className="size-3" /> Inspiration DNA
          </div>
          <div className="space-y-2">
            {dna.map((row) => (
              <div key={row.label} className="text-xs">
                <div className="flex items-center justify-between">
                  <span>{row.label}</span>
                  <span className="font-mono text-muted-foreground">{row.weight}%</span>
                </div>
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-ink" style={{ width: `${row.weight}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-b border-border p-5">
        <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <Zap className="size-3" /> Quick actions
        </div>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((a) => (
            <button
              key={a}
              disabled={regen.isPending}
              onClick={() => regen.mutate(a)}
              className="rounded-xl border border-border bg-white px-3 py-2 text-xs hover:border-ink/30 disabled:opacity-50"
            >
              {regen.isPending ? <Loader2 className="mx-auto size-3 animate-spin" /> : a}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function DirectorPanel({ campaignId }: { campaignId: string }) {
  const qc = useQueryClient();
  const { data: messages = [] } = useQuery({
    queryKey: ["director", campaignId],
    queryFn: () => listDirectorMessages({ data: { id: campaignId } }),
  });
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const chat = useMutation({
    mutationFn: (m: string) => directorChat({ data: { campaignId, message: m } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["director", campaignId] }),
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Director offline"),
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chat.isPending]);

  const send = () => {
    const m = input.trim();
    if (!m || chat.isPending) return;
    setInput("");
    chat.mutate(m);
  };

  return (
    <div className="p-5">
      <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <MessageCircle className="size-3" /> Talk to the Director
      </div>

      {messages.length > 0 && (
        <div className="mb-3 max-h-72 space-y-2 overflow-y-auto rounded-2xl border border-border bg-white p-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "rounded-xl px-3 py-2 text-sm",
                m.role === "user" ? "ml-6 bg-paper text-ink" : "mr-6 bg-ink text-paper",
              )}
            >
              {m.content}
            </div>
          ))}
          {chat.isPending && (
            <div className="mr-6 flex items-center gap-2 rounded-xl bg-ink/90 px-3 py-2 text-sm text-paper">
              <Loader2 className="size-3.5 animate-spin" /> Thinking…
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}

      <div className="rounded-2xl bg-ink p-3 text-paper">
        {messages.length === 0 && (
          <div className="text-xs text-paper/70">Try: "Make the lighting feel like 6am, not noon."</div>
        )}
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-paper/10 p-2">
          <Wand2 className="size-4 text-lime" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            className="flex-1 bg-transparent text-sm placeholder:text-paper/40 focus:outline-none"
            placeholder="Describe the change…"
          />
          <button
            onClick={send}
            disabled={chat.isPending || !input.trim()}
            className="grid size-7 place-items-center rounded-lg bg-lime text-ink disabled:opacity-50"
          >
            <Send className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Suppress unused warnings for icons kept for visual consistency
void Heart;
