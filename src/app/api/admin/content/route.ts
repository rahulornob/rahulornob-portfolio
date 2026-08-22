import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cmsEditingEnabled, isAuthenticated } from "@/cms/auth";
import { isSameOrigin } from "@/cms/security";
import { getSiteContent, saveSiteContent } from "@/cms/storage";
import type { SiteContent } from "@/cms/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.json({ content: await getSiteContent() });
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!cmsEditingEnabled()) {
    return NextResponse.json(
      { error: "Production editing is disabled. Make changes locally and deploy with Git." },
      { status: 403 },
    );
  }

  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const raw = await request.text();
  if (raw.length > 2_000_000) {
    return NextResponse.json({ error: "Content is too large." }, { status: 413 });
  }

  let content: SiteContent;
  try {
    content = JSON.parse(raw) as SiteContent;
  } catch {
    return NextResponse.json({ error: "Invalid content." }, { status: 400 });
  }

  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return NextResponse.json({ error: "Invalid content." }, { status: 400 });
  }

  await saveSiteContent(content);
  revalidatePath("/");
  return NextResponse.json({ ok: true, publishedAt: new Date().toISOString() });
}
