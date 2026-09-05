const cache = new Map<number, Map<string, string>>();

const RULES: Record<string, { cls: string; label: string }> = {
  h: { cls: "wasl", label: "Hamzat al-Wasl" },
  s: { cls: "silent", label: "Silent" },
  l: { cls: "shamsi", label: "Lam Shamsiyyah" },
  n: { cls: "madd", label: "Madd" },
  p: { cls: "madd-ok", label: "Madd jaa'iz" },
  m: { cls: "madd-must", label: "Madd lazim" },
  o: { cls: "madd-wajib", label: "Madd wajib" },
  q: { cls: "qalqalah", label: "Qalqalah" },
  c: { cls: "ikhafa-meem", label: "Ikhfa shafawi" },
  f: { cls: "ikhafa", label: "Ikhfa" },
  w: { cls: "idgham-meem", label: "Idgham shafawi" },
  i: { cls: "iqlab", label: "Iqlab" },
  a: { cls: "idgham", label: "Idgham with ghunnah" },
  u: { cls: "idgham-plain", label: "Idgham without ghunnah" },
  d: { cls: "idgham-same", label: "Idgham mutajanisayn" },
  b: { cls: "idgham-near", label: "Idgham mutaqaribayn" },
  g: { cls: "ghunnah", label: "Ghunnah" },
};

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Keep only safe markup. Never rewrite Arabic letters. */
export function sanitizeTajweedHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<\/?tajweed\b/gi, (tag) => (tag.startsWith("</") ? "</span" : "<span"))
    .replace(/<\/?(?:iframe|object|embed|link|meta|style|img|svg)\b[^>]*>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}

/** Turn Al Quran Cloud markers like [h:1[ٱ] into colored letters. Codes are never shown. */
export function parseTajweedMarkup(raw: string): string {
  const html = sanitizeTajweedHtml(raw).replace(
    /\[([a-z])(?::\d+)?\[([^\]]*)\]/gi,
    (_, code: string, letter: string) => {
      const rule = RULES[code.toLowerCase()] || { cls: "mark", label: "Tajweed" };
      return `<span class="hq-tw hq-tw-${rule.cls}" title="${rule.label}">${escapeHtml(letter)}</span>`;
    },
  );
  return html.replace(/\[[^\]]*\]/g, "").replace(/[\[\]]/g, "");
}

export async function loadTajweedMap(juz: number): Promise<Map<string, string>> {
  const cached = cache.get(juz);
  if (cached) return cached;

  const response = await fetch(`https://api.alquran.cloud/v1/juz/${juz}/quran-tajweed`);
  if (!response.ok) throw new Error("Tajweed edition unavailable");
  const body = await response.json() as {
    data?: { ayahs?: Array<{ text?: string; numberInSurah?: number; surah?: { number?: number } }> };
  };
  const ayahs = body.data?.ayahs || [];
  const map = new Map<string, string>();
  ayahs.forEach((row) => {
    const surah = row.surah?.number;
    const ayah = row.numberInSurah;
    if (!surah || !ayah || !row.text) return;
    map.set(`${surah}:${ayah}`, parseTajweedMarkup(row.text));
  });
  cache.set(juz, map);
  return map;
}
