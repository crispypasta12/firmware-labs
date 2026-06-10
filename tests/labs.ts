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
];
