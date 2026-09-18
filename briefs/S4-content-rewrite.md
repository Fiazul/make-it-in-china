# Content rewrite pass — apply the Mandarin quality review

## Goal
Apply every row of the rewrite table, pinyin error list and comprehension-design fix list in `docs/design/review-content-2026-09-18.md` (Opus native-level review of all 25 scenes) to `content/phase1/scenes.json` (and `world.json` pool values if listed). Replacements are to be applied verbatim unless a replacement would break a rule below; then adapt minimally and log it.

## You are the SOLE executor
No spawning/delegation. NO shell. Orchestrator runs `npm run check:content`, `npm run check:content:strict`, `npm test`, then regenerates speech and resumes you with any failures. If a review row is ambiguous, apply your best reading and log it under ADAPTED rather than stopping.

## Rules that must still hold after edits (checker enforces)
- Only the 150 dictionary words (`content/phase1/words.json`) + bonus 碗 in any Chinese string; `words` arrays list tokens in textual order (longest match).
- Each exchange's `introduces` words still appear in that exchange; ≤2 new words per exchange; every `requires` word introduced earlier.
- Every wrong reply keeps `correct:false` and `onWrong`; hints exist wherever a reply can be wrong; reply spoken forms distinct.
- Lines ≤ 14 syllables; the four over-long lines must be shortened: `p1_buy_fruit_01_e2`, `p1_clinic_delivery_03_e4`, `p1_mentor_address_03_e3`, `p1_study_at_home_01_e1`.
- Pinyin with tone marks; apply the sandhi convention the review says the file uses, consistently.
- Keep every `id`, `audio` ID, slot placeholder and pool binding unchanged (audio regenerates by text hash).
- Coverage: every word still in ≥3 curriculum scenes; if a rewrite drops a word's only placement, re-place it in the same scene.

## Acceptance
- All review rows applied or logged as ADAPTED with reason.
- Report: DONE / count of sites changed per scene / ADAPTED list / FILES / OPEN QUESTIONS.
