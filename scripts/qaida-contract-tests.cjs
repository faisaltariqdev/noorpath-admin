const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const ROOT = path.resolve(__dirname, "..");
const moduleCache = new Map();

function loadTypeScriptModule(relativePath) {
  return loadTypeScriptFile(path.join(ROOT, relativePath));
}

function loadTypeScriptFile(filename) {
  const normalized = path.normalize(filename);
  if (moduleCache.has(normalized)) return moduleCache.get(normalized);
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: filename,
  }).outputText;
  const compiledModule = { exports: {} };
  moduleCache.set(normalized, compiledModule.exports);
  const localRequire = (request) => {
    if (!request.startsWith(".")) return require(request);
    const resolved = path.resolve(path.dirname(filename), request);
    const candidates = [resolved, `${resolved}.ts`, path.join(resolved, "index.ts")];
    const match = candidates.find((candidate) => fs.existsSync(candidate));
    if (!match) return require(request);
    return loadTypeScriptFile(match);
  };
  vm.runInNewContext(output, {
    module: compiledModule,
    exports: compiledModule.exports,
    require: localRequire,
    console,
    Date,
    Math,
    Set,
    Object,
    Array,
  }, { filename });
  moduleCache.set(normalized, compiledModule.exports);
  return compiledModule.exports;
}

const progress = loadTypeScriptModule("src/features/noorani-qaida/state/progress.ts");
const lesson = loadTypeScriptModule("src/features/noorani-qaida/lesson/flow.ts");
const rewards = loadTypeScriptModule("src/features/noorani-qaida/rewards/rewardEngine.ts");
const tracing = loadTypeScriptModule("src/features/noorani-qaida/ui/tracingValidation.ts");
const motion = loadTypeScriptModule("src/features/noorani-qaida/motion/config.ts");
const curriculum = loadTypeScriptModule("src/features/noorani-qaida/data/modules.ts");
const curriculumProgress = loadTypeScriptModule("src/features/noorani-qaida/state/curriculumProgress.ts");
const audioManifest = loadTypeScriptModule("src/features/noorani-qaida/audio/manifest.ts");

assert.equal(progress.PROGRESS_STORAGE_KEY, "noorpath-qaida-v5", "storage contract must use the v5 curriculum schema");
assert.equal(progress.LEGACY_PROGRESS_KEYS.includes("noorpath-qaida-v4"), true, "v4 learners must migrate");

const migrated = progress.progressReducer(progress.DEFAULT_PROGRESS, {
  type: "hydrate",
  value: { xp: 50, settings: { audioEnabled: false } },
});
assert.equal(migrated.xp, 50);
assert.equal(migrated.settings.audioEnabled, false);
assert.equal(migrated.settings.theme, "light", "partial settings migration must retain defaults");
assert.equal(migrated.currentScreenId, "letter-1");
assert.deepEqual(Array.from(migrated.assessmentAttempts), []);

const completedOnce = progress.progressReducer(migrated, { type: "complete_screen", id: "letter-1" });
const completedTwice = progress.progressReducer(completedOnce, { type: "complete_screen", id: "letter-1" });
assert.equal(completedTwice.xp, completedOnce.xp, "lesson rewards must be idempotent");
assert.equal(progress.isScreenUnlocked(completedOnce, "letter-2"), true);

let flow = lesson.INITIAL_LESSON_FLOW;
flow = lesson.lessonFlowReducer(flow, { type: "complete", step: "welcome" });
flow = lesson.lessonFlowReducer(flow, { type: "complete", step: "introduce" });
assert.equal(flow.step, "listen");
assert.equal(lesson.lessonStepProgress(flow), 17);

const perfectGame = rewards.calculateGameReward("sound-match", 5, 5, 42);
assert.equal(perfectGame.stars, 3);
assert.equal(perfectGame.xpEarned, 45);

const validTrace = tracing.validateTrace({
  matchingPoints: 90,
  totalPoints: 100,
  distance: 280,
  targetDistance: 240,
  strokeCount: 2,
});
assert.equal(validTrace.complete, true);
assert.equal(tracing.validateTrace({ matchingPoints: 0, totalPoints: 0, distance: 0, targetDistance: 1, strokeCount: 0 }).complete, false);

assert.equal(motion.createMotionBudget(true, 1440).ambientParticles, 0);
assert.equal(motion.createMotionBudget(false, 375).allowParallax, false);
assert.equal(motion.createMotionBudget(false, 1440).ambientParticles <= 12, true);

assert.equal(curriculum.CURRICULUM_MODULES.length, 11, "the complete curriculum must expose 11 modules");
assert.equal(new Set(Array.from(curriculum.ALL_CURRICULUM_SCREEN_IDS)).size, curriculum.ALL_CURRICULUM_SCREEN_IDS.length, "screen ids must be unique");
assert.equal(curriculumProgress.isModuleUnlocked(completedOnce, "harakaat"), false, "Harakaat stays locked until the alphabet is complete");
const allLetters = Array.from({ length: 28 }, (_, index) => `letter-${index + 1}`);
const alphabetComplete = progress.progressReducer(progress.DEFAULT_PROGRESS, {
  type: "hydrate",
  value: { completed: allLetters },
});
assert.equal(curriculumProgress.isModuleUnlocked(alphabetComplete, "harakaat"), true);
assert.equal(curriculumProgress.getCurrentCurriculumScreen(alphabetComplete), "fatha");
assert.equal(audioManifest.QAIDA_AUDIO_MANIFEST.version, 1);
assert.equal(audioManifest.QAIDA_AUDIO_MANIFEST.entries.length > 28, true, "audio manifest must include topic examples");

const assessed = progress.progressReducer(alphabetComplete, {
  type: "record_assessment",
  attempt: { screenId: "final-assessment", score: 10, total: 12, passed: true, completedAt: "2026-01-01T00:00:00.000Z" },
});
assert.equal(assessed.assessmentAttempts.length, 1);

console.log("Qaida contract tests passed.");
