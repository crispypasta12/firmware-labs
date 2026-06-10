# Firmware Labs

Interactive simulators teaching senior-level firmware engineering judgment.

This repo migrates 31 working vanilla-JS labs from golden/ into an Astro site.

## Non-negotiable rules

1. Files in golden/ are IMMUTABLE. Never edit them. They are the spec.

2. Extraction = moving code, not rewriting it. Do not refactor lab logic,

   rename variables, "modernize" JS, change timings, colors, or copy unless

   the task explicitly says so. The IIFE pattern stays.

3. One lab per branch/commit. Commit format: extract(lab-NN): <name>.

4. Every extraction ends with: visual diff vs tests/visual/golden/ at 1280px

   and 390px + interaction smoke test, BEFORE commit. If the diff fails,

   suspect tokens.css (missing shared rule) before suspecting the lab.

5. No frameworks inside lab components. Astro component = HTML + scoped

   <style> + inline <script>. React only for future non-lab features.

## Lab anatomy (every lab follows this)

LabShell provides: .lab-head (num/title/tag), .lab-why (motivation),

.takeaway (the "say it like a senior" box). The lab component owns:

.scope (the visual), controls (.btnrow), .narr (live narration line).

## Design tokens

All shared styles live in src/styles/tokens.css. Palette: --bg #0a0c0f,

--teal #00d4aa (primary), --amber #ffb454 (narration/highlights),

--blue, --red, --purple, --green. Fonts: IBM Plex Mono (UI/labels),

IBM Plex Sans (prose). The scope-grid background is part of the brand.

## Conventions

- Element ids must be unique per page: prefix with the lab slug when

  extracting (e.g. id="pi-narr"), updating the lab's own script to match.

  This is the ONLY permitted code change during extraction.

- prefers-reduced-motion must keep working; keyboard focus visible.

- Each lab's MDX frontmatter: title, track, difficulty, prerequisites,

  simplifications (honest list of what the sim approximates).

- localStorage is allowed (this is a real website): use src/lib/progress.ts.

## Commands

npm run dev / build / test / test:visual / shoot-golden (regenerate goldens)
