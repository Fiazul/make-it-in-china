# D — Wire engine → UI → render: playable M1 vertical slice

## Goal
`npm run dev` gives a playable loop: walk to the noodle shop cook (grey-box), a speech bubble
appears anchored above the NPC with hanzi (tap a word → pinyin + gloss popup, logged as
`tapWord`), 2–4 reply buttons; picking one advances the engine, wallet HUD shows "+N块" toast,
wrong replies route to the consequence scene and back; after the 3 dishwasher scenes the
notebook (button, DOM panel) lists words grouped by location with their state. Save persists
across reload; export/import string in the notebook panel. Works with touch on a phone-width
viewport.

## Context
- Repo/dir: this directory. Read first: docs/PLAN.md, src/engine/README.md and
  src/engine/index.ts (public API — do not change engine internals; if the API is missing
  something, add an OPEN QUESTION and stub around it), src/render/* (camera, character, world —
  reuse; you may add NPC placement from world.json and a "talk" trigger when the player is
  within 1 cell of an NPC), content/phase1/*.json, docs/reference-videos.md (steal list).
- Audio is deferred: replay button rendered disabled with title "audio pending".

## Scope
- In: src/ui/**, src/main.ts, index.html (CSS), src/render/npc.ts (new), small additive changes to
  src/render/world.ts for NPC spawn. Out: src/engine/**, content/**, scripts/**, package.json.
  No commits. No new deps.

## Constraints
- UI is DOM over canvas; no text drawn in WebGL. Bubble anchored by projecting NPC head position
  each frame. Name label above bubble. No portraits, no faces.
- Pinyin hidden until tapped. New words in a line underlined on first appearance
  (engine emits which words are new — check the event; otherwise compare against `state()`).
- Wrong answer never shows a red cross; the consequence scene's text is the feedback.
- Keep the wallet/day/objective HUD tiny (top-right), notebook button bottom-right, replies
  bottom-center as ≥44px tall buttons. `prefers-color-scheme` not needed. ≤ ~500 lines added.

## Acceptance criteria
- [ ] `npm run build` exits 0; `npx tsc --noEmit` clean; `npm test` still green.
- [ ] Manual-run description: list the exact DOM ids/classes for bubble, replies, hud, notebook so
      a browser tester can find them; include the sequence of engine calls made on a click.
- [ ] Reload mid-scene resumes with the same wallet/day/word states (localStorage key named).
- [ ] Touch: reply buttons and word taps respond to `pointerup`, no 300ms delay, no double-fire
      with click.
- [ ] `content` changes require no code change: scenes are read from JSON only.

## Report format
DONE / ACCEPTANCE (each criterion pass|fail) / VERIFICATION (commands + summarized output) /
FILES TOUCHED (with line ranges) / OPEN QUESTIONS.
Ambiguity or blocker: stop and ask under OPEN QUESTIONS. Never guess a decision that belongs to
the orchestrator.
