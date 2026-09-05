export interface ColorUnit {
  glyph: string;
  color: number | null;
}

const ARABIC_LETTER = /[\u0621-\u063A\u0641-\u064A\u066E-\u066F\u0671-\u06D3\u06D5\u06EE-\u06EF\u06FA-\u06FC\u06FF]/;
const COMBINING = /[\u0300-\u036F\u064B-\u065F\u0670\u06D6-\u06ED\u08D3-\u08FF\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]/u;

/** Same letter family always gets the same palette slot. Not Tajweed. */
const LETTER_SLOT: Record<string, number> = {
  ء: 4, آ: 0, أ: 0, ؤ: 2, إ: 0, ئ: 3, ا: 0, ٱ: 0,
  ب: 1, ة: 1, ت: 2, ث: 3,
  ج: 4, ح: 5, خ: 0,
  د: 1, ذ: 2, ر: 3, ز: 4,
  س: 5, ش: 0, ص: 1, ض: 2,
  ط: 3, ظ: 4, ع: 5, غ: 0,
  ف: 1, ق: 2, ك: 3, ل: 4, م: 5,
  ن: 0, ه: 1, و: 2, ى: 0, ي: 3,
};

function isCombiningCode(code: number): boolean {
  return COMBINING.test(String.fromCodePoint(code));
}

export function graphemeClusters(text: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("ar", { granularity: "grapheme" });
    return Array.from(segmenter.segment(text), (part) => part.segment);
  }

  const clusters: string[] = [];
  let current = "";
  for (const char of text) {
    const code = char.codePointAt(0) || 0;
    if (current && isCombiningCode(code)) {
      current += char;
      continue;
    }
    if (current) clusters.push(current);
    current = char;
  }
  if (current) clusters.push(current);
  return clusters;
}

function baseLetter(cluster: string): string | null {
  for (const char of cluster) {
    if (ARABIC_LETTER.test(char)) return char;
  }
  return null;
}

function colorForLetter(letter: string): number {
  if (letter in LETTER_SLOT) return LETTER_SLOT[letter];
  return (letter.codePointAt(0) || 0) % 6;
}

/** Presentation units only. Joined glyphs must equal the source ayah text. */
export function segmentColorUnits(text: string): ColorUnit[] {
  return graphemeClusters(text).map((glyph) => {
    const letter = baseLetter(glyph);
    if (!letter) return { glyph, color: null };
    return { glyph, color: colorForLetter(letter) };
  });
}

export function joinColorUnits(units: ColorUnit[]): string {
  return units.map((unit) => unit.glyph).join("");
}

export function isLetterGlyph(glyph: string): boolean {
  return baseLetter(glyph) !== null;
}

/** Wrap already-colored Tajweed HTML letters for hover. Text content stays identical. */
export function wrapTajweedGlyphs(html: string): string {
  return html.replace(/(<[^>]+>)|([^<]+)/g, (chunk, tag: string, text: string) => {
    if (tag) return chunk;
    return graphemeClusters(text).map((glyph) => {
      if (!isLetterGlyph(glyph)) return glyph;
      return `<span class="hq-glyph">${glyph.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>`;
    }).join("");
  });
}
