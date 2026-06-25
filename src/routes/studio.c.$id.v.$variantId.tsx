import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Layers, Loader2 } from "lucide-react";
import { z } from "zod";
import { Chip, SectionLabel, StatusDot } from "@/components/studio/primitives";
import { aspectClass } from "@/lib/download-image";
import { getCampaign } from "@/lib/campaigns.functions";
import { cn } from "@/lib/utils";
import {
  FloatingDirector,
  Inspector,
  reframedAspectOf,
  type CampaignData,
  type Variant,
} from "./studio.c.$id";
import { useState } from "react";

const search = z.object({ focus: z.string().optional() });

export const Route = createFileRoute("/studio/c/$id/v/$variantId")({
  validateSearch: (s) => search.parse(s),
  head: () => ({
    meta: [
      { title: "Variant · Campaign Studio" },
      { name: "description", content: "Variant workspace — formats, derivatives and creative controls." },
    ],
  }),
  component: VariantWorkspace,
});

function VariantWorkspace() {
  const { id, variantId } = Route.useParams();
  const { focus } = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [directorOpen, setDirectorOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => getCampaign({ data: { id } }),
  });

  if (!data) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-muted-foreground">
        <div className="flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" /> Loading variant…
        </div>
      </div>
    );
  }

  const { campaign, brief, variants } = data as CampaignData;
  const target = variants.find((v) => v.id === variantId);
  if (!target) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-center">
        <div>
          <div className="font-serif text-2xl italic text-muted-foreground">Variant not found.</div>
          <Link
            to="/studio/c/$id"
            params={{ id }}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm text-paper"
          >
            <ArrowLeft className="size-4" /> Back to campaign
          </Link>
        </div>
      </div>
    );
  }

  // Root variant for this group
  const rootId = target.parent_variant_id ?? target.id;
  const root = variants.find((v) => v.id === rootId) ?? target;
  const children = variants.filter((v) => v.parent_variant_id === rootId);
  const group: Variant[] = [root, ...children];

  const focused = group.find((v) => v.id === focus) ?? root;
  const focusedAspect = reframedAspectOf(focused);
  const focusedAspectCls = aspectClass(focusedAspect);

  const setFocus = (vid: string) =>
    navigate({
      to: "/studio/c/$id/v/$variantId",
      params: { id, variantId: rootId },
      search: vid === rootId ? {} : { focus: vid },
      replace: true,
    });

  return (
    <div className="relative min-h-[calc(100vh-57px)]">
      <div className="border-b border-border bg-paper/80 px-8 py-5 backdrop-blur">
        <div className="flex items-center justify-between gap-6">
          <div className="min-w-0">
            <SectionLabel>
              <Link to="/studio/c/$id" params={{ id }} className="hover:text-ink">
                {campaign.name}
              </Link>{" "}
              · Variant
            </SectionLabel>
            <h1 className="mt-1 truncate font-serif text-4xl tracking-tight">
              {root.title} <span className="italic text-violet">·</span>
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Chip tone="violet">{root.platform}</Chip>
              <Chip tone="muted">{group.length} format{group.length === 1 ? "" : "s"}</Chip>
              {focused.id !== root.id && focusedAspect && (
                <Chip tone="lime" dot>
                  viewing {focusedAspect}
                </Chip>
              )}
            </div>
          </div>
          <Link
            to="/studio/c/$id"
            params={{ id }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-xs hover:border-ink/30"
          >
            <ArrowLeft className="size-3.5" /> All variants
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 px-8 py-8 lg:grid-cols-[minmax(0,1fr)_440px]">
        {/* Hero + derivatives */}
        <div className="min-w-0">
          <motion.div
            key={focused.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "mx-auto overflow-hidden rounded-3xl border border-border bg-stone-100 shadow-soft",
              focusedAspectCls,
              "max-h-[78vh] w-auto max-w-full",
            )}
            style={{ aspectRatio: aspectStyleFor(focusedAspect) }}
          >
            {focused.public_url ? (
              <img
                src={focused.public_url}
                alt={focused.title}
                className="size-full object-cover"
              />
            ) : (
              <div className="grid size-full place-items-center text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
              </div>
            )}
          </motion.div>

          {/* Derivatives strip */}
          <div className="mt-8">
            <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <Layers className="size-3" /> Formats & derivatives · {group.length}
            </div>
            <div className="flex gap-3 overflow-x-auto pb-3">
              {group.map((v) => {
                const aspect = reframedAspectOf(v);
                const isActive = v.id === focused.id;
                const isRoot = v.id === rootId;
                return (
                  <button
                    key={v.id}
                    onClick={() => setFocus(v.id)}
                    className={cn(
                      "group relative shrink-0 overflow-hidden rounded-2xl border bg-white text-left transition-all",
                      isActive
                        ? "border-ink shadow-glow"
                        : "border-border hover:-translate-y-0.5 hover:border-ink/40",
                    )}
                    style={{ width: 140 }}
                  >
                    <div
                      className={cn("relative w-full bg-stone-100", aspectClass(aspect))}
                    >
                      {v.public_url && (
                        <img
                          src={v.public_url}
                          alt={v.title}
                          className="absolute inset-0 size-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-1 px-2.5 py-2 text-[10px]">
                      <span className="truncate font-mono uppercase tracking-widest text-muted-foreground">
                        {isRoot ? "Original" : aspect ?? "Variant"}
                      </span>
                      <StatusDot tone={isActive ? "lime" : "violet"} />
                    </div>
                  </button>
                );
              })}
              <div
                className="grid shrink-0 place-items-center rounded-2xl border border-dashed border-border bg-white/40 px-4 text-center text-[10px] uppercase tracking-widest text-muted-foreground"
                style={{ width: 140 }}
              >
                Use Reframe →<br />to add a format
              </div>
            </div>
          </div>
        </div>

        {/* Inspector rail (in-page, not a drawer) */}
        <aside className="rounded-3xl border border-border bg-paper">
          <Inspector
            campaignId={id}
            variant={focused}
            campaignName={campaign.name}
            dna={(brief?.references_dna as Array<{ label: string; weight: number }> | null) ?? []}
            onRefresh={() => qc.invalidateQueries({ queryKey: ["campaign", id] })}
            hideHero
          />
        </aside>
      </div>

      <FloatingDirector campaignId={id} open={directorOpen} onOpenChange={setDirectorOpen} />
    </div>
  );
}

function aspectStyleFor(a: string | null): string | undefined {
  switch (a) {
    case "1:1":
      return "1 / 1";
    case "4:5":
      return "4 / 5";
    case "9:16":
      return "9 / 16";
    case "16:9":
      return "16 / 9";
    case "2:3":
      return "2 / 3";
    default:
      return undefined;
  }
}