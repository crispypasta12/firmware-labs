/**
 * Registry of extracted labs. Phase 1 appends one entry per extracted lab;
 * both the visual spec and the smoke spec iterate this list, so a lab gets
 * tested as soon as it is registered here.
 *
 * `interact` is the lab's batch-defined smoke interaction; it runs against
 * the lab page and should assert its own expectations.
 */
import { type Page } from "@playwright/test";

export interface LabEntry {
  /** zero-padded inventory number, e.g. "08" */
  num: string;
  /** route slug: page lives at /lab/<slug> */
  slug: string;
  /** smoke interaction assertion (defined per batch in the migration plan) */
  interact: (page: Page) => Promise<void>;
}

export const LABS: LabEntry[] = [
  // Phase 1 entries land here, e.g.:
  // {
  //   num: "08",
  //   slug: "endianness",
  //   interact: async (page) => { ... },
  // },
];
