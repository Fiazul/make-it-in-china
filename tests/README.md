# Tests
Automated coverage for engine behavior, content contracts, and application smoke checks.

- `audio/manager.test.ts` — manifest variant, word, and stored-sentence resolution.
- `engine/content.test.ts` — content contract coverage.
- `engine/dialogue.test.ts` — dialogue and routing coverage.
- `engine/economy.test.ts` — economy and day-cycle coverage.
- `engine/learner.test.ts` — word-progress coverage.
- `engine/ledger.test.ts` — GDD day-1 and day-5 wallet ledgers on the canonical route.
- `engine/progression.test.ts` — availability, penalty caps, purchases, guided consequences, world tasks, and the gate.
- `engine/playthrough.test.ts` — engine playthrough coverage.
- `engine/review.test.ts` — review regression coverage.
- `engine/save.test.ts` — persistence coverage.
- `engine/slots.test.ts` — slot validation and filling coverage.
- `fixtures/engine.ts` — shared engine test fixtures.
- `fixtures/save-v1.ts` — captured v1 export strings for the save migration.
- `render/buildings.test.ts` — every door keeps a clear 2.4 m walking corridor.
- `render/camera.test.ts` — occlusion pull-in against building hulls, roofs, and default ART framing.
- `render/daylight.test.ts` — ART day-slot palettes, slot separation, and transitions.
- `render/motion.test.ts` — capsule collision, every door sweep, wall blocking, hulls, and district bounds.
- `render/toon.test.ts` — outline hull placement, small-prop and flat-plane skips.
- `ui/preferences.test.ts` — UI preference defaults and persisted-value validation.
- `check-level-strict.test.ts` — complete strict-check fixture plus pass/fail coverage for rules 1–7, 10, 11, and 14.
- `smoke.test.ts` — application smoke coverage.
