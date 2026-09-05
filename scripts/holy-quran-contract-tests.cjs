const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

function registerTypeScript(extension) {
  require.extensions[extension] = (module, filename) => {
    const source = fs.readFileSync(filename, "utf8");
    const output = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
        jsx: ts.JsxEmit.ReactJSX,
      },
      fileName: filename,
    }).outputText;
    module._compile(output, filename);
  };
}

registerTypeScript(".ts");
registerTypeScript(".tsx");

const ROOT = path.resolve(__dirname, "..");
const PARA_DIR = path.join(ROOT, "src/features/holy-quran/data/paras");
const FEATURE_DIR = path.join(ROOT, "src/features/holy-quran");

const paras = require(path.join(ROOT, "src/features/holy-quran/data/paras.ts"));
const progress = require(path.join(ROOT, "src/features/holy-quran/state/progress.ts"));
const loadPara = require(path.join(ROOT, "src/features/holy-quran/data/loadPara.ts"));
const search = require(path.join(ROOT, "src/features/holy-quran/data/search.ts"));
const surahs = require(path.join(ROOT, "src/data/surahs.ts"));
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "src/features/holy-quran/data/dataset-manifest.json"), "utf8"));

assert.equal(paras.PARAS.length, 30, "all 30 Paras must exist");
assert.equal(paras.TOTAL_PARAS, 30);
assert.equal(surahs.SURAHS.length, 114, "all 114 Surahs must be represented");
assert.equal(paras.TOTAL_SURAHS, 114);
assert.equal(manifest.ayahs, 6236);
assert.equal(manifest.edition.identifier, "quran-uthmani");

let totalAyahs = 0;
for (let juz = 1; juz <= 30; juz += 1) {
  const file = path.join(PARA_DIR, `para-${String(juz).padStart(2, "0")}.json`);
  assert.equal(fs.existsSync(file), true, `missing ${path.basename(file)}`);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  assert.equal(data.juz, juz);
  assert.equal(data.ayahs.length, paras.PARAS[juz - 1].ayahCount);
  totalAyahs += data.ayahs.length;
}

assert.equal(totalAyahs, 6236, "imported ayah count must be 6236");
assert.equal(paras.TOTAL_AYAHS, 6236);

const first = JSON.parse(fs.readFileSync(path.join(PARA_DIR, "para-01.json"), "utf8")).ayahs[0];
const last = JSON.parse(fs.readFileSync(path.join(PARA_DIR, "para-30.json"), "utf8")).ayahs.at(-1);
const firstText = loadPara.stripFileBom(first.text);
assert.equal(first.surah, 1);
assert.equal(first.ayah, 1);
assert.match(firstText, /^بِسْمِ/);
assert.doesNotMatch(firstText, /^\uFEFF/);
assert.equal(last.surah, 114);
assert.equal(last.ayah, 6);

assert.equal(progress.HQ_STORAGE_KEY, "noorpath-holy-quran-v1");
assert.notEqual(progress.HQ_STORAGE_KEY, "noorpath-qaida-v5");
assert.notEqual(progress.HQ_STORAGE_KEY, "noorpath-islamic-knowledge-v1");

const initial = progress.createInitialQuranProgress();
assert.deepEqual(initial.readingHistory, []);
const marked = progress.markAyahRead(initial, 1, 1);
assert.equal(marked.readAyahKeys.includes("1:1"), true);
assert.equal(marked.readAyahKeys.length, 1);
assert.equal(progress.progressPercent(progress.createInitialQuranProgress()), 0);
const remembered = progress.rememberReading(initial, { para: 23, surah: 36, ayah: 8 });
assert.equal(remembered.lastPosition?.surah, 36);
assert.equal(remembered.lastPosition?.ayah, 8);
assert.equal(remembered.readingHistory[0].surah, 36);
const moved = progress.rememberReading(remembered, { para: 23, surah: 36, ayah: 12 });
assert.equal(moved.readingHistory.length, 1);
assert.equal(moved.readingHistory[0].ayah, 12);

const prefs = require(path.join(ROOT, "src/features/holy-quran/state/prefs.ts"));
assert.equal(prefs.HQ_PREFS_KEY, "noorpath-holy-quran-prefs-v1");
assert.equal(prefs.bumpZoom(100, 1), 110);
assert.equal(prefs.bumpZoom(80, -1), 80);

const tajweed = require(path.join(ROOT, "src/features/holy-quran/data/tajweed.ts"));
assert.equal(tajweed.sanitizeTajweedHtml('<tajweed class="qalaqah">ق</tajweed><script>x</script>'), '<span class="qalaqah">ق</span>');
const fatiha = tajweed.parseTajweedMarkup("بِسْمِ [h:1[ٱ]للَّهِ [h:2[ٱ][l[ل]رَّحْمَ[n[ـٰ]نِ [h:3[ٱ][l[ل]رَّح[p[ِي]مِ");
assert.equal(fatiha.includes("["), false);
assert.equal(fatiha.includes("h:1"), false);
assert.match(fatiha, /hq-tw-wasl/);
assert.match(fatiha, /hq-tw-shamsi/);
assert.match(fatiha, /hq-tw-madd/);
assert.match(tajweed.parseTajweedMarkup("[q:19[بْ]]"), /hq-tw-qalqalah/);
assert.match(tajweed.parseTajweedMarkup("[f:17[نز]]"), /hq-tw-ikhafa/);

const colorfulLetters = require(path.join(ROOT, "src/features/holy-quran/data/colorfulLetters.ts"));
const sampleAyah = loadPara.stripFileBom(first.text);
const units = colorfulLetters.segmentColorUnits(sampleAyah);
assert.equal(colorfulLetters.joinColorUnits(units), sampleAyah);
assert.equal(units.some((unit) => unit.glyph.length > 1 && unit.color !== null), true);
const sameLam = colorfulLetters.segmentColorUnits("لَلِلُّ");
const lamColors = sameLam.filter((unit) => unit.color !== null).map((unit) => unit.color);
assert.equal(lamColors.every((slot) => slot === lamColors[0]), true);
const tajweedHover = colorfulLetters.wrapTajweedGlyphs('بِ<span class="hq-tw hq-tw-wasl">ٱ</span>للَّهِ');
assert.match(tajweedHover, /hq-glyph/);
assert.equal(tajweedHover.replace(/<[^>]+>/g, ""), "بِٱللَّهِ");

const yaseen = search.searchQuranIndex("yaseen");
assert.equal(yaseen.some((hit) => hit.kind === "surah" && hit.surah === 36), true);
const para30 = search.searchQuranIndex("para 30");
assert.equal(para30.some((hit) => hit.kind === "para" && hit.para === 30), true);
assert.equal(para30.some((hit) => hit.kind === "surah"), false);
const baqarah = search.searchQuranIndex("baqarah");
assert.equal(baqarah.some((hit) => hit.kind === "surah" && hit.surah === 2), true);
const ayatKursi = search.searchQuranIndex("2:255");
assert.equal(ayatKursi[0]?.kind, "ayah");
assert.equal(ayatKursi[0]?.surah, 2);
assert.equal(ayatKursi[0]?.ayah, 255);

const reciters = require(path.join(ROOT, "src/features/holy-quran/data/reciters.ts"));
assert.equal(reciters.RECITERS.find((item) => item.id === "alafasy").verifiedCompleteQuran, true);
assert.equal(reciters.RECITERS.find((item) => item.id === "qariah").enabled, false);
assert.match(reciters.recitationUrlFor("alafasy", 1), /ar\.alafasy\/1\.mp3/);
assert.match(reciters.recitationUrlFor("qariah", 1), /ar\.alafasy\/1\.mp3/);
assert.equal(loadPara.recitationUrl(1), "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3");

const facts = require(path.join(ROOT, "src/features/holy-quran/data/quranFacts.ts"));
assert.equal(facts.QURAN_FACTS.surahs, 114);
assert.equal(facts.QURAN_FACTS.paras, 30);
assert.equal(facts.QURAN_FACTS.ayahs, 6236);
assert.equal(facts.QURAN_FACTS.makki, 86);
assert.equal(facts.QURAN_FACTS.madani, 28);

const knowledge = require(path.join(ROOT, "src/features/holy-quran/data/quranKnowledge.ts"));
assert.equal(knowledge.QURAN_KNOWLEDGE.length >= 20, true);
const guide = require(path.join(ROOT, "src/features/holy-quran/data/readingGuide.ts"));
assert.equal(guide.READING_GUIDE.length, 10);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const readerSource = fs.readFileSync(path.join(FEATURE_DIR, "screens/QuranReader.tsx"), "utf8");
assert.match(readerSource, /Line by line/);
assert.match(readerSource, /Full page/);
assert.match(readerSource, /hq-mushaf/);
assert.match(readerSource, /Colorful Letters/);
assert.match(readerSource, /Tajweed/);
assert.match(readerSource, /Zoom in/);
assert.match(readerSource, /Mute recitation/);
assert.match(readerSource, /Practice/);
assert.match(readerSource, /Coming soon/);

const shellSource = fs.readFileSync(path.join(FEATURE_DIR, "layout/HolyQuranShell.tsx"), "utf8");
assert.match(shellSource, /searchQuranIndex/);
assert.match(shellSource, /Reading history/);
assert.match(shellSource, /Knowledge \/ Q&A/);
assert.match(shellSource, /How to Read/);

for (const file of walk(FEATURE_DIR).filter((name) => /\.(ts|tsx|css)$/.test(name))) {
  const source = fs.readFileSync(file, "utf8");
  assert.equal(source.includes("noorani-qaida"), false, `${file} must not depend on Noorani Qaida`);
}

assert.equal(fs.existsSync(path.join(ROOT, "src/features/noorani-qaida/layout/QaidaShell.tsx")), true);

console.log("Holy Quran contract tests passed.");
