# A — Scaffold: Vite + TS + three.js grey-box noodle shop with faceless character

## Goal
`npm install && npm run dev` serves a page showing a grey-box "street" (ground plane, 3 box
buildings, one labelled noodle shop), a faceless low-poly character (capsule/box body, blank
sphere head, flat colour) that walks to where the player clicks/taps on a grid, seen from a fixed
high three-quarter camera that gently follows. A `?toon=1` URL flag switches materials to
MeshToonMaterial + outline. `src/content/types.ts` exists exactly as the contract in docs/PLAN.md.
`npm run build`, `npm test` (vitest, one smoke test) and `npm run check:content` scripts exist.

## Context
- Repo/dir: this directory (empty git repo, no commits). Read first: docs/PLAN.md (whole file,
  ~100 lines), docs/design-doc.txt lines 333–350 (Look) and 419–446 (Stack).
- Another worker is concurrently writing content/phase1/*.json and scripts/check-level.mjs. Do
  NOT touch those. `npm run check:content` must be `node scripts/check-level.mjs content/phase1`.
- A third worker will later write src/engine/*. Leave src/engine empty except a `README.md`
  one-liner stating the contract: pure TS, no DOM/three imports.

## Scope
- In: package.json, vite.config.ts, tsconfig.json, index.html, src/main.ts, src/content/types.ts,
  src/render/**, tests/smoke.test.ts, .gitignore additions, docs/CREDITS.md (header only).
- Out: content/, scripts/, src/engine/ (beyond README), src/ui/ (beyond an empty index.ts). No
  commits. No deps beyond: three, @types/three, vite, typescript, vitest. No physics, no navmesh
  lib — walkable grid is a 2D boolean array with straight-line or 4-way BFS path.

## Constraints
- Faceless: no eyes/nose/mouth geometry or texture anywhere. Character head mesh created in ONE
  function `makeHead()` so it can be swapped later.
- Camera: fixed pitch ~55°, yaw fixed, orthographic OR perspective with narrow FOV — pick one,
  note why in a comment. Character ≈ 1/8 screen height. Slight lerp follow. No user orbit.
- Toon: MeshToonMaterial with 3-step DataTexture gradient map; outline via inverted-hull
  (BackSide, scaled 1.03, black) — not the postprocessing OutlineEffect (mobile cost).
- Mobile-friendly: touch works, devicePixelRatio capped at 2, resize handled.
- Keep it small: ≤ ~400 lines of TS total. Grey boxes, not art.

## Acceptance criteria
- [ ] `npm install` then `npm run build` exits 0; paste tail.
- [ ] `npm test` runs one vitest smoke test green.
- [ ] `npx tsc --noEmit` clean.
- [ ] `src/content/types.ts` matches docs/PLAN.md contract byte-for-byte in meaning (same names/fields).
- [ ] `npm run dev` starts; describe in the report what the page shows (you cannot screenshot; say what code guarantees).
- [ ] Click-to-walk implemented via raycast to ground → grid cell → path → tween; blocked cells (buildings) are not enterable.

## Report format
DONE / ACCEPTANCE (each criterion pass|fail) / VERIFICATION (commands + summarized output) /
FILES TOUCHED (with line ranges) / OPEN QUESTIONS.
Ambiguity or blocker: stop and ask under OPEN QUESTIONS. Never guess a decision that belongs to
the orchestrator.
