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
  {
    num: "10",
    slug: "layer-stack",
    interact: async (page) => {
      const layer = page.locator(".stack .layer").first();
      await expect(layer.locator(".det")).toBeHidden();
      await layer.click();
      await expect(layer.locator(".det")).toBeVisible();
    },
  },
  {
    num: "30",
    slug: "ble-versions",
    interact: async (page) => {
      const detail = page.locator("#ble-versions-vDetail");
      await expect(detail).toBeHidden();
      await page.locator("#ble-versions-vtl .vcard", { hasText: "4.2" }).click();
      await expect(detail).toBeVisible();
      await expect(detail).toContainText("Data Length Extension");
    },
  },
  {
    num: "05",
    slug: "cortex-boot",
    interact: async (page) => {
      const desc = page.locator("#cortex-boot-bootDesc");
      const before = await desc.textContent();
      await page.locator("#cortex-boot-bootNext").click();
      await expect(desc).not.toHaveText(before ?? "");
      await expect(page.locator("#cortex-boot-mb-vt")).toHaveClass(/hl/);
    },
  },
  {
    num: "06",
    slug: "hardfault-detective",
    interact: async (page) => {
      await page.locator("#hardfault-detective-hfNext").click();
      await expect(page.locator("#hardfault-detective-hfClues .clue").first()).toHaveClass(/show/);
      await expect(page.locator("#hardfault-detective-hfNarr")).toContainText("Symptom revealed");
    },
  },
  {
    num: "15",
    slug: "rf-core",
    interact: async (page) => {
      const narr = page.locator("#rf-core-rfNarr");
      const before = await narr.textContent();
      await page.locator("#rf-core-rfNext").click();
      await expect(narr).not.toHaveText(before ?? "");
      await expect(page.locator("#rf-core-rf-m4")).toHaveClass(/hl/);
    },
  },
  {
    num: "18",
    slug: "zephyr-build",
    interact: async (page) => {
      const narr = page.locator("#zephyr-build-zNarr");
      const before = await narr.textContent();
      await page.locator("#zephyr-build-zNext").click();
      await expect(narr).not.toHaveText(before ?? "");
      await expect(page.locator("#zephyr-build-z-in")).toHaveClass(/hl/);
    },
  },
  {
    num: "20",
    slug: "context-switch",
    interact: async (page) => {
      const frames = page.locator("#context-switch-stA .sframe");
      const before = await frames.count();
      await page.locator("#context-switch-xNext").click();
      await expect(frames).toHaveCount(before + 1);
    },
  },
  {
    num: "22",
    slug: "ble-stack-packet",
    interact: async (page) => {
      await page.locator("#ble-stack-packet-stNext").click();
      await expect(page.locator("#ble-stack-packet-pktbar .pseg")).toHaveCount(1);
      await expect(page.locator("#ble-stack-packet-pkBytes")).toHaveText("20");
    },
  },
  {
    num: "01",
    slug: "race-condition",
    interact: async (page) => {
      for (let i = 0; i < 6; i++) {
        await page.locator("#race-condition-rcStep").click();
      }
      await expect(page.locator("#race-condition-rcLost")).toContainText("LOST UPDATE");
    },
  },
];
