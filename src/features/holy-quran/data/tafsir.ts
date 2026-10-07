/**
 * Sunni-whitelist tafsir editions via spa5k/tafsir_api (static JSON CDN).
 * Educational reference only — not a fatwa service.
 */

import type { TafsirLang } from "../types";

export type { TafsirLang };

export interface TafsirEdition {
  lang: TafsirLang;
  slug: string;
  name: string;
  author: string;
}

/** Curated Sunni editions only (Urdu + English). */
export const TAFSIR_EDITIONS: Record<TafsirLang, TafsirEdition> = {
  ur: {
    lang: "ur",
    slug: "ur-tafsir-as-saadi-urdu",
    name: "Tafsir As-Saadi",
    author: "Abd al-Rahman al-Sa'di",
  },
  en: {
    lang: "en",
    slug: "en-tafisr-ibn-kathir",
    name: "Tafsir Ibn Kathir",
    author: "Hafiz Ibn Kathir",
  },
};

const TAFSIR_BASE = "https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir";
const cache = new Map<string, string>();

function ayahKey(slug: string, surah: number, ayah: number): string {
  return `${slug}:${surah}:${ayah}`;
}

function stripHtml(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function fetchTafsirAyah(
  lang: TafsirLang,
  surah: number,
  ayah: number,
): Promise<string> {
  const edition = TAFSIR_EDITIONS[lang];
  const key = ayahKey(edition.slug, surah, ayah);
  const hit = cache.get(key);
  if (hit !== undefined) return hit;

  const url = `${TAFSIR_BASE}/${edition.slug}/${surah}/${ayah}.json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Tafsir unavailable (${response.status})`);
  }
  const data = (await response.json()) as { text?: string };
  const text = typeof data.text === "string" ? stripHtml(data.text) : "";
  if (!text) throw new Error("Tafsir text missing for this ayah");
  cache.set(key, text);
  return text;
}
