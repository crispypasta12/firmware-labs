/**
 * Screenshot every section.lab in the golden files at 1280px and 390px,
 * into tests/visual/golden/lab-NN-{desktop|mobile}.png.
 * NN comes from the lab's own ".lab-num" text (LAB 01..31), so numbering
 * matches the migration inventory regardless of file order.
 *
 * The sticky page header (.hdr) is hidden during capture so it can't bleed
 * into element screenshots — the golden files themselves are never touched.
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
  for (const [widthName, width] of Object.entries(WIDTHS)) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(pathToFileURL(resolve("golden", file)).href);
    await page.evaluate(() => (document as any).fonts.ready);
    await page.addStyleTag({ content: ".hdr{display:none!important}" });

    const labs = page.locator("section.lab");
    const count = await labs.count();
    for (let i = 0; i < count; i++) {
      const lab = labs.nth(i);
      const numText = await lab.locator(".lab-num").innerText();
      const num = numText.replace(/\D/g, "").padStart(2, "0");
      await lab.scrollIntoViewIfNeeded();
      await page.waitForTimeout(100);
      await lab.screenshot({
        path: `${OUT_DIR}/lab-${num}-${widthName}.png`,
        animations: "disabled",
      });
      total++;
      console.log(`lab-${num}-${widthName}.png  (${file})`);
    }
    await page.close();
  }
}

await browser.close();
console.log(`\nCaptured ${total} screenshots into ${OUT_DIR}`);
