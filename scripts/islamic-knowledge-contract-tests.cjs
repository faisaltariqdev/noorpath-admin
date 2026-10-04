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
const curriculum = require(path.join(ROOT, "src/features/islamic-knowledge/data/curriculum.ts"));
const visuals = require(path.join(ROOT, "src/features/islamic-knowledge/components/StepVisual.tsx"));
const quiz = require(path.join(ROOT, "src/features/islamic-knowledge/lib/quiz.ts"));
const progress = require(path.join(ROOT, "src/features/islamic-knowledge/state/progress.ts"));

assert.equal(curriculum.ALL_TOPICS.length, 30, "all 30 Islamic Knowledge topics must remain available");
assert.equal(curriculum.LESSONS.length, 30, "every topic must have one lesson");
assert.equal(new Set(curriculum.LESSONS.map((lesson) => lesson.id)).size, 30, "lesson ids must be unique");

const prompts = curriculum.LESSONS.flatMap((lesson) => lesson.questions.map((question) => question.prompt.trim().toLowerCase()));
assert.equal(new Set(prompts).size, prompts.length, "question prompts must not be repeated");

assert.equal(curriculum.LESSONS.every((lesson) => lesson.questions.length >= 7), true, "every lesson needs at least seven questions so replays feel fresh");
assert.equal(
  curriculum.LESSONS.every((lesson) => lesson.questions.every((question) => question.concept)),
  true,
  "every question must carry a concept tag for de-duplication",
);
assert.equal(
  curriculum.LESSONS.every((lesson) => lesson.questions.every((question) => !question.explanation || question.explanation !== question.hint)),
  true,
  "explanation must never be a copy of the hint",
);
assert.equal(
  curriculum.LESSONS.every((lesson) => new Set(lesson.questions.map((q) => q.concept)).size >= 5),
  true,
  "each lesson needs at least five distinct concepts so a full session never repeats a fact",
);
const questionIds = curriculum.LESSONS.flatMap((lesson) => lesson.questions.map((question) => question.id));
assert.equal(new Set(questionIds).size, questionIds.length, "question ids must be unique across the bank");

const kinds = new Set(curriculum.LESSONS.flatMap((lesson) => lesson.questions.map((question) => question.kind)));
for (const kind of ["mcq", "true_false", "fill_blank", "matching", "sorting", "tap_select"]) {
  assert.equal(kinds.has(kind), true, `${kind} must be represented in the curriculum`);
}

const multipleChoice = curriculum.LESSONS.flatMap((lesson) => lesson.questions).filter((question) => question.kind === "mcq");
const correctPositions = new Set(multipleChoice.map((question) => question.options.findIndex((option) => option.id === question.answer)));
assert.equal(correctPositions.size >= 3, true, "MCQ correct answers must be distributed across option positions");

const trueFalse = curriculum.LESSONS.flatMap((lesson) => lesson.questions).filter((question) => question.kind === "true_false");
const falseCount = trueFalse.filter((question) => String(question.answer).endsWith("-f")).length;
assert.equal(falseCount >= Math.floor(trueFalse.length * 0.35), true, "true/false questions must include a meaningful false-answer mix");

for (const topic of curriculum.ALL_TOPICS) {
  assert.ok(visuals.TOPIC_VISUALS[topic.id], `missing SVG visual mapping for ${topic.id}`);
}

// ---- quiz engine ----
const sample = curriculum.LESSON_BY_ID["who-is-allah-1"];
const young = quiz.buildQuizSession(sample.questions, { ageBand: "young", seed: 7 });
const mid = quiz.buildQuizSession(sample.questions, { ageBand: "mid", seed: 7 });
const older = quiz.buildQuizSession(sample.questions, { ageBand: "older", seed: 7 });
assert.equal(young.length, quiz.QUESTIONS_PER_SESSION.young);
assert.equal(mid.length, quiz.QUESTIONS_PER_SESSION.mid);
assert.equal(older.length, quiz.QUESTIONS_PER_SESSION.older);
assert.equal(young.every((q) => q.difficulty !== "hard"), true, "3–6 year olds never get hard questions on a first attempt");

for (const lesson of curriculum.LESSONS) {
  for (const band of ["young", "mid", "older"]) {
    for (const seed of [1, 2, 3, 4, 5]) {
      const session = quiz.buildQuizSession(lesson.questions, { ageBand: band, seed });
      const concepts = session.map((q) => q.concept);
      assert.equal(new Set(concepts).size, concepts.length, `session for ${lesson.id}/${band}/${seed} repeats a concept: ${concepts.join(",")}`);
      assert.equal(new Set(session.map((q) => q.id)).size, session.length, `session for ${lesson.id} repeats a question id`);
    }
  }
}

// Replay avoids the questions asked last time when the bank allows it.
const first = quiz.buildQuizSession(sample.questions, { ageBand: "mid", seed: 11 });
const second = quiz.buildQuizSession(sample.questions, { ageBand: "mid", seed: 12, recentIds: first.map((q) => q.id), attempt: 1 });
const overlap = second.filter((q) => first.some((f) => f.id === q.id)).length;
assert.equal(overlap <= 2, true, `replay should mostly serve fresh questions (overlap ${overlap})`);

// Option order is shuffled per session for MCQ.
const mcqSample = sample.questions.find((q) => q.kind === "mcq");
const layouts = new Set([1, 2, 3, 4, 5, 6].map((seed) => quiz.randomizeQuestion(mcqSample, quiz.createRng(seed)).options.map((o) => o.id).join("|")));
assert.equal(layouts.size >= 2, true, "MCQ option order must vary between sessions");
// Sorting never hands over the already-correct order.
const sortingSample = curriculum.LESSON_BY_ID["five-pillars-1"].questions.find((q) => q.kind === "sorting");
for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
  const randomized = quiz.randomizeQuestion(sortingSample, quiz.createRng(seed));
  assert.notDeepEqual(randomized.options.map((o) => o.id), randomized.order, "sorting options must start shuffled");
}

// Daily challenge is stable for a date and mixes lessons.
const dailyA = quiz.buildDailyChallenge(curriculum.LESSONS, ["who-is-allah-1", "five-pillars-1", "eid-1"], "mid", "2026-09-17");
const dailyB = quiz.buildDailyChallenge(curriculum.LESSONS, ["who-is-allah-1", "five-pillars-1", "eid-1"], "mid", "2026-09-17");
assert.deepEqual(dailyA.lesson.questions.map((q) => q.id), dailyB.lesson.questions.map((q) => q.id), "daily challenge must be deterministic per day");
assert.equal(dailyA.lesson.questions.length, quiz.DAILY_CHALLENGE_SIZE);
assert.equal(new Set(dailyA.lesson.questions.map((q) => q.id.split("::")[0])).size >= 2, true, "daily challenge must span more than one lesson");
assert.equal(quiz.speakableQuestion(mcqSample).includes("Option 1"), false, "speech must not read robotic option numbers");

// Legacy helper still works for older callers.
assert.equal(quiz.pickQuestions(sample.questions, "young").length, quiz.QUESTIONS_PER_SESSION.young);

// ---- dialogue (no double Salam, no title echo) ----
const dialogue = require(path.join(ROOT, "src/features/islamic-knowledge/lib/dialogue.ts"));
const introStep = sample.steps[0];
const introLines = dialogue.buildDialogueForStep(introStep, 0, "mid", sample.id);
assert.equal(introLines.filter((line) => /assalamu\s*alaikum/i.test(line.text)).length, 1, "intro must greet exactly once");
assert.equal(introLines.some((line) => line.text === introStep.title), false, "step title must not be spoken as its own line");
const recap = dialogue.buildRecap(sample, "mid");
assert.equal(recap.length, 2);
assert.equal(recap[0].kind, "recap");

// ---- progress ----
const completion = progress.completeLesson(progress.createInitialProgress(), "who-is-allah-1", "who-is-allah", 4, 4, undefined, {
  servedQuestionIds: ["a1e", "a1m"],
  missedQuestionIds: [],
  bestCombo: 4,
  correct: 4,
  total: 4,
});
assert.deepEqual(completion.progress.questionHistory["who-is-allah-1"], ["a1e", "a1m"], "served questions must be remembered");
assert.equal(completion.progress.lessonAttempts["who-is-allah-1"], 1);
assert.equal(completion.progress.bestCombo, 4);
assert.equal(completion.progress.totalAnswered, 4);

const daily = progress.completeDailyChallenge(completion.progress, 5, 5, 5);
assert.equal(daily.progress.dailyChallengeDone, true);
assert.equal(daily.earnedXp > 0, true);
assert.equal(progress.isDailyChallengeDoneToday(daily.progress), true);
const dailyAgain = progress.completeDailyChallenge(daily.progress, 5, 5, 5);
assert.equal(dailyAgain.earnedXp, 0, "a second daily challenge on the same day must not pay XP again");
assert.equal(daily.progress.badges.find((b) => b.id === "combo-5").earned, true);
assert.equal(daily.progress.badges.find((b) => b.id === "daily-first").earned, true);
assert.equal(completion.stars, 3);
assert.equal(completion.earnedXp, progress.XP_PER_LESSON + 15);
assert.equal(completion.earnedCoins, progress.COINS_PER_LESSON + 6);
assert.equal(completion.newBadges.includes("first-lesson"), true);
const lowerReplay = progress.completeLesson(completion.progress, "who-is-allah-1", "who-is-allah", 1, 4);
assert.deepEqual(lowerReplay.progress.quizScores["who-is-allah-1"].correct, 4, "best quiz score must survive a lower replay score");

console.log("Islamic Knowledge contract tests passed.");
