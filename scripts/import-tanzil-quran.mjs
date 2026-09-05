/**
 * Import verified Tanzil Uthmani Quran text.
 * Source: Al Quran Cloud edition `quran-uthmani` (Tanzil.net Uthmani script).
 * This script NEVER invents or edits Arabic text — it only stores the downloaded bytes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SOURCE_URL = "https://api.alquran.cloud/v1/quran/quran-uthmani";
const EXPECTED_AYAHS = 6236;
const EXPECTED_SURAHS = 114;
const EXPECTED_JUZ = 30;
const OUT_DIR = path.resolve(__dirname, "../src/features/holy-quran/data/paras");

async function main() {
  const res = await fetch(SOURCE_URL);
  if (!res.ok) {
    throw new Error(`Failed to download Tanzil Uthmani text: HTTP ${res.status}`);
  }
  const payload = await res.json();
  if (payload.code !== 200 || payload.status !== "OK") {
    throw new Error(`Unexpected API status: ${JSON.stringify(payload.status)}`);
  }

  const surahs = payload.data.surahs;
  if (!Array.isArray(surahs) || surahs.length !== EXPECTED_SURAHS) {
    throw new Error(`Expected ${EXPECTED_SURAHS} surahs, got ${surahs?.length}`);
  }

  const ayahs = [];
  for (const surah of surahs) {
    for (const ayah of surah.ayahs) {
      ayahs.push({
        surah: surah.number,
        ayah: ayah.numberInSurah,
        juz: ayah.juz,
        text: ayah.text,
        global: ayah.number,
      });
    }
  }

  if (ayahs.length !== EXPECTED_AYAHS) {
    throw new Error(`Expected ${EXPECTED_AYAHS} ayahs, got ${ayahs.length}`);
  }
  const juzSet = new Set(ayahs.map((a) => a.juz));
  if (juzSet.size !== EXPECTED_JUZ) {
    throw new Error(`Expected ${EXPECTED_JUZ} juz, got ${juzSet.size}`);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (let juz = 1; juz <= EXPECTED_JUZ; juz += 1) {
    const slice = ayahs.filter((a) => a.juz === juz);
    if (slice.length === 0) throw new Error(`Juz ${juz} has no ayahs`);
    const file = path.join(OUT_DIR, `para-${String(juz).padStart(2, "0")}.json`);
    fs.writeFileSync(file, `${JSON.stringify({ juz, ayahs: slice })}\n`);
    console.log(`wrote ${path.basename(file)} (${slice.length} ayahs)`);
  }

  const manifest = {
    source: "Tanzil.net Uthmani via Al Quran Cloud edition quran-uthmani",
    sourceUrl: SOURCE_URL,
    edition: payload.data.edition,
    importedAt: new Date().toISOString(),
    surahs: EXPECTED_SURAHS,
    ayahs: EXPECTED_AYAHS,
    paras: EXPECTED_JUZ,
    verification: {
      surahCount: surahs.length,
      ayahCount: ayahs.length,
      juzCount: juzSet.size,
    },
  };
  fs.writeFileSync(
    path.resolve(__dirname, "../src/features/holy-quran/data/dataset-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  console.log("Tanzil Uthmani import complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
