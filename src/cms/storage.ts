import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { defaultContent } from "./default-content";
import type { SiteContent } from "./types";

export function mediaDirectory() {
  return path.join(process.cwd(), "public", "media");
}

function contentFile() {
  return path.join(process.cwd(), "content", "site-content.json");
}

async function ensureStorage() {
  await mkdir(path.dirname(contentFile()), { recursive: true });
  await mkdir(mediaDirectory(), { recursive: true });
}

function withDefaults(content: SiteContent): SiteContent {
  return {
    ...structuredClone(defaultContent),
    ...content,
    hero: { ...defaultContent.hero, ...content.hero },
    about: { ...defaultContent.about, ...content.about },
    projects: content.projects ?? structuredClone(defaultContent.projects),
    servicesSection: {
      ...defaultContent.servicesSection,
      ...content.servicesSection,
      items: content.servicesSection?.items ??
        structuredClone(defaultContent.servicesSection?.items),
    },
    testimonialsSection: {
      ...defaultContent.testimonialsSection,
      ...content.testimonialsSection,
      items: content.testimonialsSection?.items ??
        structuredClone(defaultContent.testimonialsSection?.items),
    },
    faqSection: {
      ...defaultContent.faqSection,
      ...content.faqSection,
      items: content.faqSection?.items ?? structuredClone(defaultContent.faqSection?.items),
    },
    footer: { ...defaultContent.footer, ...content.footer },
  };
}

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const raw = await readFile(contentFile(), "utf8");
    return withDefaults(JSON.parse(raw) as SiteContent);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Unable to read CMS content", error);
    }

    return withDefaults({});
  }
}

export async function saveSiteContent(content: SiteContent) {
  await ensureStorage();
  const target = contentFile();
  const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(content, null, 2)}\n`, "utf8");
  await rename(temporary, target);
}
