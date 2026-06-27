import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/* ----------------------------- Schemas ----------------------------- */

const IdInput = z.object({ id: z.string().uuid() });

const CreateCampaignInput = z.object({
  name: z.string().min(1).max(120).optional(),
});

const RecordAssetInput = z.object({
  campaignId: z.string().uuid(),
  kind: z.enum(["product", "reference"]),
  storagePath: z.string().min(1),
  mime: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

const DeleteAssetInput = z.object({ assetId: z.string().uuid() });

const CreateUploadUrlInput = z.object({
  campaignId: z.string().uuid(),
  kind: z.enum(["product", "reference"]),
  filename: z.string().min(1).max(200),
});

const UpdateBriefInput = z.object({
  campaignId: z.string().uuid(),
  patch: z.object({
    goal: z.string().optional(),
    audience: z.string().optional(),
    position: z.string().optional(),
    mood: z.string().optional(),
    color_strategy: z.string().optional(),
    visual_direction: z.string().optional(),
    notes: z.string().optional(),
  }),
});

const UpdateCampaignInput = z.object({
  campaignId: z.string().uuid(),
  patch: z.object({
    name: z.string().optional(),
    voice: z.string().optional(),
    freedom: z.number().int().min(0).max(100).optional(),
    platforms: z.array(z.string()).optional(),
    status: z.string().optional(),
  }),
});

const RegenerateVariantInput = z.object({
  variantId: z.string().uuid(),
  instruction: z.string().optional(),
});

const ReframeVariantInput = z.object({
  variantId: z.string().uuid(),
  platform: z.string().min(1).max(40),
  aspect: z.enum(["1:1", "4:5", "9:16", "16:9", "2:3"]),
});

const DirectorChatInput = z.object({
  campaignId: z.string().uuid(),
  message: z.string().min(1).max(2000),
});

/* ----------------------------- Helpers ----------------------------- */

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/* ----------------------------- Reads ----------------------------- */

export const listCampaigns = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await admin();
  const { data, error } = await sb
    .from("campaigns")
    .select("id,name,brand,status,platforms,cover_path,created_at,updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getCampaign = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => IdInput.parse(d))
  .handler(async ({ data }) => {
    const sb = await admin();
    const [campaign, assets, brief, variants] = await Promise.all([
      sb.from("campaigns").select("*").eq("id", data.id).single(),
      sb.from("campaign_assets").select("*").eq("campaign_id", data.id).order("created_at"),
      sb.from("creative_briefs").select("*").eq("campaign_id", data.id).maybeSingle(),
      sb.from("variants").select("*").eq("campaign_id", data.id).order("created_at"),
    ]);
    if (campaign.error) throw new Error(campaign.error.message);
    return {
      campaign: campaign.data,
      assets: assets.data ?? [],
      brief: brief.data ?? null,
      variants: variants.data ?? [],
    };
  });

/* ----------------------------- Writes ----------------------------- */

export const createCampaign = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => CreateCampaignInput.parse(d))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { data: row, error } = await sb
      .from("campaigns")
      .insert({ name: data.name ?? "Untitled campaign" })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const updateCampaign = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => UpdateCampaignInput.parse(d))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { error } = await sb.from("campaigns").update(data.patch).eq("id", data.campaignId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const recordAsset = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => RecordAssetInput.parse(d))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { data: signed, error: signErr } = await sb.storage
      .from("campaign-inputs")
      .createSignedUrl(data.storagePath, 60 * 60 * 24 * 365);
    if (signErr) throw new Error(signErr.message);
    const { data: row, error } = await sb
      .from("campaign_assets")
      .insert({
        campaign_id: data.campaignId,
        kind: data.kind,
        storage_path: data.storagePath,
        public_url: signed?.signedUrl ?? "",
        mime: data.mime ?? null,
        width: data.width ?? null,
        height: data.height ?? null,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const createUploadUrl = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => CreateUploadUrlInput.parse(d))
  .handler(async ({ data }) => {
    const safe = data.filename.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80);
    const path = `${data.campaignId}/${data.kind}/${crypto.randomUUID()}-${safe}`;
    const sb = await admin();
    const { data: signed, error } = await sb.storage
      .from("campaign-inputs")
      .createSignedUploadUrl(path);
    if (error) throw new Error(error.message);
    return { path, token: signed.token, signedUrl: signed.signedUrl };
  });

export const deleteAsset = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => DeleteAssetInput.parse(d))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { data: row } = await sb
      .from("campaign_assets")
      .select("storage_path")
      .eq("id", data.assetId)
      .single();
    if (row?.storage_path) {
      await sb.storage.from("campaign-inputs").remove([row.storage_path]).catch(() => {});
    }
    const { error } = await sb.from("campaign_assets").delete().eq("id", data.assetId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateBrief = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => UpdateBriefInput.parse(d))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { error } = await sb
      .from("creative_briefs")
      .update(data.patch)
      .eq("campaign_id", data.campaignId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ----------------------------- AI: Analyze ----------------------------- */

const BriefSchema = z.object({
  goal: z.string().describe("Campaign goal in 3-6 words"),
  audience: z.string().describe("Target audience in one phrase"),
  position: z.string().describe("Brand positioning in one short phrase"),
  mood: z.string().describe("2-4 mood adjectives"),
  color_strategy: z.string().describe("Short palette description"),
  visual_direction: z.string().describe("Short composition + style direction"),
  palette: z.array(z.string()).describe("Up to 6 hex colors like #AABBCC"),
  references_dna: z
    .array(z.object({ label: z.string(), weight: z.number() }))
    .describe("Inferred reference influences with percent weights summing to 100"),
  notes: z.string().describe("Single paragraph of creative notes for the team"),
});

function extractJSON(raw: string): unknown {
  let s = raw
    .replace(/^```(?:json)?\s*/im, "")
    .replace(/```\s*$/im, "")
    .trim();
  if (!s.startsWith("{") && !s.startsWith("[")) {
    const o = s.indexOf("{");
    const a = s.indexOf("[");
    const isArr = a !== -1 && (o === -1 || a < o);
    const start = isArr ? a : o;
    const end = isArr ? s.lastIndexOf("]") : s.lastIndexOf("}");
    if (start === -1 || end <= start) throw new Error("No JSON found in AI response");
    s = s.slice(start, end + 1);
  }
  return JSON.parse(s);
}

type ImageGenResult = { b64: string; mime: string };

type CampaignAssetRef = { kind: string; public_url: string | null };

type CampaignImageContext = {
  products: string[];
  references: string[];
  images: string[];
};

function splitCampaignAssets(assets: CampaignAssetRef[]): CampaignImageContext {
  const products = assets
    .filter((a) => a.kind === "product" && a.public_url)
    .map((a) => a.public_url!)
    .slice(0, 4);
  const references = assets
    .filter((a) => a.kind === "reference" && a.public_url)
    .map((a) => a.public_url!)
    .slice(0, 3);
  return { products, references, images: [...products, ...references] };
}

function productAwareImagePrompt(
  scenePrompt: string,
  productCount: number,
  refCount: number,
): string {
  const lines = [
    productCount > 0
      ? `CRITICAL: The first ${productCount} attached image(s) show the exact PRODUCT. Reproduce this product faithfully — same shape, color, material, and details. Do NOT substitute a different product category (e.g. no sneakers if the product is a dress shoe) and do NOT add brand logos.`
      : "",
    refCount > 0
      ? `The next ${refCount} attached image(s) are STYLE REFERENCES — match their photography style, composition, lighting, and mood while featuring the product as the hero.`
      : "",
    scenePrompt.trim(),
    "No text overlays, captions, logos, or watermarks in the image.",
  ].filter(Boolean);
  return lines.join("\n\n");
}

async function loadCampaignImageContext(campaignId: string): Promise<CampaignImageContext> {
  const sb = await admin();
  const { data: assets, error } = await sb
    .from("campaign_assets")
    .select("kind, public_url")
    .eq("campaign_id", campaignId);
  if (error) throw new Error(error.message);
  return splitCampaignAssets(assets ?? []);
}

async function generateAiText(
  request: import("@/server/ai").AiTextRequest,
): Promise<string> {
  const { getAiGateway, toUserFacingError } = await import("@/server/ai");
  try {
    const result = await getAiGateway().generateText(request);
    return result.text;
  } catch (error) {
    throw toUserFacingError(error);
  }
}

async function generateAiImage(
  operation: string,
  prompt: string,
  context?: CampaignImageContext,
): Promise<ImageGenResult> {
  const { getAiGateway, toUserFacingError } = await import("@/server/ai");
  const images = context?.images;
  const finalPrompt =
    images && images.length > 0
      ? productAwareImagePrompt(prompt, context!.products.length, context!.references.length)
      : prompt;
  try {
    const result = await getAiGateway().generateImage({
      operation,
      prompt: finalPrompt,
      images: images?.length ? images : undefined,
    });
    return { b64: result.b64, mime: result.mime };
  } catch (error) {
    throw toUserFacingError(error);
  }
}

export const analyzeCampaign = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => IdInput.parse(d))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { data: assets, error: aErr } = await sb
      .from("campaign_assets")
      .select("kind, public_url")
      .eq("campaign_id", data.id);
    if (aErr) throw new Error(aErr.message);
    if (!assets || assets.length === 0) {
      throw new Error("Upload at least one product photo or reference before analyzing.");
    }

    await sb.from("campaigns").update({ status: "analyzing" }).eq("id", data.id);

    const products = assets.filter((a) => a.kind === "product").slice(0, 4);
    const refs = assets.filter((a) => a.kind === "reference").slice(0, 8);

    const userParts: Array<{ type: "text"; text: string } | { type: "image"; image: string }> = [
      {
        type: "text",
        text: `You are the Creative Director for a product marketing studio.
Look at the PRODUCT photos and the INSPIRATION references the founder has dropped.
Write a real creative brief that captures the SHARED visual language of the references
and how it should be applied to the product. Be specific, opinionated, and concise —
this becomes the source of truth for every generated asset.

${products.length} product photo(s) and ${refs.length} reference(s) attached.

Return ONLY a JSON object (no prose, no markdown fences) with EXACTLY these keys:
- goal (string, 3-6 words)
- audience (string, one phrase)
- position (string, one short phrase)
- mood (string, 2-4 adjectives)
- color_strategy (string)
- visual_direction (string)
- palette (array of up to 6 hex color strings like "#AABBCC")
- references_dna (array of up to 5 objects { "label": string, "weight": number 0-100 } summing to 100)
- notes (string, one paragraph)`,
      },
      ...products.map((p) => ({ type: "image" as const, image: p.public_url })),
      { type: "text", text: "— INSPIRATION REFERENCES —" },
      ...refs.map((r) => ({ type: "image" as const, image: r.public_url })),
    ];

    const text = await generateAiText({
      operation: "analyzeCampaign",
      messages: [{ role: "user", content: userParts }],
    });

    let parsed: unknown;
    try {
      parsed = extractJSON(text);
    } catch (e) {
      throw new Error(`AI returned unparseable brief. ${(e as Error).message}`);
    }
    const result = BriefSchema.safeParse(parsed);
    if (!result.success) {
      throw new Error(`AI brief missing fields: ${result.error.issues.map((i) => i.path.join(".")).join(", ")}`);
    }
    const brief = result.data;

    await sb
      .from("creative_briefs")
      .upsert({ campaign_id: data.id, ...brief }, { onConflict: "campaign_id" });
    await sb.from("campaigns").update({ status: "draft" }).eq("id", data.id);

    return brief;
  });

/* ----------------------------- AI: Image generation ----------------------------- */

async function generateImage(
  prompt: string,
  operation: string,
  context?: CampaignImageContext,
): Promise<ImageGenResult> {
  return generateAiImage(operation, prompt, context);
}

async function uploadOutput(campaignId: string, b64: string, mime: string) {
  const sb = await admin();
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const ext = mime === "image/jpeg" ? "jpg" : "png";
  const path = `${campaignId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage.from("campaign-outputs").upload(path, bytes, {
    contentType: mime,
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const { data: signed } = await sb.storage
    .from("campaign-outputs")
    .createSignedUrl(path, 60 * 60 * 24 * 365);
  return { path, url: signed?.signedUrl ?? "" };
}

/* ----------------------------- AI: Generate variants ----------------------------- */

const VariantMetaSchema = z.object({
  variants: z
    .array(
      z.object({
        platform: z.string(),
        direction_label: z.string(),
        title: z.string(),
        mood_caption: z.string(),
        caption_body: z.string(),
        match_score: z.number(),
        why: z.array(z.string()),
        prompt: z.string().describe("Detailed image-generation prompt embodying the brief"),
      }),
    )
    .min(1),
});

const PLATFORM_ASPECT: Record<string, string> = {
  "IG Feed": "1:1 square composition",
  "IG Story": "9:16 vertical composition",
  LinkedIn: "1.91:1 landscape composition",
  X: "16:9 landscape composition",
  Pinterest: "2:3 vertical composition",
};

export const generateVariants = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => IdInput.parse(d))
  .handler(async ({ data }) => {
    const sb = await admin();

    const [campaignRes, briefRes, assetsRes] = await Promise.all([
      sb.from("campaigns").select("*").eq("id", data.id).single(),
      sb.from("creative_briefs").select("*").eq("campaign_id", data.id).maybeSingle(),
      sb.from("campaign_assets").select("kind, public_url").eq("campaign_id", data.id),
    ]);
    if (campaignRes.error) throw new Error(campaignRes.error.message);
    const campaign = campaignRes.data;
    const brief = briefRes.data;
    const assets = assetsRes.data ?? [];
    if (!brief) throw new Error("Run the brief analysis first.");

    await sb.from("campaigns").update({ status: "generating" }).eq("id", data.id);
    await sb.from("variants").delete().eq("campaign_id", data.id);

    const platforms: string[] = (campaign.platforms ?? ["IG Feed"]).slice(0, 4);
    const directionsPerPlatform = 3;

    const refCount = assets.filter((a) => a.kind === "reference").length;
    const productCount = assets.filter((a) => a.kind === "product").length;
    const imageContext = splitCampaignAssets(assets);
    const products = assets.filter((a) => a.kind === "product" && a.public_url).slice(0, 4);
    const refs = assets.filter((a) => a.kind === "reference" && a.public_url).slice(0, 3);

    const variantPlanParts: Array<{ type: "text"; text: string } | { type: "image"; image: string }> = [
      {
        type: "text",
        text: `You are the Creative Director generating a real campaign.

CAMPAIGN: ${campaign.name}
BRAND VOICE: ${campaign.voice}
CREATIVE FREEDOM (0=safe, 100=wild): ${campaign.freedom}
PLATFORMS: ${platforms.join(", ")}

BRIEF
- Goal: ${brief.goal}
- Audience: ${brief.audience}
- Position: ${brief.position}
- Mood: ${brief.mood}
- Palette: ${brief.color_strategy} (${(Array.isArray(brief.palette) ? brief.palette : []).join(", ")})
- Visual direction: ${brief.visual_direction}
- Notes: ${brief.notes}

${productCount} product photo(s) and ${refCount} reference image(s) attached below.

TASK: Produce exactly ${platforms.length * directionsPerPlatform} variants — ${directionsPerPlatform} distinct directions per platform.
For each variant return:
- platform (must be one of: ${platforms.join(", ")})
- direction_label (2-3 words, evocative, no numbers)
- title (2-4 words, editorial)
- mood_caption (1 short line describing the visual mood)
- caption_body (1-2 sentence social caption written in the brand voice)
- match_score (60-99 — how well it serves the brief)
- why (2-4 short bullet phrases on why this works)
- prompt (a detailed image-generation prompt describing ONLY the scene, composition, lighting, palette, framing, and props — reference the attached product explicitly by its visible traits. Include platform aspect ratio guidance: ${Object.entries(PLATFORM_ASPECT).map(([p, a]) => `${p} = ${a}`).join("; ")}. The product from the attached photos must be the hero. Never include text overlays in the image.)

Vary the directions meaningfully (e.g., editorial still life / lifestyle / abstract).

Return ONLY a JSON object (no prose, no markdown fences) shaped exactly:
{ "variants": [ { "platform": string, "direction_label": string, "title": string, "mood_caption": string, "caption_body": string, "match_score": number, "why": [string, ...], "prompt": string } ] }`,
      },
      ...products.map((p) => ({ type: "image" as const, image: p.public_url! })),
      ...(refs.length > 0 ? [{ type: "text" as const, text: "— INSPIRATION REFERENCES —" }] : []),
      ...refs.map((r) => ({ type: "image" as const, image: r.public_url! })),
    ];

    const metaText = await generateAiText({
      operation: "generateVariants",
      messages: [{ role: "user", content: variantPlanParts }],
    });

    let metaParsed: unknown;
    try {
      metaParsed = extractJSON(metaText);
    } catch (e) {
      throw new Error(`AI returned unparseable variants. ${(e as Error).message}`);
    }
    const metaResult = VariantMetaSchema.safeParse(metaParsed);
    if (!metaResult.success) {
      throw new Error(`AI variants invalid: ${metaResult.error.issues.map((i) => i.path.join(".")).join(", ")}`);
    }
    const meta = metaResult.data;

    const created: Array<{ id: string }> = [];
    for (const v of meta.variants.slice(0, platforms.length * directionsPerPlatform)) {
      try {
        const img = await generateImage(v.prompt, "generateVariants.image", imageContext);
        const { path, url } = await uploadOutput(data.id, img.b64, img.mime);
        const { data: row, error } = await sb
          .from("variants")
          .insert({
            campaign_id: data.id,
            platform: v.platform,
            direction_label: v.direction_label,
            title: v.title,
            mood_caption: v.mood_caption,
            caption_body: v.caption_body,
            storage_path: path,
            public_url: url,
            match_score: v.match_score,
            reasoning: { why: v.why, dna: brief.references_dna ?? [] },
            prompt: v.prompt,
          })
          .select("id")
          .single();
        if (!error && row) created.push({ id: row.id });
      } catch (err) {
        console.error("variant gen failed", err);
      }
    }

    if (created.length > 0) {
      const { data: first } = await sb
        .from("variants")
        .select("public_url")
        .eq("campaign_id", data.id)
        .order("created_at")
        .limit(1)
        .single();
      if (first?.public_url) {
        await sb.from("campaigns").update({ cover_path: first.public_url }).eq("id", data.id);
      }
    }

    await sb.from("campaigns").update({ status: "ready" }).eq("id", data.id);
    return { count: created.length };
  });

export const regenerateVariant = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => RegenerateVariantInput.parse(d))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { data: v, error } = await sb
      .from("variants")
      .select("*")
      .eq("id", data.variantId)
      .single();
    if (error) throw new Error(error.message);
    const tweak = data.instruction?.trim()
      ? `\n\nADDITIONAL DIRECTION: ${data.instruction.trim()}`
      : "";
    const prompt = `${v.prompt}${tweak}`;
    const imageContext = await loadCampaignImageContext(v.campaign_id);
    const img = await generateImage(prompt, "regenerateVariant", imageContext);
    const { path, url } = await uploadOutput(v.campaign_id, img.b64, img.mime);
    if (v.storage_path) await sb.storage.from("campaign-outputs").remove([v.storage_path]).catch(() => {});
    await sb
      .from("variants")
      .update({ storage_path: path, public_url: url, prompt })
      .eq("id", v.id);
    return { id: v.id, public_url: url };
  });

const ASPECT_GUIDE: Record<string, string> = {
  "1:1": "1:1 perfect square composition",
  "4:5": "4:5 vertical portrait composition",
  "9:16": "9:16 tall vertical composition (mobile story / reels)",
  "16:9": "16:9 wide landscape composition",
  "2:3": "2:3 vertical pin composition",
};

export const reframeVariant = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ReframeVariantInput.parse(d))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { data: v, error } = await sb
      .from("variants")
      .select("*")
      .eq("id", data.variantId)
      .single();
    if (error) throw new Error(error.message);

    const aspectGuide = ASPECT_GUIDE[data.aspect];
    const basePrompt = (v.prompt ?? "").replace(/\b(1:1|4:5|9:16|16:9|2:3)\s*[a-z ]*composition\b/gi, "").trim();
    const prompt = `${basePrompt}

REFRAME for ${data.platform} — ${aspectGuide}. Preserve the subject, palette, mood and lighting from the original; recompose the framing, crop and negative space to feel native to ${data.platform}. Keep the product the clear focal point. No text overlays.`;

    const img = await generateImage(prompt, "reframeVariant", await loadCampaignImageContext(v.campaign_id));
    const { path, url } = await uploadOutput(v.campaign_id, img.b64, img.mime);

    const parentReasoning = (v.reasoning && typeof v.reasoning === "object" ? v.reasoning : {}) as Record<string, unknown>;
    const reasoning = {
      ...parentReasoning,
      parent_variant_id: v.id,
      parent_title: v.title,
      reframed_aspect: data.aspect,
    };

    const { data: row, error: insErr } = await sb
      .from("variants")
      .insert({
        campaign_id: v.campaign_id,
        parent_variant_id: v.parent_variant_id ?? v.id,
        platform: data.platform,
        direction_label: `Reframe · ${data.aspect}`,
        title: v.title,
        mood_caption: v.mood_caption,
        caption_body: v.caption_body,
        storage_path: path,
        public_url: url,
        match_score: v.match_score,
        reasoning,
        prompt,
      })
      .select("id")
      .single();
    if (insErr) throw new Error(insErr.message);
    return { id: row.id as string, public_url: url };
  });

export const listDirectorMessages = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => IdInput.parse(d))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { data: rows, error } = await sb
      .from("director_messages")
      .select("id,role,content,created_at")
      .eq("campaign_id", data.id)
      .order("created_at");
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const directorChat = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => DirectorChatInput.parse(d))
  .handler(async ({ data }) => {
    const sb = await admin();
    const [campaignRes, briefRes, msgsRes, variantsRes] = await Promise.all([
      sb.from("campaigns").select("name,voice,freedom,platforms").eq("id", data.campaignId).single(),
      sb.from("creative_briefs").select("*").eq("campaign_id", data.campaignId).maybeSingle(),
      sb.from("director_messages").select("role,content").eq("campaign_id", data.campaignId).order("created_at").limit(20),
      sb.from("variants").select("title,platform,match_score").eq("campaign_id", data.campaignId).limit(12),
    ]);
    if (campaignRes.error) throw new Error(campaignRes.error.message);
    const campaign = campaignRes.data;
    const brief = briefRes.data;
    const history = msgsRes.data ?? [];
    const variants = variantsRes.data ?? [];

    await sb
      .from("director_messages")
      .insert({ campaign_id: data.campaignId, role: "user", content: data.message });

    const systemPrompt = `You are the Creative Director inside Campaign Studio — opinionated, warm, concise.
You respond in short paragraphs (2-5 sentences) with confident creative direction.
You do NOT generate images here; you guide the human and suggest what to regenerate.

CAMPAIGN: ${campaign.name}
VOICE: ${campaign.voice} · FREEDOM: ${campaign.freedom} · PLATFORMS: ${(campaign.platforms ?? []).join(", ")}
${brief ? `BRIEF
- Goal: ${brief.goal}
- Audience: ${brief.audience}
- Position: ${brief.position}
- Mood: ${brief.mood}
- Palette: ${brief.color_strategy}
- Visual direction: ${brief.visual_direction}` : "(no brief yet)"}
${variants.length ? `CURRENT VARIANTS: ${variants.map((v) => `${v.title} (${v.platform}, ${v.match_score}%)`).join(" · ")}` : ""}`;

    const text = await generateAiText({
      operation: "directorChat",
      system: systemPrompt,
      messages: [
        ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user" as const, content: data.message },
      ],
    });

    await sb
      .from("director_messages")
      .insert({ campaign_id: data.campaignId, role: "assistant", content: text });

    return { reply: text };
  });
