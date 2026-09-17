# R1 — Review src/engine against briefs/C-engine.md (read-only)

## Goal
An independent review of the engine implementation against the acceptance criteria and
constraints in briefs/C-engine.md and the design-doc rules in docs/design-doc.txt lines 235–322.
You have no shell; the orchestrator has already confirmed `tsc` clean and 85 tests green, so do
NOT spend effort on "did it compile". Spend it on logic and spec conformance.

## Read first
briefs/C-engine.md, docs/PLAN.md "Contract" section, src/engine/*.ts (361 lines total),
tests/engine/*.test.ts, content/phase1/scenes.json (scene 01 only, lines 1–120).

## Check specifically (report each as PASS/FAIL/NOT-CHECKED with file:line)
1. Wrong reply cost is 1–5 yuan OR one action slot, never both, never negative wallet, never
   blocks progress. Retry path returns to the SAME exchange with the SAME slot bindings.
2. Hint emitted on the 2nd and later miss of the same exchange; counter resets on scene change.
3. Word evidence: correct reply → up for words in line+reply+filled slot values; wrong/tapWord →
   down; decay toward shaky by day; `known` cannot be reached in one step from `unseen`.
4. Slot filling prefers shaky words, falls back to met, never unseen unless introduced; deterministic
   under a seed; consequence scenes reuse bindings (rule 6 pre-scan covers reachable branches).
5. availableScenes gating on `requires` ≥ met. Story scenes don't consume action slots; job/errand/
   mentor do; slot exhaustion produces a typed CommandError, not silent failure.
6. Day cycle: food charged, rent day%7==0, grace days with no debt, wallet floor 0.
7. Save: v:1, unknown version → typed error, events cap 2000 keeps NEWEST, round-trip includes RNG.
8. Anything in the tests that asserts the implementation rather than the spec (tautological tests).
9. API ergonomics for a DOM UI: can a UI render the current exchange (filled hanzi/pinyin/en,
   which words are new, reply list) purely from `state()` + events? Name any missing field.

## Report format
FINDINGS ordered by severity (blocker / should-fix / nit), each with file:line and a one-line
fix. Then the numbered checklist verdicts. Then "NOT CHECKED". No code edits — read-only.
