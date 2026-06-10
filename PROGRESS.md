# Firmware Labs — Migration Progress

True state of the golden→Astro migration. Update before every checkpoint.
Lab status values: `todo` → `extracted` → `verified` (visual diff @1280+390 and
smoke test pass) → `committed`.

## Phases

- [x] **Phase 0 — Foundation** (complete, awaiting checkpoint approval)
  - [x] 0.1 Verify golden/ inventory (31 labs: 12 in vol2, 9 in vol2b, 10 in vol4)
  - [x] 0.2 Astro scaffold (minimal template, TypeScript, no UI frameworks)
  - [x] 0.3 src/styles/tokens.css from identical shared rules (see notes below)
  - [x] 0.4 src/components/LabShell.astro
  - [x] 0.5 scripts/shoot-golden.ts — 62 goldens captured (31 labs × 2 widths)
  - [x] 0.6 tests/visual/compare.ts + tests/visual/visual.spec.ts + tests/smoke.spec.ts (registry-driven, empty until Phase 1)
  - [x] 0.7 PROGRESS.md + initial commits
- [ ] **Phase 1 — Extraction** (5 batches, checkpoint after each)
  - [ ] Batch A (08, 12, 21, 07, 10, 30)
  - [ ] Batch B (05, 06, 15, 18, 20, 22)
  - [ ] Batch C (01, 03, 09, 16, 27, 28)
  - [ ] Batch D (02, 04, 11, 29, 31, 14)
  - [ ] Batch E (23, 25, 26, 24, 19, 17, 13)
- [ ] **Phase 2 — Site shell** (tracks, home, prev/next, progress.ts, genericize copy, full suite re-run)
- [ ] **Phase 3 — Drill engine** (DrillDeck.astro, generic deck, /deck page)
- [ ] **Phase 4 — Hardening** (Lighthouse, mobile QA, SEO/OG, reduced-motion audit)

## Labs

| # | Source | Slug | Batch | Status |
|---|--------|------|-------|--------|
| 01 | vol2 | race-condition | C | todo |
| 02 | vol2 | priority-inversion | D | todo |
| 03 | vol2 | ring-buffer | C | todo |
| 04 | vol2 | dma-pingpong | D | todo |
| 05 | vol2 | cortex-boot | B | todo |
| 06 | vol2 | hardfault-detective | B | todo |
| 07 | vol2 | struct-padding | A | todo |
| 08 | vol2 | endianness | A | todo |
| 09 | vol2 | spi-modes | C | todo |
| 10 | vol2 | layer-stack | A | todo |
| 11 | vol2 | ota-state-machine | D | todo |
| 12 | vol2 | battery-calc | A | todo |
| 13 | vol2b | ble-connection-timing | E | todo |
| 14 | vol2b | gatt-explorer | D | todo |
| 15 | vol2b | rf-core | B | todo |
| 16 | vol2b | clock-tree | C | todo |
| 17 | vol2b | i2c-anatomy | E | todo |
| 18 | vol2b | zephyr-build | B | todo |
| 19 | vol2b | thread-mesh | E | todo |
| 20 | vol2b | context-switch | B | todo |
| 21 | vol2b | rms-check | A | todo |
| 22 | vol4 | ble-stack-packet | B | todo |
| 23 | vol4 | ble-channel-map | E | todo |
| 24 | vol4 | discovery-sim | E | todo |
| 25 | vol4 | channel-hopping | E | todo |
| 26 | vol4 | throughput-calc | E | todo |
| 27 | vol4 | pairing-matrix | C | todo |
| 28 | vol4 | rpa-privacy | C | todo |
| 29 | vol4 | ll-state-machine | D | todo |
| 30 | vol4 | ble-versions | A | todo |
| 31 | vol4 | ble-debug-playbook | D | todo |

Source key: vol2 = ti_concepts_lab.html · vol2b = ti_concepts_lab_2b.html · vol4 = ti_ble_deep_dive.html.
Drill engine source: ti_drill_mode.html (Phase 3, not a numbered lab).

## Phase 0 notes / decisions

**tokens.css contains** (identical across the 3 lab files): `:root` vars, `*` reset,
`body`, `.lab` (minus `scroll-margin-top`, see below), `.lab-head`, `.lab-num`,
`.lab-title`, `.lab-tag`, `.lab-body`, `.lab-why(+b)`, `.scope`, `.btnrow`,
`button` (+`:hover`, `.primary`, `:disabled`, `:focus-visible`), `.narr`,
`.takeaway(+b)`, `code`, `select/input[...]` (superset incl. `input[type=range]`
— vol2 lacks range but has no range inputs), `label.sw`, `.statline` (vol2b/vol4
variant, margin-top:12px), `@media(prefers-reduced-motion)`.

**Left lab-specific (not identical across files):**
- `.lab{scroll-margin-top}`: 130/140/150px per file — page-chrome concern, omitted from tokens (no visual effect on lab screenshots).
- `.statline` in vol2: `margin-top:26px`, no `.good` — vol2 labs using it (lab 03) must carry a local `margin-top:26px` override.
- `button.danger:hover` (vol2 only), `button.sel` (vol4 global; vol2 scopes it as `.spi-controls button.sel`).
- `.wrap` max-width differs (980/1000/880) — site layout decision, Phase 2.
- `.hdr/.chips` header chrome — replaced by site shell in Phase 2.
- `.sliders` (vol2b 220px vs vol4 210px minmax), `.calc-out` (gap 24 vs 26),
  `@keyframes pop` (different animations in vol2b vs vol4), `.stepdots/.sdot`
  (identical in vol2+vol2b but absent vol4 — kept lab-specific to be safe).
- All per-lab visual classes (`.race-*`, `.gantt`, `.ring`, `.dma*`, `.boot*`, etc.).
- Per-file `@media(max-width:700px/760px)` rules — contents are lab-specific; each goes with its lab.

**Known risk for Phase 1:** Astro scoped `<style>` won't style DOM nodes the
lab IIFEs create at runtime (innerHTML/createElement). Lab-specific styles will
likely need `<style is:global>` (wrapped under the lab's root class/id) to stay
faithful. Decide at first Batch A lab.

**Testing:** `npm run shoot-golden` regenerates goldens. `npm test` = build +
all Playwright tests; `npm run test:visual` = visual only. Labs register in
`tests/labs.ts` (num, slug, interact) and are picked up by both specs.
