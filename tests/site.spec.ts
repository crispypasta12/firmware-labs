import { expect, test } from "@playwright/test";

test("site shell exposes tracks and lab progress", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /Wireless/ })).toBeVisible();
  await expect(page.getByText("0/13")).toBeVisible();

  await page.goto("/lab/race-condition");
  await expect(page.getByRole("link", { name: /Concurrency & RTOS/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Next/ })).toContainText("Priority inversion");

  await page.getByRole("button", { name: "Mark complete" }).click();
  await expect(page.getByRole("button", { name: "Marked complete" })).toBeVisible();

  await page.goto("/track/concurrency-rtos");
  await expect(page.locator('[data-progress-lab="race-condition"]')).toHaveText("Complete");

  await page.goto("/");
  await expect(page.getByText("1/4")).toBeVisible();
});

test("deck reveal and grading counters move", async ({ page }) => {
  await page.goto("/deck");

  await expect(page.locator("#stLeft")).toHaveText("20");
  await expect(page.locator("#stGot")).toHaveText("0");
  await expect(page.locator("#stShaky")).toHaveText("0");
  await expect(page.locator("#stAgain")).toHaveText("0");

  await page.locator("#card").click();
  await expect(page.locator("#cA")).toBeVisible();
  await page.getByRole("button", { name: /Again/ }).click();
  await expect(page.locator("#stAgain")).toHaveText("1");
  await expect(page.locator("#stLeft")).toHaveText("20");

  await page.keyboard.press("Space");
  await page.getByRole("button", { name: /Shaky/ }).click();
  await expect(page.locator("#stShaky")).toHaveText("1");
  await expect(page.locator("#stLeft")).toHaveText("20");

  await page.keyboard.press("Space");
  await page.getByRole("button", { name: /Got it/ }).click();
  await expect(page.locator("#stGot")).toHaveText("1");
  await expect(page.locator("#stLeft")).toHaveText("19");
});

test("home and lab routes expose SEO and social metadata", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /Interactive simulators/);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Firmware Labs");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/og\.svg$/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/$/);

  await page.goto("/lab/race-condition");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /Step through a preemption interleaving/);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /Lab 01 - Why counter\+\+ loses updates/);
});

test("lab learning notes render outside the simulator section", async ({ page }) => {
  await page.goto("/lab/race-condition");

  await expect(page.getByRole("link", { name: "Learning notes" })).toBeVisible();
  await expect(page.locator("#learning-notes")).toContainText("Build the engineering model");
  await expect(page.locator("#learning-notes")).toContainText("Real firmware checklist");
  await expect(page.locator("section.lab #learning-notes")).toHaveCount(0);
  await expect(page.locator(".lab-tag")).not.toContainText("PDF");
});

test("track pages surface learning-note coverage", async ({ page }) => {
  await page.goto("/track/wireless");
  await expect(page.getByText("Includes field checklist")).toHaveCount(13);
});

for (const route of ["/", "/deck", "/track/wireless", "/lab/race-condition", "/lab/ble-debug-playbook"]) {
  test(`mobile layout has no horizontal overflow on ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route);
    await page.evaluate(() => (document as any).fonts.ready);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test("reduced motion disables CSS transitions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/deck");

  const transitionDuration = await page.locator("#prog").evaluate((el) => getComputedStyle(el).transitionDuration);
  expect(transitionDuration).toBe("0s");
});
