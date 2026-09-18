# C2 — Engine fixes from review R1

## Goal
All findings in `.delegates/mic-review-*/last.md` (read the FINDINGS section; ~90 lines) are fixed
or explicitly rejected with a reason, per the orchestrator decisions now in docs/PLAN.md "Engine
decisions". `npm test` green, `npx tsc --noEmit` clean, no DOM/three imports in src/engine.

## Decisions (do not re-open)
- B1: fix both triggers. `sleep()` abandons an active dialogue (emits `sceneEnd` with reward 0 and
  `abandoned: true`); pre-scan checks pool eligibility given current learner state AND cross-scene
  `next` target availability; `availableScenes()` must never list a scene `start()` would reject.
- S1: exclude consequences from `availableScenes()`; update README line 14.
- S2: reply-origin words → `firstSeen` from the reply; `Reply.audio?` is now in the contract
  (src/content/types.ts already updated); audio may be undefined.
- S3: tapWord legal for any word in current exchange line or replies: meet then down.
- S4: one outstanding week at a time, re-armed each rent day, `rentDue` event; update the test.
- S5: settle reward + `sceneEnd` before cross-scene `next`.
- S6, S7: fix tests as the review says (literal expectations; delete dead fixture patch).
- S8: `state()` must not clone the event log; expose `events()` separately.
- S9: add `DialogueFrame.newWords`, include in `exchange` event payload, survive save/import.
  Expose `gloss(word)` → Word | undefined from content.
- Nits: fix any that take <5 lines; list the rest under "REJECTED/DEFERRED".

## Scope
In: src/engine/**, tests/engine/**, tests/fixtures/**, src/engine/README.md (keep ≤ 25 lines).
Out: src/ui, src/render, src/main.ts, content/, package.json. No commits.
Note src/main.ts currently consumes `word` events with reason 'seen' to track new words and calls
`availableScenes()`/`start()`/`tapWord()`; keep those signatures backward compatible.

## Acceptance
- [ ] `npx tsc --noEmit` clean; `npm test` green; count of tests ≥ 95 (new tests for B1 both triggers,
      S1, S2, S3, S4 re-arm, S5, S9 newWords after import, S8 events accessor).
- [ ] `grep -rn "from 'three'\|document\.\|window\." src/engine` empty.
- [ ] Per-finding table: id → fixed / rejected(reason), with file:line.

## Report format
DONE / ACCEPTANCE / VERIFICATION (commands + tails) / FILES TOUCHED / OPEN QUESTIONS. Execute to
completion; no mid-way check-ins.

## Addendum from browser test
- **Distinct fill guard**: after filling an exchange, if any two replies render identical hanzi,
  re-pick slot values (≤ 20 tries with the seeded RNG); if still identical, throw `ContentError`
  naming the exchange. Include in the pre-scan where statically detectable. Test it.
