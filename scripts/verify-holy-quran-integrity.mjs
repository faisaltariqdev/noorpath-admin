/**
 * Re-download Tanzil Uthmani text and compare every stored ayah.
 * Fails if any Arabic character, order, surah, ayah, or juz differs.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PARA_DIR = path.join(ROOT, "src/features/holy-quran/data/paras");
const SOURCE_URL = "https://api.alquran.cloud/v1/quran/quran-uthmani";
const EXPECTED_AYAHS = 6236;
const EXPECTED_SURAHS = 114;
const CANONICAL_SURAH_AYAHS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
  112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85,
  54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
  14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42,
  29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11,
  11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
];

function stripBom(text) {
  return text.replace(/^\uFEFF/, "");
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const report = {
  sourceMatches: false,
  ayahsCompared: 0,
  mismatches: [],
  bomOnlyOnFirstAyah: false,
  codeMutations: [],
  knownVerses: {},
};

const featureFiles = walk(path.join(ROOT, "src/features/holy-quran"))
  .filter((file) => /\.(ts|tsx)$/.test(file));
for (const file of featureFiles) {
  const source = fs.readFileSync(file, "utf8");
  const forbidden = [
    ".normalize(",
    "normalize(\"NFC\")",
    "normalize('NFC')",
  ];
  for (const token of forbidden) {
    if (source.includes(token)) {
      report.codeMutations.push(`${path.relative(ROOT, file)} contains ${token}`);
    }
  }
  if (file.endsWith("loadPara.ts") && source.includes(".replace(") && !source.includes("replace(/^\\uFEFF/, \"\")")) {
    report.codeMutations.push("loadPara.ts replace is not BOM-only");
  }
  if (file.endsWith("QuranReader.tsx") && !source.includes("{ayah.text}")) {
    report.codeMutations.push("QuranReader does not render ayah.text verbatim");
  }
}

const stored = [];
for (let juz = 1; juz <= 30; juz += 1) {
  const file = JSON.parse(fs.readFileSync(path.join(PARA_DIR, `para-${String(juz).padStart(2, "0")}.json`), "utf8"));
  if (file.juz !== juz) report.mismatches.push(`para file ${juz} has juz=${file.juz}`);
  for (const ayah of file.ayahs) {
    if (ayah.juz !== juz) report.mismatches.push(`ayah ${ayah.surah}:${ayah.ayah} stored under juz ${juz} but marked ${ayah.juz}`);
    stored.push(ayah);
  }
}

if (stored.length !== EXPECTED_AYAHS) {
  report.mismatches.push(`stored ayah count ${stored.length} !== ${EXPECTED_AYAHS}`);
}

const firstStored = stored[0]?.text || "";
report.bomOnlyOnFirstAyah = firstStored.startsWith("\uFEFF") && stored.slice(1).every((ayah) => !ayah.text.startsWith("\uFEFF"));

const res = await fetch(SOURCE_URL);
if (!res.ok) throw new Error(`Live source download failed: HTTP ${res.status}`);
const payload = await res.json();
if (payload.code !== 200 || payload.data?.edition?.identifier !== "quran-uthmani") {
  throw new Error("Live source is not quran-uthmani");
}

const live = [];
for (const surah of payload.data.surahs) {
  for (const ayah of surah.ayahs) {
    live.push({
      surah: surah.number,
      ayah: ayah.numberInSurah,
      juz: ayah.juz,
      text: ayah.text,
      global: ayah.number,
    });
  }
}

if (live.length !== EXPECTED_AYAHS) {
  report.mismatches.push(`live ayah count ${live.length} !== ${EXPECTED_AYAHS}`);
}
if (payload.data.surahs.length !== EXPECTED_SURAHS) {
  report.mismatches.push(`live surah count ${payload.data.surahs.length} !== ${EXPECTED_SURAHS}`);
}

for (let i = 0; i < Math.max(stored.length, live.length); i += 1) {
  const a = stored[i];
  const b = live[i];
  if (!a || !b) {
    report.mismatches.push(`length mismatch at index ${i}`);
    break;
  }
  const storedText = stripBom(a.text);
  const liveText = stripBom(b.text);
  if (
    a.surah !== b.surah
    || a.ayah !== b.ayah
    || a.juz !== b.juz
    || a.global !== b.global
    || storedText !== liveText
  ) {
    report.mismatches.push({
      index: i,
      stored: { surah: a.surah, ayah: a.ayah, juz: a.juz, global: a.global, text: storedText },
      live: { surah: b.surah, ayah: b.ayah, juz: b.juz, global: b.global, text: liveText },
    });
    if (report.mismatches.length > 12) break;
  }
}

const bySurah = new Map();
for (const ayah of stored) {
  bySurah.set(ayah.surah, (bySurah.get(ayah.surah) || 0) + 1);
}
for (let s = 1; s <= 114; s += 1) {
  if (bySurah.get(s) !== CANONICAL_SURAH_AYAHS[s - 1]) {
    report.mismatches.push(`surah ${s} ayah count ${bySurah.get(s)} !== canonical ${CANONICAL_SURAH_AYAHS[s - 1]}`);
  }
}

for (let i = 0; i < stored.length; i += 1) {
  if (stored[i].global !== i + 1) {
    report.mismatches.push(`global numbering gap at ${i + 1}, got ${stored[i].global}`);
    break;
  }
}

const find = (surah, ayah) => stripBom(stored.find((row) => row.surah === surah && row.ayah === ayah)?.text || "");
report.knownVerses = {
  fatiha1StartsWithBismillah: /^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ$/.test(find(1, 1)),
  fatiha2: find(1, 2) === stripBom(live.find((row) => row.surah === 1 && row.ayah === 2).text),
  ikhlas1: find(112, 1).includes("قُلْ هُوَ ٱللَّهُ أَحَدٌ"),
  nasLast: find(114, 6).includes("ٱلنَّاسِ"),
  tawbahHasNoOpeningOnly: find(9, 1).startsWith("بَرَآءَةٌ"),
};

const PARA_RANGES = [
  [1, 1, 2, 141, 148], [2, 142, 2, 252, 111], [2, 253, 3, 92, 126], [3, 93, 4, 23, 131],
  [4, 24, 4, 147, 124], [4, 148, 5, 81, 110], [5, 82, 6, 110, 149], [6, 111, 7, 87, 142],
  [7, 88, 8, 40, 159], [8, 41, 9, 92, 127], [9, 93, 11, 5, 151], [11, 6, 12, 52, 170],
  [12, 53, 14, 52, 154], [15, 1, 16, 128, 227], [17, 1, 18, 74, 185], [18, 75, 20, 135, 269],
  [21, 1, 22, 78, 190], [23, 1, 25, 20, 202], [25, 21, 27, 55, 339], [27, 56, 29, 45, 171],
  [29, 46, 33, 30, 178], [33, 31, 36, 27, 169], [36, 28, 39, 31, 357], [39, 32, 41, 46, 175],
  [41, 47, 45, 37, 246], [46, 1, 51, 30, 195], [51, 31, 57, 29, 399], [58, 1, 66, 12, 137],
  [67, 1, 77, 50, 431], [78, 1, 114, 6, 564],
];
for (let juz = 1; juz <= 30; juz += 1) {
  const file = JSON.parse(fs.readFileSync(path.join(PARA_DIR, `para-${String(juz).padStart(2, "0")}.json`), "utf8"));
  const first = file.ayahs[0];
  const last = file.ayahs[file.ayahs.length - 1];
  const expected = PARA_RANGES[juz - 1];
  if (
    first.surah !== expected[0] || first.ayah !== expected[1]
    || last.surah !== expected[2] || last.ayah !== expected[3]
    || file.ayahs.length !== expected[4]
  ) {
    report.mismatches.push(`para ${juz} range mismatch`);
  }
}

report.ayahsCompared = Math.min(stored.length, live.length);
report.sourceMatches = report.mismatches.length === 0
  && report.codeMutations.length === 0
  && Object.values(report.knownVerses).every(Boolean);

console.log(JSON.stringify({
  source: SOURCE_URL,
  edition: payload.data.edition.identifier,
  storedAyahs: stored.length,
  liveAyahs: live.length,
  mismatches: report.mismatches.length,
  codeMutations: report.codeMutations,
  bomOnlyOnFirstAyah: report.bomOnlyOnFirstAyah,
  knownVerses: report.knownVerses,
  firstMismatch: report.mismatches[0] || null,
  sourceMatches: report.sourceMatches,
}, null, 2));

if (!report.sourceMatches) process.exit(1);
