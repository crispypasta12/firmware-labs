/**
 * Registry of extracted labs. Phase 1 appends one entry per extracted lab;
 * both the visual spec and the smoke spec iterate this list, so a lab gets
 * tested as soon as it is registered here.
 *
 * `interact` is the lab's batch-defined smoke interaction; it runs against
 * the lab page and should assert its own expectations.
 */
import { expect, type Page } from "@playwright/test";

export interface LabEntry {
  /** zero-padded inventory number, e.g. "08" */
  num: string;
  /** route slug: page lives at /lab/<slug> */
  slug: string;
  /** smoke interaction assertion (defined per batch in the migration plan) */
  interact: (page: Page) => Promise<void>;
}

export const LABS: LabEntry[] = [
  {
    num: "08",
    slug: "endianness",
    interact: async (page) => {
      await page.locator("#endianness-endIn").fill("DEADBEEF");
      await expect(page.locator("#endianness-endLE .ecell").first()).toContainText("0xEF");
      await expect(page.locator("#endianness-endBE .ecell").first()).toContainText("0xDE");
    },
  },
  {
    num: "12",
    slug: "battery-calc",
    interact: async (page) => {
      const years = page.locator("#battery-calc-bYears");
      const before = await years.textContent();
      await page.locator("#battery-calc-bPer").fill("100");
      await expect(years).not.toHaveText(before ?? "");
    },
  },
  {
    num: "21",
    slug: "rms-check",
    interact: async (page) => {
      await expect(page.locator("#rms-check-rmsOut")).toContainText("GUARANTEED");
      await page.locator("#rms-check-rmsIn").fill("60, 50");
      await expect(page.locator("#rms-check-rmsOut")).toContainText("NOT SCHEDULABLE");
    },
  },
  {
    num: "07",
    slug: "struct-padding",
    interact: async (page) => {
      const size = page.locator("#struct-padding-padSize");
      await expect(size).toHaveText("12");
      const members = page.locator("#struct-padding-padMembers .member");
      // largest-first: move timestamp up, then length up → sizeof 12 → 8
      await members.nth(1).locator("button").first().click();
      await members.nth(2).locator("button").first().click();
      await expect(size).toHaveText("8");
    },
  },
];
