# Fix pass — checker rules and TTS build (from Opus review)

## Goal
Resolve the review findings on the strict checker (`scripts/check-level-rules.mjs`, `scripts/check-level.mjs`), the TTS build (`scripts/tts.mjs`, `scripts/tts-inventory.mjs`) and types. Design authority: `docs/design/TDD.md` §1.1, §6.1 (esp. lines ~430–445 on slot tuples and eligibility), §9.2.

## You are the SOLE executor
No spawning/delegation. NO shell: do not run commands; the orchestrator runs `npx tsc --noEmit`, `npm test`, `npm run check:content`, `npm run check:content:strict`, `npm run tts:dry`, `npm run build` after hand-back. Another worker is concurrently editing `content/phase1/scenes.json`: do not touch that file. In `content/phase1/world.json`, change nothing except adding `id` to slot-pool values.

## Orchestrator decisions
- D1 Rule 5 per-word audio: there is NO `Word.audio` field. Rule 5 validates the per-word mapping against the exported inventory (`scripts/tts-inventory.mjs` word mapping, `word_001…` plus hanzi lookup): every dictionary word must resolve to exactly one clip ID. Remove `audio:` from word fixtures in `tests/check-level-strict.test.ts`.
- D2 Slot-pool value IDs become authored content: add `id: string` (required in the type) to `SlotPool.values[]` in `src/content/types.ts`; author them in `world.json` for the existing pools (`n01`…`n10` for counts; short ASCII slugs for others). The checker enforces uniqueness per pool. `tts-inventory.mjs` stops synthesizing IDs and throws with a clear message when one is missing.
- D3 TTS: keep concurrency 4 and the brief's retry count, but make the cache hash include the provider name/version string (`edge-tts` version as passed via a constant), codec settings, and voice/rate/pitch/text, per TDD §6.1.

## Blocking fixes (numbering from the review)
1. Rule 2 novelty: slot contribution counts only the requested value plus its fixed paired wrong alternative (TDD §6.1 pairs 1↔2, 3↔4, 5↔6, 7↔8, 9↔10; size/drink/container/negative swap; place front→back, back→front, inside→front), never the whole pool; both must be met/introduced by that point in the route. FAIL when no pair is eligible at that site. Rule 4 coverage may still count the full pool.
2. Shared tuple-eligibility function used by both `check-level-rules.mjs` (rules 3 and 7) and `tts-inventory.mjs`: exclude equal values across slots bound to the same pool; apply pair eligibility; remove the hardcoded `p1_noodle_dishwasher_01_e4` special case. S01 e4 must produce exactly 90 line variants.
3. D1 above.
4. D2 above.

## Non-blocking fixes to include
- Delete the dead `runLegacyCheck` in `check-level-rules.mjs` (legacy stays inline in `check-level.mjs`).
- Guard `exchange.replies?.indexOf` crash at rules line ~569.
- Rule 14: assert cost 0 for guided consequences and for the tutorial consequence `p1_arrival_00_wrong` (tutorial = consequence whose parent has curriculumIndex 0); assert `exchange.introduces ⊆ scene.introduces`.
- Rule 6: include `onWrong` edges in cycle detection.
- Rule 11: denominator only over curriculum scenes; report actual new types.
- tts.mjs: write ffmpeg output to a temp name inside `public/audio/phase1/` then rename (no cross-device rename); on failed `--force` keep the previous manifest entry; retain the exported `word_NNN` mapping in `content/phase1/word-audio-map.json` (create if missing, reuse existing IDs on reorder, append new).
- Strict tests: add a slot-pool fixture (pair eligibility pass and fail), a wrong-reply fixture that exercises the hint requirement, `onWrong` validity, and consequence cost.
- Update `scripts/README.md` and `content/README.md` for the value `id` requirement and the word-audio map.

## Acceptance
- tsc clean; all tests pass; legacy `check:content` output unchanged; strict run on current content shows no rule 2 FAIL on S01/S02 number sites and no rule 5 word FAILs (the manifest exists at `public/audio/manifest.json`); `tts:dry` reports S01 e4 = 90 line variants.
- Report: DONE / FILES / per-finding table (finding → change → file:line) / OPEN QUESTIONS.
