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
