# Firmware Labs — Migration Progress

True state of the golden→Astro migration. Update before every checkpoint.
Lab status values: `todo` → `extracted` → `verified` (visual diff @1280+390 and
smoke test pass) → `committed`.

## Phases

- [x] **Phase 0 — Foundation** (approved)
  - [x] 0.1 Verify golden/ inventory (31 labs: 12 in vol2, 9 in vol2b, 10 in vol4)
  - [x] 0.2 Astro scaffold (minimal template, TypeScript, no UI frameworks)
  - [x] 0.3 src/styles/tokens.css from identical shared rules (see notes below)
  - [x] 0.4 src/components/LabShell.astro
  - [x] 0.5 scripts/shoot-golden.ts — 62 goldens captured (31 labs × 2 widths)
  - [x] 0.6 tests/visual/compare.ts + tests/visual/visual.spec.ts + tests/smoke.spec.ts (registry-driven, empty until Phase 1)
  - [x] 0.7 PROGRESS.md + initial commits
- [ ] **Phase 1 — Extraction** (5 batches, checkpoint after each)
  - [x] Batch A (08, 12, 21, 07, 10, 30) — all committed, awaiting checkpoint approval
  - [x] Batch B (05, 06, 15, 18, 20, 22) — all committed, awaiting checkpoint approval
  - [x] Batch C (01, 03, 09, 16, 27, 28) — all committed, awaiting checkpoint approval
  - [x] Batch D (02, 04, 11, 29, 31, 14) — all committed, awaiting checkpoint approval
  - [ ] Batch E (23, 25, 26, 24, 19, 17, 13)
- [ ] **Phase 2 — Site shell** (tracks, home, prev/next, progress.ts, genericize copy, full suite re-run)
- [ ] **Phase 3 — Drill engine** (DrillDeck.astro, generic deck, /deck page)
- [ ] **Phase 4 — Hardening** (Lighthouse, mobile QA, SEO/OG, reduced-motion audit)

## Labs

| # | Source | Slug | Batch | Status |
|---|--------|------|-------|--------|
| 01 | vol2 | race-condition | C | committed |
| 02 | vol2 | priority-inversion | D | committed |
| 03 | vol2 | ring-buffer | C | committed |
| 04 | vol2 | dma-pingpong | D | committed |
| 05 | vol2 | cortex-boot | B | committed |
| 06 | vol2 | hardfault-detective | B | committed |
| 07 | vol2 | struct-padding | A | committed |
| 08 | vol2 | endianness | A | committed |
| 09 | vol2 | spi-modes | C | committed |
| 10 | vol2 | layer-stack | A | committed |
| 11 | vol2 | ota-state-machine | D | committed |
| 12 | vol2 | battery-calc | A | committed |
| 13 | vol2b | ble-connection-timing | E | todo |
| 14 | vol2b | gatt-explorer | D | committed |
| 15 | vol2b | rf-core | B | committed |
| 16 | vol2b | clock-tree | C | committed |
| 17 | vol2b | i2c-anatomy | E | todo |
| 18 | vol2b | zephyr-build | B | committed |
| 19 | vol2b | thread-mesh | E | todo |
| 20 | vol2b | context-switch | B | committed |
| 21 | vol2b | rms-check | A | committed |
| 22 | vol4 | ble-stack-packet | B | committed |
| 23 | vol4 | ble-channel-map | E | todo |
| 24 | vol4 | discovery-sim | E | todo |
| 25 | vol4 | channel-hopping | E | todo |
| 26 | vol4 | throughput-calc | E | todo |
| 27 | vol4 | pairing-matrix | C | committed |
| 28 | vol4 | rpa-privacy | C | committed |
| 29 | vol4 | ll-state-machine | D | committed |
| 30 | vol4 | ble-versions | A | committed |
| 31 | vol4 | ble-debug-playbook | D | committed |

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

**Resolved in Batch A:** lab-specific styles use `<style is:global>` inside each
lab component (golden rules verbatim) so runtime-created DOM stays styled; each
lab has its own page so collisions don't arise. Lab pages from vol4 pass
`maxWidth={1000}` to LabLayout (vol2/vol2b default 980), mirroring each golden
file's `.wrap`.

**Golden capture method (fixed during Batch A):** each lab is captured on its
own page load with all siblings + .hdr hidden *before first render*. Rendering
the full document first changes (a) fractional y offsets and (b) Chromium's
font-fallback state for symbol glyphs (▸ ▾ ▲), both of which shift rasterization
vs the built single-lab pages. Verified 0px diff for an isolated capture.

**Known flaky golden:** lab-24 (discovery-sim) renders randomized advertising
positions on load — its golden changes between captures. Batch E must handle
this (seed, freeze, or relaxed comparison) before lab 24 can be verified.

**Testing:** `npm run shoot-golden` regenerates goldens. `npm test` = build +
all Playwright tests; `npm run test:visual` = visual only. Labs register in
`tests/labs.ts` (num, slug, interact) and are picked up by both specs.
