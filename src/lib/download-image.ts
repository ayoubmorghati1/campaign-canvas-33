export type AspectRatio = "1:1" | "4:5" | "9:16" | "16:9" | "2:3";

function aspectToFloat(a: AspectRatio): number {
  const [w, h] = a.split(":").map(Number);
  return w / h;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

/**
 * Center-crop an image to the target aspect ratio and return a Blob.
 * Worker runtime can't run sharp; this runs in the browser via <canvas>.
 */
export async function cropToAspect(url: string, aspect: AspectRatio): Promise<Blob> {
  const img = await loadImage(url);
  const target = aspectToFloat(aspect);
  const source = img.naturalWidth / img.naturalHeight;

  let sx = 0;
  let sy = 0;
  let sw = img.naturalWidth;
  let sh = img.naturalHeight;

  if (source > target) {
    // source wider than target — crop the sides
    sw = Math.round(img.naturalHeight * target);
    sx = Math.round((img.naturalWidth - sw) / 2);
  } else if (source < target) {
    // source taller than target — crop top/bottom
    sh = Math.round(img.naturalWidth / target);
    sy = Math.round((img.naturalHeight - sh) / 2);
  }

  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas export failed"))),
      "image/png",
      0.95,
    );
  });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "variant";
}

/**
 * Download a variant image. If aspect is provided, center-crops to it first
 * so the saved file actually has the right pixel ratio (e.g. real 9:16).
 */
export async function downloadVariant(opts: {
  url: string;
  filenameBase: string;
  aspect?: AspectRatio | null;
}) {
  const { url, filenameBase, aspect } = opts;
  const safeBase = slug(filenameBase);
  if (aspect) {
    const blob = await cropToAspect(url, aspect);
    triggerDownload(blob, `${safeBase}-${aspect.replace(":", "x")}.png`);
    return;
  }
  // Native download — fetch as blob to force download behavior even cross-origin
  const res = await fetch(url);
  const blob = await res.blob();
  const ext = blob.type === "image/jpeg" ? "jpg" : "png";
  triggerDownload(blob, `${safeBase}.${ext}`);
}

export function aspectClass(aspect?: string | null): string {
  switch (aspect) {
    case "1:1":
      return "aspect-square";
    case "4:5":
      return "aspect-[4/5]";
    case "9:16":
      return "aspect-[9/16]";
    case "16:9":
      return "aspect-[16/9]";
    case "2:3":
      return "aspect-[2/3]";
    default:
      return "aspect-[4/5]";
  }
}