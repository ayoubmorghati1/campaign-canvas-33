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

      <ReframeBlock variant={variant} onRefresh={onRefresh} />
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

/* ----------------------------- Reframe block ----------------------------- */

const ASPECT_OPTIONS = ["1:1", "4:5", "9:16", "16:9", "2:3"] as const;
type Aspect = (typeof ASPECT_OPTIONS)[number];

const PLATFORM_PRESETS: Array<{ label: string; aspect: Aspect }> = [
  { label: "IG Feed", aspect: "4:5" },
  { label: "IG Story", aspect: "9:16" },
  { label: "Reels", aspect: "9:16" },
  { label: "TikTok", aspect: "9:16" },
  { label: "Pinterest", aspect: "2:3" },
  { label: "LinkedIn", aspect: "1:1" },
  { label: "X", aspect: "16:9" },
];

function ReframeBlock({ variant, onRefresh }: { variant: Variant; onRefresh: () => void }) {
  const [platform, setPlatform] = useState<string>(PLATFORM_PRESETS[0].label);
  const [aspect, setAspect] = useState<Aspect>(PLATFORM_PRESETS[0].aspect);

  const reframe = useMutation({
    mutationFn: () => reframeVariant({ data: { variantId: variant.id, platform, aspect } }),
    onSuccess: () => {
      toast.success(`Reframed for ${platform} (${aspect})`);
      onRefresh();
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Reframe failed"),
  });

  return (
    <div className="border-b border-border p-5">
      <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <Crop className="size-3" /> Reframe for another format
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {PLATFORM_PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              setPlatform(p.label);
              setAspect(p.aspect);
            }}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11px] transition-colors",
              platform === p.label
                ? "border-ink bg-ink text-paper"
                : "border-border bg-white text-ink hover:border-ink/30",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {ASPECT_OPTIONS.map((a) => (
          <button
            key={a}
            onClick={() => setAspect(a)}
            className={cn(
              "rounded-md border px-2 py-1 font-mono text-[10px] tracking-wider transition-colors",
              aspect === a
                ? "border-violet bg-violet/10 text-violet"
                : "border-border bg-white text-muted-foreground hover:text-ink",
            )}
          >
            {a}
          </button>
        ))}
      </div>

      <button
        onClick={() => reframe.mutate()}
        disabled={reframe.isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-3 py-2 text-xs font-medium text-paper disabled:opacity-50"
      >
        {reframe.isPending ? (
          <>
            <Loader2 className="size-3.5 animate-spin" /> Reframing…
          </>
        ) : (
          <>
            <Crop className="size-3.5 text-lime" /> Create {aspect} for {platform}
          </>
        )}
      </button>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Adds a new sibling variant. Original stays untouched.
      </p>
    </div>
  );
}

/* ----------------------------- Brief tab ----------------------------- */

function BriefTab({
  campaignId,
  brief,
  onSaved,
}: {
  campaignId: string;
  brief: Brief | null;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState({
    goal: brief?.goal ?? "",
    audience: brief?.audience ?? "",
    position: brief?.position ?? "",
    mood: brief?.mood ?? "",
    color_strategy: brief?.color_strategy ?? "",
    visual_direction: brief?.visual_direction ?? "",
    notes: brief?.notes ?? "",
  });

  useEffect(() => {
    setDraft({
      goal: brief?.goal ?? "",
      audience: brief?.audience ?? "",
      position: brief?.position ?? "",
      mood: brief?.mood ?? "",
      color_strategy: brief?.color_strategy ?? "",
      visual_direction: brief?.visual_direction ?? "",
      notes: brief?.notes ?? "",
    });
  }, [brief]);

  const save = useMutation({
    mutationFn: () => updateBrief({ data: { campaignId, patch: draft } }),
    onSuccess: () => {
      toast.success("Brief saved");
      onSaved();
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const regen = useMutation({
    mutationFn: () => analyzeCampaign({ data: { id: campaignId } }),
    onSuccess: () => {
      toast.success("Brief regenerated");
      onSaved();
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Regenerate failed"),
  });

  if (!brief) {
    return (
      <div className="grid place-items-center px-8 py-20 text-center">
        <div>
          <div className="font-serif text-2xl italic text-muted-foreground">No brief yet.</div>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Upload product photos and references, then run the analysis.
          </p>
          <button
            onClick={() => regen.mutate()}
            disabled={regen.isPending}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm text-paper disabled:opacity-50"
          >
            {regen.isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4 text-lime" />}
            Run analysis
          </button>
        </div>
      </div>
    );
  }

  const palette = (brief.palette as string[] | null) ?? [];
  const dna = (brief.references_dna as Array<{ label: string; weight: number }> | null) ?? [];

  const Field = ({
    label,
    value,
    onChange,
    multiline,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    multiline?: boolean;
  }) => (
    <label className="block">
      <div className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full resize-none rounded-xl border border-border bg-white px-3 py-2 text-sm focus:border-ink focus:outline-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm focus:border-ink focus:outline-none"
        />
      )}
    </label>
  );

  return (
    <div className="max-w-3xl px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <SectionLabel>Creative brief</SectionLabel>
        <div className="flex items-center gap-2">
          <button
            onClick={() => regen.mutate()}
            disabled={regen.isPending}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-xs disabled:opacity-50"
          >
            {regen.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCcw className="size-3.5" />}
            Regenerate
          </button>
          <button
            onClick={() => save.mutate()}
            disabled={save.isPending}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-paper disabled:opacity-50"
          >
            {save.isPending ? <Loader2 className="size-3.5 animate-spin" /> : "Save brief"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Field label="Goal" value={draft.goal} onChange={(v) => setDraft((s) => ({ ...s, goal: v }))} />
        <Field label="Audience" value={draft.audience} onChange={(v) => setDraft((s) => ({ ...s, audience: v }))} />
        <Field label="Position" value={draft.position} onChange={(v) => setDraft((s) => ({ ...s, position: v }))} />
        <Field label="Mood" value={draft.mood} onChange={(v) => setDraft((s) => ({ ...s, mood: v }))} />
        <div className="col-span-2">
          <Field
            label="Color strategy"
            value={draft.color_strategy}
            onChange={(v) => setDraft((s) => ({ ...s, color_strategy: v }))}
          />
        </div>
        <div className="col-span-2">
          <Field
            label="Visual direction"
            value={draft.visual_direction}
            onChange={(v) => setDraft((s) => ({ ...s, visual_direction: v }))}
            multiline
          />
        </div>
        <div className="col-span-2">
          <Field label="Notes" value={draft.notes} onChange={(v) => setDraft((s) => ({ ...s, notes: v }))} multiline />
        </div>
      </div>

      {palette.length > 0 && (
        <div className="mt-8">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Palette</div>
          <div className="flex flex-wrap gap-2">
            {palette.map((hex) => (
              <div key={hex} className="flex items-center gap-2 rounded-full border border-border bg-white px-2 py-1 text-xs">
                <span className="size-4 rounded-full border border-black/10" style={{ background: hex }} />
                <span className="font-mono">{hex}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {dna.length > 0 && (
        <div className="mt-8">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Reference DNA</div>
          <div className="space-y-2">
            {dna.map((d) => (
              <div key={d.label} className="text-sm">
                <div className="flex items-center justify-between">
                  <span>{d.label}</span>
                  <span className="font-mono text-xs text-muted-foreground">{d.weight}%</span>
                </div>
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-ink" style={{ width: `${d.weight}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------- Activity tab ----------------------------- */

type ActivityItem = {
  id: string;
  ts: string;
  kind: "campaign" | "asset" | "variant" | "message";
  title: string;
  meta?: string;
  thumb?: string | null;
};

function ActivityTab({
  campaignId,
  campaign,
  assets,
  variants,
}: {
  campaignId: string;
  campaign: CampaignData["campaign"];
  assets: Asset[];
  variants: Variant[];
}) {
  const { data: messages = [] } = useQuery({
    queryKey: ["director", campaignId],
    queryFn: () => listDirectorMessages({ data: { id: campaignId } }),
  });

  const items = useMemo<ActivityItem[]>(() => {
    const out: ActivityItem[] = [];
    out.push({
      id: `c-${campaign.id}`,
      ts: campaign.created_at,
      kind: "campaign",
      title: "Campaign created",
      meta: campaign.name,
    });
    for (const a of assets) {
      out.push({
        id: `a-${a.id}`,
        ts: a.created_at,
        kind: "asset",
        title: `${a.kind === "product" ? "Product photo" : "Reference"} uploaded`,
        meta: a.mime ?? undefined,
        thumb: a.public_url,
      });
    }
    for (const v of variants) {
      out.push({
        id: `v-${v.id}`,
        ts: v.created_at,
        kind: "variant",
        title: v.title,
        meta: `${v.platform} · ${v.direction_label} · ${v.match_score ?? 0}% match`,
        thumb: v.public_url,
      });
    }
    for (const m of messages) {
      out.push({
        id: `m-${m.id}`,
        ts: m.created_at,
        kind: "message",
        title: m.role === "user" ? "You" : "Creative Director",
        meta: m.content.length > 140 ? m.content.slice(0, 140) + "…" : m.content,
      });
    }
    return out.sort((a, b) => (a.ts < b.ts ? 1 : -1));
  }, [campaign, assets, variants, messages]);

  const iconFor = (k: ActivityItem["kind"]) => {
    if (k === "campaign") return <Sparkles className="size-3.5 text-violet" />;
    if (k === "asset") return <Upload className="size-3.5 text-clay" />;
    if (k === "variant") return <ImageIcon className="size-3.5 text-lime" />;
    return <MessageCircle className="size-3.5 text-ink" />;
  };

  return (
    <div className="max-w-3xl px-8 py-8">
      <SectionLabel>Activity · {items.length} events</SectionLabel>
      <ol className="mt-6 space-y-3">
        {items.map((it) => (
          <li key={it.id} className="flex gap-3 rounded-2xl border border-border bg-white p-3">
            {it.thumb ? (
              <img src={it.thumb} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
            ) : (
              <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-muted">{iconFor(it.kind)}</div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <div className="truncate text-sm font-medium">{it.title}</div>
                <div className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {new Date(it.ts).toLocaleString()}
                </div>
              </div>
              {it.meta && <div className="mt-0.5 truncate text-xs text-muted-foreground">{it.meta}</div>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// Keep GlassCard import alive for future inspector cards
void GlassCard;
void StatusDot;
