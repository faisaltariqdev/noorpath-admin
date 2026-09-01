const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

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

const MOTION_ONLY_PROPS = new Set([
  "initial", "animate", "exit", "transition", "variants", "whileHover", "whileTap",
  "whileInView", "layout", "layoutId", "drag", "viewport",
]);

const motionStub = new Proxy(
  {},
  {
    get: (_target, tag) => (props) => {
      const clean = {};
      for (const [key, value] of Object.entries(props ?? {})) {
        if (!MOTION_ONLY_PROPS.has(key)) clean[key] = value;
      }
      return React.createElement(String(tag), clean);
    },
  },
);

const originalLoad = Module._load;
Module._load = function patchedLoad(request, ...rest) {
  if (request === "framer-motion") {
    return {
      motion: motionStub,
      AnimatePresence: ({ children }) => children,
      useReducedMotion: () => false,
    };
  }
  return originalLoad.call(this, request, ...rest);
};

const ROOT = path.resolve(__dirname, "..");
const { ALL_TOPICS, LESSONS } = require(path.join(ROOT, "src/features/islamic-knowledge/data/curriculum.ts"));
const StepVisual = require(path.join(ROOT, "src/features/islamic-knowledge/components/StepVisual.tsx")).default;

const css = fs.readFileSync(path.join(ROOT, "src/features/islamic-knowledge/islamic-knowledge.css"), "utf8");

const cards = ALL_TOPICS.map((topic) => {
  const lesson = LESSONS.find((item) => item.topicId === topic.id);
  const markup = renderToStaticMarkup(
    React.createElement(StepVisual, { topicId: topic.id, step: lesson?.steps?.[0] }),
  );
  return `<figure class="preview-card"><figcaption>${topic.title}</figcaption>${markup}</figure>`;
}).join("\n");

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>${css}
body { margin: 0; padding: 24px; background: #f4f7f5; font-family: system-ui, sans-serif; }
.preview-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.preview-card { margin: 0; background: #fff; border-radius: 20px; padding: 12px; box-shadow: 0 8px 20px rgba(0,0,0,.06); }
.preview-card figcaption { font-weight: 800; font-size: 13px; margin-bottom: 8px; color: #1a2e28; }
.ik-step-visual { width: 100%; }
</style></head><body><div class="preview-grid">${cards}</div></body></html>`;

const outDir = process.argv[2] ?? path.join(ROOT, ".preview");
fs.mkdirSync(outDir, { recursive: true });
const htmlPath = path.join(outDir, "ik-visuals.html");
fs.writeFileSync(htmlPath, html);

(async () => {
  const { chromium } = require(process.env.PLAYWRIGHT_PATH ?? "playwright");
  const browser = await chromium.launch(
    process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
  );
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  await page.goto(`file://${htmlPath}`);
  await page.screenshot({ path: path.join(outDir, "ik-visuals.png"), fullPage: true });
  await browser.close();
  console.log(`Preview written to ${path.join(outDir, "ik-visuals.png")}`);
})();
