/* Temporary debug tool: compare per-element layout between a golden lab and
   the built page to localize visual diff offsets. */
import { chromium } from "playwright";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const [goldenFile, goldenSel, builtUrl, width] = process.argv.slice(2);
const w = Number(width) || 1280;

const browser = await chromium.launch();

async function measure(url: string, sectionSel: string) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto(url);
  await page.evaluate(() => (document as any).fonts.ready);
  await page.addStyleTag({ content: ".hdr{display:none!important}" });
  const data = await page.evaluate(`(() => {
    const root = document.querySelector(${JSON.stringify(sectionSel)});
    const out = [];
    const walk = (el, depth) => {
      const r = el.getBoundingClientRect();
      out.push({
        d: depth,
        tag: el.tagName.toLowerCase() + (el.className ? "." + String(el.className).split(" ").join(".") : ""),
        y: +r.y.toFixed(2),
        h: +r.height.toFixed(2),
      });
      if (depth < 4) [...el.children].forEach((c) => walk(c, depth + 1));
    };
    walk(root, 0);
    return out;
  })()`) as any[];
  await page.close();
  return data;
}

const a = await measure(pathToFileURL(resolve("golden", goldenFile)).href, goldenSel);
const b = await measure(builtUrl, "section.lab");

const n = Math.max(a.length, b.length);
console.log("GOLDEN".padEnd(50) + "y/h".padEnd(18) + "BUILT".padEnd(50) + "y/h");
for (let i = 0; i < n; i++) {
  const ga = a[i], gb = b[i];
  const mark = ga && gb && (ga.h !== gb.h) ? "  <-- h differs" : "";
  console.log(
    ((ga ? "  ".repeat(ga.d) + ga.tag : "-")).padEnd(50).slice(0, 50) +
    ((ga ? `${ga.y}/${ga.h}` : "-")).padEnd(18) +
    ((gb ? "  ".repeat(gb.d) + gb.tag : "-")).padEnd(50).slice(0, 50) +
    ((gb ? `${gb.y}/${gb.h}` : "-")) + mark,
  );
}
await browser.close();
