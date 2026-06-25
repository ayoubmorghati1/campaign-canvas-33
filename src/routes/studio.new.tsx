import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ImagePlus,
  Loader2,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Chip, GlassCard, SectionLabel, StatusDot } from "@/components/studio/primitives";
import {
  analyzeCampaign,
  createCampaign,
  deleteAsset,
  generateVariants,
  getCampaign,
  updateBrief,
  updateCampaign,
} from "@/lib/campaigns.functions";
import { uploadCampaignAsset } from "@/lib/uploads";
import { cn } from "@/lib/utils";

const searchSchema = z.object({ c: z.string().uuid().optional() });

export const Route = createFileRoute("/studio/new")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "New campaign · Campaign Studio" },
      {
        name: "description",
        content:
          "Start a new campaign: upload your product, drop your inspiration, and let the AI Creative Director do the rest.",
      },
    ],
  }),
  component: NewCampaignWizard,
});

const steps = ["Products", "Inspiration", "Brief", "Generate"] as const;
type Step = (typeof steps)[number];

function NewCampaignWizard() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState<Step>("Products");
  const [campaignId, setCampaignId] = useState<string | undefined>(search.c);
  const creatingRef = useRef(false);

  // Ensure a campaign exists
  useEffect(() => {
    if (campaignId || creatingRef.current) return;
    creatingRef.current = true;
    createCampaign({ data: {} })
      .then(({ id }) => {
        setCampaignId(id);
        navigate({ to: "/studio/new", search: { c: id }, replace: true });
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : "Failed to start campaign";
        toast.error(msg);
        creatingRef.current = false;
      });
  }, [campaignId, navigate]);

  const { data, refetch } = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: () => getCampaign({ data: { id: campaignId! } }),
    enabled: !!campaignId,
  });

  const idx = steps.indexOf(step);

  const canContinue = useMemo(() => {
    if (!data) return false;
    const productCount = data.assets.filter((a) => a.kind === "product").length;
    const refCount = data.assets.filter((a) => a.kind === "reference").length;
    if (step === "Products") return productCount > 0;
    if (step === "Inspiration") return refCount > 0;
    if (step === "Brief") return !!data.brief;
    return true;
  }, [data, step]);

  const next = () => {
    if (idx < steps.length - 1) setStep(steps[idx + 1]);
  };
  const back = () => idx > 0 && setStep(steps[idx - 1]);

  if (!campaignId || !data) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-muted-foreground">
        <div className="flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" /> Spinning up a fresh campaign…
        </div>
      </div>
    );
  }

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
        <div className="ml-auto font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          step {idx + 1} of {steps.length}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          {step === "Products" && (
            <StepUpload
              campaignId={campaignId}
              kind="product"
              kicker="Step 01 · Products"
              title="Drop your product photos."
              copy="Bottles, packaging, hero shots — anything that shows what we're launching. Clean cutout + one in-context shot works best."
              data={data}
              onChange={() => refetch()}
            />
          )}
          {step === "Inspiration" && (
            <StepUpload
              campaignId={campaignId}
              kind="reference"
              kicker="Step 02 · Inspiration"
              title="Show us the vibe."
              copy="Editorial spreads, brand moodboards, campaigns you love. The AI extracts the shared creative language."
              data={data}
              onChange={() => refetch()}
            />
          )}
          {step === "Brief" && (
            <StepBrief
              campaignId={campaignId}
              data={data}
              onChange={() => refetch()}
            />
          )}
          {step === "Generate" && (
            <StepGenerate
              campaignId={campaignId}
              data={data}
              onChange={() => {
                qc.invalidateQueries({ queryKey: ["campaigns"] });
                refetch();
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {step !== "Generate" && (
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
            disabled={!canContinue}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-all hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue <ArrowRight className="size-4" />
          </button>
        </div>
      )}
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

type CampaignData = Awaited<ReturnType<typeof getCampaign>>;

function StepUpload({
  campaignId,
  kind,
  kicker,
  title,
  copy,
  data,
  onChange,
}: {
  campaignId: string;
  kind: "product" | "reference";
  kicker: string;
  title: string;
  copy: string;
  data: CampaignData;
  onChange: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const items = data.assets.filter((a) => a.kind === kind);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (arr.length === 0) {
        toast.error("Drop image files only (JPG, PNG, WEBP).");
        return;
      }
      setBusy(true);
      try {
        for (const f of arr) {
          if (f.size > 20 * 1024 * 1024) {
            toast.error(`${f.name} is over 20MB`);
            continue;
          }
          await uploadCampaignAsset(campaignId, kind, f);
        }
        toast.success(`${arr.length} ${kind}${arr.length === 1 ? "" : "s"} added`);
        onChange();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Upload failed";
        toast.error(msg);
      } finally {
        setBusy(false);
      }
    },
    [campaignId, kind, onChange],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <StepHeader kicker={kicker} title={title} copy={copy} />
      <GlassCard className="p-6">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "cursor-pointer rounded-2xl border-2 border-dashed bg-paper p-10 text-center transition-all",
            dragOver ? "border-violet bg-violet/5" : "border-border hover:border-ink/30",
          )}
        >
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-ink text-paper">
            {busy ? <Loader2 className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
          </div>
          <div className="mt-4 font-serif text-2xl italic">
            {busy ? "Uploading…" : kind === "product" ? "Drop your product" : "Drop references here"}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">PNG, JPG, WEBP up to 20MB</div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </div>

        {items.length > 0 && (
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>Uploaded · {items.length}</span>
              <span>{kind === "product" ? "8 max" : "12 max"}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-6">
              {items.map((a) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-stone-100 shadow-soft"
                >
                  {a.public_url ? (
                    <img src={a.public_url} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="size-full bg-gradient-to-br from-stone-200 to-stone-300" />
                  )}
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      await deleteAsset({ data: { assetId: a.id } });
                      onChange();
                    }}
                    className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-ink/80 text-paper opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="size-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function StepBrief({
  campaignId,
  data,
  onChange,
}: {
  campaignId: string;
  data: CampaignData;
  onChange: () => void;
}) {
  const brief = data.brief;
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [edits, setEdits] = useState<Record<string, string>>({});

  // Progress ticker while analyzing
  useEffect(() => {
    if (!analyzing) return;
    setProgress(0);
    const t = setInterval(() => setProgress((p) => Math.min(95, p + Math.random() * 8 + 2)), 700);
    return () => clearInterval(t);
  }, [analyzing]);

  const runAnalyze = async () => {
    setAnalyzing(true);
    try {
      await analyzeCampaign({ data: { id: campaignId } });
      setProgress(100);
      toast.success("Brief drafted by the Director.");
      onChange();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Analysis failed";
      toast.error(msg);
    } finally {
      setTimeout(() => setAnalyzing(false), 400);
    }
  };

  const save = async (key: string, value: string) => {
    setEdits((s) => ({ ...s, [key]: value }));
    try {
      await updateBrief({ data: { campaignId, patch: { [key]: value } } });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Save failed";
      toast.error(msg);
    }
  };

  if (!brief) {
    return (
      <div>
        <StepHeader
          kicker="Step 03 · Creative Brief"
          title="Let the Director read the room."
          copy="The AI will study every reference and product photo and write a real, opinionated brief. You'll be able to edit anything before generating."
        />
        <GlassCard className="p-10 text-center">
          {analyzing ? (
            <div className="mx-auto max-w-md">
              <div className="mb-4 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <StatusDot tone="violet" /> Director reading {data.assets.length} image
                {data.assets.length === 1 ? "" : "s"}
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <motion.div className="h-full bg-gradient-to-r from-violet via-clay to-lime" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
              </div>
              <DirectorStream />
            </div>
          ) : (
            <>
              <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-ink text-paper">
                <Sparkles className="size-6" />
              </div>
              <h3 className="mt-4 font-serif text-3xl italic">Ready when you are.</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                {data.assets.filter((a) => a.kind === "reference").length} reference
                {data.assets.filter((a) => a.kind === "reference").length === 1 ? "" : "s"} ·{" "}
                {data.assets.filter((a) => a.kind === "product").length} product photo
                {data.assets.filter((a) => a.kind === "product").length === 1 ? "" : "s"}
              </p>
              <button
                onClick={runAnalyze}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-ink/90"
              >
                <Wand2 className="size-4 text-lime" /> Analyze and draft brief
              </button>
            </>
          )}
        </GlassCard>
      </div>
    );
  }

  const fields = [
    { key: "goal", label: "Campaign goal" },
    { key: "audience", label: "Audience" },
    { key: "position", label: "Brand position" },
    { key: "mood", label: "Mood" },
    { key: "color_strategy", label: "Color strategy" },
    { key: "visual_direction", label: "Visual direction" },
  ] as const;

  const dna = (brief.references_dna as Array<{ label: string; weight: number }> | null) ?? [];
  const palette = (brief.palette as string[] | null) ?? [];

  return (
    <div>
      <StepHeader
        kicker="Step 03 · Creative Brief"
        title="Approve the AI's reading."
        copy="Edit anything that feels off. This becomes the source of truth for every generated asset."
      />
      <GlassCard className="p-8">
        <div className="grid gap-6 md:grid-cols-2">
          {fields.map((f) => (
            <div key={f.key} className="rounded-2xl border border-border bg-paper p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {f.label}
              </div>
              <textarea
                defaultValue={(edits[f.key] ?? brief[f.key] ?? "") as string}
                onBlur={(e) => {
                  const v = e.target.value;
                  if (v !== (brief[f.key] ?? "")) save(f.key, v);
                }}
                rows={2}
                className="mt-1 w-full resize-none bg-transparent font-serif text-xl italic outline-none"
              />
            </div>
          ))}
        </div>

        {palette.length > 0 && (
          <div className="mt-6 flex items-center gap-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Palette</div>
            <div className="flex gap-2">
              {palette.slice(0, 6).map((c, i) => (
                <div
                  key={i}
                  className="size-7 rounded-full border border-border shadow-soft"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        )}

        {dna.length > 0 && (
          <div className="mt-6">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Inspiration DNA
            </div>
            <div className="space-y-2">
              {dna.slice(0, 5).map((d) => (
                <div key={d.label} className="text-xs">
                  <div className="flex items-center justify-between">
                    <span>{d.label}</span>
                    <span className="font-mono text-muted-foreground">{d.weight}%</span>
                  </div>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-ink" style={{ width: `${d.weight}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 rounded-2xl bg-ink p-5 text-paper">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-paper/60">Creative notes</div>
          <textarea
            defaultValue={(edits.notes ?? brief.notes ?? "") as string}
            onBlur={(e) => {
              if (e.target.value !== (brief.notes ?? "")) save("notes", e.target.value);
            }}
            rows={3}
            className="w-full resize-none bg-transparent font-serif text-lg italic placeholder:text-paper/40 outline-none"
          />
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={runAnalyze}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs text-ink hover:border-ink/30"
          >
            <Wand2 className="size-3.5" /> Re-analyze
          </button>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            edits auto-save on blur
          </span>
        </div>
      </GlassCard>
    </div>
  );
}

function DirectorStream() {
  const lines = useMemo(
    () => [
      "Studying composition…",
      "Mapping palette and contrast…",
      "Reading lighting and mood…",
      "Inferring positioning…",
      "Drafting brief…",
    ],
    [],
  );
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setShown((s) => (s < lines.length ? s + 1 : s)), 900);
    return () => clearInterval(t);
  }, [lines.length]);
  return (
    <div className="mt-5 space-y-1 text-left font-mono text-[12px] text-ink">
      {lines.slice(0, shown).map((l) => (
        <div key={l} className="flex items-center gap-2">
          <span className="text-violet">✓</span>
          {l}
        </div>
      ))}
    </div>
  );
}

const ALL_PLATFORMS = ["IG Feed", "IG Story", "LinkedIn", "X", "Pinterest"] as const;
const VOICES = ["Minimal", "Luxury", "Founder-led", "Editorial", "Playful", "Bold"];

function StepGenerate({
  campaignId,
  data,
  onChange,
}: {
  campaignId: string;
  data: CampaignData;
  onChange: () => void;
}) {
  const navigate = useNavigate();
  const c = data.campaign;
  const [voice, setVoice] = useState<string>(c.voice ?? "Editorial");
  const [freedom, setFreedom] = useState<number>(c.freedom ?? 60);
  const [platforms, setPlatforms] = useState<string[]>(c.platforms ?? ["IG Feed"]);
  const [name, setName] = useState<string>(c.name ?? "");

  const mut = useMutation({
    mutationFn: async () => {
      await updateCampaign({
        data: {
          campaignId,
          patch: { name: name || "Untitled campaign", voice, freedom, platforms },
        },
      });
      await generateVariants({ data: { id: campaignId } });
    },
    onSuccess: () => {
      onChange();
      toast.success("Campaign ready.");
      navigate({ to: "/studio/c/$id", params: { id: campaignId } });
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : "Generation failed";
      toast.error(msg);
    },
  });

  const togglePlatform = (p: string) =>
    setPlatforms((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));

  return (
    <div>
      <StepHeader
        kicker="Step 04 · Generate"
        title="Pick your voice. Set your freedom. Ship."
        copy="The Director will produce three directions per platform, each scored against the brief."
      />

      <div className="mb-5 rounded-2xl border border-border bg-white p-5">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Campaign name</div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Morning Ritual"
          className="mt-1 w-full bg-transparent font-serif text-3xl italic outline-none placeholder:text-muted-foreground/50"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-[1.1fr_1fr]">
        <GlassCard className="p-6">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Brand voice</div>
          <div className="flex flex-wrap gap-2">
            {VOICES.map((v) => (
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
          </div>

          <div className="mt-6">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Platforms</div>
            <div className="flex flex-wrap gap-2">
              {ALL_PLATFORMS.map((p) => {
                const on = platforms.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => togglePlatform(p)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-all",
                      on
                        ? "border-violet bg-violet/10 text-violet"
                        : "border-border bg-white text-muted-foreground hover:border-ink/30",
                    )}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="bg-ink/95 p-6 text-paper">
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-paper/60">
            <StatusDot tone="lime" /> Director preview
          </div>
          <div className="font-serif text-2xl leading-snug italic">
            "I'll produce 3 directions across {platforms.length} platform{platforms.length === 1 ? "" : "s"} — leading with{" "}
            {data.brief?.visual_direction?.toLowerCase() ?? "your reference language"}, dialed{" "}
            {freedom < 40 ? "close to reference" : freedom < 75 ? "with confident reinterpretation" : "into unexpected territory"}.{" "}
            {voice} voice throughout."
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Chip tone="lime" dot>{platforms.length * 3} variants</Chip>
            <Chip tone="violet">Gemini 2.5 Flash Image</Chip>
            <Chip tone="muted">~1–2 min</Chip>
          </div>
          <button
            disabled={mut.isPending || platforms.length === 0}
            onClick={() => mut.mutate()}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-lime py-3 text-sm font-medium text-ink transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mut.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Generating campaign…
              </>
            ) : (
              <>
                <Wand2 className="size-4" /> Generate campaign
              </>
            )}
          </button>
          {mut.isPending && (
            <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-widest text-paper/60">
              keep this tab open · usually 60–120 sec
            </p>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

// Tiny utility chip imports satisfied
void Trash2;
