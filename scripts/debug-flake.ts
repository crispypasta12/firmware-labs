import { chromium } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const url = process.argv[2] ?? "http://localhost:4321/lab/rms-check";
const browser = await chromium.launch();

async function shot() {
  const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
  await page.goto(url);
  await page.evaluate(`document.fonts.ready`);
  await page.waitForTimeout(100);
  const buf = await page.locator("section.lab").first().screenshot({ animations: "disabled" });
  await page.close();
  return PNG.sync.read(buf);
}

const a = await shot();
const b = await shot();
if (a.width !== b.width || a.height !== b.height) {
  console.log(`size differs: ${a.width}x${a.height} vs ${b.width}x${b.height}`);
} else {
  const n = pixelmatch(a.data, b.data, undefined, a.width, a.height, { threshold: 0.15, includeAA: false });
  console.log(`self-diff pixels: ${n} of ${a.width * a.height}`);
}
await browser.close();
