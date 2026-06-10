/**
 * Visual regression: each extracted lab page's section.lab is screenshotted
 * at 1280px and 390px and diffed against tests/visual/golden/.
 */
import { test, expect } from "@playwright/test";
import { LABS } from "../labs";
import { diffLabAgainstGolden, WIDTHS } from "./compare";

for (const lab of LABS) {
  for (const widthName of Object.keys(WIDTHS)) {
    test(`visual lab-${lab.num} ${widthName}`, async ({ page }) => {
      await page.setViewportSize({ width: WIDTHS[widthName], height: 900 });
      await page.goto(`/lab/${lab.slug}`);
      const labEl = page.locator("section.lab").first();
      const result = await diffLabAgainstGolden(page, labEl, lab.num, widthName);
      expect(result.pass, result.message).toBe(true);
    });
  }
}
