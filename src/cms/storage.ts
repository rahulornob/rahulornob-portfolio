import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { defaultContent } from "./default-content";
import type { SiteContent } from "./types";

function isSanityImage(url?: string) {
  if (!url) return false;
  try {
    return new URL(url).hostname === "cdn.sanity.io";
  } catch {
    return false;
  }
}

function withoutSanityMedia(content: SiteContent): SiteContent {
  const clean = structuredClone(content);

  if (isSanityImage(clean.hero?.backgroundImage?.url)) {
    if (clean.hero) delete clean.hero.backgroundImage;
  }
  if (clean.about?.logos) {
    clean.about.logos = clean.about.logos.filter((image) => !isSanityImage(image.url));
  }
  clean.projects?.forEach((project) => {
    project.images = project.images?.filter((image) => !isSanityImage(image.url));
  });
  clean.servicesSection?.items?.forEach((service) => {
    service.images = service.images?.filter((image) => !isSanityImage(image.url));
  });
  clean.testimonialsSection?.items?.forEach((testimonial) => {
    if (isSanityImage(testimonial.portrait?.url)) delete testimonial.portrait;
    if (isSanityImage(testimonial.companyLogo?.url)) delete testimonial.companyLogo;
  });

  return clean;
}

function dataDirectory() {
  return process.env.CMS_DATA_DIR || path.join(process.cwd(), ".cms-data");
}

export function mediaDirectory() {
  return path.join(dataDirectory(), "media");
}

function contentFile() {
  return path.join(dataDirectory(), "content.json");
}

async function ensureStorage() {
  await mkdir(mediaDirectory(), { recursive: true });
}

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const raw = await readFile(contentFile(), "utf8");
    return withoutSanityMedia(JSON.parse(raw) as SiteContent);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Unable to read CMS content", error);
    }

    return withoutSanityMedia(defaultContent);
  }
}

export async function saveSiteContent(content: SiteContent) {
  await ensureStorage();
  const target = contentFile();
  const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
  const cleanContent = withoutSanityMedia(content);
  await writeFile(temporary, `${JSON.stringify(cleanContent, null, 2)}\n`, "utf8");
  await rename(temporary, target);
}
