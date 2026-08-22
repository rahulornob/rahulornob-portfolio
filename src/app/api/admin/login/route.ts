import { NextResponse } from "next/server";
import {
  cmsConfigured,
  createSessionValue,
  sessionCookieName,
  sessionCookieOptions,
  validCredentials,
} from "@/cms/auth";
import { isSameOrigin } from "@/cms/security";

export const runtime = "nodejs";

const attempts = new Map<string, { count: number; resetAt: number }>();
const windowMs = 15 * 60 * 1000;
const maxAttempts = 8;

function clientKey(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  if (process.env.NODE_ENV === "production" && !cmsConfigured()) {
    return NextResponse.json(
      { error: "CMS login has not been configured on the server." },
      { status: 503 },
    );
  }

  const key = clientKey(request);
  const now = Date.now();
  const existing = attempts.get(key);
  const record = !existing || existing.resetAt <= now
    ? { count: 0, resetAt: now + windowMs }
    : existing;

  if (record.count >= maxAttempts) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in 15 minutes." },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { email?: string; password?: string }
    | null;

  if (!body || !validCredentials(body.email || "", body.password || "")) {
    record.count += 1;
    attempts.set(key, record);
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  attempts.delete(key);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    sessionCookieName,
    createSessionValue(),
    sessionCookieOptions,
  );
  return response;
}
