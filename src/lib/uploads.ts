import { supabase } from "@/integrations/supabase/client";
import { recordAsset } from "@/lib/campaigns.functions";

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80);
}

export async function uploadCampaignAsset(
  campaignId: string,
  kind: "product" | "reference",
  file: File,
) {
  const path = `${campaignId}/${kind}/${crypto.randomUUID()}-${safeName(file.name)}`;
  const { error } = await supabase.storage.from("campaign-inputs").upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) throw new Error(error.message);

  // Read intrinsic size for nicer UX (optional)
  let width: number | undefined;
  let height: number | undefined;
  try {
    const dims = await new Promise<{ w: number; h: number }>((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ w: img.naturalWidth, h: img.naturalHeight });
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };
      img.src = url;
    });
    width = dims.w;
    height = dims.h;
  } catch {
    // non-image or load failed — skip dims
  }

  const row = await recordAsset({
    data: {
      campaignId,
      kind,
      storagePath: path,
      mime: file.type || undefined,
      width,
      height,
    },
  });
  return row;
}