# R2 — Release gate review: is this worth tagging v0.0.1? (read-only)

## Goal
An independent verdict, SHIP / NO-SHIP, on tagging the current working tree as v0.0.1 = "M1
vertical slice, grey box → first CC0 models", deployed publicly to GitHub Pages. You have no
shell. The orchestrator has verified: `npx tsc --noEmit` clean, `npm test` 115 green, `npm run
check:content` PASS, `npm run build` ok (dist 3.8 MB), and a browser playthrough of the 3 scenes
before the last round of fixes (bubble, tokenizer, toasts, distinct replies, engine review fixes).

## What v0.0.1 must mean (acceptance for SHIP)
A stranger opening the Pages URL on desktop or phone can: walk to the cook, complete the 3
dishwasher scenes, tap words for pinyin, see wallet change, open the notebook, and reload without
losing progress — with no console errors and nothing that reads as broken. Grey-box art is fine.
Content rules (faceless, no alcohol/loans/etc.) hold. Docs let a new dev run it in 2 minutes.

## Read
CLAUDE.md, README.md, docs/PLAN.md (Contract + Engine decisions), src/main.ts, src/render/*.ts
(assets.ts, character.ts, scene.ts especially — this is the newest, least-tested code),
src/ui/*.ts, src/engine/index.ts + store.ts + dialogue.ts, content/phase1/scenes.json (scene 01),
.github/workflows/pages.yml, vite.config.ts, .gitignore, .claude/playbooks/localhost-5179.md
(browser test notes incl. remaining unverified items).

## Check
1. Anything that would break on GitHub Pages under base `/make-it-in-china/`: absolute URLs
   (models, fonts, JSON imports), `public/.nojekyll`, workflow correctness (permissions, artifact path).
2. Render/asset code: fallback when a GLB fails; async load ordering vs first render (does the
   game start before models arrive, and does it stay playable?); SkeletonUtils clone use; material
   swap under `?toon=1`; any facial-feature leak path; memory/perf smells (per-frame allocations,
   unbounded outlines).
3. UI ↔ engine wiring: reload mid-scene; `availableScenes` after all 3 shifts (out-of-slots UX —
   is anything shown?); `sleep()` reachable from the UI? If the player can't end the day, say so
   and classify severity for v0.0.1.
4. Content rules and licence hygiene: docs/CREDITS.md complete for every file in public/models;
   assets/raw + assets/extracted ignored; nothing copyrighted committed.
5. Docs: can a new dev run it from README alone? Is CLAUDE.md accurate to the code?
6. Repo hygiene: files that shouldn't ship (.playwright-mcp/, stray screenshots, .delegates/).

## Report format
VERDICT: SHIP / SHIP-WITH-FIXES (list the exact ≤5 fixes required first) / NO-SHIP (why).
Then FINDINGS by severity with file:line and one-line fix. Then the numbered checklist verdicts.
Then NOT CHECKED. Read-only; no edits.
