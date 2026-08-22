import { readFile } from "node:fs/promises";
import path from "node:path";
import { mediaDirectory } from "@/cms/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const contentTypes: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  const safeFilename = path.basename(filename);
  if (filename !== safeFilename) return new Response("Not found", { status: 404 });

  try {
    const image = await readFile(path.join(mediaDirectory(), safeFilename));
    return new Response(image, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": contentTypes[path.extname(safeFilename).toLowerCase()] ||
          "application/octet-stream",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
