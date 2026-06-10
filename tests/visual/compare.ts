/**
 * Visual diff helper: screenshot a built lab page's section.lab and compare
 * against tests/visual/golden/lab-NN-{desktop|mobile}.png.
 *
 * pixelmatch runs with anti-aliasing detection enabled (AA pixels ignored)
 * plus a small per-pixel color threshold and an allowed diff-pixel ratio, so
 * font rasterization noise doesn't fail the diff but real layout/style
 * regressions do. Failing diffs are written to tests/visual/diffs/.
 */
import { type Locator, type Page } from "@playwright/test";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const GOLDEN_DIR = "tests/visual/golden";
const DIFF_DIR = "tests/visual/diffs";

export const WIDTHS: Record<string, number> = { desktop: 1280, mobile: 390 };

// Per-pixel color tolerance (0..1) and allowed fraction of differing pixels.
const PIXEL_THRESHOLD = 0.15;
// Chromium's symbol-font fallback can shift a few hundred glyph pixels once the
// registry includes many labs with arrows/math symbols, especially at mobile
// widths. Keep this tight enough to catch layout/color regressions while
// allowing that rasterization noise.
const MAX_DIFF_RATIO = 0.005;

export interface DiffResult {
  pass: boolean;
  message: string;
  diffRatio?: number;
  diffPath?: string;
}

export async function diffLabAgainstGolden(
  page: Page,
  lab: Locator,
  labNum: string,
  widthName: keyof typeof WIDTHS,
): Promise<DiffResult> {
  const goldenPath = `${GOLDEN_DIR}/lab-${labNum}-${widthName}.png`;
  if (!existsSync(goldenPath)) {
    return { pass: false, message: `missing golden: ${goldenPath}` };
  }

  await page.setViewportSize({ width: WIDTHS[widthName], height: 900 });
  await page.evaluate(() => (document as any).fonts.ready);
  await lab.scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
  const actualBuf = await lab.screenshot({ animations: "disabled" });

  const golden = PNG.sync.read(readFileSync(goldenPath));
  const actual = PNG.sync.read(actualBuf);

  if (golden.width !== actual.width || golden.height !== actual.height) {
    mkdirSync(DIFF_DIR, { recursive: true });
    const actualPath = `${DIFF_DIR}/lab-${labNum}-${widthName}-actual.png`;
    writeFileSync(actualPath, actualBuf);
    return {
      pass: false,
      message:
        `size mismatch lab-${labNum}-${widthName}: ` +
        `golden ${golden.width}x${golden.height} vs actual ${actual.width}x${actual.height} ` +
        `(actual saved to ${actualPath})`,
    };
  }

  const diff = new PNG({ width: golden.width, height: golden.height });
  const diffPixels = pixelmatch(
    golden.data,
    actual.data,
    diff.data,
    golden.width,
    golden.height,
    { threshold: PIXEL_THRESHOLD, includeAA: false },
  );
  const diffRatio = diffPixels / (golden.width * golden.height);

  if (diffRatio > MAX_DIFF_RATIO) {
    mkdirSync(DIFF_DIR, { recursive: true });
    const diffPath = `${DIFF_DIR}/lab-${labNum}-${widthName}-diff.png`;
    writeFileSync(diffPath, PNG.sync.write(diff));
    writeFileSync(`${DIFF_DIR}/lab-${labNum}-${widthName}-actual.png`, actualBuf);
    return {
      pass: false,
      diffRatio,
      diffPath,
      message:
        `lab-${labNum}-${widthName}: ${diffPixels} px differ ` +
        `(${(diffRatio * 100).toFixed(3)}% > ${(MAX_DIFF_RATIO * 100).toFixed(3)}%), diff at ${diffPath}`,
    };
  }

  return {
    pass: true,
    diffRatio,
    message: `lab-${labNum}-${widthName}: OK (${(diffRatio * 100).toFixed(3)}% diff)`,
  };
}
