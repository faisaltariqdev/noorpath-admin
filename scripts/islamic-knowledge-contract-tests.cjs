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

const olderLessons = curriculum.LESSONS.filter((lesson) => curriculum.TOPIC_BY_ID[lesson.topicId].level !== "beginner");
assert.equal(olderLessons.every((lesson) => lesson.questions.length >= 4), true, "intermediate and advanced lessons need at least four questions");

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

const sample = curriculum.LESSONS.find((lesson) => lesson.questions.length >= 4);
assert.equal(quiz.pickQuestions(sample.questions, "young").length, 3);
assert.equal(quiz.pickQuestions(sample.questions, "mid").length, 4);
assert.equal(quiz.pickQuestions(sample.questions, "older")[0].difficulty === "medium" || quiz.pickQuestions(sample.questions, "older")[0].difficulty === "hard", true);

const completion = progress.completeLesson(progress.createInitialProgress(), "who-is-allah-1", "who-is-allah", 4, 4);
assert.equal(completion.stars, 3);
assert.equal(completion.earnedXp, progress.XP_PER_LESSON + 15);
assert.equal(completion.earnedCoins, progress.COINS_PER_LESSON + 6);
assert.equal(completion.newBadges.includes("first-lesson"), true);
const lowerReplay = progress.completeLesson(completion.progress, "who-is-allah-1", "who-is-allah", 1, 4);
assert.deepEqual(lowerReplay.progress.quizScores["who-is-allah-1"].correct, 4, "best quiz score must survive a lower replay score");

console.log("Islamic Knowledge contract tests passed.");
