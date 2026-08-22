import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { defaultContent } from "./default-content";
import type { SiteContent } from "./types";

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
    return JSON.parse(raw) as SiteContent;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Unable to read CMS content", error);
    }

    return structuredClone(defaultContent);
  }
}

export async function saveSiteContent(content: SiteContent) {
  await ensureStorage();
  const target = contentFile();
  const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(content, null, 2)}\n`, "utf8");
  await rename(temporary, target);
}
