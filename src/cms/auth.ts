import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const sessionCookieName = "portfolio_cms_session";
const sessionLifetime = 60 * 60 * 24 * 7;

function secret() {
  const value = process.env.CMS_SESSION_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV !== "production") return "local-cms-development-secret";
  return "";
}

function signature(expires: string) {
  return createHmac("sha256", secret()).update(expires).digest("hex");
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function cmsConfigured() {
  return Boolean(
    process.env.CMS_ADMIN_EMAIL &&
      process.env.CMS_ADMIN_PASSWORD &&
      secret(),
  );
}

export function cmsEditingEnabled() {
  return process.env.NODE_ENV !== "production" ||
    process.env.CMS_ALLOW_PRODUCTION_EDITS === "true";
}

export function validCredentials(email: string, password: string) {
  const expectedEmail = process.env.CMS_ADMIN_EMAIL ||
    (process.env.NODE_ENV !== "production" ? "admin@local.test" : "");
  const expectedPassword = process.env.CMS_ADMIN_PASSWORD ||
    (process.env.NODE_ENV !== "production" ? "portfolio" : "");
  return safeEqual(email.trim().toLowerCase(), expectedEmail.toLowerCase()) &&
    safeEqual(password, expectedPassword);
}

export function createSessionValue() {
  const expires = String(Math.floor(Date.now() / 1000) + sessionLifetime);
  return `${expires}.${signature(expires)}`;
}

export function verifySessionValue(value?: string) {
  if (!value || !secret()) return false;
  const [expires, receivedSignature, extra] = value.split(".");
  if (!expires || !receivedSignature || extra) return false;
  if (Number(expires) <= Math.floor(Date.now() / 1000)) return false;
  return safeEqual(receivedSignature, signature(expires));
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return verifySessionValue(cookieStore.get(sessionCookieName)?.value);
}

export const sessionCookieOptions = {
  httpOnly: true,
  maxAge: sessionLifetime,
  path: "/",
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
};
