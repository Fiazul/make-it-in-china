# C — Engine: dialogue runner, learner model, economy, store, save/load (pure TS + vitest)

## Goal
`src/engine/` contains the game logic with zero DOM/three imports, fully unit-tested: a dialogue
runner that plays a Scene exchange-by-exchange (filling slots from the learner's shaky words),
takes a reply index, reports correctness, routes to `onWrong` consequence scenes and back, and
emits events; a learner model with per-word states unseen→met→shaky→known driven by evidence;
an economy with wallet, day counter, action slots, soft rent pressure; a plain store tying them
together; save/load as versioned JSON string + export/import. `npm test` green.

## Context
- Repo/dir: this directory. Read first: docs/PLAN.md (all), src/content/types.ts (the contract —
  do not change it; if it is insufficient, add fields ONLY in an OPEN QUESTION),
  docs/design-doc.txt lines 235–322 (learning system + economy — the spec you implement),
  content/phase1/scenes.json + world.json (real data; use as test fixtures — if missing, write
  minimal fixtures under tests/fixtures/ that conform to types.ts).
- Scaffold (Vite/vitest/package.json) already exists — another worker made it. UI (src/ui) and
  render (src/render) are other workers' — never import from them; expose everything the UI
  needs through `src/engine/index.ts` as a typed event-emitter + commands API.

## Scope
- In: src/engine/**, tests/engine/**, tests/fixtures/**.
- Out: package.json (no new deps — hand-roll the store and emitter; ~50 lines), src/render,
  src/ui, content/, scripts/. No commits.

## Constraints (from the design doc — hard)
- Wrong reply: never "game over", cost 1–5 yuan or 1 action slot, never more; after 2 misses on
  the same exchange emit `hint` (NPC rephrases: use `line.en` simplified marker — the runner
  just emits the event with attempt count; UI decides display).
- Word evidence: correct reply depending on word → up; wrong reply or pinyin-tap (`tapWord`
  command) → down; decay toward shaky by in-game days since last seen (configurable, default 3 days).
- Slot filling prefers the player's shaky words among the pool values whose `words` are ≥ met;
  falls back to met; never picks words that are unseen unless the scene `introduces` them.
- Scene gating: `availableScenes()` returns scenes whose `requires` are all ≥ met.
- Day: default 4 action slots; job/errand/mentor consume 1; `sleep()` advances day, applies decay,
  charges daily food; weekly rent on day%7==0 — if short, `rentDue` flag + grace days, no debt,
  no negative wallet.
- Save: `{ v: 1, ... }` JSON; `exportString()`/`importString()` base64 of that JSON; a loader
  for unknown `v` throws a typed error. Also an append-only `events` log in the save (design doc
  "Instrumentation", local only) — cap at 2000 entries.
- Deterministic RNG (seedable) for slot choice so tests are stable.
- Keep total under ~600 lines excluding tests. Named exports, no classes required but fine.

## Acceptance criteria
- [ ] `npx tsc --noEmit` clean; `npm test` green with ≥ 25 tests covering: state transitions,
      slot preference for shaky words, onWrong routing + return, 2-miss hint, wallet floor at 0,
      rent grace, day slots exhaustion, save round-trip incl. events cap, availableScenes gating.
- [ ] `grep -rn "from 'three'\|document\.\|window\." src/engine` returns nothing.
- [ ] `src/engine/index.ts` exports: `createGame(content, opts?)` returning
      `{ start(sceneId), reply(i), tapWord(w), sleep(), availableScenes(), state(), on(event, cb),
      exportString(), importString(s) }` — documented in a 20-line README.md in src/engine.
- [ ] A 30-line runnable example in tests/engine/playthrough.test.ts plays scene
      p1_noodle_dishwasher_01 start→end with one wrong reply and asserts wallet/word states.

## Report format
DONE / ACCEPTANCE (each criterion pass|fail) / VERIFICATION (commands + summarized output) /
FILES TOUCHED (with line ranges) / OPEN QUESTIONS.
Ambiguity or blocker: stop and ask under OPEN QUESTIONS. Never guess a decision that belongs to
the orchestrator.
