/**
 * Smoke tests: per extracted lab, load its page, assert zero console errors,
 * and run the lab's batch-defined interaction assertion.
 */
import { test, expect } from "@playwright/test";
import { LABS } from "./labs";

for (const lab of LABS) {
  test(`smoke lab-${lab.num} /lab/${lab.slug}`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(String(err)));

    await page.goto(`/lab/${lab.slug}`);
    await page.evaluate(() => (document as any).fonts.ready);

    await lab.interact(page);

    expect(consoleErrors, `console errors on /lab/${lab.slug}`).toEqual([]);
  });
}

test("registry sanity", () => {
  const nums = LABS.map((l) => l.num);
  expect(new Set(nums).size).toBe(nums.length);
});
