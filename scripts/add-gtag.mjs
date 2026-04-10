import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(process.cwd());
const GA_MEASUREMENT_ID = "G-1H3ZTB5WKP";

const HTML_EXTS = new Set([".html", ".htm"]);
const SKIP_DIRS = new Set(["node_modules", ".git"]);

function shouldSkipDir(dirName) {
  return SKIP_DIRS.has(dirName);
}

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (shouldSkipDir(ent.name)) continue;
      yield* walk(p);
    } else if (ent.isFile()) {
      const ext = path.extname(ent.name).toLowerCase();
      if (HTML_EXTS.has(ext)) yield p;
    }
  }
}

function relGtagSrc(filePath) {
  const relDir = path.relative(ROOT, path.dirname(filePath));
  const depth = relDir === "" ? 0 : relDir.split(path.sep).length;
  return `${"../".repeat(depth)}js/gtag.js`;
}

function alreadyHasGa(html) {
  return (
    html.includes("googletagmanager.com/gtag/js?id=") ||
    html.includes(GA_MEASUREMENT_ID) ||
    /<script[^>]+src=["'][^"']*js\/gtag\.js["']/i.test(html)
  );
}

function injectIntoHead(html, src) {
  const snippet = `<script src="${src}"></script>`;
  const headClose = /<\/head\s*>/i;
  if (!headClose.test(html)) return null;
  return html.replace(headClose, `    ${snippet}\n</head>`);
}

let changed = 0;
let scanned = 0;
const changedFiles = [];

for await (const filePath of walk(ROOT)) {
  scanned++;
  const original = await fs.readFile(filePath, "utf8");

  if (alreadyHasGa(original)) continue;

  const src = relGtagSrc(filePath);
  const updated = injectIntoHead(original, src);
  if (!updated || updated === original) continue;

  await fs.writeFile(filePath, updated, "utf8");
  changed++;
  changedFiles.push(path.relative(ROOT, filePath));
}

console.log(`Scanned: ${scanned}`);
console.log(`Updated: ${changed}`);
if (changedFiles.length) {
  console.log("Files updated:");
  for (const f of changedFiles) console.log(`- ${f}`);
}
