/**
 * Screenshot every section.lab in the golden files at 1280px and 390px,
 * into tests/visual/golden/lab-NN-{desktop|mobile}.png.
 * NN comes from the lab's own ".lab-num" text (LAB 01..31), so numbering
 * matches the migration inventory regardless of file order.
 *
 * Each lab is captured on its own page load with all other .wrap content
 * (and the sticky .hdr) hidden BEFORE first render. This matches how the
 * built /lab/<slug> pages render (one lab, top of the content column) in two
 * ways that matter for pixel fidelity:
 *  - integer y position (fractional document offsets thousands of pixels into
 *    the full golden page change subpixel rasterization and clip rounding);
 *  - font-fallback state (rendering the full document first warms Chromium's
 *    fallback cache for symbol glyphs like ▸, which shifts line baselines by
 *    1px vs a page that renders the lab alone).
 * Runtime injection only — the golden files themselves are never touched.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const GOLDEN_FILES = [
  "ti_concepts_lab.html",
  "ti_concepts_lab_2b.html",
  "ti_ble_deep_dive.html",
];
const WIDTHS: Record<string, number> = { desktop: 1280, mobile: 390 };
const OUT_DIR = "tests/visual/golden";

mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
let total = 0;

for (const file of GOLDEN_FILES) {
  const url = pathToFileURL(resolve("golden", file)).href;

  // enumerate labs once per file
  const probe = await browser.newPage();
  await probe.goto(url);
  const nums: string[] = await probe.$$eval("section.lab .lab-num", (els) =>
    els.map((e) => (e.textContent || "").replace(/\D/g, "").padStart(2, "0")),
  );
  await probe.close();

  for (const [widthName, width] of Object.entries(WIDTHS)) {
    for (let i = 0; i < nums.length; i++) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.addInitScript(`
        document.addEventListener("DOMContentLoaded", () => {
          const st = document.createElement("style");
          st.textContent = ".hdr{display:none!important}";
          document.head.appendChild(st);
          const target = document.querySelectorAll("section.lab")[${i}];
          for (const el of document.querySelectorAll(".wrap > *")) {
            if (el !== target) el.style.display = "none";
          }
        });
      `);
      await page.goto(url);
      await page.evaluate(`document.fonts.ready`);
      await page.waitForTimeout(100);
      await page.locator(`section.lab >> nth=${i}`).screenshot({
        path: `${OUT_DIR}/lab-${nums[i]}-${widthName}.png`,
        animations: "disabled",
      });
      await page.close();
      total++;
      console.log(`lab-${nums[i]}-${widthName}.png  (${file})`);
    }
  }
}

await browser.close();
console.log(`\nCaptured ${total} screenshots into ${OUT_DIR}`);
