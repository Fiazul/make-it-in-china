# Ticket 4.3b — Author scenes S07–S12 (content only)

## Goal
Author the Phase-1 curriculum scenes S07, S08, S09, S10, S11, S12 (curriculumIndex 7–12), including the guided consequence S11 reached only from S10 e3 via `guidedConsequence` and returning to S10 e4, and the delivery `taskAfterCorrect` objects on S08 e2 (gate_delivery) and S09 e2 (residential_delivery), in `content/phase1/scenes.json` (and `content/phase1/world.json` slot pools if a scene needs a new pool). Design authority, read in this order: `content/phase1/scene-list.md` (rows S07–S12: ID, NPC, kind, requires, new words per exchange), `docs/design/GDD.md` §5.2 Dialogue and comprehension, §5.3 Content and hidden repetition, §5.6 Consequences, §3 Cast (voices, personalities), §8 First three minutes (S00); `docs/design/TDD.md` §1.1 (new field semantics), §6.1 audio ID naming; `docs/PLAN.md` content contract; `content/README.md`. Study the three existing scenes in `scenes.json` as the style reference.

## You are the SOLE executor
No spawning/delegation. No shell; the orchestrator runs the checker (`npm run check:content` and strict mode) after hand-back and will resume you with the issue list. If blocked or ambiguous, end your turn with the question.

## Content shape (fields are being added to types in a parallel ticket; write them into JSON now)
- Every exchange: `id` (`<sceneId>_e<n>`), `line` {hanzi, pinyin, en, audio, words}, `introduces` (exact list from scene-list.md row), `tests` (word IDs whose meaning the reply tests; may be []), `replies` 2–4, each with `id` (`<exchangeId>_r<k>`), hanzi, pinyin, en, words, `audio` (`<exchangeId>_r<k>`), `correct`; `hint` {hanzi, pinyin, en, audio: `<exchangeId>_h`, words} whenever any reply is wrong, using only words already met, simpler than the line; `onWrong` consequence scene ID for wrong replies (branch cost 1–5, zero for S00 tutorial).
- Every scene: `curriculumIndex` (0–6), `minDay`, `afterScenes`, `allowedSlots`, `repeatable` (true only S01–S03, S05), per TDD §1.1 defaults paragraph ("Default allowedSlots is explicit ...").
- Line audio ID = exchange ID (`p1_arrival_00_e1`); slot-variable lines keep the base ID (variants generated later).
- Slot placeholders `{name}` as in S01; pools in world.json.

## Hard rules (the checker enforces; author to them)
- Only the 150 words in `content/phase1/words.json` plus bonus 碗 appear in any Chinese text (lines, replies, hints, branches, pool values). Longest-match segmentation; `words` arrays must list the tokens in textual order.
- ≤2 genuinely new words per exchange counting all replies, hints and branches; every word in `introduces` actually appears in that exchange.
- Every `requires` word appears in an earlier scene's `introduces`.
- Familiarity: ≥80% of tokens in a line are already met before the line, target 90%.
- Pinyin with tone marks only (nǐ hǎo), never numbers. Faceless cast. No loans/interest/gambling/alcohol/romance/supernatural.
- Natural adult register: short spoken Mandarin, no textbook filler. Wrong replies must be plausible, distinct in spoken form from every other reply, and lead to a small visible mix-up (S00 tutorial: gentle repeat, no cost).
- S11 is a `consequence` kind scene with no penalty; S12 (fruit stall) needs a `purchase` object per TDD §1.1 (fruit_portion, optional-entry).
- S04/S06 (mentor, tea house) e4 is a review exchange: no new words, tests 2–3 of the scene's words.

## Scope out
Scenes S00–S06 (already authored: read them as the style reference and do not edit them), S13+, audio files, engine, types, checker, world layout.

## Acceptance
- `scenes.json` parses; 13 scenes with curriculumIndex 0–12 (six new); each has 4–6 exchanges; every rule above holds by your own reading (re-scan every Chinese string against words.json before hand-back).
- Report: DONE / FILES / per-scene table (id, exchanges, new words per exchange, wrong-reply consequence IDs) / any word you could not place / OPEN QUESTIONS.
