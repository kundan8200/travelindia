import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(process.cwd());
const GA_MEASUREMENT_ID = "G-1H3ZTB5WKP";
const HTML_EXTS = new Set([".html", ".htm"]);
const SKIP_DIRS = new Set(["node_modules", ".git"]);

const officialSnippet = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${GA_MEASUREMENT_ID}');
</script>`;

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
    } else if (ent.isFile() && HTML_EXTS.has(path.extname(ent.name).toLowerCase())) {
      yield p;
    }
  }
}

function normalizeExistingGa(html) {
  return html
    .replace(/\s*<script[^>]+src=["'][^"']*js\/gtag\.js["'][^>]*><\/script>\s*/gi, "\n")
    .replace(/\s*<!-- Google tag \(gtag\.js\) -->\s*<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-1H3ZTB5WKP"><\/script>\s*<script>[\s\S]*?gtag\('config', 'G-1H3ZTB5WKP'\);\s*<\/script>\s*/gi, "\n");
}

function injectIntoHead(html) {
  const cleaned = normalizeExistingGa(html);
  const headClose = /<\/head\s*>/i;
  if (!headClose.test(cleaned)) return null;
  return cleaned.replace(headClose, `${officialSnippet}\n</head>`);
}

let changed = 0;
let scanned = 0;

for await (const filePath of walk(ROOT)) {
  scanned++;
  const original = await fs.readFile(filePath, "utf8");
  const updated = injectIntoHead(original);
  if (!updated || updated === original) continue;
  await fs.writeFile(filePath, updated, "utf8");
  changed++;
}

console.log(`Scanned: ${scanned}`);
console.log(`Updated: ${changed}`);
