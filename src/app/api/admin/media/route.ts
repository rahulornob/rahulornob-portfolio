import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { cmsEditingEnabled, isAuthenticated } from "@/cms/auth";
import { isSameOrigin } from "@/cms/security";
import { mediaDirectory } from "@/cms/storage";

export const runtime = "nodejs";

const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
  ["image/gif", "gif"],
]);

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!cmsEditingEnabled()) {
    return NextResponse.json({ error: "Upload media locally, then deploy with Git." }, { status: 403 });
  }

  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  }

  const extension = allowedTypes.get(file.type);
  if (!extension) {
    return NextResponse.json(
      { error: "Use JPG, PNG, WebP, AVIF, or GIF images." },
      { status: 415 },
    );
  }

  if (file.size > 15 * 1024 * 1024) {
    return NextResponse.json({ error: "Images must be below 15 MB." }, { status: 413 });
  }

  const filename = `${Date.now()}-${randomUUID()}.${extension}`;
  await mkdir(mediaDirectory(), { recursive: true });
  await writeFile(path.join(mediaDirectory(), filename), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: `/media/${filename}` });
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!cmsEditingEnabled()) {
    return NextResponse.json({ error: "Delete media locally, then deploy with Git." }, { status: 403 });
  }

  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { url?: string } | null;
  const filename = body?.url?.startsWith("/media/")
    ? path.basename(body.url)
    : "";
  if (!filename) {
    return NextResponse.json({ error: "Invalid media URL." }, { status: 400 });
  }

  await unlink(path.join(mediaDirectory(), filename)).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
  });
  return NextResponse.json({ ok: true });
}
