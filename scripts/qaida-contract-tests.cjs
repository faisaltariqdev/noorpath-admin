const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const ROOT = path.resolve(__dirname, "..");

function loadTypeScriptModule(relativePath) {
  const filename = path.join(ROOT, relativePath);
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
  vm.runInNewContext(output, {
    module: compiledModule,
    exports: compiledModule.exports,
    require,
    console,
    Date,
    Math,
    Set,
    Object,
    Array,
  }, { filename });
  return compiledModule.exports;
}

const progress = loadTypeScriptModule("src/features/noorani-qaida/state/progress.ts");
const lesson = loadTypeScriptModule("src/features/noorani-qaida/lesson/flow.ts");
const rewards = loadTypeScriptModule("src/features/noorani-qaida/rewards/rewardEngine.ts");
const tracing = loadTypeScriptModule("src/features/noorani-qaida/ui/tracingValidation.ts");
const motion = loadTypeScriptModule("src/features/noorani-qaida/motion/config.ts");

assert.equal(progress.PROGRESS_STORAGE_KEY, "noorpath-qaida-v4", "storage contract must remain stable");

const migrated = progress.progressReducer(progress.DEFAULT_PROGRESS, {
  type: "hydrate",
  value: { xp: 50, settings: { audioEnabled: false } },
});
assert.equal(migrated.xp, 50);
assert.equal(migrated.settings.audioEnabled, false);
assert.equal(migrated.settings.theme, "light", "partial settings migration must retain defaults");

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

console.log("Qaida contract tests passed.");
